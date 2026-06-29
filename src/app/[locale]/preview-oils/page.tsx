"use client";

import { useLocale } from "next-intl";
import { OilSection } from "@/components/sections/OilSection";
import { DEMO } from "@/data/oil-products";

export default function PreviewOilsPage() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      style={{ background: "#FDFBF6", minHeight: "100vh", padding: "60px 24px" }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 30,
            color: "#2C2620",
            margin: "0 0 6px",
          }}
        >
          Huiles de parfum concentrées
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            color: "#6A655D",
            margin: "0 0 28px",
          }}
        >
          Bloc éditorial (gauche) + carrousel de cartes « Ajmal » dont le flacon déborde
          au-dessus du haut de la carte. Aperçu isolé, validation gate.
        </p>

        <OilSection products={DEMO} locale={locale} />
      </div>
    </main>
  );
}
