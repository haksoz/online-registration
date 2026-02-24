'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Category {
  id: number
  label_tr: string
  name: string
}

interface RegistrationType {
  id: number
  category_id: number
  label: string
  label_en: string
}

interface RuleRow {
  category_id?: number
  registration_type_id?: number
  discount_type: 'percent' | 'fixed'
  discount_value: string
}

export default function NewDiscountCodePage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [scope, setScope] = useState<'category' | 'type'>('category')
  const [validFrom, setValidFrom] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [description, setDescription] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [types, setTypes] = useState<RegistrationType[]>([])
  const [categoryRules, setCategoryRules] = useState<Record<number, { discount_type: 'percent' | 'fixed'; discount_value: string }>>({})
  const [typeRules, setTypeRules] = useState<Record<number, { discount_type: 'percent' | 'fixed'; discount_value: string }>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((d) => d.success && setCategories(d.data))
  }, [])
  useEffect(() => {
    fetch('/api/admin/registration-types')
      .then((r) => r.json())
      .then((d) => d.success && setTypes(d.data))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!code.trim()) {
      setError('Kod gerekli')
      return
    }
    const rules: RuleRow[] = []
    if (scope === 'category') {
      categories.forEach((cat) => {
        const r = categoryRules[cat.id]
        if (r && r.discount_value.trim() && !isNaN(Number(r.discount_value))) {
          rules.push({
            category_id: cat.id,
            discount_type: r.discount_type,
            discount_value: r.discount_value.trim(),
          })
        }
      })
    } else {
      types.forEach((t) => {
        const r = typeRules[t.id]
        if (r && r.discount_value.trim() && !isNaN(Number(r.discount_value))) {
          rules.push({
            registration_type_id: t.id,
            discount_type: r.discount_type,
            discount_value: r.discount_value.trim(),
          })
        }
      })
    }
    if (rules.length === 0) {
      setError(scope === 'category' ? 'En az bir kategori için indirim girin.' : 'En az bir kayıt türü için indirim girin.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/discount-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          scope,
          valid_from: validFrom || null,
          valid_until: validUntil || null,
          usage_limit: usageLimit.trim() ? Number(usageLimit) : null,
          description: description.trim() || null,
          rules,
        }),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/admin/discount-codes')
        return
      }
      setError(data.error || 'Kaydedilemedi')
    } catch (err) {
      setError('Bağlantı hatası')
    } finally {
      setSaving(false)
    }
  }

  const updateCategoryRule = (categoryId: number, field: 'discount_type' | 'discount_value', value: string) => {
    setCategoryRules((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        discount_type: prev[categoryId]?.discount_type ?? 'percent',
        [field]: value,
      },
    }))
  }
  const updateTypeRule = (typeId: number, field: 'discount_type' | 'discount_value', value: string) => {
    setTypeRules((prev) => ({
      ...prev,
      [typeId]: {
        ...prev[typeId],
        discount_type: prev[typeId]?.discount_type ?? 'percent',
        [field]: value,
      },
    }))
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/discount-codes" className="text-primary-600 hover:text-primary-800 text-sm">
          ← İndirim kodları
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">Yeni indirim kodu</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg border border-gray-200 p-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kod *</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 font-mono"
            placeholder="Örn. KONGRE2026"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kapsam *</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="scope"
                checked={scope === 'category'}
                onChange={() => setScope('category')}
              />
              Kategoriye göre (kategorideki tüm kayıt türlerine aynı indirim)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="scope"
                checked={scope === 'type'}
                onChange={() => setScope('type')}
              />
              Kayıt türüne göre (kayıt türü bazlı ayrı ayrı indirim)
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Geçerlilik başlangıç</label>
            <input
              type="datetime-local"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Geçerlilik bitiş</label>
            <input
              type="datetime-local"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kullanım limiti (boş = sınırsız)</label>
          <input
            type="number"
            min="1"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            rows={2}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            {scope === 'category' ? 'Kategori bazlı indirim' : 'Kayıt türü bazlı indirim'}
          </h3>
          {scope === 'category' ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Kategori</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">İndirim tipi</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Değer (% veya TL)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td className="px-4 py-2">{cat.label_tr || cat.name}</td>
                      <td className="px-4 py-2">
                        <select
                          value={categoryRules[cat.id]?.discount_type ?? 'percent'}
                          onChange={(e) => updateCategoryRule(cat.id, 'discount_type', e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="percent">Yüzde (%)</option>
                          <option value="fixed">Sabit (TL)</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={categoryRules[cat.id]?.discount_value ?? ''}
                          onChange={(e) => updateCategoryRule(cat.id, 'discount_value', e.target.value)}
                          placeholder={categoryRules[cat.id]?.discount_type === 'fixed' ? 'TL' : '0-100'}
                          className="border border-gray-300 rounded px-2 py-1 w-24"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Kayıt türü</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">İndirim tipi</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Değer (% veya TL)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {types.map((t) => (
                    <tr key={t.id}>
                      <td className="px-4 py-2">{t.label}</td>
                      <td className="px-4 py-2">
                        <select
                          value={typeRules[t.id]?.discount_type ?? 'percent'}
                          onChange={(e) => updateTypeRule(t.id, 'discount_type', e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="percent">Yüzde (%)</option>
                          <option value="fixed">Sabit (TL)</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={typeRules[t.id]?.discount_value ?? ''}
                          onChange={(e) => updateTypeRule(t.id, 'discount_value', e.target.value)}
                          placeholder={typeRules[t.id]?.discount_type === 'fixed' ? 'TL' : '0-100'}
                          className="border border-gray-300 rounded px-2 py-1 w-24"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          <Link
            href="/admin/discount-codes"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            İptal
          </Link>
        </div>
      </form>
    </div>
  )
}
