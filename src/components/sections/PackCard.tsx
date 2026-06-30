"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { addItem } from "@/lib/cart";
import type { Pack, PackBadge } from "@/data/packs";

export type PackCardLabels = {
  addToCart: string; // « Ajouter au panier »
  gift: string; // « Offrir ce coffret »
  added: string; // « Ajouté ✓ »
  soldOut: string; // « Épuisé »
  /** « {n} échantillons » — {n} remplacé par le nombre de fioles. */
  samples: string;
  badges: Record<Exclude<PackBadge, null>, string>;
};

const DEFAULT_LABELS: PackCardLabels = {
  addToCart: "Ajouter au panier",
  gift: "Offrir ce coffret",
  added: "Ajouté ✓",
  soldOut: "Épuisé",
  samples: "{n} échantillons",
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

export type PackSize = "hero" | "tall" | "wide" | "soft";

/** Petite fiole d'échantillon décorative (verre + capsule dorée). */
function Vial({
  angle,
  fanned,
  reduced,
  big,
}: {
  angle: number;
  fanned: boolean;
  reduced: boolean;
  big: boolean;
}) {
  const open = fanned || reduced;
  const h = big ? 30 : 24;
  const w = big ? 11 : 9;
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        bottom: "16%",
        insetInlineStart: "50%",
        transformOrigin: "50% 100%",
        transform: open
          ? `translateX(-50%) rotate(${angle}deg) translateY(-14%)`
          : `translateX(-50%) rotate(0deg) translateY(8%)`,
        opacity: open ? 1 : 0.0,
        transition: reduced
          ? "none"
          : "transform .5s cubic-bezier(.34,1.56,.64,1), opacity .35s ease",
        pointerEvents: "none",
      }}
    >
      {/* Capsule dorée */}
      <span
        style={{
          display: "block",
          width: w * 0.62,
          height: 7,
          margin: "0 auto",
          borderRadius: "3px 3px 1px 1px",
          background: "linear-gradient(180deg,#E7C879,#A8801F)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.5)",
        }}
      />
      {/* Col + corps en verre */}
      <span
        style={{
          display: "block",
          width: w,
          height: h,
          borderRadius: `${w * 0.32}px ${w * 0.32}px ${w * 0.5}px ${w * 0.5}px`,
          background:
            "linear-gradient(150deg,rgba(255,255,255,.92),rgba(201,162,74,.32) 55%,rgba(168,128,31,.5))",
          border: "0.5px solid rgba(168,128,31,.6)",
          boxShadow:
            "0 6px 12px rgba(80,60,30,.28), inset -2px 0 3px rgba(255,255,255,.45)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Niveau de jus parfumé */}
        <span
          style={{
            position: "absolute",
            insetInline: 0,
            bottom: 0,
            height: "58%",
            background:
              "linear-gradient(180deg,rgba(201,162,74,.55),rgba(122,46,24,.55))",
          }}
        />
      </span>
    </span>
  );
}

export function PackCard({
  pack,
  locale = "fr",
  labels,
  index = 0,
  size = "soft",
}: {
  pack: Pack;
  locale?: string;
  labels?: Partial<PackCardLabels>;
  index?: number;
  size?: PackSize;
}) {
  const L: PackCardLabels = {
    ...DEFAULT_LABELS,
    ...labels,
    badges: { ...DEFAULT_LABELS.badges, ...(labels?.badges ?? {}) },
  };
  const isRTL = locale === "ar";
  const dirSign = isRTL ? -1 : 1;
  const big = size === "hero" || size === "tall";

  const [hover, setHover] = useState(false);
  const [ctaHover, setCtaHover] = useState(false);
  const [added, setAdded] = useState(false);
  const [shown, setShown] = useState(false);
  const rootRef = useRef<HTMLAnchorElement | null>(null);
  const [prefersReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );

  // Apparition animée au scroll (stagger via delay = index).
  useEffect(() => {
    if (prefersReduced) {
      setShown(true);
      return;
    }
    const el = rootRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prefersReduced]);

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

  const active = hover && !prefersReduced;
  const badge = pack.badge ?? null;
  const badgeStyle = badge ? BADGE_STYLE[badge] : null;
  const ctaLabel = badge === "most_gifted" ? L.gift : L.addToCart;
  const showRibbon = badge === "limited" || badge === "bestseller";

  // Inclinaison ludique alternée selon la position dans la mosaïque.
  const tilt = (index % 2 === 0 ? -0.9 : 1) * dirSign;

  // Fioles en éventail
  const n = Math.max(1, Math.min(pack.sampleCount ?? 3, 6));
  const maxFan = Math.min(46, 12 + n * 6);
  const vials = Array.from({ length: n }, (_, i) =>
    n === 1 ? 0 : (i / (n - 1) - 0.5) * 2 * maxFan
  );

  return (
    <Link
      ref={rootRef}
      href={pack.href}
      aria-label={`${pack.name}${pack.subtitle ? " — " + pack.subtitle : ""}`}
      dir={isRTL ? "rtl" : "ltr"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        textDecoration: "none",
        background: "linear-gradient(180deg,#FFFFFF,#FDFBF6)",
        border: "0.5px solid #ECE3CF",
        borderRadius: 14,
        overflow: "hidden",
        textAlign: isRTL ? "right" : "left",
        opacity: shown ? 1 : 0,
        transform: shown
          ? active
            ? `translateY(-6px) rotate(${tilt}deg) scale(1.012)`
            : "translateY(0) rotate(0deg) scale(1)"
          : "translateY(26px) scale(.965)",
        transition: prefersReduced
          ? "none"
          : `opacity .6s ease ${index * 70}ms, transform .55s cubic-bezier(.22,1,.36,1) ${
              shown && active ? "0ms" : `${index * 70}ms`
            }`,
        boxShadow: active
          ? "0 22px 46px rgba(80,60,30,.18)"
          : "0 4px 14px rgba(80,60,30,.06)",
        willChange: "transform, opacity",
      }}
    >
      {/* Zone média — grandit avec la hauteur de la carte (mosaïque) */}
      <div
        style={{
          position: "relative",
          width: "100%",
          flex: "1 1 auto",
          minHeight: big ? 204 : 168,
          background:
            "radial-gradient(120% 90% at 50% 8%,#FBF4E6,#F1E7D3 70%,#E9DCC2)",
          overflow: "hidden",
        }}
      >
        {/* Halo doré au survol */}
        <div
          style={{
            position: "absolute",
            insetInlineStart: "50%",
            top: "12%",
            width: "62%",
            height: "62%",
            transform: "translateX(-50%)",
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(201,162,74,.30),rgba(201,162,74,0) 68%)",
            opacity: active ? 1 : 0,
            transition: prefersReduced ? "none" : "opacity .5s ease",
            pointerEvents: "none",
          }}
        />
        {/* Podium */}
        <div
          style={{
            position: "absolute",
            insetInline: 0,
            bottom: 0,
            height: "38%",
            background: "linear-gradient(#EFE7D8,#E4D8BE)",
          }}
        />
        {/* Photo du pack */}
        <Image
          src={pack.image}
          alt={pack.name}
          fill
          sizes={big ? "(max-width:720px) 100vw, 520px" : "(max-width:720px) 50vw, 320px"}
          style={{
            objectFit: "contain",
            padding: big ? "6% 13% 9%" : "7% 14% 10%",
            filter: "drop-shadow(0 16px 20px rgba(80,60,30,.24))",
            transform: active ? "translateY(-4%) scale(1.03)" : "none",
            transition: prefersReduced ? "none" : "transform .55s cubic-bezier(.22,1,.36,1)",
          }}
        />

        {/* Fioles d'échantillons en éventail */}
        {vials.map((a, i) => (
          <Vial
            key={i}
            angle={a}
            fanned={active}
            reduced={prefersReduced}
            big={big}
          />
        ))}

        {/* Badge */}
        {badge && badgeStyle && (
          <span
            style={{
              position: "absolute",
              top: 8,
              insetInlineStart: 8,
              background: badgeStyle.bg,
              color: badgeStyle.text,
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              letterSpacing: ".7px",
              textTransform: "uppercase",
              padding: "4px 9px",
              borderRadius: 18,
              boxShadow: "0 3px 8px rgba(80,60,30,.18)",
              zIndex: 3,
            }}
          >
            {L.badges[badge]}
          </span>
        )}

        {/* Pastille « ×N fioles » */}
        {pack.sampleCount ? (
          <span
            aria-label={L.samples.replace("{n}", String(pack.sampleCount))}
            title={L.samples.replace("{n}", String(pack.sampleCount))}
            style={{
              position: "absolute",
              top: 8,
              insetInlineEnd: 8,
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background:
                "radial-gradient(circle at 32% 28%,#F4DD9F,#C9A24A 60%,#A8801F)",
              color: "#2C2620",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 12.5,
              lineHeight: 1,
              border: "1.5px solid #FAF6EE",
              boxShadow: "0 6px 14px rgba(168,128,31,.4)",
              transform: active ? "rotate(-8deg) scale(1.06)" : "none",
              transition: prefersReduced ? "none" : "transform .4s ease",
              zIndex: 3,
            }}
          >
            ×{pack.sampleCount}
          </span>
        ) : null}

        {/* Ruban d'angle (édition limitée / best-seller) */}
        {showRibbon && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              bottom: 10,
              insetInlineEnd: -30,
              transform: `rotate(${-45 * dirSign}deg)`,
              transformOrigin: "center",
              background:
                badge === "limited"
                  ? "linear-gradient(90deg,#7A2E18,#A8801F)"
                  : "linear-gradient(90deg,#15110D,#C9A24A)",
              color: "#FDFBF6",
              fontFamily: "var(--font-sans)",
              fontSize: 7.5,
              letterSpacing: "1px",
              textTransform: "uppercase",
              padding: "3px 34px",
              boxShadow: "0 3px 8px rgba(0,0,0,.2)",
              zIndex: 2,
            }}
          >
            {badge === "limited" ? "Limited" : "Iconique"}
          </span>
        )}
      </div>

      {/* Corps */}
      <div style={{ padding: big ? "8px 11px 10px" : "7px 10px 9px" }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: big ? 17.5 : 16,
            fontWeight: 500,
            color: "#2C2620",
            lineHeight: 1.1,
          }}
        >
          {pack.name}
        </div>
        {pack.subtitle && (
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: big ? 12.5 : 11.5,
              color: "#A8801F",
              marginTop: 2,
            }}
          >
            — {pack.subtitle}
          </div>
        )}

        {/* Ligne prix */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            marginTop: 6,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: big ? 17.5 : 16,
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
                fontWeight: 600,
                color: "#fff",
                background: "#B98F3A",
                padding: "2px 7px",
                borderRadius: 11,
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
            marginTop: 8,
            width: "100%",
            border: "none",
            cursor: pack.available ? "pointer" : "not-allowed",
            borderRadius: 16,
            padding: 8,
            fontFamily: "var(--font-sans)",
            fontSize: 9.5,
            letterSpacing: ".6px",
            textTransform: "uppercase",
            color: pack.available ? "#fff" : "#8C857C",
            background: !pack.available
              ? "#ECE9E3"
              : ctaHover
                ? "linear-gradient(135deg,#D4B264,#A8801F)"
                : "linear-gradient(135deg,#C9A24A,#B98F3A)",
            boxShadow: pack.available && ctaHover ? "0 8px 18px rgba(168,128,31,.32)" : "none",
            transition: "background .2s, box-shadow .2s",
          }}
        >
          {!pack.available ? L.soldOut : added ? L.added : ctaLabel}
        </button>
      </div>
    </Link>
  );
}
