'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatTurkishCurrency } from '@/lib/currencyUtils'

interface RegistrationSelection {
  id: number
  registration_type_id: number
  category_id: number
  category_name: string
  category_name_en: string
  type_label: string
  type_label_en: string
  applied_fee_try: number
  applied_currency: string
  applied_fee_amount: number
  vat_rate: number
  vat_amount_try: number
  total_try: number
  is_cancelled: boolean
  cancelled_at?: string
  cancelled_by?: number
  cancel_reason?: string
  refund_status: 'none' | 'pending' | 'approved' | 'rejected' | 'completed'
  refund_amount: number
  refund_requested_at?: string
  refund_approved_at?: string
  refund_approved_by?: number
  refund_completed_at?: string
  refund_notes?: string
  refund_method?: string
}

interface Registration {
  id: number
  reference_number: string
  full_name: string
  email: string
  phone: string
  address?: string
  company?: string
  invoice_type: string
  invoice_full_name?: string
  id_number?: string
  invoice_address?: string
  invoice_company_name?: string
  tax_office?: string
  tax_number?: string
  registration_type: string
  fee: number
  currency: string
  total_fee: number
  vat_amount: number
  grand_total: number
  payment_method: string
  payment_status: string
  status: number
  selections: RegistrationSelection[]
  created_at: string
  updated_at: string
}

export default function RegistrationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchRegistration()
    }
  }, [params.id])

  const fetchRegistration = async () => {
    try {
      const response = await fetch(`/api/registrations/${params.id}`)
      const data = await response.json()
      if (data.success) {
        setRegistration(data.data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSelection = async (selectionId: number) => {
    if (!confirm('Bu seçimi iptal etmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/registrations/${params.id}/selections/${selectionId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        alert('Seçim iptal edildi')
        fetchRegistration()
      } else {
        alert(data.error || 'İptal işlemi başarısız')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
  }

  const handleRefundAction = async (selectionId: number, action: 'approve' | 'reject') => {
    let confirmMessage = ''
    let notes = ''
    
    if (action === 'approve') {
      confirmMessage = 'Para iadesi yapılacak. Emin misiniz?'
    } else if (action === 'reject') {
      notes = prompt('İade reddetme nedeni:') || ''
      if (!notes) return
      confirmMessage = 'İadeyi reddetmek istediğinizden emin misiniz?'
    }

    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch(`/api/registrations/${params.id}/selections/${selectionId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes })
      })
      const data = await response.json()
      
      if (data.success) {
        alert(data.message)
        fetchRegistration()
      } else {
        alert(data.error || 'İşlem başarısız')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
  }

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>
  }

  if (!registration) {
    return <div className="p-6">Kayıt bulunamadı</div>
  }

  const activeSelections = registration.selections?.filter(s => !s.is_cancelled) || []
  const cancelledSelections = registration.selections?.filter(s => s.is_cancelled) || []

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2"
          >
            ← Geri
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Kayıt Detayı</h1>
          <p className="text-sm text-gray-500 mt-1">Referans: {registration.reference_number}</p>
        </div>
        <div className="text-right">
          {registration.selections && registration.selections.length > 0 && (
            <div className="flex gap-3 text-sm">
              <div className="text-green-700 bg-green-50 px-3 py-1 rounded-full">
                <span className="font-medium">{activeSelections.length}</span> aktif
              </div>
              {cancelledSelections.length > 0 && (
                <div className="text-red-700 bg-red-50 px-3 py-1 rounded-full">
                  <span className="font-medium">{cancelledSelections.length}</span> iptal
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Katılımcı ve Fatura Bilgileri */}
        <div className="lg:col-span-1 space-y-6">
          {/* Katılımcı Bilgileri */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Katılımcı Bilgileri</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Ad Soyad</label>
                <p className="text-sm font-medium text-gray-900">{registration.full_name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">E-posta</label>
                <p className="text-sm text-gray-900">{registration.email}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Telefon</label>
                <p className="text-sm text-gray-900">{registration.phone}</p>
              </div>
              {registration.address && (
                <div>
                  <label className="text-xs text-gray-500">Adres</label>
                  <p className="text-sm text-gray-900">{registration.address}</p>
                </div>
              )}
              {registration.company && (
                <div>
                  <label className="text-xs text-gray-500">Şirket</label>
                  <p className="text-sm text-gray-900">{registration.company}</p>
                </div>
              )}
            </div>
          </div>

          {/* Fatura Bilgileri */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Fatura Bilgileri</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Fatura Tipi</label>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {registration.invoice_type === 'bireysel' ? 'Bireysel' : 'Kurumsal'}
                </p>
              </div>
              
              {registration.invoice_type === 'bireysel' ? (
                <>
                  {registration.invoice_full_name && (
                    <div>
                      <label className="text-xs text-gray-500">Fatura Adı</label>
                      <p className="text-sm text-gray-900">{registration.invoice_full_name}</p>
                    </div>
                  )}
                  {registration.id_number && (
                    <div>
                      <label className="text-xs text-gray-500">TC Kimlik No</label>
                      <p className="text-sm text-gray-900">{registration.id_number}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {registration.invoice_company_name && (
                    <div>
                      <label className="text-xs text-gray-500">Şirket Adı</label>
                      <p className="text-sm text-gray-900">{registration.invoice_company_name}</p>
                    </div>
                  )}
                  {registration.tax_office && (
                    <div>
                      <label className="text-xs text-gray-500">Vergi Dairesi</label>
                      <p className="text-sm text-gray-900">{registration.tax_office}</p>
                    </div>
                  )}
                  {registration.tax_number && (
                    <div>
                      <label className="text-xs text-gray-500">Vergi No</label>
                      <p className="text-sm text-gray-900">{registration.tax_number}</p>
                    </div>
                  )}
                </>
              )}
              
              {registration.invoice_address && (
                <div>
                  <label className="text-xs text-gray-500">Fatura Adresi</label>
                  <p className="text-sm text-gray-900">{registration.invoice_address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Ödeme Bilgileri */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ödeme Bilgileri</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Ödeme Yöntemi</label>
                <p className="text-sm text-gray-900">
                  {registration.payment_method === 'online' ? 'Online Ödeme' : 'Havale/EFT'}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Ödeme Durumu</label>
                <p className={`text-sm font-medium ${
                  registration.payment_status === 'completed' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {registration.payment_status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Kolon - Fatura Detayı */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Kayıt Seçimleri</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Tarih: {new Date(registration.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Referans No</p>
                  <p className="text-lg font-mono font-semibold text-gray-900">
                    {registration.reference_number}
                  </p>
                </div>
              </div>
            </div>

            {/* Tüm Seçimler */}
            {registration.selections && registration.selections.length > 0 && (
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">Seçilen Kayıtlar</h3>
                <div className="space-y-4">
                  {registration.selections.map((selection) => (
                    <div
                      key={selection.id}
                      className={`border rounded-lg p-4 ${
                        selection.is_cancelled 
                          ? 'border-red-200 bg-red-50' 
                          : 'border-gray-200 hover:border-primary-300 transition-colors'
                      }`}
                    >
                      {/* Üst Kısım - Kategori ve Tutar */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              selection.is_cancelled 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-primary-100 text-primary-800'
                            }`}>
                              {selection.category_name}
                            </span>
                            {selection.is_cancelled && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-200 text-red-900">
                                ❌ İptal Edildi
                              </span>
                            )}
                          </div>
                          <p className={`font-medium ${selection.is_cancelled ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {selection.type_label}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${selection.is_cancelled ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {formatTurkishCurrency(selection.applied_fee_try)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Fiyat Detayları */}
                      <div className="flex justify-between items-center text-xs text-gray-500 pb-3 border-b border-gray-200">
                        <span>KDV (%{(selection.vat_rate * 100).toFixed(0)}): {formatTurkishCurrency(selection.vat_amount_try)}</span>
                        <span className={`font-medium ${selection.is_cancelled ? 'text-gray-400' : 'text-gray-700'}`}>
                          Toplam: {formatTurkishCurrency(selection.total_try)}
                        </span>
                      </div>

                      {/* Durum ve Aksiyonlar */}
                      <div className="mt-3">
                        {selection.is_cancelled ? (
                          <div className="space-y-2">
                            {/* İptal Bilgisi */}
                            <div className="text-xs text-red-600 bg-red-100 rounded p-2">
                              <div className="font-medium">İptal Tarihi: {selection.cancelled_at ? new Date(selection.cancelled_at).toLocaleString('tr-TR') : '-'}</div>
                              {selection.cancel_reason && (
                                <div className="mt-1">Neden: {selection.cancel_reason}</div>
                              )}
                            </div>
                            
                            {/* İade Durumu */}
                            {(selection.refund_status === 'none' || selection.refund_status === 'pending') && (
                              <div className="space-y-2">
                                {selection.refund_status === 'pending' && (
                                  <div className="text-xs text-yellow-700 bg-yellow-50 rounded p-2 flex items-center gap-2">
                                    <span className="text-base">⏳</span>
                                    <div>
                                      <div className="font-medium">İade Talebi Beklemede</div>
                                      <div className="text-yellow-600 mt-1">
                                        Talep: {selection.refund_requested_at ? new Date(selection.refund_requested_at).toLocaleString('tr-TR') : '-'}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleRefundAction(selection.id, 'approve')}
                                    className="flex-1 text-xs bg-green-600 text-white hover:bg-green-700 px-3 py-2 rounded transition-colors"
                                  >
                                    💰 Para İadesini Yap
                                  </button>
                                  <button
                                    onClick={() => handleRefundAction(selection.id, 'reject')}
                                    className="flex-1 text-xs bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded transition-colors"
                                  >
                                    ✗ İadeyi Reddet
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            {selection.refund_status === 'rejected' && (
                              <div className="text-xs text-red-700 bg-red-50 rounded p-2">
                                <div className="font-medium">✗ İade Reddedildi</div>
                                {selection.refund_notes && (
                                  <div className="text-red-600 mt-1">Not: {selection.refund_notes}</div>
                                )}
                              </div>
                            )}
                            
                            {selection.refund_status === 'completed' && (
                              <div className="text-xs text-green-700 bg-green-50 rounded p-2">
                                <div className="font-medium">✓ İade Tamamlandı</div>
                                <div className="text-green-600 mt-1">
                                  Tamamlanma: {selection.refund_completed_at ? new Date(selection.refund_completed_at).toLocaleString('tr-TR') : '-'}
                                </div>
                                <div className="text-green-600">
                                  Tutar: {formatTurkishCurrency(selection.refund_amount || selection.total_try)}
                                </div>
                                {selection.refund_method && (
                                  <div className="text-green-600">Yöntem: {selection.refund_method}</div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {/* Aktif Durum Bildirimi */}
                            <div className="text-xs text-green-700 bg-green-50 rounded p-2 flex items-center gap-2">
                              <span className="text-base">✓</span>
                              <span>Bu kayıt aktif durumda</span>
                            </div>
                            
                            {/* Aksiyonlar */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCancelSelection(selection.id)}
                                className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded border border-red-200 transition-colors"
                              >
                                Bu Seçimi İptal Et
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Toplam */}
            <div className="border-t-2 border-gray-300 p-6 bg-gray-50">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam (Aktif Seçimler)</span>
                  <span className="font-medium text-gray-900">
                    {formatTurkishCurrency(registration.total_fee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">KDV</span>
                  <span className="font-medium text-gray-900">
                    {formatTurkishCurrency(registration.vat_amount)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                  <span className="text-gray-900">ÖDENECEK TOPLAM</span>
                  <span className="text-primary-600">
                    {formatTurkishCurrency(registration.grand_total)}
                  </span>
                </div>
                {cancelledSelections.length > 0 && (
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                    * {cancelledSelections.length} iptal edilmiş seçim toplama dahil değildir
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
