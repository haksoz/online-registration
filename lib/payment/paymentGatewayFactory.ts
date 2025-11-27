import { PaymentGateway } from '@/types/payment';
import { DenizbankService } from './denizbank';
import { decrypt } from './hashGenerator';

const ENCRYPTION_KEY = process.env.PAYMENT_ENCRYPTION_KEY || 'your-secret-key-change-this';

/**
 * Gateway tipine göre uygun service'i döndürür
 */
export function createPaymentService(gateway: PaymentGateway, baseUrl: string) {
  // Merchant pass'i decrypt et
  const merchantPass = gateway.merchant_pass_encrypted 
    ? decrypt(gateway.merchant_pass_encrypted, ENCRYPTION_KEY)
    : '';

  switch (gateway.gateway_code) {
    case 'denizbank':
      return new DenizbankService(gateway, merchantPass, baseUrl);
    
    case 'garanti':
      // TODO: Garanti service eklenecek
      throw new Error('Garanti entegrasyonu henüz hazır değil');
    
    case 'isbank':
      // TODO: İş Bankası service eklenecek
      throw new Error('İş Bankası entegrasyonu henüz hazır değil');
    
    default:
      throw new Error(`Desteklenmeyen gateway: ${gateway.gateway_code}`);
  }
}

/**
 * Aktif gateway'i getirir
 */
export async function getActiveGateway(db: any): Promise<PaymentGateway | null> {
  const [gateways] = await db.query(
    'SELECT * FROM payment_gateways WHERE is_active = TRUE ORDER BY display_order LIMIT 1'
  );
  
  return gateways.length > 0 ? gateways[0] : null;
}
