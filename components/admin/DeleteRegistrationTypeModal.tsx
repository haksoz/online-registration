'use client'

import { useState } from 'react'

import { RegistrationType } from '@/types/registration'

interface DeleteRegistrationTypeModalProps {
  isOpen: boolean
  registrationType: RegistrationType | null
  onClose: () => void
  onSuccess: (message?: string) => void
}

export default function DeleteRegistrationTypeModal({ 
  isOpen, 
  registrationType, 
  onClose, 
  onSuccess 
}: DeleteRegistrationTypeModalProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!registrationType) return

    setDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/registration-types/${registrationType.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        onSuccess(data.message || 'Kayıt türü başarıyla silindi')
        onClose()
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Bağlantı hatası oluştu')
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    setError(null)
    setDeleting(false)
    onClose()
  }

  if (!isOpen || !registrationType) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-900">Kayıt Türünü Sil</h3>
              <p className="text-sm text-gray-600">Bu işlem geri alınamaz!</p>
            </div>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Silinecek kayıt türü:</span>
            </p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {registrationType.label}
            </p>
            <p className="text-sm text-gray-600">
              Value: {registrationType.value} | Ücret: {registrationType.fee_try.toLocaleString('tr-TR')} TL
            </p>
          </div>

          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>Uyarı:</strong> Bu kayıt türü kullanımda ise silinemez. 
                  Sistem otomatik olarak kontrol edecektir.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={deleting}
            >
              İptal
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={deleting}
            >
              {deleting ? 'Siliniyor...' : 'Sil'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}