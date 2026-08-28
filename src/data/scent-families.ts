/**
 * ScentFamily — données pour « La Roue des Senteurs » (sélecteur interactif).
 * En production : products résolus depuis le catalogue (best-sellers par famille),
 * ingredientImage depuis le CDN. Ici données démo embarquées (2 produits/famille).
 */
export type ScentProduct = {
  name: string;
  brand: string;
  price: number;
  image: string;
  href: string;
};

export type ScentFamily = {
  key: string;
  label: string;
  color: string;
  description: string;
  ingredientImage: string;
  video?: string; // vidéo de fond optionnelle (boucle) quand la famille est active
  collectionSlug: string;
  products: ScentProduct[];
};

/**
 * Visuels : n'utiliser QUE des packshots nus (/assets/products, /assets/oils).
 * Les fichiers /assets/prod-1..6.jpg portent une pastille promotionnelle
 * INCRUSTÉE DANS LE PIXEL (« Victime de son succès », « Promo »), rognée au
 * bord de l'image : elle débordait de la vignette des cartes de la Roue. Ces
 * fichiers restent utilisés ailleurs (grilles où le cadrage l'absorbe), on ne
 * les touche pas — on ne les référence simplement plus ici.
 */
export const DEMO_SCENT_FAMILIES: ScentFamily[] = [
  {
    key: "oud",
    label: "Oud",
    color: "#6B4A2B",
    description:
      "Boisé profond et résineux, l'oud est le cœur de la parfumerie orientale. Une signature mystérieuse, animale et précieuse, issue du bois d'agar.",
    ingredientImage: "/assets/scents/oud.jpg",
    collectionSlug: "oud",
    products: [
      { name: "Oud Mood", brand: "Lattafa", price: 32.9, image: "/assets/products/oud-roses.webp", href: "/produit/oud-mood" },
      { name: "Shaghaf Oud", brand: "Swiss Arabian", price: 39.9, image: "/assets/products/shaghaf-oud.webp", href: "/produit/shaghaf-oud" },
    ],
  },
  {
    key: "rose",
    label: "Rose",
    color: "#C56B7A",
    description:
      "Florale et poudrée, la rose de Taïf apporte une élégance veloutée. Romantique et lumineuse, elle adoucit les compositions les plus intenses.",
    ingredientImage: "/assets/scents/rose.jpg",
    collectionSlug: "rose",
    products: [
      { name: "Rose pour Elle", brand: "Lattafa", price: 28.9, image: "/assets/products/yara.webp", href: "/produit/rose-pour-elle" },
      { name: "Rose de Taïf", brand: "Swiss Arabian", price: 42.9, image: "/assets/products/summer.webp", href: "/produit/rose-de-taif" },
    ],
  },
  {
    key: "ambre",
    label: "Ambré",
    color: "#C9912E",
    description:
      "Chaud, sucré et enveloppant, l'ambre diffuse une sensualité dorée. Notes de résine, vanille et benjoin pour un sillage réconfortant.",
    ingredientImage: "/assets/scents/ambre.jpg",
    collectionSlug: "ambre",
    products: [
      { name: "Amber Oud", brand: "Al Haramain", price: 34.9, image: "/assets/products/aurum.webp", href: "/produit/amber-oud" },
      { name: "Ambar Gold", brand: "Rasasi", price: 37.9, image: "/assets/oils/noora.png", href: "/produit/ambar-gold" },
    ],
  },
  {
    key: "boise",
    label: "Boisé",
    color: "#7A6A3A",
    description:
      "Sec et noble, le boisé évoque le santal et le cèdre. Une élégance racée et intemporelle, structure de nombreuses créations masculines.",
    ingredientImage: "/assets/scents/boise.jpg",
    collectionSlug: "boise",
    products: [
      { name: "Sandal Wood", brand: "Al Haramain", price: 36.9, image: "/assets/oils/tanasuk.png", href: "/produit/sandal-wood" },
      { name: "Santal Royal", brand: "Lattafa", price: 33.9, image: "/assets/products/vanilla-voyage.webp", href: "/produit/santal-royal" },
    ],
  },
  {
    key: "musc",
    label: "Musc",
    color: "#B9A88C",
    description:
      "Doux, propre et caressant, le musc enveloppe la peau d'un voile sensuel. Délicat et addictif, il signe les sillages les plus intimes.",
    ingredientImage: "/assets/scents/musc.jpg",
    collectionSlug: "musc",
    products: [
      { name: "Musk Mood", brand: "Lattafa", price: 24.9, image: "/assets/products/volcano.webp", href: "/produit/musk-mood" },
      { name: "White Musk", brand: "Swiss Arabian", price: 28.9, image: "/assets/products/reef-33.webp", href: "/produit/white-musk" },
    ],
  },
  {
    key: "epice",
    label: "Épicé",
    color: "#B5532E",
    description:
      "Vibrant et chaleureux, l'épicé réveille les sens : safran, cardamome et poivre. Une signature audacieuse, riche et orientale.",
    ingredientImage: "/assets/scents/epice-bg.jpg",
    video: "/assets/videos/roue-epice.mp4",
    collectionSlug: "epice",
    products: [
      { name: "Saffron Mood", brand: "Lattafa", price: 30.9, image: "/assets/oils/tanasuk.png", href: "/produit/saffron-mood" },
      { name: "Saffron Oud", brand: "Rasasi", price: 41.9, image: "/assets/oils/silk.png", href: "/produit/saffron-oud" },
    ],
  },
];
