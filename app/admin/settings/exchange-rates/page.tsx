'use client'

import { useEffect, useState } from 'react'

interface ExchangeRate {
  id: number
  currency_code: string
  currency_name: string
  rate_to_try: number
  source: string
  last_updated: string
}

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [editingRates, setEditingRates] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchRates()
  }, [])

  const fetchRates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/exchange-rates')
      const data = await response.json()
      
      if (data.success) {
        setRates(data.rates)
        // Initialize editing rates
        const initialRates: Record<string, string> = {}
        data.rates.forEach((rate: ExchangeRate) => {
          initialRates[rate.currency_code] = rate.rate_to_try.toString()
        })
        setEditingRates(initialRates)
      }
    } catch (error) {
      console.error('Error fetching rates:', error)
      showMessage('error', 'Kurlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchFromTCMB = async () => {
    try {
      setFetching(true)
      const response = await fetch('/api/admin/exchange-rates/fetch-tcmb', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        showMessage('success', 'TCMB kurları başarıyla güncellendi')
        fetchRates()
      } else {
        showMessage('error', data.error || 'Kurlar güncellenirken hata oluştu')
      }
    } catch (error) {
      console.error('Error fetching TCMB rates:', error)
      showMessage('error', 'TCMB kurları çekilirken hata oluştu')
    } finally {
      setFetching(false)
    }
  }

  const handleRateChange = (currencyCode: string, value: string) => {
    setEditingRates({
      ...editingRates,
      [currencyCode]: value
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const updatedRates = rates.map(rate => ({
        currency_code: rate.currency_code,
        rate_to_try: Number(editingRates[rate.currency_code])
      }))

      const response = await fetch('/api/admin/exchange-rates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rates: updatedRates })
      })

      const data = await response.json()

      if (data.success) {
        showMessage('success', 'Kurlar başarıyla güncellendi')
        fetchRates()
      } else {
        showMessage('error', data.error || 'Kurlar güncellenirken hata oluştu')
      }
    } catch (error) {
      console.error('Error saving rates:', error)
      showMessage('error', 'Kurlar kaydedilirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR')
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
        <h1 className="text-2xl font-bold text-gray-900">Döviz Kurları</h1>
        <p className="text-gray-600 mt-1">Döviz kurlarını görüntüleyin ve güncelleyin</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Actions */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={fetchFromTCMB}
          disabled={fetching}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {fetching && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          TCMB'den Güncelle
        </button>
      </div>

      {/* Exchange Rates Table */}
      <div className="bg-white rounded-lg shadow">
        {rates.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Döviz kuru kaydı bulunamadı. Sayfayı yenileyin; varsayılan TRY/USD/EUR kurları otomatik eklenir. Sorun sürerse veritabanında <code className="text-xs bg-gray-100 px-1">migrations/016_exchange_rates_seed.sql</code> dosyasını çalıştırın.
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Döviz
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kod
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TL Kuru
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kaynak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Son Güncelleme
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rates.map((rate) => (
                <tr key={rate.currency_code} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{rate.currency_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {rate.currency_code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">₺</span>
                      <input
                        type="number"
                        step="0.0001"
                        value={editingRates[rate.currency_code] || ''}
                        onChange={(e) => handleRateChange(rate.currency_code, e.target.value)}
                        className="w-32 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      rate.source === 'tcmb' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rate.source === 'tcmb' ? 'TCMB' : 'Manuel'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(rate.last_updated)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={fetchRates}
          disabled={saving}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          İptal
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </div>

      {/* Info Box */}
      {rates.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Döviz Kuru Bilgileri</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>TCMB'den Güncelle butonu ile güncel kurları otomatik çekebilirsiniz</li>
                <li>Manuel olarak kurları düzenleyebilir ve kaydedebilirsiniz</li>
                <li>Kurlar kayıt türü fiyatlarının hesaplanmasında kullanılır</li>
                <li>1 {rates[0].currency_code} = {editingRates[rates[0].currency_code] ?? rates[0].rate_to_try} TL</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
