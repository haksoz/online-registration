import { generateSHA1Base64Hash } from './hashGenerator';
import { PaymentGateway, PaymentInitiateRequest } from '@/types/payment';

export interface DenizbankPaymentData {
  ShopCode: string;
  OrderId: string;
  PurchAmount: string;
  Currency: string;
  OkUrl: string;
  FailUrl: string;
  Rnd: string;
  InstallmentCount: string;
  TxnType: string;
  Pan: string;
  Cvv2: string;
  Expiry: string;
  CardType: string;
  SecureType: string;
  Hash: string;
}

export class DenizbankService {
  private gateway: PaymentGateway;
  private merchantPass: string;
  private baseUrl: string;

  constructor(gateway: PaymentGateway, merchantPass: string, baseUrl: string) {
    this.gateway = gateway;
    this.merchantPass = merchantPass;
    this.baseUrl = baseUrl;
  }

  /**
   * Ödeme başlatma verilerini hazırlar
   */
  preparePaymentData(
    request: PaymentInitiateRequest,
    orderId: string
  ): DenizbankPaymentData {
    const rnd = new Date().getTime().toString();
    const okUrl = `${this.baseUrl}/api/payment/callback-success`;
    const failUrl = `${this.baseUrl}/api/payment/callback-fail`;

    // Kart tipi belirleme (ilk hane 4 ise Visa, 5 ise MasterCard)
    const firstDigit = request.cardNumber.charAt(0);
    const cardType = firstDigit === '4' ? '0' : '1'; // 0: Visa, 1: MasterCard

    // Hash string oluşturma
    const hashString = 
      this.gateway.shop_code +
      orderId +
      request.amount.toFixed(2) +
      okUrl +
      failUrl +
      'Auth' + // TxnType
      '1' + // InstallmentCount
      rnd +
      this.merchantPass;

    const hash = generateSHA1Base64Hash(hashString);

    return {
      ShopCode: this.gateway.shop_code || '',
      OrderId: orderId,
      PurchAmount: request.amount.toFixed(2),
      Currency: request.currency === 'TRY' ? '949' : '840', // 949: TRY, 840: USD
      OkUrl: okUrl,
      FailUrl: failUrl,
      Rnd: rnd,
      InstallmentCount: '1',
      TxnType: 'Auth',
      Pan: request.cardNumber.replace(/\s/g, ''),
      Cvv2: request.cardCvv,
      Expiry: request.cardExpiry.replace('/', ''), // MMYY formatında
      CardType: cardType,
      SecureType: '3DPay',
      Hash: hash
    };
  }

  /**
   * Callback hash doğrulaması
   */
  validateCallback(params: any): boolean {
    const hashParams = params.HASHPARAMS;
    const hashParamsVal = params.HASHPARAMSVAL;
    const receivedHash = params.HASH;

    if (!hashParams || !hashParamsVal || !receivedHash) {
      return false;
    }

    const hashParamsArray = hashParams.split(':');
    let paramsVal = '';

    for (const param of hashParamsArray) {
      if (params[param] != null) {
        paramsVal += params[param];
      }
    }

    // Hesaplanan hash
    const calculatedHashString = paramsVal + this.merchantPass;
    const calculatedHash = generateSHA1Base64Hash(calculatedHashString);

    return paramsVal === hashParamsVal && receivedHash === calculatedHash;
  }

  /**
   * API URL'ini döndürür (test/production)
   */
  getApiUrl(): string {
    return this.gateway.test_mode 
      ? this.gateway.api_url_test || ''
      : this.gateway.api_url_production || '';
  }

  /**
   * HTML form oluşturur (3D Secure için)
   */
  generatePaymentForm(data: DenizbankPaymentData): string {
    const apiUrl = this.getApiUrl();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Ödeme İşlemi</title>
      </head>
      <body>
        <form id="paymentForm" method="POST" action="${apiUrl}">
          ${Object.entries(data).map(([key, value]) => 
            `<input type="hidden" name="${key}" value="${value}" />`
          ).join('\n          ')}
        </form>
        <script>
          document.getElementById('paymentForm').submit();
        </script>
      </body>
      </html>
    `;
  }
}
