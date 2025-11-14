#!/bin/bash

# Local veritabanını test verileriyle doldur
# UYARI: Bu script tüm kayıtları siler!

echo "⚠️  UYARI: Bu işlem tüm kayıtları silecek!"
echo "Devam etmek için 'EVET' yazın:"
read confirmation

if [ "$confirmation" != "EVET" ]; then
    echo "❌ İşlem iptal edildi"
    exit 1
fi

echo "🗑️  Veritabanı temizleniyor ve test verileri ekleniyor..."

# MySQL'e bağlan ve SQL'i çalıştır
mysql -u root form_wizard < test-data-seed.sql

if [ $? -eq 0 ]; then
    echo "✅ Test verileri başarıyla eklendi!"
    echo ""
    echo "📊 Beklenen Sonuçlar:"
    echo "  • Toplam Kayıt: 8 (sadece aktif)"
    echo "  • Toplam Gelir: 68,500 TL (aktif + iade reddedildi)"
    echo "  • Tahsil Edilen: 46,500 TL (aktif completed + iade reddedildi)"
    echo "  • Bekleyen: 22,000 TL"
    echo "  • İade Tutarı: 17,000 TL"
    echo "  • İade Reddedildi: 7,500 TL (gelir olarak sayılır!)"
    echo ""
    echo "🌐 Dashboard'ı kontrol edin: http://localhost:3000/admin/dashboard"
else
    echo "❌ Hata oluştu!"
    exit 1
fi
