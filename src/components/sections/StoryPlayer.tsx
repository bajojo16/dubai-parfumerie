"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProductStory } from "@/data/product-stories";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { addItem } from "@/lib/cart";

export type StoryLabels = {
  close: string;
  mute: string;
  unmute: string;
  share: string;
  shopCta: string; // "Voir le produit" / inclut {name}
  addToCart: string;
  added: string;
  more: string; // aria-label liste vignettes
};

const DEFAULT_LABELS: StoryLabels = {
  close: "Fermer",
  mute: "Couper le son",
  unmute: "Activer le son",
  share: "Partager",
  shopCta: "Voir la fiche produit",
  addToCart: "Ajouter au panier",
  added: "Ajouté au panier",
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
  // Quantité du panneau produit. Remise à 1 quand on change de story : la
  // quantité choisie pour un flacon n'a aucun sens reportée sur le suivant.
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const active = stories[index];

  const fmtPrice = useCallback(
    (n: number) => {
      try {
        return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
      } catch {
        return `${n.toFixed(2).replace(".", ",")} €`;
      }
    },
    [locale]
  );

  const go = useCallback(
    (next: number) => {
      setProgress(0);
      // La quantité et l'accusé d'ajout appartiennent à la story affichée, pas
      // au lecteur : les laisser vivre d'une story à l'autre faisait acheter
      // trois flacons du deuxième parfum parce qu'on en avait choisi trois du
      // premier. Remis ici plutôt que dans un effet sur `index` — un effet qui
      // n'appelle que des setState relance un rendu pour rien.
      setQty(1);
      setAdded(false);
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

  // Recharge + lecture à chaque changement de story.
  // Le player s'ouvre sur un tap, donc la lecture est normalement autorisée —
  // mais si le navigateur refuse quand même (Brave, économiseur de données), un
  // `.catch()` vide laissait la story figée sur sa première image. On retente
  // alors en muet, seul mode qu'aucun navigateur ne bloque, et on retente une
  // fois les données prêtes si le premier appel est arrivé trop tôt.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.playsInline = true;
    const tryPlay = () => {
      const p = v.play();
      p?.catch(() => {
        if (v.muted) return;
        v.muted = true;
        setMuted(true);
        v.play().catch(() => {});
      });
    };
    tryPlay();
    const onReady = () => {
      if (v.paused) tryPlay();
    };
    v.addEventListener("canplay", onReady);
    v.addEventListener("loadeddata", onReady);
    return () => {
      v.removeEventListener("canplay", onReady);
      v.removeEventListener("loadeddata", onReady);
    };
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
      <style>{`
        .sp-stage {
          position: relative;
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          width: 100%;
          height: 100%;
          padding: 64px 18px 18px;
          box-sizing: border-box;
        }
        .sp-video {
          position: relative;
          height: 100%;
          aspect-ratio: 9 / 16;
          flex-shrink: 0;
        }
        .sp-thumbs {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 258px;
          max-height: 100%;
          overflow-y: auto;
          scrollbar-width: none;
          flex-shrink: 0;
        }
        .sp-thumbs::-webkit-scrollbar { display: none; }
        .sp-thumb {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          border-radius: 14px;
          cursor: pointer;
          flex-shrink: 0;
          transition: background .2s, border-color .2s;
        }
        .sp-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 380px;
          flex-shrink: 0;
          max-height: 100%;
          overflow-y: auto;
          scrollbar-width: none;
          padding: 22px;
          box-sizing: border-box;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(20,14,10,.55);
          backdrop-filter: blur(18px);
        }
        .sp-panel::-webkit-scrollbar { display: none; }
        .sp-cta-mobile { display: none; }
        /* Sous 1400 px la fiche latérale rogne la vidéo : on retire d'abord les
           vignettes, qui restent atteignables au swipe et aux flèches. */
        @media (max-width: 1400px) {
          .sp-thumbs { display: none; }
        }
        /* Sous 1100 px la fiche elle-même ne tient plus. Le bandeau compact
           reprend alors son rôle, en bas de la vidéo. */
        @media (max-width: 1100px) {
          .sp-panel { display: none; }
          .sp-cta-mobile { display: flex; }
          .sp-stage { padding: 0; gap: 0; }
          .sp-video { height: 100vh; max-height: 100vh; }
        }
      `}</style>

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

      {/* Scène : vignettes · vidéo · fiche produit.
          Les trois colonnes tiennent dans UNE rangée en flux. Auparavant la
          colonne de vignettes et la vidéo étaient empilées en `position:
          absolute`, ce qui interdisait toute fiche à droite — elle serait
          passée sous la vidéo. En flux, la rangée se centre seule et chaque
          colonne se retire proprement quand l'écran rétrécit. */}
      <div className="sp-stage">
        {/* Colonne vignettes */}
        <div className="sp-thumbs" aria-label={L.more}>
          {thumbs.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => go(i)}
              aria-label={s.title ?? `Story ${i + 1}`}
              aria-current={i === index}
              className="sp-thumb"
              style={{
                // Le nom se lit du côté de la colonne : à droite des vignettes
                // en lecture latine, à leur gauche en arabe.
                flexDirection: isRTL ? "row-reverse" : "row",
                textAlign: isRTL ? "right" : "left",
                background: i === index ? "rgba(255,255,255,.10)" : "rgba(255,255,255,.04)",
                border: i === index ? "1px solid rgba(255,255,255,.45)" : "1px solid rgba(255,255,255,.08)",
              }}
            >
              <span
                style={{
                  position: "relative",
                  width: 64,
                  height: 82,
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#222",
                  flexShrink: 0,
                  display: "block",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.posterUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: i === index ? 1 : 0.72 }} />
              </span>

              {/* Nom, marque et prix SORTIS du cadre. Posés dessus, ils
                  imposaient un dégradé noir sur le tiers bas de chaque poster —
                  c'est-à-dire sur le flacon, qui est justement ce qu'on vient
                  reconnaître. À côté, ils se lisent sans rien masquer. */}
              {(s.title || s.shop) && (
                <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0, flex: 1 }}>
                  {s.title && (
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 15,
                        lineHeight: 1.15,
                        color: i === index ? "#fff" : "rgba(255,255,255,.82)",
                      }}
                    >
                      {s.title}
                    </span>
                  )}
                  {s.shop?.brand && (
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 10.5,
                        fontWeight: 600,
                        letterSpacing: ".09em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,.52)",
                      }}
                    >
                      {s.shop.brand}
                    </span>
                  )}
                  {s.shop && (
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, fontWeight: 700, color: "var(--gold-300)" }}>
                      {fmtPrice(s.shop.price)}
                    </span>
                  )}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Vidéo nette 9:16 */}
        <div
          className="sp-video"
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

          {/* CTA compact — la fiche latérale ne tient pas sous 1100 px, ce
              bandeau la remplace alors et disparaît dès qu'elle s'affiche. */}
          {active?.shop && (
            <a
              href={active.shop.href}
              className="sp-cta-mobile"
              style={{
                position: "absolute",
                bottom: 20,
                insetInline: 16,
                zIndex: 5,
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

        {/* Fiche produit — le contenu que la story raconte, lisible sans la
            quitter : packshot, accroche, notes, prix et ajout au panier. */}
        {active?.shop && (
          <aside className="sp-panel">
            {active.shop.image && (
              <span
                style={{
                  display: "block",
                  background: "#fff",
                  borderRadius: 12,
                  overflow: "hidden",
                  aspectRatio: "1 / 1",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={active.shop.image}
                  alt={active.shop.name}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </span>
            )}

            <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 26, lineHeight: 1.15, color: "#fff" }}>
                {active.shop.name}
              </span>
              {active.shop.brand && (
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 11.5,
                    fontWeight: 600,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.55)",
                  }}
                >
                  {active.shop.brand}
                </span>
              )}
            </span>

            {active.shop.description && (
              <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,.78)" }}>
                {active.shop.description}
              </p>
            )}

            {active.shop.notes && active.shop.notes.length > 0 && (
              <span style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {active.shop.notes.map((n) => (
                  <span
                    key={n}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 10.5,
                      fontWeight: 600,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,.72)",
                      border: "1px solid rgba(255,255,255,.22)",
                      borderRadius: 999,
                      padding: "6px 12px",
                    }}
                  >
                    {n}
                  </span>
                ))}
              </span>
            )}

            <span style={{ height: 1, background: "rgba(255,255,255,.14)" }} />

            <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, color: "#fff" }}>
                {fmtPrice(active.shop.price)}
              </span>
              <QtyStepper value={qty} onChange={setQty} locale={locale} />
            </span>

            <button
              type="button"
              onClick={() => {
                const shop = active.shop;
                if (!shop) return;
                addItem(
                  {
                    // L'identifiant panier est le slug de la fiche : deux
                    // stories du même parfum doivent s'additionner sur une
                    // seule ligne, pas en créer deux.
                    id: shop.href.split("/").pop() ?? shop.name,
                    name: shop.name,
                    brand: shop.brand ?? "Dubaï Parfumerie",
                    price: shop.price,
                    image: shop.image ?? active.posterUrl,
                  },
                  qty
                );
                setAdded(true);
              }}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: added ? "#fff" : "#2C2620",
                background: added ? "#5A7D5A" : "#fff",
                border: "none",
                borderRadius: 999,
                padding: "16px 20px",
                cursor: "pointer",
                transition: "background .2s, color .2s",
              }}
            >
              {added ? `✓ ${L.added}` : L.addToCart}
            </button>

            <a
              href={active.shop.href}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.78)",
                textAlign: "center",
                textDecorationThickness: "1px",
                textUnderlineOffset: 4,
              }}
            >
              {L.shopCta}
            </a>
          </aside>
        )}
      </div>
    </div>
  );
}

/** Exporté pour que le lecteur d'avis en images (ReviewMediaViewer) porte
 *  exactement le même bouton rond translucide : deux visionneuses plein écran
 *  du même site dont les croix de fermeture ne se ressemblent pas se lisent
 *  comme deux produits différents. */
export const iconBtn: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  border: "none",
  background: "rgba(0,0,0,.35)",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
};
