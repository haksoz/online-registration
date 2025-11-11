import { NextRequest, NextResponse } from 'next/server'
import { pool } from "@/lib/db"


// GET - Banka hesapları ve ödeme ayarlarını getir
export async function GET() {
  try {
    
    
    // Banka hesaplarını getir
    const [accounts] = await pool.execute(
      'SELECT * FROM bank_accounts ORDER BY display_order, id'
    )
    
    // Ödeme ayarlarını getir
    const [settings] = await pool.execute(
      'SELECT setting_key, setting_value FROM payment_settings'
    )
    
    
    // Ayarları obje formatına çevir
    const paymentSettings: Record<string, string> = {}
    ;(settings as any[]).forEach((row) => {
      paymentSettings[row.setting_key] = row.setting_value
    })
    
    return NextResponse.json({
      success: true,
      data: {
        accounts: accounts,
        settings: paymentSettings
      }
    })
  } catch (error) {
    console.error('Bank settings fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Banka ayarları alınamadı' },
      { status: 500 }
    )
  }
}

// POST - Yeni banka hesabı ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { account_name, bank_name, account_holder, iban, currency, swift_code, account_number, bank_address, description, is_active, display_order } = body
    
    if (!account_name || !bank_name || !account_holder || !iban) {
      return NextResponse.json(
        { success: false, error: 'Zorunlu alanlar eksik' },
        { status: 400 }
      )
    }

    // Döviz hesapları için ek validasyon
    if (currency && currency !== 'TRY') {
      if (!swift_code || !account_number || !bank_address) {
        return NextResponse.json(
          { success: false, error: 'Döviz hesapları için SWIFT kodu, hesap numarası ve banka adresi zorunludur' },
          { status: 400 }
        )
      }
    }
    
    
    
    const [result] = await pool.execute(
      `INSERT INTO bank_accounts (account_name, bank_name, account_holder, iban, currency, swift_code, account_number, bank_address, description, is_active, display_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        account_name, 
        bank_name, 
        account_holder, 
        iban, 
        currency || 'TRY', 
        swift_code || null,
        account_number || null,
        bank_address || null,
        description || '', 
        is_active !== false, 
        display_order || 0
      ]
    )
    
    
    return NextResponse.json({
      success: true,
      message: 'Banka hesabı eklendi',
      id: (result as any).insertId
    })
  } catch (error) {
    console.error('Bank account create error:', error)
    return NextResponse.json(
      { success: false, error: 'Banka hesabı eklenemedi' },
      { status: 500 }
    )
  }
}

// PUT - Ödeme ayarlarını güncelle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings } = body
    
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Geçersiz ayar verisi' },
        { status: 400 }
      )
    }
    
    
    
    // Her ayarı güncelle
    for (const [key, value] of Object.entries(settings)) {
      await pool.execute(
        `INSERT INTO payment_settings (setting_key, setting_value) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE 
         setting_value = VALUES(setting_value), 
         updated_at = CURRENT_TIMESTAMP`,
        [key, value]
      )
    }
    
    
    return NextResponse.json({
      success: true,
      message: 'Ödeme ayarları güncellendi'
    })
  } catch (error) {
    console.error('Payment settings update error:', error)
    return NextResponse.json(
      { success: false, error: 'Ödeme ayarları güncellenemedi' },
      { status: 500 }
    )
  }
}