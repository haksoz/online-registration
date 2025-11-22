-- Migration: Add document requirement fields to registration_types
-- Date: 2024-11-23

-- Add document requirement columns
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registration_types' AND COLUMN_NAME = 'requires_document');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE registration_types ADD COLUMN requires_document BOOLEAN DEFAULT FALSE COMMENT ''Belge yükleme zorunlu mu?'' AFTER vat_rate', 'SELECT ''Column requires_document already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registration_types' AND COLUMN_NAME = 'document_label');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE registration_types ADD COLUMN document_label VARCHAR(200) NULL COMMENT ''Belge etiketi (TR)'' AFTER requires_document', 'SELECT ''Column document_label already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registration_types' AND COLUMN_NAME = 'document_label_en');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE registration_types ADD COLUMN document_label_en VARCHAR(200) NULL COMMENT ''Belge etiketi (EN)'' AFTER document_label', 'SELECT ''Column document_label_en already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registration_types' AND COLUMN_NAME = 'document_description');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE registration_types ADD COLUMN document_description TEXT NULL COMMENT ''Belge açıklaması (TR)'' AFTER document_label_en', 'SELECT ''Column document_description already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registration_types' AND COLUMN_NAME = 'document_description_en');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE registration_types ADD COLUMN document_description_en TEXT NULL COMMENT ''Belge açıklaması (EN)'' AFTER document_description', 'SELECT ''Column document_description_en already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add document storage columns to registration_selections
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registration_selections' AND COLUMN_NAME = 'document_filename');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE registration_selections ADD COLUMN document_filename VARCHAR(255) NULL COMMENT ''Yüklenen belge dosya adı'' AFTER refund_method', 'SELECT ''Column document_filename already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registration_selections' AND COLUMN_NAME = 'document_url');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE registration_selections ADD COLUMN document_url VARCHAR(500) NULL COMMENT ''Yüklenen belge URL'' AFTER document_filename', 'SELECT ''Column document_url already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registration_selections' AND COLUMN_NAME = 'document_uploaded_at');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE registration_selections ADD COLUMN document_uploaded_at TIMESTAMP NULL COMMENT ''Belge yükleme tarihi'' AFTER document_url', 'SELECT ''Column document_uploaded_at already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registration_selections' AND COLUMN_NAME = 'document_verified');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE registration_selections ADD COLUMN document_verified BOOLEAN DEFAULT FALSE COMMENT ''Belge doğrulandı mı?'' AFTER document_uploaded_at', 'SELECT ''Column document_verified already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registration_selections' AND COLUMN_NAME = 'document_verified_at');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE registration_selections ADD COLUMN document_verified_at TIMESTAMP NULL COMMENT ''Belge doğrulama tarihi'' AFTER document_verified', 'SELECT ''Column document_verified_at already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registration_selections' AND COLUMN_NAME = 'document_verified_by');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE registration_selections ADD COLUMN document_verified_by INT NULL COMMENT ''Belgeyi doğrulayan admin'' AFTER document_verified_at', 'SELECT ''Column document_verified_by already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
