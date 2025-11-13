import { pool } from '@/lib/db'
import { NextRequest } from 'next/server'

export interface AuditLogData {
  userId: number
  tableName: string
  recordId: number
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  oldValues?: any
  newValues?: any
  changedFields?: string[]
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(data: AuditLogData) {
  try {
    const {
      userId,
      tableName,
      recordId,
      action,
      oldValues,
      newValues,
      changedFields,
      ipAddress,
      userAgent
    } = data

    await pool.execute(
      `INSERT INTO audit_logs (
        user_id, table_name, record_id, action, 
        old_values, new_values, changed_fields, 
        ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        tableName,
        recordId,
        action,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        changedFields ? changedFields.join(', ') : null,
        ipAddress,
        userAgent
      ]
    )
  } catch (error) {
    console.error('Error creating audit log:', error)
    // Don't throw error to prevent breaking the main operation
  }
}

export function extractUserInfoFromRequest(request: NextRequest) {
  const ipAddress = request.ip || 
    request.headers.get('x-forwarded-for') || 
    request.headers.get('x-real-ip') || 
    'unknown'
  
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return { ipAddress, userAgent }
}

export function getCurrentUserId(request: NextRequest): number | null {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token) return null
    
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) return null
    
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, jwtSecret) as any
    return decoded.userId || null
  } catch (error) {
    console.error('Error getting user ID from token:', error)
    return null
  }
}

export function compareObjects(oldObj: any, newObj: any): string[] {
  const changedFields: string[] = []
  
  // Check all fields in new object
  for (const key in newObj) {
    if (newObj[key] !== oldObj[key]) {
      changedFields.push(key)
    }
  }
  
  // Check for deleted fields (fields that existed in old but not in new)
  for (const key in oldObj) {
    if (!(key in newObj) && oldObj[key] !== null && oldObj[key] !== undefined) {
      changedFields.push(key)
    }
  }
  
  return changedFields
}