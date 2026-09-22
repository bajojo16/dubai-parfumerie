/**
 * Questions & réponses communautaires.
 *
 * Les questions viennent de `ProductContent.qa`, modérées : une question sans
 * réponse de la boutique n'y entre pas (voir le type). Le bloc se tait quand
 * il n'y a rien à dire — pas de « Soyez le premier à poser une question »,
 * qui n'est qu'un formulaire vide déguisé.
 *
 * « Poser une question » ouvre un e-mail à la boutique avec le nom du parfum
 * déjà en objet : le client n'a pas à réexpliquer de quel flacon il parle.
 * Pas de WhatsApp dans les parcours de la fiche — décision client. L'objet
 * est en français quelle que soit la locale : c'est l'équipe qui le lit.
 *
 * Composant serveur : aucune interaction, et les dates se formatent depuis des
 * chaînes ISO fixes (pas d'horloge lue au rendu, donc pas de divergence à
 * l'hydratation).
 */

import type { Product } from "@/data/product-details";
import type { ProductContent } from "@/data/product-content";
import { CONTACT_EMAIL } from "@/lib/contact";
import { longDateFr, NBSP } from "./product-content-format";

/** Délai de réponse annoncé sous le bouton — promesse boutique. */
const REPLY_DELAY_LABEL = `Réponse sous 24${NBSP}h ouvrées`;

export default function ProductQA({
  product,
  content,
  embedded = false,
}: {
  product: Product;
  content: ProductContent;
  /**
   * Posé sous la FAQ, dans la même section « Questions » : le titre passe en
   * h3 et se resserre. Deux h2 « Questions… » à la suite, c'était un de trop.
   */
  embedded?: boolean;
}) {
  const items = content.qa ?? [];
  if (items.length === 0) return null;

  const askHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Question sur ${product.name}`)}`;

  return (
    <section aria-labelledby="qa-heading" style={embedded ? { marginTop: "1.5rem" } : undefined}>
      <style>{`@media (max-width: 760px) { .dp-qa__list { grid-template-columns: 1fr !important; column-gap: 0 !important; } }`}</style>
      {embedded ? (
        <h3
          id="qa-heading"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--t-serif-lg)",
            fontWeight: 600,
            color: "var(--ink-900)",
            margin: "0 0 1rem",
          }}
        >
          Questions de clients
        </h3>
      ) : (
        <h2
          id="qa-heading"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--t-title)",
            fontWeight: 600,
            color: "var(--ink-900)",
            marginBottom: "1.25rem",
          }}
        >
          Questions de clients
        </h2>
      )}

      {/* Deux colonnes comme la FAQ juste au-dessus : les questions sont
          courtes, une pile les étirait sur toute la hauteur. */}
      <ol
        className="dp-qa__list"
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: "2.5rem",
          alignItems: "start",
          display: "flex",
          flexDirection: "column",
          gap: "1.75rem",
          maxWidth: "68ch",
        }}
      >
        {items.map((item) => {
          const asked = longDateFr(item.date);
          const answered = longDateFr(item.answeredAt);
          return (
            // Clé : question + date — deux clients peuvent poser la même
            // question, jamais le même jour au même mot.
            <li key={`${item.date}-${item.q}`} style={{ margin: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--t-body)",
                  fontWeight: "var(--fw-semibold)",
                  lineHeight: "var(--lh-normal)",
                  color: "var(--ink-900)",
                }}
              >
                {item.q}
              </p>
              <p
                style={{
                  margin: "0.25rem 0 0",
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--t-xs)",
                  color: "var(--ink-400)",
                }}
              >
                {item.author}
                {asked && (
                  <>
                    {" · "}
                    <time dateTime={item.date}>{asked}</time>
                  </>
                )}
              </p>

              {/* Réponse : décalée et bordée d'or, comme la note « viralité »
                  de la description — même signe visuel pour « la boutique
                  parle ». */}
              <div
                style={{
                  marginBlockStart: "0.875rem",
                  paddingInlineStart: "0.875rem",
                  borderInlineStart: "2px solid var(--gold-500)",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "var(--r-pill)",
                    background: "var(--gold-100)",
                    color: "var(--gold-700)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--t-xs)",
                    fontWeight: "var(--fw-semibold)",
                    letterSpacing: "0.04em",
                  }}
                >
                  Réponse de Dubaï Parfumerie
                </span>
                <p
                  style={{
                    margin: "0.6rem 0 0",
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--t-body)",
                    lineHeight: "var(--lh-comfort)",
                    color: "var(--ink-700)",
                  }}
                >
                  {item.a}
                </p>
                {answered && (
                  <p
                    style={{
                      margin: "0.35rem 0 0",
                      fontFamily: "var(--font-sans)",
                      fontSize: "var(--t-xs)",
                      color: "var(--ink-400)",
                    }}
                  >
                    Répondu le <time dateTime={item.answeredAt}>{answered}</time>
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.4rem" }}>
        <a
          href={askHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: 40,
            padding: "0 1.125rem",
            border: "1px solid var(--line-300)",
            borderRadius: "var(--r-sm)",
            background: "var(--surface-white)",
            color: "var(--ink-900)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--t-xs)",
            fontWeight: "var(--fw-semibold)",
            letterSpacing: "var(--ls-wide)",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          Poser une question
        </a>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", color: "var(--ink-400)" }}>
          {REPLY_DELAY_LABEL}
        </span>
      </div>
    </section>
  );
}
