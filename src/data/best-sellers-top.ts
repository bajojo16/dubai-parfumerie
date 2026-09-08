/**
 * Données « Les plus aimés du moment » — variante rail best-sellers du site
 * avec carte éditoriale vidéo placée à la fin (editorialSide="end").
 * Démo embarquée ; en prod résolu depuis le catalogue (prix/stock/devise serveur).
 * Réutilise des assets existants de public/assets/.
 */
import type { EditorialCard, RailProduct } from "@/components/sections/best-sellers-rail";

const CURRENCY = "EUR";

export const TOP_EDITORIAL: EditorialCard = {
  title: "Nos best-sellers",
  subtitle:
    "Les sillages les plus aimés de la maison, plébiscités par notre communauté semaine après semaine.",
  ctaLabel: "Voir tout le classement",
  href: "/best-sellers",
  video: {
    src: "/assets/videos/aurum.mp4",
    poster: "/assets/reef/aurum.jpg",
  },
};

export const TOP_PRODUCTS: RailProduct[] = [
  // Rangée reprise sur la sélection « Les parfums de la rentrée » : quatre
  // références, mêmes maisons, mêmes prix, mêmes visuels. Les cinq flacons
  // Reef d'avant faisaient de ce rail un second rail Reef, alors qu'il en
  // existe déjà un juste au-dessus.
  {
    id: "top-blueberry-musk",
    slug: "arabiyat-prestige-blueberry-musk",
    brand: "Arabiyat Prestige",
    name: "Blueberry Musk",
    notes: "Myrtille · Musc · Vanille",
    family: "Gourmand",
    image: "/assets/products/blueberry/blueberry-packshot.jpg",
    price: { amount: 20, currency: CURRENCY },
    compareAtPrice: { amount: 25, currency: CURRENCY },
    onSale: true,
  },
  {
    id: "top-reef33",
    slug: "reef-33",
    brand: "Reef Perfumes",
    name: "Reef 33",
    notes: "Frais · Aquatique · Boisé",
    family: "Frais",
    // Packshot sur blanc, comme le rail Reef : les deux rangées voisinent.
    image: "/assets/products/reef-33-fond-blanc.webp",
    price: { amount: 70, currency: CURRENCY },
  },
  {
    id: "top-marshmallow-blush",
    slug: "paris-corner-marshmallow-blush",
    brand: "Paris Corner",
    name: "Marshmallow Blush",
    notes: "Guimauve · Fruits rouges · Musc",
    family: "Gourmand",
    image: "/assets/products/marshmallow-blush.webp",
    price: { amount: 39.5, currency: CURRENCY },
  },
  {
    id: "top-khamrah",
    slug: "lattafa-khamrah",
    brand: "Lattafa",
    name: "Khamrah",
    notes: "Datte · Cannelle · Praline",
    family: "Gourmand",
    image: "/assets/products/khamrah/khamrah-hf-05.jpg",
    price: { amount: 29, currency: CURRENCY },
  },
];
