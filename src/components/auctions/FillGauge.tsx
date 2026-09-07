"use client";

/**
 * Jauge de niveau d'un flacon d'occasion — la même sur la carte (verticale,
 * discrète, posée sur la photo) et dans le panneau (à côté de la photo du
 * niveau). Un seul composant pour que « 75 % » se lise pareil partout.
 *
 * Sémantique `meter` : les lecteurs d'écran annoncent « Niveau de jus, 75 % »
 * sans qu'on ait à écrire le pourcentage deux fois.
 */

export function FillGauge({
  level,
  orientation = "vertical",
  length = 64,
  thickness = 8,
  onDark = false,
}: {
  /** Pourcentage de jus restant, 0–100. */
  level: number;
  orientation?: "vertical" | "horizontal";
  /** Longueur du tube en px (hauteur si vertical, largeur si horizontal). */
  length?: number;
  thickness?: number;
  /** Sur photo : verre clair sur fond sombre au lieu de l'encre. */
  onDark?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(level)));
  const vertical = orientation === "vertical";
  return (
    <span
      role="meter"
      aria-label="Niveau de jus"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={`${pct} %`}
      style={{
        position: "relative",
        display: "inline-block",
        flex: "none",
        width: vertical ? thickness : length,
        height: vertical ? length : thickness,
        borderRadius: 999,
        background: onDark ? "rgba(255,255,255,.22)" : "var(--line-200)",
        border: onDark ? "1px solid rgba(255,255,255,.3)" : "1px solid var(--line-300)",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Le jus : ambre comme dans le flacon, ancré en bas (vertical) ou à gauche. */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          insetInlineStart: 0,
          bottom: 0,
          width: vertical ? "100%" : `${pct}%`,
          height: vertical ? `${pct}%` : "100%",
          background: "linear-gradient(to top, #B9761A, #E5B24A)",
          borderRadius: 999,
        }}
      />
    </span>
  );
}
