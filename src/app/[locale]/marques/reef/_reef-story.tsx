"use client";

import { useRef } from "react";
import { useVideoAutoplay } from "@/hooks/useVideoAutoplay";

/**
 * Récit de la maison Reef, en deux colonnes : le texte, et le film du flacon
 * qui l'illustre.
 *
 * Composant client isolé du reste de la page, qui reste serveur : seul ce bloc
 * a besoin de JavaScript. Le film se lance à l'entrée dans le champ via
 * `useVideoAutoplay` — muet, en boucle, `preload="none"` tant qu'il est hors
 * écran. Le poster tient lieu d'image fixe si le navigateur refuse la lecture
 * (Brave Android, économiseur de données) : le bloc reste lisible sans lui.
 */
export function ReefStorySection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  useVideoAutoplay(videoRef, rootRef);

  return (
    <section style={{ padding: "clamp(56px, 8vw, 88px) 24px" }}>
      <div
        ref={rootRef}
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "clamp(28px, 5vw, 56px)",
          alignItems: "center",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "var(--gold-700)",
              margin: "0 0 10px",
            }}
          >
            La maison
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3.6vw, 2.6rem)",
              fontWeight: 500,
              color: "var(--ink-900)",
              margin: "0 0 20px",
              lineHeight: 1.15,
              textWrap: "balance",
            }}
          >
            Le mot « reef » ne parle pas de la mer
          </h2>

          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(.92rem, 1.5vw, 1rem)",
              color: "var(--ink-500)",
              lineHeight: 1.75,
            }}
          >
            <p style={{ margin: "0 0 16px" }}>
              En arabe, <span lang="ar" dir="rtl">ريف</span> désigne la campagne,
              les terres cultivées autour de la ville. C&apos;est de là que vient le
              nom, et non du récif anglais auquel on pense d&apos;abord. Toute la
              maison tient dans ce contresens : on attend des embruns, on trouve
              du bois, de la résine et du musc.
            </p>
            <p style={{ margin: "0 0 16px" }}>
              Fondée à Dubaï en 2005, Reef Perfumes compose à la manière des
              maisons du Golfe — des concentrations hautes, des sillages qui
              tiennent la journée — mais avec des matières sourcées à Grasse et
              en Asie du Sud-Est. C&apos;est ce mélange que la maison résume par sa
              devise, <span lang="ar" dir="rtl">بروح خليجية أصيلة</span> : d&apos;un
              esprit du Golfe authentique.
            </p>
            <p style={{ margin: 0 }}>
              Ses créations ne se rangent ni par genre ni par saison, mais par
              matière. On y entre par un oud, un musc, un bois — jamais par un
              rayon « femme » ou « homme ».
            </p>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            aspectRatio: "4 / 5",
            borderRadius: "var(--r-lg, 18px)",
            overflow: "hidden",
            background: "var(--surface-cream)",
          }}
        >
          <video
            ref={videoRef}
            src="/assets/videos/reef33.mp4"
            poster="/assets/videos/reef33-poster.webp"
            muted
            loop
            playsInline
            preload="none"
            aria-label="Reef 33, flacon en mouvement"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
    </section>
  );
}
