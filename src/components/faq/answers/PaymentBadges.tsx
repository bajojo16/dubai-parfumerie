"use client";

import { T } from "../faq.data";

type Badge = { label: string; glyph: React.ReactNode };

/* Petits glyphes line-art (pas de logos de marque — évite tout souci de droits). */
function CardGlyph() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden>
      <rect x="0.6" y="0.6" width="20.8" height="14.8" rx="2.4" stroke={T.gold} strokeWidth="1.1" />
      <rect x="0.6" y="3.6" width="20.8" height="2.6" fill={T.goldSoft} />
    </svg>
  );
}
function WalletGlyph() {
  return (
    <svg width="20" height="18" viewBox="0 0 20 18" fill="none" aria-hidden stroke={T.gold} strokeWidth="1.1">
      <rect x="0.6" y="2.6" width="18.8" height="12.8" rx="2.4" />
      <path d="M13 9h4" />
      <circle cx="14.5" cy="9" r="0.9" fill={T.gold} stroke="none" />
    </svg>
  );
}
function PaypalGlyph() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="none" aria-hidden>
      <path
        d="M3 16 L5 2 H10.5 C13 2 14.2 3.6 13.6 5.8 C13 8 11.2 9 8.8 9 H6.6 L6 16 Z"
        stroke={T.gold}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const BADGES: Badge[] = [
  { label: "Visa", glyph: <CardGlyph /> },
  { label: "Mastercard", glyph: <CardGlyph /> },
  { label: "Apple Pay", glyph: <WalletGlyph /> },
  { label: "Google Pay", glyph: <WalletGlyph /> },
  { label: "PayPal", glyph: <PaypalGlyph /> },
];

export function PaymentBadges() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {BADGES.map((b) => (
        <span
          key={b.label}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: T.card,
            border: `1px solid ${T.line2}`,
            borderRadius: 10,
            padding: "7px 12px",
            fontFamily: "var(--font-sans)",
            fontSize: 12.5,
            fontWeight: 600,
            color: T.inkWarm,
          }}
        >
          <span style={{ display: "inline-flex", lineHeight: 0 }} aria-hidden>
            {b.glyph}
          </span>
          {b.label}
        </span>
      ))}
    </div>
  );
}
