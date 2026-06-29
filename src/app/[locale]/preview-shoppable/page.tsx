"use client";

import { useLocale } from "next-intl";
import { ShoppableVideoCarousel } from "@/components/sections/ShoppableVideoCarousel";
import { DEMO } from "@/data/shoppable-videos";

export default function PreviewShoppablePage() {
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
          Vidéos shoppables
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            color: "#6A655D",
            margin: "0 0 28px",
          }}
        >
          Chaque carte : vidéo verticale 9:16 (lecture uniquement quand visible), vignette produit,
          nom, prix et bouton « Ajouter au panier ». Une fiche en rupture de stock (épuisé).
        </p>

        <ShoppableVideoCarousel videos={DEMO} locale={locale} />
      </div>
    </main>
  );
}
