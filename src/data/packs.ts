/**
 * Pack — « Coffrets & Packs » : trios/duos présentés sur un podium.
 * Données démo : on réutilise des visuels existants (/assets/coffret-*.jpg,
 * /assets/prod-*.jpg). En production, prix/stock/variante résolus via `slug`.
 *
 * "-X%" est calculé à partir de price/compareAtPrice (arrondi) côté carte,
 * uniquement si compareAtPrice est présent.
 */

export type PackBadge =
  | "bestseller"
  | "most_gifted"
  | "oud"
  | "limited"
  | "new"
  | "coup_de_coeur"
  | null;

export type Pack = {
  slug: string;
  name: string;
  subtitle?: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  badge?: PackBadge;
  available: boolean;
  variantId: string;
  href: string;
};

export const DEMO: Pack[] = [
  {
    slug: "trio-signature-oud",
    name: "Trio Signature Oud",
    subtitle: "3 eaux de parfum · 30 ml",
    image: "/assets/coffret-reef.jpg",
    price: 149,
    compareAtPrice: 189,
    badge: "bestseller",
    available: true,
    variantId: "pack-trio-signature-oud",
    href: "/produit/trio-signature-oud",
  },
  {
    slug: "coffret-decouverte-prestige",
    name: "Coffret Découverte Prestige",
    subtitle: "5 miniatures iconiques",
    image: "/assets/coffrets.jpg",
    price: 89,
    compareAtPrice: 110,
    badge: "most_gifted",
    available: true,
    variantId: "pack-coffret-decouverte-prestige",
    href: "/produit/coffret-decouverte-prestige",
  },
  {
    slug: "duo-oud-royal",
    name: "Duo Oud Royal",
    subtitle: "2 extraits · 50 ml",
    image: "/assets/prod-1.jpg",
    price: 179,
    compareAtPrice: 210,
    badge: "oud",
    available: true,
    variantId: "pack-duo-oud-royal",
    href: "/produit/duo-oud-royal",
  },
  {
    slug: "edition-nuit-doree",
    name: "Édition Nuit Dorée",
    subtitle: "Coffret limité · 3 pièces",
    image: "/assets/prod-3.jpg",
    price: 165,
    compareAtPrice: 199,
    badge: "limited",
    available: false,
    variantId: "pack-edition-nuit-doree",
    href: "/produit/edition-nuit-doree",
  },
  {
    slug: "pack-jardin-d-orient",
    name: "Pack Jardin d'Orient",
    subtitle: "Nouveau trio floral",
    image: "/assets/prod-5.jpg",
    price: 119,
    badge: "new",
    available: true,
    variantId: "pack-jardin-d-orient",
    href: "/produit/pack-jardin-d-orient",
  },
  {
    slug: "coffret-tendresse",
    name: "Coffret Tendresse",
    subtitle: "Duo + bougie parfumée",
    image: "/assets/prod-6.jpg",
    price: 95,
    compareAtPrice: 115,
    badge: "coup_de_coeur",
    available: true,
    variantId: "pack-coffret-tendresse",
    href: "/produit/coffret-tendresse",
  },
];
