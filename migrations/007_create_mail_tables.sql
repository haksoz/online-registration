-- Mail Settings Tablosu
CREATE TABLE IF NOT EXISTS `mail_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(50) NOT NULL,
  `setting_value` text,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mail ayarları';

-- Mail Logs Tablosu
CREATE TABLE IF NOT EXISTS `mail_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipient_email` varchar(255) NOT NULL,
  `recipient_name` varchar(255) DEFAULT NULL,
  `subject` varchar(500) NOT NULL,
  `mail_type` enum('user_confirmation','admin_notification','test','custom') NOT NULL,
  `status` enum('sent','failed') DEFAULT 'sent',
  `error_message` text,
  `registration_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_recipient_email` (`recipient_email`),
  KEY `idx_mail_type` (`mail_type`),
  KEY `idx_status` (`status`),
  KEY `idx_registration_id` (`registration_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mail gönderim logları';

-- Varsayılan Mail Ayarları
INSERT INTO `mail_settings` (`setting_key`, `setting_value`, `description`) VALUES
('smtp_host', '', 'SMTP sunucu adresi'),
('smtp_port', '587', 'SMTP port'),
('smtp_secure', 'tls', 'SMTP güvenlik (tls/ssl)'),
('smtp_user', '', 'SMTP kullanıcı adı'),
('smtp_password', '', 'SMTP şifre'),
('from_email', '', 'Gönderen email adresi'),
('from_name', '', 'Gönderen adı'),
('send_user_confirmation', '1', 'Kullanıcıya onay maili gönder (1=Evet, 0=Hayır)'),
('send_admin_notification', '1', 'Admin''e bildirim maili gönder (1=Evet, 0=Hayır)')
ON DUPLICATE KEY UPDATE setting_key=setting_key;
