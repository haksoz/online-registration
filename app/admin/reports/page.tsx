'use client'

import { useState, useEffect } from 'react'
import { formatTurkishCurrency } from '@/lib/currencyUtils'

interface CategoryRow {
  category_id: number
  category_name: string
  display_order?: number
  total_selections: number
  active_selections: number
  cancelled_selections: number
  total_revenue: number
  completed_revenue: number
  pending_revenue: number
}

interface TypeRow {
  type_id: number
  type_name: string
  category_name: string
  display_order?: number
  total_selections: number
  active_selections: number
  cancelled_selections: number
  total_revenue: number
  completed_revenue: number
}

interface PaymentMethodRow {
  method: string
  count: number
  revenue: number
}

interface DayRow {
  date: string
  registrations: number
  selections: number
  revenue: number
}

interface ReportData {
  totalRegistrations: number
  activeRegistrations: number
  cancelledRegistrations: number
  totalSelections: number
  activeSelections: number
  cancelledSelections: number
  totalRevenue: number
  completedRevenue: number
  pendingRevenue: number
  refundPending: number
  refundPendingCount: number
  refundCompleted: number
  refundCompletedCount: number
  refundRejected: number
  refundRejectedCount: number
  byCategory: CategoryRow[]
  byType: TypeRow[]
  byPaymentMethod: PaymentMethodRow[]
  byDay: DayRow[]
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/dashboard')
      const json = await res.json()
      if (json.success) setData(json.data)
      else setError(json.error || 'Veri alınamadı')
    } catch (e) {
      setError('Bağlantı hatası')
    } finally {
      setLoading(false)
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    if (method === 'bank_transfer') return 'Havale/EFT'
    if (method === 'online') return 'Online Ödeme'
    return method || '—'
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">📈 Raporlar</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">📈 Raporlar</h1>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-red-600">{error || 'Veri yüklenemedi'}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">📈 Raporlar</h1>
        <button
          onClick={fetchData}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Yenile
        </button>
      </div>

      {/* 1. Genel özet – parasal */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 px-6 py-4 border-b border-gray-200 bg-gray-50">
          Genel Parasal Özet
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metrik</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tutar (TL)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Adet</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-3 text-sm text-gray-900">Tamamlanmış toplam gelir</td>
                <td className="px-6 py-3 text-sm text-right font-medium text-green-700">{formatTurkishCurrency(data.completedRevenue)}</td>
                <td className="px-6 py-3 text-sm text-right text-gray-500">—</td>
              </tr>
              <tr>
                <td className="px-6 py-3 text-sm text-gray-900">Bekleyen toplam gelir</td>
                <td className="px-6 py-3 text-sm text-right font-medium text-amber-700">{formatTurkishCurrency(data.pendingRevenue)}</td>
                <td className="px-6 py-3 text-sm text-right text-gray-500">—</td>
              </tr>
              <tr>
                <td className="px-6 py-3 text-sm text-gray-900">Toplam gelir (aktif + iade bekleyen/reddedilen)</td>
                <td className="px-6 py-3 text-sm text-right font-medium text-gray-900">{formatTurkishCurrency(data.totalRevenue)}</td>
                <td className="px-6 py-3 text-sm text-right text-gray-500">—</td>
              </tr>
              <tr>
                <td className="px-6 py-3 text-sm text-gray-900">İade bekleyen tutar</td>
                <td className="px-6 py-3 text-sm text-right font-medium text-orange-700">{formatTurkishCurrency(data.refundPending)}</td>
                <td className="px-6 py-3 text-sm text-right text-gray-500">{data.refundPendingCount}</td>
              </tr>
              <tr>
                <td className="px-6 py-3 text-sm text-gray-900">İade reddedilen (sistemde kalan) tutar</td>
                <td className="px-6 py-3 text-sm text-right font-medium text-gray-700">{formatTurkishCurrency(data.refundRejected)}</td>
                <td className="px-6 py-3 text-sm text-right text-gray-500">{data.refundRejectedCount}</td>
              </tr>
              <tr>
                <td className="px-6 py-3 text-sm text-gray-900">İade edilen toplam tutar</td>
                <td className="px-6 py-3 text-sm text-right font-medium text-blue-700">{formatTurkishCurrency(data.refundCompleted)}</td>
                <td className="px-6 py-3 text-sm text-right text-gray-500">{data.refundCompletedCount}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium text-gray-900">Genel toplam tutar (sisteme giren)</td>
                <td className="px-6 py-3 text-sm text-right font-semibold text-gray-900">{formatTurkishCurrency(data.completedRevenue + data.refundCompleted)}</td>
                <td className="px-6 py-3 text-sm text-right text-gray-500">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Kayıt / seçim özeti */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 px-6 py-4 border-b border-gray-200 bg-gray-50">
          Kayıt ve Seçim Özeti
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metrik</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Adet</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr><td className="px-6 py-3 text-sm text-gray-900">Toplam kayıt</td><td className="px-6 py-3 text-sm text-right font-medium">{data.totalRegistrations}</td></tr>
              <tr><td className="px-6 py-3 text-sm text-gray-900">Aktif kayıt</td><td className="px-6 py-3 text-sm text-right">{data.activeRegistrations}</td></tr>
              <tr><td className="px-6 py-3 text-sm text-gray-900">İptal edilen kayıt</td><td className="px-6 py-3 text-sm text-right">{data.cancelledRegistrations}</td></tr>
              <tr><td className="px-6 py-3 text-sm text-gray-900">Toplam seçim (kalem)</td><td className="px-6 py-3 text-sm text-right font-medium">{data.totalSelections}</td></tr>
              <tr><td className="px-6 py-3 text-sm text-gray-900">Aktif seçim</td><td className="px-6 py-3 text-sm text-right">{data.activeSelections}</td></tr>
              <tr><td className="px-6 py-3 text-sm text-gray-900">İptal edilen seçim</td><td className="px-6 py-3 text-sm text-right">{data.cancelledSelections}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Kategoriye göre */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 px-6 py-4 border-b border-gray-200 bg-gray-50">
          Kayıt Kategorisine Göre Gelir
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Toplam Seçim</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktif</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İptal</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Toplam Gelir (TL)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tamamlanan (TL)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Bekleyen (TL)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(data.byCategory || []).map((row) => (
                <tr key={row.category_id}>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{row.category_name}</td>
                  <td className="px-6 py-3 text-sm text-right text-gray-600">{row.total_selections}</td>
                  <td className="px-6 py-3 text-sm text-right text-gray-600">{row.active_selections}</td>
                  <td className="px-6 py-3 text-sm text-right text-gray-600">{row.cancelled_selections}</td>
                  <td className="px-6 py-3 text-sm text-right font-medium">{formatTurkishCurrency(row.total_revenue)}</td>
                  <td className="px-6 py-3 text-sm text-right text-green-700">{formatTurkishCurrency(row.completed_revenue)}</td>
                  <td className="px-6 py-3 text-sm text-right text-amber-700">{formatTurkishCurrency(row.pending_revenue)}</td>
                </tr>
              ))}
              {(!data.byCategory || data.byCategory.length === 0) && (
                <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500 text-sm">Veri yok</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Kayıt türüne göre */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 px-6 py-4 border-b border-gray-200 bg-gray-50">
          Kayıt Türüne Göre Gelir
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kayıt Türü</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Toplam Seçim</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktif</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İptal</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Toplam Gelir (TL)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tamamlanan (TL)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(data.byType || []).map((row) => (
                <tr key={row.type_id}>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{row.type_name}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{row.category_name}</td>
                  <td className="px-6 py-3 text-sm text-right text-gray-600">{row.total_selections}</td>
                  <td className="px-6 py-3 text-sm text-right text-gray-600">{row.active_selections}</td>
                  <td className="px-6 py-3 text-sm text-right text-gray-600">{row.cancelled_selections}</td>
                  <td className="px-6 py-3 text-sm text-right font-medium">{formatTurkishCurrency(row.total_revenue)}</td>
                  <td className="px-6 py-3 text-sm text-right text-green-700">{formatTurkishCurrency(row.completed_revenue)}</td>
                </tr>
              ))}
              {(!data.byType || data.byType.length === 0) && (
                <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500 text-sm">Veri yok</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Ödeme yöntemine göre */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 px-6 py-4 border-b border-gray-200 bg-gray-50">
          Ödeme Yöntemine Göre
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yöntem</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Kayıt Adedi</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gelir (TL)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(data.byPaymentMethod || []).map((row, i) => (
                <tr key={row.method || i}>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{getPaymentMethodLabel(row.method)}</td>
                  <td className="px-6 py-3 text-sm text-right text-gray-600">{row.count}</td>
                  <td className="px-6 py-3 text-sm text-right font-medium">{formatTurkishCurrency(row.revenue)}</td>
                </tr>
              ))}
              {(!data.byPaymentMethod || data.byPaymentMethod.length === 0) && (
                <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500 text-sm">Veri yok</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Son 30 gün günlük trend */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 px-6 py-4 border-b border-gray-200 bg-gray-50">
          Son 30 Gün – Günlük Özet
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Kayıt</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Seçim</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gelir (TL)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(data.byDay || []).slice(0, 30).map((row) => (
                <tr key={row.date}>
                  <td className="px-6 py-3 text-sm text-gray-900">{row.date}</td>
                  <td className="px-6 py-3 text-sm text-right text-gray-600">{row.registrations}</td>
                  <td className="px-6 py-3 text-sm text-right text-gray-600">{row.selections}</td>
                  <td className="px-6 py-3 text-sm text-right font-medium">{formatTurkishCurrency(row.revenue)}</td>
                </tr>
              ))}
              {(!data.byDay || data.byDay.length === 0) && (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500 text-sm">Veri yok</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
