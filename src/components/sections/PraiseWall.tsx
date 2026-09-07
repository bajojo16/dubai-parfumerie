"use client";

/**
 * PraiseWall — mur de photos et vidéos de clients, en colonnes qui défilent.
 *
 * Le composant ne connaît ni les avis ni le catalogue : il reçoit des tuiles
 * déjà résolues (média + produit + auteur). La jointure slug → produit se fait
 * dans la page serveur, pour ne pas embarquer `search-catalog` (qui agrège
 * toutes les sources produit) dans le bundle client.
 *
 * Boucle sans saut : chaque colonne rend sa liste deux fois dans une piste
 * animée de 0 à -50 %. La gouttière est portée par une marge SOUS chaque tuile
 * (pas un `gap` flex) : avec un gap, la moitié de la piste ne tomberait pas sur
 * une frontière de tuile et la boucle sauterait d'un demi-gap à chaque tour.
 *
 * Nombre de colonnes : décidé côté client via `matchMedia` et non par media
 * query CSS, parce que la répartition des tuiles dans les colonnes est un
 * découpage du tableau — le CSS ne peut pas redistribuer des enfants entre
 * conteneurs. Le serveur rend 4 colonnes ; la première peinture mobile est
 * corrigée à l'hydratation.
 */

import { useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { ReviewMediaItem } from "@/data/review-media";

export type PraiseTile = {
  id: string;
  media: ReviewMediaItem;
  /** Prénom + initiale, tel que fourni par `review-media.ts`. */
  author: string;
  verified: boolean;
  product: {
    /** Slug de la fiche : sert au filtre « les éloges de ce parfum ». */
    slug?: string;
    name: string;
    brand: string;
    /** Toujours `/produit/<slug>` — passé tel quel au `Link` localisé. */
    href: string;
    /** Absent → tuile sans vignette, mais toujours cliquable. */
    image?: string;
  };
};

const GAP = 12;
const THUMB = 64;

// Durées volontairement différentes d'une colonne à l'autre : des colonnes
// synchronisées donnent une impression mécanique, là où le mur doit « respirer ».
const DURATIONS_S = [72, 84, 66, 90];

// ─── Nombre de colonnes ──────────────────────────────────────────────────────

const MQ_WIDE = "(min-width: 1000px)";
const MQ_NARROW = "(max-width: 760px)";

function subscribeColumns(onChange: () => void) {
  const queries = [window.matchMedia(MQ_WIDE), window.matchMedia(MQ_NARROW)];
  queries.forEach((q) => q.addEventListener("change", onChange));
  return () => queries.forEach((q) => q.removeEventListener("change", onChange));
}
function readColumns(): number {
  if (window.matchMedia(MQ_NARROW).matches) return 2;
  return window.matchMedia(MQ_WIDE).matches ? 4 : 3;
}
function serverColumns(): number {
  return 4;
}

// ─── Vidéo pilotée par la visibilité ─────────────────────────────────────────

function WallVideo({ media }: { media: Extract<ReviewMediaItem, { type: "video" }> }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // React ne sérialise pas l'attribut `muted` dans le HTML serveur : sans
    // cette ligne, la lecture auto serait refusée avant l'hydratation.
    v.muted = true;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            // Refus (économie de données, Safari basse conso…) → le poster reste.
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        });
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={media.src}
      poster={media.posterUrl}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      aria-label={media.alt}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  );
}

// ─── Tuile ───────────────────────────────────────────────────────────────────

function Tile({ tile, hidden }: { tile: PraiseTile; hidden?: boolean }) {
  const { media, product, author, verified } = tile;
  const kind = media.type === "video" ? "vidéo" : "photo";

  return (
    <Link
      href={product.href}
      className="dp-praise-tile"
      aria-label={`Voir ${product.name} de ${product.brand} — ${kind} de ${author}`}
      // Le doublon de piste est purement visuel : il ne doit ni recevoir le focus
      // ni être annoncé (sinon chaque tuile serait lue deux fois).
      tabIndex={hidden ? -1 : undefined}
      aria-hidden={hidden || undefined}
      style={{
        position: "relative",
        display: "block",
        aspectRatio: "4 / 5",
        borderRadius: 14,
        overflow: "hidden",
        background: "var(--surface-image)",
        marginBottom: GAP,
        textDecoration: "none",
        color: "inherit",
        transition: "transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s",
        boxShadow: "0 1px 2px rgba(21,16,11,.06)",
        // Isole le coin arrondi + le survol dans une couche de compositing : évite
        // les bords qui « bavent » pendant l'animation de la colonne (Safari).
        transform: "translateZ(0)",
      }}
    >
      {media.type === "image" ? (
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes="(max-width: 760px) 50vw, (max-width: 1000px) 33vw, 25vw"
          style={{ objectFit: "cover" }}
        />
      ) : (
        <WallVideo media={media} />
      )}

      {/* Vignette produit — posée en haut à gauche, fond blanc pour que les
          packshots sur fond clair ne se fondent pas dans la photo du client. */}
      {product.image && (
        <span
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            width: THUMB,
            height: THUMB,
            borderRadius: 10,
            background: "var(--surface-white)",
            boxShadow: "0 2px 10px rgba(21,16,11,.18)",
            overflow: "hidden",
            display: "block",
          }}
        >
          <Image src={product.image} alt="" fill sizes={`${THUMB}px`} style={{ objectFit: "cover" }} />
        </span>
      )}

      {/* Bas de tuile : badge toujours visible, nom du produit seulement au survol. */}
      <span
        className="dp-praise-foot"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "28px 10px 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 6,
        }}
      >
        <span className="dp-praise-caption" style={{ display: "block", color: "var(--on-dark-strong)", lineHeight: 1.2 }}>
          <span style={{ display: "block", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.05rem" }}>{product.name}</span>
          <span style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "0.7rem", letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.85, marginTop: 2 }}>
            {product.brand}
          </span>
        </span>
        {verified && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 8px",
              borderRadius: 999,
              background: "rgba(253,251,246,.92)",
              color: "var(--ink-700)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.68rem",
              fontWeight: 500,
              letterSpacing: ".04em",
              boxShadow: "0 1px 4px rgba(21,16,11,.15)",
            }}
          >
            <span aria-hidden style={{ color: "var(--gold-700)" }}>✓</span>
            Achat vérifié
          </span>
        )}
      </span>
    </Link>
  );
}

// ─── Mur ─────────────────────────────────────────────────────────────────────

export function PraiseWall({ tiles }: { tiles: PraiseTile[] }) {
  const columns = useSyncExternalStore(subscribeColumns, readColumns, serverColumns);

  // Répartition tour à tour : la colonne c reçoit les tuiles d'index ≡ c (mod n).
  const lanes = Array.from({ length: columns }, (_, c) => tiles.filter((_, i) => i % columns === c));

  return (
    <section
      aria-label="Photos et vidéos de nos clients"
      style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px 64px" }}
    >
      <div
        className="dp-praise-wall"
        style={{
          position: "relative",
          height: "min(82vh, 860px)",
          overflow: "hidden",
          // Le mur découpe ses colonnes en haut et en bas : les coins arrondis
          // évitent une coupe brute alignée sur le bord du conteneur.
          borderRadius: 18,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: GAP,
            alignItems: "start",
          }}
        >
          {lanes.map((lane, c) => (
            <div key={c} className="dp-praise-col" style={{ minWidth: 0 }}>
              <div
                className={`dp-praise-track ${c % 2 === 0 ? "dp-praise-track--up" : "dp-praise-track--down"}`}
                style={{ ["--dp-praise-dur" as string]: `${DURATIONS_S[c % DURATIONS_S.length]}s` }}
              >
                {lane.map((t) => (
                  <Tile key={t.id} tile={t} />
                ))}
                {/* Doublon : la seconde moitié de la piste, pour la boucle. */}
                <div className="dp-praise-dup">
                  {lane.map((t) => (
                    <Tile key={`${t.id}-dup`} tile={t} hidden />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Voiles haut/bas : les tuiles entrent et sortent en fondu plutôt que
            coupées net par le bord du mur. */}
        <div className="dp-praise-veil" aria-hidden style={{ position: "absolute", left: 0, right: 0, top: 0, height: 72, background: "linear-gradient(to bottom, var(--surface-page), rgba(253,251,246,0))", pointerEvents: "none" }} />
        <div className="dp-praise-veil" aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 72, background: "linear-gradient(to top, var(--surface-page), rgba(253,251,246,0))", pointerEvents: "none" }} />
      </div>

      <style>{`
        @keyframes dp-praise-up {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        @keyframes dp-praise-down {
          from { transform: translateY(-50%); }
          to   { transform: translateY(0); }
        }
        .dp-praise-track {
          animation-duration: var(--dp-praise-dur, 72s);
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }
        .dp-praise-track--up   { animation-name: dp-praise-up; }
        .dp-praise-track--down { animation-name: dp-praise-down; }
        /* Pause au survol de la colonne et au focus clavier d'une de ses tuiles. */
        .dp-praise-col:hover .dp-praise-track,
        .dp-praise-col:focus-within .dp-praise-track { animation-play-state: paused; }

        /* Survol d'une tuile : légère montée + bandeau nom/maison. Le dégradé vit
           dans un pseudo-élément : une opacité sur le pied lui-même cacherait
           aussi le badge « Achat vérifié », qui doit rester lisible au repos. */
        .dp-praise-foot::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(21,16,11,.72), rgba(21,16,11,0));
          opacity: 0;
          transition: opacity .3s;
        }
        .dp-praise-foot > * { position: relative; }
        .dp-praise-caption { opacity: 0; transform: translateY(6px); transition: opacity .3s, transform .3s; }
        .dp-praise-tile:hover, .dp-praise-tile:focus-visible {
          transform: translateY(-4px) translateZ(0) !important;
          box-shadow: 0 12px 28px rgba(21,16,11,.18) !important;
        }
        .dp-praise-tile:hover .dp-praise-foot::before, .dp-praise-tile:focus-visible .dp-praise-foot::before { opacity: 1; }
        .dp-praise-tile:hover .dp-praise-caption, .dp-praise-tile:focus-visible .dp-praise-caption { opacity: 1; transform: none; }

        /* Sans animation (réglage système) : un mur en overflow:hidden rendrait
           tout ce qui dépasse inatteignable. On rend une grille statique qui
           défile avec la page, et on retire le doublon devenu inutile. */
        @media (prefers-reduced-motion: reduce) {
          .dp-praise-wall { height: auto !important; overflow: visible !important; }
          .dp-praise-track { animation: none !important; }
          .dp-praise-dup, .dp-praise-veil { display: none !important; }
        }
      `}</style>
    </section>
  );
}
