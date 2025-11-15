/**
 * T.C. Kimlik Numarası işleme yardımcı fonksiyonları
 * T.C. Cumhuriyeti resmi algoritmasına göre doğrulama yapar
 */

// Hata mesajları sabitleri
export const TC_ID_ERROR_MESSAGES = {
  EMPTY: 'T.C. kimlik numarası zorunludur',
  TOO_SHORT: 'T.C. kimlik numarası 11 haneli olmalıdır',
  INVALID_CHARACTERS: 'Sadece rakam girebilirsiniz',
  STARTS_WITH_ZERO: 'T.C. kimlik numarası 0 ile başlayamaz',
  ALL_SAME_DIGITS: 'Tüm haneler aynı olamaz',
  ALGORITHM_FAILED: 'Geçerli bir T.C. kimlik numarası girin',
  INVALID_FORMAT: 'Geçersiz T.C. kimlik numarası formatı',
  VALID: 'Geçerli T.C. kimlik numarası ✓'
} as const

export type TCIdValidationStatus = 'valid' | 'invalid' | 'incomplete' | 'empty'

export interface TCIdValidationResult {
  isValid: boolean
  status: TCIdValidationStatus
  message: string
  details?: {
    lengthCheck: boolean
    firstDigitCheck: boolean
    algorithmCheck: boolean
    duplicateCheck: boolean
  }
}

/**
 * T.C. kimlik numarasını resmi algoritmasına göre doğrular
 * 
 * Algoritma kuralları:
 * 1. 11 hane olmalı
 * 2. İlk hane 0 olamaz
 * 3. Tüm haneler aynı olamaz (test numarası 11111111111 hariç)
 * 4. 10. hane = ((1+3+5+7+9. hanelerin toplamı) * 7 - (2+4+6+8. hanelerin toplamı)) mod 10
 * 5. 11. hane = (İlk 10 hanenin toplamı) mod 10
 */
export function validateTCId(tcId: string): boolean {
  if (!tcId) return false
  
  // Sadece rakamları al
  const cleanTcId = tcId.replace(/\D/g, '')
  
  // 1. Uzunluk kontrolü
  if (cleanTcId.length !== 11) return false
  
  // 2. İlk hane 0 olamaz
  if (cleanTcId[0] === '0') return false
  
  // İstisna: Test numaraları
  if (cleanTcId === '11111111111' || cleanTcId === '22222222222') return true
  
  // 3. Tüm haneler aynı olamaz
  if (new Set(cleanTcId).size === 1) return false
  
  const digits = cleanTcId.split('').map(Number)
  
  // 4. Çift/Tek pozisyon kontrolü (10. hane)
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8] // 1,3,5,7,9. haneler
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7] // 2,4,6,8. haneler
  const tenthDigitCheck = ((oddSum * 7) - evenSum) % 10
  
  if (digits[9] !== tenthDigitCheck) return false
  
  // 5. 11. hane kontrolü
  const first10Sum = digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0)
  const eleventhDigitCheck = first10Sum % 10
  
  return digits[10] === eleventhDigitCheck
}

/**
 * T.C. kimlik numarası için detaylı doğrulama mesajı döndürür
 */
export function getTCIdValidationMessage(tcId: string): string {
  if (!tcId) return ''
  
  const cleanTcId = tcId.replace(/\D/g, '')
  
  // Eksik hane durumu
  if (cleanTcId.length < 11) {
    if (cleanTcId.length === 0) return ''
    return `${cleanTcId.length}/11 hane girdiniz...`
  }
  
  // Fazla hane durumu
  if (cleanTcId.length > 11) {
    return TC_ID_ERROR_MESSAGES.TOO_SHORT
  }
  
  // İlk hane 0 kontrolü
  if (cleanTcId[0] === '0') {
    return TC_ID_ERROR_MESSAGES.STARTS_WITH_ZERO
  }
  
  // Test numarası kontrolü
  if (cleanTcId === '11111111111' || cleanTcId === '22222222222') {
    return TC_ID_ERROR_MESSAGES.VALID
  }
  
  // Tüm haneler aynı kontrolü
  if (new Set(cleanTcId).size === 1) {
    return TC_ID_ERROR_MESSAGES.ALL_SAME_DIGITS
  }
  
  // Algoritma kontrolü
  if (!validateTCId(cleanTcId)) {
    return TC_ID_ERROR_MESSAGES.ALGORITHM_FAILED
  }
  
  return TC_ID_ERROR_MESSAGES.VALID
}

/**
 * T.C. kimlik numarası girişini formatlar (kullanıcı yazarken)
 * Sadece rakamları tutar ve maksimum 11 hane ile sınırlar
 */
export function formatTCIdInput(input: string): string {
  if (!input) return ''
  
  // Sadece rakamları al ve maksimum 11 hane ile sınırla
  const digits = input.replace(/\D/g, '').slice(0, 11)
  
  return digits
}

/**
 * T.C. kimlik numarası girişinden sadece rakamları çıkarır
 */
export function extractTCIdDigits(input: string): string {
  return input.replace(/\D/g, '')
}

/**
 * T.C. kimlik numarası validation durumunu döndürür
 */
export function getTCIdValidationStatus(tcId: string): TCIdValidationStatus {
  if (!tcId) return 'empty'
  
  const cleanTcId = tcId.replace(/\D/g, '')
  
  if (cleanTcId.length < 11) return 'incomplete'
  if (cleanTcId.length > 11) return 'invalid'
  if (validateTCId(cleanTcId)) return 'valid'
  
  return 'invalid'
}

/**
 * Detaylı T.C. kimlik numarası doğrulama sonucu döndürür
 */
export function getDetailedTCIdValidation(tcId: string): TCIdValidationResult {
  const cleanTcId = tcId.replace(/\D/g, '')
  const status = getTCIdValidationStatus(tcId)
  const message = getTCIdValidationMessage(tcId)
  
  // Detaylı kontroller
  const lengthCheck = cleanTcId.length === 11
  const firstDigitCheck = cleanTcId.length > 0 && cleanTcId[0] !== '0'
  const duplicateCheck = cleanTcId.length > 0 && new Set(cleanTcId).size > 1
  const algorithmCheck = lengthCheck && firstDigitCheck && duplicateCheck && validateTCId(cleanTcId)
  
  return {
    isValid: status === 'valid',
    status,
    message,
    details: {
      lengthCheck,
      firstDigitCheck,
      duplicateCheck,
      algorithmCheck
    }
  }
}

/**
 * Test amaçlı geçerli T.C. kimlik numaraları üretir
 * NOT: Sadece development/test ortamında kullanılmalıdır
 */
export function generateValidTCId(): string {
  // Bu fonksiyon sadece test amaçlıdır
  // Gerçek uygulamada kullanılmamalıdır
  const testTCIds = [
    '11111111110', // Bilinen geçerli test numarası
    '22222222220',
    '33333333330'
  ]
  
  return testTCIds[Math.floor(Math.random() * testTCIds.length)]
}