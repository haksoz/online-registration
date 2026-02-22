import { z } from 'zod'
import { validateTCId } from '@/lib/tcIdUtils'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { FormFieldSetting } from '@/hooks/useFormSettings'

/**
 * Form ayarlarına göre dinamik validation schema oluşturur
 */
export function buildPersonalInfoSchema(fields: FormFieldSetting[], language: 'tr' | 'en' = 'tr'): z.ZodTypeAny {
  // Dil bazlı hata mesajları
  const messages = {
    tr: {
      firstName: 'Ad zorunludur',
      firstNameMin: 'Ad en az 2 karakter olmalıdır',
      lastName: 'Soyad zorunludur',
      lastNameMin: 'Soyad en az 2 karakter olmalıdır',
      gender: 'Lütfen cinsiyet seçiniz',
      country: 'Ülke zorunludur',
      email: 'E-posta zorunludur',
      emailInvalid: 'Geçerli bir e-posta girin',
      phone: 'Telefon zorunludur',
      phoneInvalid: 'Geçerli bir telefon numarası girin',
      address: 'Adres zorunludur',
      company: 'Şirket/Kurum zorunludur',
      department: 'Departman zorunludur',
      invoiceType: 'Fatura türü zorunludur',
      invoiceFullName: 'Fatura Ad Soyad zorunludur',
      idNumber: 'TC Kimlik No zorunludur',
      idNumberInvalid: 'Geçerli bir T.C. kimlik numarası girin',
      invoiceAddress: 'Fatura Adresi zorunludur',
      invoiceCompanyName: 'Şirket Adı zorunludur',
      taxOffice: 'Vergi Dairesi zorunludur',
      taxNumber: 'Vergi No zorunludur',
      kvkk_consent: 'KVKK aydınlatma metnini kabul etmeniz gerekmektedir.'
    },
    en: {
      firstName: 'First name is required',
      firstNameMin: 'First name must be at least 2 characters',
      lastName: 'Last name is required',
      lastNameMin: 'Last name must be at least 2 characters',
      gender: 'Please select gender',
      country: 'Country is required',
      email: 'Email is required',
      emailInvalid: 'Please enter a valid email',
      phone: 'Phone is required',
      phoneInvalid: 'Please enter a valid phone number',
      address: 'Address is required',
      company: 'Company/Organization is required',
      department: 'Department is required',
      invoiceType: 'Invoice type is required',
      invoiceFullName: 'Invoice full name is required',
      idNumber: 'ID number is required',
      idNumberInvalid: 'Please enter a valid ID number',
      invoiceAddress: 'Invoice address is required',
      invoiceCompanyName: 'Company name is required',
      taxOffice: 'Tax office is required',
      taxNumber: 'Tax number is required'
    }
  }
  
  const msg = messages[language]
  const getField = (fieldName: string) => fields.find(f => f.field_name === fieldName)
  
  const isVisible = (fieldName: string) => getField(fieldName)?.is_visible ?? true
  const isRequired = (fieldName: string) => getField(fieldName)?.is_required ?? false

  // Base schema object
  const schemaFields: any = {}

  // firstName
  if (isVisible('firstName')) {
    schemaFields.firstName = isRequired('firstName')
      ? z.string().min(1, msg.firstName).min(2, msg.firstNameMin)
      : z.string().optional()
  }

  // lastName
  if (isVisible('lastName')) {
    schemaFields.lastName = isRequired('lastName')
      ? z.string().min(1, msg.lastName).min(2, msg.lastNameMin)
      : z.string().optional()
  }

  // fullName (computed field)
  schemaFields.fullName = z.string().optional()

  // gender
  if (isVisible('gender')) {
    schemaFields.gender = isRequired('gender')
      ? z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
          required_error: msg.gender,
          invalid_type_error: msg.gender
        })
      : z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional().nullable()
  }

  // country
  if (isVisible('country')) {
    schemaFields.country = isRequired('country')
      ? z.string().min(1, msg.country)
      : z.string().optional()
  }

  // email
  if (isVisible('email')) {
    schemaFields.email = isRequired('email')
      ? z.string().min(1, msg.email).email(msg.emailInvalid)
      : z.string().email(msg.emailInvalid).optional().or(z.literal(''))
  }

  // phone
  if (isVisible('phone')) {
    if (isRequired('phone')) {
      schemaFields.phone = z
        .string()
        .min(1, msg.phone)
        .refine(
          (phone) => {
            if (!phone.startsWith('+')) return false
            return isValidPhoneNumber(phone)
          },
          msg.phoneInvalid
        )
    } else {
      schemaFields.phone = z
        .string()
        .optional()
        .refine(
          (phone) => {
            if (!phone || phone === '') return true
            if (!phone.startsWith('+')) return false
            return isValidPhoneNumber(phone)
          },
          msg.phoneInvalid
        )
    }
  }

  // address
  if (isVisible('address')) {
    schemaFields.address = isRequired('address')
      ? z.string().min(1, msg.address)
      : z.string().optional()
  }

  // company
  if (isVisible('company')) {
    schemaFields.company = isRequired('company')
      ? z.string().min(1, msg.company)
      : z.string().optional()
  }

  // department
  if (isVisible('department')) {
    schemaFields.department = isRequired('department')
      ? z.string().min(1, msg.department)
      : z.string().optional()
  }

  // invoiceType
  if (isVisible('invoiceType')) {
    schemaFields.invoiceType = isRequired('invoiceType')
      ? z.enum(['bireysel', 'kurumsal'], {
          required_error: msg.invoiceType,
          invalid_type_error: msg.invoiceType
        })
      : z.enum(['bireysel', 'kurumsal']).optional()
  }

  // Invoice fields (conditional based on invoiceType)
  schemaFields.invoiceFullName = z.string().optional()
  schemaFields.idNumber = z.string().optional()
  schemaFields.invoiceAddress = z.string().optional()
  schemaFields.invoiceCompanyName = z.string().optional()
  schemaFields.taxOffice = z.string().optional()
  schemaFields.taxNumber = z.string().optional()

  // KVKK consent (Step 1, İleri butonunun üstünde)
  if (isVisible('kvkk_consent')) {
    schemaFields.kvkk_consent = isRequired('kvkk_consent')
      ? z.boolean().refine((v) => v === true, { message: msg.kvkk_consent })
      : z.boolean().optional()
  }

  // Create base schema
  let schema: any = z.object(schemaFields)

  // Add conditional validations for invoice fields
  // Bireysel invoice validations
  schema = schema.refine(
    (data: any) => {
      if (data.invoiceType === 'bireysel' && isVisible('invoiceFullName') && isRequired('invoiceFullName')) {
        return data.invoiceFullName && data.invoiceFullName.length >= 1
      }
      return true
    },
    {
      message: msg.invoiceFullName,
      path: ['invoiceFullName'],
    }
  )

  schema = schema.refine(
    (data: any) => {
      if (data.invoiceType === 'bireysel' && isVisible('idNumber') && isRequired('idNumber')) {
        return data.idNumber && data.idNumber.length >= 1
      }
      return true
    },
    {
      message: msg.idNumber,
      path: ['idNumber'],
    }
  )

  schema = schema.refine(
    (data: any) => {
      if (data.invoiceType === 'bireysel' && data.idNumber) {
        return validateTCId(data.idNumber)
      }
      return true
    },
    {
      message: msg.idNumberInvalid,
      path: ['idNumber'],
    }
  )

  schema = schema.refine(
    (data: any) => {
      if (data.invoiceType === 'bireysel' && isVisible('invoiceAddress') && isRequired('invoiceAddress')) {
        return data.invoiceAddress && data.invoiceAddress.length >= 1
      }
      return true
    },
    {
      message: msg.invoiceAddress,
      path: ['invoiceAddress'],
    }
  )

  // Kurumsal invoice validations
  schema = schema.refine(
    (data: any) => {
      if (data.invoiceType === 'kurumsal' && isVisible('invoiceCompanyName') && isRequired('invoiceCompanyName')) {
        return data.invoiceCompanyName && data.invoiceCompanyName.length >= 1
      }
      return true
    },
    {
      message: msg.invoiceCompanyName,
      path: ['invoiceCompanyName'],
    }
  )

  schema = schema.refine(
    (data: any) => {
      if (data.invoiceType === 'kurumsal' && isVisible('invoiceAddress') && isRequired('invoiceAddress')) {
        return data.invoiceAddress && data.invoiceAddress.length >= 1
      }
      return true
    },
    {
      message: msg.invoiceAddress,
      path: ['invoiceAddress'],
    }
  )

  schema = schema.refine(
    (data: any) => {
      if (data.invoiceType === 'kurumsal' && isVisible('taxOffice') && isRequired('taxOffice')) {
        return data.taxOffice && data.taxOffice.length >= 1
      }
      return true
    },
    {
      message: msg.taxOffice,
      path: ['taxOffice'],
    }
  )

  schema = schema.refine(
    (data: any) => {
      if (data.invoiceType === 'kurumsal' && isVisible('taxNumber') && isRequired('taxNumber')) {
        return data.taxNumber && data.taxNumber.length >= 1
      }
      return true
    },
    {
      message: msg.taxNumber,
      path: ['taxNumber'],
    }
  )

  return schema
}
