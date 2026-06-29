"use client";

/**
 * FreeShippingBar — bandeau « Livraison offerte » crème & or, shimmer animé.
 * Barre de progression vers le seuil. 2 états : en cours (reste X €) / atteint (offerte).
 * Autonome (props). Branchable sur le panier réel via `cartTotal`.
 */

const T = {
  cream: "#FBF7EF",
  creamEdge: "#F3E9D4",
  border: "#E7DBBF",
  ink: "#2C2620",
  muted: "#7A746B",
  gold: "#C9A24A",
  goldDark: "#8A6A1E",
  goldLabel: "#A8801F",
  trackBg: "#EDE3CC",
};

export function FreeShippingBar({
  cartTotal,
  threshold = 60,
  locale = "fr",
  labels,
}: {
  cartTotal: number;
  threshold?: number;
  locale?: string;
  labels?: { progress?: string; reached?: string; remainingPrefix?: string };
}) {
  const isRTL = locale === "ar";
  const reached = cartTotal >= threshold;
  const remaining = Math.max(0, threshold - cartTotal);
  const pct = Math.min(100, Math.round((cartTotal / threshold) * 100));

  const fmt = (n: number) => {
    try {
      return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: remaining % 1 === 0 ? 0 : 2 }).format(n);
    } catch {
      return `${n.toFixed(2)} €`;
    }
  };

  const L = {
    progress: labels?.progress ?? "Plus que {x} pour la livraison offerte",
    reached: labels?.reached ?? "Livraison offerte débloquée !",
    ...labels,
  };

  const message = reached ? L.reached : L.progress.replace("{x}", fmt(remaining));

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      role="status"
      aria-live="polite"
      style={{
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(180deg, ${T.cream}, ${T.creamEdge})`,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: "12px 18px",
      }}
    >
      {/* Shimmer doré qui balaie */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(110deg, transparent 35%, rgba(201,162,74,.22) 50%, transparent 65%)",
          backgroundSize: "220% 100%",
          animation: "dpShipShimmer 3.4s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
        {/* Icône */}
        <span
          style={{
            flexShrink: 0,
            width: 34,
            height: 34,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: reached ? T.gold : "rgba(201,162,74,.14)",
            border: `1px solid ${reached ? T.goldDark : "rgba(201,162,74,.4)"}`,
            transition: "background .4s, border-color .4s",
          }}
        >
          {reached ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.goldDark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: isRTL ? "scaleX(-1)" : "none" }}>
              <path d="M1 3h12v11H1z" /><path d="M13 7h4l4 4v3h-8" />
              <circle cx="6" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
            </svg>
          )}
        </span>

        {/* Texte + progress */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13.5,
              fontWeight: 600,
              color: reached ? T.goldDark : T.ink,
              marginBottom: 7,
            }}
          >
            {message}
          </div>
          {/* Track */}
          <div style={{ position: "relative", height: 7, borderRadius: 999, background: T.trackBg, overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                insetBlock: 0,
                insetInlineStart: 0,
                width: `${pct}%`,
                borderRadius: 999,
                background: `linear-gradient(90deg, ${T.gold}, ${T.goldDark})`,
                transition: "width .6s cubic-bezier(.2,.8,.2,1)",
              }}
            >
              {/* reflet mobile sur la barre */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,.5), transparent)",
                  backgroundSize: "200% 100%",
                  animation: "dpShipShimmer 2.2s linear infinite",
                }}
              />
            </div>
          </div>
        </div>

        {/* % */}
        <span style={{ flexShrink: 0, fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: T.goldLabel, minWidth: 34, textAlign: isRTL ? "left" : "right" }}>
          {pct}%
        </span>
      </div>

      <style>{`@keyframes dpShipShimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
    </div>
  );
}
