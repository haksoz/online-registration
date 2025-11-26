'use client'

import { useFormStore } from '@/store/formStore'
import { useDataStore } from '@/store/dataStore'
import { useEffect, useState, useRef } from 'react'
import { formatTurkishCurrency } from '@/lib/currencyUtils'
import { fetchPageSettings, type PageSettings } from '@/constants/pageSettings'
import { useTranslation } from '@/hooks/useTranslation'

export default function Step4Confirmation() {
  const formStore = useFormStore()
  const { formData } = formStore
  const { t, language } = useTranslation()
  const paymentMethod = formData.payment.paymentMethod
  const { 
    registrationTypes, 
    bankAccounts: storeBankAccounts, 
    paymentSettings: storePaymentSettings,
    currencyType,
    exchangeRates
  } = useDataStore()
  
  const bankAccounts = Array.isArray(storeBankAccounts) ? storeBankAccounts : []
  const paymentSettings = storePaymentSettings || {}

  // Döviz formatı
  const formatCurrency = (amount: number, currency: string = currencyType) => {
    if (currency === 'USD') {
      return `$${amount.toFixed(2)}`
    } else if (currency === 'EUR') {
      return `€${amount.toFixed(2)}`
    }
    return formatTurkishCurrency(amount)
  }
  
  const [pageSettings, setPageSettings] = useState<PageSettings | null>(null)
  const [homepageUrl, setHomepageUrl] = useState<string>('https://example.com')
  const [refNumberCopied, setRefNumberCopied] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)
  const emailSentRef = useRef(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pageSettings = await fetchPageSettings()
        setPageSettings(pageSettings)

        const formSettingsResponse = await fetch('/api/admin/form-settings')
        const formSettingsData = await formSettingsResponse.json()
        if (formSettingsData.success && formSettingsData.homepageUrl) {
          setHomepageUrl(formSettingsData.homepageUrl)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  // Mail gönderme - Step4 yüklendiğinde otomatik
  useEffect(() => {
    const sendConfirmationEmail = async () => {
      if (!formData.registrationId || !formData.referenceNumber) return
      
      // Daha önce gönderildiyse tekrar gönderme
      if (emailSentRef.current) {
        return
      }
      
      // PageSettings yüklenene kadar bekle
      if (!pageSettings) {
        return
      }
      
      emailSentRef.current = true
      
      // DOM'un tam yüklenmesi ve render edilmesi için bekle
      // Dil değişimi de bu sürede tamamlanır
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Step4'teki HTML içeriğini al
      const element = document.querySelector('.w-full.max-w-4xl') as HTMLElement
      if (!element) return
      
      // Element'i klonla (orijinali değiştirmemek için)
      const clonedElement = element.cloneNode(true) as HTMLElement
      
      // Klondan tüm .no-pdf ve .print:hidden elementlerini tamamen kaldır
      const elementsToRemove = clonedElement.querySelectorAll('.no-pdf, .print\\:hidden')
      elementsToRemove.forEach(el => el.remove())
      
      const registrationInfo = clonedElement.innerHTML
      
      // Mail gönder
      try {
        await fetch('/api/send-registration-mail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.personalInfo.email,
            name: formData.personalInfo.fullName || `${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`.trim(),
            referenceNumber: formData.referenceNumber,
            registrationInfo,
            registrationId: formData.registrationId,
            language: formData.formLanguage || 'tr'
          })
        })
      } catch (error) {
        console.error('Mail gönderme hatası:', error)
        // Mail hatası kayıt işlemini etkilemez
      }
    }
    
    sendConfirmationEmail()
  }, [formData.registrationId, formData.referenceNumber, pageSettings])

  // Seçilen kayıt türlerini al
  const getSelectedTypes = () => {
    if (!formData.registrationSelections) return []
    
    const selected: any[] = []
    Object.entries(formData.registrationSelections).forEach(([categoryId, typeIds]) => {
      typeIds.forEach(typeId => {
        const type = registrationTypes.find((t: any) => t.id === typeId)
        if (type) {
          selected.push(type)
        }
      })
    })
    return selected
  }

  const selectedTypes = getSelectedTypes()
  
  // Toplam hesapla (KDV dahil)
  const calculateTotal = () => {
    let total = 0
    selectedTypes.forEach(type => {
      const fee = Number(currencyType === 'USD' ? type.fee_usd : currencyType === 'EUR' ? type.fee_eur : type.fee_try)
      const vatRate = Number(type.vat_rate) || 0.20
      total += fee + (fee * vatRate)
    })
    return total
  }

  const grandTotal = calculateTotal()

  const handleNewRegistration = () => {
    formStore.resetForm()
    formStore.setCurrentStep(1)
  }

  const handleGoToHomepage = () => {
    window.open(homepageUrl, '_blank')
  }

  const handleDownloadPDF = async () => {
    // Step4'teki HTML'i kullanarak PDF oluştur
    const { jsPDF } = await import('jspdf')
    const html2canvas = (await import('html2canvas')).default
    
    // PDF oluşturulurken gizlenecek elementler
    const elementsToHide = [
      ...Array.from(document.querySelectorAll('.print\\:hidden')), // Butonlar
      document.querySelector('header'), // Header
      document.querySelector('nav'), // Navigation
    ]
    
    // Elementleri gizle ve orijinal display değerlerini sakla
    const originalDisplays = elementsToHide.map(el => {
      if (!el) return null
      const display = (el as HTMLElement).style.display
      ;(el as HTMLElement).style.display = 'none'
      return { el, display }
    }).filter(Boolean)
    
    // Step4'teki ana div'i yakala
    const element = document.querySelector('.w-full.max-w-4xl') as HTMLElement
    if (!element) {
      // Elementleri geri göster
      originalDisplays.forEach(item => {
        if (item) (item.el as HTMLElement).style.display = item.display
      })
      return
    }
    
    try {
      // HTML'i canvas'a çevir
      const canvas = await html2canvas(element, {
        scale: 2, // Yüksek kalite
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      
      // Canvas'ı PDF'e çevir
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      // A4 boyutu: 210mm x 297mm
      // Kenar boşlukları: 15mm
      const margin = 15
      const pageWidth = 210
      const contentWidth = pageWidth - (margin * 2) // 180mm
      const imgWidth = contentWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight)
      
      // PDF'i indir
      const fileName = `kayit-${formData.referenceNumber || 'onay'}.pdf`
      pdf.save(fileName)
    } finally {
      // Elementleri geri göster
      originalDisplays.forEach(item => {
        if (item) (item.el as HTMLElement).style.display = item.display
      })
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        {/* Başlık */}
        <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'en' 
              ? (pageSettings?.form_title_en || pageSettings?.form_title || 'Registration System')
              : (pageSettings?.form_title || 'Kayıt Sistemi')}
          </h1>
          <p className="text-lg text-gray-700">
            {language === 'en' ? 'Registration Summary' : 'Kayıt Özeti'}
          </p>
        </div>

        {/* Başarı Mesajı */}
        <div className="bg-green-50 border border-green-300 rounded p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✓</span>
            <div className="flex-1">
              <p className="font-semibold text-green-900 mb-2">
                {paymentMethod === 'online' 
                  ? (language === 'en' ? 'Your payment and registration have been received.' : 'Ödemeniz ve kaydınız alınmıştır.')
                  : (language === 'en' ? 'Your registration has been received.' : 'Kaydınız alınmıştır.')}
              </p>
              {formData.referenceNumber && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-green-800">
                    <strong>{language === 'en' ? 'Reference Number:' : 'Referans No:'}</strong> {formData.referenceNumber}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(formData.referenceNumber || '')
                      setRefNumberCopied(true)
                      setTimeout(() => setRefNumberCopied(false), 2000)
                    }}
                    className="no-pdf text-xs px-2 py-1 bg-green-700 text-white rounded hover:bg-green-800 print:hidden"
                  >
                    {refNumberCopied ? '✓' : '📋'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kayıt Bilgileri */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
            {language === 'en' ? 'Registration Information' : 'Kayıt Bilgileri'}
          </h3>
          
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-600">{language === 'en' ? 'Full Name:' : 'Ad Soyad:'}</span>{' '}
              <span className="font-medium">{formData.personalInfo.fullName || `${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`.trim()}</span>
            </p>
            <p>
              <span className="text-gray-600">{language === 'en' ? 'Email:' : 'E-posta:'}</span>{' '}
              <span className="font-medium">{formData.personalInfo.email}</span>
            </p>
            <p>
              <span className="text-gray-600">{language === 'en' ? 'Phone:' : 'Telefon:'}</span>{' '}
              <span className="font-medium">{formData.personalInfo.phone}</span>
            </p>
            {formData.personalInfo.address && (
              <p>
                <span className="text-gray-600">{language === 'en' ? 'Address:' : 'Adres:'}</span>{' '}
                <span className="font-medium">{formData.personalInfo.address}</span>
              </p>
            )}
            {formData.personalInfo.company && (
              <p>
                <span className="text-gray-600">{language === 'en' ? 'Company:' : 'Şirket:'}</span>{' '}
                <span className="font-medium">{formData.personalInfo.company}</span>
              </p>
            )}
            {formData.personalInfo.department && (
              <p>
                <span className="text-gray-600">{language === 'en' ? 'Department:' : 'Departman:'}</span>{' '}
                <span className="font-medium">{formData.personalInfo.department}</span>
              </p>
            )}
          </div>
        </div>

        {/* Seçilen Kayıtlar */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
            {language === 'en' ? 'Selected Registrations' : 'Seçilen Kayıtlar'}
          </h3>
          
          <div className="space-y-2">
            {selectedTypes.map((type: any) => {
              const fee = Number(currencyType === 'USD' ? type.fee_usd : currencyType === 'EUR' ? type.fee_eur : type.fee_try)
              const vatRate = Number(type.vat_rate) || 0.20
              const vat = fee * vatRate
              const total = fee + vat
              
              // TL karşılığı
              const exchangeRate = exchangeRates[currencyType] || 1
              const tryTotal = currencyType !== 'TRY' ? total * exchangeRate : total
              
              return (
                <div key={type.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-200">
                  <div>
                    <p className="font-medium">{language === 'en' ? type.label_en || type.label : type.label}</p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(fee)} + %{(vatRate * 100).toFixed(0)} {language === 'en' ? 'VAT' : 'KDV'}
                    </p>
                    {currencyType !== 'TRY' && (
                      <p className="text-xs text-gray-400">
                        ≈ {formatTurkishCurrency(tryTotal)} {language === 'en' ? '(TRY)' : '(TL)'}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold">{formatCurrency(total)}</p>
                </div>
              )
            })}
            
            <div className="flex justify-between items-center pt-3 border-t-2 border-gray-400">
              <div>
                <span className="font-bold text-gray-900 block">{language === 'en' ? 'Total (VAT Included):' : 'Toplam (KDV Dahil):'}</span>
                {currencyType !== 'TRY' && (
                  <span className="text-xs text-gray-500">
                    ≈ {formatTurkishCurrency(grandTotal * (exchangeRates[currencyType] || 1))} {language === 'en' ? '(TRY)' : '(TL)'}
                  </span>
                )}
              </div>
              <span className="text-xl font-bold text-primary-600">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Banka Havalesi Bilgisi */}
        {paymentMethod === 'bank_transfer' && (
          <div className="bg-yellow-50 border border-yellow-300 rounded p-4 mb-6">
            {(() => {
              const dekontEmail = (paymentSettings as any).dekontEmail || 'dekont@example.com'
              const message = language === 'en' 
                ? ((paymentSettings as any).dekontMessageEn || (paymentSettings as any).dekontMessage || 'Please complete your payment via bank transfer and send your receipt to:')
                : ((paymentSettings as any).dekontMessage || 'Lütfen banka havalesi ile ödemenizi tamamlayın ve dekontunuzu şu adrese gönderin:')
              
              // {email} placeholder'ını tıklanabilir email ile değiştir
              if (message.includes('{email}')) {
                const parts = message.split('{email}')
                return (
                  <p className="text-sm text-yellow-900 mb-3 whitespace-pre-line">
                    {parts[0]}
                    <span className="font-semibold">{dekontEmail}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(dekontEmail)
                        setEmailCopied(true)
                        setTimeout(() => setEmailCopied(false), 2000)
                      }}
                      className="no-pdf inline-flex items-center text-xs px-2 py-1 bg-yellow-700 text-white rounded hover:bg-yellow-800 print:hidden"
                      title="Kopyalamak için tıklayın"
                    >
                      {emailCopied ? '✓' : '📋'}
                    </button>
                    {parts[1]}
                  </p>
                )
              }
              
              // {email} yoksa eski format
              return (
                <>
                  <p className="text-sm text-yellow-900 mb-3 whitespace-pre-line">{message}</p>
                  <div className="flex items-center gap-2 bg-yellow-100 border border-yellow-400 rounded p-2">
                    <strong className="text-yellow-900">{dekontEmail}</strong>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(dekontEmail)
                        setEmailCopied(true)
                        setTimeout(() => setEmailCopied(false), 2000)
                      }}
                      className="no-pdf text-xs px-2 py-1 bg-yellow-700 text-white rounded hover:bg-yellow-800 print:hidden"
                    >
                      {emailCopied ? '✓' : '📋'}
                    </button>
                  </div>
                </>
              )
            })()}
            
            {/* Banka Hesapları */}
            <div className="mt-4 space-y-3">
              <p className="text-sm font-semibold text-yellow-900">{language === 'en' ? 'Bank Accounts:' : 'Banka Hesapları:'}</p>
              
              {/* TRY Hesapları */}
              {bankAccounts.filter(acc => acc.currency === 'TRY').map((account) => (
                <div key={account.id} className="text-xs bg-white border border-yellow-200 rounded p-2">
                  <p><strong>{language === 'en' ? account.account_name_en || account.account_name : account.account_name}</strong></p>
                  <p>{account.bank_name}</p>
                  <p>{account.account_holder}</p>
                  <p className="font-mono">{account.iban}</p>
                </div>
              ))}
              
              {/* Döviz Hesapları (TRY değilse) */}
              {currencyType !== 'TRY' && bankAccounts.filter(acc => acc.currency === currencyType).map((account) => (
                <div key={account.id} className="text-xs bg-white border border-yellow-200 rounded p-2">
                  <p><strong>{language === 'en' ? account.account_name_en || account.account_name : account.account_name}</strong></p>
                  <p>{account.bank_name}</p>
                  <p>{account.account_holder}</p>
                  <p className="font-mono">{account.iban}</p>
                  {account.swift_code && (
                    <p><strong>SWIFT:</strong> {account.swift_code}</p>
                  )}
                  {account.account_number && (
                    <p><strong>{language === 'en' ? 'Account Number:' : 'Hesap No:'}</strong> {account.account_number}</p>
                  )}
                  {account.bank_address && (
                    <p className="text-xs text-gray-600 mt-1">{account.bank_address}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fatura Bilgileri */}
        {formData.personalInfo.invoiceType && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
              {language === 'en' ? 'Invoice Information' : 'Fatura Bilgileri'}
            </h3>
            
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-600">{language === 'en' ? 'Invoice Type:' : 'Fatura Türü:'}</span>{' '}
                <span className="font-medium">
                  {formData.personalInfo.invoiceType === 'bireysel' 
                    ? (language === 'en' ? 'Individual' : 'Bireysel')
                    : (language === 'en' ? 'Corporate' : 'Kurumsal')}
                </span>
              </p>
              
              {formData.personalInfo.invoiceType === 'bireysel' ? (
                <>
                  {formData.personalInfo.invoiceFullName && (
                    <p>
                      <span className="text-gray-600">{language === 'en' ? 'Invoice Name:' : 'Fatura Adı:'}</span>{' '}
                      <span className="font-medium">{formData.personalInfo.invoiceFullName}</span>
                    </p>
                  )}
                  {formData.personalInfo.idNumber && (
                    <p>
                      <span className="text-gray-600">{language === 'en' ? 'ID Number:' : 'TC Kimlik No:'}</span>{' '}
                      <span className="font-medium">{formData.personalInfo.idNumber}</span>
                    </p>
                  )}
                  {formData.personalInfo.invoiceAddress && (
                    <p>
                      <span className="text-gray-600">{language === 'en' ? 'Invoice Address:' : 'Fatura Adresi:'}</span>{' '}
                      <span className="font-medium">{formData.personalInfo.invoiceAddress}</span>
                    </p>
                  )}
                </>
              ) : (
                <>
                  {formData.personalInfo.invoiceCompanyName && (
                    <p>
                      <span className="text-gray-600">{language === 'en' ? 'Company Name:' : 'Şirket Adı:'}</span>{' '}
                      <span className="font-medium">{formData.personalInfo.invoiceCompanyName}</span>
                    </p>
                  )}
                  {formData.personalInfo.taxOffice && (
                    <p>
                      <span className="text-gray-600">{language === 'en' ? 'Tax Office:' : 'Vergi Dairesi:'}</span>{' '}
                      <span className="font-medium">{formData.personalInfo.taxOffice}</span>
                    </p>
                  )}
                  {formData.personalInfo.taxNumber && (
                    <p>
                      <span className="text-gray-600">{language === 'en' ? 'Tax Number:' : 'Vergi No:'}</span>{' '}
                      <span className="font-medium">{formData.personalInfo.taxNumber}</span>
                    </p>
                  )}
                  {formData.personalInfo.invoiceAddress && (
                    <p>
                      <span className="text-gray-600">{language === 'en' ? 'Invoice Address:' : 'Fatura Adresi:'}</span>{' '}
                      <span className="font-medium">{formData.personalInfo.invoiceAddress}</span>
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Butonlar */}
        <div className="flex flex-wrap gap-3 justify-center pt-6 border-t border-gray-300 print:hidden">
          <button
            onClick={handleNewRegistration}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            {language === 'en' ? '+ New Registration' : '+ Yeni Kayıt'}
          </button>
          
          <button
            onClick={handleGoToHomepage}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {language === 'en' ? '🏠 Homepage' : '🏠 Anasayfa'}
          </button>
          
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            {language === 'en' ? '📄 Download PDF' : '📄 PDF İndir'}
          </button>
        </div>
      </div>
    </div>
  )
}
