import mysql from "mysql2/promise";

// Runtime'da .env dosyasını okumayı dene (Hostinger için)
if (typeof window === 'undefined' && !process.env.DB_HOST) {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Birden fazla yerde .env dosyasını ara
    const possiblePaths = [
      path.join(process.cwd(), '.env'),
      path.join(process.cwd(), '..', '.env'),
      path.join(__dirname, '..', '.env'),
      path.join(__dirname, '..', '..', '.env'),
      '/home/u187342439/domains/online-registration.ohdkongre.org/public_html/.env',
      '/home/u187342439/public_html/.env',
    ];
    
    for (const envPath of possiblePaths) {
      if (fs.existsSync(envPath)) {
        console.log('📁 .env dosyası bulundu:', envPath);
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach((line: string) => {
          const trimmedLine = line.trim();
          if (trimmedLine && !trimmedLine.startsWith('#')) {
            const [key, ...valueParts] = trimmedLine.split('=');
            if (key && valueParts.length > 0) {
              const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
              if (value && !process.env[key.trim()]) {
                process.env[key.trim()] = value;
              }
            }
          }
        });
        break; // İlk bulunan dosyayı kullan
      }
    }
  } catch (e) {
    console.error('❌ .env dosyası okunamadı:', e);
  }
}

// Debug: Environment variables kontrolü - HER ZAMAN ÇALIŞSIN
console.log('🔍 DB Config Check:', {
  DB_HOST: process.env.DB_HOST || 'NOT SET',
  DB_USER: process.env.DB_USER || 'NOT SET',
  DB_PASSWORD: process.env.DB_PASSWORD ? '***SET***' : 'NOT SET',
  DB_NAME: process.env.DB_NAME || 'NOT SET',
  DB_PORT: process.env.DB_PORT || 'NOT SET',
  NODE_ENV: process.env.NODE_ENV || 'NOT SET',
});

// Pool'u lazy initialization ile oluştur (environment variables'ın yüklendiğinden emin ol)
let poolInstance: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (!poolInstance) {
    // Environment variables'ı tekrar kontrol et
    const dbHost = process.env.DB_HOST === 'localhost' ? '127.0.0.1' : (process.env.DB_HOST || "127.0.0.1");
    const dbUser = process.env.DB_USER || "root";
    const dbPassword = process.env.DB_PASSWORD || "";
    const dbName = process.env.DB_NAME || "railway";
    const dbPort = Number(process.env.DB_PORT) || 3306;
    
    console.log('🔧 Pool oluşturuluyor:', {
      host: dbHost,
      user: dbUser,
      password: dbPassword ? '***SET***' : 'EMPTY',
      database: dbName,
      port: dbPort,
    });
    
    poolInstance = mysql.createPool({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      port: dbPort,
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  }
  return poolInstance;
}

// Proxy kullanarak lazy initialization
export const pool = new Proxy({} as mysql.Pool, {
  get(target, prop) {
    return (getPool() as any)[prop];
  }
});


export async function getRegistrationById(id: string) {
  const numericId = Number(id);
  if (isNaN(numericId)) throw new Error("Invalid registration ID");

  const [rows] = await pool.query("SELECT * FROM registrations WHERE id = ?", [numericId]);
  return (rows as any)[0];
}

export async function getAllRegistrationTypes() {
  const [rows] = await pool.execute(
    'SELECT * FROM registration_types WHERE is_active = 1 ORDER BY id ASC'
  );
  return rows;
}

export async function createRegistrationType(data: {
  value: string;
  label: string;
  label_en: string | null;
  category_id: number;
  fee_try: number;
  fee_usd: number;
  fee_eur: number;
  early_bird_fee_try: number | null;
  early_bird_fee_usd: number | null;
  early_bird_fee_eur: number | null;
  vat_rate: number;
  description: string | null;
  description_en: string | null;
  requires_document: boolean;
  document_label: string | null;
  document_label_en: string | null;
  document_description: string | null;
  document_description_en: string | null;
}) {
  const [result] = await pool.execute(
    'INSERT INTO registration_types (value, label, label_en, category_id, fee_try, fee_usd, fee_eur, early_bird_fee_try, early_bird_fee_usd, early_bird_fee_eur, vat_rate, description, description_en, requires_document, document_label, document_label_en, document_description, document_description_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [data.value, data.label, data.label_en, data.category_id, data.fee_try, data.fee_usd, data.fee_eur, data.early_bird_fee_try, data.early_bird_fee_usd, data.early_bird_fee_eur, data.vat_rate, data.description, data.description_en, data.requires_document, data.document_label, data.document_label_en, data.document_description, data.document_description_en]
  );
  return result;
}

export async function checkRegistrationTypeExists(value: string) {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as count FROM registration_types WHERE value = ?',
    [value]
  );
  return (rows as any)[0].count > 0;
}
