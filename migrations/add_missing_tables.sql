-- Eksik Tabloları Ekle (Railway'den Local'e)
-- Bu migration local veritabanını Railway ile senkronize eder

-- 1. online_payments tablosu (Railway'de var, local'de yok)
CREATE TABLE IF NOT EXISTS `online_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registration_id` int NOT NULL,
  `payment_provider` varchar(50) NOT NULL,
  `transaction_id` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'TRY',
  `status` enum('pending','success','failed','cancelled','refunded') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `card_mask` varchar(20) DEFAULT NULL,
  `card_type` varchar(20) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `installment_count` int DEFAULT '1',
  `commission_rate` decimal(5,4) DEFAULT '0.0000',
  `commission_amount` decimal(10,2) DEFAULT '0.00',
  `net_amount` decimal(10,2) DEFAULT NULL,
  `auth_code` varchar(20) DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `order_id` varchar(100) DEFAULT NULL,
  `conversation_id` varchar(100) DEFAULT NULL,
  `payment_id` varchar(100) DEFAULT NULL,
  `fraud_status` varchar(20) DEFAULT NULL,
  `response_code` varchar(10) DEFAULT NULL,
  `response_message` text,
  `error_code` varchar(10) DEFAULT NULL,
  `error_message` text,
  `raw_response` json DEFAULT NULL,
  `callback_received_at` timestamp NULL DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `idx_online_payments_transaction_id` (`transaction_id`),
  KEY `idx_online_payments_registration_id` (`registration_id`),
  KEY `idx_online_payments_status` (`status`),
  KEY `idx_online_payments_created_at` (`created_at`),
  CONSTRAINT `online_payments_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. pos_transactions tablosu (Railway'de var, local'de yok)
CREATE TABLE IF NOT EXISTS `pos_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registration_id` int DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'TRY',
  `status` enum('pending','success','failed','cancelled') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `card_mask` varchar(20) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `response_code` varchar(10) DEFAULT NULL,
  `response_message` text,
  `auth_code` varchar(20) DEFAULT NULL,
  `transaction_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `registration_id` (`registration_id`),
  CONSTRAINT `pos_transactions_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. online_payment_logs tablosunu kaldır (local'de var, Railway'de yok - artık kullanılmıyor)
-- DROP TABLE IF EXISTS `online_payment_logs`;
-- Not: Veri kaybını önlemek için yorum satırı olarak bırakıldı

SELECT 'Migration tamamlandı!' as message;
SELECT 'online_payments ve pos_transactions tabloları eklendi' as info;
