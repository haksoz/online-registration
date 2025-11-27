import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    // Transaction durumunu kontrol et
    const [transactions] = await pool.query(
      `SELECT status, error_code, error_message, transaction_id, auth_code
       FROM payment_transactions 
       WHERE order_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [orderId]
    );

    if ((transactions as any[]).length === 0) {
      return NextResponse.json({
        status: 'pending',
        message: 'İşlem bulunamadı'
      });
    }

    const transaction = (transactions as any[])[0];

    return NextResponse.json({
      status: transaction.status,
      errorCode: transaction.error_code,
      errorMessage: transaction.error_message,
      transactionId: transaction.transaction_id,
      authCode: transaction.auth_code
    });

  } catch (error: any) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
