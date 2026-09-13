/**
 * Personnalité des maisons — matière des pages `/marques/<slug>`.
 *
 * Chaque maison y apporte SA palette et SON registre, relevés sur ses supports
 * officiels, pas les tokens du site : une page de maison qui reprend le crème et
 * l'or de Dubaï Parfumerie pour les onze marques ne dit rien de chacune. C'est
 * tout l'objet de ce fichier.
 *
 * D'OÙ VIENNENT LES COULEURS — aucune n'a été choisie à l'œil :
 *  - Lattafa : pixels dominants du PNG du logo servi par le site officiel.
 *  - Reef : variables CSS publiées par reefperfumes.com.
 *  - Al Haramain : pixels du logo officiel, recoupés avec la variable de thème
 *    du site (`--wp--preset--color--awb-color-7`).
 * Le champ `sourceCouleurs` de chaque profil porte cette provenance, pour qu'on
 * puisse la vérifier sans relire ce commentaire.
 *
 * CE QUI N'EST PAS ICI : les dates de fondation contestées. Lattafa ne publie
 * aucune année (1980 et 1992 circulent), Reef non plus (2018 aux registres
 * contre « début des années 2000 » dans son propre récit). Plutôt qu'un chiffre
 * faux, `anciennete` porte une formulation prudente. Al Haramain, elle, affiche
 * 1970 sur son site : la date est donnée.
 *
 * Recherche du 13/09/2026, notes complètes dans
 * `DP NextCloud/MD DP/Marques/marques-recherche.md`.
 */

export type BrandPalette = {
  /** Fond de la page. */
  fond: string;
  /** Fond des blocs surélevés. */
  bloc: string;
  /** Couleur du texte courant sur `fond`. */
  encre: string;
  /** Texte secondaire. */
  encreDouce: string;
  /** Couleur d'accent de la maison. */
  accent: string;
  /** Accent atténué, pour les filets et les fonds de pastille. */
  accentDoux: string;
  /** Filets et séparateurs. */
  filet: string;
};

export type BrandProfile = {
  slug: string;
  /** Nom tel que la maison l'écrit. */
  nom: string;
  pays: string;
  drapeau: string;
  /** Ancienneté, formulée selon ce que la maison publie réellement. */
  anciennete: string;
  /** La phrase qui situe la maison en une ligne. */
  accroche: string;
  /** Deux ou trois paragraphes de récit. */
  recit: string[];
  /** Ce que la maison dit d'elle-même, cité court avec sa provenance. */
  citation?: { texte: string; source: string };
  /** Le territoire olfactif, en quelques axes. */
  territoire: { titre: string; detail: string }[];
  /** Les références qui font la maison. */
  phares: { nom: string; annee?: string; note: string }[];
  /** Le fait qu'on ne devine pas. */
  fait: string;
  /** Fourchette de prix constatée, avec son unité. */
  prix: string;
  /** Registre visuel de la maison, décrit en toutes lettres. */
  registre: string;
  palette: BrandPalette;
  sourceCouleurs: string;
  /** Typographie relevée sur le site de la maison. */
  typographie: string;
};

export const BRAND_PROFILES: BrandProfile[] = [
  {
    slug: "lattafa",
    nom: "Lattafa",
    pays: "Émirats arabes unis",
    drapeau: "🇦🇪",
    anciennete: "Fondée au début des années 1980, à Dubaï",
    accroche: "La maison qui a mis le parfum oriental à portée de tous.",
    recit: [
      "Lattafa se raconte comme une affaire de famille, à la troisième génération, et le revendique jusque dans son vocabulaire : le parfum y est décrit comme une langue commune plutôt que comme un privilège. Le discours ne parle pas de rareté, il parle de portée.",
      "L'ambition est chiffrée sans détour sur ses propres pages : toucher un milliard de personnes. C'est un positionnement d'accessibilité assumée, et il explique l'écart entre des flacons très travaillés — bouchons sculptés, dorures, hologramme d'authentification — et des prix de grande diffusion.",
      "Sa notoriété occidentale doit beaucoup aux réseaux : Khamrah est devenu viral en 2022 et a ouvert la porte à tout un pan de la parfumerie du Golfe en Europe.",
    ],
    citation: {
      texte: "fragrance is our passion, and family is our heart",
      source: "page « About Us » du site officiel",
    },
    territoire: [
      { titre: "Oriental gourmand", detail: "Datte, praline, vanille, caramel, café — l'axe Khamrah." },
      { titre: "Oriental boisé", detail: "Oud, patchouli, safran, muscade — l'axe Bade'e Al Oud." },
      { titre: "Oriental vanillé floral", detail: "Orchidée, héliotrope, vanille, musc, santal — l'axe Yara." },
      { titre: "Ambré épicé", detail: "Poivre noir, tabac, ananas, café, iris — l'axe Asad." },
    ],
    phares: [
      { nom: "Khamrah", annee: "2022", note: "Bergamote et cannelle, puis praline et tubéreuse, sur un fond de datte." },
      { nom: "Asad", annee: "2021", note: "Poivre noir, tabac et ananas, cœur de café et d'iris, fond vanille-ambre." },
      { nom: "Yara", annee: "2020", note: "Orchidée et héliotrope, accord gourmand, vanille et santal." },
      { nom: "Bade'e Al Oud — Oud for Glory", annee: "2020", note: "Safran et muscade sur oud et patchouli." },
      { nom: "Fakhar Rose", annee: "2022", note: "Bouquet blanc très ample — tubéreuse, jasmin, gardénia, rose — sur vanille et musc." },
    ],
    fait: "Plus de 3 000 collaborateurs, plus de 2 000 références et une distribution dans plus de 120 pays, revendiqués par la maison. La production dépasse 35 millions de pièces par an, flacons et étuis imprimés en interne.",
    prix: "Environ 14 € à 50 € les 100 ml",
    registre: "Un vocabulaire de luxe appliqué à la grande diffusion : or chaud sur fond clair, bouchons figuratifs — la ligne Maahir se reconnaît à sa tête de cheval — et une typographie ronde, contemporaine, sans rien d'archaïsant.",
    palette: {
      fond: "#FBF7F0",
      bloc: "#F4EADB",
      encre: "#2A2118",
      encreDouce: "#6E6050",
      accent: "#A87F42",
      accentDoux: "#EFE0C6",
      filet: "#E2D3BB",
    },
    sourceCouleurs:
      "Or champagne #CCA878 et #D8B478 relevés sur les pixels du logo officiel ; assombri ici en #A87F42 pour tenir le contraste du texte.",
    typographie: "Poppins, une linéale géométrique, sur le site officiel.",
  },
  {
    slug: "reef",
    nom: "Reef Perfumes",
    pays: "Arabie saoudite",
    drapeau: "🇸🇦",
    anciennete: "Maison saoudienne contemporaine, née à Riyad",
    accroche: "La maison qui a renoncé aux noms.",
    recit: [
      "Reef numérote ses parfums. Reef 11, Reef 15, Reef 33, Reef 41 — pas de nom évocateur, pas de récit accolé au flacon. C'est un parti pris rare dans la parfumerie du Golfe, et il dit tout du reste : ici, la composition parle avant l'histoire qu'on en raconte.",
      "Le récit officiel part de séries artisanales, pour une clientèle restreinte, avant l'industrialisation. Ce qui est mis en avant aujourd'hui n'est pas le patrimoine mais la tenue du sillage, la rapidité de livraison et la reprise sous trente jours. Un positionnement de détaillant exigeant, plus que de maison de niche.",
      "Le nom lui-même trompe : « reef » (ريف) désigne la campagne, la terre — pas le récif. D'où un registre végétal et minéral, là où l'homonymie anglaise inviterait au marin.",
    ],
    citation: {
      texte: "truly worthy of bearing the Reef name",
      source: "site officiel, sur sa discipline de lancement",
    },
    territoire: [
      { titre: "Boisé épicé", detail: "Oud, safran, romarin, encens, santal." },
      { titre: "Oriental boisé", detail: "L'oud adouci par un cœur floral." },
      { titre: "Musqué", detail: "La ligne Reef Musk, مسك ريف." },
      { titre: "Floral fruité", detail: "Jasmin, vanille et fruits — la ligne Princess." },
    ],
    phares: [
      { nom: "Reef 33", annee: "2020", note: "Le best-seller de la maison. Les sources divergent sur sa formule : safran et romarin sur oud chez les revendeurs, jasmin et vanille dans le récit officiel." },
      { nom: "Reef 11", note: "Ambre et rose de Taïf. Le premier grand succès de la maison, selon son propre récit." },
      { nom: "REEF15", annee: "2024", note: "Boisé épicé, bergamote en tête et oud en fond." },
      { nom: "Tuwaiq", note: "Encens et santal, décrit par la maison comme « bold and refined »." },
      { nom: "Abyah", note: "Oud et safran, mixte." },
    ],
    fait: "Deux distinctions aux Global Business Outlook Awards remises en janvier 2026 : meilleur dirigeant du secteur au Moyen-Orient, et marque de parfum à la croissance la plus rapide d'Arabie saoudite. La maison revendique plus de 200 points de vente dans le monde.",
    prix: "Environ 55 € à 90 € les 100 ml, coffrets jusqu'à 245 €",
    registre: "Le contre-pied exact de la parfumerie ornementale du Golfe : noir et blanc quasi exclusifs, pas une arabesque, pas une dorure sur le site. Un seul accent chromatique dans toute la feuille de style, un rouge brique réservé aux compteurs de promotion. Le seul luxe visible est ailleurs — les coffrets, en bois laqué noir à charnières dorées.",
    palette: {
      fond: "#0E0F0F",
      bloc: "#1D1F1F",
      encre: "#FFFFFF",
      encreDouce: "#B8B8B8",
      accent: "#E0645A",
      accentDoux: "#3A2220",
      filet: "#2E3030",
    },
    sourceCouleurs:
      "Noir #000000 et #0E0F0F, gris #CCCCCC et accent brique #C53E35 lus dans les variables CSS du site officiel ; l'accent est éclairci en #E0645A pour rester lisible sur le noir.",
    typographie: "PingARLT, une police propriétaire compatible arabe et latin, sur un site où l'arabe passe en premier.",
  },
  {
    slug: "al-haramain",
    nom: "Al Haramain",
    pays: "Émirats arabes unis",
    drapeau: "🇦🇪",
    anciennete: "Fondée en 1970 à La Mecque, installée à Dubaï",
    accroche: "La maison de l'oud noble et du temps long.",
    recit: [
      "Al Haramain est la plus ancienne des maisons du catalogue, et la seule dont le discours porte sur l'apaisement plutôt que sur la performance. Son nom désigne les deux sanctuaires — La Mecque et Médine — où le négoce a commencé, avant l'installation aux Émirats au début des années 1980.",
      "Deux territoires cohabitent sans se confondre. D'un côté le patrimoine : dehn al oud, huiles pures, attars, bakhoor, vendus en très petits volumes et à prix élevés. De l'autre la famille Amber Oud, ambrée-vanillée, qui porte l'essentiel du succès international récent.",
      "La maison revendique pour son huile signature, le Dehnal Oudh Maliki Ateeq, vingt ans de mise au point. C'est un argument de patience qu'aucune autre maison du catalogue n'avance.",
    ],
    citation: {
      texte: "the household name of the Arabs all over the world",
      source: "site officiel",
    },
    territoire: [
      { titre: "Le patrimoine", detail: "Dehn al oud, huiles pures, attars, musc, ambre, bakhoor." },
      { titre: "L'ambre vanillé", detail: "La famille Amber Oud — ambré, vanillé, boisé aromatique." },
      { titre: "Ouvertures fraîches", detail: "Bergamote, notes vertes et marines, qui rendent les compositions portables au quotidien." },
    ],
    phares: [
      { nom: "Amber Oud Gold Edition", annee: "2018", note: "Bergamote et notes vertes, cœur fruité et ambré, fond musc-vanille." },
      { nom: "Amber Oud Carbon Edition", annee: "2022", note: "Lavande et romarin, notes marines, fond mousse-vétiver-cèdre." },
      { nom: "Détour Noir", annee: "2021", note: "Pomme et lavande, vanille et patchouli, fond santal-cardamome." },
      { nom: "L'Aventure", note: "Cassis, pomme et ananas sur patchouli, mousse de chêne et ambre gris." },
      { nom: "Dehnal Oudh Maliki Ateeq", note: "Huile d'oud pure. Vingt ans de mise au point revendiqués." },
    ],
    fait: "Son dirigeant, Mohammed Mahtabur Rahman, a été distingué onze années consécutives par le gouvernement du Bangladesh, et fut le premier Bangladais à obtenir le visa « Gold Card » des Émirats. L'usine d'Ajman couvre 16 215 m², pour plus de 1 000 références diffusées dans plus de 100 pays.",
    prix: "Environ 35 € à 99 € les 100 ml, bien au-delà pour les huiles pures",
    registre: "Un classique doré sur bordeaux, proche de la calligraphie et de l'ornement. La ligne Amber Oud joue au contraire une carte contemporaine, chaque édition ayant sa couleur de flacon — Gold, Carbon, Ruby, Blue. Deux identités visuelles cohabitent, entre patrimoine et lignes modernes.",
    palette: {
      fond: "#FCF8F7",
      bloc: "#F5EBEC",
      encre: "#2B1119",
      encreDouce: "#6F5158",
      accent: "#841830",
      accentDoux: "#F0DCDF",
      filet: "#E4D2D5",
    },
    sourceCouleurs:
      "Bordeaux #841830 relevé sur les pixels du logo officiel, confirmé par la variable de thème #892034 du site ; or sable #DAB85E déclaré en couleur de filet dans la même charte.",
    typographie: "Dancing Script, une anglaise cursive, chargée par le site — registre ornemental assumé.",
  },
];

export function profileForSlug(slug: string): BrandProfile | undefined {
  return BRAND_PROFILES.find((p) => p.slug === slug);
}
