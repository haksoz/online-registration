'use client'

import { useState, useEffect } from 'react'

interface MailLog {
  id: number
  recipient_email: string
  recipient_name: string | null
  subject: string
  mail_type: string
  status: string
  error_message: string | null
  registration_id: number | null
  sent_at: string
}

export default function MailLogsPage() {
  const [logs, setLogs] = useState<MailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    status: 'all',
    type: 'all',
    search: ''
  })

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/mail-logs')
      const data = await response.json()
      if (data.success) {
        setLogs(data.logs)
      }
    } catch (error) {
      console.error('Error fetching mail logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'sent') {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">✓ Gönderildi</span>
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">✗ Başarısız</span>
  }

  const getTypeBadge = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      user_confirmation: { label: 'Kullanıcı Onayı', color: 'bg-blue-100 text-blue-800' },
      admin_notification: { label: 'Admin Bildirimi', color: 'bg-purple-100 text-purple-800' },
      test: { label: 'Test', color: 'bg-gray-100 text-gray-800' },
      custom: { label: 'Özel', color: 'bg-yellow-100 text-yellow-800' }
    }
    const typeInfo = types[type] || { label: type, color: 'bg-gray-100 text-gray-800' }
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeInfo.color}`}>{typeInfo.label}</span>
  }

  const filteredLogs = logs.filter(log => {
    if (filter.status !== 'all' && log.status !== filter.status) return false
    if (filter.type !== 'all' && log.mail_type !== filter.type) return false
    if (filter.search && !log.recipient_email.toLowerCase().includes(filter.search.toLowerCase()) && 
        !log.subject.toLowerCase().includes(filter.search.toLowerCase())) return false
    return true
  })

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
        <h1 className="text-2xl font-bold text-gray-900">Mail Logları</h1>
        <p className="text-sm text-gray-600 mt-1">
          Gönderilen maillerin geçmişini görüntüleyin
        </p>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tümü</option>
              <option value="sent">Gönderildi</option>
              <option value="failed">Başarısız</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tip</label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tümü</option>
              <option value="user_confirmation">Kullanıcı Onayı</option>
              <option value="admin_notification">Admin Bildirimi</option>
              <option value="test">Test</option>
              <option value="custom">Özel</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ara</label>
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              placeholder="E-posta veya konu..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Loglar Tablosu */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alıcı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Konu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tip</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kayıt ID</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Henüz mail logu bulunmuyor
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.sent_at).toLocaleString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-gray-900">{log.recipient_email}</div>
                      {log.recipient_name && (
                        <div className="text-gray-500 text-xs">{log.recipient_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.subject}
                      {log.error_message && (
                        <div className="text-red-600 text-xs mt-1">{log.error_message}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(log.mail_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.registration_id || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Toplam Mail</div>
          <div className="text-2xl font-bold text-gray-900">{logs.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Gönderildi</div>
          <div className="text-2xl font-bold text-green-600">
            {logs.filter(l => l.status === 'sent').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Başarısız</div>
          <div className="text-2xl font-bold text-red-600">
            {logs.filter(l => l.status === 'failed').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Başarı Oranı</div>
          <div className="text-2xl font-bold text-blue-600">
            {logs.length > 0 ? Math.round((logs.filter(l => l.status === 'sent').length / logs.length) * 100) : 0}%
          </div>
        </div>
      </div>
    </div>
  )
}
