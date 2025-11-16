'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { registrationTypeLabels } from '@/constants/registrationFees'
import { formatTurkishCurrency } from '@/lib/currencyUtils'
import { RegistrationType } from '@/types/registration'

interface PaymentReceipt {
  id: number
  registration_id: number
  filename: string
  file_url: string
  uploaded_at: string
  uploaded_by?: number
  uploaded_by_username?: string
  notes?: string
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
  department?: string
  invoice_type: string
  invoice_full_name?: string
  id_number?: string
  invoice_address?: string
  invoice_company_name?: string
  tax_office?: string
  tax_number?: string
  registration_type: string
  registration_type_label_en?: string
  form_language?: string
  fee: number
  currency_code?: string
  fee_in_currency?: number
  exchange_rate?: number
  payment_method: string
  payment_status: 'pending' | 'completed'
  status: number
  refund_status?: 'none' | 'pending' | 'completed' | 'rejected'
  refund_amount?: number
  refund_date?: string
  refund_notes?: string
  refund_method?: string
  cancelled_at?: string
  cancelled_by?: number
  payment_receipt_url?: string
  payment_receipt_filename?: string
  payment_receipt_uploaded_at?: string
  payment_confirmed_at?: string
  payment_notes?: string
  created_at: string
}

interface PaymentReceipt {
  id: number
  registration_id: number
  filename: string
  file_url: string
  uploaded_at: string
  uploaded_by?: number
  uploaded_by_username?: string
  notes?: string
}

interface RegistrationDetailClientProps {
  registration: Registration
}

export default function RegistrationDetailClient({ registration }: RegistrationDetailClientProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [registrationTypes, setRegistrationTypes] = useState<RegistrationType[]>([])
  const [cancellationDeadline, setCancellationDeadline] = useState<string>('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([])
  const [formData, setFormData] = useState({
    first_name: registration.first_name || '',
    last_name: registration.last_name || '',
    full_name: registration.full_name || '',
    email: registration.email || '',
    phone: registration.phone || '',
    address: registration.address || '',
    company: registration.company || '',
    department: registration.department || '',
    invoice_type: registration.invoice_type || 'bireysel',
    invoice_full_name: registration.invoice_full_name || '',
    id_number: registration.id_number || '',
    invoice_address: registration.invoice_address || '',
    invoice_company_name: registration.invoice_company_name || '',
    tax_office: registration.tax_office || '',
    tax_number: registration.tax_number || '',
    registration_type: registration.registration_type || '',
    registration_type_label_en: registration.registration_type_label_en || '',
    fee: registration.fee?.toString() || '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchRegistrationTypes = async () => {
      try {
        const response = await fetch('/api/registration-types')
        const data = await response.json()
        if (data.success) {
          setRegistrationTypes(data.data)
        }
      } catch (error) {
        console.error('Error fetching registration types:', error)
      }
    }
    fetchRegistrationTypes()

    // Fetch cancellation deadline
    const fetchCancellationDeadline = async () => {
      try {
        const response = await fetch('/api/admin/registration-settings')
        const data = await response.json()
        if (data.success) {
          setCancellationDeadline(data.cancellationDeadline || '')
        }
      } catch (error) {
        console.error('Error fetching cancellation deadline:', error)
      }
    }
    fetchCancellationDeadline()

    // Fetch current user
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
    fetchCurrentUser()
  }, [])

  const getPaymentMethodLabel = (method: string): string => {
    return method === 'online' ? 'Online Ödeme' : method === 'bank_transfer' ? 'Banka Transferi' : method
  }

  const getPaymentStatusLabel = (status: string): string => {
    return status === 'completed' ? 'Tahsil Edildi' : status === 'pending' ? 'Tahsilat Beklemede' : status
  }

  const getPaymentStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-sm font-medium rounded-full"
    if (status === 'completed') {
      return `${baseClasses} bg-green-100 text-green-800`
    } else if (status === 'pending') {
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    }
    return `${baseClasses} bg-gray-100 text-gray-800`
  }

  const handleCancelRegistration = async () => {
    // İptal son tarihi kontrolü
    let deadlineWarning = ''
    if (cancellationDeadline) {
      const deadline = new Date(cancellationDeadline)
      const now = new Date()
      
      if (now > deadline) {
        deadlineWarning = `\n\n🚨 ÖNEMLİ UYARI: İPTAL SON TARİHİ GEÇMİŞTİR!\n\nİptal son tarihi: ${deadline.toLocaleDateString('tr-TR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}\n\nBu tarihten sonra yapılan iptaller politika dışıdır.\nYine de devam etmek istediğinizden emin misiniz?\n`
      }
    }

    // Ödeme tamamlanmış kayıtlar için özel uyarı
    let confirmMessage = 'Bu kaydı iptal etmek istediğinizden emin misiniz?'
    
    if (registration.payment_status === 'completed') {
      confirmMessage = `⚠️ DİKKAT: Bu kayıt için ödeme tamamlanmış!

Kayıt iptal edilirse:
• Ödeme durumu değiştirilemez
• İade süreci başlatılır (${formatTurkishCurrency(registration.fee)})
• İade tamamlanana kadar kayıt tekrar aktifleştirilemez${deadlineWarning}

Devam etmek istediğinizden emin misiniz?`
    } else if (deadlineWarning) {
      confirmMessage = deadlineWarning + '\nBu kaydı iptal etmek istediğinizden emin misiniz?'
    }

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      const cancelData: any = {
        status: 0
      }

      // Ödeme tamamlanmışsa iade bilgilerini ekle
      if (registration.payment_status === 'completed') {
        cancelData.refund_status = 'pending'
        cancelData.refund_amount = registration.fee
        // cancelled_at ve cancelled_by API tarafında otomatik ekleniyor
      }

      const response = await fetch(`/api/registrations/${registration.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cancelData),
      })

      const data = await response.json()

      if (response.ok) {
        const message = registration.payment_status === 'completed' 
          ? 'Kayıt iptal edildi ve iade süreci başlatıldı'
          : 'Kayıt başarıyla iptal edildi'
        alert(message)
        window.location.reload()
      } else {
        console.error('Cancel error:', data)
        alert(data.error || data.details || 'İptal işlemi başarısız oldu')
      }
    } catch (error) {
      console.error('Error canceling registration:', error)
      alert('Bir hata oluştu')
    }
  }



  const handlePaymentConfirmation = () => {
    // Dekont yükleme modal'ı aç
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Tahsilatı Onayla</h3>
        <p class="text-gray-600 mb-4">
          Tahsilat onaylanacak. İsteğe bağlı olarak dekont yükleyebilirsiniz.
        </p>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Dekont Yükle (Opsiyonel)
          </label>
          <input 
            type="file" 
            id="receiptFile"
            accept="image/*,.pdf"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p class="text-xs text-gray-500 mt-1">
            JPG, PNG veya PDF formatında dosya yükleyebilirsiniz
          </p>
        </div>
        
        <div class="flex justify-end gap-3">
          <button 
            onclick="this.closest('.fixed').remove()"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
          <button 
            onclick="confirmPayment()"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Tahsilatı Onayla
          </button>
        </div>
      </div>
    `
    
    document.body.appendChild(modal)
    
    // Global fonksiyon tanımla
    ;(window as any).confirmPayment = async () => {
      const fileInput = document.getElementById('receiptFile') as HTMLInputElement
      const file = fileInput?.files?.[0]
      
      try {
        let receiptData = {}
        
        if (file) {
          // Basit file upload simulation (gerçek projede cloud storage kullanın)
          const formData = new FormData()
          formData.append('receipt', file)
          
          // Şimdilik dosya adını kaydet (gerçek upload olmadan)
          receiptData = {
            payment_receipt_filename: file.name,
            payment_receipt_url: `/uploads/receipts/${Date.now()}_${file.name}`, // Simulated URL
            payment_receipt_uploaded_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
          }
        }
        
        await updatePaymentStatus('completed', receiptData)
        modal.remove()
      } catch (error) {
        console.error('Error:', error)
        alert('Bir hata oluştu')
      }
    }
  }

  const handleReceiptUpload = () => {
    // Mevcut dekont varsa uyarı göster
    const hasExistingReceipt = registration.payment_receipt_filename
    const warningMessage = hasExistingReceipt 
      ? `<div class="mb-4 bg-amber-50 border border-amber-300 rounded-lg p-3">
           <div class="flex items-start gap-2">
             <svg class="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
             <div class="flex-1">
               <p class="text-sm font-semibold text-amber-800">⚠️ Dikkat!</p>
               <p class="text-xs text-amber-700 mt-1">
                 Mevcut dekont var: <strong>${registration.payment_receipt_filename}</strong><br/>
                 Yeni dekont yüklenirse mevcut dekont silinecektir.
               </p>
             </div>
           </div>
         </div>`
      : ''

    // Sadece dekont yükleme modal'ı
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-4">📄 Dekont Yükle</h3>
        <p class="text-gray-600 mb-4">
          Ödeme dekontunu yükleyebilirsiniz.
        </p>
        
        ${warningMessage}
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Dekont Dosyası <span class="text-red-500">*</span>
          </label>
          <input 
            type="file" 
            id="receiptFileOnly"
            accept="image/*,.pdf"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
          <p class="text-xs text-gray-500 mt-1">
            JPG, PNG veya PDF formatında dosya yükleyiniz
          </p>
        </div>
        
        <div class="flex justify-end gap-3">
          <button 
            onclick="this.closest('.fixed').remove()"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
          <button 
            onclick="uploadReceiptOnly()"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📤 Dekont Yükle
          </button>
        </div>
      </div>
    `
    
    document.body.appendChild(modal)
    
    // Global fonksiyon tanımla
    ;(window as any).uploadReceiptOnly = async () => {
      const fileInput = document.getElementById('receiptFileOnly') as HTMLInputElement
      const file = fileInput?.files?.[0]
      
      if (!file) {
        alert('Lütfen bir dosya seçin')
        return
      }
      
      try {
        // Dosya yükleme (gerçek upload API'si kullanılmalı)
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
        
        // Dekont bilgilerini güncelle
        const receiptData = {
          payment_receipt_filename: file.name,
          payment_receipt_url: uploadData.url,
          payment_receipt_uploaded_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        }
        
        const response = await fetch(`/api/registrations/${registration.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(receiptData),
        })

        const data = await response.json()

        if (response.ok) {
          alert('Dekont başarıyla yüklendi')
          window.location.reload()
        } else {
          alert(data.error || 'Yükleme başarısız oldu')
        }
        
        modal.remove()
      } catch (error) {
        console.error('Error:', error)
        alert('Bir hata oluştu')
      }
    }
  }

  const handleReceiptDelete = async () => {
    if (!confirm('Dekont silinecek. Devam etmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/registrations/${registration.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ delete_receipt: true }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('Dekont başarıyla silindi')
        window.location.reload()
      } else {
        alert(data.error || 'Silme başarısız oldu')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Bir hata oluştu')
    }
  }

  const updatePaymentStatus = async (status: 'pending' | 'completed', receiptData = {}) => {
    try {
      const response = await fetch(`/api/registrations/${registration.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          payment_status: status,
          ...receiptData,
          ...(status === 'completed' && {
            payment_confirmed_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
          })
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message || 'Tahsilat durumu güncellendi')
        window.location.reload() // Refresh the page to show updated status
      } else {
        alert(data.error || 'Güncelleme başarısız oldu')
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
      alert('Bir hata oluştu')
    }
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch(`/api/registrations/${registration.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          company: formData.company,
          department: formData.department,
          invoice_type: formData.invoice_type,
          invoice_full_name: formData.invoice_full_name,
          id_number: formData.id_number,
          invoice_address: formData.invoice_address,
          invoice_company_name: formData.invoice_company_name,
          tax_office: formData.tax_office,
          tax_number: formData.tax_number,
          registration_type: formData.registration_type,
          fee: formData.fee ? parseFloat(formData.fee) : null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('Kayıt başarıyla güncellendi')
        setIsEditing(false)
        window.location.reload() // Refresh to show updated data
      } else {
        alert(data.error || 'Güncelleme başarısız oldu')
      }
    } catch (error) {
      console.error('Error updating registration:', error)
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const getInvoiceTypeLabel = (type: string): string => {
    return type === 'bireysel' ? 'Bireysel' : type === 'kurumsal' ? 'Kurumsal' : type
  }

  const getRegistrationTypeLabel = (type: string): string => {
    return registrationTypeLabels[type as keyof typeof registrationTypeLabels] || type
  }

  const getRefundStatusLabel = (status: string): string => {
    const labels = {
      'none': 'İade Yok',
      'pending': 'İade Beklemede',
      'completed': 'İade Tamamlandı',
      'rejected': 'İade Reddedildi'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getRefundStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full"
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const updateRefundStatus = async (newStatus: 'completed' | 'rejected', notes?: string) => {
    try {
      const response = await fetch(`/api/registrations/${registration.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          refund_status: newStatus,
          refund_date: newStatus === 'completed' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null,
          refund_notes: notes || null
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(`İade durumu "${getRefundStatusLabel(newStatus)}" olarak güncellendi`)
        window.location.reload()
      } else {
        alert(data.error || 'Güncelleme başarısız oldu')
      }
    } catch (error) {
      console.error('Error updating refund status:', error)
      alert('Bir hata oluştu')
    }
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
        <h1 className="text-2xl font-bold text-gray-900">
          Kayıt Detayı #{registration.id}
        </h1>
        {registration.reference_number && (
          <p className="text-sm text-gray-600 mt-1">
            Referans No: <span className="font-mono text-primary-600">{registration.reference_number}</span>
          </p>
        )}
        <div className="mt-2">
          {registration.status === 1 ? (
            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
              ✅ Kayıtlı
            </span>
          ) : registration.status === 0 ? (
            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-orange-100 text-orange-800">
              ⚠️ İptal Edilmiş
            </span>
          ) : (
            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
              ❓ Bilinmiyor
            </span>
          )}
        </div>
      </div>

      {/* Registration Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isEditing ? 'Kayıt Düzenle' : 'Kayıt Bilgileri'}
          </h2>

          {isEditing ? (
            /* Edit Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tahsilat Durumu Bilgileri - En Üstte */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-md font-semibold text-gray-900 mb-3">
                  💳 Tahsilat Durumu
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-900 mb-2">
                      <span className="font-medium text-gray-600">Ödeme Yöntemi:</span> {getPaymentMethodLabel(registration.payment_method)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-900 mb-2">
                      <span className="font-medium text-gray-600">Tahsilat Durumu:</span>
                    </p>
                    <div className="flex items-center space-x-3">
                      <span className={getPaymentStatusBadge(registration.payment_status)}>
                        {getPaymentStatusLabel(registration.payment_status)}
                      </span>
                      {/* Tahsilat durumu butonları - sadece banka transferi için */}
                      {registration.payment_method === 'bank_transfer' && registration.status === 1 && (
                        <div className="flex space-x-2">
                          {registration.payment_status === 'completed' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Tahsilat durumu "Beklemede" olarak değiştirilecek. Devam etmek istediğinizden emin misiniz?')) {
                                  updatePaymentStatus('pending')
                                }
                              }}
                              className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                            >
                              ⏳ Tahsilatı Beklemeye Al
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dekont Bilgileri */}
                {registration.payment_method === 'bank_transfer' && (
                  <div className="mt-4">
                    {registration.payment_receipt_filename ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="font-medium text-green-800 text-sm">Dekont Yüklendi</span>
                            </div>
                            <div className="space-y-1 text-xs text-green-700">
                              <p><strong>Dosya:</strong> {registration.payment_receipt_filename}</p>
                              {registration.payment_confirmed_at && (
                                <p><strong>Onay Tarihi:</strong> {new Date(registration.payment_confirmed_at).toLocaleDateString('tr-TR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}</p>
                              )}
                              {registration.payment_notes && (
                                <p><strong>Açıklama:</strong> {registration.payment_notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="ml-3 flex flex-col gap-1">
                            {registration.payment_receipt_url && (
                              <a 
                                href={registration.payment_receipt_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors text-center"
                              >
                                📄 Görüntüle
                              </a>
                            )}
                            {registration.status === 1 && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleReceiptUpload()}
                                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                  title="Yeni dekont yükle"
                                >
                                  🔄 Yeni Yükle
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReceiptDelete()}
                                  className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                  title="Dekont sil"
                                >
                                  🗑️ Sil
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Henüz dekont yüklenmedi</span>
                          {registration.status === 1 && (
                            <button
                              type="button"
                              onClick={() => handleReceiptUpload()}
                              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            >
                              📤 Dekont Yükle
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
                    Kişisel Bilgiler
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Şirket/Kurum</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Departman</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Invoice Information */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
                    Fatura Bilgileri
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fatura Tipi <span className="text-red-500">*</span></label>
                    <select
                      value={formData.invoice_type}
                      onChange={(e) => setFormData({...formData, invoice_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="bireysel">Bireysel</option>
                      <option value="kurumsal">Kurumsal</option>
                    </select>
                  </div>

                  {formData.invoice_type === 'bireysel' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fatura Adı</label>
                        <input
                          type="text"
                          value={formData.invoice_full_name}
                          onChange={(e) => setFormData({...formData, invoice_full_name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">TC Kimlik No</label>
                        <input
                          type="text"
                          value={formData.id_number}
                          onChange={(e) => setFormData({...formData, id_number: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fatura Adresi</label>
                        <textarea
                          value={formData.invoice_address}
                          onChange={(e) => setFormData({...formData, invoice_address: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          rows={3}
                        />
                      </div>
                    </>
                  )}

                  {formData.invoice_type === 'kurumsal' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Adı</label>
                        <input
                          type="text"
                          value={formData.invoice_company_name}
                          onChange={(e) => setFormData({...formData, invoice_company_name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Dairesi</label>
                        <input
                          type="text"
                          value={formData.tax_office}
                          onChange={(e) => setFormData({...formData, tax_office: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Numarası</label>
                        <input
                          type="text"
                          value={formData.tax_number}
                          onChange={(e) => setFormData({...formData, tax_number: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fatura Adresi</label>
                        <textarea
                          value={formData.invoice_address}
                          onChange={(e) => setFormData({...formData, invoice_address: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Registration Information */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
                    Kayıt Bilgileri
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kayıt Türü <span className="text-red-500">*</span>
                      <span className="ml-2 text-xs text-amber-600">(Değiştirilemez)</span>
                    </label>
                    <select
                      value={formData.registration_type}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                      required
                      disabled
                    >
                      <option value="">Seçiniz</option>
                      {registrationTypes.map((type) => (
                        <option key={type.id} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ücret <span className="text-red-500">*</span>
                      <span className="ml-2 text-xs text-amber-600">(Değiştirilemez)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.fee}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                      required
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          ) : (
            /* Display Mode */
          <>
            {/* Ödeme Bilgileri - En Üstte */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-md font-semibold text-gray-900 mb-4">
                💳 Ödeme Bilgileri
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium text-gray-600">Ödeme Yöntemi:</span> {getPaymentMethodLabel(registration.payment_method)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-900 mb-2">
                    <span className="font-medium text-gray-600">Tahsilat Durumu:</span>
                  </p>
                  <div className="flex items-center space-x-3">
                    <span className={getPaymentStatusBadge(registration.payment_status)}>
                      {getPaymentStatusLabel(registration.payment_status)}
                    </span>
                    {/* Tahsilat onay butonu - sadece beklemedeki kayıtlar için */}
                    {registration.payment_method === 'bank_transfer' && registration.status === 1 && registration.payment_status === 'pending' && currentUser?.role !== 'reporter' && (
                      <button
                        onClick={() => handlePaymentConfirmation()}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        ✓ Tahsilatı Onayla
                      </button>
                    )}
                    {/* İptal edilmiş kayıtlar için uyarı */}
                    {registration.status === 0 && (
                      <span className="text-xs text-orange-600 font-medium">
                        ⚠️ İptal edilmiş kayıtlarda tahsilat durumu değiştirilemez
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dekont Bilgileri */}
              {registration.payment_method === 'bank_transfer' && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">📄 Dekont Bilgileri</h4>
                  
                  {registration.payment_receipt_filename ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="font-medium text-green-800">Dekont Yüklendi</span>
                          </div>
                          <div className="space-y-1 text-sm text-green-700">
                            <p><strong>Dosya Adı:</strong> {registration.payment_receipt_filename}</p>
                            {registration.payment_receipt_uploaded_at && (
                              <p><strong>Yüklenme Tarihi:</strong> {new Date(registration.payment_receipt_uploaded_at).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</p>
                            )}
                            {registration.payment_confirmed_at && (
                              <p><strong>Tahsilat Onay Tarihi:</strong> {new Date(registration.payment_confirmed_at).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</p>
                            )}
                            {registration.payment_notes && (
                              <p><strong>Tahsilat Açıklaması:</strong> {registration.payment_notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="ml-3 flex flex-col gap-2">
                          {registration.payment_receipt_url && (
                            <a 
                              href={registration.payment_receipt_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors text-center"
                            >
                              📄 Görüntüle
                            </a>
                          )}
                          {registration.status === 1 && currentUser?.role !== 'reporter' && (
                            <>
                              <button
                                onClick={() => handleReceiptUpload()}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                title="Yeni dekont yükle (mevcut dekont silinecek)"
                              >
                                🔄 Yeni Yükle
                              </button>
                              <button
                                onClick={() => handleReceiptDelete()}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                title="Dekont sil"
                              >
                                🗑️ Sil
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-gray-600">Henüz dekont yüklenmedi</span>
                        </div>
                        {registration.status === 1 && currentUser?.role !== 'reporter' && (
                          <button
                            onClick={() => handleReceiptUpload()}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            📤 Dekont Yükle
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4">
                <p className="text-sm text-gray-900">
                  <span className="font-medium text-gray-600">Kayıt Tarihi:</span> {new Date(registration.created_at).toLocaleString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
                  Kişisel Bilgiler
                </h3>
              
              {registration.first_name && registration.last_name ? (
                <>
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium text-gray-600">Ad:</span> {registration.first_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium text-gray-600">Soyad:</span> {registration.last_name}
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium text-gray-600">Ad Soyad:</span> {registration.full_name}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-900">
                  <span className="font-medium text-gray-600">Email:</span>{' '}
                  <a 
                    href={`mailto:${registration.email}`}
                    className="text-primary-600 hover:text-primary-800 underline transition-colors"
                    title={`${registration.email} adresine e-posta gönder`}
                  >
                    {registration.email}
                  </a>
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-900">
                  <span className="font-medium text-gray-600">Telefon:</span> {registration.phone}
                </p>
              </div>

              {registration.address && (
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium text-gray-600">Adres:</span> {registration.address}
                  </p>
                </div>
              )}

              {registration.company && (
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium text-gray-600">Şirket/Kurum:</span> {registration.company}
                  </p>
                </div>
              )}

              {registration.department && (
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium text-gray-600">Departman:</span> {registration.department}
                  </p>
                </div>
              )}
            </div>

            {/* Invoice Information */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
                Fatura Bilgileri
              </h3>
              
              <div>
                <p className="text-sm text-gray-900">
                  <span className="font-medium text-gray-600">Fatura Tipi:</span> {getInvoiceTypeLabel(registration.invoice_type)}
                </p>
              </div>

              {registration.invoice_type === 'kurumsal' && (
                <>
                  {registration.invoice_company_name && (
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium text-gray-600">Şirket Adı:</span> {registration.invoice_company_name}
                      </p>
                    </div>
                  )}

                  {registration.tax_office && (
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium text-gray-600">Vergi Dairesi:</span> {registration.tax_office}
                      </p>
                    </div>
                  )}

                  {registration.tax_number && (
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium text-gray-600">Vergi Numarası:</span> {registration.tax_number}
                      </p>
                    </div>
                  )}

                  {registration.invoice_address && (
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium text-gray-600">Fatura Adresi:</span> {registration.invoice_address}
                      </p>
                    </div>
                  )}
                </>
              )}

              {registration.invoice_type === 'bireysel' && (
                <>
                  {registration.invoice_full_name && (
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium text-gray-600">Fatura Adı:</span> {registration.invoice_full_name}
                      </p>
                    </div>
                  )}

                  {registration.id_number && (
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium text-gray-600">TC Kimlik No:</span> {registration.id_number}
                      </p>
                    </div>
                  )}

                  {registration.invoice_address && (
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium text-gray-600">Fatura Adresi:</span> {registration.invoice_address}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Registration Information */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
                Kayıt Bilgileri
              </h3>
              
              <div>
                <p className="text-sm text-gray-900">
                  <span className="font-medium text-gray-600">Kayıt Türü:</span> {getRegistrationTypeLabel(registration.registration_type)}
                </p>
                {registration.registration_type_label_en && (
                  <p className="text-xs text-gray-500 mt-1 ml-24">
                    🇬🇧 {registration.registration_type_label_en}
                  </p>
                )}
              </div>

              {registration.form_language && (
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium text-gray-600">Form Dili:</span>{' '}
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {registration.form_language === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
                    </span>
                  </p>
                </div>
              )}

              <div>
                {registration.currency_code && registration.currency_code !== 'TRY' && registration.fee_in_currency ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Seçilen Döviz Ücreti:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {registration.currency_code === 'USD' ? '$' : '€'}{Number(registration.fee_in_currency).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">TL Karşılığı:</span>
                      <span className="text-lg font-bold text-primary-600">
                        {registration.fee ? formatTurkishCurrency(registration.fee) : '-'}
                      </span>
                    </div>
                    {registration.exchange_rate && registration.exchange_rate !== 1 && (
                      <div className="mt-2 pt-2 border-t border-blue-300">
                        <span className="text-xs text-gray-600">
                          Kur: 1 {registration.currency_code} = ₺{Number(registration.exchange_rate).toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-900">
                    <span className="font-medium text-gray-600">Ücret:</span> 
                    <span className="text-lg font-semibold text-primary-600 ml-1">
                      {registration.fee ? formatTurkishCurrency(registration.fee) : '-'}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* İade Bilgileri - Sadece iptal edilmiş ve ödeme tamamlanmış kayıtlar için */}
            {registration.status === 0 && registration.payment_status === 'completed' && (
              <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
                  💰 İade Bilgileri
                </h3>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium text-gray-600">İade Tutarı:</span>{' '}
                          <span className="font-semibold text-red-600">
                            {formatTurkishCurrency(registration.refund_amount || registration.fee)}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium text-gray-600">İade Durumu:</span>{' '}
                          <span className={getRefundStatusBadge(registration.refund_status || 'none')}>
                            {getRefundStatusLabel(registration.refund_status || 'none')}
                          </span>
                        </p>
                      </div>
                    </div>

                    {registration.refund_date && (
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium text-gray-600">İade Tarihi:</span>{' '}
                          {new Date(registration.refund_date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    )}

                    {registration.refund_notes && (
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium text-gray-600">İade Notları:</span>{' '}
                          {registration.refund_notes}
                        </p>
                      </div>
                    )}

                    {registration.cancelled_at && (
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium text-gray-600">İptal Tarihi:</span>{' '}
                          {new Date(registration.cancelled_at).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}

                    {/* İade Yönetim Butonları */}
                    {registration.refund_status === 'pending' && currentUser?.role !== 'reporter' && (
                      <div className="mt-4 pt-3 border-t border-yellow-300">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <button 
                            onClick={() => {
                              const confirmMessage = `İade tamamlandı olarak işaretlenecek.

⚠️ DİKKAT: İade tamamlandıktan sonra bu kayıt tekrar aktifleştirilemez!
Katılımcının yeniden kayıt yapması gerekir.

Devam etmek istediğinizden emin misiniz?`
                              
                              if (confirm(confirmMessage)) {
                                const notes = prompt('İade notları (opsiyonel):')
                                updateRefundStatus('completed', notes || undefined)
                              }
                            }}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                          >
                            ✅ İade Tamamlandı
                          </button>
                          <button 
                            onClick={() => {
                              const notes = prompt('Red sebebi:')
                              if (notes) updateRefundStatus('rejected', notes)
                            }}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                          >
                            ❌ İade Reddedildi
                          </button>
                        </div>
                        <div className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded">
                          <strong>Uyarı:</strong> İade tamamlandıktan sonra bu kayıt tekrar aktifleştirilemez.
                        </div>
                      </div>
                    )}

                    {/* İade tamamlandı durumu için bilgi */}
                    {registration.refund_status === 'completed' && (
                      <div className="mt-4 pt-3 border-t border-green-300">
                        <div className="text-xs text-green-700 bg-green-100 p-2 rounded flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span><strong>İade Tamamlandı:</strong> Bu kayıt artık tekrar aktifleştirilemez.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
          )}
        </div>
      </div>

      {/* Alt Butonlar - Tüm İşlemler */}
      {!isEditing && currentUser?.role !== 'reporter' && (
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
          {/* Güvenli İşlemler */}
          <button
            onClick={() => setIsEditing(true)}
            disabled={registration.status !== 1}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Düzenle
          </button>

          {/* Tehlikeli İşlemler - Sadece aktif kayıtlar için */}
          {registration.status === 1 && (
            <>
              <button
                onClick={handleCancelRegistration}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
                Kaydı İptal Et
              </button>


            </>
          )}

          {/* İptal edilmiş kayıtlar için tekrar aktifleştirme - sadece iadesi tamamlanmayanlar ve reporter hariç */}
          {registration.status === 0 && registration.refund_status !== 'completed' && currentUser?.role !== 'reporter' && (
            <button
              onClick={() => {
                if (confirm('Bu kaydı tekrar aktifleştirmek istediğinizden emin misiniz?')) {
                  fetch(`/api/registrations/${registration.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 1 })
                  }).then(response => response.json()).then(data => {
                    if (data.success) {
                      alert('Kayıt başarıyla aktifleştirildi')
                      window.location.reload()
                    } else {
                      alert(data.error || 'Aktifleştirme başarısız oldu')
                    }
                  }).catch(error => {
                    console.error('Error:', error)
                    alert('Bir hata oluştu')
                  })
                }
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Kaydı Aktifleştir
            </button>
          )}

          {/* İadesi tamamlanan kayıtlar için uyarı mesajı */}
          {registration.status === 0 && registration.refund_status === 'completed' && (
            <div className="px-6 py-4 bg-red-50 border border-red-200 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 text-red-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="font-semibold">Bu kayıt tekrar aktifleştirilemez</span>
              </div>
              <p className="text-sm text-red-700 mt-2">
                İadesi tamamlanan kayıtlar güvenlik nedeniyle tekrar aktifleştirilemez.<br/>
                Katılımcının yeniden kayıt yapması gerekir.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}