import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

// Varsayılan Step 1 alanları (tablo boşsa seed için)
const DEFAULT_STEP1_FIELDS = [
  { field_name: 'firstName', field_label: 'Ad', field_type: 'text', step_number: 1, is_visible: 1, is_required: 1, display_order: 1, placeholder: 'Ahmet' },
  { field_name: 'lastName', field_label: 'Soyad', field_type: 'text', step_number: 1, is_visible: 1, is_required: 1, display_order: 2, placeholder: 'Yılmaz' },
  { field_name: 'gender', field_label: 'Cinsiyet', field_type: 'radio', step_number: 1, is_visible: 1, is_required: 0, display_order: 3, placeholder: null },
  { field_name: 'country', field_label: 'Ülke', field_type: 'select', step_number: 1, is_visible: 1, is_required: 0, display_order: 4, placeholder: null },
  { field_name: 'email', field_label: 'E-posta', field_type: 'email', step_number: 1, is_visible: 1, is_required: 1, display_order: 5, placeholder: 'ornek@email.com' },
  { field_name: 'phone', field_label: 'Telefon', field_type: 'phone', step_number: 1, is_visible: 1, is_required: 1, display_order: 6, placeholder: 'Telefon numarası' },
  { field_name: 'address', field_label: 'Adres', field_type: 'text', step_number: 1, is_visible: 1, is_required: 0, display_order: 7, placeholder: 'Örnek Cadde No:123, İstanbul' },
  { field_name: 'company', field_label: 'Şirket/Kurum', field_type: 'text', step_number: 1, is_visible: 1, is_required: 0, display_order: 8, placeholder: 'Örnek Şirket A.Ş.' },
  { field_name: 'department', field_label: 'Departman', field_type: 'text', step_number: 1, is_visible: 1, is_required: 0, display_order: 9, placeholder: 'İnsan Kaynakları' },
  { field_name: 'invoiceType', field_label: 'Fatura Türü', field_type: 'radio', step_number: 1, is_visible: 1, is_required: 1, display_order: 10, placeholder: null },
  { field_name: 'invoiceFullName', field_label: 'Fatura Ad Soyad', field_type: 'text', step_number: 1, is_visible: 1, is_required: 0, display_order: 11, placeholder: 'Ad Soyad' },
  { field_name: 'idNumber', field_label: 'TC Kimlik No', field_type: 'text', step_number: 1, is_visible: 1, is_required: 0, display_order: 12, placeholder: '12345678901' },
  { field_name: 'invoiceAddress', field_label: 'Fatura Adresi', field_type: 'text', step_number: 1, is_visible: 1, is_required: 0, display_order: 13, placeholder: 'Fatura adresi' },
  { field_name: 'invoiceCompanyName', field_label: 'Şirket Adı', field_type: 'text', step_number: 1, is_visible: 1, is_required: 0, display_order: 14, placeholder: 'Şirket Adı' },
  { field_name: 'taxOffice', field_label: 'Vergi Dairesi', field_type: 'text', step_number: 1, is_visible: 1, is_required: 0, display_order: 15, placeholder: 'Kadıköy' },
  { field_name: 'taxNumber', field_label: 'Vergi No', field_type: 'text', step_number: 1, is_visible: 1, is_required: 0, display_order: 16, placeholder: '1234567890' },
]

// Admin endpoint - Tüm ayarları getir (gizli alanlar dahil)
export async function GET() {
  try {
    let [rawFieldRows] = await pool.execute(
      `SELECT * FROM form_field_settings 
       ORDER BY step_number, display_order`
    ) as [any[], any]

    if (!rawFieldRows?.length) {
      try {
        for (const f of DEFAULT_STEP1_FIELDS) {
          await pool.execute(
            `INSERT IGNORE INTO form_field_settings (field_name, field_label, field_type, step_number, is_visible, is_required, display_order, placeholder)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [f.field_name, f.field_label, f.field_type, f.step_number, f.is_visible, f.is_required, f.display_order, f.placeholder ?? null]
          )
        }
        const [rows] = await pool.execute(
          `SELECT * FROM form_field_settings ORDER BY step_number, display_order`
        )
        rawFieldRows = rows as any[]
      } catch (seedErr) {
        console.error('Form field settings seed failed:', seedErr)
      }
    }

    // Mevcut kurulumda "country" alanı yoksa ekle (cinsiyetten sonra, display_order 4)
    const hasCountry = (rawFieldRows || []).some((r: any) => r.field_name === 'country')
    if (!hasCountry) {
      try {
        await pool.execute(
          `INSERT INTO form_field_settings (field_name, field_label, field_type, step_number, is_visible, is_required, display_order, placeholder)
           VALUES ('country', 'Ülke', 'select', 1, 1, 0, 4, NULL)`
        )
        const [rows] = await pool.execute(
          `SELECT * FROM form_field_settings ORDER BY step_number, display_order`
        )
        rawFieldRows = rows as any[]
      } catch (insertErr) {
        console.error('Form field settings country insert failed:', insertErr)
      }
    }

    const fieldRows = (rawFieldRows || []).map((row: any) => ({
      ...row,
      step_number: row.step_number != null ? Number(row.step_number) : 1,
      is_visible: Boolean(row.is_visible),
      is_required: Boolean(row.is_required),
      display_order: row.display_order != null ? Number(row.display_order) : 0
    }))

    // Payment method settings (tablo boşsa varsayılanları ekle)
    let [paymentRows] = await pool.execute(
      `SELECT * FROM payment_method_settings 
       ORDER BY display_order`
    ) as [any[], any]
    if (!paymentRows?.length) {
      try {
        await pool.execute(
          `INSERT IGNORE INTO payment_method_settings (method_name, method_label, is_enabled, display_order, description, icon)
           VALUES (?, ?, 1, 1, ?, ?), (?, ?, 1, 2, ?, ?)`,
          ['online', 'Online Ödeme', 'Kredi kartı ile anında ödeme', '💳', 'bank_transfer', 'Banka Transferi', 'Havale/EFT ile ödeme', '🏦']
        )
        const [rows] = await pool.execute(`SELECT * FROM payment_method_settings ORDER BY display_order`)
        paymentRows = rows as any[]
      } catch (seedErr) {
        console.error('Payment method settings seed failed:', seedErr)
      }
    }
    const paymentMethods = (paymentRows || []).map((row: any) => ({
      ...row,
      is_enabled: Boolean(row.is_enabled),
      display_order: row.display_order != null ? Number(row.display_order) : 0
    }))

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
      paymentMethods: paymentMethods,
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
