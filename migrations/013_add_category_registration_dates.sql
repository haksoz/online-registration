-- Kategori bazlı kayıt tarihleri (Kayıt Başlangıç/Son, İptal Son, Erken Kayıt Bitiş)
-- admin/settings/registration'daki global tarihler artık her kategoride tutulacak

ALTER TABLE registration_categories
ADD COLUMN registration_start_date DATETIME NULL COMMENT 'Kayıt başlangıç (boş = hemen açık)',
ADD COLUMN registration_end_date DATETIME NULL COMMENT 'Kayıt son (boş = sınırsız)',
ADD COLUMN cancellation_deadline DATETIME NULL COMMENT 'İptal son (boş = sınırsız)',
ADD COLUMN early_bird_deadline DATETIME NULL COMMENT 'Erken kayıt bitiş',
ADD COLUMN early_bird_enabled TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Erken kayıt aktif mi?';
