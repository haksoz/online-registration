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
  payment_status?: 'pending' | 'completed' | 'cancelled' | 'refunded'
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
  document_filename?: string
  document_url?: string
  document_uploaded_at?: string
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
  payment_notes?: string
  payment_receipt_url?: string
  payment_receipt_filename?: string
  payment_receipt_uploaded_at?: string
  payment_confirmed_at?: string
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

  const handleUndoCancel = async (selectionId: number) => {
    if (!confirm('İptali geri almak istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/registrations/${params.id}/selections/${selectionId}/undo`, {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        alert('İptal geri alındı')
        fetchRegistration()
      } else {
        alert(data.error || 'İşlem başarısız')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
  }

  const handleUndoRefundRejection = async (selectionId: number) => {
    if (!confirm('İade reddini geri almak istediğinizden emin misiniz? İade talebi tekrar beklemede durumuna geçecek.')) return

    try {
      const response = await fetch(`/api/registrations/${params.id}/selections/${selectionId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'undo_reject' })
      })
      const data = await response.json()
      
      if (data.success) {
        alert('İade reddi geri alındı, iade talebi tekrar beklemede')
        fetchRegistration()
      } else {
        alert(data.error || 'İşlem başarısız')
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

              {/* Ödeme Notları */}
              {registration.payment_notes && (
                <div>
                  <label className="text-xs text-gray-500">Ödeme Notları</label>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">{registration.payment_notes}</p>
                </div>
              )}

              {/* Dekont Bilgisi */}
              {registration.payment_receipt_url ? (
                <div>
                  <label className="text-xs text-gray-500">Dekont</label>
                  <div className="flex items-center gap-2 mt-1">
                    <a
                      href={registration.payment_receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700 underline"
                    >
                      📄 {registration.payment_receipt_filename || 'Dekont Görüntüle'}
                    </a>
                    <button
                      onClick={async () => {
                        if (!confirm('Dekont silinecek. Emin misiniz?')) return
                        
                        try {
                          const response = await fetch(`/api/registrations/${params.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              payment_receipt_url: null,
                              payment_receipt_filename: null,
                              payment_receipt_uploaded_at: null
                            })
                          })
                          
                          if (response.ok) {
                            alert('Dekont silindi')
                            fetchRegistration()
                          }
                        } catch (error) {
                          alert('Bir hata oluştu')
                        }
                      }}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </div>
                  {registration.payment_receipt_uploaded_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Yükleme: {new Date(registration.payment_receipt_uploaded_at).toLocaleString('tr-TR')}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="text-xs text-gray-500">Dekont</label>
                  <button
                    onClick={() => {
                      // Dekont yükleme modal'ı
                      const modal = document.createElement('div')
                      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
                      modal.innerHTML = `
                        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                          <h3 class="text-xl font-bold text-gray-900 mb-4">📄 Dekont Yükle</h3>
                          
                          <div class="space-y-4">
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-2">Dekont Dosyası</label>
                              <input
                                type="file"
                                id="receipt-file-upload"
                                accept="image/*,.pdf"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                              <p class="text-xs text-gray-500 mt-1">JPG, PNG veya PDF formatında</p>
                            </div>
                            
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-2">Not (Opsiyonel)</label>
                              <textarea
                                id="receipt-notes"
                                rows="2"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Dekont ile ilgili notlar..."
                              ></textarea>
                            </div>
                          </div>
                          
                          <div class="flex gap-3 mt-6">
                            <button
                              id="cancel-upload-btn"
                              class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                              İptal
                            </button>
                            <button
                              id="upload-btn"
                              class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                              📤 Yükle
                            </button>
                          </div>
                        </div>
                      `
                      document.body.appendChild(modal)

                      modal.querySelector('#cancel-upload-btn')?.addEventListener('click', () => {
                        modal.remove()
                      })

                      modal.querySelector('#upload-btn')?.addEventListener('click', async () => {
                        const fileInput = document.getElementById('receipt-file-upload') as HTMLInputElement
                        const notes = (document.getElementById('receipt-notes') as HTMLTextAreaElement)?.value
                        const file = fileInput?.files?.[0]

                        if (!file) {
                          alert('Lütfen bir dosya seçin')
                          return
                        }

                        try {
                          const formData = new FormData()
                          formData.append('file', file)

                          const uploadResponse = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData
                          })

                          const uploadData = await uploadResponse.json()

                          if (!uploadData.success) {
                            alert('Dosya yüklenemedi: ' + (uploadData.error || 'Bilinmeyen hata'))
                            return
                          }

                          const updateData: any = {
                            payment_receipt_filename: file.name,
                            payment_receipt_url: uploadData.url,
                            payment_receipt_uploaded_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
                          }

                          if (notes) {
                            updateData.payment_notes = notes
                          }

                          const response = await fetch(`/api/registrations/${params.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updateData)
                          })

                          if (response.ok) {
                            modal.remove()
                            alert('Dekont başarıyla yüklendi')
                            fetchRegistration()
                          } else {
                            alert('Güncelleme başarısız oldu')
                          }
                        } catch (error) {
                          console.error('Error:', error)
                          alert('Bir hata oluştu')
                        }
                      })

                      modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                          modal.remove()
                        }
                      })
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 underline"
                  >
                    + Dekont Yükle
                  </button>
                </div>
              )}
              
              {/* Tahsilat Onay Butonu */}
              {registration.payment_status === 'pending' && (
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      // Modal oluştur
                      const modal = document.createElement('div')
                      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
                      modal.innerHTML = `
                        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                          <h3 class="text-xl font-bold text-gray-900 mb-4">✅ Tahsilatı Onayla</h3>
                          <p class="text-gray-600 mb-4">
                            Tahsilat onaylanacak. İsteğe bağlı olarak açıklama ve dekont ekleyebilirsiniz.
                          </p>
                          
                          <div class="space-y-4">
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-2">Açıklama (Opsiyonel)</label>
                              <textarea
                                id="payment-notes"
                                rows="3"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Tahsilat ile ilgili notlar..."
                              ></textarea>
                            </div>
                            
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-2">Dekont Yükle (Opsiyonel)</label>
                              <input
                                type="file"
                                id="receipt-file"
                                accept="image/*,.pdf"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                              <p class="text-xs text-gray-500 mt-1">JPG, PNG veya PDF formatında</p>
                            </div>
                          </div>
                          
                          <div class="flex gap-3 mt-6">
                            <button
                              id="cancel-btn"
                              class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                              İptal
                            </button>
                            <button
                              id="confirm-btn"
                              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              ✅ Tahsilatı Onayla
                            </button>
                          </div>
                        </div>
                      `
                      document.body.appendChild(modal)

                      // İptal butonu
                      modal.querySelector('#cancel-btn')?.addEventListener('click', () => {
                        modal.remove()
                      })

                      // Onay butonu
                      modal.querySelector('#confirm-btn')?.addEventListener('click', async () => {
                        const notes = (document.getElementById('payment-notes') as HTMLTextAreaElement)?.value
                        const fileInput = document.getElementById('receipt-file') as HTMLInputElement
                        const file = fileInput?.files?.[0]

                        try {
                          const paymentData: any = {
                            payment_status: 'completed',
                            payment_confirmed_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
                          }

                          if (notes) {
                            paymentData.payment_notes = notes
                          }

                          // Dosya varsa önce yükle
                          if (file) {
                            const formData = new FormData()
                            formData.append('file', file)

                            const uploadResponse = await fetch('/api/upload', {
                              method: 'POST',
                              body: formData
                            })

                            const uploadData = await uploadResponse.json()

                            if (uploadData.success) {
                              paymentData.payment_receipt_filename = file.name
                              paymentData.payment_receipt_url = uploadData.url
                              paymentData.payment_receipt_uploaded_at = new Date().toISOString().slice(0, 19).replace('T', ' ')
                            }
                          }

                          // Tahsilat durumunu güncelle
                          const response = await fetch(`/api/registrations/${params.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(paymentData)
                          })

                          const data = await response.json()

                          if (response.ok) {
                            modal.remove()
                            alert('Tahsilat başarıyla onaylandı')
                            fetchRegistration()
                          } else {
                            alert(data.error || 'Güncelleme başarısız oldu')
                          }
                        } catch (error) {
                          console.error('Error:', error)
                          alert('Bir hata oluştu')
                        }
                      })

                      // Modal dışına tıklanınca kapat
                      modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                          modal.remove()
                        }
                      })
                    }}
                    className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                  >
                    ✓ Tahsilatı Onayla
                  </button>
                </div>
              )}
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
                  {registration.selections.map((selection) => {
                    // Para sistemde değil: İade tamamlandı veya hiç gelmedi
                    const isMoneyNotInSystem = selection.is_cancelled && (
                      selection.refund_status === 'completed' || 
                      selection.payment_status === 'cancelled'
                    )
                    // Para sistemde: İptal edilmiş ama iade bekliyor/reddedildi
                    const isMoneyInSystem = selection.is_cancelled && (
                      selection.refund_status === 'pending' || 
                      selection.refund_status === 'rejected'
                    )
                    
                    return (
                    <div
                      key={selection.id}
                      className={`border rounded-lg p-4 ${
                        isMoneyNotInSystem
                          ? 'border-gray-300 bg-gray-100' 
                          : isMoneyInSystem
                            ? 'border-orange-200 bg-orange-50'
                            : 'border-gray-200 hover:border-primary-300 transition-colors'
                      }`}
                    >
                      {/* Üst Kısım - Kategori ve Tutar */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              isMoneyNotInSystem
                                ? 'bg-gray-200 text-gray-700'
                                : selection.refund_status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : selection.refund_status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                  : isMoneyInSystem
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-primary-100 text-primary-800'
                            }`}>
                              {selection.category_name}
                            </span>
                            {selection.is_cancelled ? (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                isMoneyNotInSystem
                                  ? 'bg-gray-300 text-gray-800'
                                  : selection.refund_status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : selection.refund_status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-orange-200 text-orange-900'
                              }`}>
                                {isMoneyNotInSystem
                                  ? '❌ İptal Edildi' 
                                  : selection.refund_status === 'rejected'
                                    ? '❌ İptal Edildi, ✗ İade Reddedildi'
                                    : selection.refund_status === 'pending'
                                      ? '❌ İptal Edildi, ⏳ İade Beklemede'
                                      : '❌ İptal Edildi'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                ✓ Kayıtlı
                              </span>
                            )}
                          </div>
                          <p className={`font-medium ${
                            isMoneyNotInSystem
                              ? 'text-gray-500 line-through' 
                              : selection.is_cancelled 
                                ? 'text-gray-700' 
                                : 'text-gray-900'
                          }`}>
                            {selection.type_label}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${
                            isMoneyNotInSystem
                              ? 'text-gray-400 line-through' 
                              : selection.is_cancelled 
                                ? 'text-orange-600' 
                                : 'text-gray-900'
                          }`}>
                            {formatTurkishCurrency(selection.applied_fee_try)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Fiyat Detayları */}
                      <div className="space-y-1 pb-3 border-b border-gray-200">
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>KDV (%{(selection.vat_rate * 100).toFixed(0)}): {formatTurkishCurrency(selection.vat_amount_try)}</span>
                          <span className={`font-medium ${
                            isMoneyNotInSystem
                              ? 'text-gray-400 line-through' 
                              : selection.is_cancelled 
                                ? 'text-orange-600' 
                                : 'text-gray-700'
                          }`}>
                            Toplam: {formatTurkishCurrency(selection.total_try)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500">Ödeme Durumu:</span>
                          <span className={`font-medium px-2 py-0.5 rounded ${
                            selection.payment_status === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : selection.payment_status === 'refunded'
                                ? 'bg-purple-100 text-purple-700'
                                : selection.payment_status === 'cancelled'
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {selection.payment_status === 'completed' 
                              ? '✓ Ödendi' 
                              : selection.payment_status === 'refunded'
                                ? '↩ İade Edildi'
                                : selection.payment_status === 'cancelled'
                                  ? '✗ İptal'
                                  : '⏳ Beklemede'}
                          </span>
                        </div>
                        {selection.document_url && (
                          <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-gray-100">
                            <span className="text-gray-500">Belge:</span>
                            <a
                              href={selection.document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700 underline font-medium"
                            >
                              📄 {selection.document_filename || 'Belge Görüntüle'}
                            </a>
                          </div>
                        )}
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
                            {selection.refund_status === 'pending' && (
                              <div className="space-y-2">
                                <div className="text-xs text-yellow-700 bg-yellow-50 rounded p-2 flex items-center gap-2">
                                  <span className="text-base">⏳</span>
                                  <div>
                                    <div className="font-medium">İade Talebi Beklemede</div>
                                    <div className="text-yellow-600 mt-1">
                                      Talep: {selection.refund_requested_at ? new Date(selection.refund_requested_at).toLocaleString('tr-TR') : '-'}
                                    </div>
                                  </div>
                                </div>
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
                                  <button
                                    onClick={() => handleUndoCancel(selection.id)}
                                    className="flex-1 text-xs bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded transition-colors"
                                  >
                                    ↩️ İptali Geri Al
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            {/* Para sistemde değil - İade tamamlandı veya hiç gelmedi */}
                            {isMoneyNotInSystem && (
                              <div className="text-xs text-gray-700 bg-gray-100 rounded p-2">
                                <div className="font-medium">✓ İşlem Tamamlandı</div>
                                <div className="text-gray-600 mt-1">
                                  {selection.refund_status === 'completed' 
                                    ? `Para iadesi yapıldı: ${selection.refund_completed_at ? new Date(selection.refund_completed_at).toLocaleString('tr-TR') : '-'}`
                                    : 'Para sisteme hiç gelmedi, iade süreci yok'}
                                </div>
                                {selection.refund_status === 'completed' && selection.refund_amount && (
                                  <div className="text-gray-600">
                                    İade tutarı: {formatTurkishCurrency(selection.refund_amount)}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* İade süreci yok ama para sistemde değil - Sadece iptali geri al */}
                            {selection.refund_status === 'none' && selection.payment_status !== 'cancelled' && (
                              <div className="space-y-2">
                                <div className="text-xs text-gray-700 bg-gray-100 rounded p-2">
                                  <div className="font-medium">💡 Para henüz sisteme gelmediği için iade süreci yok</div>
                                </div>
                                <button
                                  onClick={() => handleUndoCancel(selection.id)}
                                  className="w-full text-xs bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded transition-colors"
                                >
                                  ↩️ İptali Geri Al
                                </button>
                              </div>
                            )}
                            
                            {selection.refund_status === 'rejected' && (
                              <div className="space-y-2">
                                <div className="text-xs text-red-700 bg-red-50 rounded p-2">
                                  <div className="font-medium">✗ İade Reddedildi</div>
                                  {selection.refund_notes && (
                                    <div className="text-red-600 mt-1">Not: {selection.refund_notes}</div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUndoRefundRejection(selection.id)}
                                    className="flex-1 text-xs bg-orange-600 text-white hover:bg-orange-700 px-3 py-2 rounded transition-colors"
                                  >
                                    ↩️ İade Reddini Geri Al
                                  </button>
                                  <button
                                    onClick={() => handleUndoCancel(selection.id)}
                                    className="flex-1 text-xs bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded transition-colors"
                                  >
                                    ↩️ İptali Geri Al
                                  </button>
                                </div>
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
                  )
                  })}
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
                  <span className="text-gray-900">TOPLAM</span>
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
