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
  {
    id: "top-aurum",
    slug: "reef-aurum",
    brand: "Reef",
    name: "Aurum",
    notes: "Boisé · Ambré · Doré",
    // « Doré » n'est pas une matière : sans famille déclarée, seul « Boisé »
    // aurait voté, et « Ambré » aussi — l'égalité se serait jouée ailleurs.
    family: "Boisé",
    image: "/assets/products/aurum.webp",
    price: { amount: 75, currency: CURRENCY },
    compareAtPrice: { amount: 99.9, currency: CURRENCY },
    onSale: true,
  },
  {
    id: "top-oud-roses",
    slug: "oud-roses",
    brand: "Atelier Oud",
    name: "Oud and Roses",
    notes: "Oud · Rose · Safran",
    // Un oud-rose : l'oud porte, la rose se pose dessus — et le nom le dit.
    family: "Boisé",
    image: "/assets/products/oud-roses.webp",
    price: { amount: 74.5, currency: CURRENCY },
  },
  {
    id: "top-vanilla-voyage",
    slug: "vanilla-voyage",
    brand: "Maison Yara",
    name: "Vanilla Voyage",
    notes: "Vanille · Tonka · Ambre",
    family: "Gourmand",
    image: "/assets/products/dp_parfumerie-maison-asrar-vanilla-voyage-env-04.webp",
    price: { amount: 49, currency: CURRENCY },
    compareAtPrice: { amount: 69.9, currency: CURRENCY },
    onSale: true,
  },
  {
    id: "top-reef33",
    slug: "reef-33",
    brand: "Reef",
    name: "Reef 33",
    notes: "Frais · Aquatique · Boisé",
    family: "Frais",
    // Même packshot sur blanc que le rail Reef : les deux rangées voisinent.
    image: "/assets/products/reef-33-fond-blanc.webp",
    price: { amount: 70, currency: CURRENCY },
    compareAtPrice: { amount: 89.9, currency: CURRENCY },
    onSale: true,
  },
  {
    id: "top-volcano",
    slug: "reef-volcano",
    brand: "Reef",
    name: "Volcano",
    notes: "Boisé · Minéral · Épicé",
    family: "Boisé",
    image: "/assets/products/volcano.webp",
    price: { amount: 47.9, currency: CURRENCY },
  },
];
