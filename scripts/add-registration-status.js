const mysql = require('mysql2/promise')
require('dotenv').config({ path: '.env.local' })

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}

async function addRegistrationStatus() {
  let connection
  
  try {
    console.log('🔄 Registrations tablosuna status alanı ekleniyor...')
    
    connection = await mysql.createConnection(dbConfig)
    
    // Status alanını ekle (önce kontrol et)
    const [existingColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'registrations' 
      AND COLUMN_NAME = 'status'
    `)
    
    if (existingColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE registrations 
        ADD COLUMN status TINYINT DEFAULT 1 
        COMMENT '1=Aktif, 0=İptal Edildi, -1=Silinmiş'
      `)
      console.log('✅ Status alanı eklendi')
    } else {
      console.log('ℹ️ Status alanı zaten mevcut')
    }
    
    // Mevcut kayıtları aktif olarak işaretle
    await connection.execute(`
      UPDATE registrations 
      SET status = 1 
      WHERE status IS NULL
    `)
    
    console.log('✅ Mevcut kayıtlar aktif olarak işaretlendi')
    
    // Tablo yapısını göster
    const [columns] = await connection.execute('DESCRIBE registrations')
    console.log('\n📋 Güncellenmiş tablo yapısı:')
    columns.forEach(col => {
      if (col.Field === 'status') {
        console.log(`  ✨ ${col.Field}: ${col.Type} (${col.Default}) - ${col.Comment}`)
      }
    })
    
    console.log('\n🎉 Registration status migration tamamlandı!')
    console.log('📊 Status değerleri:')
    console.log('  1 = Aktif kayıt')
    console.log('  0 = İptal edilmiş kayıt')
    console.log(' -1 = Silinmiş kayıt (soft delete)')
    
  } catch (error) {
    console.error('❌ Migration hatası:', error)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

addRegistrationStatus()