# Telefon Numarası Girişi İyileştirmesi - Gereksinimler

## Giriş

Bu özellik, form wizard uygulamasındaki telefon numarası girişini kullanıcı dostu hale getirmek ve veri standardizasyonunu sağlamak için geliştirilecektir. Kullanıcılar genellikle telefon numaralarını "0555 123 4567" formatında girmekte, ancak sistem "+905551234567" formatında standart veri beklemektedir.

## Sözlük

- **PhoneInput**: Telefon numarası giriş bileşeni
- **MaskedInput**: Otomatik biçimlendirme yapan giriş alanı
- **ValidationSchema**: Form doğrulama şeması
- **FormStore**: Form verilerini saklayan durum yöneticisi

## Gereksinimler

### Gereksinim 1

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, telefon numarası girerken +90 prefix'ini görmek istiyorum, böylece sadece yerel numaramı yazmam yeterli olsun.

#### Kabul Kriterleri

1. WHEN kullanıcı telefon alanına odaklandığında, THE PhoneInput SHALL "+90 " prefix'ini görünür halde göstermeli
2. WHILE kullanıcı telefon numarası girdiğinde, THE PhoneInput SHALL prefix'i değiştirilemez halde tutmalı
3. THE PhoneInput SHALL kullanıcının sadece "555 123 4567" kısmını girmesine izin vermeli

### Gereksinim 2

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, telefon numarası girerken otomatik biçimlendirme görmek istiyorum, böylece numaramın doğru formatta olduğunu anlayabileyim.

#### Kabul Kriterleri

1. WHEN kullanıcı "5551234567" yazdığında, THE MaskedInput SHALL "555 123 4567" formatında göstermeli
2. WHILE kullanıcı rakam girdiğinde, THE MaskedInput SHALL otomatik olarak boşlukları eklemeli
3. THE MaskedInput SHALL sadece rakam girişine izin vermeli
4. THE MaskedInput SHALL maksimum 10 rakam girişini kabul etmeli

### Gereksinim 3

**Kullanıcı Hikayesi:** Bir sistem yöneticisi olarak, telefon numaralarının standart formatta saklanmasını istiyorum, böylece veri tutarlılığı sağlanabilsin.

#### Kabul Kriterleri

1. WHEN form backend'e gönderildiğinde, THE ValidationSchema SHALL telefon numarasını "+905551234567" formatında dönüştürmeli
2. THE ValidationSchema SHALL geçerli Türkiye telefon numarası formatını doğrulamalı
3. THE ValidationSchema SHALL 10 haneli cep telefonu numaralarını kabul etmeli
4. IF telefon numarası geçersizse, THEN THE ValidationSchema SHALL uygun hata mesajı göstermeli

### Gereksinim 4

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, mevcut telefon numaralarımın düzgün görüntülenmesini istiyorum, böylece eski verilerim de doğru formatta görünebilsin.

#### Kabul Kriterleri

1. WHEN mevcut telefon numarası yüklendiğinde, THE PhoneInput SHALL "+905551234567" formatını "555 123 4567" olarak göstermeli
2. THE PhoneInput SHALL farklı formatlardaki mevcut numaraları normalize etmeli
3. THE PhoneInput SHALL geçersiz formattaki numaraları olduğu gibi göstermeli