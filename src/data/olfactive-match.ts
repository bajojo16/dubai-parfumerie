/**
 * Appariement « jumeau olfactif » — trouve, pour un parfum de référence, le
 * produit du catalogue au profil le plus proche.
 *
 * Pourquoi un module à part plutôt qu'un ajout à `olfactive-twins.ts` :
 * ce dernier est importé par `search-catalog.ts` et par le sélecteur
 * d'échantillons, donc par des écrans qui n'ont RIEN à faire de la base des
 * 700+ références. Isoler l'appariement ici garde `reference-perfumes.ts` hors
 * du graphe de ces écrans — seul le composant du jumeau le charge, en
 * `import()` dynamique.
 *
 * Contrainte de fond : 25 produits en vente pour 700+ cibles. Une vingtaine de
 * références pointeront le même produit, c'est structurel. Ce qui doit tenir,
 * c'est la DÉFENDABILITÉ de chaque appariement : famille olfactive d'abord,
 * accords partagés ensuite, genre en dernier. Et un score, pour que l'interface
 * dise « profil très proche » ou « profil apparenté » plutôt que de tout
 * présenter comme équivalent.
 *
 * L'appariement est déterministe : mêmes données en entrée, même résultat.
 * Aucun hasard, aucune date, aucun état — les égalités sont tranchées par le
 * slug, pas par l'ordre d'itération.
 */

import { SEARCH_PRODUCTS, familyOf, norm, FAMILIES, type SearchProduct } from "@/data/search-catalog";
import { OLFACTIVE_TWINS, type OlfactiveMatch } from "@/data/olfactive-twins";
import { REFERENCE_PERFUMES, FAMILY_LABELS, type ReferenceFamily, type ReferencePerfume } from "@/data/reference-perfumes";

// ─── Vocabulaire de notes ────────────────────────────────────────────────────
// Les deux sources n'écrivent pas les notes de la même façon : la base de
// référence donne des matières précises (« fève tonka », « rose de taïf »), le
// catalogue donne parfois une famille en guise de note (« Ambré », « Boisé »).
// On ramène les deux à un vocabulaire commun de GROUPES : c'est le seul moyen
// de comparer « Fève tonka » et « Tonka », ou « Rose de Taïf » et « Rosé ».

type NoteGroup =
  | "epices" | "neroli" | "rose" | "jasmin" | "iris" | "fleur-blanche" | "fleur-fraiche"
  | "fruits-rouges" | "coco" | "gourmand" | "fruits" | "vanille" | "ambre" | "encens"
  | "tabac" | "cuir" | "oud" | "santal" | "mousse" | "patchouli" | "vetiver" | "cedre"
  | "bois" | "aromatique" | "agrumes" | "vert" | "marin" | "musc" | "poudre";

/**
 * L'ORDRE compte : on retient le premier groupe qui matche.
 * « poivre rose » doit tomber dans les épices, pas dans la rose ; « framboise »
 * contient littéralement « bois » ; « bois de santal » est un santal avant
 * d'être un bois. Les groupes les plus spécifiques passent donc en premier.
 */
const NOTE_GROUPS: Array<[NoteGroup, string[]]> = [
  ["epices", ["poivre", "cardamome", "cannelle", "muscade", "safran", "gingembre", "girofle", "cumin", "coriandre", "piment", "curcuma", "epice", "baies rose", "sichuan", "elemi"]],
  ["neroli", ["fleur d'oranger", "fleur d oranger", "oranger", "neroli"]],
  ["rose", ["rose"]],
  ["jasmin", ["jasmin"]],
  ["iris", ["iris", "violette", "orris"]],
  ["fleur-blanche", ["tubereuse", "gardenia", "ylang", "orchidee", "tiare", "frangipanier", "nard", "osmanthus", "magnolia", "jacinthe"]],
  ["fleur-fraiche", ["muguet", "pivoine", "freesia", "lys", "lotus", "narcisse", "jonquille", "mimosa", "lilas", "oeillet", "floral", "fleur"]],
  ["fruits-rouges", ["framboise", "fraise", "cerise", "cassis", "groseille", "grenade", "canneberge", "mure"]],
  ["coco", ["coco"]],
  ["gourmand", ["caramel", "praline", "chocolat", "cacao", "cafe", "miel", "cire", "guimauve", "sucre", "amande", "noisette", "chataigne", "marron", "pistache", "pain", "lait", "reglisse", "rhum", "cognac", "whisky", "datte", "immortelle", "gourmand", "kulfi"]],
  ["fruits", ["pomme", "poire", "peche", "abricot", "prune", "mangue", "ananas", "litchi", "melon", "figue", "nectarine", "coing", "goyave", "passion", "banane", "fruit"]],
  ["vanille", ["vanille", "tonka", "coumarine", "heliotrope"]],
  ["ambre", ["ambre", "ambrox", "labdanum", "benjoin", "resine", "baume", "ciste"]],
  ["encens", ["encens", "myrrhe", "oliban", "opoponax", "fume"]],
  ["tabac", ["tabac", "foin"]],
  ["cuir", ["cuir", "daim", "suede", "castoreum", "bouleau"]],
  ["oud", ["oud", "agar"]],
  ["santal", ["santal", "sandal"]],
  ["mousse", ["mousse"]],
  ["patchouli", ["patchouli"]],
  ["vetiver", ["vetiver"]],
  ["cedre", ["cedre", "cachemire"]],
  ["bois", ["bois", "gaiac", "papyrus", "palissandre", "cade", "chene", "cypres", "cypriol", "sapin", "ebene", "pin"]],
  ["aromatique", ["lavande", "romarin", "menthe", "basilic", "sauge", "thym", "armoise", "artemisia", "absinthe", "myrte", "laurier", "estragon", "anis", "angelique", "genievre", "genevrier", "eucalyptus", "verveine", "camomille", "aromatique"]],
  ["agrumes", ["bergamote", "citron", "cedrat", "mandarine", "orange", "pamplemousse", "yuzu", "lime", "petit-grain", "kalamansi", "agrume", "clementine"]],
  ["vert", ["galbanum", "feuille", "herbe", "the vert", "the noir", "figuier", "concombre", "rhubarbe", "bambou", "algue", "vert", "the"]],
  ["marin", ["marin", "aquatique", "ozone", "embrun", "mineral", "iode", "sel"]],
  ["musc", ["musc", "civette", "ambrette"]],
  ["poudre", ["poudre", "aldehyde", "talc"]],
];

/**
 * Super-familles de notes : deux matières différentes du même registre
 * (santal / cèdre, framboise / poire) partagent quelque chose. On leur accorde
 * un demi-point plutôt que rien — sans quoi 25 produits aux notes très
 * génériques ne matcheraient presque jamais.
 */
const NOTE_SUPERGROUP: Record<NoteGroup, string> = {
  rose: "FLORAL", jasmin: "FLORAL", "fleur-blanche": "FLORAL", "fleur-fraiche": "FLORAL", iris: "FLORAL", neroli: "FLORAL",
  bois: "BOIS", cedre: "BOIS", santal: "BOIS", oud: "BOIS", patchouli: "BOIS", vetiver: "BOIS", mousse: "BOIS",
  ambre: "CHAUD", vanille: "CHAUD", encens: "CHAUD", tabac: "CHAUD", cuir: "CHAUD", epices: "CHAUD",
  agrumes: "FRAIS", aromatique: "FRAIS", vert: "FRAIS", marin: "FRAIS",
  gourmand: "SUCRE", coco: "SUCRE", "fruits-rouges": "SUCRE", fruits: "SUCRE",
  musc: "MUSC", poudre: "MUSC",
};

/** Groupe d'une note, ou null quand le mot ne dit rien d'olfactif (« Doré »). */
function noteGroup(note: string): NoteGroup | null {
  const n = norm(note);
  if (!n) return null;
  // Les mots courts (« oud », « pin », « thé », « sel ») doivent matcher un mot
  // entier : « poudrée » contient « oud », « pivoine » ne contient pas « pin »
  // mais « sapin » oui — la comparaison par sous-chaîne se trompe trop souvent.
  const words = n.split(/[^a-z0-9]+/).filter(Boolean);
  for (const [group, keywords] of NOTE_GROUPS) {
    for (const kw of keywords) {
      if (kw.length >= 4 ? n.includes(kw) : words.includes(kw)) return group;
    }
  }
  return null;
}

function groupsOf(notes: string[]): Set<NoteGroup> {
  const out = new Set<NoteGroup>();
  for (const n of notes) {
    const g = noteGroup(n);
    if (g) out.add(g);
  }
  return out;
}

// ─── Affinité de familles ────────────────────────────────────────────────────
// Le catalogue ne connaît que 4 familles (`FAMILIES` de search-catalog) là où
// la base de référence en distingue 13. La table dit à quel point chaque
// famille de référence est légitimement servie par chaque famille du catalogue.
// 1 = c'est la même chose ; 0,2 = c'est un pis-aller assumé.

type CatalogFamily = "frais" | "floral" | "ambre" | "boise";

const FAMILY_AFFINITY: Record<ReferenceFamily, Record<CatalogFamily, number>> = {
  hesperidee:        { frais: 1.0,  floral: 0.35, ambre: 0.15, boise: 0.2 },
  aromatique:        { frais: 1.0,  floral: 0.2,  ambre: 0.2,  boise: 0.4 },
  fougere:           { frais: 0.8,  floral: 0.25, ambre: 0.3,  boise: 0.6 },
  verte:             { frais: 0.95, floral: 0.45, ambre: 0.15, boise: 0.35 },
  aquatique:         { frais: 1.0,  floral: 0.3,  ambre: 0.15, boise: 0.3 },
  florale:           { frais: 0.45, floral: 1.0,  ambre: 0.4,  boise: 0.3 },
  "florale-fruitee": { frais: 0.4,  floral: 0.95, ambre: 0.6,  boise: 0.25 },
  chypree:           { frais: 0.3,  floral: 0.5,  ambre: 0.5,  boise: 0.85 },
  boisee:            { frais: 0.25, floral: 0.25, ambre: 0.5,  boise: 1.0 },
  cuir:              { frais: 0.15, floral: 0.2,  ambre: 0.55, boise: 0.9 },
  ambree:            { frais: 0.15, floral: 0.35, ambre: 1.0,  boise: 0.6 },
  gourmande:         { frais: 0.1,  floral: 0.35, ambre: 1.0,  boise: 0.45 },
  musquee:           { frais: 0.35, floral: 0.6,  ambre: 0.55, boise: 0.35 },
};

/** Un produit sans famille lisible (aucune note en base) ne peut rien défendre. */
const UNKNOWN_FAMILY_AFFINITY = 0.1;

// ─── Poids ───────────────────────────────────────────────────────────────────
// La famille pèse le plus : c'est elle qui rend l'appariement défendable en
// vitrine. Les accords affinent, le genre départage, la popularité ne sert
// qu'à trancher deux profils rigoureusement identiques.
const W_FAMILY = 0.5;
const W_ACCORDS = 0.36;
const W_GENDER = 0.13;
const W_POPULARITY = 0.01;

/** Crédit accordé quand seule la super-famille de notes correspond. */
const SUPERGROUP_CREDIT = 0.45;

// ─── Profil pré-calculé des 25 produits ──────────────────────────────────────
// Calculé une seule fois au chargement du module : 700 références × 25 produits,
// autant ne pas re-normaliser les mêmes notes 17 500 fois.

type ProductProfile = {
  product: SearchProduct;
  family: CatalogFamily | "";
  groups: Set<NoteGroup>;
  supergroups: Set<string>;
  gender: string;
};

const PRODUCT_PROFILES: ProductProfile[] = SEARCH_PRODUCTS.map((product) => {
  const groups = groupsOf([...product.notes, product.family ?? "", product.name]);
  const supergroups = new Set<string>();
  for (const g of groups) supergroups.add(NOTE_SUPERGROUP[g]);
  const key = familyOf(product);
  return {
    product,
    family: (key === "frais" || key === "floral" || key === "ambre" || key === "boise" ? key : "") as CatalogFamily | "",
    groups,
    supergroups,
    gender: norm(product.gender),
  };
});

// ─── Correspondances validées à la main ──────────────────────────────────────
// Les 8 entrées de `OLFACTIVE_TWINS` ont été relues et portent une description
// rédigée. Elles priment sur le calcul : quand la référence choisie est l'une
// d'elles, on sert le produit validé et son texte, pas le gagnant du score.
const CURATED_BY_REFERENCE: Record<string, string> = {
  "creed-aventus": "aventus",
  "mfk-baccarat-rouge-540": "br540",
  "kilian-angels-share": "angels-share",
  "tom-ford-oud-wood": "oud-wood",
  "ysl-black-opium": "black-opium",
  "dior-sauvage": "sauvage",
  "carolina-herrera-good-girl": "good-girl",
  "paco-rabanne-1-million": "1-million",
};

const CURATED_BY_KEY = new Map(OLFACTIVE_TWINS.map((m) => [m.key, m]));

/** Les références validées font de bonnes suggestions : elles sont célèbres et documentées. */
export const SUGGESTED_REFERENCE_IDS: string[] = Object.keys(CURATED_BY_REFERENCE);

// ─── Résultat ────────────────────────────────────────────────────────────────

/** Niveau de proximité — l'interface ne doit PAS présenter tout comme équivalent. */
export type MatchStrength = "tres-proche" | "proche" | "apparente";

export type TwinResult = {
  reference: ReferencePerfume;
  product: SearchProduct;
  /** 0..1, déterministe */
  score: number;
  strength: MatchStrength;
  /** libellé de la famille de la référence (« Ambrée ») */
  referenceFamilyLabel: string;
  /** libellé de la famille du catalogue qui la sert (« Ambré · gourmand ») */
  catalogFamilyLabel: string;
  /** phrase de profil rédigée pour cette famille — sert de description quand
   *  la correspondance n'a pas de texte relu par l'équipe */
  catalogFamilyText: string;
  /** notes de la référence réellement retrouvées dans le produit */
  sharedAccords: string[];
  /** correspondance relue par l'équipe, avec sa description rédigée */
  curated?: OlfactiveMatch;
};

/**
 * Le niveau de proximité se lit sur les COMPOSANTES, pas sur le score global.
 * Avec 25 produits, le meilleur score est presque toujours élevé — un seuil sur
 * le total aurait affiché « très proche » partout, exactement ce qu'on veut
 * éviter. On exige donc les deux : la bonne famille ET des accords réellement
 * partagés.
 */
function strengthOf(family: number, accords: number): MatchStrength {
  if (family >= 0.85 && accords >= 0.55) return "tres-proche";
  if (family >= 0.85 || (family >= 0.6 && accords >= 0.3)) return "proche";
  return "apparente";
}

function genderAffinity(refGender: string, productGender: string): number {
  if (!productGender) return 0.55; // le catalogue le renseigne rarement : neutre
  if (refGender === productGender) return 1;
  if (refGender === "mixte" || productGender === "mixte") return 0.75;
  return 0.25;
}

/** Score d'un produit pour une référence, décomposé pour rester auditable. */
function scoreProduct(ref: ReferencePerfume, profile: ProductProfile) {
  const family = profile.family
    ? FAMILY_AFFINITY[ref.family][profile.family]
    : UNKNOWN_FAMILY_AFFINITY;

  const shared: string[] = [];
  const refGroups = new Set<NoteGroup>();
  let accordPoints = 0;
  for (const accord of ref.accords) {
    const g = noteGroup(accord);
    if (!g) continue;
    refGroups.add(g);
    if (profile.groups.has(g)) {
      accordPoints += 1;
      shared.push(accord);
    } else if (profile.supergroups.has(NOTE_SUPERGROUP[g])) {
      accordPoints += SUPERGROUP_CREDIT;
    }
  }
  // Rappel : quelle part du profil de la référence le produit couvre-t-il ?
  const recall = ref.accords.length ? Math.min(1, accordPoints / ref.accords.length) : 0;
  // Précision : le produit ne doit pas gagner juste parce qu'il porte beaucoup
  // de notes. Un flacon à dix notes qui en partage trois n'est pas « le même
  // profil » ; un flacon à trois notes qui en partage trois, si.
  let covered = 0;
  for (const g of profile.groups) if (refGroups.has(g)) covered += 1;
  const precision = profile.groups.size ? covered / profile.groups.size : 0;
  const accords = 0.75 * recall + 0.25 * precision;

  const gender = genderAffinity(ref.gender, profile.gender);
  const popularity = Math.min(100, Math.max(0, profile.product.popularity)) / 100;

  const score = W_FAMILY * family + W_ACCORDS * accords + W_GENDER * gender + W_POPULARITY * popularity;
  return { score, shared, family, accords };
}

/**
 * Classement complet des produits pour une référence, du plus proche au moins
 * proche. Les égalités sont tranchées par le slug : deux exécutions donnent
 * exactement le même ordre.
 */
export function rankTwins(ref: ReferencePerfume, limit = 3): TwinResult[] {
  const scored = PRODUCT_PROFILES.map((profile) => ({ profile, ...scoreProduct(ref, profile) }));

  scored.sort((a, b) => b.score - a.score || a.profile.product.slug.localeCompare(b.profile.product.slug));

  return scored.slice(0, Math.max(1, limit)).map((s) => buildResult(ref, s.profile, s));
}

type Scored = { score: number; shared: string[]; family: number; accords: number };

function buildResult(ref: ReferencePerfume, profile: ProductProfile, s: Scored): TwinResult {
  return {
    reference: ref,
    product: profile.product,
    score: Math.round(s.score * 1000) / 1000,
    strength: strengthOf(s.family, s.accords),
    referenceFamilyLabel: FAMILY_LABELS[ref.family],
    catalogFamilyLabel: profile.family ? FAMILIES[profile.family].label : FAMILY_LABELS[ref.family],
    catalogFamilyText: profile.family ? FAMILIES[profile.family].text : "",
    sharedAccords: s.shared,
  };
}

/**
 * Le jumeau d'une référence : la correspondance validée quand il en existe
 * une, le mieux classé sinon. `null` seulement si le catalogue est vide.
 */
export function findTwin(ref: ReferencePerfume): TwinResult | null {
  const curatedKey = CURATED_BY_REFERENCE[ref.id];
  if (curatedKey) {
    const curated = CURATED_BY_KEY.get(curatedKey);
    const profile = curated && PRODUCT_PROFILES.find((p) => p.product.slug === curated.productHandle);
    if (curated && profile) {
      const result = buildResult(ref, profile, scoreProduct(ref, profile));
      // Relue et validée : elle ne redescend pas sous « très proche », et sa
      // description rédigée remplace le texte générique.
      return { ...result, strength: "tres-proche", score: Math.max(result.score, 0.9), curated };
    }
  }
  return rankTwins(ref, 1)[0] ?? null;
}

/** Raccourci par identifiant — l'interface ne manipule que des ids. */
export function findTwinById(referenceId: string): TwinResult | null {
  const ref = REFERENCE_BY_ID.get(referenceId);
  return ref ? findTwin(ref) : null;
}

// ─── Recherche de références ─────────────────────────────────────────────────

const REFERENCE_BY_ID = new Map(REFERENCE_PERFUMES.map((r) => [r.id, r]));

/** Clés normalisées calculées une fois : l'autocomplétion tape dessus à chaque frappe. */
const REFERENCE_INDEX = REFERENCE_PERFUMES.map((ref) => ({
  ref,
  keyName: norm(ref.name),
  keyHouse: norm(ref.house),
  keyAll: norm(ref.name + " " + ref.house),
}));

export function getReference(id: string): ReferencePerfume | undefined {
  return REFERENCE_BY_ID.get(id);
}

/**
 * Autocomplétion : insensible à la casse ET aux accents (`norm` de
 * search-catalog, le même que la superposition de recherche).
 * Classement : le nom qui commence par la saisie d'abord, puis le nom qui la
 * contient, puis la maison. À rang égal, ordre alphabétique — déterministe.
 */
export function searchReferences(query: string, limit = 8): ReferencePerfume[] {
  const q = norm(query);
  if (q.length < 2) return [];

  const hits: Array<{ ref: ReferencePerfume; rank: number }> = [];
  for (const entry of REFERENCE_INDEX) {
    let rank = -1;
    if (entry.keyName.startsWith(q)) rank = 0;
    else if (entry.keyName.includes(q)) rank = 1;
    else if (entry.keyHouse.startsWith(q)) rank = 2;
    else if (entry.keyAll.includes(q)) rank = 3;
    if (rank >= 0) hits.push({ ref: entry.ref, rank });
  }

  hits.sort(
    (a, b) =>
      a.rank - b.rank ||
      a.ref.house.localeCompare(b.ref.house, "fr") ||
      a.ref.name.localeCompare(b.ref.name, "fr")
  );
  return hits.slice(0, limit).map((h) => h.ref);
}

/** Les suggestions affichées en pastilles, résolues et prêtes à l'emploi. */
export function getSuggestedReferences(): ReferencePerfume[] {
  return SUGGESTED_REFERENCE_IDS.map((id) => REFERENCE_BY_ID.get(id)).filter(
    (r): r is ReferencePerfume => Boolean(r)
  );
}

export { REFERENCE_PERFUMES, FAMILY_LABELS };
export type { ReferencePerfume, SearchProduct, OlfactiveMatch };
