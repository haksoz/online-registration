-- Migration: Add vat_rate to registration_types
-- Date: 2024-11-23

-- Add vat_rate column (ignore if exists)
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registration_types' AND COLUMN_NAME = 'vat_rate');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE registration_types ADD COLUMN vat_rate DECIMAL(5,4) DEFAULT 0.2000 COMMENT ''KDV oranı (0.20 = %20)'' AFTER fee_eur', 'SELECT ''Column vat_rate already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing records
UPDATE registration_types SET vat_rate = 0.2000 WHERE vat_rate IS NULL OR vat_rate = 0;
