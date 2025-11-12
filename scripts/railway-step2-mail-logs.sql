-- Step 2: Create mail_logs table
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

SELECT 'mail_logs table created!' as status;
