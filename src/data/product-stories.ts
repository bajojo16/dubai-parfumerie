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
    posterUrl: "/assets/prod-3.jpg",
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
];
