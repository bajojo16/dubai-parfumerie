"use client";

import {
  formatPrice,
  largestBottle,
  SPRAYS_PER_ML,
  usageDuration,
  type ProductVariant,
} from "@/lib/product-variants";

interface VolumeSelectorProps {
  /**
   * Formats proposés, DÉJÀ résolus par le parent (`resolveVariants`) :
   * [échantillon si la fiche en a un] puis les flacons par contenance
   * croissante. Sans `variants` sur la fiche, une seule carte : le sélecteur
   * n'invente jamais de contenance — l'ancienne version affichait 30/50/100 ml
   * en dur sur toutes les fiches, au même prix.
   */
  variants: ProductVariant[];
  value: ProductVariant;
  onChange: (variant: ProductVariant) => void;
  /** Prix barré du flacon de référence : affiché sur la plus grande contenance. */
  oldPrice?: number;
  /** Identifiant unique quand deux sélecteurs cohabitent (colonne + tiroir). */
  idPrefix?: string;
}

/**
 * Cartes VERTICALES empilées, une par format — l'échantillon en tête.
 *
 * Chaque carte porte trois informations : ce qu'on achète (libellé + sous-
 * ligne), ce que ça coûte (prix + prix au ml ou remise) et ce que ça dure
 * (pulvérisations, mois). Une rangée de petits boutons « 30 / 50 / 100 » ne
 * pouvait dire que la contenance.
 */
export default function VolumeSelector({
  variants,
  value,
  onChange,
  oldPrice,
  idPrefix = "dp-vol",
}: VolumeSelectorProps) {
  const bottles = variants.filter((v) => v.kind === "bottle");
  const largest = largestBottle(variants);
  // « Le plus choisi » n'a de sens que s'il y a un choix entre flacons.
  const showTopPill = bottles.length >= 2;

  return (
    <div className={`${idPrefix}-wrap`}>
      <style>{`
        .${idPrefix}-wrap { width: 100%; max-width: 392px; }
        .${idPrefix}-list { display: flex; flex-direction: column; gap: 0.625rem; }
        @media (max-width: 760px) { .${idPrefix}-wrap { max-width: none; } }
      `}</style>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--t-sm)",
          fontWeight: "var(--fw-medium)",
          color: "var(--ink-700)",
          letterSpacing: "var(--ls-wide)",
          textTransform: "uppercase",
          margin: "0 0 0.625rem",
        }}
      >
        Contenance
      </p>
      <div className={`${idPrefix}-list`} role="radiogroup" aria-label="Contenance">
        {variants.map((v) => {
          const isActive = v.volumeMl === value.volumeMl && v.kind === value.kind;
          const isSample = v.kind === "sample";
          const isLargest = !isSample && v.volumeMl === largest.volumeMl;
          const perMl = `${formatPrice(v.price / v.volumeMl)} € / ml`;

          // Sous-ligne gauche : l'argument de CE format.
          let sub: string;
          if (isSample) {
            sub = v.refundable
              ? `Remboursé sur votre ${largest.label} · fiole en verre, vaporisateur`
              : "Fiole en verre, vaporisateur";
          } else if (isLargest) {
            sub = `Le meilleur prix au ml · ${perMl}`;
          } else {
            sub = `Flacon de voyage · ${perMl}`;
          }

          // Seconde ligne droite : durée ou remise.
          const hasDiscount = isLargest && oldPrice !== undefined && oldPrice > v.price;
          const pct = hasDiscount ? Math.round(((oldPrice - v.price) / oldPrice) * 100) : 0;

          const pill = isSample
            ? v.refundable
              ? "Le plus sûr"
              : null
            : isLargest && showTopPill
              ? "Le plus choisi"
              : null;

          return (
            <button
              key={`${v.kind}-${v.volumeMl}`}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(v)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                width: "100%",
                padding: "0.85rem 0.9rem",
                textAlign: "left",
                borderRadius: "var(--r-md)",
                border: isActive ? "1.5px solid var(--gold-500)" : "1.5px solid var(--line-200)",
                background: isActive ? "var(--gold-100)" : "var(--surface-white)",
                boxShadow: isActive ? "0 0 0 3px rgba(200,144,30,.12)" : "none",
                color: "var(--ink-900)",
                fontFamily: "var(--font-sans)",
                cursor: "pointer",
                transition:
                  "border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
              }}
            >
              {pill && (
                <span
                  style={{
                    position: "absolute",
                    top: -9,
                    left: 12,
                    padding: "0.1rem 0.5rem",
                    borderRadius: "var(--r-pill)",
                    background: "var(--gold-100)",
                    color: "var(--gold-900)",
                    border: "1px solid var(--gold-300)",
                    fontSize: "var(--t-xs)",
                    fontWeight: "var(--fw-semibold)",
                    letterSpacing: "var(--ls-wide)",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    lineHeight: 1.4,
                  }}
                >
                  {pill}
                </span>
              )}

              {/* Radio rond */}
              <span
                aria-hidden="true"
                style={{
                  width: 18,
                  height: 18,
                  flexShrink: 0,
                  borderRadius: "50%",
                  border: isActive ? "1.5px solid var(--gold-500)" : "1.5px solid var(--line-300)",
                  background: "var(--surface-white)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "border-color var(--dur-fast)",
                }}
              >
                {isActive && (
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--gold-500)" }} />
                )}
              </span>

              {/* Libellé + sous-ligne */}
              <span style={{ display: "flex", flexDirection: "column", gap: "0.15rem", minWidth: 0, flex: "1 1 auto" }}>
                <span style={{ fontSize: "var(--t-body)", fontWeight: "var(--fw-semibold)", color: "var(--ink-900)" }}>
                  {v.label}
                </span>
                <span style={{ fontSize: "var(--t-xs)", color: "var(--ink-500)", lineHeight: 1.35 }}>{sub}</span>
              </span>

              {/* Prix + seconde ligne */}
              <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.1rem", flexShrink: 0 }}>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: "var(--gold-700)",
                    lineHeight: 1.1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatPrice(v.price)} €
                </span>
                <span style={{ fontSize: "var(--t-xs)", color: "var(--ink-400)", whiteSpace: "nowrap" }}>
                  {isSample ? (
                    `≈ ${v.volumeMl * SPRAYS_PER_ML} pulvérisations`
                  ) : hasDiscount ? (
                    <>
                      <span style={{ textDecoration: "line-through" }}>{formatPrice(oldPrice)} €</span> · −{pct} %
                    </>
                  ) : (
                    usageDuration(v.volumeMl)
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
