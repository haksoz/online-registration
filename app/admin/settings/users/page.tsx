'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import AddUserModal from '@/components/admin/AddUserModal'
import EditUserModal from '@/components/admin/EditUserModal'

interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'manager' | 'reporter'
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const { toasts, removeToast, success, error: showError } = useToast()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.data)
        setError(null)
      } else {
        const errorMsg = data.error || 'Kullanıcılar yüklenirken hata oluştu'
        setError(errorMsg)
        showError('Hata', errorMsg)
      }
    } catch (err) {
      const errorMsg = 'Bağlantı hatası oluştu'
      setError(errorMsg)
      showError('Bağlantı Hatası', errorMsg)
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const getRoleLabel = (role: string): string => {
    return role === 'admin' ? 'Süper Admin' : 
           role === 'manager' ? 'Yönetici' : 
           role === 'reporter' ? 'Reporter' : role
  }

  const getRoleBadge = (role: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    if (role === 'admin') {
      return `${baseClasses} bg-red-100 text-red-800`
    } else if (role === 'manager') {
      return `${baseClasses} bg-purple-100 text-purple-800`
    } else if (role === 'reporter') {
      return `${baseClasses} bg-blue-100 text-blue-800`
    }
    return `${baseClasses} bg-gray-100 text-gray-800`
  }

  const updateUserRole = async (userId: number, newRole: 'admin' | 'manager' | 'reporter') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      const data = await response.json()

      if (response.ok) {
        fetchUsers() // Refresh the table
        success('Başarılı', data.message || 'Kullanıcı rolü güncellendi')
      } else {
        showError('Hata', data.error || 'Güncelleme başarısız oldu')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      showError('Hata', 'Bir hata oluştu')
    }
  }

  const deleteUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setDeleteConfirm(null)
        fetchUsers() // Refresh the table
        success('Başarılı', data.message || 'Kullanıcı silindi')
      } else {
        showError('Hata', data.error || 'Silme işlemi başarısız oldu')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      showError('Hata', 'Bir hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin/settings" className="text-primary-600 hover:text-primary-800 text-sm mb-2 inline-block">
              ← Ayarlara Dön
            </Link>
            <h2 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h2>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin/settings" className="text-primary-600 hover:text-primary-800 text-sm mb-2 inline-block">
              ← Ayarlara Dön
            </Link>
            <h2 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h2>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Yeni Kullanıcı
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchUsers}
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/settings" className="text-primary-600 hover:text-primary-800 text-sm mb-2 inline-block">
            ← Ayarlara Dön
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h2>
          <p className="text-gray-600 mt-1">Admin paneline erişebilecek kullanıcıları yönetin</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Yeni Kullanıcı
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Oluşturulma Tarihi
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <p className="text-sm">Henüz kullanıcı bulunmamaktadır.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <span className={getRoleBadge(user.role)}>
                        {getRoleLabel(user.role)}
                      </span>
                      <div className="flex space-x-1">
                        {user.id !== 1 && (
                          <>
                            {user.role === 'reporter' && (
                              <button
                                onClick={() => updateUserRole(user.id, 'manager')}
                                className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                                title="Yönetici Yap"
                              >
                                ↑ Yönetici
                              </button>
                            )}
                            {user.role === 'manager' && (
                              <>
                                <button
                                  onClick={() => updateUserRole(user.id, 'reporter')}
                                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                  title="Reporter Yap"
                                >
                                  ↓ Reporter
                                </button>
                              </>
                            )}
                          </>
                        )}
                        {user.id === 1 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">
                            Korumalı
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleString('tr-TR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-primary-600 hover:text-primary-800 transition-colors"
                        title="Düzenle"
                      >
                        Düzenle
                      </button>
                      {user.id !== 1 && (
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Sil"
                        >
                          Sil
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Toplam {users.length} kullanıcı
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Kullanıcı Sil</h3>
              <p className="text-gray-600 mb-6">
                Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={() => deleteUser(deleteConfirm)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={(message) => {
          fetchUsers()
          setShowAddModal(false)
          success('Başarılı', message || 'Kullanıcı oluşturuldu')
        }}
      />

      <EditUserModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={(message) => {
          fetchUsers()
          setEditingUser(null)
          success('Başarılı', message || 'Kullanıcı güncellendi')
        }}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}