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
  /**
   * Nombre de fioles, SEULEMENT pour un coffret d'échantillons. Un pack de
   * flacons pleins n'en déclare pas : la carte ne dessine l'éventail de fioles
   * que si ce champ est là, sinon elle promettait des échantillons sur un trio
   * d'eaux de parfum 30 ml.
   */
  sampleCount?: number;
  /**
   * Affiche « dès X € » au lieu du prix sec : le pack se compose, et `price`
   * n'en est que le point d'entrée. Sans ce drapeau, le prix reste ferme.
   */
  priceFrom?: boolean;
};

export const DEMO: Pack[] = [
  {
    slug: "pack-echantillons-signature",
    name: "Pack Échantillons Signature",
    subtitle: "5 fioles · 2 ml · à composer",
    image: "/assets/coffret-reef.jpg",
    price: 9,
    priceFrom: true,
    badge: "bestseller",
    available: true,
    variantId: "pack-echantillons-signature",
    href: "/preview/selecteur-echantillons",
    sampleCount: 5,
  },
  {
    slug: "pack-echantillons-decouverte",
    name: "Pack Échantillons Découverte",
    subtitle: "3 fioles · 2 ml · à composer",
    image: "/assets/coffrets.jpg",
    price: 9,
    priceFrom: true,
    badge: "most_gifted",
    available: true,
    variantId: "pack-echantillons-decouverte",
    href: "/preview/selecteur-echantillons",
    sampleCount: 3,
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
  },
];
