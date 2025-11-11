-- Add invoice notes to form_settings

INSERT INTO form_settings (setting_key, setting_value, description) VALUES
('invoice_individual_note', 'Bireysel fatura için TC Kimlik numaranız gereklidir.', 'Bireysel fatura seçimi için uyarı notu'),
('invoice_corporate_note', 'Kurumsal fatura için şirket bilgileri ve vergi numarası gereklidir.', 'Kurumsal fatura seçimi için uyarı notu')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);
