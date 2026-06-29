"use client";

import { useMemo } from "react";
import { PackCard, type PackCardLabels } from "./PackCard";
import type { Pack } from "@/data/packs";

const FEATURED: ReadonlyArray<NonNullable<Pack["badge"]>> = [
  "bestseller",
  "most_gifted",
];

export function PackGrid({
  packs,
  locale = "fr",
  labels,
}: {
  packs: Pack[];
  locale?: string;
  labels?: Partial<PackCardLabels>;
}) {
  const isRTL = locale === "ar";

  // Met les coffrets phares (best-seller / le plus offert) en tête,
  // en conservant l'ordre relatif d'origine.
  const sorted = useMemo(() => {
    const isFeatured = (p: Pack) =>
      p.badge != null && FEATURED.includes(p.badge);
    return [...packs].sort((a, b) => {
      const fa = isFeatured(a) ? 0 : 1;
      const fb = isFeatured(b) ? 0 : 1;
      return fa - fb;
    });
  }, [packs]);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
        gap: 18,
      }}
    >
      {sorted.map((pack) => (
        <PackCard
          key={pack.slug}
          pack={pack}
          locale={locale}
          labels={labels}
        />
      ))}
    </div>
  );
}
