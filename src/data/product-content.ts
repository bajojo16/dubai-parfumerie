/**
 * Contenu éditorial et données d'usage d'une fiche produit — ce que le
 * catalogue (`product-details.ts`, `search-catalog.ts`) ne porte pas :
 * tenue, sillage, saisons, année, FAQ, questions-réponses, date de mise à
 * jour, stock.
 *
 * Fichier SÉPARÉ de `product-details.ts` à dessein : le modèle `Product` est
 * la fiche commerciale (prix, notes, visuels) ; ceci est la couche qui rend la
 * fiche RÉPONDANTE — pour le client qui se demande « est-ce pour moi ? », pour
 * les moteurs (tableau, FAQ) et pour les IA (phrases citables). Tout est
 * optionnel : un bloc dont la donnée manque ne se dessine pas, il n'invente
 * rien.
 *
 * ⚠️ Maquette : les valeurs ci-dessous pour Khamrah sont des données de
 * démonstration, marquées comme telles. En production elles viennent du
 * back-office (votes clients, modération des questions).
 */

export type Sillage = "discret" | "modéré" | "fort" | "énorme";
export type Season = "printemps" | "été" | "automne" | "hiver";
export type Occasion = "jour" | "soirée" | "bureau" | "fête";
export type Gender = "femme" | "homme" | "mixte";

export interface ProductFaqItem {
  q: string;
  a: string;
}

export interface ProductQuestion {
  q: string;
  /** Prénom + initiale, jamais le nom complet. */
  author: string;
  /** ISO 8601. */
  date: string;
  /** Réponse signée de la boutique — sans réponse, la question n'est pas publiée. */
  a: string;
  answeredAt: string;
}

export interface ProductContent {
  /** Année de sortie du parfum. */
  year?: number;
  /** Tenue moyenne sur peau, en heures — votée par les clients. */
  longevityHours?: number;
  sillage?: Sillage;
  seasons?: Season[];
  occasions?: Occasion[];
  gender?: Gender;
  /**
   * Stock réel du format de référence. Affiché seulement sous un seuil (voir
   * le composant) : « plus que 7 » est une information, « 340 en stock » du
   * bruit. Absent = on ne dit rien sur le stock.
   */
  stock?: number;
  /**
   * Questions rédigées pour CE produit, en plus des questions génériques que
   * le composant FAQ génère depuis les données (tenue, saison, contenance…).
   */
  faq?: ProductFaqItem[];
  /** Questions de clients avec réponse de la boutique. Modérées. */
  qa?: ProductQuestion[];
  /**
   * Bloc « Est-ce pour moi ? » — trois listes courtes rédigées pour CE parfum.
   * `forWhom` : à qui il parle ; `when` : moments et contextes (les saisons
   * viennent de `seasons`, pas d'ici) ; `howToWear` : gestes. Trois à quatre
   * puces chacune, une phrase par puce, sans point final.
   */
  forWhom?: string[];
  when?: string[];
  howToWear?: string[];
  /** Date de dernière relecture de la fiche, ISO 8601 — bandeau auteur. */
  updatedAt?: string;
  /** Sources citées dans le bandeau auteur (fiche fabricant, presse…). */
  sources?: string[];
}

export const PRODUCT_CONTENT: Record<string, ProductContent> = {
  // Données de DÉMONSTRATION (maquette) — votes et stock à brancher au back-office.
  "lattafa-khamrah": {
    year: 2022,
    longevityHours: 12,
    sillage: "fort",
    seasons: ["automne", "hiver"],
    occasions: ["soirée", "fête"],
    gender: "mixte",
    stock: 7,
    faq: [
      {
        q: "Khamrah ressemble-t-il à Angels' Share de Kilian ?",
        a: "Khamrah s'inspire de l'accord cognac, cannelle et fève tonka d'Angels' Share, avec un fond plus résineux (benjoin, encens, myrrhe) et un sillage plus dense. Parfums inspirés, jamais des copies : aucune affiliation avec les marques citées.",
      },
      {
        q: "Khamrah et Khamrah Qahwa, quelle différence ?",
        a: "Khamrah Qahwa reprend la même base gourmande en y ajoutant un accord de café arabe à la cardamome ; il est plus épicé et un peu moins sucré que Khamrah.",
      },
    ],
    qa: [
      {
        q: "Est-ce que ça tache les vêtements clairs ?",
        author: "Nadia R.",
        date: "2026-08-14",
        a: "Le jus est ambré : sur un tissu blanc, une pulvérisation directe peut laisser une trace. Nous conseillons de parfumer la peau (cou, poignets) et de laisser sécher avant de s'habiller.",
        answeredAt: "2026-08-15",
      },
      {
        q: "Le flacon est-il le même que celui vendu à Dubaï ?",
        author: "Karim L.",
        date: "2026-07-02",
        a: "Oui : nous importons directement auprès de Lattafa. Le code lot sous le flacon et sur la boîte correspond à la production officielle.",
        answeredAt: "2026-07-02",
      },
    ],
    forWhom: [
      "Mixte : porté autant par les femmes que par les hommes",
      "Vous aimez le sucré-épicé (datte, cannelle, praline)",
      "Vous cherchez un sillage remarqué, qui laisse une trace",
      "Vous aimez les orientaux chauds dans le sillage d'Angels' Share",
    ],
    when: [
      "Soirée plutôt que journée : idéal dès la tombée du jour",
      "Par temps froid, la datte et le benjoin se déploient",
      "Ramadan, fêtes, dîners : un parfum de moments",
    ],
    howToWear: [
      "2 pulvérisations : cou + poignets, pas plus",
      "Sur peau hydratée pour prolonger la tenue",
      "Éviter les vêtements clairs : jus ambré, peut marquer",
      "Réappliquer à 12 h si soirée longue",
    ],
    updatedAt: "2026-09-22",
    sources: ["Fiche fabricant Lattafa Perfumes", "Votes et avis clients Dubaï Parfumerie"],
  },
  // Deux voisines de Khamrah dans le comparatif « Khamrah ou … ? » : sans
  // tenue ni saison, leurs colonnes n'affichaient que des tirets. Données de
  // DÉMONSTRATION (maquette), à remplacer par les votes clients.
  "lattafa-yara": {
    longevityHours: 8,
    sillage: "modéré",
    seasons: ["printemps", "été"],
    occasions: ["jour", "bureau"],
    gender: "femme",
  },
  "lattafa-oud-pour-elle": {
    longevityHours: 10,
    sillage: "fort",
    seasons: ["automne", "hiver"],
    occasions: ["soirée"],
    gender: "femme",
  },
};

const EMPTY: ProductContent = {};

/** Le contenu d'une fiche, ou un objet vide — jamais `undefined`, pour que les composants déstructurent sans garde. */
export function contentFor(slug: string): ProductContent {
  return PRODUCT_CONTENT[slug] ?? EMPTY;
}

/** Libellé lisible d'une saison ou d'un moment, pour l'affichage. */
export const SEASON_LABEL: Record<Season, string> = {
  printemps: "Printemps",
  été: "Été",
  automne: "Automne",
  hiver: "Hiver",
};
export const OCCASION_LABEL: Record<Occasion, string> = {
  jour: "Journée",
  soirée: "Soirée",
  bureau: "Bureau",
  fête: "Fête",
};
export const GENDER_LABEL: Record<Gender, string> = {
  femme: "Femme",
  homme: "Homme",
  mixte: "Mixte",
};
export const SILLAGE_LABEL: Record<Sillage, string> = {
  discret: "Discret",
  modéré: "Modéré",
  fort: "Fort",
  énorme: "Énorme",
};
