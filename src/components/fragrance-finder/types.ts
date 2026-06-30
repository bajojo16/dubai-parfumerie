/**
 * FragranceFinder — types partagés du quiz olfactif.
 *
 * Le projet n'est PAS Shopify : la recherche (Q6) et les recommandations
 * s'appuient sur le CATALOGUE LOCAL agrégé (voir data/productAttributes.ts).
 */

/** Genre ciblé d'un parfum / d'une réponse. */
export type Gender = "women" | "men" | "unisex";

/** Tranches de budget (filtre dur). */
export type BudgetTier = "low" | "mid" | "high";

/**
 * Produit normalisé pour le moteur de reco.
 * Construit à partir des données catalogue existantes + attributs démo.
 */
export interface CatalogProduct {
  /** Identifiant panier stable (CartItem.id). */
  id: string;
  /** Slug page produit / clé d'attributs. */
  slug: string;
  name: string;
  brand: string;
  /** Prix TTC dans la devise du catalogue (EUR en démo). */
  price: number;
  /** Visuel principal (chemin local /assets/...). */
  image: string;
  /** Familles olfactives (slugs stables : amber, woody, floral, fresh, oud, musk, spicy, gourmand, rose). */
  families: string[];
  /** Notes saillantes (slugs : oud, rose, vanilla, musk, citrus, spicy, powdery, woody...). */
  notes: string[];
  /** Intensité du sillage : 1 = léger, 2 = modéré, 3 = puissant. */
  intensity: 1 | 2 | 3;
  /** Genre du parfum. */
  gender: Gender;
  /** Vrai si best-seller (bonus de score + badge possible). */
  isBestseller: boolean;
  /** Vrai si nouveauté (badge « À découvrir »). */
  isNew: boolean;
}

/**
 * Réponses du quiz. Chaque clé = id de question, chaque valeur = slug d'option.
 * `null` = non répondu / passé / « Je ne sais pas ».
 */
export interface QuizAnswers {
  gender: string | null;
  family: string | null;
  note: string | null;
  season: string | null;
  /** Q6 : recherche libre d'un parfum aimé (slug catalogue OU texte saisi). */
  loved: string | null;
  note2: string | null;
  budget: string | null;
  format: string | null;
}

/** Clé d'une question (ordre stable). */
export type QuestionId = keyof QuizAnswers;

/** Une option de réponse (tuile). */
export interface QuizOption {
  /** Slug stable utilisé par le scoring (ex : women, amber, oud, summer, low, travel). */
  value: string;
  label: string;
  /** Sous-légende optionnelle. */
  hint?: string;
  /**
   * Visuel « matière » optionnel (/quiz/materials/*).
   * Si absent → fallback dégradé radial (voir Tile.tsx).
   */
  image?: string;
  /** Dégradé radial de repli (CSS background). */
  gradient?: string;
}

/** Type d'écran d'une question. */
export type QuestionKind = "tiles" | "search";

/** Définition d'une question du quiz. */
export interface Question {
  id: QuestionId;
  /** Intitulé (FR par défaut). */
  title: string;
  /** Sous-titre / aide. */
  subtitle?: string;
  kind: QuestionKind;
  options?: QuizOption[];
  /** Affiche une action pleine largeur « Je ne sais pas » (Q4, Q7). */
  allowSkipUnsure?: boolean;
  /** Affiche une action « Passer » discrète (Q6). */
  allowSkip?: boolean;
}

/** Badge attribué à une recommandation. */
export type ResultBadge = "match" | "coup_de_coeur" | "a_decouvrir";

/** Une recommandation finale. */
export interface Recommendation {
  product: CatalogProduct;
  score: number;
  badge: ResultBadge;
  /** Phrase « pourquoi ce parfum » (générée par recommend()). */
  reason: string;
}

/** Libellés i18n (défauts FR). Passés en props pour rester hors des JSON de messages. */
export interface FinderLabels {
  /** Bouton flottant. */
  openAria: string;
  /** Étiquette pill visible à côté de la fiole (desktop). */
  openLabel: string;
  /** En-tête modal. */
  eyebrow: string;
  modalTitle: string;
  /** Progression : doit contenir {current} et {total}. */
  questionCounter: string;
  back: string;
  unsure: string;
  skip: string;
  /** SearchScreen. */
  searchPlaceholder: string;
  searchHint: string;
  searchEmpty: string;
  freeTextPrefix: string; // « Utiliser : »
  /** ResultScreen. */
  resultEyebrow: string;
  /** Titre singulier (1 reco). */
  resultTitleOne: string;
  /** Titre pluriel — doit contenir {count}. */
  resultTitleMany: string;
  resultSubtitle: string;
  badgeMatch: string;
  badgeCoupDeCoeur: string;
  badgeADecouvrir: string;
  addToCart: string;
  added: string;
  viewProduct: string;
  restart: string;
  /** Opt-in. */
  optInTitle: string;
  optInText: string;
  emailPlaceholder: string;
  emailCta: string;
  emailSuccess: string;
  whatsappCta: string;
  rgpd: string;
  /** Loading. */
  loading: string;
}
