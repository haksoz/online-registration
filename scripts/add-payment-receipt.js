const mysql = require('mysql2/promise')
require('dotenv').config({ path: '.env.local' })

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}

async function addPaymentReceipt() {
  let connection
  
  try {
    console.log('🔄 Dekont sistemi alanları ekleniyor...')
    
    connection = await mysql.createConnection(dbConfig)
    
    // Dekont sistemi alanlarını ekle
    const receiptColumns = [
      { name: 'payment_receipt_url', sql: "ADD COLUMN payment_receipt_url VARCHAR(500) NULL" },
      { name: 'payment_receipt_filename', sql: "ADD COLUMN payment_receipt_filename VARCHAR(255) NULL" },
      { name: 'payment_receipt_uploaded_at', sql: "ADD COLUMN payment_receipt_uploaded_at DATETIME NULL" },
      { name: 'payment_receipt_uploaded_by', sql: "ADD COLUMN payment_receipt_uploaded_by INT NULL" },
      { name: 'payment_confirmed_at', sql: "ADD COLUMN payment_confirmed_at DATETIME NULL" },
      { name: 'payment_confirmed_by', sql: "ADD COLUMN payment_confirmed_by INT NULL" },
      { name: 'payment_notes', sql: "ADD COLUMN payment_notes TEXT NULL" }
    ]
    
    for (const column of receiptColumns) {
      try {
        // Önce alanın var olup olmadığını kontrol et
        const [existingColumns] = await connection.execute(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'registrations' 
          AND COLUMN_NAME = ?
        `, [column.name])
        
        if (existingColumns.length === 0) {
          await connection.execute(`ALTER TABLE registrations ${column.sql}`)
          console.log(`✅ ${column.name} alanı eklendi`)
        } else {
          console.log(`ℹ️ ${column.name} alanı zaten mevcut`)
        }
      } catch (error) {
        console.error(`❌ ${column.name} eklenirken hata:`, error.message)
      }
    }
    
    console.log('\n🎉 Dekont sistemi migration tamamlandı!')
    console.log('📄 Dekont Alanları:')
    console.log('  payment_receipt_url = Dekont dosya URL\'si')
    console.log('  payment_receipt_filename = Dekont dosya adı')
    console.log('  payment_receipt_uploaded_at = Yüklenme tarihi')
    console.log('  payment_receipt_uploaded_by = Yükleyen admin ID')
    console.log('  payment_confirmed_at = Tahsilat onay tarihi')
    console.log('  payment_confirmed_by = Onaylayan admin ID')
    console.log('  payment_notes = Tahsilat açıklaması')
    
  } catch (error) {
    console.error('❌ Migration hatası:', error)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

addPaymentReceipt()