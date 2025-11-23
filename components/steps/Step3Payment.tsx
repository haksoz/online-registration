'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { paymentSchema, type PaymentFormData } from '@/schemas/validationSchemas'
import { useFormStore } from '@/store/formStore'
import { useDataStore } from '@/store/dataStore'
import { useEffect, useState } from 'react'

import { RegistrationType } from '@/types/registration'
import { formatTurkishCurrency } from '@/lib/currencyUtils'
import { getFormattedBankAccounts, getPaymentSettings } from '@/constants/bankInfo'
import { useFormSettings } from '@/hooks/useFormSettings'
import { useTranslation } from '@/hooks/useTranslation'

interface Step3PaymentProps {
  onNext: () => void
  onBack: () => void
}

export default function Step3Payment({ onNext, onBack }: Step3PaymentProps) {
  const { formData, updatePayment, setReferenceNumber } = useFormStore()
  const { getEnabledPaymentMethods, loading: settingsLoading } = useFormSettings()
  const { t, language } = useTranslation()
  const { 
    registrationTypes, 
    bankAccounts: storeBankAccounts, 
    paymentSettings: storePaymentSettings 
  } = useDataStore()
  
  // Ensure arrays
  const bankAccounts = Array.isArray(storeBankAccounts) ? storeBankAccounts : []
  const paymentSettings = storePaymentSettings || {}
  
  // Debug log
  console.log('💳 Step3 - Bank Accounts:', bankAccounts)
  console.log('⚙️ Step3 - Payment Settings:', paymentSettings)
  
  const enabledPaymentMethods = getEnabledPaymentMethods()

  // Eğer sadece 1 ödeme yöntemi aktifse, otomatik seç
  useEffect(() => {
    if (!settingsLoading && enabledPaymentMethods.length === 1 && !formData.payment.paymentMethod) {
      const singleMethod = enabledPaymentMethods[0]
      updatePayment({ paymentMethod: singleMethod.method_name as 'online' | 'bank_transfer' })
    }
  }, [settingsLoading, enabledPaymentMethods, formData.payment.paymentMethod, updatePayment])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: formData.payment.paymentMethod || undefined
    },
  })

  const paymentMethod = watch('paymentMethod')

  const [paymentError, setPaymentError] = useState<{ code: string; message: string } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setIsProcessing(true)
      setPaymentError(null)

      // Ödeme bilgilerini store'a kaydet (kart bilgileri dahil)
      updatePayment({ 
        paymentMethod: data.paymentMethod,
        cardHolderName: data.cardHolderName,
        cardNumber: data.cardNumber,
        cardExpiry: data.cardExpiry,
        cardCvv: data.cardCvv
      })

      // Tüm form verilerini al (Step1 ve Step2 verileri dahil)
      const formStore = useFormStore.getState()
      const completeFormData = formStore.formData

      // MySQL'e kayıt
      const response = await fetch('/api/saveForm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeFormData),
      })

      const result = await response.json()
      
      // Ödeme başarısız durumu (status 400)
      if (!response.ok && result.paymentResult) {
        setPaymentError({
          code: result.paymentResult.errorCode || 'ERROR',
          message: result.paymentResult.errorMessage || 'Ödeme başarısız oldu'
        })
        setIsProcessing(false)
        return
      }
      
      if (result.success && result.referenceNumber) {
        // Referans numarasını store'a kaydet
        setReferenceNumber(result.referenceNumber)
        
        // Online ödeme kontrolü
        if (data.paymentMethod === 'online' && result.paymentResult) {
          if (!result.paymentResult.success) {
            // Ödeme başarısız - hata göster
            setPaymentError({
              code: result.paymentResult.errorCode,
              message: result.paymentResult.errorMessage
            })
            setIsProcessing(false)
            return // Step4'e geçme
          }
        }
        
        // Başarılı - Step4'e geç
        onNext()
      } else {
        alert('Kayıt sırasında hata oluştu.')
        setIsProcessing(false)
      }
    } catch (error) {
      console.error(error)
      alert('Kayıt sırasında hata oluştu.')
      setIsProcessing(false)
    }
  }

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('step3.title')}</h2>
          <p className="text-sm text-gray-600">{t('step3.subtitle')}</p>
        </div>

        {/* Summary Section */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('step3.summary')}</h3>
          
          {/* Step 1 Summary */}
          <div className="mb-4 pb-4 border-b border-gray-300">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('step3.personalInfo')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">{t('step3.fullName')}:</span>
                <span className="ml-2 font-medium text-gray-900">{formData.personalInfo.fullName || `${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`.trim()}</span>
              </div>
              <div>
                <span className="text-gray-600">{t('step3.email')}:</span>
                <span className="ml-2 font-medium text-gray-900">{formData.personalInfo.email}</span>
              </div>
              <div>
                <span className="text-gray-600">{t('step3.phone')}:</span>
                <span className="ml-2 font-medium text-gray-900">{formData.personalInfo.phone}</span>
              </div>
              {formData.personalInfo.address && (
                <div className="md:col-span-2">
                  <span className="text-gray-600">{t('step3.address')}:</span>
                  <span className="ml-2 font-medium text-gray-900">{formData.personalInfo.address}</span>
                </div>
              )}
              {formData.personalInfo.company && (
                <div className="md:col-span-2">
                  <span className="text-gray-600">{t('step3.company')}:</span>
                  <span className="ml-2 font-medium text-gray-900">{formData.personalInfo.company}</span>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Information Summary */}
          <div className="mb-4 pb-4 border-b border-gray-300">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('step3.invoiceInfo')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">{t('step3.invoiceType')}:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formData.personalInfo.invoiceType === 'bireysel' ? t('step3.individual') : 
                   formData.personalInfo.invoiceType === 'kurumsal' ? t('step3.corporate') : '-'}
                </span>
              </div>
              
              {/* Bireysel Fatura Bilgileri */}
              {formData.personalInfo.invoiceType === 'bireysel' && (
                <>
                  {formData.personalInfo.invoiceFullName && (
                    <div>
                      <span className="text-gray-600">{t('step3.invoiceFullName')}:</span>
                      <span className="ml-2 font-medium text-gray-900">{formData.personalInfo.invoiceFullName}</span>
                    </div>
                  )}
                  {formData.personalInfo.idNumber && (
                    <div>
                      <span className="text-gray-600">{t('step3.idNumber')}:</span>
                      <span className="ml-2 font-medium text-gray-900">{formData.personalInfo.idNumber}</span>
                    </div>
                  )}
                  {formData.personalInfo.invoiceAddress && (
                    <div className="md:col-span-2">
                      <span className="text-gray-600">{t('step3.invoiceAddress')}:</span>
                      <span className="ml-2 font-medium text-gray-900">{formData.personalInfo.invoiceAddress}</span>
                    </div>
                  )}
                </>
              )}
              
              {/* Kurumsal Fatura Bilgileri */}
              {formData.personalInfo.invoiceType === 'kurumsal' && (
                <>
                  {formData.personalInfo.invoiceCompanyName && (
                    <div>
                      <span className="text-gray-600">{t('step3.invoiceCompanyName')}:</span>
                      <span className="ml-2 font-medium text-gray-900">{formData.personalInfo.invoiceCompanyName}</span>
                    </div>
                  )}
                  {formData.personalInfo.taxOffice && (
                    <div>
                      <span className="text-gray-600">{t('step3.taxOffice')}:</span>
                      <span className="ml-2 font-medium text-gray-900">{formData.personalInfo.taxOffice}</span>
                    </div>
                  )}
                  {formData.personalInfo.taxNumber && (
                    <div>
                      <span className="text-gray-600">{t('step3.taxNumber')}:</span>
                      <span className="ml-2 font-medium text-gray-900">{formData.personalInfo.taxNumber}</span>
                    </div>
                  )}
                  {formData.personalInfo.invoiceAddress && (
                    <div className="md:col-span-2">
                      <span className="text-gray-600">{t('step3.invoiceAddress')}:</span>
                      <span className="ml-2 font-medium text-gray-900">{formData.personalInfo.invoiceAddress}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Step 2 Summary - Seçimler */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              {language === 'en' ? 'Selected Registrations' : 'Seçilen Kayıtlar'}
            </h4>
            <div className="space-y-3">
              {selectedTypes.map((type: any) => {
                const fee = Number(type.fee_try || 0)
                const vatRate = Number(type.vat_rate) || 0.20
                const vat = fee * vatRate
                const total = fee + vat
                
                return (
                  <div key={type.id} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {language === 'en' ? type.label_en || type.label : type.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTurkishCurrency(fee)} + %{(vatRate * 100).toFixed(0)} KDV
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatTurkishCurrency(total)}
                      </p>
                    </div>
                  </div>
                )
              })}
              
              <div className="pt-3 border-t-2 border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">
                    {language === 'en' ? 'Total (VAT Included):' : 'Genel Toplam (KDV Dahil):'}
                  </span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatTurkishCurrency(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('step3.paymentMethod')} <span className="text-red-500">*</span>
          </label>
          
          {settingsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">{t('step3.loadingPaymentMethods')}</span>
            </div>
          ) : enabledPaymentMethods.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm font-medium">⚠️ {t('step3.noPaymentMethods')}</p>
              <p className="text-yellow-700 text-xs mt-1">{t('step3.contactAdmin')}</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${enabledPaymentMethods.length > 1 ? 'sm:grid-cols-2' : ''} gap-3`}>
              {enabledPaymentMethods.map((method) => (
                <label
                  key={method.method_name}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === method.method_name
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    value={method.method_name}
                    {...register('paymentMethod')}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 focus:ring-offset-2"
                  />
                  <span className="ml-3 mr-2 text-2xl">{method.icon}</span>
                  <span className="text-gray-700 font-medium">
                    {language === 'en' 
                      ? method.method_label_en || 
                        (method.method_name === 'online' ? 'Online Payment' : 
                         method.method_name === 'bank_transfer' ? 'Bank Transfer' : method.method_label)
                      : method.method_label}
                  </span>
                </label>
              ))}
            </div>
          )}
          {errors.paymentMethod && (
            <p className="mt-1.5 text-sm text-red-600">{errors.paymentMethod.message}</p>
          )}
        </div>

        {/* Online Payment Form */}
        {paymentMethod === 'online' && (
          <div className="space-y-6 mb-6">
            {/* Payment Error Message */}
            {paymentError && (
              <div className="bg-red-50 rounded-lg p-6 border-2 border-red-300 animate-pulse">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-900 mb-2">❌ Ödeme Başarısız</h3>
                    <div className="bg-white rounded border border-red-200 p-4 mb-3">
                      <p className="text-sm font-semibold text-red-800 mb-1">Hata Kodu: {paymentError.code}</p>
                      <p className="text-base font-bold text-red-900">{paymentError.message}</p>
                    </div>
                    <p className="text-sm text-red-800">
                      {t('step3.checkCardInfo')}
                    </p>
                    <button
                      type="button"
                      onClick={() => setPaymentError(null)}
                      className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Tekrar Dene
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Test Mode Banner - Show when test mode is enabled */}
            {process.env.NEXT_PUBLIC_PAYMENT_TEST_MODE === 'true' && (
              <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-300">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-yellow-800 font-bold">🧪 TEST MODU</p>
                    <p className="text-xs text-yellow-700 mt-1 mb-2">
                      Aşağıdaki test kartlarını kullanabilirsiniz:
                    </p>
                    <div className="bg-white rounded border border-yellow-200 p-3 text-xs space-y-2">
                      <div>
                        <p className="font-semibold text-gray-800 mb-1">{t('step3.testCardNumber')}</p>
                        <p className="font-mono text-gray-900 text-sm">4546 7112 3456 7894</p>
                        <p className="text-gray-600">{t('step3.testExpiry')}</p>
                      </div>
                      <div className="pt-2 border-t border-yellow-200">
                        <p className="font-semibold text-gray-800 mb-1">{t('step3.testCvvCodes')}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="font-mono text-green-700">000 - ✅ Başarılı</p>
                            <p className="font-mono text-red-700">120 - ❌ Geçersiz İşlem</p>
                            <p className="font-mono text-red-700">130 - ❌ Geçersiz Tutar</p>
                          </div>
                          <div>
                            <p className="font-mono text-red-700">340 - ❌ Fraud Şüphesi</p>
                            <p className="font-mono text-red-700">370 - ❌ Çalıntı Kart</p>
                            <p className="font-mono text-red-700">510 - ❌ Limit Yetersiz</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info Banner */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-800 font-medium">{t('step3.securePayment')}</p>
                  <p className="text-xs text-blue-700 mt-1">
                    {t('step3.securePaymentDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Information Form */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                {t('step3.cardInfo')}
              </h3>
              
              <div className="space-y-4">
                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('step3.cardHolderName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('cardHolderName')}
                    placeholder="Kart üzerindeki isim"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase"
                    maxLength={50}
                  />
                  {errors.cardHolderName && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.cardHolderName.message}</p>
                  )}
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('step3.cardNumber')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('cardNumber')}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                    maxLength={19}
                    onChange={(e) => {
                      // Format card number with spaces
                      let value = e.target.value.replace(/\s/g, '')
                      value = value.replace(/(\d{4})/g, '$1 ').trim()
                      e.target.value = value
                    }}
                  />
                  {errors.cardNumber && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.cardNumber.message}</p>
                  )}
                  <div className="flex items-center mt-2 space-x-2">
                    <img src="/images/visa.svg" alt="Visa" className="h-6" onError={(e) => e.currentTarget.style.display = 'none'} />
                    <img src="/images/mastercard.svg" alt="Mastercard" className="h-6" onError={(e) => e.currentTarget.style.display = 'none'} />
                    <span className="text-xs text-gray-500">Visa, Mastercard kabul edilir</span>
                  </div>
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('step3.cardExpiry')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('cardExpiry')}
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                      maxLength={5}
                      onChange={(e) => {
                        // Format expiry date
                        let value = e.target.value.replace(/\D/g, '')
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4)
                        }
                        e.target.value = value
                      }}
                    />
                    {errors.cardExpiry && (
                      <p className="mt-1.5 text-sm text-red-600">{errors.cardExpiry.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('step3.cvv')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('cardCvv')}
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                      maxLength={4}
                      onChange={(e) => {
                        // Only numbers
                        e.target.value = e.target.value.replace(/\D/g, '')
                      }}
                    />
                    {errors.cardCvv && (
                      <p className="mt-1.5 text-sm text-red-600">{errors.cardCvv.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{t('step3.cvvHelp')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <p className="text-sm text-green-800 font-medium">{t('step3.sslEncryption')}</p>
                  <p className="text-xs text-green-700 mt-1">
                    {t('step3.sslEncryptionDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bank Transfer Information */}
        {paymentMethod === 'bank_transfer' && (
          <div className="space-y-4 mb-6">
            {/* Banka Hesapları */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('step3.bankAccounts')}</h3>
              <div className="space-y-4">
                {bankAccounts
                  .filter(account => account.currency === 'TRY')
                  .map((account, index) => (
                  <div key={account.id} className={`${index > 0 ? 'pt-4 border-t border-blue-200' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800">
                        {language === 'en' ? account.account_name_en || account.account_name : account.account_name}
                      </h4>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {account.currency}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex flex-col sm:flex-row">
                        <span className="font-medium text-gray-700 sm:w-32">{t('step3.bank')}:</span>
                        <span className="text-gray-900">{account.bank_name}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row">
                        <span className="font-medium text-gray-700 sm:w-32">{t('step3.accountHolder')}:</span>
                        <span className="text-gray-900">{account.account_holder}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row">
                        <span className="font-medium text-gray-700 sm:w-32">IBAN:</span>
                        <span className="text-gray-900 font-mono">{account.iban}</span>
                      </div>
                      {account.description && (
                        <div className="flex flex-col sm:flex-row">
                          <span className="font-medium text-gray-700 sm:w-32">{t('step3.description')}:</span>
                          <span className="text-gray-600">{account.description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dekont Bilgisi */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">
                    {language === 'en' 
                      ? ((paymentSettings as any).dekontMessageEn || (paymentSettings as any).dekontMessage)?.replace('{email}', (paymentSettings as any).dekontEmail) || 
                        `Please send your receipt to ${(paymentSettings as any).dekontEmail || 'dekont@example.com'}.`
                      : (paymentSettings as any).dekontMessage?.replace('{email}', (paymentSettings as any).dekontEmail) || 
                        'Lütfen dekontunuzu dekont@example.com adresine iletiniz.'}
                  </span>
                </p>
              </div>
            </div>
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
            disabled={isProcessing}
            className="px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                İşleniyor...
              </>
            ) : (
              t('common.next')
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

