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
  cardVideo?: string; // vidéo jouée dans la carte (à la place de l'image)
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
    image: "/assets/prod-1.jpg",
    cardVideo: "/assets/videos/vanilla-card.mp4",
    video: "/assets/videos/vanilla-voyage.mp4",
    rank: 1,
    price: 59,
    compareAtPrice: 79, // Promo
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
    name: "Oud & Roses",
    brand: "Dubaï Parfumerie",
    href: "/produit/oud-roses",
    variantId: "oud-roses-50",
    image: "/assets/prod-2.jpg",
    cardVideo: "/assets/videos/oud-roses-card.mp4",
    video: "/assets/videos/oud-roses.mp4",
    rank: 2,
    price: 72,
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
    image: "/assets/prod-3.jpg",
    video: "/assets/videos/reef33.mp4",
    rank: 3,
    price: 64,
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
    image: "/assets/prod-4.jpg",
    video: "/assets/videos/aurum.mp4",
    rank: 4,
    price: 88,
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
    slug: "amber-nuit",
    name: "Amber Nuit",
    brand: "Dubaï Parfumerie",
    href: "/produit/amber-nuit",
    variantId: "amber-nuit-50",
    image: "/assets/prod-5.jpg",
    video: "/assets/videos/aurum-v4.mp4",
    rank: 5,
    price: 69,
    rating: 4.5,
    reviewCount: 76,
    available: true,
    review: {
      author: "Léa P.",
      location: "Marseille",
      countryFlag: "🇫🇷",
      date: "21/09/24",
      rating: 5,
      title: "Cocon ambré",
      body: "Chaleureux et enveloppant, idéal pour l'automne. L'ambre est gourmand sans être écœurant. Mon mari l'adore aussi, c'est devenu notre parfum à partager le soir.",
      helpfulUp: 11,
      helpfulDown: 0,
    },
  },
];
