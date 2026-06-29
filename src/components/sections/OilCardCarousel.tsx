"use client";

import { useCallback, useRef } from "react";
import { OilProductCard, type OilCardLabels } from "./OilProductCard";
import type { OilProduct } from "@/data/oil-products";

export type OilCarouselLabels = Partial<OilCardLabels> & {
  prev: string; // aria-label flèche précédente
  next: string; // aria-label flèche suivante
};

const DEFAULT_LABELS: Pick<OilCarouselLabels, "prev" | "next"> = {
  prev: "Précédent",
  next: "Suivant",
};

export function OilCardCarousel({
  products,
  locale = "fr",
  labels,
}: {
  products: OilProduct[];
  locale?: string;
  labels?: Partial<OilCarouselLabels>;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const isRTL = locale === "ar";
  const trackRef = useRef<HTMLDivElement>(null);
  const few = products.length <= 3; // peu de produits → remplir la largeur, pas de scroll

  const scrollByCards = useCallback(
    (dir: "prev" | "next") => {
      const track = trackRef.current;
      if (!track) return;
      let physical = dir === "next" ? 1 : -1;
      if (isRTL) physical *= -1; // miroir du sens physique en RTL
      const amount = track.clientWidth * 0.8 * physical;
      track.scrollBy({ left: amount, behavior: "smooth" });
    },
    [isRTL]
  );

  return (
    <div data-dp-oils dir={isRTL ? "rtl" : "ltr"} style={{ position: "relative", width: "100%" }}>
      {/* Flèche précédent (desktop, seulement si scroll nécessaire) */}
      {!few && (
        <button
          type="button"
          onClick={() => scrollByCards("prev")}
          aria-label={L.prev}
          className="dp-oils-arrow"
          style={{ ...arrowBase, insetInlineStart: -16 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2C2620" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: isRTL ? "scaleX(-1)" : "none" }}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Piste — padding-top pour ne pas rogner le flacon débordant. Peu de produits → remplit la largeur */}
      <div
        ref={trackRef}
        style={{
          display: "flex",
          gap: 16,
          overflowX: few ? "visible" : "auto",
          justifyContent: few ? "center" : "flex-start",
          scrollSnapType: few ? "none" : "x mandatory",
          scrollbarWidth: "none",
          paddingTop: 64,
          paddingBottom: 8,
          paddingInline: 4,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {products.map((p) => (
          <div
            key={p.slug}
            style={
              few
                ? { flex: "1 1 0", minWidth: 0, maxWidth: 300 }
                : { flex: "0 0 auto", scrollSnapAlign: "start", width: "var(--dp-oils-card-w, 200px)" }
            }
          >
            <OilProductCard product={p} locale={locale} labels={labels} />
          </div>
        ))}
      </div>

      {/* Flèche suivant (desktop, seulement si scroll nécessaire) */}
      {!few && (
        <button
          type="button"
          onClick={() => scrollByCards("next")}
          aria-label={L.next}
          className="dp-oils-arrow"
          style={{ ...arrowBase, insetInlineEnd: -16 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2C2620" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: isRTL ? "scaleX(-1)" : "none" }}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      <style>{`
        .dp-oils-arrow { display: none; }
        @media (min-width: 768px) {
          .dp-oils-arrow { display: grid; }
        }
      `}</style>
    </div>
  );
}

const arrowBase: React.CSSProperties = {
  position: "absolute",
  top: "52%",
  zIndex: 4,
  width: 38,
  height: 38,
  borderRadius: "50%",
  border: "1px solid rgba(80,60,30,.10)",
  background: "rgba(255,255,255,.94)",
  boxShadow: "0 6px 16px rgba(80,60,30,.14)",
  placeItems: "center",
  cursor: "pointer",
};
