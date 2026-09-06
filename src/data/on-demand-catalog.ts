/**
 * Commande à la demande — périmètre et paramètres du service.
 *
 * Le principe métier : la boutique tient environ 450 références en rayon, mais
 * ses relais dans le Golfe lui permettent de faire venir N'IMPORTE QUEL parfum
 * des maisons partenaires listées ici, sous deux à trois semaines. Ce fichier
 * décrit ce périmètre (les maisons), le vocabulaire du formulaire (contenances)
 * et les délais annoncés — rien d'autre.
 *
 * ⚠️ AUCUNE FICHE PARFUM N'EST RECOPIÉE ICI.
 * `reference-perfumes.ts` reste l'unique source de vérité pour les parfums :
 * l'autocomplétion de la page le charge en `import()` dynamique et le filtre
 * sur les maisons de ce fichier. Un nom corrigé ou une entrée retirée là-bas se
 * répercute donc sans qu'aucune ligne d'ici n'ait à bouger. C'est aussi pour ça
 * que l'import du type est un `import type` : à la compilation il disparaît et
 * le fichier de 792 Ko n'entre pas dans le bundle qui contient ce module.
 *
 * `BRANDS` en revanche est importé pour de vrai : onze entrées, quelques
 * kilo-octets, et c'est la seule façon de ne pas dupliquer pays et logos des
 * maisons que la page « Marques » présente déjà.
 *
 * Cadre légal : maisons citées NOMINATIVEMENT, texte seul. Il s'agit de
 * commander des flacons authentiques de ces maisons, pas de proposer autre
 * chose à leur place — le vocabulaire « clone / copie / dupe / équivalent »
 * n'a pas sa place sur cette page.
 */

import { BRANDS } from "@/data/brands";
import type { ReferencePerfume } from "@/data/reference-perfumes";

// ─── Délais annoncés ─────────────────────────────────────────────────────────
// Écrits une seule fois : l'en-tête, les étapes, le récapitulatif et la FAQ
// les affichent tous — deux chiffres différents sur la même page, c'est la
// première chose qu'un client remarque.

/** Délai de livraison annoncé pour une commande spéciale. */
export const LEAD_TIME = "2 à 3 semaines";

/** Délai dans lequel la boutique confirme prix et disponibilité. */
export const QUOTE_DELAY = "48 h";

// ─── Maisons partenaires ─────────────────────────────────────────────────────

export type PartnerHouse = {
  /** Écrit EXACTEMENT comme le champ `house` de `reference-perfumes.ts` :
   *  la comparaison se fait sur la chaîne, une coquille ferait disparaître
   *  toute une maison de l'autocomplétion. */
  name: string;
  /** Pays d'origine — omis quand nous n'en sommes pas sûrs, jamais deviné. */
  country?: string;
  countryFlag?: string;
  /** Logo dans `public/brands/` quand la boutique l'a obtenu en qualité
   *  suffisante ; sinon la page affiche le monogramme, comme « Marques ». */
  logo?: string;
};

const UAE = { country: "Émirats arabes unis", countryFlag: "🇦🇪" } as const;
const KSA = { country: "Arabie saoudite", countryFlag: "🇸🇦" } as const;

/**
 * Maisons du Golfe qui ne figurent pas dans `brands.ts` (pas de carte sur la
 * page « Marques ») mais que la boutique fait venir sur demande.
 *
 * Amouage est omanaise, Arabian Oud et Oud Elite saoudiennes, les autres
 * émiraties. Amouroud, Fragrance du Bois et Hind Al Oud sont gardées sans
 * pays : elles étaient déjà commandables et ont des entrées dans la base,
 * mais leur origine n'est pas assez nette pour l'écrire.
 */
const EXTRA_HOUSES: PartnerHouse[] = [
  // ── Maisons du Golfe distribuées en Arabie saoudite et aux Émirats, ajoutées
  //    le 07/09/26. Pays seulement quand la maison l'affiche elle-même ; sans
  //    logo en banque, la puce retombe sur le monogramme. Aucune d'elles n'a de
  //    références dans la base : la demande se fait en saisie libre.
  { name: "Abdul Samad Al Qurashi", ...KSA, logo: "/brands/abdulsamadalqurashi.jpg" },
  { name: "Ibraheem Al Qurashi", ...KSA, logo: "/brands/ibraheemalqurashi.jpg" },
  { name: "Al Majed Oud", ...KSA, logo: "/brands/almajedoud.jpg" },
  { name: "Al Rehab", ...KSA, logo: "/brands/alrehab.jpg" },
  { name: "Banafa for Oud", ...KSA, logo: "/brands/banafaforoud.jpg" },
  { name: "Sultan Al Oud", ...KSA },
  { name: "Anfasic Dokhoon", ...KSA, logo: "/brands/anfasicdokhoon.jpg" },
  { name: "Ajyad", ...KSA },
  { name: "Hamidi", ...UAE, logo: "/brands/hamidi.jpg" },
  { name: "Osma Perfumes", ...UAE, logo: "/brands/osmaperfumes.jpg" },
  { name: "Ne'emah", ...UAE },
  { name: "Emir", ...UAE },
  { name: "Khaleej Scent" },
  { name: "Al Wataniah", ...UAE, logo: "/brands/alwataniah.jpg" },
  { name: "Anfar", ...UAE, logo: "/brands/anfar.jpg" },
  { name: "Bait Al Bakhoor", ...UAE },
  { name: "Emper", ...UAE, logo: "/brands/emper.jpg" },
  { name: "Hemani", ...UAE, logo: "/brands/hemani.jpg" },
  { name: "Junaid Perfumes", ...UAE, logo: "/brands/junaidperfumes.jpg" },
  { name: "Khalis", ...UAE, logo: "/brands/khalis.jpg" },
  { name: "Naseem", ...UAE, logo: "/brands/naseem.jpg" },
  { name: "Nusuk", ...UAE },
  { name: "Otoori", ...UAE },
  { name: "Rayhaan", ...UAE, logo: "/brands/rayhaan.jpg" },
  { name: "Rue Broca", ...UAE },
  { name: "Al Fares", ...UAE },
  { name: "Ard Al Khaleej", ...UAE },
  { name: "Yas Perfumes", ...UAE, logo: "/brands/yasperfumes.jpg" },
  { name: "Amir Oud", ...UAE, logo: "/brands/amiroud.jpg" },
  { name: "Areej Le Doré", ...UAE },
  { name: "Nejma" },
  { name: "Al Nuaim", logo: "/brands/alnuaim.jpg" },
  { name: "Asghar Ali", country: "Bahreïn", countryFlag: "🇧🇭", logo: "/brands/asgharali.jpg" },
  { name: "Al Jazeera Perfumes", country: "Qatar", countryFlag: "🇶🇦" },
  { name: "Gissah", country: "Koweït", countryFlag: "🇰🇼", logo: "/brands/gissah.jpg" },

  { name: "Afnan", ...UAE, logo: "/brands/afnan.jpg" },
  { name: "Ajmal", ...UAE, logo: "/brands/ajmal.jpg" },
  { name: "Amouage", country: "Oman", countryFlag: "🇴🇲", logo: "/brands/amouage.jpg" },
  { name: "Amouroud", logo: "/brands/amouroud.jpg" },
  { name: "Arabian Oud", ...KSA, logo: "/brands/arabianoud.jpg" },
  // Distincte d'« Arabiyat Prestige » (dans `brands.ts`) : la base porte les
  // deux, la maison mère et la ligne, avec des entrées différentes.
  { name: "Arabiyat", ...UAE, logo: "/brands/arabiyat.jpg" },
  { name: "Ard Al Zaafaran", ...UAE, logo: "/brands/ardalzaafaran.jpg" },
  { name: "Asdaaf", ...UAE },
  { name: "Attar Collection", ...UAE },
  { name: "Blend Oud", ...UAE, logo: "/brands/blendoud.jpg" },
  { name: "Fragrance du Bois", logo: "/brands/fragrancedubois.jpg" },
  { name: "Fragrance World", ...UAE },
  { name: "French Avenue", ...UAE, logo: "/brands/frenchavenue.jpg" },
  { name: "Hind Al Oud", logo: "/brands/hindaloud.jpg" },
  { name: "Kajal", ...UAE, logo: "/brands/kajal.jpg" },
  { name: "Maison Alhambra", ...UAE, logo: "/brands/alhambra.jpg" },
  { name: "Maison Asrar", ...UAE, logo: "/brands/asrar.jpg" },
  { name: "My Perfumes", ...UAE, logo: "/brands/myperfumes.jpg" },
  { name: "Nabeel", ...UAE },
  { name: "Oud Elite", ...KSA, logo: "/brands/oudelite.jpg" },
  { name: "Rasasi", ...UAE, logo: "/brands/rasasi.jpg" },
  { name: "Risala", ...UAE, logo: "/brands/risala.jpg" },
  { name: "The Spirit of Dubai", ...UAE },
  { name: "Zimaya", ...UAE, logo: "/brands/zimaya.jpg" },
];

/**
 * Toutes les maisons partenaires, triées par nom : celles de `brands.ts`
 * d'abord (elles portent pays et logo depuis la page « Marques »), puis les
 * maisons supplémentaires ci-dessus. Le tri final fait oublier l'origine.
 *
 * Plusieurs maisons de cette liste n'ont AUCUNE entrée dans
 * `reference-perfumes.ts` (Fragrance World, Surrati, My Perfumes…) : c'est
 * voulu. La commande à la demande couvre tout le catalogue de la maison, pas
 * seulement ce que la base connaît — pour ces maisons-là le visiteur tape le
 * nom du parfum en saisie libre, et la boutique fait le reste.
 */
export const PARTNER_HOUSES: readonly PartnerHouse[] = [
  ...BRANDS.map((b) => ({ name: b.name, country: b.country, countryFlag: b.countryFlag, logo: b.logo })),
  ...EXTRA_HOUSES,
].sort((a, b) => a.name.localeCompare(b.name, "fr"));

/** Noms seuls — le filtre de l'autocomplétion compare sur cette liste. */
export const ON_DEMAND_HOUSES: readonly string[] = PARTNER_HOUSES.map((h) => h.name);

/** Index O(1) — évite un `includes()` sur un tableau pour chaque entrée. */
const HOUSE_SET = new Set(ON_DEMAND_HOUSES);

/** La maison, ou undefined si elle n'est pas partenaire. */
export function partnerHouse(name: string): PartnerHouse | undefined {
  return PARTNER_HOUSES.find((h) => h.name === name);
}

/**
 * Applique le périmètre à la base complète, passée en argument.
 *
 * L'appelant fournit lui-même le tableau (obtenu par `import()` dynamique) :
 * ce module n'importe donc jamais les 792 Ko de données, il ne fait que les
 * trier. Le seul critère est la maison — une maison retenue est reprise EN
 * ENTIER, parce qu'un client venu pour un flacon précis doit le trouver.
 */
export function selectOnDemand(all: readonly ReferencePerfume[]): ReferencePerfume[] {
  return all.filter((p) => HOUSE_SET.has(p.house));
}

// ─── Contenances ─────────────────────────────────────────────────────────────

export type SizeValue = "30" | "50" | "100" | "any";

/**
 * Les trois contenances courantes des maisons du Golfe, plus « peu importe » :
 * beaucoup de références n'existent qu'en 100 ml, imposer un choix ferait
 * échouer la demande pour une raison que le client ne peut pas connaître.
 */
export const SIZE_OPTIONS: readonly { value: SizeValue; label: string }[] = [
  { value: "any", label: "Peu importe" },
  { value: "30", label: "30 ml" },
  { value: "50", label: "50 ml" },
  { value: "100", label: "100 ml" },
];

export function sizeLabel(value: SizeValue): string {
  return SIZE_OPTIONS.find((s) => s.value === value)?.label ?? "Peu importe";
}

// ─── Demandes fréquentes ─────────────────────────────────────────────────────

/**
 * Identifiants (champ `id` de `reference-perfumes.ts`) des parfums le plus
 * souvent demandés au comptoir. Sélection éditoriale tenue à la main : en
 * production, elle sera remplacée par les statistiques réelles des demandes.
 * Un identifiant qui ne résout plus (entrée renommée) est ignoré à l'affichage
 * plutôt que de casser la rangée.
 */
export const FREQUENT_REQUEST_IDS: readonly string[] = [
  "lattafa-khamrah",
  "lattafa-yara",
  "lattafa-asad",
  "armaf-club-de-nuit-intense-man",
  "rasasi-hawas",
  "afnan-9pm",
  "haramain-amber-oud",
  "alhambra-jean-lowe-immortel",
];
