import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Toplam hesaplama fonksiyonu
async function updateRegistrationTotals(registrationId: string) {
  // İade tamamlanmadıysa para hala sistemde, toplama dahil
  const [totals] = await pool.execute(
    `SELECT 
      COALESCE(SUM(CASE WHEN is_cancelled = FALSE OR (is_cancelled = TRUE AND refund_status != 'completed') THEN applied_fee_try ELSE 0 END), 0) as total_fee,
      COALESCE(SUM(CASE WHEN is_cancelled = FALSE OR (is_cancelled = TRUE AND refund_status != 'completed') THEN vat_amount_try ELSE 0 END), 0) as vat_amount,
      COALESCE(SUM(CASE WHEN is_cancelled = FALSE OR (is_cancelled = TRUE AND refund_status != 'completed') THEN total_try ELSE 0 END), 0) as grand_total
     FROM registration_selections 
     WHERE registration_id = ?`,
    [registrationId]
  )

  const totalsData = (totals as any[])[0]

  await pool.execute(
    `UPDATE registrations 
     SET total_fee = ?, 
         vat_amount = ?, 
         grand_total = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [totalsData.total_fee, totalsData.vat_amount, totalsData.grand_total, registrationId]
  )
}

// İade onaylama
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; selectionId: string } }
) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, notes } = body // action: 'approve' | 'reject'

    // Selection'ı kontrol et
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

    if (!selection.is_cancelled) {
      return NextResponse.json(
        { success: false, error: 'Bu seçim iptal edilmemiş' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // İadeyi onayla ve tamamla
      await pool.execute(
        `UPDATE registration_selections 
         SET refund_status = 'completed',
             refund_amount = total_try,
             refund_approved_at = CURRENT_TIMESTAMP,
             refund_approved_by = ?,
             refund_completed_at = CURRENT_TIMESTAMP,
             refund_method = 'Banka Transferi',
             refund_notes = ?
         WHERE id = ?`,
        [currentUser.id, notes || 'Para iadesi yapıldı', params.selectionId]
      )

      // Ana kaydın toplamlarını güncelle
      await updateRegistrationTotals(params.id)

      return NextResponse.json({
        success: true,
        message: 'Para iadesi yapıldı'
      })
    } else if (action === 'reject') {
      // İadeyi reddet
      await pool.execute(
        `UPDATE registration_selections 
         SET refund_status = 'rejected',
             refund_notes = ?
         WHERE id = ?`,
        [notes || 'İade reddedildi', params.selectionId]
      )

      return NextResponse.json({
        success: true,
        message: 'İade reddedildi'
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Geçersiz işlem' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error processing refund:', error)
    return NextResponse.json(
      { success: false, error: 'İade işlemi sırasında hata oluştu' },
      { status: 500 }
    )
  }
}
