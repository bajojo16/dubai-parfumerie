"use client";

import Link from "next/link";
import { useState } from "react";
import { T } from "../faq.data";

/**
 * Bouton arrondi → href (next/link).
 * variant "dark" : fond encre, texte crème.
 * variant "line" : contour or, texte or (fond translucide au survol).
 */
export function CtaLink({
  href,
  label,
  variant = "dark",
}: {
  href: string;
  label: string;
  variant?: "dark" | "line";
}) {
  const [hover, setHover] = useState(false);
  const isDark = variant === "dark";

  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    padding: "11px 22px",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.02em",
    textDecoration: "none",
    cursor: "pointer",
    transition: "background 200ms ease, color 200ms ease, transform 200ms ease, box-shadow 200ms ease",
    transform: hover ? "translateY(-1px)" : "translateY(0)",
  };

  const skin: React.CSSProperties = isDark
    ? {
        background: hover ? T.ink : T.inkWarm,
        color: T.cream3,
        border: `1px solid ${T.inkWarm}`,
        boxShadow: hover ? "0 10px 26px rgba(26,23,18,.22)" : "0 4px 14px rgba(26,23,18,.12)",
      }
    : {
        background: hover ? "rgba(168,132,62,.10)" : "transparent",
        color: T.goldDeep,
        border: `1px solid ${T.goldSoft}`,
        boxShadow: "none",
      };

  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...skin }}
    >
      <span>{label}</span>
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        style={{
          flexShrink: 0,
          transform: hover ? "translateX(2px)" : "translateX(0)",
          transition: "transform 200ms ease",
        }}
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Link>
  );
}
