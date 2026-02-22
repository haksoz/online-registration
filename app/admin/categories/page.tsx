'use client'

import { useState, useEffect } from 'react'

interface Category {
  id: number
  name: string
  label_tr: string
  label_en: string
  description_tr?: string
  description_en?: string
  warning_message_tr?: string
  warning_message_en?: string
  is_visible: boolean
  is_required: boolean
  allow_multiple: boolean
  display_order: number
  is_active: boolean
  icon?: string
  type_count: number
  track_capacity?: boolean
  registration_start_date?: string | null
  registration_end_date?: string | null
  cancellation_deadline?: string | null
  early_bird_deadline?: string | null
  early_bird_enabled?: boolean
}

/** Kategori ikonları: Kongre 3, Kurs 3, Konaklama 3, Diğer 3 — tek sırada */
const CATEGORY_ICON_OPTIONS = [
  '🎤', '📋', '🎭',   // Kongre / Etkinlik
  '📚', '🎓', '📝',   // Kurs / Eğitim
  '🏨', '🛏️', '📍',   // Konaklama
  '📌', '⭐', '💼',   // Diğer
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    label_tr: '',
    label_en: '',
    description_tr: '',
    description_en: '',
    warning_message_tr: '',
    warning_message_en: '',
    is_visible: true,
    is_required: false,
    allow_multiple: false,
    display_order: 0,
    is_active: true,
    icon: '',
    track_capacity: false,
    registration_start_date: '',
    registration_end_date: '',
    cancellation_deadline: '',
    early_bird_deadline: '',
    early_bird_enabled: false
  })

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      
      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (data.success) {
        setShowModal(false)
        fetchCategories()
        resetForm()
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert('İşlem başarısız')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      const data = await response.json()
      
      if (data.success) {
        fetchCategories()
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert('Silme işlemi başarısız')
    }
  }

  const formatDateTimeLocal = (v: string | null | undefined) => {
    if (!v) return ''
    const d = new Date(v)
    if (isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 16)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      label_tr: category.label_tr,
      label_en: category.label_en,
      description_tr: category.description_tr || '',
      description_en: category.description_en || '',
      warning_message_tr: category.warning_message_tr || '',
      warning_message_en: category.warning_message_en || '',
      is_visible: category.is_visible,
      is_required: category.is_required,
      allow_multiple: category.allow_multiple,
      display_order: category.display_order,
      is_active: category.is_active,
      icon: category.icon || '',
      track_capacity: !!category.track_capacity,
      registration_start_date: formatDateTimeLocal(category.registration_start_date),
      registration_end_date: formatDateTimeLocal(category.registration_end_date),
      cancellation_deadline: formatDateTimeLocal(category.cancellation_deadline),
      early_bird_deadline: formatDateTimeLocal(category.early_bird_deadline),
      early_bird_enabled: !!category.early_bird_enabled
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      label_tr: '',
      label_en: '',
      description_tr: '',
      description_en: '',
      warning_message_tr: '',
      warning_message_en: '',
      is_visible: true,
      is_required: false,
      allow_multiple: false,
      display_order: 0,
      is_active: true,
      icon: '',
      track_capacity: false,
      registration_start_date: '',
      registration_end_date: '',
      cancellation_deadline: '',
      early_bird_deadline: '',
      early_bird_enabled: false
    })
    setEditingCategory(null)
  }

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kayıt Kategorileri</h1>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          + Yeni Kategori
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sıra</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İkon</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Görünür</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Zorunlu</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Çoklu Seçim</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Kontenjan takibi</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Erken kayıt</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktif kayıt türü</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((category) => (
              <tr key={category.id} className={!category.is_active ? 'bg-gray-50' : ''}>
                <td className="px-4 py-3">{category.display_order}</td>
                <td className="px-4 py-3 text-2xl">{category.icon || '—'}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{category.label_tr}</div>
                  <div className="text-sm text-gray-500">{category.label_en}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={category.is_visible ? 'text-green-600' : 'text-gray-300'} title={category.is_visible ? 'Görünür' : 'Görünmez'}>
                    {category.is_visible ? '✓' : '✗'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={category.is_required ? 'text-green-600' : 'text-gray-300'} title={category.is_required ? 'Zorunlu' : 'Zorunlu değil'}>
                    {category.is_required ? '✓' : '✗'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={category.allow_multiple ? 'text-green-600' : 'text-gray-300'} title={category.allow_multiple ? 'Çoklu seçim açık' : 'Tek seçim'}>
                    {category.allow_multiple ? '✓' : '✗'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={category.track_capacity ? 'text-green-600' : 'text-gray-300'} title={category.track_capacity ? 'Kontenjan takibi açık' : 'Kapalı'}>
                    {category.track_capacity ? '✓' : '✗'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={category.early_bird_enabled ? 'text-green-600' : 'text-gray-300'} title={category.early_bird_enabled ? 'Erken kayıt açık' : 'Kapalı'}>
                    {category.early_bird_enabled ? '✓' : '✗'}
                  </span>
                </td>
                <td className="px-4 py-3">{category.type_count}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-800 mr-3">Düzenle</button>
                  <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-800">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kategori Adı (Sistem)</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="kongre, kurs, konaklama"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">İkon</label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
                      {formData.icon || '—'}
                    </span>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="flex-1 max-w-[6rem] px-2 py-1.5 border rounded-lg text-center text-xl"
                      placeholder="Özel"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-2">
                <label className="block text-sm font-medium mb-2">Önerilen ikonlar</label>
                <div className="flex flex-wrap gap-1">
                  {CATEGORY_ICON_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg border-2 text-lg transition-colors ${
                        formData.icon === emoji
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      }`}
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Türkçe Adı</label>
                  <input
                    type="text"
                    value={formData.label_tr}
                    onChange={(e) => setFormData({...formData, label_tr: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Kongre Kayıtları"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">İngilizce Adı</label>
                  <input
                    type="text"
                    value={formData.label_en}
                    onChange={(e) => setFormData({...formData, label_en: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Congress Registration"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Türkçe Açıklama</label>
                  <textarea
                    value={formData.description_tr}
                    onChange={(e) => setFormData({...formData, description_tr: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">İngilizce Açıklama</label>
                  <textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Türkçe Uyarı Mesajı
                    <span className="text-xs text-gray-500 ml-2">(Step2'de kategori altında görünür)</span>
                  </label>
                  <textarea
                    value={formData.warning_message_tr}
                    onChange={(e) => setFormData({...formData, warning_message_tr: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Dikkat: Bu kategori için özel şartlar geçerlidir..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    İngilizce Uyarı Mesajı
                    <span className="text-xs text-gray-500 ml-2">(Shown below category in Step2)</span>
                  </label>
                  <textarea
                    value={formData.warning_message_en}
                    onChange={(e) => setFormData({...formData, warning_message_en: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Note: Special conditions apply for this category..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sıra</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_visible}
                      onChange={(e) => setFormData({...formData, is_visible: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Görünür</span>
                  </label>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_required}
                      onChange={(e) => setFormData({...formData, is_required: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Zorunlu</span>
                  </label>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allow_multiple}
                      onChange={(e) => setFormData({...formData, allow_multiple: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Çoklu Seçim</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Aktif</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.track_capacity}
                    onChange={(e) => setFormData({...formData, track_capacity: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm">Kontenjan takibi aktif mi?</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.early_bird_enabled}
                    onChange={(e) => setFormData({...formData, early_bird_enabled: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm">Erken kayıt aktif</span>
                </label>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Kayıt Tarihleri (bu kategori için)</h4>
                <p className="text-xs text-gray-500 mb-3">Boş bırakılırsa sınırsız / hemen açık kabul edilir.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kayıt Başlangıç Tarihi</label>
                    <input
                      type="datetime-local"
                      value={formData.registration_start_date}
                      onChange={(e) => setFormData({...formData, registration_start_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kayıt Son Tarihi</label>
                    <input
                      type="datetime-local"
                      value={formData.registration_end_date}
                      onChange={(e) => setFormData({...formData, registration_end_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kayıt İptal Son Tarihi</label>
                    <input
                      type="datetime-local"
                      value={formData.cancellation_deadline}
                      onChange={(e) => setFormData({...formData, cancellation_deadline: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Erken Kayıt Bitiş Tarihi</label>
                    <input
                      type="datetime-local"
                      value={formData.early_bird_deadline}
                      onChange={(e) => setFormData({...formData, early_bird_deadline: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingCategory ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
