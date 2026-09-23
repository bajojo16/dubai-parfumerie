/**
 * Tuile « Avis clients » — 2 colonnes × 1 rangée (≈ 360 × 300 px).
 *
 * La note seule ne dit pas grand-chose : 4,8 sur douze avis et 4,8 sur neuf
 * cents ne se valent pas, et une moyenne haute peut cacher une poignée de
 * clients très mécontents. D'où la note EN GRAND (c'est elle qu'on vient
 * chercher) posée sur l'histogramme, qui montre d'où elle vient.
 *
 * Sans résumé agrégé, l'histogramme ne se fabrique pas — le recalculer depuis
 * les quelques avis rédigés donnerait 100 % de cinq étoiles et contredirait la
 * moyenne affichée juste au-dessus. La tuile bascule alors sur une variante où
 * la note occupe toute la place, plutôt que de dessiner cinq barres inventées.
 */

import type { Product } from "@/data/product-details";
import type { ProductReviewSummary } from "@/data/product-reviews";
import { NBSP } from "../product-content-format";

interface RatingTileProps {
  product: Product;
  summary?: ProductReviewSummary;
}

/** Notes affichées de haut en bas, dans l'ordre de `summary.distribution`. */
const SCORES = [5, 4, 3, 2, 1] as const;

function Stars({ rating, size }: { rating: number; size: number }) {
  return (
    <span
      style={{ display: "inline-flex", gap: 2, lineHeight: 0 }}
      aria-label={`${rating.toFixed(1).replace(".", ",")} sur 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85z"
            // Une étoile est pleine dès que la moyenne l'atteint à 0,5 près :
            // 4,8 allume la cinquième, 4,2 la laisse vide. Les demi-étoiles ne
            // sont pas rendues, ici comme partout ailleurs sur le site.
            fill={rating >= i - 0.5 ? "var(--star)" : "var(--star-empty)"}
          />
        </svg>
      ))}
    </span>
  );
}

export function RatingTile({ product, summary }: RatingTileProps) {
  if (product.reviews === 0) return null;

  const rating = product.rating.toFixed(1).replace(".", ",");
  const reviews = product.reviews.toLocaleString("fr-FR");
  const votes = summary ? summary.distribution.reduce((a, b) => a + b, 0) : 0;

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        // Pas de padding ici : la carte et son padding sont dessines par `BentoGrid`.
        overflow: "hidden",
        fontFamily: "var(--font-sans)",
      }}
    >
      <p
        style={{
          flex: "0 0 auto",
          margin: 0,
          fontSize: "var(--t-xs)",
          letterSpacing: "var(--ls-widest)",
          textTransform: "uppercase",
          color: "var(--gold-700)",
          fontWeight: "var(--fw-medium)",
        }}
      >
        Avis clients
      </p>

      {/* Sans histogramme, le bloc de note prend la place des cinq barres :
          il occupe toute la hauteur restante, centré, et grandit — une tuile à
          moitié vide serait pire qu'une note surdimensionnée. */}
      <div
        style={
          summary
            ? { flex: "0 0 auto", display: "flex", alignItems: "center", gap: 14, margin: "10px 0 0" }
            : {
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }
        }
      >
        <p
          style={{
            margin: 0,
            display: "flex",
            alignItems: "baseline",
            gap: 4,
            fontFamily: "var(--font-display)",
            fontSize: summary ? "3rem" : "4.75rem",
            lineHeight: 1,
            color: "var(--gold-500)",
            fontWeight: "var(--fw-semibold)",
          }}
        >
          {rating}
          <span
            style={{
              fontSize: summary ? "1.125rem" : "1.5rem",
              color: "var(--ink-400)",
              fontWeight: "var(--fw-regular)",
            }}
          >
            /{NBSP}5
          </span>
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: summary ? "flex-start" : "center",
            gap: 6,
            minWidth: 0,
          }}
        >
          <Stars rating={product.rating} size={summary ? 15 : 22} />
          <span style={{ fontSize: "var(--t-sm)", color: "var(--ink-500)" }}>
            {reviews} avis vérifiés
          </span>
        </div>
      </div>

      {summary && (
        <ul
          style={{
            flex: 1,
            minHeight: 0,
            margin: "14px 0 0",
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {SCORES.map((score, i) => {
            const pct = votes > 0 ? Math.round((summary.distribution[i] / votes) * 100) : 0;
            return (
              <li
                key={score}
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  fontSize: "var(--t-xs)",
                  color: "var(--ink-500)",
                }}
              >
                <span style={{ flex: "0 0 auto", width: 22 }}>{score}★</span>
                <span
                  style={{
                    flex: 1,
                    height: 5,
                    borderRadius: "var(--r-pill)",
                    background: "var(--line-100)",
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      width: `${pct}%`,
                      height: "100%",
                      borderRadius: "var(--r-pill)",
                      background: "var(--star)",
                    }}
                    aria-hidden="true"
                  />
                </span>
                <span style={{ flex: "0 0 auto", width: 30, textAlign: "right" }}>
                  {pct}{NBSP}%
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {summary && (
        <p
          style={{
            flex: "0 0 auto",
            margin: "12px 0 0",
            fontSize: "var(--t-xs)",
            letterSpacing: "var(--ls-wide)",
            color: "var(--success)",
            fontWeight: "var(--fw-medium)",
          }}
        >
          {summary.recommendPct}{NBSP}% recommandent ce parfum
        </p>
      )}
    </div>
  );
}
