import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(
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

    // Ana kaydın ödeme durumunu kontrol et
    const [registrations] = await pool.execute(
      'SELECT payment_status FROM registrations WHERE id = ?',
      [params.id]
    )
    
    const registration = (registrations as any[])[0]
    
    // Tahsilat onayı verildiyse iptal geri alınamaz
    if (registration.payment_status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Tahsilat onayı verilmiş kayıtlarda iptal geri alınamaz' },
        { status: 400 }
      )
    }

    // İade tamamlanmışsa geri alınamaz
    if (selection.refund_status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'İadesi tamamlanmış seçim geri alınamaz' },
        { status: 400 }
      )
    }

    // İptal edilmemişse zaten aktif
    if (!selection.is_cancelled) {
      return NextResponse.json(
        { success: false, error: 'Bu seçim zaten aktif' },
        { status: 400 }
      )
    }

    // İptali geri al
    await pool.execute(
      `UPDATE registration_selections 
       SET is_cancelled = FALSE, 
           cancelled_at = NULL,
           cancelled_by = NULL,
           cancel_reason = NULL,
           refund_status = 'none',
           refund_amount = 0,
           refund_requested_at = NULL,
           refund_approved_at = NULL,
           refund_approved_by = NULL,
           refund_completed_at = NULL,
           refund_notes = NULL,
           refund_method = NULL
       WHERE id = ?`,
      [params.selectionId]
    )

    // Ana kaydın toplamlarını güncelle
    const [totals] = await pool.execute(
      `SELECT 
        COALESCE(SUM(CASE WHEN is_cancelled = FALSE THEN applied_fee_try ELSE 0 END), 0) as total_fee,
        COALESCE(SUM(CASE WHEN is_cancelled = FALSE THEN vat_amount_try ELSE 0 END), 0) as vat_amount,
        COALESCE(SUM(CASE WHEN is_cancelled = FALSE THEN total_try ELSE 0 END), 0) as grand_total
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
      message: 'İptal geri alındı'
    })
  } catch (error) {
    console.error('Error undoing cancellation:', error)
    return NextResponse.json(
      { success: false, error: 'İşlem sırasında hata oluştu' },
      { status: 500 }
    )
  }
}
