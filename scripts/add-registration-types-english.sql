-- Registration types tablosuna İngilizce label ekle

ALTER TABLE registration_types 
ADD COLUMN label_en VARCHAR(100) DEFAULT NULL COMMENT 'İngilizce etiket' AFTER label;

-- Mevcut kayıtlar için varsayılan İngilizce çeviriler
UPDATE registration_types SET label_en = label WHERE label_en IS NULL;
