#!/bin/bash

# Lokal veritabanını export et
# Kullanım: ./scripts/export-local-db.sh

echo "💾 Lokal veritabanı export ediliyor..."

# .env dosyasından bilgileri al
DB_NAME="form_wizard"
DB_USER="root"
DB_PASSWORD=""
DB_HOST="127.0.0.1"

# Export dosya adı
EXPORT_FILE="local_db_export_$(date +%Y%m%d_%H%M%S).sql"

# Export komutu (şifre yoksa -p parametresini kaldır)
if [ -z "$DB_PASSWORD" ]; then
    mysqldump -h $DB_HOST -u $DB_USER $DB_NAME > $EXPORT_FILE
else
    mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > $EXPORT_FILE
fi

if [ $? -eq 0 ]; then
    echo "✅ Export başarılı: $EXPORT_FILE"
    echo "📦 Dosya boyutu: $(du -h $EXPORT_FILE | cut -f1)"
    echo ""
    echo "📋 İçerik özeti:"
    echo "   Tablolar: $(grep -c 'CREATE TABLE' $EXPORT_FILE)"
    echo "   Kayıtlar: $(grep -c 'INSERT INTO' $EXPORT_FILE)"
    echo ""
    echo "📝 Sıradaki adımlar:"
    echo "1. Hostinger cPanel'e giriş yap"
    echo "2. phpMyAdmin'i aç"
    echo "3. Yeni veritabanı oluştur (formwizard_db)"
    echo "4. Import sekmesinden bu dosyayı yükle: $EXPORT_FILE"
    echo "5. Vercel environment variables'ı güncelle"
else
    echo "❌ Export başarısız!"
    exit 1
fi
