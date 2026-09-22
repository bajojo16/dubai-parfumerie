/**
 * ProductReviews — avis clients rattachés à UNE fiche produit.
 *
 * Pourquoi une source dédiée : les trois avis codés en dur dans la page produit
 * étaient re-servis à l'identique sur toutes les fiches (le même « je l'ai
 * offert à mon mari » sous Khamrah et sous Salvo). Ici chaque avis est rangé
 * sous le slug du parfum dont il parle, et une fiche qui n'en déclare aucun
 * retombe sur un tableau vide — la page n'invente alors ni histogramme ni
 * jauges : on ne fabrique pas une distribution de 891 votes à partir de rien.
 *
 * Le résumé (`ProductReviewSummary`) est séparé des avis parce que la note
 * agrégée d'une fiche porte sur des centaines de votes alors qu'on n'affiche
 * qu'une poignée d'avis rédigés : recalculer l'histogramme depuis six cartes
 * donnerait 100 % de cinq étoiles et contredirait le « 4,8 / 5 · 891 avis »
 * affiché juste au-dessus. En production les deux viennent du back-office.
 *
 * Le nom d'auteur reste prénom + initiale, comme dans `review-media.ts` : une
 * maquette n'expose pas d'identité complète, même inventée.
 *
 * MAQUETTE : seul « lattafa-khamrah » est renseigné, à titre de démonstration.
 */

import type { Season } from "./product-content";

/** Note entière 1..5 — les demi-étoiles ne sont pas rendues. */
export type ReviewScore = 1 | 2 | 3 | 4 | 5;

/**
 * Critères votés par le client en plus de la note globale : tenue, sillage,
 * rapport qualité-prix, fidélité à la description de la fiche.
 */
export type ReviewCriteria = {
  longevity: ReviewScore;
  sillage: ReviewScore;
  value: ReviewScore;
  accuracy: ReviewScore;
};

export type ReviewSkin = "sèche" | "mixte" | "grasse";

export type ProductReview = {
  id: string;
  /** Prénom + initiale, jamais un nom complet. */
  author: string;
  city: string;
  /** Date ISO (AAAA-MM-JJ) : le formatage FR se fait au rendu. */
  date: string;
  rating: ReviewScore;
  title?: string;
  text: string;
  /** Achat vérifié sur la boutique. */
  verified: boolean;
  /** Type de peau : la tenue d'un parfum en dépend, l'information aide à se projeter. */
  skin?: ReviewSkin;
  /** Saison à laquelle l'avis a été porté. */
  season?: Season;
  criteria?: ReviewCriteria;
  /** Nombre de « Utile » reçus. */
  helpful: number;
  /** Photo jointe par le client — chemin sous `/assets/…`, fichier réellement présent. */
  photo?: string;
};

export type ProductReviewSummary = {
  /** Nombre de votes par note, de 5★ à 1★ : [n5, n4, n3, n2, n1]. */
  distribution: [number, number, number, number, number];
  /** Part des clients qui recommandent le parfum, en %. */
  recommendPct: number;
  /** Mots qui reviennent dans les avis — servent de filtres cliquables. */
  keywords: string[];
  /** Moyenne /5 de chaque critère voté. */
  criteria: {
    longevity: number;
    sillage: number;
    value: number;
    accuracy: number;
  };
};

/** Libellés d'affichage des critères, dans l'ordre de présentation. */
export const REVIEW_CRITERIA_LABEL: Record<keyof ReviewCriteria, string> = {
  longevity: "Tenue",
  sillage: "Sillage",
  value: "Qualité-prix",
  accuracy: "Fidèle à la description",
};

export const REVIEW_CRITERIA_ORDER: (keyof ReviewCriteria)[] = [
  "longevity",
  "sillage",
  "value",
  "accuracy",
];

// ─── Données de démonstration (maquette) ──────────────────────────────────────

export const PRODUCT_REVIEWS: Record<string, ProductReview[]> = {
  // MAQUETTE — Khamrah (Lattafa) : gourmand oriental, EDP 30 %, ~12 h, mixte.
  // Les trois premiers avis reprennent mot pour mot ceux qui vivaient dans la
  // page produit ; les trois suivants sont écrits pour CE parfum.
  "lattafa-khamrah": [
    {
      id: "rv-khamrah-01",
      author: "Yasmine B.",
      city: "Paris",
      date: "2025-06-12",
      rating: 5,
      title: "Envoûtant, et encore là le lendemain",
      text: "Un parfum absolument envoûtant. Je reçois des compliments dès que j'entre dans une pièce. La tenue est incroyable, encore présent le lendemain matin. Parfaitement authentique, rien à voir avec les contrefaçons qu'on trouve ailleurs.",
      verified: true,
      skin: "mixte",
      season: "printemps",
      criteria: { longevity: 5, sillage: 5, value: 5, accuracy: 5 },
      helpful: 42,
      photo: "/assets/products/khamrah/khamrah-hf-12.jpg",
    },
    {
      id: "rv-khamrah-02",
      author: "Mohammed K.",
      city: "Lyon",
      date: "2025-05-03",
      rating: 5,
      title: "Le parfum de mon enfance, enfin en France",
      text: "J'ai grandi avec ce parfum au Maroc et je le retrouve enfin en France à un prix raisonnable. La qualité est exactement celle que je connaissais. Livraison rapide et emballage soigné. Je recommande vivement cette boutique.",
      verified: true,
      skin: "grasse",
      season: "printemps",
      criteria: { longevity: 5, sillage: 4, value: 5, accuracy: 5 },
      helpful: 31,
    },
    {
      id: "rv-khamrah-03",
      author: "Isabelle D.",
      city: "Bordeaux",
      date: "2025-04-18",
      rating: 5,
      title: "Un cadeau qui a fait mouche",
      text: "Offert à mon mari pour notre anniversaire. Il était aux anges ! Le sillage est puissant sans être agressif, vraiment une qualité orientale comme on n'en trouve pas en grande surface. Nous avons déjà repassé commande.",
      verified: true,
      skin: "sèche",
      season: "printemps",
      criteria: { longevity: 5, sillage: 5, value: 5, accuracy: 4 },
      helpful: 27,
      photo: "/assets/products/khamrah/khamrah-hf-20.jpg",
    },
    {
      id: "rv-khamrah-04",
      author: "Karim L.",
      city: "Marseille",
      date: "2025-01-22",
      rating: 5,
      title: "Datte et cannelle sur un manteau d'hiver",
      text: "Deux pulvérisations sur le col du manteau le matin, et la datte et la cannelle sont encore là le soir. Parfum d'hiver par excellence : chaud, gourmand, sans tourner à l'écœurant. Trois collègues m'ont demandé le nom la première semaine.",
      verified: true,
      skin: "mixte",
      season: "hiver",
      criteria: { longevity: 5, sillage: 5, value: 5, accuracy: 5 },
      helpful: 19,
      photo: "/assets/products/khamrah/khamrah-hf-27.jpg",
    },
    {
      id: "rv-khamrah-05",
      author: "Sophie M.",
      city: "Nantes",
      date: "2024-12-09",
      rating: 4,
      title: "Très bon, un peu envahissant en intérieur",
      text: "Acheté en cadeau pour ma sœur, qui l'a adopté. La tenue est bien celle annoncée, une douzaine d'heures sur ses pulls. Je retire une étoile parce qu'en bureau fermé, deux pulvérisations suffisent largement — une de plus et c'est toute la pièce qui sent la datte.",
      verified: true,
      skin: "sèche",
      season: "hiver",
      criteria: { longevity: 5, sillage: 5, value: 4, accuracy: 4 },
      helpful: 14,
    },
    {
      id: "rv-khamrah-06",
      author: "Thomas R.",
      city: "Toulouse",
      date: "2025-07-28",
      rating: 3,
      title: "Trop sucré pour l'été",
      text: "Très bien fait, la tenue et l'authenticité sont là. Mais je l'ai reçu en pleine canicule et sur peau chaude il devient vite trop sucré, presque sirupeux. Je le range jusqu'à l'automne : à mon avis c'est un parfum de saison froide, et il faut le savoir avant d'acheter.",
      verified: false,
      skin: "grasse",
      season: "été",
      criteria: { longevity: 4, sillage: 4, value: 4, accuracy: 3 },
      helpful: 23,
    },
  ],
};

export const PRODUCT_REVIEW_SUMMARY: Record<string, ProductReviewSummary> = {
  // MAQUETTE — cohérent avec la fiche (4,8 / 5 sur 891 avis) :
  // (766×5 + 80×4 + 27×3 + 9×2 + 9×1) / 891 ≈ 4,78.
  "lattafa-khamrah": {
    distribution: [766, 80, 27, 9, 9],
    recommendPct: 96,
    keywords: ["tenue", "compliments", "datte", "hiver", "cadeau", "authentique", "sucré", "sillage"],
    criteria: { longevity: 4.7, sillage: 4.6, value: 4.8, accuracy: 4.5 },
  },
};

// ─── Accès ────────────────────────────────────────────────────────────────────

/** Avis rédigés pour une fiche ; tableau vide si aucun n'est déclaré. */
export function reviewsFor(slug: string): ProductReview[] {
  return PRODUCT_REVIEWS[slug] ?? [];
}

/** Résumé agrégé d'une fiche ; `undefined` si non déclaré. */
export function reviewSummaryFor(slug: string): ProductReviewSummary | undefined {
  return PRODUCT_REVIEW_SUMMARY[slug];
}
