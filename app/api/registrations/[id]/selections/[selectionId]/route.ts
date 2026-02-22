import { NextRequest, NextResponse } from 'next/server'
import { pool, decrementCapacityForType } from '@/lib/db'

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
      await pool.execute(
        `UPDATE registration_selections 
         SET is_cancelled = TRUE, 
             payment_status = 'cancelled',
             cancelled_at = CURRENT_TIMESTAMP,
             refund_status = 'none'
         WHERE id = ?`,
        [params.selectionId]
      )
    } else {
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

    // Kontenjan: iptal edilen seçim için kapasiteyi artır
    await decrementCapacityForType(selection.registration_type_id)

    // Toplamlar artık anlık hesaplanıyor, güncellemeye gerek yok

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
