# Telefon Numarası Girişi İyileştirmesi - Görev Listesi

- [x] 1. Telefon numarası yardımcı fonksiyonlarını oluştur
  - `lib/phoneUtils.ts` dosyasını oluştur
  - `formatPhoneDisplay()` fonksiyonunu implement et
  - `normalizePhoneNumber()` fonksiyonunu implement et
  - `validateTurkishPhone()` fonksiyonunu implement et
  - _Requirements: 2.1, 2.2, 3.1, 3.2_

- [x] 2. usePhoneInput hook'unu oluştur
  - `hooks/usePhoneInput.ts` dosyasını oluştur
  - State yönetimi ve event handler'ları implement et
  - Gerçek zamanlı formatting logic'i ekle
  - Input validation ve maskeleme özelliklerini ekle
  - _Requirements: 1.1, 1.3, 2.1, 2.2, 2.3, 2.4_

- [x] 3. PhoneInput bileşenini oluştur
  - `components/ui/PhoneInput.tsx` dosyasını oluştur
  - Sabit "+90 " prefix ile input alanını tasarla
  - usePhoneInput hook'u ile entegre et
  - Error state ve styling'i implement et
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_

- [x] 4. Validation schema'sını güncelle
  - `schemas/validationSchemas.ts` dosyasındaki phone validation'ı güncelle
  - Türkiye telefon numarası doğrulaması ekle
  - Backend formatına dönüşüm logic'i ekle
  - Uygun hata mesajlarını tanımla
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5. Step1PersonalInfo bileşenini güncelle
  - Mevcut telefon input'unu PhoneInput bileşeni ile değiştir
  - Form integration'ı test et
  - Mevcut veri formatlarının uyumluluğunu sağla
  - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3_

- [ ]* 6. Unit testleri yaz
  - `phoneUtils.ts` fonksiyonları için testler
  - `usePhoneInput` hook'u için testler
  - `PhoneInput` bileşeni için testler
  - Validation schema testleri
  - _Requirements: Tüm gereksinimler_

- [ ]* 7. Integration testleri yaz
  - Form submission testleri
  - FormStore entegrasyon testleri
  - End-to-end kullanıcı senaryoları
  - _Requirements: 3.1, 4.1, 4.2_