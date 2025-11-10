import { z } from 'zod'
import { validateTCId } from '@/lib/tcIdUtils'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { FormFieldSetting } from '@/hooks/useFormSettings'

/**
 * Form ayarlarına göre dinamik validation schema oluşturur
 */
export function buildPersonalInfoSchema(fields: FormFieldSetting[]): z.ZodTypeAny {
  const getField = (fieldName: string) => fields.find(f => f.field_name === fieldName)
  
  const isVisible = (fieldName: string) => getField(fieldName)?.is_visible ?? true
  const isRequired = (fieldName: string) => getField(fieldName)?.is_required ?? false

  // Base schema object
  const schemaFields: any = {}

  // firstName
  if (isVisible('firstName')) {
    schemaFields.firstName = isRequired('firstName')
      ? z.string().min(1, 'Ad zorunludur').min(2, 'Ad en az 2 karakter olmalıdır')
      : z.string().optional()
  }

  // lastName
  if (isVisible('lastName')) {
    schemaFields.lastName = isRequired('lastName')
      ? z.string().min(1, 'Soyad zorunludur').min(2, 'Soyad en az 2 karakter olmalıdır')
      : z.string().optional()
  }

  // fullName (computed field)
  schemaFields.fullName = z.string().optional()

  // gender
  if (isVisible('gender')) {
    schemaFields.gender = isRequired('gender')
      ? z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
          required_error: 'Cinsiyet zorunludur',
          invalid_type_error: 'Cinsiyet zorunludur'
        })
      : z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional()
  }

  // email
  if (isVisible('email')) {
    schemaFields.email = isRequired('email')
      ? z.string().min(1, 'E-posta zorunludur').email('Geçerli bir e-posta girin')
      : z.string().email('Geçerli bir e-posta girin').optional().or(z.literal(''))
  }

  // phone
  if (isVisible('phone')) {
    if (isRequired('phone')) {
      schemaFields.phone = z
        .string()
        .min(1, 'Telefon zorunludur')
        .refine(
          (phone) => {
            if (!phone.startsWith('+')) return false
            return isValidPhoneNumber(phone)
          },
          'Geçerli bir telefon numarası girin'
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
          'Geçerli bir telefon numarası girin'
        )
    }
  }

  // address
  if (isVisible('address')) {
    schemaFields.address = isRequired('address')
      ? z.string().min(1, 'Adres zorunludur')
      : z.string().optional()
  }

  // company
  if (isVisible('company')) {
    schemaFields.company = isRequired('company')
      ? z.string().min(1, 'Şirket/Kurum zorunludur')
      : z.string().optional()
  }

  // department
  if (isVisible('department')) {
    schemaFields.department = isRequired('department')
      ? z.string().min(1, 'Departman zorunludur')
      : z.string().optional()
  }

  // invoiceType
  if (isVisible('invoiceType')) {
    schemaFields.invoiceType = isRequired('invoiceType')
      ? z.enum(['bireysel', 'kurumsal'], {
          required_error: 'Fatura türü zorunludur',
          invalid_type_error: 'Fatura türü zorunludur'
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

  // Create base schema
  let schema = z.object(schemaFields)

  // Add conditional validations for invoice fields
  // Bireysel invoice validations
  schema = schema.refine(
    (data) => {
      if (data.invoiceType === 'bireysel' && isVisible('invoiceFullName') && isRequired('invoiceFullName')) {
        return data.invoiceFullName && data.invoiceFullName.length >= 1
      }
      return true
    },
    {
      message: 'Fatura Ad Soyad zorunludur',
      path: ['invoiceFullName'],
    }
  )

  schema = schema.refine(
    (data) => {
      if (data.invoiceType === 'bireysel' && isVisible('idNumber') && isRequired('idNumber')) {
        return data.idNumber && data.idNumber.length >= 1
      }
      return true
    },
    {
      message: 'TC Kimlik No zorunludur',
      path: ['idNumber'],
    }
  )

  schema = schema.refine(
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

  schema = schema.refine(
    (data) => {
      if (data.invoiceType === 'bireysel' && isVisible('invoiceAddress') && isRequired('invoiceAddress')) {
        return data.invoiceAddress && data.invoiceAddress.length >= 1
      }
      return true
    },
    {
      message: 'Fatura Adresi zorunludur',
      path: ['invoiceAddress'],
    }
  )

  // Kurumsal invoice validations
  schema = schema.refine(
    (data) => {
      if (data.invoiceType === 'kurumsal' && isVisible('invoiceCompanyName') && isRequired('invoiceCompanyName')) {
        return data.invoiceCompanyName && data.invoiceCompanyName.length >= 1
      }
      return true
    },
    {
      message: 'Şirket Adı zorunludur',
      path: ['invoiceCompanyName'],
    }
  )

  schema = schema.refine(
    (data) => {
      if (data.invoiceType === 'kurumsal' && isVisible('invoiceAddress') && isRequired('invoiceAddress')) {
        return data.invoiceAddress && data.invoiceAddress.length >= 1
      }
      return true
    },
    {
      message: 'Fatura Adresi zorunludur',
      path: ['invoiceAddress'],
    }
  )

  schema = schema.refine(
    (data) => {
      if (data.invoiceType === 'kurumsal' && isVisible('taxOffice') && isRequired('taxOffice')) {
        return data.taxOffice && data.taxOffice.length >= 1
      }
      return true
    },
    {
      message: 'Vergi Dairesi zorunludur',
      path: ['taxOffice'],
    }
  )

  schema = schema.refine(
    (data) => {
      if (data.invoiceType === 'kurumsal' && isVisible('taxNumber') && isRequired('taxNumber')) {
        return data.taxNumber && data.taxNumber.length >= 1
      }
      return true
    },
    {
      message: 'Vergi No zorunludur',
      path: ['taxNumber'],
    }
  )

  return schema
}
