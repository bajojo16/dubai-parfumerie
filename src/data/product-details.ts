/**
 * Fiches produit détaillées — source unique.
 *
 * Extrait de `app/[locale]/produit/[slug]/page.tsx` pour être partagé avec la
 * recherche (`search-catalog.ts`), qui a besoin des notes, de la concentration
 * et de la contenance pour rendre sa fiche quand une seule référence répond.
 * En production : résolu depuis le catalogue serveur via `slug`.
 */

export interface Product {
  name: string;
  brand: string;
  price: number;
  oldPrice: number;
  rating: number;
  reviews: number;
  concentration: string;
  volume: string;
  origin: string;
  description: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  badges: string[];
  image?: string;
  /**
   * Visuels supplémentaires, quand la banque photo en fournit plusieurs pour CE
   * flacon (packshot, coffret, mises en scène, gros plans matière). Optionnel :
   * la fiche affiche une galerie à vignettes seulement si le tableau contient
   * plus d'une image, sinon elle retombe sur le cadre simple. Par convention
   * `gallery[0]` reprend `image` — c'est la vue ouverte par défaut.
   */
  gallery?: string[];
  /**
   * Le « nez » qui signe la composition. Optionnel, et il le restera pour la
   * quasi-totalité du catalogue : les maisons du Golfe ne créditent presque
   * jamais leurs parfumeurs. Un nom n'entre ici que s'il est explicitement
   * attribué À CE parfum par une source publique — voir `PERFUMERS`.
   */
  perfumer?: string;
}

/**
 * Parfumeurs attribués, par slug de fiche.
 *
 * Table séparée parce que la seule attribution vérifiée concerne une référence
 * composée depuis le catalogue (`search-catalog.ts`), pas une des fiches
 * rédigées ci-dessous : `product-resolve.ts` la consulte pour les deux chemins.
 *
 * Règle : aucun nom déduit d'une habitude de la maison ou d'une ressemblance
 * olfactive. Il faut une attribution nominale pour CE parfum, avec sa source.
 */
export const PERFUMERS: Record<string, string> = {
  // Reef 33 (Reef Perfumes, 2020) — nez crédité par Fragrantica :
  // https://www.fragrantica.com/perfume/Reef-Perfumes/Reef-33-89358.html
  // Recoupé par sa fiche de parfumeur (CPL Aromas Dubaï), qui liste Reef :
  // https://www.fragrantica.com/noses/Kevin_Mathys.html
  "reef-33": "Kevin Mathys",
};

export const PRODUCTS: Record<string, Product> = {
  "lattafa-oud-pour-elle": {
    name: "Oud Pour Elle",
    brand: "Lattafa",
    price: 54.9,
    oldPrice: 74.9,
    rating: 4.8,
    reviews: 312,
    concentration: "EDP 30%",
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Oud Pour Elle est une ode à la féminité orientale. Dès les premières secondes, la rose damascène déploie ses pétales sur un accord de safran précieux, avant de laisser place à un cœur velouté de musc blanc et de jasmin. En fond, le bois de oud sombre et l'ambre crémeux assurent une tenue exceptionnelle, laissant sur la peau un sillage envoûtant pendant plus de vingt-quatre heures.",
    topNotes: ["Rose damascène", "Safran", "Bergamote"],
    heartNotes: ["Musc blanc", "Jasmin", "Iris"],
    baseNotes: ["Oud", "Ambre", "Santal blanc", "Vanille"],
    badges: ["Tenue 24h", "EDP 30%", "Fabriqué à Dubaï", "Authenticité garantie"],
    // Pas de photo de ce flacon en banque : visuel générique conservé (à remplacer).
    image: "/assets/prod-1.jpg",
  },
  "al-haramain-amber-oud": {
    name: "Amber Oud",
    brand: "Al Haramain",
    price: 68.0,
    oldPrice: 89.0,
    rating: 4.9,
    reviews: 487,
    concentration: "EDP 30%",
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Amber Oud est l'expression pure du luxe arabe. L'ouverture explosive de cardamome et de poivre noir cède rapidement la place à un cœur riche en oud royal et en rose de Taïf. La base ambrée, généreusement chargée de résines précieuses et de musc chaud, fait de ce parfum une signature olfactive inoubliable, portée par des personnalités qui revendiquent leur singularité.",
    topNotes: ["Cardamome", "Poivre noir", "Citron"],
    heartNotes: ["Oud royal", "Rose de Taïf", "Encens"],
    baseNotes: ["Ambre", "Résine de benjoin", "Musc chaud", "Vétiver"],
    badges: ["Tenue 24h", "EDP 30%", "Fabriqué à Dubaï", "Authenticité garantie"],
    // Pas de photo de ce flacon en banque : visuel générique conservé (à remplacer).
    image: "/assets/prod-2.jpg",
  },
  "reef-opulent-blue": {
    name: "Opulent Blue",
    brand: "Reef",
    price: 42.5,
    oldPrice: 59.9,
    rating: 4.6,
    reviews: 198,
    concentration: "EDP 30%",
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Opulent Blue s'ouvre sur une fraîcheur marine iodée, comme une brise venue du Golfe Persique. Des accords aquatiques de concombre et de menthe poivrée évoluent vers un cœur floral délicat — jasmin et muguet — avant de plonger dans une base boisée de cèdre et d'ambre gris. Un parfum à la fois contemporain et ancré dans la tradition des maisons du Golfe.",
    topNotes: ["Marine", "Concombre", "Menthe poivrée"],
    heartNotes: ["Jasmin", "Muguet", "Patchouli"],
    baseNotes: ["Cèdre", "Ambre gris", "Musc bleu"],
    badges: ["Tenue 24h", "EDP 30%", "Fabriqué à Dubaï", "Authenticité garantie"],
    // Pas de photo de ce flacon en banque : visuel générique conservé (à remplacer).
    image: "/assets/prod-3.jpg",
  },
  "armaf-club-de-nuit": {
    name: "Club de Nuit",
    brand: "Armaf",
    price: 49.9,
    oldPrice: 65.0,
    rating: 4.7,
    reviews: 623,
    concentration: "EDP 30%",
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Club de Nuit est un fougère oriental d'une intensité rare. Son ouverture hespéridée et fruitée — ananas, citron bergamote — se mue rapidement en un bouquet floral masculin de rose et de jasmin. La base boisée et fumée, portée par le bouleau birch et le musc, confère à ce parfum une personnalité affirmée, idéale pour les soirées où l'on veut marquer les esprits durablement.",
    topNotes: ["Ananas", "Citron bergamote", "Pomme"],
    heartNotes: ["Rose", "Jasmin", "Patchouli"],
    baseNotes: ["Bouleau birch", "Musc", "Ambre", "Cèdre"],
    badges: ["Tenue 24h", "EDP 30%", "Fabriqué à Dubaï", "Authenticité garantie"],
    // Pas de photo de ce flacon en banque : visuel générique conservé (à remplacer).
    image: "/assets/prod-4.jpg",
  },
  "swiss-arabian-shaghaf": {
    name: "Shaghaf Oud",
    brand: "Swiss Arabian",
    price: 59.0,
    oldPrice: 79.9,
    rating: 4.8,
    reviews: 274,
    concentration: "EDP 30%",
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Shaghaf Oud incarne l'héritage olfactif des grandes maisons arabes fondées à Dubaï. Une ouverture de safran et d'épices rares introduit un cœur dense en oud cambodi et rose orientale. La base de santal crémeux, de musc et de résines anciennes crée un fond enveloppant et sensuel qui évolue merveilleusement sur la peau au fil des heures, révélant des facettes toujours plus profondes.",
    topNotes: ["Safran", "Épices", "Rose"],
    heartNotes: ["Oud cambodi", "Rose orientale", "Fleur d'oranger"],
    baseNotes: ["Santal crémeux", "Musc", "Résines", "Labdanum"],
    badges: ["Tenue 24h", "EDP 30%", "Fabriqué à Dubaï", "Authenticité garantie"],
    image: "/assets/products/shaghaf-oud.webp",
  },
  "ahmed-al-maghribi-lor": {
    name: "L'Or de Saba",
    brand: "Ahmed Al Maghribi",
    price: 78.0,
    oldPrice: 105.0,
    rating: 4.9,
    reviews: 156,
    concentration: "EDP 30%",
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "L'Or de Saba est un joyau de parfumerie orientale qui rend hommage à la Route des épices. Dès l'ouverture, le safran royal et le poivre de Sichuan créent une explosion épicée et lumineuse. Le cœur révèle un oud précieux rehaussé de fleurs sauvages de Saba, tandis que la base de résines dorées, d'encens et de musc boisé dépose un voile somptueux, digne des palais du Golfe.",
    topNotes: ["Safran royal", "Poivre de Sichuan", "Bergamote"],
    heartNotes: ["Oud précieux", "Fleurs de Saba", "Absolu de rose"],
    baseNotes: ["Résines dorées", "Encens", "Musc boisé", "Ambre"],
    badges: ["Tenue 24h", "EDP 30%", "Fabriqué à Dubaï", "Authenticité garantie"],
    // Pas de photo de ce flacon en banque : visuel générique conservé (à remplacer).
    image: "/assets/prod-6.jpg",
  },
  "lattafa-khamrah": {
    name: "Khamrah",
    brand: "Lattafa",
    // Prix aligné sur ce que le repo affiche déjà pour cette référence
    // (`olfactive-twins.ts`, « dès 21,90 € ») : deux prix différents pour le
    // même flacon sur deux pages du site, c'est le genre d'incohérence qu'on
    // ne rattrape jamais. Prix barré calé sur le ratio des autres fiches (~-27 %).
    price: 21.9,
    oldPrice: 29.9,
    rating: 4.8,
    reviews: 891,
    concentration: "EDP 30%",
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Khamrah — « l'ivresse » en arabe — est le gourmand oriental qui a fait basculer Lattafa dans une autre dimension depuis sa sortie en 2022. Tout commence sur une datte confite, réchauffée de cannelle et de muscade, que la bergamote empêche de tourner au sirop. Le cœur s'épaissit alors : praline, fève tonka et vanille se fondent en un accord de pâtisserie orientale, adouci d'une fleur d'oranger discrète. Puis vient le fond, et Khamrah cesse d'être un dessert : benjoin résineux, bois de santal, ambre gris et une volute de myrrhe et d'encens installent une profondeur presque cérémonielle, qui tient sur la peau — et surtout sur les vêtements — bien après la fin de la soirée.",
    topNotes: ["Datte", "Cannelle", "Bergamote", "Muscade"],
    heartNotes: ["Praline", "Fève tonka", "Vanille", "Fleur d'oranger"],
    baseNotes: ["Benjoin", "Bois de santal", "Ambre gris", "Myrrhe", "Encens"],
    badges: ["Tenue 24h", "EDP 30%", "Fabriqué à Dubaï", "Authenticité garantie"],
    image: "/assets/products/khamrah/khamrah-packshot.webp",
    // Six vues volontairement distinctes : flacon seul, coffret, mise en scène
    // épicée, ambiance orientale, puis deux gros plans matière (dattes, encens)
    // qui montrent la pyramide plutôt que de la décrire.
    gallery: [
      "/assets/products/khamrah/khamrah-packshot.webp",
      "/assets/products/khamrah/khamrah-coffret.webp",
      "/assets/products/khamrah/khamrah-dattes-epices.webp",
      "/assets/products/khamrah/khamrah-plateau-laiton.webp",
      "/assets/products/khamrah/khamrah-lit-dattes.webp",
      "/assets/products/khamrah/khamrah-encens.webp",
    ],
  },
};
