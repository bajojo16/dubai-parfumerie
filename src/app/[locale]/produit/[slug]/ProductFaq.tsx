/**
 * « Questions fréquentes » de la fiche — accordéons natifs + JSON-LD FAQPage.
 *
 * Deux sources, dans cet ordre : les questions RÉDIGÉES pour ce produit
 * (`content.faq`, ce sont les plus précieuses : ressemblances, différences
 * entre déclinaisons), puis les questions GÉNÉRIQUES que le composant écrit
 * lui-même depuis les données (tenue, genre, saison, contenance) — chacune
 * n'apparaît que si sa donnée existe. Deux questions ferment toujours la
 * liste (authenticité, livraison) : elles ne dépendent pas du parfum.
 *
 * `<details>/<summary>` sans JavaScript : l'accordéon fonctionne avant
 * l'hydratation, reste indexable ouvert ou fermé, et le « + / − » est rendu
 * par CSS sur l'état `[open]`. Les deux premières sont ouvertes : une FAQ
 * entièrement repliée ressemble à une liste de titres.
 *
 * Le JSON-LD est écrit ici et non via `FaqJsonLd` (centre d'aide) : son type
 * exige un `categoryId` du centre d'aide qui n'a aucun sens pour une fiche.
 * Même schéma, texte brut, `JSON.stringify` comme lui.
 */

import type { Product } from "@/data/product-details";
import { SILLAGE_LABEL, type ProductContent, type ProductFaqItem } from "@/data/product-content";
import { FREE_SHIPPING_THRESHOLD_EUR } from "@/data/carriers";
import { parseVolumeMl, resolveVariants } from "@/lib/product-variants";
import {
  NBSP,
  euros,
  eurosPerMl,
  genderPhrase,
  joinSentence,
  longDateFr,
  occasionsPhrase,
  seasonsPhrase,
  volumeLabel,
} from "./product-content-format";

interface ProductFaqProps {
  product: Product;
  slug: string;
  content: ProductContent;
}

/**
 * Délai de préparation annoncé. EN DUR : `DeliveryEstimate.tsx` le cite dans un
 * commentaire (« Préparation entre 24h et 3 jours ») mais aucun module ne
 * l'exporte ; le jour où il bouge, le changer ici et là-bas.
 */
const PREPARATION_DELAY = `entre 24${NBSP}h et 3${NBSP}jours`;

/** Délai de retour légal + maison. EN DUR : aucune constante partagée dans `src/data`. */
const RETURN_DAYS = 14;

function longevityFaq(product: Product, content: ProductContent): ProductFaqItem | undefined {
  const { longevityHours, sillage } = content;
  if (longevityHours === undefined && !sillage) return undefined;
  const parts: string[] = [];
  if (longevityHours !== undefined) {
    parts.push(`${product.name} tient ${longevityHours}${NBSP}heures en moyenne sur la peau`);
  }
  if (sillage) {
    const level = SILLAGE_LABEL[sillage].toLowerCase();
    parts.push(
      parts.length
        ? `son sillage est jugé ${level}`
        : `Le sillage de ${product.name} est jugé ${level}`,
    );
  }
  return {
    q: `${product.name} tient-il longtemps${NBSP}?`,
    a: `${parts.join(" et ")}, d'après les votes des clients de Dubaï Parfumerie.`,
  };
}

function genderFaq(product: Product, content: ProductContent): ProductFaqItem | undefined {
  if (!content.gender) return undefined;
  const answer =
    content.gender === "mixte"
      ? `${product.name} est un parfum mixte : la composition se porte aussi bien par une femme que par un homme.`
      : `${product.name} est un parfum ${genderPhrase(content.gender)}.`;
  return { q: `${product.name}, pour homme ou pour femme${NBSP}?`, a: answer };
}

function seasonFaq(product: Product, content: ProductContent): ProductFaqItem | undefined {
  const seasons = content.seasons?.length ? seasonsPhrase(content.seasons) : undefined;
  const occasions = content.occasions?.length ? occasionsPhrase(content.occasions) : undefined;
  if (!seasons && !occasions) return undefined;
  let answer: string;
  if (seasons && occasions) answer = `${product.name} est un parfum ${seasons}, à porter ${occasions}.`;
  else if (seasons) answer = `${product.name} est un parfum ${seasons}.`;
  else answer = `${product.name} se porte ${occasions}.`;
  return { q: `Quelle saison pour ${product.name}${NBSP}?`, a: answer };
}

function volumeFaq(product: Product): ProductFaqItem | undefined {
  if (!product.volume) return undefined;
  const q = `Quelle contenance choisir${NBSP}?`;
  const variants = resolveVariants(product);
  if (variants.length < 2) {
    const ml = parseVolumeMl(product.volume);
    const perMl = eurosPerMl(product.price, ml);
    return {
      q,
      a: `${product.name} est vendu en un seul format : ${volumeLabel(product.volume)} à ${euros(product.price)}${perMl ? ` (${perMl})` : ""}.`,
    };
  }
  const list = joinSentence(
    variants.map((v) => `${v.label} à ${euros(v.price)} (${eurosPerMl(v.price, v.volumeMl)})`),
  );
  // Le format le moins cher au millilitre — calculé, pas affirmé.
  const best = variants.reduce((a, b) => (b.price / b.volumeMl < a.price / a.volumeMl ? b : a));
  return {
    q,
    a: `${product.name} existe en ${list}. Le ${best.label} est le format le plus avantageux au millilitre.`,
  };
}

function genericFaqs(product: Product, content: ProductContent): ProductFaqItem[] {
  const items: (ProductFaqItem | undefined)[] = [
    longevityFaq(product, content),
    genderFaq(product, content),
    seasonFaq(product, content),
    volumeFaq(product),
    {
      q: `${product.name} est-il authentique${NBSP}?`,
      a: `Oui — importé directement auprès de ${product.brand}, flacon scellé, code lot du fabricant sous le flacon et sur la boîte. Retour ${RETURN_DAYS}${NBSP}jours.`,
    },
    {
      q: `Quel est le délai de livraison${NBSP}?`,
      a: `Préparation ${PREPARATION_DELAY}, puis livraison suivie${NBSP}; offerte dès ${FREE_SHIPPING_THRESHOLD_EUR}${NBSP}€ en France.`,
    },
  ];
  return items.filter((i): i is ProductFaqItem => i !== undefined);
}

export function ProductFaq({ product, content }: ProductFaqProps) {
  const items = [...(content.faq ?? []), ...genericFaqs(product, content)];
  // Impossible en pratique (deux questions permanentes), mais un h2 sans
  // question dessous n'a pas lieu d'être.
  if (items.length === 0) return null;

  const updated = content.updatedAt ? longDateFr(content.updatedAt) : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section aria-labelledby="faq-heading" className="dp-pfaq">
      <style>{`
        .dp-pfaq__item { border-bottom: 1px solid var(--line-100); }
        .dp-pfaq__summary {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;
          padding: 0.875rem 0; cursor: pointer; list-style: none;
          font-family: var(--font-sans); font-size: var(--t-body); font-weight: 500;
          color: var(--ink-900); line-height: 1.45;
        }
        .dp-pfaq__summary::-webkit-details-marker { display: none; }
        .dp-pfaq__summary::after {
          content: "+"; flex: 0 0 auto; width: 1.5rem; text-align: center;
          font-family: var(--font-display); font-size: 1.25rem; line-height: 1.1;
          color: var(--gold-700);
        }
        .dp-pfaq__item[open] .dp-pfaq__summary::after { content: "−"; }
        .dp-pfaq__answer {
          margin: 0 0 1rem; max-width: 68ch;
          font-family: var(--font-sans); font-size: var(--t-body); line-height: 1.6;
          color: var(--ink-700);
        }
      `}</style>
      <h2
        id="faq-heading"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--t-title)",
          fontWeight: 600,
          color: "var(--ink-900)",
          marginBottom: "0.5rem",
        }}
      >
        Questions fréquentes sur {product.name}
      </h2>
      {updated && (
        <p
          style={{
            margin: "0 0 1rem",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--t-xs)",
            color: "var(--ink-400)",
          }}
        >
          Réponses relues le {updated} par l&apos;équipe Dubaï{NBSP}Parfumerie
        </p>
      )}
      <div style={{ borderTop: "1px solid var(--line-100)" }}>
        {items.map((item, index) => (
          <details key={item.q} className="dp-pfaq__item" open={index < 2}>
            <summary className="dp-pfaq__summary">{item.q}</summary>
            <p className="dp-pfaq__answer">{item.a}</p>
          </details>
        ))}
      </div>
      <script
        type="application/ld+json"
        // JSON.stringify échappe déjà ce qui fermerait le bloc <script>.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
