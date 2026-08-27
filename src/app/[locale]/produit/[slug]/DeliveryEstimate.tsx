"use client";

import { useEffect, useId, useState } from "react";
import { CARRIERS, FREE_SHIPPING_THRESHOLD_EUR, type Carrier } from "@/data/carriers";

/**
 * Estimateur de livraison de la fiche produit.
 *
 * Composant client — et pas seulement parce qu'il porte un `<select>` : la date
 * annoncée dépend de « maintenant ». Un rendu serveur fait à 15 h 59 et une
 * hydratation faite à 16 h 00 ne donneraient pas la même phrase, et React
 * signalerait la divergence. On ne lit donc jamais l'horloge pendant le rendu :
 * le premier rendu (serveur ET client) affiche un état d'attente neutre, et
 * l'heure n'est lue qu'après le montage. Mieux vaut une demi-seconde de « … »
 * qu'une date fausse figée dans le HTML.
 */

/** Heure limite : au-delà, la préparation bascule au jour ouvré suivant. */
const CUTOFF_HOUR = 16;

function isBusinessDay(d: Date): boolean {
  const day = d.getDay();
  return day !== 0 && day !== 6;
}

/** Le jour lui-même s'il est ouvré, sinon le premier jour ouvré qui suit. */
function onOrAfterBusinessDay(from: Date): Date {
  const d = new Date(from);
  while (!isBusinessDay(d)) d.setDate(d.getDate() + 1);
  return d;
}

/** `from` + `n` jours ouvrés (les samedis et dimanches ne comptent pas). */
function addBusinessDays(from: Date, n: number): Date {
  const d = new Date(from);
  let left = n;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (isBusinessDay(d)) left -= 1;
  }
  return d;
}

type Estimate = {
  /** Jour où la commande est préparée puis remise au transporteur. */
  prep: Date;
  /** Borne basse et borne haute de la fenêtre de livraison annoncée. */
  min: Date;
  max: Date;
  afterCutoff: boolean;
};

/**
 * Modèle retenu, volontairement simple et vérifiable :
 * la commande est préparée le premier jour ouvré disponible (le jour même si
 * elle tombe avant 16 h un jour ouvré, sinon le jour ouvré suivant), remise au
 * transporteur dans la foulée — c'est la promesse « expédié sous 24 h ouvrées »
 * affichée ailleurs sur le site — puis acheminée en `businessDays` jours ouvrés.
 * On annonce une fenêtre de deux jours plutôt qu'une date sèche : personne ne
 * tient un jour exact, et une fourchette se tient.
 */
function computeEstimate(now: Date, businessDays: number): Estimate {
  const afterCutoff = now.getHours() >= CUTOFF_HOUR;
  const start = new Date(now);
  if (afterCutoff) start.setDate(start.getDate() + 1);
  const prep = onOrAfterBusinessDay(start);
  const min = addBusinessDays(prep, businessDays);
  const max = addBusinessDays(min, 1);
  return { prep, min, max, afterCutoff };
}

/**
 * Les noms de jours et de mois viennent d'`Intl`, jamais d'une table en dur :
 * le site tourne en sept langues et `params.locale` décide laquelle. Une locale
 * inconnue ferait lever `Intl` — on retombe alors sur le français.
 */
function makeFormatter(locale: string): Intl.DateTimeFormat {
  const options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" };
  try {
    return new Intl.DateTimeFormat(locale, options);
  } catch {
    return new Intl.DateTimeFormat("fr", options);
  }
}

export default function DeliveryEstimate({ locale }: { locale: string }) {
  const [now, setNow] = useState<Date | null>(null);
  const [carrierId, setCarrierId] = useState<string>(CARRIERS[0].id);
  const selectId = useId();

  useEffect(() => {
    // `setState` synchrone dans un effet : refusé par la règle
    // `react-hooks/set-state-in-effect` de ce repo. On passe donc par une frame
    // d'animation — ce qui a aussi le mérite de placer la lecture de l'horloge
    // franchement après l'hydratation, hors de tout rendu comparé au serveur.
    const raf = requestAnimationFrame(() => setNow(new Date()));
    return () => cancelAnimationFrame(raf);
  }, []);

  const carrier: Carrier = CARRIERS.find((c) => c.id === carrierId) ?? CARRIERS[0];
  const estimate = now ? computeEstimate(now, carrier.businessDays) : null;
  const fmt = makeFormatter(locale);

  // Phrases composées en JS et non en JSX : JSX rogne les espaces en début de
  // ligne, et une phrase à rallonge coupée sur trois lignes perdait ses espaces
  // autour des expressions (« 2 joursouvrés », « 60€ »).
  const plural = carrier.businessDays > 1 ? "s" : "";
  const detail = estimate
    ? `Commande préparée le ${fmt.format(estimate.prep)}, remise à ${carrier.name} dans la journée, puis ` +
      `${carrier.businessDays} jour${plural} ouvré${plural} d'acheminement. ` +
      `Commandé après ${CUTOFF_HOUR} h : la préparation démarre demain.`
    : `Commandé après ${CUTOFF_HOUR} h : la préparation démarre demain. Week-ends non ouvrés.`;

  return (
    <section
      aria-labelledby={`${selectId}-title`}
      style={{
        background: "var(--surface-cream)",
        border: "1px solid var(--line-100)",
        borderRadius: "var(--r-lg)",
        padding: "1.125rem 1.25rem 1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.875rem",
      }}
    >
      {/* Titre + icône camion */}
      <h2
        id={`${selectId}-title`}
        style={{
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--t-xs)",
          fontWeight: "var(--fw-semibold)",
          letterSpacing: "var(--ls-wider)",
          textTransform: "uppercase",
          color: "var(--gold-700)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M3 7h11v9H3z" strokeLinejoin="round" />
          <path d="M14 10h3.5l3 3.2V16H14z" strokeLinejoin="round" />
          <circle cx="7" cy="17.5" r="1.8" />
          <circle cx="17.5" cy="17.5" r="1.8" />
        </svg>
        Quand serez-vous livré ?
      </h2>

      {/* Choix du transporteur */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <label
          htmlFor={selectId}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--t-xs)",
            letterSpacing: "var(--ls-wide)",
            textTransform: "uppercase",
            color: "var(--ink-400)",
          }}
        >
          Transporteur
        </label>
        <select
          id={selectId}
          className="dp-de-select"
          value={carrierId}
          onChange={(e) => setCarrierId(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            background: "var(--surface-white)",
            border: "1px solid var(--line-200)",
            borderRadius: "var(--r-md)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--t-sm)",
            color: "var(--ink-900)",
            cursor: "pointer",
            transition: "border-color var(--dur-fast) var(--ease-out)",
          }}
        >
          {CARRIERS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Fenêtre de livraison — la phrase que le client vient chercher */}
      <p
        aria-live="polite"
        style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: "var(--t-serif-lg)",
          lineHeight: "var(--lh-snug)",
          color: estimate ? "var(--ink-900)" : "var(--ink-400)",
        }}
      >
        {estimate ? (
          <>
            Livré entre{" "}
            <strong style={{ fontWeight: 600, color: "var(--gold-700)" }}>{fmt.format(estimate.min)}</strong> et{" "}
            <strong style={{ fontWeight: 600, color: "var(--gold-700)" }}>{fmt.format(estimate.max)}</strong>
          </>
        ) : (
          // Jamais de date provisoire : tant que l'heure n'est pas lue, on le dit.
          <span>Estimation de la date en cours…</span>
        )}
      </p>

      {/* Détail du parcours du colis */}
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-sans)",
          fontSize: "var(--t-xs)",
          lineHeight: "var(--lh-relaxed)",
          color: "var(--ink-500)",
        }}
      >
        {detail}
      </p>

      {/* Seuil de franco de port */}
      <p
        style={{
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--t-sm)",
          color: "var(--ink-700)",
          borderTop: "1px solid var(--line-100)",
          paddingTop: "0.75rem",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>
          <strong style={{ fontWeight: "var(--fw-semibold)" }}>Livraison offerte</strong>
          {` dès ${FREE_SHIPPING_THRESHOLD_EUR} € d'achat`}
        </span>
      </p>

      {/* Hover / focus : impossibles en style inline, d'où ce <style> local. */}
      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.dp-de-select:hover { border-color: var(--gold-300) !important; }
.dp-de-select:focus-visible { outline: 2px solid var(--gold-500); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .dp-de-select { transition: none !important; }
}
`;
