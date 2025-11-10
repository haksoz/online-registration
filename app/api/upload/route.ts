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

    // Dosya türü kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Sadece JPG, PNG ve WebP formatları desteklenir' },
        { status: 400 }
      )
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Dosya boyutu 5MB\'dan küçük olmalıdır' },
        { status: 400 }
      )
    }

    // Dosya adını oluştur (timestamp + orijinal uzantı)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const timestamp = Date.now()
    const ext = path.extname(file.name)
    const filename = `banner-${timestamp}${ext}`
    
    // Upload klasörünü oluştur
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'banners')
    await mkdir(uploadDir, { recursive: true })
    
    // Dosyayı kaydet
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)
    
    // Public URL'i döndür
    const publicUrl = `/uploads/banners/${filename}`
    
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
