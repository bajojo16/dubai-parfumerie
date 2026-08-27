"use client";

/**
 * Démo isolée du FragranceFinder — la page sert de banc d'essai au quiz, que le
 * layout monte par ailleurs sur tout le site.
 *
 * Le quiz est la réplique de celui d'AD Parfumerie : huit questions, une famille
 * olfactive, trois flacons pris dans le catalogue agrégé (`SEARCH_PRODUCTS`),
 * leurs combinaisons et leurs remises.
 */
import { useLocale } from "next-intl";
import { FragranceFinderButton } from "@/components/fragrance-finder/FragranceFinderButton";
import { QUESTION_COUNT } from "@/components/fragrance-finder/data/questions";

export default function PreviewFragranceFinderPage() {
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        background: "var(--surface-page)",
        minHeight: "100vh",
        padding: "60px 24px 140px",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--t-xs)",
            fontWeight: 600,
            letterSpacing: "var(--ls-wider)",
            textTransform: "uppercase",
            color: "var(--gold-700)",
          }}
        >
          Conseiller olfactif
        </span>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 34,
            color: "var(--ink-900)",
            margin: "8px 0 10px",
          }}
        >
          FragranceFinder — quiz olfactif
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 15,
            color: "var(--ink-500)",
            lineHeight: 1.65,
            margin: "0 0 18px",
            maxWidth: 620,
          }}
        >
          Cliquez sur la fiole dorée en bas {isRTL ? "à gauche" : "à droite"} pour lancer le quiz
          en {QUESTION_COUNT} questions. À la fin : votre famille olfactive, trois flacons du
          catalogue, leurs combinaisons et leurs remises.
        </p>
        <ul
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            color: "var(--ink-400)",
            lineHeight: 1.8,
            margin: 0,
            paddingInlineStart: 18,
          }}
        >
          <li>Validation immédiate au clic + passage automatique à la question suivante</li>
          <li>« Je ne sais pas » sur l&apos;univers et sur la note</li>
          <li>Famille élue par les questions univers / note / saison, ambrée par défaut</li>
          <li>Chaque critère de l&apos;écran de fin rejoue sa question sur place</li>
          <li>2 parfums −10 %, 3 et plus −20 % — et le flacon vole jusqu&apos;au panier</li>
        </ul>
      </div>

      <FragranceFinderButton locale={locale} />
    </main>
  );
}
