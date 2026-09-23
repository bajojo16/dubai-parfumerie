/**
 * TEMPORAIRE — banc d'essai des cinq tuiles du bento, à supprimer.
 *
 * Le moteur de grille n'étant pas branché, chaque tuile est posée dans une
 * boîte aux dimensions exactes qu'elle recevra (3×2 = 560×620, 2×1 = 360×300,
 * 4×1 = 760×300), avec un bord fin qui rend visible tout débordement ou tout
 * vide.
 */

import { notFound } from "next/navigation";

import { PRODUCT_CONTENT } from "@/data/product-content";
import { resolveProduct } from "@/data/product-resolve";
import { reviewSummaryFor, reviewsFor } from "@/data/product-reviews";
import { reviewMediaForProduct } from "@/data/review-media";

import { GaugesTile } from "../produit/[slug]/tiles/GaugesTile";
import { LineTile } from "../produit/[slug]/tiles/LineTile";
import { PhotosTile } from "../produit/[slug]/tiles/PhotosTile";
import { PyramidTile } from "../produit/[slug]/tiles/PyramidTile";
import { RatingTile } from "../produit/[slug]/tiles/RatingTile";

const SLUG = "lattafa-khamrah";
const ALT_LINE_SLUG = "al-haramain-amber-oud";

function Box({ w, h, children }: { w: number; h: number; children: React.ReactNode }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        border: "1px solid #C8901E",
        borderRadius: 14,
        background: "#FFFFFF",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

export default function PreviewBentoTiles() {
  const product = resolveProduct(SLUG);
  if (!product) notFound();

  const content = PRODUCT_CONTENT[SLUG] ?? {};
  const altLine = resolveProduct(ALT_LINE_SLUG);

  return (
    <div style={{ padding: 40, display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
      <Box w={560} h={620}>
        <PyramidTile product={product} content={content} />
      </Box>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", gap: 20 }}>
          <Box w={360} h={300}>
            <GaugesTile content={content} product={product} />
          </Box>
          <Box w={360} h={300}>
            <RatingTile product={product} summary={reviewSummaryFor(SLUG)} />
          </Box>
        </div>
        <Box w={760} h={300}>
          <PhotosTile
            slug={SLUG}
            reviews={reviewsFor(SLUG)}
            mediaReviews={reviewMediaForProduct(SLUG)}
          />
        </Box>
      </div>
      <Box w={360} h={300}>
        <LineTile slug={SLUG} product={product} />
      </Box>
      {/* Repli sans résumé agrégé : la note doit grandir au lieu de laisser un trou. */}
      <Box w={360} h={300}>
        <RatingTile product={product} />
      </Box>
      {/* Variante à deux déclinaisons — Khamrah n'en a qu'une. */}
      <Box w={360} h={300}>
        <LineTile slug={ALT_LINE_SLUG} product={altLine ?? product} />
      </Box>
      {/* Repli sans concentration chiffrée : deux jauges doivent remplir la tuile. */}
      <Box w={360} h={300}>
        <GaugesTile content={content} />
      </Box>
    </div>
  );
}
