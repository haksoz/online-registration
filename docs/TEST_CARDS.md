# Test Kartları

Bu doküman, online ödeme sistemini test etmek için kullanılabilecek test kartlarını içerir.

## Ziraat Bankası Test Kartları

### Başarılı İşlem

| Alan | Değer |
|------|-------|
| **Kart Numarası** | 4546 7112 3456 7894 |
| **Son Kullanma Tarihi** | 12/26 |
| **CVV** | 000 |
| **Kart Sahibi** | TEST KULLANICI |
| **Kart Tipi** | Kredi Kartı / VISA |
| **Ticari Kart** | Hayır |
| **Sonuç** | ✅ Başarılı İşlem |

### Başarısız İşlemler (Aynı Kart, Farklı CVV)

**Kart Numarası:** 4546 7112 3456 7894 (Başarılı işlem kartı)  
**Son Kullanma Tarihi:** 12/26  
**Kart Sahibi:** TEST KULLANICI

| CVV | Hata Kodu | Hata Açıklama | Sonuç |
|-----|-----------|---------------|-------|
| **000** | 00 | Başarılı İşlem | ✅ Başarılı |
| **120** | 12 | Geçersiz İşlem | ❌ Başarısız |
| **130** | 13 | Geçersiz Tutar | ❌ Başarısız |
| **340** | 34 | Fraud Şüphesi | ❌ Başarısız |
| **370** | 37 | Çalıntı Kart | ❌ Başarısız |
| **510** | 51 | Limit Yetersiz | ❌ Başarısız |

## Diğer Test Kartları

### MasterCard - Başarılı

| Alan | Değer |
|------|-------|
| **Kart Numarası** | 5400 3600 0000 0006 |
| **Son Kullanma Tarihi** | 12/26 |
| **CVV** | 000 |
| **Kart Tipi** | Kredi Kartı / MasterCard |
| **Sonuç** | ✅ Başarılı İşlem |

### American Express - Başarılı

| Alan | Değer |
|------|-------|
| **Kart Numarası** | 3400 0000 0000 009 |
| **Son Kullanma Tarihi** | 12/26 |
| **CVV** | 0000 |
| **Kart Tipi** | Kredi Kartı / AMEX |
| **Sonuç** | ✅ Başarılı İşlem |

## 3D Secure Test Şifreleri

Test kartları için 3D Secure doğrulamasında kullanılacak şifreler:

- **Başarılı İşlem**: `123456`
- **Başarısız İşlem**: `000000`

## Notlar

- Test kartları sadece test/sandbox ortamında çalışır
- Production ortamında gerçek kart bilgileri kullanılmalıdır
- Test kartları ile yapılan işlemler gerçek para transferi yapmaz
- Tüm test kartları için kart sahibi adı olarak "TEST KULLANICI" kullanılabilir

## Hata Kodları

| Kod | Açıklama |
|-----|----------|
| 00 | Başarılı |
| 05 | Geçersiz Kart |
| 51 | Yetersiz Bakiye |
| 82 | Hatalı CVV |
| 91 | Banka Yanıt Vermiyor |
| 96 | Sistem Hatası |

## Kullanım

Test kartlarını kullanmak için:

1. Online ödeme seçeneğini seçin
2. Yukarıdaki test kart bilgilerinden birini girin
3. İşlemi tamamlayın
4. POS Logları sayfasından sonucu kontrol edin
