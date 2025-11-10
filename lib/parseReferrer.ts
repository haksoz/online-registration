import { NextRequest } from 'next/server'

export interface ReferrerInfo {
  referrer: string
  referrerDomain: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
}

/**
 * Referrer bilgilerini ve UTM parametrelerini parse eder
 */
export function parseReferrer(request: NextRequest): ReferrerInfo {
  // Referer header'ını al (HTTP spec'te 'referer' yanlış yazılmış)
  const referer = request.headers.get('referer') || request.headers.get('referrer')
  
  // URL'den UTM parametrelerini al
  const url = new URL(request.url)
  
  let referrerDomain = null
  if (referer && referer !== 'direct') {
    try {
      const refUrl = new URL(referer)
      referrerDomain = refUrl.hostname
    } catch (e) {
      // Invalid URL, ignore
    }
  }
  
  return {
    referrer: referer || 'direct',
    referrerDomain,
    utmSource: url.searchParams.get('utm_source'),
    utmMedium: url.searchParams.get('utm_medium'),
    utmCampaign: url.searchParams.get('utm_campaign')
  }
}

/**
 * Referrer tipini belirler (internal, external, direct, social, search)
 */
export function getReferrerType(referrer: string, referrerDomain: string | null, currentDomain: string): string {
  if (!referrer || referrer === 'direct') {
    return 'direct'
  }
  
  if (!referrerDomain) {
    return 'unknown'
  }
  
  // Internal referrer
  if (referrerDomain === currentDomain || referrerDomain.endsWith(`.${currentDomain}`)) {
    return 'internal'
  }
  
  // Social media
  const socialDomains = [
    'facebook.com', 'fb.com', 'instagram.com',
    'twitter.com', 'x.com', 't.co',
    'linkedin.com', 'lnkd.in',
    'youtube.com', 'youtu.be',
    'tiktok.com',
    'pinterest.com', 'pin.it',
    'reddit.com', 'redd.it',
    'whatsapp.com', 'wa.me',
    'telegram.org', 't.me'
  ]
  
  if (socialDomains.some(domain => referrerDomain.includes(domain))) {
    return 'social'
  }
  
  // Search engines
  const searchDomains = [
    'google.com', 'google.',
    'bing.com',
    'yahoo.com',
    'yandex.com', 'yandex.',
    'baidu.com',
    'duckduckgo.com',
    'ecosia.org',
    'ask.com'
  ]
  
  if (searchDomains.some(domain => referrerDomain.includes(domain))) {
    return 'search'
  }
  
  // External
  return 'external'
}

/**
 * Referrer bilgilerini formatlar (admin panel için)
 */
export function formatReferrer(info: ReferrerInfo): string {
  if (info.referrer === 'direct') {
    return 'Direct Traffic'
  }
  
  if (info.utmSource) {
    const parts = [info.utmSource]
    if (info.utmMedium) parts.push(info.utmMedium)
    if (info.utmCampaign) parts.push(info.utmCampaign)
    return `Campaign: ${parts.join(' / ')}`
  }
  
  if (info.referrerDomain) {
    return info.referrerDomain
  }
  
  return 'Unknown'
}
