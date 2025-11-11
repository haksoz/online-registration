'use client'

import { useEffect, useState } from 'react'

interface FormFieldSetting {
  id: number
  field_name: string
  field_label: string
  field_type: string
  step_number: number
  is_visible: boolean
  is_required: boolean
  display_order: number
  placeholder?: string
}

interface PaymentMethodSetting {
  id: number
  method_name: string
  method_label: string
  is_enabled: boolean
  display_order: number
  description?: string
  icon?: string
}

export default function FormFieldsSettingsPage() {
  const [fields, setFields] = useState<FormFieldSetting[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodSetting[]>([])
  const [step2CurrencyType, setStep2CurrencyType] = useState('TRY')
  const [language, setLanguage] = useState('tr')
  const [invoiceIndividualNote, setInvoiceIndividualNote] = useState('')
  const [invoiceCorporateNote, setInvoiceCorporateNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/form-settings')
      const data = await response.json()
      
      if (data.success) {
        setFields(data.fields || [])
        setPaymentMethods(data.paymentMethods || [])
        setStep2CurrencyType(data.step2Settings?.currency_type || 'TRY')
        setLanguage(data.language || 'tr')
        setInvoiceIndividualNote(data.invoiceIndividualNote || '')
        setInvoiceCorporateNote(data.invoiceCorporateNote || '')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFieldToggle = (fieldName: string, type: 'visible' | 'required') => {
    setFields(fields.map(field => {
      if (field.field_name === fieldName) {
        return {
          ...field,
          [type === 'visible' ? 'is_visible' : 'is_required']: 
            type === 'visible' ? !field.is_visible : !field.is_required
        }
      }
      return field
    }))
  }

  const handlePaymentToggle = (methodName: string) => {
    setPaymentMethods(paymentMethods.map(method => {
      if (method.method_name === methodName) {
        return { ...method, is_enabled: !method.is_enabled }
      }
      return method
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/form-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fields, 
          paymentMethods,
          step2Settings: { currency_type: step2CurrencyType },
          language,
          invoiceIndividualNote,
          invoiceCorporateNote
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Bir hata oluştu' })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Ayarlar kaydedilirken hata oluştu' })
    } finally {
      setSaving(false)
    }
  }

  const step1Fields = fields.filter(f => f.step_number === 1)

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Form Ayarları</h1>
        <p className="text-gray-600 mt-1">Form alanlarının görünürlük ve zorunluluk ayarlarını yönetin</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Language Settings */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Form Dili</h2>
          <p className="text-sm text-gray-600 mt-1">Kayıt formunda kullanılacak dili seçin</p>
        </div>
        
        <div className="p-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dil Seçimi
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="tr">🇹🇷 Sadece Türkçe</option>
              <option value="en">🇬🇧 Sadece İngilizce</option>
              <option value="tr_en">🇹🇷 🇬🇧 Türkçe (varsayılan) + İngilizce seçeneği</option>
              <option value="en_tr">🇬🇧 🇹🇷 İngilizce (varsayılan) + Türkçe seçeneği</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              İki dilli seçeneklerde, kullanıcı Step 1'de dil değiştirebilir
            </p>
          </div>


        </div>
      </div>

      {/* Step 1 Fields */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Step 1: Kişisel Bilgiler</h2>
          <p className="text-sm text-gray-600 mt-1">Form alanlarının görünürlük ve zorunluluk durumlarını ayarlayın</p>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alan Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tip
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Görünür
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zorunlu
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {step1Fields.map((field) => (
                  <tr key={field.field_name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{field.field_label}</div>
                      <div className="text-xs text-gray-500">{field.field_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {field.field_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleFieldToggle(field.field_name, 'visible')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          field.is_visible ? 'bg-primary-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            field.is_visible ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {field.field_name === 'invoiceType' ? (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Her Zaman Zorunlu
                        </span>
                      ) : (
                        <button
                          onClick={() => handleFieldToggle(field.field_name, 'required')}
                          disabled={!field.is_visible}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            !field.is_visible ? 'opacity-50 cursor-not-allowed' : ''
                          } ${field.is_required ? 'bg-primary-600' : 'bg-gray-200'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              field.is_required ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invoice Notes */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Fatura Türü Notları</h2>
          <p className="text-sm text-gray-600 mt-1">Kullanıcı fatura türü seçtiğinde gösterilecek bilgilendirme notları</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bireysel Fatura Notu
            </label>
            <textarea
              value={invoiceIndividualNote}
              onChange={(e) => setInvoiceIndividualNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Bireysel fatura seçildiğinde gösterilecek not..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Örnek: "Bireysel fatura için TC Kimlik numaranız gereklidir."
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kurumsal Fatura Notu
            </label>
            <textarea
              value={invoiceCorporateNote}
              onChange={(e) => setInvoiceCorporateNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Kurumsal fatura seçildiğinde gösterilecek not..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Örnek: "Kurumsal fatura için şirket bilgileri ve vergi numarası gereklidir."
            </p>
          </div>
        </div>
      </div>

      {/* Step 2 Settings */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Step 2: Kayıt Türü Ayarları</h2>
          <p className="text-sm text-gray-600 mt-1">Kayıt türü seçiminde gösterilecek döviz türünü belirleyin</p>
        </div>
        
        <div className="p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gösterilecek Döviz Türü
            </label>
            <select
              value={step2CurrencyType}
              onChange={(e) => setStep2CurrencyType(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="TRY">Türk Lirası (₺)</option>
              <option value="USD">Amerikan Doları ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Kullanıcılar kayıt türü seçerken bu döviz cinsinden fiyatları görecekler
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Step 3: Ödeme Yöntemleri</h2>
          <p className="text-sm text-gray-600 mt-1">Hangi ödeme yöntemlerinin aktif olacağını seçin</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.method_name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{method.method_label}</div>
                    <div className="text-xs text-gray-500">{method.description}</div>
                  </div>
                </div>
                <button
                  onClick={() => handlePaymentToggle(method.method_name)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    method.is_enabled ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      method.is_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => fetchSettings()}
          disabled={saving}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          İptal
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </div>
    </div>
  )
}
