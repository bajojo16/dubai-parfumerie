"use client";

import { useCallback, useRef } from "react";
import { ShoppableVideoCard, type ShoppableCardLabels } from "./ShoppableVideoCard";
import type { ShoppableVideo } from "@/data/shoppable-videos";

export type ShoppableCarouselLabels = ShoppableCardLabels & {
  prev: string; // aria-label flèche précédente
  next: string; // aria-label flèche suivante
};

const DEFAULT_LABELS: Pick<ShoppableCarouselLabels, "prev" | "next"> = {
  prev: "Précédent",
  next: "Suivant",
};

export function ShoppableVideoCarousel({
  videos,
  locale = "fr",
  labels,
}: {
  videos: ShoppableVideo[];
  locale?: string;
  labels?: Partial<ShoppableCarouselLabels>;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const isRTL = locale === "ar";
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCards = useCallback(
    (dir: "prev" | "next") => {
      const track = trackRef.current;
      if (!track) return;
      // En RTL, l'axe d'inline-start est inversé : on miroir le sens physique.
      let physical = dir === "next" ? 1 : -1;
      if (isRTL) physical *= -1;
      const amount = track.clientWidth * 0.8 * physical;
      track.scrollBy({ left: amount, behavior: "smooth" });
    },
    [isRTL]
  );

  return (
    <div
      data-dp-shoppable
      dir={isRTL ? "rtl" : "ltr"}
      style={
        {
          position: "relative",
          width: "100%",
          // Le conteneur épouse la largeur réelle de la rangée (n cartes + gaps
          // + padding de piste) au lieu d'occuper toute la colonne : plus de vide
          // à droite, rangée centrée, et les flèches (insetInline -18) collent au
          // contenu au lieu de flotter. `min(100%, …)` garde le scroll quand la
          // rangée dépasse (mobile/tablette).
          maxWidth: "min(100%, var(--dp-shoppable-max, 100%))",
          marginInline: "auto",
          "--dp-shoppable-n": videos.length,
        } as React.CSSProperties
      }
    >
      {/* Flèche précédent (desktop) */}
      <button
        type="button"
        onClick={() => scrollByCards("prev")}
        aria-label={L.prev}
        className="dp-shoppable-arrow"
        style={{ ...arrowBase, insetInlineStart: -18 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2C2620" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: isRTL ? "scaleX(-1)" : "none" }}>
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Piste scroll-snap */}
      <div
        ref={trackRef}
        style={{
          display: "flex",
          gap: "var(--dp-shoppable-gap, 16px)",
          // `safe` : se comporte comme `start` dès que la rangée dépasse, sinon
          // le début du contenu deviendrait inatteignable au scroll.
          justifyContent: "safe center",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          paddingBlock: 8,
          paddingInline: "var(--dp-shoppable-pad, 4px)",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {videos.map((v) => (
          <div
            key={v.id}
            style={{
              flex: "0 0 auto",
              scrollSnapAlign: "start",
              width: "var(--dp-shoppable-card-w, 62%)",
            }}
          >
            <ShoppableVideoCard video={v} locale={locale} labels={labels} />
          </div>
        ))}
      </div>

      {/* Flèche suivant (desktop) */}
      <button
        type="button"
        onClick={() => scrollByCards("next")}
        aria-label={L.next}
        className="dp-shoppable-arrow"
        style={{ ...arrowBase, insetInlineEnd: -18 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2C2620" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: isRTL ? "scaleX(-1)" : "none" }}>
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <style>{`
        .dp-shoppable-arrow { display: none; }
        [data-dp-shoppable] {
          --dp-shoppable-gap: 16px;
          --dp-shoppable-pad: 4px;
          /* Mobile : la rangée dépasse toujours → le conteneur reste pleine largeur. */
          --dp-shoppable-max: 100%;
        }
        /* Mobile par défaut : carte ~62% (fallback inline) + peek de la carte suivante */
        @media (max-width: 760px) {
          [data-dp-shoppable] { --dp-shoppable-card-w: 62%; }
        }
        @media (max-width: 420px) {
          [data-dp-shoppable] { --dp-shoppable-card-w: 58%; }
        }
        /* Desktop : largeur de carte en px (et non en %) — indispensable pour que
           le conteneur puisse se dimensionner sur le contenu sans dépendance
           circulaire (carte % de la piste ⇄ piste dimensionnée sur les cartes). */
        @media (min-width: 768px) {
          .dp-shoppable-arrow { display: grid; }
          [data-dp-shoppable] {
            --dp-shoppable-card-w: clamp(150px, 17vw, 190px);
            --dp-shoppable-max: calc(
              var(--dp-shoppable-n, 5) * var(--dp-shoppable-card-w)
              + (var(--dp-shoppable-n, 5) - 1) * var(--dp-shoppable-gap)
              + 2 * var(--dp-shoppable-pad)
            );
          }
        }
        /* Une carte 9:16 devient vite haute : plus la colonne est large, plus la
           section mange l'écran. On plafonne la largeur de colonne. */
        @media (min-width: 1100px) {
          [data-dp-shoppable] { --dp-shoppable-card-w: clamp(175px, 15.5vw, 205px); }
        }
      `}</style>
    </div>
  );
}

const arrowBase: React.CSSProperties = {
  position: "absolute",
  top: "42%",
  zIndex: 3,
  width: 40,
  height: 40,
  borderRadius: "50%",
  border: "1px solid rgba(80,60,30,.10)",
  background: "rgba(255,255,255,.92)",
  boxShadow: "0 6px 16px rgba(80,60,30,.14)",
  placeItems: "center",
  cursor: "pointer",
};
