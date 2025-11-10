projeyi çalış# Requirements Document

## Introduction

Bu özellik, admin panelinde kayıt türlerinin dinamik olarak yönetilmesini sağlayacaktır. Mevcut statik yapı yerine, veritabanı tabanlı CRUD işlemleri ile kayıt türleri eklenebilir, düzenlenebilir ve silinebilir hale gelecektir.

## Glossary

- **Registration_Types_System**: Kayıt türlerini yöneten dinamik sistem
- **Admin_Panel**: Yönetici arayüzü
- **CRUD_Operations**: Create, Read, Update, Delete işlemleri
- **Registration_Type**: Kayıt türü (value, label, fee, description içeren veri yapısı)
- **API_Endpoint**: REST API uç noktası
- **MySQL_Database**: Veritabanı sistemi

## Requirements

### Requirement 1

**User Story:** Admin olarak, kayıt türlerini dinamik olarak yönetebilmek istiyorum, böylece statik kod değişikliği yapmadan yeni türler ekleyebilirim.

#### Acceptance Criteria

1. WHEN admin registration types sayfasını açtığında, THE Registration_Types_System SHALL veritabanından tüm kayıt türlerini getir ve listele
2. WHEN admin "Yeni Ekle" butonuna tıkladığında, THE Registration_Types_System SHALL yeni kayıt türü ekleme modalını aç
3. WHEN admin yeni kayıt türü formunu doldurduğunda, THE Registration_Types_System SHALL POST isteği ile veritabanına kaydet
4. WHERE kayıt türü başarıyla eklendiğinde, THE Registration_Types_System SHALL listeyi güncelle ve başarı mesajı göster
5. IF kayıt türü ekleme başarısız olursa, THEN THE Registration_Types_System SHALL hata mesajı göster

### Requirement 2

**User Story:** Admin olarak, mevcut kayıt türlerini düzenleyebilmek istiyorum, böylece ücret ve açıklama bilgilerini güncelleyebilirim.

#### Acceptance Criteria

1. WHEN admin bir kayıt türünün "Düzenle" butonuna tıkladığında, THE Registration_Types_System SHALL düzenleme modalını mevcut verilerle aç
2. WHEN admin düzenleme formunu güncelleyip kaydettiğinde, THE Registration_Types_System SHALL PUT isteği ile veritabanını güncelle
3. WHERE güncelleme başarılı olduğunda, THE Registration_Types_System SHALL listeyi yenile ve başarı mesajı göster
4. IF güncelleme başarısız olursa, THEN THE Registration_Types_System SHALL hata mesajı göster
5. WHILE düzenleme modalı açıkken, THE Registration_Types_System SHALL form validasyonu uygula

### Requirement 3

**User Story:** Admin olarak, kullanılmayan kayıt türlerini silebilmek istiyorum, böylece sistemi temiz tutabilirim.

#### Acceptance Criteria

1. WHEN admin bir kayıt türünün "Sil" butonuna tıkladığında, THE Registration_Types_System SHALL onay modalı göster
2. WHEN admin silme işlemini onayladığında, THE Registration_Types_System SHALL DELETE isteği ile kayıt türünü sil
3. WHERE silme başarılı olduğunda, THE Registration_Types_System SHALL listeyi güncelle ve başarı mesajı göster
4. IF kayıt türü kullanımda ise, THEN THE Registration_Types_System SHALL silme işlemini engelle ve uyarı mesajı göster
5. WHILE onay modalı açıkken, THE Registration_Types_System SHALL silme riskini açıkça belirt

### Requirement 4

**User Story:** Sistem olarak, kayıt türü verilerini güvenli ve tutarlı şekilde saklamak istiyorum, böylece veri bütünlüğü korunur.

#### Acceptance Criteria

1. WHEN yeni kayıt türü eklendiğinde, THE Registration_Types_System SHALL benzersiz value değeri kontrol et
2. WHEN kayıt türü verileri kaydedildiğinde, THE Registration_Types_System SHALL tüm zorunlu alanları doğrula
3. WHERE ücret bilgisi girildiğinde, THE Registration_Types_System SHALL pozitif sayı formatını kontrol et
4. IF veri validasyonu başarısız olursa, THEN THE Registration_Types_System SHALL detaylı hata mesajları göster
5. WHILE veritabanı işlemi yapılırken, THE Registration_Types_System SHALL transaction kullan

### Requirement 5

**User Story:** Developer olarak, kayıt türlerini API üzerinden yönetebilmek istiyorum, böylece frontend ve backend ayrışık çalışabilir.

#### Acceptance Criteria

1. WHEN GET /api/registration-types isteği yapıldığında, THE Registration_Types_System SHALL tüm kayıt türlerini JSON formatında döndür
2. WHEN POST /api/registration-types isteği yapıldığında, THE Registration_Types_System SHALL yeni kayıt türü oluştur ve ID döndür
3. WHEN PUT /api/registration-types/[id] isteği yapıldığında, THE Registration_Types_System SHALL belirtilen kayıt türünü güncelle
4. WHEN DELETE /api/registration-types/[id] isteği yapıldığında, THE Registration_Types_System SHALL belirtilen kayıt türünü sil
5. WHERE API hatası oluştuğunda, THE Registration_Types_System SHALL uygun HTTP status kodu ve hata mesajı döndür

### Requirement 6

**User Story:** Admin olarak, kayıt türlerini görsel olarak düzenli bir şekilde görmek istiyorum, böylece kolay yönetebilirim.

#### Acceptance Criteria

1. WHEN registration types sayfası yüklendiğinde, THE Registration_Types_System SHALL kayıt türlerini tablo formatında göster
2. WHEN tablo yüklendiğinde, THE Registration_Types_System SHALL her satırda value, label, fee ve description bilgilerini göster
3. WHERE çok fazla kayıt türü varsa, THE Registration_Types_System SHALL sayfalama uygula
4. WHILE sayfa yüklenirken, THE Registration_Types_System SHALL loading göstergesi göster
5. WHERE responsive tasarım gerektiğinde, THE Registration_Types_System SHALL mobil uyumlu görünüm sağla