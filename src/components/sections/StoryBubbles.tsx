"use client";

import { useRef, useState } from "react";
import type { ProductStory } from "@/data/product-stories";
import { VideoPlayFallback } from "@/components/ui/VideoPlayFallback";
import { useVideoAutoplay } from "@/hooks/useVideoAutoplay";
import { StoryPlayer, type StoryLabels } from "./StoryPlayer";

/**
 * StoryBubbles — rangée de bulles rondes "stories" sous le bloc d'achat.
 *
 * La lecture ne dépend PLUS du survol : une bulle jouait uniquement au
 * `mouseenter`, et un téléphone n'en émet pas — toutes les bulles restaient
 * figées sur leur poster. Elles jouent maintenant dès qu'elles entrent dans le
 * champ de vision (muettes, en ligne) et se coupent quand elles en sortent.
 * Le survol garde son rôle sur pointeur fin : il relance depuis le début.
 * Tap : ouvre le player. Respecte prefers-reduced-motion.
 * N'affiche rien si stories vide.
 */
export function StoryBubbles({
  stories,
  locale = "fr",
  labels,
}: {
  stories: ProductStory[];
  locale?: string;
  labels?: Partial<StoryLabels>;
}) {
  const [open, setOpen] = useState<number | null>(null);

  if (!stories || stories.length === 0) return null;

  const fmt = (n: number) => {
    try {
      return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
    } catch {
      return `${n} €`;
    }
  };

  return (
    <>
      <div dir={locale === "ar" ? "rtl" : "ltr"} style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {stories.map((s, i) => (
          <Bubble key={s.id} story={s} price={s.shop ? fmt(s.shop.price) : null} onOpen={() => setOpen(i)} />
        ))}
      </div>

      {open !== null && (
        <StoryPlayer stories={stories} startIndex={open} locale={locale} labels={labels} onClose={() => setOpen(null)} />
      )}
    </>
  );
}

function Bubble({ story, price, onOpen }: { story: ProductStory; price: string | null; onOpen: () => void }) {
  const [hover, setHover] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLButtonElement>(null);
  const { playing, blocked, reduceMotion, play } = useVideoAutoplay(videoRef, rootRef);
  const reduce = reduceMotion;

  const enter = () => {
    setHover(true);
    if (reduce) return;
    const v = videoRef.current;
    if (v) v.currentTime = 0;
    play();
  };
  const leave = () => {
    setHover(false);
    // On ne coupe pas la lecture au départ du curseur : la bulle est peut-être
    // encore à l'écran, et c'est la visibilité qui décide désormais.
    const v = videoRef.current;
    if (v && reduce) v.pause();
  };

  return (
    <button
      ref={rootRef}
      type="button"
      onClick={onOpen}
      onMouseEnter={enter}
      onMouseLeave={leave}
      aria-label={story.title ?? "Voir la vidéo"}
      style={{
        position: "relative",
        width: 72,
        height: 72,
        borderRadius: "50%",
        padding: 3,
        cursor: "pointer",
        border: "none",
        background: "linear-gradient(135deg, #D4B264, #B98F3A)",
        boxShadow: hover ? "0 0 0 2px #fff, 0 8px 22px -8px rgba(185,143,58,.7)" : "0 0 0 2px #fff",
        transform: hover && !reduce ? "scale(1.12)" : "scale(1)",
        transition: "transform .25s ease, box-shadow .25s ease",
      }}
    >
      <span style={{ position: "relative", display: "block", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#222" }}>
        <video
          ref={videoRef}
          src={story.videoUrl}
          poster={story.posterUrl}
          muted
          loop
          playsInline
          // Le hook ouvre `preload` quand la bulle devient visible : hors champ,
          // une rangée de bulles ne télécharge rien.
          preload="none"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {/* Repli quand le navigateur refuse la lecture automatique : la bulle
            EST déjà un bouton (tap = ouvrir le player), le pictogramme est donc
            purement décoratif — un bouton dans un bouton n'est pas valide. */}
        {!playing && (blocked || reduce) && <VideoPlayFallback decorative size={28} />}
      </span>
      {price && (
        <span
          style={{
            position: "absolute",
            bottom: -4,
            insetInline: 0,
            margin: "0 auto",
            width: "fit-content",
            fontFamily: "var(--font-sans)",
            fontSize: 10,
            fontWeight: 700,
            color: "#fff",
            background: "#B98F3A",
            border: "1.5px solid #fff",
            borderRadius: 999,
            padding: "1px 7px",
          }}
        >
          {price}
        </span>
      )}
    </button>
  );
}
