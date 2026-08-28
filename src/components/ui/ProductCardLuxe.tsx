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
  showStockBadge = true,
}: {
  product: LuxeProduct;
  onAddToCart?: (p: LuxeProduct, qty: number) => void;
  locale?: string;
  /** Bandeau « stock limité » sur l'image. Les sections qui ne veulent aucun
   *  libellé promotionnel sur la carte (ex. « Les parfums de l'été ») passent
   *  false : le badge remise reste le seul badge affiché. */
  showStockBadge?: boolean;
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
      className="dp-cardluxe"
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
        // Sans borne, une piste 1fr étire la carte à ~420px dès que la grille
        // repasse à 2 colonnes (760-980px) : l'image 4:5 y atteignait ~500px
        // de haut et une rangée mangeait tout l'écran. La densité visée est
        // celle des cartes du rail best-sellers (216px).
        width: "100%",
        maxWidth: 280,
        justifySelf: "center",
      }}
    >
      {/* Zone image portrait (cadre crème) */}
      <div className="dp-luxe-media" style={{ position: "relative", background: T.imageBg, padding: 6, overflow: "hidden" }}>
        <div className="dp-luxe-frame" style={{ position: "relative", width: "100%", aspectRatio: "1 / 1.15", borderRadius: 16, overflow: "hidden" }}>
          {/* `objectPosition` à 42 % : en `cover`, le cadrage centré collait le
              bouchon au bord haut du cadre, sous les pastilles « Soldes » et
              la remise. Descendre le point d'ancrage de huit points rend de
              l'air au-dessus du flacon sans entamer son ombre portée. */}
          <Image src={product.image} alt={product.title} fill sizes="(max-width:760px) 50vw, 260px" style={{ objectFit: "cover", objectPosition: "center 42%" }} />
        </div>

        {/* Badge promo — début (gauche LTR / droite RTL) */}
        {discount !== null && (
          <span
            className="dp-luxe-badge-promo"
            style={{
              position: "absolute",
              insetInlineStart: 12,
              // aucun badge ne doit pouvoir sortir du cadre, quelle que soit
              // la longueur du libellé
              maxWidth: "calc(100% - 24px)",
              whiteSpace: "nowrap",
              background: "rgba(255,251,243,0.92)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              color: T.goldDark,
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              fontWeight: 500,
              padding: "4px 9px",
              borderRadius: 20,
            }}
          >
            −{discount}%
          </span>
        )}

        {/* Badge stock — fin (droite LTR / gauche RTL) */}
        {showStockBadge && product.limitedStock && (
          <span
            className="dp-luxe-badge-stock"
            style={{
              position: "absolute",
              insetInlineEnd: 12,
              // borné à la largeur utile de la carte : le libellé est long et
              // sortait du cadre, coupé en plein mot
              maxWidth: "calc(100% - 24px)",
              // le libellé passe à la ligne plutôt que d'être coupé : aucun
              // texte de badge ne doit plus être tronqué, quelle que soit sa
              // longueur (i18n : « Ограниченный запас », « Begrenzter Vorrat »…)
              whiteSpace: "normal",
              lineHeight: 1.25,
              textAlign: "center",
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              color: T.stockText,
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              fontWeight: 500,
              padding: "4px 9px",
              borderRadius: 20,
            }}
          >
            {t("stock_limited")}
          </span>
        )}

        <style>{`
          .dp-luxe-badge-promo,
          .dp-luxe-badge-stock {
            top: 12px;
          }
          /* Le rendu mobile a été calibré séparément et doit rester intact :
             on y rétablit toutes les valeurs d'avant le resserrement desktop
             (padding du cadre, ratio de l'image, badges, stepper). */
          @media (max-width: 760px) {
            .dp-cardluxe { max-width: none !important; }
            .dp-luxe-media { padding: 14px !important; }
            .dp-luxe-frame { aspect-ratio: 4 / 5 !important; border-radius: 16px !important; }
            .dp-luxe-badge-promo,
            .dp-luxe-badge-stock {
              top: 22px;
              font-size: 11px !important;
              padding: 5px 11px !important;
            }
            .dp-luxe-badge-promo {
              inset-inline-start: 22px !important;
              max-width: calc(100% - 44px) !important;
            }
            .dp-luxe-badge-stock {
              top: 52px;
              inset-inline-end: 22px !important;
              max-width: calc(100% - 44px) !important;
            }
            .dp-luxe-stars,
            .dp-luxe-reviews { font-size: 11px !important; }
            .dp-luxe-titleblock { gap: 6px !important; }
            .dp-luxe-pricerow { gap: 10px !important; margin-top: 2px !important; }
            .dp-cardluxe-actions { margin-top: auto !important; padding-top: 6px !important; }
            /* Le stepper repasse en taille sm via ses variables : ses styles
               sont inline, seul un !important sur les variables les atteint. */
            .dp-cardluxe-actions .dp-qty {
              --qty-dim: 32px !important;
              --qty-fbtn: 16px !important;
              --qty-fval: 13px !important;
              --qty-valw: 30px !important;
            }
          }
          /* Carte resserrée à ~158px dans la grille 2 colonnes mobile
             (.dp-home-prod-grid, cf. globals.css) : le corps (titre 24px,
             prix 22px, padding 18/20/22) était pensé pour ~280px et
             débordait/serrait le texte à cette largeur. On réduit
             typo + espacements en conservant les proportions. */
          @media (max-width: 760px) {
            .dp-luxe-body { padding: 9px 10px 11px !important; gap: 4px !important; }
            .dp-luxe-brand { font-size: 8.5px !important; letter-spacing: .9px !important; }
            .dp-luxe-title { font-size: 13.5px !important; }
            .dp-luxe-price { font-size: 14px !important; }
            .dp-luxe-oldprice { font-size: 10px !important; }
            /* Deux cartes par ligne sur un écran de 390 px : le stepper et le
               bouton côte à côte ne tenaient pas, le bouton passait sur deux
               lignes et doublait la hauteur de la carte. */
            .dp-cardluxe-actions { gap: 5px !important; }
            .dp-cardluxe-addbtn { font-size: 9.5px !important; padding: 7px 8px !important; letter-spacing: 0.6px !important; }
          }
        `}</style>
      </div>

      {/* Corps */}
      <div className="dp-luxe-body" style={{ padding: "11px 13px 13px", display: "flex", flexDirection: "column", gap: 5, flex: "1 1 auto" }}>
        <Link href={product.href} className="dp-luxe-titleblock" style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="dp-luxe-brand" style={{ fontFamily: "var(--font-sans)", fontSize: 9.5, letterSpacing: "1.2px", textTransform: "uppercase", color: T.creamLabel }}>
            {product.brand}
          </span>
          <span className="dp-luxe-title" style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 500, lineHeight: 1.12, color: T.ink }}>
            {product.title}
          </span>
        </Link>

        {/* Avis clients (étoiles or) — conservés */}
        {product.rating != null && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span className="dp-luxe-stars" style={{ display: "inline-flex", color: T.gold, fontSize: 10 }} aria-hidden>
              {[0, 1, 2, 3, 4].map((s) => (
                <span key={s} style={{ opacity: s < Math.round(product.rating!) ? 1 : 0.28 }}>★</span>
              ))}
            </span>
            {product.reviewCount != null && (
              <span className="dp-luxe-reviews" style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: T.muted }}>
                ({product.reviewCount} {t("reviews")})
              </span>
            )}
          </div>
        )}

        {/* Ligne prix */}
        <div className="dp-luxe-pricerow" style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "baseline", gap: 8, marginTop: 1 }}>
          <span className="dp-luxe-price" style={{ fontFamily: "var(--font-display)", fontSize: 16.5, fontWeight: 600, color: T.inkPrice, whiteSpace: "nowrap" }}>
            {fmt(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="dp-luxe-oldprice" style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: T.muted, textDecoration: "line-through", whiteSpace: "nowrap" }}>
              {fmt(product.oldPrice)}
            </span>
          )}
        </div>

        {/* Sélecteur quantité + bouton */}
        <div className="dp-cardluxe-actions" style={{ marginTop: "auto", paddingTop: 5, display: "flex", alignItems: "center", gap: 7 }}>
        <QtyStepper value={qty} onChange={setQty} size="xs" locale={locale} />
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
            padding: "7px 10px",
            fontFamily: "var(--font-sans)",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.4px",
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
