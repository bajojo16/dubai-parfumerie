"use client";

/**
 * Tile — vignette d'option (matière olfactive).
 * Visuel (next/image) si fourni, sinon dégradé radial de repli (mockup styleD).
 * Sélection = halo or + élévation. prefers-reduced-motion respecté.
 */
import Image from "next/image";
import { useState } from "react";
import type { QuizOption } from "./types";
import { FF } from "./tokens";

export function Tile({
  option,
  selected,
  reduced,
  onSelect,
}: {
  option: QuizOption;
  selected: boolean;
  reduced: boolean;
  onSelect: (value: string) => void;
}) {
  const [hover, setHover] = useState(false);
  const [imgError, setImgError] = useState(false);
  const showImage = option.image && !imgError;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(option.value)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 0,
        padding: 0,
        background: FF.white,
        border: `1.5px solid ${selected ? FF.gold : FF.border}`,
        borderRadius: 18,
        overflow: "hidden",
        cursor: "pointer",
        textAlign: "start",
        fontFamily: FF.sans,
        transition: reduced
          ? "border-color .2s"
          : "border-color .2s, transform .18s cubic-bezier(.4,0,.2,1), box-shadow .25s",
        transform:
          !reduced && (selected || hover) ? "translateY(-3px)" : "translateY(0)",
        boxShadow: selected
          ? FF.haloShadow
          : hover
            ? "0 8px 22px rgba(21,17,13,0.10)"
            : "0 2px 8px rgba(21,17,13,0.05)",
      }}
    >
      {/* Pastille matière */}
      <span
        aria-hidden
        style={{
          position: "relative",
          height: 84,
          width: "100%",
          background: option.gradient ?? FF.cream2,
          overflow: "hidden",
        }}
      >
        {showImage && (
          <Image
            src={option.image as string}
            alt=""
            fill
            sizes="(max-width: 520px) 45vw, 180px"
            style={{ objectFit: "cover" }}
            onError={() => setImgError(true)}
          />
        )}
        {/* Voile dégradé pour lisibilité */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0) 40%, rgba(21,17,13,0.10))",
          }}
        />
        {selected && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              insetInlineEnd: 8,
              top: 8,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: FF.gold,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(168,128,31,0.4)",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 12 5 5 9-11" />
            </svg>
          </span>
        )}
      </span>

      {/* Libellé */}
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          padding: "12px 14px 14px",
        }}
      >
        <span
          style={{
            fontFamily: FF.display,
            fontSize: "1.15rem",
            fontWeight: 500,
            color: selected ? FF.ink : FF.ink2,
            lineHeight: 1.1,
          }}
        >
          {option.label}
        </span>
        {option.hint && (
          <span style={{ fontSize: "0.78rem", color: FF.muted, lineHeight: 1.3 }}>
            {option.hint}
          </span>
        )}
      </span>
    </button>
  );
}
