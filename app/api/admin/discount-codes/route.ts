import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser, checkRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!checkRole(currentUser, ['admin', 'manager'])) {
      return NextResponse.json({ success: false, error: 'Yetkiniz yok' }, { status: 403 })
    }

    const [rows] = await pool.execute(
      'SELECT id, code, scope, valid_from, valid_until, usage_limit, used_count, description, created_at FROM discount_codes ORDER BY created_at DESC'
    )
    return NextResponse.json({ success: true, data: rows })
  } catch (e) {
    console.error('Discount codes list error:', e)
    return NextResponse.json({ success: false, error: 'Liste alınamadı' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!checkRole(currentUser, ['admin', 'manager'])) {
      return NextResponse.json({ success: false, error: 'Yetkiniz yok' }, { status: 403 })
    }

    const body = await request.json()
    const {
      code,
      scope,
      valid_from,
      valid_until,
      usage_limit,
      description,
      rules,
    } = body

    if (!code || !scope || (scope !== 'category' && scope !== 'type') || !Array.isArray(rules)) {
      return NextResponse.json({ success: false, error: 'Kod, kapsam (category/type) ve kurallar gerekli' }, { status: 400 })
    }

    const toDateTime = (v: string | null | undefined) =>
      !v || typeof v !== 'string' || !v.trim() ? null : v.trim().replace('T', ' ').slice(0, 19)

    const [insert] = await pool.execute(
      `INSERT INTO discount_codes (code, scope, valid_from, valid_until, usage_limit, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        String(code).trim(),
        scope,
        toDateTime(valid_from),
        toDateTime(valid_until),
        usage_limit != null && usage_limit !== '' ? Number(usage_limit) : null,
        description ?? null,
      ]
    )
    const discountCodeId = (insert as any).insertId

    for (const r of rules) {
      const categoryId = r.category_id != null && r.category_id !== '' ? Number(r.category_id) : null
      const typeId = r.registration_type_id != null && r.registration_type_id !== '' ? Number(r.registration_type_id) : null
      const discountType = r.discount_type === 'fixed' ? 'fixed' : 'percent'
      const discountValue = Number(r.discount_value) ?? 0
      if (scope === 'category' && categoryId != null) {
        await pool.execute(
          'INSERT INTO discount_code_rules (discount_code_id, category_id, discount_type, discount_value) VALUES (?, ?, ?, ?)',
          [discountCodeId, categoryId, discountType, discountValue]
        )
      } else if (scope === 'type' && typeId != null) {
        await pool.execute(
          'INSERT INTO discount_code_rules (discount_code_id, registration_type_id, discount_type, discount_value) VALUES (?, ?, ?, ?)',
          [discountCodeId, typeId, discountType, discountValue]
        )
      }
    }

    return NextResponse.json({ success: true, data: { id: discountCodeId } })
  } catch (e: any) {
    console.error('Discount code create error:', e)
    if (e.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, error: 'Bu indirim kodu zaten var' }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: e.message || 'Oluşturulamadı' }, { status: 500 })
  }
}
