-- MySQL dump 10.13  Distrib 9.3.0, for macos13.7 (x86_64)
--
-- Host: 127.0.0.1    Database: form_wizard
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `record_id` int NOT NULL,
  `action` enum('CREATE','UPDATE','DELETE') NOT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `changed_fields` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_table_record` (`table_name`,`record_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bank_accounts`
--

DROP TABLE IF EXISTS `bank_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_name` varchar(100) NOT NULL,
  `bank_name` varchar(100) NOT NULL,
  `account_holder` varchar(255) NOT NULL,
  `iban` varchar(34) NOT NULL,
  `currency` varchar(3) DEFAULT 'TRY',
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `swift_code` varchar(11) DEFAULT NULL COMMENT 'SWIFT/BIC kodu (döviz hesapları için)',
  `account_number` varchar(50) DEFAULT NULL COMMENT 'Hesap numarası (döviz hesapları için)',
  `bank_address` text COMMENT 'Banka adresi (döviz hesapları için)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bank_settings`
--

DROP TABLE IF EXISTS `bank_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(50) NOT NULL,
  `setting_value` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `exchange_rates`
--

DROP TABLE IF EXISTS `exchange_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exchange_rates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `currency_code` varchar(3) NOT NULL,
  `currency_name` varchar(50) NOT NULL,
  `rate_to_try` decimal(10,4) NOT NULL,
  `source` varchar(50) DEFAULT 'manual',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_currency` (`currency_code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `form_field_settings`
--

DROP TABLE IF EXISTS `form_field_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `form_field_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `field_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Alan adı (firstName, gender, company vb.)',
  `field_label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Türkçe etiket',
  `field_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Alan tipi (text, email, phone, select, radio)',
  `step_number` int NOT NULL COMMENT 'Hangi adımda (1, 2, 3, 4)',
  `is_visible` tinyint(1) DEFAULT '1' COMMENT 'Formda görünsün mü?',
  `is_required` tinyint(1) DEFAULT '1' COMMENT 'Zorunlu mu?',
  `display_order` int DEFAULT '0' COMMENT 'Görüntüleme sırası',
  `placeholder` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Placeholder text',
  `help_text` text COLLATE utf8mb4_unicode_ci COMMENT 'Yardım metni',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `field_name` (`field_name`),
  KEY `idx_step_number` (`step_number`),
  KEY `idx_is_visible` (`is_visible`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Form alanları ayarları';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `form_settings`
--

DROP TABLE IF EXISTS `form_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `form_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(50) NOT NULL,
  `setting_value` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `online_payment_logs`
--

DROP TABLE IF EXISTS `online_payment_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `online_payment_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transaction_id` int NOT NULL,
  `event_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'İşlem tipi (initiated, callback, success, failed, vb.)',
  `event_data` json DEFAULT NULL COMMENT 'İşlem detayları',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'İşlem yapılan IP',
  `user_agent` text COLLATE utf8mb4_unicode_ci COMMENT 'Tarayıcı bilgisi',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_transaction_id` (`transaction_id`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `online_payment_logs_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `online_payment_transactions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Online ödeme işlem logları';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `online_payment_transactions`
--

DROP TABLE IF EXISTS `online_payment_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `online_payment_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registration_id` int NOT NULL,
  `transaction_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Banka/Gateway transaction ID',
  `order_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Sipariş numarası',
  `amount` decimal(10,2) NOT NULL COMMENT 'İşlem tutarı',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'TRY' COMMENT 'Para birimi',
  `status` enum('pending','success','failed','cancelled','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Bankadan dönen durum kodu',
  `error_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Hata kodu (başarısız işlemler için)',
  `error_message` text COLLATE utf8mb4_unicode_ci COMMENT 'Hata mesajı',
  `gateway_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ödeme gateway adı (iyzico, paytr, vb.)',
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Banka adı',
  `card_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kart tipi (Visa, MasterCard, vb.)',
  `card_last4` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kart son 4 hanesi',
  `card_bin` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kart BIN numarası (ilk 6 hane)',
  `installment` int DEFAULT '1' COMMENT 'Taksit sayısı',
  `cardholder_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kart sahibi adı',
  `billing_address` text COLLATE utf8mb4_unicode_ci COMMENT 'Fatura adresi',
  `billing_city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Fatura şehri',
  `billing_country` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Fatura ülkesi (ISO code)',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'İşlem yapılan IP adresi',
  `is_3d_secure` tinyint(1) DEFAULT '0' COMMENT '3D Secure kullanıldı mı',
  `threeds_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '3D Secure durumu',
  `eci` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Electronic Commerce Indicator',
  `cavv` text COLLATE utf8mb4_unicode_ci COMMENT 'Cardholder Authentication Verification Value',
  `initiated_at` timestamp NULL DEFAULT NULL COMMENT 'İşlem başlatılma zamanı',
  `completed_at` timestamp NULL DEFAULT NULL COMMENT 'İşlem tamamlanma zamanı',
  `callback_received_at` timestamp NULL DEFAULT NULL COMMENT 'Callback alınma zamanı',
  `gateway_request` json DEFAULT NULL COMMENT 'Gateway''e gönderilen istek (hassas bilgiler hariç)',
  `gateway_response` json DEFAULT NULL COMMENT 'Gateway''den dönen yanıt',
  `fraud_score` int DEFAULT NULL COMMENT 'Fraud risk skoru (0-100)',
  `fraud_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Fraud kontrol durumu',
  `user_agent` text COLLATE utf8mb4_unicode_ci COMMENT 'Kullanıcı tarayıcı bilgisi',
  `session_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Session ID',
  `notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Ek notlar',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `idx_registration_id` (`registration_id`),
  KEY `idx_transaction_id` (`transaction_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_gateway_name` (`gateway_name`),
  CONSTRAINT `online_payment_transactions_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Online ödeme işlem kayıtları';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `page_settings`
--

DROP TABLE IF EXISTS `page_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `page_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(50) NOT NULL,
  `setting_value` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=178 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment_method_settings`
--

DROP TABLE IF EXISTS `payment_method_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_method_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `method_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ödeme yöntemi (online, bank_transfer)',
  `method_label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Türkçe etiket',
  `is_enabled` tinyint(1) DEFAULT '1' COMMENT 'Aktif mi?',
  `display_order` int DEFAULT '0' COMMENT 'Görüntüleme sırası',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Açıklama',
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Icon emoji veya class',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `method_name` (`method_name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ödeme yöntemleri ayarları';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment_settings`
--

DROP TABLE IF EXISTS `payment_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(50) NOT NULL,
  `setting_value` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `registration_logs`
--

DROP TABLE IF EXISTS `registration_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registration_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registration_id` int NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'IPv4 veya IPv6 adresi',
  `ip_version` enum('IPv4','IPv6') COLLATE utf8mb4_unicode_ci DEFAULT 'IPv4',
  `country_code` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ISO 3166-1 alpha-2 ülke kodu',
  `country_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci COMMENT 'Raw user agent string',
  `browser_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `browser_version` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `os_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `os_version` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_type` enum('desktop','mobile','tablet','bot') COLLATE utf8mb4_unicode_ci DEFAULT 'desktop',
  `device_vendor` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_model` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referrer` text COLLATE utf8mb4_unicode_ci COMMENT 'Referrer URL',
  `referrer_domain` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Referrer domain',
  `utm_source` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'UTM source parameter',
  `utm_medium` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'UTM medium parameter',
  `utm_campaign` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'UTM campaign parameter',
  `form_started_at` timestamp NULL DEFAULT NULL COMMENT 'Form başlangıç zamanı',
  `form_completed_at` timestamp NULL DEFAULT NULL COMMENT 'Form tamamlanma zamanı',
  `form_duration_seconds` int DEFAULT NULL COMMENT 'Form doldurma süresi (saniye)',
  `steps_completed` json DEFAULT NULL COMMENT 'Tamamlanan adımlar ve zamanları',
  `errors_encountered` json DEFAULT NULL COMMENT 'Karşılaşılan hatalar',
  `screen_resolution` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ekran çözünürlüğü (örn: 1920x1080)',
  `language` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tarayıcı dili',
  `timezone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kullanıcı timezone',
  `is_proxy` tinyint(1) DEFAULT '0' COMMENT 'Proxy kullanımı tespit edildi mi',
  `is_vpn` tinyint(1) DEFAULT '0' COMMENT 'VPN kullanımı tespit edildi mi',
  `is_tor` tinyint(1) DEFAULT '0' COMMENT 'Tor kullanımı tespit edildi mi',
  `risk_score` tinyint DEFAULT '0' COMMENT 'Risk skoru (0-100)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_registration_id` (`registration_id`),
  KEY `idx_ip_address` (`ip_address`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_device_type` (`device_type`),
  KEY `idx_risk_score` (`risk_score`),
  CONSTRAINT `registration_logs_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Kayıt işlemi log kayıtları';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `registration_types`
--

DROP TABLE IF EXISTS `registration_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registration_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `value` varchar(50) NOT NULL,
  `label` varchar(100) NOT NULL,
  `label_en` varchar(100) DEFAULT NULL COMMENT 'İngilizce etiket',
  `fee_try` decimal(10,2) NOT NULL,
  `fee_usd` decimal(10,2) DEFAULT '0.00',
  `fee_eur` decimal(10,2) DEFAULT '0.00',
  `description` text,
  `description_en` text COMMENT 'İngilizce açıklama',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `value` (`value`),
  KEY `idx_registration_types_value` (`value`),
  KEY `idx_registration_types_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `registrations`
--

DROP TABLE IF EXISTS `registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference_number` varchar(20) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `gender` enum('male','female','other','prefer_not_to_say') DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL COMMENT 'International phone number in E.164 format',
  `address` varchar(500) NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `invoice_type` enum('bireysel','kurumsal') NOT NULL,
  `invoice_full_name` varchar(255) DEFAULT NULL,
  `id_number` varchar(50) DEFAULT NULL,
  `invoice_address` varchar(500) DEFAULT NULL,
  `invoice_company_name` varchar(255) DEFAULT NULL,
  `tax_office` varchar(255) DEFAULT NULL,
  `tax_number` varchar(50) DEFAULT NULL,
  `registration_type` varchar(50) DEFAULT NULL,
  `registration_type_label_en` varchar(100) DEFAULT NULL COMMENT 'Kayıt türü İngilizce adı',
  `form_language` varchar(5) DEFAULT 'tr' COMMENT 'Form dili (tr/en)',
  `fee` decimal(10,2) NOT NULL,
  `currency_code` varchar(3) DEFAULT 'TRY',
  `fee_in_currency` decimal(10,2) DEFAULT NULL,
  `exchange_rate` decimal(10,4) DEFAULT '1.0000',
  `payment_method` enum('online','bank_transfer') NOT NULL,
  `payment_status` enum('pending','completed') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` tinyint DEFAULT '1' COMMENT '1=Aktif, 0=İptal Edildi, -1=Silinmiş',
  `refund_status` enum('none','pending','completed','rejected') DEFAULT 'none',
  `refund_amount` decimal(10,2) DEFAULT NULL,
  `refund_date` datetime DEFAULT NULL,
  `refund_notes` text,
  `refund_method` varchar(50) DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `cancelled_by` int DEFAULT NULL,
  `payment_receipt_url` varchar(500) DEFAULT NULL,
  `payment_receipt_filename` varchar(255) DEFAULT NULL,
  `payment_receipt_uploaded_at` datetime DEFAULT NULL,
  `payment_receipt_uploaded_by` int DEFAULT NULL,
  `payment_confirmed_at` datetime DEFAULT NULL,
  `payment_confirmed_by` int DEFAULT NULL,
  `payment_notes` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference_number` (`reference_number`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `step2_settings`
--

DROP TABLE IF EXISTS `step2_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `step2_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(50) NOT NULL,
  `setting_value` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `role` enum('admin','manager','reporter') NOT NULL DEFAULT 'reporter',
  `name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-11 12:41:29
