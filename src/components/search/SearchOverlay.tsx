"use client";

/**
 * Recherche instantanée — superposition ouverte par la loupe du header, par `/`
 * ou par ⌘K.
 *
 * Elle cherche dans le même mouvement les **parfums**, les **maisons** et les
 * **notes olfactives**, et rend la fiche complète quand une seule référence
 * répond.
 *
 * Le catalogue (`@/data/search-catalog`) est chargé en `import()` dynamique à la
 * **première ouverture**, jamais au chargement de la page : il agrège toutes les
 * sources produit du site et n'a rien à faire dans le bundle initial.
 *
 * Portage React du module `recherche.js` d'AD Parfumerie — même comportement
 * (classement, mots dans le désordre, écran d'accueil, dictée, clavier), habillé
 * du design system Dubaï Parfumerie.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { addItem } from "@/lib/cart";
import { WHATSAPP_URL } from "@/lib/contact";
import type { SearchBrand, SearchNote, SearchProduct } from "@/data/search-catalog";
import type { SearchResults } from "./rank";

const RECENTS_KEY = "dp_recherches";
const MAX_RECENTS = 6;
const DEBOUNCE_MS = 90; // le catalogue est en mémoire : 90 ms suffisent

// Devise — même contrat que Header.tsx / Footer.tsx (localStorage + event global).
const CURRENCY_KEY = "dp_currency";
const CURRENCY_EVENT = "dp-currency-change";

/** Modules chargés à la première ouverture — pas au chargement de la page. */
type CatalogModule = typeof import("@/data/search-catalog");
type RankModule = typeof import("./rank");

interface Loaded {
  catalog: CatalogModule;
  rank: RankModule;
}

// ─── Entrée sélectionnable au clavier ────────────────────────────────────────

type Entry =
  | { kind: "product"; product: SearchProduct }
  | { kind: "brand"; name: string }
  | { kind: "note"; label: string }
  | { kind: "text"; value: string };

// ─── Utilitaires ─────────────────────────────────────────────────────────────

function readRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function pushRecent(q: string) {
  if (!q || q.length < 2) return;
  try {
    const next = [q, ...readRecents().filter((x) => x !== q)].slice(0, MAX_RECENTS);
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    /* navigation privée : on s'en passe */
  }
}

function readCurrency(): string {
  if (typeof window === "undefined") return "EUR";
  try {
    return window.localStorage.getItem(CURRENCY_KEY) || "EUR";
  } catch {
    return "EUR";
  }
}

function recognitionLang(locale: string): string {
  const map: Record<string, string> = {
    fr: "fr-FR", en: "en-US", es: "es-ES", de: "de-DE", it: "it-IT", ru: "ru-RU", ar: "ar-SA",
  };
  return map[locale] || "fr-FR";
}

/** Surligne l'occurrence de la requête dans un libellé. */
function Highlight({ text, query, normalize }: { text: string; query: string; normalize: (s: string) => string }) {
  if (!query) return <>{text}</>;
  const i = normalize(text).indexOf(normalize(query));
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="dp-rch-mark">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

// ─── Icônes ──────────────────────────────────────────────────────────────────

const ICON = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const IconLoupe = () => (<svg {...ICON}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>);
const IconMic = () => (<svg {...ICON}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>);
const IconCamera = () => (<svg {...ICON}><path d="M3 8.5h3.2L8 6h8l1.8 2.5H21v11H3z" /><circle cx="12" cy="13.6" r="3.4" /></svg>);
const IconChevron = () => (<svg {...ICON}><polyline points="9 6 15 12 9 18" /></svg>);
const IconBack = () => (<svg {...ICON}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>);

// ─── Composant ───────────────────────────────────────────────────────────────

export interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const locale = useLocale();

  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [active, setActive] = useState(-1);
  const [recents, setRecents] = useState<string[]>(readRecents);
  // `ssr: false` côté header : localStorage est lisible dès le premier rendu, donc
  // pas de setState dans un effet (et pas de divergence d'hydratation).
  const [currency, setCurrency] = useState(readCurrency);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  /** vidéos de la page hôte mises en pause le temps de la recherche */
  const pausedRef = useRef<HTMLVideoElement[]>([]);

  // ── Chargement du catalogue, à la première ouverture seulement ─────────────
  useEffect(() => {
    if (!open || loaded || loadError) return;
    let alive = true;
    Promise.all([import("@/data/search-catalog"), import("./rank")])
      .then(([catalog, rank]) => alive && setLoaded({ catalog, rank }))
      .catch(() => alive && setLoadError(true));
    return () => {
      alive = false;
    };
  }, [open, loaded, loadError]);

  // ── Devise — synchronisée avec Header / Footer ─────────────────────────────
  useEffect(() => {
    const onChange = () => setCurrency(readCurrency());
    window.addEventListener(CURRENCY_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CURRENCY_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const money = useMemo(
    () => new Intl.NumberFormat(locale || "fr", { style: "currency", currency, maximumFractionDigits: 2 }),
    [locale, currency],
  );

  // ── Frappe débattue ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  // La sélection clavier et la quantité repartent de zéro à chaque nouvel écran.
  // Remis à plat pendant le rendu (pattern « dérivé d'une prop ») plutôt que dans un
  // effet : un effet aurait fait clignoter l'ancienne sélection sur le nouvel écran.
  const [screenKey, setScreenKey] = useState(debounced);
  if (screenKey !== debounced) {
    setScreenKey(debounced);
    setActive(-1);
    setQty(1);
    setAdded(false);
  }

  // ── Ouverture / fermeture ──────────────────────────────────────────────────
  // La page d'accueil porte plusieurs vidéos. Elles continuaient de jouer derrière
  // la superposition, invisibles — et comme le voile est flouté, le navigateur
  // recalculait un flou plein écran à chaque image. On les met en pause, et on ne
  // relance que celles qui tournaient vraiment.
  useEffect(() => {
    if (!open) return;

    // les récents ont pu changer depuis la dernière ouverture (autre onglet, autre page)
    queueMicrotask(() => setRecents(readRecents()));
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const paused = [...document.querySelectorAll("video")].filter(
      (v) => !v.paused && !v.closest(".dp-rch"),
    ) as HTMLVideoElement[];
    paused.forEach((v) => v.pause());
    pausedRef.current = paused;

    const focus = window.setTimeout(() => inputRef.current?.focus(), 60);

    return () => {
      document.body.style.overflow = overflow;
      window.clearTimeout(focus);
      pausedRef.current.forEach((v) => v.play().catch(() => { /* lecture refusée : sans conséquence */ }));
      pausedRef.current = [];
      recognitionRef.current?.stop?.();
    };
  }, [open]);

  // La photo prise n'a de sens que le temps de l'écran qui l'affiche.
  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo);
    };
  }, [photo]);

  const close = useCallback(() => {
    onClose();
    setPhoto(null);
    setMicError(null);
  }, [onClose]);

  // ── Résultats ──────────────────────────────────────────────────────────────
  const results: SearchResults | null = useMemo(() => {
    if (!loaded || !debounced.trim()) return null;
    return loaded.rank.search(debounced.trim());
  }, [loaded, debounced]);

  const homeSuggestions = useMemo(
    () => (loaded && !debounced.trim() ? loaded.rank.suggestions(10) : []),
    [loaded, debounced],
  );
  const homeNotes = useMemo(
    () => (loaded && !debounced.trim() ? loaded.catalog.SEARCH_NOTES.slice(0, 12) : []),
    [loaded, debounced],
  );
  const homeBrands = useMemo(
    () => (loaded && !debounced.trim() ? loaded.catalog.SEARCH_BRANDS.slice(0, 6) : []),
    [loaded, debounced],
  );

  const normalize = loaded?.catalog.norm ?? ((s: string) => s.toLowerCase());

  /** Une seule référence trouvée : fiche détaillée plutôt qu'une vignette isolée. */
  const single = results && results.products.length === 1 ? results.products[0] : null;

  // Ordre de parcours au clavier — il doit suivre l'ordre visuel.
  const entries: Entry[] = useMemo(() => {
    if (!loaded) return [];
    if (!debounced.trim()) {
      return [
        ...recents.map((value): Entry => ({ kind: "text", value })),
        ...homeSuggestions.map((product): Entry => ({ kind: "product", product })),
        ...homeNotes.map((n): Entry => ({ kind: "note", label: n.label })),
        ...homeBrands.map((b): Entry => ({ kind: "brand", name: b.name })),
      ];
    }
    if (!results) return [];
    return [
      ...results.products.map((product): Entry => ({ kind: "product", product })),
      ...results.brands.map((b): Entry => ({ kind: "brand", name: b.name })),
      ...results.notes.map((n): Entry => ({ kind: "note", label: n.label })),
    ];
  }, [loaded, debounced, recents, homeSuggestions, homeNotes, homeBrands, results]);

  // ── Destinations ───────────────────────────────────────────────────────────
  // Un parfum nommé mène à sa fiche, pas au catalogue filtré sur son nom.
  const go = useCallback(
    (entry: Entry) => {
      pushRecent(query.trim());
      if (entry.kind === "product") {
        close();
        router.push(entry.product.href);
      } else if (entry.kind === "brand") {
        close();
        router.push(`/marques#${encodeURIComponent(entry.name)}`);
      } else if (entry.kind === "note") {
        setQuery(entry.label);
        inputRef.current?.focus();
      } else {
        setQuery(entry.value);
        inputRef.current?.focus();
      }
    },
    [query, router, close],
  );

  const seeAll = useCallback(() => {
    const q = query.trim();
    if (!q) return;
    pushRecent(q);
    close();
    router.push(`/marques?q=${encodeURIComponent(q)}`);
  }, [query, router, close]);

  // ── Clavier ────────────────────────────────────────────────────────────────
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (entries.length ? (a + 1 + entries.length) % entries.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (entries.length ? (a - 1 + entries.length) % entries.length : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && entries[active]) go(entries[active]);
      else seeAll();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  // L'élément actif doit rester visible, y compris dans le rail horizontal.
  useEffect(() => {
    if (active < 0) return;
    document
      .querySelector<HTMLElement>(`.dp-rch [data-idx="${active}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active]);

  // ── Dictée ─────────────────────────────────────────────────────────────────
  // Web Speech API : native, gratuite, aucun service tiers. Absente de Firefox :
  // le bouton n'apparaît que si le navigateur sait la faire.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speechSupported = typeof window !== "undefined" && Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  function toggleDictation() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;

    const reco = new Ctor();
    reco.lang = recognitionLang(locale);
    reco.interimResults = true; // on écrit au fil de la parole
    reco.continuous = false;
    reco.maxAlternatives = 1;
    recognitionRef.current = reco;

    reco.onstart = () => {
      setListening(true);
      setMicError(null);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reco.onresult = (e: any) => {
      const text = [...e.results].map((r: { 0: { transcript: string } }) => r[0].transcript).join("").trim();
      setQuery(text);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reco.onerror = (e: any) => {
      // « not-allowed » : micro refusé. On le dit plutôt que de rester muet.
      setMicError(
        e?.error === "not-allowed" || e?.error === "service-not-allowed"
          ? "Le micro n'est pas autorisé. Autorisez-le dans les réglages du navigateur pour dicter votre recherche."
          : "La dictée est momentanément indisponible.",
      );
      setListening(false);
    };
    reco.onend = () => {
      setListening(false);
      inputRef.current?.focus();
    };

    try {
      reco.start();
    } catch {
      setListening(false);
      setMicError("La dictée est momentanément indisponible.");
    }
  }

  // ── Photo ──────────────────────────────────────────────────────────────────
  // La reconnaissance de flacon demande un modèle de vision côté serveur.
  // On affiche la photo prise, on l'annonce franchement, et on propose WhatsApp.
  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // reprendre la même photo doit redéclencher
    if (!file) return;
    setPhoto((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  // ── Rail horizontal ────────────────────────────────────────────────────────
  const [railState, setRailState] = useState({ start: true, end: false });
  const updateRail = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const rest = el.scrollWidth - el.clientWidth - el.scrollLeft;
    setRailState({ start: el.scrollLeft < 8, end: rest < 8 });
  }, []);
  useEffect(() => {
    // mesure après peinture : la largeur réelle du rail n'existe pas avant
    const id = requestAnimationFrame(updateRail);
    return () => cancelAnimationFrame(id);
  }, [updateRail, results, homeSuggestions]);

  function scrollRail(dir: 1 | -1) {
    const el = railRef.current;
    if (!el) return;
    // on avance d'un écran moins une carte, pour garder un repère visuel
    el.scrollBy({ left: dir * (el.clientWidth - 140), behavior: "smooth" });
    // le défilement est animé : on repasse une fois arrivé
    window.setTimeout(updateRail, 420);
  }

  if (!open) return null;

  // ── Fragments de rendu ─────────────────────────────────────────────────────

  const price = (v?: number) => (typeof v === "number" ? money.format(v) : "");

  const productCard = (p: SearchProduct, idx: number) => {
    return (
      <button
        type="button"
        role="option"
        aria-selected={active === idx}
        data-idx={idx}
        className={`dp-rch-card${active === idx ? " on" : ""}`}
        onClick={() => go({ kind: "product", product: p })}
        onMouseEnter={() => setActive(idx)}
      >
        <span className="dp-rch-card-vis">
          {/* Une vidéo de carte montre CE flacon-là, ce qu'aucun packshot ne fait. */}
          {p.video ? (
            <video src={p.video} poster={p.image} muted loop playsInline autoPlay preload="none" />
          ) : p.image ? (
            <Image src={p.image} alt="" width={220} height={220} loading="lazy" />
          ) : (
            <b>{p.brand.charAt(0)}</b>
          )}
          {!p.available && <i className="dp-rch-card-ko">Sur commande</i>}
        </span>
        <span className="dp-rch-card-name">
          <Highlight text={p.name} query={debounced.trim()} normalize={normalize} />
        </span>
        <span className="dp-rch-card-sub">
          <Highlight text={p.brand} query={debounced.trim()} normalize={normalize} />
        </span>
        <span className="dp-rch-card-price">{price(p.price)}</span>
      </button>
    );
  };

  const rail = (products: SearchProduct[], from: number) => {
    return (
      <div className="dp-rch-railwrap">
        <button
          type="button"
          className={`dp-rch-arrow prev${railState.start ? " off" : ""}`}
          onClick={() => scrollRail(-1)}
          aria-label="Voir les précédents"
          tabIndex={-1}
        >
          <IconChevron />
        </button>
        <div className="dp-rch-rail" ref={railRef} onScroll={updateRail}>
          {products.map((p, i) => (
            <React.Fragment key={p.id}>{productCard(p, from + i)}</React.Fragment>
          ))}
        </div>
        <button
          type="button"
          className={`dp-rch-arrow next${railState.end ? " off" : ""}`}
          onClick={() => scrollRail(1)}
          aria-label="Voir les suivants"
          tabIndex={-1}
        >
          <IconChevron />
        </button>
      </div>
    );
  };

  const brandPill = (b: SearchBrand, idx: number) => {
    return (
      <button
        type="button"
        role="option"
        aria-selected={active === idx}
        data-idx={idx}
        className={`dp-rch-brand${active === idx ? " on" : ""}`}
        onClick={() => go({ kind: "brand", name: b.name })}
        onMouseEnter={() => setActive(idx)}
      >
        <span className="dp-rch-brand-vis">
          {b.image ? <Image src={b.image} alt="" width={120} height={120} loading="lazy" /> : <b>{b.name.charAt(0)}</b>}
        </span>
        <span className="dp-rch-brand-txt">
          <Highlight text={b.name} query={debounced.trim()} normalize={normalize} />
          <i>{b.count}</i>
        </span>
      </button>
    );
  };

  const noteChip = (n: SearchNote, idx: number) => {
    return (
      <button
        type="button"
        role="option"
        aria-selected={active === idx}
        data-idx={idx}
        className={`dp-rch-chip${active === idx ? " on" : ""}`}
        onClick={() => go({ kind: "note", label: n.label })}
        onMouseEnter={() => setActive(idx)}
      >
        <Highlight text={n.label} query={debounced.trim()} normalize={normalize} />
        <i>{n.count}</i>
      </button>
    );
  };

  /** Fiche détaillée — média à gauche, pyramide olfactive et ajout au panier à droite. */
  const sheet = (p: SearchProduct) => {
    const familyKey = loaded ? loaded.catalog.familyOf(p) : "";
    const family = familyKey ? loaded!.catalog.FAMILIES[familyKey] : null;
    const pyramid: [string, string[]][] = [
      ["Tête", p.topNotes ?? []],
      ["Cœur", p.heartNotes ?? []],
      ["Fond", p.baseNotes ?? []],
    ].filter(([, list]) => (list as string[]).length) as [string, string[]][];

    const facts = [
      p.volume ? ["Contenance", p.volume] : null,
      p.concentration ? ["Concentration", p.concentration] : null,
      p.gender ? ["Se porte", p.gender] : null,
    ].filter(Boolean) as [string, string][];

    return (
      <article className="dp-rch-sheet">
        <div className="dp-rch-sheet-media">
          {p.video ? (
            <>
              <video src={p.video} poster={p.image} muted loop playsInline autoPlay preload="none" />
              <i className="dp-rch-live">Vidéo</i>
            </>
          ) : p.image ? (
            <Image src={p.image} alt="" fill sizes="(max-width: 760px) 100vw, 320px" style={{ objectFit: "cover" }} />
          ) : (
            <b>{p.brand.charAt(0)}</b>
          )}
        </div>

        <div className="dp-rch-sheet-info">
          <button
            type="button"
            className="dp-rch-sheet-brand"
            onClick={() => go({ kind: "brand", name: p.brand })}
          >
            <Highlight text={p.brand} query={debounced.trim()} normalize={normalize} />
            <span>voir la maison</span>
          </button>

          <h4 className="dp-rch-sheet-name">
            <Highlight text={p.name} query={debounced.trim()} normalize={normalize} />
          </h4>

          <p className="dp-rch-sheet-price">
            {price(p.price)}
            {p.compareAtPrice && p.compareAtPrice > (p.price ?? 0) && (
              <s>{price(p.compareAtPrice)}</s>
            )}
            <span className={`dp-rch-stock ${p.available ? "ok" : "ko"}`}>
              {p.available ? "En stock" : "Sur commande"}
            </span>
          </p>

          {family && (
            <p className="dp-rch-sheet-family">
              <b>{family.label}</b> {family.text}
            </p>
          )}

          {pyramid.length ? (
            <div className="dp-rch-sheet-block">
              <h5>Pyramide olfactive</h5>
              {pyramid.map(([label, list]) => (
                <div key={label} className="dp-rch-pyramid">
                  <dt>{label}</dt>
                  <dd>{list.join(" · ")}</dd>
                </div>
              ))}
            </div>
          ) : p.notes.length ? (
            <div className="dp-rch-sheet-block">
              <h5>Notes olfactives</h5>
              <div className="dp-rch-sheet-notes">
                {p.notes.map((n) => (
                  <span key={n} className="dp-rch-note">
                    <Highlight text={n} query={debounced.trim()} normalize={normalize} />
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {facts.length > 0 && (
            <dl className="dp-rch-facts">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="dp-rch-sheet-actions">
            {p.available && (
              <span className="dp-rch-qty" role="group" aria-label="Quantité">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Retirer un exemplaire">−</button>
                <b>{qty}</b>
                <button type="button" onClick={() => setQty((q) => Math.min(9, q + 1))} aria-label="Ajouter un exemplaire">+</button>
              </span>
            )}
            <button
              type="button"
              className="dp-rch-add"
              disabled={!p.available || added}
              onClick={() => {
                addItem({ id: p.id, name: p.name, brand: p.brand, price: p.price ?? 0, image: p.image ?? "" }, qty);
                setAdded(true);
              }}
            >
              {added ? (qty > 1 ? `${qty} ajoutés ✓` : "Ajouté ✓") : "Ajouter au panier"}
            </button>
            <button type="button" className="dp-rch-see" onClick={() => go({ kind: "product", product: p })}>
              Voir la fiche
            </button>
          </div>
        </div>
      </article>
    );
  };

  // ── Corps ──────────────────────────────────────────────────────────────────

  let body: React.ReactNode;

  if (photo) {
    body = (
      <section className="dp-rch-block">
        <h3>Votre photo</h3>
        <div className="dp-rch-photo">
          {/* eslint-disable-next-line @next/next/no-img-element -- objet URL local, hors optimiseur */}
          <img src={photo} alt="La photo que vous venez de prendre" />
          <div>
            <h4>La reconnaissance de flacon n&apos;est pas encore active</h4>
            <p>
              Elle demande un modèle de vision entraîné sur le catalogue. En attendant, envoyez-nous
              la photo : nous identifions le flacon et vous répondons avec le prix et la disponibilité.
            </p>
            <a
              className="dp-rch-cta"
              href={`${WHATSAPP_URL}?text=${encodeURIComponent("Bonjour, pouvez-vous identifier ce flacon ?")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Envoyer la photo sur WhatsApp
            </a>
            <button type="button" className="dp-rch-ghost" onClick={() => setPhoto(null)}>
              Revenir à la recherche
            </button>
          </div>
        </div>
      </section>
    );
  } else if (loadError) {
    body = <p className="dp-rch-info">Le catalogue n&apos;a pas pu être chargé.</p>;
  } else if (!loaded) {
    body = <p className="dp-rch-info">Chargement du catalogue…</p>;
  } else if (!debounced.trim()) {
    let i = 0;
    const recentFrom = i;
    i += recents.length;
    const suggestFrom = i;
    i += homeSuggestions.length;
    const notesFrom = i;
    i += homeNotes.length;
    const brandsFrom = i;

    body = (
      <>
        {recents.length > 0 && (
          <section className="dp-rch-block">
            <h3>Vos dernières recherches</h3>
            <div className="dp-rch-chips">
              {recents.map((r, k) => (
                <button
                  key={r}
                  type="button"
                  role="option"
                  aria-selected={active === recentFrom + k}
                  data-idx={recentFrom + k}
                  className={`dp-rch-chip${active === recentFrom + k ? " on" : ""}`}
                  onClick={() => go({ kind: "text", value: r })}
                  onMouseEnter={() => setActive(recentFrom + k)}
                >
                  ↩ {r}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="dp-rch-block">
          <h3>Suggestions</h3>
          {rail(homeSuggestions, suggestFrom)}
        </section>

        {/* Notes et maisons côte à côte : deux listes empilées mangeaient toute la
            hauteur de la superposition sur un portable. */}
        <div className="dp-rch-duo">
          <section className="dp-rch-block">
            <h3>Notes les plus présentes</h3>
            <div className="dp-rch-chips">
              {homeNotes.map((n, k) => (
                <React.Fragment key={n.key}>{noteChip(n, notesFrom + k)}</React.Fragment>
              ))}
            </div>
          </section>
          <section className="dp-rch-block">
            <h3>Maisons phares</h3>
            <div className="dp-rch-brands">
              {homeBrands.map((b, k) => (
                <React.Fragment key={b.name}>{brandPill(b, brandsFrom + k)}</React.Fragment>
              ))}
            </div>
          </section>
        </div>
      </>
    );
  } else if (results?.empty) {
    body = (
      <p className="dp-rch-info">
        Aucun résultat pour «&nbsp;{debounced.trim()}&nbsp;».
        <br />
        Essayez une note (oud, vanille, ambre) ou une maison.
      </p>
    );
  } else if (results) {
    const productsFrom = 0;
    const brandsFrom = results.products.length;
    const notesFrom = brandsFrom + results.brands.length;

    body = (
      <>
        {single ? (
          <section className="dp-rch-block">
            <h3>Votre parfum</h3>
            {sheet(single)}
          </section>
        ) : results.products.length > 0 ? (
          <section className="dp-rch-block">
            <h3>Parfums</h3>
            {rail(results.products, productsFrom)}
          </section>
        ) : null}

        {results.brands.length > 0 && (
          <section className="dp-rch-block">
            <h3>Maisons</h3>
            <div className="dp-rch-brands">
              {results.brands.map((b, k) => (
                <React.Fragment key={b.name}>{brandPill(b, brandsFrom + k)}</React.Fragment>
              ))}
            </div>
          </section>
        )}

        {results.notes.length > 0 && (
          <section className="dp-rch-block">
            <h3>Notes olfactives</h3>
            <div className="dp-rch-chips">
              {results.notes.map((n, k) => (
                <React.Fragment key={n.key}>{noteChip(n, notesFrom + k)}</React.Fragment>
              ))}
            </div>
          </section>
        )}

        <button type="button" className="dp-rch-all" onClick={seeAll}>
          Voir tous les résultats pour «&nbsp;{debounced.trim()}&nbsp;»
        </button>
      </>
    );
  }

  // ── Rendu ──────────────────────────────────────────────────────────────────

  return (
    <div className="dp-rch">
      <style>{CSS}</style>

      <div className="dp-rch-veil" onClick={close} />

      <div className="dp-rch-panel" role="dialog" aria-modal="true" aria-label="Recherche">
        <div className="dp-rch-bar">
          {/* Une recherche en cours : la loupe cède la place à une flèche de retour.
              Cliquer une note remplit le champ — il faut pouvoir en revenir sans
              vider le champ caractère par caractère. */}
          {query ? (
            <button
              type="button"
              className="dp-rch-icon dp-rch-back"
              aria-label="Revenir à l'accueil de la recherche"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
            >
              <IconBack />
            </button>
          ) : (
            <span className="dp-rch-loupe" aria-hidden="true">
              <IconLoupe />
            </span>
          )}

          <input
            ref={inputRef}
            type="search"
            className="dp-rch-input"
            placeholder={listening ? "Parlez…" : "Un parfum, une maison, une note…"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            spellCheck={false}
            aria-label="Rechercher un parfum, une maison ou une note"
            role="combobox"
            aria-expanded={entries.length > 0}
            aria-controls="dp-rch-list"
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `dp-rch-opt-${active}` : undefined}
          />

          {speechSupported && (
            <button
              type="button"
              className={`dp-rch-icon${listening ? " listening" : ""}`}
              aria-label={listening ? "Arrêter la dictée" : "Dicter ma recherche"}
              aria-pressed={listening}
              onClick={toggleDictation}
            >
              <IconMic />
            </button>
          )}

          <button
            type="button"
            className="dp-rch-icon"
            aria-label="Rechercher à partir d'une photo"
            onClick={() => fileRef.current?.click()}
          >
            <IconCamera />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPhoto}
            hidden
            tabIndex={-1}
            aria-hidden="true"
          />

          <button type="button" className="dp-rch-close" onClick={close}>
            Fermer
          </button>
        </div>

        {micError && <p className="dp-rch-alert">{micError}</p>}

        <div className="dp-rch-body" id="dp-rch-list" role="listbox" aria-label="Résultats de recherche">
          {body}
        </div>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
// Tout est bâti sur les tokens du design system (globals.css). z-index : la
// superposition passe au-dessus des drawers, comme les toasts (cf. la hiérarchie
// « Z — hiérarchie globale » de globals.css).

const CSS = `
.dp-rch { position: fixed; inset: 0; z-index: 1150; font-family: var(--font-sans); }
.dp-rch-veil {
  position: absolute; inset: 0;
  background: rgba(21,16,11,.55);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  animation: dp-rch-fade var(--dur) var(--ease-out);
}
.dp-rch-panel {
  position: relative; margin: 0 auto;
  max-width: 1040px; width: calc(100% - 32px);
  margin-top: min(7vh, 72px);
  max-height: min(84vh, 820px);
  display: flex; flex-direction: column;
  background: var(--surface-page);
  border: 1px solid var(--line-200);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: dp-rch-rise var(--dur) var(--ease-out);
}
@keyframes dp-rch-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes dp-rch-rise { from { opacity: 0; transform: translateY(-12px) } to { opacity: 1; transform: none } }

/* ── Barre ── */
.dp-rch-bar {
  display: flex; align-items: center; gap: 6px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--line-100);
  background: var(--surface-white);
}
.dp-rch-loupe { display: flex; color: var(--gold-700); padding: 0 4px; }
.dp-rch-back { color: var(--gold-700); }
.dp-rch-input {
  flex: 1; min-width: 0;
  background: none; border: none; outline: none;
  font-family: var(--font-sans); font-size: 17px; font-weight: var(--fw-regular);
  color: var(--ink-900); padding: 8px 4px;
}
.dp-rch-input::placeholder { color: var(--ink-400); }
.dp-rch-input::-webkit-search-cancel-button { display: none; }
/* La règle globale :focus-visible de globals.css pose un anneau doré sur tout élément
   focusé. Ici le champ occupe déjà toute la barre : l'anneau redessinait un
   cadre par-dessus le cadre de la superposition. Le curseur clignotant suffit
   à dire où l'on écrit, et le champ prend le focus dès l'ouverture. */
.dp-rch-input:focus-visible, .dp-rch-input:focus { outline: none; box-shadow: none; }
.dp-rch-icon {
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; cursor: pointer;
  color: var(--ink-500); padding: 8px; border-radius: var(--r-sm);
  transition: color var(--dur-fast), background var(--dur-fast);
}
.dp-rch-icon:hover { color: var(--gold-700); background: var(--surface-cream); }
.dp-rch-icon.listening { color: var(--gold-500); animation: dp-rch-pulse 1.1s ease-in-out infinite; }
@keyframes dp-rch-pulse { 0%,100% { opacity: 1 } 50% { opacity: .45 } }
.dp-rch-close {
  background: none; border: 1px solid var(--line-200); cursor: pointer;
  font-family: var(--font-sans); font-size: var(--t-xs); font-weight: var(--fw-medium);
  text-transform: uppercase; letter-spacing: var(--ls-wide);
  color: var(--ink-700); padding: 8px 12px; border-radius: var(--r-pill);
  margin-left: 4px; white-space: nowrap;
  transition: border-color var(--dur-fast), color var(--dur-fast);
}
.dp-rch-close:hover { border-color: var(--gold-500); color: var(--gold-700); }

.dp-rch-alert {
  margin: 0; padding: 10px 18px;
  background: var(--surface-cream); color: var(--ink-700);
  font-size: var(--t-sm); border-bottom: 1px solid var(--line-100);
}

/* ── Corps ── */
.dp-rch-body { overflow-y: auto; padding: 8px 18px 22px; }
.dp-rch-info {
  padding: 44px 8px; text-align: center;
  color: var(--ink-500); font-size: var(--t-body); line-height: var(--lh-relaxed);
}
.dp-rch-block { padding-top: 16px; }
.dp-rch-block h3 {
  margin: 0 0 10px; font-family: var(--font-sans);
  font-size: var(--t-xs); font-weight: var(--fw-semibold);
  text-transform: uppercase; letter-spacing: var(--ls-wider);
  color: var(--ink-400);
}
.dp-rch-duo { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
.dp-rch-mark { background: var(--gold-100); color: var(--ink-900); border-radius: 2px; padding: 0 1px; }

/* ── Rail de cartes ── */
.dp-rch-railwrap { position: relative; }
.dp-rch-rail {
  display: flex; gap: 12px; overflow-x: auto; scroll-behavior: smooth;
  padding-bottom: 6px; scrollbar-width: none;
}
.dp-rch-rail::-webkit-scrollbar { display: none; }
.dp-rch-arrow {
  position: absolute; top: 40%; z-index: 2;
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface-white); border: 1px solid var(--line-200);
  color: var(--ink-700); cursor: pointer; box-shadow: var(--shadow-sm);
  transition: opacity var(--dur), color var(--dur-fast);
}
.dp-rch-arrow:hover { color: var(--gold-700); }
.dp-rch-arrow.prev { left: -6px; transform: rotate(180deg); }
.dp-rch-arrow.next { right: -6px; }
.dp-rch-arrow.off { opacity: 0; pointer-events: none; }

.dp-rch-card {
  flex: 0 0 auto; width: 132px;
  display: flex; flex-direction: column; gap: 2px;
  background: none; border: none; padding: 6px; cursor: pointer;
  text-align: left; border-radius: var(--r-md);
  transition: background var(--dur-fast);
}
.dp-rch-card:hover, .dp-rch-card.on { background: var(--surface-cream); }
.dp-rch-card-vis {
  position: relative; display: block; width: 120px; height: 120px;
  border-radius: var(--r-md); overflow: hidden;
  background: var(--surface-image);
  display: flex; align-items: center; justify-content: center;
}
.dp-rch-card-vis img, .dp-rch-card-vis video { width: 100%; height: 100%; object-fit: cover; }
.dp-rch-card-vis b { font-family: var(--font-display); font-size: 30px; color: var(--gold-500); }
.dp-rch-card-ko {
  position: absolute; left: 6px; bottom: 6px;
  background: var(--badge-dark-bg); color: var(--badge-dark-fg);
  font-size: 9px; font-style: normal; letter-spacing: var(--ls-wide);
  text-transform: uppercase; padding: 3px 6px; border-radius: var(--r-sm);
}
.dp-rch-card-name {
  margin-top: 6px; font-family: var(--font-display);
  font-size: var(--t-serif-md); line-height: var(--lh-snug); color: var(--ink-900);
}
.dp-rch-card-sub { font-size: var(--t-xs); color: var(--ink-400); text-transform: uppercase; letter-spacing: var(--ls-wide); }
.dp-rch-card-price { font-size: var(--t-sm); font-weight: var(--fw-medium); color: var(--price); }

/* ── Pastilles de maison ── */
.dp-rch-brands { display: flex; flex-wrap: wrap; gap: 8px; }
.dp-rch-brand {
  display: flex; align-items: center; gap: 8px;
  background: var(--surface-white); border: 1px solid var(--line-100);
  border-radius: var(--r-pill); padding: 5px 14px 5px 5px; cursor: pointer;
  transition: border-color var(--dur-fast), background var(--dur-fast);
}
.dp-rch-brand:hover, .dp-rch-brand.on { border-color: var(--gold-300); background: var(--surface-cream); }
.dp-rch-brand-vis {
  width: 34px; height: 34px; border-radius: 50%; overflow: hidden;
  background: var(--surface-image); flex: 0 0 auto;
  display: flex; align-items: center; justify-content: center;
}
.dp-rch-brand-vis { background: var(--surface-white); }
.dp-rch-brand-vis img { width: 100%; height: 100%; object-fit: contain; padding: 2px; }
.dp-rch-brand-vis b { font-family: var(--font-display); color: var(--gold-500); }
.dp-rch-brand-txt {
  font-size: var(--t-body); color: var(--ink-900);
  display: flex; align-items: baseline; gap: 6px;
}
.dp-rch-brand-txt i { font-style: normal; font-size: var(--t-xs); color: var(--ink-400); }

/* ── Pastilles de note ── */
.dp-rch-chips { display: flex; flex-wrap: wrap; gap: 7px; }
.dp-rch-chip {
  display: inline-flex; align-items: baseline; gap: 6px;
  background: var(--surface-white); border: 1px solid var(--line-100);
  border-radius: var(--r-pill); padding: 7px 13px; cursor: pointer;
  font-size: var(--t-sm); color: var(--ink-700);
  transition: border-color var(--dur-fast), color var(--dur-fast), background var(--dur-fast);
}
.dp-rch-chip:hover, .dp-rch-chip.on { border-color: var(--gold-300); background: var(--surface-cream); color: var(--ink-900); }
.dp-rch-chip i { font-style: normal; font-size: var(--t-xs); color: var(--ink-400); }

/* ── Fiche ── */
.dp-rch-sheet {
  display: grid; grid-template-columns: 300px 1fr; gap: 22px;
  background: var(--surface-white); border: 1px solid var(--line-100);
  border-radius: var(--r-lg); padding: 16px;
}
.dp-rch-sheet-media {
  position: relative; border-radius: var(--r-md); overflow: hidden;
  background: var(--surface-image); aspect-ratio: 1;
  display: flex; align-items: center; justify-content: center;
}
.dp-rch-sheet-media video { width: 100%; height: 100%; object-fit: cover; }
.dp-rch-sheet-media b { font-family: var(--font-display); font-size: 64px; color: var(--gold-500); }
.dp-rch-live {
  position: absolute; left: 10px; top: 10px;
  background: var(--badge-dark-bg); color: var(--badge-dark-fg);
  font-style: normal; font-size: 10px; letter-spacing: var(--ls-wide);
  text-transform: uppercase; padding: 3px 8px; border-radius: var(--r-pill);
}
.dp-rch-sheet-info { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.dp-rch-sheet-brand {
  align-self: flex-start; background: none; border: none; cursor: pointer; padding: 0;
  font-size: var(--t-xs); text-transform: uppercase; letter-spacing: var(--ls-wider);
  color: var(--gold-700); display: flex; align-items: baseline; gap: 8px;
}
.dp-rch-sheet-brand span { color: var(--ink-400); letter-spacing: var(--ls-normal); text-transform: none; font-size: var(--t-xs); }
.dp-rch-sheet-brand:hover span { color: var(--gold-700); }
.dp-rch-sheet-name {
  margin: 0; font-family: var(--font-display);
  font-size: var(--t-title); font-weight: var(--fw-regular);
  line-height: var(--lh-snug); color: var(--ink-900);
}
.dp-rch-sheet-price {
  margin: 0; display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
  font-size: var(--t-lead); font-weight: var(--fw-medium); color: var(--price);
}
.dp-rch-sheet-price s { color: var(--price-was); font-weight: var(--fw-regular); font-size: var(--t-sm); }
.dp-rch-stock {
  font-size: var(--t-xs); font-weight: var(--fw-medium);
  text-transform: uppercase; letter-spacing: var(--ls-wide);
  padding: 3px 9px; border-radius: var(--r-pill);
}
.dp-rch-stock.ok { background: rgba(79,122,82,.12); color: var(--success); }
.dp-rch-stock.ko { background: var(--surface-cream-2); color: var(--ink-500); }
.dp-rch-sheet-family {
  margin: 2px 0 0; font-size: var(--t-sm); line-height: var(--lh-relaxed); color: var(--ink-500);
}
.dp-rch-sheet-family b { color: var(--ink-900); font-weight: var(--fw-semibold); }
.dp-rch-sheet-block h5 {
  margin: 8px 0 6px; font-size: var(--t-xs); font-weight: var(--fw-semibold);
  text-transform: uppercase; letter-spacing: var(--ls-wider); color: var(--ink-400);
}
.dp-rch-pyramid { display: flex; gap: 10px; font-size: var(--t-sm); padding: 2px 0; }
.dp-rch-pyramid dt {
  flex: 0 0 46px; color: var(--gold-700);
  text-transform: uppercase; font-size: var(--t-xs); letter-spacing: var(--ls-wide);
  padding-top: 1px;
}
.dp-rch-pyramid dd { margin: 0; color: var(--ink-700); }
.dp-rch-sheet-notes { display: flex; flex-wrap: wrap; gap: 6px; }
.dp-rch-note {
  font-size: var(--t-sm); color: var(--ink-700);
  background: var(--surface-cream); border-radius: var(--r-pill); padding: 4px 11px;
}
.dp-rch-facts { display: flex; flex-wrap: wrap; gap: 18px; margin: 8px 0 0; }
.dp-rch-facts dt {
  font-size: var(--t-xs); text-transform: uppercase;
  letter-spacing: var(--ls-wide); color: var(--ink-400);
}
.dp-rch-facts dd { margin: 2px 0 0; font-size: var(--t-sm); color: var(--ink-900); }
.dp-rch-sheet-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 12px; }
.dp-rch-qty {
  display: inline-flex; align-items: center; gap: 2px;
  border: 1px solid var(--line-200); border-radius: var(--r-pill); padding: 2px;
}
.dp-rch-qty button {
  width: 28px; height: 28px; border: none; background: none; cursor: pointer;
  color: var(--ink-700); font-size: 15px; border-radius: 50%;
}
.dp-rch-qty button:hover { background: var(--surface-cream); color: var(--gold-700); }
.dp-rch-qty b { min-width: 20px; text-align: center; font-weight: var(--fw-medium); font-size: var(--t-sm); }
.dp-rch-add {
  background: var(--gradient-gold); color: var(--espresso-900);
  border: none; border-radius: var(--r-pill); cursor: pointer;
  font-family: var(--font-sans); font-size: var(--t-sm); font-weight: var(--fw-semibold);
  text-transform: uppercase; letter-spacing: var(--ls-wide);
  padding: 11px 22px; box-shadow: var(--shadow-gold);
  transition: filter var(--dur-fast), opacity var(--dur-fast);
}
.dp-rch-add:hover:not(:disabled) { filter: brightness(1.06); }
.dp-rch-add:disabled { opacity: .6; cursor: default; box-shadow: none; }
.dp-rch-see, .dp-rch-ghost {
  background: none; border: 1px solid var(--line-200); border-radius: var(--r-pill);
  cursor: pointer; font-family: var(--font-sans); font-size: var(--t-sm);
  color: var(--ink-700); padding: 10px 18px;
  transition: border-color var(--dur-fast), color var(--dur-fast);
}
.dp-rch-see:hover, .dp-rch-ghost:hover { border-color: var(--gold-500); color: var(--gold-700); }

/* ── Photo ── */
.dp-rch-photo { display: grid; grid-template-columns: 220px 1fr; gap: 20px; align-items: start; }
.dp-rch-photo img { width: 100%; border-radius: var(--r-md); border: 1px solid var(--line-100); }
.dp-rch-photo h4 {
  margin: 0 0 8px; font-family: var(--font-display);
  font-size: var(--t-serif-lg); font-weight: var(--fw-regular); color: var(--ink-900);
}
.dp-rch-photo p { margin: 0 0 14px; font-size: var(--t-sm); line-height: var(--lh-relaxed); color: var(--ink-500); }
.dp-rch-cta {
  display: inline-block; background: var(--gradient-gold); color: var(--espresso-900);
  border-radius: var(--r-pill); padding: 11px 22px; margin-right: 10px;
  font-size: var(--t-sm); font-weight: var(--fw-semibold);
  text-transform: uppercase; letter-spacing: var(--ls-wide); text-decoration: none;
}

/* ── Voir tous les résultats ── */
.dp-rch-all {
  display: block; width: 100%; margin-top: 20px;
  background: var(--surface-cream); border: 1px solid var(--line-100);
  border-radius: var(--r-md); cursor: pointer;
  font-family: var(--font-sans); font-size: var(--t-sm); color: var(--ink-700);
  padding: 13px; transition: border-color var(--dur-fast), color var(--dur-fast);
}
.dp-rch-all:hover { border-color: var(--gold-300); color: var(--gold-700); }

/* ── Portable ── */
@media (max-width: 760px) {
  .dp-rch-panel { width: 100%; margin-top: 0; max-height: 100vh; height: 100vh; border-radius: 0; border: none; }
  .dp-rch-duo { grid-template-columns: 1fr; gap: 0; }
  .dp-rch-sheet { grid-template-columns: 1fr; }
  .dp-rch-sheet-media { max-height: 220px; }
  .dp-rch-photo { grid-template-columns: 1fr; }
  .dp-rch-close { display: none; }
  .dp-rch-arrow { display: none; }
}
`;
