'use client'

import { useMemo, useState, useEffect } from 'react'
import { useFormStore } from '@/store/formStore'
import { useDataStore } from '@/store/dataStore'
import { useFormSettings } from '@/hooks/useFormSettings'
import { useTranslation } from '@/hooks/useTranslation'
import Step1PersonalInfo from '@/components/steps/Step1PersonalInfo'
import Step2RegistrationSelection from '@/components/steps/Step2RegistrationSelection'
import Step3Payment from '@/components/steps/Step3Payment'
import Step4Confirmation from '@/components/steps/Step4Confirmation'

export default function FormWizard() {
  const { currentStep, setCurrentStep, resetForm } = useFormStore()
  const { fetchAllData } = useDataStore()
  const { isRegistrationOpen, isRegistrationNotStarted, registrationStartDate, registrationDeadline, loading } = useFormSettings()
  const { t, language } = useTranslation()
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // Tüm verileri ilk yüklemede çek (prefetch)
  useEffect(() => {
    fetchAllData()
  }, [])

  // Step değiştiğinde sayfanın en üstüne scroll et
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  const steps = useMemo(() => [
    { number: 1, title: t('steps.step1') },
    { number: 2, title: t('steps.step2') },
    { number: 3, title: t('steps.step3') },
    { number: 4, title: t('steps.step4') },
  ], [t, language])

  const handleNext = async () => {
    if (currentStep < 4) {
      setIsTransitioning(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCurrentStep(currentStep + 1)
      setIsTransitioning(false)
      // Sayfanın en üstüne scroll et
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = async () => {
    if (currentStep > 1) {
      setIsTransitioning(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCurrentStep(currentStep - 1)
      setIsTransitioning(false)
      // Sayfanın en üstüne scroll et
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleReset = () => {
    resetForm()
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1PersonalInfo onNext={handleNext} />
      case 2:
        return <Step2RegistrationSelection onNext={handleNext} onBack={handleBack} />
      case 3:
        return <Step3Payment onNext={handleNext} onBack={handleBack} />
      case 4:
        return <Step4Confirmation />
      default:
        return <Step1PersonalInfo onNext={handleNext} />
    }
  }

  // Loading state
  if (loading || isTransitioning) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Registration not started yet
  if (isRegistrationNotStarted()) {
    const startDate = registrationStartDate ? new Date(registrationStartDate) : null
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {language === 'en' ? 'Registration Not Open Yet' : 'Kayıtlar Henüz Açılmadı'}
        </h2>
        <p className="text-gray-600 mb-4">
          {startDate ? (
            <>
              {language === 'en' ? 'Registration will open on' : 'Kayıtlar'}{' '}
              <strong>{startDate.toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</strong>{' '}
              {language === 'en' ? '' : 'tarihinde açılacaktır.'}
            </>
          ) : (
            language === 'en' ? 'Registration will open soon.' : 'Kayıtlar yakında açılacaktır.'
          )}
        </p>
        <p className="text-sm text-gray-500">
          {language === 'en' 
            ? 'Please check back later or contact the organizers for more information.' 
            : 'Lütfen daha sonra tekrar kontrol edin veya organizatörlerle iletişime geçin.'}
        </p>
      </div>
    )
  }

  // Registration closed
  if (!isRegistrationOpen()) {
    const deadline = registrationDeadline ? new Date(registrationDeadline) : null
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {language === 'en' ? 'Registration Closed' : 'Kayıtlar Kapandı'}
        </h2>
        <p className="text-gray-600 mb-4">
          {deadline ? (
            <>
              {language === 'en' ? 'Registration deadline was' : 'Kayıt son tarihi'}{' '}
              <strong>{deadline.toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</strong>{' '}
              {language === 'en' ? 'and has passed.' : 'olarak geçmiştir.'}
            </>
          ) : (
            language === 'en' ? 'Registration period has ended.' : 'Kayıt dönemi sona ermiştir.'
          )}
        </p>
        <p className="text-sm text-gray-500">
          {language === 'en' 
            ? 'For more information, please contact the organizers.' 
            : 'Daha fazla bilgi için lütfen organizatörlerle iletişime geçin.'}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep >= step.number
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.number ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium hidden sm:block ${
                    currentStep >= step.number ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    currentStep > step.number ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mt-8">{renderStep()}</div>
    </>
  )
}
