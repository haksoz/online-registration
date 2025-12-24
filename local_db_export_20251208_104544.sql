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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bank_accounts`
--

DROP TABLE IF EXISTS `bank_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_name` varchar(100) NOT NULL,
  `account_name_en` varchar(100) DEFAULT NULL COMMENT 'English account name',
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank_accounts`
--

LOCK TABLES `bank_accounts` WRITE;
/*!40000 ALTER TABLE `bank_accounts` DISABLE KEYS */;
INSERT INTO `bank_accounts` VALUES (4,'Türk Lirası Hesabı','Turkish Lira Account','Garanti BBVA','Bosphorus Kongre Organizasyon Etkinlik ve Danışmanlık Hiz.','TR19 0006 2001 0160 0006 2958 37','TRY','',1,1,'2025-11-16 21:32:06','2025-11-24 14:49:58',NULL,NULL,NULL),(5,'Euro Hesabı','Euro Account','Euro Bank AG','Bosphorus Kongre Organizasyon Etkinlik ve Danışmanlık Hiz.','DE89 3704 0044 0532 0130 00','EUR','',1,2,'2025-11-26 21:05:40','2025-11-26 21:05:40','EXEUDEFFXXX','EXEUDEFFXXX','Musterstrasse 1, 10115 Berlin, Germany');
/*!40000 ALTER TABLE `bank_accounts` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `bank_settings`
--

LOCK TABLES `bank_settings` WRITE;
/*!40000 ALTER TABLE `bank_settings` DISABLE KEYS */;
INSERT INTO `bank_settings` VALUES (1,'bank_name','Örnek Banka A.Ş.','Banka adı','2025-11-05 14:11:01','2025-11-16 21:35:40'),(2,'account_holder','Şirket Adı','Hesap sahibi','2025-11-05 14:11:01','2025-11-16 21:35:40'),(3,'iban','TR00 0000 0000 0000 0000 0000 00','IBAN numarası','2025-11-05 14:11:01','2025-11-16 21:35:40'),(4,'dekont_email','dekont@example.com','Dekont gönderilecek e-posta adresi','2025-11-05 14:11:01','2025-11-16 21:35:40'),(5,'dekont_message','Lütfen dekontunuzu {email} adresine iletiniz.','Dekont mesajı','2025-11-05 14:11:01','2025-11-16 21:35:40');
/*!40000 ALTER TABLE `bank_settings` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exchange_rates`
--

LOCK TABLES `exchange_rates` WRITE;
/*!40000 ALTER TABLE `exchange_rates` DISABLE KEYS */;
INSERT INTO `exchange_rates` VALUES (1,'TRY','Türk Lirası',1.0000,'manual','2025-11-26 23:00:42','2025-11-16 21:24:53'),(2,'USD','Amerikan Doları',42.4500,'manual','2025-11-26 23:00:42','2025-11-16 21:24:53'),(3,'EUR','Euro',49.2000,'manual','2025-11-26 23:00:42','2025-11-16 21:24:53');
/*!40000 ALTER TABLE `exchange_rates` ENABLE KEYS */;
UNLOCK TABLES;

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
  `show_early_bird_notice` tinyint(1) DEFAULT '1' COMMENT 'Erken kayıt uyarısını göster',
  PRIMARY KEY (`id`),
  UNIQUE KEY `field_name` (`field_name`),
  KEY `idx_step_number` (`step_number`),
  KEY `idx_is_visible` (`is_visible`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Form alanları ayarları';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `form_field_settings`
--

LOCK TABLES `form_field_settings` WRITE;
/*!40000 ALTER TABLE `form_field_settings` DISABLE KEYS */;
INSERT INTO `form_field_settings` VALUES (1,'firstName','Ad','text',1,1,1,1,'Ahmet',NULL,'2025-11-07 20:51:01','2025-11-07 20:51:01',1),(2,'lastName','Soyad','text',1,1,1,2,'Yılmaz',NULL,'2025-11-07 20:51:01','2025-11-07 21:20:00',1),(3,'gender','Cinsiyet','radio',1,1,0,5,NULL,NULL,'2025-11-07 20:51:01','2025-11-26 17:37:59',1),(4,'email','E-posta','email',1,1,1,3,'ornek@email.com',NULL,'2025-11-07 20:51:01','2025-11-14 18:25:52',1),(5,'phone','Telefon','phone',1,1,1,4,'Telefon numarası',NULL,'2025-11-07 20:51:01','2025-11-14 18:25:52',1),(6,'address','Adres','text',1,1,0,6,'Örnek Cadde No:123, İstanbul',NULL,'2025-11-07 20:51:01','2025-11-26 16:49:40',1),(7,'company','Şirket/Kurum','text',1,1,0,7,'Örnek Şirket A.Ş.',NULL,'2025-11-07 20:51:01','2025-11-26 17:37:59',1),(8,'department','Departman','text',1,1,0,8,'İnsan Kaynakları',NULL,'2025-11-07 20:51:01','2025-11-26 17:37:59',1),(9,'invoiceType','Fatura Türü','radio',1,1,1,9,NULL,NULL,'2025-11-07 20:51:01','2025-11-07 21:51:30',1),(10,'invoiceFullName','Fatura Ad Soyad','text',1,1,0,10,'Ad Soyad',NULL,'2025-11-07 20:51:01','2025-11-07 22:00:15',1),(11,'idNumber','TC Kimlik No','text',1,1,0,11,'12345678901',NULL,'2025-11-07 20:51:01','2025-11-07 20:51:01',1),(12,'invoiceAddress','Fatura Adresi','text',1,1,0,12,'Fatura adresi',NULL,'2025-11-07 20:51:01','2025-11-07 20:51:01',1),(13,'invoiceCompanyName','Şirket Adı','text',1,1,1,13,'Şirket Adı',NULL,'2025-11-07 20:51:01','2025-11-07 21:30:50',1),(14,'taxOffice','Vergi Dairesi','text',1,1,1,14,'Kadıköy',NULL,'2025-11-07 20:51:01','2025-11-07 21:30:50',1),(15,'taxNumber','Vergi No','text',1,1,1,15,'1234567890',NULL,'2025-11-07 20:51:01','2025-11-07 21:30:50',1);
/*!40000 ALTER TABLE `form_field_settings` ENABLE KEYS */;
UNLOCK TABLES;

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
  `early_bird_deadline` date DEFAULT NULL COMMENT 'Erken kayıt bitiş tarihi',
  `early_bird_enabled` tinyint(1) DEFAULT '0' COMMENT 'Erken kayıt aktif mi?',
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=193 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `form_settings`
--

LOCK TABLES `form_settings` WRITE;
/*!40000 ALTER TABLE `form_settings` DISABLE KEYS */;
INSERT INTO `form_settings` VALUES (1,'form_enabled','true',NULL,'2025-11-16 21:22:19','2025-11-27 09:23:33','2025-11-30',1),(2,'form_title','Kayıt Formu',NULL,'2025-11-16 21:22:19','2025-11-16 21:25:42',NULL,0),(3,'form_description','Lütfen bilgilerinizi eksiksiz doldurun',NULL,'2025-11-16 21:22:19','2025-11-16 21:25:42',NULL,0),(4,'success_message','Kaydınız başarıyla alındı. Teşekkür ederiz!',NULL,'2025-11-16 21:22:19','2025-11-16 21:25:42',NULL,0),(5,'require_address','false',NULL,'2025-11-16 21:22:19','2025-11-16 21:25:42',NULL,0),(6,'require_company','false',NULL,'2025-11-16 21:22:19','2025-11-16 21:25:42',NULL,0),(7,'require_department','false',NULL,'2025-11-16 21:22:19','2025-11-16 21:25:42',NULL,0),(36,'language','tr_en','Form dili (tr: Türkçe, en: English)','2025-11-17 11:57:53','2025-11-17 12:09:56',NULL,0),(37,'invoice_individual_note','','Bireysel fatura seçimi için uyarı notu','2025-11-17 11:57:53','2025-11-17 11:57:53',NULL,0),(38,'invoice_corporate_note','','Kurumsal fatura seçimi için uyarı notu','2025-11-17 11:57:53','2025-11-17 11:57:53',NULL,0),(39,'invoice_individual_note_en','','Bireysel fatura seçimi için uyarı notu (İngilizce)','2025-11-17 11:57:53','2025-11-17 11:57:53',NULL,0),(40,'invoice_corporate_note_en','','Kurumsal fatura seçimi için uyarı notu (İngilizce)','2025-11-17 11:57:53','2025-11-17 11:57:53',NULL,0),(66,'show_price_with_vat','true','Kayıt türlerinde fiyatları KDV dahil göster','2025-11-26 11:12:01','2025-11-27 12:08:08',NULL,0),(91,'registration_start_date','2025-11-01T19:47','Kayıt başlangıç tarihi (boş ise hemen açık)','2025-11-26 16:48:54','2025-11-26 16:48:54',NULL,0),(92,'registration_deadline','2026-05-09T19:48','Kayıt son tarihi (boş ise sınırsız)','2025-11-26 16:48:54','2025-11-26 16:48:54',NULL,0),(93,'cancellation_deadline','2026-04-07T19:48','Kayıt iptal son tarihi (boş ise sınırsız)','2025-11-26 16:48:54','2025-11-26 16:48:54',NULL,0),(94,'notification_email','h.canaksoz@gmail.com','Kayıt bildirim mail adresi','2025-11-26 16:48:54','2025-11-26 16:48:54',NULL,0),(95,'bcc_email','','Kayıt bildirim BCC mail adresi','2025-11-26 16:48:54','2025-11-26 16:48:54',NULL,0),(192,'show_early_bird_notice','true','Erken kayıt uyarısını göster','2025-11-27 12:08:08','2025-11-27 12:08:08',NULL,0);
/*!40000 ALTER TABLE `form_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mail_logs`
--

DROP TABLE IF EXISTS `mail_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mail_logs` (
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
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mail_logs`
--

LOCK TABLES `mail_logs` WRITE;
/*!40000 ALTER TABLE `mail_logs` DISABLE KEYS */;
INSERT INTO `mail_logs` VALUES (1,'haksoz@kapital-online.net',NULL,'Test Mail - Online Kayıt Sistemi','test','sent',NULL,NULL,'2025-11-26 16:53:09'),(2,'haksoz@kapital-online.net',NULL,'Test Mail - Online Kayıt Sistemi','test','sent',NULL,NULL,'2025-11-26 18:47:34'),(3,'haksoz@kapital-online.net','Halil Aksöz','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Kaydınız Alındı','user_confirmation','sent',NULL,41,'2025-11-26 20:27:04'),(4,'h.canaksoz@gmail.com','Kayıt Bildirimi','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Yeni Kayıt - Halil Aksöz - REG-2025-9270','admin_notification','sent',NULL,41,'2025-11-26 20:27:05'),(5,'haksoz@ko.com.tr','Halil Kara','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Kaydınız Alındı','user_confirmation','sent',NULL,42,'2025-11-26 20:32:10'),(6,'h.canaksoz@gmail.com','Kayıt Bildirimi','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Yeni Kayıt - Halil Kara - REG-2025-7061','admin_notification','sent',NULL,42,'2025-11-26 20:32:12'),(7,'haksoz@kapital-online.net','Olcay Kara','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Kaydınız Alındı','user_confirmation','sent',NULL,43,'2025-11-26 20:54:19'),(8,'h.canaksoz@gmail.com','Kayıt Bildirimi','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Yeni Kayıt - Olcay Kara - REG-2025-1604','admin_notification','sent',NULL,43,'2025-11-26 20:54:20'),(9,'haksoz@ko.com.tr','Halil Aksöz','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Kaydınız Alındı','user_confirmation','sent',NULL,44,'2025-11-26 21:28:30'),(10,'h.canaksoz@gmail.com','Kayıt Bildirimi','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Yeni Kayıt - Halil Aksöz - REG-2025-2128','admin_notification','sent',NULL,44,'2025-11-26 21:28:31'),(11,'haksoz@kapital-online.net','Olcay Kara','2nd International Oncology Nursing Association Congress - Registration Received','user_confirmation','sent',NULL,45,'2025-11-26 22:25:22'),(12,'h.canaksoz@gmail.com','Kayıt Bildirimi','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Yeni Kayıt - Olcay Kara - REG-2025-6548','admin_notification','sent',NULL,45,'2025-11-26 22:25:24'),(13,'haksoz@kapital-online.net','Olcay Kara','2nd International Oncology Nursing Association Congress - Registration Received','user_confirmation','sent',NULL,46,'2025-11-26 22:33:06'),(14,'h.canaksoz@gmail.com','Kayıt Bildirimi','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Yeni Kayıt - Olcay Kara - REG-2025-3436','admin_notification','sent',NULL,46,'2025-11-26 22:33:07'),(15,'haksoz@kapital-online.net','Halil Aksöz','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Kaydınız Alındı','user_confirmation','sent',NULL,47,'2025-11-26 23:17:40'),(16,'h.canaksoz@gmail.com','Kayıt Bildirimi','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Yeni Kayıt - Halil Aksöz - REG-2025-1833','admin_notification','sent',NULL,47,'2025-11-26 23:17:41'),(17,'haksoz@kapital-online.net','Halil Aksöz','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Kaydınız Alındı','user_confirmation','sent',NULL,47,'2025-11-26 23:19:41'),(18,'h.canaksoz@gmail.com','Kayıt Bildirimi','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Yeni Kayıt - Halil Aksöz - REG-2025-1833','admin_notification','sent',NULL,47,'2025-11-26 23:19:42'),(19,'haksoz@kapital-online.net','Ahsen Aksöz','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Kaydınız Alındı','user_confirmation','sent',NULL,48,'2025-11-26 23:23:20'),(20,'h.canaksoz@gmail.com','Kayıt Bildirimi','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Yeni Kayıt - Ahsen Aksöz - REG-2025-4229','admin_notification','sent',NULL,48,'2025-11-26 23:23:21'),(21,'haksoz@kapital-online.net','Ahmet Mutlu','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Kaydınız Alındı','user_confirmation','sent',NULL,49,'2025-11-26 23:27:10'),(22,'h.canaksoz@gmail.com','Kayıt Bildirimi','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Yeni Kayıt - Ahmet Mutlu - REG-2025-6870','admin_notification','sent',NULL,49,'2025-11-26 23:27:11'),(23,'haksoz@kapital-online.net','Halil Kara','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Kaydınız Alındı','user_confirmation','sent',NULL,50,'2025-11-26 23:34:15'),(24,'h.canaksoz@gmail.com','Kayıt Bildirimi','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Yeni Kayıt - Halil Kara - REG-2025-2818','admin_notification','sent',NULL,50,'2025-11-26 23:34:16'),(25,'haksoz@kapital-online.net','Hazal Acar','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Kaydınız Alındı','user_confirmation','sent',NULL,51,'2025-11-26 23:40:46'),(26,'h.canaksoz@gmail.com','Kayıt Bildirimi','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Yeni Kayıt - Hazal Acar - REG-2025-7776','admin_notification','sent',NULL,51,'2025-11-26 23:40:48'),(27,'haksoz@kapital-online.net','Ahmet Kabay','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Kaydınız Alındı','user_confirmation','sent',NULL,52,'2025-11-27 05:25:03'),(28,'h.canaksoz@gmail.com','Kayıt Bildirimi','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Yeni Kayıt - Ahmet Kabay - REG-2025-9560','admin_notification','sent',NULL,52,'2025-11-27 05:25:04'),(29,'haksoz@kapital-online.net','Halil Kara','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Kaydınız Alındı','user_confirmation','sent',NULL,53,'2025-11-27 06:24:48'),(30,'h.canaksoz@gmail.com','Kayıt Bildirimi','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Yeni Kayıt - Halil Kara - REG-2025-3399','admin_notification','sent',NULL,53,'2025-11-27 06:24:50'),(31,'haksoz@kapital-online.net','Halil Kara','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Kaydınız Alındı','user_confirmation','failed','queryAaaa ETIMEOUT smtp.yandex.com.tr',54,'2025-11-27 07:08:20'),(32,'h.canaksoz@gmail.com','Kayıt Bildirimi','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Yeni Kayıt - Halil Kara - REG-2025-7330','admin_notification','failed','queryAaaa ETIMEOUT smtp.yandex.com.tr',54,'2025-11-27 07:08:20'),(33,'haksoz@ko.com.tr','Melek Aksöz','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Kaydınız Alındı','user_confirmation','sent',NULL,55,'2025-11-27 09:41:34'),(34,'h.canaksoz@gmail.com','Kayıt Bildirimi','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Yeni Kayıt - Melek Aksöz - REG-2025-8506','admin_notification','sent',NULL,55,'2025-11-27 09:41:36'),(35,'gehynywy@mailinator.com','Yolanda Jennings','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Kaydınız Alındı','user_confirmation','sent',NULL,56,'2025-11-27 11:56:22'),(36,'h.canaksoz@gmail.com','Kayıt Bildirimi','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi - Yeni Kayıt - Yolanda Jennings - REG-2025-5787','admin_notification','sent',NULL,56,'2025-11-27 11:56:23');
/*!40000 ALTER TABLE `mail_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mail_settings`
--

DROP TABLE IF EXISTS `mail_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mail_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(50) NOT NULL,
  `setting_value` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mail_settings`
--

LOCK TABLES `mail_settings` WRITE;
/*!40000 ALTER TABLE `mail_settings` DISABLE KEYS */;
INSERT INTO `mail_settings` VALUES (1,'smtp_host','smtp.yandex.com.tr',NULL,'2025-11-16 21:24:03','2025-11-26 16:52:57'),(2,'smtp_port','465',NULL,'2025-11-16 21:24:03','2025-11-26 16:52:57'),(3,'smtp_secure','ssl',NULL,'2025-11-16 21:24:03','2025-11-26 16:52:57'),(4,'smtp_user','haksoz@kapital-online.net',NULL,'2025-11-16 21:24:03','2025-11-26 16:52:57'),(5,'smtp_password','scaeuhnuoccureeq',NULL,'2025-11-16 21:24:03','2025-11-26 16:52:57'),(6,'from_email','haksoz@kapital-online.net',NULL,'2025-11-16 21:24:03','2025-11-26 16:52:57'),(7,'from_name','Online Kayıt Sistemi',NULL,'2025-11-16 21:24:03','2025-11-26 16:52:57'),(8,'admin_notification_email','admin@example.com',NULL,'2025-11-16 21:24:03','2025-11-16 21:25:42'),(9,'send_confirmation_email','true',NULL,'2025-11-16 21:24:03','2025-11-16 21:25:42'),(10,'send_admin_notification','true',NULL,'2025-11-16 21:24:03','2025-11-16 21:25:42');
/*!40000 ALTER TABLE `mail_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `online_payment_transactions`
--

DROP TABLE IF EXISTS `online_payment_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `online_payment_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registration_id` int DEFAULT NULL,
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
  `customer_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registration_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Online ödeme işlem kayıtları';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `online_payment_transactions`
--

LOCK TABLES `online_payment_transactions` WRITE;
/*!40000 ALTER TABLE `online_payment_transactions` DISABLE KEYS */;
INSERT INTO `online_payment_transactions` VALUES (1,NULL,'TXN_1763995972227_202','ORD_REG-2025-6956',18600.00,'TRY','success','approved',NULL,NULL,'Test Gateway',NULL,'VISA','7894','454671',1,'Test','Halil Kara','haksoz@kapital-online.net','+905554443322','Pediatri Aşı Kursu, Dernek Üyesi Olmayan Kayıt, Yoğun Bakım Kursu',NULL,NULL,NULL,'::1',0,NULL,NULL,NULL,'2025-11-24 14:52:52','2025-11-24 14:52:52',NULL,NULL,NULL,10,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,'2025-11-24 14:52:52','2025-11-24 14:52:52'),(2,2,'TXN_1763996039704_679','ORD_REG-2025-9404',13800.00,'TRY','success','approved',NULL,NULL,'Test Gateway',NULL,'VISA','7894','454671',1,'test','Halil Kara','haksoz@kapital-online.net','+905554443322','Pediatri Aşı Kursu, Dernek Üyesi Kayıt',NULL,NULL,NULL,'::1',0,NULL,NULL,NULL,'2025-11-24 14:53:59','2025-11-24 14:53:59',NULL,NULL,NULL,10,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,'2025-11-24 14:53:59','2025-11-24 14:53:59'),(3,4,'TXN_1764146972322_375','ORD_REG-2025-7138',15000.00,'TRY','success','approved',NULL,NULL,'Test Gateway',NULL,'VISA','7894','454671',1,'ttt','Olcay Kara','haksoz@kapital-online.net','+904445556655','Dernek Üyesi Kayıt, Yoğun Bakım Kursu',NULL,NULL,NULL,'::1',0,NULL,NULL,NULL,'2025-11-26 08:49:32','2025-11-26 08:49:32',NULL,NULL,NULL,10,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,'2025-11-26 08:49:32','2025-11-26 08:49:32'),(4,NULL,'TXN_1764235844187_839','ORD_REG-2025-3683',5400.00,'TRY','failed','declined','51','Limit Yetersiz','Test Gateway',NULL,'VISA','7894','454671',1,'aaaa','Halil Aksöz','haksoz@ko.com.tr','+905362283171','Pediatri Aşı Kursu, Lisans ve Lisansüstü Öğrenci Kayıt',NULL,NULL,NULL,'::1',0,NULL,NULL,NULL,'2025-11-27 09:30:44','2025-11-27 09:30:44',NULL,NULL,NULL,15,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,'2025-11-27 09:30:44','2025-11-27 09:30:44'),(5,NULL,'TXN_1764235861445_533','ORD_REG-2025-6156',5400.00,'TRY','failed','declined','37','Çalıntı Kart','Test Gateway',NULL,'VISA','7894','454671',1,'aaaa','Halil Aksöz','haksoz@ko.com.tr','+905362283171','Pediatri Aşı Kursu, Lisans ve Lisansüstü Öğrenci Kayıt',NULL,NULL,NULL,'::1',0,NULL,NULL,NULL,'2025-11-27 09:31:01','2025-11-27 09:31:01',NULL,NULL,NULL,95,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,'2025-11-27 09:31:01','2025-11-27 09:31:01'),(6,NULL,'TXN_1764236192303_560','ORD_REG-2025-9834',5400.00,'TRY','failed','declined','37','Çalıntı Kart','Test Gateway',NULL,'VISA','7894','454671',1,'tttt','Melek Aksöz','haksoz@ko.com.tr','+905362283171','Pediatri Aşı Kursu, Lisans ve Lisansüstü Öğrenci Kayıt',NULL,NULL,NULL,'::1',0,NULL,NULL,NULL,'2025-11-27 09:36:32','2025-11-27 09:36:32',NULL,NULL,NULL,95,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,'2025-11-27 09:36:32','2025-11-27 09:36:32'),(7,NULL,'TXN_1764236479991_643','ORD_REG-2025-5641',5400.00,'TRY','failed','declined','51','Limit Yetersiz','Test Gateway',NULL,'VISA','7894','454671',1,'hasan','Melek Aksöz','haksoz@ko.com.tr','+905362283171','Lisans ve Lisansüstü Öğrenci Kayıt, Yoğun Bakım Kursu',NULL,NULL,NULL,'::1',0,NULL,NULL,NULL,'2025-11-27 09:41:19','2025-11-27 09:41:19',NULL,NULL,NULL,15,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,'2025-11-27 09:41:19','2025-11-27 09:41:19'),(8,55,'TXN_1764236488729_420','ORD_REG-2025-8506',5400.00,'TRY','success','approved',NULL,NULL,'Test Gateway',NULL,'VISA','7894','454671',1,'hasan','Melek Aksöz','haksoz@ko.com.tr','+905362283171','Lisans ve Lisansüstü Öğrenci Kayıt, Yoğun Bakım Kursu',NULL,NULL,NULL,'::1',0,NULL,NULL,NULL,'2025-11-27 09:41:28','2025-11-27 09:41:28',NULL,NULL,NULL,10,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,'2025-11-27 09:41:28','2025-11-27 09:41:28');
/*!40000 ALTER TABLE `online_payment_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `online_payments`
--

DROP TABLE IF EXISTS `online_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `online_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registration_id` int NOT NULL,
  `payment_provider` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'TRY',
  `status` enum('pending','success','failed','cancelled','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_mask` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `installment_count` int DEFAULT '1',
  `commission_rate` decimal(5,4) DEFAULT '0.0000',
  `commission_amount` decimal(10,2) DEFAULT '0.00',
  `net_amount` decimal(10,2) DEFAULT NULL,
  `auth_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conversation_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fraud_status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `response_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `response_message` text COLLATE utf8mb4_unicode_ci,
  `error_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `online_payments`
--

LOCK TABLES `online_payments` WRITE;
/*!40000 ALTER TABLE `online_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `online_payments` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=274 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page_settings`
--

LOCK TABLES `page_settings` WRITE;
/*!40000 ALTER TABLE `page_settings` DISABLE KEYS */;
INSERT INTO `page_settings` VALUES (1,'site_title','Etkinlik Kayıt Formu',NULL,'2025-11-16 21:22:19','2025-11-26 22:21:43'),(2,'site_description','Etkinliğimize kayıt olmak için formu doldurun',NULL,'2025-11-16 21:22:19','2025-11-26 22:21:43'),(3,'logo_url','',NULL,'2025-11-16 21:22:19','2025-11-26 22:21:43'),(4,'primary_color','#3B82F6',NULL,'2025-11-16 21:22:19','2025-11-26 22:21:43'),(5,'secondary_color','#1E40AF',NULL,'2025-11-16 21:22:19','2025-11-26 22:21:43'),(6,'contact_email','info@example.com',NULL,'2025-11-16 21:22:19','2025-11-26 22:21:43'),(7,'contact_phone','+90 555 123 4567',NULL,'2025-11-16 21:22:19','2025-11-26 22:21:43'),(8,'footer_text','© 2025 Tüm hakları saklıdır',NULL,'2025-11-16 21:22:19','2025-11-26 22:21:43'),(41,'registration_start_date','2025-11-17 00:00:00',NULL,'2025-11-16 21:25:42','2025-11-26 22:21:43'),(42,'registration_end_date','2025-12-17 23:59:59',NULL,'2025-11-16 21:25:42','2025-11-26 22:21:43'),(43,'cancellation_deadline','2025-11-24 23:59:59',NULL,'2025-11-16 21:25:42','2025-11-26 22:21:43'),(44,'max_participants','1000',NULL,'2025-11-16 21:25:42','2025-11-26 22:21:43'),(45,'homepage_url','https://ohdkongre.org/','Anasayfa URL adresi','2025-11-17 11:57:53','2025-11-26 22:21:43'),(63,'form_title','II. Uluslararası Onkoloji Hemşireliği Derneği Kongresi',NULL,'2025-11-23 13:05:53','2025-11-26 22:21:43'),(64,'form_title_en','2nd International Oncology Nursing Association Congress',NULL,'2025-11-23 13:05:53','2025-11-26 22:21:43'),(65,'show_subtitle','true',NULL,'2025-11-23 13:05:53','2025-11-26 22:21:43'),(66,'show_header','true',NULL,'2025-11-23 13:05:53','2025-11-26 22:21:44'),(67,'form_subtitle','Online Kayıt Sistemi',NULL,'2025-11-23 13:05:53','2025-11-26 22:21:44'),(68,'form_subtitle_en','Online Registration System',NULL,'2025-11-23 13:05:53','2025-11-26 22:21:44'),(88,'header_title_font_size','34',NULL,'2025-11-23 13:06:21','2025-11-26 22:21:44'),(89,'header_subtitle_font_size','30',NULL,'2025-11-23 13:06:21','2025-11-26 22:21:44'),(153,'header_title_color','#ffffff',NULL,'2025-11-23 13:07:52','2025-11-26 22:21:44'),(154,'header_subtitle_color','#ffffff',NULL,'2025-11-23 13:07:52','2025-11-26 22:21:44'),(155,'header_background_color','#72606b',NULL,'2025-11-23 13:07:52','2025-11-26 22:21:44'),(235,'form_top_info_message','* Sadece on-line kayıt başvuruları kabul edilecektir.\n* Bildiri özeti gönderenlerin 10 Şubat 2026 tarihine kadar ödeme ve kayıt işlemlerinin tamamlanması gerekmektedir.',NULL,'2025-11-26 21:27:04','2025-11-26 22:21:44'),(236,'form_top_info_message_en','*Only online registration applications are accepted.\n*Abstract submissions and payment and registration must be completed by February 10, 2026.',NULL,'2025-11-26 21:27:04','2025-11-26 22:21:44'),(266,'footer_message','Her türlü soru veya yardim için organizasyon sekreteryası ile iletişime geçebilirsiniz.',NULL,'2025-11-26 22:21:44','2025-11-26 22:21:44'),(267,'footer_message_en','For any questions or assistance, you can contact the organization secretariat.',NULL,'2025-11-26 22:21:44','2025-11-26 22:21:44');
/*!40000 ALTER TABLE `page_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_gateways`
--

DROP TABLE IF EXISTS `payment_gateways`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_gateways` (
  `id` int NOT NULL AUTO_INCREMENT,
  `gateway_name` varchar(50) NOT NULL COMMENT 'Denizbank, Garanti, İş Bankası, vb.',
  `gateway_code` varchar(50) NOT NULL COMMENT 'denizbank, garanti, isbank',
  `shop_code` varchar(100) DEFAULT NULL COMMENT 'Mağaza kodu',
  `merchant_id` varchar(100) DEFAULT NULL COMMENT 'Merchant ID',
  `merchant_pass_encrypted` text COMMENT 'Şifreli merchant şifresi',
  `terminal_id` varchar(50) DEFAULT NULL COMMENT 'Terminal ID (bazı bankalar için)',
  `store_key` text COMMENT 'Store Key (bazı bankalar için)',
  `api_url_test` varchar(255) DEFAULT NULL COMMENT 'Test ortamı URL',
  `api_url_production` varchar(255) DEFAULT NULL COMMENT 'Production URL',
  `test_mode` tinyint(1) DEFAULT '1' COMMENT 'Test modu aktif mi?',
  `is_active` tinyint(1) DEFAULT '0' COMMENT 'Bu gateway aktif mi?',
  `display_order` int DEFAULT '0' COMMENT 'Sıralama',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gateway_code` (`gateway_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_gateways`
--

LOCK TABLES `payment_gateways` WRITE;
/*!40000 ALTER TABLE `payment_gateways` DISABLE KEYS */;
INSERT INTO `payment_gateways` VALUES (1,'Denizbank','denizbank',NULL,NULL,NULL,NULL,NULL,'https://sanaltest.denizbank.com/mpi/Default.aspx','https://sanalposprov.denizbank.com/mpi/Default.aspx',1,1,1,'2025-11-27 11:32:09','2025-11-27 13:46:35'),(2,'Garanti Bankası','garanti',NULL,NULL,NULL,NULL,NULL,'https://sanalposprovtest.garantibbva.com.tr/servlet/gt3dengine','https://sanalposprov.garanti.com.tr/servlet/gt3dengine',1,0,2,'2025-11-27 11:32:09','2025-11-27 13:46:35'),(3,'İş Bankası','isbank',NULL,NULL,NULL,NULL,NULL,'https://entegrasyon.asseco-see.com.tr/fim/est3Dgate','https://www.sanalakpos.com/fim/est3Dgate',1,0,3,'2025-11-27 11:32:09','2025-11-27 11:32:09');
/*!40000 ALTER TABLE `payment_gateways` ENABLE KEYS */;
UNLOCK TABLES;

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
  `warning_message` text COLLATE utf8mb4_unicode_ci COMMENT 'Ödeme yöntemi uyarı mesajı (Türkçe)',
  `warning_message_en` text COLLATE utf8mb4_unicode_ci COMMENT 'Ödeme yöntemi uyarı mesajı (İngilizce)',
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Icon emoji veya class',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `method_name` (`method_name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ödeme yöntemleri ayarları';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_method_settings`
--

LOCK TABLES `payment_method_settings` WRITE;
/*!40000 ALTER TABLE `payment_method_settings` DISABLE KEYS */;
INSERT INTO `payment_method_settings` VALUES (1,'bank_transfer','Banka Transferi',1,1,NULL,'test utarı mesajı',NULL,NULL,'2025-11-16 21:23:09','2025-11-26 22:08:50'),(2,'online','Online Ödeme',1,2,NULL,'Banka kartlarından ücret tahsil edilememektedir. Lütfen kredi kartı bilgisi giriniz','Fees cannot be collected from debit cards. Please enter your credit card information.',NULL,'2025-11-16 21:23:09','2025-11-27 05:55:47');
/*!40000 ALTER TABLE `payment_method_settings` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_settings`
--

LOCK TABLES `payment_settings` WRITE;
/*!40000 ALTER TABLE `payment_settings` DISABLE KEYS */;
INSERT INTO `payment_settings` VALUES (1,'dekont_email','ohdkongre@bosphorusmice.net','Dekont gönderilecek e-posta adresi','2025-11-05 14:17:55','2025-11-26 18:11:46'),(2,'dekont_message','Ödeme yaparken lütfen açıklama kısmına \"referans no\" bilgisini yazın ve dekontunuzu {email} adresine iletiniz.','Dekont mesajı','2025-11-05 14:17:55','2025-11-26 18:11:46'),(7,'dekont_message_en','When making payment, please write the \"reference number\" in the description section and send your receipt to {email}.',NULL,'2025-11-11 23:12:34','2025-11-26 18:11:46');
/*!40000 ALTER TABLE `payment_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_transactions`
--

DROP TABLE IF EXISTS `payment_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `form_submission_id` int DEFAULT NULL COMMENT 'Form kaydı ID',
  `gateway_id` int DEFAULT NULL COMMENT 'Hangi gateway kullanıldı',
  `order_id` varchar(100) NOT NULL COMMENT 'Benzersiz sipariş ID',
  `amount` decimal(10,2) NOT NULL COMMENT 'Tutar',
  `currency` varchar(3) DEFAULT 'TRY' COMMENT 'Para birimi',
  `status` enum('pending','success','failed','cancelled') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL COMMENT 'credit_card, debit_card',
  `card_last4` varchar(4) DEFAULT NULL COMMENT 'Kartın son 4 hanesi',
  `card_type` varchar(20) DEFAULT NULL COMMENT 'Visa, MasterCard, vb.',
  `transaction_id` varchar(100) DEFAULT NULL COMMENT 'Banka transaction ID',
  `auth_code` varchar(50) DEFAULT NULL COMMENT 'Yetkilendirme kodu',
  `bank_response` text COMMENT 'Bankanın tam response',
  `error_code` varchar(50) DEFAULT NULL COMMENT 'Hata kodu',
  `error_message` text COMMENT 'Hata mesajı',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'Kullanıcı IP',
  `user_agent` text COMMENT 'Kullanıcı tarayıcı bilgisi',
  `transaction_date` datetime DEFAULT NULL COMMENT 'İşlem tarihi',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `gateway_id` (`gateway_id`),
  CONSTRAINT `payment_transactions_ibfk_1` FOREIGN KEY (`gateway_id`) REFERENCES `payment_gateways` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_transactions`
--

LOCK TABLES `payment_transactions` WRITE;
/*!40000 ALTER TABLE `payment_transactions` DISABLE KEYS */;
INSERT INTO `payment_transactions` VALUES (1,NULL,1,'ORD-e0f30303-8986-4500-9af8-b76ec2bdecbc',13200.00,'TRY','pending','credit_card','4509',NULL,NULL,NULL,NULL,NULL,NULL,'::1','node',NULL,'2025-11-27 13:47:24','2025-11-27 13:47:24'),(2,NULL,1,'ORD-26d13749-436f-409e-ad90-0c956a38ad07',13200.00,'TRY','pending','credit_card','4509',NULL,NULL,NULL,NULL,NULL,NULL,'::1','node',NULL,'2025-11-27 13:49:31','2025-11-27 13:49:31');
/*!40000 ALTER TABLE `payment_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pos_transactions`
--

DROP TABLE IF EXISTS `pos_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pos_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registration_id` int DEFAULT NULL,
  `transaction_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'TRY',
  `status` enum('pending','success','failed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_mask` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `response_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `response_message` text COLLATE utf8mb4_unicode_ci,
  `auth_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `registration_id` (`registration_id`),
  CONSTRAINT `pos_transactions_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pos_transactions`
--

LOCK TABLES `pos_transactions` WRITE;
/*!40000 ALTER TABLE `pos_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `pos_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registration_categories`
--

DROP TABLE IF EXISTS `registration_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registration_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label_tr` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label_en` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description_tr` text COLLATE utf8mb4_unicode_ci,
  `description_en` text COLLATE utf8mb4_unicode_ci,
  `warning_message_tr` text COLLATE utf8mb4_unicode_ci COMMENT 'Kategori uyarı mesajı (Türkçe)',
  `warning_message_en` text COLLATE utf8mb4_unicode_ci COMMENT 'Kategori uyarı mesajı (İngilizce)',
  `is_visible` tinyint(1) DEFAULT '1',
  `is_required` tinyint(1) DEFAULT '0',
  `allow_multiple` tinyint(1) DEFAULT '0',
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_display_order` (`display_order`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registration_categories`
--

LOCK TABLES `registration_categories` WRITE;
/*!40000 ALTER TABLE `registration_categories` DISABLE KEYS */;
INSERT INTO `registration_categories` VALUES (1,'kongre','Kongre Kayıt','Congress Registration','','','* Belge gerektiren seçimlerde belgeyi yüklemeden kaydınızı tamamlayamazsınız.','* For elections that require documentation, you cannot complete your registration without uploading the document.',1,1,0,1,1,'🎤','2025-11-22 18:36:49','2025-11-26 21:47:34'),(2,'kurs','Kurs Kayıt','Course Registration','','','* Kurslar aynı gün ve saatlerde gerçekleştirileceğinden sadece bir kursa kayıt yaptırılabilir.\n* Kurslar için kontenjandaki yeriniz kurs bedelinin ödenmesi ile kesinleşir.\n* Kongre kaydı yaptırmayıp sadece kursa katılanlar kongreye bildiri gönderemeyecek ve kongre katılım belgesi alamayacaklardır. Sadece kurs katılım belgesi verilecektir.','* Courses are offered on the same day, and discounts apply, so you can only register for one course.\n* Your place in the quota for each course is confirmed upon payment of the course fee.\n* Those who do not register for the congress but only attend the course will not be able to submit a paper or receive a certificate of participation. Only the certificate of participation for the course will be provided.',1,0,0,2,1,'📚','2025-11-22 18:36:49','2025-11-26 21:41:56'),(3,'konaklama','Konaklama','Accommodation','','',NULL,NULL,0,0,0,3,0,'🏨','2025-11-22 18:36:49','2025-11-22 22:12:39');
/*!40000 ALTER TABLE `registration_categories` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Kayıt işlemi log kayıtları';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registration_logs`
--

LOCK TABLES `registration_logs` WRITE;
/*!40000 ALTER TABLE `registration_logs` DISABLE KEYS */;
INSERT INTO `registration_logs` VALUES (11,23,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 14:45:33',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 14:45:33','2025-11-26 14:45:33'),(12,24,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 14:46:47',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 14:46:47','2025-11-26 14:46:47'),(13,25,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 16:56:46',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 16:56:46','2025-11-26 16:56:46'),(14,26,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 17:06:36',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 17:06:36','2025-11-26 17:06:36'),(15,27,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 17:12:18',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 17:12:18','2025-11-26 17:12:18'),(16,28,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 17:20:39',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 17:20:39','2025-11-26 17:20:39'),(17,29,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 17:24:04',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 17:24:04','2025-11-26 17:24:04'),(18,30,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 17:34:59',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 17:34:59','2025-11-26 17:34:59'),(19,31,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 17:42:17',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 17:42:17','2025-11-26 17:42:17'),(20,32,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 17:49:28',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 17:49:28','2025-11-26 17:49:28'),(21,33,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 18:11:10',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 18:11:10','2025-11-26 18:11:10'),(22,34,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 18:21:30',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 18:21:30','2025-11-26 18:21:30'),(23,35,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 18:28:59',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 18:28:59','2025-11-26 18:28:59'),(24,36,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 18:37:23',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 18:37:23','2025-11-26 18:37:23'),(25,37,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 18:45:52',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 18:45:52','2025-11-26 18:45:52'),(26,38,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 18:52:17',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 18:52:17','2025-11-26 18:52:17'),(27,39,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 20:03:43',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 20:03:43','2025-11-26 20:03:43'),(28,40,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 20:21:43',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 20:21:43','2025-11-26 20:21:43'),(29,41,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 20:27:00',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 20:27:00','2025-11-26 20:27:00'),(30,42,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 20:32:05',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 20:32:05','2025-11-26 20:32:05'),(31,43,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 20:54:15',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 20:54:15','2025-11-26 20:54:15'),(32,44,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 21:28:26',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 21:28:26','2025-11-26 21:28:26'),(33,45,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 22:25:19',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 22:25:19','2025-11-26 22:25:19'),(34,46,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 22:33:01',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 22:33:01','2025-11-26 22:33:01'),(35,47,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 23:17:35',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 23:17:35','2025-11-26 23:17:35'),(36,48,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 23:23:14',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 23:23:14','2025-11-26 23:23:14'),(37,49,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 23:27:04',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 23:27:04','2025-11-26 23:27:04'),(38,50,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 23:34:09',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 23:34:09','2025-11-26 23:34:09'),(39,51,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-26 23:40:42',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-26 23:40:42','2025-11-26 23:40:42'),(40,52,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-27 05:24:58',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-27 05:24:58','2025-11-27 05:24:58'),(41,53,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-27 06:24:42',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-27 06:24:42','2025-11-27 06:24:42'),(42,54,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-27 07:08:16',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-27 07:08:16','2025-11-27 07:08:16'),(43,55,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-27 09:41:28',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-27 09:41:28','2025-11-27 09:41:28'),(44,56,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-27 11:56:15',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-27 11:56:15','2025-11-27 11:56:15'),(45,57,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-27 13:47:25',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-27 13:47:25','2025-11-27 13:47:25'),(46,58,'::1','IPv4',NULL,NULL,NULL,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',NULL,NULL,NULL,NULL,'desktop',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-27 13:49:31',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,'2025-11-27 13:49:31','2025-11-27 13:49:31');
/*!40000 ALTER TABLE `registration_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registration_selections`
--

DROP TABLE IF EXISTS `registration_selections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registration_selections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registration_id` int NOT NULL,
  `registration_type_id` int NOT NULL,
  `category_id` int NOT NULL COMMENT 'Hangi kategoriden seçildi',
  `applied_fee_try` decimal(10,2) NOT NULL COMMENT 'Uygulanmış TL fiyatı',
  `applied_currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'TRY',
  `applied_fee_amount` decimal(10,2) NOT NULL COMMENT 'Seçilen para birimindeki fiyat',
  `exchange_rate` decimal(10,4) NOT NULL DEFAULT '1.0000' COMMENT 'Kayıt anındaki kur',
  `vat_rate` decimal(5,4) NOT NULL DEFAULT '0.2000' COMMENT '0.20 = %20 KDV',
  `vat_amount_try` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'KDV tutarı TL',
  `total_try` decimal(10,2) NOT NULL COMMENT 'KDV dahil toplam TL',
  `payment_status` enum('pending','completed','refunded','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `is_early_bird` tinyint(1) DEFAULT '0' COMMENT 'Erken kayıt uygulandı mı?',
  `is_cancelled` tinyint(1) DEFAULT '0' COMMENT 'Seçim iptal edildi mi?',
  `cancelled_at` timestamp NULL DEFAULT NULL COMMENT 'İptal tarihi',
  `cancelled_by` int DEFAULT NULL COMMENT 'İptal eden kullanıcı',
  `cancel_reason` text COLLATE utf8mb4_unicode_ci COMMENT 'İptal nedeni',
  `refund_status` enum('none','pending','approved','rejected','completed') COLLATE utf8mb4_unicode_ci DEFAULT 'none' COMMENT 'İade durumu',
  `refund_amount` decimal(10,2) DEFAULT '0.00' COMMENT 'İade tutarı',
  `refund_requested_at` timestamp NULL DEFAULT NULL COMMENT 'İade talep tarihi',
  `refund_approved_at` timestamp NULL DEFAULT NULL COMMENT 'İade onay tarihi',
  `refund_approved_by` int DEFAULT NULL COMMENT 'İadeyi onaylayan',
  `refund_completed_at` timestamp NULL DEFAULT NULL COMMENT 'İade tamamlanma tarihi',
  `refund_notes` text COLLATE utf8mb4_unicode_ci COMMENT 'İade notları',
  `refund_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'İade yöntemi',
  `document_filename` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Yüklenen belge dosya adı',
  `document_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Yüklenen belge URL',
  `document_uploaded_at` timestamp NULL DEFAULT NULL COMMENT 'Belge yükleme tarihi',
  `document_verified` tinyint(1) DEFAULT '0' COMMENT 'Belge doğrulandı mı?',
  `document_verified_at` timestamp NULL DEFAULT NULL COMMENT 'Belge doğrulama tarihi',
  `document_verified_by` int DEFAULT NULL COMMENT 'Belgeyi doğrulayan admin',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_registration` (`registration_id`),
  KEY `idx_type` (`registration_type_id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_early_bird` (`is_early_bird`),
  CONSTRAINT `registration_selections_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `registration_selections_ibfk_2` FOREIGN KEY (`registration_type_id`) REFERENCES `registration_types` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `registration_selections_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `registration_categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registration_selections`
--

LOCK TABLES `registration_selections` WRITE;
/*!40000 ALTER TABLE `registration_selections` DISABLE KEYS */;
INSERT INTO `registration_selections` VALUES (1,1,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-24 14:51:43'),(2,1,6,2,1000.00,'TRY',1000.00,1.0000,0.2000,200.00,1200.00,'cancelled',0,1,'2025-11-24 15:00:06',NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-24 14:51:43'),(3,2,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'completed',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-24 14:53:59'),(4,2,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'completed',0,1,'2025-11-24 14:58:40',NULL,NULL,'rejected',0.00,'2025-11-24 14:58:40',NULL,NULL,NULL,'eeee',NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-24 14:53:59'),(5,3,8,1,10500.00,'TRY',10500.00,1.0000,0.2000,2100.00,12600.00,'completed',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-24 15:04:49'),(6,3,10,2,3000.00,'TRY',3000.00,1.0000,0.2000,600.00,3600.00,'completed',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-24 15:04:49'),(7,4,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'completed',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 08:49:32'),(8,4,10,2,3000.00,'TRY',3000.00,1.0000,0.2000,600.00,3600.00,'completed',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 08:49:32'),(9,5,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'completed',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 09:49:34'),(10,5,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'refunded',0,1,'2025-11-26 09:55:02',NULL,NULL,'completed',2400.00,'2025-11-26 09:55:02','2025-11-26 09:55:33',1,'2025-11-26 09:55:33','Para iadesi yapıldı','Banka Transferi',NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 09:49:34'),(11,6,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 09:59:01'),(12,6,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 09:59:01'),(13,7,1,1,1000.00,'TRY',1000.00,1.0000,0.2000,200.00,1200.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 11:53:08'),(14,7,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 11:53:08'),(15,7,6,2,1000.00,'TRY',1000.00,1.0000,0.2000,200.00,1200.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 11:53:08'),(16,8,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 11:55:24'),(17,8,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 11:55:24'),(18,8,6,2,1000.00,'TRY',1000.00,1.0000,0.2000,200.00,1200.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 11:55:24'),(19,9,9,1,3000.00,'TRY',3000.00,1.0000,0.2000,600.00,3600.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 13:11:44'),(20,9,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 13:11:44'),(21,10,9,1,3000.00,'TRY',3000.00,1.0000,0.2000,600.00,3600.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,'document.pdf','/uploads/receipts/receipt-1764168134776.pdf','2025-11-26 11:42:15',0,NULL,NULL,'2025-11-26 14:42:15'),(22,10,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 14:42:15'),(23,23,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 14:45:33'),(24,23,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 14:45:33'),(25,24,9,1,3000.00,'TRY',3000.00,1.0000,0.2000,600.00,3600.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,'document.pdf','/uploads/receipts/receipt-1764168407696.pdf','2025-11-26 11:46:47',0,NULL,NULL,'2025-11-26 14:46:47'),(26,24,10,2,3000.00,'TRY',3000.00,1.0000,0.2000,600.00,3600.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 14:46:47'),(27,25,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 16:56:46'),(28,25,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 16:56:46'),(29,26,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 17:06:36'),(30,26,6,2,1000.00,'TRY',1000.00,1.0000,0.2000,200.00,1200.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 17:06:36'),(31,27,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 17:12:18'),(32,27,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 17:12:18'),(33,28,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 17:20:39'),(34,28,10,2,3000.00,'TRY',3000.00,1.0000,0.2000,600.00,3600.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 17:20:39'),(35,29,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 17:24:04'),(36,29,10,2,3000.00,'TRY',3000.00,1.0000,0.2000,600.00,3600.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 17:24:04'),(37,30,8,1,10500.00,'TRY',10500.00,1.0000,0.2000,2100.00,12600.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 17:34:59'),(38,30,6,2,1000.00,'TRY',1000.00,1.0000,0.2000,200.00,1200.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 17:34:59'),(39,30,10,2,3000.00,'TRY',3000.00,1.0000,0.2000,600.00,3600.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 17:34:59'),(40,31,8,1,10500.00,'TRY',10500.00,1.0000,0.2000,2100.00,12600.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 17:42:17'),(41,31,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 17:42:17'),(42,32,8,1,10500.00,'TRY',10500.00,1.0000,0.2000,2100.00,12600.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 17:49:28'),(43,32,6,2,1000.00,'TRY',1000.00,1.0000,0.2000,200.00,1200.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 17:49:28'),(44,32,10,2,3000.00,'TRY',3000.00,1.0000,0.2000,600.00,3600.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 17:49:28'),(45,33,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 18:11:10'),(46,33,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 18:11:10'),(47,34,8,1,10500.00,'TRY',10500.00,1.0000,0.2000,2100.00,12600.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 18:21:30'),(48,34,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 18:21:30'),(49,35,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 18:28:59'),(50,35,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 18:28:59'),(51,36,8,1,10500.00,'TRY',10500.00,1.0000,0.2000,2100.00,12600.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 18:37:23'),(52,36,6,2,1000.00,'TRY',1000.00,1.0000,0.2000,200.00,1200.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 18:37:23'),(53,37,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 18:45:52'),(54,37,6,2,1000.00,'TRY',1000.00,1.0000,0.2000,200.00,1200.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 18:45:52'),(55,38,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 18:52:17'),(56,38,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 18:52:17'),(57,39,8,1,10500.00,'TRY',10500.00,1.0000,0.2000,2100.00,12600.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 20:03:43'),(58,39,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 20:03:43'),(59,40,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 20:21:43'),(60,40,6,2,1000.00,'TRY',1000.00,1.0000,0.2000,200.00,1200.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 20:21:43'),(61,41,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 20:27:00'),(62,41,10,2,3000.00,'TRY',3000.00,1.0000,0.2000,600.00,3600.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 20:27:00'),(63,42,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 20:32:05'),(64,42,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 20:32:05'),(65,42,6,2,1000.00,'TRY',1000.00,1.0000,0.2000,200.00,1200.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 20:32:05'),(66,43,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 20:54:15'),(67,43,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 20:54:15'),(68,43,6,2,1000.00,'TRY',1000.00,1.0000,0.2000,200.00,1200.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 20:54:15'),(69,44,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 21:28:26'),(70,44,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 21:28:26'),(71,45,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 22:25:19'),(72,45,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 22:25:19'),(73,46,8,1,10500.00,'TRY',10500.00,1.0000,0.2000,2100.00,12600.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 22:33:01'),(74,46,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 22:33:01'),(75,47,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 23:17:34'),(76,47,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 23:17:34'),(77,48,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 23:23:14'),(78,48,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 23:23:14'),(79,49,8,1,10500.00,'TRY',10500.00,1.0000,0.2000,2100.00,12600.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 23:27:04'),(80,49,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 23:27:04'),(81,50,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 23:34:09'),(82,50,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 23:34:09'),(83,51,9,1,3000.00,'TRY',3000.00,1.0000,0.2000,600.00,3600.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,'Ekran Resmi 2025-11-20 13.15.23.png','/uploads/banners/banner-1764200441245.png','2025-11-26 20:40:41',0,NULL,NULL,'2025-11-26 23:40:41'),(84,51,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-26 23:40:41'),(85,52,7,1,9840.00,'TRY',9840.00,1.0000,0.2000,1968.00,11808.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-27 05:24:58'),(86,52,4,2,3444.00,'TRY',3444.00,1.0000,0.2000,688.80,4132.80,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-27 05:24:58'),(87,53,7,1,10500.00,'TRY',10500.00,1.0000,0.2000,2100.00,12600.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-27 06:24:42'),(88,53,4,2,2000.00,'TRY',2000.00,1.0000,0.2000,400.00,2400.00,'pending',0,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-27 06:24:42'),(89,54,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'completed',1,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-27 07:08:16'),(90,54,4,2,1500.00,'TRY',1500.00,1.0000,0.2000,300.00,1800.00,'cancelled',1,1,'2025-11-27 12:01:30',NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-27 07:08:16'),(91,55,9,1,3000.00,'TRY',3000.00,1.0000,0.2000,600.00,3600.00,'completed',1,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,'Ekran Resmi 2025-11-20 13.15.23.png','/uploads/banners/banner-1764236488699.png','2025-11-27 06:41:28',0,NULL,NULL,'2025-11-27 09:41:28'),(92,55,10,2,1500.00,'TRY',1500.00,1.0000,0.2000,300.00,1800.00,'completed',1,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-27 09:41:28'),(93,56,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'completed',1,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-27 11:56:15'),(94,56,4,2,1500.00,'TRY',1500.00,1.0000,0.2000,300.00,1800.00,'refunded',1,1,'2025-11-27 12:00:38',NULL,NULL,'completed',1800.00,'2025-11-27 12:00:38','2025-11-27 12:00:42',1,'2025-11-27 12:00:42','Para iadesi yapıldı','Banka Transferi',NULL,NULL,NULL,0,NULL,NULL,'2025-11-27 11:56:15'),(95,57,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'completed',1,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-27 13:47:25'),(96,57,4,2,1500.00,'TRY',1500.00,1.0000,0.2000,300.00,1800.00,'completed',1,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-27 13:47:25'),(97,58,7,1,9500.00,'TRY',9500.00,1.0000,0.2000,1900.00,11400.00,'completed',1,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-27 13:49:31'),(98,58,4,2,1500.00,'TRY',1500.00,1.0000,0.2000,300.00,1800.00,'completed',1,0,NULL,NULL,NULL,'none',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-11-27 13:49:31');
/*!40000 ALTER TABLE `registration_selections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registration_types`
--

DROP TABLE IF EXISTS `registration_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registration_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int DEFAULT NULL,
  `value` varchar(50) NOT NULL,
  `label` varchar(100) NOT NULL,
  `label_en` varchar(100) DEFAULT NULL COMMENT 'İngilizce etiket',
  `fee_try` decimal(10,2) NOT NULL,
  `fee_usd` decimal(10,2) DEFAULT '0.00',
  `fee_eur` decimal(10,2) DEFAULT '0.00',
  `vat_rate` decimal(5,4) DEFAULT '0.2000' COMMENT 'KDV oranı (0.20 = %20)',
  `requires_document` tinyint(1) DEFAULT '0' COMMENT 'Belge yükleme zorunlu mu?',
  `document_label` varchar(200) DEFAULT NULL COMMENT 'Belge etiketi (TR)',
  `document_label_en` varchar(200) DEFAULT NULL COMMENT 'Belge etiketi (EN)',
  `document_description` text COMMENT 'Belge açıklaması (TR)',
  `document_description_en` text COMMENT 'Belge açıklaması (EN)',
  `description` text,
  `description_en` text COMMENT 'İngilizce açıklama',
  `is_active` tinyint(1) DEFAULT '1',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `early_bird_fee_try` decimal(10,2) DEFAULT NULL COMMENT 'Erken kayıt ücreti (TL)',
  `early_bird_fee_usd` decimal(10,2) DEFAULT NULL COMMENT 'Erken kayıt ücreti (USD)',
  `early_bird_fee_eur` decimal(10,2) DEFAULT NULL COMMENT 'Erken kayıt ücreti (EUR)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `value` (`value`),
  KEY `idx_registration_types_value` (`value`),
  KEY `idx_registration_types_active` (`is_active`),
  KEY `fk_registration_types_category` (`category_id`),
  CONSTRAINT `fk_registration_types_category` FOREIGN KEY (`category_id`) REFERENCES `registration_categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registration_types`
--

LOCK TABLES `registration_types` WRITE;
/*!40000 ALTER TABLE `registration_types` DISABLE KEYS */;
INSERT INTO `registration_types` VALUES (1,1,'standart','Standart Katılım','Standard Participation',1000.00,30.00,27.00,0.2000,0,NULL,NULL,NULL,NULL,NULL,NULL,0,0,'2025-11-16 21:25:42','2025-11-24 14:44:51',NULL,NULL,NULL),(2,1,'ogrenci','Öğrenci','Student',500.00,15.00,13.50,0.2000,0,NULL,NULL,NULL,NULL,NULL,NULL,0,0,'2025-11-16 21:25:42','2025-11-22 22:24:30',NULL,NULL,NULL),(3,1,'kurumsal','Kurumsal','Corporate',2000.00,60.00,54.00,0.2000,0,NULL,NULL,NULL,NULL,NULL,NULL,0,0,'2025-11-16 21:25:42','2025-11-24 14:44:54',NULL,NULL,NULL),(4,2,'pediatri_asi_kursu','Pediatri Aşı Kursu','Pediatric Vaccination Course',2000.00,0.00,0.00,0.2000,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,'2025-11-22 20:39:14','2025-11-27 06:04:47',1500.00,NULL,NULL),(5,1,'ogrenci2','Öğrenci2','Student',3000.00,80.00,60.00,0.2000,1,'xxx','xxx','yyy','yyy','Lütfen öğrenci belgenizi yükleyiniz','Please upload your student certificate',0,0,'2025-11-22 22:26:55','2025-11-24 14:45:01',NULL,NULL,NULL),(6,2,'gece_nobeti_kursu','Gece Nöbeti Kursu','Night Watch Course',2000.00,0.00,0.00,0.2000,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,'2025-11-22 22:59:55','2025-11-27 06:04:26',1500.00,NULL,NULL),(7,1,'dernek_uyesi_kayit','Dernek Üyesi Kayıt','Association Member Registration',10500.00,0.00,0.00,0.2000,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,'2025-11-24 14:42:11','2025-11-27 06:01:58',9500.00,NULL,NULL),(8,1,'dernek_uyesi_olmayan_kayit','Dernek Üyesi Olmayan Kayıt','Non-Association Member Registration',11500.00,0.00,0.00,0.2000,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,'2025-11-24 14:43:00','2025-11-27 06:02:32',10500.00,NULL,NULL),(9,1,'lisans_ve_lisansustu_ogrenci_kayit','Lisans ve Lisansüstü Öğrenci Kayıt','Undergraduate and Graduate Student Registration',4000.00,0.00,0.00,0.2000,1,'Öğrenci Belgesi gerekmektedir','Student Certificate Required',NULL,NULL,'Öğrenci Belgesi gerekmektedir.','Student Certificate Required',1,0,'2025-11-24 14:44:26','2025-11-27 06:02:55',3000.00,NULL,NULL),(10,2,'yogun_bakim_kursu','Yoğun Bakım Kursu','Intensive Care Course',2000.00,0.00,0.00,0.2000,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,'2025-11-24 14:48:26','2025-11-27 06:04:58',1500.00,NULL,NULL);
/*!40000 ALTER TABLE `registration_types` ENABLE KEYS */;
UNLOCK TABLES;

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
  `address` varchar(500) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `invoice_type` enum('bireysel','kurumsal') NOT NULL,
  `invoice_full_name` varchar(255) DEFAULT NULL,
  `id_number` varchar(50) DEFAULT NULL,
  `invoice_address` varchar(500) DEFAULT NULL,
  `invoice_company_name` varchar(255) DEFAULT NULL,
  `tax_office` varchar(255) DEFAULT NULL,
  `tax_number` varchar(50) DEFAULT NULL,
  `registration_type` text,
  `registration_type_label_en` text,
  `form_language` varchar(5) DEFAULT 'tr' COMMENT 'Form dili (tr/en)',
  `fee` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'TRY' COMMENT 'Seçilen para birimi',
  `total_fee` decimal(10,2) DEFAULT '0.00' COMMENT 'Tüm seçimlerin toplamı',
  `vat_amount` decimal(10,2) DEFAULT '0.00' COMMENT 'Toplam KDV tutarı',
  `grand_total` decimal(10,2) DEFAULT '0.00' COMMENT 'KDV dahil genel toplam',
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
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrations`
--

LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
INSERT INTO `registrations` VALUES (11,NULL,NULL,NULL,NULL,'Ahmet Yılmaz','ahmet@test.com','5551234567','İstanbul',NULL,NULL,'bireysel',NULL,NULL,NULL,NULL,NULL,NULL,'dernek_uyesi',NULL,'tr',9500.00,'TRY',0.00,0.00,0.00,'TRY',NULL,1.0000,'online','completed','2025-11-21 14:43:56',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,NULL,NULL,NULL,NULL,'Ayşe Demir','ayse@test.com','5551234568','Ankara',NULL,NULL,'bireysel',NULL,NULL,NULL,NULL,NULL,NULL,'dernek_uyesi',NULL,'tr',9500.00,'TRY',0.00,0.00,0.00,'TRY',NULL,1.0000,'bank_transfer','completed','2025-11-22 14:43:56',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,NULL,NULL,NULL,NULL,'Mehmet Kaya','mehmet@test.com','5551234569','İzmir',NULL,NULL,'bireysel',NULL,NULL,NULL,NULL,NULL,NULL,'ogrenci',NULL,'tr',7500.00,'TRY',0.00,0.00,0.00,'TRY',NULL,1.0000,'online','completed','2025-11-23 14:43:56',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,NULL,NULL,NULL,NULL,'Fatma Şahin','fatma@test.com','5551234570','Bursa',NULL,NULL,'bireysel',NULL,NULL,NULL,NULL,NULL,NULL,'ogrenci',NULL,'tr',7500.00,'TRY',0.00,0.00,0.00,'TRY',NULL,1.0000,'bank_transfer','completed','2025-11-24 14:43:56',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(15,NULL,NULL,NULL,NULL,'Ali Çelik','ali@test.com','5551234571','Antalya',NULL,NULL,'bireysel',NULL,NULL,NULL,NULL,NULL,NULL,'dernek_uyesi_degil',NULL,'tr',5000.00,'TRY',0.00,0.00,0.00,'TRY',NULL,1.0000,'online','completed','2025-11-25 14:43:56',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(16,NULL,NULL,NULL,NULL,'Zeynep Arslan','zeynep@test.com','5551234572','Adana',NULL,NULL,'bireysel',NULL,NULL,NULL,NULL,NULL,NULL,'dernek_uyesi',NULL,'tr',9500.00,'TRY',0.00,0.00,0.00,'TRY',NULL,1.0000,'bank_transfer','pending','2025-11-24 14:43:56',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(17,NULL,NULL,NULL,NULL,'Can Öztürk','can@test.com','5551234573','Gaziantep',NULL,NULL,'bireysel',NULL,NULL,NULL,NULL,NULL,NULL,'ogrenci',NULL,'tr',7500.00,'TRY',0.00,0.00,0.00,'TRY',NULL,1.0000,'bank_transfer','pending','2025-11-25 14:43:56',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(18,NULL,NULL,NULL,NULL,'Elif Yıldız','elif@test.com','5551234574','Konya',NULL,NULL,'bireysel',NULL,NULL,NULL,NULL,NULL,NULL,'dernek_uyesi_degil',NULL,'tr',5000.00,'TRY',0.00,0.00,0.00,'TRY',NULL,1.0000,'bank_transfer','pending','2025-11-26 14:43:56',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(19,NULL,NULL,NULL,NULL,'Burak Aydın','burak@test.com','5551234575','Kayseri',NULL,NULL,'bireysel',NULL,NULL,NULL,NULL,NULL,NULL,'dernek_uyesi',NULL,'tr',9500.00,'TRY',0.00,0.00,0.00,'TRY',NULL,1.0000,'online','completed','2025-11-16 14:43:56',0,'pending',9500.00,NULL,NULL,NULL,'2025-11-25 17:43:56',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(20,NULL,NULL,NULL,NULL,'Selin Koç','selin@test.com','5551234576','Eskişehir',NULL,NULL,'bireysel',NULL,NULL,NULL,NULL,NULL,NULL,'ogrenci',NULL,'tr',7500.00,'TRY',0.00,0.00,0.00,'TRY',NULL,1.0000,'bank_transfer','completed','2025-11-18 14:43:56',0,'pending',7500.00,NULL,NULL,NULL,'2025-11-26 17:43:56',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(21,NULL,NULL,NULL,NULL,'Deniz Yurt','deniz@test.com','5551234577','Trabzon',NULL,NULL,'bireysel',NULL,NULL,NULL,NULL,NULL,NULL,'dernek_uyesi_degil',NULL,'tr',5000.00,'TRY',0.00,0.00,0.00,'TRY',NULL,1.0000,'bank_transfer','pending','2025-11-20 14:43:56',0,'none',NULL,NULL,NULL,NULL,'2025-11-26 17:43:56',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(22,NULL,NULL,NULL,NULL,'Kemal Öz','kemal@test.com','5551234578','Samsun',NULL,NULL,'bireysel',NULL,NULL,NULL,NULL,NULL,NULL,'ogrenci',NULL,'tr',7500.00,'TRY',0.00,0.00,0.00,'TRY',NULL,1.0000,'online','completed','2025-11-14 14:43:56',0,'rejected',7500.00,NULL,NULL,NULL,'2025-11-24 17:43:56',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(23,'REG-2025-2264','hasan can','Aksöz',NULL,'hasan can Aksöz','ismailesin@yandex.com','+905554443322',NULL,NULL,NULL,'bireysel','hasan can Aksöz',NULL,NULL,NULL,NULL,NULL,'Pediatri Aşı Kursu, Dernek Üyesi Kayıt','Pediatric Vaccination Course, Association Member Registration','tr',13800.00,'TRY',0.00,0.00,0.00,'TRY',13800.00,1.0000,'bank_transfer','pending','2025-11-26 14:45:33',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(24,'REG-2025-2928','Halil','Aksöz',NULL,'Halil Aksöz','haksoz@kapital-online.net','+905554443322',NULL,NULL,NULL,'bireysel','Halil Aksöz',NULL,NULL,NULL,NULL,NULL,'Lisans ve Lisansüstü Öğrenci Kayıt, Yoğun Bakım Kursu','Undergraduate and Graduate Student Registration, Intensive Care Course','tr',7200.00,'TRY',0.00,0.00,0.00,'TRY',7200.00,1.0000,'bank_transfer','pending','2025-11-26 14:46:47',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(25,'REG-2025-4681','Erim','Terim',NULL,'Erim Terim','haksoz@kapital-online.net','+905554443333','Ataşehir',NULL,NULL,'bireysel','Erim Terim','11111111110','istanbul sultanbeyli',NULL,NULL,NULL,'Pediatri Aşı Kursu, Dernek Üyesi Kayıt','Pediatric Vaccination Course, Association Member Registration','tr',13800.00,'TRY',0.00,0.00,0.00,'TRY',13800.00,1.0000,'bank_transfer','pending','2025-11-26 16:56:46',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(26,'REG-2025-9083','Halil','Kara',NULL,'Halil Kara','haksoz@ko.com.tr','+905362283171','MALTEPE MAH. ESKİ ÇIRPICI YOLU SK. MERIDYEN IŞ MERKEZI',NULL,NULL,'bireysel','Halil Kara',NULL,NULL,NULL,NULL,NULL,'Gece Nöbeti Kursu, Dernek Üyesi Kayıt','Night Watch Course, Association Member Registration','tr',12600.00,'TRY',0.00,0.00,0.00,'TRY',12600.00,1.0000,'bank_transfer','pending','2025-11-26 17:06:36',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(27,'REG-2025-7886','hasan can','Kara',NULL,'hasan can Kara','haksoz@kapital-online.net','+905554443322',NULL,NULL,NULL,'bireysel','hasan can Kara',NULL,NULL,NULL,NULL,NULL,'Pediatri Aşı Kursu, Dernek Üyesi Kayıt','Pediatric Vaccination Course, Association Member Registration','tr',13800.00,'TRY',0.00,0.00,0.00,'TRY',13800.00,1.0000,'bank_transfer','pending','2025-11-26 17:12:18',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(28,'REG-2025-5457','Olcay','Kara',NULL,'Olcay Kara','haksoz@kapital-online.net','+905554443333',NULL,NULL,NULL,'bireysel','Olcay Kara',NULL,NULL,NULL,NULL,NULL,'Dernek Üyesi Kayıt, Yoğun Bakım Kursu','Association Member Registration, Intensive Care Course','tr',15000.00,'TRY',0.00,0.00,0.00,'TRY',15000.00,1.0000,'bank_transfer','pending','2025-11-26 17:20:39',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(29,'REG-2025-2467','Ahmet','Kara',NULL,'Ahmet Kara','haksoz@kapital-online.net','+904445565566',NULL,NULL,NULL,'bireysel','Ahmet Kara',NULL,NULL,NULL,NULL,NULL,'Dernek Üyesi Kayıt, Yoğun Bakım Kursu','Association Member Registration, Intensive Care Course','tr',15000.00,'TRY',0.00,0.00,0.00,'TRY',15000.00,1.0000,'bank_transfer','pending','2025-11-26 17:24:04',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(30,'REG-2025-2759','Olcay','Kara',NULL,'Olcay Kara','haksoz@kapital-online.net','+905554443332','MALTEPE MAH. ESKİ ÇIRPICI YOLU SK. MERIDYEN IŞ MERKEZI',NULL,NULL,'bireysel','Olcay Kara','11111111110','istanbul sultanbeyli',NULL,NULL,NULL,'Gece Nöbeti Kursu, Dernek Üyesi Olmayan Kayıt, Yoğun Bakım Kursu','Night Watch Course, Non-Association Member Registration, Intensive Care Course','tr',17400.00,'TRY',0.00,0.00,0.00,'TRY',17400.00,1.0000,'bank_transfer','pending','2025-11-26 17:34:59',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(31,'REG-2025-2050','Melek','Aksöz','female','Melek Aksöz','haksoz@kapital-online.net','+905555544322','Acıbadem Mah. Gömeç Sok. Akgün İş Merkezi No:37/4 34660 Kadıköy / İstanbul','Marmara Derneği','Halklailişkiler','kurumsal',NULL,NULL,'Acıbadem Mah. Gömeç Sok. Akgün İş Merkezi No:37/4 34660 Kadıköy / İstanbul','KAPİTAL ONLİNE BİLGİSAYAR VE İLETİŞİM HİZMETLERİ TİC.LTD.ŞTİ','KADIKÖY','55443344553','Pediatri Aşı Kursu, Dernek Üyesi Olmayan Kayıt','Pediatric Vaccination Course, Non-Association Member Registration','tr',15000.00,'TRY',0.00,0.00,0.00,'TRY',15000.00,1.0000,'bank_transfer','pending','2025-11-26 17:42:17',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(32,'REG-2025-9002','Halil','Aksöz','male','Halil Aksöz','haksoz@ko.com.tr','+905554443322','Acıbadem Mah. Gömeç Sok. Akgün İş Merkezi No:37/4 34660 Kadıköy / İstanbul','Marmara Derneği','Halklailişkiler','kurumsal',NULL,NULL,'Acıbadem Mah. Gömeç Sok. Akgün İş Merkezi No:37/4 34660 Kadıköy / İstanbul','KAPİTAL ONLİNE BİLGİSAYAR VE İLETİŞİM HİZMETLERİ TİC.LTD.ŞTİ','ümraniye','55443344553','Gece Nöbeti Kursu, Dernek Üyesi Olmayan Kayıt, Yoğun Bakım Kursu','Night Watch Course, Non-Association Member Registration, Intensive Care Course','tr',17400.00,'TRY',0.00,0.00,0.00,'TRY',17400.00,1.0000,'bank_transfer','pending','2025-11-26 17:49:28',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(33,'REG-2025-6218','Olcay','Kara','male','Olcay Kara','haksoz@kapital-online.net','+904443332211','Acıbadem Mah. Gömeç Sok. Akgün İş Merkezi No:37/4 34660 Kadıköy / İstanbul','Dogal Hayat','Başkan','bireysel','Olcay Kara','11111111110','istanbul sultanbeyli',NULL,NULL,NULL,'Pediatri Aşı Kursu, Dernek Üyesi Kayıt','Pediatric Vaccination Course, Association Member Registration','tr',13800.00,'TRY',0.00,0.00,0.00,'TRY',13800.00,1.0000,'bank_transfer','pending','2025-11-26 18:11:10',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(34,'REG-2025-9157','Ahmet','Mutlu','male','Ahmet Mutlu','haksoz@kapital-online.net','+905554443332','Acıbadem Mah. Gömeç Sok. Akgün İş Merkezi No:37/4 34660 Kadıköy / İstanbul','Company','Halklailişkiler','kurumsal',NULL,NULL,'Acıbadem Mah. Gömeç Sok. Akgün İş Merkezi No:37/4 34660 Kadıköy / İstanbul','KAPİTAL ONLİNE BİLGİSAYAR VE İLETİŞİM HİZMETLERİ TİC.LTD.ŞTİ','KADIKÖY','55443344553','Pediatri Aşı Kursu, Dernek Üyesi Olmayan Kayıt','Pediatric Vaccination Course, Non-Association Member Registration','tr',15000.00,'TRY',0.00,0.00,0.00,'TRY',15000.00,1.0000,'bank_transfer','pending','2025-11-26 18:21:30',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(35,'REG-2025-6689','Halil','Aksöz','male','Halil Aksöz','haksoz@ko.com.tr','+904443332222','Acıbadem Mah. Gömeç Sok. Akgün İş Merkezi No:37/4 34660 Kadıköy / İstanbul','Marmara Derneği','Halklailişkiler','bireysel','Halil Aksöz','11111111110','ist',NULL,NULL,NULL,'Pediatri Aşı Kursu, Dernek Üyesi Kayıt','Pediatric Vaccination Course, Association Member Registration','tr',13800.00,'TRY',0.00,0.00,0.00,'TRY',13800.00,1.0000,'bank_transfer','pending','2025-11-26 18:28:59',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(36,'REG-2025-6383','Halil','Kara','male','Halil Kara','haksoz@kapital-online.net','+904443332211','MALTEPE MAH. ESKİ ÇIRPICI YOLU SK. MERIDYEN IŞ MERKEZI','Company','Başkan','bireysel','Halil Kara','11111111110','Acıbadem Mah. Gömeç Sok. Akgün İş Merkezi No:37/4 34660 Kadıköy / İstanbul',NULL,NULL,NULL,'Gece Nöbeti Kursu, Dernek Üyesi Olmayan Kayıt','Night Watch Course, Non-Association Member Registration','tr',13800.00,'TRY',0.00,0.00,0.00,'TRY',13800.00,1.0000,'bank_transfer','pending','2025-11-26 18:37:23',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(37,'REG-2025-3255','Hazal','Sarı','female','Hazal Sarı','haksoz@kapital-online.net','+904443335544','Acıbadem Mah. Gömeç Sok. Akgün İş Merkezi No:37/4 34660 Kadıköy / İstanbul','Marmara Derneği','Halklailişkiler','bireysel','Hazal Sarı','11111111110','ttt',NULL,NULL,NULL,'Gece Nöbeti Kursu, Dernek Üyesi Kayıt','Night Watch Course, Association Member Registration','tr',12600.00,'TRY',0.00,0.00,0.00,'TRY',12600.00,1.0000,'bank_transfer','pending','2025-11-26 18:45:52',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(38,'REG-2025-1282','hasan can','Aksöz','male','hasan can Aksöz','haksoz@kapital-online.net','+904443332211',NULL,NULL,NULL,'bireysel','hasan can Aksöz',NULL,NULL,NULL,NULL,NULL,'Pediatri Aşı Kursu, Dernek Üyesi Kayıt','Pediatric Vaccination Course, Association Member Registration','tr',13800.00,'TRY',0.00,0.00,0.00,'TRY',13800.00,1.0000,'bank_transfer','pending','2025-11-26 18:52:17',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(39,'REG-2025-1544','Halil','Kara','male','Halil Kara','haksoz@kapital-online.net','+905443322211',NULL,NULL,NULL,'bireysel','Halil Kara',NULL,NULL,NULL,NULL,NULL,'Pediatri Aşı Kursu, Dernek Üyesi Olmayan Kayıt','Pediatric Vaccination Course, Non-Association Member Registration','tr',15000.00,'TRY',0.00,0.00,0.00,'TRY',15000.00,1.0000,'bank_transfer','pending','2025-11-26 20:03:43',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(40,'REG-2025-8047','Halil','Aksöz','male','Halil Aksöz','haksoz@kapital-online.net','+905554443322','MALTEPE MAH. ESKİ ÇIRPICI YOLU SK. MERIDYEN IŞ MERKEZI',NULL,NULL,'bireysel','Halil Aksöz',NULL,NULL,NULL,NULL,NULL,'Gece Nöbeti Kursu, Dernek Üyesi Kayıt','Night Watch Course, Association Member Registration','tr',12600.00,'TRY',0.00,0.00,0.00,'TRY',12600.00,1.0000,'bank_transfer','pending','2025-11-26 20:21:43',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(41,'REG-2025-9270','Halil','Aksöz','male','Halil Aksöz','haksoz@kapital-online.net','+904443332211','MALTEPE MAH. ESKİ ÇIRPICI YOLU SK. MERIDYEN IŞ MERKEZI',NULL,NULL,'bireysel','Halil Aksöz',NULL,NULL,NULL,NULL,NULL,'Dernek Üyesi Kayıt, Yoğun Bakım Kursu','Association Member Registration, Intensive Care Course','tr',15000.00,'TRY',0.00,0.00,0.00,'TRY',15000.00,1.0000,'bank_transfer','pending','2025-11-26 20:27:00',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(42,'REG-2025-7061','Halil','Kara','male','Halil Kara','haksoz@ko.com.tr','+905362283171','MALTEPE MAH. ESKİ ÇIRPICI YOLU SK. MERIDYEN IŞ MERKEZI',NULL,NULL,'bireysel','Halil Kara',NULL,NULL,NULL,NULL,NULL,'Pediatri Aşı Kursu, Gece Nöbeti Kursu, Dernek Üyesi Kayıt','Pediatric Vaccination Course, Night Watch Course, Association Member Registration','tr',15000.00,'TRY',0.00,0.00,0.00,'TRY',15000.00,1.0000,'bank_transfer','pending','2025-11-26 20:32:05',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(43,'REG-2025-1604','Olcay','Kara','male','Olcay Kara','haksoz@kapital-online.net','+905543322222','Acıbadem Mah. Gömeç Sok. Akgün İş Merkezi No:37/4 34660 Kadıköy / İstanbul','Marmara Derneği','Halklailişkiler','kurumsal','Olcay Kara',NULL,'Acıbadem Mah. Gömeç Sok. Akgün İş Merkezi No:37/4 34660 Kadıköy / İstanbul','KAPİTAL ONLİNE BİLGİSAYAR VE İLETİŞİM HİZMETLERİ TİC.LTD.ŞTİ','KADIKÖY','55443344553','Pediatri Aşı Kursu, Gece Nöbeti Kursu, Dernek Üyesi Kayıt','Pediatric Vaccination Course, Night Watch Course, Association Member Registration','tr',15000.00,'TRY',0.00,0.00,0.00,'TRY',15000.00,1.0000,'bank_transfer','pending','2025-11-26 20:54:15',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(44,'REG-2025-2128','Halil','Aksöz','male','Halil Aksöz','haksoz@ko.com.tr','+905362283171','MALTEPE MAH. ESKİ ÇIRPICI YOLU SK. MERIDYEN IŞ MERKEZI',NULL,NULL,'bireysel','Halil Aksöz',NULL,NULL,NULL,NULL,NULL,'Pediatri Aşı Kursu, Dernek Üyesi Kayıt','Pediatric Vaccination Course, Association Member Registration','tr',13800.00,'TRY',0.00,0.00,0.00,'TRY',13800.00,1.0000,'bank_transfer','pending','2025-11-26 21:28:26',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(45,'REG-2025-6548','Olcay','Kara','male','Olcay Kara','haksoz@kapital-online.net','+905554443332','MALTEPE MAH. ESKİ ÇIRPICI YOLU SK. MERIDYEN IŞ MERKEZI',NULL,NULL,'bireysel','Olcay Kara',NULL,NULL,NULL,NULL,NULL,'Pediatri Aşı Kursu, Dernek Üyesi Kayıt','Pediatric Vaccination Course, Association Member Registration','en',13800.00,'TRY',0.00,0.00,0.00,'TRY',13800.00,1.0000,'bank_transfer','pending','2025-11-26 22:25:19',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(46,'REG-2025-3436','Olcay','Kara','male','Olcay Kara','haksoz@kapital-online.net','+903334445544','MALTEPE MAH. ESKİ ÇIRPICI YOLU SK. MERIDYEN IŞ MERKEZI','Dogal Hayat','Halklailişkiler','kurumsal','Olcay Kara',NULL,'Acıbadem Mah. Gömeç Sok. Akgün İş Merkezi No:37/4 34660 Kadıköy / İstanbul','KAPİTAL ONLİNE BİLGİSAYAR VE İLETİŞİM HİZMETLERİ TİC.LTD.ŞTİ','Sultanbeyli','55443344553','Pediatri Aşı Kursu, Dernek Üyesi Olmayan Kayıt','Pediatric Vaccination Course, Non-Association Member Registration','en',15000.00,'TRY',0.00,0.00,0.00,'TRY',15000.00,1.0000,'bank_transfer','pending','2025-11-26 22:33:01',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(47,'REG-2025-1833','Halil','Aksöz','male','Halil Aksöz','haksoz@kapital-online.net','+905362283171','MALTEPE MAH. ESKİ ÇIRPICI YOLU SK. MERIDYEN IŞ MERKEZI','Marmara Derneği',NULL,'bireysel',NULL,NULL,NULL,NULL,NULL,NULL,'Pediatri Aşı Kursu, Dernek Üyesi Kayıt','Pediatric Vaccination Course, Association Member Registration','tr',13800.00,'TRY',0.00,0.00,0.00,'TRY',13800.00,1.0000,'bank_transfer','pending','2025-11-26 23:17:34',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(48,'REG-2025-4229','Ahsen','Aksöz','female','Ahsen Aksöz','haksoz@kapital-online.net','+905554443322',NULL,NULL,NULL,'bireysel','Ahsen Aksöz',NULL,NULL,NULL,NULL,NULL,'Pediatri Aşı Kursu, Dernek Üyesi Kayıt','Pediatric Vaccination Course, Association Member Registration','tr',13800.00,'TRY',0.00,0.00,0.00,'TRY',13800.00,1.0000,'bank_transfer','pending','2025-11-26 23:23:14',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(49,'REG-2025-6870','Ahmet','Mutlu','male','Ahmet Mutlu','haksoz@kapital-online.net','+905362283171','MALTEPE MAH. ESKİ ÇIRPICI YOLU SK. MERIDYEN IŞ MERKEZI',NULL,NULL,'bireysel','Ahmet Mutlu',NULL,NULL,NULL,NULL,NULL,'Pediatri Aşı Kursu, Dernek Üyesi Olmayan Kayıt','Pediatric Vaccination Course, Non-Association Member Registration','tr',15000.00,'TRY',0.00,0.00,0.00,'TRY',15000.00,1.0000,'bank_transfer','pending','2025-11-26 23:27:04',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(50,'REG-2025-2818','Halil','Kara','male','Halil Kara','haksoz@kapital-online.net','+903332221122','MALTEPE MAH. ESKİ ÇIRPICI YOLU SK. MERIDYEN IŞ MERKEZI','Marmara Derneği','Halklailişkiler','kurumsal',NULL,NULL,'Acıbadem Mah. Gömeç Sok. Akgün İş Merkezi No:37/4 34660 Kadıköy / İstanbul','KAPİTAL ONLİNE BİLGİSAYAR VE İLETİŞİM HİZMETLERİ TİC.LTD.ŞTİ','KADIKÖY','55443344553','Pediatri Aşı Kursu, Dernek Üyesi Kayıt','Pediatric Vaccination Course, Association Member Registration','tr',13800.00,'TRY',0.00,0.00,0.00,'TRY',13800.00,1.0000,'bank_transfer','pending','2025-11-26 23:34:09',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(51,'REG-2025-7776','Hazal','Acar','male','Hazal Acar','haksoz@kapital-online.net','+905362283171','MALTEPE MAH. ESKİ ÇIRPICI YOLU SK. MERIDYEN IŞ MERKEZI',NULL,NULL,'bireysel',NULL,NULL,NULL,NULL,NULL,NULL,'Pediatri Aşı Kursu, Lisans ve Lisansüstü Öğrenci Kayıt','Pediatric Vaccination Course, Undergraduate and Graduate Student Registration','tr',6000.00,'TRY',0.00,0.00,0.00,'TRY',6000.00,1.0000,'bank_transfer','pending','2025-11-26 23:40:41',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(52,'REG-2025-9560','Ahmet','Kabay','female','Ahmet Kabay','haksoz@kapital-online.net','+905362283171','MALTEPE MAH. ESKİ ÇIRPICI YOLU SK. MERIDYEN IŞ MERKEZI',NULL,NULL,'bireysel',NULL,NULL,NULL,NULL,NULL,NULL,'Pediatri Aşı Kursu, Dernek Üyesi Kayıt','Pediatric Vaccination Course, Association Member Registration','tr',15940.80,'TRY',0.00,0.00,0.00,'TRY',15940.80,1.0000,'bank_transfer','pending','2025-11-27 05:24:58',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(53,'REG-2025-3399','Halil','Kara','male','Halil Kara','haksoz@kapital-online.net','+905554443322',NULL,NULL,NULL,'bireysel',NULL,NULL,NULL,NULL,NULL,NULL,'Pediatri Aşı Kursu, Dernek Üyesi Kayıt','Pediatric Vaccination Course, Association Member Registration','tr',15000.00,'TRY',0.00,0.00,0.00,'TRY',15000.00,1.0000,'bank_transfer','pending','2025-11-27 06:24:42',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(54,'REG-2025-7330','Halil','Kara','male','Halil Kara','haksoz@kapital-online.net','+905362283171','MALTEPE MAH. ESKİ ÇIRPICI YOLU SK. MERIDYEN IŞ MERKEZI',NULL,NULL,'bireysel',NULL,NULL,NULL,NULL,NULL,NULL,'Pediatri Aşı Kursu, Dernek Üyesi Kayıt','Pediatric Vaccination Course, Association Member Registration','tr',13200.00,'TRY',0.00,0.00,0.00,'TRY',13200.00,1.0000,'bank_transfer','completed','2025-11-27 07:08:15',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-27 12:02:22',NULL,NULL),(55,'REG-2025-8506','Melek','Aksöz','female','Melek Aksöz','haksoz@ko.com.tr','+905362283171','MALTEPE MAH. ESKİ ÇIRPICI YOLU SK. MERIDYEN IŞ MERKEZI',NULL,NULL,'bireysel',NULL,NULL,NULL,NULL,NULL,NULL,'Lisans ve Lisansüstü Öğrenci Kayıt, Yoğun Bakım Kursu','Undergraduate and Graduate Student Registration, Intensive Care Course','tr',5400.00,'TRY',4500.00,900.00,5400.00,'TRY',5400.00,1.0000,'online','completed','2025-11-27 09:41:28',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(56,'REG-2025-5787','Yolanda','Jennings','male','Yolanda Jennings','gehynywy@mailinator.com','+905554443322','Explicabo Ex molest','Sampson and Collins Traders','A est veritatis asp','bireysel','Yolanda Jennings','11111111110','ttt',NULL,NULL,NULL,'Pediatri Aşı Kursu, Dernek Üyesi Kayıt','Pediatric Vaccination Course, Association Member Registration','tr',13200.00,'TRY',11000.00,2200.00,13200.00,'TRY',13200.00,1.0000,'bank_transfer','completed','2025-11-27 11:56:15',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-27 11:59:51',NULL,NULL),(57,'REG-2025-1259','Yoko','Atkinson','male','Yoko Atkinson','hirobajana@mailinator.com','+904444444','Quia dolor sint off','Beach Holman Associates','Pariatur Animi acc','bireysel','Yoko Atkinson',NULL,NULL,NULL,NULL,NULL,'Pediatri Aşı Kursu, Dernek Üyesi Kayıt','Pediatric Vaccination Course, Association Member Registration','tr',13200.00,'TRY',0.00,0.00,0.00,'TRY',13200.00,1.0000,'online','completed','2025-11-27 13:47:25',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(58,'REG-2025-5726','Ivy','Callahan','male','Ivy Callahan','venirovap@mailinator.com','+903334445544','Ut est quisquam dolo','Humphrey and Kelley LLC','Ex impedit neque cu','bireysel',NULL,NULL,NULL,NULL,NULL,NULL,'Pediatri Aşı Kursu, Dernek Üyesi Kayıt','Pediatric Vaccination Course, Association Member Registration','tr',13200.00,'TRY',0.00,0.00,0.00,'TRY',13200.00,1.0000,'online','completed','2025-11-27 13:49:31',1,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `step2_settings`
--

LOCK TABLES `step2_settings` WRITE;
/*!40000 ALTER TABLE `step2_settings` DISABLE KEYS */;
INSERT INTO `step2_settings` VALUES (1,'currency_type','TRY','Step 2 formunda gösterilecek döviz türü (TRY, USD, EUR)','2025-11-08 19:36:32','2025-11-27 05:55:37');
/*!40000 ALTER TABLE `step2_settings` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@domain.com','$2b$10$3Wa8lllW2Jvjvy8LZg39ZOpPN/1MtQe8Tv/WXF46GYJUXeochElwe','Admin','admin','Admin','2025-11-02 22:15:30'),(2,'burak@ko.com.tr','$2b$12$GJLYrmd3QHTYWeUe3VWIIuftsbiruJwB6zQxZaggnrG3pAZJGr4Km','Burak Celikkiran','manager','Burak Celikkiran','2025-11-03 22:39:49'),(3,'umut@ko.com.tr','$2b$12$VFmfApFBv5NKQUtCsHpz.efSqQ88T2L0lXA3x5Bb.eKgo17QrZTd6','Umut Bey','reporter','Umut Bey','2025-11-03 22:49:09'),(5,'admin@example.com','$2a$10$YourHashedPasswordHere','Admin User','admin',NULL,'2025-11-16 21:22:19'),(10,'organizator@ko.com.tr','$2b$12$0h9bnzSDQJEtMKuUYcwRSeLoDzm/Dj44/4LQ8PcrXPo8Cs2w0zRZK',NULL,'manager','organizatör','2025-11-20 05:43:46');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-08 10:45:47
