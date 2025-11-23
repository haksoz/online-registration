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
    paymentSettings: storePaymentSettings 
  } = useDataStore()
  
  const bankAccounts = Array.isArray(storeBankAccounts) ? storeBankAccounts : []
  const paymentSettings = storePaymentSettings || {}
  
  const [pageSettings, setPageSettings] = useState<PageSettings | null>(null)
  const [homepageUrl, setHomepageUrl] = useState<string>('https://example.com')
  const [refNumberCopied, setRefNumberCopied] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)

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
      const fee = Number(type.fee_try || 0)
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

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        {/* Başlık */}
        <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {pageSettings?.form_title || 'Kayıt Sistemi'}
          </h1>
          <p className="text-lg text-gray-700">Kayıt Özeti</p>
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
                    className="text-xs px-2 py-1 bg-green-700 text-white rounded hover:bg-green-800"
                  >
                    {refNumberCopied ? '✓' : '📋'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Banka Havalesi Bilgisi */}
        {paymentMethod === 'bank_transfer' && (
          <div className="bg-yellow-50 border border-yellow-300 rounded p-4 mb-6">
            <p className="text-sm text-yellow-900 mb-3">
              {language === 'en' 
                ? 'Please complete your payment via bank transfer and send your receipt to:'
                : 'Lütfen banka havalesi ile ödemenizi tamamlayın ve dekontunuzu şu adrese gönderin:'}
            </p>
            <div className="flex items-center gap-2 bg-yellow-100 border border-yellow-400 rounded p-2">
              <strong className="text-yellow-900">{(paymentSettings as any).dekontEmail || 'dekont@example.com'}</strong>
              <button
                onClick={() => {
                  navigator.clipboard.writeText((paymentSettings as any).dekontEmail || '')
                  setEmailCopied(true)
                  setTimeout(() => setEmailCopied(false), 2000)
                }}
                className="text-xs px-2 py-1 bg-yellow-700 text-white rounded hover:bg-yellow-800"
              >
                {emailCopied ? '✓' : '📋'}
              </button>
            </div>
            
            {/* Banka Hesapları */}
            <div className="mt-4 space-y-3">
              <p className="text-sm font-semibold text-yellow-900">{language === 'en' ? 'Bank Accounts:' : 'Banka Hesapları:'}</p>
              {bankAccounts.filter(acc => acc.currency === 'TRY').map((account) => (
                <div key={account.id} className="text-xs bg-white border border-yellow-200 rounded p-2">
                  <p><strong>{language === 'en' ? account.account_name_en || account.account_name : account.account_name}</strong></p>
                  <p>{account.bank_name}</p>
                  <p>{account.account_holder}</p>
                  <p className="font-mono">{account.iban}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kayıt Bilgileri */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
            {language === 'en' ? 'Registration Information' : 'Kayıt Bilgileri'}
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">{language === 'en' ? 'Full Name:' : 'Ad Soyad:'}</span>
              <span className="font-medium">{formData.personalInfo.fullName || `${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`.trim()}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">{language === 'en' ? 'Email:' : 'E-posta:'}</span>
              <span className="font-medium">{formData.personalInfo.email}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">{language === 'en' ? 'Phone:' : 'Telefon:'}</span>
              <span className="font-medium">{formData.personalInfo.phone}</span>
            </div>
          </div>
        </div>

        {/* Seçilen Kayıtlar */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
            {language === 'en' ? 'Selected Registrations' : 'Seçilen Kayıtlar'}
          </h3>
          
          <div className="space-y-2">
            {selectedTypes.map((type: any) => {
              const fee = Number(type.fee_try || 0)
              const vatRate = Number(type.vat_rate) || 0.20
              const vat = fee * vatRate
              const total = fee + vat
              
              return (
                <div key={type.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-200">
                  <div>
                    <p className="font-medium">{language === 'en' ? type.label_en || type.label : type.label}</p>
                    <p className="text-xs text-gray-500">
                      {formatTurkishCurrency(fee)} + %{(vatRate * 100).toFixed(0)} KDV
                    </p>
                  </div>
                  <p className="font-semibold">{formatTurkishCurrency(total)}</p>
                </div>
              )
            })}
            
            <div className="flex justify-between items-center pt-3 border-t-2 border-gray-400">
              <span className="font-bold text-gray-900">{language === 'en' ? 'Total (VAT Included):' : 'Toplam (KDV Dahil):'}</span>
              <span className="text-xl font-bold text-primary-600">{formatTurkishCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Fatura Bilgileri */}
        {formData.personalInfo.invoiceType && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
              {language === 'en' ? 'Invoice Information' : 'Fatura Bilgileri'}
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">{language === 'en' ? 'Invoice Type:' : 'Fatura Türü:'}</span>
                <span className="font-medium">
                  {formData.personalInfo.invoiceType === 'bireysel' 
                    ? (language === 'en' ? 'Individual' : 'Bireysel')
                    : (language === 'en' ? 'Corporate' : 'Kurumsal')}
                </span>
              </div>
              
              {formData.personalInfo.invoiceType === 'bireysel' ? (
                <>
                  {formData.personalInfo.invoiceFullName && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">{language === 'en' ? 'Invoice Name:' : 'Fatura Adı:'}</span>
                      <span className="font-medium">{formData.personalInfo.invoiceFullName}</span>
                    </div>
                  )}
                  {formData.personalInfo.idNumber && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">{language === 'en' ? 'ID Number:' : 'TC Kimlik No:'}</span>
                      <span className="font-medium">{formData.personalInfo.idNumber}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {formData.personalInfo.invoiceCompanyName && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">{language === 'en' ? 'Company Name:' : 'Şirket Adı:'}</span>
                      <span className="font-medium">{formData.personalInfo.invoiceCompanyName}</span>
                    </div>
                  )}
                  {formData.personalInfo.taxOffice && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">{language === 'en' ? 'Tax Office:' : 'Vergi Dairesi:'}</span>
                      <span className="font-medium">{formData.personalInfo.taxOffice}</span>
                    </div>
                  )}
                  {formData.personalInfo.taxNumber && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">{language === 'en' ? 'Tax Number:' : 'Vergi No:'}</span>
                      <span className="font-medium">{formData.personalInfo.taxNumber}</span>
                    </div>
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
            onClick={handlePrint}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            {language === 'en' ? '🖨️ Print' : '🖨️ Yazdır'}
          </button>
        </div>
      </div>
    </div>
  )
}
