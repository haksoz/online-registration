import { NextRequest, NextResponse } from 'next/server'
import { getAllRegistrationTypes, createRegistrationType, checkRegistrationTypeExists } from '@/lib/db'
import { validateRegistrationTypeInput } from '@/lib/validation'
import { RegistrationType } from '@/types/registration'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Fetch all active registration types from database
    const registrationTypes = await getAllRegistrationTypes() as RegistrationType[]

    // Fetch currency type from step2_settings
    const { pool } = require('@/lib/db')
    const [currencyRows] = await pool.execute(
      "SELECT setting_value FROM step2_settings WHERE setting_key = 'currency_type'"
    )
    const currencyType = (currencyRows as any[])[0]?.setting_value || 'TRY'

    // Fetch early bird settings
    const [earlyBirdRows] = await pool.execute(
      "SELECT early_bird_deadline, early_bird_enabled FROM form_settings WHERE id = 1"
    )
    const earlyBirdDeadline = (earlyBirdRows as any[])[0]?.early_bird_deadline || null
    const earlyBirdEnabled = (earlyBirdRows as any[])[0]?.early_bird_enabled || false
    
    // Check if early bird is active
    const isEarlyBirdActive = earlyBirdEnabled && earlyBirdDeadline && new Date() < new Date(earlyBirdDeadline)

    return NextResponse.json(
      {
        success: true,
        data: registrationTypes,
        currencyType: currencyType,
        earlyBird: {
          enabled: earlyBirdEnabled,
          deadline: earlyBirdDeadline,
          isActive: isEarlyBirdActive
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching registration types:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Kayıt türleri yüklenirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { value, label, label_en, category_id, fee_try, fee_usd, fee_eur, early_bird_fee_try, early_bird_fee_usd, early_bird_fee_eur, vat_rate, description, description_en, requires_document, document_label, document_label_en, document_description, document_description_en } = body

    // Required fields check
    if (!value || !label || !category_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Eksik alanlar: value, label ve category_id zorunludur'
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

    // Check if value already exists
    const exists = await checkRegistrationTypeExists(value)
    if (exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bu value değeri zaten kullanılmaktadır'
        },
        { status: 409 }
      )
    }

    // Create new registration type
    const result = await createRegistrationType({
      value,
      label,
      label_en: label_en || null,
      category_id: Number(category_id),
      fee_try: fee_try ? Number(fee_try) : 0,
      fee_usd: fee_usd ? Number(fee_usd) : 0,
      fee_eur: fee_eur ? Number(fee_eur) : 0,
      early_bird_fee_try: early_bird_fee_try ? Number(early_bird_fee_try) : null,
      early_bird_fee_usd: early_bird_fee_usd ? Number(early_bird_fee_usd) : null,
      early_bird_fee_eur: early_bird_fee_eur ? Number(early_bird_fee_eur) : null,
      vat_rate: vat_rate !== undefined ? Number(vat_rate) : 0.20,
      description: description || null,
      description_en: description_en || null,
      requires_document: requires_document || false,
      document_label: document_label || null,
      document_label_en: document_label_en || null,
      document_description: document_description || null,
      document_description_en: document_description_en || null
    })

    return NextResponse.json(
      {
        success: true,
        data: { id: (result as any).insertId },
        message: 'Kayıt türü başarıyla oluşturuldu'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating registration type:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Kayıt türü oluşturulurken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}