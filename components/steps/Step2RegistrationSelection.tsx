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
  const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({})
  const [selections, setSelections] = useState<Record<number, number[]>>({}) // category_id -> [type_ids]
  const [error, setError] = useState<string | null>(null)

  // Kategorileri yükle
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories')
        const data = await response.json()
        if (data.success) {
          const visibleCategories = data.data.filter((cat: Category) => cat.is_visible)
          setCategories(visibleCategories)
          
          // İlk kategoriyi aç
          if (visibleCategories.length > 0) {
            setOpenCategories({ [visibleCategories[0].id]: true })
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setCategoriesLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Kategori aç/kapa
  const toggleCategory = (categoryId: number) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

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
          const fee = currencyType === 'USD' ? type.fee_usd : currencyType === 'EUR' ? type.fee_eur : type.fee_try
          const vat = fee * (type.vat_rate || 0.20)
          total += fee + vat
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

      {/* Kategoriler */}
      <div className="space-y-4 mb-6">
        {categories.map((category) => {
          const types = getTypesByCategory(category.id)
          const isOpen = openCategories[category.id]
          const categorySelections = selections[category.id] || []
          
          return (
            <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Kategori Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {category.icon && <span className="text-2xl">{category.icon}</span>}
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">
                      {language === 'en' ? category.label_en : category.label_tr}
                      {category.is_required && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                    {(language === 'en' ? category.description_en : category.description_tr) && (
                      <p className="text-sm text-gray-500">
                        {language === 'en' ? category.description_en : category.description_tr}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {categorySelections.length > 0 && (
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                      {categorySelections.length} seçili
                    </span>
                  )}
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Kategori İçeriği */}
              {isOpen && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  {types.length === 0 ? (
                    <p className="text-gray-500 text-sm">Bu kategoride aktif kayıt türü bulunmamaktadır</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {types.map((type) => {
                        const isSelected = categorySelections.includes(type.id)
                        const fee = currencyType === 'USD' ? type.fee_usd : currencyType === 'EUR' ? type.fee_eur : type.fee_try
                        const vat = fee * (type.vat_rate || 0.20)
                        const total = fee + vat
                        
                        return (
                          <button
                            key={type.id}
                            onClick={() => toggleSelection(category.id, type.id, category.allow_multiple)}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                              isSelected
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900">
                                {language === 'en' ? type.label_en : type.label}
                              </h4>
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            {(language === 'en' ? type.description_en : type.description) && (
                              <p className="text-sm text-gray-600 mb-2">
                                {language === 'en' ? type.description_en : type.description}
                              </p>
                            )}
                            <div className="text-sm text-gray-500">
                              <div>Ücret: {formatTurkishCurrency(fee)}</div>
                              <div>KDV: {formatTurkishCurrency(vat)}</div>
                              <div className="font-semibold text-gray-900 mt-1">
                                Toplam: {formatTurkishCurrency(total)}
                              </div>
                            </div>
                            {type.requires_document && (
                              <div className="mt-2 text-xs text-orange-600 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Belge gerekli
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Toplam */}
      {Object.values(selections).flat().length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Genel Toplam (KDV Dahil):</span>
            <span className="text-2xl font-bold text-primary-600">
              {formatTurkishCurrency(calculateTotal())}
            </span>
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
