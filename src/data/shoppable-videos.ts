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
    posterUrl: "/assets/videos/vanilla-voyage-poster.webp",
    productHandle: "vanilla-voyage",
    product: {
      name: "Vanilla Voyage",
      price: 59,
      thumbnailUrl: "/assets/products/vanilla-voyage.webp",
      available: true,
      href: "/produit/vanilla-voyage",
      variantId: "vanilla-voyage-100ml",
    },
  },
  {
    id: "oud-roses",
    videoUrl: "/assets/videos/oud-roses.mp4",
    posterUrl: "/assets/videos/oud-roses-poster.webp",
    productHandle: "oud-roses",
    product: {
      name: "Oud & Roses",
      price: 79,
      thumbnailUrl: "/assets/products/oud-roses.webp",
      available: false,
      href: "/produit/oud-roses",
      variantId: "oud-roses-100ml",
    },
  },
  {
    id: "aurum",
    videoUrl: "/assets/videos/aurum.mp4",
    posterUrl: "/assets/videos/aurum-poster.webp",
    productHandle: "aurum",
    product: {
      name: "Aurum",
      price: 49,
      thumbnailUrl: "/assets/products/aurum.webp",
      available: true,
      href: "/produit/aurum",
      variantId: "aurum-100ml",
    },
  },
  {
    id: "reef-33",
    videoUrl: "/assets/videos/reef33.mp4",
    posterUrl: "/assets/videos/reef33-poster.webp",
    productHandle: "reef-33",
    product: {
      name: "Reef 33",
      price: 39,
      thumbnailUrl: "/assets/products/reef-33.webp",
      available: true,
      href: "/produit/reef-33",
      variantId: "reef-33-100ml",
    },
  },
  {
    // La cascade de cannelle, puis la coulée d'ambre sur le flacon, puis la macro
    // de l'étiquette : le plan le plus « pub » de la banque, celui qui accroche
    // le mieux dans un carrousel qui défile — et le seul qui finisse sur une
    // étiquette parfaitement lisible, ce qui compte quand la carte passe vite.
    // Remplace `khamrah-levitation.mp4`, dont le flacon restait flou en vol.
    id: "khamrah",
    videoUrl: "/assets/videos/khamrah-hf-02.mp4",
    posterUrl: "/assets/products/khamrah/khamrah-poster.jpg",
    productHandle: "lattafa-khamrah",
    product: {
      name: "Khamrah",
      // Aligné sur la fiche rédigée (`product-details.ts`) : le prix de la carte
      // et celui de la fiche qu'elle ouvre doivent être le même nombre.
      price: 21.9,
      // Vignette 68 px : il faut le packshot le plus serré, pas le plus large.
      thumbnailUrl: "/assets/products/khamrah/khamrah-hf-05.jpg",
      available: true,
      href: "/produit/lattafa-khamrah",
      variantId: "lattafa-khamrah-100ml",
    },
  },
];
