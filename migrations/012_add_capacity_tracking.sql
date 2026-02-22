-- Migration: Kontenjan takibi alanları (trigger/backend/frontend yok, sadece şema)

-- 1) registration_categories: kontenjan takibi açık/kapalı
ALTER TABLE registration_categories
ADD COLUMN track_capacity TINYINT(1) NOT NULL DEFAULT 0;

-- 2) registration_types: kapasite ve mevcut kayıt sayısı
ALTER TABLE registration_types
ADD COLUMN capacity INT NULL,
ADD COLUMN current_registrations INT NOT NULL DEFAULT 0;

-- 3) current_registrations ilk doldurma (is_cancelled = 0 seçimler sayılır)
UPDATE registration_types rt
SET current_registrations = (
  SELECT COUNT(*)
  FROM registration_selections rs
  WHERE rs.registration_type_id = rt.id AND rs.is_cancelled = 0
);
