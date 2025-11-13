# Vercel Deployment Guide

## Environment Variables

Vercel Dashboard'da aşağıdaki environment variable'ları ekleyin:

### Required Variables

```
DB_HOST=shuttle.proxy.rlwy.net
DB_PORT=12314
DB_USER=root
DB_PASSWORD=your-railway-password
DB_NAME=railway
JWT_SECRET=your-secure-jwt-secret
```

### How to Add Environment Variables in Vercel

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Her bir variable için:
   - Name: `DB_HOST`
   - Value: `shuttle.proxy.rlwy.net`
   - Environment: Production, Preview, Development (hepsini seçin)
   - Add

3. Tüm variable'ları ekledikten sonra:
   - Deployments → Latest Deployment → Redeploy

## Common Issues

### Dashboard Yüklenmiyor

**Sorun:** Dashboard sayfası yüklenmiyor, boş sayfa veya hata
**Çözüm:**
1. Vercel Logs'u kontrol edin (Deployments → View Function Logs)
2. Database connection'ı kontrol edin
3. Environment variables'ların doğru olduğundan emin olun

**Debug:**
```bash
# Vercel CLI ile logs
vercel logs your-deployment-url
```

### Emoji/İkonlar Görünmüyor

**Sorun:** Bayrak emoji'leri (🇹🇷 🇬🇧) görünmüyor
**Çözüm:** 
- Hard refresh yapın (Ctrl+Shift+R veya Cmd+Shift+R)
- Cache temizlenene kadar bekleyin (5-10 dakika)
- Build ID değişti, yeni deployment otomatik cache'i temizler

### Database Connection Error

**Sorun:** `Error: connect ETIMEDOUT` veya `ER_ACCESS_DENIED_ERROR`
**Çözüm:**
1. Railway MySQL TCP Proxy'nin açık olduğundan emin olun
2. Railway Dashboard → MySQL → Settings → TCP Proxy → Enable
3. Doğru host ve port kullanıldığından emin olun
4. Password'ün doğru olduğundan emin olun

### Build Fails

**Sorun:** TypeScript veya build hataları
**Çözüm:**
1. Local'de build test edin: `npm run build`
2. TypeScript hatalarını düzeltin
3. Dependencies güncel mi kontrol edin: `npm install`

## Deployment Checklist

- [ ] Railway database migration tamamlandı
- [ ] Environment variables Vercel'e eklendi
- [ ] JWT_SECRET güvenli bir değer
- [ ] Database connection test edildi
- [ ] Mail settings yapılandırıldı (opsiyonel)
- [ ] Admin user oluşturuldu
- [ ] Test kayıt yapıldı

## Testing After Deployment

1. **Admin Login Test:**
   - `https://your-domain.vercel.app/admin/login`
   - Test credentials ile giriş yapın

2. **Dashboard Test:**
   - Dashboard yükleniyor mu?
   - İstatistikler görünüyor mu?

3. **Form Test:**
   - Ana sayfada form görünüyor mu?
   - Dil değiştirme çalışıyor mu?
   - Kayıt yapılabiliyor mu?

4. **Mail Test:**
   - Admin Panel → Settings → Mail
   - Test mail gönder
   - Mail geldi mi kontrol et

## Performance Optimization

### Vercel Settings

1. **Function Region:**
   - Settings → Functions → Region
   - Railway database'inize en yakın region'ı seçin

2. **Caching:**
   - Otomatik cache aktif
   - Build ID her deployment'ta değişiyor

3. **Analytics:**
   - Settings → Analytics → Enable
   - Performance metrikleri takip edin

## Monitoring

### Vercel Logs

```bash
# Real-time logs
vercel logs --follow

# Specific deployment
vercel logs deployment-url
```

### Error Tracking

1. Vercel Dashboard → Deployments → View Function Logs
2. Filter by "Error" veya "Warning"
3. Timestamp'e göre sıralayın

## Support

Sorun yaşarsanız:
1. Vercel logs'u kontrol edin
2. Railway database'in erişilebilir olduğundan emin olun
3. Environment variables'ları tekrar kontrol edin
4. Local'de çalışıyor mu test edin
