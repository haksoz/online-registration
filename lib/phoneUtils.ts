/**
 * Telefon numarası işleme yardımcı fonksiyonları
 * Türkiye telefon numaraları için özelleştirilmiştir
 */

/**
 * Telefon numarasını görüntü formatına çevirir
 * Backend formatından ("+905551234567") kullanıcı dostu formata ("555 123 4567")
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return ''
  
  // +90 ile başlayan formatı kontrol et
  if (phone.startsWith('+90')) {
    const digits = phone.slice(3)
    if (digits.length === 10 && digits.startsWith('5')) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
    }
  }
  
  // 0 ile başlayan formatı kontrol et (05551234567)
  if (phone.startsWith('0') && phone.length === 11) {
    const digits = phone.slice(1)
    if (digits.startsWith('5')) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
    }
  }
  
  // Sadece 10 haneli format (5551234567)
  const cleanDigits = phone.replace(/\D/g, '')
  if (cleanDigits.length === 10 && cleanDigits.startsWith('5')) {
    return `${cleanDigits.slice(0, 3)} ${cleanDigits.slice(3, 6)} ${cleanDigits.slice(6)}`
  }
  
  // Geçersiz format - olduğu gibi döndür
  return phone
}

/**
 * Kullanıcı girişini backend formatına çevirir
 * "555 123 4567" -> "+905551234567"
 */
export function normalizePhoneNumber(input: string): string {
  if (!input) return ''
  
  // Sadece rakamları al
  const digits = input.replace(/\D/g, '')
  
  // 10 haneli ve 5 ile başlayan format
  if (digits.length === 10 && digits.startsWith('5')) {
    return `+90${digits}`
  }
  
  // 11 haneli ve 05 ile başlayan format
  if (digits.length === 11 && digits.startsWith('05')) {
    return `+90${digits.slice(1)}`
  }
  
  // Zaten +90 formatında
  if (input.startsWith('+90') && digits.length === 12) {
    return `+90${digits.slice(2)}`
  }
  
  // Geçersiz format - olduğu gibi döndür
  return input
}

/**
 * Türkiye cep telefonu numarasını doğrular
 */
export function validateTurkishPhone(phone: string): boolean {
  if (!phone) return false
  
  const normalized = normalizePhoneNumber(phone)
  
  // +90 ile başlamalı ve 13 karakter olmalı
  if (!normalized.startsWith('+90') || normalized.length !== 13) {
    return false
  }
  
  // +90'dan sonraki kısım 10 haneli olmalı ve 5 ile başlamalı
  const mobileNumber = normalized.slice(3)
  if (mobileNumber.length !== 10 || !mobileNumber.startsWith('5')) {
    return false
  }
  
  // Tüm karakterler rakam olmalı
  return /^\d+$/.test(mobileNumber)
}

/**
 * Telefon numarası girişini formatlar (kullanıcı yazarken)
 * "5551234567" -> "555 123 4567"
 */
export function formatPhoneInput(input: string): string {
  if (!input) return ''
  
  // Sadece rakamları al
  const digits = input.replace(/\D/g, '')
  
  // Maksimum 10 hane
  const limitedDigits = digits.slice(0, 10)
  
  // Formatla
  if (limitedDigits.length <= 3) {
    return limitedDigits
  } else if (limitedDigits.length <= 6) {
    return `${limitedDigits.slice(0, 3)} ${limitedDigits.slice(3)}`
  } else {
    return `${limitedDigits.slice(0, 3)} ${limitedDigits.slice(3, 6)} ${limitedDigits.slice(6)}`
  }
}

/**
 * Telefon numarası girişinden sadece rakamları çıkarır
 */
export function extractPhoneDigits(input: string): string {
  return input.replace(/\D/g, '')
}