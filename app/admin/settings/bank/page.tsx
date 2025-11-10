'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/useToast'

interface BankAccount {
  id: number
  account_name: string
  bank_name: string
  account_holder: string
  iban: string
  currency: string
  description: string
  is_active: boolean
  display_order: number
}

interface PaymentSettings {
  dekont_email: string
  dekont_message: string
}

export default function BankSettingsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [settings, setSettings] = useState<PaymentSettings>({
    dekont_email: '',
    dekont_message: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const { success: showSuccess, error: showError } = useToast()

  // Verileri yükle
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/bank-settings')
      const data = await response.json()
      
      if (data.success) {
        setAccounts(data.data.accounts || [])
        setSettings(data.data.settings || { dekont_email: '', dekont_message: '' })
      } else {
        showError('Veriler yüklenemedi')
      }
    } catch (error) {
      console.error('Data fetch error:', error)
      showError('Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/admin/bank-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      })
      
      const data = await response.json()
      
      if (data.success) {
        showSuccess('Ödeme ayarları güncellendi')
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

  const handleDeleteAccount = async (id: number) => {
    if (!confirm('Bu banka hesabını silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/bank-accounts/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        showSuccess('Banka hesabı silindi')
        fetchData()
      } else {
        showError(data.error || 'Silme işlemi başarısız')
      }
    } catch (error) {
      console.error('Delete error:', error)
      showError('Silme işlemi başarısız')
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
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Banka Ayarları</h1>
        <p className="text-sm text-gray-600 mt-1">
          Banka transferi için kullanılacak hesapları ve ödeme ayarlarını yönetin
        </p>
      </div>

      {/* Banka Hesapları Listesi */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Banka Hesapları</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              + Yeni Hesap Ekle
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hesap Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Banka
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IBAN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Para Birimi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Henüz banka hesabı bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{account.account_name}</div>
                        {account.description && (
                          <div className="text-sm text-gray-500">{account.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{account.bank_name}</div>
                      <div className="text-sm text-gray-500">{account.account_holder}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{account.iban}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {account.currency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        account.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {account.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingAccount(account)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ödeme Ayarları */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ödeme Ayarları</h2>
        
        <div className="space-y-4">
          {/* Dekont E-posta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dekont E-posta Adresi <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={settings.dekont_email}
              onChange={(e) => setSettings(prev => ({ ...prev, dekont_email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="dekont@ornek.com"
            />
          </div>

          {/* Dekont Mesajı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dekont Mesajı
            </label>
            <textarea
              value={settings.dekont_message}
              onChange={(e) => setSettings(prev => ({ ...prev, dekont_message: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Lütfen dekontunuzu {email} adresine iletiniz."
            />
            <p className="text-xs text-gray-500 mt-1">
              {'{email}'} kısmı otomatik olarak e-posta adresi ile değiştirilir
            </p>
          </div>
        </div>

        {/* Kaydet Butonu */}
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddForm || editingAccount) && (
        <BankAccountModal
          account={editingAccount}
          onClose={() => {
            setShowAddForm(false)
            setEditingAccount(null)
          }}
          onSave={() => {
            setShowAddForm(false)
            setEditingAccount(null)
            fetchData()
          }}
        />
      )}
    </div>
  )
}

// Modal Component
interface BankAccountModalProps {
  account?: BankAccount | null
  onClose: () => void
  onSave: () => void
}

function BankAccountModal({ account, onClose, onSave }: BankAccountModalProps) {
  const [formData, setFormData] = useState({
    account_name: account?.account_name || '',
    bank_name: account?.bank_name || '',
    account_holder: account?.account_holder || '',
    iban: account?.iban || '',
    currency: account?.currency || 'TRY',
    swift_code: (account as any)?.swift_code || '',
    bank_address: (account as any)?.bank_address || '',
    account_number: (account as any)?.account_number || '',
    description: account?.description || '',
    is_active: account?.is_active !== false,
    display_order: account?.display_order || 0
  })
  const [saving, setSaving] = useState(false)
  const { success: showSuccess, error: showError } = useToast()

  const handleSave = async () => {
    // Validation
    if (!formData.account_name || !formData.bank_name || !formData.account_holder || !formData.iban) {
      showError('Lütfen zorunlu alanları doldurun')
      return
    }

    // Döviz hesapları için ek validasyon
    if (formData.currency !== 'TRY') {
      if (!formData.swift_code || !formData.account_number || !formData.bank_address) {
        showError('Döviz hesapları için SWIFT kodu, hesap numarası ve banka adresi zorunludur')
        return
      }
    }

    try {
      setSaving(true)
      
      const url = account 
        ? `/api/admin/bank-accounts/${account.id}`
        : '/api/admin/bank-settings'
      
      const method = account ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        showSuccess(account ? 'Banka hesabı güncellendi' : 'Banka hesabı eklendi')
        onSave()
      } else {
        showError(data.error || 'İşlem başarısız')
      }
    } catch (error) {
      console.error('Save error:', error)
      showError('İşlem başarısız')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {account ? 'Banka Hesabını Düzenle' : 'Yeni Banka Hesabı Ekle'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Hesap Adı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hesap Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.account_name}
                onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Örnek: Ana Hesap (TRY)"
              />
            </div>

            {/* Banka Adı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banka Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.bank_name}
                onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Örnek: Enpara Bank A.Ş."
              />
            </div>

            {/* Hesap Sahibi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hesap Sahibi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.account_holder}
                onChange={(e) => setFormData(prev => ({ ...prev, account_holder: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Şirket/Kişi adı"
              />
            </div>

            {/* IBAN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IBAN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.iban}
                onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                placeholder="TR86 0015 7000 0000 0066 6455 24"
                maxLength={34}
              />
            </div>

            {/* Döviz Hesapları için Ek Alanlar */}
            {formData.currency !== 'TRY' && (
              <>
                {/* SWIFT/BIC Kodu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SWIFT/BIC Kodu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.swift_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, swift_code: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                    placeholder="ENPBTR22"
                    maxLength={11}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Uluslararası transferler için gerekli
                  </p>
                </div>

                {/* Hesap Numarası */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hesap Numarası <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                    placeholder="1234567890"
                  />
                </div>

                {/* Banka Adresi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banka Adresi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.bank_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_address: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Banka şube adresi"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Uluslararası transferler için gerekli
                  </p>
                </div>
              </>
            )}

            {/* Para Birimi ve Aktif Durum */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Para Birimi
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="TRY">TRY (Türk Lirası)</option>
                  <option value="USD">USD (Amerikan Doları)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="GBP">GBP (İngiliz Sterlini)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sıralama
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                />
              </div>
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Bu hesap hakkında açıklama..."
              />
            </div>

            {/* Aktif Durum */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Aktif (Kullanıcı formunda gösterilsin)
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Kaydediliyor...' : (account ? 'Güncelle' : 'Ekle')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}