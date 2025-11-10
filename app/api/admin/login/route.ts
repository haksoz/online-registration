import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
});

export async function POST(req: NextRequest) {
  try {
    console.log('🔐 Login attempt started');
    const { email, password } = await req.json();
    console.log('📧 Login email:', email);

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = (rows as any[])[0];

    if (!user) {
      console.log('❌ User not found:', email);
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 401 });
    }

    console.log('👤 User found:', { id: user.id, email: user.email, role: user.role });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      console.log('❌ Invalid password for:', email);
      return NextResponse.json({ error: 'Şifre hatalı' }, { status: 401 });
    }

    console.log('✅ Password valid for:', email);

    // JWT token oluştur
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    console.log('🎫 JWT token created for user:', user.id);

    const { password_hash, ...safeUser } = user;
    const response = NextResponse.json({ 
      user: safeUser,
      token: token 
    });
    
    // Cookie set et
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 gün
    });

    console.log('🍪 Cookie set for user:', user.id);
    console.log('✅ Login successful for:', email);

    return response;
  } catch (err) {
    console.error('❌ Login error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
