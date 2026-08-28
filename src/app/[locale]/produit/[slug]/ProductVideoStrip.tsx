"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { DEMO_STORIES } from "@/data/product-stories";
import { DEMO as SHOPPABLE_VIDEOS } from "@/data/shoppable-videos";
import { clipsFor as fileClipsFor } from "@/data/product-clips";

/**
 * Rangée de quatre miniatures vidéo, sous le bloc livraison de la fiche produit.
 *
 * Le catalogue n'a pas quatre films par parfum — Khamrah en a cinq, la plupart
 * zéro ou un. Le composant ne fabrique donc rien : il place les vidéos réellement
 * disponibles pour CE produit dans les quatre cases, et laisse les autres en
 * « à venir ». Les quatre cases restent visibles même vides, parce qu'elles
 * annoncent ce que la fiche contiendra — une case qui disparaît ne dit rien.
 *
 * Client Component pour la lecture au clic (état d'ouverture de la lightbox),
 * comme `ProductGallery` et `AddToCart` le sont déjà à côté. Aucune donnée
 * dépendante de l'horloge ici : le rendu serveur et le rendu client sont
 * identiques, il n'y a pas de risque d'hydratation.
 */

type Clip = {
  videoUrl: string;
  posterUrl: string;
  title?: string;
};

type CategoryId = "ugc" | "spot" | "hypermotion" | "fiole-fixe";

const CATEGORIES: { id: CategoryId; label: string; caption: string }[] = [
  { id: "ugc", label: "UGC", caption: "Une cliente le porte" },
  { id: "spot", label: "Spot TV", caption: "Le film de marque" },
  { id: "hypermotion", label: "Hypermotion", caption: "Le décor en mouvement" },
  // « Fiole fixe » : le flacon reste net pendant que le décor bouge autour. Ce
  // qu'aucun packshot ne fait — on voit CE flacon-là, et il reste identifiable
  // du début à la fin du plan.
  { id: "fiole-fixe", label: "Fiole fixe", caption: "Le flacon net, le décor en mouvement" },
];

/**
 * Règle d'attribution — deux étages, dans cet ordre :
 *
 * 1. Une vidéo dont on sait ce qu'elle montre est épinglée à sa catégorie. Les
 *    deux seules du repo dans ce cas sont documentées à leur source :
 *    `khamrah-levitation` est décrite comme « le plan le plus pub de la banque »
 *    → Spot TV ; `khamrah-nectar` est une macro de coulée d'ambre sur le flacon,
 *    c'est-à-dire de la matière en mouvement → Hypermotion.
 * 2. Tout le reste — dont on ne sait rien de plus que le produit qu'il montre —
 *    tombe dans la première case encore libre, dans l'ordre de `CATEGORIES`.
 *    On ne devine pas : mieux vaut une vidéo rangée arbitrairement mais
 *    visible qu'une association inventée qui mentirait sur son contenu.
 */
const PINNED_CATEGORY: Record<string, CategoryId> = {
  // Nouvelles prises de vue Khamrah — chacune épinglée à ce qu'elle montre :
  "/assets/videos/khamrah-hf-02.mp4": "spot", // cascade de cannelle + coulée d'ambre : le film de marque
  "/assets/videos/khamrah-hf-03.mp4": "hypermotion", // macro de la coulée : de la matière en mouvement
  "/assets/videos/khamrah-hf-04.mp4": "fiole-fixe", // flacon net sur la pierre, décor qui bouge autour
  "/assets/videos/khamrah-hf-05.mp4": "ugc", // une main soulève le capuchon : la seule prise « portée »
  // Anciennes vidéos, conservées : elles ne sont plus référencées par les deux
  // banques, mais un retour en arrière sur l'une d'elles retrouve sa case.
  "/assets/videos/khamrah-levitation.mp4": "spot",
  "/assets/videos/khamrah-nectar.mp4": "hypermotion",
  "/assets/videos/khamrah-fiole-fixe.mp4": "fiole-fixe",
  // Blueberry Musk — trois films dont on sait ce qu'ils montrent :
  // `blueberry-hf-01` est un plan large d'entrepôt de glace, décor construit et
  // flacon posé au fond, c'est-à-dire un film de marque → Spot TV ;
  // `blueberry-hf-05` est une macro de myrtilles et d'éclats de glace en
  // suspension, de la matière en mouvement sans le produit → Hypermotion ;
  // `blueberry-hf-03` garde le flacon net et centré pendant que les baies
  // tournent autour → Fiole fixe.
  "/assets/videos/blueberry-hf-01.mp4": "spot",
  "/assets/videos/blueberry-hf-05.mp4": "hypermotion",
  "/assets/videos/blueberry-hf-03.mp4": "fiole-fixe",
};

/**
 * Les trois banques de vidéos du repo indexent par identifiant produit, mais pas
 * sous le même nom de champ, et se recoupent (Reef 33 est dans deux d'entre elles
 * avec le même fichier). On fusionne et on déduplique sur l'URL du fichier.
 *
 * L'ordre de lecture est celui de la priorité d'affichage : les films attachés à
 * la fiche (`product-clips.ts`) d'abord — ils ont été choisis et ordonnés pour
 * cette bande-là —, puis les stories, puis le carrousel « shoppable ».
 */
function clipsForProduct(slug: string): Clip[] {
  const byUrl = new Map<string, Clip>();

  for (const clip of fileClipsFor(slug)) {
    if (!byUrl.has(clip.videoUrl)) byUrl.set(clip.videoUrl, { ...clip });
  }
  for (const story of DEMO_STORIES) {
    if (story.shopProductHandle !== slug) continue;
    if (!byUrl.has(story.videoUrl)) {
      byUrl.set(story.videoUrl, { videoUrl: story.videoUrl, posterUrl: story.posterUrl, title: story.title });
    }
  }
  for (const video of SHOPPABLE_VIDEOS) {
    if (video.productHandle !== slug) continue;
    if (!byUrl.has(video.videoUrl)) {
      byUrl.set(video.videoUrl, { videoUrl: video.videoUrl, posterUrl: video.posterUrl, title: video.product.name });
    }
  }

  return [...byUrl.values()];
}

function assignClips(clips: Clip[]): (Clip | null)[] {
  const slots: (Clip | null)[] = CATEGORIES.map(() => null);
  const leftovers: Clip[] = [];

  // Étage 1 — les vidéos épinglées prennent leur case si elle est libre.
  for (const clip of clips) {
    const pinned = PINNED_CATEGORY[clip.videoUrl];
    const index = pinned ? CATEGORIES.findIndex((c) => c.id === pinned) : -1;
    if (index >= 0 && slots[index] === null) slots[index] = clip;
    else leftovers.push(clip);
  }

  // Étage 2 — les autres remplissent les cases restantes, dans l'ordre.
  for (const clip of leftovers) {
    const free = slots.indexOf(null);
    if (free === -1) break; // plus de quatre vidéos : le surplus n'est pas montré
    slots[free] = clip;
  }

  return slots;
}

export default function ProductVideoStrip({
  productSlug,
  productName,
  productImage,
}: {
  productSlug: string;
  productName: string;
  productImage?: string;
}) {
  const [openIndex, setOpenIndex] = useState(-1);
  const playerRef = useRef<HTMLVideoElement>(null);

  const slots = assignClips(clipsForProduct(productSlug));
  const open = openIndex >= 0 ? slots[openIndex] : null;

  const close = useCallback(() => setOpenIndex(-1), []);

  // La lecture part d'un tap, donc elle est autorisée — sauf navigateur qui
  // bloque tout (Brave Android, économiseur de données). `autoPlay` seul ne
  // laisse alors qu'un poster immobile : on retente explicitement, et en dernier
  // recours en muet (les contrôles natifs permettent de remettre le son).
  useEffect(() => {
    if (!open) return;
    const v = playerRef.current;
    if (!v) return;
    v.playsInline = true;
    const tryPlay = () => {
      v.play().catch(() => {
        if (v.muted) return;
        v.muted = true;
        v.play().catch(() => {});
      });
    };
    tryPlay();
    const onReady = () => {
      if (v.paused) tryPlay();
    };
    v.addEventListener("canplay", onReady);
    v.addEventListener("loadeddata", onReady);
    return () => {
      v.removeEventListener("canplay", onReady);
      v.removeEventListener("loadeddata", onReady);
    };
  }, [open]);

  // Échap + verrou du scroll pendant la lecture, comme `TrendLightbox`.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  // Le bloc n'a d'intérêt que s'il a quelque chose à montrer : sans la moindre
  // vidéo ET sans visuel produit pour les cases « à venir », on ne rend rien.
  const hasSomethingToShow = slots.some((s) => s !== null) || Boolean(productImage);
  if (!hasSomethingToShow) return null;

  return (
    <section
      aria-labelledby="dp-vs-title"
      style={{
        borderTop: "1px solid var(--line-100)",
        paddingTop: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.875rem",
      }}
    >
      <h2
        id="dp-vs-title"
        style={{
          margin: 0,
          fontFamily: "var(--font-sans)",
          fontSize: "var(--t-xs)",
          fontWeight: "var(--fw-semibold)",
          letterSpacing: "var(--ls-wider)",
          textTransform: "uppercase",
          color: "var(--gold-700)",
        }}
      >
        En images
      </h2>

      <ul
        className="dp-vs-grid"
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0.625rem",
        }}
      >
        {CATEGORIES.map((category, i) => {
          const clip = slots[i];
          const poster = clip?.posterUrl ?? productImage;

          return (
            <li key={category.id} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <button
                type="button"
                className={clip ? "dp-vs-tile" : "dp-vs-tile dp-vs-tile--soon"}
                disabled={!clip}
                aria-disabled={clip ? undefined : "true"}
                aria-label={
                  clip
                    ? `Lire la vidéo ${category.label} — ${productName}`
                    : `${category.label} — vidéo à venir pour ${productName}`
                }
                onClick={clip ? () => setOpenIndex(i) : undefined}
                style={{
                  position: "relative",
                  padding: 0,
                  aspectRatio: "9 / 16",
                  borderRadius: "var(--r-md)",
                  overflow: "hidden",
                  border: "1px solid var(--line-200)",
                  background: "var(--surface-image)",
                  cursor: clip ? "pointer" : "not-allowed",
                  transition: "border-color var(--dur-fast) var(--ease-out), transform var(--dur) var(--ease-out)",
                }}
              >
                {poster && (
                  <Image
                    src={poster}
                    alt=""
                    fill
                    sizes="(max-width: 760px) 45vw, 130px"
                    style={{
                      objectFit: "cover",
                      // Une case vide est assombrie : elle se lit tout de suite
                      // comme un emplacement réservé, pas comme un visuel du produit.
                      filter: clip ? "none" : "brightness(0.45) saturate(0.7)",
                    }}
                  />
                )}

                {clip ? (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 36,
                      height: 36,
                      borderRadius: "var(--r-pill)",
                      background: "rgba(255,255,255,0.9)",
                      display: "grid",
                      placeItems: "center",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--espresso-900)">
                      <path d="M8 5.5v13l11-6.5z" />
                    </svg>
                  </span>
                ) : (
                  <span
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "var(--r-pill)",
                      background: "var(--badge-dark-bg)",
                      color: "var(--badge-dark-fg)",
                      fontFamily: "var(--font-sans)",
                      fontSize: "9px",
                      fontWeight: "var(--fw-semibold)",
                      letterSpacing: "var(--ls-wide)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    À VENIR
                  </span>
                )}
              </button>

              {/* Libellé et légende retirés de l'affichage : les vignettes se
                  lisent seules, et quatre paires de lignes sous des images
                  déjà petites alourdissaient la colonne. Les intitulés
                  survivent dans l'aria-label du bouton, où ils servent
                  vraiment — un lecteur d'écran n'a que ça. */}
            </li>
          );
        })}
      </ul>

      {/* Lecteur plein écran.
          `TrendLightbox` n'est pas réutilisable ici : c'est une modale d'AVIS
          (elle exige un `TrendProduct` avec sa fiche, son prix et son avis
          client, et consacre la moitié de sa surface au témoignage). L'y faire
          entrer supposerait de fabriquer un faux avis. On garde donc un lecteur
          minimal, calqué sur ses conventions — Échap, verrou de scroll, clic
          sur le voile pour fermer. */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${open.title ?? productName} — vidéo`}
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(20,15,8,0.78)",
            display: "grid",
            placeItems: "center",
            padding: "clamp(12px, 4vw, 48px)",
          }}
        >
          <button
            type="button"
            aria-label="Fermer la vidéo"
            onClick={close}
            style={{
              position: "fixed",
              top: 18,
              insetInlineEnd: 18,
              width: 44,
              height: 44,
              borderRadius: "var(--r-md)",
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(0,0,0,0.4)",
              color: "var(--on-dark-strong)",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              zIndex: 1002,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <video
            ref={playerRef}
            key={open.videoUrl}
            src={open.videoUrl}
            poster={open.posterUrl}
            autoPlay
            controls
            playsInline
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(420px, 100%)",
              maxHeight: "calc(100vh - 96px)",
              aspectRatio: "9 / 16",
              objectFit: "cover",
              borderRadius: "var(--r-lg)",
              background: "var(--espresso-900)",
              boxShadow: "var(--shadow-lg)",
            }}
          />
        </div>
      )}

      {/* Hover / focus / écrans étroits : impossibles en style inline. */}
      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.dp-vs-tile:not(:disabled):hover { border-color: var(--gold-300) !important; transform: translateY(-2px); }
.dp-vs-tile:focus-visible { outline: 2px solid var(--gold-500); outline-offset: 2px; }

/* Sous 760 px, quatre colonnes réduiraient chaque vignette à une bande illisible :
   on passe à deux par ligne, où le poster et sa légende restent lisibles. */
@media (max-width: 760px) {
  .dp-vs-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.875rem !important; }
}
@media (prefers-reduced-motion: reduce) {
  .dp-vs-tile { transition: none !important; }
  .dp-vs-tile:not(:disabled):hover { transform: none; }
}
`;
