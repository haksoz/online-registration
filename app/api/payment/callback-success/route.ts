import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { createPaymentService } from '@/lib/payment/paymentGatewayFactory';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: any = {};
    
    // FormData'yı objeye çevir
    formData.forEach((value, key) => {
      params[key] = value;
    });

    const orderId = params.OrderId || params.orderid || params.oid;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID bulunamadı' },
        { status: 400 }
      );
    }

    // Transaction kaydını getir
    const [transactions] = await db.query(
      `SELECT pt.*, pg.* 
       FROM payment_transactions pt
       JOIN payment_gateways pg ON pt.gateway_id = pg.id
       WHERE pt.order_id = ?`,
      [orderId]
    );

    if (transactions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'İşlem bulunamadı' },
        { status: 404 }
      );
    }

    const transaction = transactions[0];
    const gateway = {
      id: transaction.gateway_id,
      gateway_code: transaction.gateway_code,
      merchant_pass_encrypted: transaction.merchant_pass_encrypted,
      test_mode: transaction.test_mode
    };

    // Base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    // Payment service oluştur ve hash doğrula
    const paymentService = createPaymentService(gateway as any, baseUrl);
    const isValid = (paymentService as any).validateCallback(params);

    if (!isValid) {
      // Hash doğrulaması başarısız
      await db.query(
        `UPDATE payment_transactions 
         SET status = 'failed', 
             error_message = 'Güvenlik doğrulaması başarısız',
             bank_response = ?,
             updated_at = NOW()
         WHERE order_id = ?`,
        [JSON.stringify(params), orderId]
      );

      return NextResponse.redirect(
        new URL(`/payment-result?status=error&message=Güvenlik doğrulaması başarısız`, baseUrl)
      );
    }

    // 3D Status kontrolü
    const status3D = params['3DStatus'] || params.mdStatus;
    const procReturnCode = params.ProcReturnCode || params.Response;

    if (['1', '2', '3', '4'].includes(status3D) && procReturnCode === '00') {
      // Başarılı ödeme
      await db.query(
        `UPDATE payment_transactions 
         SET status = 'success',
             transaction_id = ?,
             auth_code = ?,
             card_type = ?,
             bank_response = ?,
             transaction_date = NOW(),
             updated_at = NOW()
         WHERE order_id = ?`,
        [
          params.TransId || params.TransactionId,
          params.AuthCode || params.authCode,
          params.CardType || 'unknown',
          JSON.stringify(params),
          orderId
        ]
      );

      return NextResponse.redirect(
        new URL(`/payment-result?status=success&orderId=${orderId}`, baseUrl)
      );
    } else {
      // Başarısız ödeme
      await db.query(
        `UPDATE payment_transactions 
         SET status = 'failed',
             error_code = ?,
             error_message = ?,
             bank_response = ?,
             updated_at = NOW()
         WHERE order_id = ?`,
        [
          params.ErrorCode || procReturnCode,
          params.ErrorMessage || params.ErrMsg || 'Ödeme başarısız',
          JSON.stringify(params),
          orderId
        ]
      );

      return NextResponse.redirect(
        new URL(`/payment-result?status=error&message=${encodeURIComponent(params.ErrorMessage || 'Ödeme başarısız')}`, baseUrl)
      );
    }

  } catch (error: any) {
    console.error('Payment callback error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
