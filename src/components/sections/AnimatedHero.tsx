"use client";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

type Slide = {
  img: string;
  eyebrow: string;
  title: string;
  em: string;
  desc: string;
  cta: { label: string; href: string };
  thumb: string;
};

const SLIDES: Slide[] = [
  {
    img: "/assets/hero.jpg",
    thumb: "/assets/hero.jpg",
    eyebrow: "Parfumerie Orientale Authentique · Depuis 2016",
    title: "L'authentique,",
    em: "pas l'imitation",
    desc: "Oud, musc, ambre, attar. 300+ références authentiques sourcées directement au Golfe — la parfumerie orientale dans toute sa profondeur.",
    cta: { label: "Découvrir les coffrets dès 9 €", href: "#coffrets" },
  },
  {
    img: "/assets/coffrets.jpg",
    thumb: "/assets/coffrets.jpg",
    eyebrow: "Coffrets Prestige · Édition Cabinet",
    title: "L'art du",
    em: "cadeau oriental",
    desc: "Des collections d'exception en flacons miniatures. Best-of, floraux, boisés, désert — l'essentiel du Golfe à offrir ou à découvrir.",
    cta: { label: "Voir les coffrets prestige", href: "#coffrets" },
  },
  {
    img: "/assets/cat-mixte.jpg",
    thumb: "/assets/cat-mixte.jpg",
    eyebrow: "Oud & Boisés Rares · Sourcés au Golfe",
    title: "La profondeur",
    em: "d'un oud véritable",
    desc: "Bois précieux, résines fumées, ambre chaud. Des compositions intenses pour celles et ceux qui cherchent une signature qui dure.",
    cta: { label: "Explorer les boisés", href: "#scents" },
  },
];

const AUTO_MS = 8000;
const ZOOM_S = 12;

export function AnimatedHero() {
  const [i, setI] = useState(0);
  const slide = SLIDES[i];

  const go = useCallback((n: number) => setI(((n % SLIDES.length) + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    const t = setTimeout(() => go(i + 1), AUTO_MS);
    return () => clearTimeout(t);
  }, [i, go]);

  return (
    <section
      style={{
        position: "relative",
        background: "var(--espresso-900)",
        minHeight: "92vh",
        overflow: "hidden",
      }}
    >
      {/* Background slides — dezoom très lent (scale 1.22 → 1.0, linéaire) */}
      <AnimatePresence>
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.4, ease: EASE } }}
          style={{ position: "absolute", inset: 0 }}
        >
          <motion.div
            initial={{ scale: 1.22 }}
            animate={{ scale: 1.0 }}
            transition={{ duration: ZOOM_S, ease: "linear" }}
            style={{ position: "absolute", inset: 0 }}
          >
            <Image
              src={slide.img}
              alt={slide.title}
              fill
              priority={i === 0}
              style={{ objectFit: "cover", opacity: 0.55 }}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(105deg, rgba(13,13,13,.92) 0%, rgba(20,16,11,.72) 42%, rgba(20,16,11,.25) 100%)",
        }}
      />

      {/* Particles */}
      {[...Array(8)].map((_, p) => (
        <motion.div
          key={p}
          style={{
            position: "absolute",
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "var(--gold-400)",
            left: `${10 + p * 12}%`,
            top: `${30 + (p % 3) * 20}%`,
          }}
          animate={{ y: [-20, -80], opacity: [0, 0.6, 0] }}
          transition={{ duration: 3 + p * 0.5, repeat: Infinity, delay: p * 0.4, ease: "easeOut" }}
        />
      ))}

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1240,
          margin: "0 auto",
          padding: "clamp(140px, 14vw, 180px) 24px 80px",
          minHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.7, ease: EASE }}
            style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}
          >
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.65rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "var(--gold-400)",
                marginBottom: 20,
              }}
            >
              {slide.eyebrow}
            </div>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: "clamp(2.8rem, 5.2vw, 4.6rem)",
                lineHeight: 1.04,
                letterSpacing: "-0.02em",
                color: "var(--on-dark-strong)",
                margin: 0,
                maxWidth: "16ch",
              }}
            >
              {slide.title}{" "}
              <em style={{ fontStyle: "italic", color: "var(--gold-400)" }}>{slide.em}</em>
            </h1>

            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 300,
                fontSize: "1.0625rem",
                lineHeight: 1.7,
                color: "var(--on-dark)",
                margin: "22px 0 0",
                maxWidth: "46ch",
              }}
            >
              {slide.desc}
            </p>

            {/* Stats — slide 1 seulement */}
            {i === 0 && (
              <div style={{ display: "flex", gap: 30, margin: "34px 0 36px", flexWrap: "wrap" }}>
                {[
                  { k: "10", v: "Ans d'expérience" },
                  { k: "7000+", v: "Produits vendus" },
                  { k: "4,8/5", v: "Note Trustpilot" },
                ].map((s) => (
                  <div key={s.k}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "2rem",
                        color: "var(--gold-400)",
                        lineHeight: 1,
                      }}
                    >
                      {s.k}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--on-dark-muted)",
                        marginTop: 3,
                      }}
                    >
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                alignItems: "center",
                marginTop: i === 0 ? 0 : 34,
              }}
            >
              <motion.a
                href={slide.cta.href}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: ".6em",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: ".9375rem",
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "var(--ink-900)",
                  background: "var(--gold-500)",
                  border: "none",
                  borderRadius: "var(--r-xs)",
                  padding: "1.05em 2em",
                  textDecoration: "none",
                  boxShadow: "var(--shadow-gold)",
                }}
              >
                {slide.cta.label}
              </motion.a>
              {i === 0 && (
                <motion.button
                  whileHover={{ background: "rgba(251,246,236,0.12)" }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: ".6em",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    fontSize: ".9375rem",
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: "var(--on-dark-strong)",
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,.5)",
                    borderRadius: "var(--r-xs)",
                    padding: "1.05em 2em",
                    cursor: "pointer",
                  }}
                >
                  Démarrer le quiz signature
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Vignettes verticales (style image #2) */}
      <div
        style={{
          position: "absolute",
          zIndex: 3,
          right: "clamp(16px, 3vw, 40px)",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            color: "var(--gold-400)",
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          {String(i + 1).padStart(2, "0")}
          <span style={{ fontSize: "0.8rem", color: "var(--on-dark-muted)" }}>
            {" "}/ {String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>
        {SLIDES.map((s, n) => (
          <button
            key={s.img}
            onClick={() => go(n)}
            aria-label={`Slide ${n + 1}`}
            style={{
              position: "relative",
              width: 58,
              height: 58,
              borderRadius: "var(--r-xs)",
              overflow: "hidden",
              padding: 0,
              cursor: "pointer",
              border: n === i ? "2px solid var(--gold-400)" : "1px solid rgba(255,255,255,.25)",
              boxShadow: n === i ? "var(--shadow-gold)" : "none",
              opacity: n === i ? 1 : 0.6,
              transition: "opacity .3s, border-color .3s",
              background: "transparent",
            }}
          >
            <Image src={s.thumb} alt="" fill style={{ objectFit: "cover" }} sizes="58px" />
          </button>
        ))}
      </div>

      {/* Barre de progression */}
      <div
        style={{
          position: "absolute",
          zIndex: 3,
          left: 0,
          bottom: 0,
          height: 3,
          width: "100%",
          background: "rgba(255,255,255,.08)",
        }}
      >
        <motion.div
          key={i}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: AUTO_MS / 1000, ease: "linear" }}
          style={{ height: "100%", background: "var(--gold-500)" }}
        />
      </div>
    </section>
  );
}
