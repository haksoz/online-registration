-- Kayıt türü adı (TR/EN) ve value alanlarını uzun metinlere izin verecek şekilde genişletir.
-- Eski: value varchar(50), label varchar(100), label_en varchar(100)

ALTER TABLE registration_types
MODIFY COLUMN value VARCHAR(150) NOT NULL COMMENT 'Teknik ID (slug)',
MODIFY COLUMN label VARCHAR(255) NOT NULL COMMENT 'Türkçe ad',
MODIFY COLUMN label_en VARCHAR(255) DEFAULT NULL COMMENT 'İngilizce ad';
