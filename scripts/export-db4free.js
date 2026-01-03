#!/usr/bin/env node

/**
 * db4free.net veritabanından export script
 * Node.js ile MySQL bağlantısı kullanarak export yapar
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// db4free.net bilgileri
const DB_CONFIG = {
  host: 'db4free.net',
  port: 3306,
  user: 'form_wizard_user',
  password: 'FfXeX3!QRD79wF',
  database: 'test_form_wizard'
};

async function exportDatabase() {
  console.log('💾 db4free.net veritabanından export ediliyor...');
  console.log(`📡 Veritabanına bağlanılıyor: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  console.log(`📦 Veritabanı: ${DB_CONFIG.database}`);
  console.log('');

  let connection;
  let exportFile;

  try {
    // Veritabanına bağlan
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Veritabanına bağlanıldı');

    // Tüm tabloları al
    const [tables] = await connection.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = ?",
      [DB_CONFIG.database]
    );

    console.log(`📋 ${tables.length} tablo bulundu`);
    console.log('');

    // Export dosya adı
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const exportFileName = `db4free_export_${timestamp}.sql`;
    exportFile = path.join(process.cwd(), exportFileName);

    // SQL başlığı
    let sql = `-- MySQL dump for db4free.net
-- Database: ${DB_CONFIG.database}
-- Export Date: ${new Date().toISOString()}
-- 
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

`;

    // Her tablo için
    for (const table of tables) {
      const tableName = table.TABLE_NAME || table.table_name;
      console.log(`📄 Exporting table: ${tableName}`);

      // Tablo yapısını al
      const [createTable] = await connection.query(
        `SHOW CREATE TABLE \`${tableName}\``
      );
      
      if (createTable && createTable[0]) {
        const createStatement = createTable[0]['Create Table'] || createTable[0]['Create Table'];
        sql += `\n-- Table structure for table \`${tableName}\`\n`;
        sql += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
        sql += `${createStatement};\n\n`;
      }

      // Tablo verilerini al
      const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);
      
      if (rows.length > 0) {
        sql += `-- Dumping data for table \`${tableName}\`\n`;
        sql += `LOCK TABLES \`${tableName}\` WRITE;\n`;
        sql += `/*!40000 ALTER TABLE \`${tableName}\` DISABLE KEYS */;\n`;

        // Her satır için INSERT statement oluştur
        for (const row of rows) {
          const columns = Object.keys(row);
          const values = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'number') return value;
            // String değerleri escape et
            return connection.escape(value);
          });
          
          sql += `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${values.join(', ')});\n`;
        }

        sql += `/*!40000 ALTER TABLE \`${tableName}\` ENABLE KEYS */;\n`;
        sql += `UNLOCK TABLES;\n\n`;
      }
    }

    sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

    // Dosyaya yaz
    fs.writeFileSync(exportFile, sql, 'utf8');

    // İstatistikler
    const fileSize = fs.statSync(exportFile).size;
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
    const tableCount = tables.length;
    const insertCount = (sql.match(/INSERT INTO/g) || []).length;

    console.log('');
    console.log('✅ Export başarılı!');
    console.log(`📦 Dosya: ${exportFileName}`);
    console.log(`📊 Dosya boyutu: ${fileSizeMB} MB`);
    console.log(`📋 Tablolar: ${tableCount}`);
    console.log(`📝 INSERT statements: ${insertCount}`);
    console.log(`📁 Tam yol: ${exportFile}`);

  } catch (error) {
    console.error('❌ Export başarısız!');
    console.error('Hata:', error.message);
    if (error.code) {
      console.error('Hata kodu:', error.code);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Script'i çalıştır
exportDatabase().catch(console.error);

