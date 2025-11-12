import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

// GET - Mail ayarlarını getir
export async function GET() {
  try {
    const [rows] = await pool.execute(
      'SELECT setting_key, setting_value FROM mail_settings'
    )
    
    const settings: Record<string, string> = {}
    ;(rows as any[]).forEach((row) => {
      settings[row.setting_key] = row.setting_value
    })
    
    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error: any) {
    console.error('Mail settings fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Ayarlar yüklenemedi' },
      { status: 500 }
    )
  }
}

// PUT - Mail ayarlarını güncelle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings } = body
    
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veri' },
        { status: 400 }
      )
    }
    
    // Her ayarı güncelle
    for (const [key, value] of Object.entries(settings)) {
      await pool.execute(
        `INSERT INTO mail_settings (setting_key, setting_value) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, value]
      )
    }

    
    return NextResponse.json({
      success: true,
      message: 'Mail ayarları güncellendi'
    })
  } catch (error: any) {
    console.error('Mail settings update error:', error)
    return NextResponse.json(
      { success: false, error: 'Güncelleme başarısız' },
      { status: 500 }
    )
  }
}
