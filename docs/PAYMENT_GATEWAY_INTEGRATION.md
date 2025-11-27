# Sanal POS Entegrasyonu Dokümantasyonu

## 📋 Genel Bakış

Bu proje, Türk bankalarının sanal POS sistemleri ile entegrasyon için esnek bir yapı sunar. Admin panelinden farklı bankaları seçip yapılandırabilirsiniz.

## 🏦 Desteklenen Bankalar

### ✅ Aktif Entegrasyonlar
- **Denizbank** (Garanti altyapısı)

### 🔜 Planlanan Entegrasyonlar
- Garanti Bankası
- İş Bankası
- Akbank
- Yapı Kredi
- Diğer bankalar

## 📁 Dosya Yapısı

```
lib/payment/
├── hashGenerator.ts              # SHA1, SHA256, AES şifreleme
├── denizbank.ts                  # Denizbank service
├── paymentGatewayFactory.ts      # Gateway factory pattern

app/api/payment/
├── initiate/route.ts             # Ödeme başlatma
├── callback-success/route.ts     # Başarılı callback
└── callback-fail/route.ts        # Başarısız callback

app/api/admin/payment-gateways/
├── route.ts                      # Gateway CRUD
└── [id]/toggle/route.ts          # Aktif gateway değiştirme

app/admin/settings/
└── payment-gateway/page.tsx      # Admin panel

types/
└── payment.ts                    # TypeScript tipleri

migrations/
└── 011_create_payment_gateway_tables.sql
```

## 🗄️ Veritabanı Tabloları

### `payment_gateways`
Banka yapılandırmaları (shop code, merchant pass, vb.)

### `payment_transactions`
Tüm ödeme işlemleri ve durumları

## 🔧 Kurulum

### 1. Migration Çalıştırma
```bash
mysql -h HOST -u USER -pPASSWORD DATABASE < migrations/011_create_payment_gateway_tables.sql
```

### 2. NPM Paketleri
```bash
npm install crypto-js uuid
npm install --save-dev @types/crypto-js
```

### 3. Environment Variables
`.env` dosyasına ekleyin:
```env
PAYMENT_ENCRYPTION_KEY=your-random-secret-key-here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🎯 Kullanım

### Admin Panelinden Yapılandırma

1. `/admin/settings/payment-gateway` adresine gidin
2. Kullanmak istediğiniz bankayı seçin
3. **Shop Code** ve **Merchant Password** girin
4. **Test Modu** aktif edin (ilk testler için)
5. Gateway'i **Aktif** yapın
6. Kaydedin

### Frontend'den Ödeme Başlatma

```typescript
const response = await fetch('/api/payment/initiate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 100.00,
    currency: 'TRY',
    cardNumber: '4111111111111111',
    cardExpiry: '12/25',
    cardCvv: '123',
    cardHolderName: 'JOHN DOE',
    formSubmissionId: 123 // Opsiyonel
  })
});

const data = await response.json();

if (data.success) {
  // 3D Secure sayfasını yeni pencerede aç
  const win = window.open('', '_blank');
  win.document.write(data.htmlContent);
}
```

## 🔐 Güvenlik

- ✅ Merchant şifreleri AES ile şifrelenir
- ✅ Kart bilgileri asla veritabanına kaydedilmez
- ✅ Hash doğrulaması callback'lerde yapılır
- ✅ HTTPS zorunlu (production'da)
- ✅ IP ve User Agent kaydedilir

## 🔄 Ödeme Akışı

```
1. Kullanıcı kart bilgilerini girer
   ↓
2. POST /api/payment/initiate
   ↓
3. Hash oluşturulur
   ↓
4. Banka API'sine istek atılır
   ↓
5. 3D Secure sayfası açılır
   ↓
6. Kullanıcı bankadan onaylar
   ↓
7. Callback: /api/payment/callback-success
   ↓
8. Hash doğrulanır
   ↓
9. Veritabanına kaydedilir
   ↓
10. Kullanıcıya sonuç gösterilir
```

## 🧪 Test

### Denizbank Test Kartı
```
Kart No: 4508 0345 0803 4509
Son Kullanma: 12/26
CVV: 000
3D Şifre: a (küçük harf)
```

**Önemli:** 3D Secure sayfasında şifre olarak küçük harf "a" girilmelidir.

### Test Modu
- Test modunda gerçek para çekilmez
- Test URL'leri kullanılır: `https://sanaltest.denizbank.com/mpi/Default.aspx`
- Tüm işlemler loglanır
- 3D Secure doğrulaması gerçek gibi çalışır

## 🆕 Yeni Banka Ekleme

### 1. Service Oluştur
```typescript
// lib/payment/garanti.ts
export class GarantiService {
  preparePaymentData() { ... }
  validateCallback() { ... }
  generatePaymentForm() { ... }
}
```

### 2. Factory'ye Ekle
```typescript
// lib/payment/paymentGatewayFactory.ts
case 'garanti':
  return new GarantiService(gateway, merchantPass, baseUrl);
```

### 3. Veritabanına Ekle
```sql
INSERT INTO payment_gateways (gateway_name, gateway_code, ...) 
VALUES ('Garanti', 'garanti', ...);
```

## 📊 Transaction Durumları

- `pending`: Ödeme başlatıldı, sonuç bekleniyor
- `success`: Ödeme başarılı
- `failed`: Ödeme başarısız
- `cancelled`: Kullanıcı iptal etti

## 🔍 Loglama

Tüm işlemler `payment_transactions` tablosunda loglanır:
- IP adresi
- User agent
- Banka response
- Hata mesajları
- Transaction ID
- Auth code

## 📞 Destek

Sorun yaşarsanız:
1. `payment_transactions` tablosunu kontrol edin
2. `bank_response` alanına bakın
3. Test modunda mı çalıştığınızı kontrol edin
4. Merchant bilgilerinin doğru olduğundan emin olun

## 🚀 Production'a Geçiş

1. Bankadan production bilgilerini alın
2. Admin panelden **Test Modu**'nu kapatın
3. `.env` dosyasında `NEXT_PUBLIC_BASE_URL`'i güncelleyin
4. HTTPS aktif olduğundan emin olun
5. Küçük bir test ödemesi yapın
6. Logları kontrol edin

## ⚠️ Önemli Notlar

- Merchant şifrenizi asla GitHub'a pushlamamayın
- `.env` dosyası `.gitignore`'da olmalı
- Production'da mutlaka HTTPS kullanın
- Test kartlarıyla production'da işlem yapmayın
- Her bankadan ayrı test bilgileri alın
