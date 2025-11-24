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
      'SELECT COUNT(*) as total FROM registrations WHERE status >= 0'
    )
    const totalItems = (countResult as any[])[0]?.total || 0
    const totalPages = Math.ceil(totalItems / limit)

    // Sayfalanmış kayıtları al
    const [rows] = await pool.execute(
      `SELECT * FROM registrations WHERE status >= 0 ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
    )

    // Her kayıt için selections'ları çek ve toplam hesapla
    const registrations = rows as any[]
    for (const registration of registrations) {
      const [selections] = await pool.execute(
        `SELECT 
          rs.*,
          rt.label as type_label,
          rt.label_en as type_label_en,
          rc.label_tr as category_name,
          rc.label_en as category_name_en
         FROM registration_selections rs
         LEFT JOIN registration_types rt ON rs.registration_type_id = rt.id
         LEFT JOIN registration_categories rc ON rs.category_id = rc.id
         WHERE rs.registration_id = ?
         ORDER BY rc.display_order, rt.id`,
        [registration.id]
      )
      registration.selections = selections

      // Toplam hesapla: Aktif seçimler + İade bekleyen/reddedilen seçimler
      const includedSelections = (selections as any[]).filter((s: any) => 
        !s.is_cancelled || (s.is_cancelled && ['pending', 'rejected'].includes(s.refund_status))
      )
      const totalFee = includedSelections.reduce((sum: number, s: any) => sum + Number(s.applied_fee_try || 0), 0)
      const vatAmount = includedSelections.reduce((sum: number, s: any) => sum + Number(s.vat_amount_try || 0), 0)
      const grandTotal = includedSelections.reduce((sum: number, s: any) => sum + Number(s.total_try || 0), 0)

      registration.total_fee = totalFee
      registration.vat_amount = vatAmount
      registration.grand_total = grandTotal
    }

    return NextResponse.json({
      data: registrations,
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