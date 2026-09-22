/**
 * Bandeau auteur / date / sources — la signature de la fiche.
 *
 * Une ligne discrète en fin de page qui dit QUI a écrit, QUAND la fiche a été
 * relue et SUR QUOI elle s'appuie. Ce sont les trois signaux que les moteurs
 * (et les lecteurs méfiants) cherchent pour distinguer une fiche tenue d'une
 * fiche générée : sans date ni source, le bandeau n'a rien à signer et ne se
 * dessine pas.
 */

import type { Product } from "@/data/product-details";
import type { ProductContent } from "@/data/product-content";
import { NBSP, longDateFr } from "./product-content-format";

interface ProductAuthorProps {
  product: Product;
  slug: string;
  content: ProductContent;
}

export function ProductAuthor({ content }: ProductAuthorProps) {
  const updated = content.updatedAt ? longDateFr(content.updatedAt) : undefined;
  const sources = content.sources?.filter((s) => s.trim() !== "") ?? [];
  if (!updated && sources.length === 0) return null;

  return (
    <aside
      aria-label="Auteur et sources de la fiche"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.75rem",
        background: "var(--surface-cream)",
        borderRadius: "var(--r-md)",
        padding: "0.875rem 1rem",
      }}
    >
      {/* Pastille « DP » : un monogramme, pas un avatar — l'auteur est une
          équipe, on ne lui invente pas un visage. */}
      <span
        aria-hidden="true"
        style={{
          flex: "0 0 auto",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "var(--gold-100)",
          color: "var(--gold-700)",
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "0.9375rem",
          letterSpacing: "0.04em",
        }}
      >
        DP
      </span>
      <p
        style={{
          margin: 0,
          flex: "1 1 16rem",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--t-sm)",
          lineHeight: 1.55,
          color: "var(--ink-500)",
        }}
      >
        <span style={{ color: "var(--ink-700)", fontWeight: 500 }}>
          Rédigé par l&apos;équipe Dubaï{NBSP}Parfumerie
        </span>
        {" — conseillers parfum"}
        {updated && (
          <>
            {" · mis à jour le "}
            <time dateTime={content.updatedAt}>{updated}</time>
          </>
        )}
        {sources.length > 0 && <>{` · sources${NBSP}: ${sources.join(", ")}`}</>}
      </p>
    </aside>
  );
}
