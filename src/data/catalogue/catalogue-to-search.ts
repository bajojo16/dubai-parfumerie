/**
 * Adaptateur catalogue → catalogue de recherche.
 *
 * `dp-catalogue.json` porte 111 fiches vérifiées ; cinq d'entre elles ont une
 * fiche rédigée dans `product-details.ts`, les 106 autres n'existaient nulle
 * part sur le site — ni en recherche, ni dans le quiz, ni sur `/produit/`.
 * Chercher « Little Hearts » ou « Laya » ne donnait rien alors que les deux
 * sont au catalogue.
 *
 * Ce module les fait entrer dans l'agrégation de `search-catalog.ts`, au même
 * titre que les rails et les huiles. La déduplication range cette source EN
 * DERNIER : partout où une fiche rédigée existe, c'est elle qui gagne, et le
 * catalogue ne fait que combler ses trous.
 *
 * Photo et description viennent de `dp-fiches-site.json` — le contenu que la
 * boutique publie déjà sur chaque page produit, relevé tel quel. Rien n'est
 * reformulé ni recadré.
 *
 * Ce qui reste NON fabriqué : aucune famille déclarée (elle se déduit des
 * notes), et une pyramide introuvable reste vide. Le catalogue s'interdit
 * d'inventer, l'adaptateur ne va pas le faire à sa place.
 */

import { CATALOGUE, type CatalogueEntry } from "./dp-catalogue";
import { prixRetenu } from "./dp-corrections-prix";
import { ficheSite } from "./dp-fiches-site";

/**
 * Les notes viennent des sites officiels des maisons, qui publient en anglais
 * pour la plupart. Le site est en français : « Sandalwood » et « Bois de
 * santal » sont la même note, et les laisser cohabiter casserait à la fois
 * l'affichage et `familyOf()`, qui classe un parfum sur des mots français.
 *
 * Une note absente de cette table reste telle quelle — mieux vaut un mot
 * anglais affiché qu'une traduction devinée.
 */
const NOTES_FR: Record<string, string> = {
  // Agrumes
  bergamot: "Bergamote", "italian bergamot": "Bergamote d'Italie", lemon: "Citron",
  lime: "Citron vert", orange: "Orange", "blood orange": "Orange sanguine",
  "bitter orange": "Orange amère", mandarin: "Mandarine", grapefruit: "Pamplemousse",
  citrus: "Agrumes", citruses: "Agrumes", "citrus accords": "Accords d'agrumes",
  // Fruits
  apple: "Pomme", "green apple": "Pomme verte", pear: "Poire", peach: "Pêche",
  "white peach": "Pêche blanche", apricot: "Abricot", plum: "Prune",
  raspberry: "Framboise", strawberry: "Fraise", blackcurrant: "Cassis",
  "black currant": "Cassis", pineapple: "Ananas", coconut: "Noix de coco",
  lychee: "Litchi", melon: "Melon", dates: "Dattes", "pina colada": "Piña colada",
  fruity: "Notes fruitées", "fruity notes": "Notes fruitées",
  // Fleurs
  jasmine: "Jasmin", "sambac jasmine": "Jasmin sambac", rose: "Rose",
  "taif rose": "Rose de Taïf", "tea rose": "Rose thé", peony: "Pivoine",
  "white peony": "Pivoine blanche", "pink peony": "Pivoine rose",
  "orange blossom": "Fleur d'oranger", "orange flower": "Fleur d'oranger",
  "lily of the valley": "Muguet", "lily of the Valley": "Muguet",
  gardenia: "Gardénia", orchid: "Orchidée", "vanilla orchid": "Orchidée vanille",
  violet: "Violette", "violet leaves": "Feuilles de violette", hyacinth: "Jacinthe",
  carnation: "Œillet", marigold: "Souci", flowery: "Notes florales",
  // Épices
  cinnamon: "Cannelle", cardamom: "Cardamome", clove: "Clou de girofle",
  pepper: "Poivre", "black pepper": "Poivre noir", "pink pepper": "Poivre rose",
  peppertree: "Baies roses", saffron: "Safran", cumin: "Cumin",
  coriander: "Coriandre", ginger: "Gingembre", spices: "Épices",
  "spicy notes": "Notes épicées", basil: "Basilic", sage: "Sauge",
  tarragon: "Estragon", thyme: "Thym", absinthe: "Absinthe", tagetus: "Tagète",
  // Bois et résines
  sandalwood: "Bois de santal", sandal: "Santal", cedar: "Cèdre",
  cedarwood: "Cèdre", "guaiac wood": "Bois de gaïac", guaiacwood: "Bois de gaïac",
  birch: "Bouleau", "precious woods": "Bois précieux", "woody notes": "Notes boisées",
  "woodsy notes": "Notes boisées", "dark woodsy notes": "Bois sombres",
  cashmere: "Cachemire", cashmeran: "Cashmeran", nagarmotha: "Nagarmotha",
  papyrus: "Papyrus", amyris: "Amyris", elemi: "Élémi", myrrh: "Myrrhe",
  olibanum: "Oliban", incense: "Encens", styrax: "Styrax", benzoin: "Benjoin",
  labdanum: "Labdanum", opoponax: "Opoponax", "peru balsam": "Baume du Pérou",
  "tolu balsam": "Baume de Tolu", "fir resin": "Résine de sapin",
  // Oud
  oud: "Oud", oudh: "Oud", agarwood: "Bois d'agar (oud)",
  "agarwood oud": "Bois d'agar (oud)", "agarwood (oud)": "Bois d'agar (oud)",
  "thailand oud": "Oud de Thaïlande",
  // Ambre, musc, animal
  amber: "Ambre", ambra: "Ambre", "light amber": "Ambre clair",
  "white amber": "Ambre blanc", "honeyed amber": "Ambre miellé",
  amberwood: "Bois ambré", ambergris: "Ambre gris", orcanox: "Orcanox",
  musk: "Musc", musks: "Musc", musky: "Notes musquées", "white musk": "Musc blanc",
  animalic: "Notes animales", beeswax: "Cire d'abeille", leather: "Cuir",
  suede: "Daim",
  // Gourmand
  vanilla: "Vanille", "bourbon vanilla": "Vanille Bourbon",
  "vanilla flower": "Fleur de vanille", tonka: "Fève tonka",
  "tonka bean": "Fève tonka", chocolate: "Chocolat", cocoa: "Cacao",
  caramel: "Caramel", "crème brûlée": "Crème brûlée", honey: "Miel",
  sugar: "Sucre", sugary: "Notes sucrées", "brown sugar": "Sucre roux",
  milk: "Lait", butter: "Beurre", buttery: "Notes lactées",
  "whipped cream": "Crème fouettée", marshmallow: "Guimauve",
  "cotton candy": "Barbe à papa", "turkish delight accord": "Accord loukoum",
  "pistachio gelato": "Glace à la pistache", hazelnut: "Noisette",
  gourmand: "Gourmand", rum: "Rhum", "white rum": "Rhum blanc",
  liquorice: "Réglisse", tobacco: "Tabac", smoke: "Fumée",
  "smoky note": "Note fumée",
  // Vert, frais, aquatique
  lavender: "Lavande", lavandin: "Lavandin", mint: "Menthe",
  "green leaves": "Feuilles vertes", moss: "Mousse", oakmoss: "Mousse de chêne",
  "oak moss": "Mousse de chêne", mushroom: "Champignon",
  "earthy notes": "Notes terreuses", "aquatic notes": "Notes aquatiques",
  aldehyde: "Aldéhydes", hedione: "Hédione", osmanthus: "Osmanthus",
  ambrette: "Ambrette", geranium: "Géranium", "powdery notes": "Notes poudrées",
};

/** Traduit une note quand la table la connaît, la laisse intacte sinon. */
function noteFR(n: string): string {
  return NOTES_FR[n.trim().toLowerCase()] ?? n;
}

/**
 * Popularité des références non rédigées.
 *
 * Volontairement basse et identique pour toutes : le classement du site
 * remonte les produits les plus vendus, et une référence sans photo ni fiche
 * n'a rien à faire devant un best-seller. 25 la place sous les fiches rédigées
 * (55-95, dérivées de leur note et de leur volume d'avis) et sous les rails
 * (92 et au-dessus), sans l'enterrer au point qu'une recherche exacte ne la
 * remonte plus.
 */
const POPULARITE_NON_REDIGEE = 25;

/** Une entrée de catalogue au format attendu par l'agrégation. */
export interface CatalogueSearchEntry {
  name: string;
  brand: string;
  href: string;
  image?: string;
  description?: string;
  price?: number;
  compareAtPrice?: number;
  available: boolean;
  notes: string[];
  topNotes?: string[];
  heartNotes?: string[];
  baseNotes?: string[];
  volume?: string;
  concentration?: string;
  gender?: string;
  popularity: number;
}

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function toSearchEntry(p: CatalogueEntry): CatalogueSearchEntry {
  const tete = p.notes.tete.map(noteFR);
  const coeur = p.notes.coeur.map(noteFR);
  const fond = p.notes.fond.map(noteFR);
  // Le prix suit les arbitrages de `dp-corrections-prix` : réaligné sur la
  // médiane marché quand l'écart dépasse 15 %, figé quand la décision a été
  // prise à la main.
  const prix = p.prix === null ? undefined : (prixRetenu(p.id, p.prix) ?? p.prix);
  const fiche = ficheSite(p.id);

  return {
    name: p.nom,
    // La marque CORRIGÉE, pas celle qu'affiche le site : « Lueur d'Espoir Ambre
    // Emir » est vendu sous Paris Corner alors que c'est un Emir, et une marque
    // fausse se propage dans l'URL puis dans le référencement.
    brand: p.marque,
    href: `/produit/${slugify(p.marque)}-${slugify(p.nom)}`,
    // Premier visuel de la galerie de la boutique, rapatrié en WebP : sans lui
    // la fiche retombait sur `/assets/prod-1.jpg`, c'est-à-dire un autre
    // flacon, étiquette lisible.
    image: fiche?.images[0],
    description: fiche?.description ?? undefined,
    price: prix,
    compareAtPrice: p.prixBarre ?? undefined,
    available: p.dispo,
    notes: [...tete, ...coeur, ...fond],
    // Une pyramide vide reste vide : la fiche masque le bloc plutôt que
    // d'afficher des tirets. Quatre fiches sur 111 sont dans ce cas.
    topNotes: tete.length ? tete : undefined,
    heartNotes: coeur.length ? coeur : undefined,
    baseNotes: fond.length ? fond : undefined,
    volume: p.contenance ?? undefined,
    concentration: p.concentration ?? undefined,
    gender: p.genre ?? undefined,
    popularity: POPULARITE_NON_REDIGEE,
  };
}

/**
 * Les références du catalogue prêtes pour l'agrégation.
 *
 * Les lots et coffrets sont écartés : `type: "Lot / pack"` ne décrit pas un
 * flacon, et une fiche produit composée pour lui afficherait une pyramide qui
 * n'est celle d'aucun de ses jus.
 */
export const CATALOGUE_SEARCH_ENTRIES: CatalogueSearchEntry[] = CATALOGUE.filter(
  (p) => p.type !== "Lot / pack"
).map(toSearchEntry);
