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
    // Une bulle fait 72 px de diamètre et elle est ronde : le seul critère qui
    // survit à ce cadrage est « le flacon remplit-il l'image du début à la
    // fin ». `-05` est la seule des six où c'est vrai — `-01` ouvre sur une
    // route, `-02` sur une coulée de caramel, `-06` finit en blanc surexposé.
    // Le rendu de juin, lui, montrait un plan sur cinq où le flacon était
    // entier, le reste étant du coffret et des mains.
    // NB : `href` pointe sur /promo-flash quand la carte du carrousel
    // (`shoppable-videos.ts`) pointe sur /produit/vanilla-voyage — deux
    // destinations en dur pour le même parfum, à trancher.
    id: "vanilla-voyage",
    videoUrl: "/assets/videos/vanilla-voyage-hf-05.mp4",
    posterUrl: "/assets/videos/vanilla-voyage-hf-05-poster.jpg",
    title: "Vanilla Voyage",
    shopProductHandle: "vanilla-voyage",
    shop: { price: 59, href: "/promo-flash", name: "Vanilla Voyage" },
  },
  {
    // La route sous la brume, la matière, le flacon. Trop lent pour tenir dans
    // un cercle de 72 px, mais c'est le récit du parfum : il a sa place ici,
    // en second, là où la fiche ne prend qu'une bulle par référence et où le
    // lecteur plein écran, lui, laisse au plan le temps d'exister.
    id: "vanilla-voyage-route",
    videoUrl: "/assets/videos/vanilla-voyage-hf-01.mp4",
    posterUrl: "/assets/videos/vanilla-voyage-hf-01-poster.jpg",
    title: "Vanilla Voyage · Le voyage",
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
    // En tête depuis l'arrivée des seize films : la fiche produit ne garde
    // qu'une bulle par référence et prend la première, donc cette position
    // décide de ce que Khamrah montre dans la rangée. Sur les seize, un seul
    // plan met le parfum entre des mains — celui-ci, où des doigts ornés de
    // henné se referment sur le flacon avant la macro de l'étiquette. Une
    // rangée de bulles est une rangée de flacons posés ; celle-ci ne l'est pas.
    id: "khamrah-porte",
    videoUrl: "/assets/videos/khamrah-hf-14.mp4",
    posterUrl: "/assets/videos/khamrah-hf-14-poster.jpg",
    title: "Khamrah · Porté",
    shopProductHandle: "lattafa-khamrah",
    shop: { price: 21.9, href: "/produit/lattafa-khamrah", name: "Khamrah" },
  },
  {
    // Nouvelle prise de vue Higgsfield — le flacon reste immobile et net pendant
    // que la lumière chaude tourne et qu'une main soulève le capuchon : c'est le
    // seul plan qui découvre le vaporisateur. Il a tenu la tête tant que rien ne
    // montrait le parfum porté ; `khamrah-porte` fait mieux sur ce terrain, mais
    // ce plan-ci reste le seul à dire comment le flacon s'ouvre.
    id: "khamrah-geste",
    videoUrl: "/assets/videos/khamrah-hf-05.mp4",
    posterUrl: "/assets/products/khamrah/khamrah-poster.jpg",
    title: "Khamrah",
    shopProductHandle: "lattafa-khamrah",
    shop: { price: 21.9, href: "/produit/lattafa-khamrah", name: "Khamrah" },
  },
  {
    // La cristallerie : la verrière de l'atelier, le bloc de verre sous la
    // meule, les cannelures qu'on taille, puis le flacon rempli et son
    // étiquette. Le seul film qui remonte avant le produit fini — c'est ce
    // qu'un récit peut faire et qu'une case de la bande, qui n'a de place que
    // pour quatre rôles déjà nommés, ne peut pas.
    id: "khamrah-atelier",
    videoUrl: "/assets/videos/khamrah-hf-11.mp4",
    posterUrl: "/assets/videos/khamrah-hf-11-poster.jpg",
    title: "Khamrah · L'atelier",
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
