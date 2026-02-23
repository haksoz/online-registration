/**
 * Audit log için tablo ve alan adlarının okunabilir karşılıkları.
 * Yeni tablo/alan eklendiğinde buraya ekleyin.
 */

export const AUDIT_TABLE_LABELS: Record<string, string> = {
  registrations: 'Kayıt',
  registration_selections: 'Kayıt seçimi',
}

export const AUDIT_FIELD_LABELS: Record<string, string> = {
  // registrations
  payment_status: 'Ödeme durumu',
  payment_confirmed_at: 'Ödeme onay tarihi',
  payment_notes: 'Ödeme notu',
  payment_receipt_filename: 'Dekont dosya adı',
  payment_receipt_url: 'Dekont URL',
  payment_receipt_uploaded_at: 'Dekont yükleme tarihi',
  status: 'Durum',
  // registration_selections
  is_cancelled: 'İptal durumu',
  cancelled_at: 'İptal tarihi',
  cancelled_by: 'İptal eden',
  cancel_reason: 'İptal nedeni',
  refund_status: 'İade durumu',
  refund_amount: 'İade tutarı',
  refund_requested_at: 'İade talep tarihi',
  refund_approved_at: 'İade onay tarihi',
  refund_approved_by: 'İade onaylayan',
  refund_completed_at: 'İade tamamlanma tarihi',
  refund_notes: 'İade notu',
  refund_method: 'İade yöntemi',
  registration_id: 'Kayıt ID',
  registration_type_id: 'Kayıt türü ID',
}

/** Bazı alanların olası değerlerinin okunabilir karşılıkları */
export const AUDIT_VALUE_LABELS: Record<string, Record<string, string>> = {
  payment_status: {
    pending: 'Beklemede',
    completed: 'Tamamlandı',
    cancelled: 'İptal edildi',
    refunded: 'İade yapıldı',
  },
  refund_status: {
    none: 'Yok',
    pending: 'Beklemede',
    approved: 'Onaylandı',
    rejected: 'Reddedildi',
    completed: 'Tamamlandı',
  },
  is_cancelled: {
    true: 'İptal edildi',
    false: 'Aktif',
  },
  status: {
    '1': 'Aktif',
    '0': 'İptal',
    '-1': 'Silindi',
  },
}

export function getAuditTableLabel(tableName: string): string {
  return AUDIT_TABLE_LABELS[tableName] ?? tableName
}

export function getAuditFieldLabel(fieldName: string): string {
  return AUDIT_FIELD_LABELS[fieldName] ?? fieldName
}

/** Değeri mümkünse anlamlı etiketle göster */
export function formatAuditValue(fieldName: string, value: unknown): string {
  if (value === null || value === undefined) return '—'
  const str = String(value)
  const valueMap = AUDIT_VALUE_LABELS[fieldName]
  if (valueMap && valueMap[str] !== undefined) return valueMap[str]
  if (fieldName.endsWith('_at') || fieldName.endsWith('_date') || str.match(/^\d{4}-\d{2}-\d{2}/)) {
    try {
      const d = new Date(str)
      if (!isNaN(d.getTime())) return d.toLocaleString('tr-TR')
    } catch (_) {}
  }
  return str
}

/** Virgülle ayrılmış alan listesini etiketli metne çevir */
export function formatChangedFieldsList(changedFieldsStr: string): string {
  if (!changedFieldsStr?.trim()) return '—'
  return changedFieldsStr
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean)
    .map(getAuditFieldLabel)
    .join(', ')
}
