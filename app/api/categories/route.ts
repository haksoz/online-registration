import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Public endpoint - Form için kategorileri döndürür
export async function GET(request: NextRequest) {
  try {
    const [categories] = await pool.execute(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM registration_types WHERE category_id = c.id AND is_active = 1) as type_count
       FROM registration_categories c 
       WHERE c.is_visible = 1
       ORDER BY display_order, id`
    )

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ success: false, error: 'Kategoriler yüklenirken hata oluştu' }, { status: 500 })
  }
}

