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
    
    const { label, label_en, category_id, fee_try, fee_usd, fee_eur, description, description_en } = body

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

    // Update registration type
    await pool.execute(
      'UPDATE registration_types SET label = ?, label_en = ?, category_id = ?, fee_try = ?, fee_usd = ?, fee_eur = ?, description = ?, description_en = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        label, 
        label_en || null,
        Number(category_id),
        fee_try ? Number(fee_try) : 0, 
        fee_usd ? Number(fee_usd) : 0, 
        fee_eur ? Number(fee_eur) : 0, 
        description || null, 
        description_en || null,
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

    // Check if registration type is being used in registrations
    const [usageRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM registrations WHERE registration_type = ?',
      [registrationType.value]
    )

    const usageCount = (usageRows as any[])[0].count
    if (usageCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Bu kayıt türü ${usageCount} kayıtta kullanılmaktadır. Kullanımda olan kayıt türleri silinemez.`
        },
        { status: 409 }
      )
    }

    // Soft delete - set is_active to false instead of hard delete
    await pool.execute(
      'UPDATE registration_types SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [idValidation.numericId]
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Kayıt türü başarıyla silindi'
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