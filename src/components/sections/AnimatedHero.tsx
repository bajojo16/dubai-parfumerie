"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
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
    img: "/assets/slider-1.jpg",
    thumb: "/assets/slider-1.jpg",
    eyebrow: "Parfumerie Orientale Authentique · Depuis 2016",
    title: "L'authentique,",
    em: "pas l'imitation",
    desc: "Oud, musc, ambre, attar. 300+ références authentiques sourcées directement au Golfe — la parfumerie orientale dans toute sa profondeur.",
    cta: { label: "Découvrir les coffrets dès 9 €", href: "#coffrets" },
  },
  {
    img: "/assets/slider-2-reef-v2.jpg",
    thumb: "/assets/slider-2-reef-v2.jpg",
    eyebrow: "Coffrets Prestige · Édition Cabinet",
    title: "L'art du",
    em: "cadeau oriental",
    desc: "Des collections d'exception en flacons miniatures. Best-of, floraux, boisés, désert — l'essentiel du Golfe à offrir ou à découvrir.",
    cta: { label: "Voir les coffrets prestige", href: "#coffrets" },
  },
  {
    img: "/assets/slider-3-oud.jpg",
    thumb: "/assets/slider-3-oud.jpg",
    eyebrow: "Oud & Boisés Rares · Sourcés au Golfe",
    title: "La profondeur",
    em: "d'un oud véritable",
    desc: "Bois précieux, résines fumées, ambre chaud. Des compositions intenses pour celles et ceux qui cherchent une signature qui dure.",
    cta: { label: "Explorer les boisés", href: "#scents" },
  },
];

const AUTO_MS = 8000;
const ZOOM_S = 12;

/* Overlay promo aligné à droite, police Cormorant — partagé par les bannières 1 & 2 */
function PromoOverlay({
  line1,
  line2,
  focal,
  condition,
  cta,
  href,
  tagline,
  scrim,
  alignFocalToCondition,
}: {
  line1: string;
  line2: string;
  focal: string;
  condition: string;
  cta: string;
  href: string;
  tagline?: string;
  scrim?: boolean;
  alignFocalToCondition?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.7, ease: EASE }}
      style={{
        position: "absolute",
        zIndex: 4,
        top: "clamp(70px, 13%, 130px)",
        right: "clamp(110px, 10vw, 210px)",
        transform: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        textAlign: "right",
        color: "#ffffff",
        fontFamily: "var(--font-display)",
        fontVariantNumeric: "lining-nums",
        fontFeatureSettings: '"lnum" 1, "tnum" 0',
        // Voile sombre dégradé : UNIQUEMENT bannière 2 (fond Reef clair) pour
        // garantir la lisibilité du texte blanc. B1/B3 gardent leur rendu net.
        background: scrim
          ? "radial-gradient(125% 120% at 72% 42%, rgba(18,13,9,0.58), rgba(18,13,9,0.24) 58%, rgba(18,13,9,0) 84%)"
          : undefined,
        padding: scrim ? "clamp(20px, 2.6vw, 40px) clamp(22px, 2.8vw, 44px)" : undefined,
        borderRadius: scrim ? 22 : undefined,
        textShadow: scrim
          ? "0 2px 10px rgba(0,0,0,.62), 0 1px 28px rgba(0,0,0,.5)"
          : "0 2px 22px rgba(0,0,0,.35)",
        maxWidth: scrim ? "min(46vw, 600px)" : "min(42vw, 560px)",
      }}
    >
      {(() => {
        /* Condition avec filets latéraux */
        const conditionEl = (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              justifyContent: "flex-end",
              fontFamily: "var(--font-sans)",
              fontWeight: 400,
              fontSize: "clamp(0.6rem, 1vw, 0.8rem)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            <span style={{ flex: 1, height: 1, maxWidth: 40, background: "rgba(255,255,255,.6)" }} />
            <span style={{ whiteSpace: "nowrap" }}>{condition}</span>
            <span style={{ flex: 1, height: 1, maxWidth: 40, background: "rgba(255,255,255,.6)" }} />
          </div>
        );
        return (
          <>
            {/* Bloc titre+focal (+condition si demandé) : largeur = élément le plus
                large. Titre justifié inter-character. Si alignFocalToCondition,
                la condition entre dans le wrapper et le focal s'étire à sa largeur
                (TOP 10 aussi large que « CE QUE TOUT LE MONDE S'ARRACHE »). */}
            <div style={{ display: "flex", flexDirection: "column", width: "fit-content" }}>
              <div
                style={{
                  width: "100%",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontSize: "clamp(1.7rem, 3vw, 2.8rem)",
                  lineHeight: 1.04,
                  letterSpacing: "0.04em",
                  textAlign: "justify",
                  textAlignLast: "justify",
                  textJustify: "inter-character",
                }}
              >
                <div>{line1}</div>
                <div>{line2}</div>
              </div>

              {/* Élément focal (ex. -15% / 1 ML / TOP 10) */}
              <div
                style={{
                  width: "100%",
                  fontWeight: 600,
                  fontSize: "clamp(3.6rem, 7.5vw, 6.6rem)",
                  lineHeight: 0.84,
                  letterSpacing: "-0.01em",
                  margin: "0.04em 0 0.08em",
                  ...(alignFocalToCondition
                    ? {
                        textAlign: "justify" as const,
                        textAlignLast: "justify" as const,
                        textJustify: "inter-character" as const,
                      }
                    : { textAlign: "center" as const }),
                }}
              >
                {focal}
              </div>

              {alignFocalToCondition && conditionEl}
            </div>

            {!alignFocalToCondition && conditionEl}
          </>
        );
      })()}

      {/* Tagline optionnelle (bannière 1) */}
      {tagline && (
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "clamp(0.95rem, 1.3vw, 1.25rem)",
            lineHeight: 1.35,
            color: "rgba(255,255,255,.95)",
            // B3 : bloc resserré équilibré (évite le mot orphelin étiré) ;
            // B1 : plus large. textWrap balance répartit les lignes.
            maxWidth: alignFocalToCondition ? "24ch" : "42ch",
            marginInline: "auto",
            marginBottom: 22,
            textAlign: "center",
            textWrap: "balance",
          }}
        >
          {/* Casse après le tiret : « Nos … » reste avec « échantillons … » */}
          {tagline.includes("—")
            ? (() => {
                const [a, b] = tagline.split("—");
                return (
                  <>
                    — {a.trim()} —<br />
                    {b.trim()}
                  </>
                );
              })()
            : tagline}
        </div>
      )}

      {/* CTA pilule — apparition dynamique + effet brillant incitatif */}
      <motion.a
        href={href}
        initial={{ opacity: 0, y: 14, scale: 0.9 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          boxShadow: [
            "0 8px 28px rgba(0,0,0,.22)",
            "0 8px 38px rgba(200,144,30,.55)",
            "0 8px 28px rgba(0,0,0,.22)",
          ],
        }}
        transition={{
          opacity: { duration: 0.5, delay: 0.7, ease: EASE },
          y: { duration: 0.5, delay: 0.7, ease: EASE },
          scale: { duration: 0.5, delay: 0.7, ease: EASE },
          boxShadow: { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 1.2 },
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        style={{
          position: "relative",
          overflow: "hidden",
          display: "inline-flex",
          alignSelf: "center",
          marginTop: 18,
          alignItems: "center",
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "clamp(0.95rem, 1.4vw, 1.2rem)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--espresso-900)",
          background: "#ffffff",
          borderRadius: 999,
          padding: "0.7em 2.2em",
          textDecoration: "none",
        }}
      >
        <span style={{ position: "relative", zIndex: 1 }}>{cta}</span>
        <motion.span
          aria-hidden
          initial={{ x: "-130%" }}
          animate={{ x: "130%" }}
          transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 2, ease: "easeInOut", delay: 1.4 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "60%",
            height: "100%",
            transform: "skewX(-20deg)",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,.85), transparent)",
            zIndex: 0,
          }}
        />
      </motion.a>
    </motion.div>
  );
}

export function AnimatedHero() {
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const tReef = useTranslations("reefBanner");
  const tSample = useTranslations("sampleBanner");

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
        minHeight: "70vh",
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
            initial={{ scale: 1.0 }}
            animate={{ scale: 1.0 }}
            transition={{ duration: 0, ease: "linear" }}
            style={{ position: "absolute", inset: 0 }}
          >
            <Image
              src={slide.img}
              alt={slide.title}
              fill
              priority={i === 0}
              style={{ objectFit: "cover", opacity: 1 }}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Voile sombre retiré sur toutes les bannières (visuels autonomes) */}

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
          padding: "clamp(100px, 10vw, 130px) 24px 60px",
          minHeight: "70vh",
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
            {/* Overlay texte gauche — slide 3 uniquement (slides 1 & 2 utilisent PromoOverlay) */}
            {false && (
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
            )}

            {false && (<>
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
            </>)}

            {/* Stats — désactivées (slide 1 utilise désormais PromoOverlay échantillons) */}
            {false && (
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

            {/* CTAs — slide 3 uniquement */}
            {false && (
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
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Overlays promo droite (Cormorant) — bannière 1 (échantillons) & bannière 2 (REEF) */}
      <AnimatePresence mode="wait">
        {i === 0 && (
          <PromoOverlay
            key="sample-overlay"
            line1={tSample("line1")}
            line2={tSample("line2")}
            focal={tSample("focal")}
            condition={tSample("condition")}
            cta={tSample("cta")}
            tagline={tSample("tagline")}
            href="#echantillons"
          />
        )}
        {i === 1 && (
          <PromoOverlay
            key="reef-overlay"
            line1={tReef("line1")}
            line2={tReef("line2")}
            focal={tReef("discount")}
            condition={tReef("condition")}
            cta={tReef("cta")}
            href="#promo"
            scrim
          />
        )}
        {i === 2 && (
          <PromoOverlay
            key="convoites-overlay"
            line1="LES PLUS"
            line2="CONVOITÉS"
            focal="TOP 10"
            condition="CE QUE TOUT LE MONDE S'ARRACHE"
            cta="JE DÉCOUVRE"
            tagline="Découvrez les fragrances que tout le monde s'arrache"
            href="#bestsellers-rail"
            alignFocalToCondition
          />
        )}
      </AnimatePresence>

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
