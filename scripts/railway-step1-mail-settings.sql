-- Step 1: Create mail_settings table
CREATE TABLE IF NOT EXISTS `mail_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(50) NOT NULL,
  `setting_value` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default mail settings
INSERT INTO mail_settings (setting_key, setting_value, description) VALUES
('smtp_host', '', 'SMTP sunucu adresi'),
('smtp_port', '587', 'SMTP port (587 veya 465)'),
('smtp_secure', 'tls', 'SMTP güvenlik (tls veya ssl)'),
('smtp_user', '', 'SMTP kullanıcı adı'),
('smtp_password', '', 'SMTP şifre'),
('from_email', '', 'Gönderen email adresi'),
('from_name', '', 'Gönderen adı'),
('send_user_confirmation', '1', 'Kullanıcıya onay maili gönder (1: Evet, 0: Hayır)'),
('send_admin_notification', '1', 'Admin\'e bildirim gönder (1: Evet, 0: Hayır)')
ON DUPLICATE KEY UPDATE description = VALUES(description);

SELECT 'mail_settings table created!' as status;
