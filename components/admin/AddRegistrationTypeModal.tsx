'use client'

import { useState, useEffect } from 'react'

interface AddRegistrationTypeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message?: string) => void
}

interface FormData {
  value: string
  label: string
  label_en: string
  category_id: string
  fee_try: string
  fee_usd: string
  fee_eur: string
  early_bird_fee_try: string
  early_bird_fee_usd: string
  early_bird_fee_eur: string
  vat_rate: string
  description: string
  description_en: string
  requires_document: boolean
  document_label: string
  document_label_en: string
  document_description: string
  document_description_en: string
  capacity: string
}

interface Category {
  id: number
  name: string
  name_en?: string
  track_capacity?: boolean
}

export default function AddRegistrationTypeModal({ isOpen, onClose, onSuccess }: AddRegistrationTypeModalProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<FormData>({
    value: '',
    label: '',
    label_en: '',
    category_id: '',
    fee_try: '',
    fee_usd: '',
    fee_eur: '',
    early_bird_fee_try: '',
    early_bird_fee_usd: '',
    early_bird_fee_eur: '',
    vat_rate: '20',
    description: '',
    description_en: '',
    requires_document: false,
    document_label: '',
    document_label_en: '',
    document_description: '',
    document_description_en: '',
    capacity: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const MAX_LABEL_LEN = 255
  const MAX_VALUE_LEN = 255

  // Label'dan otomatik value oluştur (value max 255 karakter, label ile aynı)
  const generateValue = (label: string): string => {
    const slug = label
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
    return slug.slice(0, MAX_VALUE_LEN)
  }

  // Label değiştiğinde value'yu otomatik güncelle
  const handleLabelChange = (newLabel: string) => {
    const trimmed = newLabel.slice(0, MAX_LABEL_LEN)
    setFormData({
      ...formData,
      label: trimmed,
      value: generateValue(trimmed)
    })
  }
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [submitting, setSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.label.trim()) {
      newErrors.label = 'Kayıt türü adı zorunludur'
    }

    // Value otomatik oluşturulduğu için kontrol et
    if (!formData.value.trim()) {
      newErrors.label = 'Geçerli bir kayıt türü adı girin'
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Kategori seçimi zorunludur'
    }

    const selectedCategory = categories.find((c) => c.id === Number(formData.category_id))
    if (selectedCategory?.track_capacity) {
      const cap = formData.capacity.trim()
      if (!cap || isNaN(Number(cap)) || Number(cap) < 1) {
        newErrors.capacity = 'Bu kategoride kontenjan takibi açık; kapasite zorunludur (1 veya üzeri)'
      }
    }

    // Sayı validasyonları (boş olabilir)
    if (formData.fee_try.trim() && (isNaN(Number(formData.fee_try)) || Number(formData.fee_try) < 0)) {
      newErrors.fee_try = 'TL ücreti geçerli bir sayı olmalıdır'
    }

    if (formData.fee_usd.trim() && (isNaN(Number(formData.fee_usd)) || Number(formData.fee_usd) < 0)) {
      newErrors.fee_usd = 'USD ücreti geçerli bir sayı olmalıdır'
    }

    if (formData.fee_eur.trim() && (isNaN(Number(formData.fee_eur)) || Number(formData.fee_eur) < 0)) {
      newErrors.fee_eur = 'EUR ücreti geçerli bir sayı olmalıdır'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/registration-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: formData.value.trim(),
          label: formData.label.trim(),
          label_en: formData.label_en.trim() || undefined,
          category_id: Number(formData.category_id),
          fee_try: formData.fee_try.trim() ? Number(formData.fee_try) : 0,
          fee_usd: formData.fee_usd.trim() ? Number(formData.fee_usd) : 0,
          fee_eur: formData.fee_eur.trim() ? Number(formData.fee_eur) : 0,
          early_bird_fee_try: formData.early_bird_fee_try.trim() ? Number(formData.early_bird_fee_try) : null,
          early_bird_fee_usd: formData.early_bird_fee_usd.trim() ? Number(formData.early_bird_fee_usd) : null,
          early_bird_fee_eur: formData.early_bird_fee_eur.trim() ? Number(formData.early_bird_fee_eur) : null,
          vat_rate: formData.vat_rate.trim() ? Number(formData.vat_rate) / 100 : 0.20,
          description: formData.description.trim() || undefined,
          description_en: formData.description_en.trim() || undefined,
          requires_document: formData.requires_document,
          document_label: formData.requires_document ? formData.document_label.trim() || undefined : undefined,
          document_label_en: formData.requires_document ? formData.document_label_en.trim() || undefined : undefined,
          document_description: formData.requires_document ? formData.document_description.trim() || undefined : undefined,
          document_description_en: formData.requires_document ? formData.document_description_en.trim() || undefined : undefined,
          capacity: formData.capacity.trim() && !isNaN(Number(formData.capacity)) && Number(formData.capacity) >= 1 ? Number(formData.capacity) : null
        })
      })

      const data = await response.json()

      if (data.success) {
        handleClose()
        onSuccess(data.message || 'Kayıt türü başarıyla eklendi')
      } else {
        setErrors({ label: data.error })
      }
    } catch (error) {
      setErrors({ label: 'Bağlantı hatası oluştu' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({ 
      value: '', label: '', label_en: '', category_id: '', 
      fee_try: '', fee_usd: '', fee_eur: '', 
      early_bird_fee_try: '', early_bird_fee_usd: '', early_bird_fee_eur: '',
      vat_rate: '20', 
      description: '', description_en: '',
      requires_document: false, document_label: '', document_label_en: '',
      document_description: '', document_description_en: '',
      capacity: ''
    })
    setErrors({})
    setSubmitting(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-900">Yeni Kayıt Türü Ekle</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="label" className="block text-xs font-medium text-gray-700 mb-1">
                  Kayıt Türü Adı (TR) <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(en fazla {MAX_LABEL_LEN} karakter)</span>
                </label>
                <input
                  type="text"
                  id="label"
                  value={formData.label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  maxLength={MAX_LABEL_LEN}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Örn: Öğrenci"
                  disabled={submitting}
                />
                {errors.label && <p className="mt-1 text-xs text-red-600">{errors.label}</p>}
              </div>

              <div>
                <label htmlFor="label_en" className="block text-xs font-medium text-gray-700 mb-1">
                  Kayıt Türü Adı (EN) <span className="text-gray-400 font-normal">(en fazla {MAX_LABEL_LEN} karakter)</span>
                </label>
                <input
                  type="text"
                  id="label_en"
                  value={formData.label_en}
                  onChange={(e) => setFormData({ ...formData, label_en: e.target.value.slice(0, MAX_LABEL_LEN) })}
                  maxLength={MAX_LABEL_LEN}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Student"
                  disabled={submitting}
                />
                {errors.label_en && <p className="mt-1 text-xs text-red-600">{errors.label_en}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="value" className="block text-xs font-medium text-gray-700 mb-1">
                Teknik ID (slug) <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(en fazla {MAX_VALUE_LEN} karakter)</span>
              </label>
              <input
                type="text"
                id="value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value.slice(0, MAX_VALUE_LEN) })}
                maxLength={MAX_VALUE_LEN}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 font-mono"
                disabled={submitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                Kayıt türünü sistemde benzersiz tanımlayan kod (küçük harf, rakam, alt çizgi). Türkçe adı yazınca otomatik doldurulur; gerekirse elle düzenleyebilirsiniz. Aynı teknik ID iki türde kullanılamaz.
              </p>
              {errors.value && <p className="mt-1 text-xs text-red-600">{errors.value}</p>}
            </div>

            <div>
              <label htmlFor="category_id" className="block text-xs font-medium text-gray-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                id="category_id"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={submitting}
              >
                <option value="">Kategori Seçin</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="mt-1 text-xs text-red-600">{errors.category_id}</p>}
            </div>

            <div>
              <label htmlFor="capacity" className="block text-xs font-medium text-gray-700 mb-1">
                Kapasite (Kontenjan)
                {categories.find((c) => c.id === Number(formData.category_id))?.track_capacity && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="number"
                id="capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Boş = sınırsız"
                min="1"
                step="1"
                disabled={submitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                Kategori kontenjan takibi açıksa doldurulması zorunludur. Boş bırakılırsa sınırsız kabul edilir.
              </p>
              {errors.capacity && <p className="mt-1 text-xs text-red-600">{errors.capacity}</p>}
            </div>

            {/* Normal Fiyatlar */}
            <div className="border-t pt-3 mt-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Normal Fiyatlar</h4>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label htmlFor="fee_try" className="block text-xs font-medium text-gray-700 mb-1">
                    Ücret (TRY)
                  </label>
                  <input
                    type="number"
                    id="fee_try"
                    value={formData.fee_try}
                    onChange={(e) => setFormData({ ...formData, fee_try: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="5000"
                    min="0"
                    step="0.01"
                    disabled={submitting}
                  />
                  {errors.fee_try && <p className="mt-1 text-xs text-red-600">{errors.fee_try}</p>}
                </div>

                <div>
                  <label htmlFor="fee_usd" className="block text-xs font-medium text-gray-700 mb-1">
                    Ücret (USD)
                  </label>
                  <input
                    type="number"
                    id="fee_usd"
                    value={formData.fee_usd}
                    onChange={(e) => setFormData({ ...formData, fee_usd: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="150"
                    min="0"
                    step="0.01"
                    disabled={submitting}
                  />
                  {errors.fee_usd && <p className="mt-1 text-xs text-red-600">{errors.fee_usd}</p>}
                </div>

                <div>
                  <label htmlFor="fee_eur" className="block text-xs font-medium text-gray-700 mb-1">
                    Ücret (EUR)
                  </label>
                  <input
                    type="number"
                    id="fee_eur"
                    value={formData.fee_eur}
                    onChange={(e) => setFormData({ ...formData, fee_eur: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="140"
                    min="0"
                    step="0.01"
                    disabled={submitting}
                  />
                  {errors.fee_eur && <p className="mt-1 text-xs text-red-600">{errors.fee_eur}</p>}
                </div>

                <div>
                  <label htmlFor="vat_rate" className="block text-xs font-medium text-gray-700 mb-1">
                    KDV (%)
                  </label>
                  <input
                    type="number"
                    id="vat_rate"
                    value={formData.vat_rate}
                    onChange={(e) => setFormData({ ...formData, vat_rate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="20"
                    min="0"
                    max="100"
                    step="0.01"
                    disabled={submitting}
                  />
                  {errors.vat_rate && <p className="mt-1 text-xs text-red-600">{errors.vat_rate}</p>}
                </div>
              </div>
            </div>

            {/* Erken Kayıt Fiyatları */}
            <div className="border-t pt-3 mt-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                🎯 Erken Kayıt Fiyatları <span className="text-xs font-normal text-gray-500">(Opsiyonel)</span>
              </h4>
              <p className="text-xs text-gray-500 mb-2">
                Erken kayıt bitiş tarihine kadar bu fiyatlar uygulanır. Boş bırakılırsa normal fiyat geçerli olur.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="early_bird_fee_try" className="block text-xs font-medium text-gray-700 mb-1">
                    Erken Kayıt (TRY)
                  </label>
                  <input
                    type="number"
                    id="early_bird_fee_try"
                    value={formData.early_bird_fee_try}
                    onChange={(e) => setFormData({ ...formData, early_bird_fee_try: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="4000"
                    min="0"
                    step="0.01"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="early_bird_fee_usd" className="block text-xs font-medium text-gray-700 mb-1">
                    Erken Kayıt (USD)
                  </label>
                  <input
                    type="number"
                    id="early_bird_fee_usd"
                    value={formData.early_bird_fee_usd}
                    onChange={(e) => setFormData({ ...formData, early_bird_fee_usd: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="120"
                    min="0"
                    step="0.01"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="early_bird_fee_eur" className="block text-xs font-medium text-gray-700 mb-1">
                    Erken Kayıt (EUR)
                  </label>
                  <input
                    type="number"
                    id="early_bird_fee_eur"
                    value={formData.early_bird_fee_eur}
                    onChange={(e) => setFormData({ ...formData, early_bird_fee_eur: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="110"
                    min="0"
                    step="0.01"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-medium text-gray-700 mb-1">
                Açıklama (Türkçe)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Kayıt türü açıklaması (opsiyonel)"
                rows={2}
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="description_en" className="block text-xs font-medium text-gray-700 mb-1">
                Açıklama (İngilizce)
              </label>
              <textarea
                id="description_en"
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Registration type description (optional)"
                rows={2}
                disabled={submitting}
              />
            </div>

            {/* Belge Gereksinimleri */}
            <div className="col-span-2 border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Belge Gereksinimleri</h4>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requires_document"
                  checked={formData.requires_document}
                  onChange={(e) => setFormData({ ...formData, requires_document: e.target.checked })}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                  disabled={submitting}
                />
                <label htmlFor="requires_document" className="ml-2 text-sm font-medium text-gray-700">
                  Bu kayıt türü için belge yükleme zorunlu
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-6">
                Seçildiğinde, kullanıcılar bu kayıt türünü seçtiklerinde belge yüklemek zorunda kalacaklar.
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? 'Ekleniyor...' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}