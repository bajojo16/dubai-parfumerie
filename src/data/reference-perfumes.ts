/**
 * Base de parfums de référence — les grands parfums du marché, cités NOMINATIVEMENT.
 *
 * Cadre légal (identique à celui de `olfactive-twins.ts`) : usage nominatif des
 * marques, TEXTE SEUL. Aucun logo, aucune image, aucune couleur de marque n'est
 * reprise ici — seuls le nom du parfum, celui de la maison et le profil olfactif.
 * Le vocabulaire d'interface reste « inspiré de » / « jumeau olfactif » /
 * « au profil proche » ; jamais « clone », « copie », « dupe », « équivalent ».
 *
 * Ce fichier ne contient QUE des données : aucun import, aucune dépendance.
 * Il pèse plusieurs centaines d'entrées et n'a rien à faire dans le bundle
 * initial — le composant le charge en `import()` dynamique au premier usage du
 * champ de recherche (même motif que `SearchOverlay` avec `search-catalog`).
 *
 * Règle de véracité : chaque entrée correspond à un parfum réellement
 * commercialisé. Les `accords` reprennent les notes dominantes réelles de la
 * composition, pas une impression. `year` est optionnel : il n'est renseigné
 * que lorsque l'année de sortie est connue avec certitude.
 *
 * Organisation : une section par maison, ordre alphabétique des maisons.
 */

/** Genre commercial déclaré par la maison. */
export type ReferenceGender = "femme" | "homme" | "mixte";

/**
 * Familles olfactives canoniques.
 * On garde un vocabulaire fermé : la fonction d'appariement compare des clés,
 * pas des phrases libres — « Ambré · Sucré · Floral » n'est pas comparable.
 */
export type ReferenceFamily =
  | "hesperidee"
  | "aromatique"
  | "fougere"
  | "verte"
  | "aquatique"
  | "florale"
  | "florale-fruitee"
  | "chypree"
  | "boisee"
  | "cuir"
  | "ambree"
  | "gourmande"
  | "musquee";

/** Libellés d'affichage — la clé reste technique, le libellé est traduisible. */
export const FAMILY_LABELS: Record<ReferenceFamily, string> = {
  hesperidee: "Hespéridée",
  aromatique: "Aromatique",
  fougere: "Fougère",
  verte: "Verte",
  aquatique: "Aquatique",
  florale: "Florale",
  "florale-fruitee": "Florale fruitée",
  chypree: "Chyprée",
  boisee: "Boisée",
  cuir: "Cuir",
  ambree: "Ambrée",
  gourmande: "Gourmande",
  musquee: "Musquée",
};

export type ReferencePerfume = {
  /** slug stable — sert de clé d'appariement et d'ancre d'URL */
  id: string;
  name: string;
  /** la maison, en toutes lettres (usage nominatif, texte seul) */
  house: string;
  /** année de sortie, seulement quand elle est certaine */
  year?: number;
  gender: ReferenceGender;
  family: ReferenceFamily;
  /** 3 à 6 notes dominantes réelles de la composition */
  accords: string[];
};

export const REFERENCE_PERFUMES: ReferencePerfume[] = [
  // ─── Acqua di Parma ────────────────────────────────────────────────────────
  { id: "acqua-di-parma-colonia", name: "Colonia", house: "Acqua di Parma", year: 1916, gender: "mixte", family: "hesperidee", accords: ["citron de sicile", "lavande", "romarin", "vétiver", "patchouli"] },
  { id: "acqua-di-parma-colonia-essenza", name: "Colonia Essenza", house: "Acqua di Parma", year: 2010, gender: "homme", family: "hesperidee", accords: ["bergamote", "néroli", "petit-grain", "vétiver", "musc"] },
  { id: "acqua-di-parma-colonia-intensa", name: "Colonia Intensa", house: "Acqua di Parma", year: 2007, gender: "homme", family: "hesperidee", accords: ["bergamote", "gingembre", "cardamome", "cuir", "patchouli"] },
  { id: "acqua-di-parma-colonia-club", name: "Colonia Club", house: "Acqua di Parma", year: 2012, gender: "mixte", family: "hesperidee", accords: ["menthe", "bergamote", "lavande", "néroli", "musc"] },
  { id: "acqua-di-parma-colonia-leather", name: "Colonia Leather", house: "Acqua di Parma", year: 2014, gender: "mixte", family: "cuir", accords: ["cuir", "safran", "poivre rose", "bois de cade", "patchouli"] },
  { id: "acqua-di-parma-arancia-di-capri", name: "Blu Mediterraneo Arancia di Capri", house: "Acqua di Parma", year: 2001, gender: "mixte", family: "hesperidee", accords: ["orange", "mandarine", "cardamome", "caramel", "musc"] },
  { id: "acqua-di-parma-fico-di-amalfi", name: "Blu Mediterraneo Fico di Amalfi", house: "Acqua di Parma", year: 2007, gender: "mixte", family: "verte", accords: ["figue", "bergamote", "cèdre", "jasmin", "musc"] },
  { id: "acqua-di-parma-mirto-di-panarea", name: "Blu Mediterraneo Mirto di Panarea", house: "Acqua di Parma", year: 2005, gender: "mixte", family: "aquatique", accords: ["myrte", "basilic", "bergamote", "cèdre", "ambre"] },
  { id: "acqua-di-parma-bergamotto-di-calabria", name: "Blu Mediterraneo Bergamotto di Calabria", house: "Acqua di Parma", year: 2010, gender: "mixte", family: "hesperidee", accords: ["bergamote", "cédrat", "gingembre", "cèdre", "musc"] },

  // ─── Amouage ───────────────────────────────────────────────────────────────
  { id: "amouage-interlude-man", name: "Interlude Man", house: "Amouage", year: 2012, gender: "homme", family: "ambree", accords: ["encens", "oud", "ambre", "cuir", "origan", "opoponax"] },
  { id: "amouage-interlude-woman", name: "Interlude Woman", house: "Amouage", year: 2012, gender: "femme", family: "ambree", accords: ["encens", "opoponax", "ambre", "rose", "musc"] },
  { id: "amouage-reflection-man", name: "Reflection Man", house: "Amouage", year: 2007, gender: "homme", family: "florale", accords: ["poivre rose", "néroli", "iris", "jasmin", "santal", "vétiver"] },
  { id: "amouage-reflection-woman", name: "Reflection Woman", house: "Amouage", year: 2007, gender: "femme", family: "florale", accords: ["jasmin", "freesia", "fleur d'oranger", "iris", "santal", "musc"] },
  { id: "amouage-jubilation-xxv", name: "Jubilation XXV", house: "Amouage", year: 2007, gender: "homme", family: "ambree", accords: ["encens", "myrrhe", "labdanum", "patchouli", "cuir", "orange"] },
  { id: "amouage-jubilation-25-woman", name: "Jubilation 25 Woman", house: "Amouage", year: 2007, gender: "femme", family: "chypree", accords: ["myrrhe", "rose", "patchouli", "mousse de chêne", "labdanum", "fruits"] },
  { id: "amouage-gold-man", name: "Gold Man", house: "Amouage", year: 1983, gender: "homme", family: "ambree", accords: ["encens", "myrrhe", "rose", "civette", "cuir", "ambre gris"] },
  { id: "amouage-gold-woman", name: "Gold Woman", house: "Amouage", year: 1983, gender: "femme", family: "florale", accords: ["rose", "jasmin", "muguet", "encens", "civette", "ambre gris"] },
  { id: "amouage-epic-man", name: "Epic Man", house: "Amouage", year: 2009, gender: "homme", family: "boisee", accords: ["oud", "encens", "cannelle", "cumin", "géranium", "myrrhe"] },
  { id: "amouage-epic-woman", name: "Epic Woman", house: "Amouage", year: 2009, gender: "femme", family: "boisee", accords: ["oud", "rose", "encens", "cannelle", "santal"] },
  { id: "amouage-honour-man", name: "Honour Man", house: "Amouage", year: 2011, gender: "homme", family: "boisee", accords: ["encens", "vétiver", "cuir", "poivre", "bois de gaïac"] },
  { id: "amouage-honour-woman", name: "Honour Woman", house: "Amouage", year: 2011, gender: "femme", family: "florale", accords: ["tubéreuse", "gardénia", "jasmin", "encens", "musc"] },
  { id: "amouage-lyric-man", name: "Lyric Man", house: "Amouage", year: 2008, gender: "homme", family: "boisee", accords: ["rose", "oud", "encens", "cannelle", "santal", "safran"] },
  { id: "amouage-lyric-woman", name: "Lyric Woman", house: "Amouage", year: 2008, gender: "femme", family: "florale", accords: ["rose de taïf", "oud", "encens", "angélique", "vanille"] },
  { id: "amouage-memoir-man", name: "Memoir Man", house: "Amouage", year: 2010, gender: "homme", family: "fougere", accords: ["absinthe", "lavande", "encens", "oud", "cuir", "vanille"] },
  { id: "amouage-memoir-woman", name: "Memoir Woman", house: "Amouage", year: 2010, gender: "femme", family: "chypree", accords: ["absinthe", "rose", "jasmin", "encens", "mousse de chêne", "cuir"] },

  // ─── Giorgio Armani ────────────────────────────────────────────────────────
  { id: "armani-acqua-di-gio", name: "Acqua di Giò", house: "Giorgio Armani", year: 1996, gender: "homme", family: "aquatique", accords: ["bergamote", "néroli", "romarin", "jasmin", "patchouli", "musc blanc"] },
  { id: "armani-acqua-di-gio-profumo", name: "Acqua di Giò Profumo", house: "Giorgio Armani", year: 2015, gender: "homme", family: "aquatique", accords: ["bergamote", "patchouli", "encens", "sauge", "géranium"] },
  { id: "armani-acqua-di-gio-absolu", name: "Acqua di Giò Absolu", house: "Giorgio Armani", year: 2018, gender: "homme", family: "aquatique", accords: ["bergamote", "pomme", "romarin", "patchouli", "fève tonka"] },
  { id: "armani-acqua-di-gioia", name: "Acqua di Gioia", house: "Giorgio Armani", year: 2010, gender: "femme", family: "aquatique", accords: ["menthe", "citron", "pivoine", "jasmin", "cèdre", "sucre brun"] },
  { id: "armani-code-homme", name: "Armani Code", house: "Giorgio Armani", year: 2004, gender: "homme", family: "ambree", accords: ["bergamote", "citron", "fleur d'oranger", "fève tonka", "olivier", "cuir"] },
  { id: "armani-code-profumo", name: "Armani Code Profumo", house: "Giorgio Armani", year: 2016, gender: "homme", family: "ambree", accords: ["cardamome", "muscade", "fleur d'oranger", "ambre", "fève tonka", "bois"] },
  { id: "armani-stronger-with-you", name: "Stronger With You", house: "Giorgio Armani", year: 2017, gender: "homme", family: "ambree", accords: ["cardamome", "châtaigne grillée", "vanille", "sauge", "lavande"] },
  { id: "armani-stronger-with-you-intensely", name: "Stronger With You Intensely", house: "Giorgio Armani", year: 2019, gender: "homme", family: "gourmande", accords: ["vanille", "châtaigne", "caramel", "cardamome", "fève tonka", "ciste"] },
  { id: "armani-stronger-with-you-absolutely", name: "Stronger With You Absolutely", house: "Giorgio Armani", year: 2021, gender: "homme", family: "gourmande", accords: ["rhum", "vanille", "cardamome", "bois ambré", "fève tonka"] },
  { id: "armani-in-love-with-you", name: "In Love With You", house: "Giorgio Armani", year: 2018, gender: "femme", family: "gourmande", accords: ["cerise noire", "pivoine", "vanille", "patchouli"] },
  { id: "armani-because-its-you", name: "Because It's You", house: "Giorgio Armani", year: 2019, gender: "femme", family: "florale-fruitee", accords: ["framboise", "pivoine", "vanille", "musc", "ambre"] },
  { id: "armani-si", name: "Sì", house: "Giorgio Armani", year: 2013, gender: "femme", family: "florale-fruitee", accords: ["cassis", "freesia", "rose de mai", "vanille", "patchouli", "musc"] },
  { id: "armani-si-passione", name: "Sì Passione", house: "Giorgio Armani", year: 2017, gender: "femme", family: "florale-fruitee", accords: ["poire", "cassis", "rose", "jasmin", "vanille", "praline"] },
  { id: "armani-prive-rose-darabie", name: "Privé Rose d'Arabie", house: "Giorgio Armani", year: 2010, gender: "mixte", family: "ambree", accords: ["rose", "oud", "safran", "vanille", "encens", "ambre"] },
  { id: "armani-prive-bois-dencens", name: "Privé Bois d'Encens", house: "Giorgio Armani", year: 2004, gender: "mixte", family: "boisee", accords: ["encens", "cèdre", "vétiver", "poivre rose"] },
  { id: "armani-prive-cuir-amethyste", name: "Privé Cuir Améthyste", house: "Giorgio Armani", year: 2007, gender: "mixte", family: "cuir", accords: ["cuir", "violette", "iris", "cardamome", "ambre"] },
  { id: "armani-prive-oud-royal", name: "Privé Oud Royal", house: "Giorgio Armani", year: 2010, gender: "mixte", family: "boisee", accords: ["oud", "safran", "encens", "ambre", "santal"] },

  // ─── L'Artisan Parfumeur ───────────────────────────────────────────────────
  { id: "artisan-mure-et-musc", name: "Mûre et Musc", house: "L'Artisan Parfumeur", year: 1978, gender: "mixte", family: "musquee", accords: ["mûre", "musc blanc", "agrumes", "bois"] },
  { id: "artisan-premier-figuier", name: "Premier Figuier", house: "L'Artisan Parfumeur", year: 1994, gender: "mixte", family: "verte", accords: ["figue", "lait de figue", "santal", "noix de coco"] },
  { id: "artisan-timbuktu", name: "Timbuktu", house: "L'Artisan Parfumeur", year: 2004, gender: "mixte", family: "boisee", accords: ["encens", "papyrus", "vétiver", "mangue verte", "poivre"] },
  { id: "artisan-passage-denfer", name: "Passage d'Enfer", house: "L'Artisan Parfumeur", year: 1999, gender: "mixte", family: "boisee", accords: ["encens", "lys blanc", "myrrhe", "santal", "musc"] },
  { id: "artisan-dzing", name: "Dzing!", house: "L'Artisan Parfumeur", year: 1999, gender: "mixte", family: "cuir", accords: ["cuir", "santal", "caramel", "musc", "fève tonka"] },
  { id: "artisan-tea-for-two", name: "Tea for Two", house: "L'Artisan Parfumeur", year: 2000, gender: "mixte", family: "boisee", accords: ["thé fumé", "pain d'épices", "cannelle", "anis", "vanille"] },
  { id: "artisan-bois-farine", name: "Bois Farine", house: "L'Artisan Parfumeur", year: 2003, gender: "mixte", family: "boisee", accords: ["santal", "cèdre", "iris", "noisette"] },
  { id: "artisan-la-chasse-aux-papillons", name: "La Chasse aux Papillons", house: "L'Artisan Parfumeur", year: 1999, gender: "femme", family: "florale", accords: ["fleur d'oranger", "tilleul", "jasmin", "tubéreuse"] },
  { id: "artisan-nuit-de-tubereuse", name: "Nuit de Tubéreuse", house: "L'Artisan Parfumeur", year: 2010, gender: "mixte", family: "florale", accords: ["tubéreuse", "cardamome", "poivre rose", "encens", "santal"] },
  { id: "artisan-seville-a-laube", name: "Séville à l'Aube", house: "L'Artisan Parfumeur", year: 2012, gender: "mixte", family: "florale", accords: ["fleur d'oranger", "encens", "benjoin", "lavande", "magnolia"] },

  // ─── Atelier Cologne ───────────────────────────────────────────────────────
  { id: "atelier-cologne-orange-sanguine", name: "Orange Sanguine", house: "Atelier Cologne", year: 2010, gender: "mixte", family: "hesperidee", accords: ["orange sanguine", "poivre", "géranium", "santal", "musc"] },
  { id: "atelier-cologne-clementine-california", name: "Clémentine California", house: "Atelier Cologne", year: 2016, gender: "mixte", family: "hesperidee", accords: ["clémentine", "gingembre", "jasmin", "vétiver", "musc"] },
  { id: "atelier-cologne-grand-neroli", name: "Grand Néroli", house: "Atelier Cologne", year: 2010, gender: "mixte", family: "hesperidee", accords: ["néroli", "bergamote", "petit-grain", "vétiver", "musc"] },
  { id: "atelier-cologne-vanille-insensee", name: "Vanille Insensée", house: "Atelier Cologne", year: 2011, gender: "mixte", family: "gourmande", accords: ["vanille", "coriandre", "jasmin", "vétiver", "mousse de chêne"] },
  { id: "atelier-cologne-santal-carmin", name: "Santal Carmin", house: "Atelier Cologne", year: 2017, gender: "mixte", family: "boisee", accords: ["santal", "safran", "papyrus", "ambre", "cyprès"] },
  { id: "atelier-cologne-cedrat-enivrant", name: "Cédrat Enivrant", house: "Atelier Cologne", year: 2016, gender: "mixte", family: "hesperidee", accords: ["cédrat", "basilic", "gingembre", "vétiver", "mousse de chêne"] },
  { id: "atelier-cologne-oolang-infini", name: "Oolang Infini", house: "Atelier Cologne", year: 2011, gender: "mixte", family: "boisee", accords: ["thé oolong", "bergamote", "vétiver", "cuir", "tabac"] },
  { id: "atelier-cologne-bois-blonds", name: "Bois Blonds", house: "Atelier Cologne", year: 2010, gender: "mixte", family: "boisee", accords: ["bergamote", "cèdre", "ambrette", "encens", "cuir"] },
  { id: "atelier-cologne-pomelo-paradis", name: "Pomélo Paradis", house: "Atelier Cologne", year: 2015, gender: "mixte", family: "hesperidee", accords: ["pamplemousse", "menthe", "orange", "vétiver", "cèdre"] },

  // ─── Azzaro ────────────────────────────────────────────────────────────────
  { id: "azzaro-pour-homme", name: "Azzaro Pour Homme", house: "Azzaro", year: 1978, gender: "homme", family: "fougere", accords: ["lavande", "anis", "basilic", "vétiver", "mousse de chêne", "cuir"] },
  { id: "azzaro-chrome", name: "Chrome", house: "Azzaro", year: 1996, gender: "homme", family: "aquatique", accords: ["bergamote", "néroli", "ananas", "jasmin", "musc", "cèdre"] },
  { id: "azzaro-wanted", name: "Wanted", house: "Azzaro", year: 2016, gender: "homme", family: "ambree", accords: ["citron", "gingembre", "cardamome", "vétiver", "fève tonka"] },
  { id: "azzaro-wanted-by-night", name: "Wanted by Night", house: "Azzaro", year: 2018, gender: "homme", family: "ambree", accords: ["cannelle", "rhum", "tabac", "cèdre", "vanille", "cardamome"] },
  { id: "azzaro-the-most-wanted", name: "The Most Wanted", house: "Azzaro", year: 2021, gender: "homme", family: "ambree", accords: ["cardamome", "lavande", "fève tonka", "bois ambré"] },
  { id: "azzaro-wanted-girl", name: "Wanted Girl", house: "Azzaro", year: 2019, gender: "femme", family: "gourmande", accords: ["fleur d'oranger", "gingembre", "caramel", "fève tonka", "jasmin"] },

  // ─── Bvlgari ───────────────────────────────────────────────────────────────
  { id: "bvlgari-man-in-black", name: "Man in Black", house: "Bvlgari", year: 2014, gender: "homme", family: "ambree", accords: ["rhum", "tubéreuse", "cuir", "fève tonka", "benjoin", "épices"] },
  { id: "bvlgari-man-wood-essence", name: "Man Wood Essence", house: "Bvlgari", year: 2018, gender: "homme", family: "boisee", accords: ["cèdre", "vétiver", "encens", "bergamote", "benjoin"] },
  { id: "bvlgari-pour-homme", name: "Bvlgari Pour Homme", house: "Bvlgari", year: 1996, gender: "homme", family: "boisee", accords: ["thé darjeeling", "bergamote", "poivre", "bois de gaïac", "musc"] },
  { id: "bvlgari-aqva-pour-homme", name: "Aqva Pour Homme", house: "Bvlgari", year: 2005, gender: "homme", family: "aquatique", accords: ["mandarine", "petit-grain", "algue", "ambre", "bois"] },
  { id: "bvlgari-omnia-crystalline", name: "Omnia Crystalline", house: "Bvlgari", year: 2005, gender: "femme", family: "florale", accords: ["bambou", "lotus", "thé blanc", "bois de balsa", "musc"] },
  { id: "bvlgari-black", name: "Bvlgari Black", house: "Bvlgari", year: 1998, gender: "mixte", family: "boisee", accords: ["thé", "santal", "vanille", "musc", "cèdre"] },
  { id: "bvlgari-goldea", name: "Goldea", house: "Bvlgari", year: 2015, gender: "femme", family: "musquee", accords: ["musc", "jasmin", "papyrus", "patchouli", "framboise"] },
  { id: "bvlgari-goldea-the-roman-night", name: "Goldea The Roman Night", house: "Bvlgari", year: 2017, gender: "femme", family: "florale-fruitee", accords: ["mûre", "musc", "patchouli", "rose", "bois"] },
  { id: "bvlgari-rose-goldea", name: "Rose Goldea", house: "Bvlgari", year: 2016, gender: "femme", family: "florale", accords: ["rose", "grenade", "musc", "jasmin", "santal"] },
  { id: "bvlgari-jasmin-noir", name: "Jasmin Noir", house: "Bvlgari", year: 2008, gender: "femme", family: "florale", accords: ["jasmin sambac", "gardénia", "réglisse", "fève tonka", "santal"] },
  { id: "bvlgari-the-vert", name: "Eau Parfumée au Thé Vert", house: "Bvlgari", year: 1992, gender: "mixte", family: "verte", accords: ["thé vert", "bergamote", "coriandre", "poivre", "musc"] },
  { id: "bvlgari-the-noir", name: "Eau Parfumée au Thé Noir", house: "Bvlgari", year: 2006, gender: "mixte", family: "boisee", accords: ["thé noir", "bergamote", "tabac", "ambre", "poivre"] },

  // ─── Burberry ──────────────────────────────────────────────────────────────
  { id: "burberry-brit-for-him", name: "Brit for Him", house: "Burberry", year: 2004, gender: "homme", family: "aromatique", accords: ["gingembre", "cardamome", "cèdre", "fève tonka", "muscade"] },
  { id: "burberry-brit-for-her", name: "Brit for Her", house: "Burberry", year: 2003, gender: "femme", family: "gourmande", accords: ["amande", "mandarine verte", "pivoine", "vanille", "fève tonka", "ambre"] },
  { id: "burberry-london-for-men", name: "London for Men", house: "Burberry", year: 2006, gender: "homme", family: "aromatique", accords: ["bergamote", "lavande", "cuir", "tabac", "opoponax"] },
  { id: "burberry-london-for-women", name: "London for Women", house: "Burberry", year: 2006, gender: "femme", family: "florale", accords: ["pivoine", "tilleul", "jasmin", "rose", "patchouli", "musc"] },
  { id: "burberry-weekend-for-women", name: "Weekend for Women", house: "Burberry", year: 1997, gender: "femme", family: "florale-fruitee", accords: ["mandarine", "pêche", "jacinthe", "cèdre", "musc"] },
  { id: "burberry-touch-for-men", name: "Touch for Men", house: "Burberry", year: 2000, gender: "homme", family: "boisee", accords: ["mandarine", "poivre blanc", "cèdre de virginie", "fève tonka", "vétiver"] },
  { id: "burberry-my-burberry", name: "My Burberry", house: "Burberry", year: 2014, gender: "femme", family: "florale", accords: ["pois de senteur", "bergamote", "géranium", "patchouli", "rose de damas"] },
  { id: "burberry-her", name: "Burberry Her", house: "Burberry", year: 2018, gender: "femme", family: "florale-fruitee", accords: ["fraise", "myrtille", "framboise", "jasmin", "musc", "ambre"] },
  { id: "burberry-mr-burberry", name: "Mr. Burberry", house: "Burberry", year: 2016, gender: "homme", family: "aromatique", accords: ["pamplemousse", "cardamome", "muguet", "vétiver", "cèdre"] },

  // ─── Byredo ────────────────────────────────────────────────────────────────
  { id: "byredo-gypsy-water", name: "Gypsy Water", house: "Byredo", year: 2008, gender: "mixte", family: "boisee", accords: ["bergamote", "poivre", "encens", "pin", "santal", "vanille"] },
  { id: "byredo-bal-dafrique", name: "Bal d'Afrique", house: "Byredo", year: 2009, gender: "mixte", family: "boisee", accords: ["néroli", "bergamote", "violette", "vétiver", "musc", "cèdre"] },
  { id: "byredo-blanche", name: "Blanche", house: "Byredo", year: 2009, gender: "femme", family: "musquee", accords: ["aldéhydes", "pivoine", "violette", "musc blanc", "santal"] },
  { id: "byredo-mojave-ghost", name: "Mojave Ghost", house: "Byredo", year: 2014, gender: "mixte", family: "boisee", accords: ["ambrette", "magnolia", "santal", "patchouli", "musc", "violette"] },
  { id: "byredo-rose-of-no-mans-land", name: "Rose of No Man's Land", house: "Byredo", year: 2015, gender: "mixte", family: "florale", accords: ["rose de turquie", "poivre rose", "framboise", "ambrette", "papyrus"] },
  { id: "byredo-black-saffron", name: "Black Saffron", house: "Byredo", year: 2012, gender: "mixte", family: "boisee", accords: ["safran", "cuir", "framboise", "vétiver", "cèdre"] },
  { id: "byredo-la-tulipe", name: "La Tulipe", house: "Byredo", year: 2010, gender: "femme", family: "florale", accords: ["tulipe", "rhubarbe", "freesia", "cyclamen", "vétiver"] },
  { id: "byredo-super-cedar", name: "Super Cedar", house: "Byredo", year: 2016, gender: "mixte", family: "boisee", accords: ["cèdre de virginie", "rose", "musc", "vétiver"] },
  { id: "byredo-bibliotheque", name: "Bibliothèque", house: "Byredo", year: 2017, gender: "mixte", family: "gourmande", accords: ["prune", "pêche", "patchouli", "vanille", "cuir"] },
  { id: "byredo-velvet-haze", name: "Velvet Haze", house: "Byredo", year: 2017, gender: "mixte", family: "boisee", accords: ["noix de coco", "patchouli", "musc", "ambrette", "cacao"] },
  { id: "byredo-pulp", name: "Pulp", house: "Byredo", year: 2008, gender: "femme", family: "florale-fruitee", accords: ["figue", "pomme", "cassis", "cardamome", "patchouli"] },
  { id: "byredo-flowerhead", name: "Flowerhead", house: "Byredo", year: 2014, gender: "femme", family: "florale", accords: ["tubéreuse", "jasmin sambac", "rose", "angélique", "baies"] },
  { id: "byredo-eleventh-hour", name: "Eleventh Hour", house: "Byredo", year: 2018, gender: "mixte", family: "gourmande", accords: ["figue noire", "cannelle", "fève tonka", "muscade", "bois"] },
  { id: "byredo-1996", name: "1996", house: "Byredo", year: 2018, gender: "mixte", family: "cuir", accords: ["cuir", "violette", "ambrette", "papyrus"] },
  { id: "byredo-oud-immortel", name: "Oud Immortel", house: "Byredo", year: 2008, gender: "mixte", family: "boisee", accords: ["oud", "papyrus", "patchouli", "encens", "tabac"] },
  // ─── Cacharel ──────────────────────────────────────────────────────────────
  { id: "cacharel-anais-anais", name: "Anaïs Anaïs", house: "Cacharel", year: 1978, gender: "femme", family: "florale", accords: ["lys", "muguet", "jacinthe", "rose", "santal", "mousse de chêne"] },
  { id: "cacharel-loulou", name: "LouLou", house: "Cacharel", year: 1987, gender: "femme", family: "ambree", accords: ["violette", "cassis", "prune", "tubéreuse", "vanille", "encens"] },
  { id: "cacharel-noa", name: "Noa", house: "Cacharel", year: 1998, gender: "femme", family: "florale", accords: ["pivoine", "freesia", "fleur de café", "musc", "vanille"] },
  { id: "cacharel-amor-amor", name: "Amor Amor", house: "Cacharel", year: 2003, gender: "femme", family: "florale-fruitee", accords: ["cassis", "mandarine", "rose", "jasmin", "vanille", "ambre"] },
  { id: "cacharel-pour-lhomme", name: "Cacharel Pour L'Homme", house: "Cacharel", year: 1981, gender: "homme", family: "fougere", accords: ["lavande", "romarin", "patchouli", "mousse de chêne", "ambre"] },

  // ─── Calvin Klein ──────────────────────────────────────────────────────────
  { id: "calvin-klein-ck-one", name: "CK One", house: "Calvin Klein", year: 1994, gender: "mixte", family: "hesperidee", accords: ["bergamote", "cardamome", "ananas", "thé vert", "musc", "ambre"] },
  { id: "calvin-klein-ck-be", name: "CK Be", house: "Calvin Klein", year: 1996, gender: "mixte", family: "aromatique", accords: ["bergamote", "menthe", "lavande", "musc", "santal"] },
  { id: "calvin-klein-eternity-for-men", name: "Eternity for Men", house: "Calvin Klein", year: 1989, gender: "homme", family: "fougere", accords: ["lavande", "mandarine", "sauge", "santal", "ambre", "musc"] },
  { id: "calvin-klein-eternity", name: "Eternity", house: "Calvin Klein", year: 1988, gender: "femme", family: "florale", accords: ["freesia", "muguet", "œillet", "patchouli", "santal", "musc"] },
  { id: "calvin-klein-obsession-for-men", name: "Obsession for Men", house: "Calvin Klein", year: 1986, gender: "homme", family: "ambree", accords: ["lavande", "muscade", "cannelle", "ambre", "vanille", "musc"] },
  { id: "calvin-klein-obsession", name: "Obsession", house: "Calvin Klein", year: 1985, gender: "femme", family: "ambree", accords: ["mandarine", "pêche", "fleur d'oranger", "ambre", "vanille", "civette"] },
  { id: "calvin-klein-escape", name: "Escape", house: "Calvin Klein", year: 1991, gender: "femme", family: "florale-fruitee", accords: ["camomille", "pomme", "litchi", "muguet", "santal", "musc"] },
  { id: "calvin-klein-euphoria", name: "Euphoria", house: "Calvin Klein", year: 2005, gender: "femme", family: "ambree", accords: ["grenade", "orchidée noire", "ambre", "violette", "acajou"] },
  { id: "calvin-klein-euphoria-men", name: "Euphoria Men", house: "Calvin Klein", year: 2006, gender: "homme", family: "boisee", accords: ["gingembre", "poivre noir", "sauge", "cèdre", "ambre", "patchouli"] },
  { id: "calvin-klein-ck-one-shock-for-him", name: "CK One Shock for Him", house: "Calvin Klein", year: 2011, gender: "homme", family: "ambree", accords: ["cardamome", "basilic", "cannelle", "tabac", "patchouli", "ambre"] },

  // ─── Caron ─────────────────────────────────────────────────────────────────
  { id: "caron-pour-un-homme", name: "Pour un Homme de Caron", house: "Caron", year: 1934, gender: "homme", family: "fougere", accords: ["lavande", "vanille", "musc", "ambre", "mousse de chêne"] },
  { id: "caron-nuit-de-noel", name: "Nuit de Noël", house: "Caron", year: 1922, gender: "femme", family: "chypree", accords: ["mousse de chêne", "rose", "jasmin", "santal", "musc"] },
  { id: "caron-tabac-blond", name: "Tabac Blond", house: "Caron", year: 1919, gender: "femme", family: "cuir", accords: ["cuir", "tabac", "œillet", "iris", "vanille", "ambre"] },
  { id: "caron-narcisse-noir", name: "Narcisse Noir", house: "Caron", year: 1911, gender: "femme", family: "florale", accords: ["fleur d'oranger", "narcisse", "jasmin", "santal", "musc"] },
  { id: "caron-bellodgia", name: "Bellodgia", house: "Caron", year: 1927, gender: "femme", family: "florale", accords: ["œillet", "rose", "jasmin", "vanille", "musc"] },
  { id: "caron-yatagan", name: "Yatagan", house: "Caron", year: 1976, gender: "homme", family: "boisee", accords: ["armoise", "absinthe", "castoréum", "patchouli", "vétiver"] },

  // ─── Carolina Herrera ──────────────────────────────────────────────────────
  { id: "carolina-herrera-good-girl", name: "Good Girl", house: "Carolina Herrera", year: 2016, gender: "femme", family: "ambree", accords: ["jasmin sambac", "fève tonka", "cacao", "amande", "café", "patchouli"] },
  { id: "carolina-herrera-very-good-girl", name: "Very Good Girl", house: "Carolina Herrera", year: 2021, gender: "femme", family: "florale-fruitee", accords: ["cerise noire", "rose", "jasmin", "musc", "patchouli"] },
  { id: "carolina-herrera-212", name: "212", house: "Carolina Herrera", year: 1997, gender: "femme", family: "florale", accords: ["bergamote", "gardénia", "muguet", "musc", "santal"] },
  { id: "carolina-herrera-212-men", name: "212 Men", house: "Carolina Herrera", year: 1999, gender: "homme", family: "boisee", accords: ["bergamote", "poivre", "gingembre", "santal", "musc", "cèdre"] },
  { id: "carolina-herrera-212-vip-men", name: "212 VIP Men", house: "Carolina Herrera", year: 2011, gender: "homme", family: "ambree", accords: ["gingembre", "vodka", "citron vert", "ambre", "cuir", "musc"] },
  { id: "carolina-herrera-212-vip", name: "212 VIP", house: "Carolina Herrera", year: 2010, gender: "femme", family: "gourmande", accords: ["rhum", "fruit de la passion", "gardénia", "musc", "vanille"] },
  { id: "carolina-herrera-212-sexy", name: "212 Sexy", house: "Carolina Herrera", year: 2004, gender: "femme", family: "ambree", accords: ["bergamote", "mandarine", "fleur d'oranger", "vanille", "musc", "santal"] },
  { id: "carolina-herrera-ch", name: "CH", house: "Carolina Herrera", year: 2007, gender: "femme", family: "chypree", accords: ["bergamote", "praline", "jasmin", "cuir", "mousse de chêne", "vanille"] },
  { id: "carolina-herrera-ch-men", name: "CH Men", house: "Carolina Herrera", year: 2009, gender: "homme", family: "cuir", accords: ["pamplemousse", "safran", "cuir", "cèdre", "vétiver", "fève tonka"] },
  { id: "carolina-herrera-bad-boy", name: "Bad Boy", house: "Carolina Herrera", year: 2019, gender: "homme", family: "ambree", accords: ["bergamote", "poivre blanc", "sauge", "cacao", "fève tonka", "cèdre"] },

  // ─── Cartier ───────────────────────────────────────────────────────────────
  { id: "cartier-declaration", name: "Déclaration", house: "Cartier", year: 1998, gender: "homme", family: "boisee", accords: ["cumin", "cardamome", "bouleau", "poivre", "néroli", "cèdre"] },
  { id: "cartier-declaration-dun-soir", name: "Déclaration d'un Soir", house: "Cartier", year: 2012, gender: "homme", family: "boisee", accords: ["rose", "poivre", "cumin", "patchouli", "cèdre"] },
  { id: "cartier-pasha", name: "Pasha de Cartier", house: "Cartier", year: 1992, gender: "homme", family: "fougere", accords: ["lavande", "menthe", "patchouli", "santal", "mousse de chêne"] },
  { id: "cartier-santos", name: "Santos de Cartier", house: "Cartier", year: 1981, gender: "homme", family: "fougere", accords: ["lavande", "romarin", "patchouli", "cuir", "mousse de chêne"] },
  { id: "cartier-lenvol", name: "L'Envol", house: "Cartier", year: 2016, gender: "homme", family: "ambree", accords: ["miel", "iris", "patchouli", "musc", "bois"] },
  { id: "cartier-roadster", name: "Roadster", house: "Cartier", year: 2008, gender: "homme", family: "aromatique", accords: ["menthe", "bergamote", "vétiver", "fève tonka", "cuir"] },
  { id: "cartier-must", name: "Must de Cartier", house: "Cartier", year: 1981, gender: "femme", family: "ambree", accords: ["mandarine", "galbanum", "jasmin", "vanille", "civette", "santal"] },
  { id: "cartier-baiser-vole", name: "Baiser Volé", house: "Cartier", year: 2011, gender: "femme", family: "florale", accords: ["lys", "feuille de lys", "musc blanc"] },
  { id: "cartier-la-panthere", name: "La Panthère", house: "Cartier", year: 2014, gender: "femme", family: "florale", accords: ["gardénia", "musc", "patchouli", "fruits rouges"] },
  { id: "cartier-eau-de-cartier", name: "Eau de Cartier", house: "Cartier", year: 2001, gender: "mixte", family: "verte", accords: ["lavande", "violette", "coriandre", "patchouli", "musc", "cèdre"] },

  // ─── Chanel ────────────────────────────────────────────────────────────────
  { id: "chanel-n5", name: "N°5", house: "Chanel", year: 1921, gender: "femme", family: "florale", accords: ["aldéhydes", "ylang-ylang", "rose de mai", "jasmin", "iris", "vanille"] },
  { id: "chanel-n5-leau", name: "N°5 L'Eau", house: "Chanel", year: 2016, gender: "femme", family: "florale", accords: ["aldéhydes", "citron", "rose", "jasmin", "musc", "cèdre"] },
  { id: "chanel-n19", name: "N°19", house: "Chanel", year: 1970, gender: "femme", family: "chypree", accords: ["galbanum", "iris", "néroli", "mousse de chêne", "vétiver", "cuir"] },
  { id: "chanel-n22", name: "N°22", house: "Chanel", year: 1922, gender: "femme", family: "florale", accords: ["aldéhydes", "tubéreuse", "néroli", "encens", "vanille", "musc"] },
  { id: "chanel-coco", name: "Coco", house: "Chanel", year: 1984, gender: "femme", family: "ambree", accords: ["mandarine", "pêche", "rose", "jasmin", "opoponax", "benjoin"] },
  { id: "chanel-coco-mademoiselle", name: "Coco Mademoiselle", house: "Chanel", year: 2001, gender: "femme", family: "chypree", accords: ["orange", "bergamote", "rose", "jasmin", "patchouli", "vétiver"] },
  { id: "chanel-chance", name: "Chance", house: "Chanel", year: 2003, gender: "femme", family: "florale", accords: ["poivre rose", "ananas", "jasmin", "patchouli", "vétiver", "musc"] },
  { id: "chanel-chance-eau-tendre", name: "Chance Eau Tendre", house: "Chanel", year: 2010, gender: "femme", family: "florale-fruitee", accords: ["pamplemousse", "coing", "jacinthe", "jasmin", "musc blanc", "cèdre"] },
  { id: "chanel-chance-eau-fraiche", name: "Chance Eau Fraîche", house: "Chanel", year: 2007, gender: "femme", family: "florale", accords: ["citron", "cédrat", "jacinthe", "jasmin", "patchouli", "vétiver"] },
  { id: "chanel-chance-eau-vive", name: "Chance Eau Vive", house: "Chanel", year: 2015, gender: "femme", family: "hesperidee", accords: ["pamplemousse", "orange sanguine", "jasmin", "vétiver", "musc"] },
  { id: "chanel-allure", name: "Allure", house: "Chanel", year: 1996, gender: "femme", family: "florale", accords: ["mandarine", "magnolia", "jasmin", "vanille", "vétiver", "musc"] },
  { id: "chanel-allure-homme-sport", name: "Allure Homme Sport", house: "Chanel", year: 2004, gender: "homme", family: "aromatique", accords: ["orange", "poivre", "néroli", "cèdre", "fève tonka", "musc blanc"] },
  { id: "chanel-allure-homme-edition-blanche", name: "Allure Homme Édition Blanche", house: "Chanel", year: 2008, gender: "homme", family: "hesperidee", accords: ["citron de sicile", "gingembre", "cardamome", "cèdre", "vanille", "musc"] },
  { id: "chanel-bleu-de-chanel", name: "Bleu de Chanel", house: "Chanel", year: 2010, gender: "homme", family: "boisee", accords: ["pamplemousse", "citron", "menthe", "gingembre", "encens", "cèdre"] },
  { id: "chanel-antaeus", name: "Antaeus", house: "Chanel", year: 1981, gender: "homme", family: "cuir", accords: ["cuir", "myrte", "labdanum", "patchouli", "castoréum", "sauge"] },
  { id: "chanel-egoiste", name: "Égoïste", house: "Chanel", year: 1990, gender: "homme", family: "boisee", accords: ["santal", "cannelle", "coriandre", "rose", "vanille", "ambre"] },
  { id: "chanel-platinum-egoiste", name: "Platinum Égoïste", house: "Chanel", year: 1993, gender: "homme", family: "fougere", accords: ["lavande", "romarin", "petit-grain", "sauge", "ambre", "mousse de chêne"] },
  { id: "chanel-pour-monsieur", name: "Pour Monsieur", house: "Chanel", year: 1955, gender: "homme", family: "hesperidee", accords: ["citron", "néroli", "cardamome", "mousse de chêne", "vétiver"] },
  { id: "chanel-cristalle", name: "Cristalle", house: "Chanel", year: 1974, gender: "femme", family: "chypree", accords: ["citron", "chèvrefeuille", "jasmin", "mousse de chêne", "vétiver"] },
  { id: "chanel-gabrielle", name: "Gabrielle", house: "Chanel", year: 2017, gender: "femme", family: "florale", accords: ["jasmin", "fleur d'oranger", "ylang-ylang", "tubéreuse", "musc"] },
  { id: "chanel-sycomore", name: "Sycomore", house: "Chanel", year: 2008, gender: "mixte", family: "boisee", accords: ["vétiver", "santal", "encens", "cyprès", "tabac"] },
  { id: "chanel-coromandel", name: "Coromandel", house: "Chanel", year: 2007, gender: "mixte", family: "ambree", accords: ["patchouli", "benjoin", "encens", "iris", "vanille", "ambre"] },
  { id: "chanel-bois-des-iles", name: "Bois des Îles", house: "Chanel", year: 1926, gender: "femme", family: "boisee", accords: ["santal", "aldéhydes", "iris", "ylang-ylang", "vanille", "musc"] },
  { id: "chanel-cuir-de-russie", name: "Cuir de Russie", house: "Chanel", year: 1927, gender: "femme", family: "cuir", accords: ["cuir", "bouleau", "iris", "jasmin", "ylang-ylang", "ambre"] },
  { id: "chanel-beige", name: "Beige", house: "Chanel", year: 2008, gender: "femme", family: "florale", accords: ["aubépine", "freesia", "miel", "jasmin", "musc"] },
  { id: "chanel-jersey", name: "Jersey", house: "Chanel", year: 2011, gender: "femme", family: "florale", accords: ["lavande", "musc", "vanille", "jasmin", "fève tonka"] },
  { id: "chanel-1957", name: "1957", house: "Chanel", year: 2019, gender: "mixte", family: "musquee", accords: ["musc blanc", "néroli", "iris", "vanille", "ambre gris"] },

  // ─── Chloé ─────────────────────────────────────────────────────────────────
  { id: "chloe-eau-de-parfum", name: "Chloé Eau de Parfum", house: "Chloé", year: 2008, gender: "femme", family: "florale", accords: ["pivoine", "litchi", "rose", "magnolia", "cèdre", "ambre"] },
  { id: "chloe-nomade", name: "Nomade", house: "Chloé", year: 2018, gender: "femme", family: "chypree", accords: ["mirabelle", "freesia", "mousse de chêne", "patchouli", "santal"] },
  { id: "chloe-love-story", name: "Love Story", house: "Chloé", year: 2014, gender: "femme", family: "florale", accords: ["fleur d'oranger", "néroli", "jasmin", "musc", "cèdre"] },

  // ─── Comme des Garçons ─────────────────────────────────────────────────────
  { id: "cdg-2-man", name: "Comme des Garçons 2 Man", house: "Comme des Garçons", year: 2004, gender: "homme", family: "boisee", accords: ["encens", "néroli", "cèdre", "vétiver", "safran", "muscade"] },
  { id: "cdg-avignon", name: "Avignon", house: "Comme des Garçons", year: 2002, gender: "mixte", family: "boisee", accords: ["encens", "myrrhe", "camomille", "bois de cade", "vanille"] },
  { id: "cdg-kyoto", name: "Kyoto", house: "Comme des Garçons", year: 2002, gender: "mixte", family: "boisee", accords: ["encens", "cyprès", "vétiver", "santal", "café"] },
  { id: "cdg-wonderwood", name: "Wonderwood", house: "Comme des Garçons", year: 2010, gender: "mixte", family: "boisee", accords: ["santal", "cèdre", "vétiver", "oud", "poivre"] },
  { id: "cdg-hinoki", name: "Hinoki", house: "Comme des Garçons", year: 2008, gender: "mixte", family: "boisee", accords: ["cyprès hinoki", "encens", "poivre", "cèdre"] },

  // ─── Creed ─────────────────────────────────────────────────────────────────
  { id: "creed-aventus", name: "Aventus", house: "Creed", year: 2010, gender: "homme", family: "chypree", accords: ["ananas", "bergamote", "cassis", "bouleau", "mousse de chêne", "ambre gris"] },
  { id: "creed-aventus-for-her", name: "Aventus for Her", house: "Creed", year: 2016, gender: "femme", family: "chypree", accords: ["cassis", "bergamote", "rose", "patchouli", "musc", "ambre gris"] },
  { id: "creed-green-irish-tweed", name: "Green Irish Tweed", house: "Creed", year: 1985, gender: "homme", family: "fougere", accords: ["citron", "verveine", "iris", "violette", "santal", "ambre gris"] },
  { id: "creed-silver-mountain-water", name: "Silver Mountain Water", house: "Creed", year: 1995, gender: "mixte", family: "aquatique", accords: ["bergamote", "mandarine", "thé vert", "cassis", "musc", "santal"] },
  { id: "creed-millesime-imperial", name: "Millésime Impérial", house: "Creed", year: 1995, gender: "mixte", family: "aquatique", accords: ["melon", "bergamote", "iris", "sel marin", "musc"] },
  { id: "creed-royal-oud", name: "Royal Oud", house: "Creed", year: 2011, gender: "mixte", family: "boisee", accords: ["oud", "cèdre", "santal", "angélique", "poivre rose", "galbanum"] },
  { id: "creed-virgin-island-water", name: "Virgin Island Water", house: "Creed", year: 2007, gender: "mixte", family: "hesperidee", accords: ["noix de coco", "citron vert", "rhum", "canne à sucre", "musc blanc"] },
  { id: "creed-original-santal", name: "Original Santal", house: "Creed", year: 2005, gender: "homme", family: "boisee", accords: ["santal", "cannelle", "cardamome", "vanille", "fève tonka"] },
  { id: "creed-original-vetiver", name: "Original Vetiver", house: "Creed", year: 2004, gender: "homme", family: "boisee", accords: ["vétiver", "bergamote", "gingembre", "mandarine", "musc"] },
  { id: "creed-bois-du-portugal", name: "Bois du Portugal", house: "Creed", year: 1987, gender: "homme", family: "boisee", accords: ["cèdre", "santal", "lavande", "bergamote", "ambre gris", "mousse de chêne"] },
  { id: "creed-himalaya", name: "Himalaya", house: "Creed", year: 2002, gender: "homme", family: "boisee", accords: ["bergamote", "santal", "cèdre", "ambre gris", "musc"] },
  { id: "creed-erolfa", name: "Erolfa", house: "Creed", year: 1992, gender: "homme", family: "aquatique", accords: ["bergamote", "melon", "néroli", "santal", "ambre gris"] },
  { id: "creed-viking", name: "Viking", house: "Creed", year: 2017, gender: "homme", family: "aromatique", accords: ["menthe poivrée", "bergamote", "poivre", "encens", "santal", "vétiver"] },
  { id: "creed-tabarome", name: "Tabarome Millésime", house: "Creed", year: 2001, gender: "homme", family: "boisee", accords: ["tabac", "bergamote", "gingembre", "santal", "mousse de chêne"] },
  { id: "creed-love-in-white", name: "Love in White", house: "Creed", year: 2005, gender: "femme", family: "florale", accords: ["iris", "magnolia", "riz", "santal", "ambre gris", "vanille"] },
  { id: "creed-spring-flower", name: "Spring Flower", house: "Creed", year: 1996, gender: "femme", family: "florale-fruitee", accords: ["melon", "pêche", "jasmin", "rose", "musc", "ambre"] },

  // ─── Davidoff ──────────────────────────────────────────────────────────────
  { id: "davidoff-cool-water", name: "Cool Water", house: "Davidoff", year: 1988, gender: "homme", family: "aquatique", accords: ["menthe", "lavande", "romarin", "néroli", "santal", "musc"] },
  { id: "davidoff-cool-water-woman", name: "Cool Water Woman", house: "Davidoff", year: 1996, gender: "femme", family: "aquatique", accords: ["ananas", "cassis", "lotus", "muguet", "santal", "musc"] },
  { id: "davidoff-zino", name: "Zino", house: "Davidoff", year: 1986, gender: "homme", family: "boisee", accords: ["lavande", "cannelle", "santal", "patchouli", "vanille"] },
  // ─── Diptyque ──────────────────────────────────────────────────────────────
  { id: "diptyque-philosykos", name: "Philosykos", house: "Diptyque", year: 1996, gender: "mixte", family: "verte", accords: ["figue", "feuille de figuier", "noix de coco", "cèdre", "bois blanc"] },
  { id: "diptyque-do-son", name: "Do Son", house: "Diptyque", year: 2005, gender: "femme", family: "florale", accords: ["tubéreuse", "rose", "iris", "musc blanc", "benjoin"] },
  { id: "diptyque-tam-dao", name: "Tam Dao", house: "Diptyque", year: 2003, gender: "mixte", family: "boisee", accords: ["santal", "cèdre", "cyprès", "musc", "ambre"] },
  { id: "diptyque-lombre-dans-leau", name: "L'Ombre dans l'Eau", house: "Diptyque", year: 1983, gender: "femme", family: "verte", accords: ["feuille de cassis", "rose bulgare", "musc"] },
  { id: "diptyque-eau-rose", name: "Eau Rose", house: "Diptyque", year: 2012, gender: "femme", family: "florale", accords: ["rose de damas", "litchi", "cassis", "musc blanc"] },
  { id: "diptyque-eau-duelle", name: "Eau Duelle", house: "Diptyque", year: 2010, gender: "mixte", family: "gourmande", accords: ["vanille", "encens", "bergamote", "thé noir", "cardamome"] },
  { id: "diptyque-oyedo", name: "Oyédo", house: "Diptyque", year: 2000, gender: "mixte", family: "hesperidee", accords: ["yuzu", "mandarine", "thym", "bois"] },
  { id: "diptyque-eau-des-sens", name: "Eau des Sens", house: "Diptyque", year: 2016, gender: "mixte", family: "hesperidee", accords: ["fleur d'oranger", "orange amère", "genièvre", "patchouli", "angélique"] },
  { id: "diptyque-fleur-de-peau", name: "Fleur de Peau", house: "Diptyque", year: 2018, gender: "mixte", family: "musquee", accords: ["musc", "iris", "ambrette", "cuir", "rose"] },
  { id: "diptyque-vetyverio", name: "Vetyverio", house: "Diptyque", year: 2010, gender: "mixte", family: "boisee", accords: ["vétiver", "rose", "mimosa", "muscade", "cèdre"] },
  { id: "diptyque-eau-capitale", name: "Eau Capitale", house: "Diptyque", year: 2019, gender: "femme", family: "chypree", accords: ["rose", "poivre rose", "patchouli", "mousse de chêne", "pamplemousse"] },
  { id: "diptyque-34-boulevard-saint-germain", name: "34 Boulevard Saint Germain", house: "Diptyque", year: 2011, gender: "mixte", family: "boisee", accords: ["poivre noir", "encens", "cannelle", "bois de rose", "ambre"] },
  { id: "diptyque-ofresia", name: "Ofrésia", house: "Diptyque", year: 1999, gender: "mixte", family: "florale", accords: ["freesia", "poivre", "muguet", "bois"] },
  { id: "diptyque-volutes", name: "Volutes", house: "Diptyque", year: 2012, gender: "mixte", family: "boisee", accords: ["tabac", "iris", "encens", "miel", "prune", "opoponax"] },
  { id: "diptyque-leau-papier", name: "L'Eau Papier", house: "Diptyque", year: 2023, gender: "mixte", family: "musquee", accords: ["riz", "musc blanc", "mimosa", "sésame", "bois blanc"] },

  // ─── Dior ──────────────────────────────────────────────────────────────────
  { id: "dior-sauvage", name: "Sauvage", house: "Dior", year: 2015, gender: "homme", family: "aromatique", accords: ["bergamote", "poivre de sichuan", "ambroxan", "lavande", "patchouli"] },
  { id: "dior-sauvage-eau-de-parfum", name: "Sauvage Eau de Parfum", house: "Dior", year: 2018, gender: "homme", family: "ambree", accords: ["bergamote", "vanille", "ambroxan", "poivre de sichuan", "labdanum"] },
  { id: "dior-sauvage-elixir", name: "Sauvage Elixir", house: "Dior", year: 2021, gender: "homme", family: "ambree", accords: ["cannelle", "muscade", "cardamome", "lavande", "réglisse", "santal"] },
  { id: "dior-sauvage-parfum", name: "Sauvage Parfum", house: "Dior", year: 2019, gender: "homme", family: "ambree", accords: ["bergamote", "mandarine", "santal", "fève tonka", "vanille"] },
  { id: "dior-eau-sauvage", name: "Eau Sauvage", house: "Dior", year: 1966, gender: "homme", family: "hesperidee", accords: ["citron", "romarin", "basilic", "jasmin", "vétiver", "mousse de chêne"] },
  { id: "dior-homme", name: "Dior Homme", house: "Dior", year: 2005, gender: "homme", family: "boisee", accords: ["iris", "cacao", "cuir", "patchouli", "lavande", "vétiver"] },
  { id: "dior-homme-intense", name: "Dior Homme Intense", house: "Dior", year: 2011, gender: "homme", family: "boisee", accords: ["iris", "ambrette", "cuir", "vétiver", "cacao"] },
  { id: "dior-homme-cologne", name: "Dior Homme Cologne", house: "Dior", year: 2013, gender: "homme", family: "hesperidee", accords: ["bergamote", "pamplemousse", "néroli", "musc blanc"] },
  { id: "dior-homme-parfum", name: "Dior Homme Parfum", house: "Dior", year: 2014, gender: "homme", family: "cuir", accords: ["iris", "cuir", "ambre gris", "santal"] },
  { id: "dior-fahrenheit", name: "Fahrenheit", house: "Dior", year: 1988, gender: "homme", family: "cuir", accords: ["violette", "cuir", "muscade", "aubépine", "santal", "vétiver"] },
  { id: "dior-higher", name: "Higher", house: "Dior", year: 2001, gender: "homme", family: "boisee", accords: ["poire", "bergamote", "cèdre", "musc", "santal"] },
  { id: "dior-escale-a-portofino", name: "Escale à Portofino", house: "Dior", year: 2008, gender: "mixte", family: "hesperidee", accords: ["bergamote", "citron", "cédrat", "petit-grain", "cyprès", "musc"] },
  { id: "dior-miss-dior-1947", name: "Miss Dior", house: "Dior", year: 1947, gender: "femme", family: "chypree", accords: ["galbanum", "gardénia", "mousse de chêne", "patchouli", "cuir"] },
  { id: "dior-miss-dior-blooming-bouquet", name: "Miss Dior Blooming Bouquet", house: "Dior", year: 2014, gender: "femme", family: "florale", accords: ["pivoine", "rose de damas", "abricot", "musc blanc", "mandarine"] },
  { id: "dior-miss-dior-cherie", name: "Miss Dior Chérie", house: "Dior", year: 2005, gender: "femme", family: "gourmande", accords: ["fraise des bois", "caramel", "patchouli", "musc", "ananas"] },
  { id: "dior-jadore", name: "J'adore", house: "Dior", year: 1999, gender: "femme", family: "florale", accords: ["ylang-ylang", "rose de damas", "jasmin sambac", "fleur d'oranger", "musc"] },
  { id: "dior-poison", name: "Poison", house: "Dior", year: 1985, gender: "femme", family: "ambree", accords: ["tubéreuse", "coriandre", "miel", "opoponax", "prune"] },
  { id: "dior-hypnotic-poison", name: "Hypnotic Poison", house: "Dior", year: 1998, gender: "femme", family: "gourmande", accords: ["amande amère", "vanille", "jasmin", "santal", "musc", "réglisse"] },
  { id: "dior-pure-poison", name: "Pure Poison", house: "Dior", year: 2004, gender: "femme", family: "florale", accords: ["jasmin", "gardénia", "fleur d'oranger", "ambre", "santal", "musc"] },
  { id: "dior-midnight-poison", name: "Midnight Poison", house: "Dior", year: 2007, gender: "femme", family: "ambree", accords: ["mandarine", "rose", "patchouli", "vanille", "ambre"] },
  { id: "dior-poison-girl", name: "Poison Girl", house: "Dior", year: 2016, gender: "femme", family: "gourmande", accords: ["amande", "vanille", "fève tonka", "rose", "orange"] },
  { id: "dior-dune", name: "Dune", house: "Dior", year: 1991, gender: "femme", family: "ambree", accords: ["mandarine", "aldéhydes", "pivoine", "jasmin", "vanille", "mousse de chêne"] },
  { id: "dior-diorissimo", name: "Diorissimo", house: "Dior", year: 1956, gender: "femme", family: "florale", accords: ["muguet", "jasmin", "ylang-ylang", "santal"] },
  { id: "dior-diorella", name: "Diorella", house: "Dior", year: 1972, gender: "femme", family: "chypree", accords: ["citron", "melon", "jasmin", "chèvrefeuille", "patchouli", "mousse de chêne"] },
  { id: "dior-dolce-vita", name: "Dolce Vita", house: "Dior", year: 1994, gender: "femme", family: "ambree", accords: ["abricot", "magnolia", "pêche", "cannelle", "héliotrope", "santal"] },
  { id: "dior-addict", name: "Dior Addict", house: "Dior", year: 2002, gender: "femme", family: "ambree", accords: ["vanille bourbon", "jasmin sambac", "fleur d'oranger", "santal", "fève tonka", "mandarine"] },
  { id: "dior-joy", name: "Joy by Dior", house: "Dior", year: 2018, gender: "femme", family: "florale-fruitee", accords: ["bergamote", "mandarine", "rose de grasse", "jasmin", "santal", "musc"] },
  { id: "dior-ambre-nuit", name: "Ambre Nuit", house: "Dior", year: 2009, gender: "mixte", family: "ambree", accords: ["rose de damas", "ambre gris", "poivre rose", "ambre"] },
  { id: "dior-oud-ispahan", name: "Oud Ispahan", house: "Dior", year: 2012, gender: "mixte", family: "boisee", accords: ["oud", "rose de damas", "patchouli", "labdanum", "safran"] },
  { id: "dior-bois-dargent", name: "Bois d'Argent", house: "Dior", year: 2004, gender: "mixte", family: "boisee", accords: ["iris", "encens", "myrrhe", "miel", "cuir", "pain d'épices"] },
  { id: "dior-cuir-cannage", name: "Cuir Cannage", house: "Dior", year: 2015, gender: "mixte", family: "cuir", accords: ["cuir", "iris", "osmanthus", "safran", "fève tonka"] },
  { id: "dior-gris-dior", name: "Gris Dior", house: "Dior", year: 2004, gender: "mixte", family: "chypree", accords: ["bergamote", "iris", "mousse de chêne", "patchouli", "néroli"] },
  { id: "dior-la-colle-noire", name: "La Colle Noire", house: "Dior", year: 2016, gender: "mixte", family: "florale", accords: ["rose de mai", "musc blanc", "santal", "fève tonka"] },
  { id: "dior-feve-delicieuse", name: "Fève Délicieuse", house: "Dior", year: 2015, gender: "mixte", family: "gourmande", accords: ["fève tonka", "amande", "caramel", "cacao", "vanille", "musc"] },
  { id: "dior-vanilla-diorama", name: "Vanilla Diorama", house: "Dior", year: 2021, gender: "mixte", family: "gourmande", accords: ["vanille", "caramel", "cacao", "mandarine", "rhum"] },
  { id: "dior-rouge-trafalgar", name: "Rouge Trafalgar", house: "Dior", year: 2019, gender: "mixte", family: "florale-fruitee", accords: ["cerise", "framboise", "cassis", "rose", "santal"] },

  // ─── Dolce & Gabbana ───────────────────────────────────────────────────────
  { id: "dolce-gabbana-light-blue", name: "Light Blue", house: "Dolce & Gabbana", year: 2001, gender: "femme", family: "hesperidee", accords: ["citron de sicile", "pomme granny smith", "cèdre", "jasmin", "musc", "ambre"] },
  { id: "dolce-gabbana-light-blue-pour-homme", name: "Light Blue Pour Homme", house: "Dolce & Gabbana", year: 2007, gender: "homme", family: "hesperidee", accords: ["pamplemousse", "mandarine", "genièvre", "romarin", "bois de rose", "musc"] },
  { id: "dolce-gabbana-light-blue-eau-intense", name: "Light Blue Eau Intense", house: "Dolce & Gabbana", year: 2017, gender: "femme", family: "hesperidee", accords: ["citron", "pomme", "jasmin", "note marine", "musc"] },
  { id: "dolce-gabbana-the-one", name: "The One", house: "Dolce & Gabbana", year: 2006, gender: "femme", family: "ambree", accords: ["bergamote", "litchi", "pêche", "muguet", "vanille", "ambre"] },
  { id: "dolce-gabbana-the-one-for-men", name: "The One for Men", house: "Dolce & Gabbana", year: 2008, gender: "homme", family: "ambree", accords: ["pamplemousse", "coriandre", "basilic", "cardamome", "gingembre", "tabac"] },
  { id: "dolce-gabbana-pour-homme", name: "Dolce & Gabbana Pour Homme", house: "Dolce & Gabbana", year: 1994, gender: "homme", family: "fougere", accords: ["lavande", "néroli", "tabac", "sauge", "mandarine", "bois"] },
  { id: "dolce-gabbana-k", name: "K by Dolce & Gabbana", house: "Dolce & Gabbana", year: 2019, gender: "homme", family: "boisee", accords: ["citron", "genièvre", "pamplemousse sanguin", "lavande", "cèdre", "patchouli"] },
  { id: "dolce-gabbana-q", name: "Q by Dolce & Gabbana", house: "Dolce & Gabbana", year: 2023, gender: "femme", family: "florale-fruitee", accords: ["citron", "cerise", "jasmin", "musc", "cèdre"] },
  { id: "dolce-gabbana-dolce", name: "Dolce", house: "Dolce & Gabbana", year: 2014, gender: "femme", family: "florale", accords: ["néroli", "papaye", "narcisse", "nénuphar", "musc", "bois de cachemire"] },
  { id: "dolce-gabbana-devotion", name: "Devotion", house: "Dolce & Gabbana", year: 2023, gender: "femme", family: "gourmande", accords: ["cédrat confit", "fleur d'oranger", "vanille", "praline"] },
  { id: "dolce-gabbana-limperatrice", name: "L'Impératrice", house: "Dolce & Gabbana", year: 2009, gender: "femme", family: "florale-fruitee", accords: ["pastèque", "kiwi", "cassis", "rose", "musc", "ambre"] },

  // ─── Escentric Molecules ───────────────────────────────────────────────────
  { id: "escentric-molecule-01", name: "Molecule 01", house: "Escentric Molecules", year: 2006, gender: "mixte", family: "boisee", accords: ["bois ambré", "cèdre"] },
  { id: "escentric-molecule-02", name: "Molecule 02", house: "Escentric Molecules", year: 2008, gender: "mixte", family: "musquee", accords: ["ambroxan", "musc", "ambre"] },
  { id: "escentric-molecule-03", name: "Molecule 03", house: "Escentric Molecules", year: 2010, gender: "mixte", family: "boisee", accords: ["vétiver", "bois"] },
  { id: "escentric-escentric-01", name: "Escentric 01", house: "Escentric Molecules", year: 2006, gender: "mixte", family: "boisee", accords: ["bois ambré", "thé vert", "citron vert", "poivre rose"] },

  // ─── Etat Libre d'Orange ───────────────────────────────────────────────────
  { id: "etat-libre-jasmin-et-cigarette", name: "Jasmin et Cigarette", house: "Etat Libre d'Orange", year: 2006, gender: "femme", family: "florale", accords: ["jasmin", "tabac", "abricot", "foin", "musc"] },
  { id: "etat-libre-fils-de-dieu", name: "Fils de Dieu", house: "Etat Libre d'Orange", year: 2012, gender: "mixte", family: "boisee", accords: ["riz", "gingembre", "citron vert", "coriandre", "santal", "cuir"] },
  { id: "etat-libre-rossy-de-palma", name: "Rossy de Palma Eau de Protection", house: "Etat Libre d'Orange", year: 2010, gender: "femme", family: "florale", accords: ["rose", "poivre", "cuir", "patchouli", "bois de gaïac"] },
  { id: "etat-libre-like-this", name: "Like This", house: "Etat Libre d'Orange", year: 2010, gender: "femme", family: "ambree", accords: ["gingembre", "potiron", "immortelle", "néroli", "musc", "vétiver"] },

  // ─── Frédéric Malle ────────────────────────────────────────────────────────
  { id: "malle-portrait-of-a-lady", name: "Portrait of a Lady", house: "Frédéric Malle", year: 2010, gender: "femme", family: "florale", accords: ["rose de turquie", "patchouli", "encens", "framboise", "santal", "benjoin"] },
  { id: "malle-musc-ravageur", name: "Musc Ravageur", house: "Frédéric Malle", year: 2000, gender: "mixte", family: "musquee", accords: ["musc", "vanille", "cannelle", "lavande", "ambre", "cèdre"] },
  { id: "malle-carnal-flower", name: "Carnal Flower", house: "Frédéric Malle", year: 2005, gender: "femme", family: "florale", accords: ["tubéreuse", "jasmin", "eucalyptus", "noix de coco", "musc"] },
  { id: "malle-french-lover", name: "French Lover", house: "Frédéric Malle", year: 2007, gender: "homme", family: "boisee", accords: ["angélique", "encens", "galbanum", "cèdre", "vétiver", "iris"] },
  { id: "malle-vetiver-extraordinaire", name: "Vetiver Extraordinaire", house: "Frédéric Malle", year: 2002, gender: "homme", family: "boisee", accords: ["vétiver", "encens", "poivre rose", "cèdre", "musc"] },
  { id: "malle-bigarade-concentree", name: "Bigarade Concentrée", house: "Frédéric Malle", year: 2002, gender: "mixte", family: "hesperidee", accords: ["orange amère", "foin", "cèdre", "rose", "musc"] },
  { id: "malle-lipstick-rose", name: "Lipstick Rose", house: "Frédéric Malle", year: 2000, gender: "femme", family: "florale", accords: ["rose", "violette", "framboise", "vanille", "musc"] },
  { id: "malle-une-rose", name: "Une Rose", house: "Frédéric Malle", year: 2003, gender: "femme", family: "florale", accords: ["rose", "truffe", "géranium", "angélique"] },
  { id: "malle-leau-dhiver", name: "L'Eau d'Hiver", house: "Frédéric Malle", year: 2003, gender: "mixte", family: "florale", accords: ["héliotrope", "iris", "angélique", "miel", "musc blanc"] },
  { id: "malle-dans-tes-bras", name: "Dans tes Bras", house: "Frédéric Malle", year: 2008, gender: "mixte", family: "musquee", accords: ["violette", "musc", "santal", "patchouli", "cassis"] },
  { id: "malle-geranium-pour-monsieur", name: "Géranium pour Monsieur", house: "Frédéric Malle", year: 2009, gender: "homme", family: "aromatique", accords: ["géranium", "menthe", "anis", "encens", "musc", "santal"] },
  { id: "malle-iris-poudre", name: "Iris Poudre", house: "Frédéric Malle", year: 2000, gender: "femme", family: "florale", accords: ["iris", "aldéhydes", "vanille", "musc", "santal", "ylang-ylang"] },
  { id: "malle-noir-epices", name: "Noir Épices", house: "Frédéric Malle", year: 2000, gender: "mixte", family: "ambree", accords: ["orange amère", "œillet", "cannelle", "poivre", "patchouli", "bois de rose"] },
  { id: "malle-the-night", name: "The Night", house: "Frédéric Malle", year: 2014, gender: "mixte", family: "ambree", accords: ["oud", "rose", "encens", "safran", "ambre"] },
  { id: "malle-superstitious", name: "Superstitious", house: "Frédéric Malle", year: 2017, gender: "femme", family: "florale", accords: ["aldéhydes", "jasmin", "rose", "patchouli", "vétiver", "ambre gris"] },
  { id: "malle-angeliques-sous-la-pluie", name: "Angéliques sous la Pluie", house: "Frédéric Malle", year: 2000, gender: "mixte", family: "verte", accords: ["angélique", "genièvre", "coriandre", "cèdre", "musc"] },
  { id: "malle-monsieur", name: "Monsieur.", house: "Frédéric Malle", year: 2016, gender: "homme", family: "boisee", accords: ["patchouli", "rhum", "encens", "vétiver", "mandarine"] },
  { id: "malle-cologne-indelebile", name: "Cologne Indélébile", house: "Frédéric Malle", year: 2015, gender: "mixte", family: "hesperidee", accords: ["fleur d'oranger", "néroli", "musc blanc", "benjoin"] },
  // ─── Givenchy ──────────────────────────────────────────────────────────────
  { id: "givenchy-gentleman-1974", name: "Gentleman", house: "Givenchy", year: 1974, gender: "homme", family: "boisee", accords: ["patchouli", "civette", "cuir", "iris", "miel", "cannelle"] },
  { id: "givenchy-gentleman-2017", name: "Gentleman Eau de Parfum", house: "Givenchy", year: 2017, gender: "homme", family: "boisee", accords: ["poire", "cardamome", "iris", "cuir", "patchouli", "vanille"] },
  { id: "givenchy-gentleman-boisee", name: "Gentleman Boisée", house: "Givenchy", year: 2020, gender: "homme", family: "boisee", accords: ["cardamome", "cacao", "cèdre", "patchouli", "vétiver"] },
  { id: "givenchy-linterdit-1957", name: "L'Interdit", house: "Givenchy", year: 1957, gender: "femme", family: "florale", accords: ["aldéhydes", "iris", "jasmin", "ambre", "santal"] },
  { id: "givenchy-linterdit-2018", name: "L'Interdit Eau de Parfum", house: "Givenchy", year: 2018, gender: "femme", family: "florale", accords: ["tubéreuse", "fleur d'oranger", "jasmin", "patchouli", "vétiver", "ambre"] },
  { id: "givenchy-ange-ou-demon", name: "Ange ou Démon", house: "Givenchy", year: 2006, gender: "femme", family: "ambree", accords: ["safran", "thym", "lys", "vanille", "fève tonka", "bois"] },
  { id: "givenchy-ange-ou-demon-le-secret", name: "Ange ou Démon Le Secret", house: "Givenchy", year: 2009, gender: "femme", family: "florale", accords: ["citron", "canneberge", "jasmin", "patchouli", "musc"] },
  { id: "givenchy-very-irresistible", name: "Very Irrésistible", house: "Givenchy", year: 2003, gender: "femme", family: "florale", accords: ["rose", "anis étoilé", "verveine", "musc"] },
  { id: "givenchy-dahlia-divin", name: "Dahlia Divin", house: "Givenchy", year: 2014, gender: "femme", family: "florale", accords: ["jasmin sambac", "mimosa", "santal", "vanille", "musc"] },
  { id: "givenchy-amarige", name: "Amarige", house: "Givenchy", year: 1991, gender: "femme", family: "florale", accords: ["tubéreuse", "mimosa", "ylang-ylang", "vanille", "santal", "musc"] },
  { id: "givenchy-organza", name: "Organza", house: "Givenchy", year: 1996, gender: "femme", family: "ambree", accords: ["gardénia", "tubéreuse", "iris", "vanille", "ambre", "benjoin"] },
  { id: "givenchy-pi", name: "Pi", house: "Givenchy", year: 1998, gender: "homme", family: "ambree", accords: ["vanille", "fève tonka", "benjoin", "romarin", "basilic", "mandarine"] },
  { id: "givenchy-xeryus-rouge", name: "Xeryus Rouge", house: "Givenchy", year: 1995, gender: "homme", family: "boisee", accords: ["poivre", "piment", "cèdre", "patchouli", "mousse de chêne"] },
  { id: "givenchy-monsieur", name: "Monsieur de Givenchy", house: "Givenchy", year: 1959, gender: "homme", family: "hesperidee", accords: ["citron", "lavande", "mousse de chêne", "vétiver"] },

  // ─── Goutal ────────────────────────────────────────────────────────────────
  { id: "goutal-eau-dhadrien", name: "Eau d'Hadrien", house: "Goutal", year: 1981, gender: "mixte", family: "hesperidee", accords: ["citron de sicile", "pamplemousse", "cyprès", "ylang-ylang"] },
  { id: "goutal-petite-cherie", name: "Petite Chérie", house: "Goutal", year: 1998, gender: "femme", family: "florale-fruitee", accords: ["poire", "rose", "musc", "vanille", "pêche"] },
  { id: "goutal-ninfeo-mio", name: "Ninfeo Mio", house: "Goutal", year: 2010, gender: "mixte", family: "verte", accords: ["figue", "citron vert", "galbanum", "basilic", "cyprès"] },
  { id: "goutal-songes", name: "Songes", house: "Goutal", year: 2006, gender: "femme", family: "florale", accords: ["tubéreuse", "frangipanier", "jasmin", "vanille", "santal"] },
  { id: "goutal-eau-du-sud", name: "Eau du Sud", house: "Goutal", year: 1997, gender: "mixte", family: "hesperidee", accords: ["citron", "menthe", "basilic", "patchouli", "mousse de chêne"] },
  { id: "goutal-mandragore", name: "Mandragore", house: "Goutal", year: 2005, gender: "mixte", family: "aromatique", accords: ["menthe poivrée", "gingembre", "poivre", "buis", "anis"] },
  { id: "goutal-nuit-etoilee", name: "Nuit Étoilée", house: "Goutal", year: 2012, gender: "mixte", family: "verte", accords: ["menthe", "pin", "sapin", "citron", "vétiver"] },

  // ─── Gucci ─────────────────────────────────────────────────────────────────
  { id: "gucci-guilty", name: "Gucci Guilty", house: "Gucci", year: 2010, gender: "femme", family: "ambree", accords: ["mandarine", "poivre rose", "pêche", "lilas", "patchouli", "ambre"] },
  { id: "gucci-guilty-pour-homme", name: "Gucci Guilty Pour Homme", house: "Gucci", year: 2011, gender: "homme", family: "aromatique", accords: ["lavande", "citron", "néroli", "patchouli", "cèdre"] },
  { id: "gucci-guilty-absolute", name: "Gucci Guilty Absolute", house: "Gucci", year: 2017, gender: "homme", family: "cuir", accords: ["cuir", "patchouli", "vétiver", "bois de gaïac", "cyprès"] },
  { id: "gucci-bloom", name: "Gucci Bloom", house: "Gucci", year: 2017, gender: "femme", family: "florale", accords: ["tubéreuse", "jasmin sambac", "iris", "chèvrefeuille"] },
  { id: "gucci-flora-gorgeous-gardenia", name: "Flora Gorgeous Gardenia", house: "Gucci", year: 2012, gender: "femme", family: "florale", accords: ["gardénia", "frangipanier", "poire", "patchouli", "sucre brun"] },
  { id: "gucci-rush", name: "Gucci Rush", house: "Gucci", year: 1999, gender: "femme", family: "florale", accords: ["gardénia", "coriandre", "freesia", "patchouli", "vanille", "vétiver"] },
  { id: "gucci-pour-homme", name: "Gucci Pour Homme", house: "Gucci", year: 2003, gender: "homme", family: "boisee", accords: ["encens", "thé", "violette", "cuir", "ambre", "cyprès"] },
  { id: "gucci-memoire-dune-odeur", name: "Mémoire d'une Odeur", house: "Gucci", year: 2019, gender: "mixte", family: "aromatique", accords: ["camomille romaine", "jasmin indien", "musc", "santal", "encens"] },
  { id: "gucci-intense-oud", name: "Gucci Intense Oud", house: "Gucci", year: 2016, gender: "mixte", family: "boisee", accords: ["oud", "ambre", "cuir", "poire", "safran", "patchouli"] },
  { id: "gucci-bamboo", name: "Gucci Bamboo", house: "Gucci", year: 2015, gender: "femme", family: "florale", accords: ["bergamote", "lys", "ylang-ylang", "santal", "vanille", "ambre"] },

  // ─── Guerlain ──────────────────────────────────────────────────────────────
  { id: "guerlain-shalimar", name: "Shalimar", house: "Guerlain", year: 1925, gender: "femme", family: "ambree", accords: ["bergamote", "citron", "iris", "vanille", "encens", "fève tonka"] },
  { id: "guerlain-jicky", name: "Jicky", house: "Guerlain", year: 1889, gender: "mixte", family: "fougere", accords: ["lavande", "bergamote", "vanille", "civette", "fève tonka", "iris"] },
  { id: "guerlain-mitsouko", name: "Mitsouko", house: "Guerlain", year: 1919, gender: "femme", family: "chypree", accords: ["pêche", "bergamote", "jasmin", "mousse de chêne", "cannelle", "vétiver"] },
  { id: "guerlain-lheure-bleue", name: "L'Heure Bleue", house: "Guerlain", year: 1912, gender: "femme", family: "ambree", accords: ["anis", "néroli", "iris", "héliotrope", "vanille", "benjoin"] },
  { id: "guerlain-vol-de-nuit", name: "Vol de Nuit", house: "Guerlain", year: 1933, gender: "femme", family: "ambree", accords: ["galbanum", "jonquille", "iris", "santal", "vanille", "mousse de chêne"] },
  { id: "guerlain-habit-rouge", name: "Habit Rouge", house: "Guerlain", year: 1965, gender: "homme", family: "ambree", accords: ["bergamote", "orange", "cuir", "vanille", "patchouli", "rose"] },
  { id: "guerlain-vetiver", name: "Vétiver", house: "Guerlain", year: 1961, gender: "homme", family: "boisee", accords: ["vétiver", "tabac", "muscade", "poivre", "mousse de chêne", "agrumes"] },
  { id: "guerlain-heritage", name: "Héritage", house: "Guerlain", year: 1992, gender: "homme", family: "boisee", accords: ["lavande", "poivre", "cannelle", "patchouli", "vanille", "santal"] },
  { id: "guerlain-homme", name: "Guerlain Homme", house: "Guerlain", year: 2008, gender: "homme", family: "aromatique", accords: ["menthe", "citron vert", "rhum", "cèdre", "vétiver", "patchouli"] },
  { id: "guerlain-lhomme-ideal", name: "L'Homme Idéal", house: "Guerlain", year: 2014, gender: "homme", family: "ambree", accords: ["amande", "romarin", "bergamote", "cuir", "fève tonka", "vanille"] },
  { id: "guerlain-linstant-pour-homme", name: "L'Instant de Guerlain Pour Homme", house: "Guerlain", year: 2004, gender: "homme", family: "boisee", accords: ["citron", "badiane", "cacao", "patchouli", "cèdre", "vétiver"] },
  { id: "guerlain-la-petite-robe-noire", name: "La Petite Robe Noire", house: "Guerlain", year: 2012, gender: "femme", family: "gourmande", accords: ["cerise noire", "amande", "rose", "réglisse", "fève tonka", "patchouli"] },
  { id: "guerlain-mon-guerlain", name: "Mon Guerlain", house: "Guerlain", year: 2017, gender: "femme", family: "ambree", accords: ["lavande", "vanille", "iris", "jasmin sambac", "santal", "coumarine"] },
  { id: "guerlain-insolence", name: "Insolence", house: "Guerlain", year: 2006, gender: "femme", family: "florale", accords: ["violette", "iris", "rose", "framboise", "fève tonka"] },
  { id: "guerlain-idylle", name: "Idylle", house: "Guerlain", year: 2009, gender: "femme", family: "florale", accords: ["rose bulgare", "lilas", "muguet", "patchouli", "musc"] },
  { id: "guerlain-samsara", name: "Samsara", house: "Guerlain", year: 1989, gender: "femme", family: "boisee", accords: ["santal", "ylang-ylang", "jasmin", "iris", "vanille", "fève tonka"] },
  { id: "guerlain-nahema", name: "Nahéma", house: "Guerlain", year: 1979, gender: "femme", family: "florale", accords: ["rose", "pêche", "jacinthe", "jasmin", "vanille", "bois de rose"] },
  { id: "guerlain-chamade", name: "Chamade", house: "Guerlain", year: 1969, gender: "femme", family: "florale", accords: ["galbanum", "jacinthe", "jasmin", "vanille", "benjoin", "iris"] },
  { id: "guerlain-aqua-allegoria-pamplelune", name: "Aqua Allegoria Pamplelune", house: "Guerlain", year: 1999, gender: "mixte", family: "hesperidee", accords: ["pamplemousse", "cassis", "néroli", "patchouli", "vanille"] },
  { id: "guerlain-aqua-allegoria-herba-fresca", name: "Aqua Allegoria Herba Fresca", house: "Guerlain", year: 1999, gender: "mixte", family: "verte", accords: ["menthe", "thé vert", "citron", "muguet", "bois"] },
  { id: "guerlain-aqua-allegoria-mandarine-basilic", name: "Aqua Allegoria Mandarine Basilic", house: "Guerlain", year: 2007, gender: "mixte", family: "hesperidee", accords: ["mandarine", "basilic", "cassis", "musc blanc"] },
  { id: "guerlain-angelique-noire", name: "Angélique Noire", house: "Guerlain", year: 2005, gender: "mixte", family: "ambree", accords: ["angélique", "vanille", "poire", "encens", "santal"] },
  { id: "guerlain-cuir-beluga", name: "Cuir Béluga", house: "Guerlain", year: 2005, gender: "mixte", family: "cuir", accords: ["cuir", "mandarine", "héliotrope", "vanille", "ambre", "fève tonka"] },
  { id: "guerlain-spirituese-double-vanille", name: "Spiritueuse Double Vanille", house: "Guerlain", year: 2007, gender: "mixte", family: "gourmande", accords: ["vanille", "rhum", "encens", "benjoin", "cèdre", "rose"] },
  { id: "guerlain-bois-darmenie", name: "Bois d'Arménie", house: "Guerlain", year: 2006, gender: "mixte", family: "boisee", accords: ["encens", "benjoin", "iris", "patchouli", "papyrus", "ambre"] },
  { id: "guerlain-tonka-imperiale", name: "Tonka Impériale", house: "Guerlain", year: 2010, gender: "mixte", family: "gourmande", accords: ["fève tonka", "amande", "miel", "tabac", "cèdre"] },
  { id: "guerlain-santal-royal", name: "Santal Royal", house: "Guerlain", year: 2015, gender: "mixte", family: "boisee", accords: ["santal", "oud", "rose", "cuir", "jasmin", "vanille"] },

  // ─── Hermès ────────────────────────────────────────────────────────────────
  { id: "hermes-terre-dhermes", name: "Terre d'Hermès", house: "Hermès", year: 2006, gender: "homme", family: "boisee", accords: ["orange", "pamplemousse", "silex", "poivre", "vétiver", "cèdre"] },
  { id: "hermes-terre-dhermes-eau-intense-vetiver", name: "Terre d'Hermès Eau Intense Vétiver", house: "Hermès", year: 2018, gender: "homme", family: "boisee", accords: ["vétiver", "bergamote", "poivre de sichuan", "patchouli"] },
  { id: "hermes-eau-des-merveilles", name: "Eau des Merveilles", house: "Hermès", year: 2004, gender: "femme", family: "ambree", accords: ["orange amère", "poivre rose", "ambre gris", "cèdre", "vétiver", "note salée"] },
  { id: "hermes-lambre-des-merveilles", name: "L'Ambre des Merveilles", house: "Hermès", year: 2012, gender: "femme", family: "ambree", accords: ["ambre", "vanille", "patchouli", "labdanum", "note salée"] },
  { id: "hermes-un-jardin-sur-le-nil", name: "Un Jardin sur le Nil", house: "Hermès", year: 2005, gender: "mixte", family: "verte", accords: ["mangue verte", "lotus", "tomate verte", "encens", "sycomore"] },
  { id: "hermes-un-jardin-en-mediterranee", name: "Un Jardin en Méditerranée", house: "Hermès", year: 2003, gender: "mixte", family: "verte", accords: ["figue", "feuille de figuier", "bergamote", "laurier", "cèdre"] },
  { id: "hermes-un-jardin-apres-la-mousson", name: "Un Jardin après la Mousson", house: "Hermès", year: 2008, gender: "mixte", family: "aquatique", accords: ["gingembre", "melon", "cardamome", "poivre", "vétiver"] },
  { id: "hermes-un-jardin-sur-le-toit", name: "Un Jardin sur le Toit", house: "Hermès", year: 2011, gender: "mixte", family: "verte", accords: ["pomme", "poire", "rose", "magnolia", "herbe coupée"] },
  { id: "hermes-un-jardin-sur-la-lagune", name: "Un Jardin sur la Lagune", house: "Hermès", year: 2019, gender: "mixte", family: "florale", accords: ["magnolia", "lys", "pin", "ambre"] },
  { id: "hermes-le-jardin-de-monsieur-li", name: "Le Jardin de Monsieur Li", house: "Hermès", year: 2015, gender: "mixte", family: "hesperidee", accords: ["kumquat", "jasmin", "menthe", "bambou", "prunier"] },
  { id: "hermes-voyage-dhermes", name: "Voyage d'Hermès", house: "Hermès", year: 2010, gender: "mixte", family: "boisee", accords: ["cardamome", "thé", "musc", "bois", "poivre", "néroli"] },
  { id: "hermes-kelly-caleche", name: "Kelly Calèche", house: "Hermès", year: 2007, gender: "femme", family: "cuir", accords: ["cuir", "iris", "rose", "tubéreuse", "narcisse", "mimosa"] },
  { id: "hermes-twilly", name: "Twilly d'Hermès", house: "Hermès", year: 2017, gender: "femme", family: "florale", accords: ["gingembre", "tubéreuse", "santal", "bergamote", "vanille"] },
  { id: "hermes-24-faubourg", name: "24 Faubourg", house: "Hermès", year: 1995, gender: "femme", family: "florale", accords: ["fleur d'oranger", "jasmin sambac", "iris", "patchouli", "vanille", "ambre"] },
  { id: "hermes-eau-dorange-verte", name: "Eau d'Orange Verte", house: "Hermès", year: 1979, gender: "mixte", family: "hesperidee", accords: ["orange", "menthe", "mandarine", "mousse de chêne", "patchouli"] },
  { id: "hermes-bel-ami", name: "Bel Ami", house: "Hermès", year: 1986, gender: "homme", family: "cuir", accords: ["cuir", "bergamote", "cardamome", "patchouli", "vétiver", "mousse de chêne"] },
  { id: "hermes-equipage", name: "Équipage", house: "Hermès", year: 1970, gender: "homme", family: "boisee", accords: ["coriandre", "carvi", "jasmin", "mousse de chêne", "santal", "vétiver"] },
  { id: "hermes-vetiver-tonka", name: "Hermessence Vétiver Tonka", house: "Hermès", year: 2004, gender: "mixte", family: "boisee", accords: ["vétiver", "fève tonka", "noisette grillée", "agrumes"] },
  { id: "hermes-ambre-narguile", name: "Hermessence Ambre Narguilé", house: "Hermès", year: 2004, gender: "mixte", family: "gourmande", accords: ["miel", "tabac", "cannelle", "rhum", "caramel", "vanille"] },
  { id: "hermes-cuir-dange", name: "Hermessence Cuir d'Ange", house: "Hermès", year: 2014, gender: "mixte", family: "cuir", accords: ["cuir", "violette", "narcisse", "aubépine", "musc"] },
  { id: "hermes-santal-massoia", name: "Hermessence Santal Massoïa", house: "Hermès", year: 2011, gender: "mixte", family: "boisee", accords: ["santal", "lait de figue", "noix de coco", "massoïa"] },
  { id: "hermes-h24", name: "H24", house: "Hermès", year: 2021, gender: "homme", family: "aromatique", accords: ["sauge sclarée", "narcisse", "bois de rose", "musc"] },

  // ─── Hugo Boss ─────────────────────────────────────────────────────────────
  { id: "hugo-boss-bottled", name: "Boss Bottled", house: "Hugo Boss", year: 1998, gender: "homme", family: "boisee", accords: ["pomme", "cannelle", "vanille", "santal", "cèdre", "vétiver"] },
  { id: "hugo-boss-bottled-night", name: "Boss Bottled Night", house: "Hugo Boss", year: 2010, gender: "homme", family: "boisee", accords: ["lavande", "bouleau", "cardamome", "musc", "santal"] },
  { id: "hugo-boss-bottled-infinite", name: "Boss Bottled Infinite", house: "Hugo Boss", year: 2019, gender: "homme", family: "boisee", accords: ["pomme", "lavande", "patchouli", "cèdre", "vétiver"] },
  { id: "hugo-boss-hugo-man", name: "Hugo Man", house: "Hugo Boss", year: 1995, gender: "homme", family: "aromatique", accords: ["pomme verte", "menthe", "sapin", "basilic", "patchouli", "mousse de chêne"] },
  { id: "hugo-boss-the-scent", name: "Boss The Scent", house: "Hugo Boss", year: 2015, gender: "homme", family: "ambree", accords: ["gingembre", "cuir", "lavande", "fruit maninka"] },
  { id: "hugo-boss-the-scent-for-her", name: "Boss The Scent for Her", house: "Hugo Boss", year: 2016, gender: "femme", family: "gourmande", accords: ["pêche", "fleur d'oranger", "cacao", "miel"] },
  { id: "hugo-boss-number-one", name: "Boss Number One", house: "Hugo Boss", year: 1985, gender: "homme", family: "fougere", accords: ["lavande", "basilic", "mousse de chêne", "patchouli", "ambre"] },

  // ─── Initio Parfums Privés ─────────────────────────────────────────────────
  { id: "initio-oud-for-greatness", name: "Oud for Greatness", house: "Initio Parfums Privés", year: 2018, gender: "mixte", family: "boisee", accords: ["oud", "safran", "muscade", "musc", "patchouli", "lavande"] },
  { id: "initio-side-effect", name: "Side Effect", house: "Initio Parfums Privés", year: 2016, gender: "mixte", family: "ambree", accords: ["rhum", "vanille", "tabac", "cannelle", "cuir", "ambre"] },
  { id: "initio-psychedelic-love", name: "Psychedelic Love", house: "Initio Parfums Privés", year: 2019, gender: "mixte", family: "florale", accords: ["rose", "patchouli", "vanille", "framboise", "ambre gris"] },
  { id: "initio-rehab", name: "Rehab", house: "Initio Parfums Privés", year: 2019, gender: "mixte", family: "ambree", accords: ["bergamote", "vanille", "benjoin", "patchouli", "musc"] },
  { id: "initio-musk-therapy", name: "Musk Therapy", house: "Initio Parfums Privés", year: 2018, gender: "mixte", family: "musquee", accords: ["musc", "ambre gris", "bois blanc", "ambrette"] },
  { id: "initio-atomic-rose", name: "Atomic Rose", house: "Initio Parfums Privés", year: 2019, gender: "mixte", family: "florale", accords: ["rose", "framboise", "ambre gris", "musc"] },
  { id: "initio-paragon", name: "Paragon", house: "Initio Parfums Privés", year: 2017, gender: "mixte", family: "boisee", accords: ["poivre noir", "encens", "cuir", "patchouli", "vanille"] },
  { id: "initio-absolute-aphrodisiac", name: "Absolute Aphrodisiac", house: "Initio Parfums Privés", year: 2015, gender: "mixte", family: "ambree", accords: ["fleur d'oranger", "benjoin", "vanille", "musc", "ambre gris"] },

  // ─── Issey Miyake ──────────────────────────────────────────────────────────
  { id: "issey-miyake-leau-dissey", name: "L'Eau d'Issey", house: "Issey Miyake", year: 1992, gender: "femme", family: "aquatique", accords: ["lotus", "freesia", "pivoine", "œillet", "musc", "bois"] },
  { id: "issey-miyake-leau-dissey-pour-homme", name: "L'Eau d'Issey Pour Homme", house: "Issey Miyake", year: 1994, gender: "homme", family: "aquatique", accords: ["yuzu", "bergamote", "muscade", "cannelle", "santal", "tabac"] },
  { id: "issey-miyake-leau-dissey-pour-homme-intense", name: "L'Eau d'Issey Pour Homme Intense", house: "Issey Miyake", year: 2007, gender: "homme", family: "aquatique", accords: ["yuzu", "mandarine", "cardamome", "santal", "vétiver"] },
  { id: "issey-miyake-nuit-dissey", name: "Nuit d'Issey", house: "Issey Miyake", year: 2014, gender: "homme", family: "boisee", accords: ["bergamote", "poivre noir", "cuir", "bois de gaïac", "encens", "vétiver"] },
  { id: "issey-miyake-a-scent", name: "A Scent by Issey Miyake", house: "Issey Miyake", year: 2009, gender: "femme", family: "verte", accords: ["jacinthe", "verveine", "jasmin", "cèdre", "galbanum"] },

  // ─── Jean Paul Gaultier ────────────────────────────────────────────────────
  { id: "jpg-le-male", name: "Le Mâle", house: "Jean Paul Gaultier", year: 1995, gender: "homme", family: "fougere", accords: ["lavande", "menthe", "vanille", "fève tonka", "cannelle", "cardamome"] },
  { id: "jpg-le-male-le-parfum", name: "Le Mâle Le Parfum", house: "Jean Paul Gaultier", year: 2020, gender: "homme", family: "ambree", accords: ["cardamome", "lavande", "vanille", "cèdre", "iris"] },
  { id: "jpg-le-male-elixir", name: "Le Mâle Elixir", house: "Jean Paul Gaultier", year: 2023, gender: "homme", family: "gourmande", accords: ["miel", "vanille", "benjoin", "lavande", "fève tonka"] },
  { id: "jpg-ultra-male", name: "Ultra Mâle", house: "Jean Paul Gaultier", year: 2015, gender: "homme", family: "gourmande", accords: ["poire", "lavande", "cannelle", "vanille", "cèdre", "fève tonka"] },
  { id: "jpg-le-beau", name: "Le Beau", house: "Jean Paul Gaultier", year: 2019, gender: "homme", family: "boisee", accords: ["noix de coco", "bergamote", "bois de gaïac", "fève tonka"] },
  { id: "jpg-classique", name: "Classique", house: "Jean Paul Gaultier", year: 1993, gender: "femme", family: "florale", accords: ["fleur d'oranger", "rose", "gingembre", "vanille", "ambre", "musc"] },
  { id: "jpg-scandal", name: "Scandal", house: "Jean Paul Gaultier", year: 2017, gender: "femme", family: "gourmande", accords: ["miel", "caramel", "gardénia", "patchouli", "orange sanguine"] },
  { id: "jpg-scandal-pour-homme", name: "Scandal Pour Homme", house: "Jean Paul Gaultier", year: 2021, gender: "homme", family: "gourmande", accords: ["caramel", "sauge sclarée", "fève tonka", "vétiver", "mandarine"] },
  { id: "jpg-fleur-du-male", name: "Fleur du Mâle", house: "Jean Paul Gaultier", year: 2007, gender: "homme", family: "florale", accords: ["fleur d'oranger", "néroli", "musc", "fève tonka"] },
  { id: "jpg-la-belle", name: "La Belle", house: "Jean Paul Gaultier", year: 2019, gender: "femme", family: "gourmande", accords: ["poire", "vanille", "santal", "anis étoilé"] },
  { id: "jpg-gaultier-2", name: "Gaultier²", house: "Jean Paul Gaultier", year: 2005, gender: "mixte", family: "musquee", accords: ["musc", "ambre", "vanille", "anis"] },
  { id: "jpg-kokorico", name: "Kokorico", house: "Jean Paul Gaultier", year: 2011, gender: "homme", family: "boisee", accords: ["cacao", "fève tonka", "patchouli", "figue", "vétiver"] },

  // ─── Jo Malone London ──────────────────────────────────────────────────────
  { id: "jo-malone-wood-sage-sea-salt", name: "Wood Sage & Sea Salt", house: "Jo Malone London", year: 2014, gender: "mixte", family: "aquatique", accords: ["sel marin", "sauge", "ambrette", "pamplemousse"] },
  { id: "jo-malone-lime-basil-mandarin", name: "Lime Basil & Mandarin", house: "Jo Malone London", year: 1999, gender: "mixte", family: "hesperidee", accords: ["citron vert", "basilic", "mandarine", "thym", "patchouli"] },
  { id: "jo-malone-english-pear-freesia", name: "English Pear & Freesia", house: "Jo Malone London", year: 2010, gender: "femme", family: "florale-fruitee", accords: ["poire", "freesia", "patchouli", "rose", "ambre"] },
  { id: "jo-malone-peony-blush-suede", name: "Peony & Blush Suede", house: "Jo Malone London", year: 2013, gender: "femme", family: "florale", accords: ["pivoine", "pomme rouge", "jasmin", "daim", "musc"] },
  { id: "jo-malone-blackberry-bay", name: "Blackberry & Bay", house: "Jo Malone London", year: 2012, gender: "mixte", family: "verte", accords: ["mûre", "feuille de laurier", "cassis", "cèdre"] },
  { id: "jo-malone-pomegranate-noir", name: "Pomegranate Noir", house: "Jo Malone London", year: 2005, gender: "mixte", family: "boisee", accords: ["grenade", "framboise", "patchouli", "encens", "bois de gaïac"] },
  { id: "jo-malone-nectarine-blossom-honey", name: "Nectarine Blossom & Honey", house: "Jo Malone London", year: 2005, gender: "femme", family: "florale-fruitee", accords: ["nectarine", "pêche", "cassis", "miel", "acacia"] },
  { id: "jo-malone-velvet-rose-oud", name: "Velvet Rose & Oud", house: "Jo Malone London", year: 2012, gender: "mixte", family: "boisee", accords: ["rose de damas", "oud", "clou de girofle", "praline"] },
  { id: "jo-malone-myrrh-tonka", name: "Myrrh & Tonka", house: "Jo Malone London", year: 2016, gender: "mixte", family: "gourmande", accords: ["myrrhe", "fève tonka", "lavande", "vanille", "amande"] },
  { id: "jo-malone-oud-bergamot", name: "Oud & Bergamot", house: "Jo Malone London", year: 2010, gender: "mixte", family: "boisee", accords: ["oud", "bergamote", "cèdre", "orange", "encens"] },
  { id: "jo-malone-wild-bluebell", name: "Wild Bluebell", house: "Jo Malone London", year: 2011, gender: "femme", family: "florale", accords: ["jacinthe des bois", "cassis", "muguet", "musc", "ambre"] },
  { id: "jo-malone-orange-blossom", name: "Orange Blossom", house: "Jo Malone London", year: 2011, gender: "femme", family: "florale", accords: ["fleur d'oranger", "clémentine", "lilas", "muguet"] },

  // ─── Juliette Has a Gun ────────────────────────────────────────────────────
  { id: "juliette-not-a-perfume", name: "Not a Perfume", house: "Juliette Has a Gun", year: 2010, gender: "mixte", family: "musquee", accords: ["ambroxan", "musc"] },
  { id: "juliette-lady-vengeance", name: "Lady Vengeance", house: "Juliette Has a Gun", year: 2006, gender: "femme", family: "florale", accords: ["rose de bulgarie", "patchouli", "vanille", "musc", "cèdre"] },
  { id: "juliette-miss-charming", name: "Miss Charming", house: "Juliette Has a Gun", year: 2006, gender: "femme", family: "florale-fruitee", accords: ["rose", "framboise", "fraise", "musc", "ambre"] },
  { id: "juliette-moscow-mule", name: "Moscow Mule", house: "Juliette Has a Gun", year: 2019, gender: "mixte", family: "hesperidee", accords: ["gingembre", "citron vert", "menthe", "musc"] },
  { id: "juliette-musc-invisible", name: "Musc Invisible", house: "Juliette Has a Gun", year: 2019, gender: "mixte", family: "musquee", accords: ["musc blanc", "poire", "bois de cachemire", "fleur d'oranger"] },
  { id: "juliette-vanilla-vibes", name: "Vanilla Vibes", house: "Juliette Has a Gun", year: 2020, gender: "mixte", family: "gourmande", accords: ["vanille", "cardamome", "benjoin", "musc"] },
  // ─── Kenzo ─────────────────────────────────────────────────────────────────
  { id: "kenzo-flower", name: "Flower by Kenzo", house: "Kenzo", year: 2000, gender: "femme", family: "florale", accords: ["coquelicot", "violette", "rose bulgare", "vanille", "musc blanc"] },
  { id: "kenzo-leau-par-kenzo-homme", name: "L'Eau par Kenzo Pour Homme", house: "Kenzo", year: 1996, gender: "homme", family: "aquatique", accords: ["menthe", "yuzu", "gingembre", "cèdre", "musc"] },
  { id: "kenzo-leau-par-kenzo-femme", name: "L'Eau par Kenzo Pour Femme", house: "Kenzo", year: 1996, gender: "femme", family: "aquatique", accords: ["nénuphar", "menthe poivrée", "pêche", "musc blanc"] },
  { id: "kenzo-jungle-lelephant", name: "Jungle L'Éléphant", house: "Kenzo", year: 1996, gender: "femme", family: "ambree", accords: ["cardamome", "cumin", "girofle", "vanille", "patchouli", "réglisse"] },
  { id: "kenzo-homme", name: "Kenzo Homme", house: "Kenzo", year: 1991, gender: "homme", family: "aquatique", accords: ["note marine", "bergamote", "cardamome", "cèdre", "musc"] },
  { id: "kenzo-amour", name: "Kenzo Amour", house: "Kenzo", year: 2006, gender: "femme", family: "florale", accords: ["frangipanier", "riz", "vanille", "encens", "musc"] },
  { id: "kenzo-world", name: "Kenzo World", house: "Kenzo", year: 2016, gender: "femme", family: "florale", accords: ["pivoine", "ambrette", "vanille", "jasmin"] },

  // ─── Kilian ────────────────────────────────────────────────────────────────
  { id: "kilian-angels-share", name: "Angels' Share", house: "Kilian", year: 2020, gender: "mixte", family: "gourmande", accords: ["cognac", "cannelle", "fève tonka", "praline", "cèdre", "vanille"] },
  { id: "kilian-love-dont-be-shy", name: "Love, Don't Be Shy", house: "Kilian", year: 2007, gender: "femme", family: "gourmande", accords: ["fleur d'oranger", "guimauve", "caramel", "musc", "vanille"] },
  { id: "kilian-black-phantom", name: "Black Phantom", house: "Kilian", year: 2017, gender: "mixte", family: "gourmande", accords: ["rhum", "café", "caramel", "santal", "sucre"] },
  { id: "kilian-straight-to-heaven", name: "Straight to Heaven", house: "Kilian", year: 2007, gender: "homme", family: "boisee", accords: ["rhum", "santal", "patchouli", "muscade", "musc"] },
  { id: "kilian-good-girl-gone-bad", name: "Good Girl Gone Bad", house: "Kilian", year: 2012, gender: "femme", family: "florale", accords: ["tubéreuse", "jasmin", "osmanthus", "rose de mai", "ambre"] },
  { id: "kilian-apple-brandy-on-the-rocks", name: "Apple Brandy on the Rocks", house: "Kilian", year: 2021, gender: "mixte", family: "gourmande", accords: ["pomme", "rhum", "cannelle", "bois"] },
  { id: "kilian-vodka-on-the-rocks", name: "Vodka on the Rocks", house: "Kilian", year: 2011, gender: "mixte", family: "ambree", accords: ["coriandre", "angélique", "ambre", "musc"] },
  { id: "kilian-intoxicated", name: "Intoxicated", house: "Kilian", year: 2013, gender: "mixte", family: "gourmande", accords: ["café", "cardamome", "muscade", "vanille", "santal"] },
  { id: "kilian-rolling-in-love", name: "Rolling in Love", house: "Kilian", year: 2015, gender: "femme", family: "musquee", accords: ["amande", "musc blanc", "iris", "tubéreuse"] },
  { id: "kilian-moonlight-in-heaven", name: "Moonlight in Heaven", house: "Kilian", year: 2017, gender: "mixte", family: "hesperidee", accords: ["mangue", "pamplemousse", "noix de coco", "riz", "vétiver"] },
  { id: "kilian-back-to-black", name: "Back to Black", house: "Kilian", year: 2009, gender: "mixte", family: "ambree", accords: ["tabac", "miel", "vanille", "cerise", "cardamome"] },
  { id: "kilian-sacred-wood", name: "Sacred Wood", house: "Kilian", year: 2016, gender: "mixte", family: "boisee", accords: ["santal", "vanille", "musc", "cèdre"] },
  { id: "kilian-roses-on-ice", name: "Roses on Ice", house: "Kilian", year: 2014, gender: "mixte", family: "florale", accords: ["rose", "genièvre", "concombre", "musc"] },
  { id: "kilian-liaisons-dangereuses", name: "Liaisons Dangereuses", house: "Kilian", year: 2007, gender: "femme", family: "florale-fruitee", accords: ["prune", "rose", "jasmin", "patchouli", "vanille"] },

  // ─── Lacoste ───────────────────────────────────────────────────────────────
  { id: "lacoste-pour-homme", name: "Lacoste Pour Homme", house: "Lacoste", year: 2002, gender: "homme", family: "boisee", accords: ["pamplemousse", "poivre rose", "cèdre", "ambre", "musc"] },
  { id: "lacoste-l1212-blanc", name: "Eau de Lacoste L.12.12 Blanc", house: "Lacoste", year: 2011, gender: "homme", family: "boisee", accords: ["pamplemousse", "cardamome", "cèdre", "vétiver", "musc"] },
  { id: "lacoste-essential", name: "Essential", house: "Lacoste", year: 2005, gender: "homme", family: "aromatique", accords: ["pomme", "basilic", "cèdre", "patchouli"] },
  { id: "lacoste-booster", name: "Booster", house: "Lacoste", year: 1996, gender: "homme", family: "hesperidee", accords: ["citron", "menthe", "lavande", "mousse de chêne"] },

  // ─── Lalique ───────────────────────────────────────────────────────────────
  { id: "lalique-encre-noire", name: "Encre Noire", house: "Lalique", year: 2006, gender: "homme", family: "boisee", accords: ["vétiver", "cyprès", "musc", "cèdre"] },
  { id: "lalique-pour-homme", name: "Lalique Pour Homme", house: "Lalique", year: 1997, gender: "homme", family: "boisee", accords: ["santal", "vanille", "patchouli", "cannelle"] },
  { id: "lalique-le-parfum", name: "Lalique Le Parfum", house: "Lalique", year: 2005, gender: "femme", family: "ambree", accords: ["badiane", "héliotrope", "vanille", "fève tonka", "jasmin"] },

  // ─── Lancôme ───────────────────────────────────────────────────────────────
  { id: "lancome-la-vie-est-belle", name: "La Vie Est Belle", house: "Lancôme", year: 2012, gender: "femme", family: "gourmande", accords: ["iris", "praline", "patchouli", "fève tonka", "vanille", "cassis"] },
  { id: "lancome-la-vie-est-belle-intensement", name: "La Vie Est Belle Intensément", house: "Lancôme", year: 2018, gender: "femme", family: "gourmande", accords: ["iris", "praline", "vanille", "jasmin", "patchouli"] },
  { id: "lancome-la-nuit-tresor", name: "La Nuit Trésor", house: "Lancôme", year: 2015, gender: "femme", family: "gourmande", accords: ["fève tonka", "rose", "framboise", "vanille", "papyrus", "litchi"] },
  { id: "lancome-tresor", name: "Trésor", house: "Lancôme", year: 1990, gender: "femme", family: "florale", accords: ["rose", "abricot", "lilas", "iris", "santal", "vanille"] },
  { id: "lancome-tresor-midnight-rose", name: "Trésor Midnight Rose", house: "Lancôme", year: 2011, gender: "femme", family: "florale-fruitee", accords: ["framboise", "rose", "cassis", "jasmin", "vanille", "musc"] },
  { id: "lancome-poeme", name: "Poême", house: "Lancôme", year: 1995, gender: "femme", family: "florale", accords: ["datura", "mimosa", "vanille", "tubéreuse", "rose"] },
  { id: "lancome-o-de-lancome", name: "Ô de Lancôme", house: "Lancôme", year: 1969, gender: "femme", family: "hesperidee", accords: ["citron", "bergamote", "chèvrefeuille", "vétiver", "mousse de chêne"] },
  { id: "lancome-miracle", name: "Miracle", house: "Lancôme", year: 2000, gender: "femme", family: "florale", accords: ["litchi", "freesia", "gingembre", "jasmin", "magnolia", "musc"] },
  { id: "lancome-hypnose", name: "Hypnôse", house: "Lancôme", year: 2005, gender: "femme", family: "ambree", accords: ["fruit de la passion", "vétiver", "vanille", "jasmin", "fève tonka"] },
  { id: "lancome-hypnose-homme", name: "Hypnôse Homme", house: "Lancôme", year: 2007, gender: "homme", family: "ambree", accords: ["lavande", "cardamome", "patchouli", "vanille"] },
  { id: "lancome-idole", name: "Idôle", house: "Lancôme", year: 2019, gender: "femme", family: "florale", accords: ["rose", "jasmin", "poire", "musc blanc", "vanille", "patchouli"] },
  { id: "lancome-idole-lintense", name: "Idôle L'Intense", house: "Lancôme", year: 2020, gender: "femme", family: "florale", accords: ["rose", "jasmin", "vanille", "patchouli"] },
  { id: "lancome-magie-noire", name: "Magie Noire", house: "Lancôme", year: 1978, gender: "femme", family: "chypree", accords: ["cassis", "galbanum", "rose", "patchouli", "mousse de chêne", "civette"] },
  { id: "lancome-climat", name: "Climat", house: "Lancôme", year: 1967, gender: "femme", family: "florale", accords: ["aldéhydes", "jasmin", "rose", "santal", "vétiver"] },

  // ─── Le Labo ───────────────────────────────────────────────────────────────
  { id: "le-labo-santal-33", name: "Santal 33", house: "Le Labo", year: 2011, gender: "mixte", family: "boisee", accords: ["santal", "cardamome", "iris", "violette", "cuir", "ambrox"] },
  { id: "le-labo-rose-31", name: "Rose 31", house: "Le Labo", year: 2006, gender: "mixte", family: "boisee", accords: ["rose", "cumin", "encens", "cèdre", "vétiver"] },
  { id: "le-labo-another-13", name: "AnOther 13", house: "Le Labo", year: 2010, gender: "mixte", family: "musquee", accords: ["ambroxan", "musc", "jasmin", "ambrette"] },
  { id: "le-labo-bergamote-22", name: "Bergamote 22", house: "Le Labo", year: 2006, gender: "mixte", family: "hesperidee", accords: ["bergamote", "pamplemousse", "vétiver", "musc", "ambre"] },
  { id: "le-labo-the-noir-29", name: "Thé Noir 29", house: "Le Labo", year: 2015, gender: "mixte", family: "boisee", accords: ["thé noir", "figue", "bergamote", "cèdre", "vétiver", "tabac"] },
  { id: "le-labo-ylang-49", name: "Ylang 49", house: "Le Labo", year: 2011, gender: "mixte", family: "florale", accords: ["ylang-ylang", "gardénia", "patchouli", "vétiver", "santal"] },
  { id: "le-labo-vetiver-46", name: "Vetiver 46", house: "Le Labo", year: 2006, gender: "mixte", family: "boisee", accords: ["vétiver", "encens", "cèdre", "poivre", "labdanum"] },
  { id: "le-labo-neroli-36", name: "Neroli 36", house: "Le Labo", year: 2006, gender: "mixte", family: "florale", accords: ["néroli", "orange", "musc", "vanille", "clémentine"] },
  { id: "le-labo-baie-19", name: "Baie 19", house: "Le Labo", year: 2019, gender: "mixte", family: "verte", accords: ["genièvre", "patchouli", "musc", "note minérale"] },
  { id: "le-labo-lys-41", name: "Lys 41", house: "Le Labo", year: 2011, gender: "femme", family: "florale", accords: ["lys", "jasmin", "tubéreuse", "vanille", "musc"] },
  { id: "le-labo-iris-39", name: "Iris 39", house: "Le Labo", year: 2006, gender: "femme", family: "florale", accords: ["iris", "patchouli", "musc", "ambre"] },
  { id: "le-labo-tonka-25", name: "Tonka 25", house: "Le Labo", year: 2013, gender: "mixte", family: "gourmande", accords: ["fève tonka", "fleur d'oranger", "musc", "cèdre"] },
  { id: "le-labo-oud-27", name: "Oud 27", house: "Le Labo", year: 2010, gender: "mixte", family: "boisee", accords: ["oud", "safran", "cèdre", "encens", "musc"] },
  { id: "le-labo-patchouli-24", name: "Patchouli 24", house: "Le Labo", year: 2006, gender: "mixte", family: "cuir", accords: ["patchouli", "bouleau", "vanille", "encens", "styrax"] },

  // ─── Loewe ─────────────────────────────────────────────────────────────────
  { id: "loewe-001-man", name: "Loewe 001 Man", house: "Loewe", year: 2016, gender: "homme", family: "boisee", accords: ["bergamote", "cardamome", "santal", "musc"] },
  { id: "loewe-solo", name: "Solo Loewe", house: "Loewe", year: 2004, gender: "homme", family: "boisee", accords: ["cardamome", "cèdre", "vanille", "poivre"] },
  { id: "loewe-esencia", name: "Esencia Loewe", house: "Loewe", year: 1988, gender: "homme", family: "fougere", accords: ["lavande", "romarin", "santal", "mousse de chêne"] },

  // ─── Maison Francis Kurkdjian ──────────────────────────────────────────────
  { id: "mfk-baccarat-rouge-540", name: "Baccarat Rouge 540", house: "Maison Francis Kurkdjian", year: 2015, gender: "mixte", family: "ambree", accords: ["safran", "jasmin", "ambre gris", "cèdre", "résine de sapin"] },
  { id: "mfk-baccarat-rouge-540-extrait", name: "Baccarat Rouge 540 Extrait de Parfum", house: "Maison Francis Kurkdjian", year: 2017, gender: "mixte", family: "ambree", accords: ["safran", "ambre gris", "cèdre", "musc"] },
  { id: "mfk-grand-soir", name: "Grand Soir", house: "Maison Francis Kurkdjian", year: 2016, gender: "mixte", family: "ambree", accords: ["ambre", "benjoin", "vanille", "fève tonka", "labdanum"] },
  { id: "mfk-oud-satin-mood", name: "Oud Satin Mood", house: "Maison Francis Kurkdjian", year: 2015, gender: "mixte", family: "ambree", accords: ["oud", "rose de damas", "vanille", "benjoin", "violette"] },
  { id: "mfk-oud-silk-mood", name: "Oud Silk Mood", house: "Maison Francis Kurkdjian", year: 2015, gender: "mixte", family: "boisee", accords: ["oud", "rose", "santal", "papyrus"] },
  { id: "mfk-oud", name: "Oud", house: "Maison Francis Kurkdjian", year: 2012, gender: "mixte", family: "boisee", accords: ["oud", "safran", "patchouli", "cèdre", "ambre"] },
  { id: "mfk-aqua-universalis", name: "Aqua Universalis", house: "Maison Francis Kurkdjian", year: 2009, gender: "mixte", family: "musquee", accords: ["bergamote", "citron", "muguet", "musc blanc", "bois blanc"] },
  { id: "mfk-amyris-homme", name: "Amyris Homme", house: "Maison Francis Kurkdjian", year: 2012, gender: "homme", family: "boisee", accords: ["amyris", "iris", "romarin", "fève tonka"] },
  { id: "mfk-amyris-femme", name: "Amyris Femme", house: "Maison Francis Kurkdjian", year: 2012, gender: "femme", family: "florale", accords: ["amyris", "iris", "orange", "vanille"] },
  { id: "mfk-a-la-rose", name: "À la Rose", house: "Maison Francis Kurkdjian", year: 2014, gender: "femme", family: "florale", accords: ["rose de mai", "rose de damas", "violette", "musc", "cassis"] },
  { id: "mfk-gentle-fluidity-gold", name: "Gentle Fluidity Gold", house: "Maison Francis Kurkdjian", year: 2019, gender: "mixte", family: "ambree", accords: ["genièvre", "muscade", "ambre", "vanille", "musc"] },
  { id: "mfk-gentle-fluidity-silver", name: "Gentle Fluidity Silver", house: "Maison Francis Kurkdjian", year: 2019, gender: "mixte", family: "musquee", accords: ["genièvre", "muscade", "musc", "bois"] },
  { id: "mfk-petit-matin", name: "Petit Matin", house: "Maison Francis Kurkdjian", year: 2016, gender: "mixte", family: "hesperidee", accords: ["bergamote", "orange", "aubépine", "lavande", "ambroxan"] },
  { id: "mfk-lhomme-a-la-rose", name: "L'Homme À la Rose", house: "Maison Francis Kurkdjian", year: 2020, gender: "homme", family: "florale", accords: ["rose de mai", "rose de damas", "gingembre", "cèdre", "musc"] },
  { id: "mfk-apom-pour-homme", name: "APOM Pour Homme", house: "Maison Francis Kurkdjian", year: 2009, gender: "homme", family: "florale", accords: ["fleur d'oranger", "cèdre", "ambre"] },
  { id: "mfk-apom-pour-femme", name: "APOM Pour Femme", house: "Maison Francis Kurkdjian", year: 2009, gender: "femme", family: "florale", accords: ["fleur d'oranger", "ylang-ylang", "ambre", "musc"] },
  { id: "mfk-lumiere-noire-pour-homme", name: "Lumière Noire Pour Homme", house: "Maison Francis Kurkdjian", year: 2009, gender: "homme", family: "boisee", accords: ["rose", "cumin", "patchouli", "muscade"] },
  { id: "mfk-724", name: "724", house: "Maison Francis Kurkdjian", year: 2021, gender: "mixte", family: "musquee", accords: ["musc blanc", "jasmin", "bergamote", "santal"] },

  // ─── Maison Margiela — Replica ─────────────────────────────────────────────
  { id: "margiela-jazz-club", name: "Replica Jazz Club", house: "Maison Margiela", year: 2013, gender: "homme", family: "ambree", accords: ["rhum", "tabac", "vanille", "citron", "poivre rose", "styrax"] },
  { id: "margiela-by-the-fireplace", name: "Replica By the Fireplace", house: "Maison Margiela", year: 2015, gender: "mixte", family: "gourmande", accords: ["châtaigne grillée", "vanille", "encens", "girofle", "bois de gaïac"] },
  { id: "margiela-beach-walk", name: "Replica Beach Walk", house: "Maison Margiela", year: 2012, gender: "mixte", family: "aquatique", accords: ["bergamote", "noix de coco", "musc", "cèdre", "ylang-ylang"] },
  { id: "margiela-lazy-sunday-morning", name: "Replica Lazy Sunday Morning", house: "Maison Margiela", year: 2011, gender: "mixte", family: "musquee", accords: ["muguet", "iris", "musc blanc", "poire", "rose"] },
  { id: "margiela-under-the-lemon-trees", name: "Replica Under the Lemon Trees", house: "Maison Margiela", year: 2019, gender: "mixte", family: "hesperidee", accords: ["citron", "note verte", "musc", "cèdre"] },
  { id: "margiela-springtime-in-a-park", name: "Replica Springtime in a Park", house: "Maison Margiela", year: 2013, gender: "mixte", family: "florale", accords: ["poire", "lilas", "muguet", "musc blanc"] },
  { id: "margiela-coffee-break", name: "Replica Coffee Break", house: "Maison Margiela", year: 2019, gender: "mixte", family: "gourmande", accords: ["café", "lait", "cacao", "musc"] },
  { id: "margiela-whispers-in-the-library", name: "Replica Whispers in the Library", house: "Maison Margiela", year: 2019, gender: "mixte", family: "boisee", accords: ["poivre", "vanille", "cèdre", "bois de gaïac"] },
  { id: "margiela-sailing-day", name: "Replica Sailing Day", house: "Maison Margiela", year: 2019, gender: "mixte", family: "aquatique", accords: ["note marine", "poivre rose", "encens", "coriandre"] },
  { id: "margiela-bubble-bath", name: "Replica Bubble Bath", house: "Maison Margiela", year: 2015, gender: "mixte", family: "musquee", accords: ["musc blanc", "aldéhydes", "iris", "héliotrope"] },
  { id: "margiela-on-a-date", name: "Replica On a Date", house: "Maison Margiela", year: 2020, gender: "mixte", family: "florale-fruitee", accords: ["fraise", "rose", "musc"] },
  { id: "margiela-at-the-barbers", name: "Replica At the Barber's", house: "Maison Margiela", year: 2014, gender: "homme", family: "fougere", accords: ["lavande", "fève tonka", "citron", "vétiver"] },
  { id: "margiela-matcha-meditation", name: "Replica Matcha Meditation", house: "Maison Margiela", year: 2022, gender: "mixte", family: "verte", accords: ["thé matcha", "figue", "musc", "jasmin"] },

  // ─── Mancera ───────────────────────────────────────────────────────────────
  { id: "mancera-cedrat-boise", name: "Cedrat Boise", house: "Mancera", year: 2011, gender: "homme", family: "boisee", accords: ["cédrat", "citron", "cèdre", "patchouli", "musc", "ananas"] },
  { id: "mancera-roses-vanille", name: "Roses Vanille", house: "Mancera", year: 2011, gender: "femme", family: "gourmande", accords: ["rose", "vanille", "musc", "santal", "framboise"] },
  { id: "mancera-red-tobacco", name: "Red Tobacco", house: "Mancera", year: 2018, gender: "mixte", family: "ambree", accords: ["tabac", "safran", "cannelle", "oud", "ambre gris"] },
  { id: "mancera-coco-vanille", name: "Coco Vanille", house: "Mancera", year: 2016, gender: "femme", family: "gourmande", accords: ["noix de coco", "vanille", "fruits tropicaux", "musc", "santal"] },
  { id: "mancera-instant-crush", name: "Instant Crush", house: "Mancera", year: 2018, gender: "mixte", family: "gourmande", accords: ["vanille", "praline", "musc", "bois"] },
  { id: "mancera-hindu-kush", name: "Hindu Kush", house: "Mancera", year: 2017, gender: "mixte", family: "boisee", accords: ["poivre", "patchouli", "ambre", "musc"] },
  { id: "mancera-black-gold", name: "Black Gold", house: "Mancera", year: 2012, gender: "homme", family: "boisee", accords: ["oud", "ambre", "vanille", "patchouli"] },
  { id: "mancera-aoud-lemon-mint", name: "Aoud Lemon Mint", house: "Mancera", year: 2011, gender: "mixte", family: "boisee", accords: ["citron", "menthe", "oud", "musc"] },

  // ─── Marc-Antoine Barrois ──────────────────────────────────────────────────
  { id: "barrois-b683", name: "B683", house: "Marc-Antoine Barrois", year: 2016, gender: "homme", family: "boisee", accords: ["cuir", "cardamome", "encens", "patchouli", "musc"] },
  { id: "barrois-ganymede", name: "Ganymede", house: "Marc-Antoine Barrois", year: 2019, gender: "mixte", family: "cuir", accords: ["mandarine", "safran", "cuir", "ambrette", "osmanthus"] },

  // ─── Marc Jacobs ───────────────────────────────────────────────────────────
  { id: "marc-jacobs-daisy", name: "Daisy", house: "Marc Jacobs", year: 2007, gender: "femme", family: "florale", accords: ["fraise", "violette", "gardénia", "jasmin", "musc", "vanille"] },
  { id: "marc-jacobs-daisy-eau-so-fresh", name: "Daisy Eau So Fresh", house: "Marc Jacobs", year: 2011, gender: "femme", family: "florale-fruitee", accords: ["framboise", "pamplemousse", "poire", "violette", "musc"] },
  { id: "marc-jacobs-decadence", name: "Decadence", house: "Marc Jacobs", year: 2015, gender: "femme", family: "boisee", accords: ["prune", "iris", "safran", "vétiver", "papyrus"] },
  { id: "marc-jacobs-perfect", name: "Perfect", house: "Marc Jacobs", year: 2020, gender: "femme", family: "florale", accords: ["rhubarbe", "amande", "jasmin", "cèdre"] },
  { id: "marc-jacobs-lola", name: "Lola", house: "Marc Jacobs", year: 2009, gender: "femme", family: "florale-fruitee", accords: ["poire", "rose", "framboise", "vanille", "fève tonka"] },
  { id: "marc-jacobs-bang", name: "Bang", house: "Marc Jacobs", year: 2010, gender: "homme", family: "boisee", accords: ["poivre", "benjoin", "vétiver", "patchouli"] },

  // ─── Memo Paris ────────────────────────────────────────────────────────────
  { id: "memo-african-leather", name: "African Leather", house: "Memo Paris", year: 2014, gender: "mixte", family: "cuir", accords: ["cuir", "cardamome", "oud", "safran", "cumin", "musc"] },
  { id: "memo-irish-leather", name: "Irish Leather", house: "Memo Paris", year: 2013, gender: "mixte", family: "cuir", accords: ["cuir", "genévrier", "thé vert", "néroli", "musc"] },
  { id: "memo-italian-leather", name: "Italian Leather", house: "Memo Paris", year: 2016, gender: "mixte", family: "cuir", accords: ["cuir", "figue", "poivre rose", "musc"] },
  { id: "memo-marfa", name: "Marfa", house: "Memo Paris", year: 2015, gender: "mixte", family: "florale", accords: ["tubéreuse", "fleur d'oranger", "vanille", "musc"] },
  { id: "memo-lalibela", name: "Lalibela", house: "Memo Paris", year: 2010, gender: "femme", family: "ambree", accords: ["encens", "tubéreuse", "vanille", "patchouli", "benjoin"] },
  { id: "memo-inle", name: "Inlé", house: "Memo Paris", year: 2013, gender: "femme", family: "verte", accords: ["thé vert", "jasmin", "musc", "cèdre"] },

  // ─── Montale ───────────────────────────────────────────────────────────────
  { id: "montale-intense-cafe", name: "Intense Café", house: "Montale", year: 2013, gender: "mixte", family: "gourmande", accords: ["café", "rose", "vanille", "musc blanc", "ambre"] },
  { id: "montale-chocolate-greedy", name: "Chocolate Greedy", house: "Montale", year: 2007, gender: "mixte", family: "gourmande", accords: ["cacao", "café", "vanille", "orange", "fève tonka"] },
  { id: "montale-roses-musk", name: "Roses Musk", house: "Montale", year: 2005, gender: "femme", family: "musquee", accords: ["rose", "musc blanc", "jasmin", "ambre"] },
  { id: "montale-black-aoud", name: "Black Aoud", house: "Montale", year: 2006, gender: "mixte", family: "boisee", accords: ["oud", "rose", "patchouli", "santal", "musc"] },
  { id: "montale-aoud-roses-petals", name: "Aoud Roses Petals", house: "Montale", year: 2007, gender: "mixte", family: "boisee", accords: ["oud", "rose", "patchouli", "ambre"] },
  { id: "montale-arabians-tonka", name: "Arabians Tonka", house: "Montale", year: 2016, gender: "mixte", family: "ambree", accords: ["oud", "safran", "fève tonka", "rose", "vanille"] },
  { id: "montale-intense-tiare", name: "Intense Tiare", house: "Montale", year: 2014, gender: "femme", family: "florale", accords: ["tiaré", "jasmin", "vanille", "musc"] },
  { id: "montale-sweet-oriental-dream", name: "Sweet Oriental Dream", house: "Montale", year: 2012, gender: "mixte", family: "gourmande", accords: ["guimauve", "fève tonka", "vanille", "ambre"] },
  { id: "montale-mukhallat", name: "Mukhallat", house: "Montale", year: 2011, gender: "mixte", family: "ambree", accords: ["oud", "ambre", "rose", "épices"] },
  { id: "montale-starry-nights", name: "Starry Nights", house: "Montale", year: 2010, gender: "mixte", family: "boisee", accords: ["oud", "santal", "patchouli", "ambre"] },
  { id: "montale-amber-spices", name: "Amber & Spices", house: "Montale", year: 2010, gender: "mixte", family: "ambree", accords: ["ambre", "safran", "cannelle", "vanille", "épices"] },

  // ─── Mugler ────────────────────────────────────────────────────────────────
  { id: "mugler-angel", name: "Angel", house: "Mugler", year: 1992, gender: "femme", family: "gourmande", accords: ["praline", "chocolat", "caramel", "patchouli", "vanille", "fruits rouges"] },
  { id: "mugler-alien", name: "Alien", house: "Mugler", year: 2005, gender: "femme", family: "ambree", accords: ["jasmin sambac", "bois de cachemire", "ambre blanc", "vanille"] },
  { id: "mugler-alien-goddess", name: "Alien Goddess", house: "Mugler", year: 2020, gender: "femme", family: "florale", accords: ["jasmin", "noix de coco", "vanille", "bergamote"] },
  { id: "mugler-a-men", name: "A*Men", house: "Mugler", year: 1996, gender: "homme", family: "gourmande", accords: ["caramel", "café", "patchouli", "lavande", "menthe", "vanille"] },
  { id: "mugler-alien-man", name: "Alien Man", house: "Mugler", year: 2018, gender: "homme", family: "ambree", accords: ["poivre", "bois ambré", "fève tonka", "bois de cachemire"] },
  { id: "mugler-aura", name: "Aura Mugler", house: "Mugler", year: 2017, gender: "femme", family: "verte", accords: ["rhubarbe", "vanille bourbon", "bois", "fleur d'oranger"] },
  { id: "mugler-womanity", name: "Womanity", house: "Mugler", year: 2010, gender: "femme", family: "ambree", accords: ["figue", "note salée", "bois", "ambre"] },
  { id: "mugler-angel-muse", name: "Angel Muse", house: "Mugler", year: 2016, gender: "femme", family: "gourmande", accords: ["noisette", "praline", "patchouli", "vanille"] },
  { id: "mugler-angel-nova", name: "Angel Nova", house: "Mugler", year: 2020, gender: "femme", family: "florale-fruitee", accords: ["framboise", "rose", "patchouli", "ambre"] },
  { id: "mugler-cologne", name: "Mugler Cologne", house: "Mugler", year: 1991, gender: "mixte", family: "hesperidee", accords: ["néroli", "petit-grain", "bergamote", "musc"] },

  // ─── Narciso Rodriguez ─────────────────────────────────────────────────────
  { id: "narciso-for-her-edp", name: "For Her Eau de Parfum", house: "Narciso Rodriguez", year: 2003, gender: "femme", family: "musquee", accords: ["musc", "fleur d'oranger", "ambre", "patchouli", "vanille", "osmanthus"] },
  { id: "narciso-for-her-edt", name: "For Her Eau de Toilette", house: "Narciso Rodriguez", year: 2003, gender: "femme", family: "musquee", accords: ["musc", "rose", "pêche", "ambre", "vétiver"] },
  { id: "narciso-poudree", name: "Narciso Poudrée", house: "Narciso Rodriguez", year: 2016, gender: "femme", family: "musquee", accords: ["musc", "gardénia", "cèdre", "vétiver"] },
  { id: "narciso-for-him", name: "For Him", house: "Narciso Rodriguez", year: 2007, gender: "homme", family: "boisee", accords: ["musc", "violette", "patchouli", "ambre"] },
  { id: "narciso-rouge", name: "Narciso Rouge", house: "Narciso Rodriguez", year: 2018, gender: "femme", family: "musquee", accords: ["rose", "musc", "cèdre", "vétiver", "ambre"] },

  // ─── Nina Ricci ────────────────────────────────────────────────────────────
  { id: "nina-ricci-lair-du-temps", name: "L'Air du Temps", house: "Nina Ricci", year: 1948, gender: "femme", family: "florale", accords: ["œillet", "rose", "gardénia", "santal", "iris", "musc"] },
  { id: "nina-ricci-nina", name: "Nina", house: "Nina Ricci", year: 2006, gender: "femme", family: "florale-fruitee", accords: ["pomme", "citron", "praline", "vanille", "musc"] },
  { id: "nina-ricci-premier-jour", name: "Premier Jour", house: "Nina Ricci", year: 2001, gender: "femme", family: "florale", accords: ["mandarine", "freesia", "rose", "vanille", "musc"] },

  // ─── Nishane ───────────────────────────────────────────────────────────────
  { id: "nishane-hacivat", name: "Hacivat", house: "Nishane", year: 2017, gender: "mixte", family: "boisee", accords: ["ananas", "pamplemousse", "patchouli", "cèdre", "encens"] },
  { id: "nishane-ani", name: "Ani", house: "Nishane", year: 2019, gender: "mixte", family: "gourmande", accords: ["bergamote", "cardamome", "vanille", "ambre", "musc"] },
  { id: "nishane-fan-your-flames", name: "Fan Your Flames", house: "Nishane", year: 2015, gender: "mixte", family: "gourmande", accords: ["noix de coco", "tabac", "caramel", "santal", "cuir"] },
  { id: "nishane-wulong-cha", name: "Wulong Cha", house: "Nishane", year: 2018, gender: "mixte", family: "verte", accords: ["thé oolong", "agrumes", "musc"] },
  { id: "nishane-b-612", name: "B-612", house: "Nishane", year: 2016, gender: "mixte", family: "gourmande", accords: ["chocolat", "vanille", "café", "cuir"] },
  { id: "nishane-hundred-silent-ways", name: "Hundred Silent Ways", house: "Nishane", year: 2016, gender: "mixte", family: "florale", accords: ["fleur d'oranger", "vanille", "musc", "ambre"] },

  // ─── Ormonde Jayne ─────────────────────────────────────────────────────────
  { id: "ormonde-jayne-ormonde-woman", name: "Ormonde Woman", house: "Ormonde Jayne", year: 2002, gender: "femme", family: "boisee", accords: ["violette", "cardamome", "vétiver", "ambre", "bois de gaïac"] },
  { id: "ormonde-jayne-ormonde-man", name: "Ormonde Man", house: "Ormonde Jayne", year: 2002, gender: "homme", family: "boisee", accords: ["cardamome", "cèdre", "vétiver", "ambre"] },
  { id: "ormonde-jayne-tolu", name: "Tolu", house: "Ormonde Jayne", year: 2007, gender: "femme", family: "ambree", accords: ["baume de tolu", "orange", "encens", "jasmin", "ambre"] },
  { id: "ormonde-jayne-taif", name: "Ta'if", house: "Ormonde Jayne", year: 2006, gender: "femme", family: "florale", accords: ["rose de taïf", "safran", "datte", "encens", "ambre"] },
];
