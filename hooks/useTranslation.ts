import { useState, useEffect } from 'react'
import trTranslations from '@/locales/tr.json'
import enTranslations from '@/locales/en.json'

type TranslationKey = string
type Translations = typeof trTranslations

const translations: Record<string, Translations> = {
  tr: trTranslations,
  en: enTranslations
}

export function useTranslation() {
  const [language, setLanguage] = useState<'tr' | 'en'>('tr')
  const [languageMode, setLanguageMode] = useState<'tr' | 'en' | 'tr_en' | 'en_tr'>('tr')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Form ayarlarından dil bilgisini al
    const fetchLanguage = async () => {
      try {
        const response = await fetch('/api/form-settings')
        const data = await response.json()
        if (data.success && data.language) {
          const mode = data.language
          setLanguageMode(mode)
          
          // Varsayılan dili ayarla
          if (mode === 'tr' || mode === 'tr_en') {
            setLanguage('tr')
          } else if (mode === 'en' || mode === 'en_tr') {
            setLanguage('en')
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
