/**
 * Catalogue du « Sélecteur d'échantillons » — DÉRIVÉ du catalogue existant.
 *
 * ⚠️ Pas de catalogue inventé : ce fichier AGRÈGE et NORMALISE les sources de
 * données réelles déjà présentes dans le repo (noms / marques / images / prix
 * réels), puis DÉRIVE les champs manquants (famille olfactive, popularité,
 * collections) à partir de champs existants.
 *
 * Sources branchées :
 *   - trend-products.ts   (DEMO_TRENDS)        → tendances réseaux, rank
 *   - best-sellers-top.ts (TOP_PRODUCTS)       → best-sellers, notes
 *   - olfactive-twins.ts  (OLFACTIVE_TWINS)    → parfums de niche « inspiré de »
 *   - bundle-products.ts  (BUNDLE_PRODUCTS)    → coups de cœur, badge
 *   - scent-families.ts   (DEMO_SCENT_FAMILIES)→ familles olfactives réelles
 *
 * ─── Champs DÉRIVÉS (à remplacer par des metafields / tags back-office) ───
 *   family      → famille olfactive canonique. En prod : metafield
 *                 `custom.scent_family` (une valeur). Ici inférée des `notes`
 *                 ou de la clé `family` de la source.
 *   popularity  → score 0..100. En prod : ventes / `rank` réel. Ici dérivé de
 *                 `rank` (trends), position (best-sellers), `badge`, `rating`.
 *   tags        → collections marketing. En prod : tags Shopify / metafield
 *                 `custom.collections` (liste). Ici dérivées de la source et de
 *                 signaux réels (badge, rank, prix pour « édition limitée »).
 *
 * `id` sert d'identifiant panier stable. `image` retombe sur un flacon SVG
 * générique (composant) si le fichier est manquant.
 */

import { DEMO_TRENDS } from "@/data/trend-products";
import { TOP_PRODUCTS } from "@/data/best-sellers-top";
import { OLFACTIVE_TWINS } from "@/data/olfactive-twins";
import { BUNDLE_PRODUCTS } from "@/data/bundle-products";
import { DEMO_SCENT_FAMILIES } from "@/data/scent-families";

// ─── Familles olfactives (config, pas en dur dans le composant) ──────────────
// `tint` = teinte du flacon SVG de repli quand l'image produit manque.
export type SampleFamilyId =
  | "oud"
  | "rose"
  | "amber"
  | "boise"
  | "musk"
  | "fresh"
  | "floral"
  | "gourmand"
  | "epice";

export interface SampleFamily {
  id: SampleFamilyId;
  label: string;
  tint: string;
}

export const SAMPLE_FAMILIES: Record<SampleFamilyId, SampleFamily> = {
  oud: { id: "oud", label: "Oud", tint: "#6b4a2e" },
  rose: { id: "rose", label: "Rose", tint: "#b06a72" },
  amber: { id: "amber", label: "Ambré", tint: "#c08a3e" },
  boise: { id: "boise", label: "Boisé", tint: "#8a6f4a" },
  musk: { id: "musk", label: "Musc", tint: "#cbb892" },
  fresh: { id: "fresh", label: "Frais", tint: "#8fa9a3" },
  floral: { id: "floral", label: "Floral", tint: "#c98fa8" },
  gourmand: { id: "gourmand", label: "Gourmand", tint: "#b98a5e" },
  epice: { id: "epice", label: "Épicé", tint: "#b5532e" },
};

// ─── Collections / filtres « Sélections » (config, pas en dur) ───────────────
export type SampleCollectionId =
  | "best"
  | "fav"
  | "trend"
  | "new"
  | "niche"
  | "limited";

export interface SampleCollection {
  id: SampleCollectionId | "all";
  label: string;
  icon: string;
}

/** Liste des chips « Sélections » (« Toutes » en tête). */
export const SAMPLE_COLLECTIONS: SampleCollection[] = [
  { id: "all", label: "Toutes", icon: "" },
  { id: "best", label: "Best-sellers", icon: "★" },
  { id: "fav", label: "Coups de cœur", icon: "♥" },
  { id: "trend", label: "Tendance réseaux", icon: "✦" },
  { id: "new", label: "Nouveautés", icon: "✧" },
  { id: "niche", label: "Parfums de niche", icon: "❖" },
  { id: "limited", label: "Éditions limitées", icon: "◆" },
];

/** Pastille compacte affichée en haut de vignette (1re collection). */
export const COLLECTION_META: Record<
  SampleCollectionId,
  { icon: string; short: string }
> = {
  best: { icon: "★", short: "Best" },
  fav: { icon: "♥", short: "Cœur" },
  trend: { icon: "✦", short: "Tendance" },
  new: { icon: "✧", short: "Nouveau" },
  niche: { icon: "❖", short: "Niche" },
  limited: { icon: "◆", short: "Limitée" },
};

// ─── Produit normalisé consommé par le sélecteur ─────────────────────────────
export interface SampleProduct {
  id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  family: SampleFamilyId;
  popularity: number; // 0..100
  tags: SampleCollectionId[];
}

// ─── Helpers de dérivation ───────────────────────────────────────────────────

/** Infère la famille canonique depuis un texte (notes / nom / famille source). */
function inferFamily(text: string): SampleFamilyId {
  const s = text.toLowerCase();
  const has = (...k: string[]) => k.some((w) => s.includes(w));
  if (has("oud", "agar")) return "oud";
  if (has("rose", "pivoine", "rosé")) return "rose";
  if (has("musc", "musk")) return "musk";
  if (has("vanille", "gourmand", "café", "cafe", "tonka", "caramel", "sucré"))
    return "gourmand";
  if (has("safran", "épic", "epic", "poivre", "cardamome", "cannelle"))
    return "epice";
  if (has("ambr", "amber", "benjoin", "résine", "resine")) return "amber";
  if (has("bois", "santal", "cèdre", "cedre", "vétiver", "vetiver"))
    return "boise";
  if (has("frais", "aquatique", "marine", "reef", "bleu", "blue", "menthe"))
    return "fresh";
  if (has("floral", "jasmin", "fleur", "muguet", "iris")) return "floral";
  return "amber";
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const clamp = (n: number) => Math.max(5, Math.min(100, Math.round(n)));

// ─── Agrégation + dérivation ─────────────────────────────────────────────────

type Draft = Omit<SampleProduct, "id" | "tags"> & { tags: SampleCollectionId[] };

function build(): SampleProduct[] {
  const drafts: Draft[] = [];

  // 1) Tendances réseaux — tag `trend`, popularité dérivée du `rank`.
  DEMO_TRENDS.forEach((p) => {
    const tags: SampleCollectionId[] = ["trend"];
    if (p.rank <= 2) tags.push("best"); // top rank => best-seller
    if (p.rank >= 4) tags.push("new"); // bas de classement => nouveauté récente
    if (p.compareAtPrice) tags.push("fav"); // en promo => coup de cœur mis en avant
    drafts.push({
      name: p.name,
      brand: p.brand,
      image: p.image,
      price: p.price,
      family: inferFamily(`${p.name} ${p.brand}`),
      popularity: clamp(100 - (p.rank - 1) * 6),
      tags,
    });
  });

  // 2) Best-sellers — tag `best`, famille inférée des `notes`.
  TOP_PRODUCTS.forEach((p, i) => {
    const tags: SampleCollectionId[] = ["best"];
    if (i === TOP_PRODUCTS.length - 1) tags.push("new");
    if (p.onSale) tags.push("fav");
    drafts.push({
      name: p.name,
      brand: p.brand,
      image: p.image,
      price: p.price.amount,
      family: inferFamily(p.notes ?? p.name),
      popularity: clamp(92 - i * 5),
      tags,
    });
  });

  // 3) Parfums de niche « inspiré de » — tag `niche`, famille depuis `family`.
  OLFACTIVE_TWINS.forEach((m, i) => {
    const tags: SampleCollectionId[] = ["niche"];
    if (i < 3) tags.push("fav");
    drafts.push({
      name: m.product.name,
      brand: m.product.brand,
      image: m.product.image,
      price: m.product.price,
      family: inferFamily(`${m.family} ${m.product.name}`),
      popularity: clamp(68 - i * 3),
      tags,
    });
  });

  // 4) Coups de cœur (bundle) — badge `Best-seller` => `best`, sinon `fav`.
  BUNDLE_PRODUCTS.forEach((p) => {
    const tags: SampleCollectionId[] =
      p.badge === "Best-seller" ? ["best", "fav"] : ["fav"];
    drafts.push({
      name: p.name,
      brand: p.brand,
      image: p.image,
      price: p.price,
      family: inferFamily(`${p.notes} ${p.name}`),
      popularity: clamp(p.badge === "Best-seller" ? 84 : 58),
      tags,
    });
  });

  // 5) Familles olfactives — famille RÉELLE (clé source), tag `fav`/`niche`.
  DEMO_SCENT_FAMILIES.forEach((fam) => {
    const familyId = inferFamily(fam.key + " " + fam.label);
    fam.products.forEach((prod, i) => {
      const tags: SampleCollectionId[] = i === 0 ? ["fav"] : ["niche"];
      drafts.push({
        name: prod.name,
        brand: prod.brand,
        image: prod.image,
        price: prod.price,
        family: familyId,
        popularity: clamp(64 + i * 4),
        tags,
      });
    });
  });

  // ─── Dérivation « Éditions limitées » : signal prix élevé (documenté). ─────
  // En prod : tag Shopify `edition-limitee`. Ici : prix > 60 € = pièce rare.
  drafts.forEach((d) => {
    if (d.price > 60 && !d.tags.includes("limited")) d.tags.push("limited");
  });

  // ─── Dédup par marque+nom (fusion des tags, popularité max). ──────────────
  const map = new Map<string, Draft>();
  drafts.forEach((d) => {
    const key = `${d.brand}|${d.name}`.toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.tags = Array.from(new Set([...existing.tags, ...d.tags]));
      existing.popularity = Math.max(existing.popularity, d.popularity);
    } else {
      map.set(key, { ...d, tags: [...d.tags] });
    }
  });

  return Array.from(map.values()).map((d) => ({
    id: `smp-${slugify(d.brand)}-${slugify(d.name)}`,
    ...d,
  }));
}

/** Catalogue prêt à l'emploi pour <SampleSelector products={...} />. */
export const SAMPLE_PRODUCTS: SampleProduct[] = build();

/** Marques disponibles (« Toutes » en tête) — dérivé du catalogue. */
export const SAMPLE_BRANDS: string[] = [
  "Toutes",
  ...Array.from(new Set(SAMPLE_PRODUCTS.map((p) => p.brand))),
];
