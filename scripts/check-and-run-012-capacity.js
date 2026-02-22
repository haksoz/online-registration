/**
 * Migration 012 kontrolü ve uygulaması (Kontenjan takibi).
 * Çalıştırma: node scripts/check-and-run-012-capacity.js
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

    const catTrack = await columnExists(connection, 'registration_categories', 'track_capacity')
    const typeCapacity = await columnExists(connection, 'registration_types', 'capacity')
    const typeCurrent = await columnExists(connection, 'registration_types', 'current_registrations')

    if (catTrack && typeCapacity && typeCurrent) {
      console.log('✅ Migration 012 zaten uygulanmış (track_capacity, capacity, current_registrations mevcut).')
      return
    }

    console.log('🔄 Migration 012 uygulanıyor...')

    if (!catTrack) {
      await connection.execute(`
        ALTER TABLE registration_categories
        ADD COLUMN track_capacity TINYINT(1) NOT NULL DEFAULT 0
      `)
      console.log('  ✅ registration_categories.track_capacity eklendi')
    } else {
      console.log('  ℹ️ track_capacity zaten var')
    }

    if (!typeCapacity) {
      await connection.execute(`
        ALTER TABLE registration_types
        ADD COLUMN capacity INT NULL
      `)
      console.log('  ✅ registration_types.capacity eklendi')
    } else {
      console.log('  ℹ️ capacity zaten var')
    }

    if (!typeCurrent) {
      await connection.execute(`
        ALTER TABLE registration_types
        ADD COLUMN current_registrations INT NOT NULL DEFAULT 0
      `)
      console.log('  ✅ registration_types.current_registrations eklendi')
    } else {
      console.log('  ℹ️ current_registrations zaten var')
    }

    // current_registrations ilk doldurma (is_cancelled = 0 seçimler)
    await connection.execute(`
      UPDATE registration_types rt
      SET current_registrations = (
        SELECT COUNT(*)
        FROM registration_selections rs
        WHERE rs.registration_type_id = rt.id AND rs.is_cancelled = 0
      )
    `)
    console.log('  ✅ current_registrations güncellendi (mevcut seçimlere göre)')

    console.log('\n🎉 Migration 012 başarıyla tamamlandı.')
  } catch (err) {
    console.error('❌ Hata:', err.message)
    process.exit(1)
  } finally {
    if (connection) await connection.end()
  }
}

main()
