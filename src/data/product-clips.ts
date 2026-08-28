/**
 * Films attachés à une fiche produit — troisième banque vidéo du repo.
 *
 * Les deux premières servent autre chose : `product-stories.ts` alimente les
 * bulles de stories (une par produit, en haut de page), `shoppable-videos.ts`
 * le carrousel « shoppable » de l'accueil (une carte par produit, sinon la même
 * référence occupe toute la rangée). Un parfum livré avec six films n'entre
 * dans aucune des deux sans les déformer.
 *
 * Ce fichier porte donc les films qui appartiennent à LA FICHE et à elle seule.
 * `ProductVideoStrip` les fusionne avec les deux autres banques, sur l'URL du
 * fichier : un même film déclaré ici et dans une story n'apparaît qu'une fois.
 *
 * L'ordre compte : la bande n'a que quatre cases, et les films non épinglés à
 * une catégorie les remplissent dans l'ordre de déclaration. Le surplus n'est
 * pas montré — on déclare quand même l'intégralité de la banque, pour que le
 * jour où la bande gagne une case elle ait de quoi la remplir.
 *
 * En production : résolu depuis le CDN vidéo via le `slug` du produit.
 */

export type ProductClip = {
  /** fichier vidéo, muet, H.264 — lu au clic uniquement (`preload="none"`) */
  videoUrl: string;
  /** image d'attente ; à défaut d'une extraction de frame, un visuel du produit */
  posterUrl: string;
  /** libellé du lecteur plein écran */
  title?: string;
};

/** Clé = slug de la fiche (`/produit/<slug>`). */
export const PRODUCT_CLIPS: Record<string, ProductClip[]> = {
  // Blueberry Musk — six films. Les trois premiers sont épinglés à une catégorie
  // dans `ProductVideoStrip` parce qu'on sait ce qu'ils montrent ; les suivants
  // remplissent les cases restantes dans cet ordre.
  //
  // Posters : la banque ne fournit qu'un seul poster vidéo
  // (`blueberry-poster.jpg`, qui est la première image du film « entrepôt »).
  // Les autres films reprennent le visuel produit le plus proche de ce qu'ils
  // montrent, plutôt que ce même poster répété quatre fois — quatre vignettes
  // identiques ne diraient pas qu'il y a quatre films différents.
  "arabiyat-prestige-blueberry-musk": [
    {
      videoUrl: "/assets/videos/blueberry-hf-03.mp4",
      posterUrl: "/assets/products/blueberry/blueberry-myrtilles.jpg",
      title: "Blueberry Musk · Le flacon sous les baies",
    },
    {
      videoUrl: "/assets/videos/blueberry-hf-01.mp4",
      posterUrl: "/assets/products/blueberry/blueberry-poster.jpg",
      title: "Blueberry Musk · L'entrepôt de glace",
    },
    {
      videoUrl: "/assets/videos/blueberry-hf-05.mp4",
      posterUrl: "/assets/products/blueberry/blueberry-coulee.jpg",
      title: "Blueberry Musk · Pluie de myrtilles",
    },
    {
      videoUrl: "/assets/videos/blueberry-hf-04.mp4",
      posterUrl: "/assets/products/blueberry/blueberry-packshot.jpg",
      title: "Blueberry Musk · Le flacon",
    },
    {
      videoUrl: "/assets/videos/blueberry-hf-02.mp4",
      posterUrl: "/assets/products/blueberry/blueberry-glace.jpg",
      title: "Blueberry Musk · Blocs de glace",
    },
    {
      videoUrl: "/assets/videos/blueberry-hf-06.mp4",
      posterUrl: "/assets/products/blueberry/blueberry-glace.jpg",
      title: "Blueberry Musk · Éclats de glace",
    },
  ],
};

/** Les films de CE produit, ou un tableau vide. */
export function clipsFor(slug: string): ProductClip[] {
  return PRODUCT_CLIPS[slug] ?? [];
}
