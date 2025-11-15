import { NextRequest } from 'next/server'
import { pool } from '@/lib/db'
import jwt from 'jsonwebtoken'

export interface AuthUser {
  id: number
  email: string
  name: string
  role: 'admin' | 'manager' | 'reporter'
}

export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token) return null

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) return null

    const decoded: any = jwt.verify(token, jwtSecret)
    
    const [rows] = await pool.execute(
      'SELECT id, email, COALESCE(full_name, name) as name, role FROM users WHERE id = ?',
      [decoded.userId]
    )

    const user = (rows as any[])[0]
    return user || null
  } catch (error) {
    return null
  }
}

export function checkRole(user: AuthUser | null, allowedRoles: string[]): boolean {
  if (!user) return false
  return allowedRoles.includes(user.role)
}
