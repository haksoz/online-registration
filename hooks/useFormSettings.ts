'use client'

import { useState, useEffect } from 'react'

export interface FormFieldSetting {
  field_name: string
  field_label: string
  field_type: string
  step_number: number
  is_visible: boolean
  is_required: boolean
  display_order: number
  placeholder?: string
  help_text?: string
}

export interface PaymentMethodSetting {
  method_name: string
  method_label: string
  method_label_en?: string
  is_enabled: boolean
  display_order: number
  description?: string
  warning_message?: string
  warning_message_en?: string
  icon?: string
}

export function useFormSettings() {
  const [fields, setFields] = useState<FormFieldSetting[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodSetting[]>([])
  const [registrationStartDate, setRegistrationStartDate] = useState<string>('')
  const [registrationDeadline, setRegistrationDeadline] = useState<string>('')
  const [invoiceIndividualNote, setInvoiceIndividualNote] = useState<string>('')
  const [invoiceCorporateNote, setInvoiceCorporateNote] = useState<string>('')
  const [invoiceIndividualNoteEn, setInvoiceIndividualNoteEn] = useState<string>('')
  const [invoiceCorporateNoteEn, setInvoiceCorporateNoteEn] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/form-settings')
      const data = await response.json()
      
      if (data.success) {
        // MySQL'den gelen 0/1 değerlerini boolean'a çevir
        const normalizedFields = (data.fields || []).map((field: any) => ({
          ...field,
          is_visible: Boolean(field.is_visible),
          is_required: Boolean(field.is_required)
        }))
        
        const normalizedPaymentMethods = (data.paymentMethods || []).map((method: any) => ({
          ...method,
          is_enabled: Boolean(method.is_enabled)
        }))
        
        setFields(normalizedFields)
        setPaymentMethods(normalizedPaymentMethods)
        setRegistrationStartDate(data.registrationStartDate || '')
        setRegistrationDeadline(data.registrationDeadline || '')
        setInvoiceIndividualNote(data.invoiceIndividualNote || '')
        setInvoiceCorporateNote(data.invoiceCorporateNote || '')
        setInvoiceIndividualNoteEn(data.invoiceIndividualNoteEn || '')
        setInvoiceCorporateNoteEn(data.invoiceCorporateNoteEn || '')
      }
    } catch (error) {
      console.error('Error fetching form settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const isFieldVisible = (fieldName: string): boolean => {
    const field = fields.find(f => f.field_name === fieldName)
    // Explicitly convert to boolean to handle 0/1 values
    return field ? Boolean(field.is_visible) : true // Default: visible
  }

  const isFieldRequired = (fieldName: string): boolean => {
    const field = fields.find(f => f.field_name === fieldName)
    // Explicitly convert to boolean to handle 0/1 values
    return field ? Boolean(field.is_required) : false // Default: not required
  }

  const getFieldSetting = (fieldName: string): FormFieldSetting | undefined => {
    return fields.find(f => f.field_name === fieldName)
  }

  const isPaymentMethodEnabled = (methodName: string): boolean => {
    const method = paymentMethods.find(m => m.method_name === methodName)
    return method?.is_enabled ?? true // Default: enabled
  }

  const getEnabledPaymentMethods = (): PaymentMethodSetting[] => {
    return paymentMethods.filter(m => m.is_enabled)
  }

  const isRegistrationOpen = (): boolean => {
    const now = new Date()
    
    // Başlangıç tarihi kontrolü
    if (registrationStartDate) {
      const startDate = new Date(registrationStartDate)
      if (now < startDate) return false // Henüz başlamadı
    }
    
    // Bitiş tarihi kontrolü
    if (registrationDeadline) {
      const deadline = new Date(registrationDeadline)
      if (now >= deadline) return false // Süresi doldu
    }
    
    return true // Kayıtlar açık
  }

  const isRegistrationNotStarted = (): boolean => {
    if (!registrationStartDate) return false
    const startDate = new Date(registrationStartDate)
    const now = new Date()
    return now < startDate
  }

  return {
    fields,
    paymentMethods,
    registrationStartDate,
    registrationDeadline,
    invoiceIndividualNote,
    invoiceCorporateNote,
    invoiceIndividualNoteEn,
    invoiceCorporateNoteEn,
    loading,
    isFieldVisible,
    isFieldRequired,
    getFieldSetting,
    isPaymentMethodEnabled,
    getEnabledPaymentMethods,
    isRegistrationOpen,
    isRegistrationNotStarted,
    refetch: fetchSettings
  }
}
