import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Önce diğer tüm gateway'leri pasif yap
    await db.query('UPDATE payment_gateways SET is_active = FALSE');

    // Seçili gateway'i aktif yap
    await db.query(
      'UPDATE payment_gateways SET is_active = TRUE WHERE id = ?',
      [id]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Aktif ödeme sistemi güncellendi' 
    });
  } catch (error: any) {
    console.error('Toggle gateway error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
