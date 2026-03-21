const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Codifica UUID em base62 (mais compacto que base64)
 * UUID: 36 caracteres -> Base62: ~22 caracteres
 * 
 * @param uuid - UUID no formato padrão com hífens (ex: "550e8400-e29b-41d4-a716-446655440000")
 * @returns String codificada em base62, URL-safe
 * @throws Error se o UUID for inválido
 */
export function encodeBase62(uuid: string): string {
  // Remove hífens do UUID
  const hex = uuid.replace(/-/g, '');
  
  // Valida formato hex (32 caracteres hexadecimais)
  if (!/^[0-9a-fA-F]{32}$/.test(hex)) {
    throw new Error('Invalid UUID format');
  }
  
  // Converte hex para BigInt
  let num = BigInt('0x' + hex);
  
  if (num === 0n) return '0';
  
  let result = '';
  while (num > 0n) {
    result = BASE62_CHARS[Number(num % 62n)] + result;
    num = num / 62n;
  }
  
  return result;
}

/**
 * Decodifica base62 de volta para UUID
 * 
 * @param encoded - String codificada em base62
 * @returns UUID no formato padrão com hífens
 * @throws Error se a string contiver caracteres inválidos
 */
export function decodeBase62(encoded: string): string {
  let num = 0n;
  
  for (const char of encoded) {
    const index = BASE62_CHARS.indexOf(char);
    if (index === -1) {
      throw new Error('Invalid base62 character');
    }
    num = num * 62n + BigInt(index);
  }
  
  // Converte de volta para hex
  let hex = num.toString(16).padStart(32, '0');
  
  // Adiciona hífens no formato UUID
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
