'use client'

import { useEffect, useState } from 'react'
import AddRegistrationTypeModal from '@/components/admin/AddRegistrationTypeModal'
import EditRegistrationTypeModal from '@/components/admin/EditRegistrationTypeModal'
import DeleteRegistrationTypeModal from '@/components/admin/DeleteRegistrationTypeModal'
import RegistrationTypesTable from '@/components/admin/RegistrationTypesTable'
import { ToastContainer } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { RegistrationType } from '@/types/registration'

export default function RegistrationTypesPage() {
  const [registrationTypes, setRegistrationTypes] = useState<RegistrationType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingType, setEditingType] = useState<RegistrationType | null>(null)
  const [deletingType, setDeletingType] = useState<RegistrationType | null>(null)
  const { toasts, removeToast, success, error: showError } = useToast()

  const fetchRegistrationTypes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/registration-types')
      const data = await response.json()
      
      if (data.success) {
        setRegistrationTypes(data.data)
        setError(null)
      } else {
        const errorMsg = data.error || 'Kayıt türleri yüklenirken hata oluştu'
        setError(errorMsg)
        showError('Hata', errorMsg)
      }
    } catch (err) {
      const errorMsg = 'Bağlantı hatası oluştu'
      setError(errorMsg)
      showError('Bağlantı Hatası', errorMsg)
      console.error('Error fetching registration types:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistrationTypes()
  }, [])

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Kayıt Türleri</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Yeni Ekle
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchRegistrationTypes}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Kayıt Türleri</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Yeni Ekle
        </button>
      </div>

      <RegistrationTypesTable
        registrationTypes={registrationTypes}
        loading={loading}
        onEdit={(type) => {
          setEditingType(type)
          setShowEditModal(true)
        }}
        onDelete={(type) => {
          setDeletingType(type)
          setShowDeleteModal(true)
        }}
        onToggleActive={async (type) => {
          const newActive = !(type as any).is_active
          const res = await fetch(`/api/admin/registration-types/${type.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: newActive }),
          })
          const data = await res.json()
          if (data.success) fetchRegistrationTypes()
          else showError('Hata', data.error || 'Güncellenemedi')
        }}
      />

      <AddRegistrationTypeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={(message) => {
          fetchRegistrationTypes()
          setShowAddModal(false)
          success('Başarılı', message || 'Kayıt türü eklendi')
        }}
      />

      <EditRegistrationTypeModal
        isOpen={showEditModal}
        registrationType={editingType}
        onClose={() => {
          setShowEditModal(false)
          setEditingType(null)
        }}
        onSuccess={(message) => {
          fetchRegistrationTypes()
          setShowEditModal(false)
          setEditingType(null)
          success('Başarılı', message || 'Kayıt türü güncellendi')
        }}
      />

      <DeleteRegistrationTypeModal
        isOpen={showDeleteModal}
        registrationType={deletingType}
        onClose={() => {
          setShowDeleteModal(false)
          setDeletingType(null)
        }}
        onSuccess={(message) => {
          fetchRegistrationTypes()
          setShowDeleteModal(false)
          setDeletingType(null)
          success('Başarılı', message || 'Kayıt türü silindi')
        }}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

