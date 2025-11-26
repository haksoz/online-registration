#!/bin/bash

# Mail tables migration script
# Bu script mail_settings ve mail_logs tablolarını oluşturur

echo "🔧 Creating mail_settings and mail_logs tables..."

# .env dosyasından database bilgilerini al
source .env

# Migration'ı çalıştır
mysql -h "$DATABASE_HOST" -u "$DATABASE_USER" -p"$DATABASE_PASSWORD" "$DATABASE_NAME" < migrations/007_create_mail_tables.sql

if [ $? -eq 0 ]; then
    echo "✅ Mail tables created successfully!"
else
    echo "❌ Migration failed!"
    exit 1
fi
