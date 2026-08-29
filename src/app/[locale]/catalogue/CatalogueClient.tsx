"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import GridDensity from "@/components/ui/GridDensity";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { addItem } from "@/lib/cart";

/**
 * Interface du catalogue — filtres, tri, densité, pagination.
 *
 * Tout l'état vit ici et nulle part ailleurs : aucun filtre n'est poussé dans
 * l'URL. C'est un choix, pas un oubli. Cocher trois marques puis décocher la
 * deuxième produirait trois entrées d'historique dont aucune ne correspond à ce
 * que le visiteur voulait garder, et le bouton « retour » du navigateur
 * deviendrait un « annuler » approximatif. Seul le point d'ENTRÉE se lit dans
 * l'URL (`?marque=`, résolu côté serveur), parce que celui-là vient d'un lien.
 */

export type CatalogueRow = {
  id: string;
  slug: string;
  href: string;
  name: string;
  brand: string;
  image: string | null;
  price: number | null;
  compareAtPrice: number | null;
  available: boolean;
  /** clé de famille (`frais`/`floral`/`ambre`/`boise`), "" si indéterminable */
  familyKey: string;
  familyLabel: string | null;
  volume: string | null;
  concentration: string | null;
  gender: string;
  popularity: number;
  stockLeft: number;
  badge: "new" | "best" | null;
};

/**
 * 12 par page : la grille tient 3 à 4 colonnes en large, donc trois à quatre
 * rangées pleines — assez pour que la pagination existe sur un catalogue de
 * quelques dizaines de références, pas assez pour qu'elle en compte dix pages.
 * En dessous de ce seuil, la pagination ne s'affiche pas du tout : une
 * pagination « Page 1 sur 1 » est un ornement qui ment sur la profondeur.
 */
const PER_PAGE = 12;

/**
 * Choix offerts pour le nombre de cartes par page. « Tout » vaut `Infinity` :
 * sur un catalogue de quelques dizaines de références, celui qui veut tout
 * voir d'un coup ne devrait pas avoir à cliquer trois fois — et la pagination
 * disparaît alors d'elle-même, puisqu'elle ne compte plus qu'une page.
 */
const PER_PAGE_OPTIONS: { value: number; label: string }[] = [
  { value: 12, label: "12" },
  { value: 24, label: "24" },
  { value: 48, label: "48" },
  { value: Number.POSITIVE_INFINITY, label: "Tout" },
];

const PER_PAGE_KEY = "dp-perpage-catalogue";

/** Nombre de mensualités de la facilité de paiement affichée sur la carte. */
const INSTALMENTS = 4;

type SortKey = "popularite" | "prix-asc" | "prix-desc" | "nom";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "popularite", label: "Popularité" },
  { key: "prix-asc", label: "Prix croissant" },
  { key: "prix-desc", label: "Prix décroissant" },
  { key: "nom", label: "Nom A→Z" },
];

/**
 * Rayons du site vers lesquels renvoyer en bas de page. Chaque route a été
 * appelée avant d'être écrite ici : une pastille qui tombe en 404 fait plus de
 * mal qu'une pastille absente.
 */
const EXPLORE: { label: string; sub: string; href: string }[] = [
  { label: "Parfums Femme", sub: "Floraux & orientaux", href: "/parfums-femme" },
  { label: "Parfums Homme", sub: "Boisés & cuirs", href: "/parfums-homme" },
  { label: "Huile de Parfum", sub: "Concentrés sans alcool", href: "/huile-de-parfum" },
  { label: "Les maisons", sub: "Toutes les marques", href: "/marques" },
  { label: "Maison Reef", sub: "La collection entière", href: "/marques/reef" },
  { label: "Promo flash", sub: "Prix cassés du moment", href: "/promo-flash" },
  { label: "Lot 3 pour 2", sub: "Le troisième offert", href: "/offres/lot-3-pour-2" },
  { label: "Commande à la demande", sub: "Une référence introuvable ?", href: "/commande-a-la-demande" },
  { label: "Le journal", sub: "Guides & culture du parfum", href: "/blog" },
];

const eur = (n: number) =>
  `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

// ─── Filtrage ────────────────────────────────────────────────────────────────

type Filters = {
  brands: Set<string>;
  families: Set<string>;
  genders: Set<string>;
  concentrations: Set<string>;
  stockOnly: boolean;
  min: number | null;
  max: number | null;
};

/** Dimension volontairement ignorée, pour le calcul des compteurs de facette. */
type Dimension = "brands" | "families" | "genders" | "concentrations" | "stockOnly" | "price";

/**
 * Un seul prédicat pour l'affichage ET pour les compteurs, avec une dimension
 * neutralisable. C'est ce qui garde les compteurs honnêtes : le nombre affiché
 * en face de « Lattafa » doit être le nombre de flacons qu'on obtiendrait EN
 * COCHANT Lattafa — donc en tenant compte de la famille et du budget déjà
 * choisis, mais pas des autres marques cochées. Recompter avec un second
 * prédicat aurait fait diverger les deux à la première évolution.
 */
function keep(r: CatalogueRow, f: Filters, skip?: Dimension): boolean {
  if (skip !== "brands" && f.brands.size && !f.brands.has(r.brand)) return false;
  if (skip !== "families" && f.families.size && !f.families.has(r.familyKey)) return false;
  if (skip !== "genders" && f.genders.size && !f.genders.has(r.gender)) return false;
  if (skip !== "concentrations" && f.concentrations.size) {
    if (!r.concentration || !f.concentrations.has(r.concentration)) return false;
  }
  if (skip !== "stockOnly" && f.stockOnly && !r.available) return false;
  if (skip !== "price") {
    if (f.min !== null && (r.price === null || r.price < f.min)) return false;
    if (f.max !== null && (r.price === null || r.price > f.max)) return false;
  }
  return true;
}

/** Compte par valeur d'une facette, toutes les AUTRES facettes appliquées. */
function facetCounts(
  rows: CatalogueRow[],
  f: Filters,
  dim: Dimension,
  valueOf: (r: CatalogueRow) => string | null
): Map<string, number> {
  const out = new Map<string, number>();
  for (const r of rows) {
    if (!keep(r, f, dim)) continue;
    const v = valueOf(r);
    if (!v) continue;
    out.set(v, (out.get(v) ?? 0) + 1);
  }
  return out;
}

// ─── Ajout au panier ─────────────────────────────────────────────────────────

/** Délai avant « Ajouté ✓ » — repris de `RailProductCard`, même ressenti. */
const ADD_FEEDBACK_MS = 500;
/** Durée d'affichage de la confirmation avant retour au libellé de repos. */
const ADD_RESET_MS = 1600;

/**
 * Bloc quantité + ajout, extrait en composant à part parce qu'il porte trois
 * états (quantité, « ajout en cours », « ajouté ») et qu'un état par carte ne
 * peut pas vivre dans la boucle de rendu du parent : ce serait un appel de hook
 * dans une boucle. C'est le même découpage que `RailProductCard`.
 *
 * Le contrat d'ajout est celui de `src/lib/cart.ts` — `addItem({ id, name,
 * brand, price, image }, qty)`, qui écrit dans `localStorage["dp_cart"]` et
 * émet `dp-cart-change`, l'événement auquel l'en-tête est abonné. Rien n'est
 * simulé ici : le compteur du panier bouge vraiment.
 */
function CartControls({ row }: { row: CatalogueRow }) {
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // La carte peut disparaître de la grille pendant le compte à rebours (un
  // filtre coché, un changement de page) : sans ce nettoyage, le `setState`
  // différé tomberait sur un composant démonté.
  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const handleAdd = useCallback(() => {
    if (adding || !row.available || row.price === null) return;
    setAdding(true);
    addItem(
      { id: row.id, name: row.name, brand: row.brand, price: row.price, image: row.image ?? "" },
      qty
    );
    timers.current.push(
      setTimeout(() => {
        setAdding(false);
        setAdded(true);
        timers.current.push(setTimeout(() => setAdded(false), ADD_RESET_MS));
      }, ADD_FEEDBACK_MS)
    );
  }, [adding, qty, row]);

  const sellable = row.available && row.price !== null;

  return (
    <div className="cat-cart">
      {/* Stepper sur sa propre ligne, comme `RailProductCard` : à six colonnes
          la carte descend sous 180px, et un stepper posé à côté du bouton y
          couperait le libellé en deux lignes. La requête de conteneur plus bas
          le retire complètement quand même cette ligne devient trop étroite. */}
      {sellable && (
        <div className="cat-cart-qty">
          <QtyStepper value={qty} onChange={setQty} size="xs" />
        </div>
      )}
      <button
        type="button"
        className="cat-add"
        disabled={!sellable}
        // Le bouton est FRÈRE des liens de la carte, jamais imbriqué dedans :
        // un `<button>` dans un `<a>` est invalide et navigue au clic. Les deux
        // coupures restent utiles si un ancêtre cliquable apparaît un jour.
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleAdd();
        }}
        aria-label={
          sellable ? `Ajouter au panier — ${row.name} (×${qty})` : `${row.name} — indisponible`
        }
      >
        {!sellable ? (
          "Indisponible"
        ) : adding ? (
          "Ajout…"
        ) : added ? (
          "Ajouté ✓"
        ) : (
          <>
            {/* Deux libellés, un seul visible : la requête de conteneur bascule
                sur « Panier » quand la carte n'a plus la largeur du long. */}
            <span className="cat-add-long">Ajouter au panier</span>
            <span className="cat-add-short">Panier</span>
          </>
        )}
      </button>
      <span className="cat-sr" aria-live="polite">
        {added ? `Ajouté au panier — ${row.name}` : ""}
      </span>
    </div>
  );
}

// ─── Composant ───────────────────────────────────────────────────────────────

export default function CatalogueClient({
  rows,
  initialBrand,
}: {
  rows: CatalogueRow[];
  /** Maison pré-cochée quand on arrive depuis `/marques` via `?marque=`. */
  initialBrand: string | null;
}) {
  const [brands, setBrands] = useState<Set<string>>(
    () => new Set(initialBrand ? [initialBrand] : [])
  );
  const [families, setFamilies] = useState<Set<string>>(() => new Set());
  const [genders, setGenders] = useState<Set<string>>(() => new Set());
  const [concentrations, setConcentrations] = useState<Set<string>>(() => new Set());
  const [stockOnly, setStockOnly] = useState(false);
  const [min, setMin] = useState<number | null>(null);
  const [max, setMax] = useState<number | null>(null);
  // Les champs de prix gardent leur saisie brute tant qu'on n'a pas validé :
  // filtrer à chaque frappe vide la grille dès le premier chiffre de « 50 ».
  const [minDraft, setMinDraft] = useState("");
  const [maxDraft, setMaxDraft] = useState("");
  const [sort, setSort] = useState<SortKey>("popularite");
  const [page, setPage] = useState(1);
  // `PER_PAGE` sert de valeur de départ côté serveur : lire localStorage au
  // premier rendu ferait diverger le HTML et son hydratation.
  const [perPage, setPerPage] = useState<number>(PER_PAGE);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PER_PAGE_KEY);
      if (raw === "all") return setPerPage(Number.POSITIVE_INFINITY);
      const n = Number.parseInt(raw ?? "", 10);
      if (PER_PAGE_OPTIONS.some((o) => o.value === n)) setPerPage(n);
    } catch {
      // Stockage bloqué : on garde la valeur par défaut.
    }
  }, []);

  const changePerPage = useCallback((n: number) => {
    setPerPage(n);
    // Revenir en page 1 : rester en « page 3 » après être passé à 48 par page
    // afficherait une page vide sans dire pourquoi.
    setPage(1);
    try {
      window.localStorage.setItem(PER_PAGE_KEY, Number.isFinite(n) ? String(n) : "all");
    } catch {
      // Le réglage vaut pour la visite en cours.
    }
  }, []);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());

  // ── Chiffres de tête : tout se déduit du catalogue reçu ──
  const stats = useMemo(() => {
    const prices = rows.map((r) => r.price).filter((n): n is number => n !== null);
    return {
      total: rows.length,
      houses: new Set(rows.map((r) => r.brand)).size,
      priceMin: prices.length ? Math.min(...prices) : 0,
      priceMax: prices.length ? Math.max(...prices) : 0,
    };
  }, [rows]);

  const filters: Filters = useMemo(
    () => ({ brands, families, genders, concentrations, stockOnly, min, max }),
    [brands, families, genders, concentrations, stockOnly, min, max]
  );

  // ── Facettes ──
  const brandCounts = useMemo(
    () => facetCounts(rows, filters, "brands", (r) => r.brand),
    [rows, filters]
  );
  const familyCounts = useMemo(
    () => facetCounts(rows, filters, "families", (r) => r.familyKey || null),
    [rows, filters]
  );
  const genderCounts = useMemo(
    () => facetCounts(rows, filters, "genders", (r) => r.gender),
    [rows, filters]
  );
  const concentrationCounts = useMemo(
    () => facetCounts(rows, filters, "concentrations", (r) => r.concentration),
    [rows, filters]
  );
  const inStockCount = useMemo(
    () => rows.filter((r) => keep(r, filters, "stockOnly") && r.available).length,
    [rows, filters]
  );
  /** Total quand on ne filtre PAS par famille : la pastille « Toutes ». */
  const allFamiliesCount = useMemo(
    () => rows.filter((r) => keep(r, filters, "families")).length,
    [rows, filters]
  );

  /** Libellé lisible d'une famille, repris de la ligne qui la porte. */
  const familyLabels = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of rows) if (r.familyKey && r.familyLabel) m.set(r.familyKey, r.familyLabel);
    return m;
  }, [rows]);

  const visible = useMemo(() => {
    const list = rows.filter((r) => keep(r, filters));
    // Un prix manquant ne doit jamais remonter en tête d'un tri par prix : il
    // part au bout dans les deux sens, plutôt que de valoir 0 en croissant.
    const byPrice = (dir: 1 | -1) => (a: CatalogueRow, b: CatalogueRow) => {
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return (a.price - b.price) * dir;
    };
    switch (sort) {
      case "prix-asc":
        return [...list].sort(byPrice(1));
      case "prix-desc":
        return [...list].sort(byPrice(-1));
      case "nom":
        return [...list].sort((a, b) => a.name.localeCompare(b.name, "fr"));
      default:
        return [...list].sort((a, b) => b.popularity - a.popularity);
    }
  }, [rows, filters, sort]);

  const pageCount = Math.max(1, Math.ceil(visible.length / perPage));
  // Page bornée au rendu plutôt que remise à 1 par un effet : un filtre qui
  // réduit le résultat à une page ne doit pas provoquer un second rendu.
  const current = Math.min(page, pageCount);
  const shown = Number.isFinite(perPage)
    ? visible.slice((current - 1) * perPage, current * perPage)
    : visible;

  // ── Actions ──
  const toggleIn = (
    set: Set<string>,
    setter: (s: Set<string>) => void,
    value: string
  ) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
    setPage(1);
  };

  const resetAll = () => {
    setBrands(new Set());
    setFamilies(new Set());
    setGenders(new Set());
    setConcentrations(new Set());
    setStockOnly(false);
    setMin(null);
    setMax(null);
    setMinDraft("");
    setMaxDraft("");
    setPage(1);
  };

  const activeCount =
    brands.size +
    families.size +
    genders.size +
    concentrations.size +
    (stockOnly ? 1 : 0) +
    (min !== null || max !== null ? 1 : 0);

  const applyPrice = () => {
    const parse = (s: string) => {
      const n = Number.parseFloat(s.replace(",", "."));
      return Number.isFinite(n) ? n : null;
    };
    const lo = parse(minDraft);
    const hi = parse(maxDraft);
    // Bornes inversées : on les remet dans l'ordre plutôt que de ne rien
    // afficher — « de 80 à 20 » est une faute de frappe, pas une intention.
    setMin(lo !== null && hi !== null ? Math.min(lo, hi) : lo);
    setMax(lo !== null && hi !== null ? Math.max(lo, hi) : hi);
    setPage(1);
  };

  const isOpen = (key: string) => openSections[key] !== false;
  const toggleSection = (key: string) =>
    setOpenSections((s) => ({ ...s, [key]: isOpen(key) ? false : true }));

  // ── Fragments réutilisés ──
  const section = (key: string, title: string, body: React.ReactNode) => (
    <div className="cat-sec">
      <button type="button" className="cat-sec-h" onClick={() => toggleSection(key)} aria-expanded={isOpen(key)}>
        <span>{title}</span>
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ transform: isOpen(key) ? "rotate(180deg)" : "none", transition: "transform .18s ease" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {isOpen(key) && <div className="cat-sec-b">{body}</div>}
    </div>
  );

  const checkRow = (
    label: string,
    count: number,
    checked: boolean,
    onChange: () => void
  ) => (
    <label key={label} className={`cat-check${count === 0 && !checked ? " cat-check-off" : ""}`}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="cat-check-lbl">{label}</span>
      <span className="cat-check-n">{count}</span>
    </label>
  );

  return (
    <div style={{ background: "var(--surface-page)", minHeight: "100vh", fontFamily: "var(--font-sans)" }}>
      {/* ── Fil d'ariane ── */}
      <nav
        aria-label="Fil d'ariane"
        className="cat-wrap"
        style={{ display: "flex", gap: 7, alignItems: "center", padding: "18px 24px 0", fontSize: "0.72rem", color: "var(--ink-400)" }}
      >
        <Link href="/" style={{ color: "var(--ink-400)", textDecoration: "none" }}>
          Accueil
        </Link>
        <span aria-hidden="true">›</span>
        <span style={{ color: "var(--ink-700)" }}>Boutique</span>
      </nav>

      {/* ── Bandeau de tête ── */}
      <section style={{ background: "var(--espresso-900)", padding: "56px 24px 48px", textAlign: "center", marginTop: 18 }}>
        <div style={{ fontSize: "0.62rem", letterSpacing: "0.26em", textTransform: "uppercase", color: "var(--gold-500)", marginBottom: 16 }}>
          Catalogue · {stats.total} parfums
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.3rem, 5vw, 3.5rem)",
            fontWeight: 500,
            color: "var(--on-dark-strong)",
            margin: "0 0 16px",
            lineHeight: 1.12,
          }}
        >
          Tous les <em style={{ color: "var(--gold-500)" }}>parfums</em>
        </h1>
        <p style={{ color: "var(--on-dark-muted)", fontSize: "0.95rem", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
          Le catalogue entier, filtrable par marque, famille olfactive, genre et budget.
        </p>

        <div className="cat-stats">
          {[
            { n: String(stats.total), l: "références" },
            { n: String(stats.houses), l: "maisons" },
            // Plancher arrondi vers le bas, plafond vers le haut : arrondir au
            // plus proche annoncerait « à partir de 17 € » pour un flacon à
            // 16,90 € — la fourchette doit contenir le catalogue, pas le rogner.
            { n: `${Math.floor(stats.priceMin)}–${Math.ceil(stats.priceMax)} €`, l: "fourchette de prix" },
          ].map((s) => (
            <div key={s.l}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 600, color: "var(--gold-300)", lineHeight: 1.1 }}>
                {s.n}
              </div>
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--on-dark-muted)", marginTop: 7 }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="cat-wrap" style={{ padding: "30px 24px 64px" }}>
        {/* ── Barre de résultats ── */}
        <div className="cat-resbar">
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", color: "var(--ink-900)" }}>
            <strong style={{ fontWeight: 600 }}>{visible.length}</strong> parfum{visible.length > 1 ? "s" : ""}
          </span>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.72rem", color: "var(--ink-500)" }}>
            <span style={{ letterSpacing: "0.12em", textTransform: "uppercase", fontSize: "0.62rem", color: "var(--ink-400)" }}>Trier :</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortKey);
                setPage(1);
              }}
              className="cat-select"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* ── Pastilles de familles ── */}
        <div className="cat-fams" role="group" aria-label="Familles olfactives">
          <button
            type="button"
            className={`cat-fam${families.size === 0 ? " cat-fam-on" : ""}`}
            onClick={() => {
              setFamilies(new Set());
              setPage(1);
            }}
          >
            Toutes les familles ({allFamiliesCount})
          </button>
          {[...familyLabels.entries()].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`cat-fam${families.has(key) ? " cat-fam-on" : ""}`}
              onClick={() => toggleIn(families, setFamilies, key)}
            >
              {label} ({familyCounts.get(key) ?? 0})
            </button>
          ))}
        </div>

        {/* Bouton de repli mobile — masqué au-dessus de 980px par la feuille locale. */}
        <button type="button" className="cat-filtbtn" onClick={() => setPanelOpen((v) => !v)} aria-expanded={panelOpen}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M3 6h18M6 12h12M10 18h4" />
          </svg>
          Filtrer{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>

        <div className="cat-cols">
          {/* ── Colonne de filtres ── */}
          <aside className={`cat-side${panelOpen ? " cat-side-open" : ""}`} aria-label="Filtres">
            <div className="cat-side-top">
              <span style={{ fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-400)" }}>
                Filtres{activeCount > 0 ? ` · ${activeCount}` : ""}
              </span>
              <button type="button" className="cat-reset" onClick={resetAll} disabled={activeCount === 0}>
                Tout réinitialiser
              </button>
            </div>

            {section(
              "marque",
              "Marque",
              // Classées par nombre de références décroissant : c'est l'ordre
              // dans lequel un visiteur cherche une maison, pas l'alphabet.
              [...brandCounts.entries()]
                .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr"))
                .map(([label, n]) => checkRow(label, n, brands.has(label), () => toggleIn(brands, setBrands, label)))
            )}

            {section(
              "prix",
              "Prix",
              <>
                <div className="cat-price">
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="Min"
                    aria-label="Prix minimum"
                    value={minDraft}
                    onChange={(e) => setMinDraft(e.target.value)}
                  />
                  <span aria-hidden="true">—</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="Max"
                    aria-label="Prix maximum"
                    value={maxDraft}
                    onChange={(e) => setMaxDraft(e.target.value)}
                  />
                  <button type="button" onClick={applyPrice}>
                    Valider
                  </button>
                </div>
                <p className="cat-hint">
                  Le catalogue va de {eur(stats.priceMin)} à {eur(stats.priceMax)}.
                </p>
              </>
            )}

            {section(
              "famille",
              "Famille olfactive",
              [...familyLabels.entries()].map(([key, label]) =>
                checkRow(label, familyCounts.get(key) ?? 0, families.has(key), () =>
                  toggleIn(families, setFamilies, key)
                )
              )
            )}

            {section(
              "genre",
              "Genre",
              [...genderCounts.entries()]
                .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr"))
                .map(([label, n]) => checkRow(label, n, genders.has(label), () => toggleIn(genders, setGenders, label)))
            )}

            {section(
              "concentration",
              "Concentration",
              // Uniquement les valeurs réellement présentes : la moitié du
              // catalogue ne renseigne pas ce champ, proposer « Extrait de
              // parfum » ferait miroiter un rayon vide.
              [...concentrationCounts.entries()]
                .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr"))
                .map(([label, n]) =>
                  checkRow(label, n, concentrations.has(label), () =>
                    toggleIn(concentrations, setConcentrations, label)
                  )
                )
            )}

            {section(
              "dispo",
              "Disponibilité",
              checkRow("En stock seulement", inStockCount, stockOnly, () => {
                setStockOnly((v) => !v);
                setPage(1);
              })
            )}

            <button type="button" className="cat-see" onClick={() => setPanelOpen(false)}>
              Voir {visible.length} résultat{visible.length > 1 ? "s" : ""}
            </button>
          </aside>

          {/* ── Grille ── */}
          <div className="cat-main">
            <GridDensity
              storageKey="dp-density-catalogue"
              gap={18}
              extra={
                <span className="cat-pp">
                  <span className="cat-pp-lbl">Par page</span>
                  {PER_PAGE_OPTIONS.map((o) => (
                    <button
                      key={o.label}
                      type="button"
                      aria-pressed={perPage === o.value}
                      className={perPage === o.value ? "cat-pp-on" : undefined}
                      onClick={() => changePerPage(o.value)}
                    >
                      {o.label}
                    </button>
                  ))}
                </span>
              }
            >
              {shown.map((p) => {
                const fav = favorites.has(p.id);
                return (
                  <article key={p.id} className="cat-card">
                    <div className="cat-card-img">
                      {p.badge && (
                        <span className={`cat-badge cat-badge-${p.badge}`}>
                          {p.badge === "new" ? "Nouveau" : "Bestseller"}
                        </span>
                      )}
                      <button
                        type="button"
                        className={`cat-heart${fav ? " cat-heart-on" : ""}`}
                        aria-pressed={fav}
                        aria-label={`${fav ? "Retirer" : "Ajouter"} ${p.name} ${fav ? "des" : "aux"} favoris`}
                        onClick={() => {
                          const next = new Set(favorites);
                          if (next.has(p.id)) next.delete(p.id);
                          else next.add(p.id);
                          setFavorites(next);
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" />
                        </svg>
                      </button>
                      <Link href={p.href} aria-label={p.name} className="cat-card-imglink">
                        {p.image && (
                          <Image
                            src={p.image}
                            alt={`${p.brand} ${p.name}`}
                            fill
                            sizes="(max-width: 760px) 50vw, (max-width: 1240px) 30vw, 280px"
                            style={{ objectFit: "cover" }}
                          />
                        )}
                      </Link>
                      {/* « Aperçu rapide » ouvre la fiche produit : la maquette
                          n'a pas de tiroir modal, et envoyer sur la fiche vaut
                          mieux qu'un bouton qui ne fait rien. À remplacer par un
                          panneau latéral le jour où il existera. */}
                      <Link href={p.href} className="cat-quick">
                        Aperçu rapide
                      </Link>
                    </div>

                    <div className="cat-card-b">
                      <div className="cat-card-meta">
                        {p.brand}
                        {p.familyLabel ? ` · ${p.familyLabel}` : ""}
                      </div>
                      <h3 className="cat-card-name">
                        <Link href={p.href}>{p.name}</Link>
                      </h3>
                      {p.volume && <div className="cat-card-vol">{p.volume}</div>}

                      <div className="cat-card-price">
                        {p.price !== null && <span className="cat-price-now">{eur(p.price)}</span>}
                        {p.compareAtPrice !== null && p.price !== null && p.compareAtPrice > p.price && (
                          <span className="cat-price-old">{eur(p.compareAtPrice)}</span>
                        )}
                      </div>

                      {p.price !== null && (
                        <div className="cat-card-split">
                          ou {INSTALMENTS}× {eur(p.price / INSTALMENTS)} sans frais
                        </div>
                      )}

                      <div className={`cat-card-stock${p.available ? "" : " cat-card-out"}`}>
                        {p.available
                          ? `Plus que ${p.stockLeft} exemplaire${p.stockLeft > 1 ? "s" : ""} !`
                          : "Rupture de stock"}
                      </div>

                      <CartControls row={p} />
                    </div>
                  </article>
                );
              })}
            </GridDensity>

            {visible.length === 0 && (
              <div className="cat-empty">
                <p style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--ink-900)", margin: "0 0 8px" }}>
                  Aucun parfum ne correspond
                </p>
                <p style={{ fontSize: "0.85rem", color: "var(--ink-500)", margin: "0 0 18px" }}>
                  Élargissez le budget ou décochez une marque.
                </p>
                <button type="button" className="cat-see" style={{ maxWidth: 240, margin: "0 auto" }} onClick={resetAll}>
                  Tout réinitialiser
                </button>
              </div>
            )}

            {/* Pagination — absente quand tout tient sur une page. */}
            {pageCount > 1 && (
              <nav className="cat-pag" aria-label="Pagination">
                <div className="cat-pag-btns">
                  <button type="button" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Page précédente">
                    ‹
                  </button>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={n === current ? "cat-pag-on" : ""}
                      aria-current={n === current ? "page" : undefined}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button type="button" onClick={() => setPage(current + 1)} disabled={current === pageCount} aria-label="Page suivante">
                    ›
                  </button>
                </div>
                <p className="cat-pag-txt">
                  Page {current} sur {pageCount} · {visible.length} parfum{visible.length > 1 ? "s" : ""} au total
                </p>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* ── Continuer l'exploration ── */}
      <section style={{ background: "var(--surface-cream)", padding: "56px 24px 64px" }}>
        <div className="cat-wrap" style={{ padding: 0 }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={{ fontSize: "0.6rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--gold-500)", marginBottom: 12 }}>
              Et aussi
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.1rem)", fontWeight: 500, color: "var(--ink-900)", margin: 0 }}>
              Continuer l&apos;exploration
            </h2>
          </div>
          <div className="cat-explore">
            {EXPLORE.map((e) => (
              <Link key={e.href} href={e.href} className="cat-exp">
                <span className="cat-exp-l">{e.label}</span>
                <span className="cat-exp-s">{e.sub}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Survols, points de rupture et pseudo-éléments : rien de tout cela ne
          s'écrit en style inline. Les grilles passent par des classes plutôt
          que par `gridTemplateColumns` en ligne — `globals.css` porte des
          sélecteurs `[style*="repeat(3,"]` et `[style*="1fr 1fr"]` qui
          ramèneraient n'importe quelle grille inline à deux colonnes sous
          980px, sans le moindre avertissement. */}
      <style>{`
        .cat-wrap{max-width:1240px;margin:0 auto}
        .cat-stats{display:flex;justify-content:center;gap:64px;flex-wrap:wrap;margin-top:36px}

        .cat-resbar{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;
          padding-bottom:16px;border-bottom:1px solid var(--line-200);margin-bottom:18px}
        .cat-select{font-family:var(--font-sans);font-size:.78rem;color:var(--ink-900);background:var(--surface-white);
          border:1px solid var(--line-200);border-radius:8px;padding:7px 10px;cursor:pointer}
        .cat-select:focus-visible{outline:2px solid var(--gold-500);outline-offset:2px}

        .cat-fams{display:flex;gap:9px;overflow-x:auto;padding:0 0 18px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
        .cat-fams::-webkit-scrollbar{display:none}
        .cat-fam{flex:none;white-space:nowrap;font-family:var(--font-sans);font-size:.74rem;color:var(--ink-700);
          background:var(--surface-white);border:1px solid var(--line-200);border-radius:999px;padding:8px 16px;cursor:pointer;
          transition:border-color .16s ease,color .16s ease,background .16s ease}
        .cat-fam:hover{border-color:var(--gold-500);color:var(--gold-700)}
        .cat-fam-on,.cat-fam-on:hover{background:var(--espresso-900);border-color:var(--espresso-900);color:var(--on-dark-strong)}

        .cat-filtbtn{display:none;align-items:center;gap:8px;width:100%;justify-content:center;
          font-family:var(--font-sans);font-size:.78rem;letter-spacing:.06em;color:var(--ink-900);
          background:var(--surface-white);border:1px solid var(--line-200);border-radius:10px;padding:11px 14px;
          cursor:pointer;margin-bottom:16px}

        .cat-cols{display:grid;grid-template-columns:240px minmax(0,1fr);gap:34px;align-items:start}
        .cat-main{min-width:0}

        .cat-side{position:sticky;top:16px;background:var(--surface-white);border:1px solid var(--line-200);
          border-radius:var(--r-lg);padding:16px 15px 15px}
        .cat-side-top{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-bottom:12px;
          border-bottom:1px solid var(--line-100)}
        .cat-reset{font-family:var(--font-sans);font-size:.68rem;color:var(--gold-700);background:none;border:none;
          padding:0;cursor:pointer;text-decoration:underline}
        .cat-reset:disabled{color:var(--ink-400);cursor:default;text-decoration:none}

        .cat-sec{border-bottom:1px solid var(--line-100)}
        .cat-sec-h{display:flex;align-items:center;justify-content:space-between;width:100%;background:none;border:none;
          padding:13px 0;cursor:pointer;font-family:var(--font-sans);font-size:.63rem;letter-spacing:.16em;
          text-transform:uppercase;color:var(--ink-900)}
        .cat-sec-b{padding:0 0 13px}
        /* Liste de marques longue : on la borne pour que le budget et le genre
           restent atteignables sans dérouler toute la colonne.
           padding-inline-end : sans lui, l'ascenseur se pose PAR-DESSUS le
           compteur de chaque ligne — les chiffres devenaient illisibles contre
           la barre dorée. On réserve sa gouttière, et on affine la barre pour
           qu'elle ne mange pas la colonne. */
        .cat-sec-b{max-height:270px;overflow-y:auto;padding-inline-end:12px;scrollbar-width:thin;scrollbar-color:var(--gold-500) transparent}
        .cat-sec-b::-webkit-scrollbar{width:6px}
        .cat-sec-b::-webkit-scrollbar-track{background:transparent}
        .cat-sec-b::-webkit-scrollbar-thumb{background:var(--gold-500);border-radius:99px}

        /* Même famille visuelle que le libellé du curseur voisin : les deux
           commandes gouvernent la même grille, elles doivent se lire comme un
           seul réglage en deux volets. */
        .cat-pp{display:inline-flex;align-items:center;gap:4px;margin-inline-end:14px}
        .cat-pp-lbl{font-family:var(--font-sans);font-size:.62rem;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-400);margin-inline-end:4px}
        .cat-pp button{border:none;background:transparent;cursor:pointer;font-family:var(--font-display);font-size:.95rem;font-weight:600;color:var(--ink-400);padding:3px 7px;border-radius:6px;line-height:1;transition:.16s}
        .cat-pp button:hover{color:var(--gold-700);background:rgba(28,26,23,.05)}
        .cat-pp button.cat-pp-on{color:var(--ink-900);background:var(--gold-100,#F3E7CC)}
        .cat-pp button:focus-visible{outline:2px solid var(--gold-500);outline-offset:2px}
        @media (max-width:560px){.cat-pp{display:none}}

        .cat-check{display:flex;align-items:center;gap:8px;padding:5px 0;cursor:pointer;font-size:.79rem;color:var(--ink-700)}
        .cat-check:hover{color:var(--ink-900)}
        .cat-check input{accent-color:var(--gold-500);width:14px;height:14px;flex:none;cursor:pointer;margin:0}
        .cat-check-lbl{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .cat-check-n{font-size:.68rem;color:var(--ink-400);flex:none}
        /* Une valeur devenue inatteignable reste visible mais s'efface : la
           faire disparaître ferait sauter la liste à chaque clic. */
        .cat-check-off{opacity:.42}

        .cat-price{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
        .cat-price input{width:62px;font-family:var(--font-sans);font-size:.78rem;color:var(--ink-900);
          border:1px solid var(--line-200);border-radius:7px;padding:7px 8px;background:var(--surface-page)}
        .cat-price span{color:var(--ink-400);font-size:.75rem}
        .cat-price button{font-family:var(--font-sans);font-size:.7rem;letter-spacing:.06em;color:var(--on-dark-strong);
          background:var(--espresso-900);border:none;border-radius:7px;padding:8px 11px;cursor:pointer}
        .cat-price button:hover{background:var(--gold-700)}
        .cat-hint{margin:9px 0 0;font-size:.68rem;color:var(--ink-400)}

        .cat-see{display:block;width:100%;margin-top:14px;font-family:var(--font-sans);font-size:.74rem;
          letter-spacing:.1em;text-transform:uppercase;color:var(--on-dark-strong);background:var(--gold-700);
          border:none;border-radius:9px;padding:12px;cursor:pointer;transition:background .16s ease}
        .cat-see:hover{background:var(--gold-900)}

        /* La carte se déclare conteneur de requête : sa largeur ne dépend ni du
           viewport ni d'un point de rupture, mais du curseur de densité (1 à 6
           colonnes) ET du viewport ensemble. Seule une requête de conteneur sait ce que
           la carte mesure VRAIMENT — une media query se tromperait à chaque
           mouvement du curseur. */
        .cat-card{background:var(--surface-white);border:1px solid var(--line-100);border-radius:var(--r-lg);
          overflow:hidden;display:flex;flex-direction:column;container-type:inline-size;
          transition:box-shadow .2s ease,transform .2s ease,border-color .2s ease}
        .cat-card:hover{transform:translateY(-3px);box-shadow:0 12px 30px rgba(60,45,20,.11);border-color:var(--line-200)}
        .cat-card-img{position:relative;padding-bottom:100%;background:var(--surface-image);overflow:hidden}
        .cat-card-imglink{position:absolute;inset:0;display:block}
        .cat-card-imglink img{transition:transform .5s ease}
        .cat-card:hover .cat-card-imglink img{transform:scale(1.045)}

        .cat-badge{position:absolute;top:9px;left:9px;z-index:2;font-family:var(--font-sans);font-size:.55rem;
          letter-spacing:.14em;text-transform:uppercase;padding:5px 9px;border-radius:999px;color:#fff}
        .cat-badge-new{background:#2F7A4F}
        .cat-badge-best{background:var(--espresso-900)}

        .cat-heart{position:absolute;top:8px;right:8px;z-index:2;width:30px;height:30px;display:flex;
          align-items:center;justify-content:center;border-radius:50%;background:rgba(255,255,255,.9);
          border:1px solid var(--line-100);color:var(--ink-400);cursor:pointer;transition:color .16s ease,background .16s ease}
        .cat-heart:hover{color:var(--gold-700);background:#fff}
        .cat-heart-on{color:#C0392B}

        .cat-quick{position:absolute;left:10px;right:10px;bottom:10px;z-index:2;text-align:center;text-decoration:none;
          font-family:var(--font-sans);font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;
          color:var(--ink-900);background:rgba(255,255,255,.94);border-radius:8px;padding:9px 8px;
          opacity:0;transform:translateY(6px);transition:opacity .2s ease,transform .2s ease;pointer-events:none}
        .cat-card:hover .cat-quick,.cat-card:focus-within .cat-quick{opacity:1;transform:none;pointer-events:auto}

        .cat-card-b{padding:12px 13px 15px;display:flex;flex-direction:column;flex:1}
        /* Deux lignes réservées : « Maison Asrar · Ambré · gourmand » passe à la
           ligne là où « Reef · Frais » tient sur une seule, et les noms de
           produit d'une même rangée ne démarraient plus à la même hauteur. */
        .cat-card-meta{font-size:.58rem;letter-spacing:.13em;text-transform:uppercase;color:var(--gold-500);
          margin-bottom:6px;min-height:2.2em;line-height:1.35}
        .cat-card-name{font-family:var(--font-display);font-size:1.02rem;font-weight:500;color:var(--ink-900);margin:0 0 3px;line-height:1.25}
        .cat-card-name a{color:inherit;text-decoration:none}
        .cat-card-name a:hover{color:var(--gold-700)}
        .cat-card-vol{font-size:.68rem;color:var(--ink-400);margin-bottom:8px}
        .cat-card-price{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-top:auto}
        .cat-price-now{font-family:var(--font-display);font-size:1.1rem;font-weight:600;color:var(--price)}
        .cat-price-old{font-size:.72rem;color:var(--ink-400);text-decoration:line-through}
        .cat-card-split{font-size:.66rem;color:var(--ink-500);margin-top:4px}
        .cat-card-stock{font-size:.66rem;color:#B06A18;margin-top:7px}
        .cat-card-out{color:var(--ink-400)}

        .cat-cart{margin-top:11px;display:flex;flex-direction:column;gap:7px;align-items:flex-start}
        .cat-add{width:100%;font-family:var(--font-sans);font-size:.66rem;font-weight:600;letter-spacing:.1em;
          text-transform:uppercase;color:var(--on-dark-strong);background:var(--espresso-900);border:none;
          border-radius:999px;padding:10px 12px;cursor:pointer;white-space:nowrap;overflow:hidden;
          text-overflow:ellipsis;transition:background .18s ease,color .18s ease}
        .cat-add:hover:not(:disabled){background:var(--gold-700)}
        .cat-add:focus-visible{outline:2px solid var(--gold-500);outline-offset:2px}
        .cat-add:disabled{background:var(--line-100);color:var(--ink-400);cursor:not-allowed}
        .cat-add-short{display:none}
        /* Annonce réservée aux lecteurs d'écran : la confirmation visuelle est
           dans le bouton, mais un bouton dont le libellé change n'est pas
           reannoncé — il faut une région live à part. */
        .cat-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

        /* À une ou deux colonnes la carte dépasse 450px de large, et un visuel
           carré y devient un mur de 450 à 900px de haut : le nom et le prix
           passaient sous la ligne de flottaison, la grille ne se balayait plus.
           Au-delà de ce seuil le média devient une bande de hauteur fixe —
           le recadrage « cover » garde le flacon centré. */
        @container (min-width: 420px){
          .cat-card-img{padding-bottom:0;height:340px}
        }

        /* Deux paliers, tous deux mesurés sur des largeurs de carte réelles :
           à 1440px la grille donne 294px (3 colonnes), 216px (4), 169px (5),
           138px (6) ; à 390px elle donne 162px.
           Premier palier — la carte ne tient plus le stepper ET le bouton sans
           écraser l'un des deux : le stepper part, c'est l'accessoire, l'ajout
           reste. Le libellé complet tient encore, en corps réduit. */
        @container (max-width: 215px){
          .cat-cart-qty{display:none}
          .cat-add{font-size:.58rem;letter-spacing:.04em;padding:9px 6px}
        }
        /* Second palier — même en corps réduit, « Ajouter au panier » serait
           tronqué : on bascule sur le mot qui porte le sens. */
        @container (max-width: 152px){
          .cat-add-long{display:none}
          .cat-add-short{display:inline}
          .cat-add{font-size:.62rem;letter-spacing:.08em}
        }

        .cat-empty{text-align:center;padding:52px 20px}

        .cat-pag{margin-top:34px;text-align:center}
        .cat-pag-btns{display:flex;justify-content:center;gap:6px;flex-wrap:wrap}
        .cat-pag-btns button{min-width:34px;height:34px;font-family:var(--font-sans);font-size:.78rem;color:var(--ink-700);
          background:var(--surface-white);border:1px solid var(--line-200);border-radius:8px;cursor:pointer;padding:0 9px}
        .cat-pag-btns button:hover:not(:disabled){border-color:var(--gold-500);color:var(--gold-700)}
        .cat-pag-btns button:disabled{opacity:.4;cursor:default}
        .cat-pag-on,.cat-pag-on:hover{background:var(--espresso-900)!important;border-color:var(--espresso-900)!important;color:var(--on-dark-strong)!important}
        .cat-pag-txt{margin:14px 0 0;font-size:.72rem;color:var(--ink-400)}

        .cat-explore{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px}
        .cat-exp{display:flex;flex-direction:column;gap:3px;text-decoration:none;background:var(--surface-white);
          border:1px solid var(--line-200);border-radius:var(--r-lg);padding:15px 16px;transition:border-color .16s ease,transform .16s ease}
        .cat-exp:hover{border-color:var(--gold-500);transform:translateY(-2px)}
        .cat-exp-l{font-family:var(--font-display);font-size:1rem;color:var(--ink-900)}
        .cat-exp-s{font-size:.68rem;color:var(--ink-400)}

        /* Sous 980px la colonne de filtres passe AU-DESSUS de la grille et se
           replie : gardée à 240px elle réduisait les cartes à une seule
           colonne utile sur tablette. */
        @media (max-width:980px){
          .cat-cols{grid-template-columns:minmax(0,1fr);gap:0}
          .cat-filtbtn{display:flex}
          .cat-side{position:static;display:none;margin-bottom:22px}
          .cat-side-open{display:block}
          .cat-stats{gap:38px}
        }
        @media (max-width:760px){
          .cat-stats{gap:26px}
          .cat-resbar{gap:10px}
          .cat-explore{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
          /* Sur tactile il n'y a pas de survol : le bouton d'aperçu resterait
             invisible. On le retire plutôt que de le laisser inaccessible —
             l'image entière est déjà un lien vers la fiche. */
          .cat-quick{display:none}
        }
      `}</style>
    </div>
  );
}
