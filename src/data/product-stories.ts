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
    posterUrl: "/assets/videos/vanilla-voyage-poster.webp",
    title: "Vanilla Voyage",
    shopProductHandle: "vanilla-voyage",
    shop: { price: 59, href: "/promo-flash", name: "Vanilla Voyage" },
  },
  {
    id: "reef-33",
    videoUrl: "/assets/videos/reef33.mp4",
    posterUrl: "/assets/videos/reef33-poster.webp",
    title: "Reef 33",
    shopProductHandle: "reef-33",
    shop: { price: 49.9, href: "/produit/reef-33", name: "Reef 33" },
  },
  {
    id: "oud-roses",
    videoUrl: "/assets/videos/oud-roses.mp4",
    posterUrl: "/assets/videos/oud-roses-poster.webp",
    title: "Oud & Roses",
    shopProductHandle: "oud-roses",
    shop: { price: 79.9, href: "/produit/oud-roses", name: "Oud & Roses" },
  },
  {
    id: "aurum",
    videoUrl: "/assets/videos/aurum-v4.mp4",
    posterUrl: "/assets/videos/aurum-poster.webp",
    title: "Aurum",
    shopProductHandle: "aurum",
    shop: { price: 49, href: "/promo-flash", name: "Aurum" },
  },
  {
    // Nouvelle prise de vue Higgsfield — le flacon reste immobile et net pendant
    // que la lumière chaude tourne et qu'une main soulève le capuchon : c'est le
    // seul plan qui découvre le vaporisateur, et le plus « porté » des cinq.
    // Placé en tête : la fiche produit ne garde qu'une bulle par référence, elle
    // prend la première — autant que ce soit celle où le flacon se reconnaît le mieux.
    id: "khamrah-geste",
    videoUrl: "/assets/videos/khamrah-hf-05.mp4",
    posterUrl: "/assets/products/khamrah/khamrah-poster.jpg",
    title: "Khamrah",
    shopProductHandle: "lattafa-khamrah",
    shop: { price: 21.9, href: "/produit/lattafa-khamrah", name: "Khamrah" },
  },
  {
    // La coulée d'ambre sur le flacon dit le côté gourmand du parfum mieux
    // qu'une ligne de notes. Nouvelle prise de vue : le plan reste macro, mais
    // l'étiquette dorée y est lisible du début à la fin — l'ancienne version
    // ouvrait sur une macro sombre où le produit n'était pas reconnaissable.
    id: "khamrah-nectar",
    videoUrl: "/assets/videos/khamrah-hf-03.mp4",
    posterUrl: "/assets/products/khamrah/khamrah-poster.jpg",
    title: "Khamrah",
    shopProductHandle: "lattafa-khamrah",
    shop: { price: 21.9, href: "/produit/lattafa-khamrah", name: "Khamrah" },
  },
  {
    // « Fiole fixe » : le flacon reste net sur sa pierre sombre pendant que le
    // décor (bâton de cannelle, poussière d'épices) bouge autour. C'est le plan
    // qui montre le mieux CE flacon-là.
    id: "khamrah-fiole-fixe",
    videoUrl: "/assets/videos/khamrah-hf-04.mp4",
    posterUrl: "/assets/products/khamrah/khamrah-poster.jpg",
    title: "Khamrah · Fiole fixe",
    shopProductHandle: "lattafa-khamrah",
    shop: { price: 21.9, href: "/produit/lattafa-khamrah", name: "Khamrah" },
  },
  {
    // La datte ouverte puis le sirop qu'on en tire : la note de tête montrée
    // par son ingrédient plutôt qu'écrite. Le seul des cinq plans où le flacon
    // n'est pas le sujet — d'où sa place en fin de rangée.
    id: "khamrah-dattes",
    videoUrl: "/assets/videos/khamrah-hf-01.mp4",
    posterUrl: "/assets/products/khamrah/khamrah-poster.jpg",
    title: "Khamrah · Datte",
    shopProductHandle: "lattafa-khamrah",
    shop: { price: 21.9, href: "/produit/lattafa-khamrah", name: "Khamrah" },
  },
];
