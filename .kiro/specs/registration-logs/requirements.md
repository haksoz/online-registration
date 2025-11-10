# Requirements Document - Registration Logs System

## Introduction

Bu özellik, kayıt formunu dolduran kullanıcıların log bilgilerini (IP adresi, tarayıcı, işletim sistemi, vb.) veritabanında tutacaktır. Sistem proxy arkasında çalışacak şekilde tasarlanacaktır.

## Glossary

- **Registration_Logs**: Kayıt işlemi log kayıtları
- **IP_Address**: Kullanıcının IP adresi (proxy arkasından alınacak)
- **User_Agent**: Tarayıcı ve işletim sistemi bilgisi
- **Referrer**: Kullanıcının nereden geldiği
- **Proxy_Headers**: X-Forwarded-For, X-Real-IP gibi proxy header'ları

## Requirements

### Requirement 1

**User Story:** Sistem olarak, kayıt formunu dolduran her kullanıcının IP adresini kaydetmek istiyorum, böylece güvenlik ve analiz yapabilirim.

#### Acceptance Criteria

1. WHEN kullanıcı kayıt formunu gönderdiğinde, THE Registration_Logs_System SHALL kullanıcının gerçek IP adresini tespit et
2. WHERE proxy kullanılıyorsa, THE Registration_Logs_System SHALL X-Forwarded-For header'ından IP adresini al
3. WHERE X-Forwarded-For yoksa, THE Registration_Logs_System SHALL X-Real-IP header'ını kontrol et
4. IF hiçbir proxy header yoksa, THEN THE Registration_Logs_System SHALL direkt bağlantı IP'sini kullan
5. WHILE IP adresi kaydedilirken, THE Registration_Logs_System SHALL IPv4 ve IPv6 formatlarını destekle

### Requirement 2

**User Story:** Sistem olarak, kullanıcının tarayıcı ve işletim sistemi bilgilerini kaydetmek istiyorum, böylece uyumluluk sorunlarını tespit edebilirim.

#### Acceptance Criteria

1. WHEN kayıt işlemi yapıldığında, THE Registration_Logs_System SHALL User-Agent header'ını parse et
2. WHERE User-Agent varsa, THE Registration_Logs_System SHALL tarayıcı adı ve versiyonunu çıkar
3. WHERE User-Agent varsa, THE Registration_Logs_System SHALL işletim sistemi bilgisini çıkar
4. WHERE User-Agent varsa, THE Registration_Logs_System SHALL cihaz tipini (desktop/mobile/tablet) belirle
5. IF User-Agent parse edilemezse, THEN THE Registration_Logs_System SHALL raw User-Agent string'ini kaydet

### Requirement 3

**User Story:** Sistem olarak, kullanıcının nereden geldiğini (referrer) kaydetmek istiyorum, böylece trafik kaynaklarını analiz edebilirim.

#### Acceptance Criteria

1. WHEN kayıt işlemi yapıldığında, THE Registration_Logs_System SHALL Referer header'ını kontrol et
2. WHERE Referer varsa, THE Registration_Logs_System SHALL kaynak URL'i kaydet
3. WHERE Referer yoksa, THE Registration_Logs_System SHALL "direct" olarak işaretle
4. WHILE referrer kaydedilirken, THE Registration_Logs_System SHALL URL'i sanitize et
5. IF referrer harici bir siteyse, THEN THE Registration_Logs_System SHALL domain bilgisini ayrıca kaydet

### Requirement 4

**User Story:** Sistem olarak, kayıt işleminin her adımını loglamak istiyorum, böylece kullanıcı davranışlarını analiz edebilirim.

#### Acceptance Criteria

1. WHEN kullanıcı form adımlarında ilerlediğinde, THE Registration_Logs_System SHALL her adımı timestamp ile kaydet
2. WHERE kullanıcı bir adımda hata aldığında, THE Registration_Logs_System SHALL hata detaylarını kaydet
3. WHERE kayıt tamamlandığında, THE Registration_Logs_System SHALL toplam süreyi hesapla ve kaydet
4. WHILE log kaydedilirken, THE Registration_Logs_System SHALL registration_id ile ilişkilendir
5. IF kullanıcı formu terk ederse, THEN THE Registration_Logs_System SHALL hangi adımda bıraktığını kaydet

### Requirement 5

**User Story:** Admin olarak, kayıt loglarını görüntüleyebilmek istiyorum, böylece güvenlik ve analiz yapabilirim.

#### Acceptance Criteria

1. WHEN admin registrations detay sayfasını açtığında, THE Registration_Logs_System SHALL ilgili kayıt loglarını göster
2. WHERE log verileri gösterildiğinde, THE Registration_Logs_System SHALL IP, tarayıcı, işletim sistemi bilgilerini formatla
3. WHERE coğrafi konum varsa, THE Registration_Logs_System SHALL ülke ve şehir bilgisini göster
4. WHILE loglar gösterilirken, THE Registration_Logs_System SHALL timeline formatında sırala
5. IF şüpheli aktivite varsa, THEN THE Registration_Logs_System SHALL uyarı göster

### Requirement 6

**User Story:** Sistem olarak, GDPR ve veri gizliliği kurallarına uygun log tutmak istiyorum, böylece yasal sorumlulukları yerine getirebilirim.

#### Acceptance Criteria

1. WHEN log kaydedildiğinde, THE Registration_Logs_System SHALL hassas verileri şifrele
2. WHERE IP adresi kaydedildiğinde, THE Registration_Logs_System SHALL veri saklama süresini belirle
3. WHERE kullanıcı veri silme talep ederse, THE Registration_Logs_System SHALL ilgili logları sil veya anonimleştir
4. WHILE log tutulurken, THE Registration_Logs_System SHALL sadece gerekli bilgileri kaydet
5. IF log retention süresi dolduğunda, THEN THE Registration_Logs_System SHALL otomatik olarak eski logları temizle
