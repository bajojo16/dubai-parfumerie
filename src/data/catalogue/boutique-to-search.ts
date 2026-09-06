/**
 * Le reste de la boutique — les références que le catalogue vérifié n'a pas
 * encore passées au crible.
 *
 * `dp-catalogue.json` couvre 111 fiches sur les 456 de dubaiparfumerie.com :
 * marque recoupée, pyramide sourcée, prix comparé au marché. Les 345 autres
 * (Lattafa, Ard Al Zaafaran, Al Haramain, Ajmal, Oud Elite, Rasasi, Reef…)
 * attendaient la vague suivante et n'existaient donc nulle part sur ce site.
 *
 * Ce module les fait entrer telles que la boutique les publie — nom, marque,
 * description, photos, prix, disponibilité, lus dans le `ld+json` de chaque
 * page — SANS la vérification du catalogue : pas de pyramide (la boutique n'en
 * publie pas de fiable, et on n'en invente pas), pas de comparaison de prix,
 * marque non recoupée. C'est du contenu de vitrine, pas une fiche vérifiée, et
 * la popularité basse le dit au classement.
 *
 * Il passe EN DERNIER dans l'agrégation : tout ce qu'une fiche rédigée ou le
 * catalogue vérifié porte déjà l'emporte.
 */

import raw from "./dp-boutique.json";

export interface FicheBoutique {
  id: string;
  url: string;
  slug: string;
  nom: string;
  marque: string;
  description: string | null;
  images: string[];
  sku: string | null;
  /** « genre · concentration » tel que la boutique le compose, ex. « unisex · EDP ». */
  categorie: string | null;
  prix: number | null;
  dispo: boolean;
  note: number | null;
  avis: number | null;
}

export const FICHES_BOUTIQUE: FicheBoutique[] = (raw as FicheBoutique[]).filter(
  (f) => f && f.slug && f.nom && f.marque
);

/** Sous les 25 des références du catalogue vérifié : moins on en sait, plus bas on classe. */
const POPULARITE_BOUTIQUE = 18;

const GENRE: Record<string, string> = { unisex: "Mixte", men: "Homme", women: "Femme", homme: "Homme", femme: "Femme", mixte: "Mixte" };
const CONCENTRATION: Record<string, string> = {
  edp: "Eau de parfum", edt: "Eau de toilette", "extrait": "Extrait de parfum",
  "huile de parfum": "Huile de parfum", "eau de parfum": "Eau de parfum",
};

/** « unisex · EDP » → { gender: "Mixte", concentration: "Eau de parfum" }. */
function lireCategorie(c: string | null): { gender?: string; concentration?: string } {
  if (!c) return {};
  const [g, k] = c.split("·").map((s) => s.trim().toLowerCase());
  return { gender: g ? GENRE[g] : undefined, concentration: k ? CONCENTRATION[k] ?? k.replace(/^\w/, (x) => x.toUpperCase()) : undefined };
}

export interface BoutiqueSearchEntry {
  name: string;
  brand: string;
  href: string;
  image?: string;
  description?: string;
  price?: number;
  available: boolean;
  notes: string[];
  gender?: string;
  concentration?: string;
  popularity: number;
}

export const BOUTIQUE_SEARCH_ENTRIES: BoutiqueSearchEntry[] = FICHES_BOUTIQUE.map((f) => {
  const { gender, concentration } = lireCategorie(f.categorie);
  return {
    name: f.nom,
    brand: f.marque,
    href: `/produit/${f.slug}`,
    image: f.images[0],
    description: f.description ?? undefined,
    price: f.prix ?? undefined,
    available: f.dispo,
    // Pas de pyramide : la boutique n'en publie pas de fiable. Une liste vide
    // masque le bloc plutôt que d'afficher une composition devinée.
    notes: [],
    gender,
    concentration,
    popularity: POPULARITE_BOUTIQUE,
  };
});
