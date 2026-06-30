"use client";

import { useId } from "react";
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

export type BestSellersRailProps = {
  eyebrow: string;
  heading: string;
  /** Mot-clé du titre à mettre en gras (optionnel) */
  boldKeyword?: string;
  editorial: EditorialCard;
  products: RailProduct[];
  onAddToCart?: (id: string) => void;
  locale?: string;
  cardLabels?: Partial<RailCardLabels>;
  editorialLabels?: Partial<EditorialCardLabels>;
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
  editorialSide = "start",
}: BestSellersRailProps) {
  const titleId = useId();
  // Logique RTL : la carte éditoriale passe à droite, le défilement démarre à droite,
  // le voile de bord et la flèche sont miroir via les propriétés logiques (insetInline*).
  const isRTL = locale === "ar";

  const add = onAddToCart
    ? onAddToCart
    : (id: string) => {
        const p = products.find((x) => x.id === id);
        if (p)
          addItem({
            id: p.id,
            name: p.name,
            brand: p.brand,
            price: p.price.amount,
            image: p.image,
          });
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
            // Aligne l'ensemble sur le conteneur centré
            paddingInline: "max(24px, calc((100% - 1240px) / 2 + 24px))",
          }}
        >
          {/* Zone scrollable produits (largeur restante) */}
          <div className="bsr-split-rail">
            <div
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

            {/* Voile de bord au bout de la zone scrollable (miroir RTL via insetInlineEnd) */}
            <div
              aria-hidden
              className="bsr-split-fade"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                insetInlineEnd: 0,
                width: 48,
                background: isRTL
                  ? `linear-gradient(to left, ${C.cream}, rgba(247,243,236,0))`
                  : `linear-gradient(to right, ${C.cream}, rgba(247,243,236,0))`,
                pointerEvents: "none",
              }}
            />
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

        /* Mode "end" : produits (flex:1) à côté de la vidéo ancrée (largeur fixe) */
        .bsr-split {
          display: flex;
          gap: 18px;
          align-items: stretch;
          padding-block: 8px;
        }
        .bsr-split-rail {
          position: relative;
          flex: 1 1 auto;
          min-width: 0;
        }
        .bsr-split-editorial {
          flex: 0 0 380px;
          display: flex;
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
