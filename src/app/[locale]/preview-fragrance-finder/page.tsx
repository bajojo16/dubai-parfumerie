"use client";

/**
 * Démo isolée du FragranceFinder (validation gate avant montage global).
 * Monte le bouton flottant fiole + modal, alimenté par le CATALOGUE LOCAL.
 */
import { useLocale } from "next-intl";
import { FragranceFinderButton } from "@/components/fragrance-finder/FragranceFinderButton";
import { LOCAL_CATALOG } from "@/components/fragrance-finder/data/productAttributes";
import { QUESTION_COUNT } from "@/components/fragrance-finder/data/questions";

export default function PreviewFragranceFinderPage() {
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        background: "#FDFBF6",
        minHeight: "100vh",
        padding: "60px 24px 140px",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#A8801F",
          }}
        >
          Conseiller olfactif
        </span>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 34,
            color: "#2C2620",
            margin: "8px 0 10px",
          }}
        >
          FragranceFinder — quiz olfactif immersif
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 15,
            color: "#6A655D",
            lineHeight: 1.65,
            margin: "0 0 18px",
            maxWidth: 620,
          }}
        >
          Cliquez sur la fiole dorée en bas {isRTL ? "à gauche" : "à droite"} pour lancer le
          quiz en {QUESTION_COUNT} questions. À la fin, jusqu'à 3 parfums sur mesure sont recommandés depuis le
          catalogue local, avec opt-in WhatsApp / e-mail (démo). Aperçu isolé — le bouton
          n'est pas encore monté dans le layout global.
        </p>
        <ul
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            color: "#8a7a5c",
            lineHeight: 1.8,
            margin: 0,
            paddingInlineStart: 18,
          }}
        >
          <li>Validation immédiate au clic + auto-avance (halo or)</li>
          <li>« Je ne sais pas » sur Ambiance et Note · « Passer » sur la recherche</li>
          <li>Filtres durs genre + budget, score familles/notes/saison/intensité</li>
          <li>Badges : Votre match · Coup de cœur · À découvrir</li>
          <li>{LOCAL_CATALOG.length} parfums dans le catalogue de démo</li>
        </ul>
      </div>

      <FragranceFinderButton locale={locale} />
    </main>
  );
}
