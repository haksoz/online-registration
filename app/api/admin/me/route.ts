import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import jwt from 'jsonwebtoken'

// Force dynamic rendering (uses cookies)
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking user session...');
    
    // JWT token'ı cookie'den al
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      console.log('❌ No admin_token cookie found');
      return NextResponse.json(
        { success: false, error: 'Oturum bulunamadı' },
        { status: 401 }
      )
    }

    console.log('🎫 Token found, verifying...');

    // JWT'yi doğrula
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret);
      console.log('✅ Token verified for user:', decoded.userId);
    } catch (jwtError) {
      console.log('❌ Invalid token:', jwtError);
      return NextResponse.json(
        { success: false, error: 'Geçersiz oturum' },
        { status: 401 }
      )
    }

    const [rows] = await pool.execute(
      'SELECT id, email, COALESCE(full_name, name) as name, role, created_at FROM users WHERE id = ?',
      [decoded.userId]
    )

    const user = (rows as any[])[0]
    if (!user) {
      console.log('❌ User not found in database:', decoded.userId);
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    console.log('✅ User session valid:', { id: user.id, email: user.email });

    return NextResponse.json({
      success: true,
      data: user
    }, { status: 200 })
  } catch (error) {
    console.error('❌ Error fetching current user:', error)
    return NextResponse.json(
      { success: false, error: 'Kullanıcı bilgileri alınırken hata oluştu' },
      { status: 500 }
    )
  }
}