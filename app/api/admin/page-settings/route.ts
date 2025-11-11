import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

// GET - Sayfa ayarlarını getir
export async function GET() {
  try {
    const [rows] = await pool.execute(
      'SELECT setting_key, setting_value FROM page_settings'
    )
    
    // Ayarları obje formatına çevir
    const settings: Record<string, string> = {}
    ;(rows as any[]).forEach((row) => {
      settings[row.setting_key] = row.setting_value
    })
    
    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Page settings fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Sayfa ayarları alınamadı' },
      { status: 500 }
    )
  }
}

// PUT - Sayfa ayarlarını güncelle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings } = body
    
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Geçersiz ayar verisi' },
        { status: 400 }
      )
    }
    
    // Her ayarı güncelle
    for (const [key, value] of Object.entries(settings)) {
      await pool.execute(
        `INSERT INTO page_settings (setting_key, setting_value) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE 
         setting_value = VALUES(setting_value), 
         updated_at = CURRENT_TIMESTAMP`,
        [key, value]
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Sayfa ayarları güncellendi'
    })
  } catch (error: any) {
    console.error('Page settings update error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Sayfa ayarları güncellenemedi',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}