import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser, checkRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** Admin: Tüm kayıt türlerini döndürür (aktif + pasif). Form tarafı sadece is_active=1 kullanır. */
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!checkRole(currentUser, ['admin', 'manager'])) {
      return NextResponse.json({ success: false, error: 'Yetkiniz yok' }, { status: 403 })
    }

    const [rows] = await pool.execute(
      'SELECT * FROM registration_types ORDER BY category_id, id'
    )

    const types = (rows as any[]).map((row: any) => ({
      ...row,
      is_active: row.is_active === 1 || row.is_active === true,
    }))

    return NextResponse.json({ success: true, data: types })
  } catch (error) {
    console.error('Error fetching registration types (admin):', error)
    return NextResponse.json(
      { success: false, error: 'Kayıt türleri yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
