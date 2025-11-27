import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: any = {};
    
    formData.forEach((value, key) => {
      params[key] = value;
    });

    const orderId = params.OrderId || params.orderid || params.oid;
    const errorCode = params.ErrorCode || params.ErrCode || 'UNKNOWN';
    const errorMessage = params.ErrorMessage || params.ErrMsg || 'Ödeme başarısız';

    if (orderId) {
      // Transaction kaydını güncelle
      await pool.query(
        `UPDATE payment_transactions 
         SET status = 'failed',
             error_code = ?,
             error_message = ?,
             bank_response = ?,
             updated_at = NOW()
         WHERE order_id = ?`,
        [errorCode, errorMessage, JSON.stringify(params), orderId]
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    return NextResponse.redirect(
      new URL(`/payment-result?status=error&message=${encodeURIComponent(errorMessage)}`, baseUrl)
    );

  } catch (error: any) {
    console.error('Payment fail callback error:', error);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      new URL('/payment-result?status=error&message=Bir hata oluştu', baseUrl)
    );
  }
}
