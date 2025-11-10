import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

// Kayıt ayarlarını getir
export async function GET() {
  try {
    // Registration deadline
    const [deadlineRows] = await pool.execute(
      `SELECT setting_value FROM form_settings WHERE setting_key = 'registration_deadline'`
    )
    const registrationDeadline = (deadlineRows as any[])[0]?.setting_value || ''

    // Cancellation deadline
    const [cancellationRows] = await pool.execute(
      `SELECT setting_value FROM form_settings WHERE setting_key = 'cancellation_deadline'`
    )
    const cancellationDeadline = (cancellationRows as any[])[0]?.setting_value || ''

    return NextResponse.json({
      success: true,
      registrationDeadline,
      cancellationDeadline
    })
  } catch (error) {
    console.error('Error fetching registration settings:', error)
    return NextResponse.json(
      { error: 'Ayarlar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// Kayıt ayarlarını güncelle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { registrationDeadline, cancellationDeadline } = body

    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()

      // Registration deadline güncelle
      await connection.execute(
        `INSERT INTO form_settings (setting_key, setting_value, description) 
         VALUES ('registration_deadline', ?, 'Kayıt son tarihi (boş ise sınırsız)')
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [registrationDeadline || '']
      )

      // Cancellation deadline güncelle
      await connection.execute(
        `INSERT INTO form_settings (setting_key, setting_value, description) 
         VALUES ('cancellation_deadline', ?, 'Kayıt iptal son tarihi (boş ise sınırsız)')
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [cancellationDeadline || '']
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
