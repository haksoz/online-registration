// run: node scripts/create-admin.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

(async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'form_wizard',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      waitForConnections: true,
      connectionLimit: 5,
    });

    // Basit bir bağlantı testi
    await pool.query('SELECT 1');

    const email = 'admin@domain.com';
    const password = 'changeme';
    const name = 'Admin';

    // Parola hashle
    const hash = await bcrypt.hash(password, 10);

    // Kullanıcı zaten varsa ekleme
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing && existing.length > 0) {
      console.log('⚠️ Admin user already exists with id', existing[0].id);
      process.exit(0);
    }

    const [res] = await pool.query(
      'INSERT INTO users (email, password_hash, role, name) VALUES (?, ?, ?, ?)',
      [email, hash, 'admin', name]
    );

    console.log('✅ Admin created with id', res.insertId);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error in create-admin script:', err);
    process.exit(1);
  }
})();
