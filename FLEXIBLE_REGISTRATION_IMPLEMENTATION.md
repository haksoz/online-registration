# 🎯 Esnek Kayıt Sistemi - Implementation Planı

## 📌 Genel Bakış

Mevcut tek seçimli kayıt sisteminden, çoklu kategori ve çoklu seçim destekleyen esnek bir kayıt sistemine geçiş.

### Hedefler
- Kongre, Kurs, Konaklama gibi kategorilere ayrılmış kayıt sistemi
- Çoklu seçim desteği (özellikle kurslar için)
- Erken kayıt indirimi yönetimi
- Kapasite kontrolü (kurslar için)
- Admin tarafından yönetilebilir kategori ve kayıt türleri
- Kategori bazlı iptal/iade politikaları

### Temel Kararlar
✅ Tek kişi kayıt (1 form = 1 kişi)
✅ Döviz kuru tek seferlik (kayıt anında)
✅ Kayıt anındaki fiyatlar sabit kalır
✅ Kurs çoklu seçim + kapasite kontrolü
✅ Kategori zorunluluğu admin'den ayarlanabilir
✅ Erken kayıt tarih bazlı
✅ Erken kayıt gösterimi admin kontrolünde
✅ Kategori sıralaması değiştirilebilir
❌ Bekleme listesi yok
❌ Taksitli ödeme yok
❌ Kategori bazlı ayrı fatura yok

---

## 🗄️ Veritabanı Mimarisi

### 1. Yeni Tablo: `registration_categories`

Kayıt kategorilerini tutar (Kongre, Kurs, Konaklama vb.)

```sql
CREATE TABLE registration_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE COMMENT 'kongre, kurs, konaklama',
  label_tr VARCHAR(100) NOT NULL,
  label_en VARCHAR(100) NOT NULL,
  description_tr TEXT,
  description_en TEXT,
  is_visible BOOLEAN DEFAULT TRUE COMMENT 'Kullanıcıya gösterilsin mi?',
  is_required BOOLEAN DEFAULT FALSE COMMENT 'Seçim zorunlu mu?',
  allow_multiple BOOLEAN DEFAULT FALSE COMMENT 'Çoklu seçim yapılabilir mi?',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  icon VARCHAR(50) COMMENT 'Emoji veya icon class',
  refund_policy_tr TEXT COMMENT 'İptal/iade politikası',
  refund_policy_en TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active_visible (is_active, is_visible),
  INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Güncellenen Tablo: `registration_types`

Mevcut tabloya yeni kolonlar eklenir.

```sql
ALTER TABLE registration_types
ADD COLUMN category_id INT AFTER id,
ADD COLUMN early_bird_fee_try DECIMAL(10,2) DEFAULT NULL COMMENT 'Erken kayıt TL fiyatı',
ADD COLUMN early_bird_fee_usd DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN early_bird_fee_eur DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN early_bird_deadline DATETIME DEFAULT NULL COMMENT 'Erken kayıt son tarihi',
ADD COLUMN show_early_bird BOOLEAN DEFAULT TRUE COMMENT 'Erken kayıt fiyatı gösterilsin mi?',
ADD COLUMN capacity INT DEFAULT NULL COMMENT 'NULL = sınırsız',
ADD COLUMN current_registrations INT DEFAULT 0 COMMENT 'Mevcut kayıt sayısı',
ADD FOREIGN KEY (category_id) REFERENCES registration_categories(id) ON DELETE RESTRICT,
ADD INDEX idx_category (category_id),
ADD INDEX idx_capacity (capacity, current_registrations);
```


### 3. Yeni Tablo: `registration_selections`

Her kaydın seçtiği kayıt türlerini tutar (1 kayıt = N seçim).

```sql
CREATE TABLE registration_selections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  registration_id INT NOT NULL,
  registration_type_id INT NOT NULL,
  applied_fee_try DECIMAL(10,2) NOT NULL COMMENT 'Uygulanmış TL fiyatı',
  applied_currency VARCHAR(3) DEFAULT 'TRY',
  applied_fee_amount DECIMAL(10,2) NOT NULL COMMENT 'Seçilen para birimindeki fiyat',
  exchange_rate DECIMAL(10,4) NOT NULL COMMENT 'Kayıt anındaki kur',
  vat_rate DECIMAL(5,4) NOT NULL COMMENT '0.18 gibi',
  vat_amount_try DECIMAL(10,2) NOT NULL COMMENT 'KDV tutarı TL',
  total_try DECIMAL(10,2) NOT NULL COMMENT 'KDV dahil toplam TL',
  is_early_bird BOOLEAN DEFAULT FALSE COMMENT 'Erken kayıt uygulandı mı?',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  FOREIGN KEY (registration_type_id) REFERENCES registration_types(id) ON DELETE RESTRICT,
  INDEX idx_registration (registration_id),
  INDEX idx_type (registration_type_id),
  INDEX idx_early_bird (is_early_bird)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4. Trigger'lar (Kapasite Yönetimi)

```sql
-- Kayıt eklendiğinde kapasiteyi artır
DELIMITER //
CREATE TRIGGER update_capacity_after_insert
AFTER INSERT ON registration_selections
FOR EACH ROW
BEGIN
  UPDATE registration_types 
  SET current_registrations = current_registrations + 1
  WHERE id = NEW.registration_type_id;
END//

-- Kayıt silindiğinde kapasiteyi azalt
CREATE TRIGGER update_capacity_after_delete
AFTER DELETE ON registration_selections
FOR EACH ROW
BEGIN
  UPDATE registration_types 
  SET current_registrations = current_registrations - 1
  WHERE id = OLD.registration_type_id;
END//
DELIMITER ;
```

---

## 🔌 API Endpoint'leri

### 1. Kategorileri ve Kayıt Türlerini Getir

**GET** `/api/registration-categories`


```typescript
// Response
{
  success: true,
  data: {
    categories: [
      {
        id: 1,
        name: 'kongre',
        label: 'Kongreye Katılım',
        description: 'Kongre oturumlarına katılım',
        isRequired: true,
        allowMultiple: false,
        icon: '🎤',
        types: [
          {
            id: 1,
            value: 'ogrenci',
            label: 'Öğrenci',
            description: 'Lisans, yüksek lisans ve doktora öğrencileri',
            fee_try: 500.00,
            fee_usd: 15.00,
            fee_eur: 13.50,
            early_bird_fee_try: 400.00,
            early_bird_fee_usd: 12.00,
            early_bird_fee_eur: 11.00,
            early_bird_deadline: '2024-12-15T23:59:59',
            show_early_bird: true,
            is_early_bird_active: true, // Hesaplanmış
            vat_rate: 0.18,
            capacity: null,
            current_registrations: 0,
            is_available: true // Hesaplanmış
          }
        ]
      },
      {
        id: 2,
        name: 'kurs',
        label: 'Kurs Seçimi',
        isRequired: false,
        allowMultiple: true,
        icon: '📚',
        types: [...]
      }
    ],
    exchangeRates: {
      USD: 34.50,
      EUR: 37.20
    }
  }
}
```

### 2. Kapasite Kontrolü

**GET** `/api/registration-types/:id/availability`

```typescript
// Response
{
  success: true,
  data: {
    available: true,
    remaining: 15,
    capacity: 30,
    current_registrations: 15
  }
}
```

### 3. Kayıt Oluştur (Çoklu Seçim)

**POST** `/api/registrations`

```typescript
// Request
{
  personalInfo: {
    fullName: "Ahmet Yılmaz",
    email: "ahmet@example.com",
    // ... diğer alanlar
  },
  selections: [
    {
      typeId: 1,
      categoryId: 1,
      isEarlyBird: true
    },
    {
      typeId: 5,
      categoryId: 2,
      isEarlyBird: false
    },
    {
      typeId: 8,
      categoryId: 2,
      isEarlyBird: false
    }
  ],
  currency: 'TRY',
  exchangeRate: 34.50,
  payment: {
    paymentMethod: 'bank_transfer'
  }
}

// Response
{
  success: true,
  referenceNumber: 'REF-2024-001234',
  data: {
    registrationId: 123,
    selections: [
      {
        type: 'Öğrenci',
        category: 'Kongre',
        fee: 400.00,
        vat: 72.00,
        total: 472.00,
        isEarlyBird: true
      }
    ],
    grandTotal: 1298.00
  }
}
```


---

## 🎨 Frontend Değişiklikleri

### Step2Accommodation.tsx - Yeni Tasarım

```typescript
interface CategorySelection {
  categoryId: number
  categoryName: string
  selectedTypes: number[] // Çoklu seçim için array
}

interface AccommodationFormData {
  selectedCategories: CategorySelection[]
  totalAmount: number
  totalVat: number
  grandTotal: number
  currency: string
  exchangeRate: number
}

// Validasyon
const validateSelections = (
  categories: Category[],
  selections: CategorySelection[]
) => {
  // 1. Zorunlu kategoriler kontrol
  const requiredCategories = categories.filter(c => c.isRequired)
  for (const required of requiredCategories) {
    const hasSelection = selections.some(s => s.categoryId === required.id)
    if (!hasSelection) {
      return `${required.label} seçimi zorunludur`
    }
  }
  
  // 2. Çoklu seçim kontrolü
  for (const selection of selections) {
    const category = categories.find(c => c.id === selection.categoryId)
    if (!category?.allowMultiple && selection.selectedTypes.length > 1) {
      return `${category.label} kategorisinden sadece 1 seçim yapabilirsiniz`
    }
  }
  
  // 3. Kapasite kontrolü
  for (const selection of selections) {
    for (const typeId of selection.selectedTypes) {
      const type = findTypeById(typeId)
      if (type.capacity && type.current_registrations >= type.capacity) {
        return `${type.label} için kontenjan dolmuştur`
      }
    }
  }
  
  return null
}
```

### UI Bileşenleri

```typescript
// CategoryCard.tsx
<div className="category-card">
  <div className="category-header">
    <input 
      type="checkbox" 
      checked={isCategorySelected}
      onChange={toggleCategory}
    />
    <span className="icon">{category.icon}</span>
    <h3>{category.label}</h3>
    {category.isRequired && <span className="badge">Zorunlu</span>}
  </div>
  
  {isCategorySelected && (
    <div className="types-list">
      {category.types.map(type => (
        <RegistrationTypeCard 
          key={type.id}
          type={type}
          allowMultiple={category.allowMultiple}
          selected={isTypeSelected(type.id)}
          onSelect={handleTypeSelect}
        />
      ))}
    </div>
  )}
</div>

// RegistrationTypeCard.tsx
<div className={`type-card ${selected ? 'selected' : ''}`}>
  <input 
    type={allowMultiple ? 'checkbox' : 'radio'}
    checked={selected}
    onChange={onSelect}
    disabled={!type.is_available}
  />
  
  <div className="type-info">
    <h4>{type.label}</h4>
    <p className="description">{type.description}</p>
    
    {/* Erken kayıt gösterimi */}
    {type.is_early_bird_active && type.show_early_bird && (
      <div className="early-bird-badge">
        🎉 Erken Kayıt: {formatPrice(type.early_bird_fee_try)}
        <span className="normal-price">Normal: {formatPrice(type.fee_try)}</span>
        <span className="deadline">Son: {formatDate(type.early_bird_deadline)}</span>
      </div>
    )}
    
    {/* Normal fiyat */}
    {!type.is_early_bird_active && (
      <div className="price">{formatPrice(type.fee_try)}</div>
    )}
    
    {/* Kapasite gösterimi */}
    {type.capacity && (
      <div className="capacity">
        {type.is_available ? (
          <span className="available">
            📊 {type.capacity - type.current_registrations}/{type.capacity} kontenjan
          </span>
        ) : (
          <span className="full">❌ DOLU</span>
        )}
      </div>
    )}
  </div>
</div>

// PriceSummary.tsx
<div className="price-summary">
  <h4>Seçimleriniz:</h4>
  {selections.map(sel => (
    <div key={sel.id} className="selection-item">
      <span>{sel.categoryLabel} - {sel.typeLabel}</span>
      <span>{formatPrice(sel.price)}</span>
    </div>
  ))}
  <hr />
  <div className="subtotal">
    <span>Ara Toplam:</span>
    <span>{formatPrice(subtotal)}</span>
  </div>
  <div className="vat">
    <span>KDV (%18):</span>
    <span>{formatPrice(vat)}</span>
  </div>
  <div className="total">
    <span>TOPLAM:</span>
    <span className="amount">{formatPrice(grandTotal)}</span>
  </div>
</div>
```


---

## 🔧 Admin Panel Sayfaları

### 1. Kategori Yönetimi (`/admin/categories`)

**Özellikler:**
- Kategori listesi (drag-drop ile sıralama)
- Yeni kategori ekleme
- Kategori düzenleme
- Kategori silme (kayıt türü yoksa)
- Aktif/Pasif yapma
- Görünürlük ve zorunluluk ayarları

**Kolonlar:**
- Sıra (drag handle)
- İkon
- Kategori Adı (TR/EN)
- Göster/Gizle
- Zorunlu/Opsiyonel
- Çoklu Seçim
- Kayıt Türü Sayısı
- Durum
- İşlemler

### 2. Kayıt Türü Yönetimi (`/admin/registration-types`)

**Özellikler:**
- Kategori bazlı filtreleme
- Kayıt türü listesi
- Yeni tür ekleme
- Tür düzenleme
- Tür silme (kayıt yoksa)
- Toplu fiyat güncelleme
- Kapasite yönetimi

**Form Alanları:**
- Kategori seçimi
- Türkçe/İngilizce adı
- Türkçe/İngilizce açıklama
- Normal fiyatlar (TRY/USD/EUR)
- Erken kayıt fiyatları
- Erken kayıt son tarihi
- Erken kayıt gösterim ayarı
- KDV oranı
- Kapasite (boş = sınırsız)
- Sıra
- Aktif/Pasif

### 3. Raporlama Güncellemeleri

**Yeni Raporlar:**
- Kategori bazlı gelir raporu
- Kurs doluluk oranı
- En çok seçilen kombinasyonlar
- Erken kayıt istatistikleri

---

## 📊 Migration Stratejisi

### Adım 1: Yeni Tabloları Oluştur

```sql
-- 1. registration_categories tablosu
CREATE TABLE registration_categories (...);

-- 2. registration_selections tablosu
CREATE TABLE registration_selections (...);

-- 3. Trigger'ları oluştur
CREATE TRIGGER update_capacity_after_insert ...
CREATE TRIGGER update_capacity_after_delete ...
```

### Adım 2: Mevcut Tabloyu Güncelle

```sql
-- registration_types'a yeni kolonlar ekle
ALTER TABLE registration_types
ADD COLUMN category_id INT,
ADD COLUMN early_bird_fee_try DECIMAL(10,2),
-- ... diğer kolonlar
```

### Adım 3: Default Verileri Oluştur

```sql
-- Default kategori: Kongre
INSERT INTO registration_categories 
(name, label_tr, label_en, is_required, allow_multiple, display_order, icon)
VALUES 
('kongre', 'Kongre Kayıt', 'Congress Registration', 1, 0, 1, '🎤');

-- Mevcut kayıt türlerini bu kategoriye bağla
UPDATE registration_types 
SET category_id = 1 
WHERE category_id IS NULL;
```

### Adım 4: Mevcut Kayıtları Dönüştür

```sql
-- Mevcut registrations tablosundaki kayıtları 
-- registration_selections'a dönüştür
INSERT INTO registration_selections 
(
  registration_id, 
  registration_type_id, 
  applied_fee_try,
  applied_currency,
  applied_fee_amount,
  exchange_rate,
  vat_rate,
  vat_amount_try,
  total_try,
  is_early_bird
)
SELECT 
  r.id,
  r.registration_type_id,
  rt.fee_try,
  'TRY',
  rt.fee_try,
  1.0,
  0.18,
  rt.fee_try * 0.18,
  rt.fee_try * 1.18,
  FALSE
FROM registrations r
JOIN registration_types rt ON r.registration_type_id = rt.id
WHERE r.registration_type_id IS NOT NULL;
```

### Adım 5: Geriye Dönük Uyumluluk

```sql
-- registrations tablosunda registration_type_id kolonunu koru
-- Eski raporlar için gerekli olabilir
-- Yeni kayıtlarda NULL olacak (selections tablosunda tutulacak)
```


---

## 🧪 Test Senaryoları

### 1. Kategori Yönetimi
- [ ] Yeni kategori ekleme
- [ ] Kategori düzenleme
- [ ] Kategori silme (kayıt türü varsa hata)
- [ ] Kategori sıralama (drag-drop)
- [ ] Kategori aktif/pasif yapma
- [ ] Zorunlu kategori işaretleme
- [ ] Çoklu seçim ayarı

### 2. Kayıt Türü Yönetimi
- [ ] Yeni kayıt türü ekleme
- [ ] Kayıt türü düzenleme
- [ ] Kayıt türü silme (kayıt varsa hata)
- [ ] Erken kayıt fiyatı ayarlama
- [ ] Erken kayıt son tarihi geçince normal fiyat gösterimi
- [ ] Kapasite ayarlama
- [ ] Kapasite dolunca "DOLU" gösterimi

### 3. Kullanıcı Kayıt Akışı
- [ ] Zorunlu kategori seçilmeden ilerleme engelleme
- [ ] Tek seçimli kategoride birden fazla seçim engelleme
- [ ] Çoklu seçimli kategoride birden fazla seçim
- [ ] Kapasite dolu olan türü seçememe
- [ ] Erken kayıt fiyatı uygulanması
- [ ] Toplam fiyat hesaplama (KDV dahil)
- [ ] Döviz kuru ile fiyat hesaplama

### 4. Kapasite Yönetimi
- [ ] Kayıt eklenince kapasite azalması
- [ ] Kayıt iptal edilince kapasite artması
- [ ] Kapasite dolunca yeni kayıt engelleme
- [ ] Trigger'ların doğru çalışması

### 5. Raporlama
- [ ] Kategori bazlı gelir raporu
- [ ] Kurs doluluk oranı
- [ ] Erken kayıt istatistikleri
- [ ] Kombinasyon analizi

---

## 📅 Zaman Planı

### Faz 1: Veritabanı & Backend (1-2 gün)
- **Gün 1 Sabah:** Migration dosyaları + Tablo oluşturma
- **Gün 1 Öğleden Sonra:** API endpoint'leri
- **Gün 2 Sabah:** Validasyon logic'leri
- **Gün 2 Öğleden Sonra:** Test + Debug

### Faz 2: Admin Panel (2-3 gün)
- **Gün 3:** Kategori yönetim sayfası
- **Gün 4:** Kayıt türü yönetimi + Erken kayıt ayarları
- **Gün 5:** Sıralama (drag-drop) + Kapasite yönetimi

### Faz 3: Frontend Form (2-3 gün)
- **Gün 6:** Step2 yeniden tasarım + Çoklu seçim UI
- **Gün 7:** Dinamik fiyat hesaplama + Kapasite gösterimi
- **Gün 8:** Erken kayıt badge'leri + Polish

### Faz 4: Test & Migration (1-2 gün)
- **Gün 9:** Mevcut verileri migrate et + Test senaryoları
- **Gün 10:** Geriye dönük uyumluluk + Final test

**Toplam Süre:** 8-10 gün

---

## 🚀 Deployment Checklist

### Öncesi
- [ ] Veritabanı backup al
- [ ] Migration script'lerini test et (staging)
- [ ] API endpoint'lerini test et
- [ ] Frontend build al ve test et

### Deployment
- [ ] Maintenance mode aç
- [ ] Migration'ları çalıştır
- [ ] Default verileri ekle
- [ ] Mevcut kayıtları migrate et
- [ ] Yeni kodu deploy et
- [ ] Cache'leri temizle

### Sonrası
- [ ] Smoke test yap
- [ ] Kategori ve kayıt türlerini kontrol et
- [ ] Test kayıt oluştur
- [ ] Raporları kontrol et
- [ ] Maintenance mode kapat
- [ ] Kullanıcılara duyuru yap

---

## 📝 Notlar

### Önemli Kararlar
1. **Geriye Dönük Uyumluluk:** Mevcut `registrations.registration_type_id` kolonu korunacak
2. **Fiyat Sabitleme:** Kayıt anındaki fiyatlar `registration_selections` tablosunda saklanacak
3. **Kapasite Yönetimi:** Trigger'lar ile otomatik güncellenecek
4. **Erken Kayıt:** Tarih bazlı, admin kontrolünde gösterim

### Gelecek İyileştirmeler (v2)
- Kupon/İndirim kodu sistemi
- Grup kayıt (toplu kayıt)
- Bekleme listesi
- Kategori bazlı ayrı fatura
- Taksitli ödeme
- Paket fiyatları (kongre+kurs indirimi)
- Dinamik form alanları (kategori bazlı)

### Riskler ve Çözümler
1. **Risk:** Migration sırasında veri kaybı
   - **Çözüm:** Detaylı backup + Staging test
   
2. **Risk:** Kapasite trigger'ları yanlış çalışabilir
   - **Çözüm:** Transaction kullan + Test senaryoları
   
3. **Risk:** Performans sorunları (çok fazla join)
   - **Çözüm:** Index'leme + Cache stratejisi
   
4. **Risk:** Kullanıcı karmaşası (çok fazla seçenek)
   - **Çözüm:** İyi UX tasarımı + Yardım metinleri

---

## 📞 İletişim ve Onay

Bu dokümantasyon hazırlandı ve saklandı. İmplementasyona başlamadan önce:

1. ✅ Tüm paydaşlarla gözden geçirilmeli
2. ✅ Eksik noktalar tamamlanmalı
3. ✅ Zaman planı onaylanmalı
4. ✅ Yeni branch oluşturulmalı: `feature/flexible-registration-system`

**Hazırlayan:** Kiro AI Assistant  
**Tarih:** 19 Kasım 2025  
**Versiyon:** 1.0  
**Durum:** Onay Bekliyor

---

## 🔗 İlgili Dosyalar

İmplementasyon sırasında değiştirilecek dosyalar:

### Backend
- `app/api/registration-categories/route.ts` (YENİ)
- `app/api/registration-types/route.ts` (GÜNCELLE)
- `app/api/registrations/route.ts` (GÜNCELLE)
- `scripts/migrations/add-flexible-registration.sql` (YENİ)

### Frontend
- `components/steps/Step2Accommodation.tsx` (BÜYÜK DEĞİŞİKLİK)
- `components/registration/CategoryCard.tsx` (YENİ)
- `components/registration/RegistrationTypeCard.tsx` (YENİ)
- `components/registration/PriceSummary.tsx` (YENİ)
- `store/formStore.ts` (GÜNCELLE)
- `store/dataStore.ts` (GÜNCELLE)

### Admin Panel
- `app/admin/categories/page.tsx` (YENİ)
- `app/admin/registration-types/page.tsx` (GÜNCELLE)
- `app/admin/reports/page.tsx` (GÜNCELLE)

### Types
- `types/registration.ts` (GÜNCELLE)
- `types/category.ts` (YENİ)

---

**Not:** Bu dokümantasyon gelecekte implementasyon için referans olarak saklanmıştır.
