/**
 * Catalogue LOCAL normalisé pour le FragranceFinder.
 *
 * Le projet n'est PAS Shopify. On agrège ici les produits démo existants
 * (trend-products, best-sellers Reef, oil-products, scent-families) et on
 * leur attache les attributs olfactifs nécessaires au moteur de reco
 * (familles, notes, intensité 1-3, genre, prix, isBestseller, isNew).
 *
 * En production : remplacer ce fallback par les attributs résolus depuis
 * le catalogue serveur (mêmes slugs de familles/notes pour rester compatible).
 *
 * Slugs de familles : amber, woody, floral, fresh, oud, musk, spicy, gourmand, rose.
 * Slugs de notes    : oud, rose, vanilla, musk, citrus, spicy, powdery, woody, amber.
 */
import type { CatalogProduct } from "../types";
import { DEMO_TRENDS } from "@/data/trend-products";
import { REEF_PRODUCTS } from "@/data/best-sellers";
import { DEMO as OIL_DEMO } from "@/data/oil-products";

/**
 * Table d'attributs démo : slug produit → attributs olfactifs.
 * (handle/id → { families, notes, intensity, gender, isBestseller, isNew })
 * Sert de fallback quand le catalogue n'expose pas ces champs.
 */
export const PRODUCT_ATTRIBUTES: Record<
  string,
  Pick<CatalogProduct, "families" | "notes" | "intensity" | "gender" | "isBestseller" | "isNew">
> = {
  // ── Tendances (DEMO_TRENDS) ──
  "vanilla-voyage": {
    families: ["gourmand", "amber"],
    notes: ["vanilla", "amber", "powdery"],
    intensity: 2,
    gender: "women",
    isBestseller: true,
    isNew: false,
  },
  "oud-roses": {
    families: ["oud", "floral", "rose"],
    notes: ["oud", "rose", "spicy"],
    intensity: 3,
    gender: "unisex",
    isBestseller: true,
    isNew: false,
  },
  "reef-33": {
    families: ["fresh", "woody"],
    notes: ["citrus", "woody"],
    intensity: 1,
    gender: "men",
    isBestseller: false,
    isNew: false,
  },
  aurum: {
    families: ["amber", "woody"],
    notes: ["amber", "woody", "spicy"],
    intensity: 3,
    gender: "unisex",
    isBestseller: true,
    isNew: false,
  },
  "amber-nuit": {
    families: ["amber", "gourmand"],
    notes: ["amber", "vanilla", "powdery"],
    intensity: 2,
    gender: "women",
    isBestseller: false,
    isNew: true,
  },

  // ── Best-sellers Reef ──
  "reef-aurum": {
    families: ["woody", "amber"],
    notes: ["woody", "amber"],
    intensity: 2,
    gender: "men",
    isBestseller: true,
    isNew: false,
  },
  "reef-summer": {
    families: ["floral", "fresh"],
    notes: ["citrus", "rose"],
    intensity: 1,
    gender: "women",
    isBestseller: false,
    isNew: true,
  },
  "reef-volcano": {
    families: ["woody", "spicy"],
    notes: ["woody", "spicy"],
    intensity: 3,
    gender: "men",
    isBestseller: false,
    isNew: false,
  },

  // ── Huiles concentrées ──
  tanasuk: {
    families: ["amber", "oud", "spicy"],
    notes: ["amber", "oud", "spicy"],
    intensity: 3,
    gender: "unisex",
    isBestseller: true,
    isNew: false,
  },
  noora: {
    families: ["rose", "amber", "woody"],
    notes: ["rose", "amber", "powdery"],
    intensity: 2,
    gender: "women",
    isBestseller: false,
    isNew: false,
  },
};

/** Attributs par défaut si un produit n'est pas dans la table (sécurité). */
const FALLBACK_ATTRS: Pick<
  CatalogProduct,
  "families" | "notes" | "intensity" | "gender" | "isBestseller" | "isNew"
> = {
  families: ["amber"],
  notes: ["musk"],
  intensity: 2,
  gender: "unisex",
  isBestseller: false,
  isNew: false,
};

/**
 * Construit le catalogue local normalisé à partir des données démo existantes.
 * Déduplique par slug (un produit peut apparaître dans plusieurs sources).
 */
export function buildLocalCatalog(): CatalogProduct[] {
  const bySlug = new Map<string, CatalogProduct>();

  const add = (p: Omit<CatalogProduct, keyof typeof FALLBACK_ATTRS>) => {
    if (bySlug.has(p.slug)) return;
    const attrs = PRODUCT_ATTRIBUTES[p.slug] ?? FALLBACK_ATTRS;
    bySlug.set(p.slug, { ...p, ...attrs });
  };

  // Tendances
  for (const t of DEMO_TRENDS) {
    add({
      id: t.variantId,
      slug: t.slug,
      name: t.name,
      brand: t.brand,
      price: t.price,
      image: t.image,
    });
  }
  // Best-sellers Reef
  for (const r of REEF_PRODUCTS) {
    add({
      id: r.id,
      slug: r.slug,
      name: r.name,
      brand: r.brand,
      price: r.price.amount,
      image: r.image,
    });
  }
  // Huiles concentrées
  for (const o of OIL_DEMO) {
    add({
      id: o.variantId,
      slug: o.slug,
      name: o.name,
      brand: o.brand,
      price: o.price,
      image: o.bottleImage,
    });
  }

  return [...bySlug.values()];
}

/** Catalogue local prêt à l'emploi (démo). */
export const LOCAL_CATALOG: CatalogProduct[] = buildLocalCatalog();
