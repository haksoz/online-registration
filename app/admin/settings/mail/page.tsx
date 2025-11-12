'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/useToast'

interface MailSettings {
  smtp_host: string
  smtp_port: string
  smtp_secure: string
  smtp_user: string
  smtp_password: string
  from_email: string
  from_name: string
  admin_email: string
  send_user_confirmation: string
  send_admin_notification: string
}

export default function MailSettingsPage() {
  const [settings, setSettings] = useState<MailSettings>({
    smtp_host: '',
    smtp_port: '587',
    smtp_secure: 'tls',
    smtp_user: '',
    smtp_password: '',
    from_email: '',
    from_name: 'Online Kayıt Sistemi',
    admin_email: '',
    send_user_confirmation: '1',
    send_admin_notification: '1'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const { success: showSuccess, error: showError } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/mail-settings')
      const data = await response.json()
      if (data.success) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error fetching mail settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/mail-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })
      const data = await response.json()
      if (data.success) {
        showSuccess('Mail ayarları kaydedildi')
      } else {
        showError(data.error || 'Kaydetme başarısız')
      }
    } catch (error) {
      showError('Kaydetme başarısız')
    } finally {
      setSaving(false)
    }
  }

  const handleTestMail = async () => {
    if (!testEmail) {
      showError('Lütfen test mail adresi girin')
      return
    }
    
    setTesting(true)
    try {
      const response = await fetch('/api/admin/mail-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, testEmail })
      })
      const data = await response.json()
      if (data.success) {
        showSuccess('Test maili gönderildi! Gelen kutunuzu kontrol edin.')
      } else {
        showError(data.error || 'Test maili gönderilemedi')
      }
    } catch (error) {
      showError('Test maili gönderilemedi')
    } finally {
      setTesting(false)
    }
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Mail Ayarları</h1>
        <p className="text-sm text-gray-600 mt-1">
          SMTP ayarlarını yapılandırın ve mail gönderimini test edin
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* SMTP Sunucu Ayarları */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">SMTP Sunucu Ayarları</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Host <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={settings.smtp_host}
                onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="smtp.gmail.com"
              />
              <p className="text-xs text-gray-500 mt-1">SMTP sunucu adresi</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Port <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={settings.smtp_port}
                onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="587"
              />
              <p className="text-xs text-gray-500 mt-1">Genellikle 587 (TLS) veya 465 (SSL)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Güvenlik Protokolü
              </label>
              <select
                value={settings.smtp_secure}
                onChange={(e) => setSettings({ ...settings, smtp_secure: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="tls">TLS (Port 587)</option>
                <option value="ssl">SSL (Port 465)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Kullanıcı Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={settings.smtp_user}
                onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="your-email@gmail.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Şifre <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={settings.smtp_password}
                  onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Gmail için: Uygulama şifresi kullanın (2FA aktifse)
              </p>
            </div>
          </div>
        </div>

        {/* Gönderen Bilgileri */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Gönderen Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gönderen E-posta <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={settings.from_email}
                onChange={(e) => setSettings({ ...settings, from_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="noreply@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gönderen Adı
              </label>
              <input
                type="text"
                value={settings.from_name}
                onChange={(e) => setSettings({ ...settings, from_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Online Kayıt Sistemi"
              />
            </div>


          </div>
        </div>

        {/* Test Mail Bölümü */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Mail Gönder</h2>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Test mailinin gönderileceği e-posta adresi
              </p>
            </div>
            <button
              onClick={handleTestMail}
              disabled={testing || !settings.smtp_host || !settings.from_email || !testEmail}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 h-fit"
            >
              {testing ? 'Gönderiliyor...' : 'Gönder'}
            </button>
          </div>
        </div>

        {/* Kaydet Butonu */}
        <div className="flex gap-3 pt-6 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}
