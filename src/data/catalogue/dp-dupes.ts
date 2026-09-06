/**
 * Correspondances dupe → original, relevées sur le web et recoupées.
 *
 * Le « jumeau olfactif » ne reposait que sur deux couches : 25 paires relues à
 * la main (`olfactive-twins.ts`) et, pour tout le reste, un score de similarité
 * d'accords qui propose « le profil le plus proche » — c'est-à-dire souvent un
 * parfum qui n'a rien à voir, présenté avec un badge rassurant. Or la plupart
 * des maisons du catalogue (Lattafa, Maison Alhambra, Armaf, Paris Corner,
 * Afnan, Fragrance World, French Avenue…) vendent des interprétations assumées
 * de grands parfums, et la correspondance est publique et documentée.
 *
 * Cette table la fixe noir sur blanc, produit par produit, avec la source. Elle
 * passe AVANT le score : quand un original a un dupe connu au catalogue, c'est
 * lui qu'on montre, pas le voisin statistique.
 *
 * Règle du fichier : rien n'est déduit. Une correspondance sans source reste
 * absente, et une confiance « faible » n'est pas servie comme une certitude.
 */

import raw from "./dp-dupes.json";

export type DupeConfidence = "forte" | "moyenne" | "faible" | "aucune";

export interface Dupe {
  /** Slug du produit du catalogue, celui que sert `/produit/<slug>`. */
  slug: string;
  brand: string;
  name: string;
  /** Identifiant de l'original dans `reference-perfumes.ts`, ou `null` s'il n'y est pas encore. */
  referenceId: string | null;
  originalHouse: string | null;
  originalName: string | null;
  confidence: DupeConfidence;
  source: string | null;
  /** Autres originaux cités quand les sources divergent. */
  alternatives: string[];
  note: string | null;
}

export const DUPES: Dupe[] = (raw as Dupe[]).filter((d) => d && typeof d.slug === "string");

/**
 * Seules les correspondances au moins « moyenne » (une source sérieuse) sont
 * servies comme vérifiées. Une confiance « faible » — une mention isolée, ou
 * des sources qui se contredisent — reste dans la table pour la relecture,
 * mais le module ne l'affiche pas comme un jumeau.
 */
const SERVIES: ReadonlySet<DupeConfidence> = new Set(["forte", "moyenne"]);

/** referenceId → slugs des produits du catalogue qui en sont des dupes documentés. */
export const DUPES_BY_REFERENCE: ReadonlyMap<string, string[]> = (() => {
  const m = new Map<string, string[]>();
  for (const d of DUPES) {
    if (!d.referenceId || !SERVIES.has(d.confidence)) continue;
    const list = m.get(d.referenceId) ?? [];
    list.push(d.slug);
    m.set(d.referenceId, list);
  }
  return m;
})();

/** slug produit → sa correspondance servie, s'il en a une. */
export const DUPE_BY_SLUG: ReadonlyMap<string, Dupe> = new Map(
  DUPES.filter((d) => d.referenceId && SERVIES.has(d.confidence)).map((d) => [d.slug, d])
);

export function dupesOf(referenceId: string): string[] {
  return DUPES_BY_REFERENCE.get(referenceId) ?? [];
}
