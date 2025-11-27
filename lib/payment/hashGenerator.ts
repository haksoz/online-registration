import CryptoJS from 'crypto-js';

/**
 * SHA1 hash oluşturur ve Base64 encode eder
 * Denizbank ve çoğu Türk bankası bu yöntemi kullanır
 */
export function generateSHA1Base64Hash(data: string): string {
  const hash = CryptoJS.SHA1(data);
  return CryptoJS.enc.Base64.stringify(hash);
}

/**
 * SHA256 hash oluşturur (bazı bankalar için)
 */
export function generateSHA256Hash(data: string): string {
  return CryptoJS.SHA256(data).toString();
}

/**
 * SHA512 hash oluşturur ve Base64 encode eder (Garanti için)
 */
export function generateSHA512Base64Hash(data: string): string {
  const hash = CryptoJS.SHA512(data);
  return CryptoJS.enc.Base64.stringify(hash);
}

/**
 * HMAC-SHA256 hash oluşturur
 */
export function generateHMACSHA256(data: string, key: string): string {
  return CryptoJS.HmacSHA256(data, key).toString();
}

/**
 * Basit şifreleme (merchant pass için)
 */
export function encrypt(text: string, secretKey: string): string {
  return CryptoJS.AES.encrypt(text, secretKey).toString();
}

/**
 * Basit şifre çözme
 */
export function decrypt(encryptedText: string, secretKey: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}
