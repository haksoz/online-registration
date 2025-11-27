'use client'

import { useEffect, useState } from 'react'

export default function RegistrationSettingsPage() {
  const [registrationStartDate, setRegistrationStartDate] = useState('')
  const [registrationDeadline, setRegistrationDeadline] = useState('')
  const [cancellationDeadline, setCancellationDeadline] = useState('')
  const [earlyBirdDeadline, setEarlyBirdDeadline] = useState('')
  const [earlyBirdEnabled, setEarlyBirdEnabled] = useState(false)
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
        setRegistrationStartDate(data.registrationStartDate || '')
        setRegistrationDeadline(data.registrationDeadline || '')
        setCancellationDeadline(data.cancellationDeadline || '')
        setEarlyBirdDeadline(data.earlyBirdDeadline || '')
        setEarlyBirdEnabled(data.earlyBirdEnabled || false)
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
        body: JSON.stringify({ 
          registrationStartDate,
          registrationDeadline,
          cancellationDeadline,
          earlyBirdDeadline,
          earlyBirdEnabled,
          notificationEmail,
          bccEmail
        })
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
        <p className="text-gray-600 mt-1">Kayıt ve iptal tarihlerini yönetin</p>
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

      {/* Durum Göstergesi */}
      {(registrationStartDate || registrationDeadline || cancellationDeadline) && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mevcut Durum</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {registrationStartDate && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Kayıt Başlangıcı</span>
                  {new Date() >= new Date(registrationStartDate) ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      ✅ Başladı
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      ⏳ Bekliyor
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Başlangıç: {new Date(registrationStartDate).toLocaleString('tr-TR')}
                </p>
              </div>
            )}
            
            {registrationDeadline && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Kayıt Durumu</span>
                  {(() => {
                    const now = new Date()
                    const startDate = registrationStartDate ? new Date(registrationStartDate) : null
                    const endDate = new Date(registrationDeadline)
                    
                    if (startDate && now < startDate) {
                      return (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          ⏳ Henüz Başlamadı
                        </span>
                      )
                    } else if (now < endDate) {
                      return (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          ✅ Açık
                        </span>
                      )
                    } else {
                      return (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          🚫 Kapalı
                        </span>
                      )
                    }
                  })()}
                </div>
                <p className="text-xs text-gray-500">
                  Son tarih: {new Date(registrationDeadline).toLocaleString('tr-TR')}
                </p>
              </div>
            )}
            
            {cancellationDeadline && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">İptal Durumu</span>
                  {new Date() < new Date(cancellationDeadline) ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      ✅ İzin Veriliyor
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                      ⚠️ Süre Doldu
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Son tarih: {new Date(cancellationDeadline).toLocaleString('tr-TR')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Kayıt Başlangıç Tarihi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kayıt Başlangıç Tarihi
          </label>
          <input
            type="datetime-local"
            value={registrationStartDate}
            onChange={(e) => setRegistrationStartDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="mt-2 text-sm text-gray-500">
            Bu tarihten önce form sayfasını açanlara "Kayıtlar henüz açılmadı" uyarısı gösterilir. Boş bırakırsanız kayıtlar hemen açık olur.
          </p>
        </div>

        {/* Kayıt Son Tarihi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kayıt Son Tarihi
          </label>
          <input
            type="datetime-local"
            value={registrationDeadline}
            onChange={(e) => setRegistrationDeadline(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="mt-2 text-sm text-gray-500">
            Bu tarihten sonra yeni kayıtlar kabul edilmeyecektir. Boş bırakırsanız kayıtlar süresiz açık kalır.
          </p>
        </div>

        {/* Kayıt İptal Son Tarihi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kayıt İptal Son Tarihi
          </label>
          <input
            type="datetime-local"
            value={cancellationDeadline}
            onChange={(e) => setCancellationDeadline(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="mt-2 text-sm text-gray-500">
            Bu tarihten sonra kayıtlar iptal edilemez. Boş bırakırsanız iptal işlemi süresiz açık kalır.
          </p>
        </div>

        {/* Erken Kayıt Ayarları */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Erken Kayıt Ayarları</h3>
          
          {/* Erken Kayıt Aktif/Pasif */}
          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={earlyBirdEnabled}
                onChange={(e) => setEarlyBirdEnabled(e.target.checked)}
                className="w-5 h-5 text-primary-600 focus:ring-primary-500 rounded"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">
                Erken Kayıt Fiyatlandırmasını Aktif Et
              </span>
            </label>
            <p className="mt-2 ml-8 text-sm text-gray-500">
              Aktif edildiğinde, belirlenen tarihe kadar kayıt türlerinde tanımlanan erken kayıt fiyatları uygulanır.
            </p>
          </div>

          {/* Erken Kayıt Bitiş Tarihi */}
          {earlyBirdEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Erken Kayıt Bitiş Tarihi <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={earlyBirdDeadline}
                onChange={(e) => setEarlyBirdDeadline(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required={earlyBirdEnabled}
              />
              <p className="mt-2 text-sm text-gray-500">
                Bu tarihten sonra normal fiyatlar geçerli olacaktır. Kayıt türlerinde erken kayıt fiyatları tanımlanmış olmalıdır.
              </p>
              
              {/* Erken Kayıt Durumu */}
              {earlyBirdDeadline && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    {new Date() < new Date(earlyBirdDeadline) ? (
                      <>
                        <span className="text-2xl mr-2">✅</span>
                        <div>
                          <p className="text-sm font-semibold text-blue-900">Erken Kayıt Fiyatları Aktif</p>
                          <p className="text-xs text-blue-700">
                            {new Date(earlyBirdDeadline).toLocaleString('tr-TR')} tarihine kadar erken kayıt fiyatları uygulanacak
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl mr-2">⏰</span>
                        <div>
                          <p className="text-sm font-semibold text-orange-900">Erken Kayıt Süresi Doldu</p>
                          <p className="text-xs text-orange-700">
                            Normal fiyatlar uygulanıyor
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

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

        {/* Bilgilendirme */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Önemli Bilgiler</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Kayıt başlangıç tarihinden önce form sayfasını açanlara "Kayıtlar henüz açılmadı" mesajı gösterilir</li>
                  <li>Kayıt son tarihi geçtikten sonra ana sayfada kayıt formu görünmez</li>
                  <li>İptal son tarihi geçtikten sonra kayıt detay sayfasında <strong>dikkat çekici uyarı</strong> gösterilir</li>
                  <li>Admin panelinden her zaman manuel işlem yapabilirsiniz (uyarıya rağmen)</li>
                </ul>
              </div>
            </div>
          </div>
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
