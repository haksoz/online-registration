import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser, checkRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!checkRole(currentUser, ['admin', 'manager'])) {
      return NextResponse.json({ success: false, error: 'Yetkiniz yok' }, { status: 403 })
    }

    const body = await request.json()
    const { name, label_tr, label_en, description_tr, description_en, warning_message_tr, warning_message_en, is_visible, is_required, allow_multiple, display_order, is_active, icon, track_capacity, registration_start_date, registration_end_date, cancellation_deadline, early_bird_deadline, early_bird_enabled } = body

    const toDateTime = (v: string | null | undefined) => (!v || typeof v !== 'string' || !v.trim() ? null : v.trim().replace('T', ' ').slice(0, 19))

    await pool.execute(
      `UPDATE registration_categories 
       SET name = ?, label_tr = ?, label_en = ?, description_tr = ?, description_en = ?,
           warning_message_tr = ?, warning_message_en = ?,
           is_visible = ?, is_required = ?, allow_multiple = ?, display_order = ?, is_active = ?, icon = ?, track_capacity = ?,
           registration_start_date = ?, registration_end_date = ?, cancellation_deadline = ?, early_bird_deadline = ?, early_bird_enabled = ?
       WHERE id = ?`,
      [name, label_tr, label_en, description_tr, description_en, warning_message_tr, warning_message_en, is_visible, is_required, allow_multiple, display_order, is_active, icon, track_capacity ? 1 : 0, toDateTime(registration_start_date), toDateTime(registration_end_date), toDateTime(cancellation_deadline), toDateTime(early_bird_deadline), early_bird_enabled ? 1 : 0, params.id]
    )

    return NextResponse.json({ success: true, message: 'Kategori güncellendi' })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ success: false, error: 'Kategori güncellenirken hata oluştu' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!checkRole(currentUser, ['admin', 'manager'])) {
      return NextResponse.json({ success: false, error: 'Yetkiniz yok' }, { status: 403 })
    }

    const [types] = await pool.execute('SELECT COUNT(*) as count FROM registration_types WHERE category_id = ?', [params.id])

    if ((types as any[])[0].count > 0) {
      return NextResponse.json({ success: false, error: 'Bu kategoriye bağlı kayıt türleri var, silinemez' }, { status: 400 })
    }

    await pool.execute('DELETE FROM registration_categories WHERE id = ?', [params.id])

    return NextResponse.json({ success: true, message: 'Kategori silindi' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ success: false, error: 'Kategori silinirken hata oluştu' }, { status: 500 })
  }
}
