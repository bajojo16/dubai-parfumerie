/**
 * « {Nom} ou … ? Trois best-sellers de la maison » — comparatif intra-marque.
 *
 * Un client qui hésite sur une fiche Lattafa hésite presque toujours ENTRE
 * deux Lattafa, pas entre Lattafa et une autre maison : le comparatif reste
 * donc dans la marque, et sert de maillage interne vers les deux autres
 * références les plus populaires du catalogue. Le produit ouvert occupe la
 * colonne surlignée « Vous êtes ici » — son bouton n'est PAS un lien (on ne
 * renvoie pas une page vers elle-même).
 *
 * Rien n'est inventé : tenue et saison viennent de `product-content.ts` et
 * n'existent aujourd'hui que pour Khamrah — les autres colonnes affichent
 * « — » plutôt qu'une valeur plausible. Moins de deux autres références avec
 * visuel dans la maison → le bloc ne se dessine pas : un comparatif à une
 * colonne ne compare rien.
 */

import type { ReactNode } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { PRODUCTS, type Product } from "@/data/product-details";
import { OCCASION_LABEL, SEASON_LABEL, contentFor } from "@/data/product-content";
import { FAMILIES, SEARCH_PRODUCTS, familyOf, type SearchProduct } from "@/data/search-catalog";
import { NBSP, euros, primaryFamily } from "./product-content-format";

interface BrandCompareProps {
  slug: string;
  product: Product;
}

/** Une colonne du tableau : la fiche ouverte ou l'une de ses deux voisines. */
interface CompareColumn {
  slug: string;
  name: string;
  brand: string;
  image: string;
  family: string;
  /** Heures de tenue votées ; absent = « — », jamais une estimation. */
  longevityHours?: number;
  /** « Automne · Hiver · Soirée » ou « — ». */
  season: string;
  price?: number;
  oldPrice?: number;
  current: boolean;
}

const DASH = "—";

/** Libellé de famille du catalogue de recherche, ou « — » si rien ne ressort. */
function catalogFamily(sp: SearchProduct | undefined): string {
  if (!sp) return DASH;
  const key = familyOf(sp);
  return key && FAMILIES[key] ? FAMILIES[key].label : DASH;
}

/** Saisons puis moments, joints par « · » — la même donnée que la fiche technique, en une ligne. */
function seasonCell(slug: string): string {
  const { seasons, occasions } = contentFor(slug);
  const parts = [
    ...(seasons ?? []).map((s) => SEASON_LABEL[s]),
    ...(occasions ?? []).map((o) => OCCASION_LABEL[o]),
  ];
  return parts.length ? parts.join(" · ") : DASH;
}

/**
 * Les deux autres références de la maison, par popularité décroissante.
 * Sans visuel, une colonne ne se compare pas à l'œil : on l'écarte.
 */
function siblings(slug: string, brand: string): SearchProduct[] {
  const key = brand.trim().toLowerCase();
  return SEARCH_PRODUCTS.filter((sp) => sp.slug !== slug && sp.brand.trim().toLowerCase() === key && !!sp.image)
    .sort((a, b) => b.popularity - a.popularity || a.name.localeCompare(b.name, "fr"))
    .slice(0, 2);
}

function buildColumns(slug: string, product: Product): CompareColumn[] | null {
  if (!product.image) return null;
  const others = siblings(slug, product.brand);
  if (others.length < 2) return null;

  const self = SEARCH_PRODUCTS.find((sp) => sp.slug === slug);
  const current: CompareColumn = {
    slug,
    name: product.name,
    brand: product.brand,
    image: product.image,
    // La famille déclarée sur la fiche l'emporte (premier descripteur) ; une
    // fiche composée depuis le catalogue n'en déclare pas, on relit alors la
    // déduction du catalogue — la même que la vitrine.
    family: primaryFamily(product.family) ?? catalogFamily(self),
    longevityHours: contentFor(slug).longevityHours,
    season: seasonCell(slug),
    price: product.price,
    oldPrice: product.oldPrice,
    current: true,
  };

  return [
    current,
    ...others.map<CompareColumn>((sp) => ({
      slug: sp.slug,
      name: sp.name,
      brand: sp.brand,
      // `siblings` a déjà écarté les entrées sans visuel.
      image: sp.image ?? "",
      // Même règle que la colonne courante : la famille déclarée par la fiche
      // rédigée d'abord, la déduction du catalogue sinon — sans quoi Khamrah
      // se lirait « Gourmand » sur sa page et « Ambré · gourmand » sur celle
      // de Yara.
      family: primaryFamily(PRODUCTS[sp.slug]?.family) ?? catalogFamily(sp),
      longevityHours: contentFor(sp.slug).longevityHours,
      season: seasonCell(sp.slug),
      price: sp.price,
      oldPrice: sp.compareAtPrice,
      current: false,
    })),
  ];
}

/** Étoiles sur 5 : 24 h de tenue = 5 étoiles, arrondi, jamais moins d'une. */
function Longevity({ hours }: { hours: number }) {
  // Échelle marchande, pas horaire : 12 h sur peau est une tenue excellente
  // pour une eau de parfum (5★), 10 h très bonne (4★), 8 h bonne (3★). Une
  // règle de trois sur 24 h donnait 3★ à un parfum de 12 h — faux signal.
  const filled = Math.min(5, Math.max(1, Math.round(hours / 2.4)));
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", whiteSpace: "nowrap" }}>
      <span aria-label={`${filled} étoiles sur 5`} style={{ letterSpacing: "0.05em", fontSize: "0.95rem" }}>
        <span style={{ color: "var(--star)" }}>{"★".repeat(filled)}</span>
        <span style={{ color: "var(--star-empty)" }}>{"★".repeat(5 - filled)}</span>
      </span>
      <span>
        {hours}
        {NBSP}h+
      </span>
    </span>
  );
}

function PriceCell({ col }: { col: CompareColumn }) {
  if (col.price === undefined) {
    return <span style={{ color: "var(--ink-500)" }}>Voir la fiche</span>;
  }
  // Barré seulement si l'ancien prix est réellement supérieur : un `oldPrice`
  // égal au prix (fiches composées depuis le catalogue) ne se barre pas.
  const old = col.oldPrice;
  const struck = old !== undefined && old > col.price;
  return (
    <span style={{ whiteSpace: "nowrap" }}>
      <strong style={{ fontWeight: "var(--fw-semibold)", color: "var(--ink-900)" }}>{euros(col.price)}</strong>
      {struck && (
        <s style={{ marginLeft: "0.4rem", color: "var(--ink-400)", fontSize: "var(--t-sm)" }}>{euros(old)}</s>
      )}
    </span>
  );
}

const ROW_LABEL_STYLE = {
  fontFamily: "var(--font-sans)",
  fontSize: "var(--t-xs)",
  fontWeight: "var(--fw-semibold)",
  letterSpacing: "var(--ls-wide)",
  textTransform: "uppercase",
  color: "var(--ink-500)",
  textAlign: "left",
  whiteSpace: "nowrap",
} as const;

const CELL_STYLE = {
  fontFamily: "var(--font-sans)",
  fontSize: "var(--t-body)",
  color: "var(--ink-900)",
  textAlign: "center",
  verticalAlign: "middle",
} as const;

export function BrandCompare({ slug, product }: BrandCompareProps) {
  const columns = buildColumns(slug, product);
  if (!columns) return null;

  const rows: { label: string; render: (col: CompareColumn) => ReactNode }[] = [
    { label: "Famille", render: (col) => col.family },
    {
      label: "Tenue",
      render: (col) => (col.longevityHours !== undefined ? <Longevity hours={col.longevityHours} /> : DASH),
    },
    { label: "Saison", render: (col) => col.season },
    { label: "Prix", render: (col) => <PriceCell col={col} /> },
  ];

  return (
    <section aria-labelledby="brand-compare-heading" className="dp-compare">
      {/* Sous 760 px, quatre colonnes ne tiennent pas : le tableau défile dans
          SA carte (colonnes à 200 px minimum), jamais la page. La colonne
          surlignée reçoit sa teinte par cellule, `<col>` ne peignant pas sous
          un `border-collapse` dans tous les navigateurs. */}
      <style>{`
        .dp-compare__scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .dp-compare__table { width: 100%; border-collapse: collapse; }
        .dp-compare__table th, .dp-compare__table td { padding: 0.85rem 1rem; }
        .dp-compare__table tbody tr { border-top: 1px solid var(--line-100); }
        .dp-compare__table tbody tr:last-child { border-top: 0; }
        .dp-compare__head { text-align: center; vertical-align: bottom; padding-top: 1.5rem !important; }
        .dp-compare__current { background: color-mix(in srgb, var(--gold-100) 55%, var(--surface-white)); }
        @media (max-width: 760px) {
          .dp-compare__table { min-width: 44rem; }
          .dp-compare__table th, .dp-compare__table td { min-width: 200px; }
          .dp-compare__table th:first-child { min-width: 7rem; }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1.25rem",
        }}
      >
        <h2
          id="brand-compare-heading"
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: "var(--t-title)",
            fontWeight: 600,
            color: "var(--ink-900)",
          }}
        >
          {product.name} ou …{NBSP}? Trois best-sellers de la maison
        </h2>
        <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", color: "var(--ink-400)" }}>
          Comparez avant de choisir
        </p>
      </div>

      <div
        className="dp-compare__scroll"
        style={{
          background: "var(--surface-white)",
          borderRadius: "var(--r-lg)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <table className="dp-compare__table">
          <caption
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              overflow: "hidden",
              clip: "rect(0 0 0 0)",
              whiteSpace: "nowrap",
            }}
          >
            Comparatif de {product.name} avec deux autres parfums {product.brand}
          </caption>
          <thead>
            <tr>
              <th scope="col" aria-label="Critère" />
              {columns.map((col) => (
                <th
                  key={col.slug}
                  scope="col"
                  className={`dp-compare__head${col.current ? " dp-compare__current" : ""}`}
                >
                  <div
                    style={{
                      position: "relative",
                      width: 120,
                      height: 120,
                      margin: "0 auto 0.75rem",
                    }}
                  >
                    <Image
                      src={col.image}
                      alt={`${col.name} — ${col.brand}`}
                      fill
                      sizes="120px"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--t-serif-lg)",
                      fontWeight: 600,
                      color: "var(--ink-900)",
                    }}
                  >
                    {col.name}
                  </p>
                  {col.current ? (
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: "0.4rem",
                        padding: "0.2rem 0.7rem",
                        border: "1px solid var(--gold-300)",
                        borderRadius: "var(--r-pill)",
                        fontFamily: "var(--font-sans)",
                        fontSize: "var(--t-xs)",
                        fontWeight: "var(--fw-medium)",
                        color: "var(--gold-700)",
                      }}
                    >
                      Vous êtes ici
                    </span>
                  ) : (
                    <p
                      style={{
                        margin: "0.3rem 0 0",
                        fontFamily: "var(--font-sans)",
                        fontSize: "var(--t-xs)",
                        fontWeight: "var(--fw-regular)",
                        color: "var(--ink-500)",
                      }}
                    >
                      {col.brand}
                    </p>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row" style={ROW_LABEL_STYLE}>
                  {row.label}
                </th>
                {columns.map((col) => (
                  <td key={col.slug} className={col.current ? "dp-compare__current" : undefined} style={CELL_STYLE}>
                    {row.render(col)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row" aria-label="Voir la fiche" />
              {columns.map((col) => (
                <td key={col.slug} className={col.current ? "dp-compare__current" : undefined} style={CELL_STYLE}>
                  {col.current ? (
                    // La page ouverte : un repère, pas un lien vers soi-même.
                    <span
                      aria-current="page"
                      style={{
                        display: "inline-block",
                        padding: "0.6rem 1.1rem",
                        background: "var(--gold-500)",
                        color: "var(--espresso-900)",
                        borderRadius: "var(--r-sm)",
                        fontFamily: "var(--font-sans)",
                        fontSize: "var(--t-xs)",
                        fontWeight: "var(--fw-semibold)",
                        letterSpacing: "var(--ls-wide)",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                        cursor: "default",
                      }}
                    >
                      Voir · {col.price !== undefined ? euros(col.price) : col.name}
                    </span>
                  ) : (
                    <Link
                      href={`/produit/${col.slug}`}
                      style={{
                        display: "inline-block",
                        padding: "0.6rem 1.1rem",
                        border: "1px solid var(--line-300)",
                        borderRadius: "var(--r-sm)",
                        fontFamily: "var(--font-sans)",
                        fontSize: "var(--t-xs)",
                        fontWeight: "var(--fw-semibold)",
                        letterSpacing: "var(--ls-wide)",
                        textTransform: "uppercase",
                        color: "var(--ink-900)",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Voir
                    </Link>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
