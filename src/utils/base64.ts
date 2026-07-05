/**
 * Base64 sûr pour l'UTF-8 : btoa/atob natifs ne supportent que Latin-1 et
 * plantent sur les emoji, « œ », etc. On encode donc les octets UTF-8.
 */
export function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

export function base64ToUtf8(encoded: string): string {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  // fatal: une séquence UTF-8 invalide lève une exception au lieu d'insérer U+FFFD
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

/**
 * Décode un code de partage : nouveaux codes (UTF-8) comme anciens codes
 * (Latin-1 produits par les versions précédentes de l'app).
 */
export function decodeShareCode(encoded: string): string {
  try {
    return base64ToUtf8(encoded);
  } catch {
    // Ancien code Latin-1 : ses accents forment des séquences UTF-8 invalides.
    return atob(encoded);
  }
}
