import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

const DEFAULT_CURRENCY_NAMES: Record<string, string> = {
  TRY: 'Türk Lirası',
  USD: 'Amerikan Doları',
  EUR: 'Euro'
}

/** Tablo boşsa TRY, USD, EUR varsayılan kayıtlarını ekler (veritabanı sıfırlandığında sayfa yine dolu açılır) */
async function seedDefaultExchangeRates(): Promise<boolean> {
  try {
    await pool.execute(
      `INSERT INTO exchange_rates (currency_code, currency_name, rate_to_try, source, last_updated, created_at)
       VALUES ('TRY', 'Türk Lirası', 1.0000, 'manual', NOW(), NOW()),
              ('USD', 'Amerikan Doları', 34.5000, 'manual', NOW(), NOW()),
              ('EUR', 'Euro', 37.5000, 'manual', NOW(), NOW())
       ON DUPLICATE KEY UPDATE currency_name = VALUES(currency_name), rate_to_try = VALUES(rate_to_try), source = VALUES(source), last_updated = NOW()`
    )
    return true
  } catch {
    try {
      await pool.execute(
        `INSERT INTO exchange_rates (currency_code, rate_to_try, source) VALUES ('TRY', 1.0000, 'manual'), ('USD', 34.5000, 'manual'), ('EUR', 37.5000, 'manual')`
      )
      return true
    } catch {
      return false
    }
  }
}

/** Satırı sayfanın beklediği forma getirir (currency_name / last_updated eksikse doldurur) */
function normalizeRate(row: any): any {
  const code = row.currency_code
  return {
    id: row.id,
    currency_code: code,
    currency_name: row.currency_name ?? DEFAULT_CURRENCY_NAMES[code] ?? code,
    rate_to_try: Number(row.rate_to_try),
    source: row.source ?? 'manual',
    last_updated: row.last_updated ?? row.updated_at ?? row.created_at ?? new Date().toISOString()
  }
}

export async function GET() {
  try {
    let [rows] = await pool.execute<any[]>(
      'SELECT * FROM exchange_rates ORDER BY currency_code'
    )

    const needed = ['TRY', 'USD', 'EUR']
    const hasAll = needed.every((code) => rows.some((r: any) => r.currency_code === code))

    if (rows.length === 0 || !hasAll) {
      const seeded = await seedDefaultExchangeRates()
      if (seeded) {
        const [refetched] = await pool.execute<any[]>(
          'SELECT * FROM exchange_rates ORDER BY currency_code'
        )
        rows = refetched
      }
    }

    const rates = Array.isArray(rows) ? rows.map(normalizeRate) : []

    return NextResponse.json({
      success: true,
      rates
    })
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    return NextResponse.json(
      { success: false, error: 'Kurlar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { rates } = body

    if (!rates || !Array.isArray(rates)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veri formatı' },
        { status: 400 }
      )
    }

    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()

      for (const rate of rates) {
        if (!rate.currency_code || !rate.rate_to_try) {
          continue
        }

        await connection.execute(
          `UPDATE exchange_rates 
           SET rate_to_try = ?, source = 'manual', last_updated = CURRENT_TIMESTAMP
           WHERE currency_code = ?`,
          [rate.rate_to_try, rate.currency_code]
        )
      }

      await connection.commit()

      return NextResponse.json({
        success: true,
        message: 'Kurlar başarıyla güncellendi'
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error updating exchange rates:', error)
    return NextResponse.json(
      { success: false, error: 'Kurlar güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}
