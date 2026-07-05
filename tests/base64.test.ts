import { describe, it, expect } from 'vitest';
import { utf8ToBase64, base64ToUtf8, decodeShareCode } from '../src/utils/base64';

describe('base64 UTF-8', () => {
  it('encode/décode un texte ASCII', () => {
    const code = utf8ToBase64('hello');
    expect(base64ToUtf8(code)).toBe('hello');
  });

  it('encode/décode accents, œ et emoji (btoa natif planterait)', () => {
    const text = 'Bœuf haché — chocolat 🍫 à 2,50 €';
    expect(() => btoa(text)).toThrow();
    const code = utf8ToBase64(text);
    expect(base64ToUtf8(code)).toBe(text);
  });

  it('encode/décode un gros payload JSON', () => {
    const payload = JSON.stringify({
      name: 'Courses 🛒',
      items: Array.from({ length: 500 }, (_, i) => ({ name: `Aliment n°${i} éàü` })),
    });
    expect(base64ToUtf8(utf8ToBase64(payload))).toBe(payload);
  });

  it('decodeShareCode lit les nouveaux codes UTF-8', () => {
    const text = JSON.stringify({ name: 'Marché', items: [] });
    expect(decodeShareCode(utf8ToBase64(text))).toBe(text);
  });

  it('decodeShareCode reste compatible avec les anciens codes Latin-1 (btoa)', () => {
    const legacy = JSON.stringify({ name: 'Marché de Noël', items: [{ name: 'pâtes' }] });
    const legacyCode = btoa(legacy); // ancien format, accents en Latin-1
    expect(decodeShareCode(legacyCode)).toBe(legacy);
  });

  it('decodeShareCode ne bascule pas en legacy pour un payload contenant U+FFFD', () => {
    const text = JSON.stringify({ name: 'Liste � corrompue', items: [] });
    expect(decodeShareCode(utf8ToBase64(text))).toBe(text);
  });
});
