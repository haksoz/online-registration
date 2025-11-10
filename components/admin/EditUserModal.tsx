'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'manager' | 'reporter'
  created_at: string
}

interface EditUserModalProps {
  isOpen: boolean
  user: User | null
  onClose: () => void
  onSuccess: (message?: string) => void
}

interface UserFormData {
  email: string
  password: string
  name: string
  role: 'admin' | 'manager' | 'reporter'
}

export default function EditUserModal({ isOpen, user, onClose, onSuccess }: EditUserModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<UserFormData>()

  useEffect(() => {
    if (user && isOpen) {
      setValue('email', user.email)
      setValue('name', user.name || '')
      setValue('role', user.role)
      setValue('password', '') // Always start with empty password
    }
  }, [user, isOpen, setValue])

  const onSubmit = async (data: UserFormData) => {
    if (!user) return

    setSubmitting(true)
    try {
      // Only send fields that have values
      const updateData: any = {
        email: data.email,
        name: data.name,
        role: data.role,
      }

      // Only include password if it's not empty
      if (data.password && data.password.trim() !== '') {
        updateData.password = data.password
      }

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()

      if (response.ok) {
        reset()
        onSuccess(result.message)
      } else {
        alert(result.error || 'Kullanıcı güncellenirken hata oluştu')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Kullanıcı Düzenle</h3>
          <p className="text-sm text-gray-600 mt-1">ID: {user.id}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                id="name"
                {...register('name')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Kullanıcının adı ve soyadı"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                {...register('email', {
                  required: 'Email adresi zorunludur',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Geçerli bir email adresi girin'
                  }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="user@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Şifre
              </label>
              <input
                type="password"
                id="password"
                {...register('password', {
                  minLength: {
                    value: 6,
                    message: 'Şifre en az 6 karakter olmalıdır'
                  }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Değiştirmek için yeni şifre girin"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Boş bırakırsanız mevcut şifre korunur
              </p>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                {...register('role', { required: 'Rol seçimi zorunludur' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={user?.id === 1}
              >
                <option value="reporter">Reporter</option>
                <option value="manager">Yönetici</option>
                {user?.id === 1 && <option value="admin">Süper Admin</option>}
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {user?.id === 1 
                  ? 'Süper admin rolü değiştirilemez' 
                  : 'Reporter: Sadece görüntüleme, Yönetici: Kayıt yönetimi'
                }
              </p>
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