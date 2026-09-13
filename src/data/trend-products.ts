/**
 * Données démo "Tendances du moment".
 * En production : `rank`, `rating`, `reviewCount`, `available` résolus côté serveur.
 * variantId = id panier (CartItem.id). href = page produit.
 */
export type TrendReview = {
  author: string;
  location?: string;
  countryFlag?: string; // emoji drapeau
  date: string; // affiché tel quel (déjà localisé en prod)
  rating: number; // 0..5
  title: string;
  body: string;
  helpfulUp?: number;
  helpfulDown?: number;
};

export type TrendProduct = {
  slug: string;
  name: string;
  brand: string;
  href: string;
  variantId: string;
  image: string;
  /**
   * Famille olfactive dominante. Les tendances ne portent AUCUNE note : sans
   * ce champ, `search-catalog.ts` n'avait que le nom du flacon pour les
   * ranger, et « Amber Nuit » comme « Aurum » ressortaient sans famille du
   * tout — donc absents des facettes du catalogue et inéligibles au jumeau.
   */
  family?: string;
  cardVideo?: string; // vidéo jouée dans la carte (à la place de l'image)
  cardObjectPosition?: string; // cadrage média carte (ex. "center 68%")
  video?: string; // vidéo verticale (lightbox)
  rank: number;
  price: number;
  compareAtPrice?: number;
  rating?: number;
  reviewCount?: number;
  available: boolean;
  review?: TrendReview; // avis mis en avant (lightbox)
};

export const DEMO_TRENDS: TrendProduct[] = [
  {
    slug: "vanilla-voyage",
    name: "Vanilla Voyage",
    brand: "Dubaï Parfumerie",
    href: "/produit/vanilla-voyage",
    variantId: "vanilla-voyage-50",
    image: "/assets/products/dp_parfumerie-maison-asrar-vanilla-voyage-env-04.webp",
    cardVideo: "/assets/videos/vanilla-card.mp4",
    cardObjectPosition: "center 72%",
    video: "/assets/videos/vanilla-voyage.mp4",
    rank: 1,
    price: 49,
    compareAtPrice: 69, // Promo
    rating: 4.8,
    reviewCount: 214,
    available: true,
    review: {
      author: "M.H.",
      location: "Laval, Pays de la Loire",
      countryFlag: "🇫🇷",
      date: "12/09/24",
      rating: 5,
      title: "Sillage incroyable",
      body: "Très satisfaite du service ! Envoi rapide et parfum de très bonne qualité. La vanille tient toute la journée, je reçois des compliments à chaque fois. Merci !",
      helpfulUp: 14,
      helpfulDown: 0,
    },
  },
  {
    slug: "oud-roses",
    name: "Oud and Roses",
    brand: "Dubaï Parfumerie",
    href: "/produit/oud-roses",
    variantId: "oud-roses-50",
    image: "/assets/products/oud-roses.webp",
    // grecia-trend.mp4 montre Grecia, pas Oud and Roses.
    cardVideo: "/assets/videos/oud-roses.mp4",
    video: "/assets/videos/oud-roses.mp4",
    rank: 2,
    price: 74.5,
    rating: 4.9,
    reviewCount: 187,
    available: true,
    review: {
      author: "Sarah B.",
      location: "Bruxelles",
      countryFlag: "🇧🇪",
      date: "03/10/24",
      rating: 5,
      title: "Mon préféré",
      body: "L'accord oud et rose est parfaitement équilibré, ni trop sucré ni trop boisé. Élégant et puissant. Le flacon est magnifique en plus. Je recommande les yeux fermés.",
      helpfulUp: 21,
      helpfulDown: 1,
    },
  },
  {
    slug: "reef-33",
    name: "Reef 33",
    brand: "Dubaï Parfumerie",
    href: "/produit/reef-33",
    variantId: "reef-33-50",
    image: "/assets/products/reef-33.webp",
    // marshmallow-trend.mp4 montrait Marshmallow Blush (Paris Corner) : un autre
    // flacon, dans un décor de bonbons, sous le nom « Reef 33 ».
    cardVideo: "/assets/videos/reef33.mp4",
    video: "/assets/videos/reef33.mp4",
    rank: 3,
    price: 70,
    rating: 4.7,
    reviewCount: 142,
    available: false, // Épuisé
    review: {
      author: "Karim D.",
      location: "Lyon",
      countryFlag: "🇫🇷",
      date: "28/08/24",
      rating: 4,
      title: "Frais et addictif",
      body: "Parfait pour l'été, très frais en ouverture avec un fond marin original. Petit bémol sur la tenue (6-7h) mais le sillage est top. Dommage qu'il soit en rupture !",
      helpfulUp: 9,
      helpfulDown: 0,
    },
  },
  {
    slug: "aurum",
    name: "Aurum",
    brand: "Dubaï Parfumerie",
    href: "/produit/aurum",
    variantId: "aurum-50",
    family: "Ambré",
    image: "/assets/products/aurum.webp",
    // Sans cardVideo la carte se contentait du packshot : le film existe, il
    // n'était joué que dans la lightbox.
    cardVideo: "/assets/videos/aurum.mp4",
    video: "/assets/videos/aurum.mp4",
    rank: 4,
    price: 75,
    rating: 4.6,
    reviewCount: 98,
    available: true,
    review: {
      author: "Inès K.",
      location: "Genève",
      countryFlag: "🇨🇭",
      date: "15/10/24",
      rating: 5,
      title: "Luxe absolu",
      body: "Un parfum signature, chaud et doré comme son nom. Parfait pour les soirées. La projection est forte les premières heures, à appliquer avec parcimonie. Coup de cœur.",
      helpfulUp: 17,
      helpfulDown: 2,
    },
  },
  {
    // Amber Nuit occupait ce rang sans film : aucun rush ne montrait son
    // flacon, et la carte restait fixe au milieu de quatre vidéos. Khamrah la
    // remplace — c'est le seul autre produit du dépôt à disposer d'un film
    // dédié avec son image d'attente.
    slug: "lattafa-khamrah",
    name: "Khamrah",
    brand: "Lattafa",
    href: "/produit/lattafa-khamrah",
    variantId: "lattafa-khamrah-100",
    family: "Ambré",
    image: "/assets/products/khamrah/khamrah-hf-05.jpg",
    cardVideo: "/assets/videos/dp_parfumerie-lattafa-khamrah-best-sellers-01.mp4",
    video: "/assets/videos/dp_parfumerie-lattafa-khamrah-best-sellers-01.mp4",
    rank: 5,
    price: 29,
    rating: 4.8,
    reviewCount: 312,
    available: true,
    review: {
      author: "Sofia B.",
      location: "Lyon",
      countryFlag: "🇫🇷",
      date: "04/10/24",
      rating: 5,
      title: "La cannelle et la datte",
      body: "Je comprends pourquoi tout le monde en parle. La datte et la cannelle du départ sont chaudes sans être écœurantes, et ça tient jusqu'au lendemain sur un pull. Le flacon en jette aussi.",
      helpfulUp: 29,
      helpfulDown: 1,
    },
  },
];
