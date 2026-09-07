"use client";

/**
 * Compte à rebours d'un lot. Reçoit le temps restant déjà calculé par le
 * magasin (une seule horloge pour toute la page) et ne fait que l'habiller :
 * rouge et pulsant sous 10 minutes, « Terminée » à zéro.
 * L'animation est coupée par la règle globale `prefers-reduced-motion`.
 */

import { URGENT_MS } from "@/data/auctions";
import { fmtRemaining } from "./auction-store";

export function Countdown({
  remainingMs,
  size = "md",
  onDark = false,
}: {
  remainingMs: number;
  size?: "sm" | "md" | "lg";
  /** Sur photo : blanc cassé au lieu de l'encre. */
  onDark?: boolean;
}) {
  const ended = remainingMs <= 0;
  const urgent = !ended && remainingMs <= URGENT_MS;
  const fontSize = size === "lg" ? 26 : size === "md" ? 16 : 13;
  const color = ended
    ? onDark
      ? "var(--on-dark-muted)"
      : "var(--ink-400)"
    : urgent
      ? "#E5533D"
      : onDark
        ? "var(--on-dark-strong)"
        : "var(--ink-900)";

  return (
    <span
      className={urgent ? "au-tick" : undefined}
      role="timer"
      aria-live={urgent ? "polite" : "off"}
      aria-label={ended ? "Enchère terminée" : `Temps restant ${fmtRemaining(remainingMs)}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        fontSize,
        letterSpacing: ".02em",
        color,
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
      }}
    >
      {!ended && (
        <svg width={fontSize * 0.85} height={fontSize * 0.85} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2.5 2.5" />
          <path d="M9 3h6" />
        </svg>
      )}
      {fmtRemaining(remainingMs)}
    </span>
  );
}
