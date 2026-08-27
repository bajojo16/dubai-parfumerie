/**
 * Rapprochement du quiz avec le catalogue — portage de `recommander()` du
 * `js/quiz.js` d'AD Parfumerie.
 *
 * Ce module importe `@/data/search-catalog` en dur : c'est voulu, il est
 * lui-même chargé en `import()` dynamique par la modale à la première ouverture
 * (même montage que `SearchOverlay` avec `./rank`). Le catalogue n'a rien à
 * faire dans le bundle du layout, que le bouton flottant occupe déjà.
 *
 * Barème repris du README de l'archive, moins la ligne du parfum de référence —
 * la question qui l'alimentait n'est pas portée :
 *
 *   famille du parfum = famille gagnante ........................ +3
 *   la note choisie est dans la composition ..................... +3
 *   notes parentes de la famille ................ +0,5 par note, plafond 2
 *   le genre correspond, ou la référence est mixte ............. +0,8
 *   en stock ................................................... +0,6
 */
import { FAMILIES, SEARCH_PRODUCTS, familyOf, norm, type SearchProduct } from "@/data/search-catalog";
import type { FamilyKey } from "../types";

/** Ordre de dépouillement des votes — sert aussi de départage en cas d'égalité. */
const FAMILY_ORDER: FamilyKey[] = ["frais", "floral", "ambre", "boise"];

/**
 * Le nom de la famille s'accorde au féminin (« votre famille olfactive »), là où
 * `FAMILIES[k].label` sert d'étiquette neutre dans la recherche. La description,
 * elle, vient telle quelle du catalogue : une seule source de vérité.
 */
const FAMILY_NAME: Record<FamilyKey, string> = {
  frais: "Fraîche",
  floral: "Florale",
  ambre: "Ambrée",
  boise: "Boisée",
};

export function familyName(key: FamilyKey): string {
  return FAMILY_NAME[key];
}

export function familyText(key: FamilyKey): string {
  return FAMILIES[key].text;
}

/** Une référence pesée par le quiz. */
export interface ScoredProduct {
  product: SearchProduct;
  score: number;
  /** carte tirée au hasard pour compléter le trio — cf. `fillUp()` */
  filler?: boolean;
}

/** Les critères que l'écran de fin transmet au moteur. */
export interface QuizCriteria {
  family: FamilyKey;
  /** mots-clés de la note retenue — vide si la question a été passée */
  noteWords: string[];
  /** « Femme » / « Homme » / « Mixte » — vide si non renseigné */
  gender: string;
  budgetMin: number;
  budgetMax: number;
}

/**
 * Dépouille les votes des questions « univers », « note » et « saison ».
 * Aucune voix, ou égalité en tête : ambrée par défaut, comme l'annonce le README
 * de l'archive — c'est aussi la famille la plus représentée du catalogue Dubaï
 * (11 références sur 28).
 */
export function winningFamily(votes: (FamilyKey | "" | undefined)[]): FamilyKey {
  const tally: Record<FamilyKey, number> = { frais: 0, floral: 0, ambre: 0, boise: 0 };
  for (const v of votes) if (v) tally[v] += 1;

  let best: FamilyKey | null = null;
  let bestCount = 0;
  let tied = false;
  for (const key of FAMILY_ORDER) {
    if (tally[key] > bestCount) {
      best = key;
      bestCount = tally[key];
      tied = false;
    } else if (tally[key] === bestCount && bestCount > 0) {
      tied = true;
    }
  }
  return best && bestCount > 0 && !tied ? best : "ambre";
}

/** Les notes d'un parfum, normalisées une fois par appel. */
function notesOf(p: SearchProduct): string[] {
  return p.notes.map((n) => norm(n));
}

/**
 * Pèse tout le catalogue et rend les candidats classés, du plus affine au moins.
 * Seules les références qui marquent au moins un point sont conservées.
 */
export function scoreCatalog(criteria: QuizCriteria, products = SEARCH_PRODUCTS): ScoredProduct[] {
  const kin = FAMILIES[criteria.family].words;
  const wanted = criteria.noteWords.map((w) => norm(w)).filter(Boolean);
  const gender = norm(criteria.gender);

  const scored = products.map((product) => {
    const notes = notesOf(product);
    let score = 0;

    if (familyOf(product) === criteria.family) score += 3;

    // La note choisie, retrouvée dans la composition. On compare sur des
    // mots-clés et non sur le libellé : le catalogue écrit « Santal blanc »
    // quand l'option dit « Bois de santal ».
    if (wanted.length && notes.some((n) => wanted.some((w) => n.includes(w)))) score += 3;

    // Parenté de famille par les notes, même quand la famille dominante diffère.
    score += Math.min(2, notes.filter((n) => kin.some((w) => n.includes(norm(w)))).length * 0.5);

    // Genre : 26 des 28 références n'en portent aucun (le champ n'est renseigné
    // que par les huiles). Le signal est donc quasi inerte sur ce catalogue —
    // il est gardé pour le jour où les fiches seront complétées.
    const declared = norm(product.gender);
    if (gender && declared && (declared === gender || declared === "mixte" || declared === "unisexe")) score += 0.8;

    if (product.available) score += 0.6;

    return { product, score };
  });

  return scored
    .filter((r) => r.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(b.product.available) - Number(a.product.available) ||
        (a.product.price || 0) - (b.product.price || 0),
    );
}

/**
 * Le catalogue agrégé porte quatre doublons de nom (« Aurum », « Reef 33 »,
 * « Oud & Roses », « Vanilla Voyage » existent sous deux maisons, avec le même
 * visuel). Trois cartes dont deux identiques à l'œil ne racontent rien : on ne
 * garde qu'une référence par nom, la mieux classée.
 */
function dedupeByName(ranked: ScoredProduct[]): ScoredProduct[] {
  const seen = new Set<string>();
  const out: ScoredProduct[] = [];
  for (const r of ranked) {
    const key = r.product.keyName;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

/**
 * Le budget porte sur l'ensemble, pas sur un flacon : on retient le trio le plus
 * affine dont la somme tombe dans la tranche choisie. Si aucune combinaison n'y
 * rentre, on prend la plus proche — le budget pondère, il ne filtre pas, sinon
 * une tranche haute viderait la sélection.
 */
export function pickTrio(ranked: ScoredProduct[], min: number, max: number): ScoredProduct[] {
  if (ranked.length < 3) return ranked.slice(0, 3);
  // Au-delà des 40 premiers, l'affinité ne justifie plus le calcul (le
  // catalogue Dubaï en compte moins : la borne ne mord jamais aujourd'hui).
  const top = ranked.slice(0, 40);

  let inside: { lot: ScoredProduct[]; affinity: number } | null = null;
  let nearest: { lot: ScoredProduct[]; affinity: number; gap: number } | null = null;

  for (let i = 0; i < top.length - 2; i++) {
    for (let j = i + 1; j < top.length - 1; j++) {
      for (let k = j + 1; k < top.length; k++) {
        const lot = [top[i], top[j], top[k]];
        const sum = lot.reduce((s, r) => s + (r.product.price || 0), 0);
        const affinity = lot.reduce((s, r) => s + r.score, 0);
        if (sum >= min && sum <= max) {
          if (!inside || affinity > inside.affinity) inside = { lot, affinity };
        } else if (!inside) {
          const gap = sum < min ? min - sum : sum - max;
          if (!nearest || gap < nearest.gap || (gap === nearest.gap && affinity > nearest.affinity)) {
            nearest = { lot, affinity, gap };
          }
        }
      }
    }
  }
  return (inside || nearest || { lot: ranked.slice(0, 3) }).lot;
}

/**
 * Filet de sécurité repris de `completer()` : quand moins de trois références
 * passent le score, le lot est complété par tirage pour que l'écran de fin ne
 * soit jamais vide. Ces cartes portent la mention « suggestion ».
 *
 * Avec 28 références dont 27 en stock (+0,6 chacune), le cas ne se présente
 * pas aujourd'hui : le filet est gardé pour un catalogue qui se réduirait, ou
 * pour un jeu de critères qui ne marquerait rien. À retirer si le catalogue
 * grossit assez pour s'en passer.
 */
export function fillUp(lot: ScoredProduct[], products = SEARCH_PRODUCTS): ScoredProduct[] {
  const taken = new Set(lot.map((r) => r.product.id));
  const rest = products.filter((p) => !taken.has(p.id));
  const out = [...lot];
  while (out.length < 3 && rest.length) {
    const i = Math.floor(Math.random() * rest.length);
    out.push({ product: rest.splice(i, 1)[0], score: 0, filler: true });
  }
  return out;
}

/** Le trio final, dans l'ordre où les cartes seront numérotées. */
export function recommend(criteria: QuizCriteria, products = SEARCH_PRODUCTS): ScoredProduct[] {
  const ranked = dedupeByName(scoreCatalog(criteria, products));
  return fillUp(pickTrio(ranked, criteria.budgetMin, criteria.budgetMax), products);
}

/** Barème des remises : deux flacons −10 %, trois et plus −20 %. */
export function discountRate(count: number): number {
  if (count >= 3) return 0.2;
  if (count === 2) return 0.1;
  return 0;
}

/**
 * Toutes les paires, puis le lot complet. Au-delà de trois cartes la liste
 * resterait lisible, mais l'écran n'en affiche jamais plus.
 */
export function combinations(n: number): number[][] {
  const out: number[][] = [];
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) out.push([a, b]);
  if (n > 2) out.push([...Array(n).keys()]);
  return out;
}
