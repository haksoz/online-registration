-- Registration Logs Table
-- Bu tablo kayıt formunu dolduran kullanıcıların log bilgilerini tutar

CREATE TABLE IF NOT EXISTS registration_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  registration_id INT NOT NULL,
  
  -- IP ve Lokasyon
  ip_address VARCHAR(45) NOT NULL COMMENT 'IPv4 veya IPv6 adresi',
  ip_version ENUM('IPv4', 'IPv6') DEFAULT 'IPv4',
  country_code VARCHAR(2) COMMENT 'ISO 3166-1 alpha-2 ülke kodu',
  country_name VARCHAR(100),
  city VARCHAR(100),
  
  -- Tarayıcı ve Cihaz Bilgileri
  user_agent TEXT COMMENT 'Raw user agent string',
  browser_name VARCHAR(50),
  browser_version VARCHAR(20),
  os_name VARCHAR(50),
  os_version VARCHAR(20),
  device_type ENUM('desktop', 'mobile', 'tablet', 'bot') DEFAULT 'desktop',
  device_vendor VARCHAR(50),
  device_model VARCHAR(50),
  
  -- Trafik Kaynağı
  referrer TEXT COMMENT 'Referrer URL',
  referrer_domain VARCHAR(255) COMMENT 'Referrer domain',
  utm_source VARCHAR(100) COMMENT 'UTM source parameter',
  utm_medium VARCHAR(100) COMMENT 'UTM medium parameter',
  utm_campaign VARCHAR(100) COMMENT 'UTM campaign parameter',
  
  -- Form İşlem Bilgileri
  form_started_at TIMESTAMP NULL COMMENT 'Form başlangıç zamanı',
  form_completed_at TIMESTAMP NULL COMMENT 'Form tamamlanma zamanı',
  form_duration_seconds INT COMMENT 'Form doldurma süresi (saniye)',
  steps_completed JSON COMMENT 'Tamamlanan adımlar ve zamanları',
  errors_encountered JSON COMMENT 'Karşılaşılan hatalar',
  
  -- Teknik Bilgiler
  screen_resolution VARCHAR(20) COMMENT 'Ekran çözünürlüğü (örn: 1920x1080)',
  language VARCHAR(10) COMMENT 'Tarayıcı dili',
  timezone VARCHAR(50) COMMENT 'Kullanıcı timezone',
  
  -- Güvenlik
  is_proxy BOOLEAN DEFAULT FALSE COMMENT 'Proxy kullanımı tespit edildi mi',
  is_vpn BOOLEAN DEFAULT FALSE COMMENT 'VPN kullanımı tespit edildi mi',
  is_tor BOOLEAN DEFAULT FALSE COMMENT 'Tor kullanımı tespit edildi mi',
  risk_score TINYINT DEFAULT 0 COMMENT 'Risk skoru (0-100)',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  INDEX idx_registration_id (registration_id),
  INDEX idx_ip_address (ip_address),
  INDEX idx_created_at (created_at),
  INDEX idx_device_type (device_type),
  INDEX idx_risk_score (risk_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Kayıt işlemi log kayıtları';
