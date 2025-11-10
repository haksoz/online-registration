# Changelog - Form Wizard Project

Bu dosya projede yapılan tüm değişiklikleri ve geliştirmeleri içerir.

---

## [2025-01-10] - Multi-Language Page Settings Support

### 🆕 Yeni Özellikler

#### İngilizce Sayfa Ayarları Desteği
**Amaç:** Sayfa başlığı, alt başlığı ve genel uyarı mesajı için İngilizce versiyonları eklemek.

**Güncellenen Dosyalar:**
- `app/admin/settings/page/page.tsx` - İngilizce form alanları eklendi
- `constants/pageSettings.ts` - İngilizce alanlar interface'e eklendi
- `app/page.tsx` - Dil seçimine göre dinamik metin gösterimi
- `scripts/add-english-page-settings.sql` - Veritabanı migration

**Özellikler:**
- ✅ Türkçe ve İngilizce yan yana form alanları
- ✅ Dil seçimine göre otomatik metin değişimi
- ✅ Fallback desteği (İngilizce boşsa Türkçe gösterilir)
- ✅ Tüm sayfa metinleri için çoklu dil desteği:
  - `form_title` / `form_title_en`
  - `form_subtitle` / `form_subtitle_en`
  - `form_general_warning` / `form_general_warning_en`

**Veritabanı Değişiklikleri:**
- ✅ `page_settings` tablosuna 3 yeni alan eklendi
- ✅ Mevcut veriler korundu (ON DUPLICATE KEY UPDATE)

---

## [2025-01-08] - Form Settings Management System

### 🆕 Yeni Özellikler

#### Arka Plan Görseli Sistemi
**Amaç:** Sayfa başlığının arkasında admin panelinden yönetilebilir arka plan görseli eklemek.

**Güncellenen Dosyalar:**
- `app/admin/settings/page/page.tsx` - Dosya yükleme ve URL input eklendi
- `app/page.tsx` - Arka plan görseli ile header tasarımı
- `app/api/upload/route.ts` - Dosya yükleme API'si
- `constants/pageSettings.ts` - Arka plan URL desteği

**Özellikler:**
- ✅ Dosya yükleme desteği (JPG, PNG, WebP - Max 5MB)
- ✅ URL ile görsel ekleme
- ✅ Canlı önizleme desteği
- ✅ Responsive tasarım (mobil/tablet/desktop)
- ✅ Overlay ile metin okunabilirliği
- ✅ Gradient fallback (görsel yoksa)
- ✅ Önerilen boyut: 1920x600px

**Form Genel Uyarı Mesajı:**
- ✅ Karşılama mesajı kaldırıldı
- ✅ Form içeriğinin en altına genel uyarı mesajı eklendi
- ✅ Amber renk temalı uyarı kutusu
- ✅ Varsayılan: "* ile işaretli tüm alanları eksiksiz doldurun."

**Tasarım Optimizasyonları:**
- ✅ Header container ile sınırlandırıldı (max-w-4xl)
- ✅ Background image container içinde rounded-lg ile
- ✅ Form kartı header'ın altına overlap olacak şekilde yerleştirildi
- ✅ Gradient overlay optimizasyonu
- ✅ Fade-in animasyonu eklendi
- ✅ Responsive font boyutları ve padding
- ✅ Shadow ve depth iyileştirmeleri
- ✅ Tüm içerik aynı container genişliğinde (max-w-4xl)

**Koşullu Görünüm:**
- ✅ Başlık, alt başlık ve görsel boş bırakılabilir
- ✅ Tümü boşsa header gizlenir
- ✅ Sadece görsel varsa minimum yükseklik korunur (200-300px)
- ✅ Header yoksa form overlap yapmaz (pt-8 padding)

**Stil Özelleştirmeleri:**
- ✅ Başlık font boyutu ayarlanabilir (12-120px)
- ✅ Alt başlık font boyutu ayarlanabilir (12-80px)
- ✅ Header arka plan rengi seçilebilir (color picker)
- ✅ Görsel yoksa seçilen renk gradient olarak kullanılır
- ✅ Hex kod manuel girilebilir (#667eea)
- ✅ Canlı önizleme tüm değişiklikleri yansıtır

**Kompakt Tasarım:**
- ✅ Header minimum yükseklik: 240px
- ✅ Padding azaltıldı: py-8 → py-10 (mobil → desktop)
- ✅ Margin azaltıldı: mb-3 → mb-2 (başlık altı)
- ✅ Leading-tight ve leading-snug ile satır aralıkları optimize edildi
- ✅ Daha az dikey alan kullanımı

**Kullanım:**
1. Admin Panel → Ayarlar → Sayfa Ayarları
2. Dosya yükle veya URL gir
3. "Form Genel Uyarı Mesajı" alanını düzenle
4. Önizlemeyi kontrol edin
5. Kaydet butonuna tıklayın

---

#### Form Ayarları Sistemi
**Amaç:** Form alanlarının görünürlük ve zorunluluk durumlarını admin panelinden yönetmek.

**Eklenen Dosyalar:**
- `scripts/create-form-settings-tables.sql` - Database tabloları
- `app/api/form-settings/route.ts` - Public API (form render için)
- `app/api/admin/form-settings/route.ts` - Admin API (CRUD işlemleri)
- `hooks/useFormSettings.ts` - Form settings hook
- `app/admin/settings/form-fields/page.tsx` - Admin panel sayfası

**Database:**
- `form_field_settings` tablosu - Step1 alanları için
- `payment_method_settings` tablosu - Step3 ödeme yöntemleri için

**Özellikler:**
- ✅ Form alanlarını görünür/gizli yapma
- ✅ Form alanlarını zorunlu/opsiyonel yapma
- ✅ Ödeme yöntemlerini aktif/pasif yapma
- ✅ Toggle switch ile kolay yönetim
- ✅ Toplu güncelleme desteği
- ✅ Gerçek zamanlı form rendering

**Step1 - Dinamik Form:**
- ✅ Tüm alanlar conditional rendering ile sarıldı
- ✅ Görünürlük kontrolü (isFieldVisible)
- ✅ Zorunluluk kontrolü (isFieldRequired)
- ✅ Loading state
- ✅ Dinamik label'lar (* işareti)

**Step3 - Dinamik Ödeme:**
- ✅ Sadece aktif ödeme yöntemleri gösteriliyor
- ✅ Icon desteği (💳 🏦)
- ✅ Loading state
- ✅ Empty state (aktif yöntem yoksa)
- ✅ Tek yöntem varsa full-width

**Admin Panel:**
- Sol menüye "Form Ayarları" eklendi (📋 icon)
- Toggle switch'ler ile kolay yönetim
- Step bazlı gruplama
- Kaydet/İptal butonları
- Success/Error mesajları

**Default Ayarlar:**
- Ad, Soyad, Cinsiyet, E-posta, Telefon, Adres, Fatura Türü → Zorunlu, Görünür
- Şirket, Departman → Opsiyonel, Görünür
- Fatura alanları → Koşullu görünür
- Online Ödeme, Banka Transferi → Aktif

---

## [2025-01-07] - Registration Logs & International Phone

### 🆕 Yeni Özellikler

#### 1. Registration Logs Sistemi
**Amaç:** Kayıt formunu dolduran kullanıcıların detaylı log bilgilerini tutmak.

**Eklenen Dosyalar:**
- `scripts/create-registration-logs-table.sql` - Database tablosu
- `lib/getClientInfo.ts` - IP adresi ve client bilgileri (proxy desteği)
- `lib/parseUserAgent.ts` - Browser, OS, device detection (30+ bot pattern)
- `lib/parseReferrer.ts` - Referrer ve UTM parametreleri
- `lib/collectClientInfo.ts` - Client-side bilgi toplama
- `app/api/registration-logs/route.ts` - Tüm logları listele
- `app/api/registrations/[id]/logs/route.ts` - Kayıt bazlı loglar
- `app/admin/registration-logs/page.tsx` - Admin panel sayfası
- `.kiro/specs/registration-logs/` - Spec dökümanları (requirements, design, tasks)

**Database:**
- `registration_logs` tablosu oluşturuldu
- Kolonlar: IP, user agent, browser, OS, device, referrer, UTM, form duration, location, security flags

**Özellikler:**
- ✅ Proxy arkasından gerçek IP tespiti (X-Forwarded-For, X-Real-IP, CF-Connecting-IP)
- ✅ IPv4/IPv6 desteği
- ✅ Browser ve OS detection
- ✅ Device type (desktop/mobile/tablet/bot)
- ✅ Bot detection (30+ pattern)
- ✅ Referrer ve UTM tracking
- ✅ Form doldurma süresi
- ✅ Risk skoru (proxy/VPN/Tor detection)
- ✅ Admin panel entegrasyonu
- ✅ Pagination desteği

**Admin Panel:**
- Sol menüye "Registration Logs" eklendi (📜 icon)
- Detaylı log görüntüleme tablosu
- Renkli risk badge'leri (düşük/orta/yüksek)
- Cihaz icon'ları (💻 📱 🤖)
- Proxy/VPN/Tor uyarıları

**Kurulu Paketler:**
- `ua-parser-js` - User agent parsing

---

#### 2. Uluslararası Telefon Numarası Sistemi
**Amaç:** Tüm ülkelerden telefon numarası girişi.

**Eklenen Dosyalar:**
- `components/ui/InternationalPhoneInput.tsx` - Uluslararası telefon input component
- `scripts/update-phone-field.sql` - Database güncelleme

**Özellikler:**
- ✅ Alan kodu seçimi (200+ ülke)
- ✅ Bayrak gösterimi
- ✅ E.164 format desteği (+905551234567)
- ✅ Otomatik format düzeltme
- ✅ Ülkeye özel validation
- ✅ Default: Türkiye (+90)
- ✅ Arama yapılabilir dropdown

**Database:**
- `phone` alanı VARCHAR(20)'ye genişletildi
- Mevcut Türk numaraları +90 ile güncellendi

**Kurulu Paketler:**
- `react-phone-number-input` - Phone input component
- `libphonenumber-js` - Phone validation

**Güncellenen Dosyalar:**
- `schemas/validationSchemas.ts` - Uluslararası telefon validasyonu
- `components/steps/Step1PersonalInfo.tsx` - InternationalPhoneInput kullanımı
- `app/globals.css` - Phone input stilleri

---

#### 3. Form Step1 Güncellemeleri
**Amaç:** Daha detaylı kullanıcı bilgisi toplamak.

**Yeni Alanlar:**

**a) Cinsiyet (Gender) - Zorunlu**
- Seçenekler: Erkek, Kadın, Diğer, Belirtmek İstemiyorum
- Görünüm: 4 adet radio button (responsive grid)
- Database: ENUM('male', 'female', 'other', 'prefer_not_to_say')

**b) Şirket/Kurum (Company) - Opsiyonel**
- Text input
- Placeholder: "Örnek Şirket A.Ş."

**c) Departman (Department) - Opsiyonel**
- Text input
- Placeholder: "İnsan Kaynakları"
- Database: VARCHAR(100)

**Database:**
- `scripts/add-gender-company-department.sql` oluşturuldu
- `gender` kolonu eklendi
- `department` kolonu eklendi
- `company` kolonu zaten vardı, tekrar aktif edildi

**Güncellenen Dosyalar:**
- `store/formStore.ts` - Gender ve department state'leri
- `schemas/validationSchemas.ts` - Gender validation (zorunlu)
- `components/steps/Step1PersonalInfo.tsx` - UI alanları
- `app/api/saveForm/route.ts` - API endpoint güncelleme

---

### 🔧 Pagination Sistemi (Önceki Session)

**Eklenen Dosyalar:**
- `components/ui/Pagination.tsx` - Reusable pagination component
- `hooks/usePagination.ts` - Pagination hook

**Özellikler:**
- ✅ Sayfa başına kayıt seçimi (10/20/50/100)
- ✅ Sayfa navigasyonu (önceki/sonraki)
- ✅ Akıllı sayfa numaraları ("..." ile kısaltma)
- ✅ Kayıt bilgisi gösterimi
- ✅ Responsive tasarım

**API Güncellemeleri:**
- `app/api/registrations/route.ts` - Pagination parametreleri eklendi
- Query parameters: `?page=1&limit=20`
- Response format: `{data: [], pagination: {}}`

**Güncellenen Sayfalar:**
- `app/admin/registrations/page.tsx` - Pagination entegrasyonu
- `app/api/admin/dashboard/stats/route.ts` - Recent registrations 10'a çıkarıldı

---

### 🐛 Düzeltilen Hatalar

#### 1. Admin Login Sayfası Tasarımı
**Sorun:** Tailwind CSS yüklenmiyordu
**Çözüm:** Inline styles kullanıldı
- Modern card tasarımı
- Responsive layout
- Error handling
- Loading states

#### 2. Registrations API Hatası
**Sorun:** MySQL LIMIT/OFFSET parametreleri hatalıydı
**Çözüm:** Parameterized query yerine string interpolation kullanıldı

#### 3. Duplicate fetchCurrentUser
**Sorun:** fetchCurrentUser fonksiyonu iki kez tanımlanmıştı
**Çözüm:** Duplicate kaldırıldı

#### 4. Array Validation
**Sorun:** `registrations.map is not a function` hatası
**Çözüm:** Array.isArray kontrolü eklendi, error handling güçlendirildi

---

## Proje Yapısı

### 📁 Klasör Organizasyonu

```
form-wizard/
├── app/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── registrations/
│   │   ├── registration-logs/      # YENİ
│   │   ├── registration-types/
│   │   ├── settings/
│   │   └── login/
│   └── api/
│       ├── registrations/
│       ├── registration-logs/       # YENİ
│       └── saveForm/
├── components/
│   ├── steps/
│   │   └── Step1PersonalInfo.tsx   # GÜNCELLENDİ
│   └── ui/
│       ├── Pagination.tsx
│       └── InternationalPhoneInput.tsx  # YENİ
├── lib/
│   ├── getClientInfo.ts            # YENİ
│   ├── parseUserAgent.ts           # YENİ
│   ├── parseReferrer.ts            # YENİ
│   └── collectClientInfo.ts        # YENİ
├── hooks/
│   └── usePagination.ts
├── schemas/
│   └── validationSchemas.ts        # GÜNCELLENDİ
├── scripts/
│   ├── create-registration-logs-table.sql
│   ├── add-gender-company-department.sql
│   ├── update-phone-field.sql
│   └── insert-sample-logs.sql
└── .kiro/specs/
    └── registration-logs/          # YENİ
```

---

## Database Şeması

### Tablolar

#### 1. `registrations` (Güncellendi)
```sql
- gender ENUM('male', 'female', 'other', 'prefer_not_to_say')  # YENİ
- phone VARCHAR(20)  # Genişletildi (E.164 format)
- department VARCHAR(100)  # YENİ
- company VARCHAR(255)  # Tekrar aktif
```

#### 2. `registration_logs` (Yeni)
```sql
- id, registration_id
- ip_address, ip_version, country, city
- user_agent, browser, os, device_type
- referrer, utm_source, utm_medium, utm_campaign
- form_duration_seconds, steps_completed, errors_encountered
- screen_resolution, language, timezone
- is_proxy, is_vpn, is_tor, risk_score
- created_at, updated_at
```

---

## Kurulu NPM Paketleri

### Yeni Paketler
- `ua-parser-js` - User agent parsing
- `react-phone-number-input` - International phone input
- `libphonenumber-js` - Phone number validation

### Mevcut Paketler
- `next` - Framework
- `react`, `react-dom` - UI
- `zustand` - State management
- `zod` - Validation
- `react-hook-form` - Form handling
- `mysql2` - Database
- `tailwindcss` - Styling
- `jspdf`, `html2canvas` - PDF generation

---

## API Endpoints

### Yeni Endpoints
- `GET /api/registration-logs` - Tüm logları listele (pagination)
- `GET /api/registrations/[id]/logs` - Kayıt bazlı loglar
- `POST /api/registrations/[id]/log` - Log oluştur (henüz implement edilmedi)

### Güncellenen Endpoints
- `GET /api/registrations` - Pagination desteği eklendi
- `POST /api/saveForm` - Gender, department alanları eklendi

---

## Admin Panel Menüsü

```
📊 Dashboard
📝 Registrations
📜 Registration Logs        # YENİ
🏷️ Registration Types
🏦 Banka Ayarları
📈 Reports
📋 Audit Logs
⚙️ Ayarlar
```

---

## Önemli Notlar

### Güvenlik
- ✅ Proxy detection (X-Forwarded-For, X-Real-IP, CF-Connecting-IP)
- ✅ VPN/Tor detection (placeholder - implement edilecek)
- ✅ Risk scoring (placeholder - implement edilecek)
- ✅ Input sanitization
- ✅ SQL injection prevention

### GDPR Uyumluluğu
- ⚠️ IP adresi maskeleme (implement edilecek)
- ⚠️ Data retention policy (implement edilecek)
- ⚠️ User data deletion (implement edilecek)

### Performance
- ✅ Database indexing
- ✅ Pagination
- ✅ Lazy loading
- ⚠️ Caching (implement edilecek)

---

## Yapılacaklar (TODO)

### Registration Logs
- [ ] Log oluşturma API'si (POST /api/registrations/[id]/log)
- [ ] Form store'a tracking state'leri ekle
- [ ] Form steps'lere tracking entegrasyonu
- [ ] IP geolocation API entegrasyonu
- [ ] VPN/Proxy detection servisi
- [ ] Risk scoring algoritması
- [ ] GDPR compliance (data retention, anonymization)

### Genel
- [ ] Unit tests
- [ ] Integration tests
- [ ] Error logging servisi
- [ ] Performance monitoring
- [ ] Backup stratejisi

---

## Test Bilgileri

### Test Kullanıcıları
- Admin: (database'den kontrol et)

### Test Verileri
- 3 örnek registration log kaydı eklendi
- Farklı cihaz tipleri (desktop, mobile)
- Farklı risk seviyeleri (düşük, yüksek)

### Test Senaryoları
1. Form doldurma (tüm adımlar)
2. Uluslararası telefon girişi
3. Cinsiyet seçimi
4. Şirket/Departman girişi
5. Admin panel login
6. Registration logs görüntüleme
7. Pagination testi

---

## Versiyon Bilgisi

- **Next.js:** 14.0.4
- **React:** 18.x
- **Node.js:** 18+ (önerilen)
- **MySQL:** 8.0+

---

---

## [2025-01-07] - Form Ayarları Sistemi

### 🆕 Yeni Özellikler

#### Form Alanları Yönetimi
**Amaç:** Admin panelinden form alanlarının görünürlük ve zorunluluk durumlarını yönetmek.

**Eklenen Dosyalar:**
- `scripts/create-form-settings-tables.sql` - Database tabloları
- `app/api/form-settings/route.ts` - Public API (form render için)
- `app/api/admin/form-settings/route.ts` - Admin API (CRUD işlemleri)
- `hooks/useFormSettings.ts` - Form ayarları hook
- `app/admin/settings/form-fields/page.tsx` - Admin panel sayfası
- `components/steps/Step1PersonalInfo.tsx` - Dinamik form rendering

**Database:**
- `form_field_settings` tablosu oluşturuldu
  - Kolonlar: field_name, field_label, field_type, step_number, is_visible, is_required, display_order
  - 15 form alanı için default ayarlar eklendi
- `payment_method_settings` tablosu oluşturuldu
  - Kolonlar: method_name, method_label, is_enabled, display_order
  - 2 ödeme yöntemi (online, bank_transfer) eklendi

**Özellikler:**
- ✅ Form alanlarını görünür/gizli yapma
- ✅ Form alanlarını zorunlu/opsiyonel yapma
- ✅ Ödeme yöntemlerini aktif/pasif yapma
- ✅ Toggle switch ile kolay yönetim
- ✅ Gerçek zamanlı güncelleme
- ✅ Step1 dinamik rendering
- ✅ Step3 dinamik ödeme yöntemleri
- ✅ Tek ödeme yöntemi varsa otomatik seçim

**Admin Panel:**
- Sol menüye "Form Ayarları" eklendi (📋 icon)
- `/admin/settings/form-fields` sayfası
- Toggle switch'ler ile görünürlük/zorunluluk kontrolü
- Ödeme yöntemleri yönetimi
- Toplu kaydetme özelliği

**API Endpoints:**
- `GET /api/form-settings` - Public (form render için)
- `GET /api/admin/form-settings` - Admin (tüm ayarlar)
- `PUT /api/admin/form-settings` - Admin (toplu güncelleme)

**Frontend Entegrasyonu:**
- `useFormSettings` hook ile ayarları çekme
- `isFieldVisible()` - Alan görünür mü?
- `isFieldRequired()` - Alan zorunlu mu?
- `getEnabledPaymentMethods()` - Aktif ödeme yöntemleri
- Conditional rendering ile dinamik form

**Kullanım Senaryoları:**
1. **Şirket alanını gizle:** Admin Panel → Form Ayarları → Şirket/Kurum → [  Görünür]
2. **Departmanı zorunlu yap:** Admin Panel → Form Ayarları → Departman → [✓ Zorunlu]
3. **Sadece banka transferi:** Admin Panel → Form Ayarları → Online Ödeme [  ] Banka Transferi [✓]

**Güvenlik:**
- ✅ Admin authentication
- ✅ Role-based access (admin/manager)
- ✅ Transaction kullanımı
- ✅ Input validation

---

## Son Güncelleme
**Tarih:** 2025-01-07
**Durum:** ✅ Çalışıyor
**Server:** http://localhost:3000

### 🎯 Test Edilecek Özellikler
1. **Admin Panel:** http://localhost:3000/admin/login
2. **Form Ayarları:** http://localhost:3000/admin/settings/form-fields
3. **Ana Form:** http://localhost:3000
4. **Registration Logs:** http://localhost:3000/admin/registration-logs
