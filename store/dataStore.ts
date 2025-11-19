import { create } from 'zustand'
import { RegistrationType } from '@/types/registration'

interface DataStore {
  // Registration Types
  registrationTypes: RegistrationType[]
  registrationTypesLoading: boolean
  fetchRegistrationTypes: () => Promise<void>
  
  // Bank Accounts
  bankAccounts: any[]
  bankAccountsLoading: boolean
  fetchBankAccounts: () => Promise<void>
  
  // Payment Settings
  paymentSettings: any
  paymentSettingsLoading: boolean
  fetchPaymentSettings: () => Promise<void>
  
  // Exchange Rates
  exchangeRates: Record<string, number>
  exchangeRatesLoading: boolean
  fetchExchangeRates: () => Promise<void>
  
  // Currency Type
  currencyType: string
  setCurrencyType: (type: string) => void
  
  // Fetch all data at once
  fetchAllData: () => Promise<void>
  
  // Reset
  reset: () => void
}

const initialState = {
  registrationTypes: [],
  registrationTypesLoading: false,
  bankAccounts: [],
  bankAccountsLoading: false,
  paymentSettings: {},
  paymentSettingsLoading: false,
  exchangeRates: {},
  exchangeRatesLoading: false,
  currencyType: 'TRY',
}

export const useDataStore = create<DataStore>((set, get) => ({
  ...initialState,
  
  fetchRegistrationTypes: async () => {
    // Eğer zaten yüklenmişse tekrar yükleme
    if (get().registrationTypes.length > 0) return
    
    set({ registrationTypesLoading: true })
    try {
      const response = await fetch('/api/registration-types')
      const data = await response.json()
      if (data.success) {
        set({ registrationTypes: data.data })
      }
    } catch (error) {
      console.error('Error fetching registration types:', error)
    } finally {
      set({ registrationTypesLoading: false })
    }
  },
  
  fetchBankAccounts: async () => {
    if (get().bankAccounts.length > 0) return
    
    set({ bankAccountsLoading: true })
    try {
      const response = await fetch('/api/bank-accounts/active')
      const data = await response.json()
      if (data.success) {
        // API data.accounts ve data.settings döndürüyor
        // Settings'i camelCase'e çevir
        const settings = data.data?.settings || {}
        const camelCaseSettings = {
          dekontEmail: settings.dekont_email,
          dekontMessage: settings.dekont_message,
          dekontMessageEn: settings.dekont_message_en,
        }
        
        set({ 
          bankAccounts: data.data?.accounts || data.data || [],
          paymentSettings: Object.keys(camelCaseSettings).length > 0 ? camelCaseSettings : get().paymentSettings
        })
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error)
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
        set({ paymentSettings: data.settings })
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error)
    } finally {
      set({ paymentSettingsLoading: false })
    }
  },
  
  fetchExchangeRates: async () => {
    if (Object.keys(get().exchangeRates).length > 0) return
    
    set({ exchangeRatesLoading: true })
    try {
      const response = await fetch('/api/admin/exchange-rates')
      const data = await response.json()
      if (data.success && data.rates) {
        const rates: Record<string, number> = {}
        data.rates.forEach((rate: any) => {
          rates[rate.currency_code] = rate.rate_to_try
        })
        set({ exchangeRates: rates })
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
    } finally {
      set({ exchangeRatesLoading: false })
    }
  },
  
  setCurrencyType: (type: string) => set({ currencyType: type }),
  
  // Tüm verileri paralel olarak çek
  fetchAllData: async () => {
    await Promise.all([
      get().fetchRegistrationTypes(),
      get().fetchBankAccounts(),
      get().fetchPaymentSettings(),
      get().fetchExchangeRates(),
    ])
  },
  
  reset: () => set(initialState),
}))
