"use client";

import Link from "next/link";
import { OilCardCarousel, type OilCarouselLabels } from "./OilCardCarousel";
import type { OilProduct } from "@/data/oil-products";

const C = {
  gold: "#C4A24F",
  goldDeep: "#A8801F",
  ink: "#2C2620",
  body: "#6A655D",
  bg: "#FAF5EA",
  ctaDark: "#1C1510",
  ctaText: "#F3E6CF",
};

export type OilSectionLabels = Partial<OilCarouselLabels> & {
  eyebrow: string;
  titleLead: string; // « Huiles de parfum »
  titleAccent: string; // « concentrées » (italique or)
  description: string;
  bullets: [string, string, string, string];
  cta: string;
};

const DEFAULT_LABELS: OilSectionLabels = {
  eyebrow: "Exclusif",
  titleLead: "Huiles de parfum",
  titleAccent: "concentrées",
  description:
    "Sans alcool, hautement concentrées, nos huiles de parfum signent un sillage tenace et intime. Quelques touches suffisent pour une présence qui dure toute la journée.",
  bullets: [
    "Concentration premium, tenue 12 h et plus",
    "Sans alcool, idéales peaux sensibles",
    "Sillage intime, application précise",
    "Format voyage rechargeable",
  ],
  cta: "Découvrir les huiles",
  prev: "Précédent",
  next: "Suivant",
};

function Check() {
  return (
    <span
      aria-hidden
      style={{
        flex: "0 0 auto",
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: "rgba(196,162,79,.16)",
        display: "grid",
        placeItems: "center",
        marginTop: 1,
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l5 5L19 7" />
      </svg>
    </span>
  );
}

export function OilSection({
  products,
  locale = "fr",
  labels,
}: {
  products: OilProduct[];
  locale?: string;
  labels?: Partial<OilSectionLabels>;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const isRTL = locale === "ar";

  return (
    <section
      data-dp-oil-section
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        background: C.bg,
        borderRadius: 20,
        padding: 32,
      }}
    >
      <div className="dp-oil-grid">
        {/* Bloc éditorial */}
        <div className="dp-oil-editorial" style={{ textAlign: isRTL ? "right" : "left" }}>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              color: C.goldDeep,
            }}
          >
            {L.eyebrow}
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 38,
              fontWeight: 600,
              lineHeight: 1.1,
              color: C.ink,
              margin: "10px 0 14px",
            }}
          >
            {L.titleLead}{" "}
            <em style={{ fontStyle: "italic", color: C.goldDeep }}>{L.titleAccent}</em>
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14.5,
              lineHeight: 1.65,
              color: C.body,
              margin: "0 0 18px",
              maxWidth: 440,
            }}
          >
            {L.description}
          </p>

          <ul style={{ listStyle: "none", margin: "0 0 24px", padding: 0, display: "flex", flexDirection: "column", gap: 11 }}>
            {L.bullets.map((b) => (
              <li
                key={b}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  fontFamily: "var(--font-sans)",
                  fontSize: 13.5,
                  color: C.ink,
                }}
              >
                <Check />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/huile-de-parfum"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              background: C.ctaDark,
              color: C.ctaText,
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: ".5px",
              borderRadius: 999,
              padding: "13px 24px",
            }}
          >
            {L.cta}
            <span aria-hidden style={{ display: "inline-block", transform: isRTL ? "scaleX(-1)" : "none" }}>
              →
            </span>
          </Link>
        </div>

        {/* Carrousel */}
        <div className="dp-oil-carousel">
          <OilCardCarousel products={products} locale={locale} labels={labels} />
        </div>
      </div>

      <style>{`
        [data-dp-oil-section] .dp-oil-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
          align-items: center;
        }
        @media (min-width: 900px) {
          [data-dp-oil-section] .dp-oil-grid {
            grid-template-columns: 0.95fr 1.15fr;
          }
          /* RTL : éditorial à droite, carrousel à gauche */
          [data-dp-oil-section][dir="rtl"] .dp-oil-editorial { order: 2; }
          [data-dp-oil-section][dir="rtl"] .dp-oil-carousel { order: 1; }
        }
      `}</style>
    </section>
  );
}
