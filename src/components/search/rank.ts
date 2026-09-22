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
 *
 * Enfin, la saisie est supposée fautive. Un catalogue de parfums orientaux
 * translittérés se tape mal : personne ne sait si c'est Oud ou Oudh, Khamrah ou
 * Kamra, Lattafa ou Latafa, et le client tape en plus à côté des touches. La
 * comparaison exacte passe donc d'abord ; si elle ne rend rien, `fuzzy.ts`
 * reprend la main (voir son en-tête pour la mécanique). Une correspondance
 * approchée vaut toujours MOINS qu'une exacte — elle complète le classement,
 * elle ne le bouscule pas.
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
import { fold, foldWords, fuzzyMatch, wordMatches } from "./fuzzy";

export const MAX_PRODUCTS = 8;
export const MAX_BRANDS = 4;
export const MAX_NOTES = 8;
export const MAX_SUGGESTIONS = 6;

/**
 * Score d'une correspondance approchée. Fractionnaire à dessein : les scores
 * exacts sont des entiers (1 à 3), donc tout résultat exact passe devant tout
 * résultat corrigé, quelle que soit la pondération du champ.
 */
const FUZZY_SCORE = 0.4;

/**
 * Index replié, calculé une fois au chargement du module — replier à chaque
 * frappe coûterait un parcours complet du catalogue par caractère tapé.
 *
 * Les trois champs restent séparés : repliés en un seul bloc, une faute sur un
 * nom et une faute sur une note vaudraient pareil, et « yarra » remonterait
 * n'importe quel flacon dont une note se replie sur « yara » avant Yara.
 */
interface FoldedProduct {
  name: string[];
  brand: string[];
  notes: string[];
}

const FOLDED_PRODUCTS: FoldedProduct[] = SEARCH_PRODUCTS.map((p) => ({
  name: foldWords(p.name),
  brand: foldWords(p.brand),
  notes: foldWords(p.notes.join(" ")),
}));
const FOLDED_BRANDS: string[][] = SEARCH_BRANDS.map((b) => foldWords(b.name));
const FOLDED_NOTES: string[][] = SEARCH_NOTES.map((n) => foldWords(n.label));

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
  /**
   * Complétions et corrections proposées au-dessus des résultats. Ce sont des
   * requêtes, pas des destinations : un clic réécrit le champ.
   */
  suggestions: string[];
  /**
   * Vrai quand rien ne répond, correction comprise — l'appelant affiche alors
   * l'écran « aucun résultat », avec les suggestions s'il en reste.
   */
  empty: boolean;
  /**
   * Vrai quand SEULE la tolérance aux fautes a rendu des résultats : la saisie
   * exacte ne donnait rien. L'appelant le dit au client, sinon il croit avoir
   * bien tapé et ne comprend pas pourquoi on lui montre un autre flacon.
   */
  corrected: boolean;
}

export function search(query: string): SearchResults {
  const q = norm(query);
  if (!q) return { products: [], brands: [], notes: [], suggestions: [], empty: true, corrected: false };

  const qWords = foldWords(q);
  const suggestions = querySuggestions(q);

  const rankProducts = (fuzzy: boolean) =>
    SEARCH_PRODUCTS.map((p, i) => {
      if (!fuzzy) {
        const s = score(p.keyName, q) * 6 + score(p.keyBrand, q) * 3 + score(p.keyNotes, q) * 2;
        return { p, s: s || (p.keyAll.includes(q) ? 1 : 0) };
      }
      // mêmes poids de champ que la voie exacte, pour que la correction
      // conserve la hiérarchie nom > maison > note
      const f = FOLDED_PRODUCTS[i];
      const weight =
        (fuzzyMatch(f.name, qWords) ? 6 : 0) +
        (fuzzyMatch(f.brand, qWords) ? 3 : 0) +
        (fuzzyMatch(f.notes, qWords) ? 2 : 0);
      return { p, s: weight * FUZZY_SCORE };
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

  const rankBrands = (fuzzy: boolean) =>
    SEARCH_BRANDS.map((b, i) => ({
      b,
      s: fuzzy ? (fuzzyMatch(FOLDED_BRANDS[i], qWords) ? FUZZY_SCORE : 0) : score(b.keyAll, q),
    }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || b.b.count - a.b.count)
      .slice(0, MAX_BRANDS)
      .map((r) => r.b);

  const rankNotes = (fuzzy: boolean) =>
    (fuzzy
      ? SEARCH_NOTES.filter((_, i) => fuzzyMatch(FOLDED_NOTES[i], qWords))
      : SEARCH_NOTES.filter((n) => n.key.includes(q))
    )
      .slice()
      .sort((a, b) => score(b.key, q) - score(a.key, q) || b.count - a.count)
      .slice(0, MAX_NOTES);

  let products = rankProducts(false);
  let brands = rankBrands(false);
  let notes = rankNotes(false);
  let corrected = false;

  // Le repli ne sert que de filet : tant que la saisie exacte rend quelque
  // chose, on ne va pas y mêler des « à peu près » qui brouilleraient le tri.
  if (!products.length && !brands.length && !notes.length) {
    products = rankProducts(true);
    brands = rankBrands(true);
    notes = rankNotes(true);
    corrected = Boolean(products.length || brands.length || notes.length);
  }

  return {
    products,
    brands,
    notes,
    suggestions,
    empty: !products.length && !brands.length && !notes.length,
    corrected,
  };
}

/**
 * Vocabulaire des suggestions : ce que le client peut vouloir avoir tapé.
 *
 * Trois niveaux, parce qu'une suggestion utile n'est pas toujours un nom
 * complet : le nom entier (« Kashmir Musk »), chacun de ses mots (« kashmir »),
 * et les maisons et notes. `weight` départage : une référence populaire ou une
 * note portée par beaucoup de flacons passe devant une curiosité.
 */
interface Term {
  label: string;
  key: string;
  folded: string;
  weight: number;
}

const TERMS: Term[] = (() => {
  const byKey = new Map<string, Term>();

  const add = (label: string, weight: number) => {
    const key = norm(label);
    if (key.length < 3) return;
    const cur = byKey.get(key);
    if (cur) {
      // même terme vu plusieurs fois : il gagne le poids le plus fort
      if (weight > cur.weight) cur.weight = weight;
      return;
    }
    byKey.set(key, { label: key, key, folded: fold(key), weight });
  };

  for (const p of SEARCH_PRODUCTS) {
    add(p.name, p.popularity + 40);
    for (const w of norm(p.name).split(/[\s'-]+/)) add(w, p.popularity);
  }
  for (const b of SEARCH_BRANDS) add(b.name, b.count * 4);
  for (const n of SEARCH_NOTES) add(n.label, n.count * 2);

  return [...byKey.values()];
})();

/**
 * Complétions proposées pour une saisie en cours.
 *
 * Ordre voulu : ce qui commence par ce qui est tapé (le client complète), puis
 * ce qui commence par la forme repliée (il a écrit Oudh pour Oud), puis ce qui
 * tient dans le budget de fautes (il a tapé à côté). Le plus court d'abord à
 * poids égal : « kashmir » avant « kashmir musk », on élargit progressivement.
 */
export function querySuggestions(query: string, limit = MAX_SUGGESTIONS): string[] {
  const q = norm(query).trim();
  if (q.length < 2) return [];

  const qf = fold(q);
  const qWords = foldWords(q);

  const scored: { label: string; tier: number; weight: number }[] = [];

  for (const t of TERMS) {
    if (t.key === q) continue; // ne pas proposer ce qui est déjà tapé
    let tier = 0;
    if (t.key.startsWith(q)) tier = 3;
    else if (qf && t.folded.startsWith(qf)) tier = 2;
    else if (qWords.length && fuzzyMatch(t.folded.split(" "), qWords)) tier = 1;
    if (!tier) continue;
    scored.push({ label: t.label, tier, weight: t.weight });
  }

  return scored
    .sort(
      (a, b) =>
        b.tier - a.tier ||
        b.weight - a.weight ||
        a.label.length - b.label.length ||
        a.label.localeCompare(b.label, "fr"),
    )
    .slice(0, limit)
    .map((r) => r.label);
}

/**
 * Le terme du catalogue le plus proche d'un mot isolé, ou `null`. Sert au
 * « Vouliez-vous dire » quand la recherche ne rend rien du tout.
 */
export function nearestTerm(query: string): string | null {
  const qWords = foldWords(norm(query));
  if (!qWords.length) return null;
  let best: Term | null = null;
  for (const t of TERMS) {
    const words = t.folded.split(" ");
    if (words.length !== qWords.length) continue;
    if (!qWords.every((qw, i) => wordMatches(words[i], qw))) continue;
    if (!best || t.weight > best.weight) best = t;
  }
  return best ? best.label : null;
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
