'use client'

import { useFormStore } from '@/store/formStore'
import { useEffect, useState } from 'react'
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
  const [registrationTypes, setRegistrationTypes] = useState<RegistrationType[]>([])
  const [bankAccounts, setBankAccounts] = useState<any[]>([])
  const [paymentSettings, setPaymentSettings] = useState<any>({})
  const [pageSettings, setPageSettings] = useState<PageSettings | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Kayıt türlerini getir
        const regResponse = await fetch('/api/registration-types')
        const regData = await regResponse.json()
        if (regData.success) {
          setRegistrationTypes(regData.data)
        }

        // Banka hesaplarını getir
        const accounts = await getFormattedBankAccounts()
        setBankAccounts(accounts)

        // Ödeme ayarlarını getir
        const settings = await getPaymentSettings()
        setPaymentSettings(settings)

        // Sayfa ayarlarını getir
        const pageSettings = await fetchPageSettings()
        setPageSettings(pageSettings)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

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
        label: selectedRegistrationType.label,
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
    const homepageUrl = pageSettings?.homepage_url || 'https://example.com'
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

      // PDF için özel bir element oluştur
      const pdfElement = document.getElementById('pdf-content')
      if (!pdfElement) {
        throw new Error('PDF içeriği bulunamadı')
      }

      // Element'in görünür olduğundan emin ol
      pdfElement.style.display = 'block'
      pdfElement.style.position = 'absolute'
      pdfElement.style.left = '-9999px'
      pdfElement.style.top = '0'

      // Kısa bir bekleme süresi
      await new Promise(resolve => setTimeout(resolve, 200))

      // Canvas'a çevir - daha basit ayarlar
      const canvas = await html2canvas(pdfElement, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: true
      })

      // Element'i tekrar gizle
      pdfElement.style.display = 'none'
      pdfElement.style.position = 'static'
      pdfElement.style.left = 'auto'
      pdfElement.style.top = 'auto'

      // PDF oluştur
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Sayfa boyutları
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // Canvas boyutlarını PDF'e uyarla
      const canvasAspectRatio = canvas.height / canvas.width
      const pdfAspectRatio = pdfHeight / pdfWidth
      
      let imgWidth, imgHeight, x, y
      
      if (canvasAspectRatio > pdfAspectRatio) {
        // Canvas daha uzun - yüksekliğe göre ölçekle
        imgHeight = pdfHeight - 20 // 10mm üst ve alt margin
        imgWidth = imgHeight / canvasAspectRatio
        x = (pdfWidth - imgWidth) / 2
        y = 10
      } else {
        // Canvas daha geniş - genişliğe göre ölçekle
        imgWidth = pdfWidth - 20 // 10mm sol ve sağ margin
        imgHeight = imgWidth * canvasAspectRatio
        x = 10
        y = (pdfHeight - imgHeight) / 2
      }

      // Resmi PDF'e ekle
      pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight)
      
      // PDF'i indir
      const fileName = `Kayit_Ozeti_${formData.referenceNumber || new Date().getTime()}_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
    } catch (error) {
      console.error('PDF oluşturma hatası:', error)
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
            <h1>${pageSettings?.organization_name || 'Online Kayıt Sistemi'}</h1>
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
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('step4.title')}</h2>
        </div>

        {/* Success Message and Reference Number */}
        {paymentMethod === 'online' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-lg font-semibold text-green-800 mb-2">Ödemeniz ve Kaydınız alınmıştır.</p>
                {formData.referenceNumber && (
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Referans Numaranız:</span> 
                    <span className="font-bold ml-1">{formData.referenceNumber}</span>
                  </p>
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
                  <p className="text-lg font-semibold text-green-800 mb-2">Kaydınız alınmıştır. Banka havalesi ile ödeme yapabilirsiniz.</p>
                  {formData.referenceNumber && (
                    <p className="text-sm text-green-700">
                      <span className="font-medium">Referans Numaranız:</span> 
                      <span className="font-bold ml-1">{formData.referenceNumber}</span>
                    </p>
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
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Lütfen dekontunuzu</span>{' '}
                  <a href={`mailto:${paymentSettings.dekontEmail || 'dekont@ko.com.tr'}`} className="underline font-semibold hover:text-yellow-900">
                    {paymentSettings.dekontEmail || 'dekont@ko.com.tr'}
                  </a>{' '}
                  <span className="font-medium">adresine iletiniz.</span>
                </p>
              </div>
            </div>

            {/* Bank Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-3">Banka Hesapları</h4>
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
                      <span className="text-sm font-medium text-blue-800">{account.accountName}</span>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                        {account.currency}
                      </span>
                    </div>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p><span className="font-medium">Banka:</span> {account.bankName}</p>
                      <p><span className="font-medium">Hesap Sahibi:</span> {account.accountHolder}</p>
                      <p><span className="font-medium">IBAN:</span> <span className="font-mono">{account.iban}</span></p>
                      {account.description && (
                        <p><span className="font-medium">Açıklama:</span> {account.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary Section */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Kayıt Özeti</h3>
          
          {/* 1. Kayıt Türü */}
          <div className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
              1. {t('step4.registrationType')}
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-0.5">{t('step3.selectedType')}</p>
                <p className="font-medium text-gray-900">{registrationInfo.label}</p>
              </div>
              
              {registrationInfo.currency !== 'TRY' && registrationInfo.feeInCurrency > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">{t('step3.selectedCurrencyFee')}</p>
                    <p className="font-bold text-blue-600">
                      {getCurrencySymbol(registrationInfo.currency)}{Number(registrationInfo.feeInCurrency).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">{t('step3.tryEquivalent')}</p>
                    <p className="font-bold text-primary-600 text-lg">{registrationInfo.fee}</p>
                  </div>
                </div>
              )}
              
              {registrationInfo.currency === 'TRY' && registrationInfo.fee && (
                <div>
                  <p className="text-sm text-gray-600 mb-0.5">{t('step3.fee')}</p>
                  <p className="font-bold text-primary-600 text-lg">{registrationInfo.fee}</p>
                </div>
              )}
            </div>
          </div>

          {/* 2. Kişisel Bilgiler */}
          <div className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
              2. {t('step4.personalInfo')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600 mb-0.5">{t('step3.fullName')}</p>
                <p className="font-medium text-gray-900">
                  {formData.personalInfo.fullName || `${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`.trim() || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-0.5">{t('step3.email')}</p>
                <p className="font-medium text-gray-900">
                  {formData.personalInfo.email || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-0.5">{t('step3.phone')}</p>
                <p className="font-medium text-gray-900">
                  {formData.personalInfo.phone || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-0.5">Adres</p>
                <p className="font-medium text-gray-900">
                  {formData.personalInfo.address || '-'}
                </p>
              </div>
              {/* Şirket bilgisi geçici olarak gizlendi */}
              {/* 
              {formData.personalInfo.company && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Şirket</p>
                  <p className="font-medium text-gray-900">
                    {formData.personalInfo.company}
                  </p>
                </div>
              )}
              */}
            </div>
          </div>

          {/* 3. Fatura Bilgileri */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
              3. Fatura Bilgileri
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600 mb-0.5">Fatura Türü</p>
                <p className="font-medium text-gray-900">
                  {formData.personalInfo.invoiceType === 'bireysel'
                    ? 'Bireysel'
                    : formData.personalInfo.invoiceType === 'kurumsal'
                      ? 'Kurumsal'
                      : '-'}
                </p>
              </div>
              
              {/* Bireysel Fatura Bilgileri */}
              {formData.personalInfo.invoiceType === 'bireysel' && (
                <>
                  {formData.personalInfo.invoiceFullName && (
                    <div>
                      <p className="text-sm text-gray-600 mb-0.5">Fatura Adı</p>
                      <p className="font-medium text-gray-900">{formData.personalInfo.invoiceFullName}</p>
                    </div>
                  )}
                  {formData.personalInfo.idNumber && (
                    <div>
                      <p className="text-sm text-gray-600 mb-0.5">TC Kimlik No</p>
                      <p className="font-medium text-gray-900">{formData.personalInfo.idNumber}</p>
                    </div>
                  )}
                  {formData.personalInfo.invoiceAddress && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-0.5">Fatura Adresi</p>
                      <p className="font-medium text-gray-900">{formData.personalInfo.invoiceAddress}</p>
                    </div>
                  )}
                </>
              )}
              
              {/* Kurumsal Fatura Bilgileri */}
              {formData.personalInfo.invoiceType === 'kurumsal' && (
                <>
                  {formData.personalInfo.invoiceCompanyName && (
                    <div>
                      <p className="text-sm text-gray-600 mb-0.5">Şirket Adı</p>
                      <p className="font-medium text-gray-900">{formData.personalInfo.invoiceCompanyName}</p>
                    </div>
                  )}
                  {formData.personalInfo.taxOffice && (
                    <div>
                      <p className="text-sm text-gray-600 mb-0.5">Vergi Dairesi</p>
                      <p className="font-medium text-gray-900">{formData.personalInfo.taxOffice}</p>
                    </div>
                  )}
                  {formData.personalInfo.taxNumber && (
                    <div>
                      <p className="text-sm text-gray-600 mb-0.5">Vergi No</p>
                      <p className="font-medium text-gray-900">{formData.personalInfo.taxNumber}</p>
                    </div>
                  )}
                  {formData.personalInfo.invoiceAddress && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-0.5">Fatura Adresi</p>
                      <p className="font-medium text-gray-900">{formData.personalInfo.invoiceAddress}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* PDF Content - Hidden from view */}
        <div id="pdf-content" style={{ display: 'none' }}>
          <div className="bg-white p-8 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* PDF Header */}
            <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {pageSettings?.organization_name || 'Online Kayıt Sistemi'}
              </h1>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Kayıt Özeti</h2>
              <div className="text-lg text-gray-600">
                <p><strong>Referans No:</strong> {formData.referenceNumber}</p>
                <p><strong>Tarih:</strong> {new Date().toLocaleDateString('tr-TR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>

            {/* PDF Content Sections */}
            <div className="space-y-6">
              {/* 1. Kayıt Türü */}
              <div className="border border-gray-300 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  1. {t('step4.registrationType')}
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('step3.selectedType')}</p>
                    <p className="font-semibold text-gray-900">{registrationInfo.label}</p>
                  </div>
                  
                  {registrationInfo.currency !== 'TRY' && registrationInfo.feeInCurrency > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <div className="flex justify-between mb-2">
                        <p className="text-sm text-gray-600">{t('step3.selectedCurrencyFee')}</p>
                        <p className="font-bold text-blue-600">
                          {getCurrencySymbol(registrationInfo.currency)}{Number(registrationInfo.feeInCurrency).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-600">{t('step3.tryEquivalent')}</p>
                        <p className="font-bold text-gray-900 text-lg">{registrationInfo.fee}</p>
                      </div>
                    </div>
                  )}
                  
                  {registrationInfo.currency === 'TRY' && registrationInfo.fee && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t('step3.fee')}</p>
                      <p className="font-bold text-gray-900 text-lg">{registrationInfo.fee}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Kişisel Bilgiler */}
              <div className="border border-gray-300 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  2. {t('step4.personalInfo')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('step3.fullName')}</p>
                    <p className="font-semibold text-gray-900">
                      {formData.personalInfo.fullName || `${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`.trim() || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('step3.email')}</p>
                    <p className="font-semibold text-gray-900">{formData.personalInfo.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('step3.phone')}</p>
                    <p className="font-semibold text-gray-900">{formData.personalInfo.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Adres</p>
                    <p className="font-semibold text-gray-900">{formData.personalInfo.address || '-'}</p>
                  </div>
                  {/* Şirket bilgisi geçici olarak gizlendi */}
                  {/* 
                  {formData.personalInfo.company && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Şirket</p>
                      <p className="font-semibold text-gray-900">{formData.personalInfo.company}</p>
                    </div>
                  )}
                  */}
                </div>
              </div>

              {/* 3. Fatura Bilgileri */}
              <div className="border border-gray-300 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  3. Fatura Bilgileri
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Fatura Türü</p>
                    <p className="font-semibold text-gray-900">
                      {formData.personalInfo.invoiceType === 'bireysel'
                        ? 'Bireysel'
                        : formData.personalInfo.invoiceType === 'kurumsal'
                          ? 'Kurumsal'
                          : '-'}
                    </p>
                  </div>
                  
                  {/* Bireysel Fatura Bilgileri */}
                  {formData.personalInfo.invoiceType === 'bireysel' && (
                    <>
                      {formData.personalInfo.invoiceFullName && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Fatura Adı</p>
                          <p className="font-semibold text-gray-900">{formData.personalInfo.invoiceFullName}</p>
                        </div>
                      )}
                      {formData.personalInfo.idNumber && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">TC Kimlik No</p>
                          <p className="font-semibold text-gray-900">{formData.personalInfo.idNumber}</p>
                        </div>
                      )}
                      {formData.personalInfo.invoiceAddress && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600 mb-1">Fatura Adresi</p>
                          <p className="font-semibold text-gray-900">{formData.personalInfo.invoiceAddress}</p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Kurumsal Fatura Bilgileri */}
                  {formData.personalInfo.invoiceType === 'kurumsal' && (
                    <>
                      {formData.personalInfo.invoiceCompanyName && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Şirket Adı</p>
                          <p className="font-semibold text-gray-900">{formData.personalInfo.invoiceCompanyName}</p>
                        </div>
                      )}
                      {formData.personalInfo.taxOffice && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Vergi Dairesi</p>
                          <p className="font-semibold text-gray-900">{formData.personalInfo.taxOffice}</p>
                        </div>
                      )}
                      {formData.personalInfo.taxNumber && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Vergi No</p>
                          <p className="font-semibold text-gray-900">{formData.personalInfo.taxNumber}</p>
                        </div>
                      )}
                      {formData.personalInfo.invoiceAddress && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600 mb-1">Fatura Adresi</p>
                          <p className="font-semibold text-gray-900">{formData.personalInfo.invoiceAddress}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Ödeme Bilgileri */}
              {paymentMethod === 'bank_transfer' && bankAccounts.length > 0 && (
                <div className="border border-gray-300 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    4. Ödeme Bilgileri
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Banka Havalesi ile Ödeme</p>
                  <div className="space-y-4">
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
                      <div key={account.id} className={`${index > 0 ? 'pt-4 border-t border-gray-200' : ''}`}>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Hesap Adı</p>
                            <p className="font-semibold text-gray-900">{account.accountName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Para Birimi</p>
                            <p className="font-semibold text-gray-900">{account.currency}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Banka</p>
                            <p className="font-semibold text-gray-900">{account.bankName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Hesap Sahibi</p>
                            <p className="font-semibold text-gray-900">{account.accountHolder}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600 mb-1">IBAN</p>
                            <p className="font-mono font-semibold text-gray-900">{account.iban}</p>
                          </div>
                          {account.description && (
                            <div className="col-span-2">
                              <p className="text-sm text-gray-600 mb-1">Açıklama</p>
                              <p className="font-semibold text-gray-900">{account.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Önemli:</strong> Ödeme dekontunuzu{' '}
                      <strong>{paymentSettings.dekontEmail || 'dekont@ko.com.tr'}</strong>{' '}
                      adresine göndermeyi unutmayınız.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* PDF Footer */}
            <div className="mt-8 pt-6 border-t-2 border-gray-300 text-center text-sm text-gray-600">
              <p>Bu belge {new Date().toLocaleDateString('tr-TR')} tarihinde otomatik olarak oluşturulmuştur.</p>
              {pageSettings?.contact_email && (
                <p>İletişim: {pageSettings.contact_email} | {pageSettings.contact_phone}</p>
              )}
            </div>
          </div>
        </div>

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
            Anasayfa
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
                PDF Oluşturuluyor...
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

