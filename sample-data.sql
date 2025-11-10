-- Insert sample data for Railway database

-- Insert default admin user (password: changeme)
INSERT IGNORE INTO users (username, email, password_hash, full_name, role) VALUES 
('admin', 'admin@domain.com', '$2b$10$QHb1l5XBV6lzWml3E1n9Uu.3lQxP4cI1VqRsEXujwv5cPzvVo7qkC', 'System Administrator', 'admin');

-- Insert default form field settings
INSERT IGNORE INTO form_field_settings (field_name, field_label, field_label_en, field_type, step_number, is_visible, is_required, display_order) VALUES
('firstName', 'Ad', 'First Name', 'text', 1, 1, 1, 1),
('lastName', 'Soyad', 'Last Name', 'text', 1, 1, 1, 2),
('gender', 'Cinsiyet', 'Gender', 'select', 1, 1, 1, 3),
('email', 'E-posta', 'Email', 'email', 1, 1, 1, 4),
('phone', 'Telefon', 'Phone', 'tel', 1, 1, 1, 5),
('address', 'Adres', 'Address', 'textarea', 1, 1, 0, 6),
('company', 'Şirket/Kurum', 'Company', 'text', 1, 1, 0, 7),
('department', 'Departman', 'Department', 'text', 1, 1, 0, 8),
('invoiceType', 'Fatura Türü', 'Invoice Type', 'select', 1, 1, 1, 9);

-- Insert default payment method settings
INSERT IGNORE INTO payment_method_settings (method_name, method_label, method_label_en, is_enabled, display_order) VALUES
('online', 'Online Ödeme (Kredi/Banka Kartı)', 'Online Payment (Credit/Debit Card)', 1, 1),
('bank_transfer', 'Banka Havalesi/EFT', 'Bank Transfer', 1, 2);

-- Insert default page settings
INSERT IGNORE INTO page_settings (setting_key, setting_value, description) VALUES
('form_title', 'Hoş Geldiniz! 👋', 'Form başlığı (Türkçe)'),
('form_title_en', 'Welcome! 👋', 'Form başlığı (İngilizce)'),
('form_subtitle', 'Kayıt formunu doldurmak için aşağıdaki adımları takip edin.', 'Form alt başlığı (Türkçe)'),
('form_subtitle_en', 'Follow the steps below to complete the registration form.', 'Form alt başlığı (İngilizce)'),
('form_general_warning', '* ile işaretli tüm alanları eksiksiz doldurun.', 'Genel uyarı mesajı (Türkçe)'),
('form_general_warning_en', 'Please fill in all fields marked with *.', 'Genel uyarı mesajı (İngilizce)'),
('banner_image_url', '', 'Arka plan görseli URL'),
('header_title_font_size', '48', 'Başlık font boyutu'),
('header_subtitle_font_size', '24', 'Alt başlık font boyutu'),
('header_background_color', '#667eea', 'Arka plan rengi'),
('currency_type', 'TRY', 'Döviz türü'),
('organization_name', 'Online Kayıt Sistemi', 'Organizasyon adı'),
('contact_email', 'info@example.com', 'İletişim e-posta'),
('contact_phone', '+90 (212) 123 45 67', 'İletişim telefonu'),
('homepage_url', 'https://example.com', 'Anasayfa URL');

-- Insert default form settings
INSERT IGNORE INTO form_settings (setting_key, setting_value, description) VALUES
('registration_deadline', '', 'Kayıt son tarihi'),
('currency_type', 'TRY', 'Döviz türü'),
('form_language', 'tr', 'Form dili');

-- Insert sample registration types
INSERT IGNORE INTO registration_types (value, label, label_en, fee_try, fee_usd, fee_eur, description, display_order) VALUES
('dernek_uyesi', 'Dernek Üyesi', 'Association Member', 500.00, 17.00, 15.00, 'Dernek üyeleri için özel fiyat', 1),
('dernek_uyesi_degil', 'Dernek Üyesi Değil', 'Non-Member', 750.00, 25.00, 22.00, 'Dernek üyesi olmayan katılımcılar için', 2),
('ogrenci', 'Öğrenci', 'Student', 250.00, 8.00, 7.00, 'Öğrenciler için indirimli fiyat', 3);

-- Insert sample bank account
INSERT IGNORE INTO bank_accounts (bank_name, bank_name_en, account_holder, account_holder_en, account_number, iban, currency_type, display_order) VALUES
('Türkiye İş Bankası', 'Turkiye Is Bankasi', 'ÖRNEK ORGANİZASYON', 'SAMPLE ORGANIZATION', '1234567890', 'TR123456789012345678901234', 'TRY', 1);

-- Insert current exchange rates (sample)
INSERT IGNORE INTO exchange_rates (currency_code, rate_to_try) VALUES
('USD', 30.0000),
('EUR', 35.0000);