import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { generateRegistrationHTML } from '@/lib/pdfTemplate'
import puppeteer from 'puppeteer'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const registrationId = params.id
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'pdf' // 'pdf' or 'html'

    // Kayıt bilgilerini çek
    const [registrations] = await pool.execute(
      `SELECT * FROM registrations WHERE id = ?`,
      [registrationId]
    )

    if (!Array.isArray(registrations) || registrations.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kayıt bulunamadı' },
        { status: 404 }
      )
    }

    const registration = registrations[0] as any

    // Seçimleri çek
    const [selections] = await pool.execute(
      `SELECT 
        rs.*,
        rc.label_tr as category_name,
        rc.label_en as category_name_en,
        rt.label as type_label,
        rt.label_en as type_label_en
       FROM registration_selections rs
       LEFT JOIN registration_categories rc ON rs.category_id = rc.id
       LEFT JOIN registration_types rt ON rs.registration_type_id = rt.id
       WHERE rs.registration_id = ? AND rs.is_cancelled = FALSE
       ORDER BY rc.display_order, rt.label`,
      [registrationId]
    )

    const language = registration.form_language || 'tr'
    const isEnglish = language === 'en'

    // Banka hesaplarını çek (sadece havale/EFT için)
    let bankAccounts: any[] = []
    if (registration.payment_method === 'bank_transfer') {
      const [accounts] = await pool.execute(
        `SELECT * FROM bank_accounts WHERE currency = 'TRY' AND is_active = TRUE ORDER BY display_order`
      )
      bankAccounts = accounts as any[]
    }

    // Ödeme ayarlarını çek
    const [paymentSettingsRows] = await pool.execute(
      `SELECT setting_key, setting_value FROM form_settings WHERE setting_key = 'dekontEmail'`
    )
    const dekontEmail = (paymentSettingsRows as any[]).find(s => s.setting_key === 'dekontEmail')?.setting_value || ''

    // HTML template için veri hazırla
    const templateData = {
      referenceNumber: registration.reference_number,
      fullName: registration.full_name,
      email: registration.email,
      phone: registration.phone,
      address: registration.address,
      company: registration.company,
      invoiceType: registration.invoice_type,
      invoiceFullName: registration.invoice_full_name,
      idNumber: registration.id_number,
      invoiceAddress: registration.invoice_address,
      invoiceCompanyName: registration.invoice_company_name,
      taxOffice: registration.tax_office,
      taxNumber: registration.tax_number,
      selections: (selections as any[]).map(sel => ({
        categoryName: isEnglish ? (sel.category_name_en || sel.category_name) : sel.category_name,
        typeLabel: isEnglish ? (sel.type_label_en || sel.type_label) : sel.type_label,
        fee: Number(sel.applied_fee_try),
        vatRate: Number(sel.vat_rate),
        vat: Number(sel.vat_amount_try),
        total: Number(sel.total_try)
      })),
      grandTotal: Number(registration.grand_total),
      paymentMethod: registration.payment_method,
      paymentStatus: registration.payment_status,
      createdAt: registration.created_at,
      language,
      bankAccounts,
      dekontEmail
    }

    const html = generateRegistrationHTML(templateData)

    // Eğer HTML formatı isteniyorsa (email için), direkt HTML döndür
    if (format === 'html') {
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      })
    }

    // PDF oluştur
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })
    
    await browser.close()

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="kayit-${registration.reference_number}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { success: false, error: 'PDF oluşturulurken hata oluştu', details: String(error) },
      { status: 500 }
    )
  }
}
