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
    image: "/assets/reef/aurum.jpg",
    price: { amount: 64.9, currency: CURRENCY },
    compareAtPrice: { amount: 84.9, currency: CURRENCY },
    onSale: true,
  },
  {
    id: "top-oud-roses",
    slug: "oud-roses",
    brand: "Atelier Oud",
    name: "Oud & Roses",
    notes: "Oud · Rose · Safran",
    image: "/assets/prod-1.jpg",
    price: { amount: 79.9, currency: CURRENCY },
  },
  {
    id: "top-vanilla-voyage",
    slug: "vanilla-voyage",
    brand: "Maison Yara",
    name: "Vanilla Voyage",
    notes: "Vanille · Tonka · Ambre",
    image: "/assets/prod-2.jpg",
    price: { amount: 58.9, currency: CURRENCY },
    compareAtPrice: { amount: 69.9, currency: CURRENCY },
    onSale: true,
  },
  {
    id: "top-reef33",
    slug: "reef-33",
    brand: "Reef",
    name: "Reef 33",
    notes: "Frais · Aquatique · Boisé",
    image: "/assets/reef/reef33.jpg",
    price: { amount: 49.9, currency: CURRENCY },
    compareAtPrice: { amount: 62.9, currency: CURRENCY },
    onSale: true,
  },
  {
    id: "top-volcano",
    slug: "reef-volcano",
    brand: "Reef",
    name: "Volcano",
    notes: "Boisé · Minéral · Épicé",
    image: "/assets/reef/volcano.jpg",
    price: { amount: 47.9, currency: CURRENCY },
  },
];
