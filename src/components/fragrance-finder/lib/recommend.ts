/**
 * Moteur de recommandation FragranceFinder.
 *
 * recommend(answers, products) → top 3 :
 *   1. Filtres DURS : genre (sauf « cadeau » qui n'exclut rien) + budget.
 *   2. Score par familles / notes / saison / intensité / parfum aimé.
 *   3. Ajustements intensité (écart à l'intensité cible) + bonus best-seller/new.
 *   4. Badges : « Votre match » / « Coup de cœur » / « À découvrir ».
 *
 * Tout est pur (pas d'effet de bord) → testable et SSR-safe.
 */
import type {
  CatalogProduct,
  QuizAnswers,
  Recommendation,
  ResultBadge,
  Gender,
} from "../types";
import {
  WEIGHTS,
  BUDGET_RANGES,
  SEASON_FAMILIES,
  SEASON_TARGET_INTENSITY,
} from "../data/scoring";

const has = (arr: string[], v: string | null | undefined): boolean =>
  v != null && arr.includes(v);

const overlap = (a: string[], b: string[]): number =>
  a.filter((x) => b.includes(x)).length;

/** Filtre dur sur le genre. « gift »/null/unisex demandé → on n'exclut pas. */
function passesGender(p: CatalogProduct, answer: string | null): boolean {
  if (answer == null || answer === "gift" || answer === "unisex") return true;
  // L'utilisateur a demandé women/men : on garde le genre demandé + les mixtes.
  return p.gender === (answer as Gender) || p.gender === "unisex";
}

/** Filtre dur sur le budget. */
function passesBudget(p: CatalogProduct, answer: string | null): boolean {
  if (answer == null) return true;
  const range = BUDGET_RANGES[answer as keyof typeof BUDGET_RANGES];
  if (!range) return true;
  return p.price >= range.min && p.price <= range.max;
}

/**
 * Intensité cible.
 * 1) Préférence explicite (Q3 intensity = "1"|"2"|"3") si fournie ;
 * 2) sinon orientation par la saison ;
 * 3) sinon 2 (modéré). Toute valeur inconnue est ignorée proprement.
 */
function targetIntensity(answers: QuizAnswers): 1 | 2 | 3 {
  const explicit = Number(answers.intensity);
  if (explicit === 1 || explicit === 2 || explicit === 3) {
    return explicit as 1 | 2 | 3;
  }
  if (answers.season && SEASON_TARGET_INTENSITY[answers.season]) {
    return SEASON_TARGET_INTENSITY[answers.season];
  }
  return 2;
}

function scoreProduct(
  p: CatalogProduct,
  answers: QuizAnswers,
  loved: CatalogProduct | null
): number {
  let score = 0;
  const fam = p.families;
  const notes = p.notes;

  // Famille (Q2)
  if (has(fam, answers.family)) score += WEIGHTS.familyMatch;

  // Note signature (Q7) — comptée si dans notes OU familles.
  // Les slugs sans attribut produit (saffron, sandalwood…) ne matchent simplement pas.
  if (has(notes, answers.note) || has(fam, answers.note)) score += WEIGHTS.noteMatch;

  // Saison (Q5)
  if (answers.season) {
    const expected = SEASON_FAMILIES[answers.season] ?? [];
    if (overlap(fam, expected) > 0) score += WEIGHTS.seasonFit;
  }

  // Intensité : pénalité par cran d'écart à la cible
  const target = targetIntensity(answers);
  const gap = Math.abs(p.intensity - target);
  score -= gap * WEIGHTS.intensityStep;

  // Parfum aimé (Q6) : similarité familles/notes
  if (loved && loved.slug !== p.slug) {
    score += overlap(fam, loved.families) * WEIGHTS.lovedSharedFamily;
    score += overlap(notes, loved.notes) * WEIGHTS.lovedSharedNote;
  }

  // Réassurance
  if (p.isBestseller) score += WEIGHTS.bestseller;
  if (p.isNew) score += WEIGHTS.isNew;

  return score;
}

/** Construit la phrase « pourquoi ce parfum ». */
function buildReason(p: CatalogProduct, answers: QuizAnswers): string {
  const bits: string[] = [];
  const FAMILY_FR: Record<string, string> = {
    amber: "ambré",
    woody: "boisé",
    floral: "floral",
    fresh: "frais",
    oud: "oud",
    musk: "musc",
    spicy: "épicé",
    gourmand: "gourmand",
    rose: "rosé",
  };
  const NOTE_FR: Record<string, string> = {
    oud: "l'oud",
    rose: "la rose",
    vanilla: "la vanille",
    musk: "le musc",
    citrus: "les agrumes",
    spicy: "les épices",
    powdery: "le poudré",
    woody: "le bois",
    amber: "l'ambre",
    saffron: "le safran",
    sandalwood: "le bois de santal",
  };

  if (answers.family && has(p.families, answers.family) && FAMILY_FR[answers.family]) {
    bits.push(`son accord ${FAMILY_FR[answers.family]}`);
  }
  if (
    answers.note &&
    (has(p.notes, answers.note) || has(p.families, answers.note)) &&
    NOTE_FR[answers.note]
  ) {
    bits.push(`une signature portée par ${NOTE_FR[answers.note]}`);
  }
  if (answers.season) {
    const SEASON_FR: Record<string, string> = {
      spring: "le printemps",
      summer: "l'été",
      autumn: "l'automne",
      winter: "l'hiver",
    };
    if (SEASON_FR[answers.season]) bits.push(`idéal pour ${SEASON_FR[answers.season]}`);
  }

  if (bits.length === 0) {
    return p.isBestseller
      ? "Une valeur sûre, plébiscitée par notre communauté."
      : "Un sillage qui colle à votre profil olfactif.";
  }
  // Capitalise la première lettre.
  const sentence = bits.join(", ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

/** Attribue les badges aux 3 recommandations (ordre décroissant de score). */
function assignBadges(ranked: { product: CatalogProduct; score: number }[]): ResultBadge[] {
  const badges: ResultBadge[] = [];
  ranked.forEach((r, i) => {
    if (i === 0) badges.push("match");
    else if (r.product.isNew) badges.push("a_decouvrir");
    else badges.push("coup_de_coeur");
  });
  return badges;
}

export interface RecommendOptions {
  /** Nombre de résultats (défaut 3). */
  limit?: number;
}

/**
 * Calcule les meilleures recommandations.
 * @param answers réponses du quiz
 * @param products catalogue LOCAL normalisé
 */
export function recommend(
  answers: QuizAnswers,
  products: CatalogProduct[],
  options: RecommendOptions = {}
): Recommendation[] {
  const limit = options.limit ?? 3;

  // Résout le parfum aimé (Q6) : match exact par slug.
  const loved =
    answers.loved != null
      ? products.find((p) => p.slug === answers.loved) ?? null
      : null;

  // 1) Filtres durs.
  let pool = products.filter(
    (p) => passesGender(p, answers.gender) && passesBudget(p, answers.budget)
  );

  // Repli si le budget vide le pool : on relâche le budget (mieux vaut proposer).
  if (pool.length === 0) {
    pool = products.filter((p) => passesGender(p, answers.gender));
  }
  if (pool.length === 0) pool = [...products];

  // 2) Score + tri (départage stable : best-seller, puis prix croissant).
  const ranked = pool
    .map((p) => ({ product: p, score: scoreProduct(p, answers, loved) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.product.isBestseller !== b.product.isBestseller)
        return a.product.isBestseller ? -1 : 1;
      return a.product.price - b.product.price;
    })
    .slice(0, limit);

  const badges = assignBadges(ranked);

  // 3) Recommandations finales.
  return ranked.map((r, i) => ({
    product: r.product,
    score: r.score,
    badge: badges[i],
    reason: buildReason(r.product, answers),
  }));
}
