/**
 * FragranceFinder — types du quiz olfactif.
 *
 * Portage du quiz d'AD Parfumerie (archive `quiz-ad-parfumerie`) : huit
 * questions, une famille olfactive, trois flacons. La question « un parfum que
 * vous aimez déjà » de l'archive n'est PAS reprise — d'où huit questions et non
 * neuf, et d'où l'absence de toute notion de « parfum de référence » ici.
 *
 * Le catalogue n'est pas redéclaré : le quiz lit `SEARCH_PRODUCTS` de
 * `@/data/search-catalog`, la même source que la recherche du header.
 */

/** Les quatre familles olfactives de `FAMILIES` (search-catalog). */
export type FamilyKey = "frais" | "floral" | "ambre" | "boise";

/** Comment une question dispose ses options. */
export type OptionLayout =
  /** pastilles typographiques (occasion, budget, saison) */
  | "pill"
  /** pastilles en aplat de couleur (destinataire, expérience) */
  | "fill"
  /** vignettes photo + voile sombre (univers, note) */
  | "art"
  /** jauge à trois barres (intensité) */
  | "gauge";

export interface QuizOption {
  /** libellé affiché — sert aussi de valeur dans le récapitulatif */
  label: string;
  /** sous-texte discret sous le libellé */
  hint?: string;
  /**
   * Vote pour une famille olfactive. Absent ou "" = l'option ne vote pas
   * (« Toute saison », destinataire, expérience, occasion, budget).
   */
  family?: FamilyKey | "";
  /** aplat de fond — TOUJOURS une variable du design system, jamais un hex */
  fill?: string;
  /** visuel de fond (layout "art") */
  image?: string;
  /** nombre de barres allumées sur la jauge (layout "gauge") */
  gauge?: 1 | 2 | 3;
  /** Q1 — genre visé, confronté à `SearchProduct.gender` */
  gender?: string;
  /**
   * Q6 — mots-clés cherchés dans la composition. On ne se contente pas du
   * libellé : « Bois de santal » ne se retrouve nulle part tel quel dans le
   * catalogue, qui écrit « Santal blanc » — le mot-clé est donc « santal ».
   */
  noteWords?: string[];
  /** Q7 — bornes de budget, appliquées au TOTAL du trio (voir questions.ts) */
  min?: number;
  max?: number;
}

export interface QuizQuestion {
  /** clé stable, sert de `key` React et de repère de lecture */
  id: string;
  /** intitulé du critère dans le récapitulatif de l'écran de fin */
  criterion: string;
  title: string;
  subtitle?: string;
  layout: OptionLayout;
  options: QuizOption[];
  /** libellé du lien d'évitement (« Je ne sais pas ») — absent = pas de lien */
  skip?: string;
  /** encart explicatif posé à côté de la question (Q2) */
  note?: { title: string; paragraphs: string[] };
}

/**
 * Réponses : index de l'option retenue, par numéro d'étape (0-based).
 * `null` = question passée (« Je ne sais pas »), clé absente = pas encore posée.
 */
export type QuizAnswers = Record<number, number | null>;
