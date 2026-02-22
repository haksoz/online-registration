import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { validateRegistrationTypeInput, validateId } from '@/lib/validation'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID
    const idValidation = validateId(params.id)
    if (!idValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: idValidation.error
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    const { label, label_en, category_id, fee_try, fee_usd, fee_eur, early_bird_fee_try, early_bird_fee_usd, early_bird_fee_eur, vat_rate, description, description_en, capacity } = body

    // Required fields check
    if (!label || !category_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Eksik alanlar: label ve category_id zorunludur'
        },
        { status: 400 }
      )
    }

    // Kategori kontenjan takibiyse capacity zorunlu
    const [catRows] = await pool.execute(
      'SELECT track_capacity FROM registration_categories WHERE id = ?',
      [Number(category_id)]
    )
    const trackCapacity = (catRows as any[])[0]?.track_capacity === 1
    if (trackCapacity) {
      const cap = capacity != null ? Number(capacity) : null
      if (cap == null || isNaN(cap) || cap < 1) {
        return NextResponse.json(
          { success: false, error: 'Bu kategoride kontenjan takibi açık; kapasite zorunludur ve 1 veya üzeri olmalıdır' },
          { status: 400 }
        )
      }
    }

    // Validate numbers
    if (isNaN(Number(fee_try)) || Number(fee_try) < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'TL ücreti geçerli bir sayı olmalıdır'
        },
        { status: 400 }
      )
    }

    if (isNaN(Number(fee_usd)) || Number(fee_usd) < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'USD ücreti geçerli bir sayı olmalıdır'
        },
        { status: 400 }
      )
    }

    if (isNaN(Number(fee_eur)) || Number(fee_eur) < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'EUR ücreti geçerli bir sayı olmalıdır'
        },
        { status: 400 }
      )
    }

    // Check if registration type exists
    const [existingRows] = await pool.execute(
      'SELECT id FROM registration_types WHERE id = ?',
      [idValidation.numericId]
    )

    if ((existingRows as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Kayıt türü bulunamadı'
        },
        { status: 404 }
      )
    }

    const capacityVal = capacity != null && !isNaN(Number(capacity)) && Number(capacity) >= 1 ? Number(capacity) : null
    const LABEL_MAX = 255
    const safeLabel = String(label).trim().slice(0, LABEL_MAX)
    const safeLabelEn = label_en != null ? String(label_en).trim().slice(0, LABEL_MAX) : null

    // Update registration type
    await pool.execute(
      'UPDATE registration_types SET label = ?, label_en = ?, category_id = ?, fee_try = ?, fee_usd = ?, fee_eur = ?, early_bird_fee_try = ?, early_bird_fee_usd = ?, early_bird_fee_eur = ?, vat_rate = ?, description = ?, description_en = ?, capacity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        safeLabel,
        safeLabelEn,
        Number(category_id),
        fee_try ? Number(fee_try) : 0,
        fee_usd ? Number(fee_usd) : 0,
        fee_eur ? Number(fee_eur) : 0,
        early_bird_fee_try ? Number(early_bird_fee_try) : null,
        early_bird_fee_usd ? Number(early_bird_fee_usd) : null,
        early_bird_fee_eur ? Number(early_bird_fee_eur) : null,
        vat_rate !== undefined ? Number(vat_rate) : 0.20,
        description || null,
        description_en || null,
        capacityVal,
        idValidation.numericId
      ]
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Kayıt türü başarıyla güncellendi'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating registration type:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Kayıt türü güncellenirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID
    const idValidation = validateId(params.id)
    if (!idValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: idValidation.error
        },
        { status: 400 }
      )
    }

    // Check if registration type exists
    const [existingRows] = await pool.execute(
      'SELECT id, value FROM registration_types WHERE id = ?',
      [idValidation.numericId]
    )

    if ((existingRows as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Kayıt türü bulunamadı'
        },
        { status: 404 }
      )
    }

    const registrationType = (existingRows as any[])[0]

    // Check if registration type is being used in registration_selections
    const [usageRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM registration_selections WHERE registration_type_id = ?',
      [idValidation.numericId]
    )

    const usageCount = (usageRows as any[])[0].count

    // Soft delete - set is_active to false
    // Kullanımda olsa bile pasif yapabiliriz (geçmiş kayıtlar etkilenmez)
    await pool.execute(
      'UPDATE registration_types SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [idValidation.numericId]
    )

    const message = usageCount > 0 
      ? `Kayıt türü pasif yapıldı (${usageCount} kayıtta kullanılmaktadır, geçmiş kayıtlar etkilenmez)`
      : 'Kayıt türü pasif yapıldı'

    return NextResponse.json(
      {
        success: true,
        message
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting registration type:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Kayıt türü silinirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}