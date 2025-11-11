import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

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

    return NextResponse.json({
      success: true,
      fields: fieldRows,
      paymentMethods: paymentRows,
      step2Settings: step2Settings,
      language: language,
      registrationDeadline: registrationDeadline,
      invoiceIndividualNote: invoiceIndividualNote,
      invoiceCorporateNote: invoiceCorporateNote
    })
  } catch (error) {
    console.error('Error fetching form settings:', error)
    return NextResponse.json(
      { error: 'Ayarlar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
