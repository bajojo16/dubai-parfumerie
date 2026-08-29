"use client";

import { useState } from "react";
import type { ReviewWithMedia } from "@/data/review-media";
import { ReviewMediaViewer, type ReviewViewerLabels } from "./ReviewMediaViewer";

/**
 * ReviewMediaBubbles — rangée de bulles rondes au pied des avis clients.
 *
 * Le dessin est celui de `StoryBubbles` (cercle de 72 px, anneau doré, pastille
 * en bas) : c'est déjà le vocabulaire du site pour « il y a quelque chose à
 * regarder ici », et l'inventer une seconde fois donnerait deux grammaires pour
 * un même geste. Deux écarts assumés :
 *
 * — La vignette n'est pas systématiquement une `<video>` en lecture. Un avis
 *   illustre le plus souvent une PHOTO ; charger un `<video>` par bulle pour
 *   n'afficher qu'un poster ferait payer un préchargement pour rien. On rend
 *   donc l'image, ou le poster de la vidéo, et un pictogramme de lecture signale
 *   la présence d'une vidéo.
 * — La pastille porte la note et non un prix : ce qui qualifie un avis, c'est
 *   sa note, et le prix est déjà partout ailleurs sur la fiche.
 *
 * Ne rend RIEN si la liste est vide — pas de titre orphelin, pas de « aucun
 * avis en photo » : une section vide coûte plus en confiance qu'elle ne
 * rapporte en information.
 */
export function ReviewMediaBubbles({
  reviews,
  productSlug,
  productName,
  locale = "fr",
  heading = "Les avis en images",
  subheading = "Photos et vidéos envoyées par les clients",
  labels,
}: {
  reviews: ReviewWithMedia[];
  productSlug: string;
  productName: string;
  locale?: string;
  heading?: string;
  subheading?: string;
  labels?: Partial<ReviewViewerLabels>;
}) {
  const [open, setOpen] = useState<number | null>(null);

  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="rmb-root" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="rmb-head">
        <span className="rmb-title">{heading}</span>
        <span className="rmb-sub">{subheading}</span>
      </div>

      <div className="rmb-row">
        {reviews.map((r, i) => (
          <ReviewBubble key={r.id} review={r} onOpen={() => setOpen(i)} />
        ))}
      </div>

      {open !== null && reviews[open] && (
        <ReviewMediaViewer
          review={reviews[open]}
          productSlug={productSlug}
          productName={productName}
          locale={locale}
          labels={labels}
          onClose={() => setOpen(null)}
        />
      )}

      <style>{`
        .rmb-root{margin-top:28px;padding-top:24px;border-top:1px solid var(--line-100,#EFE7D8)}
        .rmb-head{display:flex;flex-direction:column;gap:2px;margin-bottom:16px}
        .rmb-title{font-family:var(--font-display);font-size:1.15rem;font-weight:600;color:var(--ink-900)}
        .rmb-sub{font-family:var(--font-sans);font-size:var(--t-xs);color:var(--ink-400)}
        /* Défilement horizontal plutôt qu'un retour à la ligne : au-delà de six
           avis, une seconde rangée entamée par une bulle isolée se lit comme un
           bug de mise en page. */
        .rmb-row{display:flex;gap:18px;overflow-x:auto;padding:4px 2px 14px;scrollbar-width:none}
        .rmb-row::-webkit-scrollbar{display:none}
        .rmb-bubble{position:relative;width:72px;height:72px;flex:none;border-radius:50%;padding:3px;border:none;cursor:pointer;background:linear-gradient(135deg,var(--gold-300,#E5C06A),var(--gold-500,#C8901E));box-shadow:0 0 0 2px var(--surface-page,#FDFBF6);transition:transform .25s ease,box-shadow .25s ease}
        .rmb-bubble:hover{transform:scale(1.1);box-shadow:0 0 0 2px var(--surface-page,#FDFBF6),0 8px 22px -8px rgba(185,143,58,.7)}
        .rmb-bubble:focus-visible{outline:2px solid var(--gold-500);outline-offset:4px}
        .rmb-thumb{position:relative;display:block;width:100%;height:100%;border-radius:50%;overflow:hidden;background:var(--espresso-900,#15100B)}
        .rmb-thumb img{width:100%;height:100%;object-fit:cover;display:block}
        .rmb-play{position:absolute;inset:0;display:grid;place-items:center;color:#fff;filter:drop-shadow(0 1px 4px rgba(0,0,0,.6))}
        /* Compteur de médias supplémentaires : dit qu'une bulle cache une
           galerie et pas une image unique, sans avoir à l'ouvrir. */
        .rmb-more{position:absolute;top:-2px;inset-inline-end:-2px;min-width:19px;height:19px;border-radius:999px;display:grid;place-items:center;padding:0 4px;font-family:var(--font-sans);font-size:10px;font-weight:700;color:var(--espresso-900);background:#fff;border:1.5px solid var(--gold-500)}
        .rmb-note{position:absolute;bottom:-5px;inset-inline:0;margin:0 auto;width:fit-content;display:flex;align-items:center;gap:2px;font-family:var(--font-sans);font-size:10px;font-weight:700;line-height:1;color:#fff;background:var(--gold-500,#C8901E);border:1.5px solid var(--surface-page,#FDFBF6);border-radius:999px;padding:2px 7px}
        @media (max-width:760px){
          .rmb-row{gap:14px}
          .rmb-bubble{width:64px;height:64px}
        }
        @media (prefers-reduced-motion:reduce){
          .rmb-bubble{transition:none}
          .rmb-bubble:hover{transform:none}
        }
      `}</style>
    </div>
  );
}

function ReviewBubble({ review, onOpen }: { review: ReviewWithMedia; onOpen: () => void }) {
  const first = review.media[0];
  const isVideo = first?.type === "video";
  const thumb = first ? (first.type === "video" ? first.posterUrl : first.src) : "";
  const extra = review.media.length - 1;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="rmb-bubble"
      // L'auteur est nommé : « Avis 3 » ne dit rien à qui navigue au lecteur
      // d'écran, alors que le nom est justement ce qui distingue deux bulles.
      aria-label={`Avis de ${review.author}, ${review.rating} étoiles sur 5 — ${review.media.length} média${review.media.length > 1 ? "s" : ""}`}
    >
      <span className="rmb-thumb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumb} alt="" loading="lazy" />
        {isVideo && (
          <span className="rmb-play" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </span>
        )}
      </span>
      {extra > 0 && (
        <span className="rmb-more" aria-hidden>
          +{extra}
        </span>
      )}
      <span className="rmb-note" aria-hidden>
        {review.rating}
        <span style={{ fontSize: 9 }}>★</span>
      </span>
    </button>
  );
}
