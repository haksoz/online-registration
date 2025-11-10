import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST() {
  try {
    // TCMB XML API'sinden kur verilerini çek
    const response = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml')
    
    if (!response.ok) {
      throw new Error('TCMB API yanıt vermedi')
    }

    const xmlData = await response.text()

    // XML'i regex ile parse et
    let usdRate = 0
    let eurRate = 0

    console.log('XML Data sample:', xmlData.substring(0, 500))

    // USD kuru için regex
    const usdMatch = xmlData.match(/<Currency[^>]*CurrencyCode="USD"[^>]*>[\s\S]*?<ForexSelling>([\d.,]+)<\/ForexSelling>/)
    console.log('USD Match:', usdMatch)
    if (usdMatch && usdMatch[1]) {
      usdRate = parseFloat(usdMatch[1].replace(',', '.'))
    }

    // EUR kuru için regex
    const eurMatch = xmlData.match(/<Currency[^>]*CurrencyCode="EUR"[^>]*>[\s\S]*?<ForexSelling>([\d.,]+)<\/ForexSelling>/)
    console.log('EUR Match:', eurMatch)
    if (eurMatch && eurMatch[1]) {
      eurRate = parseFloat(eurMatch[1].replace(',', '.'))
    }

    console.log('Parsed rates:', { USD: usdRate, EUR: eurRate })
    const rates = { USD: usdRate, EUR: eurRate }

    if (!rates.USD || !rates.EUR) {
      throw new Error('Kur verileri alınamadı')
    }

    // Veritabanını güncelle
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()

      console.log('Updating USD rate:', rates.USD)
      const [usdResult] = await connection.execute(
        `UPDATE exchange_rates 
         SET rate_to_try = ?, source = 'tcmb', last_updated = CURRENT_TIMESTAMP
         WHERE currency_code = 'USD'`,
        [rates.USD]
      )
      console.log('USD update result:', usdResult)

      console.log('Updating EUR rate:', rates.EUR)
      const [eurResult] = await connection.execute(
        `UPDATE exchange_rates 
         SET rate_to_try = ?, source = 'tcmb', last_updated = CURRENT_TIMESTAMP
         WHERE currency_code = 'EUR'`,
        [rates.EUR]
      )
      console.log('EUR update result:', eurResult)

      await connection.commit()
      console.log('Transaction committed successfully')

      return NextResponse.json({
        success: true,
        message: 'TCMB kurları başarıyla güncellendi',
        rates: {
          USD: rates.USD,
          EUR: rates.EUR
        }
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error fetching TCMB rates:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'TCMB kurları çekilirken hata oluştu' 
      },
      { status: 500 }
    )
  }
}
