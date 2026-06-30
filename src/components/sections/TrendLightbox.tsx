"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { TrendProduct } from "@/data/trend-products";

export type TrendLightboxLabels = {
  close: string;
  prev: string;
  next: string;
  helpful: string; // "Utile ?"
  seeProduct: string; // "Voir le produit"
  verified: string; // "Achat vérifié"
};

const DEFAULT_LABELS: TrendLightboxLabels = {
  close: "Fermer",
  prev: "Avis précédent",
  next: "Avis suivant",
  helpful: "Utile ?",
  seeProduct: "Voir le produit",
  verified: "Achat vérifié",
};

const GOLD = "#C9A24A";

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: "inline-flex", gap: 2 }} aria-label={`${rating}/5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill={i < Math.round(rating) ? GOLD : "#E3DCCE"} aria-hidden>
          <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" />
        </svg>
      ))}
    </div>
  );
}

export function TrendLightbox({
  products,
  index,
  onClose,
  onNavigate,
  locale = "fr",
  labels,
}: {
  products: TrendProduct[];
  index: number; // -1 = fermé
  onClose: () => void;
  onNavigate: (next: number) => void;
  locale?: string;
  labels?: Partial<TrendLightboxLabels>;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const isRTL = locale === "ar";
  const open = index >= 0 && index < products.length;
  const product = open ? products[index] : null;
  const dialogRef = useRef<HTMLDivElement>(null);
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  const go = (delta: number) => {
    const n = (index + delta + products.length) % products.length;
    onNavigate(n);
  };

  // Reset du vote local quand on change d'avis
  useEffect(() => {
    setVote(null);
  }, [index]);

  // Clavier (Esc / flèches) + verrou scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(isRTL ? -1 : 1);
      else if (e.key === "ArrowLeft") go(isRTL ? 1 : -1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, isRTL]);

  if (!open || !product) return null;
  const r = product.review;

  const navBtn: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "none",
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    color: "#fff",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    zIndex: 3,
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      ref={dialogRef}
      tabIndex={-1}
      dir={isRTL ? "rtl" : "ltr"}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(20,15,8,0.72)",
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
        display: "grid",
        placeItems: "center",
        padding: "clamp(12px, 4vw, 48px)",
      }}
    >
      {/* Bouton fermer (coin haut) */}
      <button
        type="button"
        aria-label={L.close}
        onClick={onClose}
        style={{
          position: "fixed",
          top: 18,
          insetInlineEnd: 18,
          width: 44,
          height: 44,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.25)",
          background: "rgba(0,0,0,0.4)",
          color: "#fff",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          zIndex: 1002,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Carte modale (stop propagation pour ne pas fermer) */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(940px, 100%)",
          maxHeight: "calc(100vh - 48px)",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          borderRadius: 16,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        }}
        className="trend-lb-card"
      >
        {/* Flèches navigation */}
        <button type="button" aria-label={L.prev} onClick={() => go(isRTL ? 1 : -1)} style={{ ...navBtn, insetInlineStart: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: isRTL ? "scaleX(-1)" : "none" }}>
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button type="button" aria-label={L.next} onClick={() => go(isRTL ? -1 : 1)} style={{ ...navBtn, insetInlineEnd: 10 }} className="trend-lb-next">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: isRTL ? "scaleX(-1)" : "none" }}>
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        {/* Gauche : vidéo verticale */}
        <div style={{ position: "relative", background: "#000", aspectRatio: "9 / 16", minHeight: 0 }}>
          {product.video ? (
            <video
              key={product.video}
              src={product.video}
              autoPlay
              muted
              loop
              playsInline
              controls
              poster={product.image}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <Image src={product.image} alt={product.name} fill sizes="470px" style={{ objectFit: "cover" }} />
          )}
        </div>

        {/* Droite : avis */}
        <div
          className="trend-lb-review"
          style={{
            padding: "28px 26px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            overflowY: "auto",
            textAlign: isRTL ? "right" : "left",
            fontFamily: "var(--font-sans)",
            color: "#2C2620",
          }}
        >
          {r ? (
            <>
              <Stars rating={r.rating} />

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  aria-hidden
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "#F2ECDF",
                    color: "#9A7B2E",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {r.author.charAt(0)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                    {r.author}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill={GOLD} aria-label={L.verified}>
                      <path d="M12 2l2.4 1.8 3-.2 1 2.8 2.6 1.6-.9 2.9.9 2.9-2.6 1.6-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8L3 16.2l.9-2.9L3 10.4l2.6-1.6 1-2.8 3 .2z" />
                      <path d="M9.5 12.5l1.8 1.8 3.4-3.6" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div style={{ fontSize: 12.5, color: "#8A8175" }}>
                    {r.location}
                    {r.location && (r.countryFlag || r.date) ? " " : ""}
                    {r.countryFlag} {r.countryFlag && r.date ? "· " : ""}
                    {r.date}
                  </div>
                </div>
              </div>

              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, margin: "2px 0 0", lineHeight: 1.2 }}>
                {r.title}
              </h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#4A443B", margin: 0 }}>{r.body}</p>

              {/* Utile ? */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 2 }}>
                <span style={{ fontSize: 13, color: "#8A8175" }}>{L.helpful}</span>
                <button
                  type="button"
                  onClick={() => setVote((v) => (v === "up" ? null : "up"))}
                  aria-pressed={vote === "up"}
                  style={voteBtn(vote === "up", "#3F8F5B")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M7 10v11M2 14v5a2 2 0 0 0 2 2h13.3a2 2 0 0 0 2-1.7l1.3-7a2 2 0 0 0-2-2.3H14V6a2 2 0 0 0-2-2l-3 6" />
                  </svg>
                  {(r.helpfulUp ?? 0) + (vote === "up" ? 1 : 0)}
                </button>
                <button
                  type="button"
                  onClick={() => setVote((v) => (v === "down" ? null : "down"))}
                  aria-pressed={vote === "down"}
                  style={voteBtn(vote === "down", "#B25548")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: "rotate(180deg)" }}>
                    <path d="M7 10v11M2 14v5a2 2 0 0 0 2 2h13.3a2 2 0 0 0 2-1.7l1.3-7a2 2 0 0 0-2-2.3H14V6a2 2 0 0 0-2-2l-3 6" />
                  </svg>
                  {(r.helpfulDown ?? 0) + (vote === "down" ? 1 : 0)}
                </button>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 14, color: "#8A8175" }}>{product.name}</p>
          )}

          {/* Lien produit (bas) */}
          <Link
            href={product.href}
            style={{
              marginTop: "auto",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 12,
              background: "#FAF6EE",
              border: "1px solid #ECE3D2",
              textDecoration: "none",
              color: "#2C2620",
            }}
          >
            <span style={{ position: "relative", width: 44, height: 44, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
              <Image src={product.image} alt="" fill sizes="44px" style={{ objectFit: "cover" }} />
            </span>
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: "block", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9A8E78" }}>
                {product.brand}
              </span>
              <span style={{ display: "block", fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600 }}>
                {product.name}
              </span>
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#9A7B2E", whiteSpace: "nowrap" }}>
              {L.seeProduct} →
            </span>
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .trend-lb-card { grid-template-columns: 1fr !important; max-height: calc(100vh - 24px) !important; }
          .trend-lb-card > div:first-of-type { aspect-ratio: 4 / 5 !important; }
        }
      `}</style>
    </div>
  );
}

function voteBtn(active: boolean, color: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 10px",
    borderRadius: 999,
    border: `1px solid ${active ? color : "#E3DCCE"}`,
    background: active ? color : "#fff",
    color: active ? "#fff" : "#6B6357",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  };
}
