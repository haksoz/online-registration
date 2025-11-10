const mysql = require('mysql2/promise')
require('dotenv').config({ path: '.env.local' })

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}

async function migratePageSettings() {
  let connection
  
  try {
    console.log('🔄 Sayfa ayarları tablosu oluşturuluyor...')
    
    connection = await mysql.createConnection(dbConfig)
    
    // Tabloyu oluştur
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS page_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(50) UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    
    console.log('✅ page_settings tablosu oluşturuldu')
    
    // Varsayılan sayfa ayarlarını ekle
    const defaultSettings = [
      ['form_title', 'Hoş Geldiniz! 👋', 'Sayfa ana başlığı'],
      ['form_subtitle', 'Kayıt formunu doldurmak için aşağıdaki adımları takip edin.', 'Sayfa alt başlığı'],
      ['form_welcome_message', 'Kayıt işleminizi tamamlamak için lütfen tüm alanları eksiksiz doldurun.', 'Karşılama mesajı'],
      ['organization_name', 'Online Kayıt Sistemi', 'Organizasyon adı'],
      ['contact_email', 'info@example.com', 'İletişim e-posta adresi'],
      ['contact_phone', '+90 (212) 123 45 67', 'İletişim telefon numarası'],
      ['homepage_url', 'https://example.com', 'Anasayfa URL adresi']
    ]
    
    for (const [key, value, description] of defaultSettings) {
      await connection.execute(`
        INSERT INTO page_settings (setting_key, setting_value, description) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
        setting_value = VALUES(setting_value),
        updated_at = CURRENT_TIMESTAMP
      `, [key, value, description])
    }
    
    console.log('✅ Varsayılan sayfa ayarları eklendi')
    
    // Mevcut verileri göster
    const [rows] = await connection.execute('SELECT * FROM page_settings ORDER BY setting_key')
    console.log('\n📋 Mevcut sayfa ayarları:')
    rows.forEach(row => {
      console.log(`  ${row.setting_key}: ${row.setting_value}`)
    })
    
    console.log('\n🎉 Sayfa ayarları migration tamamlandı!')
    console.log('👉 Admin panelinden sayfa ayarlarını yönetebilirsiniz: /admin/settings/page')
    
  } catch (error) {
    console.error('❌ Migration hatası:', error)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

migratePageSettings()