"use client";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { addItem } from "@/lib/cart";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

type BSlide = {
  id: string;
  category: string;
  brand: string;
  name: string;
  price: number;
  desc: string;
  main: string;
  mood: string;
  tint: string;
};

const SLIDES: BSlide[] = [
  {
    id: "lattafa-oud-pour-elle",
    category: "Rose Orientale",
    brand: "Lattafa",
    name: "Oud Pour Elle",
    price: 28.9,
    desc: "Rose damascène et safran sur un fond de oud sombre et d'ambre crémeux. Un sillage envoûtant qui tient plus de 24 h.",
    main: "/assets/prod-1.jpg",
    mood: "/assets/scents/rose.png",
    tint: "#EFE3DD",
  },
  {
    id: "al-haramain-amber-oud",
    category: "Ambre Chaleureux",
    brand: "Al Haramain",
    name: "Amber Oud",
    price: 34.9,
    desc: "Cardamome et poivre noir ouvrent sur un oud royal et une rose de Taïf, posés sur une base d'ambre et de résines précieuses.",
    main: "/assets/prod-2.jpg",
    mood: "/assets/scents/ambre.png",
    tint: "#EBE0CF",
  },
  {
    id: "swiss-arabian-shaghaf",
    category: "Oud Profond",
    brand: "Swiss Arabian",
    name: "Shaghaf Oud",
    price: 42.9,
    desc: "Bois de oud, santal et rose de Taïf. Une composition intense et résineuse pour une signature qui dure toute la journée.",
    main: "/assets/prod-4.jpg",
    mood: "/assets/scents/oud.png",
    tint: "#E4E7DD",
  },
  {
    id: "ahmed-al-maghribi-lor",
    category: "Ambre Épicé",
    brand: "Ahmed Al Maghribi",
    name: "L'Or Intense",
    price: 36.9,
    desc: "Épices chaudes, ambre et encens. Une fragrance opulente et boisée, pensée pour celles et ceux qui aiment marquer leur présence.",
    main: "/assets/prod-6.jpg",
    mood: "/assets/scents/epice.png",
    tint: "#EAE2D8",
  },
];

const AUTO_MS = 6500;
const eur = (n: number) => `${n.toFixed(2).replace(".", ",")} €`;

export function BestSellers() {
  const [i, setI] = useState(0);
  const [added, setAdded] = useState(false);
  const slide = SLIDES[i];

  const go = useCallback(
    (n: number) => setI(((n % SLIDES.length) + SLIDES.length) % SLIDES.length),
    [],
  );

  useEffect(() => {
    setAdded(false);
    const t = setTimeout(() => go(i + 1), AUTO_MS);
    return () => clearTimeout(t);
  }, [i, go]);

  const onAdd = () => {
    addItem({
      id: slide.id,
      name: slide.name,
      brand: slide.brand,
      price: slide.price,
      image: slide.main,
    });
    setAdded(true);
  };

  return (
    <section
      style={{
        position: "relative",
        padding: "90px 20px 100px",
        overflow: "hidden",
        background: "var(--surface-page)",
      }}
    >
      {/* Tint de fond qui crossfade selon le slide */}
      <AnimatePresence>
        <motion.div
          key={slide.tint}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: EASE }}
          style={{ position: "absolute", inset: 0, background: slide.tint }}
        />
      </AnimatePresence>

      <div style={{ position: "relative", maxWidth: 1080, margin: "0 auto" }}>
        {/* En-tête */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.7rem",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "var(--gold-600)",
              fontWeight: 600,
            }}
          >
            Premium Collections
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: "clamp(2.2rem, 4vw, 3rem)",
              color: "var(--ink-900)",
              margin: "8px 0 12px",
            }}
          >
            Best Sellers
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              color: "var(--ink-600, #5a4d3e)",
              margin: "0 auto",
              maxWidth: "44ch",
            }}
          >
            Nos créations signatures les plus désirées, prêtes à rejoindre votre collection.
          </p>
          <div
            style={{
              width: 40,
              height: 2,
              background: "var(--gold-500)",
              margin: "20px auto 0",
              borderRadius: 2,
            }}
          />
        </div>

        {/* Slide */}
        <div style={{ position: "relative" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease: EASE }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              {/* Stage images superposées */}
              <div
                style={{
                  position: "relative",
                  width: "min(440px, 88vw)",
                  height: "clamp(300px, 40vw, 380px)",
                  marginBottom: 36,
                }}
              >
                {/* Image principale (grande, droite, légèrement tournée) */}
                <motion.div
                  initial={{ scale: 1.06 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 8, ease: "linear" }}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "72%",
                    height: "82%",
                    borderRadius: "18px",
                    overflow: "hidden",
                    boxShadow: "0 24px 60px rgba(21,16,11,.28)",
                    transform: "rotate(2deg)",
                  }}
                >
                  <Image src={slide.main} alt={slide.name} fill style={{ objectFit: "cover" }} sizes="400px" />
                </motion.div>

                {/* Image mood (petite, bas-gauche) */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "46%",
                    height: "54%",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 18px 44px rgba(21,16,11,.3)",
                    transform: "rotate(-3deg)",
                    border: "4px solid var(--surface-page)",
                  }}
                >
                  <Image src={slide.mood} alt="" fill style={{ objectFit: "cover" }} sizes="280px" />
                </div>
              </div>

              {/* Bloc texte */}
              <div style={{ textAlign: "center", maxWidth: 520 }}>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.34em",
                    textTransform: "uppercase",
                    color: "var(--gold-700)",
                    fontWeight: 600,
                  }}
                >
                  {slide.category}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "clamp(2rem, 4.4vw, 2.9rem)",
                    color: "var(--ink-900)",
                    margin: "10px 0 6px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {slide.name}
                </h3>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--ink-500)",
                    marginBottom: 14,
                  }}
                >
                  {slide.brand}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "1.5rem",
                    color: "var(--ink-900)",
                    marginBottom: 16,
                  }}
                >
                  {eur(slide.price)}
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 300,
                    fontSize: "1rem",
                    lineHeight: 1.7,
                    color: "var(--ink-600, #5a4d3e)",
                    margin: "0 0 28px",
                  }}
                >
                  {slide.desc}
                </p>

                <motion.button
                  onClick={onAdd}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: added ? "#fff" : "var(--ink-900)",
                    background: added ? "var(--gold-600)" : "transparent",
                    border: `1.5px solid ${added ? "var(--gold-600)" : "var(--ink-900)"}`,
                    borderRadius: "var(--r-xs)",
                    padding: "1.1em 2.6em",
                    cursor: "pointer",
                    transition: "background .25s, color .25s, border-color .25s",
                  }}
                >
                  {added ? "✓ Ajouté au panier" : "Ajouter au panier"}
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Flèches */}
          <button
            onClick={() => go(i - 1)}
            aria-label="Précédent"
            style={arrowStyle("left")}
          >
            ‹
          </button>
          <button
            onClick={() => go(i + 1)}
            aria-label="Suivant"
            style={arrowStyle("right")}
          >
            ›
          </button>
        </div>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 36 }}>
          {SLIDES.map((s, n) => (
            <button
              key={s.id}
              onClick={() => go(n)}
              aria-label={`Produit ${n + 1}`}
              style={{
                width: n === i ? 26 : 9,
                height: 9,
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                background: n === i ? "var(--gold-500)" : "rgba(21,16,11,.22)",
                transition: "width .3s, background .3s",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function arrowStyle(side: "left" | "right"): CSSProperties {
  return {
    position: "absolute",
    top: "30%",
    [side]: "clamp(-6px, 2vw, 24px)",
    transform: "translateY(-50%)",
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "1px solid rgba(21,16,11,.18)",
    background: "rgba(255,255,255,.7)",
    backdropFilter: "blur(4px)",
    color: "var(--ink-900)",
    fontSize: "1.6rem",
    lineHeight: 1,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  };
}
