"use client";

import { T } from "../faq.data";

type Badge = { label: string; logo: React.ReactNode };

/* ── Logos de marque (SVG inline, reproductions fidèles). ──
   Tous décoratifs (aria-hidden) : le nom est porté par l'aria-label du chip. */

function VisaLogo() {
  return (
    <svg width="50" height="17" viewBox="0 0 48 16" fill="none" aria-hidden>
      <path
        d="M20.4 15.3h-3.9L18.9.8h3.9l-2.4 14.5zM13.2.8 9.5 10.8l-.4-2.2L7.7 1.6S7.5.8 6.4.8H.3L.2 1c1.5.4 3 1 4.2 1.7l3.3 12.6h4.1L18 .8h-4.8zM44.6 15.3h3.6L45.1.8h-3.1c-1.5 0-1.8 1.1-1.8 1.1l-5.6 13.4h4.1l.8-2.2h5l.1 2.2zm-4.3-5.3 2.1-5.6 1.2 5.6h-3.3zM35.1 4.4l.6-3.2S33.9.5 32 .5c-2 0-6.9.9-6.9 5.2 0 4 5.6 4.1 5.6 6.2s-5 1.7-6.7.4l-.6 3.3s1.7.9 4.4.9c2.7 0 6.7-1.4 6.7-5.3 0-4-5.6-4.4-5.6-6.2 0-1.8 3.9-1.6 5.2-.6z"
        fill="#1A1F71"
      />
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg width="33" height="20" viewBox="0 0 32 20" fill="none" aria-hidden>
      <circle cx="12" cy="10" r="9" fill="#EB001B" />
      <circle cx="20" cy="10" r="9" fill="#F79E1B" />
      <path d="M16 3.1a8.98 8.98 0 0 0 0 13.8 8.98 8.98 0 0 0 0-13.8z" fill="#FF5F00" />
    </svg>
  );
}

function ApplePayLogo() {
  return (
    <svg width="50" height="20" viewBox="0 0 48 20" fill="none" aria-hidden>
      <g fill="#000">
        {/* Pomme */}
        <path d="M6.9 5.2c.4-.5.7-1.2.6-1.9-.6 0-1.3.4-1.7.9-.4.4-.7 1.1-.6 1.8.7 0 1.3-.4 1.7-.8zm.6 1c-.9-.1-1.7.5-2.1.5-.4 0-1.1-.5-1.8-.5-.9 0-1.8.5-2.2 1.4-1 1.7-.3 4.2.7 5.6.5.7 1 1.4 1.8 1.4.7 0 1-.5 1.9-.5.8 0 1.1.5 1.8.4.8 0 1.2-.7 1.7-1.3.5-.8.8-1.5.8-1.6 0 0-1.5-.6-1.5-2.3 0-1.4 1.2-2.1 1.2-2.1-.6-1-1.7-1.1-2-1.1z" />
        {/* "Pay" */}
        <path d="M17.5 5.5c1.9 0 3.2 1.3 3.2 3.2s-1.3 3.2-3.3 3.2h-2.1v3.3h-1.6V5.5h3.8zm-2.2 5.1h1.7c1.3 0 2.1-.7 2.1-1.9s-.8-1.9-2.1-1.9h-1.7v3.8zM21.1 13c0-1.2.9-1.9 2.6-2l1.9-.1v-.5c0-.8-.5-1.2-1.4-1.2-.8 0-1.3.4-1.4 1h-1.5c.1-1.3 1.2-2.2 3-2.2 1.8 0 2.9.9 2.9 2.4v5h-1.5v-1.2h0c-.4.8-1.3 1.3-2.3 1.3-1.4 0-2.4-.9-2.4-2.2zm4.5-.6v-.5l-1.7.1c-.9.1-1.4.4-1.4 1.1 0 .6.5 1 1.3 1 1 0 1.8-.7 1.8-1.6zM28 17.6v-1.2c.1 0 .4 0 .5 0 .7 0 1-.3 1.3-1l.2-.5-2.7-7.4h1.7l1.9 6h0l1.9-6h1.6L31.8 16c-.6 1.7-1.3 2.3-2.8 2.3-.1 0-.5 0-1-.1z" />
      </g>
    </svg>
  );
}

function GooglePayLogo() {
  return (
    <svg width="50" height="20" viewBox="0 0 50 20" fill="none" aria-hidden>
      {/* "G" multicolore */}
      <path d="M9.6 10.2c0-.4 0-.8-.1-1.1H5v2.1h2.6c-.1.6-.5 1.2-1 1.5v1.3h1.6c1-.9 1.4-2.2 1.4-3.8z" fill="#4285F4" />
      <path d="M5 15c1.4 0 2.5-.4 3.3-1.2l-1.6-1.3c-.4.3-1 .5-1.7.5-1.3 0-2.4-.9-2.8-2.1H.5v1.3C1.3 13.9 3 15 5 15z" fill="#34A853" />
      <path d="M2.2 10.9c-.1-.3-.2-.6-.2-1s.1-.7.2-1V7.6H.5C.2 8.3 0 9.1 0 9.9s.2 1.6.5 2.3l1.7-1.3z" fill="#FBBC04" />
      <path d="M5 6.8c.7 0 1.4.3 1.9.7l1.4-1.4C7.5 5.3 6.4 4.9 5 4.9c-2 0-3.7 1.1-4.5 2.7l1.7 1.3C2.6 7.7 3.7 6.8 5 6.8z" fill="#EA4335" />
      {/* "Pay" */}
      <g fill="#5F6368">
        <path d="M18.9 10.4v3.9h-1.2V4.7h3.3c.8 0 1.5.3 2.1.8.6.6.9 1.2.9 2s-.3 1.5-.9 2c-.6.6-1.3.8-2.1.8h-2.1zm0-4.5v3.4h2.1c.5 0 .9-.2 1.2-.5.6-.6.7-1.6.1-2.3l-.1-.1c-.3-.3-.7-.5-1.2-.5h-2.1z" />
        <path d="M26.7 7.4c.9 0 1.6.2 2.1.7.5.5.8 1.1.8 1.9v3.9h-1.1v-.9h-.1c-.5.7-1.1 1.1-1.9 1.1-.7 0-1.3-.2-1.7-.6-.5-.4-.7-.9-.7-1.5 0-.6.2-1.1.7-1.5.5-.4 1.1-.6 1.9-.6.7 0 1.2.1 1.7.4v-.3c0-.4-.2-.8-.5-1-.3-.3-.7-.4-1.1-.4-.6 0-1.1.3-1.5.8l-1-.6c.5-.9 1.3-1.3 2.4-1.3zm-1.5 4.4c0 .3.1.5.4.7.2.2.5.3.8.3.5 0 .9-.2 1.3-.5.4-.4.6-.8.6-1.2-.4-.3-.9-.5-1.5-.5-.5 0-.9.1-1.2.3-.3.2-.4.4-.4.6z" />
        <path d="M36 7.6l-4.1 9.4h-1.2l1.5-3.3-2.7-6.1h1.3l1.9 4.7h0l1.9-4.7H36z" />
      </g>
    </svg>
  );
}

function PaypalLogo() {
  return (
    <svg width="58" height="18" viewBox="0 0 70 20" fill="none" aria-hidden>
      <text
        x="0"
        y="15.5"
        fontFamily="var(--font-sans), Arial, Helvetica, sans-serif"
        fontSize="17"
        fontWeight="700"
        fontStyle="italic"
        letterSpacing="-0.5"
      >
        <tspan fill="#003087">Pay</tspan>
        <tspan fill="#009CDE">Pal</tspan>
      </text>
    </svg>
  );
}

const BADGES: Badge[] = [
  { label: "Visa", logo: <VisaLogo /> },
  { label: "Mastercard", logo: <MastercardLogo /> },
  { label: "Apple Pay", logo: <ApplePayLogo /> },
  { label: "Google Pay", logo: <GooglePayLogo /> },
  { label: "PayPal", logo: <PaypalLogo /> },
];

export function PaymentBadges() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {BADGES.map((b) => (
        <span
          key={b.label}
          role="img"
          aria-label={b.label}
          title={b.label}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 72,
            height: 46,
            background: "#fff",
            border: `1px solid ${T.line2}`,
            borderRadius: 12,
            paddingInline: 14,
            boxShadow: "0 1px 2px rgba(26,23,18,.04)",
          }}
        >
          <span style={{ display: "inline-flex", lineHeight: 0 }} aria-hidden>
            {b.logo}
          </span>
        </span>
      ))}
    </div>
  );
}
