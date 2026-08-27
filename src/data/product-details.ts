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
}

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
};
