'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatTurkishCurrency } from '@/lib/currencyUtils'

interface DashboardStats {
  totals: {
    registrations: number
    thisMonth: number
    today: number
    revenue: number
    pendingRevenue: number
    cancelled: number
  }
  paymentStats: Array<{ payment_status: string; count: number }>
  registrationTypeStats: Array<{ registration_type: string; count: number; type_label: string }>
  paymentMethodStats: Array<{ payment_method: string; count: number }>
  weeklyTrend: Array<{ date: string; count: number }>
  recentRegistrations: Array<{
    id: number
    full_name: string
    email: string
    registration_type: string
    type_label: string
    payment_status: string
    fee: number
    created_at: string
  }>
  refundStats: Array<{ refund_status: string; count: number }>
  deadlines: {
    registration_start_date?: string
    registration_deadline?: string
    cancellation_deadline?: string
  }
  exchangeRates: Array<{
    currency_code: string
    rate: number
    updated_at: string
  }>
  deviceStats: Array<{ device_type: string; count: number }>
  riskStats: {
    high_risk: number
    medium_risk: number
    low_risk: number
  }
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
      console.log('📊 Fetching dashboard stats...')
      const response = await fetch('/api/admin/dashboard/stats')
      console.log('📊 Response status:', response.status)
      const data = await response.json()
      console.log('📊 Response data:', data)
      
      if (data.success) {
        setStats(data.data)
      } else {
        console.error('❌ Dashboard stats failed:', data.error, data.details)
        alert(`Dashboard yüklenemedi: ${data.details || data.error}`)
      }
    } catch (error: any) {
      console.error('❌ Error fetching stats:', error)
      alert(`Dashboard yüklenirken hata: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getPaymentStatusLabel = (status: string) => {
    return status === 'completed' ? 'Tamamlandı' : 
           status === 'pending' ? 'Beklemede' : status
  }

  const getPaymentStatusColor = (status: string) => {
    return status === 'completed' ? 'text-green-600 bg-green-100' : 
           status === 'pending' ? 'text-yellow-600 bg-yellow-100' : 'text-gray-600 bg-gray-100'
  }

  const getPaymentMethodLabel = (method: string) => {
    return method === 'online' ? 'Online Ödeme' : 
           method === 'bank_transfer' ? 'Banka Transferi' : method
  }

  const getRefundStatusLabel = (status: string) => {
    const labels: any = {
      'pending': 'İade Beklemede',
      'completed': 'İade Tamamlandı',
      'rejected': 'İade Reddedildi'
    }
    return labels[status] || status
  }

  const getRefundStatusColor = (status: string) => {
    return status === 'completed' ? 'text-green-600 bg-green-100' : 
           status === 'pending' ? 'text-yellow-600 bg-yellow-100' :
           status === 'rejected' ? 'text-red-600 bg-red-100' : 'text-gray-600 bg-gray-100'
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return '📱'
      case 'tablet': return '📱'
      case 'desktop': return '💻'
      case 'bot': return '🤖'
      default: return '💻'
    }
  }

  const isDeadlinePassed = (deadline: string) => {
    if (!deadline) return false
    return new Date() > new Date(deadline)
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Dashboard</h1>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Dashboard</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-lg text-gray-600">Veriler yüklenemedi</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          🔄 Yenile
        </button>
      </div>

      {/* Deadline Uyarıları */}
      {(stats.deadlines.registration_start_date || stats.deadlines.registration_deadline || stats.deadlines.cancellation_deadline) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.deadlines.registration_start_date && (
            <div className={`p-4 rounded-lg border-2 ${
              isDeadlinePassed(stats.deadlines.registration_start_date)
                ? 'bg-green-50 border-green-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Kayıt Başlangıcı</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(stats.deadlines.registration_start_date).toLocaleString('tr-TR')}
                  </p>
                </div>
                {isDeadlinePassed(stats.deadlines.registration_start_date) ? (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    ✅ Başladı
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    ⏳ Bekliyor
                  </span>
                )}
              </div>
            </div>
          )}
          
          {stats.deadlines.registration_deadline && (
            <div className={`p-4 rounded-lg border-2 ${
              (() => {
                const now = new Date()
                const startDate = stats.deadlines.registration_start_date ? new Date(stats.deadlines.registration_start_date) : null
                const endDate = new Date(stats.deadlines.registration_deadline)
                
                if (startDate && now < startDate) {
                  return 'bg-blue-50 border-blue-200'
                } else if (now >= endDate) {
                  return 'bg-red-50 border-red-200'
                } else {
                  return 'bg-green-50 border-green-200'
                }
              })()
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Kayıt Son Tarihi</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(stats.deadlines.registration_deadline).toLocaleString('tr-TR')}
                  </p>
                </div>
                {(() => {
                  const now = new Date()
                  const startDate = stats.deadlines.registration_start_date ? new Date(stats.deadlines.registration_start_date) : null
                  const endDate = new Date(stats.deadlines.registration_deadline)
                  
                  if (startDate && now < startDate) {
                    return (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        ⏳ Henüz Başlamadı
                      </span>
                    )
                  } else if (now >= endDate) {
                    return (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        🚫 Kapalı
                      </span>
                    )
                  } else {
                    return (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        ✅ Açık
                      </span>
                    )
                  }
                })()}
              </div>
            </div>
          )}
          
          {stats.deadlines.cancellation_deadline && (
            <div className={`p-4 rounded-lg border-2 ${
              isDeadlinePassed(stats.deadlines.cancellation_deadline)
                ? 'bg-orange-50 border-orange-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">İptal Son Tarihi</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(stats.deadlines.cancellation_deadline).toLocaleString('tr-TR')}
                  </p>
                </div>
                {isDeadlinePassed(stats.deadlines.cancellation_deadline) ? (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                    ⚠️ Süre Doldu
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    ✅ Aktif
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ana İstatistikler - Büyük Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Toplam Kayıt */}
        <Link href="/admin/registrations" className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Toplam Kayıt</p>
              <p className="text-4xl font-bold text-white mb-2">{stats.totals.registrations}</p>
              <div className="flex items-center text-blue-100 text-xs">
                <span className="mr-2">Bu ay: {stats.totals.thisMonth}</span>
                <span>•</span>
                <span className="ml-2">Bugün: {stats.totals.today}</span>
              </div>
            </div>
            <div className="text-5xl text-white opacity-80">
              📊
            </div>
          </div>
        </Link>

        {/* Gelir Durumu */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Toplam Gelir</p>
              <p className="text-3xl font-bold text-white mb-2">{formatTurkishCurrency(stats.totals.revenue)}</p>
              <div className="flex items-center text-emerald-100 text-xs">
                <span>Tahsil Edildi</span>
              </div>
            </div>
            <div className="text-5xl text-white opacity-80">
              💰
            </div>
          </div>
        </div>

        {/* Bekleyen Ödemeler */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium mb-1">Bekleyen Ödeme</p>
              <p className="text-3xl font-bold text-white mb-2">{formatTurkishCurrency(stats.totals.pendingRevenue)}</p>
              <div className="flex items-center text-amber-100 text-xs">
                <span>Tahsilat Bekliyor</span>
              </div>
            </div>
            <div className="text-5xl text-white opacity-80">
              ⏳
            </div>
          </div>
        </div>
      </div>

      {/* Hızlı İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
          <p className="text-xs font-medium text-gray-600 mb-1">Bugün</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totals.today}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
          <p className="text-xs font-medium text-gray-600 mb-1">Bu Ay</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totals.thisMonth}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
          <p className="text-xs font-medium text-gray-600 mb-1">İptal Edilen</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totals.cancelled}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
          <p className="text-xs font-medium text-gray-600 mb-1">Aktif Kayıt</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totals.registrations - stats.totals.cancelled}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Ödeme Durumu */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Ödeme Durumu</h3>
            <span className="text-xl">💳</span>
          </div>
          <div className="space-y-3">
            {stats.paymentStats.map((stat) => (
              <div key={stat.payment_status} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(stat.payment_status)}`}>
                  {getPaymentStatusLabel(stat.payment_status)}
                </span>
                <span className="text-xl font-bold text-gray-900">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* İade Durumları */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">İade Durumu</h3>
            <span className="text-xl">↩️</span>
          </div>
          {stats.refundStats.length > 0 ? (
            <div className="space-y-3">
              {stats.refundStats.map((stat) => (
                <div key={stat.refund_status} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRefundStatusColor(stat.refund_status)}`}>
                    {getRefundStatusLabel(stat.refund_status)}
                  </span>
                  <span className="text-xl font-bold text-gray-900">{stat.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-20">
              <p className="text-sm text-gray-400">İade kaydı yok</p>
            </div>
          )}
        </div>

        {/* Risk Skorları */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Güvenlik</h3>
            <Link href="/admin/registration-logs" className="text-xl hover:scale-110 transition-transform">
              🛡️
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Düşük Risk
              </span>
              <span className="text-xl font-bold text-gray-900">{stats.riskStats.low_risk}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                Orta Risk
              </span>
              <span className="text-xl font-bold text-gray-900">{stats.riskStats.medium_risk}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                Yüksek Risk
              </span>
              <span className="text-xl font-bold text-gray-900">{stats.riskStats.high_risk}</span>
            </div>
          </div>
        </div>

        {/* Cihaz İstatistikleri */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Cihazlar</h3>
            <span className="text-xl">📱</span>
          </div>
          {stats.deviceStats.length > 0 ? (
            <div className="space-y-3">
              {stats.deviceStats.slice(0, 3).map((stat) => (
                <div key={stat.device_type} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{getDeviceIcon(stat.device_type)}</span>
                    <span className="text-xs text-gray-600 capitalize">{stat.device_type}</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">{stat.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-20">
              <p className="text-sm text-gray-400">Log kaydı yok</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kayıt Türleri */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Kayıt Türleri</h3>
            <Link href="/admin/registration-types" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              Yönet →
            </Link>
          </div>
          <div className="space-y-2">
            {stats.registrationTypeStats.map((stat, index) => {
              const total = stats.registrationTypeStats.reduce((sum, s) => sum + s.count, 0)
              const percentage = ((stat.count / total) * 100).toFixed(1)
              return (
                <div key={stat.registration_type} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-medium">{stat.type_label || stat.registration_type}</span>
                    <span className="text-gray-900 font-bold">{stat.count} <span className="text-xs text-gray-500">({percentage}%)</span></span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-purple-500' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Ödeme Yöntemleri & Döviz Kurları */}
        <div className="space-y-6">
          {/* Ödeme Yöntemleri */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ödeme Yöntemleri</h3>
            <div className="grid grid-cols-2 gap-4">
              {stats.paymentMethodStats.map((stat) => (
                <div key={stat.payment_method} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                  <p className="text-xs text-gray-600 mt-1">{getPaymentMethodLabel(stat.payment_method)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Döviz Kurları */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Döviz Kurları</h3>
              <Link href="/admin/settings/exchange-rates" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                Güncelle →
              </Link>
            </div>
            {stats.exchangeRates.length > 0 ? (
              <div className="space-y-3">
                {stats.exchangeRates.map((rate) => (
                  <div key={rate.currency_code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-bold text-gray-700">{rate.currency_code}</span>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{Number(rate.rate).toFixed(4)} ₺</p>
                      <p className="text-xs text-gray-500">
                        {new Date(rate.updated_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Kur bilgisi yok</p>
            )}
          </div>
        </div>
      </div>

      {/* Haftalık Trend */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Son 7 Gün Kayıt Trendi</h3>
          <span className="text-sm text-gray-500">
            Toplam: {stats.weeklyTrend.reduce((sum, d) => sum + d.count, 0)} kayıt
          </span>
        </div>
        <div className="space-y-3">
          {stats.weeklyTrend.map((day, index) => {
            const maxCount = Math.max(...stats.weeklyTrend.map(d => d.count))
            const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0
            const isToday = new Date(day.date).toDateString() === new Date().toDateString()
            
            return (
              <div key={day.date} className={`flex items-center ${isToday ? 'bg-blue-50 -mx-2 px-2 py-1 rounded' : ''}`}>
                <span className={`text-sm w-28 ${isToday ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
                  {new Date(day.date).toLocaleDateString('tr-TR', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                  {isToday && ' (Bugün)'}
                </span>
                <div className="flex items-center flex-1 ml-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isToday ? 'bg-blue-600' : 'bg-primary-600'
                      }`}
                      style={{ 
                        width: `${Math.max(5, percentage)}%` 
                      }}
                    ></div>
                  </div>
                  <span className={`text-base font-bold w-10 text-right ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {day.count}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Son Kayıtlar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Son Kayıtlar</h3>
          <Link href="/admin/registrations" className="text-sm text-primary-600 hover:text-primary-700">
            Tümünü Gör →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Katılımcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kayıt Türü
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ücret
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentRegistrations.map((registration) => (
                <tr key={registration.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/admin/registrations/${registration.id}`} className="hover:text-primary-600">
                      <div className="text-sm font-medium text-gray-900">{registration.full_name}</div>
                      <div className="text-sm text-gray-500">{registration.email}</div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {registration.type_label || registration.registration_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatTurkishCurrency(registration.fee)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(registration.payment_status)}`}>
                      {getPaymentStatusLabel(registration.payment_status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(registration.created_at).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
