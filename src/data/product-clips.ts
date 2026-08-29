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
  // ── Khamrah ────────────────────────────────────────────────────────────────
  // Seize films existent sur disque, huit sont déclarés ici. Le tri s'est fait
  // sur une seule question : ce plan montre-t-il quelque chose qu'aucun autre ne
  // montre ? Une bande de huit vignettes qui se ressemblent ne dit pas qu'il y a
  // huit films, elle dit qu'on a mis la même vidéo huit fois.
  //
  // Écartés, et pourquoi — c'est ce que la prochaine personne cherchera :
  // • `khamrah-hf-06` → `-10` sont les ré-encodages plan pour plan de
  //   `-01` → `-05` (mêmes durées à la frame près, mêmes cadres, ~35 % de
  //   débit en moins). Rien de neuf à l'image : les inscrire doublerait
  //   chaque film sans rien ajouter, et la fusion sur l'URL ne les
  //   dédupliquerait pas puisque ce sont d'autres fichiers.
  // • `khamrah-hf-12` filme le même atelier que `-11`, mais monté à l'envers :
  //   quatre plans de meule avant que le flacon n'entre, et l'étiquette
  //   n'arrive lisible qu'à la toute dernière image. `-11` raconte la même
  //   chose en ouvrant sur la verrière et en finissant sur un packshot net.
  // • `khamrah-hf-15` : la datte qui éclate est déjà dans `-01` (la datte
  //   ouverte à la main) et dans `-13` (les éclats en lévitation) ; ce qui
  //   reste est un flacon immobile sur fond noir, que trois autres font.
  // • `khamrah-hf-16` est le seul fichier carré de la banque (720×720 quand
  //   tout le reste est en 480×854). Les tuiles et le lecteur imposent un
  //   cadre 9:16 en `objectFit: "cover"` : on perdrait les colonnes de
  //   lumière et les dattes de côté, c'est-à-dire tout le plan.
  "lattafa-khamrah": [
    {
      // Le seul plan de toute la banque Khamrah où quelqu'un porte le flacon —
      // une main féminine ornée de henné se referme dessus avant la macro de
      // l'étiquette. La case « UGC » demande littéralement ça ; `-05`, qui la
      // tenait jusqu'ici, est un déballage filmé sans personne à l'écran.
      videoUrl: "/assets/videos/khamrah-hf-14.mp4",
      posterUrl: "/assets/videos/khamrah-hf-14-poster.jpg",
      title: "Khamrah · Porté",
    },
    {
      videoUrl: "/assets/videos/khamrah-hf-02.mp4",
      posterUrl: "/assets/products/khamrah/khamrah-poster.jpg",
      title: "Khamrah · Le film",
    },
    {
      videoUrl: "/assets/videos/khamrah-hf-03.mp4",
      posterUrl: "/assets/products/khamrah/khamrah-poster.jpg",
      title: "Khamrah · La coulée",
    },
    {
      videoUrl: "/assets/videos/khamrah-hf-04.mp4",
      posterUrl: "/assets/products/khamrah/khamrah-poster.jpg",
      title: "Khamrah · Fiole fixe",
    },
    {
      // L'atelier de cristallerie : la verrière, le bloc sous la meule, les
      // cannelures qu'on taille, puis le flacon rempli. Le seul film qui dise
      // d'où vient le verre — les quinze autres partent d'un flacon déjà fini.
      // Hors case pour l'instant : il n'y en a que quatre, et il n'entre dans
      // aucune des quatre sans mentir sur ce qu'il montre.
      videoUrl: "/assets/videos/khamrah-hf-11.mp4",
      posterUrl: "/assets/videos/khamrah-hf-11-poster.jpg",
      title: "Khamrah · L'atelier",
    },
    {
      // Les ingrédients qui explosent autour du flacon (dattes, cannelle,
      // éclats de sucre). C'est de l'hypermotion aussi, mais par la dispersion
      // là où `-03` procède par la coulée : le jour où la bande gagne une
      // cinquième case, c'est ce plan-là qui a le moins de voisin.
      videoUrl: "/assets/videos/khamrah-hf-13.mp4",
      posterUrl: "/assets/videos/khamrah-hf-13-poster.jpg",
      title: "Khamrah · Les épices",
    },
    {
      // Rétrogradé par `-14` sur la case UGC, gardé en banque : il reste le
      // seul plan qui découvre le vaporisateur sous le capuchon, ce qui est une
      // information produit et pas une image d'ambiance.
      videoUrl: "/assets/videos/khamrah-hf-05.mp4",
      posterUrl: "/assets/products/khamrah/khamrah-poster.jpg",
      title: "Khamrah · Le geste",
    },
    {
      videoUrl: "/assets/videos/khamrah-hf-01.mp4",
      posterUrl: "/assets/products/khamrah/khamrah-poster.jpg",
      title: "Khamrah · Datte",
    },
  ],

  // ── Vanilla Voyage ─────────────────────────────────────────────────────────
  // Six nouveaux films, tous meilleurs que le rendu de juin — sauf sur un
  // point : aucun des six ne montre quelqu'un. `vanilla-voyage.mp4` reste donc
  // déclaré ici, uniquement pour la case UGC. Ailleurs, il a été remplacé.
  //
  // Posters : chaque film a le sien à côté du `.mp4` (sa première image). On les
  // prend plutôt qu'un packshot commun — le poster est ce qu'on voit avant le
  // premier frame décodé, et un poster qui n'est pas le premier frame se voit.
  "vanilla-voyage": [
    {
      // La route sous la brume, puis le caramel, puis le flacon : le seul des
      // six qui dise « Voyage » par l'image et pas seulement par l'étiquette.
      // C'est le film de marque de cette référence.
      videoUrl: "/assets/videos/vanilla-voyage-hf-01.mp4",
      posterUrl: "/assets/videos/vanilla-voyage-hf-01-poster.jpg",
      title: "Vanilla Voyage · Le voyage",
    },
    {
      // Les éclats de caramel volent, le flacon ne bouge pas et reste net du
      // premier au dernier plan : la définition même de la case « fiole fixe ».
      videoUrl: "/assets/videos/vanilla-voyage-hf-05.mp4",
      posterUrl: "/assets/videos/vanilla-voyage-hf-05-poster.jpg",
      title: "Vanilla Voyage · Le flacon",
    },
    {
      // Déclaré ici pour que la fiche porte sa banque en entier : le carrousel
      // d'accueil le sert déjà, et `ProductVideoStrip` fusionne sur l'URL, donc
      // il n'apparaît qu'une fois. Sans cette ligne, la case « hypermotion » de
      // la fiche dépendrait d'un fichier d'accueil qu'elle ne contrôle pas.
      videoUrl: "/assets/videos/vanilla-voyage-hf-03.mp4",
      posterUrl: "/assets/videos/vanilla-voyage-hf-03-poster.jpg",
      title: "Vanilla Voyage · Les ingrédients",
    },
    {
      // Le rendu de juin, dégradé partout ailleurs, conservé pour cette seule
      // case : c'est le seul plan du parfum où des mains ouvrent le coffret,
      // tiennent le flacon et le vaporisent. Une case tenue par un film moyen
      // dit quelque chose ; une case « à venir » ne dit rien. À remplacer dès
      // qu'un plan porté existe en Higgsfield.
      videoUrl: "/assets/videos/vanilla-voyage.mp4",
      posterUrl: "/assets/videos/vanilla-voyage-poster.webp",
      title: "Vanilla Voyage · Le coffret",
    },
    {
      // La manufacture : la coulée de caramel sur la bande, la halle aux
      // verrières, la dune de sucre. Aussi fort que `-01`, mais il raconte la
      // fabrication quand `-01` raconte le nom du parfum — et la bande n'a
      // qu'une case de film de marque.
      videoUrl: "/assets/videos/vanilla-voyage-hf-02.mp4",
      posterUrl: "/assets/videos/vanilla-voyage-hf-02-poster.jpg",
      title: "Vanilla Voyage · La manufacture",
    },
    {
      // Ambre, gousses et flacon en contre-jour : la variante « fond noir » de
      // `-05`, plus sombre et sans ce qui bouge autour. Gardée en banque parce
      // qu'elle est la seule à montrer la gousse de vanille entière.
      videoUrl: "/assets/videos/vanilla-voyage-hf-04.mp4",
      posterUrl: "/assets/videos/vanilla-voyage-hf-04-poster.jpg",
      title: "Vanilla Voyage · Vanille et ambre",
    },
    {
      // Le flacon qui se révèle d'une poussière dorée. Belle ouverture, mais le
      // plan final part en surexposition blanche : en dernière position, c'est
      // le film qu'on montre quand on a déjà tout montré.
      videoUrl: "/assets/videos/vanilla-voyage-hf-06.mp4",
      posterUrl: "/assets/videos/vanilla-voyage-hf-06-poster.jpg",
      title: "Vanilla Voyage · La révélation",
    },
  ],

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
