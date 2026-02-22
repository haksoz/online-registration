import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser, checkRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** Admin: Kayıt türünün aktif/pasif durumunu günceller. Silmeden kapatmak için kullanılır. */
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
    if (!id || isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Geçersiz ID' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const is_active = body.is_active

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'is_active true veya false olmalıdır' },
        { status: 400 }
      )
    }

    const [result] = await pool.execute(
      'UPDATE registration_types SET is_active = ? WHERE id = ?',
      [is_active ? 1 : 0, id]
    )

    const affected = (result as any).affectedRows
    if (affected === 0) {
      return NextResponse.json({ success: false, error: 'Kayıt türü bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: is_active ? 'Kayıt türü aktif edildi' : 'Kayıt türü pasif edildi',
      is_active,
    })
  } catch (error) {
    console.error('Error updating registration type is_active:', error)
    return NextResponse.json(
      { success: false, error: 'Güncelleme sırasında hata oluştu' },
      { status: 500 }
    )
  }
}
