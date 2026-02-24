import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser, checkRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!checkRole(currentUser, ['admin', 'manager'])) {
      return NextResponse.json({ success: false, error: 'Yetkiniz yok' }, { status: 403 })
    }

    const id = Number(params.id)
    if (!id) {
      return NextResponse.json({ success: false, error: 'Geçersiz ID' }, { status: 400 })
    }

    const [rows] = await pool.execute(
      'SELECT id, code, scope, valid_from, valid_until, usage_limit, used_count, description, created_at, updated_at FROM discount_codes WHERE id = ?',
      [id]
    )
    const code = (rows as any[])[0]
    if (!code) {
      return NextResponse.json({ success: false, error: 'Bulunamadı' }, { status: 404 })
    }

    const [rulesRows] = await pool.execute(
      'SELECT id, category_id, registration_type_id, discount_type, discount_value FROM discount_code_rules WHERE discount_code_id = ? ORDER BY id',
      [id]
    )
    code.rules = rulesRows
    return NextResponse.json({ success: true, data: code })
  } catch (e) {
    console.error('Discount code get error:', e)
    return NextResponse.json({ success: false, error: 'Alınamadı' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!checkRole(currentUser, ['admin', 'manager'])) {
      return NextResponse.json({ success: false, error: 'Yetkiniz yok' }, { status: 403 })
    }

    const id = Number(params.id)
    if (!id) {
      return NextResponse.json({ success: false, error: 'Geçersiz ID' }, { status: 400 })
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

    const toDateTime = (v: string | null | undefined) =>
      !v || typeof v !== 'string' || !v.trim() ? null : v.trim().replace('T', ' ').slice(0, 19)

    const updates: string[] = []
    const vals: any[] = []
    if (code != null) { updates.push('code = ?'); vals.push(String(code).trim()) }
    if (scope != null && (scope === 'category' || scope === 'type')) { updates.push('scope = ?'); vals.push(scope) }
    updates.push('valid_from = ?, valid_until = ?, usage_limit = ?, description = ?, updated_at = NOW()')
    vals.push(
      toDateTime(valid_from),
      toDateTime(valid_until),
      usage_limit != null && usage_limit !== '' ? Number(usage_limit) : null,
      description ?? null
    )
    vals.push(id)
    await pool.execute(
      `UPDATE discount_codes SET ${updates.join(', ')} WHERE id = ?`,
      vals
    )

    if (Array.isArray(rules)) {
      await pool.execute('DELETE FROM discount_code_rules WHERE discount_code_id = ?', [id])
      let scopeVal = scope && (scope === 'category' || scope === 'type') ? scope : null
      if (!scopeVal) {
        const [exRows] = await pool.execute('SELECT scope FROM discount_codes WHERE id = ?', [id])
        scopeVal = (exRows as any[])[0]?.scope
      }
      for (const r of rules) {
        const categoryId = r.category_id != null && r.category_id !== '' ? Number(r.category_id) : null
        const typeId = r.registration_type_id != null && r.registration_type_id !== '' ? Number(r.registration_type_id) : null
        const discountType = r.discount_type === 'fixed' ? 'fixed' : 'percent'
        const discountValue = Number(r.discount_value) ?? 0
        if (scopeVal === 'category' && categoryId != null) {
          await pool.execute(
            'INSERT INTO discount_code_rules (discount_code_id, category_id, discount_type, discount_value) VALUES (?, ?, ?, ?)',
            [id, categoryId, discountType, discountValue]
          )
        } else if (scopeVal === 'type' && typeId != null) {
          await pool.execute(
            'INSERT INTO discount_code_rules (discount_code_id, registration_type_id, discount_type, discount_value) VALUES (?, ?, ?, ?)',
            [id, typeId, discountType, discountValue]
          )
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Discount code update error:', e)
    if (e.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, error: 'Bu indirim kodu zaten var' }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: e.message || 'Güncellenemedi' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!checkRole(currentUser, ['admin', 'manager'])) {
      return NextResponse.json({ success: false, error: 'Yetkiniz yok' }, { status: 403 })
    }

    const id = Number(params.id)
    if (!id) {
      return NextResponse.json({ success: false, error: 'Geçersiz ID' }, { status: 400 })
    }

    await pool.execute('DELETE FROM discount_code_rules WHERE discount_code_id = ?', [id])
    await pool.execute('DELETE FROM discount_codes WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Discount code delete error:', e)
    return NextResponse.json({ success: false, error: 'Silinemedi' }, { status: 500 })
  }
}
