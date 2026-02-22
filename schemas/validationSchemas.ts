import { z } from 'zod'
import { validateTCId } from '@/lib/tcIdUtils'
import { isValidPhoneNumber } from 'libphonenumber-js'

export const personalInfoSchema = z
  .object({
    firstName: z.string().min(1, 'Ad zorunludur').min(2, 'Ad en az 2 karakter olmalıdır'),
    lastName: z.string().min(1, 'Soyad zorunludur').min(2, 'Soyad en az 2 karakter olmalıdır'),
    fullName: z.string().optional(), // Computed field
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
      required_error: 'Cinsiyet zorunludur',
      invalid_type_error: 'Cinsiyet zorunludur'
    }),
    country: z.string().optional(),
    email: z.string().email('Geçerli bir e-posta girin'),
    phone: z
      .string()
      .min(1, 'Telefon zorunludur')
      .refine(
        (phone) => {
          // E.164 formatında telefon numarası kontrolü
          if (!phone.startsWith('+')) {
            return false
          }
          return isValidPhoneNumber(phone)
        },
        'Geçerli bir telefon numarası girin'
      ),
    address: z.string().min(1, 'Adres zorunludur'),
    company: z.string().optional(),
    department: z.string().optional(),
    invoiceType: z.enum(['bireysel', 'kurumsal'], {
      required_error: 'Fatura türü zorunludur',
      invalid_type_error: 'Fatura türü zorunludur'
    }),
    // Bireysel invoice fields
    invoiceFullName: z.string().optional(),
    idNumber: z.string().optional(),
    invoiceAddress: z.string().optional(),
    // Kurumsal invoice fields
    invoiceCompanyName: z.string().optional(),
    taxOffice: z.string().optional(),
    taxNumber: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.invoiceType === 'bireysel') {
        return (
          data.invoiceFullName &&
          data.invoiceFullName.length >= 1 &&
          data.idNumber &&
          data.idNumber.length >= 1 &&
          data.invoiceAddress &&
          data.invoiceAddress.length >= 1
        )
      }
      return true
    },
    {
      message: 'Bireysel fatura için Ad Soyad, TC Kimlik No ve Fatura Adresi gereklidir',
      path: ['invoiceFullName'],
    }
  )
  .refine(
    (data) => {
      if (data.invoiceType === 'bireysel') {
        return data.idNumber && data.idNumber.length >= 1
      }
      return true
    },
    {
      message: 'TC Kimlik No zorunludur',
      path: ['idNumber'],
    }
  )
  .refine(
    (data) => {
      if (data.invoiceType === 'bireysel' && data.idNumber) {
        return validateTCId(data.idNumber)
      }
      return true
    },
    {
      message: 'Geçerli bir T.C. kimlik numarası girin',
      path: ['idNumber'],
    }
  )
  .refine(
    (data) => {
      if (data.invoiceType === 'bireysel') {
        return data.invoiceAddress && data.invoiceAddress.length >= 1
      }
      return true
    },
    {
      message: 'Fatura Adresi zorunludur',
      path: ['invoiceAddress'],
    }
  )
  .refine(
    (data) => {
      if (data.invoiceType === 'kurumsal') {
        return (
          data.invoiceCompanyName &&
          data.invoiceCompanyName.length >= 1 &&
          data.invoiceAddress &&
          data.invoiceAddress.length >= 1 &&
          data.taxOffice &&
          data.taxOffice.length >= 1 &&
          data.taxNumber &&
          data.taxNumber.length >= 1
        )
      }
      return true
    },
    {
      message: 'Kurumsal fatura için Şirket Adı, Fatura Adresi, Vergi Dairesi ve Vergi No gereklidir',
      path: ['invoiceCompanyName'],
    }
  )
  .refine(
    (data) => {
      if (data.invoiceType === 'kurumsal') {
        return data.invoiceAddress && data.invoiceAddress.length >= 1
      }
      return true
    },
    {
      message: 'Fatura Adresi zorunludur',
      path: ['invoiceAddress'],
    }
  )
  .refine(
    (data) => {
      if (data.invoiceType === 'kurumsal') {
        return data.taxOffice && data.taxOffice.length >= 1
      }
      return true
    },
    {
      message: 'Vergi Dairesi zorunludur',
      path: ['taxOffice'],
    }
  )
  .refine(
    (data) => {
      if (data.invoiceType === 'kurumsal') {
        return data.taxNumber && data.taxNumber.length >= 1
      }
      return true
    },
    {
      message: 'Vergi No zorunludur',
      path: ['taxNumber'],
    }
  )

export const accommodationSchema = z.object({
  registrationType: z.string().min(1, 'Lütfen bir kayıt türü seçin'),
})

export const paymentSchema = z.object({
  paymentMethod: z.enum(['online', 'bank_transfer'], {
    required_error: 'Lütfen bir ödeme yöntemi seçin',
    invalid_type_error: 'Lütfen bir ödeme yöntemi seçin'
  }),
  // Online ödeme için kart bilgileri (opsiyonel, sadece online seçiliyse zorunlu)
  cardHolderName: z.string().optional(),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
}).refine(
  (data) => {
    // Online ödeme seçiliyse kart bilgileri zorunlu
    if (data.paymentMethod === 'online') {
      return (
        data.cardHolderName &&
        data.cardHolderName.length >= 3 &&
        data.cardNumber &&
        data.cardNumber.replace(/\s/g, '').length >= 15 &&
        data.cardExpiry &&
        data.cardExpiry.length >= 5 &&
        data.cardCvv &&
        data.cardCvv.length >= 3
      )
    }
    return true
  },
  {
    message: 'Online ödeme için tüm kart bilgileri zorunludur',
    path: ['cardNumber']
  }
)

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>
export type AccommodationFormData = z.infer<typeof accommodationSchema>
export type PaymentFormData = z.infer<typeof paymentSchema>

