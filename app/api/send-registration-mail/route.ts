import { NextRequest, NextResponse } from 'next/server'
import { sendMail } from '@/lib/sendMail'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, referenceNumber, registrationInfo, registrationId, language } = body
    
    if (!email || !referenceNumber) {
      return NextResponse.json(
        { success: false, error: 'Eksik bilgi' },
        { status: 400 }
      )
    }
    
    // Sayfa başlığını al
    const { pool } = require('@/lib/db')
    const [titleRows] = await pool.execute(
      "SELECT setting_value FROM page_settings WHERE setting_key = 'form_title'"
    )
    const [titleEnRows] = await pool.execute(
      "SELECT setting_value FROM page_settings WHERE setting_key = 'form_title_en'"
    )
    const formTitle = (titleRows as any[])[0]?.setting_value || 'Online Kayıt Sistemi'
    const formTitleEn = (titleEnRows as any[])[0]?.setting_value || 'Online Registration System'
    
    const isEnglish = language === 'en'
    const pageTitle = isEnglish ? formTitleEn : formTitle
    
    // Mail HTML içeriği - Step4'teki içeriği kullan
    const mailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 10px;
            background-color: #f3f4f6;
          }
          .container { 
            max-width: 700px; 
            margin: 0 auto; 
            background: white;
            padding: 20px;
            border-radius: 8px;
          }
          
          /* Mobile Responsive */
          @media only screen and (max-width: 600px) {
            body {
              padding: 5px;
            }
            .container {
              padding: 15px;
              border-radius: 4px;
            }
            .text-2xl { font-size: 20px !important; line-height: 28px !important; }
            .text-xl { font-size: 18px !important; line-height: 24px !important; }
            .text-lg { font-size: 16px !important; line-height: 24px !important; }
            table { font-size: 12px !important; }
            .p-6 { padding: 8px !important; }
            .p-4 { padding: 6px !important; }
          }
          
          /* Kopyala butonlarını gizle */
          .no-pdf { display: none !important; }
          
          /* Tailwind class'ları için stiller - Küçültülmüş padding'ler */
          .mb-6 { margin-bottom: 12px; }
          .mb-4 { margin-bottom: 8px; }
          .mb-2 { margin-bottom: 4px; }
          .mb-3 { margin-bottom: 6px; }
          .mt-2 { margin-top: 4px; }
          .mt-4 { margin-top: 8px; }
          .p-4 { padding: 8px; }
          .p-6 { padding: 12px; }
          .space-y-2 > * + * { margin-top: 4px; }
          .space-y-4 > * + * { margin-top: 8px; }
          
          .text-center { text-align: center; }
          .text-2xl { font-size: 24px; line-height: 32px; }
          .text-xl { font-size: 20px; line-height: 28px; }
          .text-lg { font-size: 18px; line-height: 28px; }
          .text-sm { font-size: 14px; line-height: 20px; }
          .text-xs { font-size: 12px; line-height: 16px; }
          
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .font-medium { font-weight: 500; }
          
          .text-gray-900 { color: #111827; }
          .text-gray-800 { color: #1f2937; }
          .text-gray-700 { color: #374151; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-500 { color: #6b7280; }
          .text-green-800 { color: #166534; }
          .text-green-700 { color: #15803d; }
          .text-blue-800 { color: #1e40af; }
          .text-blue-700 { color: #1d4ed8; }
          
          .bg-green-50 { background-color: #f0fdf4; }
          .bg-blue-50 { background-color: #eff6ff; }
          .bg-gray-50 { background-color: #f9fafb; }
          .bg-white { background-color: white; }
          
          .border { border: 1px solid #e5e7eb; }
          .border-green-200 { border: 1px solid #bbf7d0; }
          .border-blue-200 { border: 1px solid #bfdbfe; }
          .border-gray-200 { border: 1px solid #e5e7eb; }
          
          .rounded-lg { border-radius: 8px; }
          
          .grid { display: grid; }
          .gap-4 { gap: 16px; }
          .flex { display: flex; }
          .items-start { align-items: flex-start; }
          .items-center { align-items: center; }
          .justify-between { justify-content: space-between; }
          .flex-1 { flex: 1; }
          
          table { width: 100%; border-collapse: collapse; }
          td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          ${registrationInfo || ''}
        </div>
      </body>
      </html>
    `
    
    // BCC email adresini al
    const [bccRows] = await pool.execute(
      "SELECT setting_value FROM form_settings WHERE setting_key = 'bcc_email'"
    )
    const bccEmail = (bccRows as any[])[0]?.setting_value || ''
    
    // Kullanıcıya mail gönder
    const userSubject = isEnglish 
      ? `${pageTitle} - Registration Received`
      : `${pageTitle} - Kaydınız Alındı`
    
    const userResult = await sendMail({
      to: email,
      toName: name,
      subject: userSubject,
      html: mailHtml,
      mailType: 'user_confirmation',
      registrationId,
      bcc: bccEmail || undefined
    })
    
    // Kayıt bildirim mail adresine bildirim gönder
    const [notificationRows] = await pool.execute(
      "SELECT setting_value FROM form_settings WHERE setting_key = 'notification_email'"
    )
    const notificationEmail = (notificationRows as any[])[0]?.setting_value
    
    if (notificationEmail) {
      await sendMail({
        to: notificationEmail,
        toName: 'Kayıt Bildirimi',
        subject: `${formTitle} - Yeni Kayıt - ${name} - ${referenceNumber}`,
        html: mailHtml,
        mailType: 'admin_notification',
        registrationId
      })
    }
    
    return NextResponse.json(userResult)
  } catch (error: any) {
    console.error('Registration mail error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
