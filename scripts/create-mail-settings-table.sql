-- Mail ayarları tablosu
CREATE TABLE IF NOT EXISTS mail_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Varsayılan mail ayarları
INSERT INTO mail_settings (setting_key, setting_value, description) VALUES
('smtp_host', '', 'SMTP sunucu adresi (örn: smtp.gmail.com)'),
('smtp_port', '587', 'SMTP port (587 veya 465)'),
('smtp_secure', 'tls', 'Güvenlik protokolü (tls veya ssl)'),
('smtp_user', '', 'SMTP kullanıcı adı / e-posta'),
('smtp_password', '', 'SMTP şifresi / uygulama şifresi'),
('from_email', '', 'Gönderen e-posta adresi'),
('from_name', 'Online Kayıt Sistemi', 'Gönderen adı'),
('admin_email', '', 'Yönetici e-posta adresi (bildirimler için)'),
('send_user_confirmation', '1', 'Kullanıcıya onay maili gönder (1: evet, 0: hayır)'),
('send_admin_notification', '1', 'Yöneticiye bildirim gönder (1: evet, 0: hayır)')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
