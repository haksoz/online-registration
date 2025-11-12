/**
 * Sayfa ayarları ve başlık yönetimi
 * Veriler veritabanından dinamik olarak çekilir
 */

export interface PageSettings {
  form_title: string
  form_title_en: string
  form_subtitle: string
  form_subtitle_en: string
  form_general_warning: string
  form_general_warning_en: string
  banner_image_url?: string
  header_title_font_size: string
  header_subtitle_font_size: string
  header_background_color: string
  currency_type: string
  organization_name: string
  organization_name_en: string
  page_title?: string
  contact_email: string
  contact_phone: string
  homepage_url: string
}

// Varsayılan değerler (API başarısız olursa kullanılır)
const DEFAULT_PAGE_SETTINGS: PageSettings = {
  form_title: 'Hoş Geldiniz! 👋',
  form_title_en: 'Welcome! 👋',
  form_subtitle: 'Kayıt formunu doldurmak için aşağıdaki adımları takip edin.',
  form_subtitle_en: 'Follow the steps below to complete the registration form.',
  form_general_warning: '* ile işaretli tüm alanları eksiksiz doldurun.',
  form_general_warning_en: 'Please fill in all fields marked with *.',
  banner_image_url: '',
  header_title_font_size: '48',
  header_subtitle_font_size: '24',
  header_background_color: '#667eea',
  currency_type: 'TRY',
  organization_name: 'Online Kayıt Sistemi',
  organization_name_en: 'Online Registration System',
  page_title: '',
  contact_email: 'info@example.com',
  contact_phone: '+90 (212) 123 45 67',
  homepage_url: 'https://example.com'
}

// Cache için
let cachedPageSettings: PageSettings | null = null
let lastFetch = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 dakika

// API'den sayfa ayarlarını çek
export async function fetchPageSettings(): Promise<PageSettings> {
  const now = Date.now()
  
  // Cache kontrolü
  if (cachedPageSettings && (now - lastFetch) < CACHE_DURATION) {
    return cachedPageSettings
  }
  
  try {
    const response = await fetch('/api/admin/page-settings')
    const data = await response.json()
    
    if (data.success) {
      const settings: PageSettings = {
        form_title: data.data.form_title || DEFAULT_PAGE_SETTINGS.form_title,
        form_title_en: data.data.form_title_en || DEFAULT_PAGE_SETTINGS.form_title_en,
        form_subtitle: data.data.form_subtitle || DEFAULT_PAGE_SETTINGS.form_subtitle,
        form_subtitle_en: data.data.form_subtitle_en || DEFAULT_PAGE_SETTINGS.form_subtitle_en,
        form_general_warning: data.data.form_general_warning || DEFAULT_PAGE_SETTINGS.form_general_warning,
        form_general_warning_en: data.data.form_general_warning_en || DEFAULT_PAGE_SETTINGS.form_general_warning_en,
        banner_image_url: data.data.banner_image_url || DEFAULT_PAGE_SETTINGS.banner_image_url,
        header_title_font_size: data.data.header_title_font_size || DEFAULT_PAGE_SETTINGS.header_title_font_size,
        header_subtitle_font_size: data.data.header_subtitle_font_size || DEFAULT_PAGE_SETTINGS.header_subtitle_font_size,
        header_background_color: data.data.header_background_color || DEFAULT_PAGE_SETTINGS.header_background_color,
        currency_type: data.data.currency_type || DEFAULT_PAGE_SETTINGS.currency_type,
        organization_name: data.data.organization_name || DEFAULT_PAGE_SETTINGS.organization_name,
        organization_name_en: data.data.organization_name_en || DEFAULT_PAGE_SETTINGS.organization_name_en,
        page_title: data.data.page_title || DEFAULT_PAGE_SETTINGS.page_title,
        contact_email: data.data.contact_email || DEFAULT_PAGE_SETTINGS.contact_email,
        contact_phone: data.data.contact_phone || DEFAULT_PAGE_SETTINGS.contact_phone,
        homepage_url: data.data.homepage_url || DEFAULT_PAGE_SETTINGS.homepage_url
      }
      
      cachedPageSettings = settings
      lastFetch = now
      return settings
    }
  } catch (error) {
    console.error('Page settings fetch error:', error)
  }
  
  // Hata durumunda varsayılan değerleri döndür
  return DEFAULT_PAGE_SETTINGS
}

// Cache'i temizle
export function clearPageSettingsCache() {
  cachedPageSettings = null
  lastFetch = 0
}

// Sync versiyonlar (varsayılan değerlerle)
export const getPageSettingsSync = () => {
  return DEFAULT_PAGE_SETTINGS
}