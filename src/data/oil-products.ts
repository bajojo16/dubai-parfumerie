/**
 * OilProduct — huiles de parfum concentrées, cartes « Ajmal-style »
 * (flacon qui déborde au-dessus du haut de la carte).
 *
 * En production : bottleImage / decorAccents pointeront vers des assets dédiés,
 * et le prix/stock/variante sont résolus côté serveur via `slug`.
 * Ici, données démo : on réutilise des visuels produit existants
 * (/assets/oils/*.png) comme flacon, et les icônes de familles
 * pointent vers /assets/scents/*.jpg (fallback pastille or si manquant).
 * decorAccents est optionnel : aucun asset "accent" décoratif n'existe
 * encore dans public/, donc on ne le renseigne pas (évite les 404).
 */
export type OilFamily = {
  label: string;
  icon: string;
};

export type OilProduct = {
  slug: string;
  name: string;
  brand: string;
  href: string;
  variantId: string;
  bottleImage: string;
  decorAccents?: string[];
  volume: string;
  gender: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  families: OilFamily[];
  available: boolean;
};

export const DEMO: OilProduct[] = [
  {
    slug: "tanasuk",
    name: "Tanasuk",
    brand: "Al Haramain",
    href: "/produit/tanasuk",
    variantId: "tanasuk",
    bottleImage: "/assets/oils/tanasuk.png",
    volume: "12 ml",
    gender: "Mixte",
    price: 34.9,
    compareAtPrice: 49.9,
    rating: 4.9,
    reviewCount: 214,
    families: [
      { label: "Ambré", icon: "/assets/scents/ambre.jpg" },
      { label: "Oud", icon: "/assets/scents/oud.jpg" },
      { label: "Épicé", icon: "/assets/scents/epice.jpg" },
    ],
    available: true,
  },
  {
    slug: "noora",
    name: "Noora",
    brand: "Al Haramain",
    href: "/produit/noora",
    variantId: "noora",
    bottleImage: "/assets/oils/silk.png",
    volume: "12 ml",
    gender: "Femme",
    price: 27.9,
    compareAtPrice: 39.9,
    rating: 5.0,
    reviewCount: 98,
    families: [
      { label: "Rosé", icon: "/assets/scents/rose.jpg" },
      { label: "Ambré", icon: "/assets/scents/ambre.jpg" },
      { label: "Boisé", icon: "/assets/scents/boise.jpg" },
    ],
    available: false,
  },
];
