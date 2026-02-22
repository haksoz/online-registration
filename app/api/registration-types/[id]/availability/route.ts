import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/registration-types/:id/availability
 * Kayıt türü kontenjan bilgisi (plan: Kapasite Kontrolü)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id)
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz kayıt türü id' },
        { status: 400 }
      )
    }

    const [rows] = await pool.execute(
      `SELECT capacity, current_registrations 
       FROM registration_types 
       WHERE id = ? AND is_active = 1`,
      [id]
    )

    const row = (rows as any[])[0]
    if (!row) {
      return NextResponse.json(
        { success: false, error: 'Kayıt türü bulunamadı' },
        { status: 404 }
      )
    }

    const capacity = row.capacity == null ? null : Number(row.capacity)
    const currentRegistrations = Number(row.current_registrations ?? 0)
    const available =
      capacity == null || currentRegistrations < capacity
    const remaining =
      capacity == null ? null : Math.max(0, capacity - currentRegistrations)

    return NextResponse.json({
      success: true,
      data: {
        available,
        remaining,
        capacity,
        current_registrations: currentRegistrations,
      },
    })
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Kontenjan bilgisi alınırken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
      { status: 500 }
    )
  }
}
