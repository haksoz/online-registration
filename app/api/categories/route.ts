import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Public endpoint - Form için kategorileri döndürür (kategori bazlı tarih ve erken kayıt dahil)
export async function GET(request: NextRequest) {
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM registration_types WHERE category_id = c.id AND is_active = 1) as type_count
       FROM registration_categories c 
       WHERE c.is_visible = 1 AND c.is_active = 1
       ORDER BY display_order, id`
    )

    const now = new Date()
    const categories = (rows as any[]).map((c: any) => {
      const start = c.registration_start_date ? new Date(c.registration_start_date) : null
      const end = c.registration_end_date ? new Date(c.registration_end_date) : null
      const earlyBirdDeadline = c.early_bird_deadline ? new Date(c.early_bird_deadline) : null
      const is_registration_open =
        (start === null || now >= start) && (end === null || now <= end)
      const is_early_bird_active =
        !!c.early_bird_enabled && earlyBirdDeadline !== null && now <= earlyBirdDeadline
      return {
        ...c,
        is_registration_open: !!is_registration_open,
        is_early_bird_active: !!is_early_bird_active,
      }
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ success: false, error: 'Kategoriler yüklenirken hata oluştu' }, { status: 500 })
  }
}

