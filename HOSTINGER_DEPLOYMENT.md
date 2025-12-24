# 🚀 Hostinger Deployment Rehberi

## 📋 Gereksinimler

- Hostinger hesabı (cPanel erişimi)
- Export edilmiş veritabanı dosyası: `local_db_export_YYYYMMDD_HHMMSS.sql`
- Vercel hesabı (frontend için)

## 1️⃣ Hostinger'de MySQL Veritabanı Oluşturma

### Adım 1: cPanel'e Giriş
1. Hostinger hesabınıza giriş yapın
2. **hPanel** → **Advanced** → **MySQL Databases**

### Adım 2: Yeni Veritabanı Oluştur
1. **Create New Database** bölümüne git
2. Veritabanı adı: `formwizard_db` (veya istediğiniz isim)
3. **Create** butonuna tıkla
4. Oluşturulan tam adı not al (genellikle: `u123456789_formwizard_db`)

### Adım 3: Veritabanı Kullanıcısı Oluştur
1. **MySQL Users** bölümüne git
2. Kullanıcı adı: `formwizard_user`
3. Güçlü bir şifre oluştur (Generate Password kullanabilirsiniz)
4. **Create User** butonuna tıkla
5. Kullanıcı adını ve şifreyi güvenli bir yere kaydet

### Adım 4: Kullanıcıyı Veritabanına Ekle
1. **Add User to Database** bölümüne git
2. Kullanıcı: `formwizard_user`
3. Veritabanı: `formwizard_db`
4. **Add** butonuna tıkla
5. **ALL PRIVILEGES** seç
6. **Make Changes** butonuna tıkla

## 2️⃣ Veritabanını Import Etme

### Yöntem 1: phpMyAdmin (Önerilen)

1. **hPanel** → **Advanced** → **phpMyAdmin**
2. Sol menüden veritabanınızı seç (`u123456789_formwizard_db`)
3. Üst menüden **Import** sekmesine tıkla
4. **Choose File** butonuna tıkla
5. `local_db_export_YYYYMMDD_HHMMSS.sql` dosyasını seç
6. **Go** butonuna tıkla
7. Import tamamlanana kadar bekle (1-2 dakika)

### Yöntem 2: SSH (Alternatif)

Eğer SSH erişiminiz varsa:

```bash
# Hostinger'e SSH ile bağlan
ssh u123456789@your-domain.com

# SQL dosyasını yükle (FTP veya scp ile)
# Sonra import et
mysql -u u123456789_formwizard_user -p u123456789_formwizard_db < local_db_export_YYYYMMDD_HHMMSS.sql
```

## 3️⃣ Yeni Migration'ı Çalıştırma

phpMyAdmin'de:

1. Veritabanınızı seç
2. **SQL** sekmesine tıkla
3. `migrations/011_create_payment_gateway_tables.sql` dosyasının içeriğini kopyala
4. SQL kutusuna yapıştır
5. **Go** butonuna tıkla

Veya dosyayı import et:
1. **Import** sekmesi
2. `migrations/011_create_payment_gateway_tables.sql` dosyasını seç
3. **Go**

## 4️⃣ Veritabanı Bağlantı Bilgileri

Import tamamlandıktan sonra, şu bilgileri not alın:

```
DB_HOST=localhost (veya Hostinger'in verdiği host, örn: mysql123.hostinger.com)
DB_PORT=3306
DB_USER=u123456789_formwizard_user
DB_PASSWORD=güçlü-şifreniz
DB_NAME=u123456789_formwizard_db
```

**Not:** Hostinger genellikle `localhost` kullanır, ancak bazı durumlarda özel bir host verebilir.

## 5️⃣ Vercel Environment Variables Güncelleme

### Adım 1: Vercel Dashboard
1. https://vercel.com/dashboard
2. Projenizi seç
3. **Settings** → **Environment Variables**

### Adım 2: Mevcut Değişkenleri Güncelle

Aşağıdaki değişkenleri **düzenle** (Edit):

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=u123456789_formwizard_user
DB_PASSWORD=güçlü-şifreniz
DB_NAME=u123456789_formwizard_db
```

### Adım 3: Yeni Değişkenleri Ekle

Payment için yeni değişkenler ekle:

```
PAYMENT_ENCRYPTION_KEY=your-random-secret-key-change-this-12345
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

**PAYMENT_ENCRYPTION_KEY için güçlü bir değer oluşturun:**
```bash
# Terminal'de çalıştır
openssl rand -base64 32
```

### Adım 4: Environment Seçimi

Her değişken için:
- ✅ Production
- ✅ Preview
- ✅ Development

Hepsini seçin.

## 6️⃣ Vercel Redeploy

1. **Deployments** sekmesine git
2. En son deployment'ı bul
3. **⋯** (üç nokta) → **Redeploy**
4. **Redeploy** butonuna tıkla
5. Deployment tamamlanana kadar bekle (2-3 dakika)

## 7️⃣ Test Etme

### Test 1: Veritabanı Bağlantısı
1. Vercel deployment loglarını kontrol et
2. Hata varsa environment variables'ı kontrol et

### Test 2: Admin Girişi
1. `https://your-domain.vercel.app/admin/login`
2. Kullanıcı adı: `admin`
3. Şifre: `admin123` (veya değiştirdiyseniz yeni şifre)

### Test 3: Dashboard
1. Dashboard yükleniyor mu?
2. Kayıtlar görünüyor mu?
3. İstatistikler doğru mu?

### Test 4: Sanal POS Ayarları
1. Admin → Sanal POS Ayarları
2. Denizbank görünüyor mu?
3. Düzenle butonuna tıkla
4. Shop Code ve Merchant Pass gir
5. Test Modu aktif
6. Kaydet
7. Aktif yap

### Test 5: Frontend Form
1. Ana sayfaya git
2. Form görünüyor mu?
3. Dil değiştirme çalışıyor mu?
4. Test kaydı yap

## 8️⃣ Güvenlik Kontrol Listesi

- [ ] Admin şifresini değiştir
- [ ] JWT_SECRET güçlü bir değer
- [ ] PAYMENT_ENCRYPTION_KEY güçlü bir değer
- [ ] Veritabanı şifresi güçlü
- [ ] phpMyAdmin'e sadece gerektiğinde eriş
- [ ] Düzenli yedekleme planı yap

## 9️⃣ Yedekleme

### Otomatik Yedekleme (Hostinger)
1. **hPanel** → **Backups**
2. Otomatik yedekleme aktif mi kontrol et
3. Manuel yedek al: **Create Backup**

### Manuel Yedekleme
```bash
# Lokal'den Hostinger'e bağlanarak
mysqldump -h localhost -u u123456789_formwizard_user -p u123456789_formwizard_db > backup_$(date +%Y%m%d).sql
```

## 🔧 Sorun Giderme

### Veritabanı Bağlantı Hatası

**Hata:** `Error: connect ECONNREFUSED` veya `ER_ACCESS_DENIED_ERROR`

**Çözüm:**
1. DB_HOST doğru mu? (genellikle `localhost`)
2. DB_USER ve DB_PASSWORD doğru mu?
3. Kullanıcı veritabanına eklenmiş mi?
4. Hostinger'de "Remote MySQL" aktif mi? (Settings → Remote MySQL)

### Import Hatası

**Hata:** `#1044 - Access denied for user`

**Çözüm:**
1. Kullanıcının ALL PRIVILEGES yetkisi var mı?
2. phpMyAdmin'de doğru veritabanını seçtiniz mi?

### Vercel Deployment Hatası

**Hata:** Build fails veya runtime error

**Çözüm:**
1. Vercel logs'u kontrol et
2. Environment variables'ı kontrol et
3. Lokal'de `npm run build` çalıştır
4. TypeScript hatalarını düzelt

## 📞 Destek

Sorun yaşarsanız:
1. Vercel logs: `vercel logs --follow`
2. Hostinger support: https://www.hostinger.com/support
3. phpMyAdmin error logs
4. Browser console (F12)

## ✅ Deployment Tamamlandı!

Tebrikler! Artık:
- ✅ Veritabanı Hostinger'de
- ✅ Frontend Vercel'de
- ✅ Sanal POS entegrasyonu hazır
- ✅ Admin panel çalışıyor

**Sıradaki adımlar:**
1. Gerçek içerik ekle
2. Sanal POS test et
3. Production'a geç
4. Domain bağla

---

**Son Güncelleme:** 8 Aralık 2024
