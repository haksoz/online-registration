-- Migration: Add registration_selections table for multi-category support
-- Date: 2024-11-22

-- 1. Create registration_selections table
CREATE TABLE IF NOT EXISTS registration_selections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  registration_id INT NOT NULL,
  registration_type_id INT NOT NULL,
  category_id INT NOT NULL COMMENT 'Hangi kategoriden seçildi',
  applied_fee_try DECIMAL(10,2) NOT NULL COMMENT 'Uygulanmış TL fiyatı',
  applied_currency VARCHAR(3) DEFAULT 'TRY',
  applied_fee_amount DECIMAL(10,2) NOT NULL COMMENT 'Seçilen para birimindeki fiyat',
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1.0000 COMMENT 'Kayıt anındaki kur',
  vat_rate DECIMAL(5,4) NOT NULL DEFAULT 0.2000 COMMENT '0.20 = %20 KDV',
  vat_amount_try DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'KDV tutarı TL',
  total_try DECIMAL(10,2) NOT NULL COMMENT 'KDV dahil toplam TL',
  is_early_bird BOOLEAN DEFAULT FALSE COMMENT 'Erken kayıt uygulandı mı?',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  FOREIGN KEY (registration_type_id) REFERENCES registration_types(id) ON DELETE RESTRICT,
  FOREIGN KEY (category_id) REFERENCES registration_categories(id) ON DELETE RESTRICT,
  INDEX idx_registration (registration_id),
  INDEX idx_type (registration_type_id),
  INDEX idx_category (category_id),
  INDEX idx_early_bird (is_early_bird)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Add currency field to registrations table (ignore if exists)
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registrations' AND COLUMN_NAME = 'currency');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE registrations ADD COLUMN currency VARCHAR(3) DEFAULT ''TRY'' COMMENT ''Seçilen para birimi'' AFTER fee', 'SELECT ''Column currency already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Add total_fee field to registrations table (ignore if exists)
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registrations' AND COLUMN_NAME = 'total_fee');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE registrations ADD COLUMN total_fee DECIMAL(10,2) DEFAULT 0 COMMENT ''Tüm seçimlerin toplamı'' AFTER currency', 'SELECT ''Column total_fee already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Add vat_amount field to registrations table (ignore if exists)
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registrations' AND COLUMN_NAME = 'vat_amount');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE registrations ADD COLUMN vat_amount DECIMAL(10,2) DEFAULT 0 COMMENT ''Toplam KDV tutarı'' AFTER total_fee', 'SELECT ''Column vat_amount already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Add grand_total field to registrations table (ignore if exists)
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registrations' AND COLUMN_NAME = 'grand_total');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE registrations ADD COLUMN grand_total DECIMAL(10,2) DEFAULT 0 COMMENT ''KDV dahil genel toplam'' AFTER vat_amount', 'SELECT ''Column grand_total already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Migrate existing registrations to new structure (if any exist)
-- This will create a selection record for each existing registration
INSERT INTO registration_selections 
  (registration_id, registration_type_id, category_id, applied_fee_try, applied_currency, applied_fee_amount, exchange_rate, vat_rate, vat_amount_try, total_try)
SELECT 
  r.id,
  rt.id,
  rt.category_id,
  r.fee,
  'TRY',
  r.fee,
  1.0000,
  0.2000,
  ROUND(r.fee * 0.20, 2),
  ROUND(r.fee * 1.20, 2)
FROM registrations r
INNER JOIN registration_types rt ON r.registration_type = rt.value
WHERE NOT EXISTS (
  SELECT 1 FROM registration_selections rs WHERE rs.registration_id = r.id
);

-- 7. Update registrations table with calculated totals
UPDATE registrations r
SET 
  currency = 'TRY',
  total_fee = (SELECT COALESCE(SUM(applied_fee_try), 0) FROM registration_selections WHERE registration_id = r.id),
  vat_amount = (SELECT COALESCE(SUM(vat_amount_try), 0) FROM registration_selections WHERE registration_id = r.id),
  grand_total = (SELECT COALESCE(SUM(total_try), 0) FROM registration_selections WHERE registration_id = r.id)
WHERE EXISTS (SELECT 1 FROM registration_selections WHERE registration_id = r.id);
