const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

// .env.local veya .env yükle
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') })
require('dotenv').config({ path: path.join(process.cwd(), '.env') })

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'form_wizard',
  port: Number(process.env.DB_PORT) || 3306,
  multipleStatements: true,
}

async function run() {
  let connection
  try {
    const sqlPath = path.join(process.cwd(), 'migrations', '018_kvkk_consent.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    console.log('🔄 Migration 018 (KVKK consent) çalıştırılıyor...')
    connection = await mysql.createConnection(dbConfig)
    await connection.query(sql)
    console.log('✅ Migration 018 başarıyla tamamlandı.')
  } catch (err) {
    console.error('❌ Migration hatası:', err.message)
    process.exit(1)
  } finally {
    if (connection) await connection.end()
  }
}

run()
