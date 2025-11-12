import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

// GET - Mail loglarını getir
export async function GET() {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM mail_logs 
       ORDER BY sent_at DESC 
       LIMIT 500`
    )
    
    return NextResponse.json({
      success: true,
      logs: rows
    })
  } catch (error: any) {
    console.error('Mail logs fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Loglar yüklenemedi' },
      { status: 500 }
    )
  }
}
