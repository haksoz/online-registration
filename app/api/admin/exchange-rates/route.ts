import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM exchange_rates ORDER BY currency_code'
    )

    return NextResponse.json({
      success: true,
      rates: rows
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
