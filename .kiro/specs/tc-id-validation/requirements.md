# T.C. Kimlik Numarası Validasyonu - Gereksinimler

## Giriş

Bu özellik, form wizard uygulamasındaki T.C. kimlik numarası girişini T.C. kimlik numarası algoritmasına göre doğrulamak ve kullanıcı deneyimini iyileştirmek için geliştirilecektir. Sistem, geçerli T.C. kimlik numaralarını gerçek zamanlı olarak doğrulayacak ve kullanıcıya anında geri bildirim sağlayacaktır.

## Sözlük

- **TCIdInput**: T.C. kimlik numarası giriş bileşeni
- **TCIdValidator**: T.C. kimlik numarası doğrulama algoritması
- **ValidationSchema**: Form doğrulama şeması
- **RealTimeValidation**: Gerçek zamanlı doğrulama sistemi

## Gereksinimler

### Gereksinim 1

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, T.C. kimlik numarası girerken sadece rakam girebilmek istiyorum, böylece yanlış karakter girişi yapamayayım.

#### Kabul Kriterleri

1. THE TCIdInput SHALL sadece rakam girişine izin vermeli
2. THE TCIdInput SHALL maksimum 11 karakter girişini kabul etmeli
3. WHEN kullanıcı harf veya özel karakter girdiğinde, THE TCIdInput SHALL bu karakterleri reddetmeli
4. THE TCIdInput SHALL otomatik olarak boşlukları ve diğer karakterleri temizlemeli

### Gereksinim 2

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, T.C. kimlik numarası girerken gerçek zamanlı doğrulama görmek istiyorum, böylece geçerli bir numara girip girmediğimi anlayabileyim.

#### Kabul Kriterleri

1. WHEN kullanıcı 11 haneli numara girdiğinde, THE TCIdValidator SHALL T.C. kimlik algoritmasını çalıştırmalı
2. IF T.C. kimlik numarası geçerliyse, THEN THE TCIdInput SHALL başarı durumunu göstermeli
3. IF T.C. kimlik numarası geçersizse, THEN THE TCIdInput SHALL hata durumunu göstermeli
4. WHILE kullanıcı yazmaya devam ederken, THE TCIdInput SHALL gerçek zamanlı doğrulama yapmalı

### Gereksinim 3

**Kullanıcı Hikayesi:** Bir sistem yöneticisi olarak, T.C. kimlik numaralarının matematiksel algoritmasına göre doğrulanmasını istiyorum, böylece sahte numaraların sisteme girmesi engellenebilsin.

#### Kabul Kriterleri

1. THE TCIdValidator SHALL T.C. kimlik numarası algoritmasını tam olarak implement etmeli
2. THE TCIdValidator SHALL ilk hane 0 olan numaraları reddetmeli
3. THE TCIdValidator SHALL 10. hanenin çift/tek kontrolünü yapmalı
4. THE TCIdValidator SHALL 11. hanenin mod 10 kontrolünü yapmalı
5. THE TCIdValidator SHALL tüm hanelerin toplamının mod 10 kontrolünü yapmalı

### Gereksinim 4

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, T.C. kimlik numarası hatalı olduğunda açıklayıcı mesaj görmek istiyorum, böylece neyi yanlış yaptığımı anlayabileyim.

#### Kabul Kriterleri

1. IF T.C. kimlik numarası 11 haneden azsa, THEN THE TCIdInput SHALL "T.C. kimlik numarası 11 haneli olmalıdır" mesajını göstermeli
2. IF T.C. kimlik numarası 0 ile başlıyorsa, THEN THE TCIdInput SHALL "T.C. kimlik numarası 0 ile başlayamaz" mesajını göstermeli
3. IF T.C. kimlik numarası algoritma kontrolünden geçmiyorsa, THEN THE TCIdInput SHALL "Geçerli bir T.C. kimlik numarası girin" mesajını göstermeli
4. THE TCIdInput SHALL hata mesajlarını kullanıcı dostu şekilde göstermeli

### Gereksinim 5

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, form gönderilmeden önce T.C. kimlik numarasının son kez kontrol edilmesini istiyorum, böylece geçersiz veriyle form gönderilemeyesin.

#### Kabul Kriterleri

1. WHEN form submit edildiğinde, THE ValidationSchema SHALL T.C. kimlik numarasını tekrar doğrulamalı
2. IF T.C. kimlik numarası geçersizse, THEN THE ValidationSchema SHALL form gönderimini engellemeli
3. THE ValidationSchema SHALL backend'e sadece geçerli T.C. kimlik numaralarının gönderilmesini sağlamalı
4. THE ValidationSchema SHALL boş T.C. kimlik numarası alanını bireysel fatura için zorunlu kılmalı