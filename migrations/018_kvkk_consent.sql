-- KVKK onay alanı: registrations onay zamanı, form alanı ve popup metinleri

-- 1) registrations: KVKK onay tarihi/saati
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registrations' AND COLUMN_NAME = 'kvkk_consent_at');
SET @sql = IF(@col = 0,
  'ALTER TABLE registrations ADD COLUMN kvkk_consent_at TIMESTAMP NULL DEFAULT NULL COMMENT ''KVKK onayının verildiği an''',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2) form_field_settings: field_label_en yoksa ekle (TR/EN checkbox metni için)
SET @fc = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'form_field_settings' AND COLUMN_NAME = 'field_label_en');
SET @fsql = IF(@fc = 0,
  'ALTER TABLE form_field_settings ADD COLUMN field_label_en VARCHAR(500) NULL AFTER field_label',
  'SELECT 1');
PREPARE fstmt FROM @fsql;
EXECUTE fstmt;
DEALLOCATE PREPARE fstmt;

-- 3) KVKK onay alanı (Step 1, tüm alanların en altında / İleri üstünde)
INSERT IGNORE INTO form_field_settings (field_name, field_label, field_label_en, field_type, step_number, is_visible, is_required, display_order, placeholder)
VALUES ('kvkk_consent', 'KVKK Aydınlatma Metni''ni okudum, anladım ve kabul ediyorum.', 'I have read, understood and accept the KVKK Privacy Notice.', 'checkbox', 1, 1, 1, 99, NULL);

-- 4) Popup metinleri (form_settings)
INSERT INTO form_settings (setting_key, setting_value, description) VALUES
('kvkk_popup_tr', 'Bu alan admin panelinden (Form Ayarları > KVKK Aydınlatma) düzenlenebilir. Burada KVKK aydınlatma metninizi yazın.', 'KVKK Aydınlatma Metni - Türkçe (popup)')
ON DUPLICATE KEY UPDATE description = VALUES(description);
INSERT INTO form_settings (setting_key, setting_value, description) VALUES
('kvkk_popup_en', 'This content can be edited in the admin panel (Form Settings > KVKK Notice). Enter your KVKK privacy notice here.', 'KVKK Privacy Notice - English (popup)')
ON DUPLICATE KEY UPDATE description = VALUES(description);
