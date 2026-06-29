"use client";

import Link from "next/link";
import type { Article } from "@/data/journal-articles";
import { JournalCard } from "./JournalCard";

export type JournalLabels = {
  eyebrow: string;
  title: string;
  subtitle: string;
  viewAll: string; // "Voir tous les articles"
  viewAllHref: string;
  readingTime: string; // "Lecture · {min} min"
  readArticle: string; // "Lire l'article"
};

const DEFAULT_LABELS: JournalLabels = {
  eyebrow: "BLOG",
  title: "Le Journal du Parfum",
  subtitle: "Histoires, guides et conseils par nos experts en parfumerie orientale.",
  viewAll: "Voir tous les articles",
  viewAllHref: "/blog",
  readingTime: "Lecture · {min} min",
  readArticle: "Lire l'article",
};

export function JournalSection({
  articles,
  locale = "fr",
  labels,
}: {
  articles: Article[];
  locale?: string;
  labels?: Partial<JournalLabels>;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const isRTL = locale === "ar";
  const arrow = isRTL ? "←" : "→";

  const [featured, ...rest] = articles;
  const secondaries = rest.slice(0, 2);

  // RTL : la carte vedette passe à droite ; on inverse l'ordre des colonnes via "direction".
  const cardLabels = { readingTime: L.readingTime, readArticle: L.readArticle };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        background: "#FAF6EE",
        padding: "72px 24px",
      }}
    >
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        {/* En-tête */}
        <header style={{ textAlign: "center", marginBottom: 40 }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: ".28em",
              textTransform: "uppercase",
              color: "#A8801F",
              margin: "0 0 14px",
            }}
          >
            {L.eyebrow}
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "clamp(30px, 5vw, 46px)",
              lineHeight: 1.08,
              color: "#2C2620",
              margin: "0 0 14px",
            }}
          >
            {L.title}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 16,
              lineHeight: 1.55,
              color: "#6A655D",
              maxWidth: 540,
              margin: "0 auto",
            }}
          >
            {L.subtitle}
          </p>
        </header>

        {/* Grille bento asymétrique */}
        <div className="journal-grid">
          <div className="journal-grid__featured">
            {featured && (
              <JournalCard
                article={featured}
                featured
                priority
                locale={locale}
                labels={cardLabels}
              />
            )}
          </div>
          {secondaries.map((a) => (
            <div key={a.slug} className="journal-grid__secondary">
              <JournalCard article={a} locale={locale} labels={cardLabels} />
            </div>
          ))}
        </div>

        {/* CTA bas */}
        <div style={{ textAlign: "center", marginTop: 44 }}>
          <Link
            href={L.viewAllHref}
            className="journal-cta"
            style={{
              display: "inline-block",
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: ".04em",
              color: "#2C2620",
              textDecoration: "none",
              border: "1px solid #C9A24A",
              borderRadius: 999,
              padding: "13px 30px",
              background: "transparent",
              transition: "background .3s ease, color .3s ease",
            }}
          >
            {L.viewAll} {arrow}
          </Link>
        </div>
      </div>

      <style>{`
        .journal-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-template-rows: repeat(2, minmax(206px, 1fr));
          gap: 18px;
        }
        .journal-grid__featured {
          grid-column: 1 / 7;
          grid-row: 1 / 3;
        }
        .journal-grid__secondary:nth-of-type(2) {
          grid-column: 7 / 10;
          grid-row: 1 / 3;
        }
        .journal-grid__secondary:nth-of-type(3) {
          grid-column: 10 / 13;
          grid-row: 1 / 3;
        }
        ${
          isRTL
            ? `
        .journal-grid__featured { grid-column: 7 / 13; }
        .journal-grid__secondary:nth-of-type(2) { grid-column: 4 / 7; }
        .journal-grid__secondary:nth-of-type(3) { grid-column: 1 / 4; }
        `
            : ""
        }
        .journal-cta:hover {
          background: #C9A24A;
          color: #fff;
        }
        @media (max-width: 860px) {
          .journal-grid {
            grid-template-columns: 1fr;
            grid-template-rows: none;
          }
          .journal-grid__featured,
          .journal-grid__secondary {
            grid-column: 1 / -1 !important;
            grid-row: auto !important;
          }
          .journal-grid__featured { min-height: 440px; }
          .journal-grid__secondary { min-height: 280px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .journal-cta { transition: none; }
        }
      `}</style>
    </section>
  );
}
