import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    
    // Toplam kayıt sayısı
    const [totalRegistrations] = await pool.execute(
      'SELECT COUNT(*) as total FROM registrations'
    )
    
    // Bu ayki kayıtlar
    const [thisMonthRegistrations] = await pool.execute(
      'SELECT COUNT(*) as total FROM registrations WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())'
    )
    
    // Bugünkü kayıtlar
    const [todayRegistrations] = await pool.execute(
      'SELECT COUNT(*) as total FROM registrations WHERE DATE(created_at) = CURDATE()'
    )
    
    // Ödeme durumu istatistikleri
    const [paymentStats] = await pool.execute(
      'SELECT payment_status, COUNT(*) as count FROM registrations GROUP BY payment_status'
    )
    
    // Kayıt türü istatistikleri
    const [registrationTypeStats] = await pool.execute(
      `SELECT 
        r.registration_type, 
        COUNT(*) as count,
        rt.label as type_label
       FROM registrations r
       LEFT JOIN registration_types rt ON r.registration_type = rt.value
       GROUP BY r.registration_type, rt.label`
    )
    
    // Ödeme yöntemi istatistikleri
    const [paymentMethodStats] = await pool.execute(
      'SELECT payment_method, COUNT(*) as count FROM registrations GROUP BY payment_method'
    )
    
    // Son 7 günlük kayıt trendi
    const [weeklyTrend] = await pool.execute(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
       FROM registrations 
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    )
    
    // Toplam gelir (tamamlanan ödemeler)
    const [totalRevenue] = await pool.execute(
      'SELECT SUM(fee) as total FROM registrations WHERE payment_status = "completed"'
    )
    
    // Bekleyen ödemeler
    const [pendingRevenue] = await pool.execute(
      'SELECT SUM(fee) as total FROM registrations WHERE payment_status = "pending"'
    )
    
    // Son kayıtlar (5 adet)
    const [recentRegistrations] = await pool.execute(
      `SELECT 
        r.id, r.full_name, r.email, r.registration_type, r.payment_status, r.fee, r.created_at,
        rt.label as type_label
       FROM registrations r
       LEFT JOIN registration_types rt ON r.registration_type = rt.value
       ORDER BY r.created_at DESC 
       LIMIT 5`
    )

    // İptal edilen kayıtlar
    const [cancelledRegistrations] = await pool.execute(
      'SELECT COUNT(*) as total FROM registrations WHERE status = 0'
    )

    // İade durumu istatistikleri
    const [refundStats] = await pool.execute(
      `SELECT refund_status, COUNT(*) as count 
       FROM registrations 
       WHERE refund_status IS NOT NULL AND refund_status != 'none'
       GROUP BY refund_status`
    )

    // Kayıt ve iptal deadline'ları
    const [deadlines] = await pool.execute(
      `SELECT setting_key, setting_value 
       FROM form_settings 
       WHERE setting_key IN ('registration_start_date', 'registration_deadline', 'cancellation_deadline')`
    )

    // Döviz kurları (son güncelleme)
    const [exchangeRates] = await pool.execute(
      `SELECT currency_code, rate_to_try as rate, last_updated as updated_at 
       FROM exchange_rates 
       ORDER BY last_updated DESC 
       LIMIT 3`
    )

    // Cihaz tipi istatistikleri (registration logs'dan)
    const [deviceStats] = await pool.execute(
      `SELECT device_type, COUNT(*) as count 
       FROM registration_logs 
       GROUP BY device_type 
       ORDER BY count DESC`
    )

    // Risk skorları
    const [riskStats] = await pool.execute(
      `SELECT 
        COUNT(CASE WHEN risk_score >= 70 THEN 1 END) as high_risk,
        COUNT(CASE WHEN risk_score >= 40 AND risk_score < 70 THEN 1 END) as medium_risk,
        COUNT(CASE WHEN risk_score < 40 THEN 1 END) as low_risk
       FROM registration_logs`
    )
    
    
    // Deadline'ları objeye çevir
    const deadlineObj: any = {}
    ;(deadlines as any[]).forEach((row: any) => {
      deadlineObj[row.setting_key] = row.setting_value
    })

    return NextResponse.json({
      success: true,
      data: {
        totals: {
          registrations: (totalRegistrations as any[])[0]?.total || 0,
          thisMonth: (thisMonthRegistrations as any[])[0]?.total || 0,
          today: (todayRegistrations as any[])[0]?.total || 0,
          revenue: (totalRevenue as any[])[0]?.total || 0,
          pendingRevenue: (pendingRevenue as any[])[0]?.total || 0,
          cancelled: (cancelledRegistrations as any[])[0]?.total || 0
        },
        paymentStats: paymentStats,
        registrationTypeStats: registrationTypeStats,
        paymentMethodStats: paymentMethodStats,
        weeklyTrend: weeklyTrend,
        recentRegistrations: recentRegistrations,
        refundStats: refundStats,
        deadlines: deadlineObj,
        exchangeRates: exchangeRates,
        deviceStats: deviceStats,
        riskStats: (riskStats as any[])[0] || { high_risk: 0, medium_risk: 0, low_risk: 0 }
      }
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { success: false, error: 'İstatistikler alınamadı' },
      { status: 500 }
    )
  }
}