/**
 * Migration 012 ve 013 uygulaması.
 * Çalıştırma: node scripts/run-migrations-012-013.js
 * .env veya .env.local gerekli (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).
 */
const mysql = require('mysql2/promise')
const path = require('path')
const fs = require('fs')

function loadEnv() {
  for (const p of ['.env.local', '.env']) {
    const full = path.join(process.cwd(), p)
    if (fs.existsSync(full)) {
      require('dotenv').config({ path: full })
      return
    }
  }
  require('dotenv').config()
}

loadEnv()

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'form_wizard',
  port: Number(process.env.DB_PORT) || 3306,
}

async function columnExists(connection, table, column) {
  const [rows] = await connection.execute(
    `SELECT 1 FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [dbConfig.database, table, column]
  )
  return (rows && rows.length) > 0
}

async function main() {
  let connection
  try {
    connection = await mysql.createConnection(dbConfig)
    console.log('📡 Veritabanına bağlanıldı:', dbConfig.database)

    // --- Migration 012 ---
    const catTrack = await columnExists(connection, 'registration_categories', 'track_capacity')
    const typeCapacity = await columnExists(connection, 'registration_types', 'capacity')
    const typeCurrent = await columnExists(connection, 'registration_types', 'current_registrations')

    if (catTrack && typeCapacity && typeCurrent) {
      console.log('✅ Migration 012 zaten uygulanmış.')
    } else {
      console.log('🔄 Migration 012 uygulanıyor...')
      if (!catTrack) {
        await connection.execute(`
          ALTER TABLE registration_categories
          ADD COLUMN track_capacity TINYINT(1) NOT NULL DEFAULT 0
        `)
        console.log('  ✅ registration_categories.track_capacity eklendi')
      }
      if (!typeCapacity) {
        await connection.execute(`
          ALTER TABLE registration_types ADD COLUMN capacity INT NULL
        `)
        console.log('  ✅ registration_types.capacity eklendi')
      }
      if (!typeCurrent) {
        await connection.execute(`
          ALTER TABLE registration_types ADD COLUMN current_registrations INT NOT NULL DEFAULT 0
        `)
        console.log('  ✅ registration_types.current_registrations eklendi')
      }
      await connection.execute(`
        UPDATE registration_types rt
        SET current_registrations = (
          SELECT COUNT(*) FROM registration_selections rs
          WHERE rs.registration_type_id = rt.id AND rs.is_cancelled = 0
        )
      `)
      console.log('  ✅ current_registrations güncellendi')
      console.log('🎉 Migration 012 tamamlandı.')
    }

    // --- Migration 013 ---
    const hasRegStart = await columnExists(connection, 'registration_categories', 'registration_start_date')
    if (hasRegStart) {
      console.log('✅ Migration 013 zaten uygulanmış.')
    } else {
      console.log('🔄 Migration 013 uygulanıyor...')
      await connection.execute(`
        ALTER TABLE registration_categories
        ADD COLUMN registration_start_date DATETIME NULL COMMENT 'Kayıt başlangıç (boş = hemen açık)',
        ADD COLUMN registration_end_date DATETIME NULL COMMENT 'Kayıt son (boş = sınırsız)',
        ADD COLUMN cancellation_deadline DATETIME NULL COMMENT 'İptal son (boş = sınırsız)',
        ADD COLUMN early_bird_deadline DATETIME NULL COMMENT 'Erken kayıt bitiş',
        ADD COLUMN early_bird_enabled TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Erken kayıt aktif mi?'
      `)
      console.log('  ✅ registration_categories: kayıt tarihi alanları eklendi')
      console.log('🎉 Migration 013 tamamlandı.')
    }

    // --- Migration 014: registration_types value/label/label_en genişlet ---
    const [colRows] = await connection.execute(
      `SELECT CHARACTER_MAXIMUM_LENGTH FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'registration_types' AND COLUMN_NAME = 'label'`,
      [dbConfig.database]
    )
    const labelLen = colRows && colRows[0] ? Number(colRows[0].CHARACTER_MAXIMUM_LENGTH) : 0
    if (labelLen >= 255) {
      console.log('✅ Migration 014 zaten uygulanmış (label 255+).')
    } else {
      console.log('🔄 Migration 014 uygulanıyor (kayıt türü ad/value uzunlukları)...')
      await connection.execute(`
        ALTER TABLE registration_types
        MODIFY COLUMN value VARCHAR(150) NOT NULL COMMENT 'Teknik ID (slug)',
        MODIFY COLUMN label VARCHAR(255) NOT NULL COMMENT 'Türkçe ad',
        MODIFY COLUMN label_en VARCHAR(255) DEFAULT NULL COMMENT 'İngilizce ad'
      `)
      console.log('  ✅ registration_types: value 150, label/label_en 255 karakter')
      console.log('🎉 Migration 014 tamamlandı.')
    }

    // --- Migration 015: value 255 (label ile aynı) ---
    const [valueColRows] = await connection.execute(
      `SELECT CHARACTER_MAXIMUM_LENGTH FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'registration_types' AND COLUMN_NAME = 'value'`,
      [dbConfig.database]
    )
    const valueLen = valueColRows && valueColRows[0] ? Number(valueColRows[0].CHARACTER_MAXIMUM_LENGTH) : 0
    if (valueLen >= 255) {
      console.log('✅ Migration 015 zaten uygulanmış (value 255+).')
    } else {
      console.log('🔄 Migration 015 uygulanıyor (Teknik ID 255 karakter)...')
      await connection.execute(`
        ALTER TABLE registration_types
        MODIFY COLUMN value VARCHAR(255) NOT NULL COMMENT 'Teknik ID (slug)'
      `)
      console.log('  ✅ registration_types.value: 255 karakter (label ile aynı)')
      console.log('🎉 Migration 015 tamamlandı.')
    }

    console.log('\n✅ Tüm migration\'lar güncel.')
  } catch (err) {
    console.error('❌ Hata:', err.message)
    process.exit(1)
  } finally {
    if (connection) await connection.end()
  }
}

main()
