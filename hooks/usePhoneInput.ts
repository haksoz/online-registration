import { useState, useCallback, ChangeEvent, KeyboardEvent } from 'react'
import { 
  formatPhoneInput, 
  formatPhoneDisplay, 
  normalizePhoneNumber, 
  validateTurkishPhone,
  extractPhoneDigits 
} from '@/lib/phoneUtils'

interface UsePhoneInputReturn {
  displayValue: string
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  isValid: boolean
}

/**
 * Telefon numarası girişi için özel hook
 * Otomatik formatlama, validation ve state yönetimi sağlar
 */
export function usePhoneInput(
  value: string,
  onChange: (value: string) => void
): UsePhoneInputReturn {
  // Görüntü değeri - kullanıcının gördüğü format
  const [displayValue, setDisplayValue] = useState(() => {
    return formatPhoneDisplay(value)
  })

  // Input değişikliği handler'ı
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Sadece rakamları çıkar
    const digits = extractPhoneDigits(inputValue)
    
    // Maksimum 10 hane sınırı
    if (digits.length > 10) {
      return
    }
    
    // Görüntü formatını güncelle
    const formatted = formatPhoneInput(digits)
    setDisplayValue(formatted)
    
    // Backend formatında parent'a gönder
    const normalized = normalizePhoneNumber(digits)
    onChange(normalized)
  }, [onChange])

  // Klavye olayları handler'ı
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    // İzin verilen tuşlar
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ]
    
    // Ctrl/Cmd kombinasyonları (copy, paste, etc.)
    if (e.ctrlKey || e.metaKey) {
      return
    }
    
    // İzin verilen tuşlar
    if (allowedKeys.includes(e.key)) {
      return
    }
    
    // Sadece rakamlar
    if (!/^\d$/.test(e.key)) {
      e.preventDefault()
      return
    }
    
    // Maksimum 10 hane kontrolü
    const currentDigits = extractPhoneDigits(displayValue)
    if (currentDigits.length >= 10) {
      e.preventDefault()
    }
  }, [displayValue])

  // Validation durumu
  const isValid = validateTurkishPhone(value)

  // Value prop değiştiğinde displayValue'yu güncelle
  useState(() => {
    const newDisplayValue = formatPhoneDisplay(value)
    if (newDisplayValue !== displayValue) {
      setDisplayValue(newDisplayValue)
    }
  })

  return {
    displayValue,
    handleChange,
    handleKeyDown,
    isValid
  }
}