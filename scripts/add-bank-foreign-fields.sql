-- Banka hesapları tablosuna döviz hesapları için ek alanlar ekle

-- SWIFT/BIC kodu
ALTER TABLE bank_accounts 
ADD COLUMN swift_code VARCHAR(11) DEFAULT NULL COMMENT 'SWIFT/BIC kodu (döviz hesapları için)';

-- Hesap numarası
ALTER TABLE bank_accounts 
ADD COLUMN account_number VARCHAR(50) DEFAULT NULL COMMENT 'Hesap numarası (döviz hesapları için)';

-- Banka adresi
ALTER TABLE bank_accounts 
ADD COLUMN bank_address TEXT DEFAULT NULL COMMENT 'Banka adresi (döviz hesapları için)';
