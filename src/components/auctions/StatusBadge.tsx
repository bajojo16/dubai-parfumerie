"use client";

/**
 * Badge d'état d'un lot, même vocabulaire et mêmes couleurs partout (grille et
 * panneau) : vert « Vous menez », ambre « Dépassé », or « Remporté », gris
 * « Terminée ». « open » (le visiteur n'a rien joué) n'affiche rien — pas de
 * badge pour l'absence d'information.
 */

import type { LotStatus } from "./auction-store";

const TONES: Record<Exclude<LotStatus, "open">, { bg: string; fg: string; label: string; pulse?: boolean }> = {
  leading: { bg: "#3F7A47", fg: "#F3FBF2", label: "Vous menez", pulse: true },
  outbid: { bg: "#D98A1E", fg: "#1C1611", label: "Vous avez été dépassé" },
  won: { bg: "var(--gold-500)", fg: "var(--espresso-900)", label: "Remporté" },
  ended: { bg: "rgba(60,52,44,.8)", fg: "var(--on-dark)", label: "Terminée" },
};

export function StatusBadge({ status, size = "sm" }: { status: LotStatus; size?: "sm" | "md" }) {
  if (status === "open") return null;
  const t = TONES[status];
  return (
    <span
      className={t.pulse ? "au-pulse" : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: size === "md" ? "7px 14px" : "5px 10px",
        borderRadius: 999,
        fontFamily: "var(--font-sans)",
        fontSize: size === "md" ? 12 : 10,
        fontWeight: 700,
        letterSpacing: ".12em",
        textTransform: "uppercase",
        background: t.bg,
        color: t.fg,
        whiteSpace: "nowrap",
      }}
    >
      {t.pulse && <span aria-hidden style={{ width: 7, height: 7, borderRadius: "50%", background: "currentColor" }} />}
      {t.label}
    </span>
  );
}
