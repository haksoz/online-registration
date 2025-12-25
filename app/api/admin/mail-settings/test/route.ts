import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { pool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings, testEmail } = body
    
    if (!testEmail) {
      return NextResponse.json(
        { success: false, error: 'Test mail adresi gerekli' },
        { status: 400 }
      )
    }
    
    // SMTP transporter oluştur
    const transporter = nodemailer.createTransport({
      host: settings.smtp_host,
      port: parseInt(settings.smtp_port),
      secure: settings.smtp_secure === 'ssl',
      auth: {
        user: settings.smtp_user,
        pass: settings.smtp_password
      }
    })
    
    // Test maili gönder
    const subject = 'Test Mail - Online Kayıt Sistemi'
    let status = 'sent'
    let errorMessage = null
    
    try {
      await transporter.sendMail({
        from: `"${settings.from_name}" <${settings.from_email}>`,
        to: testEmail,
        subject: subject,
        html: `
          <h2>Mail Ayarları Test Maili</h2>
          <p>Bu mail, SMTP ayarlarınızın doğru çalıştığını test etmek için gönderilmiştir.</p>
          <p><strong>SMTP Host:</strong> ${settings.smtp_host}</p>
          <p><strong>Port:</strong> ${settings.smtp_port}</p>
          <p><strong>Güvenlik:</strong> ${settings.smtp_secure.toUpperCase()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Bu mail otomatik olarak oluşturulmuştur.
          </p>
        `
      })
    } catch (mailError: any) {
      status = 'failed'
      errorMessage = mailError.message
      throw mailError
    } finally {
      // Log kaydet
      await pool.execute(
        `INSERT INTO mail_logs (recipient_email, subject, mail_type, status, error_message) 
         VALUES (?, ?, 'test', ?, ?)`,
        [testEmail, subject, status, errorMessage]
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test maili başarıyla gönderildi'
    })
  } catch (error: any) {
    console.error('Test mail error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Test maili gönderilemedi'
      },
      { status: 500 }
    )
  }
}
