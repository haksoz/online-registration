-- Kalem bazında indirim: Bu kaleme indirim kodu uygulandı mı?
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registration_selections' AND COLUMN_NAME = 'discount_code_id');
SET @sql := IF(@exist = 0,
  'ALTER TABLE registration_selections ADD COLUMN discount_code_id INT NULL COMMENT ''Bu kaleme uygulanan indirim kodu'' AFTER total_try',
  'SELECT "discount_code_id already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registration_selections' AND COLUMN_NAME = 'discount_code_id');
SET @fk_exists := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registration_selections' AND CONSTRAINT_NAME = 'fk_rs_discount_code');
SET @sql2 := IF(@col_exists > 0 AND @fk_exists = 0,
  'ALTER TABLE registration_selections ADD CONSTRAINT fk_rs_discount_code FOREIGN KEY (discount_code_id) REFERENCES discount_codes(id) ON DELETE SET NULL',
  'SELECT "FK skip"');
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
