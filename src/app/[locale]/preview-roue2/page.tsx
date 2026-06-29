"use client";

import { useLocale } from "next-intl";
import { ScentWheelInteractive } from "@/components/sections/ScentWheelInteractive";
import { DEMO_SCENT_FAMILIES } from "@/data/scent-families";

export default function PreviewRoue2Page() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      style={{ background: "#FDFBF6", minHeight: "100vh", padding: "60px 24px" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 32,
            color: "#2C2620",
            margin: "0 0 6px",
          }}
        >
          La Roue des Senteurs — interactive
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            color: "#6A655D",
            margin: "0 0 28px",
          }}
        >
          Aperçu isolé. Cliquez (ou Entrée/Espace au clavier) sur une famille
          olfactive : le centre, la description, le fond ingrédient, le CTA et
          deux best-sellers se mettent à jour.
        </p>

        <ScentWheelInteractive families={DEMO_SCENT_FAMILIES} locale={locale} />
      </div>
    </main>
  );
}
