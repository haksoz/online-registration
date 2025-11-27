import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import db from '@/lib/db';
import { createPaymentService, getActiveGateway } from '@/lib/payment/paymentGatewayFactory';
import { PaymentInitiateRequest } from '@/types/payment';

export async function POST(request: NextRequest) {
  try {
    const body: PaymentInitiateRequest = await request.json();
    
    // Validasyon
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz tutar' },
        { status: 400 }
      );
    }

    if (!body.cardNumber || !body.cardExpiry || !body.cardCvv) {
      return NextResponse.json(
        { success: false, error: 'Kart bilgileri eksik' },
        { status: 400 }
      );
    }

    // Aktif gateway'i getir
    const gateway = await getActiveGateway(db);
    
    if (!gateway) {
      return NextResponse.json(
        { success: false, error: 'Aktif ödeme sistemi bulunamadı' },
        { status: 500 }
      );
    }

    // Base URL'i belirle
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    // Payment service oluştur
    const paymentService = createPaymentService(gateway, baseUrl);

    // Benzersiz order ID oluştur
    const orderId = `ORD-${uuidv4()}`;

    // IP ve User Agent bilgilerini al
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Transaction kaydı oluştur
    await db.query(
      `INSERT INTO payment_transactions 
       (gateway_id, order_id, amount, currency, status, payment_method, 
        card_last4, ip_address, user_agent, form_submission_id) 
       VALUES (?, ?, ?, ?, 'pending', 'credit_card', ?, ?, ?, ?)`,
      [
        gateway.id,
        orderId,
        body.amount,
        body.currency || 'TRY',
        body.cardNumber.slice(-4),
        ipAddress,
        userAgent,
        body.formSubmissionId || null
      ]
    );

    // Ödeme verilerini hazırla
    const paymentData = (paymentService as any).preparePaymentData(body, orderId);

    // HTML form oluştur
    const htmlContent = (paymentService as any).generatePaymentForm(paymentData);

    return NextResponse.json({
      success: true,
      orderId,
      htmlContent
    });

  } catch (error: any) {
    console.error('Payment initiate error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Ödeme başlatılamadı' },
      { status: 500 }
    );
  }
}
