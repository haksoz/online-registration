'use client'

import { useState } from 'react'

interface AddRegistrationTypeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message?: string) => void
}

interface FormData {
  value: string
  label: string
  label_en: string
  fee_try: string
  fee_usd: string
  fee_eur: string
  description: string
  description_en: string
}

export default function AddRegistrationTypeModal({ isOpen, onClose, onSuccess }: AddRegistrationTypeModalProps) {
  const [formData, setFormData] = useState<FormData>({
    value: '',
    label: '',
    label_en: '',
    fee_try: '',
    fee_usd: '',
    fee_eur: '',
    description: '',
    description_en: ''
  })

  // Label'dan otomatik value oluştur
  const generateValue = (label: string): string => {
    return label
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
  }

  // Label değiştiğinde value'yu otomatik güncelle
  const handleLabelChange = (newLabel: string) => {
    setFormData({
      ...formData,
      label: newLabel,
      value: generateValue(newLabel)
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
          fee_try: formData.fee_try.trim() ? Number(formData.fee_try) : 0,
          fee_usd: formData.fee_usd.trim() ? Number(formData.fee_usd) : 0,
          fee_eur: formData.fee_eur.trim() ? Number(formData.fee_eur) : 0,
          description: formData.description.trim() || undefined,
          description_en: formData.description_en.trim() || undefined
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
    setFormData({ value: '', label: '', label_en: '', fee_try: '', fee_usd: '', fee_eur: '', description: '', description_en: '' })
    setErrors({})
    setSubmitting(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Yeni Kayıt Türü Ekle</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-2">
                Kayıt Türü Adı (Türkçe) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="label"
                value={formData.label}
                onChange={(e) => handleLabelChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Örnek: Öğrenci, Dernek Üyesi, vb."
                disabled={submitting}
              />
              {errors.label && <p className="mt-1 text-sm text-red-600">{errors.label}</p>}
            </div>

            <div>
              <label htmlFor="label_en" className="block text-sm font-medium text-gray-700 mb-2">
                Kayıt Türü Adı (İngilizce)
              </label>
              <input
                type="text"
                id="label_en"
                value={formData.label_en}
                onChange={(e) => setFormData({ ...formData, label_en: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Example: Student, Association Member, etc."
                disabled={submitting}
              />
              {errors.label_en && <p className="mt-1 text-sm text-red-600">{errors.label_en}</p>}
            </div>

            {formData.value && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Teknik ID (Otomatik)
                </label>
                <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-mono text-gray-700">
                  {formData.value}
                </div>
                <p className="mt-1 text-xs text-gray-500">Bu değer otomatik oluşturulur ve değiştirilemez</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="fee_try" className="block text-sm font-medium text-gray-700 mb-2">
                  Ücret (TRY)
                </label>
                <input
                  type="number"
                  id="fee_try"
                  value={formData.fee_try}
                  onChange={(e) => setFormData({ ...formData, fee_try: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="5000"
                  min="0"
                  step="0.01"
                  disabled={submitting}
                />
                {errors.fee_try && <p className="mt-1 text-sm text-red-600">{errors.fee_try}</p>}
              </div>

              <div>
                <label htmlFor="fee_usd" className="block text-sm font-medium text-gray-700 mb-2">
                  Ücret (USD)
                </label>
                <input
                  type="number"
                  id="fee_usd"
                  value={formData.fee_usd}
                  onChange={(e) => setFormData({ ...formData, fee_usd: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="150"
                  min="0"
                  step="0.01"
                  disabled={submitting}
                />
                {errors.fee_usd && <p className="mt-1 text-sm text-red-600">{errors.fee_usd}</p>}
              </div>

              <div>
                <label htmlFor="fee_eur" className="block text-sm font-medium text-gray-700 mb-2">
                  Ücret (EUR)
                </label>
                <input
                  type="number"
                  id="fee_eur"
                  value={formData.fee_eur}
                  onChange={(e) => setFormData({ ...formData, fee_eur: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="140"
                  min="0"
                  step="0.01"
                  disabled={submitting}
                />
                {errors.fee_eur && <p className="mt-1 text-sm text-red-600">{errors.fee_eur}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama (Türkçe)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Kayıt türü açıklaması (opsiyonel)"
                rows={2}
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="description_en" className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama (İngilizce)
              </label>
              <textarea
                id="description_en"
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Registration type description (optional)"
                rows={2}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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