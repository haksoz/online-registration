-- Railway Database Migration Script
-- Run this script in Railway MySQL console

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role ENUM('admin', 'user') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference_number VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  company VARCHAR(200),
  department VARCHAR(100),
  invoice_type ENUM('bireysel', 'kurumsal') NOT NULL,
  invoice_full_name VARCHAR(200),
  id_number VARCHAR(11),
  invoice_address TEXT,
  invoice_company_name VARCHAR(200),
  tax_office VARCHAR(100),
  tax_number VARCHAR(20),
  registration_type VARCHAR(100) NOT NULL,
  registration_type_label VARCHAR(200),
  registration_type_label_en VARCHAR(200),
  fee DECIMAL(10,2) NOT NULL,
  payment_method ENUM('online', 'bank_transfer') NOT NULL,
  payment_status ENUM('pending', 'completed') DEFAULT 'pending',
  payment_confirmed_at TIMESTAMP NULL,
  payment_confirmed_by INT,
  payment_notes TEXT,
  payment_receipt_url VARCHAR(500),
  payment_receipt_filename VARCHAR(255),
  payment_receipt_uploaded_at TIMESTAMP NULL,
  status TINYINT DEFAULT 1 COMMENT '1: Active, 0: Cancelled, -1: Deleted',
  refund_status ENUM('none', 'requested', 'approved', 'completed') DEFAULT 'none',
  refund_amount DECIMAL(10,2) DEFAULT 0,
  refund_date TIMESTAMP NULL,
  refund_notes TEXT,
  refund_method VARCHAR(50),
  cancelled_at TIMESTAMP NULL,
  cancelled_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_confirmed_by) REFERENCES users(id),
  FOREIGN KEY (cancelled_by) REFERENCES users(id)
);

-- Create registration_types table
CREATE TABLE IF NOT EXISTS registration_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  value VARCHAR(100) UNIQUE NOT NULL,
  label VARCHAR(200) NOT NULL,
  label_en VARCHAR(200),
  fee_try DECIMAL(10,2) NOT NULL DEFAULT 0,
  fee_usd DECIMAL(10,2) NOT NULL DEFAULT 0,
  fee_eur DECIMAL(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create form_field_settings table
CREATE TABLE IF NOT EXISTS form_field_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  field_name VARCHAR(100) UNIQUE NOT NULL,
  field_label VARCHAR(200) NOT NULL,
  field_label_en VARCHAR(200),
  field_type ENUM('text', 'email', 'tel', 'select', 'textarea', 'checkbox') NOT NULL,
  step_number INT NOT NULL,
  is_visible BOOLEAN DEFAULT TRUE,
  is_required BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  placeholder VARCHAR(200),
  placeholder_en VARCHAR(200),
  help_text TEXT,
  help_text_en TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create form_settings table
CREATE TABLE IF NOT EXISTS form_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create page_settings table
CREATE TABLE IF NOT EXISTS page_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create payment_method_settings table
CREATE TABLE IF NOT EXISTS payment_method_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  method_name VARCHAR(50) UNIQUE NOT NULL,
  method_label VARCHAR(100) NOT NULL,
  method_label_en VARCHAR(100),
  is_enabled BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  description TEXT,
  description_en TEXT,
  icon VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bank_name VARCHAR(100) NOT NULL,
  bank_name_en VARCHAR(100),
  account_holder VARCHAR(200) NOT NULL,
  account_holder_en VARCHAR(200),
  account_number VARCHAR(50) NOT NULL,
  iban VARCHAR(50),
  swift_code VARCHAR(20),
  branch_name VARCHAR(100),
  branch_name_en VARCHAR(100),
  branch_code VARCHAR(20),
  currency_type ENUM('TRY', 'USD', 'EUR') DEFAULT 'TRY',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  currency_code VARCHAR(3) NOT NULL,
  rate_to_try DECIMAL(10,4) NOT NULL,
  source VARCHAR(50) DEFAULT 'TCMB',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_currency_date (currency_code, DATE(created_at))
);

-- Create registration_logs table
CREATE TABLE IF NOT EXISTS registration_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_id INT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer VARCHAR(500),
  browser_name VARCHAR(100),
  browser_version VARCHAR(50),
  os_name VARCHAR(100),
  os_version VARCHAR(50),
  device_type VARCHAR(50),
  device_vendor VARCHAR(100),
  device_model VARCHAR(100),
  screen_resolution VARCHAR(20),
  language VARCHAR(10),
  timezone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  table_name VARCHAR(100) NOT NULL,
  record_id INT,
  action ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
  old_values JSON,
  new_values JSON,
  changed_fields JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create pos_transactions table
CREATE TABLE IF NOT EXISTS pos_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_id INT,
  transaction_id VARCHAR(100) UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TRY',
  status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(50),
  card_mask VARCHAR(20),
  bank_name VARCHAR(100),
  response_code VARCHAR(10),
  response_message TEXT,
  auth_code VARCHAR(20),
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id)
);

-- Create online_payments table
CREATE TABLE IF NOT EXISTS online_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_id INT NOT NULL,
  payment_provider VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TRY',
  status ENUM('pending', 'success', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(50),
  card_mask VARCHAR(20),
  card_type VARCHAR(20),
  bank_name VARCHAR(100),
  installment_count INT DEFAULT 1,
  commission_rate DECIMAL(5,4) DEFAULT 0,
  commission_amount DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2),
  auth_code VARCHAR(20),
  reference_number VARCHAR(100),
  order_id VARCHAR(100),
  conversation_id VARCHAR(100),
  payment_id VARCHAR(100),
  fraud_status VARCHAR(20),
  response_code VARCHAR(10),
  response_message TEXT,
  error_code VARCHAR(10),
  error_message TEXT,
  raw_response JSON,
  callback_received_at TIMESTAMP NULL,
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_registration_id (registration_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Insert default admin user
INSERT IGNORE INTO users (username, email, password_hash, full_name, role) VALUES 
('admin', 'admin@example.com', '$2b$10$rQZ9j7Kz8vQZ9j7Kz8vQZ9j7Kz8vQZ9j7Kz8vQZ9j7Kz8vQZ9j7Kz8', 'System Administrator', 'admin');

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