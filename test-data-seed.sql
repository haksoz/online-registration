-- Test için veritabanını temizle ve örnek veriler ekle
-- UYARI: Bu script tüm kayıtları siler!

-- Önce foreign key kontrollerini kapat
SET FOREIGN_KEY_CHECKS = 0;

-- Tabloları temizle (sadece var olanlar)
DELETE FROM registrations;
DELETE FROM registration_logs WHERE 1=1;
DELETE FROM mail_logs WHERE 1=1;
DELETE FROM audit_logs WHERE 1=1;

-- Foreign key kontrollerini aç
SET FOREIGN_KEY_CHECKS = 1;

-- Test verileri ekle
-- 1. Aktif kayıtlar - Ödeme tamamlandı (5 adet)
INSERT INTO registrations (full_name, email, phone, address, invoice_type, registration_type, fee, payment_method, payment_status, status, created_at) VALUES
('Ahmet Yılmaz', 'ahmet@test.com', '5551234567', 'İstanbul', 'bireysel', 'dernek_uyesi', 9500.00, 'online', 'completed', 1, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('Ayşe Demir', 'ayse@test.com', '5551234568', 'Ankara', 'bireysel', 'dernek_uyesi', 9500.00, 'bank_transfer', 'completed', 1, DATE_SUB(NOW(), INTERVAL 4 DAY)),
('Mehmet Kaya', 'mehmet@test.com', '5551234569', 'İzmir', 'bireysel', 'ogrenci', 7500.00, 'online', 'completed', 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
('Fatma Şahin', 'fatma@test.com', '5551234570', 'Bursa', 'bireysel', 'ogrenci', 7500.00, 'bank_transfer', 'completed', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Ali Çelik', 'ali@test.com', '5551234571', 'Antalya', 'bireysel', 'dernek_uyesi_degil', 5000.00, 'online', 'completed', 1, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 2. Aktif kayıtlar - Ödeme beklemede (3 adet)
INSERT INTO registrations (full_name, email, phone, address, invoice_type, registration_type, fee, payment_method, payment_status, status, created_at) VALUES
('Zeynep Arslan', 'zeynep@test.com', '5551234572', 'Adana', 'bireysel', 'dernek_uyesi', 9500.00, 'bank_transfer', 'pending', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Can Öztürk', 'can@test.com', '5551234573', 'Gaziantep', 'bireysel', 'ogrenci', 7500.00, 'bank_transfer', 'pending', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('Elif Yıldız', 'elif@test.com', '5551234574', 'Konya', 'bireysel', 'dernek_uyesi_degil', 5000.00, 'bank_transfer', 'pending', 1, NOW());

-- 3. İptal edilen kayıtlar - Ödeme tamamlanmış, iade beklemede (2 adet)
INSERT INTO registrations (full_name, email, phone, address, invoice_type, registration_type, fee, payment_method, payment_status, status, refund_status, refund_amount, cancelled_at, created_at) VALUES
('Burak Aydın', 'burak@test.com', '5551234575', 'Kayseri', 'bireysel', 'dernek_uyesi', 9500.00, 'online', 'completed', 0, 'pending', 9500.00, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
('Selin Koç', 'selin@test.com', '5551234576', 'Eskişehir', 'bireysel', 'ogrenci', 7500.00, 'bank_transfer', 'completed', 0, 'pending', 7500.00, NOW(), DATE_SUB(NOW(), INTERVAL 8 DAY));

-- 4. İptal edilen kayıtlar - Ödeme beklemedeyken iptal (1 adet)
INSERT INTO registrations (full_name, email, phone, address, invoice_type, registration_type, fee, payment_method, payment_status, status, cancelled_at, created_at) VALUES
('Deniz Yurt', 'deniz@test.com', '5551234577', 'Trabzon', 'bireysel', 'dernek_uyesi_degil', 5000.00, 'bank_transfer', 'pending', 0, NOW(), DATE_SUB(NOW(), INTERVAL 6 DAY));

-- 5. İptal edilen kayıtlar - İade reddedildi (1 adet) - Bu gelir olarak sayılır!
INSERT INTO registrations (full_name, email, phone, address, invoice_type, registration_type, fee, payment_method, payment_status, status, refund_status, refund_amount, cancelled_at, created_at) VALUES
('Kemal Öz', 'kemal@test.com', '5551234578', 'Samsun', 'bireysel', 'ogrenci', 7500.00, 'online', 'completed', 0, 'rejected', 7500.00, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY));

-- Özet:
-- Toplam: 12 kayıt
-- Aktif: 8 kayıt (5 completed + 3 pending)
-- İptal: 4 kayıt (2 iade beklemede + 1 ödeme beklemedeyken iptal + 1 iade reddedildi)
-- 
-- Beklenen Hesaplamalar:
-- Toplam Kayıt: 8 (sadece aktif)
-- Toplam Gelir: 68,500 TL (8 aktif + 1 iade reddedildi = 61,000 + 7,500)
-- Tahsil Edilen: 46,500 TL (5 aktif completed + 1 iade reddedildi completed = 39,000 + 7,500)
-- Bekleyen: 22,000 TL (3 pending)
-- İade Tutarı: 17,000 TL (2 iptal, iade beklemede)
-- İade Reddedildi: 7,500 TL (1 kayıt - gelir olarak sayılır!)
