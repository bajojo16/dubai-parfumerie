"use client";

import { useRef } from "react";
import { Link } from "@/i18n/navigation";
import { useVideoAutoplay } from "@/hooks/useVideoAutoplay";

const C = {
  cream: "#F7F3EC",
  ink: "#1A1611",
  gold: "#B8924A",
  goldLight: "#D9C7A0",
};

export type EditorialCard = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  href: string;
  video: {
    src: string;
    poster: string;
  };
};

export type EditorialCardLabels = {
  play: string; // aria-label bouton lecture
};

const DEFAULT_LABELS: EditorialCardLabels = {
  play: "Lire la vidéo",
};

export function EditorialVideoCard({
  card,
  locale = "fr",
  labels,
  fluid = false,
}: {
  card: EditorialCard;
  locale?: string;
  labels?: Partial<EditorialCardLabels>;
  /**
   * Mode largeur :
   * - false (défaut) : largeur fixe 380px (rail scrollable, mode "start").
   * - true : remplit la largeur de son conteneur (zone vidéo ancrée, mode "end").
   */
  fluid?: boolean;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const isRTL = locale === "ar";

  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLElement>(null);

  // La lecture suit la visibilité, jamais le survol : sur téléphone il n'y a
  // pas de survol. Le hook force `muted` + `playsInline` avant chaque appel,
  // ouvre `preload` au moment utile (la carte était en `preload="none"`, ce qui
  // faisait échouer le play() immédiat et la laissait figée sur son poster) et
  // retente à `canplay`. En cas de refus du navigateur, `blocked` fait
  // apparaître le bouton de lecture — ici toujours présent quand ça ne joue pas.
  const { playing, toggle } = useVideoAutoplay(videoRef, rootRef);

  return (
    <article
      ref={rootRef}
      dir={isRTL ? "rtl" : "ltr"}
      // Classe appliquée uniquement en largeur fixe (mode "start", rail Reef) :
      // en mode fluide (mode "end"), la carte remplit déjà son conteneur ancré
      // (largeur pilotée par .bsr-split-editorial dans BestSellersRail.tsx),
      // qui a son propre repli mobile — pas besoin (et pas souhaitable) d'override ici.
      className={fluid ? undefined : "dp-editorial-card"}
      style={{
        flex: fluid ? "1 1 auto" : "0 0 auto",
        // Même largeur que RailProductCard : à 380 px la carte vidéo écrasait
        // les produits qu'elle accompagne et dépassait du rail.
        width: fluid ? "100%" : 216,
        position: "relative",
        borderRadius: 18,
        overflow: "hidden",
        background: C.ink,
        boxShadow: "0 10px 30px rgba(40,30,15,0.16)",
      }}
    >
      {/* Vidéo plein cadre — absolue : ne dicte pas la hauteur de la carte,
          elle remplit (cover) la hauteur fixée par les cartes produits (pas d'étirement) */}
      <video
        ref={videoRef}
        src={card.video.src}
        poster={card.video.poster}
        muted
        loop
        playsInline
        // Rien n'est téléchargé tant que la carte n'est pas à l'écran ; le hook
        // bascule sur "auto" avant de lancer la lecture.
        preload="none"
        aria-label={card.title}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          display: "block",
        }}
      />

      {/* Bouton lecture visuel (masqué quand ça joue) */}
      {!playing && (
        <button
          type="button"
          onClick={toggle}
          aria-label={L.play}
          data-dp-play-fallback
          className="dp-editorial-play-btn"
          style={{
            position: "absolute",
            top: "44%",
            insetInlineStart: "50%",
            transform: "translate(-50%, -50%)",
            width: 64,
            height: 64,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            background: "rgba(247,243,236,0.92)",
            display: "grid",
            placeItems: "center",
            // Le voile dégradé et le bloc éditorial sont déclarés APRÈS dans le
            // DOM : sans z-index ils passaient devant le bouton, qui devenait
            // intappable en variante fluide (le titre recouvre son centre).
            zIndex: 3,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={C.ink}
            aria-hidden
            style={{ marginInlineStart: 3 }}
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}

      {/* Voile dégradé bas pour lisibilité du texte */}
      <div
        style={{
          position: "absolute",
          insetInline: 0,
          bottom: 0,
          height: "62%",
          background:
            "linear-gradient(to top, rgba(20,18,13,0.92) 0%, rgba(20,18,13,0.45) 45%, rgba(20,18,13,0) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Contenu éditorial */}
      <div
        className="dp-editorial-content"
        style={{
          position: "absolute",
          insetInline: 0,
          bottom: 0,
          padding: "16px 22px 18px",
          textAlign: isRTL ? "right" : "left",
        }}
      >
        <h3
          className="dp-editorial-title"
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: 25,
            fontWeight: 500,
            lineHeight: 1.1,
            color: C.cream,
          }}
        >
          {card.title}
        </h3>
        <p
          style={{
            margin: "6px 0 10px",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            lineHeight: 1.45,
            color: "rgba(247,243,236,0.85)",
          }}
        >
          {card.subtitle}
        </p>
        <Link
          href={card.href}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: C.goldLight,
            textDecoration: "none",
          }}
        >
          {card.ctaLabel}
          <span aria-hidden>{isRTL ? "←" : "→"}</span>
        </Link>
      </div>
    </article>
  );
}
