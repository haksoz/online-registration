-- Payment Status Enhancements
-- Tarih: 2025-11-24
-- Açıklama: İptal ve iade yönetimi için payment_status enum güncellemeleri

-- 1. registration_selections tablosunda payment_status enum'una yeni değerler ekle
ALTER TABLE registration_selections 
MODIFY COLUMN payment_status ENUM('pending', 'completed', 'refunded', 'cancelled') DEFAULT 'pending';

-- 2. registrations tablosunda address kolonunu NULL yapılabilir yap
ALTER TABLE registrations 
MODIFY COLUMN address VARCHAR(500) NULL;

-- 3. Mevcut iptal edilmiş ve para gelmemiş kayıtları güncelle
UPDATE registration_selections 
SET payment_status = 'cancelled' 
WHERE is_cancelled = TRUE AND refund_status = 'none';

-- 4. Mevcut iade tamamlanmış kayıtları güncelle
UPDATE registration_selections 
SET payment_status = 'refunded' 
WHERE is_cancelled = TRUE AND refund_status = 'completed';
