/**
 * Article — billets du "Journal du Parfum" (section blog magazine).
 * En production : alimenté par un CMS headless ; ici données démo (images locales).
 */
export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string; // CULTURE | GUIDE | EXPERTISE | CONSEILS ...
  readingMinutes: number;
  coverImage: string;
  href: string;
};

export const DEMO: Article[] = [
  {
    slug: "oud-or-liquide-orient",
    title: "L'Oud, l'or liquide de l'Orient",
    excerpt:
      "Du cœur résineux de l'agar aux flacons les plus précieux : voyage au pays du bois sacré, sa récolte rare et son sillage envoûtant.",
    category: "CULTURE",
    readingMinutes: 8,
    coverImage: "/assets/popup-oud-roses.jpg",
    href: "/blog/oud-or-liquide-orient",
  },
  {
    slug: "choisir-premier-parfum-oriental",
    title: "Composer sa signature orientale",
    excerpt:
      "Musc, ambre, rose de Taïf ou safran ? Nos experts vous guident pas à pas pour trouver l'accord qui vous ressemble.",
    category: "GUIDE",
    readingMinutes: 5,
    coverImage: "/assets/cat-femme.jpg",
    href: "/blog/choisir-premier-parfum-oriental",
  },
  {
    slug: "art-du-layering-oriental",
    title: "L'art du layering oriental",
    excerpt:
      "Superposer huile de parfum et eau de parfum pour un sillage sur-mesure qui tient du matin au soir.",
    category: "EXPERTISE",
    readingMinutes: 6,
    coverImage: "/assets/cat-homme.jpg",
    href: "/blog/art-du-layering-oriental",
  },
  {
    slug: "conserver-ses-parfums",
    title: "Préserver l'éclat de vos parfums",
    excerpt:
      "Lumière, chaleur, oxygène : les gestes simples pour prolonger la vie de vos fragrances les plus précieuses.",
    category: "CONSEILS",
    readingMinutes: 4,
    coverImage: "/assets/cat-mixte.jpg",
    href: "/blog/conserver-ses-parfums",
  },
];
