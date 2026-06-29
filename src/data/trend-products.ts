/**
 * Données démo "Tendances du moment".
 * En production : `rank`, `rating`, `reviewCount`, `available` résolus côté serveur.
 * variantId = id panier (CartItem.id). href = page produit.
 */
export type TrendProduct = {
  slug: string;
  name: string;
  brand: string;
  href: string;
  variantId: string;
  image: string;
  rank: number;
  price: number;
  compareAtPrice?: number;
  rating?: number;
  reviewCount?: number;
  available: boolean;
};

export const DEMO_TRENDS: TrendProduct[] = [
  {
    slug: "vanilla-voyage",
    name: "Vanilla Voyage",
    brand: "Dubaï Parfumerie",
    href: "/produit/vanilla-voyage",
    variantId: "vanilla-voyage-50",
    image: "/assets/prod-1.jpg",
    rank: 1,
    price: 59,
    compareAtPrice: 79, // Promo
    rating: 4.8,
    reviewCount: 214,
    available: true,
  },
  {
    slug: "oud-roses",
    name: "Oud & Roses",
    brand: "Dubaï Parfumerie",
    href: "/produit/oud-roses",
    variantId: "oud-roses-50",
    image: "/assets/prod-2.jpg",
    rank: 2,
    price: 72,
    rating: 4.9,
    reviewCount: 187,
    available: true,
  },
  {
    slug: "reef-33",
    name: "Reef 33",
    brand: "Dubaï Parfumerie",
    href: "/produit/reef-33",
    variantId: "reef-33-50",
    image: "/assets/prod-3.jpg",
    rank: 3,
    price: 64,
    rating: 4.7,
    reviewCount: 142,
    available: false, // Épuisé
  },
  {
    slug: "aurum",
    name: "Aurum",
    brand: "Dubaï Parfumerie",
    href: "/produit/aurum",
    variantId: "aurum-50",
    image: "/assets/prod-4.jpg",
    rank: 4,
    price: 88,
    rating: 4.6,
    reviewCount: 98,
    available: true,
  },
  {
    slug: "amber-nuit",
    name: "Amber Nuit",
    brand: "Dubaï Parfumerie",
    href: "/produit/amber-nuit",
    variantId: "amber-nuit-50",
    image: "/assets/prod-5.jpg",
    rank: 5,
    price: 69,
    rating: 4.5,
    reviewCount: 76,
    available: true,
  },
];
