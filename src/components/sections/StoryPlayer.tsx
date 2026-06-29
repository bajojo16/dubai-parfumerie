"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProductStory } from "@/data/product-stories";

export type StoryLabels = {
  close: string;
  mute: string;
  unmute: string;
  share: string;
  shopCta: string; // "Voir le produit" / inclut {name}
  more: string; // aria-label liste vignettes
};

const DEFAULT_LABELS: StoryLabels = {
  close: "Fermer",
  mute: "Couper le son",
  unmute: "Activer le son",
  share: "Partager",
  shopCta: "Voir le produit",
  more: "Autres vidéos",
};

export function StoryPlayer({
  stories,
  startIndex = 0,
  onClose,
  locale = "fr",
  labels,
}: {
  stories: ProductStory[];
  startIndex?: number;
  onClose: () => void;
  locale?: string;
  labels?: Partial<StoryLabels>;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const isRTL = locale === "ar";
  const [index, setIndex] = useState(startIndex);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0); // 0..1 de la story courante
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const active = stories[index];

  const fmtPrice = useCallback(
    (n: number) => {
      try {
        return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
      } catch {
        return `${n} €`;
      }
    },
    [locale]
  );

  const go = useCallback(
    (next: number) => {
      setProgress(0);
      setIndex((i) => {
        const n = next < 0 ? 0 : next >= stories.length ? stories.length - 1 : next;
        return n;
      });
    },
    [stories.length]
  );

  const nextOrClose = useCallback(() => {
    if (index >= stories.length - 1) onClose();
    else go(index + 1);
  }, [index, stories.length, go, onClose]);

  // Recharge + lecture à chaque changement de story
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  }, [index]);

  // Focus trap simple + ESC + restauration focus
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") go(index + 1);
      else if (e.key === "ArrowUp") go(index - 1);
      else if (e.key === "Tab") {
        // piège le focus dans l'overlay
        const f = overlayRef.current?.querySelectorAll<HTMLElement>(
          'button, a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (!f || f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [index, go, onClose]);

  const onShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = { title: active?.title ?? "Story", url };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* annulé */
    }
  }, [active]);

  // Tap zones (seek) — gauche/droite selon sens lecture
  const onTapZone = (dir: "back" | "fwd") => {
    const v = videoRef.current;
    if (!v) return;
    const delta = dir === "back" ? -5 : 5;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
  };

  // Swipe vertical = prev/next
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx)) {
      if (dy < 0) go(index + 1);
      else go(index - 1);
    }
    touchStart.current = null;
  };

  const startSide = isRTL ? "right" : "left";
  const endSide = isRTL ? "left" : "right";

  const thumbs = useMemo(() => stories, [stories]);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={active?.title ?? "Story"}
      dir={isRTL ? "rtl" : "ltr"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Backdrop vidéo floutée */}
      {active && (
        <video
          key={`bg-${active.id}`}
          src={active.videoUrl}
          muted
          autoPlay
          loop
          playsInline
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(40px) brightness(.5)",
            transform: "scale(1.1)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Barre de progression segmentée */}
      <div
        style={{
          position: "absolute",
          top: 10,
          insetInline: 14,
          zIndex: 5,
          display: "flex",
          gap: 6,
        }}
      >
        {stories.map((s, i) => (
          <div key={s.id} style={{ flex: 1, height: 3, borderRadius: 99, background: "rgba(255,255,255,.28)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: i < index ? "100%" : i === index ? `${progress * 100}%` : "0%",
                background: "#fff",
                transition: i === index ? "width .15s linear" : "none",
              }}
            />
          </div>
        ))}
      </div>

      {/* Fermer + marque (haut début) */}
      <div style={{ position: "absolute", top: 22, [startSide]: 18, zIndex: 6, display: "flex", alignItems: "center", gap: 12 }}>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={L.close}
          style={iconBtn}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <span style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,.85)", fontSize: 16, letterSpacing: ".02em" }}>
          Dubaï Parfumerie
        </span>
      </div>

      {/* Son + partage (haut fin) */}
      <div style={{ position: "absolute", top: 22, [endSide]: 18, zIndex: 6, display: "flex", flexDirection: "column", gap: 12 }}>
        <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? L.unmute : L.mute} style={iconBtn}>
          {muted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M11 5 6 9H2v6h4l5 4z" /><path d="M22 9l-6 6M16 9l6 6" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" />
            </svg>
          )}
        </button>
        <button type="button" onClick={onShare} aria-label={L.share} style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
          </svg>
        </button>
      </div>

      {/* Colonne vignettes (côté début) */}
      <div
        style={{
          position: "absolute",
          [startSide]: 18,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          maxHeight: "70vh",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
          {thumbs.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => go(i)}
              aria-label={s.title ?? `Story ${i + 1}`}
              aria-current={i === index}
              style={{
                position: "relative",
                width: 64,
                height: 88,
                borderRadius: 12,
                overflow: "hidden",
                cursor: "pointer",
                padding: 0,
                border: i === index ? "2px solid #fff" : "2px solid transparent",
                background: "#222",
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.posterUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: i === index ? 1 : 0.7 }} />
              {s.shop && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 3,
                    insetInline: 3,
                    fontFamily: "var(--font-sans)",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#fff",
                    background: "rgba(0,0,0,.6)",
                    borderRadius: 6,
                    padding: "1px 0",
                  }}
                >
                  {fmtPrice(s.shop.price)}
                </span>
              )}
            </button>
          ))}
        </div>
        {thumbs.length > 4 && (
          <span aria-hidden style={{ color: "rgba(255,255,255,.6)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
          </span>
        )}
      </div>

      {/* Vidéo nette centrale 9:16 */}
      <div
        style={{ position: "relative", height: "100vh", maxHeight: "100vh", aspectRatio: "9 / 16", zIndex: 4 }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {active && (
          <video
            ref={videoRef}
            key={active.id}
            src={active.videoUrl}
            autoPlay
            muted={muted}
            playsInline
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration) setProgress(v.currentTime / v.duration);
            }}
            onEnded={nextOrClose}
            onClick={() => {
              const v = videoRef.current;
              if (!v) return;
              if (v.paused) v.play().catch(() => {});
              else v.pause();
            }}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 14, background: "#000", cursor: "pointer" }}
          />
        )}

        {/* Zones tap seek (gauche/droite) */}
        <button type="button" aria-hidden tabIndex={-1} onClick={() => onTapZone("back")} style={{ position: "absolute", insetBlock: 0, insetInlineStart: 0, width: "30%", border: "none", background: "transparent", cursor: "pointer" }} />
        <button type="button" aria-hidden tabIndex={-1} onClick={() => onTapZone("fwd")} style={{ position: "absolute", insetBlock: 0, insetInlineEnd: 0, width: "30%", border: "none", background: "transparent", cursor: "pointer" }} />

        {/* CTA shoppable */}
        {active?.shop && (
          <a
            href={active.shop.href}
            style={{
              position: "absolute",
              bottom: 20,
              insetInline: 16,
              zIndex: 5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              textDecoration: "none",
              background: "rgba(255,255,255,.92)",
              borderRadius: 14,
              padding: "10px 14px",
            }}
          >
            <span style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#2C2620" }}>{active.shop.name}</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#A8801F", fontWeight: 700 }}>{fmtPrice(active.shop.price)}</span>
            </span>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".04em",
                textTransform: "uppercase",
                color: "#fff",
                background: "#C4A24F",
                borderRadius: 999,
                padding: "9px 16px",
                whiteSpace: "nowrap",
              }}
            >
              {L.shopCta} →
            </span>
          </a>
        )}
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  border: "none",
  background: "rgba(0,0,0,.35)",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
};
