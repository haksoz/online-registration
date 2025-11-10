-- Online Payment Transactions Table
-- Bu tablo online ödeme işlemlerinin detaylarını tutar

CREATE TABLE IF NOT EXISTS online_payment_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  registration_id INT NOT NULL,
  
  -- İşlem Bilgileri
  transaction_id VARCHAR(100) UNIQUE COMMENT 'Banka/Gateway transaction ID',
  order_id VARCHAR(100) COMMENT 'Sipariş numarası',
  amount DECIMAL(10,2) NOT NULL COMMENT 'İşlem tutarı',
  currency VARCHAR(3) DEFAULT 'TRY' COMMENT 'Para birimi',
  
  -- Durum Bilgileri
  status ENUM('pending', 'success', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
  payment_status VARCHAR(50) COMMENT 'Bankadan dönen durum kodu',
  error_code VARCHAR(50) COMMENT 'Hata kodu (başarısız işlemler için)',
  error_message TEXT COMMENT 'Hata mesajı',
  
  -- Banka/Gateway Bilgileri
  gateway_name VARCHAR(50) COMMENT 'Ödeme gateway adı (iyzico, paytr, vb.)',
  bank_name VARCHAR(100) COMMENT 'Banka adı',
  card_type VARCHAR(50) COMMENT 'Kart tipi (Visa, MasterCard, vb.)',
  card_last4 VARCHAR(4) COMMENT 'Kart son 4 hanesi',
  card_bin VARCHAR(6) COMMENT 'Kart BIN numarası (ilk 6 hane)',
  installment INT DEFAULT 1 COMMENT 'Taksit sayısı',
  
  -- Kullanıcı Bilgileri (PCI-DSS uyumlu)
  cardholder_name VARCHAR(100) COMMENT 'Kart sahibi adı',
  billing_address TEXT COMMENT 'Fatura adresi',
  billing_city VARCHAR(100) COMMENT 'Fatura şehri',
  billing_country VARCHAR(2) COMMENT 'Fatura ülkesi (ISO code)',
  ip_address VARCHAR(45) COMMENT 'İşlem yapılan IP adresi',
  
  -- 3D Secure Bilgileri
  is_3d_secure BOOLEAN DEFAULT FALSE COMMENT '3D Secure kullanıldı mı',
  threeds_status VARCHAR(50) COMMENT '3D Secure durumu',
  eci VARCHAR(10) COMMENT 'Electronic Commerce Indicator',
  cavv TEXT COMMENT 'Cardholder Authentication Verification Value',
  
  -- İşlem Zamanları
  initiated_at TIMESTAMP NULL COMMENT 'İşlem başlatılma zamanı',
  completed_at TIMESTAMP NULL COMMENT 'İşlem tamamlanma zamanı',
  callback_received_at TIMESTAMP NULL COMMENT 'Callback alınma zamanı',
  
  -- Gateway Response (JSON)
  gateway_request JSON COMMENT 'Gateway\'e gönderilen istek (hassas bilgiler hariç)',
  gateway_response JSON COMMENT 'Gateway\'den dönen yanıt',
  
  -- Fraud Detection
  fraud_score INT COMMENT 'Fraud risk skoru (0-100)',
  fraud_status VARCHAR(50) COMMENT 'Fraud kontrol durumu',
  
  -- Metadata
  user_agent TEXT COMMENT 'Kullanıcı tarayıcı bilgisi',
  session_id VARCHAR(100) COMMENT 'Session ID',
  notes TEXT COMMENT 'Ek notlar',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  INDEX idx_registration_id (registration_id),
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_gateway_name (gateway_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Online ödeme işlem kayıtları';

-- İşlem logları için ayrı tablo (audit trail)
CREATE TABLE IF NOT EXISTS online_payment_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_id INT NOT NULL,
  
  event_type VARCHAR(50) NOT NULL COMMENT 'İşlem tipi (initiated, callback, success, failed, vb.)',
  event_data JSON COMMENT 'İşlem detayları',
  ip_address VARCHAR(45) COMMENT 'İşlem yapılan IP',
  user_agent TEXT COMMENT 'Tarayıcı bilgisi',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (transaction_id) REFERENCES online_payment_transactions(id) ON DELETE CASCADE,
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Online ödeme işlem logları';
