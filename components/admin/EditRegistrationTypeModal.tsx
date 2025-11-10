'use client'

import { useState, useEffect } from 'react'

import { RegistrationType } from '@/types/registration'

interface EditRegistrationTypeModalProps {
  isOpen: boolean
  registrationType: RegistrationType | null
  onClose: () => void
  onSuccess: (message?: string) => void
}

interface FormData {
  label: string
  label_en: string
  fee_try: string
  fee_usd: string
  fee_eur: string
  description: string
  description_en: string
}

export default function EditRegistrationTypeModal({ 
  isOpen, 
  registrationType, 
  onClose, 
  onSuccess 
}: EditRegistrationTypeModalProps) {
  const [formData, setFormData] = useState<FormData>({
    label: '',
    label_en: '',
    fee_try: '',
    fee_usd: '',
    fee_eur: '',
    description: '',
    description_en: ''
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (registrationType) {
      setFormData({
        label: registrationType.label,
        label_en: (registrationType as any).label_en || '',
        fee_try: registrationType.fee_try?.toString() || '0',
        fee_usd: registrationType.fee_usd?.toString() || '0',
        fee_eur: registrationType.fee_eur?.toString() || '0',
        description: registrationType.description || '',
        description_en: (registrationType as any).description_en || ''
      })
    }
  }, [registrationType])

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.label.trim()) {
      newErrors.label = 'Label alanı zorunludur'
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
    
    if (!validateForm() || !registrationType) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/registration-types/${registrationType.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        onSuccess(data.message || 'Kayıt türü başarıyla güncellendi')
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
    setFormData({ label: '', label_en: '', fee_try: '', fee_usd: '', fee_eur: '', description: '', description_en: '' })
    setErrors({})
    setSubmitting(false)
    onClose()
  }

  if (!isOpen || !registrationType) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Kayıt Türünü Düzenle</h3>
          <p className="text-sm text-gray-600 mt-1">Value: {registrationType.value}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-label" className="block text-sm font-medium text-gray-700 mb-2">
                Label (Türkçe) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="edit-label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={submitting}
              />
              {errors.label && <p className="mt-1 text-sm text-red-600">{errors.label}</p>}
            </div>

            <div>
              <label htmlFor="edit-label-en" className="block text-sm font-medium text-gray-700 mb-2">
                Label (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="edit-label-en"
                value={formData.label_en}
                onChange={(e) => setFormData({ ...formData, label_en: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={submitting}
              />
              {errors.label_en && <p className="mt-1 text-sm text-red-600">{errors.label_en}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="edit-fee-try" className="block text-sm font-medium text-gray-700 mb-2">
                  Ücret (TRY)
                </label>
                <input
                  type="number"
                  id="edit-fee-try"
                  value={formData.fee_try}
                  onChange={(e) => setFormData({ ...formData, fee_try: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  step="0.01"
                  disabled={submitting}
                />
                {errors.fee_try && <p className="mt-1 text-sm text-red-600">{errors.fee_try}</p>}
              </div>

              <div>
                <label htmlFor="edit-fee-usd" className="block text-sm font-medium text-gray-700 mb-2">
                  Ücret (USD)
                </label>
                <input
                  type="number"
                  id="edit-fee-usd"
                  value={formData.fee_usd}
                  onChange={(e) => setFormData({ ...formData, fee_usd: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  step="0.01"
                  disabled={submitting}
                />
                {errors.fee_usd && <p className="mt-1 text-sm text-red-600">{errors.fee_usd}</p>}
              </div>

              <div>
                <label htmlFor="edit-fee-eur" className="block text-sm font-medium text-gray-700 mb-2">
                  Ücret (EUR)
                </label>
                <input
                  type="number"
                  id="edit-fee-eur"
                  value={formData.fee_eur}
                  onChange={(e) => setFormData({ ...formData, fee_eur: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  step="0.01"
                  disabled={submitting}
                />
                {errors.fee_eur && <p className="mt-1 text-sm text-red-600">{errors.fee_eur}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama (Türkçe)
              </label>
              <textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={2}
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="edit-description-en" className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama (İngilizce)
              </label>
              <textarea
                id="edit-description-en"
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              {submitting ? 'Güncelleniyor...' : 'Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}