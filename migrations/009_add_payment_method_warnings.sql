-- Ödeme yöntemlerine uyarı mesajı alanları ekle
ALTER TABLE `payment_method_settings` 
ADD COLUMN `warning_message` TEXT NULL COMMENT 'Ödeme yöntemi uyarı mesajı (Türkçe)' AFTER `description`,
ADD COLUMN `warning_message_en` TEXT NULL COMMENT 'Ödeme yöntemi uyarı mesajı (İngilizce)' AFTER `warning_message`;
