/**
 * ShippingCountry — pays de livraison pour le vérificateur « Livraison internationale ».
 *
 * Configuration ÉDITABLE : les délais (`deliveryDays`), la liste des pays et les
 * notes de livraison offerte (`freeShippingNote`) proviennent de CE fichier — ils ne
 * sont PAS inventés ni calculés ailleurs. Pour ajouter/retirer un pays ou ajuster un
 * délai, modifier directement le tableau `DEMO_SHIPPING_COUNTRIES` ci-dessous.
 *
 * `served: false` = pays non encore desservi (capture email, pas de refus sec).
 */
export type ShippingCountry = {
  /** Code ISO 3166-1 alpha-2 (ex. "FR"). Sert aussi à la détection auto. */
  code: string;
  /** Nom affiché (français par défaut). */
  name: string;
  /** Emoji drapeau. */
  flag: string;
  /** Délai de transport indicatif (texte libre, défini ici). */
  deliveryDays: string;
  /** Note optionnelle (ex. livraison offerte au-delà d'un montant). */
  freeShippingNote?: string;
  /** true = pays desservi. */
  served: boolean;
  /**
   * Frais de douane à prévoir. Optionnel : si absent, déduit automatiquement
   * via {@link customsFor} (UE = "none", reste du monde + DOM-TOM = "possible").
   * Renseigner ce champ uniquement pour forcer une exception (ex. Monaco, hors
   * UE mais en union douanière avec la France).
   */
  customs?: "none" | "possible";
  /**
   * Nombre de commandes déjà réalisées dans ce pays (preuve sociale).
   * Optionnel : si absent, la ligne « Déjà X commandes » n'est pas affichée.
   */
  orders?: number;
};

/**
 * Codes ISO 3166-1 alpha-2 des 27 États membres de l'UE.
 * La France (FR) = France métropolitaine → PAS de frais de douane.
 * Les DOM-TOM ont leurs PROPRES codes ISO (GP, MQ, RE, GF, YT, etc.) qui ne
 * figurent PAS ici → ils sont donc traités comme "possible", comme demandé.
 */
const EU_CODES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
]);

/**
 * Déduit s'il faut prévoir des frais de douane pour une destination.
 * Priorité au champ explicite `customs`, sinon : UE → "none", sinon "possible".
 */
export function customsFor(country: ShippingCountry): "none" | "possible" {
  if (country.customs) return country.customs;
  return EU_CODES.has(country.code.toUpperCase()) ? "none" : "possible";
}

/**
 * Données DÉMO — pays desservis (triés par volume de commandes décroissant)
 * + UN non desservi (Corée du Nord). Délais, notes et compteurs `orders` =
 * valeurs de config, modifiables ici. `customs` est déduit automatiquement
 * (cf. customsFor) sauf override explicite (Monaco).
 */
export const DEMO_SHIPPING_COUNTRIES: ShippingCountry[] = [
  {
    code: "FR",
    name: "France métropolitaine",
    flag: "🇫🇷",
    deliveryDays: "3 à 5 jours ouvrés",
    freeShippingNote: "Livraison offerte dès 60 €",
    served: true,
    orders: 3408,
  },
  {
    code: "BE",
    name: "Belgique",
    flag: "🇧🇪",
    deliveryDays: "4 à 6 jours ouvrés",
    freeShippingNote: "Livraison offerte dès 90 €",
    served: true,
    orders: 169,
  },
  {
    code: "DE",
    name: "Allemagne",
    flag: "🇩🇪",
    deliveryDays: "4 à 6 jours ouvrés",
    served: true,
    orders: 165,
  },
  {
    code: "GB",
    name: "Royaume-Uni",
    flag: "🇬🇧",
    deliveryDays: "5 à 8 jours ouvrés",
    served: true,
    orders: 162,
  },
  {
    code: "CH",
    name: "Suisse",
    flag: "🇨🇭",
    deliveryDays: "5 à 8 jours ouvrés",
    served: true,
    orders: 131,
  },
  {
    code: "US",
    name: "États-Unis",
    flag: "🇺🇸",
    deliveryDays: "7 à 12 jours ouvrés",
    served: true,
    orders: 90,
  },
  {
    code: "NL",
    name: "Pays-Bas",
    flag: "🇳🇱",
    deliveryDays: "4 à 6 jours ouvrés",
    served: true,
    orders: 71,
  },
  {
    code: "ES",
    name: "Espagne",
    flag: "🇪🇸",
    deliveryDays: "4 à 7 jours ouvrés",
    served: true,
    orders: 53,
  },
  {
    code: "RE",
    name: "Réunion",
    flag: "🇷🇪",
    deliveryDays: "6 à 10 jours ouvrés",
    served: true,
    orders: 51,
  },
  {
    code: "IT",
    name: "Italie",
    flag: "🇮🇹",
    deliveryDays: "4 à 7 jours ouvrés",
    served: true,
    orders: 45,
  },
  {
    code: "MQ",
    name: "Martinique",
    flag: "🇲🇶",
    deliveryDays: "6 à 10 jours ouvrés",
    served: true,
    orders: 37,
  },
  {
    code: "AE",
    name: "Émirats arabes unis",
    flag: "🇦🇪",
    deliveryDays: "5 à 9 jours ouvrés",
    served: true,
    orders: 30,
  },
  {
    code: "LT",
    name: "Lituanie",
    flag: "🇱🇹",
    deliveryDays: "5 à 8 jours ouvrés",
    served: true,
    orders: 26,
  },
  {
    code: "RO",
    name: "Roumanie",
    flag: "🇷🇴",
    deliveryDays: "5 à 8 jours ouvrés",
    served: true,
    orders: 24,
  },
  {
    code: "GP",
    name: "Guadeloupe",
    flag: "🇬🇵",
    deliveryDays: "6 à 10 jours ouvrés",
    served: true,
    orders: 23,
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    deliveryDays: "7 à 12 jours ouvrés",
    freeShippingNote: "Livraison offerte dès 150 €",
    served: true,
    orders: 23,
  },
  {
    code: "AU",
    name: "Australie",
    flag: "🇦🇺",
    deliveryDays: "8 à 14 jours ouvrés",
    served: true,
    orders: 22,
  },
  {
    code: "AT",
    name: "Autriche",
    flag: "🇦🇹",
    deliveryDays: "4 à 7 jours ouvrés",
    served: true,
    orders: 21,
  },
  {
    code: "PT",
    name: "Portugal",
    flag: "🇵🇹",
    deliveryDays: "5 à 8 jours ouvrés",
    served: true,
    orders: 17,
  },
  {
    code: "YT",
    name: "Mayotte",
    flag: "🇾🇹",
    deliveryDays: "7 à 12 jours ouvrés",
    served: true,
    orders: 16,
  },
  {
    code: "IE",
    name: "Irlande",
    flag: "🇮🇪",
    deliveryDays: "5 à 8 jours ouvrés",
    served: true,
    orders: 16,
  },
  {
    code: "PL",
    name: "Pologne",
    flag: "🇵🇱",
    deliveryDays: "5 à 8 jours ouvrés",
    served: true,
    orders: 11,
  },
  {
    code: "SE",
    name: "Suède",
    flag: "🇸🇪",
    deliveryDays: "5 à 8 jours ouvrés",
    served: true,
    orders: 10,
  },
  {
    code: "SK",
    name: "Slovaquie",
    flag: "🇸🇰",
    deliveryDays: "5 à 8 jours ouvrés",
    served: true,
    orders: 8,
  },
  {
    code: "RU",
    name: "Russie",
    flag: "🇷🇺",
    deliveryDays: "8 à 15 jours ouvrés",
    served: true,
    orders: 8,
  },
  {
    code: "GR",
    name: "Grèce",
    flag: "🇬🇷",
    deliveryDays: "5 à 8 jours ouvrés",
    served: true,
    orders: 8,
  },
  {
    code: "PF",
    name: "Polynésie française",
    flag: "🇵🇫",
    deliveryDays: "8 à 14 jours ouvrés",
    served: true,
    orders: 7,
  },
  {
    code: "MA",
    name: "Maroc",
    flag: "🇲🇦",
    deliveryDays: "6 à 11 jours ouvrés",
    served: true,
    orders: 7,
  },
  {
    code: "NO",
    name: "Norvège",
    flag: "🇳🇴",
    deliveryDays: "5 à 9 jours ouvrés",
    served: true,
    orders: 7,
  },
  {
    code: "MX",
    name: "Mexique",
    flag: "🇲🇽",
    deliveryDays: "9 à 15 jours ouvrés",
    served: true,
    orders: 7,
  },
  {
    code: "DK",
    name: "Danemark",
    flag: "🇩🇰",
    deliveryDays: "5 à 8 jours ouvrés",
    served: true,
    orders: 7,
  },
  {
    code: "NC",
    name: "Nouvelle-Calédonie",
    flag: "🇳🇨",
    deliveryDays: "8 à 14 jours ouvrés",
    served: true,
    orders: 6,
  },
  {
    code: "BG",
    name: "Bulgarie",
    flag: "🇧🇬",
    deliveryDays: "5 à 8 jours ouvrés",
    served: true,
    orders: 6,
  },
  {
    code: "LU",
    name: "Luxembourg",
    flag: "🇱🇺",
    deliveryDays: "4 à 6 jours ouvrés",
    served: true,
    orders: 6,
  },
  {
    code: "GF",
    name: "Guyane",
    flag: "🇬🇫",
    deliveryDays: "7 à 12 jours ouvrés",
    served: true,
    orders: 5,
  },
  {
    code: "QA",
    name: "Qatar",
    flag: "🇶🇦",
    deliveryDays: "5 à 9 jours ouvrés",
    served: true,
    orders: 5,
  },
  {
    code: "CZ",
    name: "Tchéquie",
    flag: "🇨🇿",
    deliveryDays: "5 à 8 jours ouvrés",
    served: true,
    orders: 5,
  },
  {
    code: "IN",
    name: "Inde",
    flag: "🇮🇳",
    deliveryDays: "8 à 14 jours ouvrés",
    served: true,
    orders: 5,
  },
  {
    code: "FI",
    name: "Finlande",
    flag: "🇫🇮",
    deliveryDays: "5 à 8 jours ouvrés",
    served: true,
    orders: 5,
  },
  {
    code: "SG",
    name: "Singapour",
    flag: "🇸🇬",
    deliveryDays: "7 à 12 jours ouvrés",
    served: true,
    orders: 4,
  },
  {
    code: "MT",
    name: "Malte",
    flag: "🇲🇹",
    deliveryDays: "6 à 9 jours ouvrés",
    served: true,
    orders: 4,
  },
  {
    code: "KW",
    name: "Koweït",
    flag: "🇰🇼",
    deliveryDays: "5 à 9 jours ouvrés",
    served: true,
    orders: 4,
  },
  {
    code: "AL",
    name: "Albanie",
    flag: "🇦🇱",
    deliveryDays: "6 à 10 jours ouvrés",
    served: true,
    orders: 4,
  },
  {
    code: "JP",
    name: "Japon",
    flag: "🇯🇵",
    deliveryDays: "8 à 14 jours ouvrés",
    served: true,
    orders: 3,
  },
  {
    code: "AM",
    name: "Arménie",
    flag: "🇦🇲",
    deliveryDays: "7 à 12 jours ouvrés",
    served: true,
    orders: 3,
  },
  {
    code: "HU",
    name: "Hongrie",
    flag: "🇭🇺",
    deliveryDays: "5 à 8 jours ouvrés",
    served: true,
    orders: 3,
  },
  {
    code: "MY",
    name: "Malaisie",
    flag: "🇲🇾",
    deliveryDays: "8 à 14 jours ouvrés",
    served: true,
    orders: 3,
  },
  {
    code: "SI",
    name: "Slovénie",
    flag: "🇸🇮",
    deliveryDays: "5 à 8 jours ouvrés",
    served: true,
    orders: 3,
  },
  {
    code: "ID",
    name: "Indonésie",
    flag: "🇮🇩",
    deliveryDays: "9 à 15 jours ouvrés",
    served: true,
    orders: 3,
  },
  {
    code: "TD",
    name: "Tchad",
    flag: "🇹🇩",
    deliveryDays: "9 à 16 jours ouvrés",
    served: true,
    orders: 3,
  },
  {
    code: "TH",
    name: "Thaïlande",
    flag: "🇹🇭",
    deliveryDays: "8 à 14 jours ouvrés",
    served: true,
    orders: 2,
  },
  {
    code: "CM",
    name: "Cameroun",
    flag: "🇨🇲",
    deliveryDays: "8 à 14 jours ouvrés",
    served: true,
    orders: 2,
  },
  {
    code: "PK",
    name: "Pakistan",
    flag: "🇵🇰",
    deliveryDays: "8 à 14 jours ouvrés",
    served: true,
    orders: 2,
  },
  {
    code: "ZA",
    name: "Afrique du Sud",
    flag: "🇿🇦",
    deliveryDays: "9 à 15 jours ouvrés",
    served: true,
    orders: 2,
  },
  {
    code: "CN",
    name: "Chine",
    flag: "🇨🇳",
    deliveryDays: "8 à 14 jours ouvrés",
    served: true,
    orders: 2,
  },
  {
    code: "LV",
    name: "Lettonie",
    flag: "🇱🇻",
    deliveryDays: "5 à 8 jours ouvrés",
    served: true,
    orders: 2,
  },
  {
    code: "CI",
    name: "Côte d'Ivoire",
    flag: "🇨🇮",
    deliveryDays: "8 à 14 jours ouvrés",
    served: true,
    orders: 1,
  },
  {
    code: "CL",
    name: "Chili",
    flag: "🇨🇱",
    deliveryDays: "10 à 16 jours ouvrés",
    served: true,
    orders: 1,
  },
  {
    code: "UA",
    name: "Ukraine",
    flag: "🇺🇦",
    deliveryDays: "7 à 12 jours ouvrés",
    served: true,
    orders: 1,
  },
  {
    code: "LK",
    name: "Sri Lanka",
    flag: "🇱🇰",
    deliveryDays: "9 à 15 jours ouvrés",
    served: true,
    orders: 1,
  },
  {
    code: "JO",
    name: "Jordanie",
    flag: "🇯🇴",
    deliveryDays: "6 à 10 jours ouvrés",
    served: true,
    orders: 1,
  },
  {
    code: "IS",
    name: "Islande",
    flag: "🇮🇸",
    deliveryDays: "6 à 10 jours ouvrés",
    served: true,
    orders: 1,
  },
  {
    code: "IQ",
    name: "Irak",
    flag: "🇮🇶",
    deliveryDays: "8 à 14 jours ouvrés",
    served: true,
    orders: 1,
  },
  {
    code: "BA",
    name: "Bosnie-Herzégovine",
    flag: "🇧🇦",
    deliveryDays: "6 à 10 jours ouvrés",
    served: true,
    orders: 1,
  },
  {
    code: "MC",
    name: "Monaco",
    flag: "🇲🇨",
    deliveryDays: "3 à 5 jours ouvrés",
    served: true,
    customs: "none",
    orders: 1,
  },
  {
    code: "HR",
    name: "Croatie",
    flag: "🇭🇷",
    deliveryDays: "5 à 8 jours ouvrés",
    served: true,
    orders: 1,
  },
  {
    code: "NZ",
    name: "Nouvelle-Zélande",
    flag: "🇳🇿",
    deliveryDays: "9 à 15 jours ouvrés",
    served: true,
    orders: 1,
  },
  {
    code: "CY",
    name: "Chypre",
    flag: "🇨🇾",
    deliveryDays: "6 à 9 jours ouvrés",
    served: true,
    orders: 1,
  },
  {
    code: "AZ",
    name: "Azerbaïdjan",
    flag: "🇦🇿",
    deliveryDays: "8 à 14 jours ouvrés",
    served: true,
    orders: 1,
  },
  {
    code: "ML",
    name: "Mali",
    flag: "🇲🇱",
    deliveryDays: "9 à 16 jours ouvrés",
    served: true,
    orders: 1,
  },
  {
    code: "SA",
    name: "Arabie Saoudite",
    flag: "🇸🇦",
    deliveryDays: "5 à 9 jours ouvrés",
    served: true,
    orders: 1,
  },
  {
    code: "DZ",
    name: "Algérie",
    flag: "🇩🇿",
    deliveryDays: "6 à 11 jours ouvrés",
    served: true,
    orders: 1,
  },
  {
    code: "TR",
    name: "Turquie",
    flag: "🇹🇷",
    deliveryDays: "6 à 10 jours ouvrés",
    served: true,
    orders: 1,
  },
  {
    code: "EE",
    name: "Estonie",
    flag: "🇪🇪",
    deliveryDays: "5 à 8 jours ouvrés",
    served: true,
    orders: 1,
  },
  {
    code: "EG",
    name: "Égypte",
    flag: "🇪🇬",
    deliveryDays: "7 à 12 jours ouvrés",
    served: true,
    orders: 1,
  },
  {
    code: "KZ",
    name: "Kazakhstan",
    flag: "🇰🇿",
    deliveryDays: "9 à 15 jours ouvrés",
    served: true,
    orders: 1,
  },
  {
    code: "ME",
    name: "Monténégro",
    flag: "🇲🇪",
    deliveryDays: "6 à 10 jours ouvrés",
    served: true,
    orders: 1,
  },
  {
    code: "KP",
    name: "Corée du Nord",
    flag: "🇰🇵",
    deliveryDays: "—",
    served: false,
  },
];
