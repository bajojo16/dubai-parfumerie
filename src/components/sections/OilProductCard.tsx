"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { addItem } from "@/lib/cart";
import type { OilProduct } from "@/data/oil-products";

/* ── Tokens carte « huile concentrée » (hex exacts spec) ── */
const T = {
  cardFrom: "#F7F1E6",
  cardTo: "#F2E9D8",
  border: "#E4D6BA",
  ink: "#2C2620",
  brand: "#A8915F",
  meta: "#9A8E74",
  priceGold: "#A8801F",
  strike: "#B0AEA6",
  star: "#D9A93F",
  ctaGold: "#C4A24F",
  ctaSoftFrom: "#D4B264",
  ctaSoftTo: "#B98F3A",
  rule: "rgba(201,162,74,.32)",
  fallback: "#C9A24A",
};

export type OilCardLabels = {
  addToCart: string;
  added: string; // « Ajouté ✓ »
  soldOut: string; // « Épuisé »
  addToWishlist: string;
  removeFromWishlist: string;
  oil: string; // « Huile »
};

const DEFAULT_LABELS: OilCardLabels = {
  addToCart: "Ajouter au panier",
  added: "Ajouté ✓",
  soldOut: "Épuisé",
  addToWishlist: "Ajouter aux favoris",
  removeFromWishlist: "Retirer des favoris",
  oil: "Huile",
};

/* Pastille or de repli quand un visuel est absent (pas de 404 visible). */
function GoldCircle({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 30%, #E8D6A6, ${T.fallback})`,
        boxShadow: "inset 0 0 0 1px rgba(168,128,31,.35)",
        ...style,
      }}
    />
  );
}

/* Image avec repli pastille or si le fichier n'existe pas (onError). */
function SafeImage({
  src,
  alt,
  width,
  height,
  fallbackSize,
  imgStyle,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  fallbackSize: number;
  imgStyle?: React.CSSProperties;
  sizes?: string;
  priority?: boolean;
}) {
  const [errored, setErrored] = useState(false);
  if (errored) return <GoldCircle size={fallbackSize} />;
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      onError={() => setErrored(true)}
      style={imgStyle}
    />
  );
}

export function OilProductCard({
  product,
  locale = "fr",
  labels,
}: {
  product: OilProduct;
  locale?: string;
  labels?: Partial<OilCardLabels>;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const isRTL = locale === "ar";
  const [hover, setHover] = useState(false);
  const [ctaHover, setCtaHover] = useState(false);
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);
  const [prefersReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );

  const fmtPrice = (n: number) => {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `${Math.round(n)} €`;
    }
  };

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.available) return;
    addItem(
      {
        id: product.variantId,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.bottleImage,
      },
      1
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const onWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWished((w) => !w);
  };

  const lift = hover && !prefersReduced;

  return (
    <Link
      href={product.href}
      aria-label={`${product.name} — ${product.brand}`}
      dir={isRTL ? "rtl" : "ltr"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        display: "block",
        textDecoration: "none",
        background: `linear-gradient(160deg, ${T.cardFrom}, ${T.cardTo})`,
        border: `.5px solid ${T.border}`,
        borderRadius: 18,
        padding: "0 16px 16px",
        marginTop: 42,
        transform: lift ? "translateY(-4px)" : "translateY(0)",
        boxShadow: lift ? "0 18px 40px rgba(120,90,40,.16)" : "0 6px 18px rgba(120,90,40,.06)",
        transition: "transform 240ms ease, box-shadow 240ms ease",
        overflow: "visible",
      }}
    >
      {/* Motif géométrique or discret (coin haut-fin) */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          insetInlineEnd: 0,
          opacity: 0.32,
          pointerEvents: "none",
          borderTopRightRadius: isRTL ? 0 : 18,
          borderTopLeftRadius: isRTL ? 18 : 0,
          transform: isRTL ? "scaleX(-1)" : "none",
        }}
      >
        <g fill="none" stroke="#C9A24A" strokeWidth="1">
          <circle cx="96" cy="24" r="22" />
          <circle cx="96" cy="24" r="14" />
          <path d="M96 2v44M74 24h44M80 8l32 32M112 8L80 40" />
        </g>
      </svg>

      {/* Rangée badges (note début / cœur fin) */}
      <div
        style={{
          position: "absolute",
          top: 10,
          insetInlineStart: 10,
          insetInlineEnd: 10,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          zIndex: 3,
          pointerEvents: "none",
        }}
      >
        {/* Pastille note — début */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "rgba(255,255,255,.92)",
            borderRadius: 999,
            padding: "4px 9px",
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 600,
            color: T.ink,
            boxShadow: "0 2px 8px rgba(120,90,40,.12)",
          }}
        >
          <span style={{ color: T.star }} aria-hidden>
            ★
          </span>
          {product.rating.toFixed(1)}
          <span style={{ color: T.meta, fontWeight: 500 }}>({product.reviewCount})</span>
        </span>

        {/* Cœur favori — fin */}
        <button
          type="button"
          onClick={onWish}
          aria-pressed={wished}
          aria-label={wished ? L.removeFromWishlist : L.addToWishlist}
          style={{
            pointerEvents: "auto",
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "none",
            background: "rgba(255,255,255,.92)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(120,90,40,.12)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={wished ? T.ctaGold : "none"}
            stroke={wished ? T.ctaGold : "#9A8E74"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </button>
      </div>

      {/* Flacon qui déborde au-dessus du haut de carte */}
      <div
        style={{
          position: "relative",
          height: 160,
          marginTop: -56,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        {/* Accents décoratifs (sous le flacon) */}
        {product.decorAccents?.slice(0, 2).map((src, i) => (
          <span
            key={src}
            style={{
              position: "absolute",
              bottom: 4,
              insetInlineStart: i === 0 ? "18%" : "auto",
              insetInlineEnd: i === 1 ? "18%" : "auto",
              zIndex: 1,
              opacity: 0.9,
            }}
          >
            <SafeImage
              src={src}
              alt=""
              width={30}
              height={30}
              fallbackSize={20}
              imgStyle={{ width: 30, height: 30, objectFit: "contain" }}
            />
          </span>
        ))}

        {/* Ombre douce sous le flacon */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            bottom: 0,
            width: 70,
            height: 14,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(120,90,40,.28), transparent 70%)",
            filter: "blur(2px)",
            zIndex: 1,
          }}
        />

        <span style={{ position: "relative", zIndex: 2, filter: "drop-shadow(0 10px 14px rgba(120,90,40,.28))" }}>
          <SafeImage
            src={product.bottleImage}
            alt={`${product.name} ${product.brand}`}
            width={144}
            height={160}
            fallbackSize={120}
            sizes="160px"
            imgStyle={{ height: 160, width: "auto", objectFit: "contain", borderRadius: 10 }}
          />
        </span>
      </div>

      {/* Texte */}
      <div style={{ textAlign: "center", marginTop: 10 }}>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 9.5,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: T.brand,
            fontWeight: 600,
          }}
        >
          {product.brand}
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            fontWeight: 600,
            lineHeight: 1.15,
            color: T.ink,
            marginTop: 2,
          }}
        >
          {product.name}
        </div>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 10,
            color: T.meta,
            marginTop: 3,
          }}
        >
          {L.oil} · {product.volume} · {product.gender}
        </div>

        {/* Prix */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "baseline",
            gap: 7,
            marginTop: 6,
          }}
        >
          <span style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, color: T.priceGold }}>
            {fmtPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                color: T.strike,
                textDecoration: "line-through",
              }}
            >
              {fmtPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>

      {/* Familles olfactives — 3 colonnes, filet or au-dessus */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 6,
          marginTop: 12,
          paddingTop: 10,
          borderTop: `1px solid ${T.rule}`,
        }}
      >
        {product.families.slice(0, 3).map((f) => (
          <div
            key={f.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(255,255,255,.6)",
                display: "grid",
                placeItems: "center",
                boxShadow: "inset 0 0 0 1px rgba(201,162,74,.25)",
              }}
            >
              <SafeImage
                src={f.icon}
                alt=""
                width={18}
                height={18}
                fallbackSize={14}
                imgStyle={{ width: 18, height: 18, objectFit: "contain" }}
              />
            </span>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 9,
                color: T.meta,
                textAlign: "center",
              }}
            >
              {f.label}
            </span>
          </div>
        ))}
      </div>

      {/* Bouton ajout panier / épuisé */}
      <button
        type="button"
        onClick={onAdd}
        disabled={!product.available}
        aria-label={
          product.available ? `${L.addToCart} — ${product.name}` : `${L.soldOut} — ${product.name}`
        }
        onMouseEnter={() => setCtaHover(true)}
        onMouseLeave={() => setCtaHover(false)}
        style={{
          marginTop: 12,
          width: "100%",
          border: "none",
          borderRadius: 999,
          padding: "11px 16px",
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: product.available ? "#fff" : "#8A8278",
          cursor: product.available ? "pointer" : "not-allowed",
          background: !product.available
            ? "#E7DEC9"
            : ctaHover
              ? `linear-gradient(135deg, ${T.ctaSoftFrom}, ${T.ctaSoftTo})`
              : T.ctaGold,
          transition: "background 200ms ease",
        }}
      >
        {!product.available ? L.soldOut : added ? L.added : L.addToCart}
      </button>
    </Link>
  );
}
