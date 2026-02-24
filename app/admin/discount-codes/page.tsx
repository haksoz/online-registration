'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DiscountCode {
  id: number
  code: string
  scope: 'category' | 'type'
  valid_from: string | null
  valid_until: string | null
  usage_limit: number | null
  used_count: number
  description: string | null
  created_at: string
}

export default function DiscountCodesPage() {
  const [list, setList] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/discount-codes')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setList(d.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (s: string | null) =>
    s ? new Date(s).toLocaleDateString('tr-TR', { dateStyle: 'short' }) : '—'

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">İndirim Kodları</h2>
        <div className="animate-pulse h-8 bg-gray-200 rounded w-1/3" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">İndirim Kodları</h2>
        <Link
          href="/admin/discount-codes/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Yeni indirim kodu
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kod</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kapsam</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Geçerlilik</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanım</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlem</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Henüz indirim kodu yok.
                </td>
              </tr>
            ) : (
              list.map((row) => (
                <tr key={row.id}>
                  <td className="px-6 py-4 font-mono font-medium">{row.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {row.scope === 'category' ? 'Kategoriye göre' : 'Kayıt türüne göre'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(row.valid_from)} – {formatDate(row.valid_until)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {row.used_count}
                    {row.usage_limit != null ? ` / ${row.usage_limit}` : ''}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/discount-codes/${row.id}/edit`}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      Düzenle
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
