import { NextRequest } from 'next/server'

/**
 * Proxy arkasındaki gerçek client IP adresini alır
 * Öncelik sırası:
 * 1. X-Forwarded-For (en yaygın)
 * 2. CF-Connecting-IP (Cloudflare)
 * 3. True-Client-IP (Akamai, Cloudflare Enterprise)
 * 4. X-Real-IP (Nginx)
 * 5. request.ip (fallback)
 */
export function getRealIP(request: NextRequest): string {
  // X-Forwarded-For header'ı kontrol et
  // Format: "client, proxy1, proxy2"
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim())
    // İlk IP gerçek client IP'sidir
    return ips[0]
  }
  
  // Cloudflare Connecting IP
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Akamai / Cloudflare Enterprise
  const trueClientIP = request.headers.get('true-client-ip')
  if (trueClientIP) {
    return trueClientIP
  }
  
  // Nginx X-Real-IP
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  // Fallback: direkt bağlantı IP'si
  return request.ip || 'unknown'
}

/**
 * IP adresinin versiyonunu belirler (IPv4 veya IPv6)
 */
export function getIPVersion(ip: string): 'IPv4' | 'IPv6' {
  // IPv6 adresleri ':' karakteri içerir
  return ip.includes(':') ? 'IPv6' : 'IPv4'
}

/**
 * IP adresini validate eder
 */
export function isValidIP(ip: string): boolean {
  if (ip === 'unknown') return false
  
  // IPv4 regex
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.')
    return parts.every(part => {
      const num = parseInt(part, 10)
      return num >= 0 && num <= 255
    })
  }
  
  // IPv6 basit kontrolü (tam regex çok karmaşık)
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/
  return ipv6Regex.test(ip)
}

/**
 * Tüm client bilgilerini toplar
 */
export function getClientInfo(request: NextRequest) {
  const ipAddress = getRealIP(request)
  const ipVersion = getIPVersion(ipAddress)
  const userAgent = request.headers.get('user-agent') || ''
  
  return {
    ipAddress,
    ipVersion,
    userAgent,
    isValidIP: isValidIP(ipAddress)
  }
}
