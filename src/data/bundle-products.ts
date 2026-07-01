/**
 * BundleProduct — sélection curée démo pour l'offre « 3 parfums pour le prix de 2 ».
 *
 * Démo embarquée : les visuels réutilisent des images produit existantes
 * (/assets/prod-*.jpg). En production, id/nom/marque/prix/stock seraient
 * résolus côté serveur depuis le catalogue (et l'éligibilité au lot via
 * la collection `lot-3-pour-2`).
 *
 * Le champ `available:false` simule une rupture de stock (un produit épuisé).
 */
export type BundleProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  available: boolean;
};

export const BUNDLE_PRODUCTS: BundleProduct[] = [
  {
    id: "bundle-aurum",
    name: "Aurum",
    brand: "Reef",
    price: 64.9,
    image: "/assets/prod-1.jpg",
    available: true,
  },
  {
    id: "bundle-tanasuk",
    name: "Tanasuk",
    brand: "Al Haramain",
    price: 34.9,
    image: "/assets/prod-2.jpg",
    available: true,
  },
  {
    id: "bundle-noora",
    name: "Noora",
    brand: "Al Haramain",
    price: 27.9,
    image: "/assets/prod-3.jpg",
    available: true,
  },
  {
    id: "bundle-summer",
    name: "Summer",
    brand: "Reef",
    price: 44.9,
    image: "/assets/prod-4.jpg",
    available: true,
  },
  {
    id: "bundle-volcano",
    name: "Volcano",
    brand: "Reef",
    price: 47.9,
    image: "/assets/prod-5.jpg",
    // Rupture de stock démo : non sélectionnable, bouton « Épuisé ».
    available: false,
  },
  {
    id: "bundle-oud-royal",
    name: "Oud Royal",
    brand: "Ard Al Zaafaran",
    price: 39.9,
    image: "/assets/prod-6.jpg",
    available: true,
  },
  {
    id: "bundle-silk-rose",
    name: "Silk Rose",
    brand: "Lattafa",
    price: 29.9,
    image: "/assets/prod-1.jpg",
    available: true,
  },
];
