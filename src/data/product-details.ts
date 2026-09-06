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
  /**
   * Famille olfactive DOMINANTE, écrite noir sur blanc.
   *
   * Elle existe parce que la déduire des notes était une devinette, et que la
   * devinette s'est trompée en vitrine : Shaghaf Oud, dont le cœur est un oud
   * cambodi, ressortait « Floral » — deux roses et une fleur d'oranger
   * suffisaient à égaler l'oud et le santal, et l'égalité était tranchée par
   * l'ordre d'écriture du dictionnaire de `search-catalog.ts`. Un jumeau
   * olfactif se choisit d'abord sur la famille : une famille fausse donne un
   * appariement faux, quelle que soit la finesse du reste du calcul.
   *
   * Vocabulaire : le PREMIER descripteur porte la dominante (`familyOf` ne lit
   * que lui). « Boisé », « Ambré », « Gourmand », « Floral », « Frais »,
   * « Aromatique », « Fruité » — un triptyque de vitrine reste permis, mais sa
   * tête doit être la dominante réelle.
   *
   * Optionnel : une fiche qui ne la déclare pas retombe sur la déduction, qui
   * reste correcte pour un profil franc. Elle ne l'est pas pour les orientaux à
   * facettes multiples, et c'est tout le catalogue de cette maison.
   */
  family?: string;
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
    // La rose damascène ouvre et le cœur reste floral (jasmin, iris) : c'est
    // la déclinaison FÉMININE de la maison, l'oud du fond la soutient sans la
    // renverser. Distinction assumée avec Shaghaf Oud, déclaré boisé : là-bas
    // l'oud cambodi est au CŒUR et la rose n'est qu'un accent.
    family: "Floral",
    badges: ["Tenue 24h", "EDP 30%", "Fabriqué à Dubaï", "Authenticité garantie"],
    // Pas de photo de ce flacon en banque : visuel générique conservé (à remplacer).
    image: "/assets/prod-1.jpg",
  },
  "al-haramain-amber-oud": {
    name: "Amber Oud",
    brand: "Al Haramain",
    price: 75.0,
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
    // Oud royal au cœur, vétiver et musc boisé au fond : le nom met l'ambre
    // devant, la composition met le bois. Sa paire relue vise Tom Ford Oud
    // Wood, dont la base classe la référence en « boisée » — déclarer boisé ici
    // aligne enfin l'affinité de famille sur l'appariement qu'on affiche.
    family: "Boisé",
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
    // Marine, concombre, menthe poivrée : l'ouverture EST le parfum.
    family: "Frais",
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
    // Ananas et pomme en tête, mais bouleau fumé et cèdre en fond — c'est un
    // fruité-boisé, pas une eau fraîche. La déduction le rangeait en « Frais »
    // sur la seule bergamote, ce qui le rendait candidat aux hespéridées.
    family: "Boisé",
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
    // LE cas qui a fait remonter le bug : deux roses et une fleur d'oranger
    // suffisaient à faire de cet oud un « Floral », et le module l'appariait
    // alors à des muscs rosés légers. Le cœur est un oud cambodi, le fond un
    // santal : la colonne vertébrale est boisée, les fleurs sont des accents.
    family: "Boisé",
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
    // Sa propre `viralNote` le dit « boisé-épicé » : la famille déclarée ne
    // fait que cesser de la contredire (la déduction sortait « Ambré »).
    family: "Boisé",
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
    price: 29.0,
    oldPrice: 39.9,
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
    // Datte, praline, tonka, vanille : gourmand avant tout, le bois est un fond.
    family: "Gourmand",
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
    // Myrtille, cassis, framboise sur un fond vanillé — fruité-gourmand.
    family: "Fruité",
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
    // Fleur d'oranger et néroli en tête, jasmin et iris au cœur : un blanc
    // floral franc, sans structure boisée pour le contredire.
    family: "Floral",
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
    // Réaligné sur la médiane marché (19,91 € sur 3 relevés), arrondi au prix
    // de boutique. Le site affichait 30 €, soit +51 % — l'écart le plus large
    // de la maison après Marshmallow Blush.
    price: 19.9,
    oldPrice: 52.9,
    // Valeurs de démonstration stables, comme les autres fiches rédigées.
    // Volontairement sous Khamrah et Vanilla Voyage : la référence vient
    // d'entrer au catalogue, un compteur d'avis à quatre chiffres démentirait
    // la nouveauté que la page revendique par ailleurs.
    rating: 4.7,
    reviews: 142,
    concentration: "Eau de parfum",
    // 85 ml et non 100 : c'est le format que Paris Corner commercialise, et
    // celui sur lequel porte la fiche officielle.
    volume: "85ml",
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
    // Pyramide officielle Paris Corner (pariscorner.ae/product/rifaaqat-85ml).
    // La composition affichée jusqu'ici — cognac, cannelle, praline — décrivait
    // un gourmand ; la maison publie un boisé épicé encensé, tout autre parfum.
    topNotes: ["Poivre noir", "Poivre rose", "Élémi"],
    heartNotes: ["Oliban", "Safran"],
    baseNotes: ["Vanille Bourbon", "Daim", "Cèdre"],
    // Cognac, cannelle, praline, tonka : le registre est celui de la liqueur.
    family: "Gourmand",
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
    // Seule HAUSSE de la vague : le site vendait à 20 € un flacon dont la
    // médiane marché est à 26,45 € sur 3 relevés, tous en 60 ml — le format de
    // cette fiche. La règle vaut dans les deux sens, un prix trop bas se
    // réaligne comme un prix trop haut. Le barré monte à 34,90 € pour rester
    // au-dessus.
    price: 26.9,
    oldPrice: 34.9,
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
    // Pyramide du catalogue vérifié. Maison Alhambra ne publie pas de fiche
    // pour cette référence : la source retenue est la page marchande, recoupée,
    // et non une composition reconstituée.
    topNotes: ["Citron vert", "Pamplemousse", "Cardamome"],
    heartNotes: ["Lavande", "Muscade", "Bois de santal", "Patchouli"],
    baseNotes: ["Ambre", "Patchouli", "Bois"],
    // Lavande, anis, poivre de Sichuan : aromatique en tête, comme la référence
    // dont il est le jumeau relu (Dior Sauvage, famille « aromatique »).
    family: "Aromatique",
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
    price: 49,
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
    // Vanille de Madagascar, caramel, miel, praline : gourmand de bout en bout.
    family: "Gourmand",
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

  // ---------------------------------------------------------------------------
  // Rayhaan — cinq fiches, une seule maison.
  //
  // Rayhaan est la ligne haute d'Afnan : cinq sorties 2025-2026, toutes en
  // eau de parfum 100 ml. Aucune n'était présente dans `reference-perfumes.ts`
  // (`grep -i rayhaan src/` ne renvoie rien avant ces fiches), donc aucune
  // pyramide n'a pu être reprise du dépôt : les notes ci-dessous viennent des
  // fiches Fragrantica de chaque référence, recoupées à chaque fois par un
  // second marchand ou revendeur qui publie la même pyramide. Les notes que
  // ces deux sources ne portaient pas toutes les deux ont été coupées plutôt
  // que devinées — la règle de véracité vaut aussi quand la fiche paraît
  // maigre à côté d'une liste de onze matières.
  //
  // Les prix suivent une seule logique, écrite une fois ici : trois de ces
  // flacons (Aquatica, Kiss, Terra) sortent du MÊME moule cage-métal, dans la
  // même contenance et la même année. Rien ne justifierait de les vendre à
  // trois tarifs différents, ils portent donc le même couple 44,90 / 59,90 €.
  // Italia descend d'un cran (verre laqué simple, pas de cage) et Nocturno
  // Elixir monte d'un cran (concentration elixir revendiquée). Le barré reste
  // au ratio des autres fiches, ~-25 %. Le repère de fourchette est le
  // catalogue existant : Khamrah 21,90 € … L'Or 78 €, Rayhaan se plaçant vers
  // Reef 33 (42,50 €) et Club de Nuit (49,90 €).
  // ---------------------------------------------------------------------------
  "rayhaan-aquatica": {
    name: "Aquatica",
    brand: "Rayhaan",
    // Même moule que Kiss et Terra, même contenance, même millésime : un seul
    // prix pour les trois. Voir la note de tête de section.
    price: 44.9,
    oldPrice: 59.9,
    // La plus commentée des cinq — les visuels retenus viennent de fils de
    // discussion qui la comparent tous au même classique insulaire. On lui
    // laisse donc le compteur d'avis le plus élevé de la maison, sans pour
    // autant approcher Khamrah (891) : la référence est sortie en 2025.
    rating: 4.8,
    reviews: 168,
    concentration: "Eau de parfum",
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Aquatica ouvre sur une gorgée d'agrumes — citron vert, bergamote, mandarine — que le lait de coco arrondit presque aussitôt : la fraîcheur est là, mais crémeuse, jamais coupante. Le cœur laisse fondre la canne à sucre dans un bouquet solaire de jasmin, de gardénia et d'hibiscus, qui donne à l'ensemble sa chair tropicale sans le sucrer franchement. En fond, un accord de rhum blanc prend le relais et rejoint la fève tonka, le musc et un patchouli très discret : c'est là que le parfum bascule du frais vers le gourmand. Le sillage reste modéré et proche de la peau — un jus d'été qu'on redécouvre en bougeant plutôt qu'un mur —, avec une tenue de six à huit heures qui double sur les vêtements. Le flacon cage d'argent posé sur un verre turquoise raconte exactement ce que le jus fait.",
    // Le classique reste anonyme : la règle du champ n'autorise à le nommer
    // que si `olfactive-twins.ts` établit le rapprochement pour CE slug, et le
    // fichier ne porte aucune entrée Rayhaan. Le rapprochement est pourtant
    // celui que tous les fils de discussion font, citron vert / coco / rhum
    // étant la signature d'un seul grand parfum insulaire.
    viralNote:
      "Très partagé sur les réseaux sociaux, où il est cherché pour sa parenté avec un grand classique tropical au rhum et au citron vert, dont il rappelle l'axe coco-canne à sucre sans jamais prétendre s'y substituer.",
    topNotes: ["Citron vert", "Lait de coco", "Bergamote", "Mandarine"],
    heartNotes: ["Canne à sucre", "Jasmin", "Hibiscus", "Gardénia"],
    baseNotes: ["Rhum", "Fève tonka", "Musc", "Patchouli"],
    // « Frais » et non « Gourmand » : le fond rhum-tonka existe, mais c'est
    // l'ouverture hespéridée-coco qui signe le parfum et que le porteur sent
    // pendant les deux premières heures. Sa source Fragrantica le classe
    // elle-même « Citrus Gourmand », agrume en premier.
    family: "Frais",
    badges: ["Frais · tropical", "Eau de parfum", "Fabriqué à Dubaï", "Authenticité garantie"],
    // Vignette taillée dans `packshot-01` : c'est le seul plan strictement de
    // face, où la plaque « RAYHAAN » tombe au centre géométrique du flacon et
    // où le carré se referme sans mordre ni sur le bouchon ni sur la cage. Les
    // mises en scène, elles, noient une résille d'argent dans leur décor dès
    // qu'on descend à 68 px — la glace et l'écume sont exactement de la même
    // valeur que le métal.
    image: "/assets/products/dp_parfumerie-rayhaan-aquatica-vignette.webp",
    // Neuf vues sur vingt-deux. Les seize photos de studio étaient exploitables
    // à une exception près (voir plus bas) ; les six visuels glanés sur le web
    // sont tous écartés, non par principe mais parce qu'aucun n'apporte
    // d'information que le studio ne donne pas mieux : deux redisent le coffret
    // déjà tenu par `coffret-01` en moins net, deux sont des photos de main où
    // le flacon rétroéclairé vire au bleu marine — le client verrait deux jus
    // différents dans une même galerie —, une est prise dans un dressing
    // encombré, la dernière tire au doré par fausse balance des blancs.
    // Écartée aussi, côté studio : la photo 14, où le flacon est plus large que
    // haut, la résille remplacée par un craquelé et le bouchon surdimensionné.
    // Ce n'est plus le même flacon, et c'est le seul vrai raté de la série.
    // Écartées enfin pour redite : la 04 (le jus y tourne au gris-vert sur le
    // métal brossé), la 01 et la 03 (sel et soie disent une matière que la
    // glace et le galet disent déjà), les 11, 15 et 16 (trois variantes du même
    // plan studio avec corail, quand la 06 le fait entièrement en corail).
    gallery: [
      "/assets/products/dp_parfumerie-rayhaan-aquatica-vignette.webp",
      "/assets/products/rayhaan-aquatica/dp_parfumerie-rayhaan-aquatica-packshot-01.jpg",
      "/assets/products/rayhaan-aquatica/dp_parfumerie-rayhaan-aquatica-packshot-02.jpg",
      "/assets/products/rayhaan-aquatica/dp_parfumerie-rayhaan-aquatica-packshot-03.jpg",
      "/assets/products/rayhaan-aquatica/dp_parfumerie-rayhaan-aquatica-coffret-01.jpg",
      "/assets/products/rayhaan-aquatica/dp_parfumerie-rayhaan-aquatica-env-01.jpg",
      "/assets/products/rayhaan-aquatica/dp_parfumerie-rayhaan-aquatica-env-02.jpg",
      "/assets/products/rayhaan-aquatica/dp_parfumerie-rayhaan-aquatica-env-03.jpg",
      "/assets/products/rayhaan-aquatica/dp_parfumerie-rayhaan-aquatica-env-04.jpg",
      "/assets/products/rayhaan-aquatica/dp_parfumerie-rayhaan-aquatica-env-05.jpg",
    ],
  },
  "rayhaan-italia": {
    // Le flacon porte « ITALIA / POUR HOMME / RAYHAAN » gravé en toutes
    // lettres sur chacun des visuels retenus : la fiche s'en tient à « Italia »,
    // « Pour Homme » étant une mention de genre et non une partie du nom.
    name: "Italia",
    brand: "Rayhaan",
    // Un cran sous les trois flacons cage : ici le verre est simplement laqué
    // façon marbre, sans la coque métal ajourée qui fait le prix des autres.
    // Barré au même ratio ~-25 % que le reste du dépôt.
    price: 41.9,
    oldPrice: 55.9,
    rating: 4.7,
    reviews: 103,
    concentration: "Eau de parfum",
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Italia s'ouvre sur une lavande nette et citronnée que la bergamote tire vers l'eau de Cologne — une entrée sobre, presque barbière, qui ne laisse rien deviner de la suite. Le miel arrive vite et change tout : épais, un peu cireux, piqué de cannelle et adouci d'un jasmin discret, pendant que le cashmeran installe dessous ce moelleux musqué qui tient l'accord ensemble. Le fond est une vanille sombre mêlée de feuille de tabac, dont l'amertume sèche empêche le miel de tourner au sirop, et que la fève tonka vient refermer. Le sillage est chaud, dense, franchement automnal, et la tenue dépasse aisément la journée sur un lainage. Le flacon carré en verre laqué façon marbre blanc, coiffé d'un capuchon doré, joue la même carte que le jus : sobre au premier regard, cossu au second.",
    topNotes: ["Lavande", "Citron", "Bergamote"],
    heartNotes: ["Miel", "Cannelle", "Cashmeran", "Jasmin"],
    baseNotes: ["Vanille", "Feuille de tabac", "Fève tonka"],
    // La tête aromatique dure dix minutes ; ce sont le miel, la cannelle, le
    // tabac et la vanille qui portent le parfum, et sa source le classe
    // « Oriental Woody ». « Ambré » plutôt que « Gourmand » parce que le tabac
    // et le cashmeran sèchent le miel au lieu de le confire.
    family: "Ambré",
    badges: ["Ambré · miellé", "Eau de parfum", "Fabriqué à Dubaï", "Authenticité garantie"],
    // Vignette taillée dans le packshot lui-même, et non dans une mise en
    // scène : c'est le seul rendu de la série où le flacon laisse de la marge
    // des quatre côtés, si bien que le carré prend le capuchon doré en entier
    // par le haut et la ligne « RAYHAAN » par le bas sans raser ni l'un ni
    // l'autre. Le fond blanc uni y aide autant que le cadrage — à 68 px, un
    // flacon de marbre blanc posé sur du marbre blanc (la carrière, la poudre,
    // les cristaux) devient une tache indistincte, alors qu'ici le contour et
    // le capuchon se lisent encore.
    image: "/assets/products/dp_parfumerie-rayhaan-italia-vignette.webp",
    // Sept vues sur vingt-cinq. Les visuels marchands du départ sont tous
    // partis : ils étaient basse définition et l'un portait l'URL d'un
    // revendeur incrustée en travers. La série de rendus qui les remplace est
    // en revanche très répétitive — six packshots studio quasi identiques,
    // et une douzaine de mises en scène qui ne changent que la matière posée
    // sous le flacon. On ne garde donc qu'un exemplaire par idée : le packshot
    // (le produit seul), le coffret (ce que le client reçoit, avec « 100ml »
    // lisible sur l'étui), puis cinq décors choisis pour ce qu'ils disent du
    // jus plutôt que pour leur joliesse — la carrière de marbre pour le nom,
    // le travertin chaud pour le miel et la cannelle, le lainage pour la tenue
    // que la description promet sur les tissus, le marbre ruisselant pour la
    // lavande citronnée de l'ouverture, la roche noire pour le fond tabac et
    // vanille. Écartés au-delà des doublons : un rendu de carrière où
    // l'étiquette inverse la hiérarchie de la marque (« RAYHAAN » au-dessus
    // d'« ITALIA ») et orthographie « FOUR HOMME », faute repérée en
    // recadrant l'étiquette à pleine résolution et invisible en vignette.
    gallery: [
      "/assets/products/dp_parfumerie-rayhaan-italia-vignette.webp",
      "/assets/products/rayhaan-italia/dp_parfumerie-rayhaan-italia-packshot-01.jpg",
      "/assets/products/rayhaan-italia/dp_parfumerie-rayhaan-italia-coffret-01.jpg",
      "/assets/products/rayhaan-italia/dp_parfumerie-rayhaan-italia-env-01.jpg",
      "/assets/products/rayhaan-italia/dp_parfumerie-rayhaan-italia-env-02.jpg",
      "/assets/products/rayhaan-italia/dp_parfumerie-rayhaan-italia-env-03.jpg",
      "/assets/products/rayhaan-italia/dp_parfumerie-rayhaan-italia-env-04.jpg",
      "/assets/products/rayhaan-italia/dp_parfumerie-rayhaan-italia-env-05.jpg",
    ],
  },
  "rayhaan-kiss": {
    name: "Kiss",
    brand: "Rayhaan",
    // Même moule cage-métal qu'Aquatica et Terra : même prix. Voir la note de
    // tête de section.
    price: 44.9,
    oldPrice: 59.9,
    rating: 4.7,
    reviews: 88,
    concentration: "Eau de parfum",
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Kiss attaque sur un panier de fruits rouges — fraise et framboise, mûres et juteuses — que la noix de coco et une praline grillée enrobent immédiatement de crème. Le cœur est le moment le plus sucré du parfum : le lait concentré et le caramel s'épaississent, à peine allégés par une fleur d'oranger qui rappelle qu'il y a des fleurs là-dessous. Le fond ramène tout vers la peau, vanille et fève tonka en tête, posées sur un bois de santal crémeux et un musc propre qui empêchent l'ensemble de coller. Le sillage est ample les deux premières heures puis se resserre, avec une tenue longue, surtout dans les cheveux et sur les tissus. Le flacon cage dorée sur verre fuchsia annonce la couleur avant même la première vaporisation.",
    topNotes: ["Fraise", "Framboise", "Noix de coco", "Praline"],
    heartNotes: ["Lait concentré", "Caramel", "Fleur d'oranger"],
    baseNotes: ["Vanille", "Fève tonka", "Bois de santal", "Musc"],
    // Praline, lait concentré, caramel, vanille : gourmand du premier au
    // dernier étage. Les fruits rouges de tête sont un habillage, pas la
    // dominante — écrire « Fruité » enverrait la fiche vers des florales
    // fruitées légères, qui n'ont rien à voir avec ce jus-là.
    family: "Gourmand",
    badges: ["Gourmand · fruité", "Eau de parfum", "Fabriqué à Dubaï", "Authenticité garantie"],
    // Vignette taillée dans `packshot-01`, le plan de face : le flacon y est
    // centré avec de la marge partout, et le contraste or sur fuchsia est le
    // plus lisible du catalogue une fois réduit. Le trois-quarts de
    // `packshot-02` aurait décalé la plaque gravée vers la droite du carré.
    image: "/assets/products/dp_parfumerie-rayhaan-kiss-vignette.webp",
    // Quatre vues sur cinq. Le visuel du coffret portait un bandeau publicitaire
    // incrusté par le revendeur sous le flacon : il est recadré au-dessus du
    // bandeau plutôt que jeté, parce que c'est le seul plan qui montre l'étui —
    // c'est-à-dire ce que le client reçoit vraiment. Écartée : la cinquième
    // vue, un détourage automatique qui refait le même trois-quarts que
    // `packshot-02` avec des bords rongés par l'outil.
    gallery: [
      "/assets/products/dp_parfumerie-rayhaan-kiss-vignette.webp",
      "/assets/products/rayhaan-kiss/dp_parfumerie-rayhaan-kiss-packshot-01.jpg",
      "/assets/products/rayhaan-kiss/dp_parfumerie-rayhaan-kiss-packshot-02.jpg",
      "/assets/products/rayhaan-kiss/dp_parfumerie-rayhaan-kiss-packshot-03.jpg",
      "/assets/products/rayhaan-kiss/dp_parfumerie-rayhaan-kiss-coffret-01.jpg",
    ],
  },
  "rayhaan-nocturno-elixir": {
    // « NOCTURNO / POUR HOMME / ELIXIR » est gravé sur le flacon, dans cet
    // ordre. La fiche retient « Nocturno Elixir » : c'est le nom qui distingue
    // cette référence du Nocturno simple, sorti un an plus tôt.
    name: "Nocturno Elixir",
    brand: "Rayhaan",
    // Un cran au-dessus des flacons cage : la maison revendique une
    // concentration elixir, et le catalogue place déjà ses jus les plus denses
    // au-dessus de 49 € (Club de Nuit 49,90 €, Shaghaf 59 €).
    price: 49.9,
    oldPrice: 66.9,
    // La plus récente des cinq — d'où le compteur d'avis le plus bas de la
    // maison, à l'image de ce que Rifaaqat fait pour une entrée fraîche au
    // catalogue.
    rating: 4.7,
    reviews: 74,
    concentration: "Eau de parfum",
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Nocturno Elixir démarre à froid : zeste de citron et bergamote, une menthe glaciale et l'amertume verte de l'armoise, une ouverture presque mordante pour un jus qui se dit elixir. Le cœur assouplit aussitôt le propos — la lavande et le géranium installent une charpente aromatique classique, qu'une note d'ananas vient sucrer d'un trait inattendu, discret mais reconnaissable. Puis le bois de santal monte, crémeux et légèrement poudré, et c'est lui qui restera : quelques heures après la vaporisation, la fraîcheur n'est plus qu'un souvenir sous des bois ambrés et une facette cuirée. Le sillage est d'abord large, puis se referme en parfum de peau, avec une tenue de huit heures et plus. Le flacon rectangulaire, noir en haut et bleu translucide en bas, raconte exactement ce dégradé du frais vers le sombre.",
    topNotes: ["Zeste de citron", "Bergamote", "Menthe", "Armoise"],
    heartNotes: ["Lavande", "Géranium", "Ananas"],
    baseNotes: ["Bois de santal", "Cuir", "Bois ambrés"],
    // « Boisé » et non « Aromatique » : la lavande et l'armoise donnent bien
    // une structure fougère, mais elles tiennent une heure quand le santal
    // ambré tient la journée, et c'est sur ce fond-là qu'un jumeau olfactif
    // doit être cherché.
    family: "Boisé",
    badges: ["Boisé · ambré", "Eau de parfum", "Fabriqué à Dubaï", "Authenticité garantie"],
    // Vignette taillée dans `packshot-02`, le trois-quarts, et non dans la vue
    // de face : celle-ci cadre si serré que le capuchon touche le bord haut de
    // l'image, ce qui donne un flacon tronqué dès qu'on le pose dans un carré.
    // Le trois-quarts respire, et l'arête vive du verre noir sur fond blanc
    // dessine mieux la forme du flacon en petit que sa façade frontale.
    image: "/assets/products/dp_parfumerie-rayhaan-nocturno-elixir-vignette.webp",
    // Les cinq visuels disponibles sont tous retenus, ce qui n'arrive pour
    // aucun autre produit de la maison : la série est courte et sans doublon —
    // deux studio (face et trois-quarts), un flacon posé, deux photos de main
    // sous des lumières franchement différentes. Rien à écarter sans amputer
    // la galerie.
    gallery: [
      "/assets/products/dp_parfumerie-rayhaan-nocturno-elixir-vignette.webp",
      "/assets/products/rayhaan-nocturno-elixir/dp_parfumerie-rayhaan-nocturno-elixir-packshot-02.jpg",
      "/assets/products/rayhaan-nocturno-elixir/dp_parfumerie-rayhaan-nocturno-elixir-packshot-01.jpg",
      "/assets/products/rayhaan-nocturno-elixir/dp_parfumerie-rayhaan-nocturno-elixir-env-01.jpg",
      "/assets/products/rayhaan-nocturno-elixir/dp_parfumerie-rayhaan-nocturno-elixir-porte-01.jpg",
      "/assets/products/rayhaan-nocturno-elixir/dp_parfumerie-rayhaan-nocturno-elixir-porte-02.jpg",
    ],
  },
  "rayhaan-terra": {
    name: "Terra",
    brand: "Rayhaan",
    // Même moule cage-métal qu'Aquatica et Kiss : même prix. Voir la note de
    // tête de section.
    price: 44.9,
    oldPrice: 59.9,
    // Note légèrement sous ses sœurs, et c'est volontaire : c'est la référence
    // qui divise le plus la communauté — parmi les visuels d'origine figure un
    // fil de discussion intitulé « big regret ». Une note alignée sur Aquatica
    // vendrait un consensus qui n'existe pas.
    rating: 4.6,
    reviews: 121,
    concentration: "Eau de parfum",
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Terra ouvre sur une bouffée d'épices vives : cardamome, poivre de Sichuan et la résine citronnée de l'élémi, éclaircies une minute par la bergamote avant que la lumière ne retombe. Le cœur est terreux et presque animal, un patchouli sombre relevé de cumin et de coriandre, où un safran cuiré affleure sans jamais prendre le dessus. Le fond est le vrai sujet du parfum : encens, benjoin et labdanum forment une masse résineuse et balsamique, que l'oud assombrit et qu'une vanille discrète empêche de devenir austère. C'est un sillage puissant, qui occupe la pièce et se lit à distance plusieurs heures durant, avec une tenue qui traverse la journée et reste sur les vêtements le lendemain. Le flacon cage bronze posé sur un verre vert olive prépare bien à cette matière-là : minérale, chaude, tout sauf transparente.",
    topNotes: ["Cardamome", "Élémi", "Poivre de Sichuan", "Bergamote"],
    heartNotes: ["Patchouli", "Cumin", "Coriandre", "Safran"],
    baseNotes: ["Encens", "Benjoin", "Labdanum", "Oud", "Ambre"],
    // Encens, benjoin, labdanum, ambre : le fond est une masse de résines, et
    // c'est elle qu'on porte. « Boisé » aurait mis l'oud en avant alors qu'il
    // n'est ici qu'une couleur parmi les baumes ; « Ambré » dit juste.
    family: "Ambré",
    badges: ["Ambré · épicé", "Eau de parfum", "Fabriqué à Dubaï", "Authenticité garantie"],
    // Vignette taillée dans `packshot-01` : flacon de face, déjà carré, la
    // plaque « RAYHAAN » au centre et de la marge des quatre côtés. C'est aussi
    // le seul plan où le vert olive du jus se lit à travers la cage — sur les
    // photos de main, l'intérieur du flacon vire au noir et Terra devient
    // indistinguable de n'importe quel flacon bronze de la maison.
    image: "/assets/products/dp_parfumerie-rayhaan-terra-vignette.webp",
    // Cinq vues sur dix. Deux visuels sont de vrais ratés et non des redites :
    // l'un est une vignette de 180 px de côté, inaffichable ; l'autre, pourtant
    // nommé d'après Terra, montre un flacon argenté au jus pâle — ce n'est pas
    // ce parfum, dont la cage est bronze et le jus vert olive. Les trois
    // dernières écartées sont des doublons de cadrage : un second plan étui
    // identique au retenu, un second plan de face plus plat, une seconde photo
    // de main plus floue que `porte-01`.
    gallery: [
      "/assets/products/dp_parfumerie-rayhaan-terra-vignette.webp",
      "/assets/products/rayhaan-terra/dp_parfumerie-rayhaan-terra-packshot-01.jpg",
      "/assets/products/rayhaan-terra/dp_parfumerie-rayhaan-terra-coffret-01.jpg",
      "/assets/products/rayhaan-terra/dp_parfumerie-rayhaan-terra-env-01.jpg",
      "/assets/products/rayhaan-terra/dp_parfumerie-rayhaan-terra-env-02.jpg",
      "/assets/products/rayhaan-terra/dp_parfumerie-rayhaan-terra-porte-01.jpg",
    ],
  },

  "lattafa-yara": {
    name: "Yara",
    brand: "Lattafa",
    // Yara est le flacon que la boutique met déjà en vitrine — `rank.ts` le
    // place deuxième de sa liste `FEATURED`, juste devant Khamrah — mais aucun
    // fichier du dépôt ne lui donnait de prix : il n'y a donc pas de chiffre
    // antérieur à respecter, seulement une cohérence de maison à tenir. On se
    // cale sur Khamrah (21,90 €, même maison, même contenance, même
    // concentration) et on ajoute un euro : sur le marché réel les deux se
    // suivent de près, et un écart plus large sur la page ferait passer l'un
    // des deux pour un autre segment. Prix barré au ratio des autres fiches
    // (~-28 %).
    price: 22.9,
    oldPrice: 31.9,
    // Valeurs de démonstration. Seule fiche autorisée à dépasser Khamrah au
    // compteur d'avis : Yara est la référence la plus vendue de la maison et la
    // vitrine la revendique déjà. Lui donner moins d'avis que Khamrah
    // contredirait la place que `rank.ts` lui accorde à l'écran.
    rating: 4.9,
    reviews: 1204,
    // Pas de « EDP 30% » ici, contrairement à Khamrah : le pourcentage est une
    // allégation marketing, et l'étui photographié n'imprime que « EAU DE
    // PERFUME NATURAL SPRAY ». On s'en tient à ce que la boîte dit.
    concentration: "Eau de parfum",
    // Lu sur l'étui : « 3.4 FL OZ · 100ML ».
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Yara ouvre sur une bouffée claire et sucrée : la mandarine donne le premier éclat, l'orchidée et l'héliotrope s'installent aussitôt derrière et posent le voile poudré qui signe le parfum. Le cœur épaissit ce voile sans le durcir — un accord gourmand crémeux, adouci de fruits tropicaux, qui tire la composition vers le lacté plutôt que vers le confit. Puis la vanille prend la main et ne la lâche plus : ronde, à peine ambrée, tenue au sec par un bois de santal et un musc blanc qui l'empêchent de tourner au sirop. Le sillage reste proche du corps les premières heures avant de s'ouvrir, et la trace laissée sur les vêtements survit largement à la journée. C'est ce fond vanillé-poudré, bien plus que son ouverture hespéridée, que les porteuses reconnaissent — et viennent chercher.",
    // Aucun original n'est évoqué, pas même de façon anonyme. `olfactive-twins.ts`
    // a RETIRÉ la paire Baccarat Rouge 540 ↔ Yara, et son commentaire explique
    // pourquoi : le rapprochement prêtait à Yara le safran et l'ambre gris de la
    // référence, et le moteur ne classait la paire que sixième. Le fichier
    // conclut qu'aucun jumeau défendable n'existe aujourd'hui pour ce flacon.
    // Une phrase qui parlerait ici d'« un grand classique » rouvrirait par la
    // bande la porte que ce commentaire a fermée. On parle donc de viralité, et
    // de rien d'autre.
    viralNote:
      "L'un des flacons les plus partagés des réseaux sociaux, où il s'est fait connaître pour son fond vanillé poudré et pour la trace qu'il laisse sur les vêtements bien après la fin de la journée.",
    topNotes: ["Orchidée", "Héliotrope", "Mandarine"],
    heartNotes: ["Accord gourmand", "Fruits tropicaux"],
    baseNotes: ["Vanille", "Musc", "Bois de santal"],
    // Le dépôt a déjà tranché cette famille à la main, et deux fois : l'entrée
    // `lattafa-yara` de `reference-perfumes.ts` est déclarée « florale », et le
    // commentaire de la paire retirée dans `olfactive-twins.ts` écrit noir sur
    // blanc « Yara est un floral gourmand vanillé (orchidée, héliotrope,
    // vanille, santal) ». On reprend cette tête plutôt que d'imposer une
    // troisième lecture : la vanille domine le fond, mais c'est le duo
    // orchidée-héliotrope qui donne au parfum son identité poudrée, et une
    // fiche qui basculerait en « Gourmand » ferait diverger `familyOf` de la
    // référence portant le même nom.
    family: "Floral · Gourmand · Vanillé",
    badges: ["Vanillé", "Eau de parfum", "Fabriqué à Dubaï", "Authenticité garantie"],
    image: "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-packshot-01.webp",
    // Banque Higgsfield du 29/08/26, convertie en WebP 1400 px : sept packshots
    // fond blanc puis treize mises en scène. Remplace les cinq vues JPEG de
    // l'ancien lot (coffret, environnement, porté), qui restent sur disque mais
    // ne sont plus référencées.
    //
    // `gallery[0]` reprend `image` : c'est le packshot studio, le seul cadrage
    // qui reste lisible réduit à 68 px dans le panier, là où les scènes
    // d'ambiance perdent le flacon dans leur décor. Les fonds blancs passent
    // donc en premier, les environnements ensuite.
    gallery: [
      "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-packshot-01.webp",
      "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-packshot-02.webp",
      "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-packshot-03.webp",
      "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-packshot-04.webp",
      "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-packshot-05.webp",
      "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-packshot-06.webp",
      "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-packshot-07.webp",
      "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-env-01.webp",
      "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-env-02.webp",
      "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-env-03.webp",
      "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-env-04.webp",
      "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-env-05.webp",
      "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-env-06.webp",
      "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-env-07.webp",
      "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-env-08.webp",
      "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-env-09.webp",
      "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-env-10.webp",
      "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-env-11.webp",
      "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-env-12.webp",
      "/assets/products/lattafa-yara/dp_parfumerie-lattafa-yara-env-13.webp",
    ],
  },
  // ─── Lattafa · The Kingdom ──────────────────────────────────────────────────
  // AVERTISSEMENT à qui reprendra cette fiche : « The Kingdom » désigne DEUX
  // parfums Lattafa sortis en 2024, un féminin et un masculin, aux pyramides
  // sans rapport. Les quatre visuels retenus montrent tous le même flacon —
  // corps strié or rose, cristaux sertis le long des arêtes, capuchon massif
  // gravé « Lattafa », étui blanc et or — qui est celui du FÉMININ ; le
  // masculin est un flacon or sombre à arêtes vives, décrit comme une armure.
  // Or l'entrée `lattafa-the-kingdom` de `reference-perfumes.ts` est déclarée
  // `gender: "homme"` et porte des accords mêlant les deux versions (sauge et
  // tabac viennent du masculin, cassis et fève tonka du féminin). La règle du
  // dépôt veut que les accords de la référence fassent foi, mais ils décrivent
  // ici un autre flacon que celui photographié : la fiche suit donc le flacon.
  // L'entrée de référence reste à corriger — ce fichier n'y touche pas.
  "lattafa-the-kingdom": {
    // Le flacon et l'étui ne portent que « المملكة · THE KINGDOM » : aucune
    // mention de genre n'est imprimée dessus, la fiche prend donc ce nom-là,
    // comme le fait déjà `maison-alhambra-salvo` pour son « SALVO ELIXIR ».
    name: "The Kingdom",
    brand: "Lattafa",
    // Au-dessus de Khamrah et de Yara, et c'est voulu : même maison, même
    // contenance, mais un flacon nettement plus habillé — verre strié, cristaux
    // sertis, capuchon lourd — que la maison facture plus cher en boutique.
    // Sous Rifaaqat (39,90 €) malgré tout, pour ne pas déplacer Lattafa hors du
    // segment d'entrée où le reste du catalogue la range. Prix barré au ratio
    // habituel (~-25 %).
    price: 29.9,
    oldPrice: 39.9,
    // Valeurs de démonstration. Sorti en 2024, il n'a ni l'ancienneté de
    // Khamrah ni la notoriété de Yara : un compteur à quatre chiffres serait
    // invraisemblable à côté d'eux.
    rating: 4.7,
    reviews: 214,
    // Lu sur l'étui : « EAU DE PARFUM | NATURAL SPRAY | VAPORISATEUR ».
    concentration: "Eau de parfum",
    // Lu sur l'étui : « 100ml℮ · 3.4FL.OZ. ».
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "The Kingdom s'annonce par une note fruitée nette, poire et cassis, que la pivoine arrondit dès les premières minutes : l'ouverture est vive, presque acidulée, et elle ne s'attarde pas. Le cœur bascule vers la pâtisserie — praline grillée et fève tonka, tempérées par un jasmin discret qui maintient un fil floral sous le sucre. Le fond est celui d'un oriental classique : vanille dense, bois de santal crémeux, ambre et musc, dont la chaleur remonte à mesure que le fruit s'efface. La tenue est longue, six à huit heures sur la peau et davantage sur un vêtement, avec un sillage présent sans être écrasant. Le flacon strié couleur or rose, serti de cristaux sur ses arêtes, annonce exactement ce que fait le jus : une gourmandise habillée.",
    // Pas de `viralNote` : `olfactive-twins.ts` ne porte aucune entrée pour ce
    // slug, et rien dans le dépôt ne documente une viralité pour ce flacon.
    // Le champ est optionnel et une fiche sans note documentée n'affiche
    // simplement rien — c'est ce que dit son commentaire d'interface.
    topNotes: ["Poire", "Cassis", "Pivoine"],
    heartNotes: ["Praline", "Fève tonka", "Jasmin"],
    baseNotes: ["Vanille", "Bois de santal", "Ambre", "Musc"],
    // Praline, tonka, vanille : le fruité de tête tombe en quelques minutes et
    // ce qui reste sur la peau est un gourmand. Tête « Gourmand » cohérente
    // avec la famille `gourmande` que `reference-perfumes.ts` donne déjà au
    // slug — c'est le seul point sur lequel cette entrée et le flacon
    // photographié tombent d'accord.
    family: "Gourmand · Fruité · Floral",
    badges: ["Gourmand", "Eau de parfum", "Fabriqué à Dubaï", "Authenticité garantie"],
    image: "/assets/products/dp_parfumerie-lattafa-the-kingdom-vignette.webp",
    // Quatre vues sur huit, et les quatre écartées le sont pour cause de
    // flacon : deux montrent le corps or SOMBRE du masculin (l'une accompagnée
    // de deux décants 5 ml et 10 ml, qui annoncent une contenance que la fiche
    // ne vend pas), une troisième ne fait que 180 px de côté, et la quatrième
    // porte le filigrane d'un revendeur sur une plaque gravée illisible.
    //
    // Restent le packshot studio (repris en vignette : fond blanc, flacon
    // centré, c'est le seul qui tienne réduit), les deux vues de l'étui — celle
    // de studio pour la lisibilité des mentions, celle sur drap pour montrer ce
    // que le client reçoit — et le gros plan en vitrine, qui est la seule image
    // où l'on distingue les cristaux sertis et la gravure du capuchon.
    gallery: [
      "/assets/products/dp_parfumerie-lattafa-the-kingdom-vignette.webp",
      "/assets/products/lattafa-the-kingdom/dp_parfumerie-lattafa-the-kingdom-coffret-01.jpg",
      "/assets/products/lattafa-the-kingdom/dp_parfumerie-lattafa-the-kingdom-coffret-02.jpg",
      "/assets/products/lattafa-the-kingdom/dp_parfumerie-lattafa-the-kingdom-env-01.jpg",
    ],
  },
  "khadlaj-sawaar-vanille-blanc": {
    name: "Sawaar Vanille Blanc",
    brand: "Khadlaj",
    // Première fiche Khadlaj du dépôt : aucun prix de maison à respecter, et
    // `reference-perfumes.ts` ne connaît pas cette référence. Le repère est
    // donc la concentration, seule chose que l'étui affirme noir sur blanc —
    // « EXTRAIT DE PARFUM ». On le place au-dessus des eaux de parfum Lattafa
    // et de Rifaaqat, sous Vanilla Voyage (58,90 €) qui reste le haut du rail
    // gourmand. Prix barré au ratio habituel (~-27 %).
    price: 34.9,
    oldPrice: 47.9,
    // Valeurs de démonstration, les plus basses des trois fiches importées
    // ensemble : sorti en 2025, c'est la référence la plus récente du
    // catalogue, et le compteur doit le dire.
    rating: 4.6,
    reviews: 96,
    // Lu sur l'étui : « EXTRAIT DE PARFUM · إكستراكت دي برفيوم ».
    concentration: "Extrait de parfum",
    // Lu sur l'étui, à côté de la concentration : « 100ml ».
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Sawaar Vanille Blanc porte bien son nom : la vanille est là dès la première seconde, mais claire, presque crayeuse, relevée d'un sucre glace et d'une pomme qui lui donnent du relief avant qu'elle ne s'épaississe. Le cœur l'enveloppe d'un bois de cachemire cotonneux et d'un ambre doux, tandis qu'une fleur blanche discrète empêche le sucre de s'installer seul. Le fond revient à la vanille, plus sombre cette fois, adossée à un santal crémeux et à un benjoin résineux qui apporte la profondeur balsamique qu'on attend d'un extrait. La concentration s'entend : le sillage est dense les deux premières heures, puis se rapproche de la peau, où il tient très longtemps. Un vanillé blanc, plus soyeux que sucré, à l'image du flacon ovale nacré et de ses deux cristaux.",
    // Pas de `viralNote` : référence de 2025, absente d'`olfactive-twins.ts`
    // comme de `reference-perfumes.ts`. Rien à documenter, donc rien à écrire.
    topNotes: ["Vanille", "Sucre glace", "Pomme"],
    heartNotes: ["Bois de cachemire", "Ambre", "Fleur blanche"],
    baseNotes: ["Vanille", "Bois de santal", "Benjoin"],
    // Seule fiche des trois dont la famille ne peut PAS s'appuyer sur
    // `reference-perfumes.ts`, qui ignore la référence : on la déclare donc
    // explicitement plutôt que de laisser `familyOf` compter les mots. Le
    // comptage se tromperait d'ailleurs — « bois de cachemire », « bois de
    // santal » et « benjoin » lui donnent trois voix boisées à 3 points contre
    // aucune pour la vanille, qui n'entre dans aucun dictionnaire de famille.
    // Un vanillé blanc serait sorti « Boisé ».
    family: "Gourmand · Vanillé · Boisé",
    badges: ["Vanillé", "Extrait de parfum", "Fabriqué à Dubaï", "Authenticité garantie"],
    image: "/assets/products/dp_parfumerie-khadlaj-sawaar-vanille-blanc-vignette.webp",
    // Quatre vues sur sept. Écartées : une photo de 180 px de côté ; une
    // reprise du même cadrage étui-verso que `coffret-02`, en plus petit ; et
    // une mise en scène sur plan de travail où le flacon partage l'image avec
    // quatre vaporisateurs « Royal Musk » — d'autres parfums, qui laisseraient
    // croire qu'ils font partie de l'achat.
    //
    // Le packshot sert de vignette parce que c'est le seul visuel où le flacon
    // ovale est détouré sur blanc et centré : sa forme est large et basse, elle
    // supporte mal un recadrage carré depuis une photo de scène. Les deux vues
    // d'étui sont gardées ensemble et ne font pas doublon — l'une montre le
    // recto dessiné, l'autre le verso, seul endroit où se lisent la
    // concentration et la contenance. La photo en main clôt la série : c'est la
    // seule où le bouchon est retiré et où l'on voit le vaporisateur.
    gallery: [
      "/assets/products/dp_parfumerie-khadlaj-sawaar-vanille-blanc-vignette.webp",
      "/assets/products/khadlaj-sawaar-vanille-blanc/dp_parfumerie-khadlaj-sawaar-vanille-blanc-coffret-01.jpg",
      "/assets/products/khadlaj-sawaar-vanille-blanc/dp_parfumerie-khadlaj-sawaar-vanille-blanc-coffret-02.jpg",
      "/assets/products/khadlaj-sawaar-vanille-blanc/dp_parfumerie-khadlaj-sawaar-vanille-blanc-porte-01.jpg",
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  "afnan-9pm": {
    name: "9PM",
    brand: "Afnan",
    // Le moins cher des quatre : 9PM est le best-seller d'entrée de gamme du
    // rayon, celui qu'on recommande justement parce qu'il ne coûte rien face
    // aux niches qu'on lui compare. Le poser au tarif Paris Corner (39,90 €)
    // aurait contredit l'argument. Calé sous Reef 33 (49,90 €) et au-dessus de
    // Marwa (29,90 €), prix barré au ratio des autres fiches (~-26 %).
    // Réaligné sur la médiane marché (25,99 € sur 3 relevés), arrondi au prix
    // de boutique — règle du 06/09/26 : au-delà de 15 % d'écart avec le marché,
    // le prix suit la médiane. Le site affichait 30 €, soit +15 %.
    price: 25.9,
    oldPrice: 46.9,
    // Valeurs de démonstration stables, comme les autres fiches rédigées.
    // C'est le seul compteur d'avis du catalogue à passer les 500 : 9PM est
    // sorti en 2020 et reste, cinq ans plus tard, l'un des flacons les plus
    // vendus du marché oriental abordable. Lui donner les 142 avis d'une
    // nouveauté aurait sonné faux sur la fiche la plus visitée du rayon.
    rating: 4.8,
    reviews: 512,
    // Pas de « EDP 30% » : Afnan ne publie aucun taux de concentration pour
    // cette référence. Le carton photographié n'annonce que « eau de parfum
    // vaporisateur », on s'en tient là.
    concentration: "Eau de parfum",
    // Les six visuels marchands et les rendus studio portent tous
    // « e100ml 3.4 Fl.oz » gravé sur le panneau noir.
    volume: "100ml",
    // Et non « Fabriqué à Dubaï » comme les huit autres fiches : Afnan est une
    // maison de SHARJAH, le site le dit lui-même dans la carte marque de
    // `_home-client.tsx` (« origin: "Sharjah" »). Recopier Dubaï par habitude
    // aurait mis deux origines contradictoires à deux clics d'écart.
    origin: "Fabriqué aux Émirats",
    description:
      "9PM s'ouvre sur une pomme verte croquante, presque acidulée, que la cannelle vient immédiatement réchauffer — l'accord signature du parfum, reconnaissable en deux secondes. La bergamote et une lavande sauvage tiennent cette ouverture à distance du bonbon : il y a du vert et de l'amer sous le fruit, et c'est ce qui empêche l'ensemble de tourner au sirop. Le cœur s'adoucit sur une fleur d'oranger et un muguet discrets, à peine posés, dont le rôle est surtout de faire la jonction. Puis le fond prend toute la place : vanille, fève tonka et ambre s'installent en couche épaisse, resserrés par un patchouli sombre qui leur donne du grain. C'est là que 9PM se joue — un sillage sucré, chaud, très projetant les premières heures, qui tient huit à dix heures sur la peau et bien davantage sur les vêtements.",
    // Aucun original nommé : `olfactive-twins.ts` ne porte pas d'entrée pour ce
    // slug, et la règle du champ interdit de désigner un classique sans elle.
    // La phrase parle donc de ce qui est vérifiable — la viralité du flacon et
    // le rapport tenue/prix que les vidéos mettent en avant.
    viralNote:
      "L'un des flacons les plus commentés des réseaux sociaux depuis 2020, où il est cherché pour son accord pomme-cannelle-vanille et pour une tenue que les vidéos comparent volontiers à celle de parfums bien plus chers.",
    // Pyramide officielle Afnan (us.afnan.com/products/9-pm). Le site marchand
    // présentait « Patchouli, Vanille, Cannelle, Fleur d'oranger » comme un
    // cœur, alors que ce paquet mélange une tête (cannelle), un cœur (fleur
    // d'oranger) et un fond (patchouli, vanille).
    topNotes: ["Bergamote", "Lavandin", "Cannelle", "Pomme"],
    heartNotes: ["Muguet", "Fleur d'oranger"],
    baseNotes: ["Patchouli", "Ambre", "Vanille", "Fève tonka"],
    // « Ambré » et non « Aromatique », bien que `reference-perfumes.ts` classe
    // `afnan-9pm` en famille aromatique. Les deux taxonomies ne parlent pas de
    // la même chose : celle des références décrit l'ouverture (lavande,
    // bergamote), celle des fiches désigne la DOMINANTE telle qu'on la porte.
    // Or ce que 9PM laisse sur la peau pendant huit heures, c'est vanille,
    // tonka et ambre — la pomme et la lavande ont disparu depuis longtemps.
    // Une fiche déclarée aromatique enverrait le moteur de jumeaux chercher
    // des fougères là où il faut des vanilles orientales.
    family: "Ambré",
    badges: ["Ambré", "Eau de parfum", "Fabriqué aux Émirats", "Authenticité garantie"],
    // Vignette prise dans le lot marchand plutôt que dans les rendus studio :
    // c'est le seul visuel détouré sur blanc pur, cadré carré d'origine, où le
    // panneau noir et le « 9 pm » chromé restent lisibles une fois réduits à
    // 68 px. Les rendus Higgsfield sont tous en portrait 4:5 — un recadrage
    // carré y coupe soit le bouchon sphère, soit la ligne « AFNAN ».
    //
    // La vignette carrée dédiée a été retirée : à 500 x 500 elle sortait
    // visiblement pixellisée dès que la fiche l'affichait en grand. Les rendus
    // 1128 x 1400 de la banque tiennent les deux usages, vignette comprise.
    image: "/assets/products/afnan-9pm/dp_parfumerie-afnan-9pm-ingredients-01.jpg",
    // Huit vues sur trente-trois. La banque est très fournie mais répétitive :
    // quatre rendus de serre nocturne se suivent sans rien changer d'autre que
    // la position des cageots, et cinq visuels sont à écarter pour cause
    // d'étiquette fausse (130 ml sur le coffret studio, 750 ml et 300 ml sur
    // deux serres, 8.4 Fl.oz sur la fenêtre pluvieuse, « superfilfleur » sur le
    // dernier, qui montre en prime un flacon teinté alors que le verre est
    // incolore). Restent sept vues qui disent chacune autre chose : le flacon
    // seul, l'étui reçu à la livraison, la pyramide posée sur fond blanc
    // (pomme, cannelle, lavande), puis quatre décors choisis pour une facette —
    // le bureau éclairé à la lampe pour l'heure que le nom revendique, le champ
    // de lavande pour l'ouverture, la soie ambrée pour le fond vanillé, les
    // tiges de verre pour la sphère chromée du bouchon.
    // `gallery[0]` reprend `image` — c'est la vue ouverte par défaut.
    gallery: [
      "/assets/products/afnan-9pm/dp_parfumerie-afnan-9pm-ingredients-01.jpg",
      "/assets/products/afnan-9pm/dp_parfumerie-afnan-9pm-packshot-01.jpg",
      "/assets/products/afnan-9pm/dp_parfumerie-afnan-9pm-coffret-01.jpg",
      "/assets/products/afnan-9pm/dp_parfumerie-afnan-9pm-env-01.jpg",
      "/assets/products/afnan-9pm/dp_parfumerie-afnan-9pm-env-02.jpg",
      "/assets/products/afnan-9pm/dp_parfumerie-afnan-9pm-env-03.jpg",
      "/assets/products/afnan-9pm/dp_parfumerie-afnan-9pm-env-04.jpg",
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  "paris-corner-khair-pistachio": {
    name: "Khair Pistachio",
    brand: "Paris Corner",
    // Aligné sur Rifaaqat (39,90 € / 52,90 €), l'autre eau de parfum 100 ml de
    // la même maison déjà en fiche. Même maison, même format, même position de
    // gamme : deux prix différents pour deux flacons interchangeables sur le
    // linéaire est exactement ce qui fait douter un visiteur.
    // Réaligné sur la médiane marché (19,61 € sur 3 relevés), arrondi au prix
    // de boutique. Le site affichait 25 €, soit +27 %.
    price: 19.9,
    oldPrice: 39.9,
    // Valeurs de démonstration stables. Au-dessus de Rifaaqat (142) parce que
    // Khair Pistachio est sorti deux ans plus tôt et a eu le temps d'accumuler,
    // en dessous des best-sellers Lattafa qui portent le catalogue.
    rating: 4.7,
    reviews: 214,
    concentration: "Eau de parfum",
    // « 3.4 FL OZ » lisible sur le flacon dans le visuel de campagne, et
    // annoncé 100 ml par la maison.
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Khair Pistachio ouvre sur la pistache, immédiatement et sans détour : une pistache grillée, salée au bord, tenue dans une crème glacée que la bergamote empêche de peser. La noisette et une pointe de cardamome élargissent l'accord, lui donnent un relief de pâtisserie plutôt que de bonbon. Le cœur s'écarte alors du dessert et laisse monter un bouquet clair — poire juteuse, pêche blanche, jasmin et pivoine — qui aère la matière et surprend quiconque attendait un gourmand linéaire. Le fond y revient pourtant, plus doux : crème fouettée, guimauve et fève tonka reconstruisent la texture lactée, posées sur un cèdre discret qui donne à l'ensemble de quoi tenir. Sillage rond et enveloppant, tenue longue, à l'image du flacon de verre vert dépoli et de son bouchon d'orfèvrerie dorée.",
    // Pas de `viralNote` : Khair Pistachio circule bien sur les réseaux, mais
    // aucune source du dépôt ne documente de rapprochement avec un original, et
    // le champ n'est pas là pour meubler.
    // Pyramide officielle Paris Corner
    // (pariscornerperfumes.com/products/khair-pistachio) — plus fournie que la
    // version abrégée d'ici, qui laissait de côté le rhum, la barbe à papa et
    // l'accord loukoum, c'est-à-dire ce qui distingue ce gourmand des autres.
    topNotes: ["Bergamote d'Italie", "Glace à la pistache", "Noisette", "Rhum", "Cardamome"],
    heartNotes: ["Géranium", "Pivoine blanche", "Muguet", "Jasmin", "Framboise", "Pêche blanche", "Poire"],
    baseNotes: ["Crème fouettée", "Guimauve", "Barbe à papa", "Accord loukoum", "Cacao", "Cèdre", "Santal", "Fève tonka"],
    // Le cœur est floral et le fond boisé, mais ni l'un ni l'autre ne mène :
    // ce qu'on sent à l'ouverture comme à la fin, c'est la pistache crémeuse.
    // La maison vend d'ailleurs le jus sous ce seul argument.
    family: "Gourmand",
    badges: ["Gourmand", "Eau de parfum", "Fabriqué à Dubaï", "Authenticité garantie"],
    // Lot Higgsfield du 05/09/26, dix-neuf vues. La vignette est un packshot
    // studio carré : le flacon entier y tient — bouchon ciselé et ligne
    // « PARIS CORNER » compris — avec la cardamome et la pistache en bord de
    // champ, donc le parfum se lit dès le rond de 68 px. Les sources font
    // 1856×2304 ; plutôt que de recadrer à pleine largeur, ce qui amputait la
    // base du flacon, les côtés sont complétés par réplication du fond studio.
    image: "/assets/products/dp_parfumerie-paris-corner-khair-pistachio-vignette.webp",
    // Cinq vues sur dix-neuf. Les six packshots fond blanc se ressemblent trop
    // pour cohabiter : on n'en garde qu'un, le plus net, plus celui qui montre
    // les matières au pied du flacon. L'étui reste — c'est ce que reçoit le
    // client, et son feuillage doré ne se devine nulle part ailleurs. Des onze
    // mises en situation, deux passent : le plateau de cuivre au citron vert,
    // qui donne le registre oriental sans noyer le flacon, et le drap de lin en
    // lumière rasante avec la poire posée à côté — la note de cœur rendue
    // littérale. Les autres (ruelle, escalier, tabouret, fenêtre) cadrent le
    // décor plus que le produit.
    gallery: [
      "/assets/products/paris-corner-khair-pistachio/dp_parfumerie-paris-corner-khair-pistachio-packshot-01.webp",
      "/assets/products/paris-corner-khair-pistachio/dp_parfumerie-paris-corner-khair-pistachio-ingredients-01.webp",
      "/assets/products/paris-corner-khair-pistachio/dp_parfumerie-paris-corner-khair-pistachio-coffret-01.webp",
      "/assets/products/paris-corner-khair-pistachio/dp_parfumerie-paris-corner-khair-pistachio-env-01.webp",
      "/assets/products/paris-corner-khair-pistachio/dp_parfumerie-paris-corner-khair-pistachio-env-02.webp",
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  "paris-corner-the-show-magnifique": {
    name: "The Show Magnifique",
    brand: "Paris Corner",
    // Cinq euros au-dessus des deux autres Paris Corner du catalogue, et c'est
    // le flacon qui le justifie : chapiteau émaillé rouge et blanc, couronne de
    // bouffon dorée, étui cylindrique assorti. C'est une édition décorative,
    // pas le flacon standard de la maison, et la fiche ne peut pas afficher le
    // même prix que Rifaaqat sans donner l'impression d'un tarif au hasard.
    // Prix barré au ratio des autres fiches (~-25 %).
    price: 44.9,
    oldPrice: 59.9,
    // Valeurs de démonstration stables, volontairement les plus basses du
    // catalogue : la référence est sortie en 2026, elle vient d'arriver. Un
    // compteur à trois chiffres démentirait la nouveauté.
    rating: 4.6,
    reviews: 58,
    concentration: "Eau de parfum",
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "The Show Magnifique s'ouvre sur un zeste d'orange et une fraise mûre, franchement sucrés, dans un registre de confiserie assumé dès la première seconde. Le cœur ne cherche pas à corriger cette gourmandise : la guimauve arrive, moelleuse et poudrée, et c'est la fleur d'oranger qui vient l'éclairer et l'empêcher de coller. Le fond est court et simple — une vanille douce sur un musc propre — mais c'est ce dépouillement qui rend le parfum portable là où l'ouverture pouvait faire craindre l'écœurement. Sillage rond, plutôt proche du corps après la première heure, avec une tenue moyenne à bonne sur la peau. Un jus de fête, à l'image de son chapiteau de foire et de sa couronne de bouffon dorée.",
    // Pas de `perfumer` : Fragrantica crédite un nom pour cette sortie 2026,
    // mais la règle du champ demande une attribution vérifiée à CE parfum, et
    // une fiche de base consultée de seconde main n'en est pas une. Le champ
    // reste vide tant que la source n'a pas été ouverte.
    topNotes: ["Orange", "Fraise"],
    heartNotes: ["Guimauve", "Fleur d'oranger"],
    baseNotes: ["Musc", "Vanille"],
    // Six notes seulement, et c'est volontaire : la pyramide publiée par la
    // maison n'en compte pas davantage. Gonfler la liste pour l'aligner sur les
    // fiches voisines aurait signifié inventer.
    // Famille : l'ouverture est fruitée et le cœur porte une fleur, mais le
    // corps du parfum est la guimauve, prolongée par la vanille du fond.
    family: "Gourmand",
    badges: ["Gourmand", "Eau de parfum", "Fabriqué à Dubaï", "Authenticité garantie"],
    // Banque Higgsfield du 04/09/26, convertie en WebP 1400 px : vingt rendus
    // triés sur la clarté des quatre coins — huit sur fond studio clair, douze
    // en décor. Remplace les trois JPEG de l'ancien lot (packshot, étui, prise
    // en main) et la vignette carrée, tous conservés sur disque mais plus
    // référencés.
    //
    // `gallery[0]` reprend `image` : le flacon y est entier sur fond clair, seul
    // cadrage où la couronne dorée — ce qui rend ce flacon reconnaissable —
    // survit à une réduction en vignette de 68 px.
    image: "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-packshot-01.webp",
    gallery: [
      "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-packshot-01.webp",
      "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-packshot-02.webp",
      "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-packshot-03.webp",
      "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-packshot-04.webp",
      "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-packshot-05.webp",
      "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-packshot-06.webp",
      "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-packshot-07.webp",
      "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-packshot-08.webp",
      "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-env-01.webp",
      "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-env-02.webp",
      "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-env-03.webp",
      "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-env-04.webp",
      "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-env-05.webp",
      "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-env-06.webp",
      "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-env-07.webp",
      "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-env-08.webp",
      "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-env-09.webp",
      "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-env-10.webp",
      "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-env-11.webp",
      "/assets/products/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-env-12.webp",
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Entrée non prévue au départ : la consigne annonçait Marshmallow Blush sans
  // photo exploitable. Les quatorze rendus existent bien, mais compressés dans
  // trois `archive.zip` que rien ne signale de l'extérieur. Ils sont propres,
  // le flacon y est conforme et son étiquette lisible : la fiche est donc
  // rédigée. À COLLER SEULEMENT si personne d'autre n'a pris ce slug, la carte
  // promo de `_home-client.tsx` pointant aujourd'hui vers `/promo-flash` et non
  // vers une page produit.
  "paris-corner-marshmallow-blush": {
    name: "Marshmallow Blush",
    brand: "Paris Corner",
    // Réaligné sur la médiane marché (24,90 € sur 3 relevés) — le site
    // affichait 39,50 €, soit +59 %, l'écart le plus large des fiches rédigées.
    // La carte du rail promo dans `_home-client.tsx` porte le même nombre : les
    // deux doivent bouger ensemble, sinon un flacon a deux prix.
    price: 24.9,
    oldPrice: 52.9,
    // Valeurs de démonstration stables. Entre Rifaaqat (142) et Khair Pistachio
    // (214) : sortie 2025, plus récente que l'un, plus ancienne que l'autre.
    rating: 4.7,
    reviews: 168,
    concentration: "Eau de parfum",
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Marshmallow Blush attaque sur un panier de fruits rouges — fraise et framboise, franches et acidulées — qu'un trait de citron rend nettes plutôt que confites. La transition est rapide : l'ambroxan s'installe au cœur et change la texture, sèche le fruit, l'étire et lui donne cette rondeur cotonneuse que la fleur d'oranger vient éclairer sans l'alourdir. Puis vient la guimauve, qui donne son nom au parfum et son grain au sillage : sucrée, poudreuse, un peu lactée, jamais collante. Le musc du fond la lisse et la colle à la peau, où elle reste plusieurs heures en se rapprochant progressivement. Un gourmand rose et léger, très fidèle à son flacon de résine marbrée et à sa coulée d'or.",
    // Pyramide officielle Paris Corner
    // (pariscornerperfumes.com/products/marshmallow-blush) : la crème fouettée
    // du cœur et la vanille du fond manquaient, or ce sont elles qui font la
    // texture lactée du sillage.
    topNotes: ["Fraise", "Framboise", "Citron"],
    heartNotes: ["Ambroxan", "Fleur d'oranger", "Crème fouettée"],
    baseNotes: ["Musc", "Guimauve", "Vanille"],
    // La guimauve du fond porte le parfum et lui donne son nom ; les fruits
    // rouges ne sont qu'une entrée en matière de quelques minutes.
    family: "Gourmand",
    badges: ["Gourmand", "Eau de parfum", "Fabriqué à Dubaï", "Authenticité garantie"],
    // Lot Higgsfield du 04/09/26, dix-neuf vues, en remplacement du rendu du
    // 01/07/26. La vignette est carrée et vit à la racine de products/ parce que
    // la page d'accueil pointe le même fichier sous le nom marshmallow-blush.webp :
    // une seule image à tenir pour la carte produit et pour le rail promo. Le
    // flacon entier y tient, fraise et framboises au pied — le fruit rouge de la
    // tête se lit dès le rond de 68 px.
    image: "/assets/products/dp_parfumerie-paris-corner-marshmallow-blush-vignette.webp",
    // Cinq vues sur dix-neuf. Sept packshots fond blanc, quasi identiques : on
    // garde le flacon nu et celui posé devant les fraises, framboises et gousses
    // de vanille, qui énumère la pyramide sans une ligne de texte. Des douze
    // mises en situation, trois passent — le bol de framboises sur le bois, la
    // commode verte à la fleur d'oranger (la note de cœur, et le seul contraste
    // franc au rose du flacon), et le drap de lin en lumière rasante pour la
    // texture cotonneuse du fond. Écartées : les scènes bleu nuit et la ruelle,
    // où le flacon rose passe au rouge et ne ressemble plus à ce qu'on livre.
    gallery: [
      "/assets/products/paris-corner-marshmallow-blush/dp_parfumerie-paris-corner-marshmallow-blush-packshot-01.webp",
      "/assets/products/paris-corner-marshmallow-blush/dp_parfumerie-paris-corner-marshmallow-blush-ingredients-01.webp",
      "/assets/products/paris-corner-marshmallow-blush/dp_parfumerie-paris-corner-marshmallow-blush-env-01.webp",
      "/assets/products/paris-corner-marshmallow-blush/dp_parfumerie-paris-corner-marshmallow-blush-env-02.webp",
      "/assets/products/paris-corner-marshmallow-blush/dp_parfumerie-paris-corner-marshmallow-blush-env-03.webp",
    ],
  },

  // ─── Oud Elite · Pure Black Oud ─────────────────────────────────────────────
  // Première fiche de la maison sur le site : « Oud Elite » n'était jusqu'ici
  // qu'un logo dans le mur des marques (`_home-client.tsx`) et une entrée du
  // dictionnaire de `search-catalog.ts`, sans un seul produit derrière. La
  // banque photo du 04/09/26 en fournit dix-neuf vues, ce qui suffit à ouvrir
  // le rayon.
  "oud-elite-pure-black-oud": {
    name: "Pure Black Oud",
    brand: "Oud Elite",
    // Positionné entre L'Or de Saba (78 €, Ahmed Al Maghribi) et Amber Oud
    // (75 €, Al Haramain) : un oud de maison spécialisée, pas un gourmand
    // d'entrée de gamme. La remise suit le même écart que les autres ouds de
    // la sélection, autour de 25 %.
    price: 79.0,
    oldPrice: 105.0,
    // Valeurs de démonstration stables — nouveauté, donc moins d'avis que les
    // références installées du catalogue.
    rating: 4.8,
    reviews: 96,
    concentration: "Eau de parfum",
    volume: "100ml",
    origin: "Fabriqué à Dubaï",
    description:
      "Pure Black Oud s'ouvre sur une orange sanguine et une groseille acidulée qui allument le flacon avant de s'effacer : deux notes vives posées là pour empêcher l'oud d'attaquer de front. Le cœur bascule vite sur le bois — un oud de Cambodge fumé, résineux, tenu par le safran qui lui donne son mordant cuiré et par une rose sombre qui l'arrondit sans le sucrer. Le fond est celui d'un oriental classique de maison spécialisée : santal crémeux, ambre gris, patchouli et un musc animal qui accroche le tissu bien après la peau. Un sillage dense, à réserver aux soirées fraîches — deux pulvérisations tiennent la nuit entière.",
    topNotes: ["Orange sanguine", "Groseille", "Safran"],
    heartNotes: ["Oud du Cambodge", "Rose", "Bois de santal"],
    baseNotes: ["Ambre gris", "Patchouli", "Musc"],
    // L'oud porte tout le parfum : les fruits de tête durent quelques minutes,
    // et le fond ne fait que le prolonger.
    family: "Boisé",
    badges: ["Oud", "Eau de parfum", "Fabriqué à Dubaï", "Authenticité garantie"],
    // Banque Higgsfield du 04/09/26, convertie en WebP 1400 px : dix-neuf
    // rendus triés sur la clarté des quatre coins — six sur fond studio, treize
    // en décor.
    //
    // `gallery[0]` reprend `image` : le flacon noir laqué y est entier sur fond
    // clair, seul contraste qui le garde lisible réduit à 68 px. Sur les
    // décors sombres, un flacon noir sur fond noir ne montre plus que son
    // bouchon doré.
    image: "/assets/products/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-packshot-03.webp",
    gallery: [
      "/assets/products/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-packshot-03.webp",
      "/assets/products/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-packshot-01.webp",
      "/assets/products/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-packshot-02.webp",
      "/assets/products/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-packshot-04.webp",
      "/assets/products/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-packshot-05.webp",
      "/assets/products/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-packshot-06.webp",
      "/assets/products/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-env-01.webp",
      "/assets/products/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-env-02.webp",
      "/assets/products/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-env-03.webp",
      "/assets/products/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-env-04.webp",
      "/assets/products/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-env-05.webp",
      "/assets/products/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-env-06.webp",
      "/assets/products/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-env-07.webp",
      "/assets/products/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-env-08.webp",
      "/assets/products/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-env-09.webp",
      "/assets/products/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-env-10.webp",
      "/assets/products/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-env-11.webp",
      "/assets/products/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-env-12.webp",
      "/assets/products/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-env-13.webp",
    ],
  },
};
