"use client";

import { useLocale, useTranslations } from "next-intl";
import { OlfactiveTwin } from "@/components/sections/OlfactiveTwin";
import { OLFACTIVE_TWINS } from "@/data/olfactive-twins";

export default function PreviewTwinPage() {
  const locale = useLocale();
  const t = useTranslations("olfactiveTwin");

  return (
    <main style={{ background: "#FDFBF6", minHeight: "100vh", padding: "60px 24px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#A8801F", marginBottom: 8 }}>
            {t("eyebrow")}
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "#2C2620", margin: "0 0 8px" }}>{t("title")}</h1>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "#6A655D", margin: 0 }}>{t("subtitle")}</p>
        </div>

        <OlfactiveTwin matches={OLFACTIVE_TWINS} locale={locale} />
      </div>
    </main>
  );
}
