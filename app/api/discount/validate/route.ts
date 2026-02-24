import { NextRequest, NextResponse } from 'next/server'
import { applyDiscountCode } from '@/lib/discountApply'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, items } = body
    if (!code || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, valid: false, message: 'Kod ve seçim listesi gerekli.' },
        { status: 400 }
      )
    }

    const result = await applyDiscountCode(code, items)
    if (!result.valid) {
      return NextResponse.json({
        success: true,
        valid: false,
        message: result.message || 'Geçersiz indirim kodu.',
      })
    }

    return NextResponse.json({
      success: true,
      valid: true,
      discountCodeId: result.discountCodeId,
      items: result.items,
      grandTotalTry: result.grandTotalTry,
    })
  } catch (e) {
    console.error('Discount validate error:', e)
    return NextResponse.json(
      { success: false, valid: false, message: 'İndirim kodu kontrol edilemedi.' },
      { status: 500 }
    )
  }
}
