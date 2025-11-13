import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
    )

    return NextResponse.json({
      success: true,
      data: rows
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Kullanıcılar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email ve şifre zorunludur' },
        { status: 400 }
      )
    }

    if (!['admin', 'manager', 'reporter'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz rol' },
        { status: 400 }
      )
    }

    // Only allow admin role for user ID 1
    if (role === 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin rolü sadece süper admin tarafından atanabilir' },
        { status: 403 }
      )
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json(
        { success: false, error: 'Bu email adresi zaten kullanımda' },
        { status: 400 }
      )
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [email, passwordHash, name || null, role]
    )

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      data: { id: (result as any).insertId }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'Kullanıcı oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}