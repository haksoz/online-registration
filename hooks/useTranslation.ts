import { useState, useEffect, useRef } from 'react'
import { useFormStore } from '@/store/formStore'
import trTranslations from '@/locales/tr.json'
import enTranslations from '@/locales/en.json'

type TranslationKey = string
type Translations = typeof trTranslations

const translations: Record<string, Translations> = {
  tr: trTranslations,
  en: enTranslations
}

export function useTranslation() {
  const { formData } = useFormStore()
  const [language, setLanguage] = useState<'tr' | 'en'>('tr')
  const [languageMode, setLanguageMode] = useState<'tr' | 'en' | 'tr_en' | 'en_tr'>('tr')
  const [loading, setLoading] = useState(true)
  const prevFormLanguageRef = useRef<'tr' | 'en' | undefined>()

  useEffect(() => {
    // Form ayarlarından dil bilgisini al
    const fetchLanguage = async () => {
      try {
        const response = await fetch('/api/form-settings')
        const data = await response.json()
        console.log('🌍 Language from API:', data.language)
        if (data.success && data.language) {
          const mode = data.language
          setLanguageMode(mode)
          console.log('🌍 Language mode set to:', mode)
          
          // Tek dilli modlarda (tr veya en), ayarı zorla uygula
          if (mode === 'tr') {
            console.log('🌍 Setting language to TR (single language mode)')
            setLanguage('tr')
          } else if (mode === 'en') {
            console.log('🌍 Setting language to EN (single language mode)')
            setLanguage('en')
          } else {
            // İki dilli modlarda store'daki dili kullan veya varsayılanı ayarla
            if (formData.formLanguage) {
              setLanguage(formData.formLanguage)
            } else {
              // Varsayılan dili belirle
              if (mode === 'tr_en') {
                setLanguage('tr')
              } else if (mode === 'en_tr') {
                setLanguage('en')
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching language:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchLanguage()
  }, [])

  // Store'daki dil değiştiğinde güncelle (sadece iki dilli modlarda)
  useEffect(() => {
    const storedLang = formData.formLanguage
    // Sadece formLanguage gerçekten değiştiyse güncelle
    if (storedLang && storedLang !== prevFormLanguageRef.current) {
      if (languageMode === 'tr_en' || languageMode === 'en_tr') {
        setLanguage(storedLang)
      }
      prevFormLanguageRef.current = storedLang
    }
  }, [formData.formLanguage, languageMode])

  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    const keys = key.split('.')
    let value: any = translations[language]

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key // Key bulunamazsa key'i döndür
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    // Parametreleri değiştir
    if (params) {
      Object.keys(params).forEach(param => {
        value = value.replace(`{${param}}`, params[param])
      })
    }

    return value
  }

  const changeLanguage = (newLang: 'tr' | 'en') => {
    setLanguage(newLang)
  }

  const canChangeLanguage = languageMode === 'tr_en' || languageMode === 'en_tr'

  return { t, language, languageMode, canChangeLanguage, changeLanguage, loading }
}
