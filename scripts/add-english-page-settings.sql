-- Add English fields to page settings

-- Form Title English
INSERT INTO page_settings (setting_key, setting_value, description)
VALUES ('form_title_en', '', 'Form başlığı (İngilizce)')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Form Subtitle English
INSERT INTO page_settings (setting_key, setting_value, description)
VALUES ('form_subtitle_en', '', 'Form alt başlığı (İngilizce)')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Form General Warning English
INSERT INTO page_settings (setting_key, setting_value, description)
VALUES ('form_general_warning_en', '', 'Genel uyarı mesajı (İngilizce)')
ON DUPLICATE KEY UPDATE description = VALUES(description);
