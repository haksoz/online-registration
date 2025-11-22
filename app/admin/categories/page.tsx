'use client'

import { useState, useEffect } from 'react'

interface Category {
  id: number
  name: string
  label_tr: string
  label_en: string
  description_tr?: string
  description_en?: string
  is_visible: boolean
  is_required: boolean
  allow_multiple: boolean
  display_order: number
  is_active: boolean
  icon?: string
  type_count: number
}

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
    is_visible: true,
    is_required: false,
    allow_multiple: false,
    display_order: 0,
    is_active: true,
    icon: ''
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

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      label_tr: category.label_tr,
      label_en: category.label_en,
      description_tr: category.description_tr || '',
      description_en: category.description_en || '',
      is_visible: category.is_visible,
      is_required: category.is_required,
      allow_multiple: category.allow_multiple,
      display_order: category.display_order,
      is_active: category.is_active,
      icon: category.icon || ''
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
      is_visible: true,
      is_required: false,
      allow_multiple: false,
      display_order: 0,
      is_active: true,
      icon: ''
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

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sıra</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İkon</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kayıt Türü</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4">{category.display_order}</td>
                <td className="px-6 py-4 text-2xl">{category.icon}</td>
                <td className="px-6 py-4">
                  <div className="font-medium">{category.label_tr}</div>
                  <div className="text-sm text-gray-500">{category.label_en}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 flex-wrap">
                    {category.is_visible && <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Görünür</span>}
                    {category.is_required && <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Zorunlu</span>}
                    {category.allow_multiple && <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Çoklu</span>}
                    {!category.is_active && <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Pasif</span>}
                  </div>
                </td>
                <td className="px-6 py-4">{category.type_count}</td>
                <td className="px-6 py-4 text-right">
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
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="🎤"
                  />
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

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Aktif</span>
                </label>
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
