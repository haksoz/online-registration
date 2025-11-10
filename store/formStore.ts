import { create } from 'zustand'

export interface PersonalInfo {
  firstName: string
  lastName: string
  fullName: string // Computed field for backward compatibility
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | ''
  email: string
  phone: string
  address: string
  company?: string
  department?: string
  invoiceType: 'bireysel' | 'kurumsal' | ''
  // Bireysel invoice fields
  invoiceFullName?: string
  idNumber?: string
  invoiceAddress?: string
  // Kurumsal invoice fields
  invoiceCompanyName?: string
  taxOffice?: string
  taxNumber?: string
}

export interface AccommodationInfo {
  registrationType: 'dernek_uyesi' | 'dernek_uyesi_degil' | 'ogrenci' | ''
  registrationTypeLabel?: string
  registrationTypeLabelEn?: string
}

export interface PaymentInfo {
  paymentMethod: 'online' | 'bank_transfer' | ''
  cardHolderName?: string
  cardNumber?: string
  cardExpiry?: string
  cardCvv?: string
}

export interface FormData {
  personalInfo: PersonalInfo
  accommodation: AccommodationInfo
  payment: PaymentInfo
  referenceNumber?: string
  formLanguage?: 'tr' | 'en'
}

interface FormStore {
  currentStep: number
  formData: FormData
  setCurrentStep: (step: number) => void
  updatePersonalInfo: (data: Partial<PersonalInfo>) => void
  updateAccommodation: (data: Partial<AccommodationInfo>) => void
  updatePayment: (data: Partial<PaymentInfo>) => void
  setReferenceNumber: (referenceNumber: string) => void
  setFormLanguage: (language: 'tr' | 'en') => void
  resetForm: () => void
}

const initialFormData: FormData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    fullName: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    department: '',
    invoiceType: '',
    invoiceFullName: '',
    idNumber: '',
    invoiceAddress: '',
    invoiceCompanyName: '',
    taxOffice: '',
    taxNumber: '',
  },
  accommodation: {
    registrationType: '',
  },
  payment: {
    paymentMethod: '',
    cardHolderName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  },
  referenceNumber: '',
}

export const useFormStore = create<FormStore>((set) => ({
  currentStep: 1,
  formData: initialFormData,
  setCurrentStep: (step) => set({ currentStep: step }),
  updatePersonalInfo: (data) =>
    set((state) => {
      const updatedPersonalInfo = { ...state.formData.personalInfo, ...data }
      
      // Auto-generate fullName from firstName and lastName
      if (data.firstName !== undefined || data.lastName !== undefined) {
        updatedPersonalInfo.fullName = `${updatedPersonalInfo.firstName} ${updatedPersonalInfo.lastName}`.trim()
      }
      
      return {
        formData: {
          ...state.formData,
          personalInfo: updatedPersonalInfo,
        },
      }
    }),
  updateAccommodation: (data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        accommodation: { ...state.formData.accommodation, ...data },
      },
    })),
  updatePayment: (data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        payment: { ...state.formData.payment, ...data },
      },
    })),
  setReferenceNumber: (referenceNumber) =>
    set((state) => ({
      formData: {
        ...state.formData,
        referenceNumber,
      },
    })),
  setFormLanguage: (language) =>
    set((state) => ({
      formData: {
        ...state.formData,
        formLanguage: language,
      },
    })),
  resetForm: () => set({ currentStep: 1, formData: initialFormData }),
}))

