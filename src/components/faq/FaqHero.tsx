"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { T, type FaqCategory, type FaqCategoryId } from "./faq.data";

/* ── Illustrations line-art dorées (fallback quand aucune image fournie) ── */
function HeroIcon({ id }: { id: FaqCategoryId }) {
  const common = {
    width: 96,
    height: 96,
    viewBox: "0 0 96 96",
    fill: "none" as const,
    stroke: T.gold,
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (id) {
    case "cmd": // sac shopping
      return (
        <svg {...common}>
          <path d="M28 34h40l-3 38a4 4 0 0 1-4 3.6H35a4 4 0 0 1-4-3.6z" />
          <path d="M38 34v-6a10 10 0 0 1 20 0v6" />
          <path d="M40 46c0 5 16 5 16 0" />
        </svg>
      );
    case "pay": // carte
      return (
        <svg {...common}>
          <rect x="20" y="30" width="56" height="36" rx="4" />
          <path d="M20 41h56" />
          <path d="M28 56h12" />
        </svg>
      );
    case "liv": // avion
      return (
        <svg {...common}>
          <path d="M22 52l52-22-14 44-10-16z" />
          <path d="M50 58l-4 12" />
          <path d="M60 30 46 54" />
        </svg>
      );
    case "ret": // flèche retour
      return (
        <svg {...common}>
          <path d="M34 40h24a14 14 0 0 1 0 28H40" />
          <path d="M42 30 32 40l10 10" />
        </svg>
      );
    case "pro": // cartons empilés
      return (
        <svg {...common}>
          <path d="M24 42l24-10 24 10-24 10z" />
          <path d="M24 42v18l24 10 24-10V42" />
          <path d="M48 52v28" />
          <path d="M24 51l24 10 24-10" />
        </svg>
      );
    case "all": // flacon de parfum
    default:
      return (
        <svg {...common}>
          <rect x="36" y="38" width="24" height="34" rx="6" />
          <path d="M42 38v-8h12v8" />
          <path d="M44 24h8" />
          <path d="M42 54h12" />
        </svg>
      );
  }
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Bandeau atmosphérique compact qui change selon la catégorie active
 * (crossfade fondu sortie → entrée). Eyebrow + phrase serif à gauche,
 * visuel à droite (next/image si image fournie, sinon line-art doré).
 */
export function FaqHero({ category }: { category: FaqCategory }) {
  const reduce = useRef(false);
  const [display, setDisplay] = useState<FaqCategory>(category);
  const [visible, setVisible] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    reduce.current = prefersReducedMotion();
  }, []);

  useEffect(() => {
    if (category.id === display.id) return;
    setImgError(false);
    if (reduce.current) {
      setDisplay(category);
      return;
    }
    setVisible(false);
    const t = window.setTimeout(() => {
      setDisplay(category);
      setVisible(true);
    }, 220);
    return () => window.clearTimeout(t);
  }, [category, display.id]);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${T.cream3}, ${T.cream})`,
        border: `1px solid ${T.line}`,
        borderRadius: 20,
        padding: "28px 28px",
        marginBottom: 28,
      }}
    >
      {/* Filet décoratif d'angle */}
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        aria-hidden
        style={{
          position: "absolute",
          top: -30,
          insetInlineEnd: -30,
          opacity: 0.18,
          pointerEvents: "none",
          transform: "scaleX(var(--dp-faq-flip, 1))",
        }}
      >
        <g fill="none" stroke={T.goldBright} strokeWidth="1">
          <circle cx="120" cy="40" r="46" />
          <circle cx="120" cy="40" r="30" />
          <path d="M120 -6v92M74 40h92" />
        </g>
      </svg>

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 20,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(6px)",
          transition: reduce.current ? "none" : "opacity .22s ease, transform .22s ease",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: T.gold,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            {display.eyebrow}
          </div>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(22px, 3.4vw, 30px)",
              lineHeight: 1.18,
              color: T.inkWarm,
              fontWeight: 500,
              margin: 0,
              maxWidth: 460,
            }}
          >
            {display.atmosphere}
          </p>
        </div>

        <div
          style={{
            flexShrink: 0,
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: T.card,
            border: `1px solid ${T.line2}`,
            display: "grid",
            placeItems: "center",
            boxShadow: "0 8px 24px rgba(120,90,40,.08)",
          }}
        >
          {display.image && !imgError ? (
            <Image
              src={display.image}
              alt=""
              width={96}
              height={96}
              onError={() => setImgError(true)}
              style={{ width: 80, height: 80, objectFit: "contain" }}
            />
          ) : (
            <HeroIcon id={display.id} />
          )}
        </div>
      </div>
    </div>
  );
}
