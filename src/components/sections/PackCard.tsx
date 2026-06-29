"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { addItem } from "@/lib/cart";
import type { Pack, PackBadge } from "@/data/packs";

export type PackCardLabels = {
  addToCart: string; // « Ajouter au panier »
  gift: string; // « Offrir ce coffret »
  added: string; // « Ajouté ✓ »
  soldOut: string; // « Épuisé »
  badges: Record<Exclude<PackBadge, null>, string>;
};

const DEFAULT_LABELS: PackCardLabels = {
  addToCart: "Ajouter au panier",
  gift: "Offrir ce coffret",
  added: "Ajouté ✓",
  soldOut: "Épuisé",
  badges: {
    bestseller: "★ Best-seller",
    most_gifted: "✦ Le plus offert",
    oud: "100% Oud",
    limited: "Édition limitée",
    coup_de_coeur: "♥ Coup de cœur",
    new: "Nouveau",
  },
};

const BADGE_STYLE: Record<
  Exclude<PackBadge, null>,
  { bg: string; text: string }
> = {
  bestseller: { bg: "#15110D", text: "#E8C873" },
  most_gifted: { bg: "#C9A24A", text: "#15110D" },
  oud: { bg: "#6B4A2B", text: "#F3E6CF" },
  limited: { bg: "#7A2E18", text: "#F3E6CF" },
  coup_de_coeur: { bg: "#9A3656", text: "#F3E6CF" },
  new: { bg: "#1D7A58", text: "#F3E6CF" },
};

export function PackCard({
  pack,
  locale = "fr",
  labels,
}: {
  pack: Pack;
  locale?: string;
  labels?: Partial<PackCardLabels>;
}) {
  const L: PackCardLabels = {
    ...DEFAULT_LABELS,
    ...labels,
    badges: { ...DEFAULT_LABELS.badges, ...(labels?.badges ?? {}) },
  };
  const isRTL = locale === "ar";

  const [hover, setHover] = useState(false);
  const [ctaHover, setCtaHover] = useState(false);
  const [added, setAdded] = useState(false);
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

  const discount =
    pack.compareAtPrice && pack.compareAtPrice > pack.price
      ? Math.round((1 - pack.price / pack.compareAtPrice) * 100)
      : null;

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!pack.available) return;
    addItem(
      {
        id: pack.variantId,
        name: pack.name,
        brand: "Coffrets & Packs",
        price: pack.price,
        image: pack.image,
      },
      1
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const lift = hover && !prefersReduced;
  const badge = pack.badge ?? null;
  const badgeStyle = badge ? BADGE_STYLE[badge] : null;
  const ctaLabel =
    badge === "most_gifted" ? L.gift : L.addToCart;

  return (
    <Link
      href={pack.href}
      aria-label={`${pack.name}${pack.subtitle ? " — " + pack.subtitle : ""}`}
      dir={isRTL ? "rtl" : "ltr"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "block",
        textDecoration: "none",
        background: "#fff",
        border: "0.5px solid #ECE9E3",
        borderRadius: 18,
        overflow: "hidden",
        textAlign: isRTL ? "right" : "left",
        transform: lift ? "translateY(-4px)" : "none",
        boxShadow: lift ? "0 16px 36px rgba(80,60,30,.14)" : "none",
        transition: "transform .3s, box-shadow .3s",
      }}
    >
      {/* Zone média carrée + podium */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          background: "#F5EFE6",
          overflow: "hidden",
        }}
      >
        {/* Podium dégradé (bas) */}
        <div
          style={{
            position: "absolute",
            insetInline: 0,
            bottom: 0,
            height: "42%",
            background: "linear-gradient(#EFE7D8,#E6DCC8)",
          }}
        />
        {/* Photo du pack, centrée sur le podium */}
        <Image
          src={pack.image}
          alt={pack.name}
          fill
          sizes="(max-width:600px) 50vw, 260px"
          style={{
            objectFit: "contain",
            padding: "14% 16% 10%",
            filter: "drop-shadow(0 14px 18px rgba(80,60,30,.22))",
          }}
        />

        {/* Badge */}
        {badge && badgeStyle && (
          <span
            style={{
              position: "absolute",
              top: 12,
              [isRTL ? "right" : "left"]: 12,
              background: badgeStyle.bg,
              color: badgeStyle.text,
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              letterSpacing: "1px",
              textTransform: "uppercase",
              padding: "5px 11px",
              borderRadius: 20,
            }}
          >
            {L.badges[badge]}
          </span>
        )}
      </div>

      {/* Corps */}
      <div style={{ padding: "15px 16px 17px" }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontWeight: 500,
            color: "#2C2620",
            lineHeight: 1.15,
          }}
        >
          {pack.name}
        </div>
        {pack.subtitle && (
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              color: "#A8915F",
              marginTop: 3,
            }}
          >
            {pack.subtitle}
          </div>
        )}

        {/* Ligne prix */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginTop: 10,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 19,
              fontWeight: 600,
              color: "#2C2620",
            }}
          >
            {fmtPrice(pack.price)}
          </span>
          {pack.compareAtPrice && pack.compareAtPrice > pack.price && (
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                color: "#B0AEA6",
                textDecoration: "line-through",
              }}
            >
              {fmtPrice(pack.compareAtPrice)}
            </span>
          )}
          {discount !== null && (
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                color: "#B98F3A",
              }}
            >
              -{discount}%
            </span>
          )}
        </div>

        {/* Bouton */}
        <button
          type="button"
          disabled={!pack.available}
          aria-label={pack.available ? `${ctaLabel} — ${pack.name}` : L.soldOut}
          onMouseEnter={() => setCtaHover(true)}
          onMouseLeave={() => setCtaHover(false)}
          onClick={onAdd}
          style={{
            marginTop: 13,
            width: "100%",
            border: "none",
            cursor: pack.available ? "pointer" : "not-allowed",
            borderRadius: 22,
            padding: 11,
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: pack.available ? "#fff" : "#8C857C",
            background: !pack.available
              ? "#ECE9E3"
              : ctaHover
                ? "linear-gradient(135deg,#D4B264,#B98F3A)"
                : "#C4A24F",
            transition: "background .2s",
          }}
        >
          {!pack.available ? L.soldOut : added ? L.added : ctaLabel}
        </button>
      </div>
    </Link>
  );
}
