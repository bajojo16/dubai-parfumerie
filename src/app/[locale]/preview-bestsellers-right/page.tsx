"use client";

import { useLocale } from "next-intl";
import { addItem } from "@/lib/cart";
import { BestSellersRail } from "@/components/sections/best-sellers-rail";
import { TOP_EDITORIAL, TOP_PRODUCTS } from "@/data/best-sellers-top";

const EDITORIAL = TOP_EDITORIAL;
const PRODUCTS = TOP_PRODUCTS;

export default function PreviewBestSellersRightPage() {
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
        eyebrow="Best-sellers"
        heading="Les plus aimés du moment"
        boldKeyword="plus aimés"
        editorial={EDITORIAL}
        products={PRODUCTS}
        editorialSide="end"
        onAddToCart={handleAddToCart}
        locale={locale}
      />
    </main>
  );
}
