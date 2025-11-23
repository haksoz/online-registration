import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; selectionId: string } }
) {
  try {
    // Önce selection'ı kontrol et
    const [selections] = await pool.execute(
      'SELECT * FROM registration_selections WHERE id = ? AND registration_id = ?',
      [params.selectionId, params.id]
    )

    if ((selections as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Seçim bulunamadı' },
        { status: 404 }
      )
    }

    const selection = (selections as any[])[0]

    // Seçimin kendi ödeme durumunu kontrol et
    const paymentPending = selection.payment_status === 'pending'

    console.log('🔍 İptal işlemi - Selection ID:', params.selectionId)
    console.log('💳 Selection Payment Status:', selection.payment_status)
    console.log('⏳ Payment Pending:', paymentPending)

    // Ödeme beklemedeyse (para henüz gelmemişse) direkt iptal, iade süreci yok
    // Ödeme tamamlanmışsa (para gelmişse) iade süreci başlat
    if (paymentPending) {
      // Para henüz gelmemiş, direkt iptal (iade yok)
      await pool.execute(
        `UPDATE registration_selections 
         SET is_cancelled = TRUE, 
             cancelled_at = CURRENT_TIMESTAMP,
             refund_status = 'none'
         WHERE id = ?`,
        [params.selectionId]
      )
    } else {
      // Para gelmiş, iade süreci başlat
      await pool.execute(
        `UPDATE registration_selections 
         SET is_cancelled = TRUE, 
             cancelled_at = CURRENT_TIMESTAMP,
             refund_status = 'pending',
             refund_requested_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [params.selectionId]
      )
    }

    // Ana kaydın toplamlarını güncelle
    // Sadece iade tamamlananları hariç tut
    const [totals] = await pool.execute(
      `SELECT 
        COALESCE(SUM(CASE WHEN is_cancelled = FALSE OR (is_cancelled = TRUE AND refund_status != 'completed') THEN applied_fee_try ELSE 0 END), 0) as total_fee,
        COALESCE(SUM(CASE WHEN is_cancelled = FALSE OR (is_cancelled = TRUE AND refund_status != 'completed') THEN vat_amount_try ELSE 0 END), 0) as vat_amount,
        COALESCE(SUM(CASE WHEN is_cancelled = FALSE OR (is_cancelled = TRUE AND refund_status != 'completed') THEN total_try ELSE 0 END), 0) as grand_total
       FROM registration_selections 
       WHERE registration_id = ?`,
      [params.id]
    )

    const totalsData = (totals as any[])[0]

    await pool.execute(
      `UPDATE registrations 
       SET total_fee = ?, 
           vat_amount = ?, 
           grand_total = ?
       WHERE id = ?`,
      [totalsData.total_fee, totalsData.vat_amount, totalsData.grand_total, params.id]
    )

    return NextResponse.json({
      success: true,
      message: 'Seçim iptal edildi'
    })
  } catch (error) {
    console.error('Error cancelling selection:', error)
    return NextResponse.json(
      { success: false, error: 'Seçim iptal edilirken hata oluştu' },
      { status: 500 }
    )
  }
}
