"use client";

import { useRef } from "react";
import type { TrendProduct } from "@/data/trend-products";
import { type TrendTheme, getTrendTheme } from "@/data/trend-theme";
import { TrendCard, type TrendCardLabels } from "./TrendCard";

export type TrendCarouselLabels = {
  kicker: string;
  title: string; // peut contenir <em>...</em> via titleEm
  titleEm: string; // partie en italique
  subtitle: string;
  prev: string;
  next: string;
  card?: Partial<TrendCardLabels>;
};

const DEFAULT_LABELS: TrendCarouselLabels = {
  kicker: "@dubaiparfumerie",
  title: "Tendances",
  titleEm: "du moment",
  subtitle: "Ce que notre communauté s'arrache cette semaine sur TikTok & Instagram.",
  prev: "Précédent",
  next: "Suivant",
};

export function TrendCarousel({
  products,
  theme,
  locale = "fr",
  labels,
}: {
  products: TrendProduct[];
  theme?: TrendTheme;
  locale?: string;
  labels?: Partial<TrendCarouselLabels>;
}) {
  const T = theme ?? getTrendTheme();
  const L = { ...DEFAULT_LABELS, ...labels };
  const isRTL = locale === "ar";
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    const sign = dir === "next" ? 1 : -1;
    const rtlSign = isRTL ? -1 : 1;
    el.scrollBy({ left: sign * rtlSign * 316, behavior: "smooth" });
  };

  const arrowBtn: React.CSSProperties = {
    width: 38,
    height: 38,
    borderRadius: "50%",
    border: `1px solid ${T.border}`,
    background: T.card,
    color: T.title,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <section dir={isRTL ? "rtl" : "ltr"} style={{ background: T.bg, padding: "56px 0" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        {/* En-tête */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 24,
            textAlign: isRTL ? "right" : "left",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: T.kicker,
                marginBottom: 8,
              }}
            >
              {L.kicker}
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 32,
                fontWeight: 500,
                lineHeight: 1.1,
                color: T.title,
                margin: 0,
              }}
            >
              {L.title} <em style={{ fontStyle: "italic" }}>{L.titleEm}</em>
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                color: T.sub,
                margin: "8px 0 0",
                maxWidth: 460,
              }}
            >
              {L.subtitle}
            </p>
          </div>

          {/* Flèches discrètes (desktop) */}
          <div className="trend-arrows" style={{ gap: 10 }}>
            <button type="button" aria-label={L.prev} onClick={() => scrollBy("prev")} style={arrowBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: isRTL ? "scaleX(-1)" : "none" }}>
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button type="button" aria-label={L.next} onClick={() => scrollBy("next")} style={arrowBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: isRTL ? "scaleX(-1)" : "none" }}>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carrousel scroll-snap */}
        <div
          ref={scrollRef}
          className="trend-scroll"
          style={{
            display: "flex",
            gap: 16,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            paddingBottom: 4,
          }}
        >
          {products.map((p) => (
            <div
              key={p.slug}
              className="trend-item"
              style={{
                flex: "0 0 auto",
                scrollSnapAlign: "start",
              }}
            >
              <TrendCard product={p} theme={T} locale={locale} labels={L.card} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .trend-arrows { display: none; }
        @media (min-width: 768px) { .trend-arrows { display: inline-flex; } }
        .trend-scroll::-webkit-scrollbar { display: none; }
        .trend-item { width: 72vw; max-width: 300px; }
        @media (min-width: 640px) { .trend-item { width: 300px; } }
      `}</style>
    </section>
  );
}
