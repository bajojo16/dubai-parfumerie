/**
 * ProductStory — vidéos "stories" produit (bulles + lecteur plein écran).
 * En production : videoUrl/posterUrl pointent vers un CDN vidéo (Mux/Cloudflare/Bunny),
 * shopProductHandle résolu côté serveur → prix + lien. Ici données démo (vidéos locales).
 */
export type ProductStory = {
  id: string;
  videoUrl: string;
  posterUrl: string;
  title?: string;
  shopProductHandle?: string;
  // Résolu côté serveur en prod ; embarqué ici pour la démo
  shop?: { price: number; href: string; name: string };
};

export const DEMO_STORIES: ProductStory[] = [
  {
    id: "vanilla-voyage",
    videoUrl: "/assets/videos/vanilla-voyage.mp4",
    posterUrl: "/assets/prod-1.jpg",
    title: "Vanilla Voyage",
    shopProductHandle: "vanilla-voyage",
    shop: { price: 59, href: "/promo-flash", name: "Vanilla Voyage" },
  },
  {
    id: "reef-33",
    videoUrl: "/assets/videos/reef33.mp4",
    posterUrl: "/assets/reef/reef33.jpg",
    title: "Reef 33",
  },
  {
    id: "oud-roses",
    videoUrl: "/assets/videos/oud-roses.mp4",
    posterUrl: "/assets/prod-2.jpg",
    title: "Oud & Roses",
  },
  {
    id: "aurum",
    videoUrl: "/assets/videos/aurum-v4.mp4",
    posterUrl: "/assets/prod-4.jpg",
    title: "Aurum",
    shopProductHandle: "aurum",
    shop: { price: 49, href: "/promo-flash", name: "Aurum" },
  },
  {
    // Khamrah : la coulée d'ambre sur le flacon dit le côté gourmand du parfum
    // mieux qu'une ligne de notes. Poster extrait de la vidéo elle-même, sur
    // une image où l'étiquette dorée est lisible — la 1re frame est une macro
    // sombre qui ne laisse pas reconnaître le produit dans la bulle.
    id: "khamrah-nectar",
    videoUrl: "/assets/videos/khamrah-nectar.mp4",
    posterUrl: "/assets/videos/khamrah-nectar-poster.webp",
    title: "Khamrah",
    shopProductHandle: "lattafa-khamrah",
    shop: { price: 21.9, href: "/produit/lattafa-khamrah", name: "Khamrah" },
  },
  {
    id: "khamrah-dattes",
    videoUrl: "/assets/videos/khamrah-dattes.mp4",
    posterUrl: "/assets/videos/khamrah-dattes-poster.webp",
    title: "Khamrah · Datte",
    shopProductHandle: "lattafa-khamrah",
    shop: { price: 21.9, href: "/produit/lattafa-khamrah", name: "Khamrah" },
  },
];
