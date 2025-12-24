'use client'

import { useState, useEffect } from 'react'
import { useFormStore } from '@/store/formStore'
import { useDataStore } from '@/store/dataStore'
import { formatTurkishCurrency } from '@/lib/currencyUtils'
import { useTranslation } from '@/hooks/useTranslation'

interface Step2RegistrationSelectionProps {
  onNext: () => void
  onBack: () => void
}

interface Category {
  id: number
  name: string
  label_tr: string
  label_en: string
  description_tr?: string
  description_en?: string
  warning_message_tr?: string
  warning_message_en?: string
  icon?: string
  is_visible: boolean
  is_required: boolean
  allow_multiple: boolean
  display_order: number
}

interface RegistrationType {
  id: number
  value: string
  label: string
  label_en: string
  category_id: number
  fee_try: number
  fee_usd: number
  fee_eur: number
  vat_rate: number
  description?: string
  description_en?: string
  requires_document: boolean
  document_label?: string
  document_label_en?: string
  document_description?: string
  document_description_en?: string
}

export default function Step2RegistrationSelection({ onNext, onBack }: Step2RegistrationSelectionProps) {
  const { formData, updateRegistrationSelections, updateDocument } = useFormStore()
  const { registrationTypes, registrationTypesLoading, currencyType, earlyBird } = useDataStore()
  const { t, language } = useTranslation()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [selections, setSelections] = useState<Record<number, number[]>>({}) // category_id -> [type_ids]
  const [error, setError] = useState<string | null>(null)
  const [showPriceWithVat, setShowPriceWithVat] = useState(true)
  const [showEarlyBirdNotice, setShowEarlyBirdNotice] = useState(true)
  const [exchangeRates, setExchangeRates] = useState<{ USD: number; EUR: number }>({ USD: 1, EUR: 1 })

  // Döviz formatı
  const formatCurrency = (amount: number, currency: string = currencyType) => {
    if (currency === 'USD') {
      return `$${amount.toFixed(2)}`
    } else if (currency === 'EUR') {
      return `€${amount.toFixed(2)}`
    }
    return formatTurkishCurrency(amount)
  }

  // Erken kayıt fiyatını al (varsa ve aktifse)
  const getFee = (type: any) => {
    let baseFee = 0
    
    // Erken kayıt aktif mi ve bu tip için erken kayıt fiyatı var mı?
    if (earlyBird.isActive) {
      if (currencyType === 'USD' && type.early_bird_fee_usd != null) {
        baseFee = Number(type.early_bird_fee_usd)
      } else if (currencyType === 'EUR' && type.early_bird_fee_eur != null) {
        baseFee = Number(type.early_bird_fee_eur)
      } else if (currencyType === 'TRY' && type.early_bird_fee_try != null) {
        baseFee = Number(type.early_bird_fee_try)
      }
    }
    
    // Erken kayıt fiyatı yoksa normal fiyatı kullan
    if (baseFee === 0) {
      baseFee = Number(currencyType === 'USD' ? type.fee_usd : currencyType === 'EUR' ? type.fee_eur : type.fee_try)
    }
    
    return baseFee
  }

  // FormData'dan seçimleri yükle
  useEffect(() => {
    if (formData.registrationSelections && Object.keys(formData.registrationSelections).length > 0) {
      setSelections(formData.registrationSelections)
    }
  }, [formData.registrationSelections])

  // Kategorileri ve ayarları yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Kategorileri yükle
        const categoriesResponse = await fetch('/api/admin/categories')
        const categoriesData = await categoriesResponse.json()
        if (categoriesData.success) {
          const visibleCategories = categoriesData.data.filter((cat: Category) => cat.is_visible)
          setCategories(visibleCategories)
        }

        // Form ayarlarını yükle
        const settingsResponse = await fetch('/api/form-settings')
        const settingsData = await settingsResponse.json()
        if (settingsData.success) {
          const showVatSetting = settingsData.data.find((s: any) => s.setting_key === 'show_price_with_vat')
          if (showVatSetting) {
            setShowPriceWithVat(showVatSetting.setting_value === 'true')
          }
          
          const showEarlyBirdSetting = settingsData.data.find((s: any) => s.setting_key === 'show_early_bird_notice')
          if (showEarlyBirdSetting) {
            setShowEarlyBirdNotice(showEarlyBirdSetting.setting_value === 'true')
          }
        }

        // Kur bilgilerini yükle
        if (currencyType !== 'TRY') {
          const ratesResponse = await fetch('/api/admin/exchange-rates')
          const ratesData = await ratesResponse.json()
          if (ratesData.success && ratesData.rates) {
            const rates: any = {}
            ratesData.rates.forEach((rate: any) => {
              rates[rate.currency_code] = Number(rate.rate_to_try)
            })
            setExchangeRates(rates)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setCategoriesLoading(false)
      }
    }
    fetchData()
  }, [currencyType])

  // Kayıt türü seç/kaldır
  const toggleSelection = (categoryId: number, typeId: number, allowMultiple: boolean) => {
    setSelections(prev => {
      const categorySelections = prev[categoryId] || []
      
      if (allowMultiple) {
        // Çoklu seçim
        if (categorySelections.includes(typeId)) {
          return {
            ...prev,
            [categoryId]: categorySelections.filter(id => id !== typeId)
          }
        } else {
          return {
            ...prev,
            [categoryId]: [...categorySelections, typeId]
          }
        }
      } else {
        // Tekli seçim
        if (categorySelections.includes(typeId)) {
          return {
            ...prev,
            [categoryId]: []
          }
        } else {
          return {
            ...prev,
            [categoryId]: [typeId]
          }
        }
      }
    })
  }

  // Kategoriye göre kayıt türlerini getir
  const getTypesByCategory = (categoryId: number): any[] => {
    return registrationTypes.filter((type: any) => type.category_id === categoryId && type.is_active)
  }

  // Toplam hesapla
  const calculateTotal = () => {
    let total = 0
    Object.entries(selections).forEach(([categoryId, typeIds]) => {
      typeIds.forEach(typeId => {
        const type = registrationTypes.find((t: any) => t.id === typeId) as any
        if (type) {
          const fee = getFee(type)
          const vatRate = Number(type.vat_rate) || 0.20
          const vat = fee * vatRate
          const itemTotal = fee + vat
          total += itemTotal
        }
      })
    })
    return total
  }

  // İleri git
  const handleNext = () => {
    setError(null)
    
    // Zorunlu kategorileri kontrol et
    const requiredCategories = categories.filter(cat => cat.is_required)
    for (const category of requiredCategories) {
      if (!selections[category.id] || selections[category.id].length === 0) {
        setError(`${language === 'en' ? category.label_en : category.label_tr} seçimi zorunludur`)
        // Hata mesajını göstermek için sayfanın en üstüne scroll et
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    }

    // En az bir seçim yapılmalı
    const totalSelections = Object.values(selections).flat().length
    if (totalSelections === 0) {
      setError('En az bir kayıt türü seçmelisiniz')
      // Hata mesajını göstermek için sayfanın en üstüne scroll et
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Belge yükleme kontrolü
    const selectedTypeIds = Object.values(selections).flat()
    for (const typeId of selectedTypeIds) {
      const type = registrationTypes.find((t: any) => t.id === typeId) as any
      if (type && (type.requires_document === true || type.requires_document === 1)) {
        if (!formData.documents?.[typeId]) {
          const typeLabel = language === 'en' ? type.label_en : type.label
          setError(language === 'en' 
            ? `Please upload the required document for "${typeLabel}"`
            : `"${typeLabel}" için gerekli belgeyi yüklemeniz zorunludur`)
          
          // Scroll to the document upload section
          setTimeout(() => {
            const element = document.getElementById(`doc-upload-${typeId}`)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' })
              element.parentElement?.classList.add('ring-4', 'ring-red-500', 'ring-opacity-50')
              setTimeout(() => {
                element.parentElement?.classList.remove('ring-4', 'ring-red-500', 'ring-opacity-50')
              }, 2000)
            }
          }, 100)
          
          return
        }
      }
    }

    // Seçimleri kaydet
    updateRegistrationSelections(selections)
    onNext()
  }

  const loading = categoriesLoading || registrationTypesLoading

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {language === 'en' ? 'Registration Selection' : 'Kayıt Seçimi'}
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Kategoriler - Tümü Açık */}
      <div className="space-y-8 mb-6">
        {categories.map((category) => {
          const types = getTypesByCategory(category.id)
          const categorySelections = selections[category.id] || []
          
          return (
            <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-6">
              {/* Kategori Başlık */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  {category.icon && category.icon !== '0' && <span className="text-3xl">{category.icon}</span>}
                  <h3 className="text-xl font-bold text-gray-900 uppercase">
                    {language === 'en' ? category.label_en : category.label_tr}
                    {(category.is_required === true || (category as any).is_required === 1) && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  {categorySelections.length > 0 && (
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                      {categorySelections.length} {language === 'en' ? 'selected' : 'seçili'}
                    </span>
                  )}
                </div>
                {((language === 'en' ? category.description_en : category.description_tr) && 
                  (language === 'en' ? category.description_en : category.description_tr) !== '0') && (
                  <p className="text-sm text-gray-600">
                    {language === 'en' ? category.description_en : category.description_tr}
                  </p>
                )}
                
                {/* Kategori Uyarı Mesajı */}
                {(language === 'en' ? category.warning_message_en : category.warning_message_tr) && (
                  <div className="mt-3 bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-800 whitespace-pre-line">
                        {language === 'en' ? category.warning_message_en : category.warning_message_tr}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Kayıt Türleri - Tam Genişlik, Alt Alta */}
              {types.length === 0 ? (
                <p className="text-gray-500 text-sm">Bu kategoride aktif kayıt türü bulunmamaktadır</p>
              ) : (
                <div className="space-y-3">
                  {types.map((type) => {
                    const isSelected = categorySelections.includes(type.id)
                    const fee = getFee(type)
                    const vat = fee * Number(type.vat_rate || 0.20)
                    const total = fee + vat
                    
                    return (
                      <button
                        key={type.id}
                        onClick={() => toggleSelection(category.id, type.id, category.allow_multiple)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-primary-300'
                        }`}
                      >
                        {/* Masaüstü Görünümü */}
                        <div className="hidden md:flex items-center justify-between">
                          {/* Sol Taraf - Başlık ve Açıklama */}
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {language === 'en' ? type.label_en : type.label}
                              </h4>
                              {(type.requires_document === true || type.requires_document === 1) && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Belge gerekli
                                </span>
                              )}
                            </div>
                            {(language === 'en' ? type.description_en : type.description) && (
                              <p className="text-sm text-gray-600">
                                {language === 'en' ? type.description_en : type.description}
                              </p>
                            )}
                            
                            {/* Erken Kayıt Uyarısı */}
                            {showEarlyBirdNotice && earlyBird.isActive && earlyBird.deadline && (
                              <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                                {language === 'en' ? 'After' : ''}{' '}
                                <span className="font-medium">
                                  {new Date(earlyBird.deadline).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', { 
                                    day: 'numeric', 
                                    month: 'long', 
                                    year: 'numeric' 
                                  })}
                                </span>
                                {language === 'en' ? ', the fee will be' : ' tarihinden sonra ücret'}{' '}
                                <span className="font-semibold">
                                  {(() => {
                                    const normalFee = Number(currencyType === 'USD' ? type.fee_usd : currencyType === 'EUR' ? type.fee_eur : type.fee_try)
                                    const normalVat = normalFee * Number(type.vat_rate || 0.20)
                                    const normalTotal = normalFee + normalVat
                                    return formatCurrency(showPriceWithVat ? normalTotal : normalFee)
                                  })()}
                                </span>
                                {language === 'en' ? '.' : ' olacaktır.'}
                              </div>
                            )}
                          </div>
                          
                          {/* Orta - Fiyat Bilgisi */}
                          <div className="flex items-center px-6">
                            <div className="text-right">
                              <div className="text-sm text-gray-500 mb-1">
                                {language === 'en' 
                                  ? (showPriceWithVat ? 'Fee (VAT Included)' : 'Fee (VAT Excluded)')
                                  : (showPriceWithVat ? 'Ücret (KDV Dahil)' : 'Ücret (KDV Hariç)')}
                              </div>
                              <div className="text-2xl font-bold text-primary-600">
                                {formatCurrency(showPriceWithVat ? total : fee)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Sağ Taraf - Checkbox */}
                          <div className="flex-shrink-0 pl-4">
                            <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center ${
                              isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Mobil Görünümü */}
                        <div className="md:hidden">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-base mb-1">
                                {language === 'en' ? type.label_en : type.label}
                              </h4>
                              {(type.requires_document === true || type.requires_document === 1) && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Belge gerekli
                                </span>
                              )}
                            </div>
                            <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          
                          {(language === 'en' ? type.description_en : type.description) && (
                            <p className="text-sm text-gray-600 mb-3">
                              {language === 'en' ? type.description_en : type.description}
                            </p>
                          )}
                          
                          {/* Erken Kayıt Uyarısı */}
                          {showEarlyBirdNotice && earlyBird.isActive && earlyBird.deadline && (
                            <div className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                              {language === 'en' ? 'After' : ''}{' '}
                              <span className="font-medium">
                                {new Date(earlyBird.deadline).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', { 
                                  day: 'numeric', 
                                  month: 'long', 
                                  year: 'numeric' 
                                })}
                              </span>
                              {language === 'en' ? ', the fee will be' : ' tarihinden sonra ücret'}{' '}
                              <span className="font-semibold">
                                {(() => {
                                  const normalFee = Number(currencyType === 'USD' ? type.fee_usd : currencyType === 'EUR' ? type.fee_eur : type.fee_try)
                                  const normalVat = normalFee * Number(type.vat_rate || 0.20)
                                  const normalTotal = normalFee + normalVat
                                  return formatCurrency(showPriceWithVat ? normalTotal : normalFee)
                                })()}
                              </span>
                              {language === 'en' ? '.' : ' olacaktır.'}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <span className="text-xs text-gray-500">
                              {language === 'en' 
                                ? (showPriceWithVat ? 'Fee (VAT Included)' : 'Fee (VAT Excluded)')
                                : (showPriceWithVat ? 'Ücret (KDV Dahil)' : 'Ücret (KDV Hariç)')}
                            </span>
                            <span className="text-xl font-bold text-primary-600">
                              {formatCurrency(showPriceWithVat ? total : fee)}
                            </span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Seçimler Özeti */}
      {Object.values(selections).flat().length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'en' ? 'Your Selections' : 'Seçimleriniz'}
          </h3>
          
          <div className="space-y-4">
            {Object.entries(selections).map(([categoryId, typeIds]) => {
              if (typeIds.length === 0) return null
              
              const category = categories.find(c => c.id === Number(categoryId))
              if (!category) return null
              
              return (
                <div key={categoryId} className="border-b border-gray-100 pb-4 last:border-0">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 uppercase">
                    {language === 'en' ? category.label_en : category.label_tr}
                  </h4>
                  <div className="space-y-3">
                    {typeIds.map(typeId => {
                      const type = registrationTypes.find((t: any) => t.id === typeId) as any
                      if (!type) return null
                      
                      const fee = getFee(type)
                      const vatRate = Number(type.vat_rate) || 0.20
                      const vat = fee * vatRate
                      const total = fee + vat
                      
                      // TL karşılığı hesapla (döviz seçiliyse)
                      const exchangeRate = (exchangeRates as any)[currencyType] || 1
                      const tryTotal = currencyType !== 'TRY' ? total * exchangeRate : total
                      
                      return (
                        <div key={typeId} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {language === 'en' ? type.label_en : type.label}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatCurrency(fee)} + %{((type.vat_rate || 0.20) * 100).toFixed(0)} {language === 'en' ? 'VAT' : 'KDV'}
                              </p>
                              {currencyType !== 'TRY' && (
                                <p className="text-xs text-gray-500 mt-1">
                                  ≈ {formatTurkishCurrency(tryTotal)} {language === 'en' ? '(TRY equivalent)' : '(TL karşılığı)'}
                                </p>
                              )}
                            </div>
                            <p className="font-semibold text-gray-900 whitespace-nowrap">
                              {formatCurrency(total)}
                            </p>
                          </div>
                          
                          {/* Belge Yükleme */}
                          {(type.requires_document === true || type.requires_document === 1) && (
                            <div className="mt-3 pt-3 border-t-2 border-orange-200 bg-orange-50 rounded-lg p-4">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <label className="block text-sm font-semibold text-orange-900 mb-1">
                                    {language === 'en' ? 'Required Document' : 'Gerekli Belge'}
                                    <span className="text-red-600 ml-1">*</span>
                                  </label>
                                  <p className="text-xs text-orange-700 mb-2">
                                    {language === 'en' 
                                      ? 'Please upload the required document for this registration type (PDF, JPG, PNG)'
                                      : 'Bu kayıt türü için gerekli belgeyi yükleyin (PDF, JPG, PNG)'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="relative">
                                <input
                                  type="file"
                                  id={`doc-upload-${typeId}`}
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      updateDocument(typeId, file)
                                    }
                                  }}
                                  className="hidden"
                                />
                                <label
                                  htmlFor={`doc-upload-${typeId}`}
                                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border-2 border-dashed border-orange-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors"
                                >
                                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                  <span className="text-sm font-medium text-orange-700">
                                    {formData.documents?.[typeId] 
                                      ? 'Belgeyi Değiştir' 
                                      : 'Belge Yükle (PDF, JPG, PNG)'}
                                  </span>
                                </label>
                              </div>
                              
                              {formData.documents?.[typeId] && (
                                <div className="mt-3 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-green-900 truncate">
                                      {formData.documents[typeId].name}
                                    </p>
                                    <p className="text-xs text-green-700">
                                      {(formData.documents[typeId].size / 1024).toFixed(1)} KB
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      updateDocument(typeId, null)
                                    }}
                                    className="flex-shrink-0 text-red-600 hover:text-red-700"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Toplam */}
          <div className="mt-6 pt-4 border-t-2 border-gray-300">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-lg font-semibold text-gray-900 block">
                  {language === 'en' ? 'Total (VAT Included):' : 'Genel Toplam (KDV Dahil):'}
                </span>
                {currencyType !== 'TRY' && (
                  <span className="text-sm text-gray-500">
                    ≈ {formatTurkishCurrency(calculateTotal() * ((exchangeRates as any)[currencyType] || 1))} {language === 'en' ? '(TRY)' : '(TL)'}
                  </span>
                )}
              </div>
              <span className="text-2xl font-bold text-primary-600">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Butonlar */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {language === 'en' ? 'Back' : 'Geri'}
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {language === 'en' ? 'Continue' : 'Devam Et'}
        </button>
      </div>
    </div>
  )
}
