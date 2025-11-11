import { NextRequest, NextResponse } from 'next/server'
import { pool } from "@/lib/db"


// PUT - Banka hesabını güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    
    
    await pool.execute(
      `UPDATE bank_accounts 
       SET account_name = ?, bank_name = ?, account_holder = ?, iban = ?, 
           currency = ?, swift_code = ?, account_number = ?, bank_address = ?,
           description = ?, is_active = ?, display_order = ?
       WHERE id = ?`,
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
        display_order || 0,
        params.id
      ]
    )
    
    
    return NextResponse.json({
      success: true,
      message: 'Banka hesabı güncellendi'
    })
  } catch (error) {
    console.error('Bank account update error:', error)
    return NextResponse.json(
      { success: false, error: 'Banka hesabı güncellenemedi' },
      { status: 500 }
    )
  }
}

// DELETE - Banka hesabını sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    
    
    await pool.execute(
      'DELETE FROM bank_accounts WHERE id = ?',
      [params.id]
    )
    
    
    return NextResponse.json({
      success: true,
      message: 'Banka hesabı silindi'
    })
  } catch (error) {
    console.error('Bank account delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Banka hesabı silinemedi' },
      { status: 500 }
    )
  }
}
