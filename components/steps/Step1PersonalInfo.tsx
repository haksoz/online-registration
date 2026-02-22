'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type PersonalInfoFormData } from '@/schemas/validationSchemas'
import { buildPersonalInfoSchema } from '@/schemas/dynamicValidationSchema'
import { useFormStore } from '@/store/formStore'
import { useEffect, useMemo, useState } from 'react'
import { InternationalPhoneInput } from '@/components/ui/InternationalPhoneInput'
import { TCIdInput } from '@/components/ui/TCIdInput'
import { useFormSettings } from '@/hooks/useFormSettings'
import { useTranslation } from '@/hooks/useTranslation'
import { COUNTRY_OPTIONS } from '@/constants/countries'

interface Step1PersonalInfoProps {
  onNext: () => void
}

export default function Step1PersonalInfo({ onNext }: Step1PersonalInfoProps) {
  const { formData, updatePersonalInfo, setFormLanguage } = useFormStore()
  const { fields, isFieldVisible, isFieldRequired, getFieldSetting, invoiceIndividualNote, invoiceCorporateNote, invoiceIndividualNoteEn, invoiceCorporateNoteEn, kvkkPopupTr, kvkkPopupEn, loading: settingsLoading } = useFormSettings()
  const { t, language, canChangeLanguage, changeLanguage, loading: translationLoading } = useTranslation()
  const [usePersonalName, setUsePersonalName] = useState(false)
  const [kvkkModalOpen, setKvkkModalOpen] = useState(false)

  // Dil değiştiğinde store'u güncelle
  useEffect(() => {
    setFormLanguage(language)
  }, [language, setFormLanguage])

  // Dinamik validation schema oluştur
  const validationSchema = useMemo(() => {
    if (fields.length === 0) return null
    return buildPersonalInfoSchema(fields, language)
  }, [fields, language])

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
      invoiceType: formData.personalInfo.invoiceType || undefined,
      kvkk_consent: formData.personalInfo.kvkk_consent ?? false,
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
                  onClick={() => {
                    changeLanguage('tr')
                    setFormLanguage('tr')
                  }}
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
                  onClick={() => {
                    changeLanguage('en')
                    setFormLanguage('en')
                  }}
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
                    placeholder={t('step1.placeholders.firstName')}
                  />
                  {errors.firstName && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>
              )}

              {isFieldVisible('lastName') && (
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('step1.lastName')} {isFieldRequired('lastName') && <span className="text-red-500">*</span>}
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
                    placeholder={t('step1.placeholders.lastName')}
                  />
                  {errors.lastName && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Email and Phone */}
          {(isFieldVisible('email') || isFieldVisible('phone')) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isFieldVisible('email') && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('step1.email')} {isFieldRequired('email') && <span className="text-red-500">*</span>}
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
                    placeholder={t('step1.placeholders.email')}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              )}

              {isFieldVisible('phone') && (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('step1.phone')} {isFieldRequired('phone') && <span className="text-red-500">*</span>}
                  </label>
                  <InternationalPhoneInput
                    id="phone"
                    value={watch('phone') || ''}
                    onChange={(value) => {
                      setValue('phone', value, { shouldValidate: true })
                      updatePersonalInfo({ phone: value })
                    }}
                    error={errors.phone?.message}
                    placeholder={t('step1.placeholders.phone')}
                  />
                </div>
              )}
            </div>
          )}

          {/* Gender */}
          {isFieldVisible('gender') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('step1.gender')} {isFieldRequired('gender') && <span className="text-red-500">*</span>}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:border-primary-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                  <input
                    type="radio"
                    value="male"
                    {...register('gender')}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{t('step1.male')}</span>
                </label>
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:border-primary-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                  <input
                    type="radio"
                    value="female"
                    {...register('gender')}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{t('step1.female')}</span>
                </label>
              </div>
              {errors.gender && (
                <p className="mt-1.5 text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>
          )}

          {/* Country (Ülke) - cinsiyetten sonra */}
          {isFieldVisible('country') && (
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                {t('step1.country')} {isFieldRequired('country') && <span className="text-red-500">*</span>}
              </label>
              <select
                id="country"
                {...register('country')}
                className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                  errors.country
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                }`}
              >
                <option value="">{t('step1.placeholders.country')}</option>
                {COUNTRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {language === 'en' ? opt.labelEn : opt.label}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="mt-1.5 text-sm text-red-600">{errors.country.message}</p>
              )}
            </div>
          )}

          {/* Address */}
          {isFieldVisible('address') && (
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                {t('step1.address')} {isFieldRequired('address') && <span className="text-red-500">*</span>}
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
                placeholder={t('step1.placeholders.address')}
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
                    {t('step1.company')} {!isFieldRequired('company') && <span className="text-gray-400 text-xs">({t('step1.optional')})</span>}
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
                    placeholder={t('step1.placeholders.company')}
                  />
                  {errors.company && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.company.message}</p>
                  )}
                </div>
              )}

              {isFieldVisible('department') && (
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('step1.department')} {!isFieldRequired('department') && <span className="text-gray-400 text-xs">({t('step1.optional')})</span>}
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
                    placeholder={t('step1.placeholders.department')}
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
                {t('step1.invoiceType')} {isFieldRequired('invoiceType') && <span className="text-red-500">*</span>}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:border-primary-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                  <input
                    type="radio"
                    value="bireysel"
                    {...register('invoiceType')}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 focus:ring-offset-2"
                  />
                  <span className="ml-3 text-gray-700 font-medium">{t('step1.individual')}</span>
                </label>
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:border-primary-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                  <input
                    type="radio"
                    value="kurumsal"
                    {...register('invoiceType')}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 focus:ring-offset-2"
                  />
                  <span className="ml-3 text-gray-700 font-medium">{t('step1.corporate')}</span>
                </label>
              </div>
              {errors.invoiceType && (
                <p className="mt-1.5 text-sm text-red-600">{errors.invoiceType.message}</p>
              )}
              
              {/* Invoice Type Notes */}
              {invoiceType === 'bireysel' && (language === 'en' ? invoiceIndividualNoteEn : invoiceIndividualNote) && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-blue-800">
                      {language === 'en' ? invoiceIndividualNoteEn : invoiceIndividualNote}
                    </p>
                  </div>
                </div>
              )}
              
              {invoiceType === 'kurumsal' && (language === 'en' ? invoiceCorporateNoteEn : invoiceCorporateNote) && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-blue-800">
                      {language === 'en' ? invoiceCorporateNoteEn : invoiceCorporateNote}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bireysel Invoice Fields */}
          {invoiceType === 'bireysel' && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{t('step1.individualInvoiceInfo')}</h3>
              
              {/* Use Personal Name Checkbox */}
              {isFieldVisible('invoiceFullName') && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePersonalName}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setUsePersonalName(checked)
                        if (checked) {
                          const fullName = watch('fullName') || `${watch('firstName')} ${watch('lastName')}`.trim()
                          setValue('invoiceFullName', fullName, { shouldValidate: true })
                          updatePersonalInfo({ invoiceFullName: fullName })
                        } else {
                          setValue('invoiceFullName', '', { shouldValidate: true })
                          updatePersonalInfo({ invoiceFullName: '' })
                        }
                      }}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded mt-0.5"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      {t('step1.usePersonalName')}
                    </span>
                  </label>
                </div>
              )}
              
              {isFieldVisible('invoiceFullName') && (
                <div>
                  <label htmlFor="invoiceFullName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('step1.invoiceFullName')} {isFieldRequired('invoiceFullName') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id="invoiceFullName"
                    type="text"
                    {...register('invoiceFullName')}
                    disabled={usePersonalName}
                    className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                      usePersonalName ? 'bg-gray-100 cursor-not-allowed' : ''
                    } ${
                      errors.invoiceFullName
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                    }`}
                    placeholder={t('step1.placeholders.invoiceFullName')}
                  />
                  {usePersonalName && (
                    <p className="mt-1.5 text-xs text-gray-500">
                      {t('step1.autoFilledInfo')}
                    </p>
                  )}
                  {errors.invoiceFullName && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.invoiceFullName.message}</p>
                  )}
                </div>
              )}

              {isFieldVisible('idNumber') && (
                <div>
                  <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('step1.idNumber')} {isFieldRequired('idNumber') && <span className="text-red-500">*</span>}
                  </label>
                  <TCIdInput
                    id="idNumber"
                    value={watch('idNumber') || ''}
                    onChange={(value) => {
                      setValue('idNumber', value, { shouldValidate: true })
                      updatePersonalInfo({ idNumber: value })
                    }}
                    error={errors.idNumber?.message}
                    placeholder={t('step1.placeholders.idNumber')}
                  />
                </div>
              )}

              {isFieldVisible('invoiceAddress') && (
                <div>
                  <label htmlFor="invoiceAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('step1.invoiceAddress')} {isFieldRequired('invoiceAddress') && <span className="text-red-500">*</span>}
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
                    placeholder={t('step1.placeholders.invoiceAddress')}
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
              <h3 className="text-lg font-semibold text-gray-900">{t('step1.corporateInvoiceInfo')}</h3>
              
              {isFieldVisible('invoiceCompanyName') && (
                <div>
                  <label htmlFor="invoiceCompanyName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('step1.invoiceCompanyName')} {isFieldRequired('invoiceCompanyName') && <span className="text-red-500">*</span>}
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
                    placeholder={t('step1.placeholders.invoiceCompanyName')}
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
                    placeholder={t('step1.placeholders.invoiceAddress')}
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
                      {t('step1.taxOffice')} {isFieldRequired('taxOffice') && <span className="text-red-500">*</span>}
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
                      placeholder={t('step1.placeholders.taxOffice')}
                    />
                    {errors.taxOffice && (
                      <p className="mt-1.5 text-sm text-red-600">{errors.taxOffice.message}</p>
                    )}
                  </div>
                )}

                {isFieldVisible('taxNumber') && (
                  <div>
                    <label htmlFor="taxNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('step1.taxNumber')} {isFieldRequired('taxNumber') && <span className="text-red-500">*</span>}
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
                      placeholder={t('step1.placeholders.taxNumber')}
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

        {/* KVKK Aydınlatma (tüm form alanlarının en altında, İleri butonunun hemen üstünde) */}
        {isFieldVisible('kvkk_consent') && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setKvkkModalOpen(true)}
                  className="text-sm text-primary-600 hover:text-primary-700 underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                >
                  {language === 'en' ? 'Read notice' : 'Metni oku'}
                </button>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('kvkk_consent')}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">
                  {language === 'en'
                    ? (getFieldSetting('kvkk_consent')?.field_label_en ?? getFieldSetting('kvkk_consent')?.field_label ?? 'I have read, understood and accept the KVKK Privacy Notice.')
                    : (getFieldSetting('kvkk_consent')?.field_label ?? 'KVKK Aydınlatma Metni\'ni okudum, anladım ve kabul ediyorum.')}
                  {isFieldRequired('kvkk_consent') && <span className="text-red-500 ml-0.5">*</span>}
                </span>
              </label>
              {errors.kvkk_consent && (
                <p className="text-sm text-red-600">{errors.kvkk_consent.message}</p>
              )}
            </div>
          </div>
        )}

        {/* KVKK Aydınlatma Metni modal */}
        {kvkkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setKvkkModalOpen(false)}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === 'en' ? 'KVKK Privacy Notice' : 'KVKK Aydınlatma Metni'}
                </h3>
                <button
                  type="button"
                  onClick={() => setKvkkModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label={language === 'en' ? 'Close' : 'Kapat'}
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>
              <div className="px-6 py-4 overflow-y-auto flex-1 prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {language === 'en' ? (kvkkPopupEn || kvkkPopupTr || '—') : (kvkkPopupTr || kvkkPopupEn || '—')}
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setKvkkModalOpen(false)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {language === 'en' ? 'Close' : 'Kapat'}
                </button>
              </div>
            </div>
          </div>
        )}

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
