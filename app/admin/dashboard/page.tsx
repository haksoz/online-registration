'use client'

import { useState, useEffect } from 'react'
import { formatTurkishCurrency } from '@/lib/currencyUtils'

interface CategoryStats {
  category_id: number
  category_name: string
  total_selections: number
  active_selections: number
  cancelled_selections: number
  total_revenue: number
  pending_revenue: number
  completed_revenue: number
}

interface DashboardStats {
  // Genel İstatistikler
  totalRegistrations: number
  activeRegistrations: number
  cancelledRegistrations: number
  
  // Seçim İstatistikleri
  totalSelections: number
  activeSelections: number
  cancelledSelections: number
  
  // Gelir İstatistikleri
  totalRevenue: number
  completedRevenue: number
  pendingRevenue: number
  
  // İade İstatistikleri
  refundPending: number
  refundPendingCount: number
  refundCompleted: number
  refundCompletedCount: number
  refundRejected: number
  refundRejectedCount: number
  
  // Kategorilere Göre
  byCategory: CategoryStats[]
  
  // Ödeme Yöntemine Göre
  byPaymentMethod: Array<{
    method: string
    count: number
    revenue: number
  }>
  
  // Günlük Trend
  byDay: Array<{
    date: string
    registrations: number
    selections: number
    revenue: number
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="bg-white p-8 rounded-lg text-center">
          <p className="text-gray-600">Veriler yüklenemedi</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📊 Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Kayıt ve seçim istatistikleri</p>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Toplam Gelir */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <p className="text-green-100 text-sm mb-2">💰 Toplam Gelir</p>
          <p className="text-3xl font-bold">{formatTurkishCurrency(stats.totalRevenue)}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-green-100 opacity-90">✅ Tahsil Edilen</p>
              <p className="text-xl font-semibold mt-1">{formatTurkishCurrency(stats.completedRevenue)}</p>
            </div>
            <div>
              <p className="text-green-100 opacity-90">⏳ Bekleyen</p>
              <p className="text-xl font-semibold mt-1">{formatTurkishCurrency(stats.pendingRevenue)}</p>
            </div>
          </div>
        </div>

        {/* İade Bekleyen */}
        {stats.refundPendingCount > 0 && (
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-xl shadow-lg text-white">
            <p className="text-amber-100 text-sm mb-2">↩️ İade Bekleyen</p>
            <p className="text-3xl font-bold">{formatTurkishCurrency(stats.refundPending)}</p>
            <p className="mt-4 text-sm text-amber-100">{stats.refundPendingCount} seçim bekliyor</p>
          </div>
        )}
      </div>

      {/* İade Detayları */}
      {(stats.refundPendingCount > 0 || stats.refundCompletedCount > 0 || stats.refundRejectedCount > 0) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">↩️ İade Detayları</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bekleyen İadeler */}
            {stats.refundPendingCount > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-yellow-800">⏳ Bekleyen</span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {stats.refundPendingCount} seçim
                  </span>
                </div>
                <p className="text-2xl font-bold text-yellow-900">
                  {formatTurkishCurrency(stats.refundPending)}
                </p>
              </div>
            )}

            {/* Tamamlanan İadeler */}
            {stats.refundCompletedCount > 0 && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-800">✅ Tamamlanan</span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {stats.refundCompletedCount} seçim
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {formatTurkishCurrency(stats.refundCompleted)}
                </p>
              </div>
            )}

            {/* Reddedilen İadeler */}
            {stats.refundRejectedCount > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-800">❌ Reddedilen</span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    {stats.refundRejectedCount} seçim
                  </span>
                </div>
                <p className="text-2xl font-bold text-red-900">
                  {formatTurkishCurrency(stats.refundRejected)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Kategorilere Göre İstatistikler */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Kategorilere Göre İstatistikler</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Toplam Seçim</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktif</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İptal</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Toplam Gelir</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tahsil Edilen</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Bekleyen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.byCategory.map((cat) => (
                <tr key={cat.category_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{cat.category_name}</td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">{cat.total_selections}</td>
                  <td className="px-6 py-4 text-sm text-right text-green-600">{cat.active_selections}</td>
                  <td className="px-6 py-4 text-sm text-right text-red-600">{cat.cancelled_selections}</td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                    {formatTurkishCurrency(cat.total_revenue)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-green-600">
                    {formatTurkishCurrency(cat.completed_revenue)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-amber-600">
                    {formatTurkishCurrency(cat.pending_revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ödeme Yöntemine Göre */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">💳 Ödeme Yöntemine Göre</h2>
          <div className="space-y-3">
            {stats.byPaymentMethod.map((item) => (
              <div key={item.method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.method === 'online' ? '🌐 Online Ödeme' : '🏦 Banka Transferi'}
                  </p>
                  <p className="text-xs text-gray-600">{item.count} kayıt</p>
                </div>
                <p className="text-lg font-bold text-green-600">{formatTurkishCurrency(item.revenue)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Son 7 Gün Trendi */}
        {stats.byDay.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📈 Son 7 Gün</h2>
            <div className="space-y-2">
              {stats.byDay.slice(0, 7).map((item) => {
                const isToday = new Date(item.date).toDateString() === new Date().toDateString()
                return (
                  <div key={item.date} className={`p-3 rounded-lg ${isToday ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                        {new Date(item.date).toLocaleDateString('tr-TR', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                        {isToday && ' (Bugün)'}
                      </span>
                      <span className="text-xs text-gray-600">{item.registrations} kayıt</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{item.selections} seçim</span>
                      <span className="font-semibold text-green-600">{formatTurkishCurrency(item.revenue)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
