"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { addItem } from "@/lib/cart";

/* ── Palette éditoriale (hex inline, façon ProductCardLuxe) ── */
const C = {
  cream: "#F7F3EC",
  ink: "#1A1611",
  gold: "#B8924A",
  goldLight: "#D9C7A0",
  lines: "#E4DBCB",
  saleRoseBg: "#E9D3D8",
  saleRoseText: "#7A4B52",
  salePrice: "#9B2C2C",
  imageBg: "#F1EBDF",
};

export type Money = {
  amount: number;
  currency: string;
};

export type RailProduct = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  notes: string;
  image: string;
  price: Money;
  compareAtPrice?: Money;
  onSale?: boolean;
};

export type RailCardLabels = {
  sale: string; // badge SOLDES
  addToCart: string; // CTA repos
  adding: string; // pendant l'ajout
  added: string; // feedback après ajout
  viewProduct: string; // aria-label lien (inclut {name})
};

const DEFAULT_LABELS: RailCardLabels = {
  sale: "Soldes",
  addToCart: "Ajouter au panier",
  adding: "Ajout…",
  added: "Ajouté ✓",
  viewProduct: "Voir le produit",
};

export function RailProductCard({
  product,
  onAddToCart,
  locale = "fr",
  labels,
}: {
  product: RailProduct;
  onAddToCart?: (id: string) => void;
  locale?: string;
  labels?: Partial<RailCardLabels>;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const isRTL = locale === "ar";

  const [hover, setHover] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Formatage prix selon locale + devise (Intl)
  const fmt = useCallback(
    (m: Money) => {
      try {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency: m.currency,
        }).format(m.amount);
      } catch {
        return `${m.amount.toFixed(2)} ${m.currency}`;
      }
    },
    [locale]
  );

  // Remise calculée (jamais codée en dur) : arrondi entier à partir du rapport prix / compareAtPrice
  const discount =
    product.compareAtPrice && product.compareAtPrice.amount > product.price.amount
      ? Math.round((1 - product.price.amount / product.compareAtPrice.amount) * 100)
      : null;

  const showSale = !!product.onSale && discount !== null;

  // prefers-reduced-motion → désactive hover translate/zoom
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const handleAdd = useCallback(() => {
    if (adding) return;
    setAdding(true);
    // onAddToCart fourni par le parent, sinon fallback panier local (addItem)
    if (onAddToCart) onAddToCart(product.id);
    else
      addItem({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price.amount,
        image: product.image,
      });
    timers.current.push(
      setTimeout(() => {
        setAdding(false);
        setAdded(true);
        timers.current.push(setTimeout(() => setAdded(false), 1600));
      }, 500)
    );
  }, [adding, onAddToCart, product]);

  const productHref = `/produit/${product.slug}`;
  const lift = hover && !reduceMotion;

  return (
    <article
      dir={isRTL ? "rtl" : "ltr"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: "0 0 auto",
        width: 300,
        background: "#fff",
        border: `1px solid ${C.lines}`,
        borderRadius: 18,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        textAlign: isRTL ? "right" : "left",
        transform: lift ? "translateY(-6px)" : "none",
        boxShadow: lift
          ? "0 16px 36px rgba(40,30,15,0.16)"
          : "0 6px 18px rgba(40,30,15,0.06)",
        transition: reduceMotion
          ? "none"
          : "transform 240ms ease, box-shadow 240ms ease",
      }}
    >
      {/* Média (ratio portrait — carte volontairement plus haute) avec badges */}
      <Link
        href={productHref}
        aria-label={`${L.viewProduct} — ${product.name}`}
        style={{
          position: "relative",
          display: "block",
          aspectRatio: "1 / 1.15",
          background: C.imageBg,
          overflow: "hidden",
          textDecoration: "none",
        }}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="300px"
          style={{
            objectFit: "cover",
            transform: lift ? "scale(1.05)" : "scale(1)",
            transition: reduceMotion ? "none" : "transform 500ms ease",
          }}
        />

        {/* Badge SOLDES — début (gauche LTR / droite RTL) */}
        {showSale && (
          <span
            style={{
              position: "absolute",
              top: 14,
              insetInlineStart: 14,
              background: C.saleRoseBg,
              color: C.saleRoseText,
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              padding: "5px 11px",
              borderRadius: 999,
            }}
          >
            {L.sale}
          </span>
        )}

        {/* Badge remine % — fin (droite LTR / gauche RTL) */}
        {discount !== null && (
          <span
            style={{
              position: "absolute",
              top: 14,
              insetInlineEnd: 14,
              background: C.ink,
              color: C.cream,
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 600,
              padding: "5px 10px",
              borderRadius: 999,
            }}
          >
            −{discount}%
          </span>
        )}
      </Link>

      {/* Corps */}
      <div
        style={{
          padding: "11px 16px 13px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <Link
          href={productHref}
          aria-label={`${L.viewProduct} — ${product.name}`}
          style={{
            textDecoration: "none",
            color: "inherit",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: C.gold,
            }}
          >
            {product.brand}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              fontWeight: 500,
              lineHeight: 1.1,
              color: C.ink,
            }}
          >
            {product.name}
          </span>
        </Link>

        {/* Notes olfactives */}
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12.5,
            color: "#8A8378",
          }}
        >
          {product.notes}
        </span>

        {/* Ligne prix : prix soldé + prix barré */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "baseline",
            gap: 10,
            marginTop: 1,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 19,
              fontWeight: 600,
              color: showSale ? C.salePrice : C.ink,
            }}
          >
            {fmt(product.price)}
          </span>
          {product.compareAtPrice &&
            product.compareAtPrice.amount > product.price.amount && (
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  color: "#A8A095",
                  textDecoration: "line-through",
                }}
              >
                {fmt(product.compareAtPrice)}
              </span>
            )}
        </div>

        {/* Bouton ajout — séparé du lien (pas d'imbrication) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleAdd();
          }}
          aria-label={`${L.addToCart} — ${product.name}`}
          style={{
            marginTop: 6,
            width: "100%",
            border: "none",
            cursor: "pointer",
            borderRadius: 999,
            padding: "9px 16px",
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: hover ? C.ink : C.cream,
            background: hover ? C.gold : C.ink,
            transition: "background 220ms ease, color 220ms ease",
          }}
        >
          {adding ? L.adding : added ? L.added : L.addToCart}
        </button>

        {/* Retour accessible (lecteurs d'écran) */}
        <span
          aria-live="polite"
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
          }}
        >
          {added ? `${L.added} — ${product.name}` : ""}
        </span>
      </div>
    </article>
  );
}
