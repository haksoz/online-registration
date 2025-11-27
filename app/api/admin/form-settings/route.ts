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

    // Invoice notes
    const [individualNoteRows] = await pool.execute(
      `SELECT setting_value FROM form_settings WHERE setting_key = 'invoice_individual_note'`
    )
    const invoiceIndividualNote = (individualNoteRows as any[])[0]?.setting_value || ''

    const [corporateNoteRows] = await pool.execute(
      `SELECT setting_value FROM form_settings WHERE setting_key = 'invoice_corporate_note'`
    )
    const invoiceCorporateNote = (corporateNoteRows as any[])[0]?.setting_value || ''

    const [individualNoteEnRows] = await pool.execute(
      `SELECT setting_value FROM form_settings WHERE setting_key = 'invoice_individual_note_en'`
    )
    const invoiceIndividualNoteEn = (individualNoteEnRows as any[])[0]?.setting_value || ''

    const [corporateNoteEnRows] = await pool.execute(
      `SELECT setting_value FROM form_settings WHERE setting_key = 'invoice_corporate_note_en'`
    )
    const invoiceCorporateNoteEn = (corporateNoteEnRows as any[])[0]?.setting_value || ''

    // Homepage URL
    const [homepageRows] = await pool.execute(
      `SELECT setting_value FROM page_settings WHERE setting_key = 'homepage_url'`
    )
    const homepageUrl = (homepageRows as any[])[0]?.setting_value || ''

    // Show price with VAT
    const [showPriceWithVatRows] = await pool.execute(
      `SELECT setting_value FROM form_settings WHERE setting_key = 'show_price_with_vat'`
    )
    const showPriceWithVat = (showPriceWithVatRows as any[])[0]?.setting_value !== 'false'

    // Show early bird notice
    const [showEarlyBirdNoticeRows] = await pool.execute(
      `SELECT setting_value FROM form_settings WHERE setting_key = 'show_early_bird_notice'`
    )
    const showEarlyBirdNotice = (showEarlyBirdNoticeRows as any[])[0]?.setting_value !== 'false'

    return NextResponse.json({
      success: true,
      fields: fieldRows,
      paymentMethods: paymentRows,
      step2Settings: step2Settings,
      language: language,
      registrationDeadline: registrationDeadline,
      invoiceIndividualNote: invoiceIndividualNote,
      invoiceCorporateNote: invoiceCorporateNote,
      invoiceIndividualNoteEn: invoiceIndividualNoteEn,
      invoiceCorporateNoteEn: invoiceCorporateNoteEn,
      homepageUrl: homepageUrl,
      showPriceWithVat: showPriceWithVat,
      showEarlyBirdNotice: showEarlyBirdNotice
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
    const { fields, paymentMethods, step2Settings, showPriceWithVat, showEarlyBirdNotice, homepageUrl, language, registrationDeadline, invoiceIndividualNote, invoiceCorporateNote, invoiceIndividualNoteEn, invoiceCorporateNoteEn } = body

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

      // Invoice notes güncelle
      if (invoiceIndividualNote !== undefined) {
        await connection.execute(
          `INSERT INTO form_settings (setting_key, setting_value, description) 
           VALUES ('invoice_individual_note', ?, 'Bireysel fatura seçimi için uyarı notu')
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [invoiceIndividualNote]
        )
      }

      if (invoiceCorporateNote !== undefined) {
        await connection.execute(
          `INSERT INTO form_settings (setting_key, setting_value, description) 
           VALUES ('invoice_corporate_note', ?, 'Kurumsal fatura seçimi için uyarı notu')
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [invoiceCorporateNote]
        )
      }

      if (invoiceIndividualNoteEn !== undefined) {
        await connection.execute(
          `INSERT INTO form_settings (setting_key, setting_value, description) 
           VALUES ('invoice_individual_note_en', ?, 'Bireysel fatura seçimi için uyarı notu (İngilizce)')
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [invoiceIndividualNoteEn]
        )
      }

      if (invoiceCorporateNoteEn !== undefined) {
        await connection.execute(
          `INSERT INTO form_settings (setting_key, setting_value, description) 
           VALUES ('invoice_corporate_note_en', ?, 'Kurumsal fatura seçimi için uyarı notu (İngilizce)')
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [invoiceCorporateNoteEn]
        )
      }

      // Show price with VAT güncelle
      if (showPriceWithVat !== undefined) {
        await connection.execute(
          `INSERT INTO form_settings (setting_key, setting_value, description) 
           VALUES ('show_price_with_vat', ?, 'Kayıt türlerinde fiyatları KDV dahil göster')
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [showPriceWithVat ? 'true' : 'false']
        )
      }

      // Show early bird notice güncelle
      if (showEarlyBirdNotice !== undefined) {
        await connection.execute(
          `INSERT INTO form_settings (setting_key, setting_value, description) 
           VALUES ('show_early_bird_notice', ?, 'Erken kayıt uyarısını göster')
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [showEarlyBirdNotice ? 'true' : 'false']
        )
      }

      // Homepage URL güncelle
      if (homepageUrl !== undefined) {
        await connection.execute(
          `INSERT INTO page_settings (setting_key, setting_value, description) 
           VALUES ('homepage_url', ?, 'Anasayfa URL adresi')
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [homepageUrl]
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
