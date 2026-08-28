"use client";

/**
 * Commande à la demande — partie interactive.
 *
 * Pourquoi un composant client séparé de `page.tsx` : l'en-tête éditorial doit
 * être rendu par le serveur (SEO, et la page reste lisible avant que le
 * JavaScript arrive). Seul le sélecteur a besoin d'état, il est isolé ici.
 *
 * Chargement différé obligatoire : `reference-perfumes.ts` pèse 792 Ko et
 * `search-catalog.ts` agrège tout le catalogue produit. Ni l'un ni l'autre
 * n'est importé statiquement — un `import()` dynamique les récupère après le
 * montage, dans un chunk séparé (même motif que `OlfactiveTwin`). Tant qu'ils
 * ne sont pas là, la recherche et le filtre par maison sont déjà affichés :
 * la liste des maisons vient de `on-demand-catalog.ts`, qui ne contient que
 * des clés et pèse quelques kilo-octets.
 *
 * Cadre légal : maisons citées nominativement, texte seul, aucune photo de
 * produit. On commande des flacons authentiques — jamais « clone », « copie »,
 * « dupe » ou « équivalent ».
 */

import Image from "next/image";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import type { ReferencePerfume } from "@/data/reference-perfumes";
import { ON_DEMAND_HOUSES, selectOnDemand } from "@/data/on-demand-catalog";
import { CONTACT_EMAIL, WHATSAPP_URL } from "@/lib/contact";

/** Clé de persistance de la liste en cours. */
const STORAGE_KEY = "dp_ondemand";

/** Nombre de cartes rendues d'un coup — au-delà, un bouton « afficher plus ». */
const PAGE_SIZE = 48;

/** Suggestions affichées sous le champ de recherche. */
const MAX_SUGGESTIONS = 8;

/**
 * Budget d'encodage des liens.
 *
 * Un lien wa.me au-delà de ~2000 caractères est refusé par plusieurs
 * navigateurs et tronqué par WhatsApp : on plafonne le texte ENCODÉ à 1800,
 * ce qui laisse la place au préfixe de l'URL. Le client de messagerie tolère
 * beaucoup plus, d'où un budget bien plus large pour le `mailto:`.
 */
const WHATSAPP_ENCODED_BUDGET = 1800;
const MAILTO_ENCODED_BUDGET = 6000;

/** Une entrée de la base, enrichie de ses clés de recherche et de son logo. */
type Entry = ReferencePerfume & {
  /** nom + maison normalisés, calculés une fois au chargement */
  searchKey: string;
  /** logo de la maison quand le repo en possède un, sinon monogramme */
  logo?: string;
};

/** Le catalogue et l'outil de normalisation arrivent ensemble, ou pas du tout. */
type Catalog = {
  entries: Entry[];
  norm: (text: string | undefined | null) => string;
};

/** Une ligne de la liste : un identifiant et une quantité. */
type Line = { id: string; qty: number };

// ── Persistance ──────────────────────────────────────────────────────────────
// La liste survit à un rechargement : c'est une commande en cours de rédaction,
// la perdre parce qu'on est allé vérifier un nom ailleurs serait pénible.

function readStoredLines(): Line[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((l): l is Line => !!l && typeof l.id === "string" && typeof l.qty === "number")
      .map((l) => ({ id: l.id, qty: Math.min(99, Math.max(1, Math.round(l.qty))) }));
  } catch {
    return [];
  }
}

function writeStoredLines(lines: Line[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* quota plein ou stockage refusé : la liste reste utilisable en mémoire */
  }
}

// ── Monogramme ───────────────────────────────────────────────────────────────

/** Initiales de la maison, pour les maisons dont le repo n'a pas le logo. */
function monogram(house: string): string {
  const words = house.split(/\s+/).filter((w) => w.length > 2 || /^[A-Z]/.test(w));
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return house.slice(0, 2).toUpperCase();
}

// ── Construction des messages ────────────────────────────────────────────────

/**
 * Assemble le message en respectant un budget de caractères ENCODÉS.
 *
 * Une liste longue produit une URL que le navigateur ou WhatsApp coupe en
 * silence : on préfère retirer les dernières lignes nous-mêmes, le dire dans le
 * message ET le dire à l'écran. Un lien mort serait pire qu'une liste partielle.
 */
function fitMessage(header: string, rows: string[], footer: string, maxEncoded: number) {
  const compose = (kept: number) => {
    const omitted = rows.length - kept;
    const body = rows.slice(0, kept).join("\n");
    const tail =
      omitted > 0
        ? "\n(+ " + omitted + " autre" + (omitted > 1 ? "s" : "") + " référence" + (omitted > 1 ? "s" : "") + " que ce lien ne peut pas transporter — je vous les envoie juste après.)"
        : "";
    return header + "\n\n" + body + tail + "\n\n" + footer;
  };

  const fits = (kept: number) => encodeURIComponent(compose(kept)).length <= maxEncoded;

  // Recherche dichotomique : le message grandit de façon monotone avec le
  // nombre de lignes gardées. Une décroissance ligne à ligne encoderait la
  // liste entière des centaines de fois à chaque ajout.
  if (fits(rows.length)) return { text: compose(rows.length), omitted: 0 };
  let low = 0;
  let high = rows.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (fits(mid)) low = mid;
    else high = mid - 1;
  }
  return { text: compose(low), omitted: rows.length - low };
}

// ── Composant ────────────────────────────────────────────────────────────────

export function OnDemandClient() {
  const uid = useId();
  const listboxId = uid + "-listbox";

  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [failed, setFailed] = useState(false);

  const [lines, setLines] = useState<Line[]>([]);
  const hydrated = useRef(false);

  const [query, setQuery] = useState("");
  const [house, setHouse] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);

  const boxRef = useRef<HTMLDivElement>(null);

  // ── Chargement différé de la base ──────────────────────────────────────────
  // Les deux modules partent ensemble : `norm` et `brandLogo` sont inutiles
  // sans les données, les données inexploitables sans eux.
  useEffect(() => {
    let alive = true;
    Promise.all([import("@/data/reference-perfumes"), import("@/data/search-catalog")])
      .then(([base, search]) => {
        if (!alive) return;
        const entries: Entry[] = selectOnDemand(base.REFERENCE_PERFUMES).map((p) => ({
          ...p,
          searchKey: search.norm(p.name + " " + p.house),
          logo: search.brandLogo(p.house),
        }));
        entries.sort((a, b) => a.house.localeCompare(b.house, "fr") || a.name.localeCompare(b.name, "fr"));
        setCatalog({ entries, norm: search.norm });
        // La liste enregistrée n'a de sens qu'une fois les identifiants
        // résolvables en noms : on la relit dans le même passage.
        setLines(readStoredLines());
        hydrated.current = true;
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Enregistrement : jamais avant la relecture, sinon on écraserait la liste
  // stockée par le tableau vide du premier rendu.
  useEffect(() => {
    if (hydrated.current) writeStoredLines(lines);
  }, [lines]);

  // Clic à l'extérieur : referme la liste de suggestions sans rien changer.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // ── Dérivations ────────────────────────────────────────────────────────────

  const byId = useMemo(() => {
    const map = new Map<string, Entry>();
    for (const e of catalog?.entries || []) map.set(e.id, e);
    return map;
  }, [catalog]);

  const filtered = useMemo(() => {
    if (!catalog) return [];
    const key = catalog.norm(query);
    return catalog.entries.filter((e) => {
      if (house && e.house !== house) return false;
      return key.length < 2 || e.searchKey.includes(key);
    });
  }, [catalog, query, house]);

  const suggestions = useMemo(() => {
    if (!catalog || query.trim().length < 2) return [];
    return filtered.slice(0, MAX_SUGGESTIONS);
  }, [catalog, query, filtered]);

  const hi = suggestions.length ? Math.min(highlight, suggestions.length - 1) : 0;

  const selectedIds = useMemo(() => new Set(lines.map((l) => l.id)), [lines]);

  /** Les lignes résolues en entrées — une ligne orpheline est simplement ignorée. */
  const selected = useMemo(
    () =>
      lines
        .map((l) => ({ line: l, entry: byId.get(l.id) }))
        .filter((x): x is { line: Line; entry: Entry } => !!x.entry),
    [lines, byId],
  );

  const totalUnits = selected.reduce((n, s) => n + s.line.qty, 0);

  // ── Actions ────────────────────────────────────────────────────────────────

  const toggle = useCallback((id: string) => {
    setLines((prev) => (prev.some((l) => l.id === id) ? prev.filter((l) => l.id !== id) : [...prev, { id, qty: 1 }]));
  }, []);

  const changeQty = useCallback((id: string, delta: number) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, qty: Math.min(99, Math.max(1, l.qty + delta)) } : l)),
    );
  }, []);

  const onQuery = useCallback((value: string) => {
    setQuery(value);
    setVisible(PAGE_SIZE);
    setHighlight(0);
    setOpen(value.trim().length >= 2);
  }, []);

  const onHouse = useCallback((value: string) => {
    setHouse(value);
    setVisible(PAGE_SIZE);
    setOpen(false);
  }, []);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      toggle(suggestions[hi].id);
    }
  };

  // ── Liens d'envoi ──────────────────────────────────────────────────────────

  const rows = useMemo(
    () =>
      selected.map(
        (s, i) =>
          i + 1 + ". " + s.entry.name + " — " + s.entry.house + (s.line.qty > 1 ? " (x" + s.line.qty + ")" : ""),
      ),
    [selected],
  );

  const whatsapp = useMemo(() => {
    if (!rows.length) return null;
    const { text, omitted } = fitMessage(
      "Bonjour, je souhaite commander à la demande les références suivantes :",
      rows,
      "Merci de me confirmer la disponibilité, le prix et le délai.",
      WHATSAPP_ENCODED_BUDGET,
    );
    return { href: WHATSAPP_URL + "?text=" + encodeURIComponent(text), omitted };
  }, [rows]);

  const mail = useMemo(() => {
    if (!rows.length) return null;
    const { text, omitted } = fitMessage(
      "Bonjour,\n\nJe souhaite commander à la demande les références suivantes :",
      rows,
      "Merci de me confirmer la disponibilité, le prix et le délai.\n\nCordialement,",
      MAILTO_ENCODED_BUDGET,
    );
    const subject = "Commande à la demande — " + selected.length + " référence" + (selected.length > 1 ? "s" : "");
    return {
      href: "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text),
      omitted,
    };
  }, [rows, selected.length]);

  // ── Rendu ──────────────────────────────────────────────────────────────────

  const shown = filtered.slice(0, visible);

  return (
    <div className="dp-od-shell">
      {/* ── Colonne principale : recherche + grille ── */}
      <div className="dp-od-main">
        <div className="dp-od-tools">
          <div ref={boxRef} className="dp-od-searchbox">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--gold-700)"
              strokeWidth="1.7"
              aria-hidden
              className="dp-od-searchicon"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.6-3.6" />
            </svg>
            <input
              id={uid + "-input"}
              type="search"
              role="combobox"
              aria-expanded={open && suggestions.length > 0}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={open && suggestions.length ? uid + "-opt-" + hi : undefined}
              aria-label="Rechercher un parfum ou une maison"
              placeholder={catalog ? "Khamrah, Yara, Club de Nuit, Hawas…" : "Chargement du répertoire…"}
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              onFocus={() => setOpen(query.trim().length >= 2)}
              onKeyDown={onKeyDown}
              className="dp-od-input"
            />
            {query ? (
              <button type="button" onClick={() => onQuery("")} aria-label="Effacer la recherche" className="dp-od-clear">
                ×
              </button>
            ) : null}

            {/* Liste de suggestions — nom + maison, tolérante aux accents */}
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Suggestions"
              className="dp-od-listbox"
              hidden={!open || suggestions.length === 0}
            >
              {suggestions.map((s, i) => (
                <li
                  key={s.id}
                  id={uid + "-opt-" + i}
                  role="option"
                  aria-selected={selectedIds.has(s.id)}
                  className={"dp-od-opt" + (i === hi ? " is-active" : "")}
                  onMouseEnter={() => setHighlight(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggle(s.id)}
                >
                  <span className="dp-od-opt-name">{s.name}</span>
                  <span className="dp-od-opt-house">{s.house}</span>
                  <span className="dp-od-opt-mark" aria-hidden>
                    {selectedIds.has(s.id) ? "Retirer" : "Ajouter"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <label className="dp-od-housewrap">
            <span className="dp-od-sr">Filtrer par maison</span>
            <select value={house} onChange={(e) => onHouse(e.target.value)} className="dp-od-house">
              <option value="">Toutes les maisons</option>
              {ON_DEMAND_HOUSES.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="dp-od-count" aria-live="polite">
          {failed
            ? "Le répertoire n'a pas pu être chargé. Écrivez-nous le nom du parfum, nous le retrouverons."
            : !catalog
              ? "Chargement du répertoire des maisons du Golfe…"
              : filtered.length === 0
                ? "Aucune référence ne correspond. Essayez le nom de la maison, ou écrivez-nous directement."
                : filtered.length + " référence" + (filtered.length > 1 ? "s" : "") + " disponible" + (filtered.length > 1 ? "s" : "") + " sur commande"}
        </p>

        {/* ── Grille de cartes typographiques ── */}
        {catalog ? (
          <>
            <div className="dp-od-grid">
              {shown.map((e) => {
                const isOn = selectedIds.has(e.id);
                return (
                  <button
                    key={e.id}
                    type="button"
                    aria-pressed={isOn}
                    onClick={() => toggle(e.id)}
                    className={"dp-od-card" + (isOn ? " is-on" : "")}
                  >
                    <span className="dp-od-card-top">
                      {e.logo ? (
                        <Image src={e.logo} alt="" width={34} height={34} className="dp-od-logo" />
                      ) : (
                        <span className="dp-od-mono" aria-hidden>
                          {monogram(e.house)}
                        </span>
                      )}
                      <span className="dp-od-check" aria-hidden>
                        {isOn ? "✓" : "+"}
                      </span>
                    </span>
                    <span className="dp-od-name">{e.name}</span>
                    <span className="dp-od-card-house">{e.house}</span>
                    <span className="dp-od-accords">{e.accords.slice(0, 4).join(" · ")}</span>
                  </button>
                );
              })}
            </div>

            {visible < filtered.length ? (
              <div className="dp-od-more">
                <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="dp-od-morebtn">
                  Afficher {Math.min(PAGE_SIZE, filtered.length - visible)} références de plus
                </button>
              </div>
            ) : null}
          </>
        ) : (
          /* Squelette : la page garde sa forme pendant le chargement du chunk */
          <div className="dp-od-grid" aria-hidden>
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="dp-od-skeleton" />
            ))}
          </div>
        )}
      </div>

      {/* ── Panneau : la liste en cours ── */}
      <aside className="dp-od-panel" aria-label="Ma liste de commande">
        <div className="dp-od-panel-inner">
          <button
            type="button"
            className="dp-od-panel-head"
            onClick={() => setPanelOpen((o) => !o)}
            aria-expanded={panelOpen}
          >
            <span className="dp-od-panel-title">Ma liste</span>
            <span className="dp-od-badge">{selected.length}</span>
            <span className="dp-od-chev" aria-hidden>
              {panelOpen ? "▴" : "▾"}
            </span>
          </button>

          {panelOpen ? (
            <div className="dp-od-panel-body">
              {selected.length === 0 ? (
                <p className="dp-od-empty">
                  Votre liste est vide. Cherchez un parfum, puis touchez sa carte pour l&apos;ajouter — vous pourrez
                  ajuster les quantités ici.
                </p>
              ) : (
                <>
                  <ul className="dp-od-lines">
                    {selected.map(({ line, entry }) => (
                      <li key={line.id} className="dp-od-line">
                        <div className="dp-od-line-text">
                          <span className="dp-od-line-name">{entry.name}</span>
                          <span className="dp-od-line-house">{entry.house}</span>
                        </div>
                        <div className="dp-od-line-actions">
                          <span className="dp-od-stepper">
                            <button
                              type="button"
                              onClick={() => changeQty(line.id, -1)}
                              aria-label={"Retirer une unité de " + entry.name}
                              disabled={line.qty <= 1}
                            >
                              −
                            </button>
                            <span aria-live="off">{line.qty}</span>
                            <button
                              type="button"
                              onClick={() => changeQty(line.id, 1)}
                              aria-label={"Ajouter une unité de " + entry.name}
                            >
                              +
                            </button>
                          </span>
                          <button
                            type="button"
                            className="dp-od-remove"
                            onClick={() => toggle(line.id)}
                            aria-label={"Retirer " + entry.name + " de la liste"}
                          >
                            ×
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <p className="dp-od-total">
                    {selected.length} référence{selected.length > 1 ? "s" : ""} · {totalUnits} flacon
                    {totalUnits > 1 ? "s" : ""}
                  </p>

                  {/* Envoi — WhatsApp d'abord, c'est là que la réponse arrive. */}
                  <a href={whatsapp?.href} className="dp-od-wa" target="_blank" rel="noopener noreferrer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.2-.8-2.7-1.1-4.4-3.9-4.5-4.1-.1-.2-1.1-1.4-1.1-2.7 0-1.2.7-1.8 1-2 .2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.2.1.4.1.6-.1l.8-1c.2-.2.3-.2.6-.1l2 1c.2.1.4.2.5.3.1.2.1.5 0 .8Z" />
                    </svg>
                    Envoyer ma liste par WhatsApp
                  </a>
                  <a href={mail?.href} className="dp-od-mail">
                    Envoyer par e-mail
                  </a>

                  <p className="dp-od-hint">
                    WhatsApp reste le canal le plus rapide : nos vendeurs y répondent dans la journée, souvent en
                    quelques minutes. Par e-mail, comptez plutôt un à deux jours ouvrés.
                  </p>

                  {whatsapp && whatsapp.omitted > 0 ? (
                    <p className="dp-od-warn" role="status">
                      Votre liste dépasse ce qu&apos;un lien WhatsApp peut transporter : il en emporte les{" "}
                      {selected.length - whatsapp.omitted} premières références. Les {whatsapp.omitted} autres vous
                      attendent ici — envoyez-les en second message, ou préférez l&apos;e-mail, qui les prend toutes.
                    </p>
                  ) : null}

                  <button type="button" className="dp-od-clearall" onClick={() => setLines([])}>
                    Vider la liste
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>
      </aside>

      {/* Styles : pseudo-classes, media queries et keyframes ne se font pas en
          style inline. Tokens de globals.css uniquement, aucune couleur en dur. */}
      <style>{`
        .dp-od-shell {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 36px;
          align-items: start;
          max-width: var(--container);
          margin: 0 auto;
          padding: 0 var(--gutter) 80px;
        }
        .dp-od-main { min-width: 0; }

        .dp-od-tools {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: stretch;
          margin-bottom: 14px;
        }
        .dp-od-searchbox { position: relative; flex: 1 1 260px; min-width: 0; }
        .dp-od-searchicon {
          position: absolute;
          /* propriétés logiques : la locale AR rend la page en dir=rtl,
             l'icône doit suivre le sens de lecture */
          inset-inline-start: 16px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }
        .dp-od-input {
          width: 100%;
          min-width: 0;
          height: 52px;
          padding-block: 0;
          padding-inline: 42px 44px;
          border: 1px solid var(--line-300);
          border-radius: var(--r-pill);
          background: var(--surface-white);
          color: var(--ink-900);
          font-family: var(--font-sans);
          font-size: 16px;
          font-weight: var(--fw-light);
          outline: none;
          transition: border-color .18s var(--ease-out), box-shadow .18s var(--ease-out);
          appearance: none;
        }
        .dp-od-input::placeholder { color: var(--ink-400); }
        .dp-od-input:focus { border-color: var(--gold-500); box-shadow: var(--focus-ring); }
        .dp-od-input::-webkit-search-cancel-button { display: none; }

        .dp-od-clear {
          position: absolute;
          inset-inline-end: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: var(--ink-500);
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
        }
        .dp-od-clear:hover { background: var(--surface-cream); color: var(--ink-900); }

        .dp-od-housewrap { flex: 0 1 220px; min-width: 0; display: block; }
        .dp-od-sr {
          position: absolute;
          width: 1px; height: 1px;
          padding: 0; margin: -1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
          border: 0;
        }
        .dp-od-house {
          width: 100%;
          height: 52px;
          padding: 0 16px;
          border: 1px solid var(--line-300);
          border-radius: var(--r-pill);
          background: var(--surface-white);
          color: var(--ink-700);
          font-family: var(--font-sans);
          font-size: 15px;
          cursor: pointer;
          outline: none;
        }
        .dp-od-house:focus { border-color: var(--gold-500); box-shadow: var(--focus-ring); }

        .dp-od-listbox {
          position: absolute;
          z-index: 40;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          margin: 0;
          padding: 6px;
          list-style: none;
          max-height: 340px;
          overflow-y: auto;
          background: var(--surface-white);
          border: 1px solid var(--line-200);
          border-radius: var(--r-lg);
          box-shadow: var(--shadow-md);
        }
        .dp-od-listbox[hidden] { display: none; }
        .dp-od-opt {
          display: flex;
          align-items: baseline;
          gap: 10px;
          min-height: 44px;
          padding: 10px 12px;
          border-radius: var(--r-sm);
          cursor: pointer;
        }
        .dp-od-opt.is-active { background: var(--surface-cream); }
        .dp-od-opt-name {
          font-family: var(--font-display);
          font-size: 1.05rem;
          color: var(--ink-900);
          min-width: 0;
          overflow-wrap: anywhere;
        }
        .dp-od-opt-house {
          font-family: var(--font-sans);
          font-size: var(--t-xs);
          letter-spacing: var(--ls-wide);
          text-transform: uppercase;
          color: var(--ink-400);
          flex: 1 1 auto;
          min-width: 0;
        }
        .dp-od-opt-mark {
          font-family: var(--font-sans);
          font-size: var(--t-xs);
          letter-spacing: var(--ls-wide);
          text-transform: uppercase;
          color: var(--gold-700);
          flex: 0 0 auto;
        }

        .dp-od-count {
          margin: 0 0 18px;
          font-family: var(--font-sans);
          font-size: var(--t-sm);
          color: var(--ink-500);
        }

        .dp-od-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 196px), 1fr));
          gap: 14px;
        }
        .dp-od-skeleton {
          display: block;
          height: 168px;
          border-radius: var(--r-lg);
          background: var(--surface-cream);
          opacity: .6;
          animation: dp-od-pulse 1.5s var(--ease-in-out) infinite;
        }
        @keyframes dp-od-pulse { 0%,100% { opacity: .45 } 50% { opacity: .8 } }

        .dp-od-card {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
          min-height: 168px;
          padding: 16px;
          text-align: left;
          background: var(--surface-cream);
          border: 1px solid var(--line-200);
          border-radius: var(--r-lg);
          cursor: pointer;
          transition: border-color .18s var(--ease-out), background .18s var(--ease-out), transform .18s var(--ease-out);
        }
        .dp-od-card:hover { border-color: var(--gold-300); transform: translateY(-2px); }
        .dp-od-card:focus-visible { outline: none; box-shadow: var(--focus-ring); border-color: var(--gold-500); }
        .dp-od-card.is-on {
          background: var(--surface-cream-2);
          border-color: var(--gold-500);
          box-shadow: inset 0 0 0 1px var(--gold-500);
        }
        .dp-od-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 4px;
        }
        .dp-od-logo {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          object-fit: cover;
          flex: 0 0 auto;
        }
        .dp-od-mono {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          flex: 0 0 auto;
          border: 1px solid var(--line-300);
          border-radius: 50%;
          background: var(--surface-white);
          font-family: var(--font-display);
          font-size: .95rem;
          letter-spacing: .04em;
          color: var(--gold-700);
        }
        .dp-od-check {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          flex: 0 0 auto;
          border-radius: 50%;
          border: 1px solid var(--line-300);
          background: var(--surface-white);
          color: var(--ink-400);
          font-size: 14px;
          line-height: 1;
        }
        .dp-od-card.is-on .dp-od-check {
          border-color: var(--gold-500);
          background: var(--gold-500);
          color: var(--surface-white);
        }
        .dp-od-name {
          font-family: var(--font-display);
          font-weight: var(--fw-medium);
          font-size: 1.15rem;
          line-height: 1.2;
          color: var(--ink-900);
          overflow-wrap: anywhere;
        }
        .dp-od-card-house {
          font-family: var(--font-sans);
          font-size: var(--t-xs);
          font-weight: var(--fw-semibold);
          letter-spacing: var(--ls-wider);
          text-transform: uppercase;
          color: var(--gold-700);
          overflow-wrap: anywhere;
        }
        .dp-od-accords {
          margin-top: auto;
          font-family: var(--font-sans);
          font-size: var(--t-sm);
          font-weight: var(--fw-light);
          line-height: var(--lh-normal);
          color: var(--ink-500);
          overflow-wrap: anywhere;
        }

        .dp-od-more { display: flex; justify-content: center; padding-top: 26px; }
        .dp-od-morebtn {
          min-height: 46px;
          padding: 0 28px;
          border: 1px solid var(--line-300);
          border-radius: var(--r-pill);
          background: transparent;
          color: var(--ink-700);
          font-family: var(--font-sans);
          font-size: var(--t-body);
          letter-spacing: var(--ls-wide);
          cursor: pointer;
          transition: background .18s var(--ease-out), border-color .18s var(--ease-out);
        }
        .dp-od-morebtn:hover { background: var(--surface-cream); border-color: var(--gold-300); }

        /* ── Panneau ── */
        .dp-od-panel { min-width: 0; }
        .dp-od-panel-inner {
          position: sticky;
          top: 24px;
          border: 1px solid var(--line-200);
          border-radius: var(--r-lg);
          background: var(--surface-white);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }
        .dp-od-panel-head {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          min-height: 52px;
          padding: 0 16px;
          border: 0;
          border-bottom: 1px solid var(--line-100);
          background: var(--surface-cream);
          cursor: pointer;
          text-align: left;
        }
        .dp-od-panel-title {
          flex: 1 1 auto;
          min-width: 0;
          font-family: var(--font-display);
          font-size: 1.3rem;
          color: var(--ink-900);
        }
        .dp-od-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 26px;
          height: 26px;
          padding: 0 8px;
          border-radius: var(--r-pill);
          background: var(--gold-500);
          color: var(--espresso-900);
          font-family: var(--font-sans);
          font-size: var(--t-sm);
          font-weight: var(--fw-semibold);
        }
        .dp-od-chev { color: var(--ink-400); font-size: 12px; }
        .dp-od-panel-body { padding: 16px; max-height: 62vh; overflow-y: auto; }
        .dp-od-empty {
          margin: 0;
          font-family: var(--font-sans);
          font-size: var(--t-sm);
          font-weight: var(--fw-light);
          line-height: var(--lh-relaxed);
          color: var(--ink-500);
        }
        .dp-od-lines { list-style: none; margin: 0 0 14px; padding: 0; }
        .dp-od-line {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          padding: 10px 0;
          border-bottom: 1px solid var(--line-100);
        }
        .dp-od-line-text { flex: 1 1 130px; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .dp-od-line-name {
          font-family: var(--font-display);
          font-size: 1.05rem;
          color: var(--ink-900);
          overflow-wrap: anywhere;
        }
        .dp-od-line-house {
          font-family: var(--font-sans);
          font-size: var(--t-xs);
          letter-spacing: var(--ls-wide);
          text-transform: uppercase;
          color: var(--ink-400);
          overflow-wrap: anywhere;
        }
        .dp-od-line-actions { display: flex; align-items: center; gap: 6px; flex: 0 0 auto; }
        .dp-od-stepper {
          display: inline-flex;
          align-items: center;
          border: 1px solid var(--line-200);
          border-radius: var(--r-pill);
          overflow: hidden;
        }
        .dp-od-stepper button {
          width: 40px;
          height: 40px;
          border: 0;
          background: transparent;
          color: var(--ink-700);
          font-size: 17px;
          line-height: 1;
          cursor: pointer;
        }
        .dp-od-stepper button:hover:not(:disabled) { background: var(--surface-cream); }
        .dp-od-stepper button:disabled { color: var(--line-300); cursor: default; }
        .dp-od-stepper span {
          min-width: 22px;
          text-align: center;
          font-family: var(--font-sans);
          font-size: var(--t-sm);
          color: var(--ink-900);
        }
        .dp-od-remove {
          width: 40px;
          height: 40px;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: var(--ink-400);
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
        }
        .dp-od-remove:hover { background: var(--surface-cream); color: var(--danger); }

        .dp-od-total {
          margin: 0 0 12px;
          font-family: var(--font-sans);
          font-size: var(--t-sm);
          letter-spacing: var(--ls-wide);
          text-transform: uppercase;
          color: var(--ink-400);
        }

        .dp-od-wa {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 52px;
          padding: 0 18px;
          border-radius: var(--r-pill);
          background: var(--success);
          color: var(--on-dark-strong);
          font-family: var(--font-sans);
          font-size: var(--t-body);
          font-weight: var(--fw-medium);
          letter-spacing: var(--ls-wide);
          text-decoration: none;
          text-align: center;
          transition: filter .18s var(--ease-out), transform .18s var(--ease-out);
        }
        .dp-od-wa:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .dp-od-mail {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          margin-top: 10px;
          padding: 0 18px;
          border: 1px solid var(--line-300);
          border-radius: var(--r-pill);
          background: transparent;
          color: var(--ink-700);
          font-family: var(--font-sans);
          font-size: var(--t-body);
          letter-spacing: var(--ls-wide);
          text-decoration: none;
          text-align: center;
          transition: background .18s var(--ease-out), border-color .18s var(--ease-out);
        }
        .dp-od-mail:hover { background: var(--surface-cream); border-color: var(--gold-300); }

        .dp-od-hint {
          margin: 12px 0 0;
          font-family: var(--font-sans);
          font-size: var(--t-xs);
          font-weight: var(--fw-light);
          line-height: var(--lh-relaxed);
          color: var(--ink-400);
        }
        .dp-od-warn {
          margin: 12px 0 0;
          padding: 10px 12px;
          border: 1px solid var(--line-200);
          border-left: 3px solid var(--gold-500);
          border-radius: var(--r-sm);
          background: var(--surface-cream);
          font-family: var(--font-sans);
          font-size: var(--t-xs);
          line-height: var(--lh-relaxed);
          color: var(--ink-700);
        }
        .dp-od-clearall {
          display: block;
          width: 100%;
          min-height: 40px;
          margin-top: 14px;
          border: 0;
          background: transparent;
          color: var(--ink-400);
          font-family: var(--font-sans);
          font-size: var(--t-xs);
          letter-spacing: var(--ls-wide);
          text-transform: uppercase;
          cursor: pointer;
        }
        .dp-od-clearall:hover { color: var(--danger); }

        /* ── Repli mobile (seuil 760px du repo) ──
           Une colonne, panneau AU-DESSUS de la grille et repliable : il reste
           accessible au pouce sans recouvrir quoi que ce soit, et une liste
           longue ne pousse jamais la grille hors de portée. */
        @media (max-width: 760px) {
          .dp-od-shell {
            grid-template-columns: minmax(0, 1fr);
            gap: 20px;
            padding-bottom: 56px;
          }
          .dp-od-panel { order: -1; }
          .dp-od-panel-inner { position: static; }
          .dp-od-panel-body { max-height: 46vh; }
          .dp-od-housewrap { flex: 1 1 100%; }
          .dp-od-grid { grid-template-columns: repeat(auto-fill, minmax(min(100%, 152px), 1fr)); gap: 10px; }
          .dp-od-card { min-height: 148px; padding: 13px; }
          .dp-od-name { font-size: 1.05rem; }
          .dp-od-listbox { max-height: 54vh; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dp-od-card, .dp-od-wa, .dp-od-skeleton { transition: none; animation: none; }
        }
      `}</style>
    </div>
  );
}
