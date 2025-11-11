'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Pagination from '@/components/ui/Pagination'

interface POSTransaction {
  id: number
  registration_id: number
  reference_number: string
  full_name: string
  email: string
  customer_phone: string
  registration_type: string
  transaction_id: string
  order_id: string
  amount: number
  currency: string
  status: string
  payment_status: string
  error_code: string
  error_message: string
  gateway_name: string
  bank_name: string
  card_type: string
  card_last4: string
  installment: number
  is_3d_secure: boolean
  ip_address: string
  initiated_at: string
  completed_at: string
  created_at: string
}

export default function POSLogsPage() {
  const [transactions, setTransactions] = useState<POSTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchTransactions = async (page = currentPage, limit = itemsPerPage, status = statusFilter) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status !== 'all' && { status })
      })
      
      const res = await fetch(`/api/admin/pos-logs?${params}`)
      const response = await res.json()
      
      if (response.data && Array.isArray(response.data)) {
        setTransactions(response.data)
        setCurrentPage(response.pagination.currentPage)
        setTotalPages(response.pagination.totalPages)
        setTotalItems(response.pagination.totalItems)
      } else {
        setTransactions([])
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching POS logs:', error)
      setTransactions([])
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchTransactions(page, itemsPerPage, statusFilter)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
    fetchTransactions(1, newItemsPerPage, statusFilter)
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
    fetchTransactions(1, itemsPerPage, status)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">✅ Başarılı</span>
      case 'failed':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">❌ Başarısız</span>
      case 'pending':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">⏳ Beklemede</span>
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">🚫 İptal</span>
      case 'refunded':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">↩️ İade</span>
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₺'
    return `${symbol}${Number(amount).toFixed(2)}`
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">POS İşlem Logları</h1>
        <p className="text-gray-600 mt-1">Online ödeme işlemlerinin detaylı kayıtları</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durum Filtresi</label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tümü</option>
              <option value="success">Başarılı</option>
              <option value="failed">Başarısız</option>
              <option value="pending">Beklemede</option>
              <option value="cancelled">İptal</option>
              <option value="refunded">İade</option>
            </select>
          </div>
          
          <div className="ml-auto">
            <button
              onClick={() => fetchTransactions(currentPage, itemsPerPage, statusFilter)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              🔄 Yenile
            </button>
          </div>
        </div>
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
                      İşlem Bilgisi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kart Bilgisi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gateway
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
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
                  {!Array.isArray(transactions) || transactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        {loading ? 'Yükleniyor...' : 'Henüz POS işlem kaydı bulunmamaktadır.'}
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-mono text-gray-900">{transaction.transaction_id || '-'}</div>
                            {transaction.order_id && (
                              <div className="text-gray-500 text-xs">Order: {transaction.order_id}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{transaction.full_name || '-'}</div>
                            <div className="text-gray-500">{transaction.email || '-'}</div>
                            {transaction.customer_phone && (
                              <div className="text-xs text-gray-500">{transaction.customer_phone}</div>
                            )}
                            {transaction.registration_type && (
                              <div className="text-xs text-blue-600">{transaction.registration_type}</div>
                            )}
                            {transaction.reference_number ? (
                              <div className="text-xs text-gray-400">Ref: {transaction.reference_number}</div>
                            ) : (
                              <div className="text-xs text-red-400">⚠️ Kayıt oluşturulmadı</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </div>
                          {transaction.installment > 1 && (
                            <div className="text-xs text-gray-500">{transaction.installment} Taksit</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            {transaction.card_type && (
                              <div className="text-gray-900">{transaction.card_type}</div>
                            )}
                            {transaction.card_last4 && (
                              <div className="text-gray-500 font-mono">**** {transaction.card_last4}</div>
                            )}
                            {transaction.is_3d_secure && (
                              <span className="inline-flex px-1.5 py-0.5 text-xs font-semibold rounded bg-green-100 text-green-800">
                                3D Secure
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            {transaction.gateway_name && (
                              <div className="text-gray-900">{transaction.gateway_name}</div>
                            )}
                            {transaction.bank_name && (
                              <div className="text-gray-500 text-xs">{transaction.bank_name}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {getStatusBadge(transaction.status)}
                            {transaction.error_code && (
                              <div className="text-xs text-red-600 font-mono">
                                Error: {transaction.error_code}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            {new Date(transaction.created_at).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-xs">
                            {new Date(transaction.created_at).toLocaleTimeString('tr-TR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/admin/pos-logs/${transaction.id}`}
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
