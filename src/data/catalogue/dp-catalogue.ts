/**
 * Catalogue vérifié de dubaiparfumerie.com — source de vérité produit.
 *
 * Vague du 06/09/2026 : 111 fiches sur les 456 du site, reprises à la source.
 * La marque est recoupée sur le site officiel de la maison, la pyramide vient
 * de ce même site quand il en publie une (l'URL exacte est conservée dans
 * `notesSource`), et le prix du site est comparé à une médiane de prix
 * concurrents relevés sur le marché.
 *
 * La règle qui gouverne le jeu de données : RIEN N'EST DÉDUIT. Une pyramide
 * introuvable reste `[]`, jamais une composition plausible ; une contenance non
 * affichée reste `null`, même quand les revendeurs en annoncent une. C'est ce
 * qui rend le fichier utilisable sans le re-vérifier — et c'est aussi pourquoi
 * le code doit prévoir un repli d'affichage plutôt qu'un tiret.
 *
 * Ce module est la SEULE porte d'entrée du JSON : il sépare les champs
 * destinés au client de ceux qui relèvent de l'audit interne. Importer
 * `dp-catalogue.json` directement contournerait cette séparation.
 *
 * Reste 345 fiches à vérifier — dont Lattafa, Al Haramain, Ajmal, Oud Elite et
 * Reef Perfumes, c'est-à-dire l'essentiel des références déjà en vitrine ici.
 * Le schéma ne bougera plus : les vagues suivantes s'ajouteront au même JSON.
 */

import raw from "./dp-catalogue.json";

/** Pyramide olfactive. Un niveau vide est un niveau que la source n'a pas donné. */
export interface CatalogueNotes {
  tete: string[];
  coeur: string[];
  fond: string[];
}

/**
 * Relevé de prix concurrents. `n: 0` ne veut pas dire « aligné » : il veut dire
 * « non mesuré », et `verdictPrix` vaut alors `null`.
 */
export interface CatalogueMarche {
  n: number;
  min: number | null;
  max: number | null;
  median: number | null;
  sources: string[];
}

/** Une fiche du catalogue, champs d'audit compris. */
export interface CatalogueEntry {
  id: string;
  url: string;
  nom: string;
  marque: string;
  /** Marque telle qu'affichée par le site — à comparer avec `marque`. */
  marqueSite: string;
  /** `false` quand le site se trompe de marque. À corriger avant migration : la
   *  marque erronée se propage sinon dans les URLs et le référencement. */
  marqueOk: boolean;
  type: string;
  concentration: string | null;
  genre: string | null;
  contenance: string | null;
  notes: CatalogueNotes;
  notesSource: string | null;
  prix: number | null;
  prixBarre: number | null;
  devise: string;
  dispo: boolean;
  marche: CatalogueMarche;
  verdictPrix: "trop cher" | "aligné" | "agressif" | null;
  /** Note de travail interne. NE PAS AFFICHER : ce n'est pas du contenu client. */
  anomalies: string[];
  releve: string;
}

/**
 * Les champs qu'une page peut afficher sans réserve. `marqueSite`, `marqueOk`,
 * `marche`, `verdictPrix` et `anomalies` n'y figurent pas : ce sont des outils
 * d'audit et de pilotage tarifaire, pas une information acheteur.
 */
export type CataloguePublicEntry = Omit<
  CatalogueEntry,
  "marqueSite" | "marqueOk" | "marche" | "verdictPrix" | "anomalies"
>;

interface RawEntry {
  id: string;
  url: string;
  nom: string;
  marque: string;
  marque_site: string;
  marque_ok: boolean;
  type: string;
  concentration: string | null;
  genre: string | null;
  contenance: string | null;
  notes: CatalogueNotes;
  notes_source: string | null;
  prix_dp: number | null;
  prix_dp_barre: number | null;
  devise: string;
  dispo: boolean;
  marche: CatalogueMarche;
  verdict_prix: CatalogueEntry["verdictPrix"];
  anomalies: string[];
  releve: string;
}

export const CATALOGUE: CatalogueEntry[] = (raw as RawEntry[]).map((p) => ({
  id: p.id,
  url: p.url,
  nom: p.nom,
  marque: p.marque,
  marqueSite: p.marque_site,
  marqueOk: p.marque_ok,
  type: p.type,
  concentration: p.concentration,
  genre: p.genre,
  contenance: p.contenance,
  notes: p.notes,
  notesSource: p.notes_source,
  prix: p.prix_dp,
  prixBarre: p.prix_dp_barre,
  devise: p.devise,
  dispo: p.dispo,
  marche: p.marche,
  verdictPrix: p.verdict_prix,
  anomalies: p.anomalies,
  releve: p.releve,
}));

const BY_ID = new Map(CATALOGUE.map((p) => [p.id, p]));

/** Normalise marque + nom pour rapprocher deux orthographes du même flacon
 *  (« 9 PM » côté catalogue, « 9PM » côté fiche rédigée). */
const key = (brand: string, name: string) =>
  `${brand}${name}`.toLowerCase().replace(/[^a-z0-9]/g, "");

const BY_NAME = new Map(CATALOGUE.map((p) => [key(p.marque, p.nom), p]));

export function catalogueById(id: string): CatalogueEntry | undefined {
  return BY_ID.get(id);
}

export function catalogueByName(brand: string, name: string): CatalogueEntry | undefined {
  return BY_NAME.get(key(brand, name));
}

/**
 * Retire les champs d'audit avant tout rendu. Écrit en énumérant ce qui SORT
 * plutôt qu'en déstructurant ce qui reste : un champ ajouté au schéma
 * n'atterrit alors pas dans le rendu client par simple oubli.
 */
export function toPublic(p: CatalogueEntry): CataloguePublicEntry {
  return {
    id: p.id,
    url: p.url,
    nom: p.nom,
    marque: p.marque,
    type: p.type,
    concentration: p.concentration,
    genre: p.genre,
    contenance: p.contenance,
    notes: p.notes,
    notesSource: p.notesSource,
    prix: p.prix,
    prixBarre: p.prixBarre,
    devise: p.devise,
    dispo: p.dispo,
    releve: p.releve,
  };
}

/** Une pyramide dont les trois niveaux sont vides : la page doit masquer le
 *  bloc plutôt que d'afficher des tirets. Quatre fiches sur 111 sont dans ce
 *  cas. */
export function hasNotes(p: CatalogueEntry): boolean {
  return p.notes.tete.length > 0 || p.notes.coeur.length > 0 || p.notes.fond.length > 0;
}

/** Les fiches dont le site affiche la mauvaise marque. */
export function marquesErronees(): CatalogueEntry[] {
  return CATALOGUE.filter((p) => !p.marqueOk);
}
