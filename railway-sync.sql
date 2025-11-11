-- Railway Database Sync Script
-- Add missing tables and update existing ones

-- Create bank_settings table
CREATE TABLE IF NOT EXISTS bank_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default bank settings
INSERT IGNORE INTO bank_settings (setting_key, setting_value, description) VALUES
('bank_name', 'Enpara Bank A.Ş.', 'Banka adı'),
('account_holder', 'Kapital Online Bilgisayar Ve İletişim Hizmetleri Tic.Ltd.Şti', 'Hesap sahibi'),
('iban', 'TR86 0015 7000 0000 0066 6455 24', 'IBAN numarası'),
('dekont_email', 'dekont@ko.com.tr', 'Dekont gönderilecek e-posta adresi'),
('dekont_message', 'Lütfen dekontunuzu {email} adresine iletiniz.', 'Dekont mesajı');

-- Create online_payment_transactions table
CREATE TABLE IF NOT EXISTS online_payment_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_id INT NULL,
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  order_id VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TRY',
  status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('approved', 'declined', 'pending') DEFAULT 'pending',
  error_code VARCHAR(10),
  error_message VARCHAR(255),
  gateway_name VARCHAR(100),
  gateway_response JSON,
  card_type VARCHAR(20),
  card_last4 VARCHAR(4),
  card_bin VARCHAR(6),
  cardholder_name VARCHAR(200),
  customer_name VARCHAR(200),
  customer_email VARCHAR(100),
  customer_phone VARCHAR(20),
  registration_type VARCHAR(100),
  installment_count INT DEFAULT 1,
  commission_rate DECIMAL(5,4) DEFAULT 0,
  commission_amount DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2),
  auth_code VARCHAR(20),
  reference_number VARCHAR(100),
  ip_address VARCHAR(45),
  fraud_score INT DEFAULT 0,
  user_agent TEXT,
  initiated_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE SET NULL
);

-- Add indexes for online_payment_transactions (ignore errors if already exist)
CREATE INDEX idx_registration_id ON online_payment_transactions (registration_id);
CREATE INDEX idx_transaction_id ON online_payment_transactions (transaction_id);
CREATE INDEX idx_order_id ON online_payment_transactions (order_id);
CREATE INDEX idx_status ON online_payment_transactions (status);
CREATE INDEX idx_created_at ON online_payment_transactions (created_at);

-- Note: ALTER TABLE ADD COLUMN IF NOT EXISTS is not supported in all MySQL versions
-- These will be added manually if needed

-- Update page_settings with English values if not exists
INSERT IGNORE INTO page_settings (setting_key, setting_value, description) VALUES
('form_title_en', 'Welcome! 👋', 'Form başlığı (İngilizce)'),
('form_subtitle_en', 'Follow the steps below to complete the registration form.', 'Form alt başlığı (İngilizce)'),
('form_general_warning_en', 'Please fill in all fields marked with *.', 'Genel uyarı mesajı (İngilizce)');
