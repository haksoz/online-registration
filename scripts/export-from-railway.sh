#!/bin/bash

# Railway veritabanından export script
# Kullanım: ./scripts/export-from-railway.sh

echo "🚂 Railway veritabanından export ediliyor..."

# Railway bilgileri (.env'den alınacak veya manuel girilecek)
RAILWAY_HOST="shuttle.proxy.rlwy.net"
RAILWAY_PORT="12314"
RAILWAY_USER="root"
RAILWAY_PASSWORD="your-railway-password"
RAILWAY_DB="railway"

# Export dosya adı
EXPORT_FILE="railway_export_$(date +%Y%m%d_%H%M%S).sql"

# Export komutu
mysqldump -h $RAILWAY_HOST -P $RAILWAY_PORT -u $RAILWAY_USER -p$RAILWAY_PASSWORD $RAILWAY_DB > $EXPORT_FILE

if [ $? -eq 0 ]; then
    echo "✅ Export başarılı: $EXPORT_FILE"
    echo "📦 Dosya boyutu: $(du -h $EXPORT_FILE | cut -f1)"
else
    echo "❌ Export başarısız!"
    exit 1
fi

echo ""
echo "📝 Sıradaki adımlar:"
echo "1. Bu dosyayı Hostinger'e yükle"
echo "2. phpMyAdmin veya MySQL komut satırından import et"
echo "3. Vercel environment variables'ı güncelle"
