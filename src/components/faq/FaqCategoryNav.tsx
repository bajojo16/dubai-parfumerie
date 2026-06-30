"use client";

import { useState } from "react";
import { T, type FaqCategory, type FaqCategoryId } from "./faq.data";

/**
 * Rail de catégories. Vertical (desktop, sticky) ou en pills horizontales
 * scrollables (<lg) — l'orientation est pilotée par CSS dans Faq.tsx.
 * Active = bordure logique (borderInlineStart 2px or) + texte doré, pas de
 * pastille foncée. Survol : fond or translucide.
 */
export function FaqCategoryNav({
  categories,
  active,
  onSelect,
  counts,
}: {
  categories: FaqCategory[];
  active: FaqCategoryId;
  onSelect: (id: FaqCategoryId) => void;
  counts: Record<FaqCategoryId, number>;
}) {
  const [hovered, setHovered] = useState<FaqCategoryId | null>(null);

  return (
    <nav aria-label="Catégories d'aide" className="dp-faq-cats">
      {categories.map((cat) => {
        const isActive = cat.id === active;
        const isHover = hovered === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            aria-current={isActive ? "true" : undefined}
            onMouseEnter={() => setHovered(cat.id)}
            onMouseLeave={() => setHovered(null)}
            className="dp-faq-cat"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
              border: "none",
              background: isHover && !isActive ? "rgba(168,132,62,.08)" : "transparent",
              borderInlineStart: `2px solid ${isActive ? T.gold : "transparent"}`,
              paddingBlock: 9,
              paddingInline: 14,
              borderRadius: "0 10px 10px 0",
              cursor: "pointer",
              textAlign: "start",
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? T.goldDeep : isHover ? T.inkWarm : T.ink2,
              letterSpacing: "0.01em",
              transition: "color 180ms ease, background 180ms ease, border-color 180ms ease",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ flex: 1 }}>{cat.label}</span>
            <span
              aria-hidden
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: isActive ? T.gold : T.ink3,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {counts[cat.id]}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
