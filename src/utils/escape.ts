const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);
}

export function escapeAttr(str: string): string {
  return escapeHtml(str);
}

export function highlight(text: string, term: string): string {
  const escaped = escapeHtml(text);
  if (!term) return escaped;
  const trimmed = term.trim();
  if (!trimmed) return escaped;
  const safeTerm = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escaped.replace(new RegExp(`(${safeTerm})`, 'gi'), '<mark>$1</mark>');
}
