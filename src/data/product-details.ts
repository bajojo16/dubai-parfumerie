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
  /**
   * Une phrase — et une seule — rappelant la viralité du flacon sur les
   * réseaux sociaux et la ressemblance recherchée par les visiteurs.
   *
   * Champ séparé plutôt que concaténé dans `description` pour trois raisons :
   * la description reste un texte purement olfactif (réutilisé tronqué dans le
   * JSON-LD et la meta `description`, où une accroche sociale n'a rien à
   * faire) ; la fiche peut donner à cette phrase son propre traitement
   * typographique et sa mention légale ; et une entrée sans note documentée
   * n'affiche simplement rien.
   *
   * RÈGLE : un original de luxe n'est NOMMÉ que si `olfactive-twins.ts`
   * établit le rapprochement pour CE slug (`productHandle`). Sinon la phrase
   * parle d'« un grand classique » sans le nommer. Vocabulaire imposé —
   * « inspiré de », « rappelle », « dans le sillage de » ; jamais « copie »,
   * « identique » ou « même parfum que ».
   */
  viralNote?: string;
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
    viralNote:
      "Régulièrement partagé sur les réseaux sociaux, il y est recherché pour sa ressemblance avec un grand classique de la rose orientale, dont il rappelle le sillage sans jamais s'en réclamer.",
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
    viralNote:
      "Largement relayé sur les réseaux sociaux, Amber Oud y est recherché pour sa parenté avec Tom Ford · Oud Wood, dans le sillage duquel il inscrit son oud fumé, son santal et son poivre.",
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
    viralNote:
      "Très commenté sur les réseaux sociaux, il doit une part de son succès à sa ressemblance avec un grand classique aquatique, dont il rappelle la fraîcheur sans prétendre s'y substituer.",
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
    viralNote:
      "Porté par les réseaux sociaux depuis plusieurs saisons, il y est recherché pour sa ressemblance avec un grand classique fruité-fumé de la parfumerie occidentale, dont il rappelle l'ouverture à l'ananas sans jamais s'en réclamer.",
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
    viralNote:
      "Devenu un habitué des vidéos de parfumerie sur les réseaux sociaux, il y est recherché pour sa ressemblance avec un grand classique de l'accord oud-rose, dont il rappelle la profondeur sans prétendre l'égaler.",
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
    viralNote:
      "Repéré puis largement relayé sur les réseaux sociaux, il y est recherché pour sa ressemblance avec un grand classique boisé-épicé, dont il rappelle l'ampleur sans jamais s'en réclamer.",
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
    viralNote:
      "Devenu l'un des flacons les plus commentés des réseaux sociaux, Khamrah y est aussi recherché pour son sillage inspiré de Kilian · Angels' Share, dont il rappelle l'accord cognac, cannelle et fève tonka.",
    topNotes: ["Datte", "Cannelle", "Bergamote", "Muscade"],
    heartNotes: ["Praline", "Fève tonka", "Vanille", "Fleur d'oranger"],
    baseNotes: ["Benjoin", "Bois de santal", "Ambre gris", "Myrrhe", "Encens"],
    badges: ["Tenue 24h", "EDP 30%", "Fabriqué à Dubaï", "Authenticité garantie"],
    // Nouveau packshot de référence : trois quarts sur fond clair, cadré serré,
    // carré. L'ancien (`khamrah-packshot.webp`) était un portrait où le flacon
    // n'occupait que la moitié de la hauteur — illisible partout où ce champ est
    // réduit (vignette panier 68 px, jumeau olfactif 116 px en `contain`).
    image: "/assets/products/khamrah/khamrah-hf-05.jpg",
    // Neuf vues volontairement distinctes, du produit vers son univers :
    // six prises de vue studio du flacon (trois quarts, face, contre-plongée,
    // plongée, puis deux macros matière — l'étiquette gravée et le cristal où
    // le jus fait ses bulles), le coffret, et enfin les deux mises en scène qui
    // montrent la pyramide (lit de dattes, encens) plutôt que de la décrire.
    // `gallery[0]` reprend `image` — c'est la vue ouverte par défaut.
    gallery: [
      "/assets/products/khamrah/khamrah-hf-05.jpg",
      "/assets/products/khamrah/khamrah-hf-02.jpg",
      "/assets/products/khamrah/khamrah-hf-09.jpg",
      "/assets/products/khamrah/khamrah-hf-06.jpg",
      "/assets/products/khamrah/khamrah-hf-03.jpg",
      "/assets/products/khamrah/khamrah-hf-04.jpg",
      "/assets/products/khamrah/khamrah-coffret.webp",
      "/assets/products/khamrah/khamrah-lit-dattes.webp",
      "/assets/products/khamrah/khamrah-encens.webp",
    ],
  },
  "arabiyat-prestige-blueberry-musk": {
    name: "Blueberry Musk",
    brand: "Arabiyat Prestige",
    // Prix promotionnel demandé pour cette référence (20,00 € au lieu de 25,00 €).
    price: 20.0,
    oldPrice: 25.0,
    // Note et nombre d'avis de démonstration, comme les autres fiches rédigées
    // de ce fichier : le repo n'a pas de base d'avis: valeurs stables, pas tirées
    // au hasard, pour que le JSON-LD ne change pas d'un rendu à l'autre.
    rating: 4.7,
    reviews: 214,
    // Pas de « EDP 30% » ici : les six premières fiches l'affichent, mais aucune
    // source ne donne le taux de concentration de cette référence — on s'en tient
    // au libellé que `product-resolve.ts` utilise déjà par défaut.
    concentration: "Eau de parfum",
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Blueberry Musk s'ouvre sur une myrtille pleine et froide, cueillie plutôt que confite : la baie garde son acidité, tenue par un trait de fruits rouges qui l'empêche de tourner au sirop. Le cœur la laisse fondre — le musc blanc arrive, laiteux, presque poudré, et pose sur le fruit ce voile de peau propre qui fait toute la signature du parfum. Le fond ne cherche pas la démonstration : une vanille discrète et des bois blancs prolongent l'accord, tiède et enveloppant, longtemps après que la myrtille s'est effacée. Un gourmand fruité qui reste net, porté par un flacon bleu translucide veiné d'arabesques dorées.",
    viralNote:
      "Très partagé sur les réseaux sociaux, où son accord myrtille-musc — rare dans la parfumerie du Golfe — lui vaut d'être cherché nommément plutôt que rapproché d'un grand classique.",
    topNotes: ["Myrtille", "Fruits rouges", "Cassis"],
    heartNotes: ["Musc blanc", "Fleurs blanches", "Framboise"],
    baseNotes: ["Vanille", "Bois blancs", "Musc"],
    // Badges calés sur la convention de `product-resolve.ts` (famille, forme,
    // origine, garantie) plutôt que sur le « Tenue 24h / EDP 30% » des six
    // premières fiches : deux promesses qu'aucune source ne documente ici.
    badges: ["Ambré · gourmand", "Eau de parfum", "Fabriqué à Dubaï", "Authenticité garantie"],
    image: "/assets/products/blueberry/blueberry-packshot.jpg",
    // Packshot d'abord (vue par défaut, reprise en vignette de carte), puis les
    // trois mises en scène qui montrent la pyramide : la baie fraîche, la coulée
    // de myrtilles écrasées pour le côté gourmand, la glace pour la fraîcheur.
    gallery: [
      "/assets/products/blueberry/blueberry-packshot.jpg",
      "/assets/products/blueberry/blueberry-myrtilles.jpg",
      "/assets/products/blueberry/blueberry-coulee.jpg",
      "/assets/products/blueberry/blueberry-glace.jpg",
    ],
  },
  "arabiyat-prestige-marwa": {
    name: "Marwa",
    brand: "Arabiyat Prestige",
    // Aucun prix imposé pour cette référence : calé au milieu de la fourchette
    // du catalogue (Khamrah 21,90 € … Reef 33 49,90 €), au-dessus du prix promo
    // de Blueberry Musk puisque le flacon est le format « prestige » facetté.
    // Prix barré au ratio des autres fiches (~-25 %).
    price: 29.9,
    oldPrice: 39.9,
    rating: 4.7,
    reviews: 96,
    concentration: "Eau de parfum",
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Marwa est un floral blanc tenu à distance du bouquet sucré. La fleur d'oranger ouvre, verte et amère comme au petit matin, avant que le jasmin ne prenne le relais et n'apporte la chair — solaire, un peu miellée, jamais capiteuse. Puis vient la poudre : un musc soyeux étire le bouquet, l'assourdit, et le pose sur des bois blancs très clairs qui tiennent l'ensemble sans le boiser. Il en reste un sillage net et lumineux, du linge repassé plus que de la fleur coupée, à l'image du flacon d'argent facetté et de son bouchon taillé en pointe de diamant.",
    topNotes: ["Fleur d'oranger", "Néroli", "Poire"],
    heartNotes: ["Jasmin", "Fleurs blanches", "Iris"],
    baseNotes: ["Musc blanc", "Bois blancs", "Ambre clair"],
    badges: ["Floral", "Eau de parfum", "Fabriqué à Dubaï", "Authenticité garantie"],
    image: "/assets/products/marwa/marwa-packshot.jpg",
    // Deux vues seulement en banque : le packshot (fond clair, fleurs blanches)
    // et la mise en scène sur cristaux de quartz, qui dit la facette poudrée.
    gallery: [
      "/assets/products/marwa/marwa-packshot.jpg",
      "/assets/products/marwa/marwa-cristaux.jpg",
    ],
  },
};
