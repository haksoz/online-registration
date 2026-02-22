-- Döviz kurları tablosu: eksik kolonları ekle, TRY/USD/EUR varsayılanlarını ekle.
-- Veritabanı sıfırlandığında bu migration çalıştırıldığında kurlar tekrar oluşur.

-- 1) Eksik kolonları ekle (eski railway-migration şeması için)
-- currency_name yoksa ekle
SET @db = DATABASE();
SET @add_name = (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'exchange_rates' AND COLUMN_NAME = 'currency_name');
SET @sql = IF(@add_name = 0, 
  'ALTER TABLE exchange_rates ADD COLUMN currency_name VARCHAR(50) NOT NULL DEFAULT "" AFTER currency_code', 
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- last_updated yoksa ekle (source veya updated_at sonrası)
SET @add_updated = (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'exchange_rates' AND COLUMN_NAME = 'last_updated');
SET @sql2 = IF(@add_updated = 0, 
  'ALTER TABLE exchange_rates ADD COLUMN last_updated TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 
  'SELECT 1');
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- 2) Tek kur per para birimi: unique_currency_date varsa kaldır, unique_currency ekle
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS 
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'exchange_rates' AND INDEX_NAME = 'unique_currency_date');
SET @sql3 = IF(@idx_exists > 0, 
  'ALTER TABLE exchange_rates DROP INDEX unique_currency_date', 
  'SELECT 1');
PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

SET @idx_curr = (SELECT COUNT(*) FROM information_schema.STATISTICS 
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'exchange_rates' AND INDEX_NAME = 'unique_currency');
SET @sql4 = IF(@idx_curr = 0, 
  'ALTER TABLE exchange_rates ADD UNIQUE KEY unique_currency (currency_code)', 
  'SELECT 1');
PREPARE stmt4 FROM @sql4;
EXECUTE stmt4;
DEALLOCATE PREPARE stmt4;

-- 3) TRY, USD, EUR varsayılan kayıtları (yoksa ekle, varsa güncelleme)
INSERT INTO exchange_rates (currency_code, currency_name, rate_to_try, source, last_updated, created_at)
VALUES 
  ('TRY', 'Türk Lirası', 1.0000, 'manual', NOW(), NOW()),
  ('USD', 'Amerikan Doları', 34.5000, 'manual', NOW(), NOW()),
  ('EUR', 'Euro', 37.5000, 'manual', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  currency_name = VALUES(currency_name),
  rate_to_try = VALUES(rate_to_try),
  source = VALUES(source),
  last_updated = NOW();
