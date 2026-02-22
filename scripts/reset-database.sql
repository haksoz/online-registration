-- Veritabanı veri sıfırlama (Development/Test)
-- UYARI: Tüm iş verisini siler. USERS tablosuna DOKUNMAZ (süperadmin korunur).
--
-- TRUNCATE sırası: Önce başka tabloya FK ile bağlı olan (child) tablolar,
-- sonra onlara referans veren (parent) tablolar. Aksi halde FK hatası alınır.

SET FOREIGN_KEY_CHECKS = 0;

-- 1) Kayıtlara bağlı log/ödeme tabloları (registrations → id referansı)
-- online_payment_logs bazı kurulumlarda yok; varsa elle ekleyebilirsiniz
TRUNCATE TABLE online_payment_transactions;
TRUNCATE TABLE online_payments;
TRUNCATE TABLE pos_transactions;
TRUNCATE TABLE payment_transactions;
TRUNCATE TABLE mail_logs;
TRUNCATE TABLE audit_logs;

-- 2) Kayıt seçimleri ve kayıt logları (registrations + registration_types + registration_categories referansı)
TRUNCATE TABLE registration_selections;
TRUNCATE TABLE registration_logs;

-- 3) Ana kayıt tablosu
TRUNCATE TABLE registrations;

-- 4) Kayıt türleri (registration_categories referansı)
TRUNCATE TABLE registration_types;

-- 5) Kategoriler
TRUNCATE TABLE registration_categories;

-- 6) Diğer ayar / tanım tabloları (birbirine FK ile bağlı değil)
TRUNCATE TABLE payment_gateways;
TRUNCATE TABLE form_field_settings;
TRUNCATE TABLE form_settings;
TRUNCATE TABLE page_settings;
TRUNCATE TABLE step2_settings;
TRUNCATE TABLE payment_method_settings;
TRUNCATE TABLE payment_settings;
TRUNCATE TABLE bank_accounts;
TRUNCATE TABLE bank_settings;
TRUNCATE TABLE mail_settings;
TRUNCATE TABLE exchange_rates;

-- users tablosu bilerek TRUNCATE edilmez (süperadmin korunur)

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Veritabanı verisi sıfırlandı. users (süperadmin) korundu.' AS message;
