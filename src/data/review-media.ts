/**
 * ReviewMedia — avis clients accompagnés de leurs photos et vidéos.
 *
 * Pourquoi une source séparée de `REVIEWS` (codé en dur dans la fiche produit) :
 * ces trois avis-là sont génériques et re-servis à l'identique sur TOUTES les
 * fiches, ce qui n'a aucun sens dès qu'on y attache une image — on montrerait
 * une photo de Khamrah sous la fiche Salvo. Ici chaque avis est rattaché à un
 * slug et n'apparaît que sur la fiche correspondante.
 *
 * Les chemins pointent tous vers des fichiers réellement présents dans
 * `public/` : un `posterUrl` absent sur une vidéo laisserait une bulle noire le
 * temps du premier téléchargement, on l'exige donc pour le type `video`.
 *
 * Le nom d'auteur est volontairement réduit au prénom + initiale : c'est la
 * forme que les plateformes d'avis publient, et une maquette n'a pas à
 * exposer d'identité complète, même inventée.
 */

export type ReviewMediaItem =
  | { type: "image"; src: string; alt: string }
  | { type: "video"; src: string; posterUrl: string; alt: string };

export type ReviewWithMedia = {
  id: string;
  /** Slug de `product-details.ts` — décide sur quelle fiche l'avis apparaît. */
  productSlug: string;
  /** Note sur 5, entière : les demi-étoiles ne sont pas rendues. */
  rating: number;
  /** Prénom + initiale, jamais un nom complet. */
  author: string;
  city: string;
  date: string;
  title: string;
  text: string;
  verified: boolean;
  media: ReviewMediaItem[];
};

export const REVIEW_MEDIA: ReviewWithMedia[] = [
  {
    id: "rm-khamrah-01",
    productSlug: "lattafa-khamrah",
    rating: 5,
    author: "Yasmine B.",
    city: "Paris",
    date: "12 juin 2025",
    title: "Le sillage tient jusqu'au lendemain",
    text: "Deux pulvérisations le matin et je sens encore les dattes et la cannelle sur mon écharpe le soir. J'ai photographié le flacon dès l'ouverture du colis : le verre est lourd, le bouchon magnétique se pose sans jeu. Rien à voir avec le décant que j'avais acheté ailleurs l'an dernier.",
    verified: true,
    // Trois médias dont une vidéo : c'est l'avis qui sert de démonstration au
    // passage image → vidéo dans une même galerie.
    media: [
      { type: "image", src: "/assets/products/khamrah/khamrah-hf-03.jpg", alt: "Flacon de Khamrah posé sur un plateau, lumière chaude" },
      { type: "video", src: "/assets/videos/khamrah-hf-11.mp4", posterUrl: "/assets/videos/khamrah-hf-11-poster.jpg", alt: "Vidéo du flacon de Khamrah tourné à la main" },
      { type: "image", src: "/assets/products/khamrah/khamrah-hf-12.jpg", alt: "Détail du bouchon doré de Khamrah" },
    ],
  },
  {
    id: "rm-khamrah-02",
    productSlug: "lattafa-khamrah",
    rating: 5,
    author: "Mohammed K.",
    city: "Lyon",
    date: "3 mai 2025",
    title: "L'odeur de mon enfance, retrouvée",
    text: "J'ai grandi avec cette note de dattes épicées à Casablanca et je désespérais de la retrouver ici à un prix correct. Le coffret est arrivé en deux jours, emballé dans du papier de soie. Ma femme me l'emprunte déjà, ce qui est mauvais signe pour mon flacon.",
    verified: true,
    media: [
      { type: "image", src: "/assets/products/khamrah/khamrah-coffret.webp", alt: "Coffret de Khamrah ouvert sur son papier de soie" },
    ],
  },
  {
    id: "rm-khamrah-03",
    productSlug: "lattafa-khamrah",
    rating: 4,
    author: "Camille R.",
    city: "Nantes",
    date: "27 mars 2025",
    title: "Superbe, mais très sucré en ouverture",
    text: "Les dix premières minutes sont franchement gourmandes, presque un dessert. Passé ce cap, le bois et l'encens prennent le dessus et là c'est magnifique. Je retire une étoile uniquement pour cette ouverture qui ne conviendra pas à tout le monde.",
    verified: true,
    // Deux médias : la mise en scène puis le plateau, pour vérifier que le
    // commentaire ne bouge pas quand on passe de l'un à l'autre.
    media: [
      { type: "image", src: "/assets/products/khamrah/khamrah-lit-dattes.webp", alt: "Flacon de Khamrah posé sur un lit de dattes" },
      { type: "image", src: "/assets/products/khamrah/khamrah-plateau-laiton.webp", alt: "Khamrah sur un plateau en laiton avec de l'encens" },
    ],
  },
  {
    id: "rm-marwa-01",
    productSlug: "arabiyat-prestige-marwa",
    rating: 5,
    author: "Inès T.",
    city: "Marseille",
    date: "8 juillet 2025",
    title: "Un floral net, jamais poudré",
    text: "Je cherchais un floral oriental qui ne vire pas au savon. Marwa tient cette ligne toute la journée, avec une facette cristalline en tête que je n'avais sentie nulle part ailleurs. Le flacon est photogénique, ce qui ne gâche rien.",
    verified: true,
    media: [
      { type: "image", src: "/assets/products/marwa/marwa-hf-02.jpg", alt: "Flacon de Marwa en contre-jour" },
      { type: "image", src: "/assets/products/marwa/marwa-cristaux.jpg", alt: "Cristaux et flacon de Marwa sur fond clair" },
    ],
  },
  {
    id: "rm-salvo-01",
    productSlug: "maison-alhambra-salvo",
    rating: 5,
    author: "Adrien L.",
    city: "Lille",
    date: "19 février 2025",
    title: "Mon parfum de bureau depuis six mois",
    text: "Frais, propre, jamais envahissant dans un open space. Deux pulvérisations suffisent pour la journée et personne n'a jamais eu à ouvrir une fenêtre. J'en suis à mon deuxième flacon.",
    verified: true,
    media: [
      { type: "image", src: "/assets/products/salvo/salvo-hf-04.jpg", alt: "Flacon de Salvo posé sur une surface sombre" },
    ],
  },
  {
    id: "rm-rifaaqat-01",
    productSlug: "paris-corner-rifaaqat",
    rating: 5,
    author: "Sofia M.",
    city: "Toulouse",
    date: "30 mai 2025",
    title: "J'ai filmé le déballage tellement j'étais surprise",
    text: "Le prix laissait craindre un flacon fragile : il est en réalité plus lourd que celui d'une grande maison que je ne citerai pas. La vaporisation est fine et régulière. Le sillage boisé reste très présent après huit heures.",
    verified: true,
    // Avis à deux médias dont une vidéo verticale : sert de contre-exemple à
    // l'avis Khamrah, qui commence par une image.
    media: [
      { type: "video", src: "/assets/videos/rifaaqat-hf-02.mp4", posterUrl: "/assets/videos/rifaaqat-hf-02-poster.jpg", alt: "Vidéo de déballage du flacon de Rifaaqat" },
      { type: "image", src: "/assets/products/rifaaqat/rifaaqat-hf-07.jpg", alt: "Flacon de Rifaaqat tenu en main" },
    ],
  },
  {
    id: "rm-vanilla-01",
    productSlug: "vanilla-voyage",
    rating: 4,
    author: "Hélène P.",
    city: "Strasbourg",
    date: "14 avril 2025",
    title: "Vanille chaude, parfaite en hiver",
    text: "Une vanille ambrée qui réchauffe sans être écœurante, exactement ce que je cherchais pour les mois froids. En plein été elle devient un peu lourde, d'où la quatrième étoile. Le packshot ne rend pas justice au reflet du verre.",
    verified: true,
    media: [
      { type: "image", src: "/assets/products/vanilla-voyage/vanilla-voyage-env-03.jpg", alt: "Vanilla Voyage dans une mise en scène chaleureuse" },
      { type: "image", src: "/assets/products/vanilla-voyage/vanilla-voyage-packshot-02.jpg", alt: "Packshot du flacon Vanilla Voyage" },
    ],
  },
  {
    id: "rm-blueberry-01",
    productSlug: "arabiyat-prestige-blueberry-musk",
    rating: 5,
    author: "Laura V.",
    city: "Rennes",
    date: "2 août 2025",
    title: "La myrtille est réaliste, pas bonbon",
    text: "Je m'attendais à un sirop et j'ai eu un fruit acidulé posé sur un musc crémeux. Ma fille de dix-huit ans me l'a confisqué en trois jours, j'en ai recommandé un pour moi.",
    verified: true,
    media: [
      { type: "image", src: "/assets/products/blueberry/blueberry-myrtilles.jpg", alt: "Flacon Blueberry Musk entouré de myrtilles" },
    ],
  },
];

/** Les avis d'UNE fiche. Retourne un tableau vide plutôt que `null` : l'appelant
 *  n'a qu'un `length` à tester pour décider de ne rien afficher du tout. */
export function reviewMediaForProduct(slug: string): ReviewWithMedia[] {
  return REVIEW_MEDIA.filter((r) => r.productSlug === slug);
}
