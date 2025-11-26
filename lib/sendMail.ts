import nodemailer from 'nodemailer'
import { pool } from '@/lib/db'

interface MailOptions {
  to: string
  toName?: string
  subject: string
  html: string
  mailType: 'user_confirmation' | 'admin_notification' | 'test' | 'custom'
  registrationId?: number
  bcc?: string
}

export async function sendMail(options: MailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    // Mail ayarlarını getir
    const [rows] = await pool.execute(
      'SELECT setting_key, setting_value FROM mail_settings'
    )
    
    const settings: Record<string, string> = {}
    ;(rows as any[]).forEach((row: any) => {
      settings[row.setting_key] = row.setting_value
    })
    
    // Mail gönderimi kapalıysa logla ve çık (sadece ayar varsa kontrol et)
    if (options.mailType === 'user_confirmation' && settings.send_user_confirmation === '0') {
      return { success: true }
    }
    
    if (options.mailType === 'admin_notification' && settings.send_admin_notification === '0') {
      return { success: true }
    }
    
    // SMTP ayarları eksikse hata
    if (!settings.smtp_host || !settings.from_email) {
      return { success: false, error: 'Mail ayarları yapılandırılmamış' }
    }
    
    // Transporter oluştur
    const transporter = nodemailer.createTransport({
      host: settings.smtp_host,
      port: parseInt(settings.smtp_port || '587'),
      secure: settings.smtp_secure === 'ssl',
      auth: {
        user: settings.smtp_user,
        pass: settings.smtp_password
      }
    })

    
    let status = 'sent'
    let errorMessage = null
    
    try {
      // Mail gönder
      const mailOptions: any = {
        from: `"${settings.from_name}" <${settings.from_email}>`,
        to: options.to,
        subject: options.subject,
        html: options.html
      }
      
      // BCC varsa ekle
      if (options.bcc) {
        mailOptions.bcc = options.bcc
      }
      
      await transporter.sendMail(mailOptions)
    } catch (error: any) {
      status = 'failed'
      errorMessage = error.message
      console.error('Mail send error:', error)
    }
    
    // Log kaydet
    try {
      await pool.execute(
        `INSERT INTO mail_logs (recipient_email, recipient_name, subject, mail_type, status, error_message, registration_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [options.to, options.toName || null, options.subject, options.mailType, status, errorMessage, options.registrationId || null]
      )
    } catch (logError) {
      console.error('Mail log error:', logError)
    }
    
    return { 
      success: status === 'sent',
      error: errorMessage || undefined
    }
  } catch (error: any) {
    console.error('Send mail error:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
}
