'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accommodationSchema, type AccommodationFormData } from '@/schemas/validationSchemas'
import { useFormStore } from '@/store/formStore'
import { useEffect, useState } from 'react'

import { RegistrationType } from '@/types/registration'
import { formatTurkishCurrency } from '@/lib/currencyUtils'
import { useTranslation } from '@/hooks/useTranslation'

interface Step2AccommodationProps {
  onNext: () => void
  onBack: () => void
}

export default function Step2Accommodation({ onNext, onBack }: Step2AccommodationProps) {
  const { formData, updateAccommodation } = useFormStore()
  const { t, language, loading: translationLoading } = useTranslation()
  const [registrationTypes, setRegistrationTypes] = useState<RegistrationType[]>([])
  const [currencyType, setCurrencyType] = useState('TRY')
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch registration types
      const typesResponse = await fetch('/api/registration-types')
      const typesData = await typesResponse.json()
      
      if (!typesData.success) {
        setError('Kayıt türleri yüklenirken hata oluştu')
        return
      }
      
      setRegistrationTypes(typesData.data)
      
      // Fetch form settings (currency type)
      const settingsResponse = await fetch('/api/form-settings')
      const settingsData = await settingsResponse.json()
      
      if (settingsData.success && settingsData.step2Settings) {
        setCurrencyType(settingsData.step2Settings.currency_type || 'TRY')
      }
      
      // Fetch exchange rates
      const ratesResponse = await fetch('/api/admin/exchange-rates')
      const ratesData = await ratesResponse.json()
      
      if (ratesData.success) {
        const rates: Record<string, number> = {}
        ratesData.rates.forEach((rate: any) => {
          rates[rate.currency_code] = rate.rate_to_try
        })
        setExchangeRates(rates)
      }
      
      setError(null)
    } catch (err) {
      setError('Bağlantı hatası oluştu')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AccommodationFormData>({
    resolver: zodResolver(accommodationSchema),
    defaultValues: formData.accommodation,
  })

  useEffect(() => {
    const subscription = watch((data) => {
      updateAccommodation(data)
    })
    return () => subscription.unsubscribe()
  }, [watch, updateAccommodation])

  const onSubmit = (data: AccommodationFormData) => {
    const selectedRegistrationType = registrationTypes.find(t => t.value === data.registrationType)
    
    if (selectedRegistrationType) {
      const feeInSelectedCurrency = getFeeInCurrency(selectedRegistrationType)
      const feeInTRY = currencyType === 'TRY' 
        ? feeInSelectedCurrency 
        : feeInSelectedCurrency * (exchangeRates[currencyType] || 1)
      
      // Store'a kaydet (label'ları da ekle)
      updateAccommodation({
        ...data,
        registrationTypeLabel: selectedRegistrationType.label,
        registrationTypeLabelEn: (selectedRegistrationType as any).label_en || selectedRegistrationType.label,
        selectedCurrency: currencyType,
        feeInCurrency: feeInSelectedCurrency,
        feeInTRY: feeInTRY,
        exchangeRate: exchangeRates[currencyType] || 1
      } as any)
    } else {
      updateAccommodation(data)
    }
    
    onNext()
  }

  const selectedType = watch('registrationType')

  const getFeeInCurrency = (type: RegistrationType): number => {
    if (currencyType === 'TRY') {
      return type.fee_try
    } else if (currencyType === 'USD') {
      return type.fee_usd
    } else if (currencyType === 'EUR') {
      return type.fee_eur
    }
    return type.fee_try
  }

  const formatFee = (type: RegistrationType): string => {
    const fee = Number(getFeeInCurrency(type))
    
    if (currencyType === 'TRY') {
      return formatTurkishCurrency(fee)
    } else if (currencyType === 'USD') {
      return `$${fee.toFixed(2)}`
    } else if (currencyType === 'EUR') {
      return `€${fee.toFixed(2)}`
    }
    return formatTurkishCurrency(fee)
  }

  const getCurrencySymbol = (): string => {
    if (currencyType === 'USD') return '$'
    if (currencyType === 'EUR') return '€'
    return '₺'
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('step2.title')}</h2>
            <p className="text-sm text-gray-600">{language === 'en' ? 'Loading registration types...' : 'Kayıt türleri yükleniyor...'}</p>
          </div>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
            <div className="h-16 bg-gray-200 rounded-lg"></div>
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Kayıt Türü Seçimi</h2>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('step2.title')}</h2>
          <p className="text-sm text-gray-600">{t('step2.subtitle')}</p>
        </div>

        {/* Currency Info */}
        {currencyType !== 'TRY' && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Fiyatlar <strong>{currencyType}</strong> cinsinden gösterilmektedir. Ödeme TL olarak yapılacaktır.</span>
            </div>
          </div>
        )}

        {/* Registration Type Options */}
        <div className="space-y-3 mb-6">
          {registrationTypes.map((option) => (
            <label
              key={option.value}
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedType === option.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                value={option.value}
                {...register('registrationType')}
                className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500 focus:ring-offset-2"
              />
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-medium">
                    {language === 'en' ? option.label_en || option.label : option.label}
                  </span>
                  <span className="text-lg font-bold text-primary-600">{formatFee(option)}</span>
                </div>
                {(language === 'en' ? option.description_en || option.description : option.description) && (
                  <p className="mt-1 text-sm text-gray-600">
                    {language === 'en' ? option.description_en || option.description : option.description}
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>

        {/* Error Message */}
        {errors.registrationType && (
          <div className="mb-6">
            <p className="text-sm text-red-600">{errors.registrationType.message}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors shadow-sm hover:shadow-md"
          >
            {t('common.back')}
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-sm hover:shadow-md"
          >
            {t('common.next')}
          </button>
        </div>
      </div>
    </form>
  )
}

