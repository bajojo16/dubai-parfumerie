"use client";

import { useLocale } from "next-intl";
import { addItem } from "@/lib/cart";
import { BestSellersRail } from "@/components/sections/best-sellers-rail";
import { REEF_EDITORIAL, REEF_PRODUCTS } from "@/data/best-sellers";

const EDITORIAL = REEF_EDITORIAL;
const PRODUCTS = REEF_PRODUCTS;

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
