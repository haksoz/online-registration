const mysql = require('mysql2/promise')
require('dotenv').config({ path: '.env.local' })

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}

async function migrateBankSettings() {
  let connection
  
  try {
    console.log('🔄 Banka hesapları ve ödeme ayarları tabloları oluşturuluyor...')
    
    connection = await mysql.createConnection(dbConfig)
    
    // Banka hesapları tablosunu oluştur
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        account_name VARCHAR(100) NOT NULL,
        bank_name VARCHAR(100) NOT NULL,
        account_holder VARCHAR(255) NOT NULL,
        iban VARCHAR(34) NOT NULL,
        currency VARCHAR(3) DEFAULT 'TRY',
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    
    console.log('✅ bank_accounts tablosu oluşturuldu')
    
    // Ödeme ayarları tablosunu oluştur
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payment_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(50) UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    
    console.log('✅ payment_settings tablosu oluşturuldu')
    
    // Varsayılan banka hesabını ekle
    await connection.execute(`
      INSERT INTO bank_accounts (account_name, bank_name, account_holder, iban, currency, description, is_active, display_order) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
    `, [
      'Ana Hesap (TRY)',
      'Enpara Bank A.Ş.',
      'Kapital Online Bilgisayar Ve İletişim Hizmetleri Tic.Ltd.Şti',
      'TR86 0015 7000 0000 0066 6455 24',
      'TRY',
      'Türk Lirası kayıt ödemeleri için ana hesap',
      true,
      1
    ])
    
    console.log('✅ Varsayılan banka hesabı eklendi')
    
    // Varsayılan ödeme ayarlarını ekle
    const paymentSettings = [
      ['dekont_email', 'dekont@ko.com.tr', 'Dekont gönderilecek e-posta adresi'],
      ['dekont_message', 'Lütfen dekontunuzu {email} adresine iletiniz.', 'Dekont mesajı']
    ]
    
    for (const [key, value, description] of paymentSettings) {
      await connection.execute(`
        INSERT INTO payment_settings (setting_key, setting_value, description) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
        setting_value = VALUES(setting_value),
        updated_at = CURRENT_TIMESTAMP
      `, [key, value, description])
    }
    
    console.log('✅ Varsayılan ödeme ayarları eklendi')
    
    // Mevcut verileri göster
    const [accounts] = await connection.execute('SELECT * FROM bank_accounts ORDER BY display_order, id')
    console.log('\n🏦 Mevcut banka hesapları:')
    accounts.forEach(account => {
      console.log(`  ${account.account_name} (${account.currency}) - ${account.is_active ? 'Aktif' : 'Pasif'}`)
      console.log(`    ${account.bank_name} - ${account.iban}`)
    })
    
    const [settings] = await connection.execute('SELECT * FROM payment_settings ORDER BY setting_key')
    console.log('\n⚙️ Ödeme ayarları:')
    settings.forEach(setting => {
      console.log(`  ${setting.setting_key}: ${setting.setting_value}`)
    })
    
    console.log('\n🎉 Banka ayarları migration tamamlandı!')
    console.log('👉 Admin panelinden banka hesaplarını yönetebilirsiniz: /admin/settings/bank')
    
  } catch (error) {
    console.error('❌ Migration hatası:', error)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

migrateBankSettings()