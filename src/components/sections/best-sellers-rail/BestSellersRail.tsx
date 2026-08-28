"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { addItem } from "@/lib/cart";
import { RailProductCard, type RailProduct, type RailCardLabels } from "./RailProductCard";
import {
  EditorialVideoCard,
  type EditorialCard,
  type EditorialCardLabels,
} from "./EditorialVideoCard";

const C = {
  cream: "#F7F3EC",
  ink: "#1A1611",
  gold: "#B8924A",
  lines: "#E4DBCB",
};

/** Libellés accessibles des flèches de défilement */
export type RailNavLabels = {
  prev: string;
  next: string;
};

const DEFAULT_NAV_LABELS: RailNavLabels = {
  prev: "Produits précédents",
  next: "Produits suivants",
};

/** Largeur d'une carte produit (300) + gap du rail (18) */
const SCROLL_STEP = 318;

export type BestSellersRailProps = {
  eyebrow: string;
  heading: string;
  /** Mot-clé du titre à mettre en gras (optionnel) */
  boldKeyword?: string;
  editorial: EditorialCard;
  products: RailProduct[];
  onAddToCart?: (id: string, qty: number) => void;
  locale?: string;
  cardLabels?: Partial<RailCardLabels>;
  editorialLabels?: Partial<EditorialCardLabels>;
  navLabels?: Partial<RailNavLabels>;
  /**
   * Position de la carte éditoriale vidéo dans le rail (propriété logique) :
   * - "start" (défaut) : au début → gauche en LTR / droite en RTL
   * - "end" : à la fin → droite en LTR / gauche en RTL
   */
  editorialSide?: "start" | "end";
};

// Rend le titre avec un mot-clé en gras s'il est présent
function renderHeading(heading: string, keyword?: string) {
  if (!keyword) return heading;
  const i = heading.toLowerCase().indexOf(keyword.toLowerCase());
  if (i === -1) return heading;
  return (
    <>
      {heading.slice(0, i)}
      <strong style={{ fontWeight: 700, color: C.gold }}>
        {heading.slice(i, i + keyword.length)}
      </strong>
      {heading.slice(i + keyword.length)}
    </>
  );
}

export function BestSellersRail({
  eyebrow,
  heading,
  boldKeyword,
  editorial,
  products,
  onAddToCart,
  locale = "fr",
  cardLabels,
  editorialLabels,
  navLabels,
  editorialSide = "start",
}: BestSellersRailProps) {
  const titleId = useId();
  // Logique RTL : la carte éditoriale passe à droite, le défilement démarre à droite,
  // le voile de bord et la flèche sont miroir via les propriétés logiques (insetInline*).
  const isRTL = locale === "ar";
  const NAV = { ...DEFAULT_NAV_LABELS, ...navLabels };

  // Rail scrollable (un seul mode rendu à la fois → une seule ref)
  const railRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // En RTL, scrollLeft est négatif : on raisonne sur la valeur absolue
  const syncEdges = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    setCanPrev(pos > 4);
    setCanNext(pos < max - 4);
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    syncEdges();
    el.addEventListener("scroll", syncEdges, { passive: true });
    const ro = new ResizeObserver(syncEdges);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", syncEdges);
      ro.disconnect();
    };
  }, [syncEdges, products.length, editorialSide]);

  const scrollByDir = (dir: "prev" | "next") => {
    const el = railRef.current;
    if (!el) return;
    const sign = dir === "next" ? 1 : -1;
    const rtlSign = isRTL ? -1 : 1;
    el.scrollBy({ left: sign * rtlSign * SCROLL_STEP, behavior: "smooth" });
  };

  const navBtn = (dir: "prev" | "next", enabled: boolean, offset: string) => (
    <button
      type="button"
      className="bsr-nav"
      aria-label={dir === "prev" ? NAV.prev : NAV.next}
      disabled={!enabled}
      onClick={() => scrollByDir(dir)}
      style={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        ...(dir === "prev" ? { insetInlineStart: offset } : { insetInlineEnd: offset }),
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: `1px solid ${C.lines}`,
        background: "#FFFFFF",
        color: C.ink,
        boxShadow: "0 2px 10px rgba(26,22,17,0.10)",
        cursor: enabled ? "pointer" : "default",
        opacity: enabled ? 1 : 0,
        pointerEvents: enabled ? "auto" : "none",
        transition: "opacity .2s ease, border-color .2s ease, color .2s ease",
        zIndex: 3,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        // Miroir en RTL : la flèche « prev » pointe vers la droite
        style={{ transform: isRTL ? "scaleX(-1)" : "none" }}
      >
        <path d={dir === "prev" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
      </svg>
    </button>
  );

  const add = onAddToCart
    ? onAddToCart
    : (id: string, qty: number) => {
        const p = products.find((x) => x.id === id);
        if (p)
          addItem(
            {
              id: p.id,
              name: p.name,
              brand: p.brand,
              price: p.price.amount,
              image: p.image,
            },
            qty
          );
      };

  return (
    <section
      aria-labelledby={titleId}
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        background: C.cream,
        paddingBlock: "40px 44px",
        marginInline: "auto",
      }}
    >
      {/* En-tête */}
      <div style={{ maxWidth: 1240, marginInline: "auto", paddingInline: 24 }}>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: C.gold,
          }}
        >
          {eyebrow}
        </span>
        <h2
          id={titleId}
          style={{
            margin: "10px 0 0",
            fontFamily: "var(--font-display)",
            fontSize: 38,
            fontWeight: 500,
            lineHeight: 1.08,
            color: C.ink,
            maxWidth: 720,
          }}
        >
          {renderHeading(heading, boldKeyword)}
        </h2>
      </div>

      {/* ── Mode "start" (défaut) : rail unique scrollable, carte vidéo en tête ── */}
      {editorialSide === "start" && (
        <div style={{ position: "relative", marginTop: 22 }}>
          <div
            ref={railRef}
            className="bsr-scroll"
            style={{
              display: "flex",
              gap: 18,
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              // Aligne le rail sur le conteneur centré et garde une marge de fin
              paddingInline: "max(24px, calc((100% - 1240px) / 2 + 24px))",
              paddingBlock: 8,
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none",
            }}
          >
            {/* Carte éditoriale en tête (gauche LTR / droite RTL via l'ordre + dir) */}
            <div style={{ scrollSnapAlign: "start", display: "flex" }}>
              <EditorialVideoCard
                card={editorial}
                locale={locale}
                labels={editorialLabels}
              />
            </div>

            {products.map((p) => (
              <div key={p.id} style={{ scrollSnapAlign: "start", display: "flex" }}>
                <RailProductCard
                  product={p}
                  onAddToCart={add}
                  locale={locale}
                  labels={cardLabels}
                />
              </div>
            ))}
          </div>

          {/* Voile de bord (fin du rail) — miroir en RTL via insetInlineEnd */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              insetInlineEnd: 0,
              width: 64,
              background: isRTL
                ? `linear-gradient(to left, ${C.cream}, rgba(247,243,236,0))`
                : `linear-gradient(to right, ${C.cream}, rgba(247,243,236,0))`,
              pointerEvents: "none",
            }}
          />

          {/* Flèches de navigation — alignées sur le conteneur centré */}
          {navBtn("prev", canPrev, "max(6px, calc((100% - 1240px) / 2 + 2px))")}
          {navBtn("next", canNext, "max(6px, calc((100% - 1240px) / 2 + 2px))")}
        </div>
      )}

      {/* ── Mode "end" : 2 zones — produits scrollables + carte vidéo ancrée ──
          La carte vidéo est fixe à la fin (droite LTR / gauche RTL via l'ordre + dir),
          toujours visible sans défilement ; seules les cartes produits défilent.
          Repli mobile (CSS) : vidéo en haut, produits scrollables dessous. */}
      {editorialSide === "end" && (
        <div
          className="bsr-split"
          style={{
            marginTop: 22,
            // Aligne le début sur le conteneur centré, mais colle la carte vidéo au bord droit
            paddingInlineStart: "max(24px, calc((100% - 1240px) / 2 + 24px))",
            paddingInlineEnd: 0,
          }}
        >
          {/* Zone scrollable produits (largeur restante) */}
          <div className="bsr-split-rail">
            <div
              ref={railRef}
              className="bsr-scroll"
              style={{
                display: "flex",
                gap: 18,
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                paddingBlock: 8,
                paddingInlineEnd: 8,
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {products.map((p) => (
                <div key={p.id} style={{ scrollSnapAlign: "start", display: "flex" }}>
                  <RailProductCard
                    product={p}
                    onAddToCart={add}
                    locale={locale}
                    labels={cardLabels}
                  />
                </div>
              ))}
            </div>

            {/* Voile de bord côté OPPOSÉ à la carte éditoriale (bord extérieur), façon miroir de la maison Reef */}
            <div
              aria-hidden
              className="bsr-split-fade"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                insetInlineStart: 0,
                width: 48,
                background: isRTL
                  ? `linear-gradient(to left, ${C.cream}, rgba(247,243,236,0))`
                  : `linear-gradient(to right, ${C.cream}, rgba(247,243,236,0))`,
                pointerEvents: "none",
                zIndex: 2,
              }}
            />

            {/* Flèches de navigation — aux bords de la zone produits */}
            {navBtn("prev", canPrev, "6px")}
            {navBtn("next", canNext, "6px")}
          </div>

          {/* Carte vidéo éditoriale ancrée (toujours visible, non scrollable) */}
          <div className="bsr-split-editorial">
            <EditorialVideoCard
              card={editorial}
              locale={locale}
              labels={editorialLabels}
              fluid
            />
          </div>
        </div>
      )}

      {/* Masque la scrollbar (WebKit) + layout 2 zones du mode "end" */}
      <style>{`
        .bsr-scroll::-webkit-scrollbar { display: none; height: 0; }

        /* Flèches : desktop uniquement (le swipe suffit sur mobile) */
        .bsr-nav { display: none; }
        @media (min-width: 768px) { .bsr-nav { display: inline-flex; } }
        .bsr-nav:hover { border-color: ${C.gold}; color: ${C.gold}; }
        .bsr-nav:focus-visible { outline: 2px solid ${C.gold}; outline-offset: 2px; }

        /* Mode "end" : produits (flex:1) à côté de la vidéo ancrée (largeur fixe) */
        .bsr-split {
          display: flex;
          gap: 18px;
          align-items: stretch;
          padding-block: 8px;
        }
        /* La hauteur de la rangée est dictée par les cartes produit ; la carte
           vidéo (contenu en position absolue) s'y aligne au lieu de l'étirer. */
        .bsr-split > .bsr-split-editorial > * { height: 100%; }
        .bsr-split-rail {
          position: relative;
          flex: 1 1 auto;
          min-width: 0;
        }
        .bsr-split-editorial {
          /* 380px écrasait le rail : la carte vidéo pesait presque deux cartes
             produit. On la resserre pour qu'elle reste un accent, pas le sujet. */
          flex: 0 0 300px;
          display: flex;
          align-self: stretch;
          /* Sans min-height:0, un enfant flex ne peut pas descendre sous sa
             hauteur de contenu : la carte dépassait la hauteur du rail. */
          min-height: 0;
        }

        /* Palier tablette : à 380px comme à 300px, la carte vidéo laissait
           moins d'une carte produit et demie visible dans le rail. */
        @media (max-width: 1023px) {
          .bsr-split-editorial { flex: 0 0 250px; }
        }

        /* Repli mobile : vidéo en haut, produits scrollables dessous */
        @media (max-width: 760px) {
          .bsr-split { flex-direction: column; }
          .bsr-split-editorial { flex: 0 0 220px; order: -1; }
          .bsr-split-fade { display: none; }
        }
      `}</style>
    </section>
  );
}
