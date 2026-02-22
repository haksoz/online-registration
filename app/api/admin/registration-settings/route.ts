import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

// Kayıt ayarlarını getir (sadece bildirim e-postaları; tarihler kategori bazlı yönetiliyor)
export async function GET() {
  try {
    const [notificationRows] = await pool.execute(
      `SELECT setting_value FROM form_settings WHERE setting_key = 'notification_email'`
    )
    const notificationEmail = (notificationRows as any[])[0]?.setting_value || ''

    const [bccRows] = await pool.execute(
      `SELECT setting_value FROM form_settings WHERE setting_key = 'bcc_email'`
    )
    const bccEmail = (bccRows as any[])[0]?.setting_value || ''

    return NextResponse.json({
      success: true,
      notificationEmail,
      bccEmail
    })
  } catch (error) {
    console.error('Error fetching registration settings:', error)
    return NextResponse.json(
      { error: 'Ayarlar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// Kayıt ayarlarını güncelle (sadece bildirim e-postaları; tarihler kategori bazlı)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationEmail, bccEmail } = body

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      await connection.execute(
        `INSERT INTO form_settings (setting_key, setting_value, description) 
         VALUES ('notification_email', ?, 'Kayıt bildirim mail adresi')
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [notificationEmail ?? '']
      )
      await connection.execute(
        `INSERT INTO form_settings (setting_key, setting_value, description) 
         VALUES ('bcc_email', ?, 'Kayıt bildirim BCC mail adresi')
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [bccEmail ?? '']
      )

      await connection.commit()

      return NextResponse.json({
        success: true,
        message: 'Ayarlar başarıyla güncellendi'
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error updating registration settings:', error)
    return NextResponse.json(
      { error: 'Ayarlar güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}
