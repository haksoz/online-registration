-- Yeni Müşteri İçin Kurulum Script'i
-- Bu script yeni bir müşteri için gerekli tüm tabloları ve default verileri oluşturur

-- 1. Veritabanı oluştur (eğer yoksa)
-- CREATE DATABASE IF NOT EXISTS form_wizard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE form_wizard;

-- 2. Default Admin Kullanıcısı
INSERT INTO users (email, password_hash, full_name, role, created_at) VALUES
('admin@example.com', '$2a$10$YourHashedPasswordHere', 'Admin User', 'admin', NOW())
ON DUPLICATE KEY UPDATE email=email;
-- Not: Şifre hash'i bcrypt ile oluşturulmalı (production'da mutlaka değiştirilmeli!)
-- Örnek şifre: admin123

-- 3. Default Sayfa Ayarları
INSERT INTO page_settings (setting_key, setting_value, created_at, updated_at) VALUES
('site_title', 'Etkinlik Kayıt Formu', NOW(), NOW()),
('site_description', 'Etkinliğimize kayıt olmak için formu doldurun', NOW(), NOW()),
('logo_url', '', NOW(), NOW()),
('primary_color', '#3B82F6', NOW(), NOW()),
('secondary_color', '#1E40AF', NOW(), NOW()),
('contact_email', 'info@example.com', NOW(), NOW()),
('contact_phone', '+90 555 123 4567', NOW(), NOW()),
('footer_text', '© 2025 Tüm hakları saklıdır', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at=NOW();

-- 4. Default Form Ayarları
INSERT INTO form_settings (setting_key, setting_value, created_at, updated_at) VALUES
('form_enabled', 'true', NOW(), NOW()),
('form_title', 'Kayıt Formu', NOW(), NOW()),
('form_description', 'Lütfen bilgilerinizi eksiksiz doldurun', NOW(), NOW()),
('success_message', 'Kaydınız başarıyla alındı. Teşekkür ederiz!', NOW(), NOW()),
('require_address', 'false', NOW(), NOW()),
('require_company', 'false', NOW(), NOW()),
('require_department', 'false', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at=NOW();

-- 5. Default Ödeme Yöntemi Ayarları
INSERT INTO payment_method_settings (method_name, method_label, is_enabled, display_order, created_at, updated_at) VALUES
('bank_transfer', 'Banka Transferi', 1, 1, NOW(), NOW()),
('online', 'Online Ödeme', 0, 2, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at=NOW();

-- 6. Default Banka Hesabı (örnek - müşteriye göre düzenlenmelidir)
INSERT INTO bank_accounts (account_name, bank_name, account_holder, iban, currency, is_active, created_at, updated_at) VALUES
('Türk Lirası Hesabı', 'Örnek Banka', 'Şirket Adı', 'TR00 0000 0000 0000 0000 0000 00', 'TRY', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at=NOW();

-- 6b. Banka Ayarları (dekont e-posta vs.)
INSERT INTO bank_settings (setting_key, setting_value, description, created_at, updated_at) VALUES
('bank_name', 'Örnek Banka A.Ş.', 'Banka adı', NOW(), NOW()),
('account_holder', 'Şirket Adı', 'Hesap sahibi', NOW(), NOW()),
('iban', 'TR00 0000 0000 0000 0000 0000 00', 'IBAN numarası', NOW(), NOW()),
('dekont_email', 'dekont@example.com', 'Dekont gönderilecek e-posta adresi', NOW(), NOW()),
('dekont_message', 'Lütfen dekontunuzu {email} adresine iletiniz.', 'Dekont mesajı', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at=NOW();
-- Not: Gerçek banka bilgilerini admin panelden giriniz

-- 7. Default Mail Ayarları
INSERT INTO mail_settings (setting_key, setting_value, created_at, updated_at) VALUES
('smtp_host', 'smtp.gmail.com', NOW(), NOW()),
('smtp_port', '587', NOW(), NOW()),
('smtp_secure', 'tls', NOW(), NOW()),
('smtp_user', '', NOW(), NOW()),
('smtp_password', '', NOW(), NOW()),
('from_email', 'noreply@example.com', NOW(), NOW()),
('from_name', 'Etkinlik Kayıt Sistemi', NOW(), NOW()),
('admin_notification_email', 'admin@example.com', NOW(), NOW()),
('send_confirmation_email', 'true', NOW(), NOW()),
('send_admin_notification', 'true', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at=NOW();

-- 8. Default Döviz Kurları
INSERT INTO exchange_rates (currency_code, currency_name, rate_to_try, source, created_at) VALUES
('TRY', 'Türk Lirası', 1.0000, 'manual', NOW()),
('USD', 'Amerikan Doları', 34.5000, 'manual', NOW()),
('EUR', 'Euro', 37.5000, 'manual', NOW())
ON DUPLICATE KEY UPDATE last_updated=NOW();

-- 9. Örnek Kayıt Türleri (müşteriye göre özelleştirilmeli)
INSERT INTO registration_types (value, label, label_en, fee_try, fee_usd, fee_eur, is_active, created_at, updated_at) VALUES
('standart', 'Standart Katılım', 'Standard Participation', 1000.00, 30.00, 27.00, 1, NOW(), NOW()),
('ogrenci', 'Öğrenci', 'Student', 500.00, 15.00, 13.50, 1, NOW(), NOW()),
('kurumsal', 'Kurumsal', 'Corporate', 2000.00, 60.00, 54.00, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at=NOW();

-- 10. Kayıt Ayarları
INSERT INTO page_settings (setting_key, setting_value, created_at, updated_at) VALUES
('registration_start_date', DATE_FORMAT(NOW(), '%Y-%m-%d 00:00:00'), NOW(), NOW()),
('registration_end_date', DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 30 DAY), '%Y-%m-%d 23:59:59'), NOW(), NOW()),
('cancellation_deadline', DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 7 DAY), '%Y-%m-%d 23:59:59'), NOW(), NOW()),
('max_participants', '1000', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at=NOW();

-- Kurulum tamamlandı
SELECT 'Kurulum başarıyla tamamlandı!' as message;
SELECT 'Default admin kullanıcısı: admin / admin123' as credentials;
SELECT 'UYARI: Production ortamında admin şifresini mutlaka değiştirin!' as warning;
