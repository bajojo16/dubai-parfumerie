"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { QtyStepper } from "@/components/ui/QtyStepper";

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
  onAddToCart?: (p: LuxeProduct, qty: number) => void;
  locale?: string;
}) {
  const t = useTranslations("common");
  const [hover, setHover] = useState(false);
  const [qty, setQty] = useState(1);
  const isRTL = locale === "ar";
  const cur = product.currency ?? "€";

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : null;

  const fmt = (n: number) =>
    `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur}`;

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
            className="dp-luxe-badge-promo"
            style={{
              position: "absolute",
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
            className="dp-luxe-badge-stock"
            style={{
              position: "absolute",
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

        <style>{`
          .dp-luxe-badge-promo,
          .dp-luxe-badge-stock {
            top: 22px;
          }
          @media (max-width: 760px) {
            .dp-luxe-badge-stock {
              top: 52px;
            }
          }
          /* Carte resserrée à ~158px dans la grille 2 colonnes mobile
             (.dp-home-prod-grid, cf. globals.css) : le corps (titre 24px,
             prix 22px, padding 18/20/22) était pensé pour ~280px et
             débordait/serrait le texte à cette largeur. On réduit
             typo + espacements en conservant les proportions. */
          @media (max-width: 760px) {
            .dp-luxe-body { padding: 12px 14px 14px !important; gap: 6px !important; }
            .dp-luxe-brand { font-size: 9.5px !important; letter-spacing: 1px !important; }
            .dp-luxe-title { font-size: 16px !important; }
            .dp-luxe-price { font-size: 16px !important; }
            .dp-luxe-oldprice { font-size: 11px !important; }
          }
        `}</style>
      </div>

      {/* Corps */}
      <div className="dp-luxe-body" style={{ padding: "18px 20px 22px", display: "flex", flexDirection: "column", gap: 8 }}>
        <Link href={product.href} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="dp-luxe-brand" style={{ fontFamily: "var(--font-sans)", fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: T.creamLabel }}>
            {product.brand}
          </span>
          <span className="dp-luxe-title" style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 500, lineHeight: 1.1, color: T.ink }}>
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
        <div style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "baseline", gap: 10, marginTop: 2 }}>
          <span className="dp-luxe-price" style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: T.inkPrice, whiteSpace: "nowrap" }}>
            {fmt(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="dp-luxe-oldprice" style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: T.muted, textDecoration: "line-through", whiteSpace: "nowrap" }}>
              {fmt(product.oldPrice)}
            </span>
          )}
        </div>

        {/* Sélecteur quantité + bouton */}
        <div className="dp-cardluxe-actions" style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
        <QtyStepper value={qty} onChange={setQty} size="sm" locale={locale} />
        <button
          className="dp-cardluxe-addbtn"
          type="button"
          aria-label={`${t("add_to_cart")} — ${product.title}`}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => onAddToCart?.(product, qty)}
          style={{
            flex: 1,
            border: "none",
            cursor: "pointer",
            borderRadius: 20,
            padding: "9px 14px",
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.6px",
            lineHeight: 1.25,
            textTransform: "uppercase",
            color: "#fff",
            background: `linear-gradient(135deg, ${T.goldSoft}, ${T.goldDeep})`,
            filter: hover ? "brightness(1.06) saturate(1.04)" : "none",
            transition: "filter 200ms ease, transform 200ms ease",
            transform: hover ? "translateY(-1px)" : "none",
          }}
        >
          {t("add_to_cart")}
        </button>
        </div>
      </div>
    </div>
  );
}
