import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    console.log('📊 Dashboard stats API called')
    
    // Toplam kayıt sayısı (sadece aktif kayıtlar)
    const [totalRegistrations] = await pool.execute(
      'SELECT COUNT(*) as total FROM registrations WHERE status = 1'
    )
    console.log('✅ Total registrations fetched')
    
    // Bu ayki kayıtlar (sadece aktif)
    const [thisMonthRegistrations] = await pool.execute(
      'SELECT COUNT(*) as total FROM registrations WHERE status = 1 AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())'
    )
    
    // Bugünkü kayıtlar (sadece aktif)
    const [todayRegistrations] = await pool.execute(
      'SELECT COUNT(*) as total FROM registrations WHERE status = 1 AND DATE(created_at) = CURDATE()'
    )
    
    // Ödeme durumu istatistikleri (sadece aktif kayıtlar)
    const [paymentStats] = await pool.execute(
      'SELECT payment_status, COUNT(*) as count FROM registrations WHERE status = 1 GROUP BY payment_status'
    )
    
    // Kayıt türü istatistikleri (sadece aktif kayıtlar)
    const [registrationTypeStats] = await pool.execute(
      `SELECT 
        r.registration_type, 
        COUNT(*) as count,
        rt.label as type_label
       FROM registrations r
       LEFT JOIN registration_types rt ON r.registration_type = rt.value
       WHERE r.status = 1
       GROUP BY r.registration_type, rt.label`
    )
    
    // Ödeme yöntemi istatistikleri (sadece aktif kayıtlar)
    const [paymentMethodStats] = await pool.execute(
      'SELECT payment_method, COUNT(*) as count FROM registrations WHERE status = 1 GROUP BY payment_method'
    )
    
    // Son 7 günlük kayıt trendi (sadece aktif kayıtlar)
    const [weeklyTrend] = await pool.execute(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
       FROM registrations 
       WHERE status = 1 AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    )
    
    // Toplam gelir (sadece aktif kayıtlar, tamamlanan ödemeler)
    const [totalRevenue] = await pool.execute(
      'SELECT SUM(fee) as total FROM registrations WHERE status = 1 AND payment_status = "completed"'
    )
    
    // Bekleyen ödemeler (sadece aktif kayıtlar)
    const [pendingRevenue] = await pool.execute(
      'SELECT SUM(fee) as total FROM registrations WHERE status = 1 AND payment_status = "pending"'
    )
    
    // Son kayıtlar (5 adet, sadece aktif)
    const [recentRegistrations] = await pool.execute(
      `SELECT 
        r.id, r.full_name, r.email, r.registration_type, r.payment_status, r.fee, r.created_at,
        rt.label as type_label
       FROM registrations r
       LEFT JOIN registration_types rt ON r.registration_type = rt.value
       WHERE r.status = 1
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

    // Risk skorları (optional - kolon yoksa skip)
    let riskStats: any[] = [{ high_risk: 0, medium_risk: 0, low_risk: 0 }]
    try {
      const [stats] = await pool.execute(
        `SELECT 
          COUNT(CASE WHEN risk_score >= 70 THEN 1 END) as high_risk,
          COUNT(CASE WHEN risk_score >= 40 AND risk_score < 70 THEN 1 END) as medium_risk,
          COUNT(CASE WHEN risk_score < 40 THEN 1 END) as low_risk
         FROM registration_logs`
      )
      riskStats = stats as any[]
    } catch (error: any) {
      console.log('⚠️ Risk score column not found, using defaults')
    }
    
    
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
  } catch (error: any) {
    console.error('❌ Dashboard stats error:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    return NextResponse.json(
      { 
        success: false, 
        error: 'İstatistikler alınamadı',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}