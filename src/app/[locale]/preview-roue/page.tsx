"use client";

import { useLocale } from "next-intl";
import { ScentWheel } from "@/components/sections/ScentWheel";

export default function PreviewRouePage() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      style={{ background: "#FDFBF6", minHeight: "100vh", padding: "60px 24px" }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 32,
            color: "#2C2620",
            margin: "0 0 6px",
          }}
        >
          La roue des senteurs
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            color: "#6A655D",
            margin: "0 0 28px",
          }}
        >
          Aperçu isolé de la section « La Roue des Senteurs ». Cliquez sur une note
          olfactive pour afficher 3 parfums correspondants.
        </p>

        <ScentWheel locale={locale} />
      </div>
    </main>
  );
}
