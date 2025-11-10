'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface POSTransaction {
  id: number
  registration_id: number
  reference_number: string
  full_name: string
  email: string
  phone: string
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
  card_bin: string
  installment: number
  cardholder_name: string
  billing_address: string
  billing_city: string
  billing_country: string
  ip_address: string
  is_3d_secure: boolean
  threeds_status: string
  eci: string
  fraud_score: number
  fraud_status: string
  user_agent: string
  session_id: string
  gateway_request: any
  gateway_response: any
  notes: string
  initiated_at: string
  completed_at: string
  callback_received_at: string
  created_at: string
  updated_at: string
}

interface POSLogDetailClientProps {
  transaction: POSTransaction
}

export default function POSLogDetailClient({ transaction }: POSLogDetailClientProps) {
  const router = useRouter()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">✅ Başarılı</span>
      case 'failed':
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">❌ Başarısız</span>
      case 'pending':
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">⏳ Beklemede</span>
      case 'cancelled':
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">🚫 İptal</span>
      case 'refunded':
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">↩️ İade</span>
      default:
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₺'
    return `${symbol}${Number(amount).toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-2 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Geri Dön
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">POS İşlem Detayı #{transaction.id}</h1>
            {transaction.transaction_id && (
              <p className="text-sm text-gray-600 mt-1 font-mono">
                Transaction ID: {transaction.transaction_id}
              </p>
            )}
          </div>
          <div>
            {getStatusBadge(transaction.status)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Ana Bilgiler */}
        <div className="lg:col-span-2 space-y-6">
          {/* İşlem Bilgileri */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">İşlem Bilgileri</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Transaction ID</p>
                <p className="font-mono text-gray-900">{transaction.transaction_id || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-mono text-gray-900">{transaction.order_id || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tutar</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Taksit</p>
                <p className="text-gray-900">{transaction.installment || 1} Taksit</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gateway</p>
                <p className="text-gray-900">{transaction.gateway_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Banka</p>
                <p className="text-gray-900">{transaction.bank_name || '-'}</p>
              </div>
            </div>
          </div>

          {/* Kart Bilgileri */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Kart Bilgileri</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Kart Sahibi</p>
                <p className="text-gray-900">{transaction.cardholder_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Kart Tipi</p>
                <p className="text-gray-900">{transaction.card_type || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Kart Numarası</p>
                <p className="font-mono text-gray-900">
                  {transaction.card_bin ? `${transaction.card_bin}** **** ` : '****'}
                  {transaction.card_last4 || '****'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">3D Secure</p>
                <p className="text-gray-900">
                  {transaction.is_3d_secure ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      ✅ Aktif
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      ❌ Pasif
                    </span>
                  )}
                </p>
              </div>
              {transaction.threeds_status && (
                <div>
                  <p className="text-sm text-gray-600">3DS Durumu</p>
                  <p className="text-gray-900">{transaction.threeds_status}</p>
                </div>
              )}
              {transaction.eci && (
                <div>
                  <p className="text-sm text-gray-600">ECI</p>
                  <p className="font-mono text-gray-900">{transaction.eci}</p>
                </div>
              )}
            </div>
          </div>

          {/* Hata Bilgileri */}
          {(transaction.error_code || transaction.error_message) && (
            <div className="bg-red-50 rounded-lg border-2 border-red-200 p-6">
              <h2 className="text-lg font-semibold text-red-900 mb-4">❌ Hata Bilgileri</h2>
              <div className="space-y-3">
                {transaction.error_code && (
                  <div>
                    <p className="text-sm text-red-600 font-medium">Hata Kodu</p>
                    <p className="font-mono text-red-900 text-lg">{transaction.error_code}</p>
                  </div>
                )}
                {transaction.error_message && (
                  <div>
                    <p className="text-sm text-red-600 font-medium">Hata Mesajı</p>
                    <p className="text-red-900">{transaction.error_message}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Gateway Request/Response */}
          {(transaction.gateway_request || transaction.gateway_response) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Gateway Detayları</h2>
              
              {transaction.gateway_request && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Request</p>
                  <pre className="bg-gray-50 p-4 rounded border border-gray-200 overflow-x-auto text-xs">
                    {JSON.stringify(transaction.gateway_request, null, 2)}
                  </pre>
                </div>
              )}
              
              {transaction.gateway_response && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Response</p>
                  <pre className="bg-gray-50 p-4 rounded border border-gray-200 overflow-x-auto text-xs">
                    {JSON.stringify(transaction.gateway_response, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sağ Kolon - Kullanıcı ve Güvenlik */}
        <div className="space-y-6">
          {/* Kullanıcı Bilgileri */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Kullanıcı Bilgileri</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Ad Soyad</p>
                <p className="font-medium text-gray-900">{transaction.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">E-posta</p>
                <p className="text-gray-900">{transaction.email}</p>
              </div>
              {transaction.phone && (
                <div>
                  <p className="text-sm text-gray-600">Telefon</p>
                  <p className="text-gray-900">{transaction.phone}</p>
                </div>
              )}
              {transaction.reference_number && (
                <div>
                  <p className="text-sm text-gray-600">Referans No</p>
                  <p className="font-mono text-primary-600">{transaction.reference_number}</p>
                </div>
              )}
              <div className="pt-3 border-t">
                <Link
                  href={`/admin/registrations/${transaction.registration_id}`}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  Kayıt Detayına Git →
                </Link>
              </div>
            </div>
          </div>

          {/* Güvenlik Bilgileri */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Güvenlik</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">IP Adresi</p>
                <p className="font-mono text-gray-900">{transaction.ip_address || '-'}</p>
              </div>
              {transaction.fraud_score !== null && transaction.fraud_score !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Fraud Skoru</p>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${
                          transaction.fraud_score >= 70 ? 'bg-red-600' :
                          transaction.fraud_score >= 40 ? 'bg-yellow-600' :
                          'bg-green-600'
                        }`}
                        style={{ width: `${transaction.fraud_score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{transaction.fraud_score}</span>
                  </div>
                </div>
              )}
              {transaction.fraud_status && (
                <div>
                  <p className="text-sm text-gray-600">Fraud Durumu</p>
                  <p className="text-gray-900">{transaction.fraud_status}</p>
                </div>
              )}
              {transaction.session_id && (
                <div>
                  <p className="text-sm text-gray-600">Session ID</p>
                  <p className="font-mono text-xs text-gray-900">{transaction.session_id}</p>
                </div>
              )}
            </div>
          </div>

          {/* Zaman Bilgileri */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Zaman Çizelgesi</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-3"></div>
                <div className="flex-1">
                  <p className="text-gray-600">Başlatıldı</p>
                  <p className="text-gray-900">{formatDate(transaction.initiated_at)}</p>
                </div>
              </div>
              {transaction.callback_received_at && (
                <div className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 mr-3"></div>
                  <div className="flex-1">
                    <p className="text-gray-600">Callback Alındı</p>
                    <p className="text-gray-900">{formatDate(transaction.callback_received_at)}</p>
                  </div>
                </div>
              )}
              {transaction.completed_at && (
                <div className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 mr-3"></div>
                  <div className="flex-1">
                    <p className="text-gray-600">Tamamlandı</p>
                    <p className="text-gray-900">{formatDate(transaction.completed_at)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start pt-3 border-t">
                <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-3"></div>
                <div className="flex-1">
                  <p className="text-gray-600">Oluşturulma</p>
                  <p className="text-gray-900">{formatDate(transaction.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notlar */}
          {transaction.notes && (
            <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">📝 Notlar</h2>
              <p className="text-sm text-gray-700">{transaction.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
