import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const range = request.nextUrl.searchParams.get('range') || 'all'
    
    // Date filter
    let dateFilter = ''
    const now = new Date()
    
    switch (range) {
      case 'today':
        dateFilter = `AND DATE(r.created_at) = CURDATE()`
        break
      case 'week':
        dateFilter = `AND r.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
        break
      case 'month':
        dateFilter = `AND MONTH(r.created_at) = MONTH(NOW()) AND YEAR(r.created_at) = YEAR(NOW())`
        break
      case 'year':
        dateFilter = `AND YEAR(r.created_at) = YEAR(NOW())`
        break
      default:
        dateFilter = ''
    }

    // Total stats
    const [totals] = await pool.execute(`
      SELECT 
        COUNT(*) as totalRegistrations,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as activeRegistrations,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as cancelledRegistrations,
        SUM(CASE WHEN status = 1 THEN fee ELSE 0 END) as totalRevenue,
        SUM(CASE WHEN status = 1 AND payment_status = 'completed' THEN fee ELSE 0 END) as completedRevenue,
        SUM(CASE WHEN status = 1 AND payment_status = 'pending' THEN fee ELSE 0 END) as pendingRevenue,
        SUM(CASE WHEN status = 0 AND refund_status IN ('pending', 'completed') THEN refund_amount ELSE 0 END) as refundAmount
      FROM registrations r
      WHERE 1=1 ${dateFilter}
    `)

    // By registration type
    const [byType] = await pool.execute(`
      SELECT 
        r.registration_type as type,
        rt.label as label,
        COUNT(*) as count,
        SUM(r.fee) as revenue
      FROM registrations r
      LEFT JOIN registration_types rt ON r.registration_type = rt.value
      WHERE r.status = 1 ${dateFilter}
      GROUP BY r.registration_type, rt.label
      ORDER BY count DESC
    `)

    // By payment method
    const [byMethod] = await pool.execute(`
      SELECT 
        payment_method as method,
        COUNT(*) as count,
        SUM(fee) as revenue
      FROM registrations r
      WHERE status = 1 ${dateFilter}
      GROUP BY payment_method
    `)

    // By payment status
    const [byStatus] = await pool.execute(`
      SELECT 
        payment_status as status,
        COUNT(*) as count,
        SUM(fee) as revenue
      FROM registrations r
      WHERE status = 1 ${dateFilter}
      GROUP BY payment_status
    `)

    // By month (last 12 months)
    const [byMonth] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count,
        SUM(fee) as revenue
      FROM registrations r
      WHERE status = 1 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
    `)

    // By day (last 30 days)
    const [byDay] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(fee) as revenue
      FROM registrations r
      WHERE status = 1 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `)

    return NextResponse.json({
      success: true,
      data: {
        ...(totals as any[])[0],
        byRegistrationType: byType,
        byPaymentMethod: byMethod,
        byPaymentStatus: byStatus,
        byMonth: byMonth,
        byDay: byDay
      }
    })

  } catch (error: any) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({
      success: false,
      error: 'Raporlar yüklenirken hata oluştu',
      details: error.message
    }, { status: 500 })
  }
}
