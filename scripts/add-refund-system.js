const mysql = require('mysql2/promise')
require('dotenv').config({ path: '.env.local' })

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}

async function addRefundSystem() {
  let connection
  
  try {
    console.log('🔄 İade sistemi alanları ekleniyor...')
    
    connection = await mysql.createConnection(dbConfig)
    
    // İade sistemi alanlarını ekle (önce kontrol et)
    const refundColumns = [
      { name: 'refund_status', sql: "ADD COLUMN refund_status ENUM('none', 'pending', 'completed', 'rejected') DEFAULT 'none'" },
      { name: 'refund_amount', sql: "ADD COLUMN refund_amount DECIMAL(10,2) NULL" },
      { name: 'refund_date', sql: "ADD COLUMN refund_date DATETIME NULL" },
      { name: 'refund_notes', sql: "ADD COLUMN refund_notes TEXT NULL" },
      { name: 'refund_method', sql: "ADD COLUMN refund_method VARCHAR(50) NULL" },
      { name: 'cancelled_at', sql: "ADD COLUMN cancelled_at DATETIME NULL" },
      { name: 'cancelled_by', sql: "ADD COLUMN cancelled_by INT NULL" }
    ]
    
    for (const column of refundColumns) {
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
    
    console.log('\n🎉 İade sistemi migration tamamlandı!')
    console.log('💰 İade Durumları:')
    console.log('  none = İade yok')
    console.log('  pending = İade beklemede') 
    console.log('  completed = İade tamamlandı')
    console.log('  rejected = İade reddedildi')
    
  } catch (error) {
    console.error('❌ Migration hatası:', error)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

addRefundSystem()