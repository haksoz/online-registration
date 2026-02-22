# Hostinger Database Bağlantı Ayarları

## ⚠️ Önemli Not

Build loglarında görülen hata:
```
Access denied for user 'u187342439_formwd_user'@'127.0.0.1' to database 'u187342439_formwd_user'
```

Bu hata, **kullanıcı adı ve database adının aynı olmasından** kaynaklanıyor olabilir.

## 🔧 Hostinger'da .env Dosyası Ayarları

Hostinger'da `.env` dosyanızı kontrol edin:

```env
# Database Connection
DB_HOST=localhost
DB_PORT=3306
DB_USER=u187342439_formwd_user
DB_PASSWORD=your_actual_password
DB_NAME=u187342439_formwd_db
```

### ⚠️ Dikkat Edilmesi Gerekenler:

1. **`DB_USER`**: Hostinger'da oluşturduğunuz MySQL kullanıcı adı
2. **`DB_NAME`**: Hostinger'da oluşturduğunuz MySQL veritabanı adı
   - **Kullanıcı adı ve database adı genellikle FARKLIDIR!**
   - Örnek: `u187342439_formwd_user` (kullanıcı) vs `u187342439_formwd_db` (database)

3. **`DB_PASSWORD`**: Hostinger'da oluşturduğunuz MySQL şifresi

## 📋 Hostinger'da Kontrol Adımları

### 1. Hostinger Control Panel'de Kontrol Edin

1. **hPanel** → **Databases** → **MySQL Databases**
2. Kullanıcı adınızı ve database adınızı kontrol edin
3. Genellikle format şöyledir:
   - Kullanıcı: `u187342439_formwd_user`
   - Database: `u187342439_formwd_db` (veya farklı bir isim)

### 2. .env Dosyasını Güncelleyin

```bash
# SSH ile veya File Manager ile
nano .env
```

Doğru değerleri girin:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=u187342439_formwd_user
DB_PASSWORD=gerçek_şifreniz
DB_NAME=u187342439_formwd_db  # ← Bu genellikle kullanıcı adından FARKLIDIR
```

### 3. Database Kullanıcısının İzinlerini Kontrol Edin

Hostinger'da:
1. **hPanel** → **Databases** → **MySQL Databases**
2. Kullanıcınızı seçin
3. Database'e erişim izni olduğundan emin olun
4. Gerekirse kullanıcıyı database'e bağlayın

### 4. Test Edin

```bash
# SSH ile test
mysql -u u187342439_formwd_user -p u187342439_formwd_db
# Şifre girin
# Bağlantı başarılı olmalı
```

## 🔍 Build Sırasındaki Hatalar

Build sırasında görülen database hataları **normal** olabilir çünkü:
- Next.js build sırasında bazı sayfaları static olarak oluşturmaya çalışır
- Bu sırada API route'ları çağrılır
- Database bağlantısı yoksa hata verir ama build devam eder

**Önemli:** Build başarılı olduysa, runtime'da database bağlantısı çalışmalı.

## ✅ Doğru Ayarlar Örneği

```env
# ✅ DOĞRU
DB_HOST=localhost
DB_PORT=3306
DB_USER=u187342439_formwd_user
DB_PASSWORD=MySecurePassword123!
DB_NAME=u187342439_formwd_db

# ❌ YANLIŞ (kullanıcı adı ve database adı aynı)
DB_NAME=u187342439_formwd_user  # ← Bu yanlış!
```

## 🚨 Form Sayfası Gelmiyorsa

1. **Browser Console'u kontrol edin** (F12 → Console)
2. **Network tab'ını kontrol edin** (F12 → Network)
3. **API route'larının çalışıp çalışmadığını kontrol edin**
4. **Database bağlantısını test edin**

## 📞 Destek

Sorun devam ederse:
1. Hostinger hPanel'de database ayarlarını kontrol edin
2. Database kullanıcısının doğru database'e erişim izni olduğundan emin olun
3. `.env` dosyasındaki değerlerin doğru olduğundan emin olun







