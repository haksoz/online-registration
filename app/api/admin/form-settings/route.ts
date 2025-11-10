import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

// Admin endpoint - Tüm ayarları getir (gizli alanlar dahil)
export async function GET() {
  try {
    // Form field settings
    const [fieldRows] = await pool.execute(
      `SELECT * FROM form_field_settings 
       ORDER BY step_number, display_order`
    )

    // Payment method settings
    const [paymentRows] = await pool.execute(
      `SELECT * FROM payment_method_settings 
       ORDER BY display_order`
    )

    // Step 2 settings
    const [step2Rows] = await pool.execute(
      `SELECT setting_key, setting_value FROM step2_settings`
    )
    
    const step2Settings: Record<string, string> = {}
    ;(step2Rows as any[]).forEach((row) => {
      step2Settings[row.setting_key] = row.setting_value
    })

    // Language setting
    const [languageRows] = await pool.execute(
      `SELECT setting_value FROM form_settings WHERE setting_key = 'language'`
    )
    const language = (languageRows as any[])[0]?.setting_value || 'tr'

    // Registration deadline setting
    const [deadlineRows] = await pool.execute(
      `SELECT setting_value FROM form_settings WHERE setting_key = 'registration_deadline'`
    )
    const registrationDeadline = (deadlineRows as any[])[0]?.setting_value || ''

    return NextResponse.json({
      success: true,
      fields: fieldRows,
      paymentMethods: paymentRows,
      step2Settings: step2Settings,
      language: language,
      registrationDeadline: registrationDeadline
    })
  } catch (error) {
    console.error('Error fetching admin form settings:', error)
    return NextResponse.json(
      { error: 'Ayarlar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// Toplu güncelleme
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { fields, paymentMethods, step2Settings, language, registrationDeadline } = body

    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()

      // Form field settings güncelle
      if (fields && Array.isArray(fields)) {
        for (const field of fields) {
          await connection.execute(
            `UPDATE form_field_settings 
             SET is_visible = ?, is_required = ?, display_order = ?
             WHERE field_name = ?`,
            [field.is_visible, field.is_required, field.display_order, field.field_name]
          )
        }
      }

      // Payment method settings güncelle
      if (paymentMethods && Array.isArray(paymentMethods)) {
        for (const method of paymentMethods) {
          await connection.execute(
            `UPDATE payment_method_settings 
             SET is_enabled = ?, display_order = ?
             WHERE method_name = ?`,
            [method.is_enabled, method.display_order, method.method_name]
          )
        }
      }

      // Step 2 settings güncelle
      if (step2Settings && step2Settings.currency_type) {
        await connection.execute(
          `INSERT INTO step2_settings (setting_key, setting_value) 
           VALUES ('currency_type', ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [step2Settings.currency_type]
        )
      }

      // Language setting güncelle
      if (language) {
        await connection.execute(
          `INSERT INTO form_settings (setting_key, setting_value, description) 
           VALUES ('language', ?, 'Form dili (tr: Türkçe, en: English)')
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [language]
        )
      }

      // Registration deadline güncelle (geriye dönük uyumluluk için)
      // Artık /api/admin/registration-settings endpoint'i kullanılıyor
      if (registrationDeadline !== undefined) {
        await connection.execute(
          `INSERT INTO form_settings (setting_key, setting_value, description) 
           VALUES ('registration_deadline', ?, 'Kayıt son tarihi (boş ise sınırsız)')
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [registrationDeadline || '']
        )
      }

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
    console.error('Error updating form settings:', error)
    return NextResponse.json(
      { error: 'Ayarlar güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}
