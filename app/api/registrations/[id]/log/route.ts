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
    
    // Validate registration ID
    if (isNaN(registrationId)) {
      return NextResponse.json(
        { error: 'Geçersiz kayıt ID' },
        { status: 400 }
      )
    }
    
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
    
    // ISO tarihlerini MySQL datetime formatına çevir
    const formatDateForMySQL = (isoDate: string | null) => {
      if (!isoDate) return null
      return new Date(isoDate).toISOString().slice(0, 19).replace('T', ' ')
    }
    
    const formStartedAtMySQL = formatDateForMySQL(formStartedAt)
    const formCompletedAtMySQL = formatDateForMySQL(formCompletedAt)
    
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
        formStartedAtMySQL,
        formCompletedAtMySQL,
        formDuration,
        JSON.stringify(stepsCompleted || []),
        JSON.stringify(errorsEncountered || []),
        screenResolution,
        language,
        timezone
      ]
    )
    
    return NextResponse.json({ 
      success: true,
      message: 'Log kaydı başarıyla oluşturuldu'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating registration log:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Log oluşturulurken hata oluştu' 
      },
      { status: 500 }
    )
  }
}
