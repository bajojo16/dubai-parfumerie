/**
 * « Layering conseillé » — cross-sell d'une huile de parfum sous la fiche.
 *
 * Le geste est réel et vendu partout dans le Golfe : une goutte d'huile sur
 * les poignets avant la vaporisation, la base huileuse fixe les notes de fond
 * et la tenue s'allonge. Le bloc met une huile du catalogue
 * (`src/data/oil-products.ts`) en face du flacon ouvert, choisie dans cet
 * ordre : même maison, sinon celle dont les familles recoupent le fond du
 * parfum (ambre, bois, résines…), sinon la première disponible. Aucune huile
 * en données → le bloc ne se dessine pas.
 *
 * Le texte n'avance un chiffre de tenue que s'il vient de
 * `product-content.ts` (`longevityHours`) : sans donnée, la phrase s'arrête à
 * « la tenue s'allonge ». Pas de bouton « Ajouter le duo » : le panier ne
 * connaît pas de lot composé, on ne promet pas un geste qui n'existe pas.
 */

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/data/product-details";
import { contentFor } from "@/data/product-content";
import { DEMO as OIL_PRODUCTS, type OilProduct } from "@/data/oil-products";
import { FAMILIES, norm } from "@/data/search-catalog";
import { NBSP, euros, joinSentence } from "./product-content-format";

interface LayeringTipProps {
  slug: string;
  product: Product;
}

/** Page de liste des huiles — cible de repli quand l'huile n'a pas de fiche. */
const OILS_PAGE = "/huile-de-parfum";

/**
 * Clé de famille (`frais` / `floral` / `ambre` / `boise`) d'un libellé — une
 * note (« Ambre gris », « Bois de santal ») ou une famille d'huile (« Ambré »,
 * « Oud »). Même dictionnaire que la recherche, pour que « recouper le fond »
 * veuille dire la même chose ici que dans `familyOf`.
 */
function familyKey(label: string): string | undefined {
  const n = norm(label);
  if (!n) return undefined;
  return Object.keys(FAMILIES).find((key) => FAMILIES[key].words.some((w) => n.includes(norm(w))));
}

function familyKeys(labels: string[]): Set<string> {
  const keys = new Set<string>();
  for (const label of labels) {
    const key = familyKey(label);
    if (key) keys.add(key);
  }
  return keys;
}

/** L'huile à proposer, ou `undefined` si le catalogue n'en déclare aucune. */
function pickOil(product: Product): OilProduct | undefined {
  if (OIL_PRODUCTS.length === 0) return undefined;

  const brand = norm(product.brand);
  const sameHouse = OIL_PRODUCTS.find((oil) => norm(oil.brand) === brand);
  if (sameHouse) return sameHouse;

  // Le fond du parfum est ce que l'huile doit prolonger : on compare les
  // familles des notes de fond aux familles déclarées de chaque huile. À
  // égalité, une huile en stock passe devant — un lien vers une rupture
  // n'aide personne — puis l'ordre du catalogue.
  const baseKeys = familyKeys(product.baseNotes);
  let best: { oil: OilProduct; score: number } | undefined;
  for (const oil of OIL_PRODUCTS) {
    const oilKeys = familyKeys(oil.families.map((f) => f.label));
    let score = 0;
    for (const key of oilKeys) if (baseKeys.has(key)) score += 2;
    if (oil.available) score += 1;
    if (!best || score > best.score) best = { oil, score };
  }
  return best?.oil ?? OIL_PRODUCTS[0];
}

/**
 * « ambrée », « boisée », « rosée » : l'adjectif de famille accordé à « huile ».
 * Les libellés d'huile sont des masculins en « -é » ; un libellé qui n'en est
 * pas un (« Oud ») ne s'accorde pas, on retombe sur « ambrée » — c'est la
 * famille de toutes les huiles du catalogue et la base du geste de layering.
 */
function oilAdjective(oil: OilProduct): string {
  const label = oil.families.map((f) => f.label).find((l) => /é$/.test(l));
  return label ? `${label.toLowerCase()}e` : "ambrée";
}

export function LayeringTip({ slug, product }: LayeringTipProps) {
  const oil = pickOil(product);
  if (!oil || !product.image) return null;

  const { longevityHours } = contentFor(slug);
  const baseNotes = product.baseNotes.slice(0, 3);
  const oilHref = oil.href || OILS_PAGE;

  return (
    <section aria-labelledby="layering-heading" className="dp-layering">
      {/* Sous 640 px, la grille à quatre pistes n'a plus la place du texte :
          les deux flacons restent côte à côte sur une ligne, le texte passe
          dessous. */}
      <style>{`
        .dp-layering__grid {
          display: grid;
          grid-template-columns: 120px 24px 120px 1fr;
          gap: 1.5rem;
          align-items: center;
        }
        .dp-layering__plus { grid-column: 2; }
        .dp-layering__text { grid-column: 4; }
        @media (max-width: 640px) {
          .dp-layering__grid { grid-template-columns: 120px 24px 120px; justify-content: start; }
          .dp-layering__text { grid-column: 1 / -1; }
        }
      `}</style>

      <div
        className="dp-layering__grid"
        style={{
          background: "var(--surface-white)",
          borderRadius: "var(--r-lg)",
          boxShadow: "var(--shadow-sm)",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 120,
            height: 120,
            borderRadius: "var(--r-md)",
            overflow: "hidden",
            background: "var(--surface-cream)",
          }}
        >
          <Image
            src={product.image}
            alt={`${product.name} — ${product.brand}`}
            fill
            sizes="120px"
            style={{ objectFit: "cover" }}
          />
        </div>
        <span
          aria-hidden="true"
          className="dp-layering__plus"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "var(--gold-500)",
            textAlign: "center",
            lineHeight: 1,
          }}
        >
          +
        </span>
        <div
          style={{
            position: "relative",
            width: 120,
            height: 120,
            borderRadius: "var(--r-md)",
            overflow: "hidden",
            background: "var(--surface-cream)",
          }}
        >
          {/* Détourage sur fond transparent : `contain` avec une marge, sinon
              le flacon, très haut, se ferait couper le bouchon. */}
          <Image
            src={oil.bottleImage}
            alt={`Huile de parfum ${oil.name} — ${oil.brand}`}
            fill
            sizes="120px"
            style={{ objectFit: "contain", padding: "0.5rem" }}
          />
        </div>

        <div className="dp-layering__text">
          <p
            style={{
              margin: "0 0 0.35rem",
              fontFamily: "var(--font-sans)",
              fontSize: "var(--t-xs)",
              fontWeight: "var(--fw-semibold)",
              letterSpacing: "var(--ls-widest)",
              textTransform: "uppercase",
              color: "var(--gold-700)",
            }}
          >
            Layering conseillé
          </p>
          <h2
            id="layering-heading"
            style={{
              margin: "0 0 0.5rem",
              fontFamily: "var(--font-display)",
              fontSize: "var(--t-serif-lg)",
              fontWeight: 600,
              color: "var(--ink-900)",
            }}
          >
            {product.name} + huile de parfum, pour prolonger la tenue
          </h2>
          <p
            style={{
              margin: "0 0 1rem",
              fontFamily: "var(--font-sans)",
              fontSize: "var(--t-sm)",
              lineHeight: 1.6,
              color: "var(--ink-700)",
            }}
          >
            Une goutte d&apos;huile de parfum {oilAdjective(oil)} sur les poignets avant la vaporisation
            {NBSP}: la base huileuse fixe les notes de fond
            {baseNotes.length > 0 && <> ({joinSentence(baseNotes, true)})</>} et la tenue s&apos;allonge
            {longevityHours !== undefined && (
              <>
                {" "}
                au-delà de {longevityHours}
                {NBSP}h
              </>
            )}
            .
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Link
              href={oilHref}
              style={{
                display: "inline-block",
                padding: "0.7rem 1.2rem",
                background: "var(--espresso-900)",
                color: "var(--surface-white)",
                borderRadius: "var(--r-sm)",
                fontFamily: "var(--font-sans)",
                fontSize: "var(--t-xs)",
                fontWeight: "var(--fw-semibold)",
                letterSpacing: "var(--ls-wide)",
                textTransform: "uppercase",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Voir l&apos;huile · {euros(oil.price)}
            </Link>
            <Link
              href={OILS_PAGE}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--t-xs)",
                color: "var(--ink-500)",
                textDecoration: "none",
              }}
            >
              Huile de parfum · voir les huiles compatibles
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
