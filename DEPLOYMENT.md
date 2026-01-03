# Deployment Rehberi

Bu doküman, Form Wizard uygulamasını yeni bir müşteri için nasıl kuracağınızı açıklar.

## 📋 Gereksinimler

- Node.js 18+ 
- MySQL 8.0+
- npm veya yarn

## 🚀 Yeni Müşteri Kurulumu

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd form-wizard
npm install
```

### 2. Ortam Değişkenlerini Ayarlayın

`.env.local` dosyası oluşturun:

```env
# Veritabanı Ayarları
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=form_wizard

# JWT Secret (güvenli bir değer oluşturun)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Uygulama URL'i
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Mail Ayarları (opsiyonel - admin panelden de ayarlanabilir)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 3. Veritabanını Oluşturun

```bash
# MySQL'e bağlanın
mysql -u root -p

# Veritabanını oluşturun
CREATE DATABASE form_wizard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE form_wizard;

# Tabloları oluşturun
source railway-schema.sql;
# veya
source railway-migration.sql;
# Not: Bu dosyalar Railway'den kalmıştır ama genel schema dosyalarıdır
```

### 4. Default Verileri Yükleyin

```bash
mysql -u root -p form_wizard < scripts/setup-new-client.sql
```

Bu script şunları oluşturur:
- ✅ Default admin kullanıcısı (admin / admin123)
- ✅ Sayfa ayarları
- ✅ Form ayarları
- ✅ Ödeme yöntemi ayarları
- ✅ Örnek banka hesabı
- ✅ Mail ayarları
- ✅ Döviz kurları
- ✅ Örnek kayıt türleri

### 5. Uygulamayı Başlatın

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### 6. İlk Giriş

1. Tarayıcıda `http://localhost:3000/admin/login` adresine gidin
2. Kullanıcı adı: `admin`
3. Şifre: `admin123`
4. **ÖNEMLİ:** İlk girişten sonra şifreyi mutlaka değiştirin!

## 🔧 Özelleştirme

### Müşteriye Özel Ayarlar

Admin panelden aşağıdaki ayarları yapın:

1. **Sayfa Ayarları** (`/admin/settings/page`)
   - Site başlığı ve açıklama
   - Logo yükleme
   - Renk teması
   - İletişim bilgileri

2. **Kayıt Türleri** (`/admin/registration-types`)
   - Mevcut türleri düzenleyin veya yenilerini ekleyin
   - Ücretleri ayarlayın (TRY, USD, EUR)

3. **Banka Hesapları** (`/admin/bank-accounts`)
   - Gerçek banka hesap bilgilerini girin
   - Birden fazla hesap ekleyebilirsiniz

4. **Mail Ayarları** (`/admin/settings/mail`)
   - SMTP bilgilerini girin
   - Mail şablonlarını özelleştirin

5. **Ödeme Ayarları** (`/admin/settings/payment`)
   - Online ödeme entegrasyonu (iyzico)
   - Banka transferi ayarları

## 🗄️ Veritabanı Yönetimi

### Veritabanını Sıfırlama (Development/Test)

```bash
mysql -u root -p form_wizard < scripts/reset-database.sql
mysql -u root -p form_wizard < scripts/setup-new-client.sql
```

### Yedekleme

```bash
# Tam yedek
mysqldump -u root -p form_wizard > backup_$(date +%Y%m%d_%H%M%S).sql

# Sadece veri (yapı hariç)
mysqldump -u root -p --no-create-info form_wizard > data_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Geri Yükleme

```bash
mysql -u root -p form_wizard < backup_20250116_120000.sql
```

## 🌐 Production Deployment

### Vercel Deployment

1. Vercel hesabınıza giriş yapın
2. Projeyi import edin
3. Environment variables ekleyin (.env.local içeriği)
4. Deploy edin

### Railway/Heroku Deployment (Artık Kullanılmıyor)

> **Not:** Railway deneme süresi dolduğu için artık kullanılmıyor. 
> Alternatif olarak Vercel + db4free.net veya Vercel + PlanetScale kullanılabilir.

1. ~~Railway/Heroku hesabınıza giriş yapın~~
2. ~~MySQL database oluşturun~~
3. ~~Environment variables ekleyin~~
4. ~~Deploy edin~~

### VPS Deployment (Ubuntu)

```bash
# Node.js kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MySQL kurulumu
sudo apt-get install mysql-server

# PM2 kurulumu (process manager)
sudo npm install -g pm2

# Projeyi klonlayın ve kurun
git clone <repository-url>
cd form-wizard
npm install
npm run build

# PM2 ile başlatın
pm2 start npm --name "form-wizard" -- start
pm2 save
pm2 startup
```

## 🔒 Güvenlik Kontrol Listesi

- [ ] Admin şifresini değiştirin
- [ ] JWT_SECRET'i güçlü bir değerle değiştirin
- [ ] Veritabanı şifresini güçlü yapın
- [ ] HTTPS kullanın (production)
- [ ] CORS ayarlarını kontrol edin
- [ ] Rate limiting ekleyin (opsiyonel)
- [ ] Firewall kurallarını ayarlayın
- [ ] Düzenli yedekleme yapın

## 📝 Önemli Notlar

1. **Admin Şifresi:** İlk kurulumda `admin123` şifresi kullanılır. Mutlaka değiştirin!
2. **Mail Ayarları:** Gmail kullanıyorsanız "App Password" oluşturmanız gerekir
3. **Dosya Yükleme:** `public/uploads` klasörünün yazılabilir olduğundan emin olun
4. **Döviz Kurları:** Admin panelden düzenli olarak güncelleyin
5. **Yedekleme:** Production'da otomatik yedekleme sistemi kurun

## 🆘 Sorun Giderme

### Veritabanı Bağlantı Hatası

```bash
# MySQL servisini kontrol edin
sudo systemctl status mysql

# Bağlantıyı test edin
mysql -u root -p -e "SELECT 1"
```

### Port Çakışması

```bash
# 3000 portunu kullanan process'i bulun
lsof -i :3000

# Process'i sonlandırın
kill -9 <PID>
```

### Build Hatası

```bash
# node_modules ve cache'i temizleyin
rm -rf node_modules .next
npm install
npm run build
```

## 📞 Destek

Sorun yaşarsanız:
1. Logları kontrol edin
2. Environment variables'ı kontrol edin
3. Veritabanı bağlantısını test edin
4. GitHub Issues'a bakın

---

**Son Güncelleme:** 2025-11-16
