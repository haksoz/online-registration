# Vercel Deployment Rehberi

Bu doküman, form-wizard projesini Vercel'e deploy etmek için gerekli adımları açıklar.

## 📋 Ön Hazırlık

### 1. Veritabanı Hazırlığı

db4free.net'te veritabanınızı hazırlayın:
- **Host:** `db4free.net`
- **Port:** `3306`
- **Database:** `test_form_wizard`
- **User:** `form_wizard_user`
- **Password:** `FfXeX3!QRD79wF`

**Önemli:** Veritabanı tablolarını oluşturmayı unutmayın! Mevcut migration dosyalarınızı kullanabilirsiniz.

### 2. Git Repository

Projenizi GitHub/GitLab/Bitbucket'a push edin. Vercel Git repository'den çekecek.

## 🚀 Vercel Deployment Adımları

### Adım 1: Vercel Projesi Oluşturma

1. [Vercel Dashboard](https://vercel.com/dashboard) → **Add New Project**
2. Git repository'nizi seçin
3. **Import Project** butonuna tıklayın

### Adım 2: Framework Ayarları

Vercel otomatik olarak Next.js'i algılayacak:
- **Framework Preset:** Next.js (otomatik)
- **Root Directory:** `./` (varsayılan)
- **Build Command:** `npm run build` (otomatik)
- **Output Directory:** `.next` (otomatik)
- **Install Command:** `npm install` (otomatik)

### Adım 3: Environment Variables Ekleme

**Settings** → **Environment Variables** bölümüne gidin ve şu değişkenleri ekleyin:

#### Zorunlu Değişkenler

| Key | Value | Environment |
|-----|-------|-------------|
| `DB_HOST` | `db4free.net` | Production, Preview, Development |
| `DB_PORT` | `3306` | Production, Preview, Development |
| `DB_USER` | `form_wizard_user` | Production, Preview, Development |
| `DB_PASSWORD` | `FfXeX3!QRD79wF` | Production, Preview, Development |
| `DB_NAME` | `test_form_wizard` | Production, Preview, Development |
| `JWT_SECRET` | (güvenli bir değer oluşturun) | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

#### Opsiyonel Değişkenler

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production |
| `SMTP_HOST` | `smtp.gmail.com` | Production, Preview, Development |
| `SMTP_PORT` | `587` | Production, Preview, Development |
| `SMTP_USER` | `your-email@gmail.com` | Production, Preview, Development |
| `SMTP_PASSWORD` | `your-app-password` | Production, Preview, Development |

**JWT_SECRET Oluşturma:**
```bash
# Terminal'de çalıştırın
openssl rand -base64 32
```

### Adım 4: Deploy

1. **Deploy** butonuna tıklayın
2. Build işlemi tamamlanana kadar bekleyin (2-5 dakika)
3. Deployment başarılı olduğunda URL'iniz hazır olacak

## 🔧 Veritabanı Tablolarını Oluşturma

Vercel deploy edildikten sonra, veritabanı tablolarını oluşturmanız gerekiyor:

### Yöntem 1: SQL Dosyalarını Kullanma

1. db4free.net'e MySQL client ile bağlanın
2. `test_form_wizard` veritabanını seçin
3. Projenizdeki migration dosyalarını çalıştırın:
   - `railway-schema.sql` (genel schema dosyası) veya
   - `railway-migration.sql` (genel migration dosyası) veya
   - `scripts/` klasöründeki migration dosyaları

### Yöntem 2: Admin Panel Üzerinden

1. Deploy edilmiş uygulamanıza gidin
2. `/admin/login` sayfasına gidin
3. İlk giriş yapıldığında tablolar otomatik oluşturulabilir (eğer kodunuzda bu özellik varsa)

## ✅ Test Etme

### 1. Veritabanı Bağlantısı

Deployment loglarını kontrol edin:
- **Deployments** → **Deployment** → **Functions** → **View Function Logs**
- `🔍 DB Config Check` logunu kontrol edin
- Hata varsa environment variables'ı kontrol edin

### 2. API Endpoint'leri

Tarayıcıda test edin:
- `https://your-app.vercel.app/api/form-settings`
- `https://your-app.vercel.app/api/registration-types`

### 3. Admin Panel

- `https://your-app.vercel.app/admin/login`
- Varsayılan kullanıcı: `admin` / `admin123` (eğer setup script'i çalıştırıldıysa)

## 🐛 Troubleshooting

### Build Hatası

**Sorun:** Build sırasında veritabanı bağlantı hatası

**Çözüm:** 
- Build sırasındaki veritabanı hataları normal olabilir
- Önemli olan runtime'da çalışması
- Eğer build tamamen başarısız oluyorsa, `next.config.js`'de build-time database calls'ları devre dışı bırakın

### Runtime Veritabanı Hatası

**Sorun:** Deploy sonrası veritabanına bağlanamıyor

**Çözüm:**
1. Environment variables'ların doğru ayarlandığından emin olun
2. db4free.net'in IP kısıtlamalarını kontrol edin
3. Vercel'in IP adreslerini db4free.net'e whitelist olarak eklemeniz gerekebilir
4. Deployment logs'u kontrol edin

### db4free.net Kısıtlamaları

db4free.net ücretsiz bir servis olduğu için:
- **Connection Limit:** Sınırlı sayıda eşzamanlı bağlantı
- **Storage Limit:** Sınırlı depolama alanı
- **IP Whitelist:** Bazı durumlarda IP whitelist gerekebilir

**Öneri:** Production için daha güvenilir bir veritabanı servisi kullanın:
- PlanetScale
- Supabase
- Railway
- Neon

## 📝 Önemli Notlar

1. **Environment Variables:** Asla Git'e commit etmeyin (`.env.local` zaten `.gitignore`'da)
2. **JWT_SECRET:** Her ortam için farklı ve güvenli bir değer kullanın
3. **Build Time:** Build sırasında veritabanı bağlantısı gerekmez, sadece runtime'da gerekli
4. **Database Migrations:** İlk deploy'dan önce veya sonra migration'ları çalıştırın

## 🔄 Güncelleme

Kod değişikliklerini deploy etmek için:
1. Git repository'nize push edin
2. Vercel otomatik olarak yeni deployment başlatacak
3. Veya manuel olarak **Deployments** → **Redeploy** yapabilirsiniz

## 📚 Ek Kaynaklar

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

