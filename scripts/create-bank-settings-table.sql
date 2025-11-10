-- Banka hesapları tablosu (çoklu hesap desteği)
CREATE TABLE IF NOT EXISTS bank_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  account_name VARCHAR(100) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  account_holder VARCHAR(255) NOT NULL,
  iban VARCHAR(34) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TRY',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Ödeme ayarları tablosu (genel ayarlar)
CREATE TABLE IF NOT EXISTS payment_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Varsayılan banka hesabını ekle
INSERT INTO bank_accounts (account_name, bank_name, account_holder, iban, currency, description, is_active, display_order) VALUES
('Ana Hesap (TRY)', 'Enpara Bank A.Ş.', 'Kapital Online Bilgisayar Ve İletişim Hizmetleri Tic.Ltd.Şti', 'TR86 0015 7000 0000 0066 6455 24', 'TRY', 'Türk Lirası kayıt ödemeleri için ana hesap', TRUE, 1)
ON DUPLICATE KEY UPDATE 
updated_at = CURRENT_TIMESTAMP;

-- Varsayılan ödeme ayarlarını ekle
INSERT INTO payment_settings (setting_key, setting_value, description) VALUES
('dekont_email', 'dekont@ko.com.tr', 'Dekont gönderilecek e-posta adresi'),
('dekont_message', 'Lütfen dekontunuzu {email} adresine iletiniz.', 'Dekont mesajı')
ON DUPLICATE KEY UPDATE 
setting_value = VALUES(setting_value),
updated_at = CURRENT_TIMESTAMP;