import { formatTurkishCurrency } from './currencyUtils'

interface RegistrationData {
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
  bankAccounts?: Array<{
    id: number
    bank_name: string
    account_name: string
    account_name_en?: string
    account_holder: string
    iban: string
    currency: string
  }>
  dekontEmail?: string
}

export function generateRegistrationHTML(data: RegistrationData): string {
  const isEnglish = data.language === 'en'
  
  return `
<!DOCTYPE html>
<html lang="${isEnglish ? 'en' : 'tr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isEnglish ? 'Registration Confirmation' : 'Kayıt Onayı'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      padding: 20px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
    }
    
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .content {
      padding: 30px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    
    .info-item {
      padding: 10px;
      background-color: #f9fafb;
      border-radius: 6px;
    }
    
    .info-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    
    .info-value {
      font-size: 14px;
      font-weight: 500;
      color: #111827;
    }
    
    .highlight-box {
      background-color: #eff6ff;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    
    .reference-number {
      font-size: 24px;
      font-weight: 700;
      color: #667eea;
      text-align: center;
      letter-spacing: 2px;
    }
    
    .selections-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    
    .selections-table th {
      background-color: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .selections-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
    }
    
    .selections-table tr:last-child td {
      border-bottom: none;
    }
    
    .total-row {
      background-color: #f9fafb;
      font-weight: 600;
    }
    
    .grand-total-row {
      background-color: #667eea;
      color: white;
      font-size: 16px;
      font-weight: 700;
    }
    
    .text-right {
      text-align: right;
    }
    
    .footer {
      background-color: #f9fafb;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .status-completed {
      background-color: #d1fae5;
      color: #065f46;
    }
    
    .status-pending {
      background-color: #fef3c7;
      color: #92400e;
    }
    
    @media print {
      body {
        background-color: white;
        padding: 0;
      }
      
      .container {
        box-shadow: none;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isEnglish ? '✓ Registration Confirmed' : '✓ Kayıt Onaylandı'}</h1>
      <p>${new Date(data.createdAt).toLocaleString(isEnglish ? 'en-US' : 'tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
    </div>
    
    <div class="content">
      <!-- Reference Number -->
      <div class="highlight-box">
        <div class="info-label" style="text-align: center; margin-bottom: 8px;">
          ${isEnglish ? 'Reference Number' : 'Referans Numarası'}
        </div>
        <div class="reference-number">${data.referenceNumber}</div>
      </div>
      
      <!-- Participant Information -->
      <div class="section">
        <div class="section-title">${isEnglish ? 'Participant Information' : 'Katılımcı Bilgileri'}</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">${isEnglish ? 'Full Name' : 'Ad Soyad'}</div>
            <div class="info-value">${data.fullName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">${isEnglish ? 'Email' : 'E-posta'}</div>
            <div class="info-value">${data.email}</div>
          </div>
          <div class="info-item">
            <div class="info-label">${isEnglish ? 'Phone' : 'Telefon'}</div>
            <div class="info-value">${data.phone}</div>
          </div>
          ${data.company ? `
          <div class="info-item">
            <div class="info-label">${isEnglish ? 'Company' : 'Şirket'}</div>
            <div class="info-value">${data.company}</div>
          </div>
          ` : ''}
        </div>
      </div>
      
      <!-- Invoice Information -->
      <div class="section">
        <div class="section-title">${isEnglish ? 'Invoice Information' : 'Fatura Bilgileri'}</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">${isEnglish ? 'Invoice Type' : 'Fatura Tipi'}</div>
            <div class="info-value">${data.invoiceType === 'bireysel' ? (isEnglish ? 'Individual' : 'Bireysel') : (isEnglish ? 'Corporate' : 'Kurumsal')}</div>
          </div>
          ${data.invoiceType === 'bireysel' ? `
            ${data.invoiceFullName ? `
            <div class="info-item">
              <div class="info-label">${isEnglish ? 'Invoice Name' : 'Fatura Adı'}</div>
              <div class="info-value">${data.invoiceFullName}</div>
            </div>
            ` : ''}
            ${data.idNumber ? `
            <div class="info-item">
              <div class="info-label">${isEnglish ? 'ID Number' : 'TC Kimlik No'}</div>
              <div class="info-value">${data.idNumber}</div>
            </div>
            ` : ''}
          ` : `
            ${data.invoiceCompanyName ? `
            <div class="info-item">
              <div class="info-label">${isEnglish ? 'Company Name' : 'Şirket Adı'}</div>
              <div class="info-value">${data.invoiceCompanyName}</div>
            </div>
            ` : ''}
            ${data.taxOffice ? `
            <div class="info-item">
              <div class="info-label">${isEnglish ? 'Tax Office' : 'Vergi Dairesi'}</div>
              <div class="info-value">${data.taxOffice}</div>
            </div>
            ` : ''}
            ${data.taxNumber ? `
            <div class="info-item">
              <div class="info-label">${isEnglish ? 'Tax Number' : 'Vergi No'}</div>
              <div class="info-value">${data.taxNumber}</div>
            </div>
            ` : ''}
          `}
        </div>
      </div>
      
      <!-- Registration Selections -->
      <div class="section">
        <div class="section-title">${isEnglish ? 'Registration Details' : 'Kayıt Detayları'}</div>
        <table class="selections-table">
          <thead>
            <tr>
              <th>${isEnglish ? 'Registration Type' : 'Kayıt Türü'}</th>
              <th class="text-right">${isEnglish ? 'Total' : 'Toplam'}</th>
            </tr>
          </thead>
          <tbody>
            ${data.selections.map(sel => `
            <tr>
              <td>
                <div style="font-weight: 500;">${sel.typeLabel}</div>
                <div style="font-size: 11px; color: #6b7280;">${formatTurkishCurrency(sel.fee)} + %${(sel.vatRate * 100).toFixed(0)} KDV</div>
              </td>
              <td class="text-right">${formatTurkishCurrency(sel.total)}</td>
            </tr>
            `).join('')}
            <tr class="grand-total-row">
              <td>${isEnglish ? 'GRAND TOTAL (VAT Included)' : 'GENEL TOPLAM (KDV Dahil)'}</td>
              <td class="text-right">${formatTurkishCurrency(data.grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Payment Information -->
      <div class="section">
        <div class="section-title">${isEnglish ? 'Payment Information' : 'Ödeme Bilgileri'}</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">${isEnglish ? 'Payment Method' : 'Ödeme Yöntemi'}</div>
            <div class="info-value">${data.paymentMethod === 'online' ? (isEnglish ? 'Online Payment' : 'Online Ödeme') : (isEnglish ? 'Bank Transfer' : 'Havale/EFT')}</div>
          </div>
          <div class="info-item">
            <div class="info-label">${isEnglish ? 'Payment Status' : 'Ödeme Durumu'}</div>
            <div class="info-value">
              <span class="status-badge ${data.paymentStatus === 'completed' ? 'status-completed' : 'status-pending'}">
                ${data.paymentStatus === 'completed' ? (isEnglish ? 'Completed' : 'Tamamlandı') : (isEnglish ? 'Pending' : 'Beklemede')}
              </span>
            </div>
          </div>
        </div>
        
        ${data.paymentMethod === 'bank_transfer' && data.bankAccounts && data.bankAccounts.length > 0 ? `
        <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
          <p style="font-size: 13px; color: #92400e; margin-bottom: 10px;">
            ${isEnglish 
              ? 'Please complete your payment via bank transfer and send your receipt to:' 
              : 'Lütfen banka havalesi ile ödemenizi tamamlayın ve dekontunuzu şu adrese gönderin:'}
          </p>
          <p style="font-weight: 600; color: #92400e; margin-bottom: 15px;">${data.dekontEmail || ''}</p>
          
          <div style="font-weight: 600; font-size: 13px; color: #92400e; margin-bottom: 10px;">
            ${isEnglish ? 'Bank Accounts:' : 'Banka Hesapları:'}
          </div>
          ${data.bankAccounts.map(acc => `
          <div style="background-color: white; border: 1px solid #fbbf24; border-radius: 4px; padding: 10px; margin-bottom: 10px; font-size: 12px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${isEnglish ? (acc.account_name_en || acc.account_name) : acc.account_name}</div>
            <div style="color: #6b7280;">${acc.bank_name}</div>
            <div style="color: #6b7280;">${acc.account_holder}</div>
            <div style="font-family: monospace; font-weight: 500; margin-top: 4px;">${acc.iban}</div>
          </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
    </div>
    
    <div class="footer">
      <p>${isEnglish ? 'This is an automatically generated registration confirmation.' : 'Bu otomatik olarak oluşturulmuş bir kayıt onayıdır.'}</p>
      <p>${isEnglish ? 'Please keep this document for your records.' : 'Lütfen bu belgeyi kayıtlarınız için saklayın.'}</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
