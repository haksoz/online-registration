#!/bin/bash

# db4free.net veritabanından export et
# Kullanım: ./scripts/export-db4free.sh

echo "💾 db4free.net veritabanından export ediliyor..."

# db4free.net bilgileri
DB_HOST="db4free.net"
DB_PORT="3306"
DB_USER="form_wizard_user"
DB_PASSWORD="FfXeX3!QRD79wF"
DB_NAME="test_form_wizard"

# Export dosya adı
EXPORT_FILE="db4free_export_$(date +%Y%m%d_%H%M%S).sql"

echo "📡 Veritabanına bağlanılıyor: $DB_HOST:$DB_PORT"
echo "📦 Veritabanı: $DB_NAME"
echo ""

# Export komutu (MySQL 8.3 için authentication plugin ayarı)
mysqldump -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD \
  --default-auth=caching_sha2_password \
  --skip-column-statistics \
  --single-transaction \
  --routines \
  --triggers \
  $DB_NAME > $EXPORT_FILE

if [ $? -eq 0 ]; then
    echo "✅ Export başarılı: $EXPORT_FILE"
    echo "📦 Dosya boyutu: $(du -h $EXPORT_FILE | cut -f1)"
    echo ""
    echo "📋 İçerik özeti:"
    echo "   Tablolar: $(grep -c 'CREATE TABLE' $EXPORT_FILE 2>/dev/null || echo '0')"
    echo "   Kayıtlar: $(grep -c 'INSERT INTO' $EXPORT_FILE 2>/dev/null || echo '0')"
    echo ""
    echo "📝 Dosya konumu: $(pwd)/$EXPORT_FILE"
else
    echo "❌ Export başarısız!"
    echo "💡 Kontrol edin:"
    echo "   - Veritabanı bilgileri doğru mu?"
    echo "   - İnternet bağlantısı var mı?"
    echo "   - db4free.net erişilebilir mi?"
    exit 1
fi

