# Telefon Numarası Girişi İyileştirmesi - Tasarım

## Genel Bakış

Bu tasarım, mevcut form wizard uygulamasındaki telefon numarası girişini kullanıcı dostu hale getirmek için geliştirilmiştir. Sistem, kullanıcıların telefon numaralarını doğal formatlarında girmelerine izin verirken, backend'e standart formatta veri gönderecektir.

## Mimari

### Kütüphane Seçimi

Araştırma sonucunda, aşağıdaki seçenekler değerlendirilmiştir:

1. **react-input-mask**: Basit maskeleme, küçük boyut
2. **react-phone-input-2**: Ülke seçimi ile kapsamlı çözüm
3. **Custom Hook**: Özel geliştirilmiş, hafif çözüm

**Seçilen Çözüm**: Custom Hook yaklaşımı
- Mevcut tasarımla uyumlu
- Gereksiz bağımlılık eklemiyor
- Türkiye odaklı basit ihtiyaçları karşılıyor
- Performans optimizasyonu

### Bileşen Mimarisi

```
PhoneInput Component
├── usePhoneInput Hook
│   ├── formatPhoneDisplay()
│   ├── parsePhoneInput()
│   └── validatePhoneNumber()
├── Input Element (Controlled)
└── Validation Integration
```

## Bileşenler ve Arayüzler

### 1. PhoneInput Bileşeni

```typescript
interface PhoneInputProps {
  value?: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}
```

**Özellikler:**
- Sabit "+90 " prefix görüntüleme
- Otomatik maskeleme (555 123 4567)
- Sadece rakam girişi
- Maksimum 10 hane sınırı

### 2. usePhoneInput Hook

```typescript
interface UsePhoneInputReturn {
  displayValue: string
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  isValid: boolean
}

function usePhoneInput(
  value: string,
  onChange: (value: string) => void
): UsePhoneInputReturn
```

**Fonksiyonlar:**
- `formatPhoneDisplay(input: string): string` - Görüntü formatı
- `parsePhoneInput(input: string): string` - Backend formatı
- `validatePhoneNumber(phone: string): boolean` - Doğrulama

### 3. Validation Schema Güncellemesi

```typescript
const phoneValidation = z
  .string()
  .min(1, 'Telefon zorunludur')
  .refine(
    (phone) => validateTurkishPhone(phone),
    'Geçerli bir Türkiye telefon numarası girin'
  )
  .transform((phone) => normalizePhoneNumber(phone))
```

## Veri Modelleri

### Telefon Numarası Formatları

1. **Kullanıcı Girişi**: "555 123 4567"
2. **Görüntü Formatı**: "+90 555 123 4567"
3. **Backend Formatı**: "+905551234567"
4. **Veritabanı Formatı**: "+905551234567"

### Dönüşüm Fonksiyonları

```typescript
// Kullanıcı girişini backend formatına çevir
function normalizePhoneNumber(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('5')) {
    return `+90${digits}`
  }
  return input // Geçersiz format olduğu gibi döner
}

// Backend formatını görüntü formatına çevir
function formatPhoneDisplay(phone: string): string {
  if (phone.startsWith('+90')) {
    const digits = phone.slice(3)
    if (digits.length === 10) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
    }
  }
  return phone
}
```

## Hata Yönetimi

### Validation Hataları

1. **Boş Alan**: "Telefon zorunludur"
2. **Geçersiz Format**: "Geçerli bir Türkiye telefon numarası girin"
3. **Eksik Rakam**: "Telefon numarası 10 haneli olmalıdır"
4. **Geçersiz Başlangıç**: "Cep telefonu numarası 5 ile başlamalıdır"

### Hata Gösterimi

- Gerçek zamanlı doğrulama (onChange)
- Görsel hata durumu (kırmızı border)
- Açıklayıcı hata mesajları
- Form submit sırasında final doğrulama

## Test Stratejisi

### Unit Testler

1. **Formatting Fonksiyonları**
   - `formatPhoneDisplay()` farklı giriş formatları
   - `normalizePhoneNumber()` dönüşüm testleri
   - `validateTurkishPhone()` doğrulama testleri

2. **Hook Testleri**
   - `usePhoneInput` state yönetimi
   - Event handler'lar
   - Validation logic

3. **Component Testleri**
   - Render testleri
   - User interaction testleri
   - Error state testleri

### Integration Testleri

1. **Form Integration**
   - Step1PersonalInfo ile entegrasyon
   - Form submission testleri
   - Validation schema entegrasyonu

2. **Store Integration**
   - FormStore ile veri akışı
   - State persistence testleri

### Test Senaryoları

```typescript
describe('PhoneInput', () => {
  it('should format input as user types', () => {
    // Test: "5551234567" -> "555 123 4567"
  })
  
  it('should normalize for backend', () => {
    // Test: "555 123 4567" -> "+905551234567"
  })
  
  it('should handle existing data', () => {
    // Test: "+905551234567" -> "555 123 4567" display
  })
  
  it('should validate Turkish mobile numbers', () => {
    // Test: Various valid/invalid formats
  })
})
```

## Performans Optimizasyonları

1. **Debounced Validation**: Gerçek zamanlı doğrulama için debounce
2. **Memoization**: Format fonksiyonları için useMemo
3. **Event Optimization**: Gereksiz re-render'ları önleme
4. **Bundle Size**: Custom hook ile minimal footprint

## Güvenlik Considerations

1. **Input Sanitization**: Sadece rakam ve belirli karakterler
2. **XSS Prevention**: Güvenli string işleme
3. **Data Validation**: Backend'de double validation
4. **Rate Limiting**: Form submission sınırlaması (mevcut)

## Backward Compatibility

1. **Mevcut Veri**: Eski telefon formatları desteklenir
2. **API Uyumluluğu**: Backend API değişikliği gerektirmez
3. **Migration**: Otomatik format dönüşümü
4. **Fallback**: Geçersiz formatlar olduğu gibi korunur