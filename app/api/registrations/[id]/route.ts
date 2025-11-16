import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { createAuditLog, extractUserInfoFromRequest, getCurrentUserId, compareObjects } from '@/lib/auditLog'

// Force dynamic rendering (uses cookies for auth)
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID formatı' },
        { status: 400 }
      )
    }

    const [rows] = await pool.execute(
      'SELECT * FROM registrations WHERE id = ?',
      [id]
    )

    const registration = (rows as any[])[0]
    if (!registration) {
      return NextResponse.json(
        { error: 'Kayıt bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(registration, { status: 200 })
  } catch (error) {
    console.error('Error fetching registration:', error)
    return NextResponse.json(
      { error: 'Kayıt yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID formatı' },
        { status: 400 }
      )
    }

    let userId = getCurrentUserId(request)
    if (!userId) {
      console.warn('User ID not found in token, using default admin user (ID: 1)')
      // Fallback to admin user ID 1 when cookies don't work properly (e.g., in Vercel)
      userId = 1
    }

    const { ipAddress, userAgent } = extractUserInfoFromRequest(request)

    // Get current record for audit log
    const [currentRecord] = await pool.execute(
      'SELECT * FROM registrations WHERE id = ?',
      [id]
    )
    const oldValues = (currentRecord as any[])[0]

    if (!oldValues) {
      return NextResponse.json(
        { error: 'Kayıt bulunamadı' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { 
      first_name, last_name, full_name, email, phone, address, company,
      invoice_type, invoice_full_name, id_number, invoice_address,
      invoice_company_name, tax_office, tax_number,
      registration_type, registration_type_label_en, fee, payment_status, status,
      refund_status, refund_amount, refund_date, refund_notes, refund_method,
      cancelled_at, cancelled_by,
      payment_receipt_url, payment_receipt_filename, payment_receipt_uploaded_at,
      payment_confirmed_at, payment_confirmed_by, payment_notes
    } = body

    // Eğer status güncellenmek isteniyorsa (iptal/sil)
    if (status !== undefined) {
      const statusLabels = {
        1: 'Aktif',
        0: 'İptal Edildi', 
        '-1': 'Silinmiş'
      }
      
      // İade bilgileri ile birlikte güncelle
      const updateFields = ['status = ?']
      const updateValues: any[] = [status]
      
      if (refund_status !== undefined) {
        updateFields.push('refund_status = ?')
        updateValues.push(refund_status)
      }
      if (refund_amount !== undefined) {
        updateFields.push('refund_amount = ?')
        updateValues.push(refund_amount)
      }
      
      // İptal ediliyorsa cancelled_at ve cancelled_by otomatik ekle
      if (status === 0) {
        updateFields.push('cancelled_at = NOW()')
        updateFields.push('cancelled_by = ?')
        updateValues.push(userId)
      }
      
      updateValues.push(id)
      
      await pool.execute(
        `UPDATE registrations SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      )

      // Create audit log for status change
      try {
        await createAuditLog({
          userId,
          tableName: 'registrations',
          recordId: id,
          action: 'UPDATE',
          oldValues: oldValues,
          newValues: { ...oldValues, status, refund_status, refund_amount, cancelled_at },
          changedFields: ['status', 'refund_status', 'refund_amount', 'cancelled_at'].filter(field => 
            body[field] !== undefined
          ),
          ipAddress,
          userAgent
        })
      } catch (auditError) {
        console.error('Audit log error (non-critical):', auditError)
      }

      return NextResponse.json({ 
        success: true, 
        message: `Kayıt durumu "${statusLabels[status as keyof typeof statusLabels] || status}" olarak güncellendi`
      }, { status: 200 })
    }

    // Eğer dekont silinmek isteniyorsa
    if (body.delete_receipt === true) {
      const newValues = {
        ...oldValues,
        payment_receipt_url: null,
        payment_receipt_filename: null,
        payment_receipt_uploaded_at: null,
        payment_receipt_uploaded_by: null
      }
      const changedFields = compareObjects(oldValues, newValues)

      await pool.execute(
        `UPDATE registrations 
         SET payment_receipt_url = NULL,
             payment_receipt_filename = NULL,
             payment_receipt_uploaded_at = NULL,
             payment_receipt_uploaded_by = NULL
         WHERE id = ?`,
        [id]
      )

      // Create audit log for receipt deletion
      await createAuditLog({
        userId,
        tableName: 'registrations',
        recordId: id,
        action: 'UPDATE',
        oldValues,
        newValues,
        changedFields,
        ipAddress,
        userAgent
      })

      return NextResponse.json({
        success: true,
        message: 'Dekont başarıyla silindi'
      }, { status: 200 })
    }

    // Eğer sadece dekont bilgileri güncellenmek isteniyorsa (payment_status olmadan)
    if ((payment_receipt_url !== undefined || payment_receipt_filename !== undefined) && payment_status === undefined) {
      const updateFields = []
      const updateValues = []
      
      if (payment_receipt_url !== undefined) {
        updateFields.push('payment_receipt_url = ?')
        updateValues.push(payment_receipt_url)
      }
      if (payment_receipt_filename !== undefined) {
        updateFields.push('payment_receipt_filename = ?')
        updateValues.push(payment_receipt_filename)
      }
      if (payment_receipt_uploaded_at !== undefined) {
        updateFields.push('payment_receipt_uploaded_at = ?')
        updateValues.push(payment_receipt_uploaded_at)
      }
      if (payment_receipt_uploaded_by !== undefined) {
        updateFields.push('payment_receipt_uploaded_by = ?')
        updateValues.push(payment_receipt_uploaded_by)
      }
      
      updateValues.push(id)
      
      const newValues = { 
        ...oldValues, 
        payment_receipt_url, 
        payment_receipt_filename, 
        payment_receipt_uploaded_at,
        payment_receipt_uploaded_by
      }
      const changedFields = compareObjects(oldValues, newValues)

      await pool.execute(
        `UPDATE registrations SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      )

      // Create audit log for receipt upload
      await createAuditLog({
        userId,
        tableName: 'registrations',
        recordId: id,
        action: 'UPDATE',
        oldValues,
        newValues,
        changedFields,
        ipAddress,
        userAgent
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Dekont bilgileri güncellendi'
      }, { status: 200 })
    }

    // Eğer sadece refund bilgileri güncellenmek isteniyorsa
    if (refund_status !== undefined || refund_date !== undefined || refund_notes !== undefined) {
      const updateFields = []
      const updateValues = []
      
      if (refund_status !== undefined) {
        updateFields.push('refund_status = ?')
        updateValues.push(refund_status)
      }
      if (refund_date !== undefined) {
        updateFields.push('refund_date = ?')
        updateValues.push(refund_date)
      }
      if (refund_notes !== undefined) {
        updateFields.push('refund_notes = ?')
        updateValues.push(refund_notes)
      }
      if (refund_method !== undefined) {
        updateFields.push('refund_method = ?')
        updateValues.push(refund_method)
      }
      
      updateValues.push(id)
      
      const newValues = { 
        ...oldValues, 
        refund_status, 
        refund_date, 
        refund_notes, 
        refund_method 
      }
      const changedFields = compareObjects(oldValues, newValues)

      await pool.execute(
        `UPDATE registrations SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      )

      // Create audit log for refund change
      await createAuditLog({
        userId,
        tableName: 'registrations',
        recordId: id,
        action: 'UPDATE',
        oldValues,
        newValues,
        changedFields,
        ipAddress,
        userAgent
      })

      return NextResponse.json({ 
        success: true, 
        message: 'İade bilgileri güncellendi'
      }, { status: 200 })
    }

    // İptal edilmiş kayıtlarda ödeme durumu değiştirilemez (pending veya completed fark etmez)
    if (payment_status !== undefined && oldValues.status === 0) {
      return NextResponse.json({
        success: false,
        error: 'İptal edilmiş kayıtlarda ödeme durumu değiştirilemez'
      }, { status: 400 })
    }

    // İadesi tamamlanan kayıtlar tekrar aktifleştirilemez
    if (status === 1 && oldValues.status === 0 && oldValues.refund_status === 'completed') {
      return NextResponse.json({
        success: false,
        error: 'İadesi tamamlanan kayıtlar tekrar aktifleştirilemez. Katılımcının yeniden kayıt yapması gerekir.'
      }, { status: 400 })
    }

    // Eğer payment_status güncellenmek isteniyorsa
    if (payment_status !== undefined) {
      // Dekont bilgileri ile birlikte güncelle
      const updateFields = ['payment_status = ?']
      const updateValues = [payment_status]
      
      if (payment_receipt_url !== undefined) {
        updateFields.push('payment_receipt_url = ?')
        updateValues.push(payment_receipt_url)
      }
      if (payment_receipt_filename !== undefined) {
        updateFields.push('payment_receipt_filename = ?')
        updateValues.push(payment_receipt_filename)
      }
      if (payment_receipt_uploaded_at !== undefined) {
        updateFields.push('payment_receipt_uploaded_at = ?')
        updateValues.push(payment_receipt_uploaded_at)
      }
      if (payment_confirmed_at !== undefined) {
        updateFields.push('payment_confirmed_at = ?')
        updateValues.push(payment_confirmed_at)
      }
      if (payment_confirmed_by !== undefined) {
        updateFields.push('payment_confirmed_by = ?')
        updateValues.push(payment_confirmed_by)
      }
      if (payment_notes !== undefined) {
        updateFields.push('payment_notes = ?')
        updateValues.push(payment_notes)
      }
      
      updateValues.push(id)
      
      const newValues = { 
        ...oldValues, 
        payment_status, 
        payment_receipt_url, 
        payment_receipt_filename, 
        payment_confirmed_at,
        payment_notes
      }
      const changedFields = compareObjects(oldValues, newValues)

      await pool.execute(
        `UPDATE registrations SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      )

      // Create audit log for payment status change
      await createAuditLog({
        userId,
        tableName: 'registrations',
        recordId: id,
        action: 'UPDATE',
        oldValues,
        newValues,
        changedFields,
        ipAddress,
        userAgent
      })

      return NextResponse.json({ 
        success: true, 
        message: payment_status === 'completed' ? 'Tahsilat durumu "Tahsil Edildi" olarak güncellendi' : 'Tahsilat durumu "Beklemede" olarak güncellendi'
      }, { status: 200 })
    }

    // Tüm kayıt bilgileri güncellemesi
    const newValues = {
      ...oldValues,
      first_name, last_name, full_name, email, phone, 
      address, company, invoice_type, invoice_full_name,
      id_number, invoice_address, invoice_company_name,
      tax_office, tax_number, registration_type, registration_type_label_en, fee
    }

    const changedFields = compareObjects(oldValues, newValues)

    await pool.execute(
      `UPDATE registrations SET 
        first_name = ?, last_name = ?, full_name = ?, email = ?, phone = ?, 
        address = ?, company = ?, invoice_type = ?, invoice_full_name = ?, 
        id_number = ?, invoice_address = ?, invoice_company_name = ?, 
        tax_office = ?, tax_number = ?, registration_type = ?, registration_type_label_en = ?, fee = ?
       WHERE id = ?`,
      [
        first_name, last_name, full_name, email, phone, 
        address, company, invoice_type, invoice_full_name,
        id_number, invoice_address, invoice_company_name,
        tax_office, tax_number, registration_type, registration_type_label_en, fee, id
      ]
    )

    // Create audit log for full record update
    await createAuditLog({
      userId,
      tableName: 'registrations',
      recordId: id,
      action: 'UPDATE',
      oldValues,
      newValues,
      changedFields,
      ipAddress,
      userAgent
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error updating registration:', error)
    return NextResponse.json(
      { error: 'Kayıt güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID formatı' },
        { status: 400 }
      )
    }

    let userId = getCurrentUserId(request)
    if (!userId) {
      console.warn('User ID not found in token, using default admin user (ID: 1)')
      // Fallback to admin user ID 1 when cookies don't work properly (e.g., in Vercel)
      userId = 1
    }

    const { ipAddress, userAgent } = extractUserInfoFromRequest(request)

    // Get current record for audit log before deletion
    const [currentRecord] = await pool.execute(
      'SELECT * FROM registrations WHERE id = ?',
      [id]
    )
    const oldValues = (currentRecord as any[])[0]

    if (!oldValues) {
      return NextResponse.json(
        { error: 'Kayıt bulunamadı' },
        { status: 404 }
      )
    }

    await pool.execute('DELETE FROM registrations WHERE id = ?', [id])

    // Create audit log for deletion
    await createAuditLog({
      userId,
      tableName: 'registrations',
      recordId: id,
      action: 'DELETE',
      oldValues,
      newValues: null,
      changedFields: [],
      ipAddress,
      userAgent
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting registration:', error)
    return NextResponse.json(
      { error: 'Kayıt silinirken hata oluştu' },
      { status: 500 }
    )
  }
}