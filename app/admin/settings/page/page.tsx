'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/useToast'

interface PageSettings {
  form_title: string
  form_title_en: string
  form_subtitle: string
  form_subtitle_en: string
  form_general_warning: string
  form_general_warning_en: string
  banner_image_url: string
  header_title_font_size: string
  header_subtitle_font_size: string
  header_background_color: string
  currency_type: string
  organization_name: string
  contact_email: string
  contact_phone: string
  homepage_url: string
}

// Helper to darken color for gradient
const adjustColorForPreview = (color: string, percent: number) => {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1)
}

export default function PageSettingsPage() {
  const [settings, setSettings] = useState<PageSettings>({
    form_title: '',
    form_title_en: '',
    form_subtitle: '',
    form_subtitle_en: '',
    form_general_warning: '',
    form_general_warning_en: '',
    banner_image_url: '',
    header_title_font_size: '48',
    header_subtitle_font_size: '24',
    header_background_color: '#667eea',
    currency_type: 'TRY',
    organization_name: '',
    contact_email: '',
    contact_phone: '',
    homepage_url: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { success: showSuccess, error: showError } = useToast()

  // Ayarları yükle
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/page-settings')
      const data = await response.json()
      
      if (data.success) {
        setSettings(data.data)
      } else {
        showError('Ayarlar yüklenemedi')
      }
    } catch (error) {
      console.error('Settings fetch error:', error)
      showError('Ayarlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/admin/page-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      })
      
      const data = await response.json()
      
      if (data.success) {
        showSuccess('Sayfa ayarları güncellendi')
      } else {
        showError(data.error || 'Güncelleme başarısız')
      }
    } catch (error) {
      console.error('Settings save error:', error)
      showError('Güncelleme başarısız')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (key: keyof PageSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        handleInputChange('banner_image_url', data.url)
        showSuccess('Görsel başarıyla yüklendi')
      } else {
        showError(data.error || 'Görsel yüklenemedi')
      }
    } catch (error) {
      console.error('Upload error:', error)
      showError('Görsel yüklenirken hata oluştu')
    } finally {
      setUploading(false)
      // Input'u temizle
      e.target.value = ''
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sayfa Ayarları</h1>
        <p className="text-sm text-gray-600 mt-1">
          Ana sayfanın başlık ve mesajlarını yönetin
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Form Başlığı */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sayfa Başlığı (Türkçe)
              </label>
              <input
                type="text"
                value={settings.form_title}
                onChange={(e) => handleInputChange('form_title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Hoş Geldiniz! 👋"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ana sayfada görünen başlık metni (opsiyonel)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sayfa Başlığı (İngilizce)
              </label>
              <input
                type="text"
                value={settings.form_title_en}
                onChange={(e) => handleInputChange('form_title_en', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Welcome! 👋"
              />
              <p className="text-xs text-gray-500 mt-1">
                Page title text displayed on the main page (optional)
              </p>
            </div>
          </div>

          {/* Form Alt Başlığı */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sayfa Alt Başlığı (Türkçe)
              </label>
              <input
                type="text"
                value={settings.form_subtitle}
                onChange={(e) => handleInputChange('form_subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Kayıt formunu doldurmak için aşağıdaki adımları takip edin."
              />
              <p className="text-xs text-gray-500 mt-1">
                Başlık altında görünen açıklama metni
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sayfa Alt Başlığı (İngilizce)
              </label>
              <input
                type="text"
                value={settings.form_subtitle_en}
                onChange={(e) => handleInputChange('form_subtitle_en', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Follow the steps below to complete the registration form."
              />
              <p className="text-xs text-gray-500 mt-1">
                Description text displayed under the title
              </p>
            </div>
          </div>

          {/* Form Genel Uyarı Mesajı */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form Genel Uyarı Mesajı (Türkçe)
              </label>
              <input
                type="text"
                value={settings.form_general_warning}
                onChange={(e) => handleInputChange('form_general_warning', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="* ile işaretli tüm alanları eksiksiz doldurun."
              />
              <p className="text-xs text-gray-500 mt-1">
                Form altında görünen uyarı mesajı
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form Genel Uyarı Mesajı (İngilizce)
              </label>
              <input
                type="text"
                value={settings.form_general_warning_en}
                onChange={(e) => handleInputChange('form_general_warning_en', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Please fill in all fields marked with *."
              />
              <p className="text-xs text-gray-500 mt-1">
                Warning message displayed at the bottom of the form
              </p>
            </div>
          </div>

          {/* Döviz Türü Seçimi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Döviz Türü <span className="text-red-500">*</span>
            </label>
            <select
              value={settings.currency_type}
              onChange={(e) => handleInputChange('currency_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="TRY">Türk Lirası (TRY)</option>
              <option value="USD">Amerikan Doları (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Kayıt formunda gösterilecek döviz türü (Step 2 - Kayıt Türü)
            </p>
          </div>

          {/* Header Stil Ayarları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlık Font Boyutu (px)
              </label>
              <input
                type="number"
                min="12"
                max="120"
                value={settings.header_title_font_size}
                onChange={(e) => handleInputChange('header_title_font_size', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="48"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alt Başlık Font Boyutu (px)
              </label>
              <input
                type="number"
                min="12"
                max="80"
                value={settings.header_subtitle_font_size}
                onChange={(e) => handleInputChange('header_subtitle_font_size', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arka Plan Rengi
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.header_background_color}
                  onChange={(e) => handleInputChange('header_background_color', e.target.value)}
                  className="h-10 w-16 border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.header_background_color}
                  onChange={(e) => handleInputChange('header_background_color', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="#667eea"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Görsel yoksa bu renk kullanılır
              </p>
            </div>
          </div>

          {/* Arka Plan Görseli */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arka Plan Görseli
            </label>
            
            {/* Dosya Yükleme */}
            <div className="mb-3">
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-1 text-sm text-gray-600">
                    {uploading ? 'Yükleniyor...' : 'Görsel yüklemek için tıklayın'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG veya WebP (Max 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            {/* URL Girişi */}
            <div className="relative">
              <input
                type="url"
                value={settings.banner_image_url}
                onChange={(e) => handleInputChange('banner_image_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="veya görsel URL'i girin: https://example.com/image.jpg"
              />
              {settings.banner_image_url && (
                <button
                  type="button"
                  onClick={() => handleInputChange('banner_image_url', '')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                  title="Görseli kaldır"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            <p className="text-xs text-gray-500 mt-1">
              Sayfa başlığının arkasında görünecek arka plan görseli (önerilen: 1920x600px)
            </p>
            
            {/* Görsel Önizleme */}
            {settings.banner_image_url && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-700 mb-2">Önizleme:</p>
                <div 
                  className="relative w-full h-48 overflow-hidden rounded-lg border border-gray-300"
                  style={{
                    backgroundImage: `url(${settings.banner_image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h2 className="text-2xl font-bold mb-2">
                        {settings.form_title || 'Sayfa Başlığı'}
                      </h2>
                      {settings.form_subtitle && (
                        <p className="text-sm">{settings.form_subtitle}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Organizasyon Adı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organizasyon Adı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={settings.organization_name}
              onChange={(e) => handleInputChange('organization_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Online Kayıt Sistemi"
            />
            <p className="text-xs text-gray-500 mt-1">
              Sistem genelinde kullanılan organizasyon adı
            </p>
          </div>

          {/* İletişim Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İletişim E-posta
              </label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="info@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İletişim Telefonu
              </label>
              <input
                type="tel"
                value={settings.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="+90 (212) 123 45 67"
              />
            </div>
          </div>

          {/* Anasayfa URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anasayfa URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={settings.homepage_url}
              onChange={(e) => handleInputChange('homepage_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Kayıt tamamlandıktan sonra "Anasayfa" butonunun yönlendireceği adres
            </p>
          </div>
        </div>

        {/* Tam Sayfa Önizleme */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tam Sayfa Önizleme</h3>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
            {/* Header Container with Background - Conditional */}
            {(settings.form_title || settings.form_subtitle || settings.banner_image_url) && (
              <div 
                className="relative w-full rounded-lg overflow-hidden shadow-lg mb-4 min-h-[180px] flex items-center justify-center"
                style={{
                  background: settings.banner_image_url 
                    ? `url(${settings.banner_image_url})` 
                    : `linear-gradient(135deg, ${settings.header_background_color || '#667eea'} 0%, ${adjustColorForPreview(settings.header_background_color || '#667eea', -20)} 100%)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-transparent"></div>
                
                {/* Content */}
                <div className="relative z-10 text-center py-6 px-4">
                  {settings.form_title && (
                    <h1 
                      className="font-bold text-white mb-2 drop-shadow-2xl leading-tight"
                      style={{ fontSize: `${Math.min(parseInt(settings.header_title_font_size) || 48, 40)}px` }}
                    >
                      {settings.form_title}
                    </h1>
                  )}
                  {settings.form_subtitle && (
                    <p 
                      className="text-white/95 max-w-2xl mx-auto drop-shadow-lg font-medium leading-snug"
                      style={{ fontSize: `${Math.min(parseInt(settings.header_subtitle_font_size) || 24, 20)}px` }}
                    >
                      {settings.form_subtitle}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Form Card - Overlapping if header exists */}
            <div className={`${(settings.form_title || settings.form_subtitle || settings.banner_image_url) ? '-mt-8' : ''} relative z-10`}>
              <div className="bg-white rounded-lg shadow-xl p-6">
                {/* Progress Indicator Placeholder */}
                <div className="flex items-center justify-between mb-6">
                  {[1, 2, 3, 4].map((step, index) => (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          step === 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {step}
                        </div>
                      </div>
                      {index < 3 && (
                        <div className={`h-1 flex-1 mx-2 ${
                          step === 1 ? 'bg-primary-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Form Content Placeholder */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <p className="text-center text-gray-400 text-sm">Form İçeriği</p>
                </div>

                {/* General Warning at Bottom */}
                {settings.form_general_warning && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs text-amber-800 font-medium">
                          {settings.form_general_warning}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kaydet Butonu */}
        <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}