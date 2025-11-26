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
    const { warning_message, warning_message_en } = body

    await pool.execute(
      `UPDATE payment_method_settings 
       SET warning_message = ?, warning_message_en = ?
       WHERE id = ?`,
      [warning_message, warning_message_en, params.id]
    )

    return NextResponse.json({ success: true, message: 'Uyarı mesajı güncellendi' })
  } catch (error) {
    console.error('Error updating payment method:', error)
    return NextResponse.json({ success: false, error: 'Güncelleme hatası' }, { status: 500 })
  }
}
