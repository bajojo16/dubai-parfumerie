/**
 * Contenu éditorial relevé sur dubaiparfumerie.com.
 *
 * `dp-catalogue.json` vérifie la marque, la pyramide et le prix, mais il ne
 * porte ni visuel ni texte de vente : ce n'est pas son objet. Les 106 fiches
 * qu'il a fait entrer sur le site sortaient donc sans photo — repli sur un
 * packshot générique — et avec une description dérivée de leur profil par
 * `product-resolve.ts`.
 *
 * Ce module comble ce trou avec ce que la boutique publie déjà : le bloc
 * `ld+json` de type `Product` de chaque page produit donne la description
 * rédigée, la galerie, le SKU, la note et le volume d'avis. Les images sont
 * rapatriées et converties en WebP 1400 px sous `public/assets/products/dp/`,
 * pour ne pas dépendre à l'affichage du CDN de l'ancienne boutique.
 *
 * Rien n'est reformulé : c'est le texte de la boutique, tel quel.
 */

import raw from "./dp-fiches-site.json";

export interface FicheSite {
  /** Identifiant de la fiche au catalogue (`dp-catalogue.json`). */
  id: string;
  /** Slug local, `marque-nom` — celui que sert `/produit/<slug>`. */
  slug: string;
  nom: string;
  /** Description rédigée par la boutique. `null` si la page n'en portait pas. */
  description: string | null;
  /** Visuels rapatriés, dans l'ordre de la galerie d'origine. */
  images: string[];
  sku: string | null;
  /** Ligne « genre · concentration » telle que la boutique la compose. */
  categorie: string | null;
  prix: number | null;
  dispo: boolean;
  /** Note moyenne affichée par la boutique, sur 5. */
  note: number | null;
  avis: number | null;
}

export const FICHES_SITE: FicheSite[] = raw as FicheSite[];

const BY_ID = new Map(FICHES_SITE.map((f) => [f.id, f]));

export function ficheSite(id: string): FicheSite | undefined {
  return BY_ID.get(id);
}
