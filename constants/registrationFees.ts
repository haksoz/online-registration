import { RegistrationType, LegacyRegistrationFees, LegacyRegistrationLabels } from '@/types/registration'
import { formatTurkishCurrency } from '@/lib/currencyUtils'

// DEPRECATED: Legacy constants for backward compatibility
// These will be removed in future versions
// Use dynamic API data instead: /api/registration-types
export const registrationFees: LegacyRegistrationFees = {
  dernek_uyesi: 9500,
  dernek_uyesi_degil: 10500,
  ogrenci: 3000,
}

export const registrationTypeLabels: LegacyRegistrationLabels = {
  dernek_uyesi: 'Dernek Üyesi',
  dernek_uyesi_degil: 'Dernek Üyesi Olmayan',
  ogrenci: 'Öğrenci',
}

// Helper function to format fee as display string
export const formatFee = (fee: number): string => {
  return fee.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// DEPRECATED: Use dynamic data instead
export const getFeeDisplay = (registrationType: keyof typeof registrationFees): string => {
  const fee = registrationFees[registrationType]
  return fee ? `${formatFee(fee)} TL` : ''
}

// NEW: Dynamic registration types utilities
export class RegistrationTypeService {
  private static cache: RegistrationType[] = []
  private static lastFetch: number = 0
  private static CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static async getRegistrationTypes(): Promise<RegistrationType[]> {
    const now = Date.now()
    
    // Return cached data if still valid
    if (this.cache.length > 0 && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cache
    }

    try {
      const response = await fetch('/api/registration-types')
      const data = await response.json()
      
      if (data.success) {
        this.cache = data.data
        this.lastFetch = now
        return this.cache
      }
    } catch (error) {
      console.error('Failed to fetch registration types:', error)
    }

    // Fallback to legacy data if API fails
    return this.getLegacyRegistrationTypes()
  }

  static getLegacyRegistrationTypes(): RegistrationType[] {
    return Object.entries(registrationFees).map(([value, fee], index) => ({
      id: index + 1,
      value,
      label: registrationTypeLabels[value] || value,
      fee_try: fee,
      fee_usd: Math.round(fee / 30), // Approximate conversion
      fee_eur: Math.round(fee / 35), // Approximate conversion
      description: '',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
  }

  static clearCache(): void {
    this.cache = []
    this.lastFetch = 0
  }

  static findByValue(value: string): RegistrationType | undefined {
    return this.cache.find(type => type.value === value)
  }

  static formatFeeDisplay(fee: number): string {
    return formatTurkishCurrency(fee)
  }
}

