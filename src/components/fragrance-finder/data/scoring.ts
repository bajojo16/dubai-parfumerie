/**
 * Pondérations du moteur de recommandation FragranceFinder.
 *
 * Le score d'un produit = somme de bonus selon l'adéquation aux réponses.
 * Les filtres DURS (genre, budget) ne sont PAS ici — ils excluent en amont
 * (voir lib/recommend.ts). Ici uniquement les bonus de classement.
 */
import type { BudgetTier } from "../types";

export const WEIGHTS = {
  /** La famille choisie figure dans les familles du produit. */
  familyMatch: 30,
  /** La note signature (Q3) figure dans les notes ou familles. */
  noteMatch: 24,
  /** La seconde note (Q7) figure dans les notes. */
  note2Match: 14,
  /** Bonus best-seller (réassurance). */
  bestseller: 8,
  /** Bonus nouveauté (mise en avant douce). */
  isNew: 4,
  /** Proximité d'intensité avec l'intensité cible (par cran d'écart : -penalty). */
  intensityStep: 9,
  /** Adéquation saison ↔ familles attendues. */
  seasonFit: 12,
  /** Similarité avec le parfum aimé (Q6) : familles/notes partagées. */
  lovedSharedFamily: 7,
  lovedSharedNote: 5,
} as const;

/** Bornes de prix par tranche de budget (filtre dur, EUR démo). */
export const BUDGET_RANGES: Record<BudgetTier, { min: number; max: number }> = {
  low: { min: 0, max: 40 },
  mid: { min: 40, max: 65 },
  high: { min: 65, max: Infinity },
};

/** Familles « attendues » par saison (bonus seasonFit si recoupement). */
export const SEASON_FAMILIES: Record<string, string[]> = {
  spring: ["floral", "fresh", "rose"],
  summer: ["fresh", "citrus", "floral"],
  autumn: ["woody", "amber", "spicy"],
  winter: ["oud", "amber", "gourmand", "spicy"],
};

/**
 * Intensité cible par saison (l'hiver tolère/préfère plus de sillage).
 * Utilisée par recommend() pour orienter le score d'intensité.
 */
export const SEASON_TARGET_INTENSITY: Record<string, 1 | 2 | 3> = {
  spring: 1,
  summer: 1,
  autumn: 2,
  winter: 3,
};
