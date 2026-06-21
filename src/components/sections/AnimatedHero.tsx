"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export function AnimatedHero() {
  return (
    <section
      style={{
        position: "relative",
        background: "var(--espresso-900)",
        minHeight: "92vh",
        overflow: "hidden",
      }}
    >
      {/* Background image with ken-burns */}
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1.16 }}
        transition={{ duration: 14, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Image
          src="/assets/hero.jpg"
          alt="Parfums orientaux de Dubaï"
          fill
          priority
          style={{ objectFit: "cover", opacity: 0.55 }}
        />
      </motion.div>

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
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "var(--gold-400)",
            left: `${10 + i * 12}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [-20, -80],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Content — initial=false : SSR rend l'état visible (robuste si JS/framer bloqué) */}
      <motion.div
        variants={container}
        initial={false}
        animate="visible"
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1240,
          margin: "0 auto",
          padding: "clamp(140px, 14vw, 180px) 24px 80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          minHeight: "92vh",
          justifyContent: "center",
        }}
      >
        <motion.div
          variants={item}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.65rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "var(--gold-400)",
            marginBottom: 20,
          }}
        >
          Parfumerie Orientale Authentique · Depuis 2015
        </motion.div>

        <motion.h1
          variants={item}
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
          Le parfum de Dubaï,{" "}
          <em style={{ fontStyle: "italic", color: "var(--gold-400)" }}>
            tel qu&apos;on le porte là-bas
          </em>
        </motion.h1>

        <motion.p
          variants={item}
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
          Oud, musc, ambre, attar. 300+ références authentiques sourcées directement au Golfe —
          la parfumerie orientale dans toute sa profondeur.
        </motion.p>

        {/* Stats */}
        <motion.div
          variants={item}
          style={{ display: "flex", gap: 30, margin: "34px 0 36px", flexWrap: "wrap" }}
        >
          {[
            { k: "10", v: "Ans d'expérience" },
            { k: "10 000+", v: "Produits vendus" },
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
        </motion.div>

        {/* CTAs */}
        <motion.div
          variants={item}
          style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}
        >
          <motion.a
            href="#coffrets"
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
            Découvrir les coffrets dès 9 €
          </motion.a>
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
        </motion.div>
      </motion.div>
    </section>
  );
}
