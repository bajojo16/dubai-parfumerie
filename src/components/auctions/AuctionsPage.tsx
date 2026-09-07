"use client";

/**
 * La salle des enchères — composant racine client de `/encheres`.
 *
 * Il tient le magasin (`useAuctions`), la modale ouverte (synchronisée avec
 * `?lot=<slug>` pour le partage), les toasts, la notification « Me prévenir »
 * et les confettis du lot remporté. Les cartes et le panneau ne reçoivent que
 * des vues et des rappels.
 *
 * Un seul bloc <style> pour ce que l'inline ne sait pas faire : keyframes,
 * media queries (grille, modale plein écran sur mobile), hover. Pas de
 * backtick à l'intérieur du template literal.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AUCTION_LOTS, REMIND_BEFORE_MS } from "@/data/auctions";
import { bidsToday, fmtPrice, fmtRemaining, useAuctions } from "./auction-store";
import { AuctionCard } from "./AuctionCard";
import { AuctionModal, AuctionRules } from "./AuctionModal";
import { Confetti } from "./Confetti";

const LOT_PARAM = "lot";

/**
 * L'URL est la seule source de vérité du lot ouvert : `?lot=<slug>` ouvre le
 * panneau, son absence le ferme. Next synchronise `useSearchParams` avec
 * `history.replaceState`, donc pas de second état à tenir à jour — et le lien
 * partagé rouvre le bon lot sans effet au montage.
 */
function writeLotParam(slug: string | null) {
  const url = new URL(window.location.href);
  if (slug) url.searchParams.set(LOT_PARAM, slug);
  else url.searchParams.delete(LOT_PARAM);
  window.history.replaceState(null, "", url.toString());
}

export function AuctionsPage() {
  const { now, hydrated, store, views, bid, setMax, setReminder, markReminded, markCelebrated } = useAuctions();
  const searchParams = useSearchParams();
  const requested = searchParams.get(LOT_PARAM);
  // Avant hydratation on n'ouvre rien : le serveur n'a pas rendu de modale.
  const openSlug = hydrated && requested && AUCTION_LOTS.some((l) => l.slug === requested) ? requested : null;
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const open = useCallback((slug: string) => writeLotParam(slug), []);
  const close = useCallback(() => writeLotParam(null), []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  /* Tri : ouverts par clôture croissante, puis les terminés. La première
     carte ouverte est « à la une ». */
  const sorted = useMemo(() => {
    const openLots = views.filter((v) => v.remainingMs > 0).sort((a, b) => a.remainingMs - b.remainingMs);
    const closed = views.filter((v) => v.remainingMs <= 0);
    return [...openLots, ...closed];
  }, [views]);
  const featuredSlug = sorted[0]?.remainingMs > 0 ? sorted[0].lot.slug : null;

  /* Chiffres du héros. « Enchères du jour » est une donnée de DÉMONSTRATION
     (enchères simulées incluses) — la mention en bas de page le dit. */
  const openCount = views.filter((v) => v.remainingMs > 0).length;
  const nextClose = sorted[0]?.remainingMs > 0 ? sorted[0].remainingMs : 0;
  const todayCount = bidsToday(store, now);

  /* Rappel 5 min avant la fin — uniquement si l'onglet est ouvert. */
  useEffect(() => {
    if (!hydrated) return;
    views.forEach((v) => {
      if (!v.state.reminder || v.state.reminded || v.remainingMs <= 0 || v.remainingMs > REMIND_BEFORE_MS) return;
      markReminded(v.lot.slug);
      const title = `${v.lot.brand} ${v.lot.name} — clôture dans 5 min`;
      const body = `Enchère actuelle ${fmtPrice(v.price)}. ${v.status === "leading" ? "Vous menez." : "Vous pouvez encore enchérir."}`;
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          new Notification(title, { body });
          return;
        } catch {
          /* repli toast */
        }
      }
      showToast(`${title} · ${body}`);
    });
  }, [views, hydrated, markReminded, showToast]);

  /* Victoire : les confettis sont DÉRIVÉS du magasin (un lot remporté pas
     encore fêté) et se marquent fêtés quand l'animation se termine — une fois
     par lot. Le panneau s'ouvre sur la carte « Remporté à X € au lieu de Y € »
     si rien n'est ouvert : c'est elle qui annonce la victoire, pas un toast. */
  const celebratingSlug = hydrated ? views.find((v) => v.status === "won" && !v.state.celebrated)?.lot.slug ?? null : null;
  useEffect(() => {
    if (celebratingSlug && !openSlug) open(celebratingSlug);
    // Une seule fois par lot : on ne réagit qu'au slug, pas à la fermeture du panneau.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebratingSlug, open]);

  const openView = openSlug ? views.find((v) => v.lot.slug === openSlug) ?? null : null;

  const handleBid = useCallback(
    (amount: number) => {
      if (!openSlug) return;
      bid(openSlug, amount);
      showToast(`Enchère posée : ${fmtPrice(amount)} — vous menez`);
    },
    [openSlug, bid, showToast]
  );

  return (
    <div className="au-root" style={{ background: "var(--surface-page)", minHeight: "60vh" }}>
      <style>{STYLES}</style>

      {/* ── Héros compact ── */}
      <section
        style={{
          background: "var(--espresso-900)",
          color: "var(--on-dark-strong)",
          padding: "56px 20px 44px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 80% at 80% 0%, rgba(200,144,30,.22), transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
          <div style={{ maxWidth: 560 }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, letterSpacing: ".26em", textTransform: "uppercase", color: "var(--gold-400)", marginBottom: 12 }}>Salle des ventes</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(2.4rem, 4.6vw, 3.8rem)", lineHeight: 1, margin: 0 }}>Les enchères</h1>
            <p style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: 17, lineHeight: 1.6, color: "var(--on-dark)", margin: "14px 0 0" }}>
              Chaque semaine, des flacons authentiques à emporter au prix que vous décidez.
            </p>
          </div>
          <dl className="au-stats" style={{ display: "flex", gap: 10, margin: 0, flexWrap: "wrap" }}>
            <Stat label="Lots ouverts" value={hydrated ? String(openCount) : "—"} />
            <Stat label="Prochaine clôture" value={hydrated ? (nextClose > 0 ? fmtRemaining(nextClose) : "—") : "—"} urgent={nextClose > 0 && nextClose < 10 * 60 * 1000} />
            <Stat label="Enchères du jour" value={hydrated ? String(todayCount) : "—"} />
          </dl>
        </div>
      </section>

      {/* ── Grille ── */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 20px 8px" }}>
        <div className="au-grid">
          {sorted.map((v) => (
            <AuctionCard key={v.lot.slug} view={v} featured={v.lot.slug === featuredSlug} onOpen={() => open(v.lot.slug)} />
          ))}
        </div>
      </section>

      {/* ── Règles + mention démonstration ── */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 20px 64px" }}>
        <details className="au-rules" style={{ background: "var(--surface-cream)", border: "1px solid var(--line-200)", borderRadius: 18, padding: "16px 20px", fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--ink-700)" }}>
          <summary style={{ cursor: "pointer", fontWeight: 600, color: "var(--ink-900)", listStyle: "none", display: "flex", alignItems: "center", gap: 10, fontSize: 15 }}>
            <span aria-hidden style={{ color: "var(--gold-500)" }}>✦</span> Les règles, en six points
          </summary>
          <AuctionRules />
        </details>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-400)", textAlign: "center", margin: "22px 0 0" }}>
          Enchères de démonstration — les autres enchérisseurs et le compteur du jour sont simulés dans ce navigateur, aucune enchère réelle n&apos;est enregistrée.
        </p>
      </section>

      {/* ── Modale ── */}
      {openView && (
        <AuctionModal
          key={openView.lot.slug}
          view={openView}
          now={now}
          onClose={close}
          onBid={handleBid}
          onSetMax={(m) => setMax(openView.lot.slug, m)}
          onReminder={(on) => setReminder(openView.lot.slug, on)}
          onToast={showToast}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          role="status"
          className="au-toast"
          style={{
            position: "fixed",
            bottom: 24,
            insetInline: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 1250,
            pointerEvents: "none",
            padding: "0 16px",
          }}
        >
          <span style={{ background: "var(--espresso-900)", color: "var(--on-dark-strong)", padding: "12px 18px", borderRadius: 999, fontFamily: "var(--font-sans)", fontSize: 14, boxShadow: "0 10px 30px rgba(0,0,0,.3)", maxWidth: 520, textAlign: "center" }}>
            {toast}
          </span>
        </div>
      )}

      {celebratingSlug && <Confetti onDone={() => markCelebrated(celebratingSlug)} />}
    </div>
  );
}

function Stat({ label, value, urgent = false }: { label: string; value: string; urgent?: boolean }) {
  return (
    <div
      style={{
        minWidth: 128,
        padding: "12px 16px",
        borderRadius: 14,
        background: "rgba(255,255,255,.06)",
        border: "1px solid rgba(255,255,255,.12)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <dt style={{ fontFamily: "var(--font-sans)", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--on-dark-muted)", margin: 0 }}>{label}</dt>
      <dd
        className={urgent ? "au-tick" : undefined}
        style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 24, lineHeight: 1.1, margin: "4px 0 0", color: urgent ? "#FF8A75" : "var(--on-dark-strong)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}
      >
        {value}
      </dd>
    </div>
  );
}

/* Grille : 3 colonnes, le lot à la une en 2 × 2 → six lots remplissent
   exactement trois rangées. Tablette : 2 colonnes, la une sur toute la
   largeur. Mobile : une colonne, toutes les cartes au même format. */
const STYLES = `
  .au-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; grid-auto-flow: dense; }
  .au-card { aspect-ratio: 4 / 5; min-width: 0; }
  .au-card--featured { grid-column: span 2; grid-row: span 2; aspect-ratio: auto; }
  .au-card-btn { transition: transform 260ms var(--ease-out), box-shadow 260ms var(--ease-out); }
  .au-card-img { transition: transform 700ms var(--ease-out); }
  @media (hover: hover) {
    .au-card-btn:hover { transform: translateY(-4px); box-shadow: 0 22px 44px rgba(21,16,11,.24) !important; }
    .au-card-btn:hover .au-card-img { transform: scale(1.04); }
  }
  .au-card-btn:focus-visible { outline: none; box-shadow: var(--focus-ring), 0 12px 32px rgba(21,16,11,.16) !important; }
  .au-bid-main:active { transform: scale(.985); }
  .au-bid-main:hover { filter: brightness(1.05); }
  .au-rules summary::-webkit-details-marker, .au-panel summary::-webkit-details-marker { display: none; }

  @keyframes au-pop { 0% { transform: scale(1); } 35% { transform: scale(1.12); color: var(--gold-400); } 100% { transform: scale(1); } }
  .au-pop { animation: au-pop 520ms var(--ease-out); transform-origin: left center; display: inline-block; }
  @keyframes au-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(63,122,71,.55); } 60% { box-shadow: 0 0 0 7px rgba(63,122,71,0); } }
  .au-pulse { animation: au-pulse 1.6s ease-out infinite; }
  @keyframes au-tick { 0%, 100% { opacity: 1; } 50% { opacity: .55; } }
  .au-tick { animation: au-tick 1s ease-in-out infinite; }
  @keyframes au-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
  .au-fade-in { animation: au-fade-in 320ms var(--ease-out); }
  .au-toast span { animation: au-fade-in 220ms var(--ease-out); }
  .au-panel { animation: au-fade-in 260ms var(--ease-out); }

  @media (max-width: 1100px) {
    .au-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .au-card--featured { grid-column: span 2; grid-row: span 1; aspect-ratio: 16 / 11; }
  }
  @media (max-width: 640px) {
    .au-grid { grid-template-columns: minmax(0, 1fr); gap: 14px; }
    .au-card--featured { grid-column: span 1; aspect-ratio: 4 / 5; }
    .au-stats { width: 100%; }
    .au-stats > div { flex: 1 1 0; min-width: 0 !important; padding: 10px 12px !important; }
    .au-stats dd { font-size: 18px !important; }
  }
  @media (max-width: 760px) {
    .au-overlay { padding: 0 !important; align-items: stretch !important; }
    .au-panel { grid-template-columns: minmax(0, 1fr) !important; max-height: 100vh !important; border-radius: 0 !important; }
    .au-gallery-main { aspect-ratio: 4 / 4 !important; }
    .au-body { padding: 20px 16px 0 !important; }
    .au-bidbar { position: sticky; bottom: 0; z-index: 2; margin-inline: -16px; padding-inline: 16px; box-shadow: 0 -12px 24px rgba(253,251,246,.9); }
  }
  @media (prefers-reduced-motion: reduce) {
    .au-pop, .au-pulse, .au-tick, .au-fade-in, .au-panel, .au-toast span { animation: none !important; }
    .au-card-btn, .au-card-img { transition: none !important; }
  }
`;
