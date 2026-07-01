"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { TrendProduct } from "@/data/trend-products";
import { type TrendTheme, getTrendTheme } from "@/data/trend-theme";
import { addItem } from "@/lib/cart";
import { QtyStepper } from "@/components/ui/QtyStepper";

export type TrendCardLabels = {
  rank: string;        // "#{rank}" — {rank} remplacé
  handle: string;      // "@dubaiparfumerie"
  promo: string;       // "Promo"
  addToCart: string;   // "Panier"
  added: string;       // "Ajouté ✓"
  soldOut: string;     // "Épuisé"
  like: string;        // aria-label cœur
  share: string;       // aria-label partage
};

const DEFAULT_LABELS: TrendCardLabels = {
  rank: "#{rank}",
  handle: "@dubaiparfumerie",
  promo: "Promo",
  addToCart: "Panier",
  added: "Ajouté ✓",
  soldOut: "Épuisé",
  like: "J'aime",
  share: "Partager",
};

const STRUCK = "rgba(255,255,255,0.6)"; // prix barré sur média sombre
const PROMO_BG = "#B5532E";
const ON_MEDIA = "#FFFFFF"; // texte clair lisible sur média + dégradé

export function TrendCard({
  product,
  theme,
  locale = "fr",
  labels,
  onOpen,
}: {
  product: TrendProduct;
  theme?: TrendTheme;
  locale?: string;
  labels?: Partial<TrendCardLabels>;
  onOpen?: () => void; // clic carte → ouvre la lightbox vidéo + avis
}) {
  const T = theme ?? getTrendTheme();
  const L = { ...DEFAULT_LABELS, ...labels };
  const isRTL = locale === "ar";
  const [hover, setHover] = useState(false);
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [qty, setQty] = useState(1);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const fmtPrice = (n: number) => {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `${n} €`;
    }
  };

  const onAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!product.available) return;
    addItem(
      {
        id: product.variantId,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
      },
      qty
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const onLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLiked((v) => !v);
  };

  const onShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const url = typeof window !== "undefined" ? window.location.origin + product.href : product.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else await navigator.clipboard?.writeText(url);
    } catch {
      /* annulé */
    }
  };

  const animate = !reduceMotion;
  const rankLabel = L.rank.replace("{rank}", String(product.rank));
  const hasPromo = product.compareAtPrice != null && product.compareAtPrice > product.price;

  const socialBtn: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    background: "rgba(0,0,0,0.38)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    color: ON_MEDIA,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={product.name}
      dir={isRTL ? "rtl" : "ltr"}
      onClick={() => onOpen?.()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen?.();
        }
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        display: "block",
        cursor: "pointer",
        textDecoration: "none",
        aspectRatio: "9 / 16",
        borderRadius: 18,
        overflow: "hidden",
        background: T.card,
        border: `0.5px solid ${T.border}`,
        textAlign: isRTL ? "right" : "left",
        transition: animate ? "transform 220ms ease, box-shadow 220ms ease" : "none",
        transform: animate && hover ? "translateY(-4px)" : "none",
        boxShadow: animate && hover ? "0 16px 34px rgba(20,15,8,0.22)" : "none",
      }}
    >
      {/* Média plein cadre (object-cover) — vidéo si fournie, sinon image */}
      {product.cardVideo ? (
        <video
          src={product.cardVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={product.image}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: product.cardObjectPosition ?? "center",
            pointerEvents: "none",
            transition: animate ? "transform 360ms ease" : "none",
            transform: animate && hover ? "scale(1.06)" : "none",
          }}
        />
      ) : (
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width:600px) 70vw, 240px"
          style={{
            objectFit: "cover",
            objectPosition: product.cardObjectPosition ?? "center",
            transition: animate ? "transform 360ms ease" : "none",
            transform: animate && hover ? "scale(1.06)" : "none",
          }}
        />
      )}

      {/* Dégradé sombre bas (lisibilité) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.82) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Haut : badge rang + handle (début) */}
      <div
        style={{
          position: "absolute",
          top: 12,
          insetInlineStart: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            color: ON_MEDIA,
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 9px",
            borderRadius: 999,
            whiteSpace: "nowrap",
          }}
        >
          {rankLabel}
        </span>
        <span
          style={{
            color: "rgba(255,255,255,0.92)",
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.3px",
            textShadow: "0 1px 4px rgba(0,0,0,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          {L.handle}
        </span>
      </div>

      {/* Haut fin : badge promo (jamais sur le rang) */}
      {hasPromo && (
        <span
          style={{
            position: "absolute",
            top: 12,
            insetInlineEnd: 12,
            background: PROMO_BG,
            color: "#FFFFFF",
            fontFamily: "var(--font-sans)",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            padding: "4px 8px",
            borderRadius: 999,
            whiteSpace: "nowrap",
          }}
        >
          {L.promo}
        </span>
      )}

      {/* Colonne sociale (côté fin, façon TikTok) */}
      <div
        style={{
          position: "absolute",
          insetInlineEnd: 10,
          bottom: 96,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          alignItems: "center",
        }}
      >
        <button type="button" onClick={onLike} aria-label={L.like} aria-pressed={liked} style={socialBtn}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill={liked ? "#FF4D6D" : "none"} stroke={liked ? "#FF4D6D" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </button>
        <button type="button" onClick={onShare} aria-label={L.share} style={socialBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
          </svg>
        </button>
      </div>

      {/* Bas : marque + nom + prix + bouton panier (surimpression) */}
      <div
        style={{
          position: "absolute",
          insetInline: 0,
          bottom: 0,
          padding: "12px 12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 9,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.78)",
          }}
        >
          {product.brand}
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 21,
            fontWeight: 600,
            lineHeight: 1.1,
            color: ON_MEDIA,
            textShadow: "0 1px 6px rgba(0,0,0,0.45)",
          }}
        >
          {product.name}
        </span>

        <div style={{ display: "inline-flex", alignItems: "baseline", gap: 8, marginTop: 2 }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 600,
              color: ON_MEDIA,
            }}
          >
            {fmtPrice(product.price)}
          </span>
          {hasPromo && (
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                color: STRUCK,
                textDecoration: "line-through",
              }}
            >
              {fmtPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}
        >
        {product.available && (
          <QtyStepper value={qty} onChange={setQty} size="sm" locale={locale} />
        )}
        <button
          type="button"
          disabled={!product.available}
          onClick={onAdd}
          aria-label={product.available ? `${L.addToCart} — ${product.name}` : L.soldOut}
          style={{
            flex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            border: "none",
            cursor: product.available ? "pointer" : "not-allowed",
            borderRadius: 999,
            padding: "9px 12px",
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.5px",
            color: product.available ? T.ctaText : ON_MEDIA,
            background: product.available ? T.cta : "rgba(255,255,255,0.18)",
            opacity: product.available ? 1 : 0.85,
            backdropFilter: product.available ? "none" : "blur(4px)",
            WebkitBackdropFilter: product.available ? "none" : "blur(4px)",
            filter: product.available && hover ? "brightness(1.08)" : "none",
            transition: "filter 180ms ease",
          }}
        >
          {product.available ? (
            <>
              {!added && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              )}
              {added ? L.added : L.addToCart}
            </>
          ) : (
            L.soldOut
          )}
        </button>
        </div>
      </div>
    </div>
  );
}
