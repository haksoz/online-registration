import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const registrationId = parseInt(params.id)

    // Belirli bir kayda ait logları al
    const [rows] = await pool.execute(
      `SELECT * FROM registration_logs 
       WHERE registration_id = ? 
       ORDER BY created_at DESC`,
      [registrationId]
    )

    return NextResponse.json({
      success: true,
      data: rows
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching registration logs:', error)
    return NextResponse.json(
      { error: 'Loglar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
