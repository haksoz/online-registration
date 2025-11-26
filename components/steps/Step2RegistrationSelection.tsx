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
  const { formData, updateRegistrationSelections } = useFormStore()
  const { registrationTypes, registrationTypesLoading, currencyType } = useDataStore()
  const { t, language } = useTranslation()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [selections, setSelections] = useState<Record<number, number[]>>({}) // category_id -> [type_ids]
  const [error, setError] = useState<string | null>(null)
  const [showPriceWithVat, setShowPriceWithVat] = useState(true)

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
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setCategoriesLoading(false)
      }
    }
    fetchData()
  }, [])

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
  const getTypesByCategory = (categoryId: number): RegistrationType[] => {
    return registrationTypes.filter((type: any) => type.category_id === categoryId && type.is_active)
  }

  // Toplam hesapla
  const calculateTotal = () => {
    let total = 0
    Object.entries(selections).forEach(([categoryId, typeIds]) => {
      typeIds.forEach(typeId => {
        const type = registrationTypes.find((t: any) => t.id === typeId)
        if (type) {
          const fee = Number(currencyType === 'USD' ? type.fee_usd : currencyType === 'EUR' ? type.fee_eur : type.fee_try)
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
        return
      }
    }

    // En az bir seçim yapılmalı
    const totalSelections = Object.values(selections).flat().length
    if (totalSelections === 0) {
      setError('En az bir kayıt türü seçmelisiniz')
      return
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
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {language === 'en' ? 'Registration Selection' : 'Kayıt Seçimi'}
      </h2>
      <p className="text-gray-600 mb-6">
        {language === 'en' 
          ? 'Select the registration types you want to register for' 
          : 'Kayıt olmak istediğiniz türleri seçin'}
      </p>

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
                    {(category.is_required === true || category.is_required === 1) && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  {categorySelections.length > 0 && (
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                      {categorySelections.length} seçili
                    </span>
                  )}
                </div>
                {((language === 'en' ? category.description_en : category.description_tr) && 
                  (language === 'en' ? category.description_en : category.description_tr) !== '0') && (
                  <p className="text-sm text-gray-600">
                    {language === 'en' ? category.description_en : category.description_tr}
                  </p>
                )}
              </div>

              {/* Kayıt Türleri - Tam Genişlik, Alt Alta */}
              {types.length === 0 ? (
                <p className="text-gray-500 text-sm">Bu kategoride aktif kayıt türü bulunmamaktadır</p>
              ) : (
                <div className="space-y-3">
                  {types.map((type) => {
                    const isSelected = categorySelections.includes(type.id)
                    const fee = currencyType === 'USD' ? type.fee_usd : currencyType === 'EUR' ? type.fee_eur : type.fee_try
                    const vat = fee * (type.vat_rate || 0.20)
                    const total = fee + vat
                    
                    return (
                      <button
                        key={type.id}
                        onClick={() => toggleSelection(category.id, type.id, category.allow_multiple)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center justify-between ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-primary-300'
                        }`}
                      >
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
                        </div>
                        
                        {/* Orta - Fiyat Bilgisi */}
                        <div className="flex items-center px-6">
                          <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">
                              {showPriceWithVat ? 'Ücret (KDV Dahil)' : 'Ücret (KDV Hariç)'}
                            </div>
                            <div className="text-2xl font-bold text-primary-600">
                              {formatTurkishCurrency(showPriceWithVat ? total : fee)}
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
                      const type = registrationTypes.find((t: any) => t.id === typeId)
                      if (!type) return null
                      
                      const fee = Number(currencyType === 'USD' ? type.fee_usd : currencyType === 'EUR' ? type.fee_eur : type.fee_try)
                      const vatRate = Number(type.vat_rate) || 0.20
                      const vat = fee * vatRate
                      const total = fee + vat
                      
                      return (
                        <div key={typeId} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {language === 'en' ? type.label_en : type.label}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatTurkishCurrency(fee)} + %{((type.vat_rate || 0.20) * 100).toFixed(0)} KDV
                              </p>
                            </div>
                            <p className="font-semibold text-gray-900 whitespace-nowrap">
                              {formatTurkishCurrency(total)}
                            </p>
                          </div>
                          
                          {/* Belge Yükleme */}
                          {(type.requires_document === true || type.requires_document === 1) && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {language === 'en' ? type.document_label_en || 'Required Document' : type.document_label || 'Gerekli Belge'}
                                <span className="text-red-500 ml-1">*</span>
                              </label>
                              {(language === 'en' ? type.document_description_en : type.document_description) && (
                                <p className="text-xs text-gray-500 mb-2">
                                  {language === 'en' ? type.document_description_en : type.document_description}
                                </p>
                              )}
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                              />
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
              <span className="text-lg font-semibold text-gray-900">
                {language === 'en' ? 'Total (VAT Included):' : 'Genel Toplam (KDV Dahil):'}
              </span>
              <span className="text-2xl font-bold text-primary-600">
                {formatTurkishCurrency(calculateTotal())}
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
