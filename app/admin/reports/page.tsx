'use client'

import { useState, useEffect } from 'react'
import { formatTurkishCurrency } from '@/lib/currencyUtils'

interface ReportStats {
  totalRegistrations: number
  activeRegistrations: number
  cancelledRegistrations: number
  totalRevenue: number
  completedRevenue: number
  pendingRevenue: number
  refundAmount: number
  byRegistrationType: Array<{
    type: string
    label: string
    count: number
    revenue: number
  }>
  byPaymentMethod: Array<{
    method: string
    count: number
    revenue: number
  }>
  byPaymentStatus: Array<{
    status: string
    count: number
    revenue: number
  }>
  byMonth: Array<{
    month: string
    count: number
    revenue: number
  }>
  byDay: Array<{
    date: string
    count: number
    revenue: number
  }>
}

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all')

  useEffect(() => {
    fetchStats()
  }, [dateRange])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/reports?range=${dateRange}`)
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Raporlar</h1>
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
        <h1 className="text-2xl font-bold mb-6">Raporlar</h1>
        <div className="bg-white p-8 rounded-lg text-center">
          <p className="text-gray-600">Veriler yüklenemedi</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">📈 Detaylı Raporlar</h1>
        
        {/* Date Range Filter */}
        <div className="flex gap-2">
          {[
            { value: 'today', label: 'Bugün' },
            { value: 'week', label: 'Bu Hafta' },
            { value: 'month', label: 'Bu Ay' },
            { value: 'year', label: 'Bu Yıl' },
            { value: 'all', label: 'Tümü' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setDateRange(range.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === range.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <p className="text-blue-100 text-sm mb-1">Toplam Kayıt</p>
          <p className="text-4xl font-bold">{stats.totalRegistrations}</p>
          <div className="mt-2 text-sm text-blue-100">
            <span className="mr-3">✅ Aktif: {stats.activeRegistrations}</span>
            <span>❌ İptal: {stats.cancelledRegistrations}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <p className="text-green-100 text-sm mb-1">Toplam Gelir</p>
          <p className="text-3xl font-bold">{formatTurkishCurrency(stats.totalRevenue)}</p>
          <p className="mt-2 text-sm text-green-100">Tüm kayıtlar</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white">
          <p className="text-emerald-100 text-sm mb-1">Tahsil Edilen</p>
          <p className="text-3xl font-bold">{formatTurkishCurrency(stats.completedRevenue)}</p>
          <p className="mt-2 text-sm text-emerald-100">Ödeme tamamlandı</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-xl shadow-lg text-white">
          <p className="text-amber-100 text-sm mb-1">Bekleyen</p>
          <p className="text-3xl font-bold">{formatTurkishCurrency(stats.pendingRevenue)}</p>
          <p className="mt-2 text-sm text-amber-100">Tahsilat bekliyor</p>
        </div>
      </div>

      {/* İade Bilgisi */}
      {stats.refundAmount > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-3">↩️</span>
            <div>
              <p className="text-sm font-medium text-red-800">Toplam İade Tutarı</p>
              <p className="text-2xl font-bold text-red-900">{formatTurkishCurrency(stats.refundAmount)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Kayıt Türlerine Göre */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Kayıt Türlerine Göre</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kayıt Türü</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Adet</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gelir</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Oran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.byRegistrationType.map((item) => {
                const percentage = ((item.count / stats.totalRegistrations) * 100).toFixed(1)
                return (
                  <tr key={item.type} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.label}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">{item.count}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                      {formatTurkishCurrency(item.revenue)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">%{percentage}</td>
                  </tr>
                )
              })}
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

        {/* Ödeme Durumuna Göre */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">💰 Ödeme Durumuna Göre</h2>
          <div className="space-y-3">
            {stats.byPaymentStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.status === 'completed' ? '✅ Tamamlandı' : '⏳ Beklemede'}
                  </p>
                  <p className="text-xs text-gray-600">{item.count} kayıt</p>
                </div>
                <p className={`text-lg font-bold ${
                  item.status === 'completed' ? 'text-green-600' : 'text-amber-600'
                }`}>
                  {formatTurkishCurrency(item.revenue)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Aylık Trend */}
      {stats.byMonth.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📅 Aylık Trend</h2>
          <div className="space-y-3">
            {stats.byMonth.map((item) => {
              const maxRevenue = Math.max(...stats.byMonth.map(m => m.revenue))
              const percentage = (item.revenue / maxRevenue) * 100
              
              return (
                <div key={item.month} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.month}</span>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{item.count} kayıt</span>
                      <span className="text-green-600 font-semibold ml-3">
                        {formatTurkishCurrency(item.revenue)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{ width: `${Math.max(5, percentage)}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Günlük Detay (Son 30 gün) */}
      {stats.byDay.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Günlük Detay (Son 30 Gün)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Kayıt</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gelir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.byDay.slice(0, 30).map((item) => {
                  const isToday = new Date(item.date).toDateString() === new Date().toDateString()
                  return (
                    <tr key={item.date} className={`hover:bg-gray-50 ${isToday ? 'bg-blue-50' : ''}`}>
                      <td className={`px-6 py-3 text-sm ${isToday ? 'font-bold text-blue-600' : 'text-gray-900'}`}>
                        {new Date(item.date).toLocaleDateString('tr-TR', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                        {isToday && ' (Bugün)'}
                      </td>
                      <td className="px-6 py-3 text-sm text-right font-semibold text-gray-900">{item.count}</td>
                      <td className="px-6 py-3 text-sm text-right font-semibold text-green-600">
                        {formatTurkishCurrency(item.revenue)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
