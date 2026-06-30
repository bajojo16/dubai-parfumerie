import type { ReactNode } from "react";

/* ──────────────────────────────────────────────────────────────────────────
   SVG illustrations pour CategoryRail.
   - Icônes « default » : trait or sur disque crème (viewBox 64×64).
   - LaurelStar : disque bestseller (encre) → étoile + lauriers or clair.
   - PromoContent : texte crème sur disque or (offre duo).
   Aucune dépendance, pas de `any`, couleurs surchargables.
   ────────────────────────────────────────────────────────────────────────── */

type IconProps = {
  /** Couleur principale du trait (défaut : or foncé). */
  color?: string;
  /** Taille du carré (px). */
  size?: number;
};

const baseSvg = (size: number): React.CSSProperties => ({
  width: size,
  height: size,
  display: "block",
});

/* Diffuseur + bâtonnets — « parfum-interieur ». */
export function DiffuserIcon({ color = "#A8801F", size = 60 }: IconProps): ReactNode {
  return (
    <svg viewBox="0 0 64 64" aria-hidden style={baseSvg(size)}>
      <g
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* flacon */}
        <path d="M26 38v-4a6 6 0 0 1 12 0v4" />
        <path d="M24 38h16a3 3 0 0 1 3 3v9a4 4 0 0 1-4 4H25a4 4 0 0 1-4-4v-9a3 3 0 0 1 3-3Z" />
        <path d="M30 30h4" />
        {/* bâtonnets */}
        <path d="M30 30 22 10M34 30l3-20M33 31l9-17" />
      </g>
      <g fill={color}>
        <circle cx="22" cy="9" r="1.6" />
        <circle cx="37" cy="9" r="1.6" />
        <circle cx="42.5" cy="13" r="1.6" />
      </g>
    </svg>
  );
}

/* Mini-flacon de voyage — « parfum-voyage ». */
export function TravelBottleIcon({ color = "#A8801F", size = 58 }: IconProps): ReactNode {
  return (
    <svg viewBox="0 0 64 64" aria-hidden style={baseSvg(size)}>
      <g
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="26" y="14" width="12" height="6" rx="1.4" />
        <path d="M29 20h6" />
        <path d="M27 24h10a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H27a4 4 0 0 1-4-4V28a4 4 0 0 1 4-4Z" />
        <path d="M23 33h18" />
      </g>
    </svg>
  );
}

/* Flacon 50 ML — « format-50ml ». */
export function Bottle50mlIcon({ color = "#A8801F", size = 60 }: IconProps): ReactNode {
  return (
    <svg viewBox="0 0 64 64" aria-hidden style={baseSvg(size)}>
      <g
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="27" y="10" width="10" height="7" rx="1.4" />
        <path d="M30 17h4" />
        <path d="M24 22h16a3 3 0 0 1 3 3v23a4 4 0 0 1-4 4H25a4 4 0 0 1-4-4V25a3 3 0 0 1 3-3Z" />
      </g>
      <text
        x="32"
        y="42"
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize="9"
        fontWeight={600}
        letterSpacing="0.5"
        fill={color}
      >
        50 ML
      </text>
    </svg>
  );
}

/* Flacon attar (huile) — « huile-parfum ». */
export function AttarBottleIcon({ color = "#A8801F", size = 58 }: IconProps): ReactNode {
  return (
    <svg viewBox="0 0 64 64" aria-hidden style={baseSvg(size)}>
      <g
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* bouchon allongé orné */}
        <path d="M32 8c-2 4-2 7 0 10 2-3 2-6 0-10Z" />
        <path d="M30 18h4" />
        <path d="M32 21v3" />
        {/* corps bombé */}
        <path d="M32 24c8 0 13 6 13 14s-6 14-13 14-13-6-13-14 5-14 13-14Z" />
        <path d="M24 40c4 2.5 12 2.5 16 0" opacity={0.7} />
      </g>
    </svg>
  );
}

/* Flacon vaporisateur — « eau-parfum ». */
export function SprayBottleIcon({ color = "#A8801F", size = 60 }: IconProps): ReactNode {
  return (
    <svg viewBox="0 0 64 64" aria-hidden style={baseSvg(size)}>
      <g
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* tête de spray */}
        <path d="M28 12h7v5h-7z" />
        <path d="M35 14h5" />
        <path d="M30 17v3" />
        {/* col + corps */}
        <path d="M26 24h12a3 3 0 0 1 3 3v21a4 4 0 0 1-4 4H27a4 4 0 0 1-4-4V27a3 3 0 0 1 3-3Z" />
      </g>
      {/* brume */}
      <g fill={color}>
        <circle cx="44" cy="11" r="1.1" />
        <circle cx="47" cy="14" r="1.1" />
        <circle cx="44" cy="17" r="1.1" />
      </g>
    </svg>
  );
}

/* Étoile + lauriers — disque « bestsellers » (sur fond encre). */
export function LaurelStarIcon({ color = "#E4CE94", size = 64 }: IconProps): ReactNode {
  return (
    <svg viewBox="0 0 64 64" aria-hidden style={baseSvg(size)}>
      {/* étoile pleine */}
      <path
        d="M32 18.5l3.1 6.6 7.2.9-5.3 4.9 1.4 7.1L32 40.6l-6.4 3.4 1.4-7.1-5.3-4.9 7.2-.9 3.1-6.6Z"
        fill={color}
      />
      {/* lauriers */}
      <g fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
        <path d="M22 47c-5-3-7-9-6-15" />
        <path d="M42 47c5-3 7-9 6-15" />
        <path d="M17 35c2 .4 3.6 0 5-1.4M17.5 30c2 .4 3.6 0 5-1.4M19 25.5c1.8.6 3.4.4 5-.6" />
        <path d="M47 35c-2 .4-3.6 0-5-1.4M46.5 30c-2 .4-3.6 0-5-1.4M45 25.5c-1.8.6-3.4.4-5-.6" />
      </g>
    </svg>
  );
}

/* Contenu texte du disque « offre-duo » (promo) — texte crème sur or. */
export function PromoContent({
  big = "−50%",
  small = "2ᵉ PARFUM",
  cream = "#FAF6EE",
}: {
  big?: string;
  small?: string;
  cream?: string;
}): ReactNode {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        textAlign: "center",
        lineHeight: 1,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 38,
          fontWeight: 600,
          color: cream,
          textShadow: "0 1px 2px rgba(21,17,13,.28)",
        }}
      >
        {big}
      </span>
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: cream,
          opacity: 0.92,
        }}
      >
        {small}
      </span>
    </div>
  );
}
