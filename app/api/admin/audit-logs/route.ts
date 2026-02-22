import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    // Toplam sayı
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM audit_logs')
    const total = (countResult as any[])[0].total
    const totalPages = Math.ceil(total / limit)

    // Referans no ve kayıtlı kişi: registrations'dan veya registration_selections üzerinden
    const [rows] = await pool.execute(`
      SELECT 
        al.id,
        al.user_id,
        al.table_name,
        al.record_id,
        al.action,
        al.old_values,
        al.new_values,
        al.changed_fields,
        al.ip_address,
        al.user_agent,
        al.created_at,
        u.name as user_name,
        u.email as user_email,
        COALESCE(r_reg.reference_number, r_sel.reference_number) as reference_number,
        COALESCE(r_reg.full_name, r_sel.full_name) as full_name,
        COALESCE(r_reg.id, r_sel.id) as registration_id
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN registrations r_reg ON (al.table_name = 'registrations' AND al.record_id = r_reg.id)
      LEFT JOIN registration_selections rs ON (al.table_name = 'registration_selections' AND al.record_id = rs.id)
      LEFT JOIN registrations r_sel ON rs.registration_id = r_sel.id
      ORDER BY al.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `)

    const auditLogs = (rows as any[]).map(log => ({
      id: log.id,
      user_id: log.user_id,
      table_name: log.table_name,
      record_id: log.record_id,
      action: log.action,
      old_values: log.old_values,
      new_values: log.new_values,
      changed_fields: log.changed_fields || '',
      ip_address: log.ip_address || '',
      user_agent: log.user_agent || 'Browser',
      created_at: log.created_at,
      user_name: log.user_name || 'Bilinmeyen',
      user_email: log.user_email || 'unknown@example.com',
      reference_number: log.reference_number || null,
      full_name: log.full_name || null,
      registration_id: log.registration_id || null,
    }))

    return NextResponse.json({
      success: true,
      data: auditLogs,
      currentPage: page,
      totalPages,
      total
    })
  } catch (error) {
    console.error('Audit logs API error:', error)
    return NextResponse.json({
      success: false,
      error: `API Hatası: ${error instanceof Error ? error.message : String(error)}`
    }, { status: 500 })
  }
}