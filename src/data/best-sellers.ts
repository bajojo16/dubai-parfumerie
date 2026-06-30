/**
 * Données « Découvrez la marque Reef » — rail best-sellers.
 * Démo embarquée ; en prod résolu depuis le catalogue (prix/stock/devise serveur).
 */
import type { EditorialCard, RailProduct } from "@/components/sections/best-sellers-rail";

const CURRENCY = "EUR";

export const REEF_EDITORIAL: EditorialCard = {
  title: "La maison Reef",
  subtitle:
    "Des flacons sculptés comme des œuvres d'art, des sillages signature inspirés du Golfe.",
  ctaLabel: "Découvrir Reef",
  href: "/marques/reef",
  video: {
    src: "/assets/videos/reef33.mp4",
    poster: "/assets/reef/reef33.jpg",
  },
};

export const REEF_PRODUCTS: RailProduct[] = [
  {
    id: "reef-aurum",
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
    id: "reef-33",
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
    id: "reef-summer",
    slug: "reef-summer",
    brand: "Reef",
    name: "Summer",
    notes: "Floral · Fruité · Frais",
    image: "/assets/reef/summer.jpg",
    price: { amount: 44.9, currency: CURRENCY },
    compareAtPrice: { amount: 56.9, currency: CURRENCY },
    onSale: true,
  },
  {
    id: "reef-volcano",
    slug: "reef-volcano",
    brand: "Reef",
    name: "Volcano",
    notes: "Boisé · Minéral · Épicé",
    image: "/assets/reef/volcano.jpg",
    price: { amount: 47.9, currency: CURRENCY },
    compareAtPrice: { amount: 59.9, currency: CURRENCY },
    onSale: true,
  },
];
