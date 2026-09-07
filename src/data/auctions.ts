/**
 * Enchères — les six lots de la page `/encheres`.
 *
 * Rien n'est inventé côté produit : nom, maison, prix boutique, contenance et
 * accroche sont LUS dans `product-details.ts` (la fiche `/produit/<slug>`),
 * jamais recopiés à la main. Si un prix change sur la fiche, la mise à prix
 * et le plafond des enchères suivent tout seuls — deux sources finiraient
 * toujours par diverger.
 *
 * Ce qui appartient en propre à l'enchère : le choix des photos (les mises en
 * scène, pas les packshots fond blanc — c'est l'image qui fait cliquer), le
 * décalage de clôture, l'ÉTAT du flacon (neuf ou occasion, avec le niveau de
 * jus restant et sa photo) et les règles de calcul ci-dessous.
 *
 * ⚠️ DÉMONSTRATION ⚠️
 * Il n'y a pas de backend : les enchérisseurs concurrents sont simulés côté
 * client (voir `DEMO_BIDDERS` et `auction-store.ts`). La page le dit en bas
 * (« Enchères de démonstration ») ; ne pas retirer cette mention sans brancher
 * un vrai moteur d'enchères derrière.
 */

import { PRODUCTS } from "@/data/product-details";

/* ── Règles économiques ─────────────────────────────────────────────────── */

/** Part du prix boutique qui sert de mise à prix (40 %). */
export const START_RATIO = 0.4;

/**
 * Plafond des relances simulées : au-delà de 1,6 × le prix boutique ce n'est
 * plus une affaire pour le visiteur, et l'objectif est le flux, pas la marge.
 * Le visiteur lui-même n'est pas plafonné — c'est son choix.
 */
export const MAX_DEMO_RATIO = 1.6;

/** Une enchère dans les 2 dernières minutes rallonge de 2 minutes (anti-sniping). */
export const SNIPE_WINDOW_MS = 2 * 60 * 1000;
export const SNIPE_EXTEND_MS = 2 * 60 * 1000;

/** Sous 10 minutes, le compte à rebours passe au rouge et pulse. */
export const URGENT_MS = 10 * 60 * 1000;

/** La notification « Me prévenir » part 5 minutes avant la clôture. */
export const REMIND_BEFORE_MS = 5 * 60 * 1000;

/**
 * Pas d'enchère, fonction du prix COURANT (pas du prix boutique) : c'est la
 * règle habituelle des salles — un pas fixe de 5 € sur un lot à 9 € serait
 * absurde, et 1 € sur un lot à 90 € ferait durer la partie sans fin.
 */
export function stepFor(currentPrice: number): number {
  if (currentPrice < 30) return 1;
  if (currentPrice < 60) return 2;
  return 5;
}

/**
 * Arrondit au « ,90 » le plus proche : 11,60 → 11,90 ; 9,16 → 8,90.
 * Le prix psychologique des étiquettes de la boutique, gardé ici aussi.
 */
export function roundTo90(value: number): number {
  const lower = Math.floor(value) - 0.1; // (n-1),90
  const upper = Math.floor(value) + 0.9; // n,90
  return Math.round((value - lower <= upper - value ? lower : upper) * 100) / 100;
}

export function startingBidFor(shopPrice: number): number {
  return roundTo90(shopPrice * START_RATIO);
}

/* ── Lots ───────────────────────────────────────────────────────────────── */

/**
 * État du flacon. « neuf » : scellé, jamais ouvert — la promesse habituelle
 * de la boutique. « occasion » : flacon ouvert, vendu avec son niveau de jus
 * photographié — c'est la photo du flacon réel, pas un visuel de catalogue,
 * qui fait la confiance sur l'occasion.
 */
export type LotCondition = "neuf" | "occasion";

export interface AuctionLot {
  /** Slug de la fiche produit : `/produit/<slug>`. */
  slug: string;
  name: string;
  brand: string;
  volume: string;
  /** Prix boutique, lu dans la fiche. */
  shopPrice: number;
  /** Mise à prix (40 % arrondis au ,90). */
  startingBid: number;
  /** Photo plein cadre de la carte (mise en scène, ratio portrait). */
  image: string;
  /** 1 à 2 photos secondaires pour la galerie du panneau. */
  gallery: string[];
  /** Première phrase de la description de la fiche. */
  hook: string;
  /**
   * Clôture, en millisecondes APRÈS le premier chargement. Le magasin
   * (`auction-store.ts`) fige la date absolue en localStorage : un visiteur
   * qui revient retrouve le même compte à rebours, pas un chrono remis à zéro.
   */
  endsInMs: number;
  /** État du flacon — voir `LotCondition`. */
  condition: LotCondition;
  /** Occasion : pourcentage de jus restant (entier 0–100). `null` pour un neuf. */
  fillLevel: number | null;
  /**
   * Occasion : photo du niveau (flacon réel à contre-jour, ratio 4:5), montrée
   * en grand dans le panneau. `null` tant qu'elle n'a pas été prise — on
   * affiche alors la jauge seule avec « photo à venir », on n'invente rien.
   */
  fillPhoto: string | null;
  /**
   * Occasion : hauteur de la ligne de jus SUR LA PHOTO, en % depuis le haut du
   * cadre, pour poser le repère au bon endroit. Relevée à l'œil sur chaque
   * photo (le flacon n'occupe pas tout le cadre, un calcul depuis `fillLevel`
   * tomberait à côté). `null` si pas de photo.
   */
  fillMarkY: number | null;
  /** Occasion : une phrase factuelle (« Testé deux fois, boîte d'origine »). `null` pour un neuf. */
  conditionNote: string | null;
}

/** Ces champs ne sont JAMAIS persistés : le magasin les relit ici à chaque chargement. */
export type LotConditionFields = Pick<AuctionLot, "condition" | "fillLevel" | "fillPhoto" | "fillMarkY" | "conditionNote">;

/** Un neuf n'a ni niveau, ni photo de niveau, ni note. */
export const NEUF: LotConditionFields = { condition: "neuf", fillLevel: null, fillPhoto: null, fillMarkY: null, conditionNote: null };

const H = 60 * 60 * 1000;
const D = 24 * H;

/** Première phrase de la description — pas d'accroche réécrite. */
function firstSentence(text: string, max = 160): string {
  const m = text.match(/^[^.!?]+[.!?]/);
  const s = (m ? m[0] : text).trim();
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}

type LotSeed = Pick<AuctionLot, "slug" | "image" | "gallery" | "endsInMs"> & LotConditionFields;

const P = "/assets/products";
/** Photos propres aux enchères (niveaux de jus des occasions). */
const A = "/assets/auctions";

/**
 * Ordre = ordre des clôtures. Khamrah ferme en premier : c'est le flacon le
 * plus commenté des réseaux, celui qui fait revenir. Il devient « à la une ».
 *
 * Deux lots sont des occasions (Khamrah, 9PM) : les deux flacons les plus
 * connus, ceux dont un visiteur accepte volontiers une seconde main. Leurs
 * photos de niveau ont été produites à partir du packshot boutique
 * (DÉMONSTRATION : il n'existe pas de flacon d'occasion physique à
 * photographier dans la maquette).
 */
const SEEDS: LotSeed[] = [
  {
    slug: "lattafa-khamrah",
    image: `${P}/khamrah/khamrah-hf-33.jpg`, // le flacon posé sur la dune
    gallery: [`${P}/khamrah/khamrah-hf-30.jpg`, `${P}/khamrah/khamrah-hf-36.jpg`],
    endsInMs: 2 * H,
    condition: "occasion",
    fillLevel: 75, // relevé sur la photo : le jus affleure sous l'épaule du flacon
    fillPhoto: `${A}/lattafa-khamrah-niveau-01.webp`,
    fillMarkY: 55,
    conditionNote: "Porté une dizaine de fois, bouchon légèrement marqué, boîte d'origine.",
  },
  {
    slug: "oud-elite-pure-black-oud",
    image: `${P}/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-env-04.webp`, // bassin aux arcades
    gallery: [
      `${P}/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-env-13.webp`,
      `${P}/oud-elite-pure-black-oud/dp_parfumerie-oud-elite-pure-black-oud-env-12.webp`,
    ],
    endsInMs: 6 * H,
    ...NEUF,
  },
  {
    slug: "lattafa-yara",
    image: `${P}/lattafa-yara/dp_parfumerie-lattafa-yara-env-04.webp`, // satin rose
    gallery: [
      `${P}/lattafa-yara/dp_parfumerie-lattafa-yara-env-01.webp`,
      `${P}/lattafa-yara/dp_parfumerie-lattafa-yara-env-13.webp`,
    ],
    endsInMs: 1 * D,
    ...NEUF,
  },
  {
    slug: "afnan-9pm",
    image: `${P}/afnan-9pm/dp_parfumerie-afnan-9pm-env-03.jpg`, // halo doré
    gallery: [`${P}/afnan-9pm/dp_parfumerie-afnan-9pm-env-02.jpg`, `${P}/afnan-9pm/dp_parfumerie-afnan-9pm-env-01.jpg`],
    endsInMs: 2 * D,
    condition: "occasion",
    fillLevel: 55, // relevé sur la photo : la ligne passe au milieu du « 9 »
    fillPhoto: `${A}/afnan-9pm-niveau-01.webp`,
    fillMarkY: 54,
    conditionNote: "Testé deux fois puis porté un hiver, sans boîte.",
  },
  {
    slug: "paris-corner-the-show-magnifique",
    image: `${P}/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-env-05.webp`, // escalier
    gallery: [
      `${P}/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-env-04.webp`,
      `${P}/paris-corner-the-show-magnifique/dp_parfumerie-paris-corner-the-show-magnifique-env-08.webp`,
    ],
    endsInMs: 3 * D,
    ...NEUF,
  },
  {
    slug: "paris-corner-marshmallow-blush",
    image: `${P}/paris-corner-marshmallow-blush/dp_parfumerie-paris-corner-marshmallow-blush-packshot-04.webp`, // marbre rose
    gallery: [
      `${P}/paris-corner-marshmallow-blush/dp_parfumerie-paris-corner-marshmallow-blush-env-01.webp`,
      `${P}/paris-corner-marshmallow-blush/dp_parfumerie-paris-corner-marshmallow-blush-env-02.webp`,
    ],
    endsInMs: 5 * D,
    ...NEUF,
  },
];

export const AUCTION_LOTS: AuctionLot[] = SEEDS.map((seed) => {
  const product = PRODUCTS[seed.slug];
  if (!product) {
    // Un slug qui ne répond plus est une erreur de données, pas un cas à masquer.
    throw new Error(`Enchères : produit introuvable dans product-details — ${seed.slug}`);
  }
  if (seed.condition === "occasion" && (seed.fillLevel === null || seed.fillLevel < 0 || seed.fillLevel > 100)) {
    // Une occasion sans niveau annoncé n'est pas vendable : erreur de données.
    throw new Error(`Enchères : niveau de jus manquant ou hors bornes pour l'occasion — ${seed.slug}`);
  }
  return {
    ...seed,
    name: product.name,
    brand: product.brand,
    volume: product.volume,
    shopPrice: product.price,
    startingBid: startingBidFor(product.price),
    hook: firstSentence(product.description),
  };
});

/** Libellé d'état : « Neuf » ou « Occasion · 70 % ». */
export function conditionLabel(lot: Pick<AuctionLot, "condition" | "fillLevel">): string {
  return lot.condition === "neuf" ? "Neuf" : `Occasion · ${lot.fillLevel ?? 0} %`;
}

/* ── Démonstration ──────────────────────────────────────────────────────── */

/**
 * DÉMONSTRATION — pseudonymes des enchérisseurs simulés. Aucune personne
 * réelle : des prénoms courants et une initiale, comme les anonymise une
 * vraie salle des ventes en ligne.
 */
export const DEMO_BIDDERS: string[] = [
  "Sarah B.",
  "A. K.",
  "Nadia R.",
  "Yanis M.",
  "L. Fontaine",
  "Karim D.",
  "Inès T.",
  "M. Haddad",
  "Camille O.",
  "R. Benali",
];

/**
 * Pays des enchérisseurs simulés — démonstration, comme les pseudonymes. Sur
 * la carte, les initiales et le drapeau du dernier enchérisseur rendent la
 * course lisible d'un coup d'œil ; le visiteur, lui, s'affiche « Vous ».
 */
export const DEMO_BIDDER_COUNTRY: Record<string, string> = {
  "Sarah B.": "🇫🇷",
  "A. K.": "🇧🇪",
  "Nadia R.": "🇫🇷",
  "Yanis M.": "🇨🇭",
  "L. Fontaine": "🇫🇷",
  "Karim D.": "🇲🇦",
  "Inès T.": "🇫🇷",
  "M. Haddad": "🇨🇦",
  "Camille O.": "🇫🇷",
  "R. Benali": "🇱🇺",
};

/** « Sarah B. » → « S.B. » ; « L. Fontaine » → « L.F. ». */
export function initialsOf(name: string): string {
  const letters = name
    .split(/\s+/)
    .map((p) => p.replace(/[^\p{L}]/gu, "").charAt(0).toUpperCase())
    .filter(Boolean);
  return letters.length ? letters.join(".") + "." : name;
}

/** Pseudonyme du visiteur dans l'historique quand il n'en a pas choisi. */
export const DEFAULT_VISITOR_NAME = "Vous";
