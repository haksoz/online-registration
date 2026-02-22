'use client'

import { useEffect, useState } from 'react'

interface FormFieldSetting {
  id: number
  field_name: string
  field_label: string
  field_label_en?: string
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
  warning_message?: string
  warning_message_en?: string
  icon?: string
}

export default function FormFieldsSettingsPage() {
  const [fields, setFields] = useState<FormFieldSetting[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodSetting[]>([])
  const [step2CurrencyType, setStep2CurrencyType] = useState('TRY')
  const [showPriceWithVat, setShowPriceWithVat] = useState(true)
  const [showEarlyBirdNotice, setShowEarlyBirdNotice] = useState(true)
  const [homepageUrl, setHomepageUrl] = useState('')
  const [language, setLanguage] = useState('tr')
  const [invoiceIndividualNote, setInvoiceIndividualNote] = useState('')
  const [invoiceCorporateNote, setInvoiceCorporateNote] = useState('')
  const [invoiceIndividualNoteEn, setInvoiceIndividualNoteEn] = useState('')
  const [invoiceCorporateNoteEn, setInvoiceCorporateNoteEn] = useState('')
  const [kvkkPopupTr, setKvkkPopupTr] = useState('')
  const [kvkkPopupEn, setKvkkPopupEn] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethodSetting | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

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
        setShowPriceWithVat(data.showPriceWithVat !== false)
        setShowEarlyBirdNotice(data.showEarlyBirdNotice !== false)
        setHomepageUrl(data.homepageUrl || '')
        setLanguage(data.language || 'tr')
        setInvoiceIndividualNote(data.invoiceIndividualNote || '')
        setInvoiceCorporateNote(data.invoiceCorporateNote || '')
        setInvoiceIndividualNoteEn(data.invoiceIndividualNoteEn || '')
        setInvoiceCorporateNoteEn(data.invoiceCorporateNoteEn || '')
        setKvkkPopupTr(data.kvkkPopupTr ?? '')
        setKvkkPopupEn(data.kvkkPopupEn ?? '')
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
          showPriceWithVat,
          showEarlyBirdNotice,
          homepageUrl,
          language,
          invoiceIndividualNote,
          invoiceCorporateNote,
          invoiceIndividualNoteEn,
          invoiceCorporateNoteEn,
          kvkkPopupTr,
          kvkkPopupEn
        })
      })

      const data = await response.json()

      if (data.success) {
        const successMessage = 'Ayarlar başarıyla kaydedildi! Form sayfasını yenileyerek değişiklikleri görebilirsiniz.'
        setMessage({ type: 'success', text: successMessage })
        setTimeout(() => setMessage(null), 5000)
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

  const step1Fields = fields.filter(f => Number(f.step_number ?? 1) === 1)

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
                {step1Fields.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                      Step 1 alanı bulunamadı. Veritabanında <code className="bg-gray-100 px-1 rounded">form_field_settings</code> tablosunda <code className="bg-gray-100 px-1 rounded">step_number = 1</code> olan kayıtların bulunması gerekir.
                    </td>
                  </tr>
                ) : step1Fields.map((field) => (
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

      {/* KVKK Aydınlatma */}
      {(() => {
        const kvkkField = fields.find(f => f.field_name === 'kvkk_consent')
        if (!kvkkField) return null
        return (
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">KVKK Aydınlatma</h2>
              <p className="text-sm text-gray-600 mt-1">Step 1 formunda İleri butonunun üstünde gösterilir. Checkbox metni ve popup içeriği TR/EN düzenlenebilir.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Görünür</span>
                  <button
                    onClick={() => handleFieldToggle('kvkk_consent', 'visible')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${kvkkField.is_visible ? 'bg-primary-600' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${kvkkField.is_visible ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Zorunlu</span>
                  <button
                    onClick={() => handleFieldToggle('kvkk_consent', 'required')}
                    disabled={!kvkkField.is_visible}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!kvkkField.is_visible ? 'opacity-50 cursor-not-allowed' : ''} ${kvkkField.is_required ? 'bg-primary-600' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${kvkkField.is_required ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🇹🇷 Checkbox metni (Türkçe)</label>
                  <input
                    type="text"
                    value={kvkkField.field_label}
                    onChange={(e) => setFields(fields.map(f => f.field_name === 'kvkk_consent' ? { ...f, field_label: e.target.value } : f))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="KVKK Aydınlatma Metni'ni okudum, anladım ve kabul ediyorum."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🇬🇧 Checkbox label (English)</label>
                  <input
                    type="text"
                    value={kvkkField.field_label_en ?? ''}
                    onChange={(e) => setFields(fields.map(f => f.field_name === 'kvkk_consent' ? { ...f, field_label_en: e.target.value } : f))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="I have read, understood and accept the KVKK Privacy Notice."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🇹🇷 Popup içeriği (Türkçe)</label>
                  <textarea
                    value={kvkkPopupTr}
                    onChange={(e) => setKvkkPopupTr(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Metni oku tıklandığında açılacak aydınlatma metni..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🇬🇧 Popup content (English)</label>
                  <textarea
                    value={kvkkPopupEn}
                    onChange={(e) => setKvkkPopupEn(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="KVKK notice text shown in the popup..."
                  />
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Invoice Notes */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Fatura Türü Notları</h2>
          <p className="text-sm text-gray-600 mt-1">Kullanıcı fatura türü seçtiğinde gösterilecek bilgilendirme notları</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🇹🇷 Bireysel Fatura Notu (Türkçe)
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
                🇬🇧 Individual Invoice Note (English)
              </label>
              <textarea
                value={invoiceIndividualNoteEn}
                onChange={(e) => setInvoiceIndividualNoteEn(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Note to show when individual invoice is selected..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: "Your Turkish ID number is required for individual invoice."
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🇹🇷 Kurumsal Fatura Notu (Türkçe)
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🇬🇧 Corporate Invoice Note (English)
              </label>
              <textarea
                value={invoiceCorporateNoteEn}
                onChange={(e) => setInvoiceCorporateNoteEn(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Note to show when corporate invoice is selected..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: "Company information and tax number are required for corporate invoice."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2 Settings */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Step 2: Kayıt Türü Ayarları</h2>
          <p className="text-sm text-gray-600 mt-1">Kayıt türü seçiminde gösterilecek ayarları belirleyin</p>
        </div>
        
        <div className="p-6 space-y-6">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fiyat Gösterimi
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priceDisplay"
                  value="with_vat"
                  checked={showPriceWithVat}
                  onChange={() => setShowPriceWithVat(true)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">KDV Dahil</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priceDisplay"
                  value="without_vat"
                  checked={!showPriceWithVat}
                  onChange={() => setShowPriceWithVat(false)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">KDV Hariç</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Kayıt türlerinde fiyatların KDV dahil mi yoksa KDV hariç mi gösterileceğini belirler
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showEarlyBirdNotice}
                onChange={(e) => setShowEarlyBirdNotice(e.target.checked)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Erken Kayıt Uyarısını Göster
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-2 ml-6">
              Erken kayıt döneminde, kayıt türlerinin altında "X tarihinden sonra ücret Y olacaktır" uyarısı gösterilir
            </p>
          </div>
        </div>
      </div>

      {/* Step 4 Settings - Homepage URL */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Step 4: Kayıt Tamamlama Ayarları</h2>
          <p className="text-sm text-gray-600 mt-1">Kayıt tamamlandıktan sonra yönlendirilecek anasayfa URL'i</p>
        </div>
        
        <div className="p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anasayfa URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={homepageUrl}
              onChange={(e) => setHomepageUrl(e.target.value)}
              className="w-full max-w-2xl px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://example.com"
            />
            <p className="text-xs text-gray-500 mt-2">
              Kayıt tamamlandıktan sonra "Anasayfa" butonunun yönlendireceği adres
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
          {paymentMethods.length === 0 ? (
            <p className="text-sm text-gray-500">
              Ödeme yöntemi bulunamadı. Veritabanında <code className="bg-gray-100 px-1 rounded">payment_method_settings</code> tablosunda kayıt olmalıdır. Sayfayı yenileyin; tablo boşsa varsayılanlar (Online Ödeme, Banka Transferi) otomatik eklenir.
            </p>
          ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.method_name} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between mb-3">
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
                <button
                  onClick={() => {
                    setEditingPaymentMethod(method)
                    setShowPaymentModal(true)
                  }}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  ⚠️ Uyarı Mesajını Düzenle
                </button>
              </div>
            ))}
          </div>
          )}
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

      {/* Payment Method Warning Modal */}
      {showPaymentModal && editingPaymentMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {editingPaymentMethod.method_label} - Uyarı Mesajı
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Bu ödeme yöntemi seçildiğinde gösterilecek uyarı mesajını girin
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Uyarı Mesajı (Türkçe)
                </label>
                <textarea
                  value={editingPaymentMethod.warning_message || ''}
                  onChange={(e) => setEditingPaymentMethod({
                    ...editingPaymentMethod,
                    warning_message: e.target.value
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Dikkat: Bu ödeme yöntemi için özel şartlar geçerlidir..."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Warning Message (English)
                </label>
                <textarea
                  value={editingPaymentMethod.warning_message_en || ''}
                  onChange={(e) => setEditingPaymentMethod({
                    ...editingPaymentMethod,
                    warning_message_en: e.target.value
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Note: Special conditions apply for this payment method..."
                  rows={4}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  setEditingPaymentMethod(null)
                  fetchSettings()
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/admin/payment-methods/${editingPaymentMethod.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        warning_message: editingPaymentMethod.warning_message,
                        warning_message_en: editingPaymentMethod.warning_message_en
                      })
                    })
                    
                    if (response.ok) {
                      setMessage({ type: 'success', text: 'Uyarı mesajı kaydedildi' })
                      setShowPaymentModal(false)
                      setEditingPaymentMethod(null)
                      fetchSettings()
                    }
                  } catch (error) {
                    setMessage({ type: 'error', text: 'Kaydetme hatası' })
                  }
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
