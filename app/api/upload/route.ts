import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Dosya bulunamadı' },
        { status: 400 }
      )
    }

    // Dosya türü kontrolü - Resim ve PDF kabul et
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Sadece JPG, PNG, WebP ve PDF formatları desteklenir' },
        { status: 400 }
      )
    }

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Dosya boyutu 10MB\'dan küçük olmalıdır' },
        { status: 400 }
      )
    }

    // Dosya adını oluştur (timestamp + orijinal uzantı)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const timestamp = Date.now()
    const ext = path.extname(file.name)
    
    // Dosya tipine göre klasör ve prefix belirle
    const isReceipt = file.type === 'application/pdf' || file.name.toLowerCase().includes('dekont') || file.name.toLowerCase().includes('receipt')
    const folder = isReceipt ? 'receipts' : 'banners'
    const prefix = isReceipt ? 'receipt' : 'banner'
    const filename = `${prefix}-${timestamp}${ext}`
    
    // Upload klasörünü oluştur
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
    await mkdir(uploadDir, { recursive: true })
    
    // Dosyayı kaydet
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)
    
    // Public URL'i döndür
    const publicUrl = `/uploads/${folder}/${filename}`
    
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Dosya yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
