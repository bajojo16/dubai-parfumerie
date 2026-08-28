"use client";

/**
 * Section « jumeau olfactif ».
 *
 * Le CHAMP DE RECHERCHE est le point d'entrée : on tape le parfum qu'on aime
 * (nom ou maison, accents et casse indifférents) et la section propose le
 * produit oriental au profil le plus proche, avec son niveau de proximité.
 * Les pastilles restent, mais comme suggestions — une poignée de références
 * très connues, celles dont la correspondance a été relue par l'équipe.
 *
 * Chargement différé obligatoire : la base des références (700+ parfums) et le
 * moteur d'appariement arrivent en `import()` dynamique au PREMIER usage du
 * champ, jamais au chargement de la page — même motif que `SearchOverlay` avec
 * `search-catalog`. Tant que le module n'est pas là, les pastilles suffisent :
 * elles s'appuient sur la prop `matches`, déjà dans le bundle.
 *
 * Cadre légal inchangé : usage nominatif des marques, texte seul, vocabulaire
 * « inspiré de » / « jumeau olfactif » — jamais « clone », « copie », « dupe ».
 *
 * RÈGLE D'AFFICHAGE, non négociable : on ne montre un jumeau QUE lorsque le
 * moteur en certifie un (`findTwin` rend `null` sinon — voir le seuil documenté
 * dans `olfactive-match.ts`). Aucun repli sur « le moins pire des 25 produits » :
 * c'est ce repli qui proposait Al Haramain Noora pour Coco Mademoiselle. Quand
 * il n'y a pas de jumeau, on l'annonce et on propose l'alerte e-mail.
 */

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { OlfactiveMatch } from "@/data/olfactive-twins";
import type { MatchStrength, TwinResult } from "@/data/olfactive-match";
import type { ReferencePerfume } from "@/data/reference-perfumes";
import { addItem } from "@/lib/cart";

/** Module chargé à la première interaction avec le champ — pas avant. */
type MatchModule = typeof import("@/data/olfactive-match");

const C = {
  stage: "#FAF6EE",
  border: "#E6DCC8",
  pillBorder: "#E6DCC8",
  pillText: "#5A4A2E",
  pillSelBg: "#3A2C14",
  pillSelText: "#F3E6CF",
  gold: "#C9A24A",
  goldDark: "#8A6A1E",
  goldCta: "#C4A24F",
  ink: "#2C2620",
  muted: "#6A655D",
  goldLabel: "#A8801F",
  legal: "#9A8A6A",
  searchBorder: "#E0CFA8",
  searchIcon: "#A8915F",
  tagBg: "rgba(201,162,74,.16)",
  tagBorder: "#E0CFA8",
  optionHover: "#FBF7EE",
};

/** Nombre de propositions d'autocomplétion — au-delà, la liste ne se lit plus. */
const MAX_SUGGESTIONS = 8;

/** Validation de format côté client — même expression que la newsletter. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Demandes d'alerte « prévenez-moi », conservées dans le navigateur.
 * Convention de nommage du repo : préfixe `dp_` (cf. `dp_wishlist`,
 * `dp_recherches`, `dp_ondemand`).
 */
const ALERTS_KEY = "dp_alertes_jumeau";

/** Au-delà, une maquette n'a aucune raison de faire grossir le stockage local. */
const MAX_ALERTS = 50;

type TwinAlert = { email: string; reference: string; at: string };

/**
 * Mémorise la demande côté navigateur. Ce n'est PAS un envoi : rien ne part, et
 * c'est volontaire — la trace locale permet de montrer la demande en démo sans
 * faire croire qu'un e-mail a été expédié.
 */
function rememberAlert(email: string, reference: string) {
  try {
    const raw = window.localStorage.getItem(ALERTS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const list: TwinAlert[] = Array.isArray(parsed) ? (parsed as TwinAlert[]) : [];
    list.push({ email, reference, at: new Date().toISOString() });
    window.localStorage.setItem(ALERTS_KEY, JSON.stringify(list.slice(-MAX_ALERTS)));
  } catch {
    // Navigation privée, quota plein, stockage refusé : la confirmation reste
    // affichée. Perdre la trace locale ne doit pas casser l'écran.
  }
}

/**
 * Vue unifiée du résultat : une correspondance relue par l'équipe et un
 * appariement calculé n'ont pas la même forme, l'affichage n'a pas à le savoir.
 */
type ResultView = {
  /** clé stable — sert d'identifiant panier et de clé React */
  key: string;
  /** parfum de référence, en toutes lettres (usage nominatif) */
  targetName: string;
  /** famille commune aux deux profils */
  familyLabel: string;
  description: string;
  strength: MatchStrength;
  /** notes de la référence réellement retrouvées dans le produit */
  sharedAccords: string[];
  product: { name: string; brand: string; price: number; image: string; href: string };
};

function viewFromCurated(m: OlfactiveMatch): ResultView {
  return {
    key: m.key,
    targetName: m.targetName,
    familyLabel: m.family,
    description: m.description,
    // Relue et validée par l'équipe : c'est le plus haut niveau de proximité.
    strength: "tres-proche",
    sharedAccords: [],
    product: m.product,
  };
}

function viewFromTwin(t: TwinResult): ResultView {
  return {
    key: t.reference.id,
    targetName: `${t.reference.house} · ${t.reference.name}`,
    familyLabel: t.catalogFamilyLabel,
    description: t.curated?.description || t.product.description || t.catalogFamilyText,
    strength: t.strength,
    sharedAccords: t.sharedAccords,
    product: {
      name: t.product.name,
      brand: t.product.brand,
      price: t.product.price ?? 0,
      image: t.product.image || "/assets/prod-1.jpg",
      href: t.product.href,
    },
  };
}

export function OlfactiveTwin({
  matches,
  locale = "fr",
  variant = "full",
}: {
  matches: OlfactiveMatch[];
  locale?: string;
  variant?: "full" | "compact";
}) {
  const t = useTranslations("olfactiveTwin");
  const isRTL = locale === "ar";
  const compact = variant === "compact";
  const listId = useId();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [mod, setMod] = useState<MatchModule | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ResultView | null>(() => (matches[0] ? viewFromCurated(matches[0]) : null));
  const [addedKey, setAddedKey] = useState("");

  // Référence choisie pour laquelle nous n'avons PAS de jumeau. Un état à part
  // de `view` : les deux ne coexistent jamais, mais confondre les deux ferait
  // réapparaître un vieux résultat derrière l'écran « pas encore de jumeau ».
  const [missing, setMissing] = useState("");
  const [alertEmail, setAlertEmail] = useState("");
  const [alertError, setAlertError] = useState("");
  const [alertSent, setAlertSent] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // ── Chargement différé, au premier usage du champ ──────────────────────────
  // Déclenché par le focus autant que par la frappe : le temps de lire le
  // placeholder, le module est là et la première lettre répond déjà.
  const loadModule = useCallback(() => {
    if (mod || loading) return;
    setLoading(true);
    import("@/data/olfactive-match")
      .then((m) => setMod(m))
      .finally(() => setLoading(false));
  }, [mod, loading]);

  // ── Propositions ───────────────────────────────────────────────────────────
  const suggestions: ReferencePerfume[] = useMemo(() => {
    if (!mod || query.trim().length < 2) return [];
    return mod.searchReferences(query, MAX_SUGGESTIONS);
  }, [mod, query]);

  // Index effectivement mis en avant : la liste peut rétrécir entre deux
  // frappes, l'index stocké ne doit jamais pointer hors de la liste rendue.
  const hi = suggestions.length ? Math.min(highlight, suggestions.length - 1) : 0;

  // Clic à l'extérieur : on referme la liste sans toucher au résultat affiché.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const choose = useCallback(
    (ref: ReferencePerfume) => {
      // `findTwin` rend `null` dès que la correspondance n'est pas certaine.
      // On l'assume : mieux vaut annoncer l'absence que servir un à-peu-près.
      const twin = mod?.findTwin(ref) ?? null;
      if (twin) {
        setView(viewFromTwin(twin));
        setMissing("");
      } else {
        setView(null);
        setMissing(`${ref.house} · ${ref.name}`);
      }
      // Nouvelle référence demandée : le formulaire d'alerte repart à zéro,
      // sinon la confirmation de la demande précédente resterait à l'écran.
      // Fait ici et non dans un effet : `react-hooks/set-state-in-effect`.
      setAlertSent(false);
      setAlertError("");
      // On ne remet que le nom : réouvrir le champ propose de nouveau les
      // déclinaisons de la même référence (Sauvage, Sauvage Elixir…).
      setQuery(ref.name);
      setOpen(false);
      inputRef.current?.blur();
    },
    [mod]
  );

  const submitAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const value = alertEmail.trim();
    if (!EMAIL_RE.test(value)) {
      setAlertError(t("alert_invalid"));
      return;
    }
    setAlertError("");
    // STUB — aucune API réelle, rien n'est envoyé. L'endpoint d'alerte reste à
    // brancher (même convention que la newsletter : Brevo/Mailchimp/Klaviyo…).
    rememberAlert(value, missing);
    setAlertSent(true);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || suggestions.length === 0) {
      // Flèche bas sur un champ fermé : on rouvre la liste si elle a du contenu.
      if (e.key === "ArrowDown" && suggestions.length > 0) setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const ref = suggestions[hi];
      if (ref) choose(ref);
    }
  };

  const fmt = (n: number) => {
    try {
      return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
    } catch {
      return `${Math.round(n)} €`;
    }
  };

  /**
   * Les trois libellés existent encore parce que `MatchStrength` a trois valeurs,
   * mais seul « très proche » est atteignable à l'écran : un résultat servi est
   * toujours certifié, et le moteur force alors ce niveau. Ne PAS rebrancher
   * « proche » / « apparenté » sur un résultat affiché — c'est le badge
   * « Profil proche » posé sur un non-jumeau qui a motivé cette correction.
   */
  const strengthLabel: Record<MatchStrength, string> = {
    "tres-proche": t("strength_very_close"),
    proche: t("strength_close"),
    apparente: t("strength_related"),
  };

  const listOpen = open && (suggestions.length > 0 || (loading && query.trim().length >= 2));

  // ── Blocs ──────────────────────────────────────────────────────────────────

  const introEl = (
    <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: C.muted, margin: "0 0 16px" }}>{t("intro")}</p>
  );

  const hookEl = (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <span
        className="otwin-q"
        aria-hidden
        style={{
          flexShrink: 0,
          width: 42,
          height: 42,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          background: C.tagBg,
          border: `1.5px solid ${C.gold}`,
          color: C.goldLabel,
          fontFamily: "var(--font-display)",
          fontSize: 26,
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        ?
      </span>
      <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 13.5, color: C.ink, lineHeight: 1.4 }}>
        {t("intro")}
      </p>
    </div>
  );

  // Champ de recherche + liste d'autocomplétion (combobox accessible)
  const searchEl = (
    <div ref={boxRef} className="otw-combo" style={{ marginBottom: compact ? 10 : 16 }}>
      <div
        className="otw-field"
        style={{
          display: "flex",
          alignItems: "center",
          gap: compact ? 8 : 10,
          background: "#fff",
          border: `1px solid ${C.searchBorder}`,
          borderRadius: 999,
          padding: compact ? "8px 14px" : "12px 18px",
        }}
      >
        <svg
          width={compact ? 15 : 18}
          height={compact ? 15 : 18}
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.searchIcon}
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
          style={{ flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={listOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={listOpen && suggestions[hi] ? `${listId}-${hi}` : undefined}
          aria-label={t("search_label")}
          autoComplete="off"
          value={query}
          onFocus={() => {
            loadModule();
            setOpen(true);
          }}
          onChange={(e) => {
            loadModule();
            setQuery(e.target.value);
            setHighlight(0);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder={t("search_placeholder")}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "var(--font-sans)",
            fontSize: compact ? 13 : 14,
            color: C.ink,
          }}
        />
      </div>

      {listOpen && (
        <ul id={listId} role="listbox" aria-label={t("search_label")} className="otw-list">
          {suggestions.length === 0 && loading && (
            <li className="otw-empty" role="presentation">
              {t("loading")}
            </li>
          )}
          {suggestions.map((ref, i) => (
            <li
              key={ref.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === hi}
              className={i === hi ? "otw-option otw-option-on" : "otw-option"}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => {
                // mousedown plutôt que click : le blur du champ fermerait la
                // liste avant que le clic n'arrive.
                e.preventDefault();
                choose(ref);
              }}
            >
              <span className="otw-option-name">{ref.name}</span>
              <span className="otw-option-house">{ref.house}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Aucune réponse : on le dit, sans vider le résultat déjà affiché. */}
      {open && !loading && mod && query.trim().length >= 2 && suggestions.length === 0 && (
        <p className="otw-noresult">{t("no_result")}</p>
      )}
    </div>
  );

  // Pastilles = suggestions de parfums très connus (correspondances relues)
  const pillsEl = (
    <div className="otw-pills" role="group" aria-label={t("suggestions")}>
      {matches.map((m) => {
        const active = view?.key === m.key;
        return (
          <button
            key={m.key}
            type="button"
            aria-pressed={active}
            onClick={() => {
              // Paire relue à la main : c'est un jumeau certain, on efface
              // l'éventuel écran « pas encore de jumeau » affiché juste avant.
              setView(viewFromCurated(m));
              setMissing("");
              setAlertSent(false);
              setAlertError("");
              setOpen(false);
            }}
            className={active ? "otw-pill otw-pill-on" : "otw-pill"}
          >
            {m.targetName}
          </button>
        );
      })}
    </div>
  );

  /**
   * Écran « pas encore de jumeau ».
   *
   * C'est l'état MAJORITAIRE (le catalogue compte 25 produits pour 3 952
   * références) : il ne doit pas se lire comme une erreur mais comme une
   * promesse — d'où la même carte crème que le résultat, un titre en Cormorant
   * et un filet doré plutôt qu'un ton d'avertissement.
   */
  const missingEl = (
    <div className="otw-none">
      <span className="otw-none-mark" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.goldLabel} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l2.1 5.4L20 9.3l-4 4 1 5.7-5-2.8-5 2.8 1-5.7-4-4 5.9-.9z" />
        </svg>
      </span>
      <div className="otw-none-eyebrow">{t("no_twin_eyebrow")}</div>
      <h3 className="otw-none-title">{t("no_twin_title", { name: missing })}</h3>
      <p className="otw-none-text">{t("no_twin_text")}</p>

      {alertSent ? (
        <p className="otw-none-done" role="status">
          <span className="otw-none-check" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12.5l5 5L20 6.5" />
            </svg>
          </span>
          {t("alert_success", { name: missing })}
        </p>
      ) : (
        <form className="otw-none-form" onSubmit={submitAlert} noValidate>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-label={t("alert_label")}
            aria-invalid={Boolean(alertError)}
            placeholder={t("alert_placeholder")}
            value={alertEmail}
            onChange={(e) => {
              setAlertEmail(e.target.value);
              // L'erreur disparaît dès la correction : la laisser sous un champ
              // déjà corrigé donne l'impression que la saisie est refusée.
              if (alertError) setAlertError("");
            }}
            className="otw-none-input"
          />
          <button type="submit" className="otw-none-submit">
            {t("alert_submit")}
          </button>
        </form>
      )}

      {alertError && (
        <p className="otw-none-error" role="alert">
          {alertError}
        </p>
      )}
      {!alertSent && <p className="otw-none-micro">{t("alert_micro")}</p>}
    </div>
  );

  const resultEl = (
    <div aria-live="polite">
      {missing ? (
        missingEl
      ) : (
        view && (
        <div
          className="otw-card"
          style={{
            background: "#fff",
            border: `0.5px solid ${C.border}`,
            borderRadius: compact ? 12 : 14,
            padding: compact ? 12 : 18,
          }}
        >
          <div className="otw-row">
            {/* Vous aimez */}
            <div className="otw-target">
              <div className="otw-eyebrow">{t("you_like")}</div>
              <div className="otw-target-name">{view.targetName}</div>
            </div>

            {/* Flèche : sens de lecture, elle bascule à la verticale en mobile */}
            <svg
              className={isRTL ? "otw-arrow otw-arrow-rtl" : "otw-arrow"}
              width={compact ? 26 : 34}
              height={compact ? 18 : 22}
              viewBox="0 0 34 22"
              fill="none"
              stroke={C.gold}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M2 7h22" />
              <path d="M18 2l7 5-7 5" />
              <path d="M2 15h26" />
              <path d="M22 10l7 5-7 5" />
            </svg>

            {/* Le jumeau oriental */}
            <div className="otw-twin">
              <div className="otw-thumb">
                <Image src={view.product.image} alt={view.product.name} fill sizes="84px" style={{ objectFit: "cover" }} />
              </div>
              <div className="otw-twin-text">
                <div className="otw-eyebrow otw-eyebrow-gold">{t("the_twin")}</div>
                <div className="otw-twin-name">
                  {view.product.brand} · {view.product.name}
                </div>
                <div className="otw-meta">
                  <span className="otw-price">{t("from_price", { price: fmt(view.product.price) })}</span>
                  <span className="otw-tag">{view.familyLabel}</span>
                  <span className={`otw-strength otw-strength-${view.strength}`}>{strengthLabel[view.strength]}</span>
                </div>
              </div>
            </div>

            {compact && (
              <div className="otw-actions">
                <button
                  type="button"
                  className="otw-add"
                  onClick={() => {
                    addItem({
                      id: view.key,
                      name: view.product.name,
                      brand: view.product.brand,
                      price: view.product.price,
                      image: view.product.image,
                    });
                    setAddedKey(view.key);
                  }}
                >
                  {addedKey === view.key ? t("added") : t("add_to_cart")}
                </button>
              </div>
            )}
          </div>

          {/* Description + accords partagés + accès à la fiche */}
          <div className="otw-foot" style={{ borderTop: `1px solid ${C.border}` }}>
            <div className="otw-foot-text">
              <p className="otw-desc">{view.description}</p>
              {view.sharedAccords.length > 0 && (
                <p className="otw-accords">
                  {t("shared_accords")} · {view.sharedAccords.join(" · ")}
                </p>
              )}
            </div>
            <Link href={view.product.href} className="otw-cta">
              {t("see_product")} →
            </Link>
          </div>
        </div>
        )
      )}
    </div>
  );

  const legalEl = (
    <div style={{ display: "flex", alignItems: "flex-start", gap: compact ? 6 : 8, marginTop: compact ? 10 : 16 }}>
      <svg
        width={compact ? 12 : 15}
        height={compact ? 12 : 15}
        viewBox="0 0 24 24"
        fill="none"
        stroke={C.legal}
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
        style={{ flexShrink: 0, marginTop: 1 }}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: compact ? 10 : 11.5, color: C.legal, margin: 0, lineHeight: 1.4 }}>
        {t("legal")}
      </p>
    </div>
  );

  /**
   * Styles scoped. Un seul bloc pour les deux variants : le mobile était cassé
   * parce que la carte de résultat était une rangée `nowrap` figée — à 390 px
   * elle débordait, le nom du jumeau se cassait mot à mot et les boutons
   * sortaient du cadre. Tout est désormais en `min-width: 0` + passage en
   * colonne au seuil mobile du repo (760 px).
   *
   * ATTENTION : aucun backtick dans ce bloc, il vit dans un template literal.
   */
  const css = `
    @keyframes otwin-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(201,162,74,.45); } 50% { box-shadow: 0 0 0 7px rgba(201,162,74,0); } }
    .otwin-root { box-sizing: border-box; max-width: 100%; }
    .otwin-root *, .otwin-root *::before, .otwin-root *::after { box-sizing: border-box; }
    .otwin-q { animation: otwin-pulse 2.4s ease-in-out infinite; }
    .otwin-grid { display: grid; grid-template-columns: minmax(0, 45fr) minmax(0, 55fr); gap: 18px; align-items: start; }
    .otwin-grid > * { min-width: 0; }

    .otw-combo { position: relative; }
    .otw-list { position: absolute; z-index: 30; top: calc(100% + 6px); left: 0; right: 0; margin: 0; padding: 6px; list-style: none;
      background: #fff; border: 1px solid ${C.searchBorder}; border-radius: 14px; box-shadow: 0 12px 30px rgba(58,44,20,.14);
      max-height: 300px; overflow-y: auto; }
    .otw-option { display: flex; align-items: baseline; gap: 8px; padding: 8px 10px; border-radius: 10px; cursor: pointer;
      font-family: var(--font-sans); font-size: 13.5px; color: ${C.ink}; }
    .otw-option-on { background: ${C.optionHover}; }
    .otw-option-name { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .otw-option-house { flex: 0 0 auto; font-size: 11px; letter-spacing: .3px; text-transform: uppercase; color: ${C.goldLabel}; }
    .otw-empty { padding: 10px; font-family: var(--font-sans); font-size: 13px; color: ${C.muted}; }
    .otw-noresult { margin: 8px 2px 0; font-family: var(--font-sans); font-size: 12.5px; color: ${C.muted}; }

    .otw-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .otw-pill { font-family: var(--font-sans); font-size: 12.5px; cursor: pointer; padding: 6px 12px; border-radius: 999px;
      border: 1px solid ${C.pillBorder}; background: #fff; color: ${C.pillText}; transition: border-color .2s, background .2s;
      max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .otw-pill:hover { border-color: ${C.gold}; background: ${C.optionHover}; }
    .otw-pill-on { border-color: ${C.pillSelBg}; background: ${C.pillSelBg}; color: ${C.pillSelText}; }
    .otw-pill-on:hover { background: ${C.pillSelBg}; border-color: ${C.pillSelBg}; }

    .otw-card { max-width: 100%; overflow: hidden; }
    .otw-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .otw-row > * { min-width: 0; }
    .otw-target { flex: 1 1 150px; min-width: 0; }
    .otw-eyebrow { font-family: var(--font-sans); font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: ${C.muted}; margin-bottom: 2px; }
    .otw-eyebrow-gold { color: ${C.goldLabel}; }
    .otw-target-name { font-family: var(--font-display); font-size: 17px; color: ${C.muted}; line-height: 1.15; overflow-wrap: anywhere; }
    .otw-arrow { flex: 0 0 auto; }
    /* Sens de lecture inverse en arabe — en classe, pas en style inline : la
       media query mobile doit pouvoir la faire pivoter, ce qu'un style inline
       empecherait (il l'emporte sur la feuille de styles). */
    .otw-arrow-rtl { transform: scaleX(-1); }
    .otw-twin { display: flex; align-items: center; gap: 12px; flex: 2 1 240px; min-width: 0; }
    .otw-thumb { position: relative; width: 72px; height: 72px; flex: 0 0 auto; border-radius: 10px; overflow: hidden; background: #F7F3EE; }
    .otw-twin-text { min-width: 0; flex: 1 1 auto; }
    .otw-twin-name { font-family: var(--font-display); font-size: 17px; color: ${C.ink}; line-height: 1.15; overflow-wrap: anywhere; }
    .otw-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
    .otw-price { font-family: var(--font-sans); font-size: 13px; color: ${C.goldLabel}; }
    .otw-tag { font-family: var(--font-sans); font-size: 10.5px; color: ${C.goldDark}; background: ${C.tagBg};
      border: 1px solid ${C.tagBorder}; border-radius: 20px; padding: 2px 8px; }
    .otw-strength { font-family: var(--font-sans); font-size: 10.5px; border-radius: 20px; padding: 2px 8px; border: 1px solid transparent; }
    .otw-strength-tres-proche { background: ${C.pillSelBg}; color: ${C.pillSelText}; }
    .otw-strength-proche { background: transparent; color: ${C.goldDark}; border-color: ${C.goldCta}; }
    .otw-strength-apparente { background: transparent; color: ${C.muted}; border-color: ${C.border}; }

    .otw-actions { margin-inline-start: auto; flex: 0 0 auto; }
    .otw-add { border: none; cursor: pointer; border-radius: 999px; padding: 8px 14px; font-family: var(--font-sans);
      font-size: 10.5px; font-weight: 600; letter-spacing: .4px; text-transform: uppercase; color: #fff; background: ${C.goldCta}; }
    .otw-add:hover { background: ${C.goldDark}; }

    .otw-foot { margin-top: 12px; padding-top: 12px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .otw-foot-text { flex: 1 1 220px; min-width: 0; }
    .otw-desc { font-family: var(--font-sans); font-size: 12px; color: ${C.muted}; margin: 0; line-height: 1.5; }
    .otw-accords { font-family: var(--font-sans); font-size: 11px; color: ${C.goldLabel}; margin: 4px 0 0; line-height: 1.4; overflow-wrap: anywhere; }
    .otw-cta { flex: 0 0 auto; display: inline-block; text-align: center; text-decoration: none; background: ${C.goldCta}; color: #fff;
      font-family: var(--font-sans); font-size: 11px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;
      border-radius: 999px; padding: 10px 18px; }
    .otw-cta:hover { background: ${C.goldDark}; }

    /* ── Ecran « pas encore de jumeau » ─────────────────────────────────────
       Meme carte creme que le resultat, filet dore, titre en Cormorant : cet
       ecran est majoritaire, il doit se lire comme une promesse et non comme
       une erreur. Aucun rouge, aucune icone d'alerte. */
    .otw-none { background: #fff; border: 1px solid ${C.searchBorder}; border-radius: 14px; padding: 20px 18px;
      box-shadow: 0 10px 26px rgba(58,44,20,.07); text-align: center; max-width: 100%; overflow: hidden; }
    .otw-none-mark { display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 50%;
      background: ${C.tagBg}; border: 1px solid ${C.tagBorder}; margin-bottom: 10px; }
    .otw-none-eyebrow { font-family: var(--font-sans); font-size: 10px; letter-spacing: 1.4px; text-transform: uppercase;
      color: ${C.goldLabel}; margin-bottom: 6px; }
    .otw-none-title { font-family: var(--font-display); font-size: 22px; font-weight: 500; line-height: 1.2;
      color: ${C.ink}; margin: 0 0 8px; overflow-wrap: anywhere; }
    .otw-none-text { font-family: var(--font-sans); font-size: 12.5px; line-height: 1.55; color: ${C.muted};
      margin: 0 auto 14px; max-width: 44ch; }
    .otw-none-form { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin: 0 auto; max-width: 420px; }
    .otw-none-input { flex: 1 1 200px; min-width: 0; border: 1px solid ${C.searchBorder}; border-radius: 999px;
      padding: 11px 16px; font-family: var(--font-sans); font-size: 13px; color: ${C.ink}; background: ${C.stage};
      outline: none; transition: border-color .2s, background .2s; }
    .otw-none-input::placeholder { color: ${C.legal}; }
    .otw-none-input:focus { border-color: ${C.gold}; background: #fff; }
    .otw-none-submit { flex: 0 0 auto; border: none; cursor: pointer; border-radius: 999px; padding: 11px 20px;
      font-family: var(--font-sans); font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
      color: #fff; background: ${C.goldCta}; transition: background .2s; }
    .otw-none-submit:hover { background: ${C.goldDark}; }
    .otw-none-error { font-family: var(--font-sans); font-size: 11.5px; color: ${C.goldDark}; margin: 8px 0 0; }
    .otw-none-micro { font-family: var(--font-sans); font-size: 10.5px; color: ${C.legal}; margin: 10px 0 0; }
    .otw-none-done { display: inline-flex; align-items: center; gap: 8px; text-align: start; margin: 0 auto;
      font-family: var(--font-sans); font-size: 12.5px; line-height: 1.5; color: ${C.ink};
      background: ${C.tagBg}; border: 1px solid ${C.tagBorder}; border-radius: 14px; padding: 10px 14px; max-width: 44ch; }
    .otw-none-check { flex: 0 0 auto; display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%;
      background: ${C.goldCta}; }

    @media (max-width: 760px) {
      .otwin-grid { grid-template-columns: 1fr; }
      .otw-none { padding: 16px 14px; }
      .otw-none-title { font-size: 19px; }
      .otw-none-form { max-width: none; }
      .otw-none-input, .otw-none-submit { flex: 1 1 100%; width: 100%; }
      .otw-row { flex-direction: column; align-items: stretch; gap: 10px; }
      .otw-arrow, .otw-arrow-rtl { align-self: center; transform: rotate(90deg); }
      .otw-twin { flex: 1 1 auto; }
      .otw-thumb { width: 64px; height: 64px; }
      .otw-actions { margin-inline-start: 0; width: 100%; }
      .otw-add { width: 100%; }
      .otw-foot { flex-direction: column; align-items: stretch; }
      .otw-cta { width: 100%; }
      .otw-target-name, .otw-twin-name { font-size: 16px; }
    }
    @media (prefers-reduced-motion: reduce) { .otwin-q { animation: none; } }
  `;

  return (
    <div
      className="otwin-root"
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        background: C.stage,
        border: `0.5px solid ${C.border}`,
        borderRadius: compact ? 14 : 16,
        padding: compact ? 14 : 22,
        textAlign: isRTL ? "right" : "left",
      }}
    >
      <style>{css}</style>
      {compact ? (
        <>
          {hookEl}
          <div className="otwin-grid">
            {/* Colonne gauche : le champ d'abord, les suggestions ensuite */}
            <div>
              {searchEl}
              {pillsEl}
            </div>
            {/* Colonne droite : carte résultat + mention légale */}
            <div>
              {resultEl}
              {legalEl}
            </div>
          </div>
        </>
      ) : (
        <>
          {introEl}
          {searchEl}
          {pillsEl}
          {resultEl}
          {legalEl}
        </>
      )}
    </div>
  );
}
