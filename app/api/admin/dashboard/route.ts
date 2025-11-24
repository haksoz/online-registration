import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Genel İstatistikler - Sadece selection'ı olan kayıtlar
    const [generalStats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT r.id) as total_registrations,
        SUM(CASE WHEN r.status = 1 THEN 1 ELSE 0 END) as active_registrations,
        SUM(CASE WHEN r.status = 0 THEN 1 ELSE 0 END) as cancelled_registrations
      FROM registrations r
      INNER JOIN registration_selections rs ON r.id = rs.registration_id
    `)

    const general = (generalStats as any[])[0]

    // Seçim İstatistikleri
    const [selectionStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_selections,
        SUM(CASE WHEN is_cancelled = FALSE THEN 1 ELSE 0 END) as active_selections,
        SUM(CASE WHEN is_cancelled = TRUE THEN 1 ELSE 0 END) as cancelled_selections
      FROM registration_selections
    `)

    const selections = (selectionStats as any[])[0]

    // Gelir İstatistikleri (Aktif + İade bekleyen/reddedilen)
    const [revenueStats] = await pool.execute(`
      SELECT 
        COALESCE(SUM(CASE 
          WHEN is_cancelled = FALSE THEN total_try 
          WHEN is_cancelled = TRUE AND refund_status IN ('pending', 'rejected') THEN total_try 
          ELSE 0 
        END), 0) as total_revenue,
        COALESCE(SUM(CASE 
          WHEN is_cancelled = FALSE AND payment_status = 'completed' THEN total_try 
          WHEN is_cancelled = TRUE AND refund_status IN ('pending', 'rejected') AND payment_status = 'completed' THEN total_try 
          ELSE 0 
        END), 0) as completed_revenue,
        COALESCE(SUM(CASE 
          WHEN is_cancelled = FALSE AND payment_status = 'pending' THEN total_try 
          ELSE 0 
        END), 0) as pending_revenue
      FROM registration_selections
    `)

    const revenue = (revenueStats as any[])[0]

    // İade İstatistikleri
    const [refundStats] = await pool.execute(`
      SELECT 
        COALESCE(SUM(CASE WHEN refund_status = 'pending' THEN total_try ELSE 0 END), 0) as refund_pending,
        COUNT(CASE WHEN refund_status = 'pending' THEN 1 END) as refund_pending_count,
        COALESCE(SUM(CASE WHEN refund_status = 'completed' THEN refund_amount ELSE 0 END), 0) as refund_completed,
        COUNT(CASE WHEN refund_status = 'completed' THEN 1 END) as refund_completed_count,
        COALESCE(SUM(CASE WHEN refund_status = 'rejected' THEN total_try ELSE 0 END), 0) as refund_rejected,
        COUNT(CASE WHEN refund_status = 'rejected' THEN 1 END) as refund_rejected_count
      FROM registration_selections
      WHERE is_cancelled = TRUE
    `)

    const refund = (refundStats as any[])[0]

    // Kategorilere Göre İstatistikler
    const [categoryStats] = await pool.execute(`
      SELECT 
        rc.id as category_id,
        rc.label_tr as category_name,
        rc.display_order,
        COUNT(*) as total_selections,
        SUM(CASE WHEN rs.is_cancelled = FALSE THEN 1 ELSE 0 END) as active_selections,
        SUM(CASE WHEN rs.is_cancelled = TRUE THEN 1 ELSE 0 END) as cancelled_selections,
        COALESCE(SUM(CASE 
          WHEN rs.is_cancelled = FALSE THEN rs.total_try 
          WHEN rs.is_cancelled = TRUE AND rs.refund_status IN ('pending', 'rejected') THEN rs.total_try 
          ELSE 0 
        END), 0) as total_revenue,
        COALESCE(SUM(CASE 
          WHEN rs.is_cancelled = FALSE AND rs.payment_status = 'completed' THEN rs.total_try 
          WHEN rs.is_cancelled = TRUE AND rs.refund_status IN ('pending', 'rejected') AND rs.payment_status = 'completed' THEN rs.total_try 
          ELSE 0 
        END), 0) as completed_revenue,
        COALESCE(SUM(CASE 
          WHEN rs.is_cancelled = FALSE AND rs.payment_status = 'pending' THEN rs.total_try 
          ELSE 0 
        END), 0) as pending_revenue
      FROM registration_selections rs
      JOIN registration_categories rc ON rs.category_id = rc.id
      GROUP BY rc.id, rc.label_tr, rc.display_order
      ORDER BY rc.display_order
    `)

    // Kayıt Türüne Göre İstatistikler
    const [typeStats] = await pool.execute(`
      SELECT 
        rt.id as type_id,
        rt.label as type_name,
        rc.label_tr as category_name,
        rc.display_order,
        COUNT(*) as total_selections,
        SUM(CASE WHEN rs.is_cancelled = FALSE THEN 1 ELSE 0 END) as active_selections,
        SUM(CASE WHEN rs.is_cancelled = TRUE THEN 1 ELSE 0 END) as cancelled_selections,
        COALESCE(SUM(CASE 
          WHEN rs.is_cancelled = FALSE THEN rs.total_try 
          WHEN rs.is_cancelled = TRUE AND rs.refund_status IN ('pending', 'rejected') THEN rs.total_try 
          ELSE 0 
        END), 0) as total_revenue,
        COALESCE(SUM(CASE 
          WHEN rs.is_cancelled = FALSE AND rs.payment_status = 'completed' THEN rs.total_try 
          WHEN rs.is_cancelled = TRUE AND rs.refund_status IN ('pending', 'rejected') AND rs.payment_status = 'completed' THEN rs.total_try 
          ELSE 0 
        END), 0) as completed_revenue
      FROM registration_selections rs
      JOIN registration_types rt ON rs.registration_type_id = rt.id
      JOIN registration_categories rc ON rs.category_id = rc.id
      GROUP BY rt.id, rt.label, rc.label_tr, rc.display_order
      ORDER BY rc.display_order, rt.id
    `)

    // Ödeme Yöntemine Göre
    const [paymentMethodStats] = await pool.execute(`
      SELECT 
        payment_method as method,
        COUNT(*) as count,
        COALESCE(SUM(
          (SELECT SUM(CASE 
            WHEN is_cancelled = FALSE THEN total_try 
            WHEN is_cancelled = TRUE AND refund_status IN ('pending', 'rejected') THEN total_try 
            ELSE 0 
          END)
          FROM registration_selections 
          WHERE registration_id = r.id)
        ), 0) as revenue
      FROM registrations r
      WHERE status = 1
      GROUP BY payment_method
    `)

    // Son 30 Gün Trendi
    const [dailyStats] = await pool.execute(`
      SELECT 
        DATE(r.created_at) as date,
        COUNT(DISTINCT r.id) as registrations,
        COUNT(rs.id) as selections,
        COALESCE(SUM(CASE 
          WHEN rs.is_cancelled = FALSE THEN rs.total_try 
          WHEN rs.is_cancelled = TRUE AND rs.refund_status IN ('pending', 'rejected') THEN rs.total_try 
          ELSE 0 
        END), 0) as revenue
      FROM registrations r
      LEFT JOIN registration_selections rs ON r.id = rs.registration_id
      WHERE r.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(r.created_at)
      ORDER BY date DESC
    `)

    return NextResponse.json({
      success: true,
      data: {
        totalRegistrations: Number(general.total_registrations),
        activeRegistrations: Number(general.active_registrations),
        cancelledRegistrations: Number(general.cancelled_registrations),
        
        totalSelections: Number(selections.total_selections),
        activeSelections: Number(selections.active_selections),
        cancelledSelections: Number(selections.cancelled_selections),
        
        totalRevenue: Number(revenue.total_revenue),
        completedRevenue: Number(revenue.completed_revenue),
        pendingRevenue: Number(revenue.pending_revenue),
        
        refundPending: Number(refund.refund_pending),
        refundPendingCount: Number(refund.refund_pending_count),
        refundCompleted: Number(refund.refund_completed),
        refundCompletedCount: Number(refund.refund_completed_count),
        refundRejected: Number(refund.refund_rejected),
        refundRejectedCount: Number(refund.refund_rejected_count),
        
        byCategory: categoryStats,
        byType: typeStats,
        byPaymentMethod: paymentMethodStats,
        byDay: dailyStats
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Dashboard verileri yüklenirken hata oluştu',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
