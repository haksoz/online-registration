'use client'

import { useFormStore } from '@/store/formStore'
import { useDataStore } from '@/store/dataStore'
import { useEffect, useState, useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

import { RegistrationType } from '@/types/registration'
import { formatTurkishCurrency } from '@/lib/currencyUtils'
import { getFormattedBankAccounts, getPaymentSettings } from '@/constants/bankInfo'
import { fetchPageSettings, type PageSettings } from '@/constants/pageSettings'
import { useTranslation } from '@/hooks/useTranslation'

interface Step4ConfirmationProps {}



export default function Step4Confirmation({}: Step4ConfirmationProps) {
  const formStore = useFormStore()
  const { formData } = formStore
  const { t, language } = useTranslation()
  const paymentMethod = formData.payment.paymentMethod
  const { 
    registrationTypes, 
    bankAccounts: storeBankAccounts, 
    paymentSettings: storePaymentSettings 
  } = useDataStore()
  
  // Ensure arrays
  const bankAccounts = Array.isArray(storeBankAccounts) ? storeBankAccounts : []
  const [paymentSettings, setPaymentSettings] = useState<any>(storePaymentSettings || {})
  
  // Debug log
  console.log('📄 Step4 - Bank Accounts:', bankAccounts)
  console.log('📄 Step4 - Payment Settings:', paymentSettings)
  
  const [pageSettings, setPageSettings] = useState<PageSettings | null>(null)
  const [homepageUrl, setHomepageUrl] = useState<string>('https://example.com')
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)
  const [refNumberCopied, setRefNumberCopied] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Sayfa ayarlarını getir
        const pageSettings = await fetchPageSettings()
        setPageSettings(pageSettings)

        // Homepage URL'i getir
        const formSettingsResponse = await fetch('/api/admin/form-settings')
        const formSettingsData = await formSettingsResponse.json()
        if (formSettingsData.success && formSettingsData.homepageUrl) {
          setHomepageUrl(formSettingsData.homepageUrl)
        }
        
        // Payment settings boşsa yeniden yükle
        if (!storePaymentSettings || Object.keys(storePaymentSettings).length === 0) {
          console.log('📄 Step4 - Payment settings boş, yeniden yükleniyor...')
          const bankResponse = await fetch('/api/bank-accounts/active')
          const bankData = await bankResponse.json()
          if (bankData.success && bankData.data?.settings) {
            const settings = bankData.data.settings
            const camelCaseSettings = {
              dekontEmail: settings.dekont_email || settings.dekontEmail,
              dekontMessage: settings.dekont_message || settings.dekontMessage,
              dekontMessageEn: settings.dekont_message_en || settings.dekontMessageEn,
            }
            console.log('📄 Step4 - Payment settings yüklendi:', camelCaseSettings)
            setPaymentSettings(camelCaseSettings)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  // Kayıt tamamlandığında mail gönder (sadece 1 kere)
  const mailSentRef = useRef(false)
  
  useEffect(() => {
    const sendRegistrationMail = async () => {
      // Eğer mail zaten gönderildiyse, tekrar gönderme
      if (mailSentRef.current) {
        return
      }
      
      if (!formData.referenceNumber || !formData.personalInfo.email) {
        return
      }

      // Mail gönderildiğini işaretle
      mailSentRef.current = true

      // Sayfanın tam render edilmesini ve dil değişiminin tamamlanmasını bekle
      await new Promise(resolve => setTimeout(resolve, 2000))

      // PDF içeriğini al (pdf-full-content div'i)
      const pdfContentElement = document.getElementById('pdf-full-content')
      let registrationInfoHtml = ''
      
      if (pdfContentElement) {
        // İçeriği klonla ve ikonları temizle
        const clonedContent = pdfContentElement.cloneNode(true) as HTMLElement
        
        // SVG ikonları kaldır
        const svgs = clonedContent.querySelectorAll('svg')
        svgs.forEach(svg => svg.remove())
        
        // İkon içeren span'leri kaldır (genelde text-2xl veya text-xl class'ı ile işaretlenmiş)
        const iconElements = clonedContent.querySelectorAll('.text-2xl, .text-xl, .w-5, .h-5, .w-6, .h-6')
        iconElements.forEach(element => {
          // Eğer içinde sadece emoji/ikon varsa kaldır
          const text = element.textContent?.trim() || ''
          if (text.length <= 2) { // Emoji genelde 1-2 karakter
            element.remove()
          }
        })
        
        // Gizli elementleri kaldır (hidden, display:none vb.)
        const hiddenElements = clonedContent.querySelectorAll('[style*="display: none"], [style*="display:none"], .hidden')
        hiddenElements.forEach(element => element.remove())
        
        registrationInfoHtml = clonedContent.innerHTML
        
        console.log('📧 Mail HTML length:', registrationInfoHtml.length)
      }

      try {
        // Form store'daki dil bilgisini kullan (daha güvenilir)
        const mailLanguage = formData.formLanguage || language
        
        console.log('📧 Sending mail with language:', mailLanguage, 'formData.formLanguage:', formData.formLanguage, 'hook language:', language)
        
        await fetch('/api/send-registration-mail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.personalInfo.email,
            name: formData.personalInfo.fullName || `${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`.trim(),
            referenceNumber: formData.referenceNumber,
            registrationInfo: registrationInfoHtml,
            registrationId: null,
            language: mailLanguage // Form store'daki dil bilgisini kullan
          })
        })
      } catch (error) {
        console.error('Mail send error:', error)
        // Hata olsa bile kullanıcıya gösterme, sessizce logla
        // Hata durumunda flag'i sıfırla ki tekrar deneyebilsin
        mailSentRef.current = false
      }
    }

    sendRegistrationMail()
  }, [formData.referenceNumber, formData.personalInfo.email, language])

  const selectedRegistrationType = registrationTypes.find(
    type => type.value === formData.accommodation.registrationType
  )
  
  const accommodationData = formData.accommodation as any
  const selectedCurrency = accommodationData.selectedCurrency || 'TRY'
  const feeInCurrency = accommodationData.feeInCurrency
  const feeInTRY = accommodationData.feeInTRY
  
  const getCurrencySymbol = (currency: string): string => {
    if (currency === 'USD') return '$'
    if (currency === 'EUR') return '€'
    return '₺'
  }
  
  const registrationInfo = selectedRegistrationType
    ? {
        label: language === 'en' ? selectedRegistrationType.label_en || selectedRegistrationType.label : selectedRegistrationType.label,
        fee: formatTurkishCurrency(Number(feeInTRY || selectedRegistrationType.fee_try)),
        feeInCurrency: feeInCurrency,
        feeInTRY: feeInTRY,
        currency: selectedCurrency
      }
    : {
        label: formData.accommodation.registrationType || '-',
        fee: '',
        feeInCurrency: 0,
        feeInTRY: 0,
        currency: 'TRY'
      }

  const handleNewRegistration = () => {
    formStore.resetForm() // Form store'u temizle
    formStore.setCurrentStep(1) // Step1'e dön
  }

  const handleGoToHomepage = () => {
    window.open(homepageUrl, '_blank')
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    
    try {
      // html2canvas mevcut mu kontrol et
      if (typeof html2canvas === 'undefined') {
        handlePrintPDF()
        return
      }

      // Başlık, referans ve özet dahil tüm içeriği kullan
      const fullContentElement = document.getElementById('pdf-full-content')
      if (!fullContentElement) {
        throw new Error('PDF içeriği bulunamadı')
      }

      // Kopyala butonlarını geçici olarak gizle
      const noPdfElements = fullContentElement.querySelectorAll('.no-pdf')
      noPdfElements.forEach((el) => {
        (el as HTMLElement).style.display = 'none'
      })

      // Canvas'a çevir
      const canvas = await html2canvas(fullContentElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false
      })

      // Kopyala butonlarını tekrar göster
      noPdfElements.forEach((el) => {
        (el as HTMLElement).style.display = ''
      })

      // PDF oluştur
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Sayfa boyutları
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // Canvas boyutlarını PDF'e uyarla
      const canvasAspectRatio = canvas.height / canvas.width
      const imgWidth = pdfWidth - 20 // 10mm sol ve sağ margin
      const imgHeight = imgWidth * canvasAspectRatio
      
      // Eğer içerik sayfaya sığmıyorsa ölçekle
      let finalWidth = imgWidth
      let finalHeight = imgHeight
      let x = 10
      let y = 10
      
      if (imgHeight > pdfHeight - 20) {
        finalHeight = pdfHeight - 20
        finalWidth = finalHeight / canvasAspectRatio
        x = (pdfWidth - finalWidth) / 2
      }

      // Resmi PDF'e ekle
      pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight)
      
      // PDF'i indir
      const fileName = `Kayit_Ozeti_${formData.referenceNumber || new Date().getTime()}_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
    } catch (error) {
      console.error('PDF oluşturma hatası:', error)
      
      // Kopyala butonlarını tekrar göster (hata durumunda)
      const fullContentElement = document.getElementById('pdf-full-content')
      if (fullContentElement) {
        const noPdfElements = fullContentElement.querySelectorAll('.no-pdf')
        noPdfElements.forEach((el) => {
          (el as HTMLElement).style.display = ''
        })
      }
      
      // Fallback olarak print dialog'u aç
      handlePrintPDF()
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handlePrintPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>Kayıt Özeti - ${formData.referenceNumber}</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .section { 
              margin-bottom: 25px; 
              padding: 15px; 
              border: 1px solid #ddd; 
              border-radius: 8px;
            }
            .section h3 { 
              margin-top: 0; 
              color: #333; 
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 15px; 
              margin-top: 15px;
            }
            .info-item { 
              margin-bottom: 10px; 
            }
            .label { 
              font-weight: bold; 
              color: #666; 
              font-size: 14px;
            }
            .value { 
              color: #333; 
              margin-top: 5px;
              font-size: 16px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #333;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .section { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${pageSettings?.form_title || 'Online Kayıt Sistemi'}</h1>
            <h2>Kayıt Özeti</h2>
            <p><strong>Referans No:</strong> ${formData.referenceNumber}</p>
            <p><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>

          <div class="section">
            <h3>1. Kayıt Türü</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="label">Seçilen Tür</div>
                <div class="value">${registrationInfo.label}</div>
              </div>
              ${registrationInfo.currency !== 'TRY' && registrationInfo.feeInCurrency > 0 ? `
                <div class="info-item">
                  <div class="label">Seçilen Döviz Ücreti</div>
                  <div class="value">${getCurrencySymbol(registrationInfo.currency)}${Number(registrationInfo.feeInCurrency).toFixed(2)}</div>
                </div>
                <div class="info-item">
                  <div class="label">TL Karşılığı</div>
                  <div class="value">${registrationInfo.fee}</div>
                </div>
              ` : registrationInfo.fee ? `
                <div class="info-item">
                  <div class="label">Ücret</div>
                  <div class="value">${registrationInfo.fee}</div>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="section">
            <h3>2. Kişisel Bilgiler</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="label">Ad Soyad</div>
                <div class="value">${formData.personalInfo.fullName || `${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`.trim() || '-'}</div>
              </div>
              <div class="info-item">
                <div class="label">E-posta</div>
                <div class="value">${formData.personalInfo.email || '-'}</div>
              </div>
              <div class="info-item">
                <div class="label">Telefon</div>
                <div class="value">${formData.personalInfo.phone || '-'}</div>
              </div>
              <div class="info-item">
                <div class="label">Adres</div>
                <div class="value">${formData.personalInfo.address || '-'}</div>
              </div>
              ${/* Şirket bilgisi geçici olarak gizlendi */ ''}
            </div>
          </div>

          <div class="section">
            <h3>3. Fatura Bilgileri</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="label">Fatura Türü</div>
                <div class="value">${formData.personalInfo.invoiceType === 'bireysel' ? 'Bireysel' : formData.personalInfo.invoiceType === 'kurumsal' ? 'Kurumsal' : '-'}</div>
              </div>
              ${formData.personalInfo.invoiceType === 'bireysel' && formData.personalInfo.invoiceFullName ? `
                <div class="info-item">
                  <div class="label">Fatura Adı</div>
                  <div class="value">${formData.personalInfo.invoiceFullName}</div>
                </div>
              ` : ''}
              ${formData.personalInfo.invoiceType === 'kurumsal' && formData.personalInfo.invoiceCompanyName ? `
                <div class="info-item">
                  <div class="label">Şirket Adı</div>
                  <div class="value">${formData.personalInfo.invoiceCompanyName}</div>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="footer">
            <p>Bu belge ${new Date().toLocaleDateString('tr-TR')} tarihinde otomatik olarak oluşturulmuştur.</p>
            ${pageSettings?.contact_email ? `<p>İletişim: ${pageSettings.contact_email} | ${pageSettings.contact_phone}</p>` : ''}
          </div>
        </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
        {/* PDF Content Wrapper - Başlıktan Summary'ye kadar */}
        <div id="pdf-full-content">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {pageSettings?.form_title
                ? (language === 'en' && pageSettings.form_title_en ? pageSettings.form_title_en : pageSettings.form_title)
                : t('step4.title')}
            </h2>
          </div>

        {/* Success Message and Reference Number */}
        {paymentMethod === 'online' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-lg font-semibold text-green-800 mb-2">
                  {language === 'en' ? 'Your payment and registration have been received.' : 'Ödemeniz ve Kaydınız alınmıştır.'}
                </p>
                {formData.referenceNumber && (
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-sm text-green-700">
                      <span className="font-medium">{language === 'en' ? 'Your Reference Number:' : 'Referans Numaranız:'}</span> 
                      <span className="font-bold ml-1">{formData.referenceNumber}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(formData.referenceNumber || '')
                        setRefNumberCopied(true)
                        setTimeout(() => setRefNumberCopied(false), 2000)
                      }}
                      className="no-pdf px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                      title={language === 'en' ? 'Copy reference number' : 'Referans numarasını kopyala'}
                    >
                      {refNumberCopied ? (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {language === 'en' ? 'Copied!' : 'Kopyalandı!'}
                        </span>
                      ) : (
                        <>{language === 'en' ? '📋 Copy' : '📋 Kopyala'}</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'bank_transfer' && (
          <div className="space-y-4 mb-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-green-800 mb-2">{t('step4.bankTransferNote')}</p>
                  {formData.referenceNumber && (
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-sm text-green-700">
                        <span className="font-medium">{language === 'en' ? 'Your Reference Number:' : 'Referans Numaranız:'}</span> 
                        <span className="font-bold ml-1">{formData.referenceNumber}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(formData.referenceNumber || '')
                          setRefNumberCopied(true)
                          setTimeout(() => setRefNumberCopied(false), 2000)
                        }}
                        className="no-pdf px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                        title={language === 'en' ? 'Copy reference number' : 'Referans numarasını kopyala'}
                      >
                        {refNumberCopied ? (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {language === 'en' ? 'Copied!' : 'Kopyalandı!'}
                          </span>
                        ) : (
                          <>{language === 'en' ? '📋 Copy' : '📋 Kopyala'}</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dekont Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-yellow-800 w-full">
                  {/* Tam dekont mesajı */}
                  {(language === 'en' ? (paymentSettings as any).dekontMessageEn || (paymentSettings as any).dekontMessage : (paymentSettings as any).dekontMessage) && (
                    <div className="mb-3">
                      <p className="font-medium leading-relaxed">
                        {(language === 'en' 
                          ? ((paymentSettings as any).dekontMessageEn || (paymentSettings as any).dekontMessage)
                          : (paymentSettings as any).dekontMessage
                        )?.replace('{email}', '')}
                      </p>
                    </div>
                  )}
                  
                  {/* E-posta adresi - vurgulu */}
                  <div className="flex items-center gap-2 bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                    <svg className="w-5 h-5 text-yellow-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a 
                      href={`mailto:${(paymentSettings as any).dekontEmail || 'dekont@example.com'}`}
                      className="text-base font-bold text-yellow-900 hover:text-yellow-700 underline transition-colors"
                      title={language === 'en' ? 'Click to send email' : 'E-posta göndermek için tıklayın'}
                    >
                      {(paymentSettings as any).dekontEmail || 'dekont@example.com'}
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText((paymentSettings as any).dekontEmail || 'dekont@example.com')
                        setEmailCopied(true)
                        setTimeout(() => setEmailCopied(false), 2000)
                      }}
                      className="no-pdf ml-auto px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors relative"
                      title={language === 'en' ? 'Copy email address' : 'E-posta adresini kopyala'}
                    >
                      {emailCopied ? (
                        <>
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {language === 'en' ? 'Copied!' : 'Kopyalandı!'}
                          </span>
                        </>
                      ) : (
                        <>{language === 'en' ? '📋 Copy' : '📋 Kopyala'}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-3">{t('step3.bankAccounts')}</h4>
              <div className="space-y-3">
                {bankAccounts
                  .filter(account => {
                    // TRY seçiliyse sadece TRY hesapları
                    if (selectedCurrency === 'TRY') {
                      return account.currency === 'TRY'
                    }
                    // USD seçiliyse TRY ve USD hesapları
                    if (selectedCurrency === 'USD') {
                      return account.currency === 'TRY' || account.currency === 'USD'
                    }
                    // EUR seçiliyse TRY ve EUR hesapları
                    if (selectedCurrency === 'EUR') {
                      return account.currency === 'TRY' || account.currency === 'EUR'
                    }
                    return true
                  })
                  .map((account, index) => (
                  <div key={account.id} className={`${index > 0 ? 'pt-3 border-t border-blue-200' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-blue-800">
                        {language === 'en' ? account.account_name_en || account.account_name : account.account_name}
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                        {account.currency}
                      </span>
                    </div>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p><span className="font-medium">{t('step3.bank')}:</span> {account.bank_name}</p>
                      <p><span className="font-medium">{t('step3.accountHolder')}:</span> {account.account_holder}</p>
                      <p><span className="font-medium">IBAN:</span> <span className="font-mono">{account.iban}</span></p>
                      {account.description && (
                        <p><span className="font-medium">{t('step3.description')}:</span> {account.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary Section - Simplified */}
        <div className="mb-6" id="summary-content">
          {/* Kayıt Bilgileri - Tek Kart */}
          <div className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">{t('step4.registrationInfo')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-gray-600">{t('step3.fullName')}: </span>
                <span className="font-semibold text-gray-900">
                  {formData.personalInfo.fullName || `${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`.trim() || '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">{t('step3.email')}: </span>
                <span className="font-semibold text-gray-900">{formData.personalInfo.email || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600">{t('step3.phone')}: </span>
                <span className="font-semibold text-gray-900">{formData.personalInfo.phone || '-'}</span>
              </div>
              {formData.personalInfo.address && (
                <div>
                  <span className="text-gray-600">Adres: </span>
                  <span className="font-semibold text-gray-900">{formData.personalInfo.address}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">{t('step4.registrationType')}: </span>
                <span className="font-semibold text-gray-900">{registrationInfo.label}</span>
              </div>
              
              {/* Ücret Bilgisi - Döviz Desteği */}
              {registrationInfo.currency !== 'TRY' && registrationInfo.feeInCurrency > 0 ? (
                <>
                  <div>
                    <span className="text-gray-600">{t('step3.selectedCurrencyFee')}: </span>
                    <span className="font-bold text-blue-600">
                      {getCurrencySymbol(registrationInfo.currency)}{Number(registrationInfo.feeInCurrency).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('step3.exchangeRate')}: </span>
                    <span className="font-semibold text-gray-700">
                      1 {registrationInfo.currency} = {Number(accommodationData.exchangeRate || 1).toFixed(2)} ₺
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('step3.tryEquivalent')}: </span>
                    <span className="font-bold text-primary-600">{registrationInfo.fee}</span>
                  </div>
                </>
              ) : (
                <div>
                  <span className="text-gray-600">{t('step3.fee')}: </span>
                  <span className="font-bold text-primary-600">{registrationInfo.fee}</span>
                </div>
              )}
            </div>
          </div>

          {/* Fatura Bilgileri - Ayrı Kart */}
          {formData.personalInfo.invoiceType && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">{t('step4.invoiceInfo')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-gray-600">{t('step3.invoiceType')}: </span>
                  <span className="font-semibold text-gray-900">
                    {formData.personalInfo.invoiceType === 'bireysel' ? t('step3.individual') : t('step3.corporate')}
                  </span>
                </div>
                
                {/* Bireysel Fatura Bilgileri */}
                {formData.personalInfo.invoiceType === 'bireysel' && (
                  <>
                    {formData.personalInfo.invoiceFullName && (
                      <div>
                        <span className="text-gray-600">{t('step3.invoiceFullName')}: </span>
                        <span className="font-semibold text-gray-900">{formData.personalInfo.invoiceFullName}</span>
                      </div>
                    )}
                    {formData.personalInfo.idNumber && (
                      <div>
                        <span className="text-gray-600">{t('step3.idNumber')}: </span>
                        <span className="font-semibold text-gray-900">{formData.personalInfo.idNumber}</span>
                      </div>
                    )}
                    {formData.personalInfo.invoiceAddress && (
                      <div className="md:col-span-2">
                        <span className="text-gray-600">{t('step3.invoiceAddress')}: </span>
                        <span className="font-semibold text-gray-900">{formData.personalInfo.invoiceAddress}</span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Kurumsal Fatura Bilgileri */}
                {formData.personalInfo.invoiceType === 'kurumsal' && (
                  <>
                    {formData.personalInfo.invoiceCompanyName && (
                      <div>
                        <span className="text-gray-600">{t('step3.invoiceCompanyName')}: </span>
                        <span className="font-semibold text-gray-900">{formData.personalInfo.invoiceCompanyName}</span>
                      </div>
                    )}
                    {formData.personalInfo.taxOffice && (
                      <div>
                        <span className="text-gray-600">{t('step3.taxOffice')}: </span>
                        <span className="font-semibold text-gray-900">{formData.personalInfo.taxOffice}</span>
                      </div>
                    )}
                    {formData.personalInfo.taxNumber && (
                      <div>
                        <span className="text-gray-600">{t('step3.taxNumber')}: </span>
                        <span className="font-semibold text-gray-900">{formData.personalInfo.taxNumber}</span>
                      </div>
                    )}
                    {formData.personalInfo.invoiceAddress && (
                      <div className="md:col-span-2">
                        <span className="text-gray-600">{t('step3.invoiceAddress')}: </span>
                        <span className="font-semibold text-gray-900">{formData.personalInfo.invoiceAddress}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        </div>
        {/* PDF Content Wrapper END */}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {/* Yeni Kayıt */}
          <button
            type="button"
            onClick={handleNewRegistration}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('step4.newRegistration')}
          </button>

          {/* Anasayfa */}
          <button
            type="button"
            onClick={handleGoToHomepage}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {t('step4.goToHomepage')}
          </button>

          {/* PDF İndir */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPDF ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('step4.generatingPDF')}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('step4.downloadPDF')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

