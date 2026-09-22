/**
 * Article — billets du "Journal du Parfum" (section blog magazine).
 * En production : alimenté par un CMS headless ; ici données démo (images locales).
 */
/**
 * Un chapitre d'article « produit » : un titre, une image légendée, des
 * paragraphes. Le rendu éditorial (`/blog/[slug]`) en fait une `<section id>`
 * ancrée depuis le sommaire — d'où l'`id` obligatoire.
 */
export type ArticleChapter = {
  id: string;
  title: string;
  /** Surtitre discret au-dessus du H2 — « Chapitre 1 · L'ouverture ». */
  kicker?: string;
  paragraphs: string[];
  image: string;
  imageAlt: string;
  caption?: string;
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string; // CULTURE | GUIDE | EXPERTISE | CONSEILS | PORTRAIT ...
  readingMinutes: number;
  coverImage: string;
  href: string;
  /**
   * « produit » = portrait d'un flacon, rendu en mise en page magazine
   * (chapitres + colonne d'achat qui suit la lecture). Absent ou « culture » :
   * billet classique, rendu inchangé.
   */
  kind?: "produit" | "culture";
  /** Slug de la fiche `/produit/[slug]` dont l'article est le portrait. */
  productSlug?: string;
  subtitle?: string;
  /** Date ISO (AAAA-MM-JJ) — formatée en français côté rendu. */
  publishedAt?: string;
  chapters?: ArticleChapter[];
  /** Trois conseils courts — encadré « Comment le porter ». */
  howToWear?: string[];
  /** Anecdote — encadré « Le saviez-vous ? ». */
  didYouKnow?: string;
};

export const DEMO: Article[] = [
  {
    slug: "khamrah-ivresse-de-la-datte",
    title: "Khamrah, l'ivresse de la datte",
    subtitle:
      "Trois chapitres pour comprendre le gourmand oriental le plus vendu de Lattafa — et savoir comment le porter.",
    excerpt:
      "Datte confite, praline, encens : trois chapitres pour comprendre le gourmand oriental le plus vendu de Lattafa — et savoir comment le porter.",
    category: "PORTRAIT",
    kind: "produit",
    productSlug: "lattafa-khamrah",
    readingMinutes: 4,
    publishedAt: "2026-09-22",
    coverImage: "/assets/products/khamrah/khamrah-lit-dattes.webp",
    href: "/blog/khamrah-ivresse-de-la-datte",
    chapters: [
      {
        id: "ouverture",
        kicker: "Chapitre 1 · L'ouverture",
        title: "L'ouverture",
        paragraphs: [
          "Dès la première pulvérisation, Khamrah ne cherche pas la discrétion. La datte, charnue et confite, ouvre la scène comme on entre dans un souk à la tombée du jour : chaleur, sucre et poussière d'épices. La cannelle vient aussitôt la frotter, sèche et piquante, tandis qu'une bergamote furtive apporte l'éclat nécessaire pour que l'ensemble ne s'alourdisse pas.",
          "La muscade, plus en retrait, joue le rôle du poivre dans une pâtisserie orientale : elle réveille. Cette ouverture dure une bonne demi-heure, le temps de comprendre que ce n'est pas un gourmand comme les autres, mais une liqueur d'épices.",
        ],
        image: "/assets/products/khamrah/khamrah-dattes-epices.webp",
        imageAlt: "Dattes et bâtons de cannelle autour du flacon Khamrah",
        caption: "Datte, cannelle, bergamote, muscade : les notes de tête de Khamrah.",
      },
      {
        id: "coeur",
        kicker: "Chapitre 2 · Le cœur",
        title: "Le cœur",
        paragraphs: [
          "Passé le premier quart d'heure, la praline prend le relais et arrondit tout. On glisse vers quelque chose de plus crémeux, presque pâtissier, où la fève tonka et la vanille se partagent la lumière sans jamais tomber dans la sucrerie.",
          "Puis vient la fleur d'oranger, presque inattendue, qui aère ce cœur dense d'une touche de miel et de peau propre. C'est elle qui rend Khamrah portable en journée : elle ouvre une fenêtre dans la pâtisserie.",
        ],
        image: "/assets/products/khamrah/khamrah-plateau-laiton.webp",
        imageAlt: "Flacon Khamrah sur un plateau de laiton",
        caption: "Praline, fève tonka, vanille, fleur d'oranger : le cœur.",
      },
      {
        id: "fond",
        kicker: "Chapitre 3 · Le fond",
        title: "Le fond",
        paragraphs: [
          "Le fond arrive lentement et reste longtemps. Le benjoin et le bois de santal installent un socle résineux et lacté ; l'ambre gris lui donne cette chaleur salée qui accroche la peau et fait durer le parfum jusqu'au lendemain.",
          "La myrrhe et l'encens, enfin, signent la partie la plus orientale du parfum : une fumée douce, presque sacrée, qui transforme la gourmandise en méditation. C'est dans ce fond que Khamrah se distingue nettement de ses cousins de niche.",
        ],
        image: "/assets/products/khamrah/khamrah-encens.webp",
        imageAlt: "Flacon Khamrah dans une volute d'encens",
        caption: "Benjoin, santal, ambre gris, myrrhe, encens : le fond.",
      },
    ],
    howToWear: [
      "La dose : 1 à 2 pulvérisations sur les vêtements pour la journée, 3 sur la peau pour le soir.",
      "La saison : d'octobre à mars, quand le froid retient la datte et l'encens près de vous.",
      "L'accord : évitez le layering sucré ; une huile de parfum ambrée suffit à prolonger le fond.",
    ],
    didYouKnow:
      "« Khamrah » (خمرة) signifie « ivresse » en arabe : le nom dit l'accord liquoreux de l'ouverture. Sorti en 2022, le parfum est devenu en deux hivers l'un des best-sellers de la maison Lattafa, fabriqué à Dubaï.",
  },
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
