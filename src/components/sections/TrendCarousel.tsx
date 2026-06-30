"use client";

import { useRef, useState } from "react";
import type { TrendProduct } from "@/data/trend-products";
import { type TrendTheme, getTrendTheme } from "@/data/trend-theme";
import { TrendCard, type TrendCardLabels } from "./TrendCard";
import { TrendLightbox, type TrendLightboxLabels } from "./TrendLightbox";

export type TrendCarouselLabels = {
  kicker: string;
  title: string; // peut contenir <em>...</em> via titleEm
  titleEm: string; // partie en italique
  subtitle: string;
  prev: string;
  next: string;
  follow?: string; // libellé du groupe « Suivez-nous »
  tiktokAria?: string;
  instagramAria?: string;
  card?: Partial<TrendCardLabels>;
  lightbox?: Partial<TrendLightboxLabels>;
};

const DEFAULT_LABELS: TrendCarouselLabels = {
  kicker: "@dubaiparfumerie",
  title: "Tendances",
  titleEm: "du moment",
  subtitle: "Ce que notre communauté s'arrache cette semaine sur TikTok & Instagram.",
  prev: "Précédent",
  next: "Suivant",
  follow: "Suivez-nous",
  tiktokAria: "Suivez-nous sur TikTok",
  instagramAria: "Suivez-nous sur Instagram",
};

const TIKTOK_URL = "https://www.tiktok.com/@dubaiparfumerie";
const INSTAGRAM_URL = "https://www.instagram.com/dubaiparfumerie";

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
  const [openIndex, setOpenIndex] = useState(-1);

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

  const followBtn: React.CSSProperties = {
    minHeight: 40,
    padding: "0 16px",
    borderRadius: 999,
    border: `1px solid ${T.border}`,
    background: T.card,
    color: T.title,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontFamily: "var(--font-sans)",
    fontSize: 12.5,
    fontWeight: 500,
    letterSpacing: "0.3px",
    textDecoration: "none",
    whiteSpace: "nowrap",
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

            {/* Boutons réseaux sociaux « Suivez-nous » */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 10,
                marginTop: 16,
                justifyContent: isRTL ? "flex-end" : "flex-start",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: T.kicker,
                  marginInlineEnd: 4,
                }}
              >
                {L.follow}
              </span>
              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={L.tiktokAria}
                className="trend-follow-btn"
                style={followBtn}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M16.6 5.82a4.28 4.28 0 0 1-1.05-2.82h-3.1v12.66a2.59 2.59 0 0 1-2.59 2.46 2.59 2.59 0 0 1-.69-5.08v-3.18a5.7 5.7 0 0 0-.93-.08A5.69 5.69 0 1 0 13.94 18V11.3a7.36 7.36 0 0 0 4.34 1.4V9.6a4.3 4.3 0 0 1-1.68-.34 4.31 4.31 0 0 1-.0-3.44Z" />
                </svg>
                TikTok
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={L.instagramAria}
                className="trend-follow-btn"
                style={followBtn}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                Instagram
              </a>
            </div>
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
          {products.map((p, i) => (
            <div
              key={p.slug}
              className="trend-item"
              style={{
                flex: "0 0 auto",
                scrollSnapAlign: "start",
              }}
            >
              <TrendCard product={p} theme={T} locale={locale} labels={L.card} onOpen={() => setOpenIndex(i)} />
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
        .trend-follow-btn { transition: border-color .2s ease, color .2s ease, transform .2s ease; }
        .trend-follow-btn:hover { border-color: #C9A24A; color: #A8801F; }
        .trend-follow-btn:hover svg { color: #C9A24A; }
        .trend-follow-btn:focus-visible { outline: 2px solid #C9A24A; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { .trend-follow-btn { transition: none; } }
      `}</style>

      <TrendLightbox
        products={products}
        index={openIndex}
        onClose={() => setOpenIndex(-1)}
        onNavigate={setOpenIndex}
        locale={locale}
        labels={L.lightbox}
      />
    </section>
  );
}
