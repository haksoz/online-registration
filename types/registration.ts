// Registration Types Interface
export interface RegistrationType {
  id: number
  value: string
  label: string
  label_en?: string
  fee_try: number
  fee_usd: number
  fee_eur: number
  description?: string
  description_en?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Registration Interface
export interface Registration {
  id: number
  reference_number: string
  first_name?: string
  last_name?: string
  full_name: string
  email: string
  phone: string
  address?: string
  company?: string
  invoice_type: string
  // Bireysel fatura bilgileri
  invoice_full_name?: string
  id_number?: string
  invoice_address?: string
  // Kurumsal fatura bilgileri
  invoice_company_name?: string
  tax_office?: string
  tax_number?: string
  // Kayıt bilgileri
  registration_type: string
  fee: number
  payment_method: 'online' | 'bank_transfer'
  payment_status: 'pending' | 'completed'
  created_at: string
}

// API Response Types
export interface RegistrationTypesResponse {
  success: boolean
  data: RegistrationType[]
  error?: string
}

export interface CreateRegistrationTypeRequest {
  value: string
  label: string
  fee_try: number
  fee_usd: number
  fee_eur: number
  description?: string
}

export interface UpdateRegistrationTypeRequest {
  label: string
  fee_try: number
  fee_usd: number
  fee_eur: number
  description?: string
}

export interface ApiResponse {
  success: boolean
  message?: string
  error?: string
  data?: any
}

// Form Data Types
export interface RegistrationFormOption {
  value: string
  label: string
  fee_try: number
  fee_usd: number
  fee_eur: number
  description?: string
}

// Legacy compatibility - will be deprecated
export interface LegacyRegistrationFees {
  [key: string]: number
}

export interface LegacyRegistrationLabels {
  [key: string]: string
}