"use client";

import { useLocale } from "next-intl";
import { NewsletterSection } from "@/components/sections/NewsletterSection";

export default function PreviewNewsletterPage() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      style={{ background: "#FDFBF6", minHeight: "100vh", padding: "60px 24px" }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 32,
            color: "#2C2620",
            margin: "0 0 6px",
          }}
        >
          Newsletter
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            color: "#6A655D",
            margin: "0 0 28px",
          }}
        >
          Image de fond + voile clair + contenu superposé centré (eyebrow, titre, une phrase,
          champ email + bouton, micro-mention). Inscription simulée (stub local ~800ms) — l&apos;envoi
          réel d&apos;email reste à brancher.
        </p>

        <NewsletterSection locale={locale} />
      </div>
    </main>
  );
}
