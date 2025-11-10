import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const offset = (page - 1) * limit

    // Build WHERE clause
    let whereClause = ''
    const params: any[] = []
    
    if (status && status !== 'all') {
      whereClause = 'WHERE opt.status = ?'
      params.push(status)
    }

    // Toplam kayıt sayısını al
    const countQuery = `SELECT COUNT(*) as total FROM online_payment_transactions opt ${whereClause}`
    const [countResult] = await pool.execute(countQuery, params)
    const totalItems = (countResult as any[])[0]?.total || 0
    const totalPages = Math.ceil(totalItems / limit)

    // Sayfalanmış logları al (registration bilgileriyle birlikte)
    const dataQuery = `
      SELECT 
        opt.*,
        r.reference_number,
        r.full_name,
        r.email
      FROM online_payment_transactions opt
      LEFT JOIN registrations r ON opt.registration_id = r.id
      ${whereClause}
      ORDER BY opt.created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `
    
    const [rows] = await pool.execute(dataQuery, params)

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
    console.error('Error fetching POS logs:', error)
    return NextResponse.json(
      { error: 'POS logları yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
