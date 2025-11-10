-- Form Field Settings Table
-- Step1 form alanlarının görünürlük ve zorunluluk ayarları

CREATE TABLE IF NOT EXISTS form_field_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  field_name VARCHAR(50) UNIQUE NOT NULL COMMENT 'Alan adı (firstName, gender, company vb.)',
  field_label VARCHAR(100) NOT NULL COMMENT 'Türkçe etiket',
  field_type VARCHAR(50) NOT NULL COMMENT 'Alan tipi (text, email, phone, select, radio)',
  step_number INT NOT NULL COMMENT 'Hangi adımda (1, 2, 3, 4)',
  is_visible BOOLEAN DEFAULT TRUE COMMENT 'Formda görünsün mü?',
  is_required BOOLEAN DEFAULT TRUE COMMENT 'Zorunlu mu?',
  display_order INT DEFAULT 0 COMMENT 'Görüntüleme sırası',
  placeholder VARCHAR(255) COMMENT 'Placeholder text',
  help_text TEXT COMMENT 'Yardım metni',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_step_number (step_number),
  INDEX idx_is_visible (is_visible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Form alanları ayarları';

-- Payment Method Settings Table
-- Step3 ödeme yöntemlerinin aktif/pasif durumu

CREATE TABLE IF NOT EXISTS payment_method_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  method_name VARCHAR(50) UNIQUE NOT NULL COMMENT 'Ödeme yöntemi (online, bank_transfer)',
  method_label VARCHAR(100) NOT NULL COMMENT 'Türkçe etiket',
  is_enabled BOOLEAN DEFAULT TRUE COMMENT 'Aktif mi?',
  display_order INT DEFAULT 0 COMMENT 'Görüntüleme sırası',
  description TEXT COMMENT 'Açıklama',
  icon VARCHAR(50) COMMENT 'Icon emoji veya class',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ödeme yöntemleri ayarları';

-- Insert default form field settings for Step 1
INSERT INTO form_field_settings (field_name, field_label, field_type, step_number, is_visible, is_required, display_order, placeholder) VALUES
('firstName', 'Ad', 'text', 1, TRUE, TRUE, 1, 'Ahmet'),
('lastName', 'Soyad', 'text', 1, TRUE, TRUE, 2, 'Yılmaz'),
('gender', 'Cinsiyet', 'radio', 1, TRUE, TRUE, 3, NULL),
('email', 'E-posta', 'email', 1, TRUE, TRUE, 4, 'ornek@email.com'),
('phone', 'Telefon', 'phone', 1, TRUE, TRUE, 5, 'Telefon numarası'),
('address', 'Adres', 'text', 1, TRUE, TRUE, 6, 'Örnek Cadde No:123, İstanbul'),
('company', 'Şirket/Kurum', 'text', 1, TRUE, FALSE, 7, 'Örnek Şirket A.Ş.'),
('department', 'Departman', 'text', 1, TRUE, FALSE, 8, 'İnsan Kaynakları'),
('invoiceType', 'Fatura Türü', 'radio', 1, TRUE, TRUE, 9, NULL),
('invoiceFullName', 'Fatura Ad Soyad', 'text', 1, TRUE, FALSE, 10, 'Ad Soyad'),
('idNumber', 'TC Kimlik No', 'text', 1, TRUE, FALSE, 11, '12345678901'),
('invoiceAddress', 'Fatura Adresi', 'text', 1, TRUE, FALSE, 12, 'Fatura adresi'),
('invoiceCompanyName', 'Şirket Adı', 'text', 1, TRUE, FALSE, 13, 'Şirket Adı'),
('taxOffice', 'Vergi Dairesi', 'text', 1, TRUE, FALSE, 14, 'Kadıköy'),
('taxNumber', 'Vergi No', 'text', 1, TRUE, FALSE, 15, '1234567890');

-- Insert default payment method settings
INSERT INTO payment_method_settings (method_name, method_label, is_enabled, display_order, description, icon) VALUES
('online', 'Online Ödeme', TRUE, 1, 'Kredi kartı ile anında ödeme', '💳'),
('bank_transfer', 'Banka Transferi', TRUE, 2, 'Havale/EFT ile ödeme', '🏦');
