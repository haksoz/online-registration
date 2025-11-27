-- Payment Gateway Settings (Admin tarafından yönetilecek)
CREATE TABLE IF NOT EXISTS payment_gateways (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gateway_name VARCHAR(50) NOT NULL COMMENT 'Denizbank, Garanti, İş Bankası, vb.',
  gateway_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'denizbank, garanti, isbank',
  shop_code VARCHAR(100) COMMENT 'Mağaza kodu',
  merchant_id VARCHAR(100) COMMENT 'Merchant ID',
  merchant_pass_encrypted TEXT COMMENT 'Şifreli merchant şifresi',
  terminal_id VARCHAR(50) COMMENT 'Terminal ID (bazı bankalar için)',
  store_key TEXT COMMENT 'Store Key (bazı bankalar için)',
  api_url_test VARCHAR(255) COMMENT 'Test ortamı URL',
  api_url_production VARCHAR(255) COMMENT 'Production URL',
  test_mode BOOLEAN DEFAULT TRUE COMMENT 'Test modu aktif mi?',
  is_active BOOLEAN DEFAULT FALSE COMMENT 'Bu gateway aktif mi?',
  display_order INT DEFAULT 0 COMMENT 'Sıralama',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Payment Transactions (Ödeme kayıtları)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_submission_id INT COMMENT 'Form kaydı ID',
  gateway_id INT COMMENT 'Hangi gateway kullanıldı',
  order_id VARCHAR(100) UNIQUE NOT NULL COMMENT 'Benzersiz sipariş ID',
  amount DECIMAL(10,2) NOT NULL COMMENT 'Tutar',
  currency VARCHAR(3) DEFAULT 'TRY' COMMENT 'Para birimi',
  status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(50) COMMENT 'credit_card, debit_card',
  card_last4 VARCHAR(4) COMMENT 'Kartın son 4 hanesi',
  card_type VARCHAR(20) COMMENT 'Visa, MasterCard, vb.',
  transaction_id VARCHAR(100) COMMENT 'Banka transaction ID',
  auth_code VARCHAR(50) COMMENT 'Yetkilendirme kodu',
  bank_response TEXT COMMENT 'Bankanın tam response',
  error_code VARCHAR(50) COMMENT 'Hata kodu',
  error_message TEXT COMMENT 'Hata mesajı',
  ip_address VARCHAR(45) COMMENT 'Kullanıcı IP',
  user_agent TEXT COMMENT 'Kullanıcı tarayıcı bilgisi',
  transaction_date DATETIME COMMENT 'İşlem tarihi',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (gateway_id) REFERENCES payment_gateways(id) ON DELETE SET NULL
);

-- İlk kayıt: Denizbank
INSERT INTO payment_gateways (
  gateway_name, 
  gateway_code, 
  api_url_test, 
  api_url_production,
  display_order,
  is_active
) VALUES (
  'Denizbank',
  'denizbank',
  'https://sanaltest.denizbank.com/mpi/Default.aspx',
  'https://sanalposprov.denizbank.com/mpi/Default.aspx',
  1,
  FALSE
);

-- Diğer bankalar için placeholder'lar (ileride eklenebilir)
INSERT INTO payment_gateways (
  gateway_name, 
  gateway_code, 
  api_url_test, 
  api_url_production,
  display_order,
  is_active
) VALUES 
(
  'Garanti Bankası',
  'garanti',
  'https://sanalposprovtest.garantibbva.com.tr/servlet/gt3dengine',
  'https://sanalposprov.garanti.com.tr/servlet/gt3dengine',
  2,
  FALSE
),
(
  'İş Bankası',
  'isbank',
  'https://entegrasyon.asseco-see.com.tr/fim/est3Dgate',
  'https://www.sanalakpos.com/fim/est3Dgate',
  3,
  FALSE
);
