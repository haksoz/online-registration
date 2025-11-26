import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Public endpoint - Form render için
export async function GET() {
  try {
    // Form field settings - TÜM alanları döndür (frontend'de filtreleme yapılacak)
    const [fieldRows] = await pool.execute(
      `SELECT field_name, field_label, field_type, step_number, 
              is_visible, is_required, display_order, placeholder, help_text
       FROM form_field_settings 
       ORDER BY step_number, display_order`
    )

    // Payment method settings - Sadece aktif olanları döndür
    const [paymentRows] = await pool.execute(
      `SELECT method_name, method_label, is_enabled, display_order, description, icon
       FROM payment_method_settings 
       WHERE is_enabled = TRUE
       ORDER BY display_order`
    )

    // Step 2 settings - currency_type from step2_settings
    const [currencyRows] = await pool.execute(
      `SELECT setting_value FROM step2_settings WHERE setting_key = 'currency_type' LIMIT 1`
    )
    
    const step2Settings: Record<string, string> = {
      currency_type: (currencyRows as any[])[0]?.setting_value || 'TRY'
    }

    // Language setting
    const [languageRows] = await pool.execute(
      `SELECT setting_value FROM form_settings WHERE setting_key = 'language'`
    )
    const language = (languageRows as any[])[0]?.setting_value || 'tr'

    // Registration start date
    const [startDateRows] = await pool.execute(
      `SELECT setting_value FROM form_settings WHERE setting_key = 'registration_start_date'`
    )
    const registrationStartDate = (startDateRows as any[])[0]?.setting_value || ''

    // Registration deadline
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

    // Show price with VAT
    const [showPriceWithVatRows] = await pool.execute(
      `SELECT setting_value FROM form_settings WHERE setting_key = 'show_price_with_vat'`
    )
    const showPriceWithVat = (showPriceWithVatRows as any[])[0]?.setting_value !== 'false'

    return NextResponse.json({
      success: true,
      data: [{
        setting_key: 'show_price_with_vat',
        setting_value: showPriceWithVat ? 'true' : 'false'
      }],
      fields: fieldRows,
      paymentMethods: paymentRows,
      step2Settings: step2Settings,
      language: language,
      registrationStartDate: registrationStartDate,
      registrationDeadline: registrationDeadline,
      invoiceIndividualNote: invoiceIndividualNote,
      invoiceCorporateNote: invoiceCorporateNote,
      invoiceIndividualNoteEn: invoiceIndividualNoteEn,
      invoiceCorporateNoteEn: invoiceCorporateNoteEn
    })
  } catch (error) {
    console.error('Error fetching form settings:', error)
    return NextResponse.json(
      { error: 'Ayarlar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
