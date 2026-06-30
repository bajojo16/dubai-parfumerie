import { FAQ_QUESTIONS, type FaqQuestion } from "./faq.data";

/**
 * Composant serveur : injecte un <script type="application/ld+json"> schema.org
 * FAQPage avec le TEXTE BRUT des réponses (item.answer). Améliore le référencement
 * (rich results). Aucun état, aucun hook — rendu côté serveur.
 */
export function FaqJsonLd({ questions = FAQ_QUESTIONS }: { questions?: FaqQuestion[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify échappe déjà les caractères dangereux pour un bloc <script>.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
