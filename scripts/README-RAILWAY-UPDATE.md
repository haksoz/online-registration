# Railway Database Update Guide

## Mail System ve Registration Settings Güncellemesi

Bu script Railway veritabanınıza mail sistemi, kayıt ayarları ve organizasyon adı desteği ekler.

### Güncelleme İçeriği

1. **Mail Sistemi**
   - `mail_settings` tablosu (SMTP ayarları)
   - `mail_logs` tablosu (mail gönderim logları)

2. **Kayıt Ayarları**
   - `registration_start_date` (kayıt başlangıç tarihi)
   - `notification_email` (bildirim mail adresi)
   - `bcc_email` (BCC mail adresi)

3. **Organizasyon Adı**
   - `organization_name` (Türkçe)
   - `organization_name_en` (İngilizce)

### Kurulum Adımları

#### Yöntem 1: TablePlus / MySQL Workbench (Önerilen - En Kolay)

1. **Railway Dashboard'dan Connection Bilgilerini Alın:**
   - Railway Dashboard → MySQL Service → Connect
   - TCP Proxy bilgilerini not edin:
     - Host: `ballast.proxy.rlwy.net`
     - Port: `28944`
     - User: `root`
     - Password: (gösterilen şifre)
     - Database: `railway`

2. **TablePlus veya MySQL Workbench'te Bağlantı Oluşturun:**
   - Yeni connection oluşturun
   - Yukarıdaki bilgileri girin
   - Test Connection → Connect

3. **Script Dosyalarını Sırayla Çalıştırın:**
   - `railway-step1-mail-settings.sql` (mail_settings tablosu)
   - `railway-step2-mail-logs.sql` (mail_logs tablosu)
   - `railway-step3-form-settings.sql` (form_settings güncellemesi)
   - `railway-step4-page-settings.sql` (page_settings güncellemesi)

4. **Her script'ten sonra "Success" mesajını kontrol edin**

#### Yöntem 2: Tek Script (Hepsi Birden)

Eğer tüm değişiklikleri tek seferde yapmak isterseniz:
- `railway-update-mail-system.sql` dosyasını çalıştırın

### Doğrulama

Script çalıştıktan sonra şu sorguları çalıştırarak doğrulayın:

```sql
-- Tabloları kontrol et
SHOW TABLES LIKE 'mail%';

-- Mail settings kayıtlarını kontrol et
SELECT * FROM mail_settings;

-- Form settings'teki yeni kayıtları kontrol et
SELECT * FROM form_settings WHERE setting_key IN ('registration_start_date', 'notification_email', 'bcc_email');

-- Page settings'teki organizasyon adlarını kontrol et
SELECT * FROM page_settings WHERE setting_key LIKE '%organization%';
```

### Sonraki Adımlar

1. **Mail Ayarlarını Yapılandırın**
   - Admin Panel → Settings → Mail
   - SMTP bilgilerinizi girin
   - Test mail gönderin

2. **Kayıt Ayarlarını Yapılandırın**
   - Admin Panel → Settings → Registration
   - Kayıt tarihlerini ayarlayın
   - Bildirim mail adresini girin

3. **Organizasyon Adını Ayarlayın**
   - Admin Panel → Settings → Page
   - Organizasyon adını Türkçe ve İngilizce girin

### Sorun Giderme

**Hata: Table already exists**
- Normal, tablolar zaten varsa bu hata göz ardı edilir

**Hata: Foreign key constraint fails**
- `registrations` tablosunun var olduğundan emin olun

**Hata: Duplicate entry**
- Normal, ayarlar zaten varsa güncellenir

### Geri Alma (Rollback)

Eğer değişiklikleri geri almak isterseniz:

```sql
-- Tabloları sil
DROP TABLE IF EXISTS mail_logs;
DROP TABLE IF EXISTS mail_settings;

-- Form settings kayıtlarını sil
DELETE FROM form_settings WHERE setting_key IN ('registration_start_date', 'notification_email', 'bcc_email');

-- Page settings kayıtlarını sil
DELETE FROM page_settings WHERE setting_key IN ('organization_name', 'organization_name_en');
```

### Destek

Sorun yaşarsanız:
1. Railway logs'ları kontrol edin
2. MySQL error loglarını inceleyin
3. Script'i adım adım çalıştırın
