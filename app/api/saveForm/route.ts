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
      registrationSelections,
      payment,
      formLanguage,
      documentUrls,
    } = formData

    // Seçilen kayıt türlerini al ve toplam hesapla
    const selectedTypeIds: number[] = []
    if (registrationSelections) {
      Object.values(registrationSelections).forEach((typeIds: any) => {
        selectedTypeIds.push(...typeIds)
      })
    }

    // Kayıt türlerini veritabanından çek
    let registrationTypes: any[] = []
    if (selectedTypeIds.length > 0) {
      const placeholders = selectedTypeIds.map(() => '?').join(',')
      const [rows] = await pool.execute(
        `SELECT id, label, label_en, fee_try, vat_rate FROM registration_types WHERE id IN (${placeholders})`,
        selectedTypeIds
      )
      registrationTypes = rows as any[]
    }

    // Toplam ücreti hesapla (KDV dahil)
    let totalFee = 0
    const types = registrationTypes
    types.forEach((type: any) => {
      const fee = Number(type.fee_try || 0)
      const vatRate = Number(type.vat_rate || 0.20)
      totalFee += fee + (fee * vatRate)
    })

    const fee = totalFee
    const currencyCode = 'TRY'
    const feeInCurrency = totalFee
    const exchangeRate = 1.0

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
        const registrationType = types.map((t: any) => formLanguage === 'en' ? (t.label_en || t.label) : t.label).join(', ')
        
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
      types.map((t: any) => t.label).join(', ') || null,
      types.map((t: any) => t.label_en || t.label).join(', ') || null,
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

    // Seçimleri registration_selections tablosuna kaydet
    if (registrationSelections && Object.keys(registrationSelections).length > 0) {
      for (const [categoryId, typeIds] of Object.entries(registrationSelections)) {
        for (const typeId of typeIds as number[]) {
          const type = types.find((t: any) => t.id === typeId)
          if (type) {
            const typeFee = Number(type.fee_try || 0)
            const vatRate = Number(type.vat_rate || 0.20)
            const vat = typeFee * vatRate
            const totalWithVat = typeFee + vat
            
            try {
              // Belge bilgilerini al
              const docInfo = documentUrls?.[typeId]
              
              const [selectionResult] = await pool.execute(
                `INSERT INTO registration_selections (
                  registration_id, category_id, registration_type_id, 
                  applied_fee_try, applied_currency, applied_fee_amount, exchange_rate,
                  vat_rate, vat_amount_try, total_try,
                  payment_status, is_early_bird, is_cancelled,
                  document_filename, document_url, document_uploaded_at,
                  created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                  registrationId, 
                  Number(categoryId), 
                  typeId, 
                  typeFee,
                  'TRY',
                  typeFee,
                  1.0,
                  vatRate, 
                  vat, 
                  totalWithVat,
                  paymentStatus, // Ana kaydın payment_status'u ile aynı
                  0, // is_early_bird
                  0, // is_cancelled
                  docInfo?.filename || null,
                  docInfo?.url || null,
                  docInfo ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null
                ]
              )
            } catch (selectionError) {
              console.error('Error saving registration selection:', selectionError)
            }
          }
        }
      }
    }

    // Log kaydı oluştur
    try {
      const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                       request.headers.get('x-real-ip') || 
                       'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'
      
      await pool.execute(
        `INSERT INTO registration_logs (
          registration_id, ip_address, user_agent, form_completed_at
        ) VALUES (?, ?, ?, NOW())`,
        [registrationId, ipAddress, userAgent]
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

