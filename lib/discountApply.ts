import { pool } from '@/lib/db'

export interface DiscountItem {
  category_id: number
  registration_type_id: number
  fee_try: number
  vat_rate: number
}

export interface DiscountedItem {
  category_id: number
  registration_type_id: number
  original_fee_try: number
  discounted_fee_try: number
  vat_amount_try: number
  total_try: number
  /** Bu kaleme gerçekten indirim kuralı uygulandı mı? */
  discount_applied: boolean
}

export interface ApplyDiscountResult {
  valid: boolean
  message?: string
  discountCodeId?: number
  items?: DiscountedItem[]
  grandTotalTry?: number
}

/**
 * İndirim kodunu doğrular ve sepetteki kalemlere indirim uygular.
 * saveForm ve validate API tarafından kullanılır.
 */
export async function applyDiscountCode(
  code: string,
  items: DiscountItem[]
): Promise<ApplyDiscountResult> {
  if (!code?.trim() || !Array.isArray(items) || items.length === 0) {
    return { valid: false, message: 'Kod ve seçim listesi gerekli.' }
  }

  const normalizedCode = String(code).trim().toUpperCase()
  const [codeRows] = await pool.execute(
    'SELECT id, scope, valid_from, valid_until, usage_limit, used_count FROM discount_codes WHERE UPPER(TRIM(code)) = ?',
    [normalizedCode]
  )
  const discountCode = (codeRows as any[])[0]
  if (!discountCode) {
    return { valid: false, message: 'Geçersiz indirim kodu.' }
  }

  const now = new Date()
  if (discountCode.valid_from && new Date(discountCode.valid_from) > now) {
    return { valid: false, message: 'Bu indirim kodu henüz geçerli değil.' }
  }
  if (discountCode.valid_until && new Date(discountCode.valid_until) < now) {
    return { valid: false, message: 'Bu indirim kodunun süresi dolmuş.' }
  }
  if (
    discountCode.usage_limit != null &&
    Number(discountCode.used_count) >= Number(discountCode.usage_limit)
  ) {
    return { valid: false, message: 'Bu indirim kodu kullanım limitine ulaşmış.' }
  }

  const [rulesRows] = await pool.execute(
    'SELECT category_id, registration_type_id, discount_type, discount_value FROM discount_code_rules WHERE discount_code_id = ?',
    [discountCode.id]
  )
  const rules = rulesRows as any[]
  const scope = discountCode.scope

  const byCategory = new Map<number, { discount_type: string; discount_value: number }>()
  const byType = new Map<number, { discount_type: string; discount_value: number }>()
  for (const r of rules) {
    if (r.category_id != null) {
      byCategory.set(r.category_id, {
        discount_type: r.discount_type,
        discount_value: Number(r.discount_value),
      })
    }
    if (r.registration_type_id != null) {
      byType.set(r.registration_type_id, {
        discount_type: r.discount_type,
        discount_value: Number(r.discount_value),
      })
    }
  }

  const discountedItems: DiscountedItem[] = []
  let grandTotalTry = 0
  for (const item of items) {
    const feeTry = Number(item.fee_try) || 0
    const vatRate = Number(item.vat_rate) ?? 0.2
    let discountedFee = feeTry
    let discountApplied = false
    if (scope === 'category') {
      const rule = byCategory.get(item.category_id)
      if (rule) {
        if (rule.discount_type === 'percent') {
          discountedFee = Math.max(0, feeTry * (1 - rule.discount_value / 100))
        } else {
          discountedFee = Math.max(0, feeTry - rule.discount_value)
        }
        discountApplied = true
      }
    } else {
      const rule = byType.get(item.registration_type_id)
      if (rule) {
        if (rule.discount_type === 'percent') {
          discountedFee = Math.max(0, feeTry * (1 - rule.discount_value / 100))
        } else {
          discountedFee = Math.max(0, feeTry - rule.discount_value)
        }
        discountApplied = true
      }
    }
    const vatAmount = discountedFee * vatRate
    const totalTry = discountedFee + vatAmount
    grandTotalTry += totalTry
    discountedItems.push({
      category_id: item.category_id,
      registration_type_id: item.registration_type_id,
      original_fee_try: feeTry,
      discounted_fee_try: discountedFee,
      vat_amount_try: vatAmount,
      total_try: totalTry,
      discount_applied: discountApplied,
    })
  }

  return {
    valid: true,
    discountCodeId: discountCode.id,
    items: discountedItems,
    grandTotalTry: Math.round(grandTotalTry * 100) / 100,
  }
}
