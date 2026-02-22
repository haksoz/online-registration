import { NextRequest, NextResponse } from 'next/server'
import { getAllRegistrationTypes, createRegistrationType, checkRegistrationTypeExists, pool } from '@/lib/db'
import { validateRegistrationTypeInput } from '@/lib/validation'
import { RegistrationType } from '@/types/registration'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Fetch all active registration types from database
    const registrationTypesRaw = await getAllRegistrationTypes() as any[]

    // Kategori bazlı erken kayıt (registration_categories)
    const [categoryRows] = await pool.execute(
      'SELECT id, early_bird_deadline, early_bird_enabled FROM registration_categories'
    )
    const categoryEarlyBird = new Map(
      (categoryRows as any[]).map((c: any) => [
        c.id,
        {
          deadline: c.early_bird_deadline ? new Date(c.early_bird_deadline) : null,
          enabled: !!c.early_bird_enabled,
        },
      ])
    )
    const now = new Date()

    // Kapasite + kategori bazlı erken kayıt
    let anyEarlyBirdActive = false
    let firstEarlyBirdDeadline: string | null = null
    const registrationTypes = registrationTypesRaw.map((type: any) => {
      const capacity = type.capacity != null ? Number(type.capacity) : null
      const currentRegistrations = Number(type.current_registrations ?? 0)
      const is_available =
        capacity == null || currentRegistrations < capacity
      const cat = categoryEarlyBird.get(type.category_id)
      const is_early_bird_active =
        !!cat?.enabled && cat?.deadline !== null && now <= cat.deadline
      if (is_early_bird_active) {
        anyEarlyBirdActive = true
        if (!firstEarlyBirdDeadline && cat?.deadline)
          firstEarlyBirdDeadline = cat.deadline.toISOString().slice(0, 19).replace('T', ' ')
      }
      return {
        ...type,
        capacity,
        current_registrations: currentRegistrations,
        is_available,
        is_early_bird_active: !!is_early_bird_active,
        early_bird_deadline: cat?.deadline ? cat.deadline.toISOString().slice(0, 19).replace('T', ' ') : null,
      }
    }) as RegistrationType[]

    // Fetch currency type from step2_settings
    const [currencyRows] = await pool.execute(
      "SELECT setting_value FROM step2_settings WHERE setting_key = 'currency_type'"
    )
    const currencyType = (currencyRows as any[])[0]?.setting_value || 'TRY'

    return NextResponse.json(
      {
        success: true,
        data: registrationTypes,
        currencyType: currencyType,
        earlyBird: {
          enabled: anyEarlyBirdActive,
          deadline: firstEarlyBirdDeadline,
          isActive: anyEarlyBirdActive
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
    
    const { value, label, label_en, category_id, fee_try, fee_usd, fee_eur, early_bird_fee_try, early_bird_fee_usd, early_bird_fee_eur, vat_rate, description, description_en, requires_document, document_label, document_label_en, document_description, document_description_en, capacity } = body

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

    const VALUE_MAX = 255
    const LABEL_MAX = 255
    const safeValue = String(value).trim().slice(0, VALUE_MAX)
    const safeLabel = String(label).trim().slice(0, LABEL_MAX)
    const safeLabelEn = label_en != null ? String(label_en).trim().slice(0, LABEL_MAX) : null

    // Check if value already exists
    const exists = await checkRegistrationTypeExists(safeValue)
    if (exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bu value değeri zaten kullanılmaktadır'
        },
        { status: 409 }
      )
    }

    // Create new registration type (string alanlar DB sınırına uygun kısaltıldı)
    const result = await createRegistrationType({
      value: safeValue,
      label: safeLabel,
      label_en: safeLabelEn || null,
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
      document_description_en: document_description_en || null,
      capacity: capacity != null && !isNaN(Number(capacity)) && Number(capacity) >= 1 ? Number(capacity) : null
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