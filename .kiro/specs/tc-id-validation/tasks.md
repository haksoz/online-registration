# T.C. Kimlik Numarası Validasyonu - Görev Listesi

- [x] 1. T.C. kimlik numarası yardımcı fonksiyonlarını oluştur
  - `lib/tcIdUtils.ts` dosyasını oluştur
  - `validateTCId()` algoritmasını implement et
  - `getTCIdValidationMessage()` fonksiyonunu oluştur
  - `formatTCIdInput()` ve `extractTCIdDigits()` fonksiyonlarını ekle
  - Hata mesajları sabitlerini tanımla
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4_

- [x] 2. useTCIdInput hook'unu oluştur
  - `hooks/useTCIdInput.ts` dosyasını oluştur
  - State yönetimi ve event handler'ları implement et
  - Gerçek zamanlı validation logic'i ekle
  - Validation status ve message yönetimini ekle
  - Sadece rakam girişi kontrolünü implement et
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_

- [x] 3. TCIdInput bileşenini oluştur
  - `components/ui/TCIdInput.tsx` dosyasını oluştur
  - Görsel durum göstergelerini (✓/✗) ekle
  - Error state ve success state styling'i implement et
  - Accessibility özelliklerini ekle
  - Kullanıcı dostu placeholder ve helper text ekle
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 4.4_

- [x] 4. Validation schema'sını güncelle
  - `schemas/validationSchemas.ts` dosyasındaki idNumber validation'ı güncelle
  - T.C. kimlik numarası doğrulaması ekle
  - Bireysel fatura için zorunluluk kontrolü ekle
  - Uygun hata mesajlarını entegre et
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5. Step1PersonalInfo bileşenini güncelle
  - Mevcut TC kimlik input'unu TCIdInput bileşeni ile değiştir
  - Form integration'ı test et
  - Mevcut veri formatlarının uyumluluğunu sağla
  - Bireysel fatura seçiminde zorunluluk kontrolünü ekle
  - _Requirements: 1.1, 2.1, 2.2, 4.4, 5.4_

- [ ]* 6. Unit testleri yaz
  - `tcIdUtils.ts` fonksiyonları için kapsamlı testler
  - T.C. kimlik algoritması test senaryoları
  - `useTCIdInput` hook'u için testler
  - `TCIdInput` bileşeni için testler
  - Validation schema testleri
  - _Requirements: Tüm gereksinimler_

- [ ]* 7. Integration testleri yaz
  - Form submission testleri
  - Gerçek T.C. kimlik numaraları ile testler
  - User experience senaryoları
  - Accessibility testleri
  - _Requirements: 2.1, 5.1, 5.2_