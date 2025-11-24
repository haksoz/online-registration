'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatTurkishCurrency } from '@/lib/currencyUtils'
import * as XLSX from 'xlsx'
import Pagination from '@/components/ui/Pagination'
import { registrationTypeLabels } from '@/constants/registrationFees'


interface RegistrationSelection {
  id: number
  registration_type_id: number
  category_id: number
  category_name: string
  type_label: string
  applied_fee_try: number
  applied_currency: string
  applied_fee_amount: number
  vat_amount_try: number
  total_try: number
}

interface Registration {
  id: number
  reference_number: string
  first_name?: string
  last_name?: string
  full_name: string
  email: string
  phone: string
  address?: string
  company?: string
  invoice_type: string
  // Bireysel fatura bilgileri
  invoice_full_name?: string
  id_number?: string
  invoice_address?: string
  // Kurumsal fatura bilgileri
  invoice_company_name?: string
  tax_office?: string
  tax_number?: string
  // Kayıt bilgileri
  registration_type: string
  fee: number
  currency?: string
  total_fee?: number
  vat_amount?: number
  grand_total?: number
  selections?: RegistrationSelection[]
  payment_method: string
  payment_status: 'pending' | 'completed'
  status: number
  refund_status?: 'none' | 'pending' | 'completed' | 'rejected'
  refund_amount?: number
  payment_receipt_filename?: string
  payment_notes?: string
  created_at: string
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegistrations, setSelectedRegistrations] = useState<number[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)



  const fetchRegistrations = async (page = currentPage, limit = itemsPerPage) => {
    try {
      setLoading(true)
      console.log('Frontend Debug - Fetching page:', page, 'limit:', limit)
      const res = await fetch(`/api/registrations?page=${page}&limit=${limit}`)
      const response = await res.json()
      
      console.log('Frontend Debug - Response:', response)
      
      if (response.data && Array.isArray(response.data)) {
        console.log('Frontend Debug - Setting registrations:', response.data.length, 'items')
        setRegistrations(response.data)
        setCurrentPage(response.pagination.currentPage)
        setTotalPages(response.pagination.totalPages)
        setTotalItems(response.pagination.totalItems)
      } else if (Array.isArray(response)) {
        // Fallback for old API format
        console.log('Frontend Debug - Using fallback format')
        setRegistrations(response)
      } else {
        // Error case - ensure registrations is always an array
        console.error('Invalid response format:', response)
        setRegistrations([])
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching registrations:', error)
      setRegistrations([]) // Ensure registrations is always an array
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistrations()
    fetchCurrentUser()
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchRegistrations(page, itemsPerPage)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page
    fetchRegistrations(1, newItemsPerPage)
  }

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/admin/me')
      const data = await response.json()
      if (data.success) {
        setCurrentUser(data.data)
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }







  // Toplam tutarı hesapla
  const calculateGrandTotal = (registration: Registration): number => {
    if (registration.selections && registration.selections.length > 0) {
      return registration.selections.reduce((sum, sel) => sum + Number(sel.total_try || 0), 0)
    }
    return Number(registration.fee || 0)
  }

  const getPaymentMethodLabel = (method: string): string => {
    return method === 'online' ? 'Online Ödeme' : method === 'bank_transfer' ? 'Banka Transferi' : method
  }

  const getPaymentStatusLabel = (status: string): string => {
    return status === 'completed' ? 'Tamamlandı' : status === 'pending' ? 'Beklemede' : status
  }

  const getPaymentStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    if (status === 'completed') {
      return `${baseClasses} bg-green-100 text-green-800`
    } else if (status === 'pending') {
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    }
    return `${baseClasses} bg-gray-100 text-gray-800`
  }

  const getCombinedPaymentStatus = (method: string, status: string) => {
    const methodLabel = method === 'online' ? 'Online Ödeme' : 'Banka Transferi'
    const statusLabel = status === 'completed' ? 'Tamamlandı' : 'Beklemede'
    return `${methodLabel} ${statusLabel}`
  }

  const handlePaymentConfirmation = (registrationId: number) => {
    // Tahsilat onay modal'ı aç
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-4">✅ Tahsilatı Onayla</h3>
        <p class="text-gray-600 mb-4">
          Tahsilat onaylanacak. İsteğe bağlı olarak açıklama ve dekont ekleyebilirsiniz.
        </p>
        
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Açıklama (Opsiyonel)
            </label>
            <textarea 
              id="paymentNotes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Tahsilat ile ilgili notlar..."
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Dekont Yükle (Opsiyonel)
            </label>
            <input 
              type="file" 
              id="receiptFileList"
              accept="image/*,.pdf"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p class="text-xs text-gray-500 mt-1">
              JPG, PNG veya PDF formatında dosya yükleyebilirsiniz
            </p>
          </div>
        </div>
        
        <div class="flex justify-end gap-3">
          <button 
            onclick="this.closest('.fixed').remove()"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
          <button 
            onclick="confirmPaymentFromList(${registrationId})"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            ✅ Tahsilatı Onayla
          </button>
        </div>
      </div>
    `
    
    document.body.appendChild(modal)
    
    // Global fonksiyon tanımla
    ;(window as any).confirmPaymentFromList = async (id: number) => {
      const notesInput = document.getElementById('paymentNotes') as HTMLTextAreaElement
      const fileInput = document.getElementById('receiptFileList') as HTMLInputElement
      const file = fileInput?.files?.[0]
      const notes = notesInput?.value.trim()
      
      try {
        // Önce tahsilat durumunu güncelle
        const paymentData: any = {
          payment_status: 'completed',
          payment_confirmed_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        }
        
        // Açıklama varsa ekle
        if (notes) {
          paymentData.payment_notes = notes
        }
        
        // Dekont varsa önce yükle
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
          } else {
            alert('Dosya yüklenemedi: ' + (uploadData.error || 'Bilinmeyen hata'))
            return
          }
        }
        
        // Tahsilat durumunu güncelle (dosya yükleme başarılı veya dosya yoksa)
        const response = await fetch(`/api/registrations/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData),
        })

        const data = await response.json()

        if (response.ok) {
          modal.remove()
          alert('Tahsilat başarıyla onaylandı')
          window.location.reload()
        } else {
          alert(data.error || 'Onay başarısız oldu')
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Bir hata oluştu')
      }
    }
  }

  const updatePaymentStatus = async (id: number, status: 'pending' | 'completed') => {
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payment_status: status }),
      })

      const data = await response.json()

      if (response.ok) {
        fetchRegistrations() // Refresh the table
        alert(data.message || 'Tahsilat durumu güncellendi')
      } else {
        alert(data.error || 'Güncelleme başarısız oldu')
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
      alert('Bir hata oluştu')
    }
  }

  const getInvoiceTypeLabel = (type: string): string => {
    return type === 'bireysel' ? 'Bireysel' : type === 'kurumsal' ? 'Kurumsal' : type
  }

  const getRegistrationTypeLabel = (type: string): string => {
    return registrationTypeLabels[type as keyof typeof registrationTypeLabels] || type
  }

  // Checkbox functions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRegistrations(registrations.map(r => r.id))
    } else {
      setSelectedRegistrations([])
    }
  }

  const handleSelectRegistration = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRegistrations(prev => [...prev, id])
    } else {
      setSelectedRegistrations(prev => prev.filter(regId => regId !== id))
    }
  }

  // Excel export function
  const exportToExcel = () => {
    if (selectedRegistrations.length === 0) {
      alert('Lütfen en az bir kayıt seçin.')
      return
    }

    const selectedData = registrations.filter(r => selectedRegistrations.includes(r.id))
    
    const excelData = selectedData.map(r => ({
      'ID': r.id,
      'Referans No': r.reference_number || '-',
      'Ad': r.first_name || '-',
      'Soyad': r.last_name || '-',
      'Ad Soyad': r.full_name,
      'Email': r.email,
      'Telefon': r.phone,
      'Adres': r.address || '-',
      'Şirket': r.company || '-',
      'Fatura Tipi': getInvoiceTypeLabel(r.invoice_type),
      // Bireysel fatura bilgileri
      'Fatura Adı': r.invoice_full_name || '-',
      'TC Kimlik No': r.id_number || '-',
      'Fatura Adresi': r.invoice_address || '-',
      // Kurumsal fatura bilgileri
      'Şirket Adı': r.invoice_company_name || '-',
      'Vergi Dairesi': r.tax_office || '-',
      'Vergi Numarası': r.tax_number || '-',
      // Kayıt bilgileri
      'Kayıt Türü': getRegistrationTypeLabel(r.registration_type),
      'Kayıt Durumu': r.status === 1 ? 'Kayıtlı' : r.status === 0 ? 'İptal' : 'Bilinmiyor',
      'Ücret (TL)': formatTurkishCurrency(calculateGrandTotal(r)),
      'Ödeme Yöntemi': getPaymentMethodLabel(r.payment_method),
      'Ödeme Durumu': getPaymentStatusLabel(r.payment_status),
      'Kayıt Tarihi': new Date(r.created_at).toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kayıtlar')
    
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0] // 2025-01-03
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '') // 1430 (14:30)
    const fileName = `kayitlar_${dateStr}_${timeStr}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Kayıtlar</h2>
        <button
          onClick={exportToExcel}
          disabled={selectedRegistrations.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Excel'e Aktar ({selectedRegistrations.length})
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedRegistrations.length === registrations.length && registrations.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Katılımcı Bilgileri
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fatura Tipi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kayıt Türü
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ücret
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ödeme Durumu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Oluşturulma Tarihi
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!Array.isArray(registrations) || registrations.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  {loading ? 'Yükleniyor...' : 'Henüz kayıt bulunmamaktadır.'}
                </td>
              </tr>
            ) : (
              registrations.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedRegistrations.includes(r.id)}
                      onChange={(e) => handleSelectRegistration(r.id, e.target.checked)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    #{r.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{r.full_name}</div>
                      <div className="text-xs text-gray-500 mt-1">{r.email}</div>
                      {r.reference_number && (
                        <div className="text-xs text-gray-400 mt-1">Ref: {r.reference_number}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                    {getInvoiceTypeLabel(r.invoice_type)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {r.selections && r.selections.length > 0 ? (
                      <div className="space-y-1">
                        {r.selections.map((sel: any) => {
                          // Para sistemde değil: İade tamamlandı veya hiç gelmedi
                          const isMoneyNotInSystem = sel.is_cancelled && (
                            sel.refund_status === 'completed' || 
                            sel.payment_status === 'cancelled'
                          )
                          // Para sistemde: İptal edilmiş ama iade bekliyor/reddedildi
                          const isMoneyInSystem = sel.is_cancelled && (
                            sel.refund_status === 'pending' || 
                            sel.refund_status === 'rejected'
                          )
                          
                          return (
                            <div key={sel.id} className="flex items-center gap-2 flex-wrap">
                              {/* Kategori Badge */}
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                isMoneyNotInSystem
                                  ? 'bg-gray-200 text-gray-700'
                                  : sel.refund_status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : sel.refund_status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : isMoneyInSystem
                                        ? 'bg-orange-100 text-orange-800'
                                        : 'bg-primary-100 text-primary-800'
                              }`}>
                                {sel.category_name}
                              </span>
                              
                              {/* Durum Badge */}
                              {sel.is_cancelled ? (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  isMoneyNotInSystem
                                    ? 'bg-gray-300 text-gray-800'
                                    : sel.refund_status === 'rejected'
                                      ? 'bg-red-100 text-red-800'
                                      : sel.refund_status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-orange-200 text-orange-900'
                                }`}>
                                  {isMoneyNotInSystem
                                    ? '❌ İptal' 
                                    : sel.refund_status === 'rejected'
                                      ? '❌ İptal, ✗ İade Red'
                                      : sel.refund_status === 'pending'
                                        ? '❌ İptal, ⏳ İade Beklemede'
                                        : '❌ İptal'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  ✓ Kayıtlı
                                </span>
                              )}
                              
                              {/* Fiyat */}
                              <span className={`text-xs font-semibold ${
                                isMoneyNotInSystem
                                  ? 'text-gray-400 line-through' 
                                  : isMoneyInSystem
                                    ? 'text-orange-600' 
                                    : 'text-gray-900'
                              }`}>
                                {formatTurkishCurrency(sel.total_try)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <span className="text-gray-400">{getRegistrationTypeLabel(r.registration_type)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {(() => {
                      const total = calculateGrandTotal(r)
                      return total > 0 ? (
                        <div>
                          <div className="font-semibold text-primary-600">{formatTurkishCurrency(total)}</div>
                          <div className="text-xs text-gray-500">KDV Dahil</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col gap-1">
                      {/* Aktif kayıtlar için ödeme durumu */}
                      {r.status === 1 && (
                        <>
                          <span className={getPaymentStatusBadge(r.payment_status)}>
                            {getCombinedPaymentStatus(r.payment_method, r.payment_status)}
                          </span>
                          
                          {/* Dekont durumu - sadece dekont varsa göster */}
                          {r.payment_method === 'bank_transfer' && r.payment_receipt_filename && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              📄 Dekont Var
                            </span>
                          )}
                          
                          {/* Tahsilat onay butonu */}
                          {r.payment_method === 'bank_transfer' && r.payment_status === 'pending' && currentUser?.role !== 'reporter' && (
                            <button
                              onClick={() => handlePaymentConfirmation(r.id)}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              title="Tahsilatı Onayla"
                            >
                              ✓ Tahsilatı Onayla
                            </button>
                          )}
                        </>
                      )}
                      
                      {/* İptal edilen kayıtlar için iade durumu */}
                      {r.status === 0 && (
                        <>
                          {/* Ödeme tamamlanmış ve iade var */}
                          {r.payment_status === 'completed' && r.refund_status && r.refund_status !== 'none' ? (
                            <>
                              {/* Ödeme yöntemi bilgisi - sadece iade beklemede ise göster */}
                              {r.refund_status === 'pending' && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  {r.payment_method === 'online' ? 'Online Ödeme Tamamlandı' : 'Banka Transferi Tamamlandı'}
                                </span>
                              )}
                              
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                r.refund_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                r.refund_status === 'completed' ? 'bg-green-100 text-green-800' :
                                r.refund_status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {r.refund_status === 'pending' ? '💰 İade Beklemede' :
                                 r.refund_status === 'completed' ? '✅ İade Tamamlandı' :
                                 r.refund_status === 'rejected' ? '❌ İade Reddedildi' : 
                                 `💰 ${r.refund_status}`}
                              </span>
                            </>
                          ) : (
                            /* Ödeme beklemedeyken iptal veya iade yok */
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              {r.payment_status === 'completed' ? '💳 Ödeme Alındı' : '⏳ Ödeme Beklemedeyken İptal Edildi'}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(r.created_at).toLocaleString('tr-TR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end">
                      <Link 
                        href={`/admin/registrations/${r.id}`} 
                        className="text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        Detay
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  )
}
