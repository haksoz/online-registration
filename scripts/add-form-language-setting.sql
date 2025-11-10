-- Form ayarlarına dil seçeneği ekle

INSERT INTO form_settings (setting_key, setting_value, description) 
VALUES ('language', 'tr', 'Form dili (tr: Türkçe, en: English)')
ON DUPLICATE KEY UPDATE 
setting_value = 'tr',
updated_at = CURRENT_TIMESTAMP;
