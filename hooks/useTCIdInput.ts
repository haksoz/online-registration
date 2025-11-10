import { useState, useCallback, useEffect, ChangeEvent, KeyboardEvent } from 'react'
import { 
  formatTCIdInput,
  getTCIdValidationStatus,
  getTCIdValidationMessage,
  extractTCIdDigits,
  type TCIdValidationStatus
} from '@/lib/tcIdUtils'

interface UseTCIdInputReturn {
  displayValue: string
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  validationStatus: TCIdValidationStatus
  validationMessage: string
  isValid: boolean
  isComplete: boolean
}

/**
 * T.C. kimlik numarası girişi için özel hook
 * Gerçek zamanlı doğrulama, formatlama ve state yönetimi sağlar
 */
export function useTCIdInput(
  value: string,
  onChange: (value: string) => void
): UseTCIdInputReturn {
  // Görüntü değeri - kullanıcının gördüğü format
  const [displayValue, setDisplayValue] = useState(() => {
    return formatTCIdInput(value)
  })

  // Validation durumu
  const [validationStatus, setValidationStatus] = useState<TCIdValidationStatus>(() => {
    return getTCIdValidationStatus(value)
  })

  // Validation mesajı
  const [validationMessage, setValidationMessage] = useState(() => {
    return getTCIdValidationMessage(value)
  })

  // Input değişikliği handler'ı
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Sadece rakamları çıkar ve formatla
    const digits = extractTCIdDigits(inputValue)
    
    // Maksimum 11 hane sınırı
    if (digits.length > 11) {
      return
    }
    
    // Görüntü formatını güncelle
    const formatted = formatTCIdInput(digits)
    setDisplayValue(formatted)
    
    // Validation durumunu güncelle
    const status = getTCIdValidationStatus(formatted)
    setValidationStatus(status)
    
    // Validation mesajını güncelle
    const message = getTCIdValidationMessage(formatted)
    setValidationMessage(message)
    
    // Parent'a gönder
    onChange(formatted)
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
    
    // Maksimum 11 hane kontrolü
    const currentDigits = extractTCIdDigits(displayValue)
    if (currentDigits.length >= 11) {
      e.preventDefault()
    }
  }, [displayValue])

  // Value prop değiştiğinde state'leri güncelle
  useEffect(() => {
    const newDisplayValue = formatTCIdInput(value)
    const newStatus = getTCIdValidationStatus(value)
    const newMessage = getTCIdValidationMessage(value)
    
    if (newDisplayValue !== displayValue) {
      setDisplayValue(newDisplayValue)
    }
    
    if (newStatus !== validationStatus) {
      setValidationStatus(newStatus)
    }
    
    if (newMessage !== validationMessage) {
      setValidationMessage(newMessage)
    }
  }, [value, displayValue, validationStatus, validationMessage])

  // Computed values
  const isValid = validationStatus === 'valid'
  const isComplete = displayValue.length === 11

  return {
    displayValue,
    handleChange,
    handleKeyDown,
    validationStatus,
    validationMessage,
    isValid,
    isComplete
  }
}