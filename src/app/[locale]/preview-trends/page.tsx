"use client";

import { useLocale } from "next-intl";
import { TrendCarousel } from "@/components/sections/TrendCarousel";
import { DEMO_TRENDS } from "@/data/trend-products";

export default function PreviewTrendsPage() {
  const locale = useLocale();
  return (
    <main style={{ minHeight: "100vh" }}>
      <TrendCarousel products={DEMO_TRENDS} locale={locale} />
    </main>
  );
}
