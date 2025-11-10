# Banner Görseli Özelliği

## Genel Bakış
Ana form sayfasına admin panelinden yönetilebilir banner görseli ekleme özelliği.

## Özellikler

### 1. Admin Panel Yönetimi
- **Konum:** Admin Panel → Ayarlar → Sayfa Ayarları
- Banner URL girişi
- Canlı önizleme
- Tam sayfa önizlemesi

### 2. Görsel Özellikleri
- **Önerilen Boyut:** 1920x400px
- **Format:** JPG, PNG, WebP
- **Responsive:** Mobil, tablet ve desktop uyumlu
- **Gradient Overlay:** Metin okunabilirliği için

### 3. Hata Yönetimi
- Geçersiz URL durumunda otomatik gizleme
- Yükleme hatalarında graceful fallback
- Boş URL durumunda banner gösterilmez

## Kullanım

### Admin Panelinden Banner Ekleme

1. Admin paneline giriş yapın
2. **Ayarlar** → **Sayfa Ayarları** menüsüne gidin
3. "Banner Görseli URL" alanına görsel URL'ini girin
4. Önizlemeyi kontrol edin
5. **Kaydet** butonuna tıklayın

### Örnek URL'ler

```
https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&h=400&fit=crop
https://example.com/images/banner.jpg
https://cdn.example.com/banners/event-2025.png
```

## Teknik Detaylar

### Database
```sql
-- page_settings tablosunda
setting_key = 'banner_image_url'
setting_value = 'https://...'
```

### API Endpoint
```
GET  /api/admin/page-settings
PUT  /api/admin/page-settings
```

### Dosya Yapısı
```
app/
├── admin/settings/page/page.tsx    # Admin panel interface
├── page.tsx                         # Ana sayfa (banner render)
├── api/admin/page-settings/
│   └── route.ts                     # API endpoint
constants/
└── pageSettings.ts                  # Settings type & fetch
```

## Responsive Tasarım

### Desktop (1920px+)
- Yükseklik: 320px (h-80)
- Tam genişlik banner

### Tablet (768px - 1919px)
- Yükseklik: 256px (h-64)
- Tam genişlik banner

### Mobile (<768px)
- Yükseklik: 192px (h-48)
- Tam genişlik banner

## Görsel Optimizasyonu

### Önerilen Ayarlar
- **Boyut:** 1920x400px
- **Format:** WebP (en iyi performans)
- **Kalite:** 80-85%
- **Dosya Boyutu:** <200KB

### CDN Kullanımı
Banner görsellerini CDN üzerinden sunmak önerilir:
- Cloudinary
- Imgix
- AWS CloudFront
- Unsplash (test için)

## Örnek Kullanım Senaryoları

### 1. Etkinlik Duyurusu
```
Banner: Kongre logosu ve tarihi
URL: https://cdn.example.com/congress-2025-banner.jpg
```

### 2. Sponsorluk Gösterimi
```
Banner: Sponsor logoları
URL: https://cdn.example.com/sponsors-banner.png
```

### 3. Mevsimsel Kampanya
```
Banner: Erken kayıt indirimi
URL: https://cdn.example.com/early-bird-banner.jpg
```

## Güvenlik

- URL validasyonu yapılır
- XSS koruması mevcut
- HTTPS zorunlu değil ama önerilir
- Görsel yükleme hatalarında güvenli fallback

## Performans

- Lazy loading desteklenir
- Cache mekanizması (5 dakika)
- Optimize edilmiş görsel boyutları önerilir
- CDN kullanımı önerilir

## Sorun Giderme

### Banner Görünmüyor
1. URL'in doğru olduğunu kontrol edin
2. Görselin erişilebilir olduğunu test edin
3. Browser console'da hata var mı kontrol edin
4. Cache'i temizleyin (5 dakika bekleyin)

### Görsel Bozuk Görünüyor
1. Görsel boyutunu kontrol edin (1920x400px önerilir)
2. Aspect ratio'yu koruyun
3. object-cover CSS özelliği kullanılıyor

### Yavaş Yükleniyor
1. Görsel boyutunu küçültün (<200KB)
2. WebP formatı kullanın
3. CDN kullanın
4. Görsel optimizasyon araçları kullanın

## Gelecek Geliştirmeler

- [ ] Dosya upload desteği
- [ ] Çoklu banner desteği (slider)
- [ ] Banner pozisyon ayarları
- [ ] Mobil için farklı banner
- [ ] Banner animasyonları
- [ ] A/B testing desteği
