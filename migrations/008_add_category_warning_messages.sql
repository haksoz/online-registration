-- Kategorilere uyarı mesajı alanları ekle
ALTER TABLE `registration_categories` 
ADD COLUMN `warning_message_tr` TEXT NULL COMMENT 'Kategori uyarı mesajı (Türkçe)' AFTER `description_en`,
ADD COLUMN `warning_message_en` TEXT NULL COMMENT 'Kategori uyarı mesajı (İngilizce)' AFTER `warning_message_tr`;
