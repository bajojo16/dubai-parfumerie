/**
 * Contrat de la grille bento de la fiche produit.
 *
 * La page ne décide plus d'une suite de sections : elle déclare des TUILES,
 * chacune répondant à une question du client, et un moteur (`bento-layout.ts`)
 * les pave sur une grille de six colonnes.
 *
 * Deux règles tiennent tout le reste :
 *
 * 1. **Une tuile sans données n'existe pas.** Elle n'est pas rendue vide, elle
 *    n'est pas dans la liste. Sur les 445 fiches du catalogue, la plupart n'ont
 *    ni avis rédigés, ni jumeau documenté, ni photos clients : une grille qui
 *    garderait leurs cadres serait pire que la pile qu'elle remplace.
 * 2. **La grille se recompose.** Le moteur connaît la taille naturelle de
 *    chaque tuile ET ses tailles de repli ; il choisit la combinaison qui
 *    remplit les rangées sans laisser de trou. C'est tout l'enjeu du bento.
 */

/** Largeur en colonnes (sur six) et hauteur en rangées. */
export interface TileSize {
  cols: 2 | 3 | 4 | 6;
  rows: 1 | 2;
}

export type TileId =
  | "summary"
  | "gauges"
  | "pyramid"
  | "specs"
  | "twin"
  | "forwhom"
  | "rating"
  | "reviews"
  | "photos"
  | "line"
  | "questions"
  | "description"
  | "collection"
  | "related";

export interface TileSpec {
  id: TileId;
  /** Taille voulue quand la page est large et les données complètes. */
  size: TileSize;
  /**
   * Tailles acceptables à défaut, de la plus proche à la plus petite. Le
   * moteur les essaie pour combler une rangée entamée.
   */
  alt?: TileSize[];
  /**
   * Poids de placement : plus il est haut, plus la tuile est servie tôt. Le
   * résumé et la pyramide passent avant les photos clients.
   */
  weight: number;
  /**
   * `false` retire la tuile de la grille. Calculé depuis les données de la
   * fiche — jamais depuis une préférence d'affichage.
   */
  available: boolean;
}

/** Une tuile placée : sa spec et la taille retenue par le moteur. */
export interface PlacedTile {
  id: TileId;
  size: TileSize;
}
