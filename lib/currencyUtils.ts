/**
 * Para birimi formatlama yardımcı fonksiyonları
 * Türkiye formatına göre özelleştirilmiştir
 */

/**
 * Türkiye para formatına göre sayıyı formatlar
 * Örnek: 9500 -> "9.500,00 TL"
 */
export function formatTurkishCurrency(amount: number): string {
  // Tamamen manuel Türkiye formatı: 9.500,00 TL
  const integerPart = Math.floor(amount)
  const decimalPart = Math.round((amount - integerPart) * 100)
  
  // Binlik ayırıcı için nokta ekle
  const integerStr = integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  
  // Ondalık kısmı virgülle ekle
  const decimalStr = decimalPart.toString().padStart(2, '0')
  
  return `${integerStr},${decimalStr} TL`
}

/**
 * Sadece sayı formatı (TL olmadan)
 * Örnek: 9500 -> "9.500,00"
 */
export function formatTurkishNumber(amount: number): string {
  // Tamamen manuel Türkiye sayı formatı: 9.500,00
  const integerPart = Math.floor(amount)
  const decimalPart = Math.round((amount - integerPart) * 100)
  
  // Binlik ayırıcı için nokta ekle
  const integerStr = integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  
  // Ondalık kısmı virgülle ekle
  const decimalStr = decimalPart.toString().padStart(2, '0')
  
  return `${integerStr},${decimalStr}`
}

/**
 * Ondalık kısım olmadan para formatı
 * Örnek: 9500 -> "9.500 TL"
 */
export function formatTurkishCurrencyWhole(amount: number): string {
  // Manuel Türkiye formatı: 9.500 TL (ondalık olmadan)
  const formatted = amount.toLocaleString('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
  return `${formatted} TL`
}

/**
 * Kompakt para formatı (büyük sayılar için)
 * Örnek: 1500000 -> "1,5 Milyon TL"
 */
export function formatTurkishCurrencyCompact(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toLocaleString('tr-TR', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 1 
    })} Milyon TL`
  }
  
  if (amount >= 1000) {
    return `${(amount / 1000).toLocaleString('tr-TR', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 1 
    })} Bin TL`
  }
  
  return formatTurkishCurrency(amount)
}