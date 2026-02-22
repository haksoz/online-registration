'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function RegistrationSettingsPage() {
  const [notificationEmail, setNotificationEmail] = useState('')
  const [bccEmail, setBccEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/registration-settings')
      const data = await response.json()
      if (data.success) {
        setNotificationEmail(data.notificationEmail || '')
        setBccEmail(data.bccEmail || '')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const response = await fetch('/api/admin/registration-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationEmail, bccEmail })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Bir hata oluştu' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ayarlar kaydedilirken hata oluştu' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kayıt Ayarları</h1>
        <p className="text-gray-600 mt-1">Bildirim e-posta adreslerini yönetin</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Bilgi: Tarihler kategoride */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">📅 Kayıt tarihleri artık kategori bazlı</h3>
        <p className="text-sm text-amber-800">
          Kayıt başlangıç/son tarihi, iptal son tarihi ve erken kayıt bitiş tarihi artık her kategori için ayrı ayrı{' '}
          <Link href="/admin/categories" className="font-medium underline">Kayıt Kategorileri</Link>
          {' '}sayfasından ayarlanır. Kategori düzenleme formunda &quot;Kayıt Tarihleri&quot; bölümünü kullanın.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Kayıt Bildirim Mail Adresi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kayıt Bildirim Mail Adresi
          </label>
          <input
            type="email"
            value={notificationEmail}
            onChange={(e) => setNotificationEmail(e.target.value)}
            placeholder="bildirim@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="mt-2 text-sm text-gray-500">
            Her yeni kayıtta bu adrese bildirim maili gönderilir. Boş bırakırsanız bildirim gönderilmez.
          </p>
        </div>

        {/* Kayıt Bildirim BCC Mail Adresi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kayıt Bildirim BCC Mail Adresi
          </label>
          <input
            type="email"
            value={bccEmail}
            onChange={(e) => setBccEmail(e.target.value)}
            placeholder="bcc@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="mt-2 text-sm text-gray-500">
            Kullanıcıya giden onay mailine BCC (gizli kopya) olarak bu adres eklenir. Boş bırakırsanız BCC eklenmez.
          </p>
        </div>

        {/* Kaydet Butonu */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}
