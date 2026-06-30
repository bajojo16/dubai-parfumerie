"use client";

import type { CSSProperties } from "react";

/* ── Sélecteur de quantité réutilisable « − valeur + » ──
   Style luxe (or / crème / encre), styles INLINE + variables CSS.
   Accessible, stoppe la propagation pour ne pas déclencher le clic
   de la carte/lien parent. RTL neutre (les signes ne sont pas inversés). */

export type QtyStepperLabels = {
  decrease?: string;
  increase?: string;
};

const DEFAULT_LABELS: Required<QtyStepperLabels> = {
  decrease: "Diminuer la quantité",
  increase: "Augmenter la quantité",
};

/* Jetons couleur (hex exacts spec) */
const C = {
  gold: "#C9A24A",
  goldDeep: "#A8801F",
  ink: "#2C2620",
  cream: "#FBF6EC",
  border: "#E6DCC8",
};

export function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  locale = "fr",
  labels,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  locale?: string;
  labels?: QtyStepperLabels;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const isRTL = locale === "ar";

  const dim = size === "sm" ? 32 : 40;
  const fontBtn = size === "sm" ? 16 : 18;
  const fontVal = size === "sm" ? 13 : 15;
  const valW = size === "sm" ? 30 : 38;

  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  const stop = (e: { stopPropagation: () => void; preventDefault: () => void }) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const dec = (e: React.MouseEvent) => {
    stop(e);
    onChange(clamp(value - 1));
  };
  const inc = (e: React.MouseEvent) => {
    stop(e);
    onChange(clamp(value + 1));
  };

  const atMin = value <= min;
  const atMax = value >= max;

  const groupStyle: CSSProperties = {
    // Variables CSS locales (réutilisables par les boutons enfants)
    ["--qty-gold" as string]: C.gold,
    ["--qty-gold-deep" as string]: C.goldDeep,
    ["--qty-ink" as string]: C.ink,
    ["--qty-cream" as string]: C.cream,
    ["--qty-border" as string]: C.border,
    ["--qty-dim" as string]: `${dim}px`,
    display: "inline-flex",
    alignItems: "center",
    gap: 2,
    background: "var(--qty-cream)",
    border: "1px solid var(--qty-border)",
    borderRadius: 999,
    padding: 2,
    fontFamily: "var(--font-sans)",
    // RTL neutre : ordre logique − valeur + conservé visuellement
    direction: "ltr",
  };

  const btnStyle = (disabled: boolean): CSSProperties => ({
    width: "var(--qty-dim)",
    height: "var(--qty-dim)",
    minWidth: "var(--qty-dim)",
    minHeight: "var(--qty-dim)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: "50%",
    background: disabled ? "transparent" : "#fff",
    boxShadow: disabled ? "none" : "0 1px 3px rgba(120,90,40,.12)",
    color: disabled ? "var(--qty-border)" : "var(--qty-gold-deep)",
    fontSize: fontBtn,
    fontWeight: 600,
    lineHeight: 1,
    cursor: disabled ? "not-allowed" : "pointer",
    padding: 0,
    transition: "background 160ms ease, color 160ms ease",
    userSelect: "none",
  });

  return (
    <span role="group" aria-label={`${L.decrease} / ${L.increase}`} dir={isRTL ? "rtl" : "ltr"} style={groupStyle}>
      <button type="button" onClick={dec} disabled={atMin} aria-label={L.decrease} style={btnStyle(atMin)}>
        −
      </button>
      <span
        aria-live="polite"
        style={{
          minWidth: valW,
          textAlign: "center",
          fontFamily: "var(--font-sans)",
          fontSize: fontVal,
          fontWeight: 600,
          color: "var(--qty-ink)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
      <button type="button" onClick={inc} disabled={atMax} aria-label={L.increase} style={btnStyle(atMax)}>
        +
      </button>
    </span>
  );
}

export default QtyStepper;
