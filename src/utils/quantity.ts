export interface ParsedEntry {
  name: string;
  quantity: string;
}

/**
 * Extrait une quantité d'une saisie du type « 3 bananes », « 2kg de pommes »,
 * « bananes x3 » ou « 6x œufs ». Renvoie le nom nettoyé et la quantité.
 * Sans quantité détectée, le texte complet devient le nom.
 */
export function parseItemEntry(raw: string): ParsedEntry {
  const text = raw.trim().replace(/\s+/g, ' ');

  // « 3 bananes », « 2kg pommes », « 1,5 kg de farine », « 2x lait »
  let m = text.match(/^(\d+(?:[.,]\d+)?)\s*(kg|g|l|cl|ml|x)?\s+(?:de\s+|d')?(.+)$/i);
  if (m && m[3].length > 1) {
    const unit = m[2] ? m[2].toLowerCase().replace(/^x$/, '') : '';
    return { name: m[3].trim(), quantity: `${m[1]}${unit ? ' ' + unit : ''}`.trim() };
  }

  // « bananes x3 », « lait ×2 »
  m = text.match(/^(.+?)\s*[x×]\s*(\d+)$/i);
  if (m && m[1].length > 1) {
    return { name: m[1].trim(), quantity: m[2] };
  }

  return { name: text, quantity: '' };
}
