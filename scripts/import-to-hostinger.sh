#!/bin/bash

# Hostinger'e import script
# Kullanım: ./scripts/import-to-hostinger.sh railway_export_20250116_120000.sql

if [ -z "$1" ]; then
    echo "❌ Hata: SQL dosyası belirtilmedi"
    echo "Kullanım: ./scripts/import-to-hostinger.sh dosya.sql"
    exit 1
fi

SQL_FILE=$1

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Hata: $SQL_FILE bulunamadı"
    exit 1
fi

echo "📤 Hostinger'e import ediliyor..."
echo "📁 Dosya: $SQL_FILE"
echo ""

# Hostinger bilgileri
read -p "Hostinger DB Host (genellikle localhost): " HOSTINGER_HOST
read -p "Hostinger DB Name: " HOSTINGER_DB
read -p "Hostinger DB User: " HOSTINGER_USER
read -sp "Hostinger DB Password: " HOSTINGER_PASSWORD
echo ""

# Import komutu
mysql -h $HOSTINGER_HOST -u $HOSTINGER_USER -p$HOSTINGER_PASSWORD $HOSTINGER_DB < $SQL_FILE

if [ $? -eq 0 ]; then
    echo "✅ Import başarılı!"
    echo ""
    echo "📝 Sıradaki adımlar:"
    echo "1. Vercel environment variables'ı güncelle:"
    echo "   DB_HOST=$HOSTINGER_HOST"
    echo "   DB_USER=$HOSTINGER_USER"
    echo "   DB_NAME=$HOSTINGER_DB"
    echo "   DB_PASSWORD=***"
    echo ""
    echo "2. Yeni migration'ı çalıştır:"
    echo "   mysql -h $HOSTINGER_HOST -u $HOSTINGER_USER -p $HOSTINGER_DB < migrations/011_create_payment_gateway_tables.sql"
    echo ""
    echo "3. Vercel'de redeploy yap"
else
    echo "❌ Import başarısız!"
    exit 1
fi
