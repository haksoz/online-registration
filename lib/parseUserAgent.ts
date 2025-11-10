import { UAParser } from 'ua-parser-js'

export interface ParsedUserAgent {
  browserName: string
  browserVersion: string
  osName: string
  osVersion: string
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'bot'
  deviceVendor: string
  deviceModel: string
}

/**
 * User Agent string'ini parse eder ve detaylı bilgi çıkarır
 */
export function parseUserAgent(userAgent: string): ParsedUserAgent {
  if (!userAgent) {
    return getDefaultParsedUA()
  }
  
  try {
    const parser = new UAParser(userAgent)
    const result = parser.getResult()
    
    return {
      browserName: result.browser.name || 'Unknown',
      browserVersion: result.browser.version || '',
      osName: result.os.name || 'Unknown',
      osVersion: result.os.version || '',
      deviceType: getDeviceType(result, userAgent),
      deviceVendor: result.device.vendor || '',
      deviceModel: result.device.model || ''
    }
  } catch (error) {
    console.error('Error parsing user agent:', error)
    return getDefaultParsedUA()
  }
}

/**
 * Cihaz tipini belirler
 */
function getDeviceType(result: any, userAgent: string): 'desktop' | 'mobile' | 'tablet' | 'bot' {
  // Bot detection
  if (isBot(userAgent)) {
    return 'bot'
  }
  
  // Device type from parser
  if (result.device.type === 'mobile') return 'mobile'
  if (result.device.type === 'tablet') return 'tablet'
  
  // Desktop fallback
  return 'desktop'
}

/**
 * Bot olup olmadığını kontrol eder
 */
function isBot(userAgent: string): boolean {
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /crawling/i,
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /duckduckbot/i,
    /baiduspider/i,
    /yandexbot/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /rogerbot/i,
    /linkedinbot/i,
    /embedly/i,
    /quora link preview/i,
    /showyoubot/i,
    /outbrain/i,
    /pinterest/i,
    /developers\.google\.com\/\+\/web\/snippet/i,
    /slackbot/i,
    /vkshare/i,
    /w3c_validator/i,
    /redditbot/i,
    /applebot/i,
    /whatsapp/i,
    /flipboard/i,
    /tumblr/i,
    /bitlybot/i,
    /skypeuripreview/i,
    /nuzzel/i,
    /discordbot/i,
    /qwantify/i,
    /pinterestbot/i,
    /bitrix link preview/i,
    /xing-contenttabreceiver/i,
    /chrome-lighthouse/i,
    /telegrambot/i
  ]
  
  return botPatterns.some(pattern => pattern.test(userAgent))
}

/**
 * Default parsed UA değerleri
 */
function getDefaultParsedUA(): ParsedUserAgent {
  return {
    browserName: 'Unknown',
    browserVersion: '',
    osName: 'Unknown',
    osVersion: '',
    deviceType: 'desktop',
    deviceVendor: '',
    deviceModel: ''
  }
}

/**
 * User Agent bilgilerini formatlar (admin panel için)
 */
export function formatUserAgent(parsed: ParsedUserAgent): string {
  const parts = []
  
  if (parsed.browserName !== 'Unknown') {
    parts.push(`${parsed.browserName} ${parsed.browserVersion}`.trim())
  }
  
  if (parsed.osName !== 'Unknown') {
    parts.push(`${parsed.osName} ${parsed.osVersion}`.trim())
  }
  
  if (parsed.deviceType !== 'desktop') {
    parts.push(parsed.deviceType.charAt(0).toUpperCase() + parsed.deviceType.slice(1))
  }
  
  return parts.join(' • ') || 'Unknown'
}
