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
      currencyType,
      exchangeRates,
    } = formData

    // Seçilen kayıt türlerini al ve toplam hesapla
    const selectedTypeIds: number[] = []
    if (registrationSelections) {
      Object.values(registrationSelections).forEach((typeIds: any) => {
        selectedTypeIds.push(...typeIds)
      })
    }

    // Kayıt türlerini veritabanından çek (erken kayıt fiyatlarıyla birlikte)
    let registrationTypes: any[] = []
    if (selectedTypeIds.length > 0) {
      const placeholders = selectedTypeIds.map(() => '?').join(',')
      const [rows] = await pool.execute(
        `SELECT id, label, label_en, fee_try, fee_usd, fee_eur, early_bird_fee_try, early_bird_fee_usd, early_bird_fee_eur, vat_rate FROM registration_types WHERE id IN (${placeholders})`,
        selectedTypeIds
      )
      registrationTypes = rows as any[]
    }

    // Erken kayıt bilgisini al
    const [earlyBirdRows] = await pool.execute(
      "SELECT early_bird_deadline, early_bird_enabled FROM form_settings WHERE id = 1"
    )
    const earlyBirdDeadline = (earlyBirdRows as any[])[0]?.early_bird_deadline || null
    const earlyBirdEnabled = (earlyBirdRows as any[])[0]?.early_bird_enabled || false
    const isEarlyBirdActive = earlyBirdEnabled && earlyBirdDeadline && new Date() < new Date(earlyBirdDeadline)

    // Kullanılan döviz ve kur bilgisi
    const selectedCurrency = currencyType || 'TRY'
    const exchangeRateValue = exchangeRates?.[selectedCurrency]
    const currentExchangeRate = exchangeRateValue ? Number(exchangeRateValue) : 1.0
    
    console.log('Exchange rate debug:', {
      selectedCurrency,
      exchangeRateValue,
      currentExchangeRate,
      exchangeRates
    })

    // Toplam ücreti hesapla (KDV dahil) - Döviz fiyatını kur ile çarparak TL'ye çevir
    let totalFee = 0
    const types = registrationTypes
    types.forEach((type: any) => {
      // Erken kayıt fiyatını kontrol et
      let baseFee = 0
      
      if (isEarlyBirdActive) {
        // Erken kayıt aktifse, erken kayıt fiyatını kullan (varsa)
        if (selectedCurrency === 'USD' && type.early_bird_fee_usd != null) {
          baseFee = Number(type.early_bird_fee_usd) * currentExchangeRate
        } else if (selectedCurrency === 'EUR' && type.early_bird_fee_eur != null) {
          baseFee = Number(type.early_bird_fee_eur) * currentExchangeRate
        } else if (selectedCurrency === 'TRY' && type.early_bird_fee_try != null) {
          baseFee = Number(type.early_bird_fee_try)
        }
      }
      
      // Erken kayıt fiyatı yoksa normal fiyatı kullan
      if (baseFee === 0) {
        if (selectedCurrency === 'USD') {
          baseFee = Number(type.fee_usd || 0) * currentExchangeRate
        } else if (selectedCurrency === 'EUR') {
          baseFee = Number(type.fee_eur || 0) * currentExchangeRate
        } else {
          baseFee = Number(type.fee_try || 0)
        }
      }
      
      const vatRate = Number(type.vat_rate || 0.20)
      totalFee += baseFee + (baseFee * vatRate)
    })

    const fee = totalFee
    const currencyCode = 'TRY' // Artık her zaman TRY olarak kaydedilecek
    const feeInCurrency = totalFee
    const exchangeRate = 1.0 // TRY olarak kaydedildiği için kur 1.0

    // Generate unique reference number
    const referenceNumber = generateReferenceNumber()

    // Online ödeme seçildiyse 3D Secure ödeme başlat
    let paymentResult: { success: boolean; errorCode: string | null; errorMessage: string | null; htmlContent?: string; orderId?: string } = { 
      success: true, 
      errorCode: null, 
      errorMessage: null 
    }
    
    if (payment.paymentMethod === 'online' && payment.cardNumber) {
      try {
        // Ödeme başlatma isteği
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`
        
        const paymentInitResponse = await fetch(`${baseUrl}/api/payment/initiate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: fee,
            currency: 'TRY',
            cardNumber: payment.cardNumber.replace(/\s/g, ''),
            cardExpiry: payment.cardExpiry.replace('/', ''),
            cardCvv: payment.cardCvv,
            cardHolderName: payment.cardHolderName,
            formSubmissionId: null // Henüz registration oluşturulmadı
          })
        })

        const paymentData = await paymentInitResponse.json()

        if (!paymentData.success) {
          // Ödeme başlatılamadı
          return NextResponse.json(
            { 
              success: false, 
              message: 'Ödeme başlatılamadı', 
              paymentResult: {
                success: false,
                errorCode: 'INIT_ERROR',
                errorMessage: paymentData.error || 'Ödeme sistemi ile bağlantı kurulamadı'
              }
            },
            { status: 400 }
          )
        }

        // 3D Secure HTML içeriğini döndür
        paymentResult = {
          success: true,
          errorCode: null,
          errorMessage: null,
          htmlContent: paymentData.htmlContent,
          orderId: paymentData.orderId
        }

      } catch (paymentError: any) {
        console.error('Payment initiation error:', paymentError)
        return NextResponse.json(
          { 
            success: false, 
            message: 'Ödeme başlatılamadı', 
            paymentResult: {
              success: false,
              errorCode: 'SYSTEM_ERROR',
              errorMessage: 'Ödeme sistemi geçici olarak kullanılamıyor'
            }
          },
          { status: 500 }
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
            // Erken kayıt fiyatını kontrol et
            let typeFee = 0
            
            if (isEarlyBirdActive) {
              // Erken kayıt aktifse, erken kayıt fiyatını kullan (varsa)
              if (selectedCurrency === 'USD' && type.early_bird_fee_usd != null) {
                typeFee = Number(type.early_bird_fee_usd) * currentExchangeRate
              } else if (selectedCurrency === 'EUR' && type.early_bird_fee_eur != null) {
                typeFee = Number(type.early_bird_fee_eur) * currentExchangeRate
              } else if (selectedCurrency === 'TRY' && type.early_bird_fee_try != null) {
                typeFee = Number(type.early_bird_fee_try)
              }
            }
            
            // Erken kayıt fiyatı yoksa normal fiyatı kullan
            if (typeFee === 0) {
              if (selectedCurrency === 'USD') {
                typeFee = Number(type.fee_usd || 0) * currentExchangeRate
              } else if (selectedCurrency === 'EUR') {
                typeFee = Number(type.fee_eur || 0) * currentExchangeRate
              } else {
                typeFee = Number(type.fee_try || 0)
              }
            }
            
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
                  'TRY', // Artık her zaman TRY olarak kaydedilecek
                  typeFee,
                  1.0, // TRY olarak kaydedildiği için kur 1.0
                  vatRate, 
                  vat, 
                  totalWithVat,
                  paymentStatus, // Ana kaydın payment_status'u ile aynı
                  isEarlyBirdActive ? 1 : 0, // Erken kayıt aktifse 1, değilse 0
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
    console.error('Error details:', error instanceof Error ? error.message : error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { success: false, message: 'Kayıt sırasında hata oluştu', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

