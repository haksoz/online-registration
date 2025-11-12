-- Step 3: Add new form_settings entries
INSERT INTO form_settings (setting_key, setting_value, description) VALUES
('registration_start_date', '', 'Kayıt başlangıç tarihi (boş ise hemen açık)'),
('notification_email', '', 'Kayıt bildirim mail adresi'),
('bcc_email', '', 'Kayıt bildirim BCC mail adresi')
ON DUPLICATE KEY UPDATE description = VALUES(description);

SELECT 'form_settings updated!' as status;
SELECT setting_key, description FROM form_settings WHERE setting_key IN ('registration_start_date', 'notification_email', 'bcc_email');
