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
    // Trois vues : le packshot, puis la reprise du même cadrage avec les fleurs
    // blanches posées au pied du flacon — la fiche vend un floral blanc, et
    // c'est le seul visuel qui le montre —, enfin les cristaux de quartz, qui
    // disent la facette poudrée. Les deux packshots nus restants ne changent
    // que d'angle : une galerie qui répète le même plan fatigue pour rien.
    gallery: [
      "/assets/products/marwa/marwa-packshot.jpg",
      "/assets/products/marwa/marwa-hf-01.jpg",
      "/assets/products/marwa/marwa-cristaux.jpg",
    ],
  },
  "paris-corner-rifaaqat": {
    name: "Rifaaqat",
    brand: "Paris Corner",
    // Prix et prix barré repris tels quels de l'entrée que `search-catalog.ts`
    // portait en attendant cette fiche, pour ne pas créer un troisième chiffre
    // sur un flacon qui n'en avait aucun : ils s'appuient sur le seul repère
    // Paris Corner du dépôt, Marshmallow Blush à 39,50 € dans le rail promo.
    price: 39.9,
    oldPrice: 52.9,
    // Valeurs de démonstration stables, comme les autres fiches rédigées.
    // Volontairement sous Khamrah et Vanilla Voyage : la référence vient
    // d'entrer au catalogue, un compteur d'avis à quatre chiffres démentirait
    // la nouveauté que la page revendique par ailleurs.
    rating: 4.7,
    reviews: 142,
    concentration: "Eau de parfum",
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Rifaaqat ouvre sur une gorgée d'alcool ambré : un cognac chaud et sec, cerclé de cannelle, qui pique avant de retomber. La praline fond dessus presque aussitôt et arrondit l'attaque, sans jamais la confire — c'est une praline grillée, un peu amère au bord, pas un caramel. Le cœur laisse monter la fève tonka, foin et coumarine, qui ramène le gourmand vers la peau. Le fond est un lit de vanille sombre posé sur des bois secs, santal et cèdre, dont la sécheresse empêche l'ensemble de tourner au sirop. Sillage dense et tenue longue, à l'image du flacon rectangulaire à capuchon noir mat et à l'étiquette calligraphiée.",
    // Le grand classique reste anonyme : la règle du champ n'autorise à le
    // nommer que si `olfactive-twins.ts` établit le rapprochement pour CE
    // slug, et le fichier ne porte aucune entrée Rifaaqat. Le rapprochement
    // existe pourtant : `reference-perfumes.ts` liste `kilian-angels-share`
    // avec les mêmes accords, et `olfactive-match.ts` les apparie tout seul.
    // C'est ce moteur qui doit le dire à l'écran, pas une phrase écrite ici.
    viralNote:
      "Très partagé sur les réseaux sociaux, où il est cherché pour sa parenté avec un grand classique gourmand au cognac, dont il rappelle l'axe praline, tonka et bois secs sans jamais prétendre s'y substituer.",
    topNotes: ["Cognac", "Cannelle"],
    heartNotes: ["Praline", "Fève tonka"],
    baseNotes: ["Vanille", "Bois de santal", "Cèdre"],
    badges: ["Ambré", "Eau de parfum", "Fabriqué à Dubaï", "Authenticité garantie"],
    // Packshot studio : c'est le seul cadrage qui tient en vignette 68 px,
    // là où les mises en scène sombres de la série (charbon, ardoise, terre
    // craquelée) noient le verre transparent dans leur fond.
    image: "/assets/products/rifaaqat/rifaaqat-hf-01.jpg",
    // Sept vues sur dix-sept. La série est riche en décors mais pauvre en
    // information : douze photos ne changent que la matière posée sous le
    // flacon, sans rien dire du jus. On garde donc le packshot, l'étui (ce que
    // le client reçoit), puis cinq fonds retenus pour ce qu'ils évoquent du
    // parfum — soie noire et marbre pour la densité du sillage, charbon et
    // ardoise mouillée pour la sécheresse boisée du fond, coton pour la
    // rondeur pralinée. Les dix écartées redisent l'une de ces cinq matières.
    gallery: [
      "/assets/products/rifaaqat/rifaaqat-hf-01.jpg",
      "/assets/products/rifaaqat/rifaaqat-hf-06.jpg",
      "/assets/products/rifaaqat/rifaaqat-hf-07.jpg",
      "/assets/products/rifaaqat/rifaaqat-hf-11.jpg",
      "/assets/products/rifaaqat/rifaaqat-hf-13.jpg",
      "/assets/products/rifaaqat/rifaaqat-hf-15.jpg",
      "/assets/products/rifaaqat/rifaaqat-hf-17.jpg",
    ],
  },
  "maison-alhambra-salvo": {
    // Le flacon des quinze visuels porte « SALVO ELIXIR » gravé en toutes
    // lettres : la fiche prend ce nom-là, parce qu'une fiche produit doit
    // annoncer ce que le client verra arriver dans le colis, pas ce que la
    // page d'accueil a écrit. L'écart n'est PAS tranché ici, il est seulement
    // documenté : `olfactive-twins.ts` vend « Salvo » à 16,90 € et pointe
    // `maison-alhambra-salvo`, quand `reference-perfumes.ts` sépare bien deux
    // jus (`alhambra-salvo`, aromatique lavande-ambrox / `alhambra-salvo-elixir`,
    // fougère poivre-tabac). La fiche est posée sur le slug que la carte des
    // jumeaux vise déjà, pour que les quinze visuels servent la page où le
    // site amène vraiment le visiteur plutôt qu'une seconde page vide à côté.
    // Reste à trancher ailleurs : renommer la carte en « Salvo Elixir », ou
    // obtenir un visuel du Salvo simple et rendre à ce slug son jus d'origine.
    name: "Salvo Elixir",
    brand: "Maison Alhambra",
    // Prix repris tel quel de la carte des jumeaux olfactifs plutôt que
    // recalculé : tant que l'identité des deux jus n'est pas arbitrée, deux
    // prix pour ce qui est peut-être le même flacon est exactement le genre
    // d'incohérence qu'on ne rattrape jamais. Barré au ratio des autres
    // fiches (~-26 %).
    price: 16.9,
    oldPrice: 22.9,
    // Valeurs de démonstration stables, comme les autres fiches rédigées : le
    // repo n'a pas de base d'avis, et un tirage au hasard ferait changer le
    // JSON-LD d'un rendu à l'autre.
    rating: 4.8,
    reviews: 268,
    // Pas de « EDP 30% » : aucune source ne donne le taux pour cette
    // référence, on s'en tient au libellé par défaut de `product-resolve.ts`.
    // Le mot « Elixir » du flacon désigne une déclinaison commerciale, pas une
    // concentration mesurée — le recopier ici serait une promesse inventée.
    concentration: "Eau de parfum",
    // 60ml et non le « 100ml » de toutes les autres fiches : l'étui
    // photographié (`salvo-hf-07`) porte « 60ml · 2.02 FL.OZ. » et « Eau de
    // parfum » imprimés. Une contenance recopiée par habitude sur une fiche
    // dont on a le carton sous les yeux, c'est une erreur de commande.
    volume: "60ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Salvo Elixir s'ouvre net et froid, sur un citron vert pressé encore amer que le poivre de Sichuan vient piquer avant même que l'agrume ne retombe. Le cœur bascule vers l'aromatique : une lavande sèche, tenue courte, cerclée d'anis étoilé et d'un trait de cannelle qui la réchauffe sans jamais la sucrer. La muscade arrive ensuite, poudreuse, et épaissit l'accord jusqu'à lui donner un grain presque cuir qu'on n'attendait pas d'une ouverture aussi claire. Le fond assume la bascule — réglisse, bois ambrés et vanille sombre — posé sur une note minérale de pierre mouillée qui empêche l'ensemble de tourner au gourmand. Il en reste un sillage droit et dense, taillé pour le soir, à l'image du flacon de verre bleu nuit et de son bouchon strié.",
    // Le grand classique reste anonyme : la règle du champ n'autorise à le
    // nommer que si `olfactive-twins.ts` établit le rapprochement pour CE
    // slug. Il le fait pour `maison-alhambra-salvo` — pas pour celui-ci — et
    // vers le Sauvage classique, pas vers sa déclinaison Elixir. Nommer
    // reviendrait donc à reprendre un rapprochement documenté pour un autre
    // jus : à reconsidérer le jour où la carte pointera ce slug.
    viralNote:
      "Très partagé sur les réseaux sociaux, où il est cherché pour sa parenté avec un grand classique boisé-épicé, dont il rappelle l'axe lavande, épices et bois ambrés sans jamais prétendre s'y substituer.",
    // Pyramide calée sur ce que les visuels mettent en scène — badiane,
    // muscade, poivre, lavande, citron vert, pierre mouillée — plutôt que
    // sur la seule fiche accords de `reference-perfumes.ts` : les photos sont
    // la source qui parle de CE flacon, et une galerie qui montre une épice
    // absente de la pyramide se voit immédiatement. Le grain photographié en
    // `salvo-hf-10` est du Sichuan — cosses ouvertes, graine noire — pas du
    // poivre rose : c'est aussi l'épice que `reference-perfumes.ts` liste pour
    // la maison, les deux sources concordent donc.
    topNotes: ["Citron vert", "Bergamote", "Poivre de Sichuan"],
    heartNotes: ["Lavande", "Anis étoilé", "Cannelle", "Muscade"],
    baseNotes: ["Réglisse", "Bois ambrés", "Vanille", "Accord minéral"],
    // Badges à la convention de `product-resolve.ts` (famille, forme, origine,
    // garantie), avec le libellé de famille tel que `FAMILIES` l'écrit : les
    // « Tenue 24h / EDP 30% » des six premières fiches sont deux promesses
    // qu'aucune source ne documente pour cette référence.
    badges: ["Frais", "Eau de parfum", "Fabriqué à Dubaï", "Authenticité garantie"],
    // Packshot retenu parmi les six du studio parce que c'est le seul où le
    // flacon est centré et cadré plein : les autres le posent à droite du
    // cadre, ce qui le décale ou le tronque partout où ce champ est réduit
    // (vignette panier 68 px, jumeau olfactif 116 px en `contain`).
    image: "/assets/products/salvo/salvo-hf-05.jpg",
    // Huit vues sur quinze, ordonnées du produit vers sa pyramide : le
    // packshot par défaut, la vue seule à ombre douce, l'étui, puis une mise
    // en scène par étage olfactif — citron vert pour la tête, lavande et
    // badiane pour le cœur, poivre de Sichuan pour l'épice, ardoise mouillée
    // pour la facette minérale du fond. Les sept écartées font doublon (04 et 09
    // redisent la muscade de 08, 13 et 14 le minéral de 15) : une galerie qui
    // répète une note lui donne un poids qu'elle n'a pas dans le jus.
    gallery: [
      "/assets/products/salvo/salvo-hf-05.jpg",
      "/assets/products/salvo/salvo-hf-06.jpg",
      "/assets/products/salvo/salvo-hf-07.jpg",
      "/assets/products/salvo/salvo-hf-12.jpg",
      "/assets/products/salvo/salvo-hf-11.jpg",
      "/assets/products/salvo/salvo-hf-08.jpg",
      "/assets/products/salvo/salvo-hf-10.jpg",
      "/assets/products/salvo/salvo-hf-15.jpg",
    ],
  },
  "vanilla-voyage": {
    name: "Vanilla Voyage",
    // « Maison Asrar » est ce que le flacon porte sous le nom, sur les seize
    // visuels sans exception. Le repo en donne deux autres versions —
    // « Maison Yara » dans `best-sellers-top.ts`, « Dubaï Parfumerie » dans
    // `trend-products.ts` — qui ne peuvent pas être vraies toutes les trois.
    // Le verre tranche ici ; les deux autres fichiers restent à aligner.
    //
    // La fiche occupe le slug `vanilla-voyage`, celui vers lequel tout le site
    // pointe déjà (`shoppable-videos`, `trend-products`, `best-sellers-top`) :
    // `resolveProduct()` sert `PRODUCTS[slug]` avant le catalogue agrégé, donc
    // ces trois rails ouvrent désormais la fiche rédigée au lieu de la version
    // composée qui affichait « Maison Yara ». La marque reste à aligner à la
    // source, sans quoi la carte et la page qu'elle ouvre se contrediront.
    brand: "Maison Asrar",
    // 59 € / 79 € repris de `trend-products.ts`, qui porte déjà exactement ce
    // couple prix-prix barré (~-25 %, le ratio des autres fiches) : recalculer
    // un barré aurait produit un troisième prix pour le même flacon.
    // `best-sellers-top.ts` en affiche encore un quatrième (58,90 / 69,90 €) —
    // à aligner sur ce couple-ci, pas l'inverse, puisque c'est celui que la
    // vidéo shoppable et la carte tendance annoncent au client.
    price: 59,
    oldPrice: 79,
    // Note et volume d'avis plus élevés que les autres fiches parce que le
    // site le présente comme son best-seller n°1 (`trend-products.ts`,
    // `rank: 1`) : une réputation en dessous de celle de Khamrah contredirait
    // le classement affiché ailleurs.
    rating: 4.9,
    reviews: 754,
    concentration: "Eau de parfum",
    // 100ml comme toutes les fiches. À noter : `trend-products.ts` déclare un
    // `variantId` en « -50 » quand `shoppable-videos.ts` en déclare un en
    // « -100ml » — deux contenances pour un seul flacon, à trancher là-bas.
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Vanilla Voyage s'ouvre sur une vanille déjà cuite, jamais fraîche : la gousse est fendue, grattée, chauffée jusqu'à ce que le sucre commence à blondir. Le caramel prend le relais, franc, avec cette pointe d'amertume du sucre juste avant qu'il ne brûle, qu'un miel épais arrondit sans l'alourdir. Le cœur laisse monter une fève tonka foin-coumarine et un soupçon d'amande grillée, qui ramènent le gourmand vers la peau plutôt que vers la pâtisserie. En fond, le benjoin et le bois de santal donnent le corps, le musc étire l'accord et l'ambre referme le voyage sur une chaleur résineuse. Un gourmand chaud et tenace, surtout sur les vêtements, à l'image de son flacon rond côtelé, ambré, coiffé d'un bouchon turban ivoire cerclé d'une tresse dorée.",
    // Aucune entrée de `olfactive-twins.ts` ne concerne ce parfum : le grand
    // classique reste donc anonyme, conformément à la règle du champ.
    viralNote:
      "Devenu l'un des flacons les plus filmés du site, il y est cherché pour son sillage inspiré d'un grand classique gourmand, dont il rappelle l'accord vanille-caramel sans jamais prétendre l'égaler.",
    topNotes: ["Vanille de Madagascar", "Caramel", "Miel"],
    heartNotes: ["Fève tonka", "Amande grillée", "Praline"],
    baseNotes: ["Benjoin", "Bois de santal", "Musc blanc", "Ambre"],
    badges: ["Ambré · gourmand", "Eau de parfum", "Fabriqué à Dubaï", "Authenticité garantie"],
    // Des sept packshots, le seul cadré large ET centré, avec la lumière la
    // plus franche sur le verre dépoli : les autres décalent le flacon d'un
    // tiers vers la droite (02, 03, 05, 07) ou passent en paysage (04), ce qui
    // le tronque dans les vignettes carrées.
    image: "/assets/products/vanilla-voyage/vanilla-voyage-packshot-01.jpg",
    // Sept vues sur seize : deux studio (la vue de référence, puis la vue
    // seule sans accessoire pour montrer le flacon nu), puis une mise en scène
    // par facette — gousses pour la vanille, rayon de miel et éclats de sucre
    // cuit pour le caramel, soie crème pour la douceur du fond, poudre dorée
    // pour le sillage. Les neuf écartées sont des variantes de cadrage des
    // mêmes décors (03 refait 02, 05 refait 01, 07 refait 08, 09 refait le
    // sucre) : les garder gonflerait la galerie sans rien ajouter au récit.
    gallery: [
      "/assets/products/vanilla-voyage/vanilla-voyage-packshot-01.jpg",
      "/assets/products/vanilla-voyage/vanilla-voyage-packshot-06.jpg",
      "/assets/products/vanilla-voyage/vanilla-voyage-env-01.jpg",
      "/assets/products/vanilla-voyage/vanilla-voyage-env-04.jpg",
      "/assets/products/vanilla-voyage/vanilla-voyage-env-02.jpg",
      "/assets/products/vanilla-voyage/vanilla-voyage-env-06.jpg",
      "/assets/products/vanilla-voyage/vanilla-voyage-env-08.jpg",
    ],
  },
};
