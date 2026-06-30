/**
 * OilProduct — huiles de parfum concentrées, cartes « Ajmal-style »
 * (flacon qui déborde au-dessus du haut de la carte).
 *
 * En production : bottleImage / decorAccents pointent vers /oils/*.png,
 * et le prix/stock/variante sont résolus côté serveur via `slug`.
 * Ici, données démo : on réutilise des visuels produit existants
 * (/assets/prod-*.jpg) comme flacon, et les icônes de familles
 * pointent vers /assets/scents/*.png (fallback pastille or si manquant).
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
    decorAccents: ["/oils/accent-leaf.png"],
    volume: "12 ml",
    gender: "Mixte",
    price: 34.9,
    compareAtPrice: 49.9,
    rating: 4.9,
    reviewCount: 214,
    families: [
      { label: "Ambré", icon: "/assets/scents/ambre.png" },
      { label: "Oud", icon: "/assets/scents/oud.png" },
      { label: "Épicé", icon: "/assets/scents/epice.png" },
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
    decorAccents: ["/oils/accent-rose.png"],
    volume: "12 ml",
    gender: "Femme",
    price: 27.9,
    compareAtPrice: 39.9,
    rating: 5.0,
    reviewCount: 98,
    families: [
      { label: "Rosé", icon: "/assets/scents/rose.png" },
      { label: "Ambré", icon: "/assets/scents/ambre.png" },
      { label: "Boisé", icon: "/assets/scents/boise.png" },
    ],
    available: false,
  },
];
