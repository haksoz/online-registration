'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getEventDescription } from '@/lib/auditLogTimeline'
import {
  getAuditTableLabel,
  getAuditFieldLabel,
  formatAuditValue,
  formatChangedFieldsList,
} from '@/constants/auditLogLabels'

interface AuditLog {
  id: number
  user_id: number
  user_name: string
  user_email: string
  table_name: string
  record_id: number
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  old_values: string | null
  new_values: string | null
  changed_fields: string
  ip_address: string
  user_agent: string
  created_at: string
  reference_number: string | null
  full_name: string | null
  registration_id: number | null
  selection_category_name?: string | null
  selection_type_label?: string | null
}

export default function AuditTimelinePage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterRef, setFilterRef] = useState('')
  const [filterName, setFilterName] = useState('')

  const fetchAuditLogs = async (page = 1, ref = filterRef, name = filterName) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (ref.trim()) params.set('reference_number', ref.trim())
      if (name.trim()) params.set('full_name', name.trim())
      const response = await fetch(`/api/admin/audit-logs?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setAuditLogs(data.data)
        setTotalPages(data.totalPages)
        setCurrentPage(data.currentPage)
        setError(null)
      } else {
        setError(data.error || 'Olay geçmişi yüklenirken hata oluştu')
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu')
      console.error('Error fetching audit logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchAuditLogs(1, filterRef, filterName)
  }

  const clearFilters = () => {
    setFilterRef('')
    setFilterName('')
    setCurrentPage(1)
    fetchAuditLogs(1, '', '')
  }

  const hasActiveFilters = filterRef.trim() !== '' || filterName.trim() !== ''

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const getActionLabel = (action: string): string => {
    return action === 'CREATE'
      ? 'Oluşturma'
      : action === 'UPDATE'
        ? 'Güncelleme'
        : action === 'DELETE'
          ? 'Silme'
          : action
  }

  const getActionBadge = (action: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full'
    if (action === 'CREATE') return `${baseClasses} bg-green-100 text-green-800`
    if (action === 'UPDATE') return `${baseClasses} bg-blue-100 text-blue-800`
    if (action === 'DELETE') return `${baseClasses} bg-red-100 text-red-800`
    return `${baseClasses} bg-gray-100 text-gray-800`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Olay Geçmişi</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Olay Geçmişi</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => fetchAuditLogs()}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Olay Geçmişi</h2>
        <p className="text-gray-600 mt-1">
          Kayıt ve kayıt seçimlerinde yapılan değişikliklerin okunabilir özeti
        </p>
      </div>

      {/* Filtre */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px]">
            <label htmlFor="filter-ref" className="block text-sm font-medium text-gray-700 mb-1">
              Referans no
            </label>
            <input
              id="filter-ref"
              type="text"
              value={filterRef}
              onChange={(e) => setFilterRef(e.target.value)}
              placeholder="Örn. REG-2026-9111"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="min-w-[200px]">
            <label htmlFor="filter-name" className="block text-sm font-medium text-gray-700 mb-1">
              Kayıtlı kişi
            </label>
            <input
              id="filter-name"
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Ad veya soyad"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Filtrele
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none"
              >
                Filtreyi temizle
              </button>
            )}
          </div>
        </form>
        {hasActiveFilters && (
          <p className="text-xs text-gray-500 mt-2">
            Referans veya kayıtlı kişi adına göre kısmi eşleşme uygulanıyor.
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table
          className="min-w-full divide-y divide-gray-200"
          style={{ minWidth: '900px' }}
        >
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarih / Saat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Değişikliği yapan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Referans no
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kayıtlı kişi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Olay
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Detay
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 text-gray-300 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-sm">Henüz olay kaydı bulunmamaktadır.</p>
                  </div>
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {log.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>
                      <div className="font-medium text-gray-900">
                        {log.user_name || 'Bilinmeyen'}
                      </div>
                      <div className="text-gray-500 text-xs">{log.user_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.reference_number ? (
                      log.registration_id ? (
                        <Link
                          href={`/admin/registrations/${log.registration_id}`}
                          className="text-primary-600 hover:text-primary-800 underline"
                        >
                          {log.reference_number}
                        </Link>
                      ) : (
                        log.reference_number
                      )
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {log.full_name || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 max-w-md">
                    {getEventDescription(log)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-24">
                    <button
                      type="button"
                      onClick={() => setSelectedLog(log)}
                      className="px-3 py-1.5 rounded-md border border-primary-600 text-primary-600 hover:bg-primary-50 transition-colors"
                    >
                      Detay
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => fetchAuditLogs(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Önceki
          </button>
          <span className="text-sm text-gray-600">
            Sayfa {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => fetchAuditLogs(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sonraki
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Olay detayı</h3>
              <p className="text-sm text-gray-600 mt-1">
                {getEventDescription(selectedLog)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Log ID: {selectedLog.id}</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kullanıcı</label>
                  <p className="text-sm text-gray-900">
                    {selectedLog.user_name} ({selectedLog.user_email})
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tarih</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedLog.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">İşlem</label>
                  <span className={getActionBadge(selectedLog.action)}>
                    {getActionLabel(selectedLog.action)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Referans</label>
                  <p className="text-sm text-gray-900">
                    {selectedLog.reference_number ? (
                      selectedLog.registration_id ? (
                        <Link
                          href={`/admin/registrations/${selectedLog.registration_id}`}
                          className="text-primary-600 hover:text-primary-800 underline"
                        >
                          {selectedLog.reference_number}
                        </Link>
                      ) : (
                        selectedLog.reference_number
                      )
                    ) : (
                      '—'
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kayıtlı kişi</label>
                  <p className="text-sm text-gray-900">{selectedLog.full_name || '—'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tablo</label>
                  <p className="text-sm text-gray-900">
                    {getAuditTableLabel(selectedLog.table_name)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kayıt ID</label>
                  <p className="text-sm text-gray-900">#{selectedLog.record_id}</p>
                </div>
                {selectedLog.table_name === 'registration_selections' &&
                  (selectedLog.selection_category_name || selectedLog.selection_type_label) && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Seçim (Kategori / Tür)
                      </label>
                      <p className="text-sm text-gray-900 font-medium">
                        {[selectedLog.selection_category_name, selectedLog.selection_type_label]
                          .filter(Boolean)
                          .join(' – ')}
                      </p>
                    </div>
                  )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">IP Adresi</label>
                  <p className="text-sm text-gray-900">{selectedLog.ip_address}</p>
                </div>
              </div>

              {selectedLog.changed_fields && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Değişen alanlar
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                    {formatChangedFieldsList(selectedLog.changed_fields)}
                  </p>
                </div>
              )}

              {selectedLog.action === 'UPDATE' &&
                selectedLog.old_values &&
                selectedLog.new_values &&
                (() => {
                  try {
                    const oldData =
                      typeof selectedLog.old_values === 'string'
                        ? JSON.parse(selectedLog.old_values)
                        : selectedLog.old_values
                    const newData =
                      typeof selectedLog.new_values === 'string'
                        ? JSON.parse(selectedLog.new_values)
                        : selectedLog.new_values
                    const changedFields = Object.keys(newData).filter(
                      (key) =>
                        JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])
                    )
                    return (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Değişiklik detayları
                        </label>
                        <div className="space-y-4">
                          {changedFields.map((field) => (
                            <div
                              key={field}
                              className="border border-gray-200 rounded-lg overflow-hidden"
                            >
                              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                <span className="font-medium text-gray-900">
                                  {getAuditFieldLabel(field)}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-200">
                                <div className="p-4 bg-red-50">
                                  <p className="text-xs font-medium text-red-700 mb-2">
                                    Önceki değer
                                  </p>
                                  <p className="text-sm text-gray-900 break-words">
                                    {formatAuditValue(field, oldData[field])}
                                  </p>
                                </div>
                                <div className="p-4 bg-green-50">
                                  <p className="text-xs font-medium text-green-700 mb-2">
                                    Yeni değer
                                  </p>
                                  <p className="text-sm text-gray-900 break-words">
                                    {formatAuditValue(field, newData[field])}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  } catch {
                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Eski değerler
                          </label>
                          <div className="text-xs bg-red-50 p-3 rounded border overflow-auto max-h-64">
                            <pre className="whitespace-pre-wrap font-mono">
                              {typeof selectedLog.old_values === 'string'
                                ? selectedLog.old_values
                                : JSON.stringify(selectedLog.old_values, null, 2)}
                            </pre>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Yeni değerler
                          </label>
                          <div className="text-xs bg-green-50 p-3 rounded border overflow-auto max-h-64">
                            <pre className="whitespace-pre-wrap font-mono">
                              {typeof selectedLog.new_values === 'string'
                                ? selectedLog.new_values
                                : JSON.stringify(selectedLog.new_values, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )
                  }
                })()}

              {selectedLog.action !== 'UPDATE' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {selectedLog.old_values && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {selectedLog.action === 'DELETE' ? 'Silinen veri' : 'Eski değerler'}
                      </label>
                      <div className="text-xs bg-red-50 p-3 rounded border overflow-auto max-h-64">
                        <pre className="whitespace-pre-wrap font-mono">
                          {typeof selectedLog.old_values === 'string'
                            ? selectedLog.old_values
                            : JSON.stringify(selectedLog.old_values, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  {selectedLog.new_values && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {selectedLog.action === 'CREATE'
                          ? 'Oluşturulan veri'
                          : 'Yeni değerler'}
                      </label>
                      <div className="text-xs bg-green-50 p-3 rounded border overflow-auto max-h-64">
                        <pre className="whitespace-pre-wrap font-mono">
                          {typeof selectedLog.new_values === 'string'
                            ? selectedLog.new_values
                            : JSON.stringify(selectedLog.new_values, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Agent
                </label>
                <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded break-all">
                  {selectedLog.user_agent}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
