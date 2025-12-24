import { generateRegistrationHTML } from './pdfTemplate'

interface EmailData {
  referenceNumber: string
  fullName: string
  email: string
  phone: string
  address?: string
  company?: string
  invoiceType: string
  invoiceFullName?: string
  idNumber?: string
  invoiceAddress?: string
  invoiceCompanyName?: string
  taxOffice?: string
  taxNumber?: string
  selections: Array<{
    categoryName: string
    typeLabel: string
    fee: number
    vatRate: number
    vat: number
    total: number
  }>
  grandTotal: number
  paymentMethod: string
  paymentStatus: string
  createdAt: string
  language?: string
}

/**
 * Kayıt onay emaili için HTML içeriği oluşturur
 * Bu fonksiyon generateRegistrationHTML'i kullanır ve email için optimize eder
 */
export function generateRegistrationEmailHTML(data: EmailData): string {
  // Aynı template'i kullan, email için de uygun
  return generateRegistrationHTML(data)
}

/**
 * Kayıt onay emaili gönderir
 * Not: Bu fonksiyon mail gönderme servisiniz ile entegre edilmelidir
 */
export async function sendRegistrationConfirmationEmail(
  to: string,
  data: EmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const htmlContent = generateRegistrationEmailHTML(data)
    
    // TODO: Burada mail gönderme servisinizi kullanın
    // Örnek: SendGrid, AWS SES, Nodemailer, vb.
    
    console.log('Email gönderilecek:', to)
    console.log('HTML içeriği hazır')
    
    // Şimdilik sadece log at
    return { success: true }
  } catch (error) {
    console.error('Email gönderme hatası:', error)
    return { success: false, error: String(error) }
  }
}
