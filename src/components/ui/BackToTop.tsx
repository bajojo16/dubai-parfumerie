"use client";

import { useEffect, useState } from "react";

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Remonter en haut"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{
        position: "fixed",
        insetInlineEnd: 24,
        bottom: 24,
        zIndex: 1200,
        width: 48,
        height: 48,
        borderRadius: "50%",
        border: "1px solid rgba(200,144,30,.35)",
        background: "var(--espresso-900, #15100B)",
        color: "var(--gold-400, #D8A93A)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 8px 24px rgba(0,0,0,.28)",
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(14px)",
        pointerEvents: show ? "auto" : "none",
        transition: "opacity .25s ease, transform .25s ease, background .2s",
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
