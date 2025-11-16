-- Veritabanını Sıfırlama Script'i
-- UYARI: Bu script tüm verileri siler! Sadece development/test ortamında kullanın!

SET FOREIGN_KEY_CHECKS = 0;

-- Tüm kayıtları temizle
TRUNCATE TABLE registrations;
TRUNCATE TABLE registration_logs;
TRUNCATE TABLE registration_types;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE online_payment_transactions;
TRUNCATE TABLE online_payment_logs;
TRUNCATE TABLE mail_logs;
TRUNCATE TABLE page_settings;
TRUNCATE TABLE form_settings;
TRUNCATE TABLE payment_method_settings;
TRUNCATE TABLE bank_accounts;
TRUNCATE TABLE mail_settings;
TRUNCATE TABLE exchange_rates;

-- Users tablosunu temizleme (opsiyonel - yorumu kaldırarak aktif edebilirsiniz)
-- TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Veritabanı başarıyla sıfırlandı!' as message;
SELECT 'Şimdi setup-new-client.sql script\'ini çalıştırabilirsiniz.' as next_step;
