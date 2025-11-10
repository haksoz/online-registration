import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Toplam kayıt sayısını al
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM registrations WHERE status >= 0'
    )
    const totalItems = (countResult as any[])[0]?.total || 0
    const totalPages = Math.ceil(totalItems / limit)

    // Sayfalanmış kayıtları al
    const [rows] = await pool.execute(
      `SELECT * FROM registrations WHERE status >= 0 ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
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
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { error: 'Kayıtlar yüklenirken hata oluştu', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}