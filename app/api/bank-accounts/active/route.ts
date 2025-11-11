import { NextResponse } from 'next/server'
import { pool } from "@/lib/db"


// GET - Aktif banka hesaplarını getir (kullanıcı formu için)
export async function GET() {
  try {
    
    
    // Sadece aktif hesapları getir
    const [accounts] = await pool.execute(
      'SELECT id, account_name, bank_name, account_holder, iban, currency, description FROM bank_accounts WHERE is_active = TRUE ORDER BY display_order, id'
    )
    
    // Ödeme ayarlarını da getir
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
    console.error('Active bank accounts fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Aktif banka hesapları alınamadı' },
      { status: 500 }
    )
  }
}