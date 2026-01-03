#!/usr/bin/env node

/**
 * Local MySQL veritabanından export script
 * Node.js ile MySQL bağlantısı kullanarak export yapar
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Local MySQL bilgileri (.env'den okunabilir veya varsayılan)
const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'form_wizard'
};

async function exportDatabase() {
  console.log('💾 Local MySQL veritabanından export ediliyor...');
  console.log(`📡 Veritabanına bağlanılıyor: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  console.log(`📦 Veritabanı: ${DB_CONFIG.database}`);
  console.log(`👤 Kullanıcı: ${DB_CONFIG.user}`);
  console.log('');

  let connection;
  let exportFile;

  try {
    // Veritabanına bağlan
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Veritabanına bağlanıldı');

    // Tüm tabloları al
    const [tables] = await connection.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_type = 'BASE TABLE' ORDER BY table_name",
      [DB_CONFIG.database]
    );

    if (tables.length === 0) {
      console.log('⚠️  Veritabanında tablo bulunamadı!');
      console.log('💡 Veritabanı adını kontrol edin: ' + DB_CONFIG.database);
      process.exit(1);
    }

    console.log(`📋 ${tables.length} tablo bulundu:`);
    tables.forEach((table, index) => {
      const tableName = table.TABLE_NAME || table.table_name;
      console.log(`   ${index + 1}. ${tableName}`);
    });
    console.log('');

    // Export dosya adı
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const exportFileName = `local_db_export_${timestamp}.sql`;
    exportFile = path.join(process.cwd(), exportFileName);

    // SQL başlığı
    let sql = `-- MySQL dump for Local Database
-- Database: ${DB_CONFIG.database}
-- Export Date: ${new Date().toISOString()}
-- Host: ${DB_CONFIG.host}:${DB_CONFIG.port}
-- 
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

`;

    let totalRows = 0;

    // Her tablo için
    for (const table of tables) {
      const tableName = table.TABLE_NAME || table.table_name;
      console.log(`📄 Exporting table: ${tableName}...`);

      // Tablo yapısını al
      const [createTable] = await connection.query(
        `SHOW CREATE TABLE \`${tableName}\``
      );
      
      if (createTable && createTable[0]) {
        const createStatement = createTable[0]['Create Table'] || createTable[0]['Create Table'];
        sql += `\n-- --------------------------------------------------------\n`;
        sql += `-- Table structure for table \`${tableName}\`\n`;
        sql += `-- --------------------------------------------------------\n\n`;
        sql += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
        sql += `${createStatement};\n\n`;
      }

      // Tablo verilerini al
      const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);
      totalRows += rows.length;
      
      if (rows.length > 0) {
        sql += `-- --------------------------------------------------------\n`;
        sql += `-- Dumping data for table \`${tableName}\`\n`;
        sql += `-- --------------------------------------------------------\n\n`;
        sql += `LOCK TABLES \`${tableName}\` WRITE;\n`;
        sql += `/*!40000 ALTER TABLE \`${tableName}\` DISABLE KEYS */;\n`;

        // Her satır için INSERT statement oluştur
        for (const row of rows) {
          const columns = Object.keys(row);
          const values = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'number') return value;
            if (typeof value === 'boolean') return value ? 1 : 0;
            // String değerleri escape et
            return connection.escape(value);
          });
          
          sql += `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${values.join(', ')});\n`;
        }

        sql += `/*!40000 ALTER TABLE \`${tableName}\` ENABLE KEYS */;\n`;
        sql += `UNLOCK TABLES;\n\n`;
        console.log(`   ✅ ${rows.length} kayıt export edildi`);
      } else {
        console.log(`   ℹ️  Tablo boş (0 kayıt)`);
      }
    }

    sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

    // Dosyaya yaz
    fs.writeFileSync(exportFile, sql, 'utf8');

    // İstatistikler
    const fileSize = fs.statSync(exportFile).size;
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
    const fileSizeKB = (fileSize / 1024).toFixed(2);
    const tableCount = tables.length;
    const insertCount = (sql.match(/INSERT INTO/g) || []).length;

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Export başarılı!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📦 Dosya: ${exportFileName}`);
    if (fileSize < 1024 * 1024) {
      console.log(`📊 Dosya boyutu: ${fileSizeKB} KB`);
    } else {
      console.log(`📊 Dosya boyutu: ${fileSizeMB} MB`);
    }
    console.log(`📋 Tablolar: ${tableCount}`);
    console.log(`📝 Toplam kayıt: ${totalRows}`);
    console.log(`📁 Tam yol: ${exportFile}`);
    console.log('═══════════════════════════════════════════════════════');

  } catch (error) {
    console.error('');
    console.error('❌ Export başarısız!');
    console.error('Hata:', error.message);
    if (error.code) {
      console.error('Hata kodu:', error.code);
    }
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('');
      console.error('💡 Çözüm önerileri:');
      console.error('   1. MySQL kullanıcı adı ve şifresini kontrol edin');
      console.error('   2. .env dosyasındaki DB_USER ve DB_PASSWORD değerlerini kontrol edin');
      console.error('   3. MySQL servisinin çalıştığından emin olun');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('');
      console.error('💡 Çözüm önerileri:');
      console.error(`   1. '${DB_CONFIG.database}' veritabanının var olduğundan emin olun`);
      console.error('   2. .env dosyasındaki DB_NAME değerini kontrol edin');
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

