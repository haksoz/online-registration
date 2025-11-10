import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}

// GET - Aktif banka hesaplarını getir (kullanıcı formu için)
export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig)
    
    // Sadece aktif hesapları getir
    const [accounts] = await connection.execute(
      'SELECT id, account_name, bank_name, account_holder, iban, currency, description FROM bank_accounts WHERE is_active = TRUE ORDER BY display_order, id'
    )
    
    // Ödeme ayarlarını da getir
    const [settings] = await connection.execute(
      'SELECT setting_key, setting_value FROM payment_settings'
    )
    
    await connection.end()
    
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