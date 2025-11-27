import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { encrypt } from '@/lib/payment/hashGenerator';

const ENCRYPTION_KEY = process.env.PAYMENT_ENCRYPTION_KEY || 'your-secret-key-change-this';

// GET - Tüm gateway'leri listele
export async function GET() {
  try {
    const [gateways] = await db.query(
      `SELECT id, gateway_name, gateway_code, shop_code, merchant_id, 
              terminal_id, api_url_test, api_url_production, 
              test_mode, is_active, display_order, created_at, updated_at
       FROM payment_gateways 
       ORDER BY display_order, id`
    );

    return NextResponse.json({ success: true, data: gateways });
  } catch (error: any) {
    console.error('Get payment gateways error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Yeni gateway ekle veya güncelle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, merchant_pass, ...otherFields } = body;

    // Merchant pass'i şifrele
    let encryptedPass = null;
    if (merchant_pass) {
      encryptedPass = encrypt(merchant_pass, ENCRYPTION_KEY);
    }

    if (id) {
      // Güncelleme
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      Object.entries(otherFields).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      });

      if (encryptedPass) {
        updateFields.push('merchant_pass_encrypted = ?');
        updateValues.push(encryptedPass);
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      await db.query(
        `UPDATE payment_gateways SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      return NextResponse.json({ 
        success: true, 
        message: 'Gateway güncellendi' 
      });
    } else {
      // Yeni ekleme
      const fields = Object.keys(otherFields);
      const values = Object.values(otherFields);

      if (encryptedPass) {
        fields.push('merchant_pass_encrypted');
        values.push(encryptedPass);
      }

      const placeholders = fields.map(() => '?').join(', ');

      await db.query(
        `INSERT INTO payment_gateways (${fields.join(', ')}) VALUES (${placeholders})`,
        values
      );

      return NextResponse.json({ 
        success: true, 
        message: 'Gateway eklendi' 
      });
    }
  } catch (error: any) {
    console.error('Save payment gateway error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
