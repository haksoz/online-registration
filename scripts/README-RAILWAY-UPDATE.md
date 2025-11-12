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

#### Yöntem 1: Railway Dashboard (Önerilen)

1. Railway Dashboard'a gidin: https://railway.app
2. Projenizi seçin
3. MySQL servisinizi seçin
4. "Data" sekmesine gidin
5. "Query" butonuna tıklayın
6. `scripts/railway-update-mail-system.sql` dosyasının içeriğini kopyalayıp yapıştırın
7. "Run Query" butonuna tıklayın

#### Yöntem 2: MySQL Client ile

```bash
# Railway veritabanı bilgilerinizi kullanarak
mysql -h [RAILWAY_HOST] -P [RAILWAY_PORT] -u [RAILWAY_USER] -p[RAILWAY_PASSWORD] [RAILWAY_DATABASE] < scripts/railway-update-mail-system.sql
```

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
