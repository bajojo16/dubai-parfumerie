/**
 * BundleProduct — sélection curée démo pour l'offre « 3 parfums pour le prix de 2 ».
 *
 * Démo embarquée : les visuels réutilisent des images produit existantes
 * (/assets/prod-*.jpg). En production, id/nom/marque/prix/stock seraient
 * résolus côté serveur depuis le catalogue (et l'éligibilité au lot via
 * la collection `lot-3-pour-2`).
 *
 * Champs alignés sur la maquette de référence (lot-3-pour-2.html) :
 *   - `notes`     → notes olfactives affichées sous le nom (comme la maquette)
 *   - `was`       → prix barré (référence) affiché à côté du prix actuel
 *   - `badge`     → pastille optionnelle (ex. « Best-seller »)
 *   - `available` → `false` simule une rupture de stock (bouton « Épuisé »)
 * `brand` est conservé pour l'ajout au panier réel (`addItem`).
 */
export type BundleProduct = {
  id: string;
  name: string;
  brand: string;
  notes: string;
  price: number;
  was: number;
  image: string;
  available: boolean;
  badge?: string;
};

export const BUNDLE_PRODUCTS: BundleProduct[] = [
  {
    id: "bundle-aurum",
    name: "Aurum",
    brand: "Reef",
    notes: "Ambre, Bois de santal",
    price: 64.9,
    was: 129.9,
    image: "/assets/prod-1.jpg",
    available: true,
    badge: "Best-seller",
  },
  {
    id: "bundle-tanasuk",
    name: "Tanasuk",
    brand: "Al Haramain",
    notes: "Oud, Rose, Safran",
    price: 54.9,
    was: 109.9,
    image: "/assets/prod-2.jpg",
    available: true,
  },
  {
    id: "bundle-noora",
    name: "Noora",
    brand: "Al Haramain",
    notes: "Vanille, Musc blanc",
    price: 44.9,
    was: 89.9,
    image: "/assets/prod-3.jpg",
    available: true,
  },
  {
    id: "bundle-summer",
    name: "Summer",
    brand: "Reef",
    notes: "Poire, Ambre, Santal",
    price: 49.9,
    was: 99.9,
    image: "/assets/prod-4.jpg",
    available: true,
  },
  {
    id: "bundle-volcano",
    name: "Volcano",
    brand: "Reef",
    notes: "Encens, Cuir, Épices",
    price: 59.9,
    was: 119.9,
    image: "/assets/prod-5.jpg",
    // Rupture de stock démo : non sélectionnable, bouton « Épuisé ».
    available: false,
  },
  {
    id: "bundle-oud-royal",
    name: "Oud Royal",
    brand: "Ard Al Zaafaran",
    notes: "Oud, Ambre gris, Encens",
    price: 69.9,
    was: 139.9,
    image: "/assets/prod-6.jpg",
    available: true,
  },
  {
    id: "bundle-silk-rose",
    name: "Silk Rose",
    brand: "Lattafa",
    notes: "Rose de Taïf, Pivoine",
    price: 39.9,
    was: 79.9,
    image: "/assets/prod-1.jpg",
    available: true,
  },
];
