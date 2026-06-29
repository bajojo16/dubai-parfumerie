"use client";

import { useLocale } from "next-intl";
import { addItem } from "@/lib/cart";
import {
  BestSellersRail,
  type EditorialCard,
  type RailProduct,
} from "@/components/sections/best-sellers-rail";

const EDITORIAL: EditorialCard = {
  title: "L'art de l'oud",
  subtitle:
    "Une fragrance, une signature. Composez votre collection sur-mesure.",
  ctaLabel: "Découvrir",
  href: "#",
  video: {
    src: "/assets/videos/aurum.mp4",
    poster: "/assets/prod-4.jpg",
  },
};

const CURRENCY = "EUR";

const PRODUCTS: RailProduct[] = [
  {
    id: "khamrah",
    slug: "lattafa-khamrah",
    brand: "Lattafa",
    name: "Khamrah",
    notes: "Ambré · Vanille · Cannelle",
    image: "/assets/prod-1.jpg",
    price: { amount: 22.9, currency: CURRENCY },
    compareAtPrice: { amount: 29.9, currency: CURRENCY },
    onSale: true,
  },
  {
    id: "reef-33",
    slug: "reef-33",
    brand: "Reef",
    name: "Reef 33",
    notes: "Frais · Aquatique · Boisé",
    image: "/assets/prod-2.jpg",
    price: { amount: 18.9, currency: CURRENCY },
    compareAtPrice: { amount: 22.9, currency: CURRENCY },
    onSale: true,
  },
  {
    id: "oud-roses",
    slug: "maison-alhambra-oud-roses",
    brand: "Maison Alhambra",
    name: "Oud & Roses",
    notes: "Floral · Oriental · Oud",
    image: "/assets/prod-3.jpg",
    price: { amount: 19.9, currency: CURRENCY },
    compareAtPrice: { amount: 24.9, currency: CURRENCY },
    onSale: true,
  },
  {
    id: "vanilla-voyage",
    slug: "swiss-arabian-vanilla-voyage",
    brand: "Swiss Arabian",
    name: "Vanilla Voyage",
    notes: "Gourmand · Vanille · Musc",
    image: "/assets/prod-4.jpg",
    price: { amount: 23.9, currency: CURRENCY },
    compareAtPrice: { amount: 27.9, currency: CURRENCY },
    onSale: true,
  },
  {
    id: "amber-oud",
    slug: "al-haramain-amber-oud",
    brand: "Al Haramain",
    name: "Amber Oud",
    notes: "Ambré · Boisé · Intense",
    image: "/assets/prod-5.jpg",
    price: { amount: 34.9, currency: CURRENCY },
    compareAtPrice: { amount: 44.9, currency: CURRENCY },
    onSale: true,
  },
];

export default function PreviewBestSellersPage() {
  const locale = useLocale();

  const handleAddToCart = (id: string) => {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    addItem({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price.amount,
      image: p.image,
    });
  };

  return (
    <main style={{ background: "#F7F3EC", minHeight: "100vh" }}>
      <BestSellersRail
        eyebrow="Best-sellers · Soldes"
        heading="Un parfum vendu toutes les 2 minutes"
        boldKeyword="2 minutes"
        editorial={EDITORIAL}
        products={PRODUCTS}
        onAddToCart={handleAddToCart}
        locale={locale}
      />
    </main>
  );
}
