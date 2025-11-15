import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getCurrentUser, checkRole } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rol kontrolü - sadece admin
    const currentUser = await getCurrentUser(request)
    if (!checkRole(currentUser, ['admin'])) {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz ID formatı' },
        { status: 400 }
      )
    }

    const [rows] = await pool.execute(
      'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
      [id]
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
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: 'Kullanıcı yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rol kontrolü - sadece admin
    const currentUser = await getCurrentUser(request)
    if (!checkRole(currentUser, ['admin'])) {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz ID formatı' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { email, password, name, role } = body

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    )

    if ((existingUsers as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []

    if (email !== undefined) {
      // Check if email is already taken by another user
      const [emailCheck] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      )
      
      if ((emailCheck as any[]).length > 0) {
        return NextResponse.json(
          { success: false, error: 'Bu email adresi zaten kullanımda' },
          { status: 400 }
        )
      }
      
      updates.push('email = ?')
      values.push(email)
    }

    if (password !== undefined && password.trim() !== '') {
      const saltRounds = 12
      const passwordHash = await bcrypt.hash(password, saltRounds)
      updates.push('password_hash = ?')
      values.push(passwordHash)
    }

    if (name !== undefined) {
      updates.push('name = ?')
      values.push(name || null)
    }

    if (role !== undefined) {
      if (!['admin', 'manager', 'reporter'].includes(role)) {
        return NextResponse.json(
          { success: false, error: 'Geçersiz rol' },
          { status: 400 }
        )
      }

      // Only allow admin role for user ID 1, and prevent changing user ID 1's role
      if (role === 'admin' && id !== 1) {
        return NextResponse.json(
          { success: false, error: 'Admin rolü sadece süper admin için ayrılmıştır' },
          { status: 403 }
        )
      }

      if (id === 1 && role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Süper admin rolü değiştirilemez' },
          { status: 403 }
        )
      }

      updates.push('role = ?')
      values.push(role)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Güncellenecek alan bulunamadı' },
        { status: 400 }
      )
    }

    values.push(id)

    await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi'
    }, { status: 200 })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Kullanıcı güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rol kontrolü - sadece admin
    const currentUser = await getCurrentUser(request)
    if (!checkRole(currentUser, ['admin'])) {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz ID formatı' },
        { status: 400 }
      )
    }

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    )

    if ((existingUsers as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Prevent deleting super admin (ID 1)
    if (id === 1) {
      return NextResponse.json(
        { success: false, error: 'Süper admin kullanıcısı silinemez' },
        { status: 403 }
      )
    }

    await pool.execute('DELETE FROM users WHERE id = ?', [id])

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    }, { status: 200 })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: 'Kullanıcı silinirken hata oluştu' },
      { status: 500 }
    )
  }
}