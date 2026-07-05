import { describe, it, expect } from 'vitest';
import { parseItemEntry } from '../src/utils/quantity';

describe('parseItemEntry', () => {
  it('sans quantité : tout le texte devient le nom', () => {
    expect(parseItemEntry('bananes')).toEqual({ name: 'bananes', quantity: '' });
    expect(parseItemEntry('  papier   toilette ')).toEqual({
      name: 'papier toilette',
      quantity: '',
    });
  });

  it('« 3 bananes » → quantité 3', () => {
    expect(parseItemEntry('3 bananes')).toEqual({ name: 'bananes', quantity: '3' });
  });

  it('« 2kg de pommes » → quantité 2 kg', () => {
    expect(parseItemEntry('2kg de pommes')).toEqual({ name: 'pommes', quantity: '2 kg' });
  });

  it('« 1,5 l de lait » → quantité 1,5 l', () => {
    expect(parseItemEntry('1,5 l de lait')).toEqual({ name: 'lait', quantity: '1,5 l' });
  });

  it("« 6 œufs » et « d'eau » : gère l'apostrophe et les accents", () => {
    expect(parseItemEntry('6 œufs')).toEqual({ name: 'œufs', quantity: '6' });
    expect(parseItemEntry("2 l d'eau")).toEqual({ name: 'eau', quantity: '2 l' });
  });

  it('« bananes x3 » et « lait ×2 » → suffixe multiplicateur', () => {
    expect(parseItemEntry('bananes x3')).toEqual({ name: 'bananes', quantity: '3' });
    expect(parseItemEntry('lait ×2')).toEqual({ name: 'lait', quantity: '2' });
  });

  it('« 2x lait » → quantité 2', () => {
    expect(parseItemEntry('2x lait')).toEqual({ name: 'lait', quantity: '2' });
  });

  it('ne casse pas les noms contenant un nombre non quantitatif', () => {
    // nombre collé au nom : pas une quantité
    expect(parseItemEntry('coca 33cl')).toEqual({ name: 'coca 33cl', quantity: '' });
    // nom trop court après le nombre : on ne parse pas
    expect(parseItemEntry('4x4')).toEqual({ name: '4x4', quantity: '' });
    // nom court sans unité : produit dont le nombre fait partie du nom
    expect(parseItemEntry('7 up')).toEqual({ name: '7 up', quantity: '' });
  });
});
