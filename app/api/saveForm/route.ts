import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

function generateReferenceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000); // 4 haneli
  return `REG-${year}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Extract form data
    const {
      personalInfo,
      accommodation,
      payment,
      formLanguage,
    } = formData

    // Get currency info from accommodation data
    const currencyCode = accommodation.selectedCurrency || 'TRY'
    const feeInCurrency = accommodation.feeInCurrency || 0
    const feeInTRY = accommodation.feeInTRY || 0
    const exchangeRate = accommodation.exchangeRate || 1.0

    // Use TRY fee as main fee
    const fee = feeInTRY

    // Generate unique reference number
    const referenceNumber = generateReferenceNumber()

    // Online ödeme seçildiyse önce ödemeyi kontrol et ve POS log tut
    let paymentResult: { success: boolean; errorCode: string | null; errorMessage: string | null } = { 
      success: true, 
      errorCode: null, 
      errorMessage: null 
    }
    
    if (payment.paymentMethod === 'online' && payment.cardNumber) {
      const isTestMode = process.env.PAYMENT_TEST_MODE === 'true'
      
      // Kart numarasından son 4 hane ve BIN al
      const cardNumber = payment.cardNumber.replace(/\s/g, '')
      const cardLast4 = cardNumber.slice(-4)
      const cardBin = cardNumber.slice(0, 6)
      const cvv = payment.cardCvv
      
      if (!isTestMode) {
        // TODO: Production'da gerçek POS entegrasyonu yapılacak
        console.warn('⚠️ PAYMENT_TEST_MODE=false but no real POS integration implemented yet')
      }
      
      // CVV'ye göre ödeme sonucunu belirle (TEST MODE)
      let status = 'success'
      let paymentStatus = 'approved'
      let fraudScore = 10
      
      if (cvv === '120') {
        status = 'failed'
        paymentStatus = 'declined'
        fraudScore = 25
        paymentResult = { success: false, errorCode: '12', errorMessage: 'Geçersiz İşlem' }
      } else if (cvv === '130') {
        status = 'failed'
        paymentStatus = 'declined'
        fraudScore = 20
        paymentResult = { success: false, errorCode: '13', errorMessage: 'Geçersiz Tutar' }
      } else if (cvv === '340') {
        status = 'failed'
        paymentStatus = 'declined'
        fraudScore = 85
        paymentResult = { success: false, errorCode: '34', errorMessage: 'Fraud Şüphesi' }
      } else if (cvv === '370') {
        status = 'failed'
        paymentStatus = 'declined'
        fraudScore = 95
        paymentResult = { success: false, errorCode: '37', errorMessage: 'Çalıntı Kart' }
      } else if (cvv === '510') {
        status = 'failed'
        paymentStatus = 'declined'
        fraudScore = 15
        paymentResult = { success: false, errorCode: '51', errorMessage: 'Limit Yetersiz' }
      }
      
      // POS transaction log - TÜM ödeme denemelerini kaydet
      try {
        const transactionId = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`
        const orderId = `ORD_${referenceNumber}`
        const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                         request.headers.get('x-real-ip') || 
                         'unknown'
        const userAgent = request.headers.get('user-agent') || ''
        
        // Müşteri bilgilerini hazırla
        const customerName = personalInfo.fullName || `${personalInfo.firstName} ${personalInfo.lastName}`.trim()
        const customerEmail = personalInfo.email
        const customerPhone = personalInfo.phone
        const registrationType = accommodation.registrationType
        
        await pool.execute(
          `INSERT INTO online_payment_transactions (
            registration_id, transaction_id, order_id, amount, currency,
            status, payment_status, error_code, error_message,
            gateway_name, card_type, card_last4, card_bin,
            cardholder_name, customer_name, customer_email, customer_phone, registration_type,
            ip_address, fraud_score, user_agent, initiated_at, completed_at, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
          [
            null, // registration_id - henüz oluşturulmadı
            transactionId,
            orderId,
            fee,
            currencyCode,
            status,
            paymentStatus,
            paymentResult.errorCode,
            paymentResult.errorMessage,
            'Test Gateway',
            'VISA',
            cardLast4,
            cardBin,
            payment.cardHolderName,
            customerName,
            customerEmail,
            customerPhone,
            registrationType,
            ipAddress,
            fraudScore,
            userAgent
          ]
        )
      } catch (posError: any) {
        console.error('Error creating POS log:', posError)
      }
      
      // Ödeme başarısız ise kaydı oluşturma
      if (!paymentResult.success) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Ödeme başarısız oldu', 
            paymentResult: paymentResult
          },
          { status: 400 }
        )
      }
    }

    // Determine payment status based on payment method
    const paymentStatus = payment.paymentMethod === 'online' ? 'completed' : 'pending'

    // Prepare values array
    const values = [
      referenceNumber,
      personalInfo.firstName || null,
      personalInfo.lastName || null,
      personalInfo.fullName || `${personalInfo.firstName} ${personalInfo.lastName}`.trim() || null,
      personalInfo.gender || null,
      personalInfo.email || null,
      personalInfo.phone || null,
      personalInfo.address || null,
      personalInfo.company || null,
      personalInfo.department || null,
      personalInfo.invoiceType || null,
      personalInfo.invoiceFullName || null,
      personalInfo.idNumber || null,
      personalInfo.invoiceAddress || null,
      personalInfo.invoiceCompanyName || null,
      personalInfo.taxOffice || null,
      personalInfo.taxNumber || null,
      accommodation.registrationType || null,
      (accommodation as any).registrationTypeLabelEn || null,
      formLanguage || 'tr',
      fee,
      currencyCode,
      feeInCurrency,
      exchangeRate,
      payment.paymentMethod || null,
      paymentStatus,
    ]

    // Insert into database
    const [result] = await pool.execute(
      `INSERT INTO registrations (
        reference_number, first_name, last_name, full_name, gender, email, phone, address, company, department,
        invoice_type, invoice_full_name, id_number, invoice_address,
        invoice_company_name, tax_office, tax_number,
        registration_type, registration_type_label_en, form_language, fee, currency_code, fee_in_currency, exchange_rate, payment_method, payment_status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      values
    )

    const registrationId = (result as any).insertId

    // Log kaydı oluştur
    try {
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'
      
      await pool.execute(
        `INSERT INTO registration_logs (
          registration_id, ip_address, user_agent, action, details
        ) VALUES (?, ?, ?, ?, ?)`,
        [registrationId, ipAddress, userAgent, 'registration_created', 'Kayıt oluşturuldu']
      )
    } catch (logError) {
      console.error('Error creating registration log:', logError)
      // Log hatası kayıt işlemini engellemez
    }

    // Online ödeme seçildiyse başarılı ödeme için registration_id'yi güncelle
    if (payment.paymentMethod === 'online' && payment.cardNumber) {
      try {
        const orderId = `ORD_${referenceNumber}`
        
        // Başarılı ödeme için registration_id'yi güncelle
        await pool.execute(
          `UPDATE online_payment_transactions 
           SET registration_id = ? 
           WHERE order_id = ? AND status = 'success'`,
          [registrationId, orderId]
        )
      } catch (posError: any) {
        console.error('Error updating POS transaction with registration_id:', posError)
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Kayıt başarıyla oluşturuldu', 
        id: registrationId,
        referenceNumber: referenceNumber,
        paymentResult: paymentResult
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error saving form:', error)
    return NextResponse.json(
      { success: false, message: 'Kayıt sırasında hata oluştu', error: String(error) },
      { status: 500 }
    )
  }
}

