/**
 * Visuels de vignette du catalogue — « fond clair, matières premières au pied ».
 *
 * La page `/catalogue` obéit à une règle d'image qui lui est propre : chaque
 * carte montre le flacon sur fond clair, avec les matières qui composent le
 * parfum posées à côté. C'est ce qui permet de balayer une grille de plusieurs
 * dizaines de références et de comprendre chaque jus sans lire une ligne —
 * l'anis étoilé dit l'épicé, les myrtilles disent le fruité, les fleurs
 * blanches disent le floral.
 *
 * Cette règle ne vaut QUE pour le catalogue. Les fiches produit gardent leurs
 * galeries complètes, et les rails de l'accueil leurs mises en scène sombres,
 * qui font un tout autre travail : séduire plutôt qu'informer. D'où cette
 * table d'appoint plutôt qu'une modification des sources — changer `image`
 * dans `product-details.ts` ou `trend-products.ts` déplacerait le visuel
 * partout à la fois.
 *
 * ─── Comment cette table a été remplie ───
 * Les 79 rendus Higgsfield importés ont été passés en revue un par un. N'entre
 * ici qu'un visuel qui remplit VRAIMENT les deux conditions — fond clair ET
 * matière première identifiable. Les produits dont la banque n'offre rien de
 * tel sont listés en commentaire sous la table, sans entrée : mieux vaut
 * l'absence, qui se voit et se comble, qu'un à-peu-près qui s'installe.
 */
export const CATALOGUE_IMAGES: Record<string, string> = {
  // Fond blanc, myrtilles fraîches et coupées au pied du flacon bleu.
  "arabiyat-prestige-blueberry-musk": "/assets/products/blueberry/blueberry-packshot.jpg",

  // Fond blanc, fleurs blanches posées contre le flacon d'argent facetté :
  // c'est exactement ce que la fiche annonce en note de cœur.
  "arabiyat-prestige-marwa": "/assets/products/marwa/marwa-hf-01.jpg",

  // Fond blanc, badiane et noix de muscade au pied. Retenu de préférence à
  // `salvo-hf-05`, que la fiche produit utilise : ce dernier est le cadrage le
  // plus net, mais le flacon y est seul — sans épice, la vignette ne dit plus
  // rien de ce qu'il y a dedans.
  "maison-alhambra-salvo": "/assets/products/salvo/salvo-hf-03.jpg",

  // Fond blanc, dattes et bâtons de cannelle au pied du flacon de cristal.
  // Fourni séparément : aucun des 27 rendus de la banque ne convenait, ils
  // sont tous en mise en scène sombre (dune, encens, cave d'ambre).
  "lattafa-khamrah": "/assets/products/khamrah/khamrah-catalogue.jpg",
};

/**
 * Références encore sans visuel conforme, à produire :
 *
 *  - `vanilla-voyage` — les 7 packshots de la banque sont sur fond blanc mais
 *    le flacon y est seul. Il faudrait le même cadrage avec des gousses de
 *    vanille et un éclat de caramel au pied.
 *  - `paris-corner-rifaaqat` — les 5 studio sont bien sur fond blanc, mais
 *    accompagnés de papiers et d'objets de bureau, pas de matières odorantes.
 *    Il faudrait cognac, praline, fève tonka.
 *
 * Tant qu'elles manquent, `catalogueImage()` retombe sur le visuel de la
 * source : une carte sans photo serait pire qu'une photo hors charte.
 */

/** Visuel de vignette pour le catalogue, avec repli sur celui de la source. */
export function catalogueImage(slug: string, fallback?: string): string | undefined {
  return CATALOGUE_IMAGES[slug] ?? fallback;
}
