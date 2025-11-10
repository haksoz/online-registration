'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Pagination from '@/components/ui/Pagination'

interface RegistrationLog {
  id: number
  registration_id: number
  reference_number: string
  full_name: string
  email: string
  registration_type: string
  ip_address: string
  ip_version: string
  browser_name: string
  browser_version: string
  os_name: string
  os_version: string
  device_type: string
  referrer: string
  referrer_domain: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  form_duration_seconds: number
  country_name: string
  city: string
  is_proxy: boolean
  is_vpn: boolean
  is_tor: boolean
  risk_score: number
  created_at: string
}

export default function RegistrationLogsPage() {
  const [logs, setLogs] = useState<RegistrationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  const fetchLogs = async (page = currentPage, limit = itemsPerPage) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/registration-logs?page=${page}&limit=${limit}`)
      const response = await res.json()
      
      if (response.data && Array.isArray(response.data)) {
        setLogs(response.data)
        setCurrentPage(response.pagination.currentPage)
        setTotalPages(response.pagination.totalPages)
        setTotalItems(response.pagination.totalItems)
      } else {
        setLogs([])
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching logs:', error)
      setLogs([])
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchLogs(page, itemsPerPage)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
    fetchLogs(1, newItemsPerPage)
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

  const getRiskBadge = (riskScore: number) => {
    if (riskScore >= 70) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Yüksek Risk</span>
    } else if (riskScore >= 40) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Orta Risk</span>
    } else {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Düşük Risk</span>
    }
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return '-'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}d ${secs}s`
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Registration Logs</h1>
        <p className="text-gray-600 mt-1">Kayıt formunu dolduran kullanıcıların log bilgileri</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Yükleniyor...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kayıt Bilgisi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Adresi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cihaz & Tarayıcı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lokasyon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kaynak
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Süre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {!Array.isArray(logs) || logs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                        {loading ? 'Yükleniyor...' : 'Henüz log kaydı bulunmamaktadır.'}
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{log.full_name}</div>
                            <div className="text-gray-500">{log.reference_number}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-mono text-gray-900">{log.ip_address}</div>
                            <div className="text-gray-500 text-xs">{log.ip_version}</div>
                            {(log.is_proxy || log.is_vpn || log.is_tor) && (
                              <div className="flex gap-1 mt-1">
                                {log.is_proxy && <span className="text-xs bg-orange-100 text-orange-800 px-1 rounded">Proxy</span>}
                                {log.is_vpn && <span className="text-xs bg-orange-100 text-orange-800 px-1 rounded">VPN</span>}
                                {log.is_tor && <span className="text-xs bg-red-100 text-red-800 px-1 rounded">Tor</span>}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <span>{getDeviceIcon(log.device_type)}</span>
                              <span className="text-gray-900">{log.browser_name} {log.browser_version}</span>
                            </div>
                            <div className="text-gray-500 text-xs">{log.os_name} {log.os_version}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            {log.country_name ? (
                              <>
                                <div className="text-gray-900">{log.country_name}</div>
                                {log.city && <div className="text-gray-500 text-xs">{log.city}</div>}
                              </>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm max-w-xs">
                            {log.utm_source ? (
                              <>
                                <div className="text-gray-900 truncate">
                                  {log.utm_source}
                                  {log.utm_medium && ` / ${log.utm_medium}`}
                                </div>
                                {log.utm_campaign && (
                                  <div className="text-gray-500 text-xs truncate">{log.utm_campaign}</div>
                                )}
                              </>
                            ) : log.referrer_domain ? (
                              <div className="text-gray-900 truncate">{log.referrer_domain}</div>
                            ) : (
                              <span className="text-gray-400">Direct</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDuration(log.form_duration_seconds)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRiskBadge(log.risk_score)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.created_at).toLocaleString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/admin/registrations/${log.registration_id}`}
                            className="text-primary-600 hover:text-primary-800 transition-colors"
                          >
                            Detay
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </div>
    </div>
  )
}
