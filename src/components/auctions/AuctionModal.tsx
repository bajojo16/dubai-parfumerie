"use client";

/**
 * Panneau de détail d'un lot : galerie, état, contrôle d'enchère, historique,
 * partage, rappel, règles. Une modale plutôt qu'une route : on passe d'un lot
 * à l'autre sans quitter la salle, et l'URL porte quand même `?lot=<slug>`
 * pour que le lien partagé rouvre le bon panneau.
 *
 * Mobile : le panneau prend tout l'écran et la barre d'enchère reste collée
 * en bas (`au-bidbar`, position sticky dans le conteneur qui défile).
 */

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { WHATSAPP_URL } from "@/lib/contact";
import { MAX_DEMO_RATIO, REMIND_BEFORE_MS, SNIPE_EXTEND_MS, SNIPE_WINDOW_MS } from "@/data/auctions";
import { fmtAgo, fmtPrice, type LotView } from "./auction-store";
import { Countdown } from "./Countdown";
import { StatusBadge } from "./StatusBadge";

export interface AuctionModalProps {
  view: LotView;
  now: number;
  onClose: () => void;
  onBid: (amount: number) => void;
  onSetMax: (max: number | null) => void;
  onReminder: (on: boolean) => void;
  onToast: (msg: string) => void;
}

const HISTORY_SIZE = 5;

export function AuctionModal({ view, now, onClose, onBid, onSetMax, onReminder, onToast }: AuctionModalProps) {
  const { lot, state, price, nextBid, step, status, remainingMs, hasBids } = view;
  const ended = status === "won" || status === "ended";
  /* Le parent monte la modale avec `key={slug}` : changer de lot remonte le
     composant, l'index d'image et le brouillon repartent de zéro sans effet. */
  const [imgIndex, setImgIndex] = useState(0);
  const images = useMemo(() => [lot.image, ...lot.gallery], [lot]);
  const [maxDraft, setMaxDraft] = useState(state.myMax !== null ? String(state.myMax) : "");
  /* Le champ suit le plafond du magasin quand celui-ci change (ajustement
     d'état pendant le rendu — le motif recommandé, pas un effet). */
  const [seenMax, setSeenMax] = useState(state.myMax);
  if (seenMax !== state.myMax) {
    setSeenMax(state.myMax);
    setMaxDraft(state.myMax !== null ? String(state.myMax) : "");
  }

  /* Échap + verrou du défilement de la page derrière. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  /* Montant pour « n pas » : au-dessus du prix courant s'il y a déjà une
     enchère ; sinon le premier pas est la mise à prix elle-même. */
  const amountFor = useCallback(
    (steps: number) => Math.round((hasBids ? price + step * steps : nextBid + step * (steps - 1)) * 100) / 100,
    [hasBids, price, step, nextBid]
  );
  const bidBy = useCallback((steps: number) => onBid(amountFor(steps)), [amountFor, onBid]);

  const applyMax = useCallback(() => {
    const n = Number(maxDraft.replace(",", "."));
    if (!maxDraft.trim()) {
      onSetMax(null);
      onToast("Enchère max retirée");
      return;
    }
    if (!Number.isFinite(n) || n < nextBid) {
      onToast(`L'enchère max doit être d'au moins ${fmtPrice(nextBid)}`);
      return;
    }
    onSetMax(n);
    onToast(`Enchère max fixée à ${fmtPrice(n)} — on surenchérit pour vous`);
  }, [maxDraft, nextBid, onSetMax, onToast]);

  const share = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}?lot=${lot.slug}`;
    const text = `${lot.brand} ${lot.name} — enchère en cours à ${fmtPrice(price)} (boutique ${fmtPrice(lot.shopPrice)})`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Enchère · ${lot.brand} ${lot.name}`, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      onToast("Lien copié — à partager !");
    } catch {
      /* partage annulé par l'utilisateur : rien à dire */
    }
  }, [lot, price, onToast]);

  const remind = useCallback(async () => {
    if (state.reminder) {
      onReminder(false);
      onToast("Rappel désactivé");
      return;
    }
    // La permission n'est demandée qu'au clic, jamais à l'arrivée sur la page.
    if (typeof Notification !== "undefined" && Notification.permission !== "denied") {
      try {
        const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
        onReminder(true);
        onToast(perm === "granted" ? "On vous prévient 5 min avant la clôture (onglet ouvert)" : "Rappel activé sur cette page");
        return;
      } catch {
        /* navigateur sans API : repli ci-dessous */
      }
    }
    onReminder(true);
    onToast("Rappel activé sur cette page");
  }, [state.reminder, onReminder, onToast]);

  const history = useMemo(() => [...state.bids].reverse().slice(0, HISTORY_SIZE), [state.bids]);
  const waMessage = encodeURIComponent(
    `Bonjour, j'ai remporté l'enchère ${lot.brand} ${lot.name} (${lot.volume}) à ${fmtPrice(price)}. Comment finaliser ?`
  );

  return (
    <div
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "rgba(21,16,11,.62)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      className="au-overlay"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="au-modal-title"
        className="au-panel"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 980,
          maxHeight: "calc(100vh - 32px)",
          overflowY: "auto",
          background: "var(--surface-page)",
          borderRadius: 24,
          boxShadow: "0 30px 80px rgba(0,0,0,.35)",
          display: "grid",
          gridTemplateColumns: "minmax(0, 5fr) minmax(0, 6fr)",
        }}
      >
        {/* Fermer */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          style={{
            position: "absolute",
            top: 12,
            insetInlineEnd: 12,
            zIndex: 3,
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,.2)",
            background: "rgba(21,16,11,.55)",
            color: "#fff",
            fontSize: 20,
            lineHeight: 1,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>

        {/* ── Galerie ── */}
        <div className="au-gallery" style={{ position: "relative", background: "var(--espresso-900)" }}>
          <div className="au-gallery-main" style={{ position: "relative", aspectRatio: "4 / 5", width: "100%" }}>
            <Image
              key={images[imgIndex]}
              src={images[imgIndex]}
              alt={`${lot.brand} ${lot.name} — visuel ${imgIndex + 1}`}
              fill
              sizes="(max-width: 760px) 100vw, 420px"
              priority
              className="au-fade-in"
              style={{ objectFit: "cover" }}
            />
            <div style={{ position: "absolute", top: 14, insetInlineStart: 14, display: "flex", gap: 6 }}>
              <StatusBadge status={status} />
            </div>
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 8, padding: 12, justifyContent: "center" }}>
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setImgIndex(i)}
                  aria-label={`Visuel ${i + 1}`}
                  aria-pressed={i === imgIndex}
                  style={{
                    position: "relative",
                    width: 56,
                    height: 70,
                    borderRadius: 10,
                    overflow: "hidden",
                    padding: 0,
                    border: i === imgIndex ? "2px solid var(--gold-400)" : "2px solid transparent",
                    opacity: i === imgIndex ? 1 : 0.6,
                    cursor: "pointer",
                    background: "var(--espresso-800)",
                  }}
                >
                  <Image src={src} alt="" fill sizes="56px" style={{ objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Contenu ── */}
        <div className="au-body" style={{ padding: "28px 28px 0", display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold-700)" }}>
            {lot.brand} · {lot.volume}
          </div>
          <h2 id="au-modal-title" style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(1.9rem, 3vw, 2.5rem)", lineHeight: 1.05, margin: "4px 0 10px", color: "var(--ink-900)" }}>
            {lot.name}
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: 14, lineHeight: 1.6, color: "var(--ink-500)", margin: "0 0 18px" }}>{lot.hook}</p>

          {/* Prix + chrono */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 16,
              padding: "16px 18px",
              borderRadius: 16,
              background: "var(--surface-cream)",
              border: "1px solid var(--line-200)",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-500)" }}>
                {ended ? (status === "won" ? "Remporté à" : "Adjugé à") : hasBids ? "Enchère actuelle" : "Mise à prix"}
              </div>
              <div key={price} className="au-pop" data-testid="au-price" style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 40, lineHeight: 1, color: "var(--ink-900)", fontVariantNumeric: "tabular-nums" }}>
                {fmtPrice(price)}
              </div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-400)", marginTop: 4 }}>
                Prix boutique <s>{fmtPrice(lot.shopPrice)}</s> · {Math.round((1 - price / lot.shopPrice) * 100) > 0 ? `−${Math.round((1 - price / lot.shopPrice) * 100)} %` : "au prix boutique"}
              </div>
            </div>
            <div style={{ textAlign: "end" }}>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 4 }}>
                {ended ? "Clôturée" : "Se termine dans"}
              </div>
              <Countdown remainingMs={remainingMs} size="lg" />
            </div>
          </div>

          {/* État */}
          {status === "outbid" && (
            <Notice tone="amber">
              Quelqu&apos;un a surenchéri. <strong>Reprenez la main</strong> d&apos;un simple pas.
            </Notice>
          )}
          {status === "leading" && (
            <Notice tone="green">
              Vous menez{state.myMax !== null ? ` — enchère max ${fmtPrice(state.myMax)} en veille` : ""}. Restez dans les parages : la salle bouge.
            </Notice>
          )}
          {status === "won" && (
            <div style={{ marginTop: 14, padding: 18, borderRadius: 16, background: "var(--espresso-900)", color: "var(--on-dark-strong)" }}>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold-300)" }}>Félicitations</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 500, margin: "4px 0 10px" }}>
                Remporté à {fmtPrice(price)} <span style={{ color: "var(--on-dark-muted)", fontSize: 18 }}>au lieu de {fmtPrice(lot.shopPrice)}</span>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a
                  href={`${WHATSAPP_URL}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...btnBase, background: "var(--gold-500)", color: "var(--espresso-900)", textDecoration: "none" }}
                >
                  Finaliser sur WhatsApp
                </a>
                <Link href={`/produit/${lot.slug}`} style={{ ...btnBase, background: "transparent", color: "var(--on-dark-strong)", border: "1.5px solid var(--on-dark)", textDecoration: "none" }}>
                  Voir la fiche
                </Link>
              </div>
            </div>
          )}
          {status === "ended" && (
            <Notice tone="grey">
              Cette enchère est terminée. Le flacon reste disponible en boutique au prix de {fmtPrice(lot.shopPrice)}.
            </Notice>
          )}

          {/* ── Contrôle d'enchère (collant en bas sur mobile) ── */}
          {!ended && (
            <div className="au-bidbar" style={{ marginTop: 18, paddingBlock: 12, background: "var(--surface-page)" }}>
              <button
                type="button"
                onClick={() => bidBy(1)}
                data-testid="au-bid"
                className="au-bid-main"
                style={{
                  ...btnBase,
                  width: "100%",
                  padding: "16px 20px",
                  fontSize: 16,
                  background: status === "outbid" ? "#D98A1E" : "var(--gold-500)",
                  color: "var(--espresso-900)",
                  boxShadow: "0 10px 26px rgba(200,144,30,.35)",
                }}
              >
                {status === "outbid" ? "Reprendre la main" : "Enchérir"} · {fmtPrice(nextBid)}
                <span style={{ fontWeight: 400, opacity: 0.75, marginInlineStart: 6 }}>(+{fmtPrice(hasBids ? step : 0)})</span>
              </button>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                <button type="button" onClick={() => bidBy(2)} style={{ ...btnBase, ...btnGhost }}>
                  +2 pas · {fmtPrice(amountFor(2))}
                </button>
                <button type="button" onClick={() => bidBy(5)} style={{ ...btnBase, ...btnGhost }}>
                  +5 pas · {fmtPrice(amountFor(5))}
                </button>
              </div>
            </div>
          )}

          {/* Enchère max — hors de la barre collante : sur mobile elle doublait
              la hauteur de la barre et mangeait un tiers de l'écran. */}
          {!ended && (
            <div style={{ marginTop: 4 }}>
              <div>
                <label htmlFor="au-max" style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-500)", marginBottom: 6 }}>
                  Enchère max (optionnel) — on surenchérit pour vous d&apos;un pas à chaque relance, jamais au-delà de ce plafond.
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    id="au-max"
                    inputMode="decimal"
                    placeholder={`≥ ${fmtPrice(nextBid)}`}
                    value={maxDraft}
                    onChange={(e) => setMaxDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyMax()}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      padding: "11px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--line-300)",
                      background: "#fff",
                      fontFamily: "var(--font-sans)",
                      fontSize: 15,
                      color: "var(--ink-900)",
                    }}
                  />
                  <button type="button" onClick={applyMax} style={{ ...btnBase, background: "var(--espresso-900)", color: "var(--on-dark-strong)" }}>
                    {state.myMax !== null ? "Modifier" : "Fixer"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Actions secondaires */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            <button type="button" onClick={share} style={{ ...btnBase, ...btnGhost, padding: "9px 14px", fontSize: 13 }}>
              <IconShare /> Partager
            </button>
            {!ended && (
              <button type="button" onClick={remind} aria-pressed={state.reminder} style={{ ...btnBase, ...btnGhost, padding: "9px 14px", fontSize: 13, background: state.reminder ? "var(--gold-100)" : "transparent" }}>
                <IconBell /> {state.reminder ? "Rappel activé" : "Me prévenir"}
              </button>
            )}
            <Link href={`/produit/${lot.slug}`} style={{ ...btnBase, ...btnGhost, padding: "9px 14px", fontSize: 13, textDecoration: "none" }}>
              Voir la fiche
            </Link>
          </div>

          {/* Historique */}
          <section style={{ marginTop: 22 }}>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-500)", margin: "0 0 10px" }}>
              Dernières enchères
            </h3>
            {history.length === 0 ? (
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--ink-400)", margin: 0 }}>Personne n&apos;a encore enchéri — soyez le premier.</p>
            ) : (
              <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {history.map((b, i) => (
                  <li
                    key={`${b.at}-${b.amount}`}
                    className={i === 0 ? "au-fade-in" : undefined}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 12px",
                      borderRadius: 10,
                      background: b.mine ? "rgba(63,122,71,.08)" : "transparent",
                      borderBottom: "1px solid var(--line-100)",
                      fontFamily: "var(--font-sans)",
                      fontSize: 14,
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8, color: b.mine ? "#3F7A47" : "var(--ink-700)", fontWeight: b.mine ? 600 : 400 }}>
                      <span aria-hidden style={{ width: 26, height: 26, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: b.mine ? "#3F7A47" : "var(--surface-cream-2)", color: b.mine ? "#fff" : "var(--ink-500)" }}>
                        {b.bidder.slice(0, 1).toUpperCase()}
                      </span>
                      {b.mine ? (b.auto ? "Vous (enchère max)" : "Vous") : b.bidder}
                    </span>
                    <span style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                      <span style={{ color: "var(--ink-400)", fontSize: 12 }}>{fmtAgo(b.at, now)}</span>
                      <strong style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink-900)" }}>{fmtPrice(b.amount)}</strong>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Règles */}
          <details style={{ margin: "18px 0 24px", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-700)" }}>
            <summary style={{ cursor: "pointer", fontWeight: 600, color: "var(--ink-900)", listStyle: "none", display: "flex", alignItems: "center", gap: 8 }}>
              <span aria-hidden style={{ color: "var(--gold-500)" }}>✦</span> Comment ça marche
            </summary>
            <AuctionRules />
          </details>
        </div>
      </div>
    </div>
  );
}

/** Les six règles — partagées entre le panneau et le bas de page. */
export function AuctionRules() {
  return (
    <ol style={{ margin: "10px 0 0", paddingInlineStart: 18, lineHeight: 1.6, display: "grid", gap: 6 }}>
      <li>
        <strong>Pas d&apos;enchère</strong> : 1 € sous 30 €, 2 € jusqu&apos;à 60 €, 5 € au-delà — il suit le prix courant.
      </li>
      <li>
        <strong>Prolongation</strong> : une enchère dans les {SNIPE_WINDOW_MS / 60000} dernières minutes rallonge de {SNIPE_EXTEND_MS / 60000} minutes. Personne ne gagne à la dernière seconde.
      </li>
      <li>
        <strong>Enchère max</strong> : fixez votre plafond, le système surenchérit pour vous d&apos;un pas à chaque relance, jamais au-delà.
      </li>
      <li>
        <strong>Paiement</strong> : à la clôture, le gagnant finalise par WhatsApp ou par le lien envoyé — rien n&apos;est débité avant.
      </li>
      <li>
        <strong>Authenticité garantie</strong> : les flacons sont ceux de la boutique, neufs, scellés, sourcés au Golfe.
      </li>
      <li>
        <strong>Démonstration</strong> : cette salle est une maquette. Les autres enchérisseurs sont simulés et ne relancent jamais au-delà de {MAX_DEMO_RATIO.toLocaleString("fr-FR")} × le prix boutique ; le rappel « Me prévenir » part {REMIND_BEFORE_MS / 60000} min avant la fin, onglet ouvert.
      </li>
    </ol>
  );
}

function Notice({ tone, children }: { tone: "amber" | "green" | "grey"; children: React.ReactNode }) {
  const palette = {
    amber: { bg: "rgba(217,138,30,.12)", border: "rgba(217,138,30,.45)", fg: "#7A4B05" },
    green: { bg: "rgba(63,122,71,.1)", border: "rgba(63,122,71,.4)", fg: "#2E5C35" },
    grey: { bg: "var(--surface-cream)", border: "var(--line-200)", fg: "var(--ink-500)" },
  }[tone];
  return (
    <p
      role="status"
      style={{
        marginTop: 14,
        marginBottom: 0,
        padding: "11px 14px",
        borderRadius: 12,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        color: palette.fg,
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        lineHeight: 1.5,
      }}
    >
      {children}
    </p>
  );
}

const btnBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "12px 18px",
  borderRadius: 999,
  border: "none",
  fontFamily: "var(--font-sans)",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "transform 120ms var(--ease-out), background 160ms ease",
};

const btnGhost: React.CSSProperties = {
  background: "transparent",
  color: "var(--ink-900)",
  border: "1.5px solid var(--line-300)",
};

function IconShare() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 9a6 6 0 0 1 12 0v4l2 3H4l2-3z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}
