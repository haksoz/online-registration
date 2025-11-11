-- Add English invoice notes to form_settings

INSERT INTO form_settings (setting_key, setting_value, description) VALUES
('invoice_individual_note_en', 'Your Turkish ID number is required for individual invoice.', 'Bireysel fatura seçimi için uyarı notu (İngilizce)'),
('invoice_corporate_note_en', 'Company information and tax number are required for corporate invoice.', 'Kurumsal fatura seçimi için uyarı notu (İngilizce)')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);
