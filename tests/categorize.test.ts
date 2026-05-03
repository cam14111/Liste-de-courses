import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  tokenize,
  getWordVariants,
  matchesWord,
  getCategory,
  getCategoryKeyById,
} from '../src/categorize';
import { DEFAULT_CATEGORIES } from '../src/constants';

describe('normalizeText', () => {
  it('lowercases and removes accents', () => {
    expect(normalizeText('Pomme')).toBe('pomme');
    expect(normalizeText('Pâtes')).toBe('pates');
    expect(normalizeText('  ÉCOLE  ')).toBe('ecole');
  });
});

describe('tokenize', () => {
  it('splits on punctuation and whitespace', () => {
    expect(tokenize('pain au chocolat')).toEqual(['pain', 'au', 'chocolat']);
    expect(tokenize('clé à molette')).toEqual(['cle', 'a', 'molette']);
  });

  it('drops empty tokens', () => {
    expect(tokenize('  multiple   spaces  ')).toEqual(['multiple', 'spaces']);
  });
});

describe('getWordVariants', () => {
  it('produces singular from plural', () => {
    expect(getWordVariants('pommes')).toContain('pomme');
  });

  it('produces plural from singular', () => {
    expect(getWordVariants('pomme')).toContain('pommes');
  });

  it('handles -au -> -aux', () => {
    expect(getWordVariants('gateau')).toContain('gateaux');
  });

  it('does not strip s on short words', () => {
    expect(getWordVariants('jus')).not.toContain('ju');
  });
});

describe('matchesWord', () => {
  it('matches single keywords', () => {
    expect(matchesWord(tokenize('pomme rouge'), 'pomme')).toBe(true);
  });

  it('matches plural / singular variants', () => {
    expect(matchesWord(tokenize('pommes'), 'pomme')).toBe(true);
    expect(matchesWord(tokenize('pomme'), 'pommes')).toBe(true);
  });

  it('matches multi-word keywords consecutively', () => {
    expect(matchesWord(tokenize('pain au chocolat'), 'pain au chocolat')).toBe(true);
    expect(matchesWord(tokenize('un pain au chocolat'), 'pain au chocolat')).toBe(true);
  });

  it('does not match partial multi-word keywords', () => {
    expect(matchesWord(tokenize('pain au chocolat'), 'pain de mie')).toBe(false);
  });
});

describe('getCategory', () => {
  it('returns "autre" for unknown items', () => {
    expect(getCategory('xyzzz', DEFAULT_CATEGORIES)).toBe('default_autre');
  });

  it('classifies fruits correctly', () => {
    expect(getCategory('pommes', DEFAULT_CATEGORIES)).toBe('default_fruits');
    expect(getCategory('Banane', DEFAULT_CATEGORIES)).toBe('default_fruits');
  });

  it('classifies bricolage and not boissons for "marteau"', () => {
    expect(getCategory('marteau', DEFAULT_CATEGORIES)).toBe('default_bricolage');
  });

  it('classifies boulangerie for unambiguous bakery items', () => {
    expect(getCategory('croissant', DEFAULT_CATEGORIES)).toBe('default_boulangerie');
    expect(getCategory('baguette', DEFAULT_CATEGORIES)).toBe('default_boulangerie');
  });

  it('classifies "eau" alone as boissons', () => {
    expect(getCategory('eau', DEFAULT_CATEGORIES)).toBe('default_boissons');
  });

  it('respects priority: bricolage (2) wins over boissons (1) when both match', () => {
    expect(getCategory('marteau', DEFAULT_CATEGORIES)).toBe('default_bricolage');
  });

  it('handles accented input', () => {
    expect(getCategory('PÊCHE', DEFAULT_CATEGORIES)).toBe('default_fruits');
  });
});

describe('getCategoryKeyById', () => {
  it('returns the key for a given id', () => {
    expect(getCategoryKeyById('default_fruits', DEFAULT_CATEGORIES)).toBe('fruits');
  });

  it('falls back to "autre" for unknown ids', () => {
    expect(getCategoryKeyById('default_unknown', DEFAULT_CATEGORIES)).toBe('autre');
  });

  it('treats raw category names as keys (legacy)', () => {
    expect(getCategoryKeyById('fruits', DEFAULT_CATEGORIES)).toBe('fruits');
  });
});
