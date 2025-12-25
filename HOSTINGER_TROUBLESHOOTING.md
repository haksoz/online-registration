# Hostinger Sorun Giderme Rehberi

## 🔴 Form Sayfası Gelmiyor

### 1. Browser Console'u Kontrol Edin

1. Tarayıcıda **F12** tuşuna basın
2. **Console** sekmesine gidin
3. Hata mesajlarını kontrol edin

### 2. Network Tab'ını Kontrol Edin

1. **F12** → **Network** sekmesi
2. Sayfayı yenileyin (F5)
3. Kırmızı (hata) olan istekleri kontrol edin
4. Özellikle `/api/` ile başlayan istekleri kontrol edin

### 3. Database Bağlantısını Kontrol Edin

**Sorun:** Build loglarında görülen hata:
```
Access denied for user 'u187342439_formwd_user'@'127.0.0.1' to database 'u187342439_formwd_user'
```

**Çözüm:**

1. **Hostinger hPanel** → **Databases** → **MySQL Databases**
2. Kullanıcı adınızı ve database adınızı not edin
3. `.env` dosyasını kontrol edin:

```env
# ❌ YANLIŞ (kullanıcı adı ve database adı aynı)
DB_NAME=u187342439_formwd_user

# ✅ DOĞRU (genellikle farklıdır)
DB_NAME=u187342439_formwd_db
```

4. `.env` dosyasını düzenleyin:
```bash
# SSH ile
nano .env

# veya File Manager ile
```

5. Doğru değerleri girin:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=u187342439_formwd_user
DB_PASSWORD=gerçek_şifreniz
DB_NAME=u187342439_formwd_db  # ← Kullanıcı adından FARKLI olmalı
```

6. Uygulamayı yeniden başlatın:
```bash
# PM2 kullanıyorsanız
pm2 restart form-wizard

# veya
npm start
```

### 4. API Route'larını Test Edin

Tarayıcıda şu URL'leri test edin:

- `https://your-domain.com/api/form-settings`
- `https://your-domain.com/api/registration-types`

Eğer bu URL'ler hata veriyorsa, database bağlantısı sorunlu demektir.

### 5. Build Sırasındaki Hatalar

Build sırasında görülen database hataları **normal** olabilir:
- Next.js build sırasında static generation yaparken API route'ları çağrılır
- Database bağlantısı yoksa hata verir ama build devam eder
- **Önemli:** Build başarılı olduysa, runtime'da çalışmalı

### 6. Form Sayfası Yüklenmiyorsa

**Kontrol Listesi:**

- [ ] Browser console'da hata var mı?
- [ ] Network tab'ında API istekleri başarısız mı?
- [ ] `.env` dosyasındaki `DB_NAME` doğru mu?
- [ ] Database kullanıcısının database'e erişim izni var mı?
- [ ] Uygulama çalışıyor mu? (`npm start` veya PM2)

### 7. Debug Adımları

**SSH ile test:**

```bash
# Database bağlantısını test et
mysql -u u187342439_formwd_user -p u187342439_formwd_db

# Şifre girin
# Bağlantı başarılı olmalı
```

**API route'u test et:**

```bash
# Terminal'de
curl https://your-domain.com/api/form-settings

# JSON response gelmeli
```

## 📝 Özet

1. **Database bağlantı ayarlarını kontrol edin** (`.env` dosyası)
2. **Browser console'u kontrol edin** (F12)
3. **Network tab'ını kontrol edin** (API istekleri)
4. **Database kullanıcı izinlerini kontrol edin** (hPanel)

## 🔗 İlgili Dosyalar

- `HOSTINGER_DB_SETUP.md` - Database bağlantı ayarları detayları
- `ENV_SETUP.md` - Environment variables rehberi


