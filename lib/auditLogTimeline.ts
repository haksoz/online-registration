/**
 * Audit log satırından okunabilir "Olay" metni üretir (Olay Geçmişi sayfası için).
 */

export interface AuditLogForEvent {
  table_name: string
  action: string
  old_values: string | Record<string, unknown> | null
  new_values: string | Record<string, unknown> | null
  changed_fields?: string
  selection_category_name?: string | null
  selection_type_label?: string | null
}

function parseJson(val: string | Record<string, unknown> | null): Record<string, unknown> | null {
  if (val == null) return null
  if (typeof val === 'object') return val
  try {
    return JSON.parse(val) as Record<string, unknown>
  } catch {
    return null
  }
}

function selectionLabel(log: AuditLogForEvent): string {
  const parts = [log.selection_category_name, log.selection_type_label].filter(Boolean)
  return parts.length ? parts.join(' – ') : 'Kayıt seçimi'
}

/**
 * Tek bir audit log satırı için Türkçe olay açıklaması döner.
 */
export function getEventDescription(log: AuditLogForEvent): string {
  const table = log.table_name
  const action = log.action
  const oldV = parseJson(log.old_values)
  const newV = parseJson(log.new_values)
  const changed = (log.changed_fields || '').split(',').map((f) => f.trim()).filter(Boolean)

  // --- registrations ---
  if (table === 'registrations') {
    if (action === 'UPDATE' && oldV && newV) {
      const paymentStatusOld = oldV.payment_status as string | undefined
      const paymentStatusNew = newV.payment_status as string | undefined
      if (
        changed.includes('payment_status') &&
        paymentStatusOld === 'pending' &&
        paymentStatusNew === 'completed'
      ) {
        return 'Ödeme onaylandı. Kayıt tamamlandı.'
      }
      if (changed.includes('payment_status') && paymentStatusNew === 'cancelled') {
        return 'Kayıt iptal edildi.'
      }
      if (changed.includes('payment_notes') || changed.includes('payment_receipt_filename')) {
        return 'Kayıt güncellendi (ödeme notu veya dekont bilgisi).'
      }
      if (changed.includes('payment_status') || changed.includes('payment_confirmed_at')) {
        return 'Kayıt güncellendi (ödeme durumu veya onay tarihi).'
      }
      return 'Kayıt güncellendi.'
    }
    if (action === 'CREATE') return 'Kayıt oluşturuldu.'
    if (action === 'DELETE') return 'Kayıt silindi.'
    return 'Kayıt işlemi.'
  }

  // --- registration_selections ---
  if (table === 'registration_selections') {
    const label = selectionLabel(log)
    if (action === 'UPDATE' && oldV && newV) {
      const isCancelledOld = oldV.is_cancelled
      const isCancelledNew = newV.is_cancelled
      const refundOld = (oldV.refund_status as string) || 'none'
      const refundNew = (newV.refund_status as string) || 'none'

      // İptal + iade talebi (cancel)
      if (
        (isCancelledNew === true && isCancelledOld !== true) ||
        (refundNew === 'pending' && refundOld === 'none' && isCancelledNew === true)
      ) {
        return `${label} seçimi iptal edildi. İade talebi oluşturuldu.`
      }
      // İade onaylandı ve tamamlandı
      if (refundNew === 'completed' && (refundOld === 'pending' || refundOld === 'approved')) {
        return `${label} için iade onaylandı ve tamamlandı.`
      }
      // İade reddedildi
      if (refundNew === 'rejected') {
        return `${label} için iade talebi reddedildi.`
      }
      // İptal geri alındı (undo cancel) — DB'de is_cancelled bazen 0/1 gelir
      if (!isCancelledNew && isCancelledOld) {
        return `${label} iptali geri alındı.`
      }
      // Red geri alındı (undo reject) -> tekrar pending
      if (refundNew === 'pending' && refundOld === 'rejected') {
        return `${label} için iade reddi geri alındı; talep tekrar beklemeye alındı.`
      }
      return `${label} güncellendi.`
    }
    if (action === 'CREATE') return `${label} eklendi.`
    if (action === 'DELETE') return `${label} silindi.`
    return `${label} işlemi.`
  }

  return 'Sistem güncellemesi.'
}
