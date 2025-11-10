# T.C. Kimlik Numarası Validasyonu - Tasarım

## Genel Bakış

Bu tasarım, T.C. kimlik numarası girişini T.C. Cumhuriyeti'nin resmi algoritmasına göre doğrulamak için geliştirilmiştir. Sistem, gerçek zamanlı doğrulama, kullanıcı dostu arayüz ve güvenli veri işleme sağlayacaktır.

## T.C. Kimlik Numarası Algoritması

### Algoritma Kuralları

1. **Uzunluk**: Tam olarak 11 hane olmalıdır
2. **İlk Hane**: 0 olamaz (1-9 arası olmalıdır)
3. **10. Hane Kontrolü**: İlk 9 hanenin toplamının mod 10'u
4. **11. Hane Kontrolü**: (İlk 9 hanenin toplamı + 10. hane) mod 10
5. **Çift/Tek Kontrolü**: 1,3,5,7,9. hanelerin toplamının 7 katı - 2,4,6,8. hanelerin toplamı = 10. hane (mod 10)

### Algoritma Implementasyonu

```typescript
function validateTCId(tcId: string): boolean {
  // 1. Uzunluk kontrolü
  if (tcId.length !== 11) return false
  
  // 2. Sadece rakam kontrolü
  if (!/^\d{11}$/.test(tcId)) return false
  
  // 3. İlk hane 0 olamaz
  if (tcId[0] === '0') return false
  
  // 4. Tüm haneler aynı olamaz
  if (new Set(tcId).size === 1) return false
  
  const digits = tcId.split('').map(Number)
  
  // 5. Çift/Tek kontrolü
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7]
  const tenthDigit = ((oddSum * 7) - evenSum) % 10
  
  if (digits[9] !== tenthDigit) return false
  
  // 6. 11. hane kontrolü
  const totalSum = digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0)
  const eleventhDigit = totalSum % 10
  
  return digits[10] === eleventhDigit
}
```

## Mimari

### Bileşen Mimarisi

```
TCIdInput Component
├── useTCIdInput Hook
│   ├── validateTCId()
│   ├── formatTCIdInput()
│   └── getTCIdValidationMessage()
├── Input Element (Controlled)
├── Validation Status Indicator
└── Error Message Display
```

## Bileşenler ve Arayüzler

### 1. TCIdInput Bileşeni

```typescript
interface TCIdInputProps {
  value?: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  showValidationStatus?: boolean
}
```

**Özellikler:**
- Sadece rakam girişi
- Maksimum 11 karakter
- Gerçek zamanlı doğrulama
- Görsel durum göstergesi (✓/✗)
- Açıklayıcı hata mesajları

### 2. useTCIdInput Hook

```typescript
interface UseTCIdInputReturn {
  displayValue: string
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  validationStatus: 'valid' | 'invalid' | 'incomplete'
  validationMessage: string
}

function useTCIdInput(
  value: string,
  onChange: (value: string) => void
): UseTCIdInputReturn
```

### 3. Validation Fonksiyonları

```typescript
// Ana doğrulama fonksiyonu
function validateTCId(tcId: string): boolean

// Detaylı doğrulama mesajları
function getTCIdValidationMessage(tcId: string): string

// Input formatlaması
function formatTCIdInput(input: string): string

// Sadece rakam çıkarma
function extractTCIdDigits(input: string): string
```

## Veri Modelleri

### Validation Durumları

```typescript
type TCIdValidationStatus = 'valid' | 'invalid' | 'incomplete'

interface TCIdValidationResult {
  isValid: boolean
  status: TCIdValidationStatus
  message: string
  details?: {
    lengthCheck: boolean
    firstDigitCheck: boolean
    algorithmCheck: boolean
    duplicateCheck: boolean
  }
}
```

### Hata Mesajları

```typescript
const TC_ID_ERROR_MESSAGES = {
  EMPTY: 'T.C. kimlik numarası zorunludur',
  TOO_SHORT: 'T.C. kimlik numarası 11 haneli olmalıdır',
  INVALID_CHARACTERS: 'Sadece rakam girebilirsiniz',
  STARTS_WITH_ZERO: 'T.C. kimlik numarası 0 ile başlayamaz',
  ALL_SAME_DIGITS: 'Tüm haneler aynı olamaz',
  ALGORITHM_FAILED: 'Geçerli bir T.C. kimlik numarası girin',
  INVALID_FORMAT: 'Geçersiz T.C. kimlik numarası formatı'
}
```

## Kullanıcı Arayüzü Tasarımı

### Görsel Durum Göstergeleri

1. **Incomplete (Eksik)**: Gri border, bilgi ikonu
2. **Valid (Geçerli)**: Yeşil border, ✓ ikonu
3. **Invalid (Geçersiz)**: Kırmızı border, ✗ ikonu

### Gerçek Zamanlı Feedback

```typescript
// Kullanıcı yazarken anlık durum
const getInputStatus = (tcId: string) => {
  if (tcId.length === 0) return 'empty'
  if (tcId.length < 11) return 'incomplete'
  if (validateTCId(tcId)) return 'valid'
  return 'invalid'
}
```

## Hata Yönetimi

### Validation Hata Tipleri

1. **Uzunluk Hataları**: Eksik veya fazla hane
2. **Format Hataları**: Rakam dışı karakter
3. **Algoritma Hataları**: Matematiksel kontrol başarısız
4. **Mantık Hataları**: 0 ile başlama, tüm haneler aynı

### Hata Gösterimi

```typescript
const getValidationMessage = (tcId: string): string => {
  if (!tcId) return ''
  if (tcId.length < 11) return 'Devam edin...'
  if (tcId[0] === '0') return TC_ID_ERROR_MESSAGES.STARTS_WITH_ZERO
  if (new Set(tcId).size === 1) return TC_ID_ERROR_MESSAGES.ALL_SAME_DIGITS
  if (!validateTCId(tcId)) return TC_ID_ERROR_MESSAGES.ALGORITHM_FAILED
  return 'Geçerli T.C. kimlik numarası ✓'
}
```

## Performans Optimizasyonları

1. **Debounced Validation**: Kullanıcı yazmayı bitirdikten sonra doğrulama
2. **Memoization**: Validation sonuçlarını cache'leme
3. **Early Return**: Hızlı başarısızlık kontrolü
4. **Minimal Re-renders**: Gereksiz component güncellemelerini önleme

## Güvenlik Considerations

1. **Client-Side Only**: T.C. kimlik algoritması sadece client-side
2. **No Storage**: T.C. kimlik numaraları log'lanmaz
3. **Input Sanitization**: Güvenli string işleme
4. **Rate Limiting**: Aşırı validation isteklerini önleme

## Test Stratejisi

### Unit Testler

1. **Algorithm Tests**: T.C. kimlik algoritması testleri
2. **Validation Tests**: Farklı input senaryoları
3. **Hook Tests**: useTCIdInput state yönetimi
4. **Component Tests**: TCIdInput render ve interaction

### Test Senaryoları

```typescript
describe('TC ID Validation', () => {
  it('should validate correct TC ID numbers', () => {
    expect(validateTCId('12345678901')).toBe(false) // Invalid
    expect(validateTCId('11111111110')).toBe(true)  // Valid test number
  })
  
  it('should reject invalid formats', () => {
    expect(validateTCId('0123456789')).toBe(false)  // Starts with 0
    expect(validateTCId('1111111111')).toBe(false)  // All same digits
    expect(validateTCId('123456789')).toBe(false)   // Too short
  })
  
  it('should provide correct error messages', () => {
    expect(getTCIdValidationMessage('123')).toBe('Devam edin...')
    expect(getTCIdValidationMessage('01234567890')).toBe('T.C. kimlik numarası 0 ile başlayamaz')
  })
})
```

### Integration Testler

1. **Form Integration**: Step1PersonalInfo ile entegrasyon
2. **Validation Schema**: Zod schema ile uyumluluk
3. **User Experience**: Gerçek kullanıcı senaryoları

## Accessibility (Erişilebilirlik)

1. **ARIA Labels**: Screen reader desteği
2. **Keyboard Navigation**: Tam klavye desteği
3. **Color Contrast**: Yeterli renk kontrastı
4. **Error Announcements**: Hata durumlarında sesli bildirim

## Backward Compatibility

1. **Existing Data**: Mevcut T.C. kimlik numaraları korunur
2. **API Compatibility**: Backend API değişikliği gerektirmez
3. **Progressive Enhancement**: Mevcut form çalışmaya devam eder
4. **Graceful Degradation**: JavaScript kapalıysa temel validation