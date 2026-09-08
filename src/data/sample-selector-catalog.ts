/**
 * Échantillons tirés du CATALOGUE COMPLET, pour les maisons dont les fioles
 * sont en stock.
 *
 * `sample-selector-products.ts` n'agrège que cinq listes écrites à la main pour
 * l'accueil : tendances, best-sellers, jumeaux, coffret et familles. Reef n'y
 * figurait que dans une seule, d'où trois flacons proposés là où la boutique
 * en tient vingt-huit. Le coffret demandait douze échantillons qu'on ne
 * pouvait pas réunir.
 *
 * Ce module vit à part parce qu'il importe `search-catalog`, qui agrège huit
 * fichiers de données à l'import : il doit rester sur le SERVEUR. La page
 * appelle `sampleProductsFromCatalog()` et passe le résultat en prop au
 * sélecteur, qui reste un composant client sans rien connaître du catalogue.
 */

import { SEARCH_PRODUCTS } from "@/data/search-catalog";
import {
  SAMPLE_PRODUCTS,
  brandKey,
  isBrandAvailable,
  type SampleProduct,
  type SampleCollectionId,
  type SampleFamilyId,
} from "@/data/sample-selector-products";

/**
 * Vignettes de remplacement pour le sélecteur. Une fiole se choisit sur une
 * carte de 120 px : un flacon détouré sur fond clair s'y lit, une mise en
 * scène non. Reef 33 arrivait avec son rendu sur mur ocre, qui reste sa photo
 * ailleurs sur le site. Clé : maison normalisée + nom slugifié.
 */
const THUMB_OVERRIDES: Readonly<Record<string, string>> = {
  "reef|reef-33": "/assets/products/reef-33-fond-blanc.webp",
};

/** Familles du sélecteur, déduites du texte disponible sur la référence. */
function familyOf(text: string): SampleFamilyId {
  const s = text.toLowerCase();
  const has = (...k: string[]) => k.some((w) => s.includes(w));
  if (has("oud", "agar")) return "oud";
  if (has("rose", "pivoine")) return "rose";
  if (has("musc", "musk")) return "musk";
  if (has("vanille", "gourmand", "cafe", "café", "tonka", "caramel")) return "gourmand";
  if (has("safran", "epic", "épic", "poivre", "cardamome", "cannelle")) return "epice";
  if (has("ambr", "amber", "benjoin", "resine", "résine")) return "amber";
  if (has("bois", "santal", "cedre", "cèdre", "vetiver", "vétiver")) return "boise";
  if (has("frais", "aquatique", "marine", "bleu", "blue", "menthe")) return "fresh";
  if (has("floral", "jasmin", "fleur", "muguet", "iris")) return "floral";
  return "amber";
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Toutes les références en stock des maisons ouvertes aux échantillons, plus
 * les entrées déjà présentes dans les listes de l'accueil — celles-ci portent
 * des visuels choisis et des étiquettes (best-seller, coup de cœur) que le
 * catalogue ne connaît pas. La fusion se fait sur maison + nom.
 */
export function sampleProductsFromCatalog(): SampleProduct[] {
  const out = new Map<string, SampleProduct>();

  /**
   * Un seul libellé par maison. Les sources ne l'écrivent pas pareil — « Reef »
   * dans les listes de l'accueil, « Reef Perfumes » dans la boutique — et le
   * filtre affichait deux pastilles pour la même maison, chacune ne montrant
   * qu'une partie de ses flacons. On retient le libellé le plus porté.
   */
  const votes = new Map<string, Map<string, number>>();
  for (const p of [...SAMPLE_PRODUCTS, ...SEARCH_PRODUCTS]) {
    if (!isBrandAvailable(p.brand)) continue;
    const k = brandKey(p.brand);
    const m = votes.get(k) ?? new Map<string, number>();
    m.set(p.brand, (m.get(p.brand) ?? 0) + 1);
    votes.set(k, m);
  }
  const canonical = (brand: string): string => {
    const m = votes.get(brandKey(brand));
    if (!m) return brand;
    return [...m.entries()].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)[0][0];
  };

  const thumb = (brand: string, name: string, fallback: string): string =>
    THUMB_OVERRIDES[`${brandKey(brand)}|${slugify(name)}`] ?? fallback;

  // Les entrées éditorialisées d'abord : elles gagnent en cas de doublon.
  for (const p of SAMPLE_PRODUCTS) {
    if (!p.available) continue;
    out.set(`${brandKey(p.brand)}|${slugify(p.name)}`, {
      ...p,
      brand: canonical(p.brand),
      image: thumb(p.brand, p.name, p.image),
    });
  }

  for (const p of SEARCH_PRODUCTS) {
    if (!isBrandAvailable(p.brand)) continue;
    // Une fiole se prélève sur un flacon : pas de coffret, pas de lot, pas de
    // brume corporelle, et rien sans prix ni visuel.
    if (!p.image || !p.price) continue;
    if (/lot|pack|coffret|body|brume|spray corporel|gift/i.test(p.name)) continue;

    const key = `${brandKey(p.brand)}|${slugify(p.name)}`;
    if (out.has(key)) continue;

    const tags: SampleCollectionId[] = [];
    if (p.popularity >= 60) tags.push("best");
    if (p.price >= 60) tags.push("limited");
    if (tags.length === 0) tags.push("niche");

    out.set(key, {
      id: `smp-cat-${slugify(p.brand)}-${slugify(p.name)}`,
      name: p.name,
      brand: canonical(p.brand),
      image: thumb(p.brand, p.name, p.image),
      price: p.price,
      family: familyOf([p.name, p.family, ...(p.notes ?? [])].filter(Boolean).join(" ")),
      popularity: Math.max(5, Math.min(100, Math.round(p.popularity))),
      tags,
      available: true,
    });
  }

  return Array.from(out.values()).sort((a, b) => b.popularity - a.popularity);
}
