/**
 * « En 30 secondes » — le résumé citable de la fiche.
 *
 * Quatre à cinq phrases, chacune AUTONOME : un moteur ou une IA qui n'en
 * extrait qu'une doit pouvoir la citer sans le reste (pas de « il », pas de
 * « ce parfum » qui renverrait à la phrase d'avant). C'est aussi ce que lit le
 * client pressé : prix au ml, tenue, saison, note — la fiche en un encadré.
 *
 * Tout est engendré par gabarit depuis `Product` et `ProductContent` : une
 * donnée absente retire sa phrase, elle n'est jamais remplacée par une
 * formule vague.
 */

import type { Product } from "@/data/product-details";
import { SILLAGE_LABEL, type ProductContent } from "@/data/product-content";
import { parseVolumeMl } from "@/lib/product-variants";
import {
  NBSP,
  concentrationLabel,
  euros,
  eurosPerMl,
  genderPhrase,
  joinSentence,
  longDateFr,
  occasionsPhrase,
  primaryFamily,
  seasonsPhrase,
  volumeLabel,
} from "./product-content-format";

interface ProductSummaryProps {
  product: Product;
  slug: string;
  content: ProductContent;
}

/** Phrase d'identité : nom, marque, concentration, famille, genre, année, prix. */
function identitySentence(product: Product, content: ProductContent): string {
  const family = primaryFamily(product.family)?.toLowerCase();
  const descriptors = [concentrationLabel(product.concentration), family, content.gender && genderPhrase(content.gender)]
    .filter((s): s is string => Boolean(s))
    .join(" ");
  const year = content.year ? `, sortie en ${content.year}` : "";
  const ml = parseVolumeMl(product.volume);
  const perMl = eurosPerMl(product.price, ml);
  const priceClause = `vendue ${euros(product.price)} les ${volumeLabel(product.volume)}${perMl ? ` (soit ${perMl})` : ""}`;
  return `${product.name} de ${product.brand} est une ${descriptors}${year}, ${priceClause}.`;
}

/** Pyramide : seuls les étages renseignés entrent dans la phrase. */
function pyramidSentence(product: Product): string | undefined {
  const stages: string[] = [];
  if (product.topNotes.length) stages.push(`s'ouvre sur ${joinSentence(product.topNotes, true)}`);
  if (product.heartNotes.length) stages.push(`évolue vers ${joinSentence(product.heartNotes, true)}`);
  if (product.baseNotes.length) stages.push(`repose sur ${joinSentence(product.baseNotes, true)}`);
  if (stages.length === 0) return undefined;
  return `La composition ${joinSentence(stages)}.`;
}

/** Tenue et sillage, votés par les clients — l'un peut manquer sans l'autre. */
function performanceSentence(content: ProductContent): string | undefined {
  const { longevityHours, sillage } = content;
  if (longevityHours === undefined && !sillage) return undefined;
  const parts: string[] = [];
  if (longevityHours !== undefined) parts.push(`Tenue de ${longevityHours} heures en moyenne`);
  if (sillage) parts.push(`${parts.length ? "sillage" : "Sillage"} ${SILLAGE_LABEL[sillage].toLowerCase()}`);
  return `${parts.join(" et ")}, d'après les votes des clients.`;
}

/** Saisons et moments : « Parfum d'automne et d'hiver à porter en soirée et en fête. » */
function wearSentence(content: ProductContent): string | undefined {
  const seasons = content.seasons?.length ? seasonsPhrase(content.seasons) : undefined;
  const occasions = content.occasions?.length ? occasionsPhrase(content.occasions) : undefined;
  if (!seasons && !occasions) return undefined;
  if (seasons && occasions) return `Parfum ${seasons} à porter ${occasions}.`;
  if (seasons) return `Parfum ${seasons}.`;
  return `Parfum à porter ${occasions}.`;
}

export function ProductSummary({ product, content }: ProductSummaryProps) {
  // Jamais vrai en pratique — le catalogue impose ces trois champs — mais le
  // bloc n'a aucun sens sans eux et il vaut mieux ne rien dessiner qu'une
  // phrase à trous.
  if (!product.name || !product.brand || typeof product.price !== "number") return null;

  const sentences = [
    identitySentence(product, content),
    pyramidSentence(product),
    performanceSentence(content),
    wearSentence(content),
    product.reviews > 0
      ? `Noté ${product.rating.toFixed(1).replace(".", ",")}/5 par ${product.reviews} clients.`
      : undefined,
  ].filter((s): s is string => Boolean(s));

  const verifiedOn = content.updatedAt ? longDateFr(content.updatedAt) : undefined;

  return (
    <aside
      aria-labelledby="summary-heading"
      style={{
        background: "var(--surface-cream)",
        border: "1px solid var(--line-200)",
        borderRadius: "var(--r-lg)",
        padding: "1.25rem",
      }}
    >
      <p
        id="summary-heading"
        style={{
          margin: "0 0 0.75rem",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--t-xs)",
          fontWeight: "var(--fw-semibold)",
          letterSpacing: "var(--ls-widest)",
          textTransform: "uppercase",
          color: "var(--gold-700)",
        }}
      >
        En 30 secondes
      </p>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--t-body)",
          lineHeight: 1.6,
          color: "var(--ink-700)",
        }}
      >
        {sentences.map((sentence) => (
          <li key={sentence} style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
            {/* Puce dorée maison plutôt que le disque par défaut : c'est le
                seul ornement du bloc, il doit rester discret. */}
            <span
              aria-hidden="true"
              style={{
                flex: "0 0 auto",
                width: 6,
                height: 6,
                marginTop: "0.55em",
                borderRadius: "50%",
                background: "var(--gold-500)",
              }}
            />
            <span>{sentence}</span>
          </li>
        ))}
      </ul>
      {verifiedOn && (
        <p
          style={{
            margin: "0.875rem 0 0",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--t-xs)",
            color: "var(--ink-400)",
          }}
        >
          Vérifié le {verifiedOn} par l&apos;équipe Dubaï{NBSP}Parfumerie
        </p>
      )}
    </aside>
  );
}
