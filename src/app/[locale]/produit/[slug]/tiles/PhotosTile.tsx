/**
 * Tuile « Photos clients » — 4 colonnes × 1 rangée (≈ 760 × 300 px).
 *
 * Les packshots de la galerie sont des photos de studio ; celles-ci sont prises
 * chez le client, avec sa lumière et son plateau. C'est la seule preuve que le
 * flacon reçu ressemble à celui vendu, et c'est pour cela que la tuile est
 * large : quatre ou cinq vignettes côte à côte se comparent d'un regard, une
 * seule grande image ne prouve rien.
 *
 * Deux sources alimentent la rangée — la photo jointe à un avis rédigé
 * (`ProductReview.photo`) et les images des avis médias (`ReviewWithMedia`).
 * Elles se recoupent : le même fichier peut être déclaré des deux côtés. La
 * déduplication se fait sur le chemin, sinon la même image apparaîtrait deux
 * fois dans une rangée de cinq.
 */

import Image from "next/image";

import type { ProductReview } from "@/data/product-reviews";
import type { ReviewWithMedia } from "@/data/review-media";
import { Link } from "@/i18n/navigation";

interface PhotosTileProps {
  slug: string;
  reviews: ProductReview[];
  mediaReviews: ReviewWithMedia[];
}

interface Shot {
  src: string;
  /** Prénom seul : les sources portent « Yasmine B. », la vignette n'a la place que du prénom. */
  firstName: string;
  rating: number;
}

/** Cinq cases exactement : c'est ce qui remplit les 760 px sans étirer les vignettes. */
const CELLS = 5;

function collect(reviews: ProductReview[], mediaReviews: ReviewWithMedia[]): Shot[] {
  const seen = new Set<string>();
  const shots: Shot[] = [];

  const push = (src: string, author: string, rating: number) => {
    if (seen.has(src)) return;
    seen.add(src);
    shots.push({ src, firstName: author.split(" ")[0], rating });
  };

  // Les avis rédigés d'abord : ce sont ceux dont la note et le texte sont
  // affichés ailleurs sur la fiche, donc ceux que le client reconnaît.
  for (const r of reviews) if (r.photo) push(r.photo, r.author, r.rating);
  for (const r of mediaReviews) {
    for (const m of r.media) if (m.type === "image") push(m.src, r.author, r.rating);
  }

  return shots;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span
      style={{ display: "inline-flex", gap: 1, lineHeight: 0 }}
      aria-label={`${rating} sur 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={9} height={9} viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85z"
            fill={rating >= i ? "var(--star)" : "var(--star-empty)"}
          />
        </svg>
      ))}
    </span>
  );
}

export function PhotosTile({ slug, reviews, mediaReviews }: PhotosTileProps) {
  const shots = collect(reviews, mediaReviews);
  if (shots.length === 0) return null;

  // Au-delà de cinq photos, la dernière case devient le compteur : mieux vaut
  // quatre vignettes et un « +3 » qu'une rangée qui ment sur ce qu'elle montre.
  const overflow = shots.length > CELLS;
  const visible = shots.slice(0, overflow ? CELLS - 1 : CELLS);
  const rest = shots.length - visible.length;

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
      <header style={{ flex: "0 0 auto", marginBottom: 12 }}>
        <p
          style={{
            margin: 0,
            fontSize: "var(--t-xs)",
            letterSpacing: "var(--ls-widest)",
            textTransform: "uppercase",
            color: "var(--gold-700)",
            fontWeight: "var(--fw-medium)",
          }}
        >
          En vrai
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 6,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontSize: "var(--t-serif-lg)",
              fontWeight: "var(--fw-semibold)",
              color: "var(--ink-900)",
              lineHeight: 1.15,
            }}
          >
            Photos clients
          </h3>
          <span style={{ flex: "0 0 auto", fontSize: "var(--t-sm)", color: "var(--ink-500)" }}>
            Portées, pas retouchées
          </span>
        </div>
      </header>

      <ul
        style={{
          flex: 1,
          minHeight: 0,
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "flex",
          gap: 12,
          alignItems: "stretch",
        }}
      >
        {visible.map((shot) => (
          <li
            key={shot.src}
            style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}
          >
            <div
              style={{
                flex: 1,
                minHeight: 0,
                position: "relative",
                borderRadius: "var(--r-md)",
                overflow: "hidden",
                background: "var(--surface-image)",
                // Le ratio 4/5 fixe la LARGEUR utile ; la hauteur, elle, vient
                // du `flex: 1` de la rangée, qui remplit la tuile.
                aspectRatio: "4 / 5",
              }}
            >
              <Image
                src={shot.src}
                alt={`Photo de ${shot.firstName}`}
                fill
                sizes="150px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div
              style={{
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 6,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: "var(--t-xs)",
                  color: "var(--ink-700)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {shot.firstName}
              </span>
              <Stars rating={shot.rating} />
            </div>
          </li>
        ))}

        {overflow && (
          <li style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {/* Même gabarit que les vignettes, fond crème : la case doit
                s'aligner sur la rangée, pas former un bloc à part. */}
            <Link
              href={`/produit/${slug}#avis`}
              style={{
                flex: 1,
                minHeight: 0,
                aspectRatio: "4 / 5",
                borderRadius: "var(--r-md)",
                background: "var(--surface-cream)",
                border: "1px solid var(--line-200)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.625rem",
                  fontWeight: "var(--fw-semibold)",
                  color: "var(--gold-700)",
                  lineHeight: 1,
                }}
              >
                +{rest}
              </span>
              <span
                style={{
                  fontSize: "var(--t-xs)",
                  letterSpacing: "var(--ls-wide)",
                  textTransform: "uppercase",
                  color: "var(--ink-500)",
                }}
              >
                photos
              </span>
            </Link>
            <span style={{ flex: "0 0 auto", fontSize: "var(--t-xs)", color: "var(--ink-400)" }}>
              Tout voir
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}
