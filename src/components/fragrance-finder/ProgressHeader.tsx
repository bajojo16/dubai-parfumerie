"use client";

/**
 * ProgressHeader — compteur « Question {i+1}/{n} » + barre de progression (i+1)/n.
 * Numérotation et barre TOUJOURS calculées (jamais en dur).
 * Inclut le bouton Retour discret (désactivé sur Q1) et la fermeture.
 */
import { FlaconIcon } from "./FlaconIcon";
import { FF } from "./tokens";
import type { FinderLabels } from "./types";

export function ProgressHeader({
  index,
  total,
  reduced,
  labels,
  onBack,
  onClose,
}: {
  index: number; // 0-based
  total: number;
  reduced: boolean;
  labels: FinderLabels;
  onBack: () => void;
  onClose: () => void;
}) {
  const current = index + 1;
  const pct = (current / total) * 100;
  const counter = labels.questionCounter
    .replace("{current}", String(current))
    .replace("{total}", String(total));
  const atStart = index === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {/* Retour discret */}
        <button
          type="button"
          onClick={onBack}
          disabled={atStart}
          aria-label={labels.back}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: "none",
            padding: "6px 4px",
            color: FF.muted,
            fontFamily: FF.sans,
            fontSize: "0.82rem",
            cursor: atStart ? "default" : "pointer",
            opacity: atStart ? 0 : 1,
            pointerEvents: atStart ? "none" : "auto",
            transition: "opacity .2s",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: "scaleX(var(--ff-dir, 1))" }}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {labels.back}
        </button>

        {/* Compteur central */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: FF.sans,
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: FF.goldDeep,
          }}
        >
          <FlaconIcon size={16} color={FF.goldDeep} />
          {counter}
        </span>

        {/* Fermer */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: FF.cream2,
            border: `1px solid ${FF.border}`,
            color: FF.ink2,
            cursor: "pointer",
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Barre de progression */}
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        style={{
          height: 4,
          borderRadius: 999,
          background: FF.cream2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${FF.goldDeep}, ${FF.goldLight})`,
            transition: reduced ? "none" : "width .45s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>
    </div>
  );
}
