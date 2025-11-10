'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type PersonalInfoFormData } from '@/schemas/validationSchemas'
import { buildPersonalInfoSchema } from '@/schemas/dynamicValidationSchema'
import { useFormStore } from '@/store/formStore'
import { useEffect, useMemo } from 'react'
import { InternationalPhoneInput } from '@/components/ui/InternationalPhoneInput'
import { TCIdInput } from '@/components/ui/TCIdInput'
import { useFormSettings } from '@/hooks/useFormSettings'
import { useTranslation } from '@/hooks/useTranslation'

interface Step1PersonalInfoProps {
  onNext: () => void
}

export default function Step1PersonalInfo({ onNext }: Step1PersonalInfoProps) {
  const { formData, updatePersonalInfo, setFormLanguage } = useFormStore()
  const { fields, isFieldVisible, isFieldRequired, loading: settingsLoading } = useFormSettings()
  const { t, language, canChangeLanguage, changeLanguage, loading: translationLoading } = useTranslation()

  // Dil değiştiğinde store'u güncelle
  useEffect(() => {
    setFormLanguage(language)
  }, [language, setFormLanguage])

  // Dinamik validation schema oluştur
  const validationSchema = useMemo(() => {
    if (fields.length === 0) return null
    return buildPersonalInfoSchema(fields)
  }, [fields])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PersonalInfoFormData>({
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
    defaultValues: {
      ...formData.personalInfo,
      gender: formData.personalInfo.gender || undefined,
      invoiceType: formData.personalInfo.invoiceType || undefined
    },
  })

  const invoiceType = watch('invoiceType')

  useEffect(() => {
    const subscription = watch((data) => {
      updatePersonalInfo(data as Partial<PersonalInfoFormData>)
    })
    return () => subscription.unsubscribe()
  }, [watch, updatePersonalInfo])

  const onSubmit = (data: PersonalInfoFormData) => {
    updatePersonalInfo(data)
    onNext()
  }

  if (settingsLoading || translationLoading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('step1.title')}</h2>
              <p className="text-sm text-gray-600">{t('step1.subtitle')}</p>
            </div>
            
            {/* Language Switcher */}
            {canChangeLanguage && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => changeLanguage('tr')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    language === 'tr'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🇹🇷 TR
                </button>
                <button
                  type="button"
                  onClick={() => changeLanguage('en')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    language === 'en'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🇬🇧 EN
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {/* First Name and Last Name */}
          {(isFieldVisible('firstName') || isFieldVisible('lastName')) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isFieldVisible('firstName') && (
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('step1.firstName')} {isFieldRequired('firstName') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    {...register('firstName')}
                    className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                      errors.firstName
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                    }`}
                    placeholder="Ahmet"
                  />
                  {errors.firstName && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>
              )}

              {isFieldVisible('lastName') && (
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Soyad {isFieldRequired('lastName') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    {...register('lastName')}
                    className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                      errors.lastName
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                    }`}
                    placeholder="Yılmaz"
                  />
                  {errors.lastName && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Gender */}
          {isFieldVisible('gender') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cinsiyet {isFieldRequired('gender') && <span className="text-red-500">*</span>}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:border-primary-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                  <input
                    type="radio"
                    value="male"
                    {...register('gender')}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Erkek</span>
                </label>
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:border-primary-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                  <input
                    type="radio"
                    value="female"
                    {...register('gender')}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Kadın</span>
                </label>
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:border-primary-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                  <input
                    type="radio"
                    value="other"
                    {...register('gender')}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Diğer</span>
                </label>
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:border-primary-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                  <input
                    type="radio"
                    value="prefer_not_to_say"
                    {...register('gender')}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Belirtmek İstemiyorum</span>
                </label>
              </div>
              {errors.gender && (
                <p className="mt-1.5 text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>
          )}

          {/* Email and Phone */}
          {(isFieldVisible('email') || isFieldVisible('phone')) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isFieldVisible('email') && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta {isFieldRequired('email') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                      errors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                    }`}
                    placeholder="ornek@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              )}

              {isFieldVisible('phone') && (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon {isFieldRequired('phone') && <span className="text-red-500">*</span>}
                  </label>
                  <InternationalPhoneInput
                    id="phone"
                    value={watch('phone') || ''}
                    onChange={(value) => {
                      setValue('phone', value, { shouldValidate: true })
                      updatePersonalInfo({ phone: value })
                    }}
                    error={errors.phone?.message}
                    placeholder="Telefon numarası"
                  />
                </div>
              )}
            </div>
          )}

          {/* Address */}
          {isFieldVisible('address') && (
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Adres {isFieldRequired('address') && <span className="text-red-500">*</span>}
              </label>
              <input
                id="address"
                type="text"
                {...register('address')}
                className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                  errors.address
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                }`}
                placeholder="Örnek Cadde No:123, İstanbul"
              />
              {errors.address && (
                <p className="mt-1.5 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>
          )}

          {/* Company and Department */}
          {(isFieldVisible('company') || isFieldVisible('department')) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isFieldVisible('company') && (
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Şirket/Kurum {!isFieldRequired('company') && <span className="text-gray-400 text-xs">(Opsiyonel)</span>}
                    {isFieldRequired('company') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id="company"
                    type="text"
                    {...register('company')}
                    className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                      errors.company
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                    }`}
                    placeholder="Örnek Şirket A.Ş."
                  />
                  {errors.company && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.company.message}</p>
                  )}
                </div>
              )}

              {isFieldVisible('department') && (
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Departman {!isFieldRequired('department') && <span className="text-gray-400 text-xs">(Opsiyonel)</span>}
                    {isFieldRequired('department') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id="department"
                    type="text"
                    {...register('department')}
                    className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                      errors.department
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                    }`}
                    placeholder="İnsan Kaynakları"
                  />
                  {errors.department && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.department.message}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Invoice Type */}
          {isFieldVisible('invoiceType') && (
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Fatura Türü {isFieldRequired('invoiceType') && <span className="text-red-500">*</span>}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:border-primary-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                  <input
                    type="radio"
                    value="bireysel"
                    {...register('invoiceType')}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 focus:ring-offset-2"
                  />
                  <span className="ml-3 text-gray-700 font-medium">Bireysel</span>
                </label>
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:border-primary-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                  <input
                    type="radio"
                    value="kurumsal"
                    {...register('invoiceType')}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 focus:ring-offset-2"
                  />
                  <span className="ml-3 text-gray-700 font-medium">Kurumsal</span>
                </label>
              </div>
              {errors.invoiceType && (
                <p className="mt-1.5 text-sm text-red-600">{errors.invoiceType.message}</p>
              )}
            </div>
          )}

          {/* Bireysel Invoice Fields */}
          {invoiceType === 'bireysel' && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Bireysel Fatura Bilgileri</h3>
              
              {isFieldVisible('invoiceFullName') && (
                <div>
                  <label htmlFor="invoiceFullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Fatura Ad Soyad {isFieldRequired('invoiceFullName') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id="invoiceFullName"
                    type="text"
                    {...register('invoiceFullName')}
                    className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                      errors.invoiceFullName
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                    }`}
                    placeholder="Ad Soyad"
                  />
                  {errors.invoiceFullName && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.invoiceFullName.message}</p>
                  )}
                </div>
              )}

              {isFieldVisible('idNumber') && (
                <div>
                  <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    TC Kimlik No {isFieldRequired('idNumber') && <span className="text-red-500">*</span>}
                  </label>
                  <TCIdInput
                    id="idNumber"
                    value={watch('idNumber') || ''}
                    onChange={(value) => {
                      setValue('idNumber', value, { shouldValidate: true })
                      updatePersonalInfo({ idNumber: value })
                    }}
                    error={errors.idNumber?.message}
                    placeholder="12345678901"
                  />
                </div>
              )}

              {isFieldVisible('invoiceAddress') && (
                <div>
                  <label htmlFor="invoiceAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Fatura Adresi {isFieldRequired('invoiceAddress') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id="invoiceAddress"
                    type="text"
                    {...register('invoiceAddress')}
                    className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                      errors.invoiceAddress
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                    }`}
                    placeholder="Fatura adresi"
                  />
                  {errors.invoiceAddress && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.invoiceAddress.message}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Kurumsal Invoice Fields */}
          {invoiceType === 'kurumsal' && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Kurumsal Fatura Bilgileri</h3>
              
              {isFieldVisible('invoiceCompanyName') && (
                <div>
                  <label htmlFor="invoiceCompanyName" className="block text-sm font-medium text-gray-700 mb-2">
                    Şirket Adı {isFieldRequired('invoiceCompanyName') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id="invoiceCompanyName"
                    type="text"
                    {...register('invoiceCompanyName')}
                    className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                      errors.invoiceCompanyName
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                    }`}
                    placeholder="Şirket Adı"
                  />
                  {errors.invoiceCompanyName && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.invoiceCompanyName.message}</p>
                  )}
                </div>
              )}

              {isFieldVisible('invoiceAddress') && (
                <div>
                  <label htmlFor="invoiceAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Fatura Adresi {isFieldRequired('invoiceAddress') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id="invoiceAddress"
                    type="text"
                    {...register('invoiceAddress')}
                    className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                      errors.invoiceAddress
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                    }`}
                    placeholder="Fatura adresi"
                  />
                  {errors.invoiceAddress && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.invoiceAddress.message}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isFieldVisible('taxOffice') && (
                  <div>
                    <label htmlFor="taxOffice" className="block text-sm font-medium text-gray-700 mb-2">
                      Vergi Dairesi {isFieldRequired('taxOffice') && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      id="taxOffice"
                      type="text"
                      {...register('taxOffice')}
                      className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                        errors.taxOffice
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                      }`}
                      placeholder="Kadıköy"
                    />
                    {errors.taxOffice && (
                      <p className="mt-1.5 text-sm text-red-600">{errors.taxOffice.message}</p>
                    )}
                  </div>
                )}

                {isFieldVisible('taxNumber') && (
                  <div>
                    <label htmlFor="taxNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Vergi No {isFieldRequired('taxNumber') && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      id="taxNumber"
                      type="text"
                      {...register('taxNumber')}
                      className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                        errors.taxNumber
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                      }`}
                      placeholder="1234567890"
                    />
                    {errors.taxNumber && (
                      <p className="mt-1.5 text-sm text-red-600">{errors.taxNumber.message}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          >
            {t('common.next')}
          </button>
        </div>
      </div>
    </form>
  )
}
