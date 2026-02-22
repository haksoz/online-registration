import { create } from 'zustand'
import { RegistrationType } from '@/types/registration'

interface DataStore {
  // Registration Types
  registrationTypes: RegistrationType[]
  registrationTypesLoading: boolean
  registrationTypesError: string | null
  fetchRegistrationTypes: () => Promise<void>
  /** Kayıt türlerini her zaman yeniden çeker (kontenjan vb. güncel veri için Step 2'de kullanılır) */
  refetchRegistrationTypes: () => Promise<void>
  
  // Bank Accounts
  bankAccounts: any[]
  bankAccountsLoading: boolean
  bankAccountsError: string | null
  fetchBankAccounts: () => Promise<void>
  
  // Payment Settings
  paymentSettings: any
  paymentSettingsLoading: boolean
  paymentSettingsError: string | null
  fetchPaymentSettings: () => Promise<void>
  
  // Exchange Rates
  exchangeRates: Record<string, number>
  exchangeRatesLoading: boolean
  exchangeRatesError: string | null
  fetchExchangeRates: () => Promise<void>
  
  // Currency Type
  currencyType: string
  setCurrencyType: (type: string) => void
  
  // Early Bird
  earlyBird: {
    enabled: boolean
    deadline: string | null
    isActive: boolean
  }
  
  // Global error state
  hasAnyError: boolean
  
  // Fetch all data at once
  fetchAllData: () => Promise<void>
  
  // Reset
  reset: () => void
}

const initialState = {
  registrationTypes: [],
  registrationTypesLoading: false,
  registrationTypesError: null,
  bankAccounts: [],
  bankAccountsLoading: false,
  bankAccountsError: null,
  paymentSettings: {},
  paymentSettingsLoading: false,
  paymentSettingsError: null,
  exchangeRates: {},
  exchangeRatesLoading: false,
  exchangeRatesError: null,
  currencyType: 'TRY',
  earlyBird: {
    enabled: false,
    deadline: null,
    isActive: false
  },
  hasAnyError: false
}

export const useDataStore = create<DataStore>((set, get) => ({
  ...initialState,
  
  fetchRegistrationTypes: async () => {
    // Eğer zaten yüklenmişse tekrar yükleme
    if (get().registrationTypes.length > 0) return
    
    set({ registrationTypesLoading: true, registrationTypesError: null })
    try {
      const response = await fetch('/api/registration-types')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      if (data.success) {
        set({ registrationTypes: data.data })
        
        // Currency type'ı da yükle
        if (data.currencyType) {
          set({ currencyType: data.currencyType })
        }
        
        // Early bird bilgisini de yükle
        if (data.earlyBird) {
          set({ earlyBird: data.earlyBird })
        }
      } else {
        throw new Error(data.error || 'Kayıt türleri yüklenemedi')
      }
    } catch (error) {
      console.error('Error fetching registration types:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      set({ 
        registrationTypesError: `Kayıt türleri yüklenemedi: ${errorMessage}`,
        hasAnyError: true
      })
    } finally {
      set({ registrationTypesLoading: false })
    }
  },

  refetchRegistrationTypes: async () => {
    set({ registrationTypesLoading: true, registrationTypesError: null })
    try {
      const response = await fetch('/api/registration-types')
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      const data = await response.json()
      if (data.success) {
        set({ registrationTypes: data.data })
        if (data.currencyType) set({ currencyType: data.currencyType })
        if (data.earlyBird) set({ earlyBird: data.earlyBird })
      } else {
        throw new Error(data.error || 'Kayıt türleri yüklenemedi')
      }
    } catch (error) {
      console.error('Error refetching registration types:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      set({ registrationTypesError: `Kayıt türleri güncellenemedi: ${errorMessage}`, hasAnyError: true })
    } finally {
      set({ registrationTypesLoading: false })
    }
  },
  
  fetchBankAccounts: async () => {
    if (get().bankAccounts.length > 0) return
    
    set({ bankAccountsLoading: true, bankAccountsError: null })
    try {
      const response = await fetch('/api/bank-accounts/active')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      if (data.success) {
        // API data.accounts ve data.settings döndürüyor
        // Settings'i camelCase'e çevir
        const settings = data.data?.settings || {}
        const camelCaseSettings = {
          dekontEmail: settings.dekont_email || settings.dekontEmail,
          dekontMessage: settings.dekont_message || settings.dekontMessage,
          dekontMessageEn: settings.dekont_message_en || settings.dekontMessageEn,
        }
        
        set({ 
          bankAccounts: data.data?.accounts || data.data || [],
          paymentSettings: camelCaseSettings.dekontEmail ? camelCaseSettings : get().paymentSettings
        })
      } else {
        throw new Error(data.error || 'Banka hesapları yüklenemedi')
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      set({ 
        bankAccountsError: `Banka hesapları yüklenemedi: ${errorMessage}`,
        hasAnyError: true
      })
    } finally {
      set({ bankAccountsLoading: false })
    }
  },
  
  fetchPaymentSettings: async () => {
    if (Object.keys(get().paymentSettings).length > 0) return
    
    set({ paymentSettingsLoading: true })
    try {
      const response = await fetch('/api/admin/bank-settings')
      const data = await response.json()
      if (data.success) {
        // Settings'i camelCase'e çevir
        const settings = data.settings || {}
        const camelCaseSettings = {
          dekontEmail: settings.dekont_email || settings.dekontEmail,
          dekontMessage: settings.dekont_message || settings.dekontMessage,
          dekontMessageEn: settings.dekont_message_en || settings.dekontMessageEn,
        }
        set({ paymentSettings: camelCaseSettings })
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error)
    } finally {
      set({ paymentSettingsLoading: false })
    }
  },
  
  fetchExchangeRates: async () => {
    if (Object.keys(get().exchangeRates).length > 0) return
    
    set({ exchangeRatesLoading: true, exchangeRatesError: null })
    try {
      const response = await fetch('/api/admin/exchange-rates')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      if (data.success && data.rates) {
        const rates: Record<string, number> = {}
        data.rates.forEach((rate: any) => {
          rates[rate.currency_code] = rate.rate_to_try
        })
        set({ exchangeRates: rates })
      } else {
        throw new Error(data.error || 'Döviz kurları yüklenemedi')
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      set({ 
        exchangeRatesError: `Döviz kurları yüklenemedi: ${errorMessage}`,
        hasAnyError: true
      })
    } finally {
      set({ exchangeRatesLoading: false })
    }
  },
  
  setCurrencyType: (type: string) => set({ currencyType: type }),
  
  // Tüm verileri paralel olarak çek
  fetchAllData: async () => {
    await Promise.all([
      get().fetchRegistrationTypes(),
      get().fetchBankAccounts(), // Bu zaten paymentSettings'i yüklüyor
      // get().fetchPaymentSettings(), // Gereksiz - fetchBankAccounts zaten yüklüyor
      get().fetchExchangeRates(),
    ])
  },
  
  reset: () => set(initialState),
}))
