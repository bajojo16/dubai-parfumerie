"use client";

/**
 * La salle des enchères — composant racine client de `/encheres`.
 *
 * Il tient le magasin (`useAuctions`), la modale ouverte (synchronisée avec
 * `?lot=<slug>` pour le partage), la recherche et les filtres (eux aussi dans
 * l'URL : `?q=&statut=&etat=&tri=`, pour qu'une sélection se partage comme un
 * lot), les toasts, la notification « Me prévenir » et les confettis du lot
 * remporté. Les cartes et le panneau ne reçoivent que des vues et des rappels.
 *
 * Un seul bloc <style> pour ce que l'inline ne sait pas faire : keyframes,
 * media queries (grille, modale plein écran sur mobile), hover. Pas de
 * backtick à l'intérieur du template literal.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AUCTION_LOTS, REMIND_BEFORE_MS, type LotCondition } from "@/data/auctions";
import { bidsToday, fmtPrice, fmtRemaining, useAuctions, type LotView } from "./auction-store";
import { AuctionCard } from "./AuctionCard";
import { AuctionModal, AuctionRules } from "./AuctionModal";
import { Confetti } from "./Confetti";

const LOT_PARAM = "lot";
const QUERY_PARAM = "q";
const STATUS_PARAM = "statut";
const CONDITION_PARAM = "etat";
const SORT_PARAM = "tri";

/** « Se termine bientôt » : moins d'une heure. */
const SOON_MS = 60 * 60 * 1000;

/* Les clés sont celles qui apparaissent dans l'URL : en français, lisibles
   dans un lien partagé (`?statut=bientot&etat=occasion`). */
const STATUS_FILTERS = [
  { key: "tous", label: "Tous" },
  { key: "en-cours", label: "En cours" },
  { key: "bientot", label: "Se termine bientôt" },
  { key: "terminees", label: "Terminées" },
  { key: "mes-encheres", label: "Mes enchères" },
  { key: "remportees", label: "Remportées" },
] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number]["key"];

const CONDITION_FILTERS = [
  { key: "tous", label: "Tous" },
  { key: "neuf", label: "Neuf" },
  { key: "occasion", label: "Occasion" },
] as const;
type ConditionFilter = (typeof CONDITION_FILTERS)[number]["key"];

const SORTS = [
  { key: "fin", label: "Fin la plus proche" },
  { key: "prix", label: "Prix courant" },
  { key: "encheres", label: "Nombre d'enchères" },
] as const;
type SortKey = (typeof SORTS)[number]["key"];

/** Une valeur d'URL inconnue (lien bricolé, ancienne clé) retombe sur le défaut, sans erreur. */
function readParam<T extends string>(value: string | null, allowed: readonly { key: T }[], fallback: T): T {
  return allowed.some((f) => f.key === value) ? (value as T) : fallback;
}

/**
 * L'URL est la seule source de vérité du lot ouvert ET des filtres : `?lot=`
 * ouvre le panneau, `?statut=…&etat=…&q=…&tri=…` règlent la grille. Next
 * synchronise `useSearchParams` avec `history.replaceState`, donc pas de
 * second état à tenir à jour — et le lien partagé rouvre la même sélection
 * sans effet au montage. `null` ou la valeur par défaut retire la clé : une
 * URL sans filtre reste `/encheres`.
 */
function writeParams(patch: Record<string, string | null>) {
  const url = new URL(window.location.href);
  Object.entries(patch).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  });
  window.history.replaceState(null, "", url.toString());
}

/** Minuscules sans accents : « kham » trouve Khamrah, « elite » trouve Oud Elite. */
const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

function matchesStatus(v: LotView, filter: StatusFilter): boolean {
  switch (filter) {
    case "en-cours":
      return v.remainingMs > 0;
    case "bientot":
      return v.remainingMs > 0 && v.remainingMs <= SOON_MS;
    case "terminees":
      return v.remainingMs <= 0;
    case "mes-encheres":
      return v.state.bids.some((b) => b.mine);
    case "remportees":
      return v.status === "won";
    default:
      return true;
  }
}

/** Quel que soit le tri, les lots terminés passent après les lots ouverts. */
function compareBy(sort: SortKey) {
  return (a: LotView, b: LotView): number => {
    const aOpen = a.remainingMs > 0;
    const bOpen = b.remainingMs > 0;
    if (aOpen !== bOpen) return aOpen ? -1 : 1;
    if (sort === "prix") return a.price - b.price || a.remainingMs - b.remainingMs;
    if (sort === "encheres") return b.state.bids.length - a.state.bids.length || a.remainingMs - b.remainingMs;
    return a.remainingMs - b.remainingMs;
  };
}

export function AuctionsPage() {
  const { now, hydrated, store, views, bid, setMax, setReminder, markReminded, markCelebrated } = useAuctions();
  const searchParams = useSearchParams();
  const requested = searchParams.get(LOT_PARAM);
  // Avant hydratation on n'ouvre rien : le serveur n'a pas rendu de modale.
  const openSlug = hydrated && requested && AUCTION_LOTS.some((l) => l.slug === requested) ? requested : null;
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const open = useCallback((slug: string) => writeParams({ [LOT_PARAM]: slug }), []);
  const close = useCallback(() => writeParams({ [LOT_PARAM]: null }), []);

  /* Filtres : lus dans l'URL. La recherche garde en plus un brouillon local —
     un champ contrôlé par l'URL perdrait le curseur et l'accent en cours de
     composition ; le brouillon est ce qui filtre, l'URL suit à chaque frappe. */
  const statusFilter = readParam(searchParams.get(STATUS_PARAM), STATUS_FILTERS, "tous");
  const conditionFilter = readParam(searchParams.get(CONDITION_PARAM), CONDITION_FILTERS, "tous");
  const sort = readParam(searchParams.get(SORT_PARAM), SORTS, "fin");
  const [query, setQuery] = useState(() => searchParams.get(QUERY_PARAM) ?? "");
  const setStatusFilter = useCallback((k: StatusFilter) => writeParams({ [STATUS_PARAM]: k === "tous" ? null : k }), []);
  const setConditionFilter = useCallback((k: ConditionFilter) => writeParams({ [CONDITION_PARAM]: k === "tous" ? null : k }), []);
  const setSort = useCallback((k: SortKey) => writeParams({ [SORT_PARAM]: k === "fin" ? null : k }), []);
  const changeQuery = useCallback((q: string) => {
    setQuery(q);
    writeParams({ [QUERY_PARAM]: q.trim() || null });
  }, []);
  const filtersActive = statusFilter !== "tous" || conditionFilter !== "tous" || sort !== "fin" || query.trim() !== "";
  const clearFilters = useCallback(() => {
    setQuery("");
    writeParams({ [QUERY_PARAM]: null, [STATUS_PARAM]: null, [CONDITION_PARAM]: null, [SORT_PARAM]: null });
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  /* Les filtres se combinent (ET). Puis tri choisi, terminés toujours en
     queue. Le lot « à la une » est celui qui ferme le premier PARMI les lots
     filtrés, quel que soit le tri : c'est le sens de la vedette (l'urgence),
     pas la première case de la grille. */
  const filtered = useMemo(() => {
    const q = fold(query);
    return views.filter(
      (v) =>
        matchesStatus(v, statusFilter) &&
        (conditionFilter === "tous" || v.lot.condition === (conditionFilter as LotCondition)) &&
        (!q || fold(`${v.lot.brand} ${v.lot.name}`).includes(q))
    );
  }, [views, query, statusFilter, conditionFilter]);
  const sorted = useMemo(() => [...filtered].sort(compareBy(sort)), [filtered, sort]);
  const featuredSlug = useMemo(() => {
    const openLots = filtered.filter((v) => v.remainingMs > 0);
    if (!openLots.length) return null;
    return openLots.reduce((best, v) => (v.remainingMs < best.remainingMs ? v : best)).lot.slug;
  }, [filtered]);

  /* Chiffres du héros : toute la salle, pas la sélection filtrée. « Enchères
     du jour » est une donnée de DÉMONSTRATION (enchères simulées incluses) —
     la mention en bas de page le dit. */
  const openViews = views.filter((v) => v.remainingMs > 0);
  const openCount = openViews.length;
  const nextClose = openViews.length ? Math.min(...openViews.map((v) => v.remainingMs)) : 0;
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

      {/* ── Recherche, filtres, tri ── */}
      <section aria-label="Rechercher et filtrer les lots" style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 20px 0" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <label style={{ position: "relative", flex: "1 1 240px", minWidth: 0 }}>
            <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
              Rechercher un parfum ou une maison
            </span>
            <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", top: "50%", insetInlineStart: 14, transform: "translateY(-50%)", color: "var(--ink-400)", pointerEvents: "none" }}>
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              type="search"
              data-testid="au-search"
              value={query}
              onChange={(e) => changeQuery(e.target.value)}
              placeholder="Rechercher un parfum, une maison…"
              autoComplete="off"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "11px 14px 11px 40px",
                borderRadius: 999,
                border: "1px solid var(--line-300)",
                background: "#fff",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                color: "var(--ink-900)",
              }}
            />
          </label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-500)" }}>
            Trier
            <select
              data-testid="au-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              style={{ padding: "10px 12px", borderRadius: 999, border: "1px solid var(--line-300)", background: "#fff", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-900)" }}
            >
              {SORTS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <span data-testid="au-count" aria-live="polite" style={{ marginInlineStart: "auto", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-500)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
            {hydrated ? (
              <>
                <strong style={{ color: "var(--ink-900)" }}>{sorted.length}</strong> {sorted.length > 1 ? "lots" : "lot"}
                {sorted.length !== views.length ? ` sur ${views.length}` : ""}
              </>
            ) : (
              "—"
            )}
          </span>
        </div>

        <div className="au-filters" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 18px", marginTop: 12 }}>
          <div role="group" aria-label="Statut" className="au-chips" data-testid="au-status-chips">
            {STATUS_FILTERS.map((f) => (
              <Chip key={f.key} active={statusFilter === f.key} onClick={() => setStatusFilter(f.key)}>
                {f.label}
              </Chip>
            ))}
          </div>
          <div role="group" aria-label="État du flacon" className="au-chips" data-testid="au-condition-chips">
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-500)", marginInlineEnd: 2 }}>État</span>
            {CONDITION_FILTERS.map((f) => (
              <Chip key={f.key} active={conditionFilter === f.key} onClick={() => setConditionFilter(f.key)}>
                {f.label}
              </Chip>
            ))}
          </div>
          {filtersActive && (
            <button type="button" onClick={clearFilters} data-testid="au-clear" className="au-chip" style={{ ...chipBase, border: "none", textDecoration: "underline", color: "var(--gold-700)", padding: "7px 4px" }}>
              Effacer
            </button>
          )}
        </div>
      </section>

      {/* ── Grille ── */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "20px 20px 8px" }}>
        {sorted.length === 0 ? (
          <div data-testid="au-empty" style={{ padding: "48px 20px", textAlign: "center", borderRadius: 18, border: "1px dashed var(--line-300)", fontFamily: "var(--font-sans)", color: "var(--ink-500)" }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink-900)", margin: "0 0 6px" }}>Aucun lot ne correspond</p>
            <p style={{ margin: "0 0 14px", fontSize: 14 }}>
              {statusFilter === "mes-encheres" || statusFilter === "remportees"
                ? "Vous n'avez pas encore enchéri sur un lot de cette sélection."
                : "Essayez un autre mot, ou élargissez les filtres."}
            </p>
            <button type="button" onClick={clearFilters} style={{ ...chipBase, background: "var(--espresso-900)", color: "var(--on-dark-strong)", border: "none", padding: "10px 18px" }}>
              Effacer les filtres
            </button>
          </div>
        ) : (
          <div className="au-grid">
            {sorted.map((v) => (
              <AuctionCard key={v.lot.slug} view={v} featured={v.lot.slug === featuredSlug} onOpen={() => open(v.lot.slug)} />
            ))}
          </div>
        )}
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

const chipBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "7px 13px",
  borderRadius: 999,
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1.2,
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "background 160ms ease, color 160ms ease, border-color 160ms ease",
};

/** Pastille de filtre : espresso quand active, contour sinon. `aria-pressed` porte l'état. */
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="au-chip"
      style={{
        ...chipBase,
        background: active ? "var(--espresso-900)" : "transparent",
        color: active ? "var(--on-dark-strong)" : "var(--ink-700)",
        border: active ? "1px solid var(--espresso-900)" : "1px solid var(--line-300)",
      }}
    >
      {children}
    </button>
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
  .au-chips { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
  @media (hover: hover) { .au-chip:hover { border-color: var(--espresso-900) !important; color: var(--ink-900); } }
  .au-chip:focus-visible { outline: none; box-shadow: var(--focus-ring); }
  /* Panneau « État du flacon » : photo pleine largeur sur mobile, photo à
     gauche et jauge + note à droite dès que la colonne le permet. */
  .au-cond { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
  @media (min-width: 761px) { .au-cond { grid-template-columns: 220px minmax(0, 1fr); align-items: start; } }

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
