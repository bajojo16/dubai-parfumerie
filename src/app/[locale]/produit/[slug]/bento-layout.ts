/**
 * Moteur de pavage de la grille bento de la fiche produit.
 *
 * Module PUR : il ne lit aucun fichier de données, il ne rend aucun JSX. Tout
 * ce dont il a besoin lui est passé déjà résolu (`BentoInput`) — c'est ce qui
 * le rend testable hors de Next, et c'est ce qui permet de vérifier par le
 * calcul que les 445 fiches du catalogue pavent sans trou.
 *
 * Deux temps :
 *
 * 1. `tileSpecs` traduit les DONNÉES d'une fiche en treize déclarations de
 *    tuiles : taille voulue, tailles de repli, poids, et surtout `available`
 *    calculé depuis les données réelles — jamais depuis une préférence
 *    d'affichage. Une fiche sans jumeau documenté n'a pas de tuile `twin`.
 * 2. `packTiles` pave la grille de six colonnes avec ce qui reste.
 */

import type { OlfactiveMatch } from "@/data/olfactive-twins";
import type { ProductContent } from "@/data/product-content";
import type { Product } from "@/data/product-details";
import type { ProductReview, ProductReviewSummary } from "@/data/product-reviews";
import type { PlacedTile, TileId, TileSize, TileSpec } from "./bento-types";

// ─── Entrée du moteur ─────────────────────────────────────────────────────────

/** Une fiche voisine DÉJÀ résolue : déclinaison de ligne ou produit lié. */
export interface BentoNeighbour {
  slug: string;
  product: Product;
}

/**
 * Tout ce que le moteur a besoin de savoir d'une fiche — et rien de plus.
 *
 * Volontairement composé de données résolues par l'appelant (`contentFor`,
 * `reviewsFor`, `lineSiblings`…) : si le moteur allait les chercher lui-même,
 * il deviendrait impossible de le nourrir d'un cas limite dans un test.
 */
export interface BentoInput {
  slug: string;
  product: Product;
  /** Couche éditoriale — objet vide sur une fiche non rédigée. */
  content: ProductContent;
  /** Avis rédigés de CETTE fiche ; tableau vide si aucun. */
  reviews: ProductReview[];
  /** Résumé agrégé (histogramme, critères) ; absent sur la plupart des fiches. */
  summary: ProductReviewSummary | undefined;
  /** Nombre d'avis illustrés (photos/vidéos clients) rattachés à la fiche. */
  mediaCount: number;
  /** Jumeau olfactif documenté, ou `undefined`. */
  twin: OlfactiveMatch | undefined;
  /** Autres déclinaisons de la même ligne. */
  siblings: BentoNeighbour[];
  /** Fiches proches proposées sous « Vous pourriez aussi aimer ». */
  related: BentoNeighbour[];
}

// ─── Déclaration des tuiles ───────────────────────────────────────────────────

/** Raccourci de lecture : `sz(3, 2)` vaut mieux que `{ cols: 3, rows: 2 }`. */
function sz(cols: TileSize["cols"], rows: TileSize["rows"]): TileSize {
  return { cols, rows };
}

/**
 * Les treize tuiles de la fiche, avec leur disponibilité calculée.
 *
 * L'ordre de ce tableau est celui de la DÉCLARATION (lisibilité) ; c'est le
 * poids, pas la position, qui décide de l'ordre de service.
 */
export function tileSpecs(input: BentoInput): TileSpec[] {
  const { product, content, reviews, mediaCount, twin, siblings, related } = input;

  const hasNotes =
    product.topNotes.length > 0 || product.heartNotes.length > 0 || product.baseNotes.length > 0;
  // Une photo cliente vient soit d'un avis illustré (`review-media`), soit d'un
  // avis rédigé qui porte un cliché : les deux sources alimentent la même tuile.
  const hasPhotos = mediaCount > 0 || reviews.some((review) => Boolean(review.photo));
  const hasForWhom =
    (content.forWhom?.length ?? 0) > 0 ||
    (content.when?.length ?? 0) > 0 ||
    (content.howToWear?.length ?? 0) > 0 ||
    (content.seasons?.length ?? 0) > 0;

  return [
    {
      id: "summary",
      size: sz(4, 1),
      alt: [sz(6, 1), sz(3, 1)],
      weight: 100,
      // « En 30 secondes » se fabrique depuis le prix, la concentration et la
      // contenance : toute fiche en a.
      available: true,
    },
    {
      id: "gauges",
      size: sz(2, 1),
      alt: [sz(3, 1)],
      weight: 75,
      available: content.longevityHours !== undefined || content.sillage !== undefined,
    },
    {
      id: "pyramid",
      size: sz(3, 2),
      alt: [sz(3, 1), sz(4, 2), sz(6, 1)],
      weight: 90,
      available: hasNotes,
    },
    {
      id: "specs",
      size: sz(3, 2),
      alt: [sz(3, 1), sz(4, 2)],
      weight: 88,
      // Concentration, contenance, origine : le catalogue les impose.
      available: true,
    },
    {
      id: "twin",
      size: sz(4, 2),
      alt: [sz(4, 1), sz(6, 1), sz(3, 2)],
      weight: 80,
      available: twin !== undefined,
    },
    {
      id: "forwhom",
      size: sz(2, 1),
      alt: [sz(3, 1), sz(2, 2)],
      weight: 70,
      available: hasForWhom,
    },
    {
      id: "rating",
      size: sz(2, 1),
      alt: [sz(3, 1)],
      weight: 65,
      // Le compte d'avis du catalogue, pas le nombre d'avis RÉDIGÉS : la note
      // agrégée porte sur des centaines de votes dont on n'affiche qu'une
      // poignée de textes.
      available: product.reviews > 0,
    },
    {
      id: "photos",
      size: sz(4, 1),
      alt: [sz(3, 1), sz(2, 1), sz(6, 1)],
      weight: 55,
      available: hasPhotos,
    },
    {
      id: "line",
      size: sz(2, 1),
      alt: [sz(3, 1)],
      weight: 60,
      available: siblings.length > 0,
    },
    {
      id: "questions",
      size: sz(6, 1),
      weight: 30,
      // La FAQ se génère depuis les données (tenue, saison, contenance) même
      // sans question rédigée : la tuile a toujours de quoi parler.
      available: true,
    },
    {
      id: "description",
      size: sz(4, 1),
      alt: [sz(6, 1), sz(3, 2)],
      weight: 50,
      available: product.description.trim().length > 0,
    },
    {
      id: "collection",
      size: sz(6, 1),
      weight: 20,
      // Le flacon ouvert suffit à composer une collection (huile, coffret).
      available: true,
    },
    {
      id: "related",
      size: sz(6, 1),
      weight: 10,
      // Moins de deux vignettes, ce n'est plus une rangée : c'est un orphelin.
      available: related.length >= 2,
    },
  ];
}

// ─── Pavage ───────────────────────────────────────────────────────────────────

/** Nombre de colonnes de la grille. Tout le moteur en dépend. */
const COLUMNS = 6;

/** Largeurs légales d'une tuile, croissantes. */
const LEGAL_COLS: readonly TileSize["cols"][] = [2, 3, 4, 6];

/** Une tuile retenue pour un emplacement, dans la taille finalement choisie. */
interface Choice {
  spec: TileSpec;
  size: TileSize;
}

/** Un segment de cellules libres consécutives dans une rangée. */
interface Segment {
  start: number;
  width: number;
}

/**
 * Toutes les tailles envisageables pour une tuile, la voulue en tête puis les
 * replis dans l'ordre déclaré. Les doublons sont écartés.
 */
function sizesOf(spec: TileSpec): TileSize[] {
  const out: TileSize[] = [spec.size];
  for (const alt of spec.alt ?? []) {
    if (!out.some((s) => s.cols === alt.cols && s.rows === alt.rows)) out.push(alt);
  }
  return out;
}

/**
 * La plus grande largeur légale qui tient dans `width`.
 *
 * Les segments libres valent toujours 2, 3, 4 ou 6 colonnes (toutes les tailles
 * déclarées valent l'une de ces quatre valeurs, et 6 se partitionne en 6, 4+2,
 * 3+3 ou 2+2+2) : l'arrondi vers le bas ne sert que de filet, il ne s'exerce
 * jamais sur une grille réelle.
 */
function widthToCols(width: number): TileSize["cols"] {
  let best: TileSize["cols"] = 2;
  for (const c of LEGAL_COLS) if (c <= width) best = c;
  return best;
}

/** Le premier segment libre d'une rangée, de gauche à droite. */
function firstFreeSegment(row: (TileId | null)[]): Segment | null {
  const start = row.indexOf(null);
  if (start === -1) return null;
  let end = start;
  while (end < COLUMNS && row[end] === null) end += 1;
  return { start, width: end - start };
}

/** Le nombre de segments libres d'une rangée (0 quand elle est pleine). */
function countFreeSegments(row: (TileId | null)[]): number {
  let count = 0;
  let inGap = false;
  for (let c = 0; c < COLUMNS; c += 1) {
    const free = row[c] === null;
    if (free && !inGap) count += 1;
    inGap = free;
  }
  return count;
}

/**
 * Cherche une combinaison de tuiles qui remplit EXACTEMENT `width` colonnes.
 *
 * Les tuiles sont essayées par poids décroissant (l'ordre du pool) et, pour
 * chacune, dans l'ordre taille voulue → replis : la première solution trouvée
 * est donc la plus « désirable » au sens des poids et des tailles naturelles.
 * `null` quand aucune combinaison ne tombe juste.
 */
function exactFill(width: number, pool: TileSpec[], allowTall: boolean): Choice[] | null {
  if (width === 0) return [];
  if (width < 2) return null;

  for (let i = 0; i < pool.length; i += 1) {
    const spec = pool[i];
    const rest = pool.slice(0, i).concat(pool.slice(i + 1));
    for (const size of sizesOf(spec)) {
      if (size.cols > width) continue;
      if (size.rows === 2) {
        if (!allowTall) continue;
        // Une tuile haute entame la rangée suivante : sans tuile pour l'y
        // rejoindre, elle y creuserait un trou définitif.
        if (rest.length === 0) continue;
      }
      const tail = exactFill(width - size.cols, rest, allowTall);
      if (tail) return [{ spec, size }, ...tail];
    }
  }
  return null;
}

/**
 * Dernier recours : remplit `width` sans combinaison exacte, en ÉTIRANT la
 * dernière tuile posée jusqu'au bord de la rangée.
 *
 * Une tuile peut toujours grandir en largeur ; elle ne descend jamais sous deux
 * colonnes. Le résultat remplit toujours le segment dès qu'il reste au moins
 * une tuile.
 */
function stretchFill(width: number, pool: TileSpec[], allowTall: boolean): Choice[] {
  const out: Choice[] = [];
  const left = [...pool];
  let rest = width;

  while (rest >= 2 && left.length > 0) {
    const spec = left[0];
    left.splice(0, 1);

    // La plus large des tailles déclarées qui tient encore : on comble vite.
    let picked: TileSize | null = null;
    for (const size of sizesOf(spec)) {
      if (size.cols > rest) continue;
      if (size.rows === 2 && (!allowTall || left.length === 0)) continue;
      if (!picked || size.cols > picked.cols) picked = size;
    }
    // Aucune taille déclarée ne tient : la tuile est ramenée à la largeur du
    // segment (jamais sous deux colonnes — voir `widthToCols`).
    if (!picked) picked = sz(widthToCols(rest), 1);

    const remainder = rest - picked.cols;
    // On étire quand il ne reste plus personne pour finir, ou quand le reliquat
    // serait inexploitable (une colonne seule).
    const stretch = left.length === 0 || (remainder > 0 && remainder < 2);
    const cols = stretch ? widthToCols(rest) : picked.cols;

    out.push({ spec, size: sz(cols, picked.rows) });
    rest -= cols;
  }

  return out;
}

/** `exactFill` si possible, `stretchFill` sinon. Ne renvoie jamais `null`. */
function assignSegment(width: number, pool: TileSpec[], allowTall: boolean): Choice[] {
  return exactFill(width, pool, allowTall) ?? stretchFill(width, pool, allowTall);
}

/**
 * **L'algorithme de pavage.**
 *
 * La grille fait six colonnes et se remplit rangée par rangée, de gauche à
 * droite, exactement comme le placement automatique de CSS Grid : le moteur ne
 * revient jamais en arrière, donc ce qu'il calcule ici est ce que le navigateur
 * dessinera à partir de la seule liste ordonnée de `PlacedTile`.
 *
 * 1. Les tuiles sont triées par poids décroissant : c'est l'ordre de service,
 *    pas l'ordre de pose. Le moteur PEUT descendre dans la liste pour finir une
 *    rangée — c'est tout l'intérêt d'un bento sur un catalogue hétérogène.
 * 2. Pour le premier segment libre de la rangée courante, `exactFill` cherche
 *    par retour arrière une combinaison qui tombe JUSTE sur la largeur du
 *    segment, en essayant chaque tuile dans sa taille voulue puis dans ses
 *    replis (`alt`). La première solution trouvée est la plus désirable.
 * 3. Une tuile `rows: 2` occupe ses colonnes dans la rangée suivante. Le
 *    placement n'est validé que si l'ombre ainsi projetée laisse AU PLUS un
 *    segment libre en dessous, et que ce segment peut être rempli exactement
 *    par ce qui reste en réserve. Sinon la rangée est rejouée sans aucune tuile
 *    haute — un repli qui existe toujours, chaque tuile ayant une taille sur
 *    une seule rangée.
 * 4. Si aucune combinaison exacte n'existe (fin de grille, réserve maigre),
 *    `stretchFill` pose ce qu'il peut et ÉTIRE la dernière tuile jusqu'au bord.
 *    Une rangée n'est donc jamais rendue incomplète.
 * 5. Réparation finale : la toute dernière rangée peut n'être que l'ombre de la
 *    précédente, sans plus rien à y poser. On rend alors leur seconde rangée
 *    aux tuiles qui la projetaient, et la rangée fantôme disparaît.
 */
export function packTiles(specs: TileSpec[]): PlacedTile[] {
  // `localeCompare` sur l'id départage deux poids égaux : le pavage doit être
  // déterministe d'un rendu à l'autre, sinon la fiche bouge sans raison.
  const pool = [...specs].sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id));

  const grid: (TileId | null)[][] = [];
  const placed: PlacedTile[] = [];
  /** Rangée de DÉPART de chaque tuile — sert à repérer les rangées fantômes. */
  const startRow = new Map<TileId, number>();

  const ensureRow = (r: number): void => {
    while (grid.length <= r) grid.push(new Array<TileId | null>(COLUMNS).fill(null));
  };

  const occupy = (r: number, start: number, choice: Choice): void => {
    if (choice.size.rows === 2) ensureRow(r + 1);
    for (let c = start; c < start + choice.size.cols && c < COLUMNS; c += 1) {
      grid[r][c] = choice.spec.id;
      if (choice.size.rows === 2) grid[r + 1][c] = choice.spec.id;
    }
    startRow.set(choice.spec.id, r);
    placed.push({ id: choice.spec.id, size: choice.size });
  };

  let r = 0;
  // Garde-fou : treize tuiles ne peuvent pas occuper plus de vingt-six rangées.
  let safety = 0;
  while (pool.length > 0 && safety < 64) {
    safety += 1;
    ensureRow(r);
    const segment = firstFreeSegment(grid[r]);
    if (!segment) {
      r += 1;
      continue;
    }

    let choices = assignSegment(segment.width, pool, true);
    if (choices.some((c) => c.size.rows === 2)) {
      const after = pool.filter((spec) => !choices.some((c) => c.spec.id === spec.id));
      if (!shadowIsSound(grid, r, segment, choices, after)) {
        choices = assignSegment(segment.width, pool, false);
      }
    }

    let cursor = segment.start;
    for (const choice of choices) {
      occupy(r, cursor, choice);
      cursor += choice.size.cols;
      const index = pool.findIndex((spec) => spec.id === choice.spec.id);
      if (index >= 0) pool.splice(index, 1);
    }
  }

  repairTrailingShadow(grid, placed, startRow);
  return placed;
}

/**
 * L'ombre que `choices` projetterait sous la rangée `r` laisse-t-elle une
 * rangée tenable ?
 *
 * Tenable veut dire : au plus un segment libre (sinon le placement automatique
 * de CSS sauterait par-dessus un trou), et ce segment exactement remplissable
 * par la réserve restante. C'est une anticipation d'un seul cran — suffisante,
 * parce qu'une tuile haute n'engage jamais plus d'une rangée.
 */
function shadowIsSound(
  grid: (TileId | null)[][],
  r: number,
  segment: Segment,
  choices: Choice[],
  after: TileSpec[],
): boolean {
  const below: (TileId | null)[] =
    r + 1 < grid.length ? [...grid[r + 1]] : new Array<TileId | null>(COLUMNS).fill(null);

  let cursor = segment.start;
  for (const choice of choices) {
    if (choice.size.rows === 2) {
      for (let c = cursor; c < cursor + choice.size.cols && c < COLUMNS; c += 1) {
        below[c] = choice.spec.id;
      }
    }
    cursor += choice.size.cols;
  }

  if (countFreeSegments(below) > 1) return false;
  const free = firstFreeSegment(below);
  if (!free) return true;
  if (after.length === 0) return false;
  return exactFill(free.width, after, true) !== null;
}

/**
 * Supprime une éventuelle dernière rangée fantôme : celle qui n'existe que
 * parce que des tuiles hautes la débordent, et qu'aucune tuile n'est venue
 * peupler. Les tuiles concernées y perdent leur seconde rangée — elles gardent
 * leur largeur, seule la hauteur cède.
 */
function repairTrailingShadow(
  grid: (TileId | null)[][],
  placed: PlacedTile[],
  startRow: Map<TileId, number>,
): void {
  while (grid.length > 1) {
    const last = grid[grid.length - 1];
    if (!last.some((cell) => cell === null)) return;

    const ids = [...new Set(last.filter((cell): cell is TileId => cell !== null))];
    // Une tuile qui COMMENCE dans cette rangée la rend légitime : on n'y touche
    // pas (le cas ne devrait pas se produire, chaque segment étant comblé).
    if (ids.length === 0 || ids.some((id) => startRow.get(id) === grid.length - 1)) return;

    for (const id of ids) {
      const tile = placed.find((p) => p.id === id);
      if (tile) tile.size = { cols: tile.size.cols, rows: 1 };
    }
    grid.pop();
  }
}

// ─── Point d'entrée ───────────────────────────────────────────────────────────

/**
 * La grille bento d'une fiche : les tuiles disponibles, pavées sans trou, dans
 * l'ordre où la page doit les rendre.
 */
export function bentoLayout(input: BentoInput): PlacedTile[] {
  return packTiles(tileSpecs(input).filter((tile) => tile.available));
}
