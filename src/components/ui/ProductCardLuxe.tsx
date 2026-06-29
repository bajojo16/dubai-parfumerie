"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";

/* ── Design tokens « Soft Luxe Arrondi » (hex exacts) ── */
const T = {
  gold: "#C9A24A",
  goldDark: "#8A6A1E",
  goldSoft: "#D4B264",
  goldDeep: "#B98F3A",
  ink: "#2C2620",
  inkPrice: "#4A4038",
  muted: "#B0AEA6",
  creamLabel: "#A8915F",
  cardBg: "#FFFFFF",
  cardBorder: "#ECE9E3",
  imageBg: "#F7F3EE",
  stockText: "#5A5650",
};

export type LuxeProduct = {
  image: string;
  brand: string;
  title: string;
  price: number;
  oldPrice?: number;
  limitedStock?: boolean;
  href: string;
  rating?: number; // 0–5
  reviewCount?: number;
  currency?: string;
};

export function ProductCardLuxe({
  product,
  onAddToCart,
  locale,
}: {
  product: LuxeProduct;
  onAddToCart?: (p: LuxeProduct) => void;
  locale?: string;
}) {
  const t = useTranslations("common");
  const [hover, setHover] = useState(false);
  const isRTL = locale === "ar";
  const cur = product.currency ?? "€";

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : null;

  const fmt = (n: number) => `${n.toFixed(2)} ${cur}`;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        background: T.cardBg,
        border: `1px solid ${T.cardBorder}`,
        borderRadius: 22,
        boxShadow: "0 8px 24px rgba(80,60,30,0.08)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        textAlign: isRTL ? "right" : "left",
      }}
    >
      {/* Zone image carrée (cadre crème) */}
      <div style={{ position: "relative", background: T.imageBg, padding: 14 }}>
        <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", borderRadius: 16, overflow: "hidden" }}>
          <Image src={product.image} alt={product.title} fill sizes="(max-width:600px) 50vw, 280px" style={{ objectFit: "cover" }} />
        </div>

        {/* Badge promo — début (gauche LTR / droite RTL) */}
        {discount !== null && (
          <span
            style={{
              position: "absolute",
              top: 22,
              insetInlineStart: 22,
              background: "rgba(201,162,74,0.22)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              color: T.goldDark,
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              fontWeight: 500,
              padding: "5px 11px",
              borderRadius: 20,
            }}
          >
            −{discount}%
          </span>
        )}

        {/* Badge stock — fin (droite LTR / gauche RTL) */}
        {product.limitedStock && (
          <span
            style={{
              position: "absolute",
              top: 22,
              insetInlineEnd: 22,
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              color: T.stockText,
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              fontWeight: 500,
              padding: "5px 11px",
              borderRadius: 20,
            }}
          >
            {t("stock_limited")}
          </span>
        )}
      </div>

      {/* Corps */}
      <div style={{ padding: "18px 20px 22px", display: "flex", flexDirection: "column", gap: 8 }}>
        <Link href={product.href} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: T.creamLabel }}>
            {product.brand}
          </span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 500, lineHeight: 1.1, color: T.ink }}>
            {product.title}
          </span>
        </Link>

        {/* Avis clients (étoiles or) — conservés */}
        {product.rating != null && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "inline-flex", color: T.gold, fontSize: 13 }} aria-hidden>
              {[0, 1, 2, 3, 4].map((s) => (
                <span key={s} style={{ opacity: s < Math.round(product.rating!) ? 1 : 0.28 }}>★</span>
              ))}
            </span>
            {product.reviewCount != null && (
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: T.muted }}>
                ({product.reviewCount} {t("reviews")})
              </span>
            )}
          </div>
        )}

        {/* Ligne prix */}
        <div style={{ display: "inline-flex", alignItems: "baseline", gap: 10, marginTop: 2 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: T.inkPrice }}>
            {fmt(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: T.muted, textDecoration: "line-through" }}>
              {fmt(product.oldPrice)}
            </span>
          )}
        </div>

        {/* Bouton */}
        <button
          type="button"
          aria-label={`${t("add_to_cart")} — ${product.title}`}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => onAddToCart?.(product)}
          style={{
            marginTop: 6,
            width: "100%",
            border: "none",
            cursor: "pointer",
            borderRadius: 24,
            padding: "13px 16px",
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "#fff",
            background: hover ? `linear-gradient(135deg, ${T.goldSoft}, ${T.goldDeep})` : T.gold,
            transition: "background 200ms ease",
          }}
        >
          {t("add_to_cart")}
        </button>
      </div>
    </div>
  );
}
