/**
 * Catalogue de recherche — AGRÈGE les sources produit déjà présentes dans le repo.
 *
 * ⚠️ Aucun catalogue inventé : ce fichier normalise les données réelles
 * (noms / marques / images / prix), déduplique par marque + nom, et construit
 * les index dont la superposition de recherche a besoin.
 *
 * Sources branchées :
 *   - product-details.ts    (PRODUCTS)        → fiches complètes : pyramide olfactive, contenance, concentration
 *   - best-sellers-top.ts   (TOP_PRODUCTS)    → best-sellers
 *   - best-sellers.ts       (REEF_PRODUCTS)   → maison Reef
 *   - trend-products.ts     (DEMO_TRENDS)     → tendances, vidéo de carte, disponibilité
 *   - oil-products.ts       (DEMO)            → huiles de parfum, familles, contenance
 *   - olfactive-twins.ts    (OLFACTIVE_TWINS) → « inspiré de », famille
 *   - bundle-products.ts    (BUNDLE_PRODUCTS) → lot 3 pour 2, notes, prix barré
 *   - brands.ts             (BRANDS)          → maisons : ville, année, visuel
 *
 * Le tout est calculé UNE FOIS au premier import du module (côté client, au
 * premier ouverture de la recherche : le composant charge ce module en dynamic
 * import, jamais au chargement de page).
 */

import { PRODUCTS } from "@/data/product-details";
import { TOP_PRODUCTS } from "@/data/best-sellers-top";
import { REEF_PRODUCTS } from "@/data/best-sellers";
import { DEMO_TRENDS } from "@/data/trend-products";
import { DEMO as OIL_PRODUCTS } from "@/data/oil-products";
import { OLFACTIVE_TWINS } from "@/data/olfactive-twins";
import { BUNDLE_PRODUCTS } from "@/data/bundle-products";
import { BRANDS } from "@/data/brands";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SearchProduct {
  /** identifiant stable, dérivé de la marque + du nom */
  id: string;
  name: string;
  brand: string;
  /** identifiant d'URL de la fiche produit — `/produit/<slug>` */
  slug: string;
  /** lien vers la fiche produit ; toujours `/produit/<slug>` */
  href: string;
  image?: string;
  /** vidéo de carte quand la source en fournit une — elle montre CE flacon-là */
  video?: string;
  price?: number;
  /** prix barré, quand la source le renseigne */
  compareAtPrice?: number;
  /** en stock : les ruptures descendent dans le classement */
  available: boolean;
  notes: string[];
  /** pyramide olfactive, seulement pour les références détaillées */
  topNotes?: string[];
  heartNotes?: string[];
  baseNotes?: string[];
  family?: string;
  volume?: string;
  concentration?: string;
  gender?: string;
  description?: string;
  /** popularité 0..100 — classe les suggestions de l'écran d'accueil */
  popularity: number;

  // clés normalisées, calculées une fois : la recherche compare sur elles
  keyName: string;
  keyBrand: string;
  keyNotes: string;
  keyAll: string;
}

export interface SearchBrand {
  name: string;
  city?: string;
  image?: string;
  /** nombre de références de la maison dans le catalogue */
  count: number;
  keyAll: string;
}

export interface SearchNote {
  label: string;
  /** nombre de parfums qui portent cette note */
  count: number;
  key: string;
}

// ─── Normalisation ───────────────────────────────────────────────────────────

/** NFD + suppression des diacritiques : « Rosé » et « rose » doivent se répondre. */
export function norm(text: string | undefined | null): string {
  return (text || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Les sources écrivent les notes de trois façons : tableau, « Oud · Rose · Safran »
 * (best-sellers) et « Ambre, Bois de santal » (lot 3 pour 2). On rend un tableau.
 */
function splitNotes(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : raw.split(/[·,/|]/);
  return list.map((n) => n.trim()).filter(Boolean);
}

/** Casse uniforme à l'affichage : le catalogue mélange « litchi » et « Mandarine ». */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const slugify = (s: string) =>
  norm(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// ─── Familles olfactives ─────────────────────────────────────────────────────
// Une famille déclarée par la source l'emporte ; sinon on la déduit des notes.

export const FAMILIES: Record<string, { label: string; words: string[]; text: string }> = {
  frais: {
    label: "Frais",
    words: ["bergamote", "citron", "mandarine", "orange", "pamplemousse", "neroli", "marin", "aquatique", "sel", "menthe", "eucalyptus", "lavande", "verveine", "the vert", "frais"],
    text: "Agrumes et notes vertes — un sillage lumineux, qui s'impose sans peser.",
  },
  floral: {
    label: "Floral",
    words: ["jasmin", "rose", "iris", "fleur d'oranger", "muguet", "tubereuse", "ylang", "pivoine", "violette", "lilas", "freesia", "magnolia", "floral"],
    text: "Le bouquet au premier plan, tenu par un fond discret.",
  },
  ambre: {
    label: "Ambré · gourmand",
    words: ["ambre", "ambré", "vanille", "caramel", "tonka", "benjoin", "miel", "safran", "cannelle", "encens", "labdanum", "praline", "chocolat", "coco", "peche", "framboise", "fraise", "mangue", "ananas", "poire", "gourmand", "sucre"],
    text: "Résines, vanille et épices — chaleur et gourmandise, un sillage enveloppant.",
  },
  boise: {
    label: "Boisé",
    words: ["oud", "santal", "patchouli", "cedre", "vetiver", "cuir", "bois", "tabac", "mousse", "papyrus", "gaiac", "boise"],
    text: "Le bois en colonne vertébrale : profond, tenace, très présent en fin de journée.",
  },
};

/**
 * DOMINANCE STRUCTURELLE — pourquoi les quatre familles ne pèsent pas pareil.
 *
 * Un parfum se lit à sa colonne vertébrale, pas au nombre de matières qu'il
 * cite. L'oud cambodi et le santal de Shaghaf Oud TIENNENT la composition ; la
 * rose et la fleur d'oranger sont des accents posés dessus.
 *
 * La version précédente comptait une voix par mot du dictionnaire trouvé dans
 * le texte, puis gardait le meilleur avec `hits > best`. Shaghaf Oud sortait à
 * DEUX partout — rose + fleur d'oranger, safran + labdanum, oud + santal — et
 * c'est alors l'ORDRE D'ÉCRITURE de l'objet `FAMILIES` qui tranchait, `floral`
 * y étant déclaré en deuxième. Un oud dense était donc affiché « Floral », et
 * l'affinité de famille le rendait « très proche » d'un musc rosé léger.
 * Personne ne peut deviner qu'une famille se joue à la place d'une accolade.
 *
 * Deux règles écrites remplacent ce hasard :
 *   `voix` — ce que vaut UNE matière de cette famille. Un fond (bois, résine)
 *            porte le sillage pendant des heures là où une tête (agrume, note
 *            verte) s'évapore en minutes : elles ne pèsent pas pareil.
 *   `rang` — qui l'emporte à égalité de voix. En parfumerie orientale une
 *            structure boisée ou ambrée DOMINE un accent floral ou frais : un
 *            parfum qui porte oud et santal n'est pas un floral parce qu'il
 *            contient aussi une rose.
 * Le résultat ne dépend plus de l'ordre dans lequel ce fichier est écrit.
 */
const FAMILY_STRUCTURE: Record<string, { voix: number; rang: number }> = {
  boise: { voix: 3, rang: 4 },
  ambre: { voix: 3, rang: 3 },
  floral: { voix: 2, rang: 2 },
  frais: { voix: 1, rang: 1 },
};

/**
 * Famille d'UNE matière, ou "" si le libellé ne dit rien d'olfactif.
 *
 * Une note ne vote qu'une fois : « boisé » contient « bois », et l'ancien
 * comptage par mot du dictionnaire lui donnait donc deux points pour une seule
 * matière. Et quand plusieurs familles reconnaissent le même libellé — « fleur
 * d'oranger » est un floral mais contient « orange », « bois de rose » est un
 * bois qui cite une fleur — c'est la plus dominante qui l'emporte, jamais la
 * première rencontrée.
 */
function familyOfNote(note: string): string {
  const n = norm(note);
  if (!n) return "";
  let winner = "";
  let rang = 0;
  for (const [key, def] of Object.entries(FAMILIES)) {
    if (!def.words.some((w) => n.includes(norm(w)))) continue;
    if (FAMILY_STRUCTURE[key].rang > rang) {
      rang = FAMILY_STRUCTURE[key].rang;
      winner = key;
    }
  }
  return winner;
}

/**
 * Famille annoncée par la source, ou "" si elle n'en annonce pas.
 *
 * Les sources l'écrivent de deux façons : une clé simple (« Ambré », « Rosé »)
 * ou un triptyque de vitrine (« Oud · Boisé · Épicé »). Dans les deux cas le
 * PREMIER descripteur porte la dominante — c'est une décision éditoriale, prise
 * par quelqu'un qui a jugé que ce parfum était d'abord un oud, et elle vaut
 * mieux qu'un comptage de mots. On s'arrête donc au premier descripteur qu'on
 * sait traduire, au lieu de balayer la phrase entière : l'ancienne version
 * testait « épicé » avant « boisé » et remontait le TROISIÈME descripteur
 * d'Amber Oud, qu'elle classait ambré quand sa source le dit boisé.
 */
function familyFromDeclared(declared: string | undefined): string {
  for (const part of splitNotes(declared)) {
    const s = norm(part);
    if (!s) continue;
    if (s.startsWith("ambr") || s.includes("gourmand") || s.includes("fruit") || s.includes("epice") || s.includes("sucre")) return "ambre";
    if (s.startsWith("floral") || s.startsWith("fleur") || s.startsWith("rose") || s.startsWith("musqu")) return "floral";
    if (s.startsWith("frais") || s.startsWith("aromatique") || s.includes("aquatique") || s.includes("marin") || s.includes("agrume") || s.includes("hesperid")) return "frais";
    if (s.startsWith("bois") || s.startsWith("oud") || s.startsWith("santal") || s.startsWith("cuir") || s.startsWith("chypr")) return "boise";
  }
  return "";
}

/** Renvoie la clé de famille, ou "" si rien ne ressort. */
export function familyOf(p: SearchProduct): string {
  const declared = familyFromDeclared(p.family);
  if (declared) return declared;

  // Rien de déclaré : les matières votent. Le nom du flacon vote avec elles —
  // « Shaghaf Oud », « Silk Rose » et « Vanilla Voyage » annoncent leur famille
  // avant même qu'on lise la pyramide, et c'est souvent le seul indice qui
  // reste sur une référence dont les notes n'ont pas encore été saisies.
  const scores = new Map<string, number>();
  for (const token of [...p.notes, p.name]) {
    const key = familyOfNote(token);
    if (!key) continue;
    scores.set(key, (scores.get(key) ?? 0) + FAMILY_STRUCTURE[key].voix);
  }

  let winner = "";
  let best = 0;
  let rang = 0;
  for (const [key, score] of scores) {
    const r = FAMILY_STRUCTURE[key].rang;
    // `>` sur les voix, puis `>` sur le rang : deux familles à égalité de voix
    // sont départagées par la dominance, pas par l'ordre d'insertion de la Map.
    if (score > best || (score === best && r > rang)) {
      best = score;
      rang = r;
      winner = key;
    }
  }
  return winner;
}

// ─── Logos de maison ─────────────────────────────────────────────────────────
// Les vrais logos vivent dans /public/brands/ (déjà utilisés par BrandCard sur la
// page « Marques »). La recherche les réutilise : une vignette de produit à la
// place d'un logo faisait se ressembler toutes les maisons — et les visuels
// /assets/prod-*.jpg sont partagés entre plusieurs marques.
// Les maisons sans fichier retombent sur leur monogramme (initiale).
const BRAND_LOGOS: Record<string, string> = {
  lattafa: "/brands/lattafa.jpg",
  reef: "/brands/reef.jpg",
  "al haramain": "/brands/alharamain.jpg",
  "ahmed al maghribi": "/brands/ahmed.jpg",
  "paris corner": "/brands/pariscorner.jpg",
  "swiss arabian": "/brands/swissarabian.jpg",
  "oud elite": "/brands/oudelite.jpg",
  "maison asrar": "/brands/asrar.jpg",
  asrar: "/brands/asrar.jpg",
  rasasi: "/brands/rasasi.jpg",
  afnan: "/brands/afnan.jpg",
  "maison alhambra": "/brands/alhambra.jpg",
  alhambra: "/brands/alhambra.jpg",
  "ard al zaafaran": "/brands/ardalzaafaran.jpg",
};

/** Logo de la maison, ou undefined — l'appelant affiche alors l'initiale. */
export function brandLogo(name: string): string | undefined {
  return BRAND_LOGOS[norm(name)];
}

// ─── Films « fiole fixe » ────────────────────────────────────────────────────
// Le flacon reste net et immobile pendant que le décor bouge autour : c'est le
// seul plan qui montre CE flacon-là de bout en bout. La recherche le préfère au
// packshot quand il existe — un visuel fixe ne distingue pas deux références
// d'une même maison, un film de la fiole si.
// Clé = slug produit. Table explicite plutôt que dérivée des stories : toutes
// les vidéos du site ne sont pas des fioles fixes, et seule celle-ci l'est.
const FIOLE_FIXE: Record<string, { video: string; poster: string }> = {
  "lattafa-khamrah": {
    // Aligné sur la story « khamrah-fiole-fixe » de `product-stories.ts` : c'est
    // désormais ce plan-là (flacon net sur la pierre sombre, décor qui bouge
    // autour) qui porte l'étiquette « fiole fixe » partout dans le site.
    video: "/assets/videos/khamrah-hf-04.mp4",
    poster: "/assets/products/khamrah/khamrah-poster.jpg",
  },
};

// ─── Agrégation ──────────────────────────────────────────────────────────────

type RawProduct = Omit<SearchProduct, "id" | "slug" | "keyName" | "keyBrand" | "keyNotes" | "keyAll">;

/**
 * Références photographiées, pas encore rédigées.
 *
 * Le fichier s'interdit d'inventer un catalogue, et ce relais n'en invente pas
 * un : la banque d'images de `public/assets/products/` fait foi, c'est elle qui
 * atteste que la boutique tient la référence. Le point de friction est ailleurs
 * — une référence arrive avec ses visuels des semaines avant que sa fiche ne
 * soit écrite dans `product-details.ts`, et pendant tout cet intervalle elle
 * n'existe NULLE PART : ni en recherche, ni dans le quiz, ni dans
 * l'appariement olfactif, ni sur `/produit/<slug>`, tous branchés sur
 * SEARCH_PRODUCTS via cette agrégation. Le flacon est en rayon, le site l'ignore.
 *
 * Ce tableau est fait pour se vider. Dès que la fiche rédigée existe, l'entrée
 * d'ici part : `collect()` la range en dernier, donc la fiche gagnerait de
 * toute façon la déduplication — mais garder les deux ferait diverger deux
 * prix pour un même flacon.
 */
const SANS_FICHE_REDIGEE: RawProduct[] = [
  {
    // Rifaaqat a désormais sa fiche rédigée dans `product-details.ts`, qui est
    // la première source de `collect()` : prix, pyramide, description et
    // galerie viennent de là. Ne restent ici que les deux champs qu'une fiche
    // produit ne porte pas — la vidéo de carte et le rang de popularité — que
    // `dedupe()` vient greffer sur l'entrée rédigée, poussée avant celle-ci.
    // Dupliquer le prix ou les notes ici créerait deux vérités à maintenir.
    name: "Rifaaqat",
    brand: "Paris Corner",
    href: "/produit/paris-corner-rifaaqat",
    video: "/assets/videos/rifaaqat-hf-01.mp4",
    // `available` et `notes` sont obligatoires dans `RawProduct`. Le tableau
    // de notes reste vide à dessein : c'est l'entrée rédigée qui gagne le
    // `dedupe()` et porte la pyramide, celle-ci ne fait que lui greffer la
    // vidéo et le rang. Y recopier les notes en ferait une seconde source.
    available: true,
    notes: [],
    // Sans historique de ventes, la popularité ne peut pas être mesurée : on la
    // place juste sous le dernier rang du lot 3 pour 2 (66) pour que la
    // nouveauté ne passe pas devant des références réellement vendues, tout en
    // restant au-dessus du plancher où le classement l'enterrerait.
    popularity: 62,
  },
];

function collect(): RawProduct[] {
  const out: RawProduct[] = [];

  // 1. Fiches détaillées — la source la plus riche, elle passe en premier :
  //    la déduplication garde la première occurrence rencontrée.
  for (const [slug, p] of Object.entries(PRODUCTS)) {
    out.push({
      name: p.name,
      brand: p.brand,
      href: `/produit/${slug}`,
      image: p.image,
      price: p.price,
      compareAtPrice: p.oldPrice,
      available: true,
      notes: [...p.topNotes, ...p.heartNotes, ...p.baseNotes],
      topNotes: p.topNotes,
      heartNotes: p.heartNotes,
      baseNotes: p.baseNotes,
      // La fiche rédigée est la source la plus fiable du catalogue : sa famille
      // déclarée doit gagner la déduplication devant le triptyque de vitrine
      // que `OLFACTIVE_TWINS` porte pour le même flacon (« Gourmand · Boisé ·
      // Épicé »), lequel décrit la PAIRE plus qu'il ne classe le produit.
      family: p.family,
      volume: p.volume,
      concentration: p.concentration,
      description: p.description,
      popularity: Math.round(Math.min(100, (p.rating / 5) * 60 + Math.min(40, p.reviews / 12))),
    });
  }

  // 2. Tendances — elles portent une vidéo de carte et un rang réel.
  DEMO_TRENDS.forEach((p) => {
    out.push({
      name: p.name,
      brand: p.brand,
      href: p.href,
      image: p.image,
      video: p.cardVideo,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      available: p.available,
      family: p.family,
      notes: [],
      popularity: Math.max(0, 100 - (p.rank - 1) * 6),
    });
  });

  // 3. Best-sellers et maison Reef — `notes` y est une chaîne « A · B · C ».
  [...TOP_PRODUCTS, ...REEF_PRODUCTS].forEach((p, i) => {
    out.push({
      name: p.name,
      brand: p.brand,
      href: `/produit/${p.slug}`,
      image: p.image,
      price: p.price.amount,
      compareAtPrice: p.compareAtPrice?.amount,
      available: true,
      family: p.family,
      notes: splitNotes(p.notes),
      popularity: Math.max(0, 92 - i * 4),
    });
  });

  // 4. Huiles de parfum — familles déclarées, contenance et genre renseignés.
  OIL_PRODUCTS.forEach((p, i) => {
    out.push({
      name: p.name,
      brand: p.brand,
      href: p.href,
      image: p.bottleImage,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      available: p.available,
      notes: p.families.map((f) => f.label),
      family: p.families[0]?.label,
      volume: p.volume,
      gender: p.gender,
      popularity: Math.max(0, 80 - i * 4),
    });
  });

  // 5. Jumeaux olfactifs — la famille y est une phrase « Ambré · Sucré · Floral ».
  OLFACTIVE_TWINS.forEach((m, i) => {
    out.push({
      name: m.product.name,
      brand: m.product.brand,
      href: m.product.href,
      image: m.product.image,
      price: m.product.price,
      available: true,
      notes: splitNotes(m.family),
      family: m.family,
      description: m.description,
      popularity: Math.max(0, 70 - i * 3),
    });
  });

  // 6. Lot « 3 pour 2 » — notes séparées par des virgules, prix barré `was`.
  BUNDLE_PRODUCTS.forEach((p, i) => {
    out.push({
      name: p.name,
      brand: p.brand,
      href: "/offres/lot-3-pour-2",
      image: p.image,
      price: p.price,
      compareAtPrice: p.was,
      available: p.available,
      family: p.family,
      notes: splitNotes(p.notes),
      popularity: Math.max(0, 66 - i * 3),
    });
  });

  // 7. Références sans fiche rédigée — en dernier : toute autre source qui
  //    porterait déjà le même flacon (une fiche, un lot) doit l'emporter.
  out.push(...SANS_FICHE_REDIGEE.map((p) => ({ ...p })));

  return out;
}

/**
 * Déduplication par marque + nom. Une même référence apparaît dans plusieurs
 * rails du site ; on garde la première (les fiches détaillées passent d'abord)
 * et on complète ses trous avec ce que les doublons apportent — une vidéo de
 * carte vue seulement dans les tendances, un prix vu seulement dans un lot.
 */
function dedupe(list: RawProduct[]): SearchProduct[] {
  const byKey = new Map<string, RawProduct>();

  for (const p of list) {
    const key = `${norm(p.brand)}|${norm(p.name)}`;
    const kept = byKey.get(key);
    if (!kept) {
      byKey.set(key, { ...p });
      continue;
    }
    // complète sans écraser
    kept.image ??= p.image;
    kept.video ??= p.video;
    kept.price ??= p.price;
    kept.compareAtPrice ??= p.compareAtPrice;
    kept.family ??= p.family;
    kept.volume ??= p.volume;
    kept.concentration ??= p.concentration;
    kept.gender ??= p.gender;
    kept.description ??= p.description;
    if (!kept.notes.length) kept.notes = p.notes;
    kept.popularity = Math.max(kept.popularity, p.popularity);
    // une disponibilité vue quelque part suffit
    kept.available = kept.available || p.available;
  }

  return [...byKey.values()].map((p) => {
    const id = `${slugify(p.brand)}-${slugify(p.name)}`;
    // Les fiches détaillées portent déjà leur slug dans leur href : on le garde,
    // sinon `swiss-arabian-shaghaf` deviendrait `swiss-arabian-shaghaf-oud` et
    // la page ne trouverait plus sa fiche riche. Les autres sources renvoyaient
    // vers /promo-flash ou /offres/lot-3-pour-2 — une page de liste, pas la
    // fiche du produit cliqué : on leur en donne une.
    const slug = p.href.startsWith("/produit/") ? p.href.slice("/produit/".length) : id;
    const fioleFixe = FIOLE_FIXE[slug];
    return {
    ...p,
    id,
    slug,
    href: `/produit/${slug}`,
    // Le film de la fiole prime sur la vidéo de carte héritée des tendances.
    // L'image reste le packshot : c'est lui qui sert de poster avant lecture et
    // d'illustration dans le quiz, où un fond ambré chargé se lirait moins bien.
    video: fioleFixe?.video ?? p.video,
    notes: p.notes.map(capitalize),
    keyName: norm(p.name),
    keyBrand: norm(p.brand),
    keyNotes: norm(p.notes.join(" ")),
    keyAll: norm([p.name, p.brand, p.family, p.gender, p.notes.join(" ")].join(" ")),
    };
  });
}

/**
 * Seconde passe : fusion par slug.
 *
 * La déduplication travaille sur marque + nom, or les données de démo attribuent
 * parfois le même parfum à deux maisons — « Reef 33 » est chez Reef dans les
 * best-sellers et chez « Dubaï Parfumerie » dans les tendances. Résultat : deux
 * entrées, deux fois la même carte dans les suggestions, et une fiche produit
 * qui répondait au hasard puisque les deux visent `/produit/reef-33`.
 *
 * On garde l'entrée la mieux renseignée — celle qui porte des notes, une
 * contenance, une concentration — et on complète ses trous avec l'autre.
 */
function mergeBySlug(list: SearchProduct[]): SearchProduct[] {
  const richness = (p: SearchProduct) =>
    p.notes.length +
    (p.topNotes?.length ? 3 : 0) +
    (p.volume ? 1 : 0) +
    (p.concentration ? 1 : 0) +
    (p.description ? 1 : 0);

  const bySlug = new Map<string, SearchProduct>();
  for (const p of list) {
    const kept = bySlug.get(p.slug);
    if (!kept) {
      bySlug.set(p.slug, p);
      continue;
    }
    const [winner, loser] = richness(p) > richness(kept) ? [p, kept] : [kept, p];
    bySlug.set(p.slug, {
      ...winner,
      image: winner.image ?? loser.image,
      video: winner.video ?? loser.video,
      price: winner.price ?? loser.price,
      compareAtPrice: winner.compareAtPrice ?? loser.compareAtPrice,
      family: winner.family ?? loser.family,
      volume: winner.volume ?? loser.volume,
      concentration: winner.concentration ?? loser.concentration,
      gender: winner.gender ?? loser.gender,
      description: winner.description ?? loser.description,
      notes: winner.notes.length ? winner.notes : loser.notes,
      available: winner.available || loser.available,
      popularity: Math.max(winner.popularity, loser.popularity),
    });
  }
  return [...bySlug.values()];
}

export const SEARCH_PRODUCTS: SearchProduct[] = mergeBySlug(dedupe(collect()));

/**
 * Maisons : celles de la page « Marques » d'abord (elles ont ville et visuel),
 * puis toute marque rencontrée dans le catalogue produit. `count` est le nombre
 * de références réellement présentes, pas la promesse marketing « 80+ ».
 */
export const SEARCH_BRANDS: SearchBrand[] = (() => {
  const counts = new Map<string, number>();
  const labels = new Map<string, string>();
  for (const p of SEARCH_PRODUCTS) {
    const k = norm(p.brand);
    counts.set(k, (counts.get(k) || 0) + 1);
    if (!labels.has(k)) labels.set(k, p.brand);
  }

  const known = BRANDS.map((b) => ({
    name: b.name,
    city: b.city,
    // le logo d'abord ; `b.image` est un visuel produit, partagé entre marques
    image: brandLogo(b.name),
    count: counts.get(norm(b.name)) || 0,
    keyAll: norm(`${b.name} ${b.city}`),
  }));
  const knownKeys = new Set(known.map((b) => norm(b.name)));

  // marques vues dans le catalogue mais absentes de la page « Marques »
  const extra: SearchBrand[] = [];
  for (const [k, label] of labels) {
    if (knownKeys.has(k)) continue;
    extra.push({ name: label, image: brandLogo(label), count: counts.get(k) || 0, keyAll: k });
  }

  return [...known, ...extra].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fr"));
})();

/** Index des notes : combien de parfums pour chacune, pour classer les propositions. */
export const SEARCH_NOTES: SearchNote[] = (() => {
  const counts = new Map<string, { label: string; n: number }>();
  for (const p of SEARCH_PRODUCTS) {
    for (const note of p.notes) {
      const k = norm(note);
      if (!k) continue;
      const cur = counts.get(k);
      if (cur) cur.n += 1;
      else counts.set(k, { label: capitalize(note), n: 1 });
    }
  }
  return [...counts.entries()]
    .map(([key, { label, n }]) => ({ key, label, count: n }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "fr"));
})();
