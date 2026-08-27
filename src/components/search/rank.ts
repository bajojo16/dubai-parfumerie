/**
 * Classement de la recherche.
 *
 * Un début de mot vaut mieux qu'une occurrence au milieu ; le nom vaut mieux
 * que la maison, qui vaut mieux que la note.
 *
 * La requête est aussi essayée mot à mot : « crush ruby » ne trouvait rien alors
 * que les deux mots sont bien dans « Ruby Crush ». On ne compare plus seulement
 * la chaîne entière, mais chacun de ses mots — et il faut qu'ils soient **tous**
 * présents, sinon « rose oud » ramènerait toutes les roses.
 */

import {
  SEARCH_BRANDS,
  SEARCH_NOTES,
  SEARCH_PRODUCTS,
  norm,
  type SearchBrand,
  type SearchNote,
  type SearchProduct,
} from "@/data/search-catalog";

export const MAX_PRODUCTS = 8;
export const MAX_BRANDS = 4;
export const MAX_NOTES = 8;

function scoreSimple(key: string, q: string): number {
  const i = key.indexOf(q);
  if (i < 0) return 0;
  if (i === 0) return 3;
  return /[\s'-]/.test(key[i - 1]) ? 2 : 1;
}

export function score(key: string, q: string): number {
  const direct = scoreSimple(key, q);
  if (direct) return direct;

  const words = q.split(/\s+/).filter((w) => w.length > 1);
  if (words.length < 2) return 0;

  let total = 0;
  for (const w of words) {
    const s = scoreSimple(key, w);
    if (!s) return 0; // un mot absent : ce n'est pas la bonne référence
    total += s;
  }
  // moyenne, minorée d'un cran : l'ordre exact reste préférable
  return Math.max(1, Math.round(total / words.length) - 1);
}

export interface SearchResults {
  products: SearchProduct[];
  brands: SearchBrand[];
  notes: SearchNote[];
  /** vrai quand rien ne répond — l'appelant affiche l'écran « aucun résultat » */
  empty: boolean;
}

export function search(query: string): SearchResults {
  const q = norm(query);
  if (!q) return { products: [], brands: [], notes: [], empty: true };

  const products = SEARCH_PRODUCTS.map((p) => {
    const s = score(p.keyName, q) * 6 + score(p.keyBrand, q) * 3 + score(p.keyNotes, q) * 2;
    return { p, s: s || (p.keyAll.includes(q) ? 1 : 0) };
  })
    .filter((r) => r.s > 0)
    .sort(
      (a, b) =>
        b.s - a.s ||
        Number(b.p.available) - Number(a.p.available) ||
        b.p.popularity - a.p.popularity ||
        a.p.name.localeCompare(b.p.name, "fr"),
    )
    .slice(0, MAX_PRODUCTS)
    .map((r) => r.p);

  const brands = SEARCH_BRANDS.map((b) => ({ b, s: score(b.keyAll, q) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || b.b.count - a.b.count)
    .slice(0, MAX_BRANDS)
    .map((r) => r.b);

  const notes = SEARCH_NOTES.filter((n) => n.key.includes(q))
    .sort((a, b) => score(b.key, q) - score(a.key, q) || b.count - a.count)
    .slice(0, MAX_NOTES);

  return {
    products,
    brands,
    notes,
    empty: !products.length && !brands.length && !notes.length,
  };
}

/**
 * Références mises en avant sur l'écran d'accueil de la recherche, dans cet ordre.
 * Clé = `norm(marque) + "|" + norm(nom)` — voir l'identité de déduplication du
 * catalogue. En production ces vitrines viendraient du back-office ; ici la liste
 * est explicite parce que « les mieux notées » ne donnait pas les flacons que la
 * boutique veut montrer en premier.
 */
const FEATURED = ["reef|reef 33", "lattafa|yara", "lattafa|khamrah"];

/**
 * Références écartées de l'écran d'accueil — elles restent trouvables par une
 * recherche, elles ne sont simplement pas mises en vitrine.
 */
const NOT_FEATURED = ["armaf|club de nuit"];

/** Écran d'accueil : les vitrines d'abord, puis les références les mieux notées. */
export function suggestions(limit = 10): SearchProduct[] {
  const shown = SEARCH_PRODUCTS.filter(
    (p) => p.image && p.available && !NOT_FEATURED.includes(`${p.keyBrand}|${p.keyName}`),
  );
  const rank = (p: SearchProduct) => FEATURED.indexOf(`${p.keyBrand}|${p.keyName}`);

  return shown
    .slice()
    .sort((a, b) => {
      const ra = rank(a);
      const rb = rank(b);
      // une vitrine passe devant tout le reste, et elles gardent leur ordre déclaré
      if (ra !== rb) return (ra < 0 ? Infinity : ra) - (rb < 0 ? Infinity : rb);
      return b.popularity - a.popularity || b.notes.length - a.notes.length;
    })
    .slice(0, limit);
}
