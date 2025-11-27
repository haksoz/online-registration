export interface PaymentGateway {
  id: number;
  gateway_name: string;
  gateway_code: string;
  shop_code?: string;
  merchant_id?: string;
  merchant_pass_encrypted?: string;
  terminal_id?: string;
  store_key?: string;
  api_url_test?: string;
  api_url_production?: string;
  test_mode: boolean;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentTransaction {
  id?: number;
  form_submission_id?: number;
  gateway_id?: number;
  order_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  payment_method?: string;
  card_last4?: string;
  card_type?: string;
  transaction_id?: string;
  auth_code?: string;
  bank_response?: string;
  error_code?: string;
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
  transaction_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentInitiateRequest {
  amount: number;
  currency: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardHolderName: string;
  formSubmissionId?: number;
}

export interface PaymentInitiateResponse {
  success: boolean;
  orderId?: string;
  htmlContent?: string;
  error?: string;
}

export interface PaymentCallbackData {
  orderId: string;
  status: string;
  transactionId?: string;
  authCode?: string;
  errorCode?: string;
  errorMessage?: string;
  [key: string]: any;
}
