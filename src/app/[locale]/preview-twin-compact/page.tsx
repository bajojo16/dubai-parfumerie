"use client";

import { useLocale, useTranslations } from "next-intl";
import { OlfactiveTwin } from "@/components/sections/OlfactiveTwin";
import { OLFACTIVE_TWINS } from "@/data/olfactive-twins";

export default function PreviewTwinCompactPage() {
  const locale = useLocale();
  const t = useTranslations("olfactiveTwin");

  return (
    <main style={{ background: "#FDFBF6", minHeight: "100vh", padding: "60px 24px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#A8801F", marginBottom: 8 }}>
            {t("eyebrow")}
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "#2C2620", margin: "0 0 6px" }}>{t("title")}</h1>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "#6A655D", margin: 0 }}>{t("subtitle")}</p>
        </div>

        <OlfactiveTwin matches={OLFACTIVE_TWINS} variant="compact" locale={locale} />
      </div>
    </main>
  );
}
