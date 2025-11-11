-- Add missing form field settings to Railway

INSERT INTO form_field_settings (field_name, field_label, field_type, step_number, is_visible, is_required, display_order, placeholder) VALUES
('invoiceFullName', 'Fatura Ad Soyad', 'text', 1, 1, 0, 10, 'Ad Soyad'),
('idNumber', 'TC Kimlik No', 'text', 1, 1, 0, 11, '12345678901'),
('invoiceAddress', 'Fatura Adresi', 'text', 1, 1, 0, 12, 'Fatura adresi'),
('invoiceCompanyName', 'Şirket Adı', 'text', 1, 1, 1, 13, 'Şirket Adı'),
('taxOffice', 'Vergi Dairesi', 'text', 1, 1, 1, 14, 'Kadıköy'),
('taxNumber', 'Vergi No', 'text', 1, 1, 1, 15, '1234567890')
ON DUPLICATE KEY UPDATE field_label=VALUES(field_label);
