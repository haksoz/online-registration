import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Basit bir session kontrolü - gerçek uygulamada JWT veya session kullanılmalı
    // Şimdilik cookie'den user_id alacağız
    const userId = request.cookies.get('admin_user_id')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Oturum bulunamadı' },
        { status: 401 }
      )
    }

    const [rows] = await pool.execute(
      'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
      [userId]
    )

    const user = (rows as any[])[0]
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json(
      { success: false, error: 'Kullanıcı bilgileri alınırken hata oluştu' },
      { status: 500 }
    )
  }
}