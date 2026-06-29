/**
 * ShoppableVideo — vidéos verticales 9:16 « shoppables » (carrousel).
 * En production : videoUrl/posterUrl pointent vers un CDN vidéo (Mux/Cloudflare/Bunny),
 * et `product` est résolu côté serveur via `productHandle` (prix, stock, variante).
 * Ici données démo (vidéos locales, produit embarqué).
 */
export type ShoppableVideo = {
  id: string;
  videoUrl: string;
  posterUrl: string;
  productHandle: string;
  // Résolu côté serveur en prod ; embarqué ici pour la démo
  product: {
    name: string;
    price: number;
    thumbnailUrl: string;
    available: boolean;
    href: string;
    variantId: string;
  };
};

export const DEMO: ShoppableVideo[] = [
  {
    id: "vanilla-voyage",
    videoUrl: "/assets/videos/vanilla-voyage.mp4",
    posterUrl: "/assets/prod-1.jpg",
    productHandle: "vanilla-voyage",
    product: {
      name: "Vanilla Voyage",
      price: 59,
      thumbnailUrl: "/assets/prod-1.jpg",
      available: true,
      href: "/produit/vanilla-voyage",
      variantId: "vanilla-voyage-100ml",
    },
  },
  {
    id: "oud-roses",
    videoUrl: "/assets/videos/oud-roses.mp4",
    posterUrl: "/assets/prod-2.jpg",
    productHandle: "oud-roses",
    product: {
      name: "Oud & Roses",
      price: 79,
      thumbnailUrl: "/assets/prod-2.jpg",
      available: false,
      href: "/produit/oud-roses",
      variantId: "oud-roses-100ml",
    },
  },
];
