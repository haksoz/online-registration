# Design Document - Registration Logs System

## Overview

Bu sistem, kayıt formunu dolduran kullanıcıların detaylı log bilgilerini toplar ve saklar. Proxy arkasında çalışacak şekilde tasarlanmıştır ve GDPR uyumludur.

## Architecture

### System Architecture
```
User Browser → Proxy/Load Balancer → Next.js API → MySQL Database
                ↓ Headers
            X-Forwarded-For
            X-Real-IP
            User-Agent
            Referer
```

### Data Flow
1. **Form Submit**: User → API (headers ile birlikte)
2. **IP Detection**: API → Extract real IP from proxy headers
3. **User Agent Parse**: API → Parse browser/OS info
4. **Log Creation**: API → Insert into registration_logs table
5. **Admin View**: Admin Panel → Display formatted logs

## Database Schema

### Table: registration_logs

```sql
CREATE TABLE registration_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  registration_id INT NOT NULL,
  
  -- IP ve Lokasyon
  ip_address VARCHAR(45) NOT NULL,
  ip_version ENUM('IPv4', 'IPv6') DEFAULT 'IPv4',
  country_code VARCHAR(2),
  country_name VARCHAR(100),
  city VARCHAR(100),
  
  -- Tarayıcı ve Cihaz Bilgileri
  user_agent TEXT,
  browser_name VARCHAR(50),
  browser_version VARCHAR(20),
  os_name VARCHAR(50),
  os_version VARCHAR(20),
  device_type ENUM('desktop', 'mobile', 'tablet', 'bot') DEFAULT 'desktop',
  device_vendor VARCHAR(50),
  device_model VARCHAR(50),
  
  -- Trafik Kaynağı
  referrer TEXT,
  referrer_domain VARCHAR(255),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  
  -- Form İşlem Bilgileri
  form_started_at TIMESTAMP,
  form_completed_at TIMESTAMP,
  form_duration_seconds INT,
  steps_completed JSON,
  errors_encountered JSON,
  
  -- Teknik Bilgiler
  screen_resolution VARCHAR(20),
  language VARCHAR(10),
  timezone VARCHAR(50),
  
  -- Güvenlik
  is_proxy BOOLEAN DEFAULT FALSE,
  is_vpn BOOLEAN DEFAULT FALSE,
  is_tor BOOLEAN DEFAULT FALSE,
  risk_score TINYINT DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  INDEX idx_registration_id (registration_id),
  INDEX idx_ip_address (ip_address),
  INDEX idx_created_at (created_at)
);
```

## API Implementation

### Helper Function: Get Real IP Address

```typescript
// lib/getClientInfo.ts
import { NextRequest } from 'next/server'

export function getRealIP(request: NextRequest): string {
  // Proxy header'larını kontrol et (öncelik sırasına göre)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
  const trueClientIP = request.headers.get('true-client-ip') // Akamai
  
  // X-Forwarded-For birden fazla IP içerebilir (client, proxy1, proxy2)
  // İlk IP gerçek client IP'sidir
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim())
    return ips[0]
  }
  
  // Diğer header'ları kontrol et
  if (cfConnectingIP) return cfConnectingIP
  if (trueClientIP) return trueClientIP
  if (realIP) return realIP
  
  // Fallback: direkt bağlantı IP'si
  return request.ip || 'unknown'
}

export function getIPVersion(ip: string): 'IPv4' | 'IPv6' {
  return ip.includes(':') ? 'IPv6' : 'IPv4'
}
```

### Helper Function: Parse User Agent

```typescript
// lib/parseUserAgent.ts
import { UAParser } from 'ua-parser-js'

export interface ParsedUserAgent {
  browserName: string
  browserVersion: string
  osName: string
  osVersion: string
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'bot'
  deviceVendor: string
  deviceModel: string
}

export function parseUserAgent(userAgent: string): ParsedUserAgent {
  const parser = new UAParser(userAgent)
  const result = parser.getResult()
  
  return {
    browserName: result.browser.name || 'Unknown',
    browserVersion: result.browser.version || '',
    osName: result.os.name || 'Unknown',
    osVersion: result.os.version || '',
    deviceType: getDeviceType(result),
    deviceVendor: result.device.vendor || '',
    deviceModel: result.device.model || ''
  }
}

function getDeviceType(result: any): 'desktop' | 'mobile' | 'tablet' | 'bot' {
  if (result.device.type === 'mobile') return 'mobile'
  if (result.device.type === 'tablet') return 'tablet'
  if (result.cpu.architecture === undefined && result.device.vendor === undefined) {
    return 'bot'
  }
  return 'desktop'
}
```

### Helper Function: Extract Referrer Info

```typescript
// lib/parseReferrer.ts
export interface ReferrerInfo {
  referrer: string
  referrerDomain: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
}

export function parseReferrer(request: NextRequest): ReferrerInfo {
  const referer = request.headers.get('referer') || request.headers.get('referrer')
  const url = new URL(request.url)
  
  let referrerDomain = null
  if (referer) {
    try {
      const refUrl = new URL(referer)
      referrerDomain = refUrl.hostname
    } catch (e) {
      // Invalid URL
    }
  }
  
  return {
    referrer: referer || 'direct',
    referrerDomain,
    utmSource: url.searchParams.get('utm_source'),
    utmMedium: url.searchParams.get('utm_medium'),
    utmCampaign: url.searchParams.get('utm_campaign')
  }
}
```

### API Endpoint: Create Registration Log

```typescript
// app/api/registrations/[id]/log/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getRealIP, getIPVersion } from '@/lib/getClientInfo'
import { parseUserAgent } from '@/lib/parseUserAgent'
import { parseReferrer } from '@/lib/parseReferrer'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const registrationId = parseInt(params.id)
    const body = await request.json()
    
    // IP bilgisini al
    const ipAddress = getRealIP(request)
    const ipVersion = getIPVersion(ipAddress)
    
    // User Agent parse et
    const userAgent = request.headers.get('user-agent') || ''
    const parsedUA = parseUserAgent(userAgent)
    
    // Referrer bilgisini al
    const referrerInfo = parseReferrer(request)
    
    // Client'tan gelen ek bilgiler
    const {
      screenResolution,
      language,
      timezone,
      formStartedAt,
      formCompletedAt,
      stepsCompleted,
      errorsEncountered
    } = body
    
    // Form süresini hesapla
    let formDuration = null
    if (formStartedAt && formCompletedAt) {
      const start = new Date(formStartedAt).getTime()
      const end = new Date(formCompletedAt).getTime()
      formDuration = Math.round((end - start) / 1000) // saniye
    }
    
    // Log kaydını oluştur
    await pool.execute(
      `INSERT INTO registration_logs (
        registration_id, ip_address, ip_version,
        user_agent, browser_name, browser_version,
        os_name, os_version, device_type, device_vendor, device_model,
        referrer, referrer_domain, utm_source, utm_medium, utm_campaign,
        form_started_at, form_completed_at, form_duration_seconds,
        steps_completed, errors_encountered,
        screen_resolution, language, timezone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        registrationId,
        ipAddress,
        ipVersion,
        userAgent,
        parsedUA.browserName,
        parsedUA.browserVersion,
        parsedUA.osName,
        parsedUA.osVersion,
        parsedUA.deviceType,
        parsedUA.deviceVendor,
        parsedUA.deviceModel,
        referrerInfo.referrer,
        referrerInfo.referrerDomain,
        referrerInfo.utmSource,
        referrerInfo.utmMedium,
        referrerInfo.utmCampaign,
        formStartedAt,
        formCompletedAt,
        formDuration,
        JSON.stringify(stepsCompleted || []),
        JSON.stringify(errorsEncountered || []),
        screenResolution,
        language,
        timezone
      ]
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating registration log:', error)
    return NextResponse.json(
      { error: 'Log oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
```

## Frontend Integration

### Client-Side Data Collection

```typescript
// lib/collectClientInfo.ts
export function collectClientInfo() {
  return {
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}
```

### Form Store Update

```typescript
// store/formStore.ts - Add tracking
export const useFormStore = create<FormState>((set, get) => ({
  // ... existing state
  formStartedAt: null,
  stepsCompleted: [],
  errorsEncountered: [],
  
  startForm: () => {
    set({ formStartedAt: new Date().toISOString() })
  },
  
  trackStepCompletion: (step: number) => {
    const { stepsCompleted } = get()
    set({
      stepsCompleted: [
        ...stepsCompleted,
        { step, completedAt: new Date().toISOString() }
      ]
    })
  },
  
  trackError: (step: number, error: string) => {
    const { errorsEncountered } = get()
    set({
      errorsEncountered: [
        ...errorsEncountered,
        { step, error, occurredAt: new Date().toISOString() }
      ]
    })
  }
}))
```

## Security Considerations

### IP Address Privacy
- IP adreslerini hash'le veya son oktetini maskele (GDPR)
- Retention policy uygula (örn: 90 gün sonra sil)
- Admin erişimini logla

### Proxy Detection
- Bilinen proxy/VPN IP aralıklarını kontrol et
- Tor exit node'larını tespit et
- Risk skoru hesapla

### Rate Limiting
- Aynı IP'den çok fazla kayıt girişimini engelle
- Şüpheli aktiviteleri flagle

## Performance Considerations

### Database Optimization
- IP adresi ve registration_id için index
- Eski logları arşivle veya sil
- Partition by date (aylık)

### Async Logging
- Log kaydını async yap (kullanıcıyı bekleme)
- Queue sistemi kullan (opsiyonel)

## Admin Panel Integration

### Registration Detail Page
- Log timeline göster
- IP geolocation map
- Browser/OS istatistikleri
- Şüpheli aktivite uyarıları

### Reports
- Trafik kaynakları analizi
- Cihaz/tarayıcı dağılımı
- Coğrafi dağılım
- Form tamamlama süreleri
