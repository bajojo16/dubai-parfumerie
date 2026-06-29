"use client";

import { useRef, useState } from "react";
import type { ProductStory } from "@/data/product-stories";
import { StoryPlayer, type StoryLabels } from "./StoryPlayer";

/**
 * StoryBubbles — rangée de bulles rondes "stories" sous le bloc d'achat.
 * Survol (pointer fin) : zoom + lecture muette + halo doré. Tactile : tap ouvre le player.
 * Respecte prefers-reduced-motion. N'affiche rien si stories vide.
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
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const enter = () => {
    if (reduce) return;
    setHover(true);
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };
  const leave = () => {
    setHover(false);
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  return (
    <button
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
      <span style={{ display: "block", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#222" }}>
        <video
          ref={videoRef}
          src={story.videoUrl}
          poster={story.posterUrl}
          muted
          loop
          playsInline
          preload="none"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
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
