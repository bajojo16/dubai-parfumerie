/**
 * Formats de vente d'une fiche produit — résolution partagée entre la colonne
 * d'achat (`AddToCart`) et la barre mobile (`MobileBuyBar`), pour que les deux
 * proposent exactement la même liste, au même prix, dans le même ordre.
 */

export interface ProductVariant {
  /** Libellé affiché (« 30 ml », « Échantillon 1 ml »). */
  label: string;
  /** Contenance en ml : sert au prix au ml, aux durées et à l'identifiant panier. */
  volumeMl: number;
  /** Prix TTC en euros. */
  price: number;
  /** Fiole d'essai (« sample ») ou flacon (« bottle »). */
  kind: "sample" | "bottle";
  /** Échantillon seulement : prix déduit du flacon acheté ensuite. */
  refundable?: boolean;
}

/** « 100ml » / « 100 ml » / « 100 ML » → 100. Sans nombre lisible → 0. */
export function parseVolumeMl(volume: string): number {
  const m = volume.match(/(\d+(?:[.,]\d+)?)/);
  return m ? parseFloat(m[1].replace(",", ".")) : 0;
}

/** 14.9 → « 14,90 » : virgule française, deux décimales. */
export function formatPrice(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

/**
 * Liste résolue des formats d'une fiche : [échantillon si `sample`] puis les
 * flacons par contenance croissante.
 *
 * - Sans `variants` : UN seul flacon, celui de la fiche (`volume` / `price`).
 *   On n'invente pas 30/50/100 : l'ancien sélecteur le faisait, au même prix
 *   pour les trois, sur toutes les fiches.
 * - Avec `variants` : la liste fournie ; si aucune entrée ne reprend la
 *   contenance de référence, celle-ci est ajoutée — le prix affiché en haut de
 *   la fiche doit toujours correspondre à un format réellement sélectionnable.
 * - L'échantillon vient D'ABORD : c'est la porte d'entrée « essayer avant
 *   d'acheter », lue avant les flacons — mais pas sélectionnée par défaut.
 */
export function resolveVariants(product: {
  volume: string;
  price: number;
  variants?: { label: string; volumeMl: number; price: number }[];
  sample?: { volumeMl: number; price: number; refundable?: boolean };
}): ProductVariant[] {
  const refMl = parseVolumeMl(product.volume);
  const bottles: ProductVariant[] = (product.variants ?? []).map((v) => ({ ...v, kind: "bottle" }));
  if (!bottles.some((v) => v.volumeMl === refMl)) {
    // « 100ml » en données → « 100 ml » à l'écran (espace insécable avant l'unité).
    bottles.push({ label: product.volume.replace(/(\d)\s*ml/i, "$1\u00a0ml"), volumeMl: refMl, price: product.price, kind: "bottle" });
  }
  bottles.sort((a, b) => a.volumeMl - b.volumeMl);
  // L'échantillon n'est PAS dans la liste : ce n'est plus un format exclusif
  // mais un complément qu'on coche en plus du flacon (voir `sampleVariantOf`).
  // En radio, un client ne pouvait pas prendre les deux d'un coup.
  return bottles;
}

/** L'échantillon comme ligne additive, ou `undefined` s'il n'est pas vendu. */
export function sampleVariantOf(sample?: { volumeMl: number; price: number; refundable?: boolean }): ProductVariant | undefined {
  if (!sample) return undefined;
  return { label: `Échantillon ${sample.volumeMl} ml`, volumeMl: sample.volumeMl, price: sample.price, kind: "sample", refundable: sample.refundable };
}

/** Le plus grand FLACON de la liste (jamais l'échantillon). */
/** Les flacons seuls (sans l'échantillon). */
export function bottlesOf(variants: ProductVariant[]): ProductVariant[] {
  return variants.filter((v) => v.kind === "bottle");
}

/** L'échantillon, s'il est vendu. */
export function sampleOf(variants: ProductVariant[]): ProductVariant | undefined {
  return variants.find((v) => v.kind === "sample");
}

export function largestBottle(variants: ProductVariant[]): ProductVariant {
  return variants.filter((v) => v.kind === "bottle").reduce((a, b) => (b.volumeMl > a.volumeMl ? b : a));
}

/**
 * Format sélectionné à l'ouverture : la plus grande contenance. Le client qui
 * arrive sur la fiche veut le flacon ; l'échantillon est une porte de sortie
 * visible, pas le choix imposé.
 */
export function defaultVariant(variants: ProductVariant[]): ProductVariant {
  return largestBottle(variants);
}

/** Identifiant panier : un même flacon en deux contenances = deux lignes. */
export function variantCartId(slug: string, v: ProductVariant): string {
  return `${slug}-${v.volumeMl}`;
}

/**
 * Durée d'usage estimée. Formule : ≈ 10 pulvérisations par ml, 3 par jour
 * → jours = ml × 10 / 3 ; 30 ml ≈ 100 jours ≈ 3 mois, 100 ml ≈ 333 jours ≈ 1 an.
 * Arrondi lisible : < 1 mois → semaines, ≥ 11 mois → années.
 */
export const SPRAYS_PER_ML = 10;
export const SPRAYS_PER_DAY = 3;
export function usageDuration(volumeMl: number): string {
  const days = (volumeMl * SPRAYS_PER_ML) / SPRAYS_PER_DAY;
  const months = days / 30;
  if (months < 1) {
    const weeks = Math.max(1, Math.round(days / 7));
    return `≈ ${weeks} sem.`;
  }
  if (months >= 11) {
    const years = Math.max(1, Math.round(months / 12));
    return `≈ ${years} an${years > 1 ? "s" : ""}`;
  }
  return `≈ ${Math.round(months)} mois`;
}

/** Libellé du bouton principal : l'échantillon se « commande », le flacon s'« ajoute ». */
/** Libellé du bouton — court, pour ne jamais être tronqué dans la rangée bornée. */
export function ctaLabel(_v: ProductVariant, total: number): string {
  return `Ajouter au panier · ${formatPrice(total)} €`;
}
