import 'dotenv/config';
import mysql from "mysql2/promise";

// Debug: Environment variables kontrolü (geçici - production'da kaldırılabilir)
if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_ENV === 'true') {
  console.log('🔍 DB Config Check:', {
    DB_HOST: process.env.DB_HOST || 'NOT SET',
    DB_USER: process.env.DB_USER || 'NOT SET',
    DB_PASSWORD: process.env.DB_PASSWORD ? '***SET***' : 'NOT SET',
    DB_NAME: process.env.DB_NAME || 'NOT SET',
    DB_PORT: process.env.DB_PORT || 'NOT SET',
  });
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "railway",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
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
