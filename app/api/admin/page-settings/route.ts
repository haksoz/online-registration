import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}

// GET - Sayfa ayarlarını getir
export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig)
    
    const [rows] = await connection.execute(
      'SELECT setting_key, setting_value FROM page_settings'
    )
    
    await connection.end()
    
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
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Her ayarı güncelle
    for (const [key, value] of Object.entries(settings)) {
      await connection.execute(
        `INSERT INTO page_settings (setting_key, setting_value) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE 
         setting_value = VALUES(setting_value), 
         updated_at = CURRENT_TIMESTAMP`,
        [key, value]
      )
    }
    
    await connection.end()
    
    return NextResponse.json({
      success: true,
      message: 'Sayfa ayarları güncellendi'
    })
  } catch (error) {
    console.error('Page settings update error:', error)
    return NextResponse.json(
      { success: false, error: 'Sayfa ayarları güncellenemedi' },
      { status: 500 }
    )
  }
}