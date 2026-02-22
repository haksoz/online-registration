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

    const [categories] = await pool.execute(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM registration_types WHERE category_id = c.id) as type_count
       FROM registration_categories c 
       ORDER BY display_order, id`
    )

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ success: false, error: 'Kategoriler yüklenirken hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!checkRole(currentUser, ['admin', 'manager'])) {
      return NextResponse.json({ success: false, error: 'Yetkiniz yok' }, { status: 403 })
    }

    const body = await request.json()
    const { name, label_tr, label_en, description_tr, description_en, warning_message_tr, warning_message_en, is_visible, is_required, allow_multiple, display_order, icon, track_capacity, registration_start_date, registration_end_date, cancellation_deadline, early_bird_deadline, early_bird_enabled } = body

    if (!name || !label_tr || !label_en) {
      return NextResponse.json({ success: false, error: 'Zorunlu alanlar eksik' }, { status: 400 })
    }

    const toDateTime = (v: string | null | undefined) => (!v || typeof v !== 'string' || !v.trim() ? null : v.trim().replace('T', ' ').slice(0, 19))

    const baseValues = [name, label_tr, label_en, description_tr ?? '', description_en ?? '', warning_message_tr ?? '', warning_message_en ?? '', is_visible ?? true, is_required ?? false, allow_multiple ?? false, display_order ?? 0, icon ?? null]

    try {
      const [result] = await pool.execute(
        `INSERT INTO registration_categories 
         (name, label_tr, label_en, description_tr, description_en, warning_message_tr, warning_message_en, is_visible, is_required, allow_multiple, display_order, icon, track_capacity, registration_start_date, registration_end_date, cancellation_deadline, early_bird_deadline, early_bird_enabled)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [...baseValues, track_capacity ? 1 : 0, toDateTime(registration_start_date), toDateTime(registration_end_date), toDateTime(cancellation_deadline), toDateTime(early_bird_deadline), early_bird_enabled ? 1 : 0]
      )
      return NextResponse.json({ success: true, message: 'Kategori oluşturuldu', data: { id: (result as any).insertId } })
    } catch (insertError: any) {
      if (insertError.code === 'ER_BAD_FIELD_ERROR') {
        try {
          const [result] = await pool.execute(
            `INSERT INTO registration_categories 
             (name, label_tr, label_en, description_tr, description_en, warning_message_tr, warning_message_en, is_visible, is_required, allow_multiple, display_order, icon)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            baseValues
          )
          return NextResponse.json({ success: true, message: 'Kategori oluşturuldu', data: { id: (result as any).insertId } })
        } catch (fallbackError: any) {
          console.error('Error creating category (fallback):', fallbackError)
          return NextResponse.json({ success: false, error: fallbackError.message || 'Kategori oluşturulurken hata oluştu' }, { status: 500 })
        }
      }
      throw insertError
    }
  } catch (error: any) {
    console.error('Error creating category:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, error: 'Bu kategori adı zaten kullanılıyor' }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: error.message || 'Kategori oluşturulurken hata oluştu' }, { status: 500 })
  }
}
