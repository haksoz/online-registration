-- Step 1'e ülke alanı ekle; registrations tablosuna country kolonu ekle.

-- 1) registrations tablosuna country kolonu (yoksa)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registrations' AND COLUMN_NAME = 'country');
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE registrations ADD COLUMN country VARCHAR(100) DEFAULT NULL AFTER department',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2) form_field_settings'ta country yoksa ekle (cinsiyetten sonra, display_order 4)
INSERT INTO form_field_settings (field_name, field_label, field_type, step_number, is_visible, is_required, display_order, placeholder)
SELECT 'country', 'Ülke', 'select', 1, 1, 0, 4, NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM form_field_settings WHERE field_name = 'country' AND step_number = 1);
