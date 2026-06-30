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
  /** Nombre de fioles d'échantillons dans le coffret (pastille « xN »). */
  sampleCount?: number;
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
    sampleCount: 3,
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
    sampleCount: 5,
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
    sampleCount: 2,
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
    sampleCount: 3,
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
    sampleCount: 3,
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
    sampleCount: 4,
  },
  {
    slug: "coffret-ambre-saphir",
    name: "Coffret Ambre & Saphir",
    subtitle: "Trio ambré · 30 ml",
    image: "/assets/prod-2.jpg",
    price: 139,
    compareAtPrice: 175,
    badge: "bestseller",
    available: true,
    variantId: "pack-coffret-ambre-saphir",
    href: "/produit/coffret-ambre-saphir",
    sampleCount: 3,
  },
  {
    slug: "edition-musc-imperial",
    name: "Édition Musc Impérial",
    subtitle: "Coffret limité · 4 fioles",
    image: "/assets/prod-4.jpg",
    price: 199,
    compareAtPrice: 245,
    badge: "limited",
    available: true,
    variantId: "pack-edition-musc-imperial",
    href: "/produit/edition-musc-imperial",
    sampleCount: 4,
  },
  {
    slug: "pack-rose-de-taif",
    name: "Pack Rose de Taïf",
    subtitle: "Duo floral oriental · 50 ml",
    image: "/assets/coffret-reef.jpg",
    price: 109,
    compareAtPrice: 129,
    badge: "coup_de_coeur",
    available: true,
    variantId: "pack-rose-de-taif",
    href: "/produit/pack-rose-de-taif",
    sampleCount: 2,
  },
];
