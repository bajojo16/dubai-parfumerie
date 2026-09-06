import type { Metadata } from "next";
import { REVIEW_MEDIA } from "@/data/review-media";
import { SEARCH_PRODUCTS } from "@/data/search-catalog";
import { PRODUCTS } from "@/data/product-details";
import { PraiseWall, type PraiseTile } from "@/components/sections/PraiseWall";

export const metadata: Metadata = {
  title: "Le mur des éloges",
  description:
    "Les photos et vidéos de nos clients, flacon en main. Un mur visuel, sans texte : cliquez sur une image pour retrouver le parfum.",
};

/**
 * Résolution slug → produit, côté serveur.
 *
 * `SEARCH_PRODUCTS` d'abord : c'est l'agrégat qui sert `/produit/<slug>`, donc
 * son `href` et son `image` sont exactement ceux de la fiche. `PRODUCTS` en
 * repli pour une référence détaillée qui n'aurait pas été agrégée. Un slug
 * inconnu donne une tuile sans vignette mais toujours cliquable : le lien vers
 * la fiche vaut mieux qu'une tuile muette.
 */
function resolveProduct(slug: string): PraiseTile["product"] {
  const found = SEARCH_PRODUCTS.find((p) => p.slug === slug);
  if (found) return { name: found.name, brand: found.brand, href: found.href, image: found.image };
  const detail = PRODUCTS[slug];
  if (detail) return { name: detail.name, brand: detail.brand, href: `/produit/${slug}`, image: detail.image };
  return { name: slug, brand: "", href: `/produit/${slug}` };
}

/**
 * Entrelace les tuiles produit par produit (un Khamrah, un Marwa, un Salvo…).
 * Dans l'ordre du fichier, les six médias Khamrah se suivent et la
 * répartition en colonnes les alignerait tous sur la première rangée du mur.
 */
function interleaveByProduct(tiles: PraiseTile[]): PraiseTile[] {
  const groups = new Map<string, PraiseTile[]>();
  for (const t of tiles) {
    const list = groups.get(t.product.href) ?? [];
    list.push(t);
    groups.set(t.product.href, list);
  }
  const queues = [...groups.values()];
  const out: PraiseTile[] = [];
  while (out.length < tiles.length) {
    for (const q of queues) {
      const next = q.shift();
      if (next) out.push(next);
    }
  }
  return out;
}

export default function MurDesElogesPage() {
  // Une tuile par média : un avis à trois photos donne trois tuiles.
  const tiles = interleaveByProduct(
    REVIEW_MEDIA.flatMap((review) => {
      const product = resolveProduct(review.productSlug);
      return review.media.map((media, i) => ({
        id: `${review.id}-${i}`,
        media,
        author: review.author,
        verified: review.verified,
        product,
      }));
    }),
  );

  return (
    <div style={{ background: "var(--surface-page)", paddingTop: 40 }}>
      <header style={{ maxWidth: 720, margin: "0 auto", padding: "16px 24px 36px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "11px", letterSpacing: ".24em", textTransform: "uppercase", color: "var(--gold-700)", marginBottom: 14 }}>
          Nos clients
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(2.4rem, 4.4vw, 3.8rem)", lineHeight: 1.05, color: "var(--ink-900)", margin: 0 }}>
          Le mur des éloges
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: "1.0625rem", lineHeight: 1.7, color: "var(--ink-500)", margin: "16px auto 0", maxWidth: "48ch" }}>
          Leurs photos et leurs vidéos, flacon en main — cliquez sur une image pour retrouver le parfum.
        </p>
      </header>

      <PraiseWall tiles={tiles} />
    </div>
  );
}
