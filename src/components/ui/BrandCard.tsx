"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

/**
 * BrandCard — « Soft Luxe Arrondi ».
 * Swap 2-états au survol : face A (wordmark/logo repos) → face B (logo doré + méta marque).
 * Sans PNG de logo, fallback typographique (Cormorant). Brancher de vrais logos via
 * `logo` (repos) et `logoHover` (survol) — fichiers dans /public/brands/.
 */
export type BrandCardData = {
  name: string;
  founded?: number;
  origin?: string;
  count?: string; // ex. « 80+ »
  href?: string;
  logo?: string; // /public/brands/xxx.svg|png — état repos
  logoHover?: string; // état survol (doré)
  cover?: boolean; // logo plein cadre (mockup carré) au lieu de logo contenu sur crème
  coverBg?: string; // fond carte repos en mode cover (match fond du mockup repos)
  coverBgHover?: string; // fond carte survol en mode cover (match fond du mockup survol)
};

const T = {
  cream: "#FAF6EE",
  creamDeep: "#F4ECDC",
  border: "#E8DEC9",
  borderHover: "#C9A24A",
  ink: "#2C2620",
  gold: "#C9A24A",
  goldDark: "#8A6A1E",
  goldLabel: "#A8801F",
  muted: "#7A746B",
};

export function BrandCard({ brand, locale = "fr" }: { brand: BrandCardData; locale?: string }) {
  const [hover, setHover] = useState(false);
  const isRTL = locale === "ar";
  const cover = !!brand.cover && !!brand.logo;
  const Wrapper: typeof Link | "div" = brand.href ? Link : "div";
  const wrapperProps = brand.href ? { href: brand.href } : {};

  // Monogramme fallback (initiales) si pas de logo
  const initials = brand.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Wrapper
      {...(wrapperProps as { href: string })}
      dir={isRTL ? "rtl" : "ltr"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      aria-label={brand.name}
      style={{
        position: "relative",
        display: "block",
        textDecoration: "none",
        aspectRatio: "16 / 11",
        borderRadius: 18,
        overflow: "hidden",
        background: cover
          ? hover
            ? brand.coverBgHover ?? "#C26544"
            : brand.coverBg ?? "#FCFBF9"
          : hover
            ? T.creamDeep
            : T.cream,
        border: `1px solid ${hover ? T.borderHover : T.border}`,
        boxShadow: hover ? "0 14px 30px -16px rgba(138,106,30,.45)" : "0 2px 8px -4px rgba(44,38,32,.12)",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        transition: "transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s, background .35s, border-color .35s",
      }}
    >
      {/* Sheen doré diagonal au survol */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(115deg, transparent 30%, rgba(201,162,74,.18) 50%, transparent 70%)",
          transform: hover ? "translateX(0)" : "translateX(-120%)",
          transition: "transform .7s cubic-bezier(.2,.8,.2,1)",
          pointerEvents: "none",
        }}
      />

      {/* Coins ornement (filets dorés) */}
      <span aria-hidden style={cornerStyle(isRTL, hover, "tl")} />
      <span aria-hidden style={cornerStyle(isRTL, hover, "br")} />

      {/* ── Face A : repos ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: cover ? 0 : 16,
          opacity: hover ? 0 : 1,
          transform: hover ? "scale(.94)" : "scale(1)",
          transition: "opacity .3s, transform .4s",
        }}
      >
        {cover ? (
          <Image src={brand.logo!} alt={brand.name} fill sizes="280px" style={{ objectFit: "cover" }} />
        ) : brand.logo ? (
          <Image src={brand.logo} alt={brand.name} width={140} height={56} style={{ objectFit: "contain", maxHeight: "46%", width: "auto" }} />
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem, 2.4vw, 2rem)", color: T.ink, lineHeight: 1.05 }}>
              {brand.name}
            </div>
            <div style={{ width: 34, height: 1, background: T.gold, margin: "8px auto 0", opacity: 0.7 }} />
          </div>
        )}
      </div>

      {/* ── Face B : survol (doré + méta) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: 16,
          textAlign: "center",
          opacity: hover ? 1 : 0,
          transform: hover ? "scale(1)" : "scale(1.06)",
          transition: "opacity .35s .05s, transform .45s",
          pointerEvents: "none",
        }}
      >
        {cover ? (
          <>
            {/* Mockup couleur-inversée plein cadre */}
            <Image src={brand.logoHover ?? brand.logo!} alt={brand.name} fill sizes="280px" style={{ objectFit: "cover" }} />
            {/* Scrim + méta bas */}
            <div
              style={{
                position: "absolute",
                insetInline: 0,
                bottom: 0,
                padding: "26px 14px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                background: "linear-gradient(to top, rgba(20,12,8,.72), transparent)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-sans)", fontSize: 11, color: "rgba(255,255,255,.85)" }}>
                {brand.origin && <span>{brand.origin}</span>}
                {brand.origin && brand.founded && <span style={{ opacity: 0.7 }}>·</span>}
                {brand.founded && <span>{brand.founded}</span>}
              </div>
              {brand.count && (
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    color: "#fff",
                    background: "rgba(255,255,255,.16)",
                    border: "1px solid rgba(255,255,255,.3)",
                    borderRadius: 999,
                    padding: "3px 11px",
                  }}
                >
                  {brand.count} parfums
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            {brand.logoHover ? (
              <Image src={brand.logoHover} alt={brand.name} width={140} height={56} style={{ objectFit: "contain", maxHeight: "40%", width: "auto" }} />
            ) : (
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.3rem, 2.2vw, 1.85rem)",
                  color: T.goldDark,
                  letterSpacing: ".01em",
                }}
              >
                {brand.name}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-sans)", fontSize: 11, color: T.muted }}>
              {brand.origin && <span>{brand.origin}</span>}
              {brand.origin && brand.founded && <span style={{ color: T.gold }}>·</span>}
              {brand.founded && <span>{brand.founded}</span>}
            </div>
            {brand.count && (
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: T.goldLabel,
                  background: "rgba(201,162,74,.12)",
                  border: `1px solid rgba(201,162,74,.35)`,
                  borderRadius: 999,
                  padding: "3px 11px",
                  marginTop: 2,
                }}
              >
                {brand.count} parfums
              </span>
            )}
            {/* Monogramme filigrane */}
            {!brand.logoHover && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  insetInlineEnd: 12,
                  bottom: 8,
                  fontFamily: "var(--font-display)",
                  fontSize: 13,
                  letterSpacing: ".15em",
                  color: T.gold,
                  opacity: 0.5,
                }}
              >
                {initials}
              </span>
            )}
          </>
        )}
      </div>
    </Wrapper>
  );
}

function cornerStyle(isRTL: boolean, hover: boolean, pos: "tl" | "br"): React.CSSProperties {
  const size = 16;
  const common: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    borderColor: T.gold,
    opacity: hover ? 0.9 : 0.35,
    transition: "opacity .35s",
    pointerEvents: "none",
  };
  if (pos === "tl") {
    return {
      ...common,
      top: 10,
      insetInlineStart: 10,
      borderTop: `1.5px solid ${T.gold}`,
      [isRTL ? "borderRight" : "borderLeft"]: `1.5px solid ${T.gold}`,
    };
  }
  return {
    ...common,
    bottom: 10,
    insetInlineEnd: 10,
    borderBottom: `1.5px solid ${T.gold}`,
    [isRTL ? "borderLeft" : "borderRight"]: `1.5px solid ${T.gold}`,
  };
}
