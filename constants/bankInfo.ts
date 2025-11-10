/**
 * Banka bilgileri ve ödeme ayarları
 * Veriler veritabanından dinamik olarak çekilir (çoklu hesap desteği)
 */

export interface BankAccount {
  id: number
  account_name: string
  bank_name: string
  account_holder: string
  iban: string
  currency: string
  description: string
  is_active: boolean
  display_order: number
}

export interface PaymentSettings {
  dekontEmail: string
  dekontMessage: string
}

export interface BankData {
  accounts: BankAccount[]
  settings: PaymentSettings
}

// Varsayılan değerler (API başarısız olursa kullanılır)
const DEFAULT_BANK_ACCOUNT: BankAccount = {
  id: 1,
  account_name: 'Ana Hesap (TRY)',
  bank_name: 'Enpara Bank A.Ş.',
  account_holder: 'Kapital Online Bilgisayar Ve İletişim Hizmetleri Tic.Ltd.Şti',
  iban: 'TR86 0015 7000 0000 0066 6455 24',
  currency: 'TRY',
  description: 'Kayıt ücreti ödemesi için',
  is_active: true,
  display_order: 1
}

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  dekontEmail: 'dekont@ko.com.tr',
  dekontMessage: 'Lütfen dekontunuzu {email} adresine iletiniz.'
}

// Cache için
let cachedBankData: BankData | null = null
let lastFetch = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 dakika

// API'den aktif banka hesaplarını çek (kullanıcı formu için)
export async function fetchActiveBankAccounts(): Promise<BankData> {
  const now = Date.now()
  
  // Cache kontrolü
  if (cachedBankData && (now - lastFetch) < CACHE_DURATION) {
    return cachedBankData
  }
  
  try {
    const response = await fetch('/api/bank-accounts/active')
    const data = await response.json()
    
    if (data.success) {
      const bankData: BankData = {
        accounts: data.data.accounts || [DEFAULT_BANK_ACCOUNT],
        settings: {
          dekontEmail: data.data.settings?.dekont_email || DEFAULT_PAYMENT_SETTINGS.dekontEmail,
          dekontMessage: data.data.settings?.dekont_message || DEFAULT_PAYMENT_SETTINGS.dekontMessage
        }
      }
      
      cachedBankData = bankData
      lastFetch = now
      return bankData
    }
  } catch (error) {
    console.error('Bank accounts fetch error:', error)
  }
  
  // Hata durumunda varsayılan değerleri döndür
  return {
    accounts: [DEFAULT_BANK_ACCOUNT],
    settings: DEFAULT_PAYMENT_SETTINGS
  }
}

// Cache'i temizle
export function clearBankSettingsCache() {
  cachedBankData = null
  lastFetch = 0
}

// Yardımcı fonksiyonlar
export const formatIban = (iban: string): string => {
  // IBAN'ı 4'lü gruplar halinde formatla
  return iban.match(/.{1,4}/g)?.join(' ') || iban
}

export const getDekontMessage = async (customEmail?: string): Promise<string> => {
  const bankData = await fetchActiveBankAccounts()
  const email = customEmail || bankData.settings.dekontEmail
  return bankData.settings.dekontMessage.replace('{email}', email)
}

// Aktif banka hesaplarını formatlanmış şekilde döndür
export const getFormattedBankAccounts = async () => {
  const bankData = await fetchActiveBankAccounts()
  return bankData.accounts.map(account => ({
    id: account.id,
    accountName: account.account_name,
    bankName: account.bank_name,
    accountHolder: account.account_holder,
    iban: formatIban(account.iban),
    rawIban: account.iban,
    currency: account.currency,
    description: account.description
  }))
}

// Ödeme ayarlarını getir
export const getPaymentSettings = async () => {
  const bankData = await fetchActiveBankAccounts()
  return bankData.settings
}

// Sync versiyonlar (varsayılan değerlerle)
export const getBankInfoDisplaySync = () => {
  return {
    bankName: DEFAULT_BANK_ACCOUNT.bank_name,
    accountHolder: DEFAULT_BANK_ACCOUNT.account_holder,
    iban: formatIban(DEFAULT_BANK_ACCOUNT.iban),
    rawIban: DEFAULT_BANK_ACCOUNT.iban
  }
}

export const PAYMENT_SETTINGS = DEFAULT_PAYMENT_SETTINGS