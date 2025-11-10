import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "127.0.0.1",           // localhost yerine 127.0.0.1
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DB || "form_wizard",
  port: Number(process.env.MYSQL_PORT) || 3306,
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
  fee_try: number;
  fee_usd: number;
  fee_eur: number;
  description: string | null;
  description_en: string | null;
}) {
  const [result] = await pool.execute(
    'INSERT INTO registration_types (value, label, label_en, fee_try, fee_usd, fee_eur, description, description_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [data.value, data.label, data.label_en, data.fee_try, data.fee_usd, data.fee_eur, data.description, data.description_en]
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
