# Environment Variables (Ortam Değişkenleri) Kurulum Rehberi

## 📋 Önemli Not

**`.env` dosyası Git'e commit edilmemelidir!** Bu dosya hassas bilgiler (şifreler, secret key'ler) içerir.

## 🔒 Güvenlik

- ✅ `.env` dosyası `.gitignore`'da tanımlıdır
- ✅ `.env.example` dosyası örnek değerler içerir (gerçek değerler yok)
- ✅ Hostinger'da manuel olarak `.env` dosyası oluşturulmalıdır

## 🚀 Hostinger'da Kurulum

### 1. `.env` Dosyası Oluşturma

Hostinger'da proje klasörünüze gidin ve `.env` dosyası oluşturun:

```bash
# File Manager veya SSH ile
nano .env
# veya
vi .env
```

### 2. Gerekli Değişkenleri Ekleyin

`.env.example` dosyasındaki formatı kullanarak, gerçek değerlerinizi girin:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_hostinger_db_user
DB_PASSWORD=your_hostinger_db_password
DB_NAME=your_hostinger_db_name
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 3. Dosya İzinlerini Kontrol Edin

```bash
chmod 600 .env  # Sadece sahibi okuyabilir/yazabilir
```

## 📝 Kullanılan Environment Variables

### Zorunlu Değişkenler

| Değişken | Açıklama | Örnek |
|----------|----------|-------|
| `DB_HOST` | Veritabanı sunucu adresi | `localhost` |
| `DB_PORT` | Veritabanı portu | `3306` |
| `DB_USER` | Veritabanı kullanıcı adı | `root` |
| `DB_PASSWORD` | Veritabanı şifresi | `your_password` |
| `DB_NAME` | Veritabanı adı | `form_wizard` |
| `JWT_SECRET` | JWT token şifreleme anahtarı | `random-32-char-string` |

### Opsiyonel Değişkenler

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `NEXT_PUBLIC_BASE_URL` | Uygulama URL'i | `http://localhost:3000` |
| `SMTP_HOST` | Mail sunucusu | - |
| `SMTP_PORT` | Mail portu | `587` |
| `SMTP_USER` | Mail kullanıcı adı | - |
| `SMTP_PASSWORD` | Mail şifresi | - |
| `MAX_FILE_SIZE` | Maksimum dosya boyutu | `5242880` (5MB) |
| `UPLOAD_DIR` | Yükleme klasörü | `/tmp/uploads` |
| `NODE_ENV` | Ortam türü | `production` |

## 🔑 JWT_SECRET Oluşturma

Güvenli bir JWT secret oluşturmak için:

```bash
# Node.js ile
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL ile
openssl rand -hex 32
```

## ⚠️ Git Push Yaparken Dikkat

1. **`.env` dosyası Git'te olmamalı!**
   ```bash
   # Kontrol edin
   git status
   
   # Eğer .env görünüyorsa, Git'ten kaldırın (local'de kalır)
   git rm --cached .env
   git commit -m "Remove .env from Git tracking"
   ```

2. **Hostinger'da `.env` dosyası manuel olarak korunur**
   - Git push yaptığınızda `.env` dosyası değişmez
   - Sadece kod değişiklikleri güncellenir

## 🔄 Yeni Deployment Sonrası

Git'ten yeni kod çektiğinizde:

1. `.env` dosyasının hala mevcut olduğunu kontrol edin
2. Gerekirse `.env.example`'dan kopyalayıp değerleri girin
3. Dosya izinlerini kontrol edin: `chmod 600 .env`

## 📚 Daha Fazla Bilgi

- `.env.example` - Örnek environment variable formatı
- `HOSTINGER_DEPLOYMENT.md` - Hostinger deployment detayları
- `DEPLOYMENT.md` - Genel deployment rehberi

