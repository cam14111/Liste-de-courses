import type { Category, CategoryMatch } from './types';

export function normalizeText(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

export function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/[\s\-''_,;:.!?()[\]{}]+/)
    .filter((token) => token.length > 0);
}

export function getWordVariants(word: string): string[] {
  const variants = [word];

  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) {
    variants.push(word.slice(0, -1));
  }
  if (word.length > 3 && word.endsWith('x')) {
    variants.push(word.slice(0, -1));
  }
  if (!word.endsWith('s') && !word.endsWith('x')) {
    variants.push(word + 's');
    if (word.endsWith('au') || word.endsWith('eau')) {
      variants.push(word + 'x');
    }
  }
  return variants;
}

export function matchesWord(itemTokens: string[], keyword: string): boolean {
  const keywordTokens = tokenize(keyword);

  if (keywordTokens.length === 1) {
    const keywordVariants = getWordVariants(keywordTokens[0]);
    for (const itemToken of itemTokens) {
      const itemVariants = getWordVariants(itemToken);
      for (const kv of keywordVariants) {
        if (itemVariants.includes(kv)) return true;
      }
    }
    return false;
  }

  for (let i = 0; i <= itemTokens.length - keywordTokens.length; i++) {
    let match = true;
    for (let j = 0; j < keywordTokens.length; j++) {
      const itemVariants = getWordVariants(itemTokens[i + j]);
      const keywordVariants = getWordVariants(keywordTokens[j]);
      let tokenMatch = false;
      for (const kv of keywordVariants) {
        if (itemVariants.includes(kv)) {
          tokenMatch = true;
          break;
        }
      }
      if (!tokenMatch) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}

export function getCategory(itemName: string, categories: Record<string, Category>): string {
  const itemTokens = tokenize(itemName);
  const matches: CategoryMatch[] = [];

  for (const [category, data] of Object.entries(categories)) {
    if (!data.keywords || data.keywords.length === 0) continue;
    for (const keyword of data.keywords) {
      if (matchesWord(itemTokens, keyword)) {
        matches.push({
          category,
          id: data.id || category,
          priority: data.priority || 0,
          keyword,
        });
        break;
      }
    }
  }

  if (matches.length > 0) {
    matches.sort((a, b) => b.priority - a.priority);
    return matches[0].id;
  }

  return categories['autre']?.id || 'default_autre';
}

export function getCategoryKeyById(
  categoryId: string,
  categories: Record<string, Category>,
): string {
  for (const [key, data] of Object.entries(categories)) {
    if (data.id === categoryId) return key;
  }
  if (categories[categoryId]) return categoryId;
  return 'autre';
}
