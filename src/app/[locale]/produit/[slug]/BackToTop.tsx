"use client";

import { useEffect, useState } from "react";

/**
 * Flèche « remonter » — apparaît après un écran de défilement, fixe en bas à
 * gauche (le coin droit est pris par « Choisir mon parfum », le bas par la
 * barre d'achat mobile : on se pose au-dessus d'elle). Sur une fiche de dix
 * mille pixels, revenir au prix et au bouton doit coûter un geste.
 */
export default function BackToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Remonter en haut de la page"
      title="Remonter"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="dp-totop"
      style={{
        position: "fixed",
        left: 16,
        bottom: 88,
        zIndex: "var(--z-float, 220)" as unknown as number,
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: "1px solid var(--line-200)",
        background: "var(--surface-white)",
        color: "var(--ink-700)",
        boxShadow: "var(--shadow-sm)",
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(8px)",
        pointerEvents: shown ? "auto" : "none",
        transition: "opacity var(--dur-fast), transform var(--dur-fast)",
      }}
    >
      <style>{`
        .dp-totop:hover { border-color: var(--gold-300); color: var(--gold-700); }
        /* Mobile : au-dessus de la barre d'achat fixe (64 px + zone sûre). */
        @media (max-width: 760px) { .dp-totop { bottom: calc(80px + env(safe-area-inset-bottom)) !important; left: 12px !important; } }
      `}</style>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
