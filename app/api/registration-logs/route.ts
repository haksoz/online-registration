import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Toplam kayıt sayısını al
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM registration_logs'
    )
    const totalItems = (countResult as any[])[0]?.total || 0
    const totalPages = Math.ceil(totalItems / limit)

    // Sayfalanmış logları al (registration bilgileriyle birlikte)
    const [rows] = await pool.execute(
      `SELECT 
        rl.*,
        r.reference_number,
        r.full_name,
        r.email,
        r.registration_type,
        r.created_at as registration_created_at
       FROM registration_logs rl
       LEFT JOIN registrations r ON rl.registration_id = r.id
       ORDER BY rl.created_at DESC 
       LIMIT ${limit} OFFSET ${offset}`
    )

    return NextResponse.json({
      data: rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching registration logs:', error)
    return NextResponse.json(
      { error: 'Loglar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
