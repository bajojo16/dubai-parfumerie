/**
 * Réalignement tarifaire — outil de pilotage, pas du contenu client.
 *
 * Établi le 06/09/2026 à partir de `dp-catalogue.json`. La règle : tout produit
 * dont le prix s'écarte de plus de 15 % de la médiane des prix concurrents
 * relevés pour CE produit exact (même marque, même nom, même contenance) est
 * réaligné sur cette médiane. En dessous de 15 %, on ne touche à rien.
 *
 * 70 produits sur les 98 comparables — 50 baisses, 20 hausses.
 *
 * Rien ici ne s'affiche côté acheteur : ni la médiane, ni l'écart, ni les
 * sources. C'est un tableau de bord tarifaire, au même titre que `marche` et
 * `verdictPrix` dans le catalogue.
 */

import raw from "./dp-corrections-prix.json";

/**
 * Confiance à accorder à une correction. Elle se lit sur le nombre de relevés,
 * et elle décide seule si la ligne est applicable : une « médiane » calculée
 * sur un seul prix n'est pas une médiane.
 */
export type Confiance = "solide" | "moyenne" | "faible";

export interface CorrectionPrix {
  id: string;
  url: string;
  nom: string;
  marque: string;
  /** `null` quand le site n'affiche pas de contenance. */
  contenance: string | null;
  type: string;
  /** Prix affiché aujourd'hui par dubaiparfumerie.com. */
  prixActuel: number;
  /** Médiane des prix concurrents relevés. C'est le prix cible. */
  mediane: number;
  min: number;
  max: number;
  /** Nombre de prix concurrents relevés. */
  releves: number;
  /** Écart en pourcentage entre le prix actuel et la médiane. */
  ecartPct: number;
  /** Variation appliquée au prix : négative pour une baisse. */
  delta: number;
  sources: string[];
}

interface RawCorrection {
  id: string;
  url: string;
  nom: string;
  marque: string;
  conten: string | null;
  type: string;
  dp: number;
  med: number;
  mini: number;
  maxi: number;
  n: number;
  ec: number;
  delta: number;
  src: string[];
}

export const CORRECTIONS: CorrectionPrix[] = (raw as RawCorrection[]).map((c) => ({
  id: c.id,
  url: c.url,
  nom: c.nom,
  marque: c.marque,
  contenance: c.conten,
  type: c.type,
  prixActuel: c.dp,
  mediane: c.med,
  min: c.mini,
  max: c.maxi,
  releves: c.n,
  ecartPct: c.ec,
  delta: c.delta,
  sources: c.src,
}));

/**
 * Arbitrages manuels, qui passent avant la règle des 15 %.
 *
 * `null` = la correction est écartée, le prix du site reste tel quel. Un
 * nombre = ce prix-là est imposé, qu'une correction existe ou non pour la
 * référence.
 *
 * Une ligne n'entre ici que sur décision commerciale explicite — pas parce que
 * la mesure semble douteuse, ce que `confiance()` et `formatDouteux()` disent
 * déjà. Les quatre premières sont des Ahmed Al Maghribi ; leurs relevés
 * viennent de lectures directes de pages revendeurs, le budget de recherche de
 * la session de relevé ayant été épuisé sur cette marque.
 */
export const PRIX_IMPOSES: Readonly<Record<string, number | null>> = {
  // 90 € conservés : médiane sur 2 relevés seulement, dont une page de
  // collection paginée — l'appariement de format n'est pas confirmé.
  "fr-parfum-ahmed-al-maghribi-al-shaikha-hind": null,
  // 39 € conservés : même réserve, 2 relevés.
  "fr-ahmed-al-maghribi-arwa": null,
  // 29 € conservés sur l'eau de parfum 50 ml.
  "fr-ahmed-al-maghribi-bidun-esam": null,
  // 27 € conservés sur la brume. La correction annonçait 6,43 € depuis un seul
  // relevé, écart de 320 % : le comparateur portait sur un autre format.
  "en-ahmed-al-maghribi-freshner-bidun-esam": null,
  // Jean Lowe Vibe : 34,90 € validés sur le portail de relecture. Le site
  // affichait 30 €, soit −14 % — sous le seuil des 15 %, donc la règle n'y
  // touchait pas ; c'est un arbitrage, pas un réalignement automatique. Il
  // rejoint la médiane marché relevée sur 3 sources.
  "jean-lowe-vibe": 34.9,
  // Vanilla Voyage : 49 € conservés. Le prix vient du relevé de la vitrine
  // réelle, pas du comparateur — décision commerciale assumée malgré une
  // médiane à 31,90 €.
  "vanilla-voyage": null,
  // Daam Watani : 80 € imposés. Le site affiche 74,50 € et le catalogue le juge
  // « aligné », mais sur un unique relevé à 80,49 € — donc non mesuré plutôt
  // qu'aligné. Aucune correction n'existait pour cette référence.
  "fr-ahmed-al-maghribi-daam-watani": 80,
};

/** Les identifiants dont la correction automatique est neutralisée. */
export const EXCLUES: readonly string[] = Object.keys(PRIX_IMPOSES);

/**
 * Confiance d'une correction. Le mode opératoire est explicite : à un seul
 * relevé on n'applique pas, à deux on vérifie d'abord que les sources vendent
 * bien le même format.
 */
export function confiance(c: CorrectionPrix): Confiance {
  if (c.releves >= 3) return "solide";
  if (c.releves === 2) return "moyenne";
  return "faible";
}

/**
 * Un écart de +300 % ou plus vient presque toujours d'un format mal apparié —
 * un 200 ml comparé à un 30 ml, une eau de parfum comparée à une brume — pas
 * d'un prix réellement quadruplé. À vérifier avant d'appliquer.
 */
export function formatDouteux(c: CorrectionPrix): boolean {
  return Math.abs(c.ecartPct) >= 300;
}

/** Les corrections réellement applicables : confiance suffisante, format
 *  crédible, et non écartées à la main. */
export function correctionsApplicables(): CorrectionPrix[] {
  return CORRECTIONS.filter(
    (c) => confiance(c) !== "faible" && !formatDouteux(c) && !EXCLUES.includes(c.id)
  );
}

export function correctionPour(id: string): CorrectionPrix | undefined {
  if (EXCLUES.includes(id)) return undefined;
  return CORRECTIONS.find((c) => c.id === id);
}

/**
 * Prix de boutique : la médiane brute donne des nombres comme 17,20 € qui ne
 * ressemblent pas à un prix affiché. L'arrondi au « ,90 » le plus proche est
 * une suggestion — appliquer la règle à la lettre, c'est prendre `mediane`.
 */
export function arrondiBoutique(mediane: number): number {
  // Le « ,90 » le PLUS PROCHE, au-dessus comme en dessous : 26,45 € donne
  // 26,90 € et non 25,90 €, qui repasserait sous la médiane qu'on vise.
  return Math.round(mediane - 0.9) + 0.9;
}

/**
 * Le prix à appliquer pour une référence du catalogue, arbitrages manuels
 * compris. Retourne `null` quand rien ne change.
 */
export function prixRetenu(id: string, prixActuel: number): number | null {
  if (id in PRIX_IMPOSES) {
    const impose = PRIX_IMPOSES[id];
    return impose === null || impose === prixActuel ? null : impose;
  }
  const c = CORRECTIONS.find((x) => x.id === id);
  if (!c || confiance(c) === "faible" || formatDouteux(c)) return null;
  return arrondiBoutique(c.mediane);
}
