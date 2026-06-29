/**
 * Table de correspondances « jumeaux olfactifs » — ÉDITABLE par l'équipe.
 * Cadre légal : usage nominatif des marques cibles (texte seul, aucun logo).
 * Vocabulaire UI : « inspiré de » / « jumeau olfactif » — jamais « clone/copie/dupe ».
 *
 * En production, `product` serait résolu depuis le catalogue via `productHandle`
 * (nom / prix / image / lien réels). Ici les champs sont fournis pour la preview.
 */
export type OlfactiveMatch = {
  key: string;
  targetName: string; // nom texte de la marque cible (usage nominatif)
  targetPriceHint?: string; // indicatif, optionnel — ex. « ≈ 320 € »
  productHandle: string; // handle/SKU du produit oriental dans le catalogue
  family: string; // famille olfactive (traduisible à terme)
  description: string; // 1 phrase profil olfactif (traduisible à terme)
  product: {
    name: string;
    brand: string;
    price: number; // « dès X € »
    image: string;
    href: string;
  };
};

export const OLFACTIVE_TWINS: OlfactiveMatch[] = [
  {
    key: "aventus",
    targetName: "Creed · Aventus",
    targetPriceHint: "≈ 320 €",
    productHandle: "armaf-club-de-nuit-intense-man",
    family: "Fruité · Boisé · Fumé",
    description: "Ananas, bouleau, mousse de chêne. Un sillage masculin charismatique et tenace.",
    product: { name: "Club de Nuit Intense Man", brand: "Armaf", price: 19.9, image: "/assets/prod-4.jpg", href: "/promo-flash" },
  },
  {
    key: "br540",
    targetName: "Baccarat Rouge 540",
    targetPriceHint: "≈ 300 €",
    productHandle: "lattafa-yara",
    family: "Ambré · Sucré · Floral",
    description: "Safran lumineux, ambre cristallin et fleurs poudrées — une signature addictive.",
    product: { name: "Yara", brand: "Lattafa", price: 18.9, image: "/assets/prod-1.jpg", href: "/promo-flash" },
  },
  {
    key: "angels-share",
    targetName: "Kilian · Angels' Share",
    targetPriceHint: "≈ 290 €",
    productHandle: "lattafa-khamrah",
    family: "Gourmand · Boisé · Épicé",
    description: "Cognac chaleureux, cannelle et tonka — un gourmand boisé enveloppant.",
    product: { name: "Khamrah", brand: "Lattafa", price: 21.9, image: "/assets/prod-2.jpg", href: "/promo-flash" },
  },
  {
    key: "oud-wood",
    targetName: "Tom Ford · Oud Wood",
    targetPriceHint: "≈ 280 €",
    productHandle: "al-haramain-amber-oud",
    family: "Oud · Boisé · Épicé",
    description: "Oud fumé, santal et poivre — une profondeur orientale racée.",
    product: { name: "Amber Oud", brand: "Al Haramain", price: 29.9, image: "/assets/prod-2.jpg", href: "/promo-flash" },
  },
  {
    key: "black-opium",
    targetName: "YSL · Black Opium",
    targetPriceHint: "≈ 110 €",
    productHandle: "maison-alhambra-coffee",
    family: "Gourmand · Café · Vanille",
    description: "Café noir, vanille et fleur d'oranger — un sillage nocturne et magnétique.",
    product: { name: "Coffee", brand: "Maison Alhambra", price: 16.9, image: "/assets/prod-5.jpg", href: "/promo-flash" },
  },
  {
    key: "sauvage",
    targetName: "Dior · Sauvage",
    targetPriceHint: "≈ 110 €",
    productHandle: "armaf-tres-nuit",
    family: "Aromatique · Frais · Ambré",
    description: "Bergamote, poivre et ambroxan — une fraîcheur épicée moderne.",
    product: { name: "Tres Nuit", brand: "Armaf", price: 17.9, image: "/assets/prod-3.jpg", href: "/promo-flash" },
  },
  {
    key: "good-girl",
    targetName: "Carolina Herrera · Good Girl",
    targetPriceHint: "≈ 120 €",
    productHandle: "lattafa-fakhar-femme",
    family: "Floral · Gourmand · Tonka",
    description: "Jasmin, fève tonka et cacao — un floral gourmand affirmé.",
    product: { name: "Fakhar Femme", brand: "Lattafa", price: 18.9, image: "/assets/prod-6.jpg", href: "/promo-flash" },
  },
  {
    key: "1-million",
    targetName: "Paco Rabanne · 1 Million",
    targetPriceHint: "≈ 95 €",
    productHandle: "maison-alhambra-the-tux",
    family: "Épicé · Cuir · Ambré",
    description: "Cuir, cannelle et ambre — une signature chaude et opulente.",
    product: { name: "The Tux", brand: "Maison Alhambra", price: 16.9, image: "/assets/prod-4.jpg", href: "/promo-flash" },
  },
];
