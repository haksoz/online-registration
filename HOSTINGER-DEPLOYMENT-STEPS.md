# 🚀 Hostinger Next.js Deployment - Adım Adım

## Mevcut Durum ✅
- ✅ Git repository Hostinger'e klonlandı
- ✅ Veritabanı import edildi (246 sorgu başarılı)
- ✅ `.env` dosyası Hostinger DB bilgileri ile güncellendi
- ❌ 503 Error - Next.js uygulaması henüz build edilmedi

## Sıradaki Adımlar

### 1. Hostinger Terminal/SSH Erişimi

**Yöntem A: hPanel Terminal**
1. Hostinger hPanel → **Advanced** → **SSH Access**
2. Veya **File Manager** → sağ üst köşede **Terminal** ikonu

**Yöntem B: SSH Client**
```bash
ssh u187342439@online-registration.ohdkongre.org
```

### 2. Proje Dizinine Git

```bash
# Domain klasörüne git
cd domains/online-registration.ohdkongre.org/public_html

# Dosyaların var olduğunu kontrol et
ls -la
```

Görmeli olduğunuz dosyalar:
- `package.json`
- `.env`
- `app/` klasörü
- `components/` klasörü
- vb.

### 3. Node.js Sürümünü Kontrol Et

```bash
node --version
npm --version
```

**Beklenen:** Node.js 18.x veya 20.x

### 4. Dependencies Yükle

```bash
npm install
```

Bu işlem 2-3 dakika sürebilir.

### 5. Next.js Build Et

```bash
npm run build
```

Bu işlem 3-5 dakika sürebilir. Hata alırsanız:
- TypeScript hatalarını kontrol edin
- `.env` dosyasının doğru olduğunu kontrol edin

### 6. Uygulamayı Başlat

```bash
npm start
```

**Önemli:** Bu komut uygulamayı başlatır ama terminal açık kalmalı.

### 7. Hostinger Node.js App Konfigürasyonu

**hPanel'de:**
1. **Advanced** → **Node.js**
2. **Create Application**
3. Ayarlar:
   - **Node.js Version**: 20.x
   - **Application Root**: `domains/online-registration.ohdkongre.org/public_html`
   - **Application URL**: `online-registration.ohdkongre.org`
   - **Application Startup File**: `server.js` (Next.js otomatik oluşturur)
   - **Environment**: Production

### 8. Environment Variables (Hostinger'de)

Node.js App ayarlarında **Environment Variables** ekle:

```
NODE_ENV=production
DB_HOST=localhost
DB_USER=u187342439_formwd_user
DB_PASSWORD=6QYWd-nhr5G8udx
DB_NAME=u187342439_formwd_db
DB_PORT=3306
PAYMENT_ENCRYPTION_KEY=your-payment-encryption-key-change-this-to-random-string-12345
NEXT_PUBLIC_BASE_URL=https://online-registration.ohdkongre.org
```

### 9. Test Et

1. Tarayıcıda: `https://online-registration.ohdkongre.org`
2. 503 hatası gitmeli
3. Ana sayfa yüklenmeli

### 10. Admin Panel Test

1. `https://online-registration.ohdkongre.org/admin/login`
2. Kullanıcı: `admin`
3. Şifre: `admin123`

## 🔧 Olası Sorunlar ve Çözümler

### Sorun 1: `npm install` Hatası
```bash
# Node.js sürümünü kontrol et
node --version

# npm cache temizle
npm cache clean --force

# Tekrar dene
npm install
```

### Sorun 2: Build Hatası
```bash
# TypeScript hatalarını kontrol et
npm run lint

# .env dosyasını kontrol et
cat .env
```

### Sorun 3: Port Çakışması
Hostinger genellikle otomatik port atar, ama manuel ayar gerekirse:

```bash
# package.json'da start script'ini güncelle
"start": "next start -p $PORT"
```

### Sorun 4: Database Connection Error
```bash
# .env dosyasını kontrol et
cat .env

# MySQL bağlantısını test et
mysql -h localhost -u u187342439_formwd_user -p u187342439_formwd_db
```

## 📞 Yardım Gerekirse

1. **Terminal çıktısını** paylaş
2. **Hata mesajlarını** tam olarak kopyala
3. **Hangi adımda** takıldığını belirt

## ✅ Başarılı Deployment Sonrası

Uygulama çalıştığında:
1. Admin paneline gir
2. Sanal POS ayarlarını kontrol et
3. Test kaydı yap
4. Payment gateway'i test et

---

**Not:** Bu adımları sırasıyla takip edin. Her adımda hata alırsanız durdurun ve hata mesajını paylaşın.