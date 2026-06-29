"use client";

import { useLocale } from "next-intl";
import { PackGrid } from "@/components/sections/PackGrid";
import { DEMO } from "@/data/packs";

export default function PreviewPacksPage() {
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      style={{ background: "#FAF6EE", minHeight: "100vh", padding: "60px 24px" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 32,
            color: "#2C2620",
            margin: "0 0 6px",
          }}
        >
          Coffrets &amp; Packs
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            color: "#6A655D",
            margin: "0 0 28px",
          }}
        >
          Nos trios et coffrets présentés sur un podium clair, avec badge,
          prix barré et ajout au panier. Les coffrets phares apparaissent en
          premier.
        </p>

        <PackGrid packs={DEMO} locale={locale} />
      </div>
    </main>
  );
}
