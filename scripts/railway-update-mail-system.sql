-- Railway Database Update Script
-- Mail System, Registration Settings, and Organization Name Support
-- Date: 2025-11-13

-- ============================================
-- 1. Create mail_settings table
-- ============================================
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

-- ============================================
-- 2. Create mail_logs table
-- ============================================
CREATE TABLE IF NOT EXISTS `mail_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipient_email` varchar(255) NOT NULL,
  `recipient_name` varchar(255) DEFAULT NULL,
  `subject` varchar(500) NOT NULL,
  `mail_type` varchar(50) NOT NULL COMMENT 'user_confirmation, admin_notification, test, custom',
  `status` varchar(20) NOT NULL COMMENT 'sent, failed',
  `error_message` text,
  `registration_id` int DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_recipient` (`recipient_email`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`mail_type`),
  KEY `idx_sent_at` (`sent_at`),
  KEY `registration_id` (`registration_id`),
  CONSTRAINT `mail_logs_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. Add new form_settings entries
-- ============================================
INSERT INTO form_settings (setting_key, setting_value, description) VALUES
('registration_start_date', '', 'Kayıt başlangıç tarihi (boş ise hemen açık)'),
('notification_email', '', 'Kayıt bildirim mail adresi'),
('bcc_email', '', 'Kayıt bildirim BCC mail adresi')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- ============================================
-- 4. Add organization name to page_settings
-- ============================================
INSERT INTO page_settings (setting_key, setting_value, description) VALUES
('organization_name', '', 'Organizasyon adı (Türkçe)'),
('organization_name_en', '', 'Organization name (English)')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- ============================================
-- 5. Verify tables exist
-- ============================================
SELECT 'Mail system tables created successfully!' as status;
SELECT COUNT(*) as mail_settings_count FROM mail_settings;
SELECT COUNT(*) as mail_logs_count FROM mail_logs;
SELECT COUNT(*) as form_settings_count FROM form_settings WHERE setting_key IN ('registration_start_date', 'notification_email', 'bcc_email');
SELECT COUNT(*) as page_settings_count FROM page_settings WHERE setting_key IN ('organization_name', 'organization_name_en');
