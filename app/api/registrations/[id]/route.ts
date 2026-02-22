import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM registrations WHERE id = ?',
      [params.id]
    )

    const registrations = rows as any[]
    if (registrations.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kayıt bulunamadı' },
        { status: 404 }
      )
    }

    const registration = registrations[0]

    // Selections'ları çek
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
      [params.id]
    )

    registration.selections = selections

    // İptal son tarihi: Bu kayıttaki kategorilerin en erken cancellation_deadline değeri (kategori bazlı)
    const categoryIds = [...new Set((selections as any[]).map((s: any) => s.category_id).filter(Boolean))]
    if (categoryIds.length > 0) {
      const [catRows] = await pool.execute(
        `SELECT MIN(cancellation_deadline) as deadline FROM registration_categories WHERE id IN (${categoryIds.map(() => '?').join(',')}) AND cancellation_deadline IS NOT NULL`,
        categoryIds
      )
      const deadline = (catRows as any[])[0]?.deadline
      if (deadline) registration.cancellationDeadline = deadline
    }

    // Toplam hesapla: Aktif seçimler + İade bekleyen/reddedilen seçimler
    const includedSelections = (selections as any[]).filter(s => 
      !s.is_cancelled || (s.is_cancelled && ['pending', 'rejected'].includes(s.refund_status))
    )
    const totalFee = includedSelections.reduce((sum, s) => sum + Number(s.applied_fee_try || 0), 0)
    const vatAmount = includedSelections.reduce((sum, s) => sum + Number(s.vat_amount_try || 0), 0)
    const grandTotal = includedSelections.reduce((sum, s) => sum + Number(s.total_try || 0), 0)

    registration.total_fee = totalFee
    registration.vat_amount = vatAmount
    registration.grand_total = grandTotal

    return NextResponse.json({
      success: true,
      data: registration
    })
  } catch (error) {
    console.error('Error fetching registration:', error)
    return NextResponse.json(
      { success: false, error: 'Kayıt yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const updates: string[] = []
    const values: any[] = []

    // Güncellenebilir alanlar
    const allowedFields = [
      'payment_status',
      'payment_confirmed_at',
      'payment_notes',
      'payment_receipt_filename',
      'payment_receipt_url',
      'payment_receipt_uploaded_at',
      'status'
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`)
        values.push(body[field])
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Güncellenecek alan bulunamadı' },
        { status: 400 }
      )
    }

    values.push(params.id)

    await pool.execute(
      `UPDATE registrations SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    // Eğer payment_status güncellendiyse, sadece aktif seçimlerin payment_status'unu güncelle
    // İptal edilmiş seçimler için payment_status değişmemeli
    if (body.payment_status) {
      await pool.execute(
        `UPDATE registration_selections 
         SET payment_status = ? 
         WHERE registration_id = ? AND is_cancelled = FALSE`,
        [body.payment_status, params.id]
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Kayıt güncellendi'
    })
  } catch (error) {
    console.error('Error updating registration:', error)
    return NextResponse.json(
      { success: false, error: 'Kayıt güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}
