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
};

/**
 * Données DÉMO — 6 pays dont UN non desservi (Corée du Nord).
 * Délais et notes = valeurs de config, modifiables ici.
 */
export const DEMO_SHIPPING_COUNTRIES: ShippingCountry[] = [
  {
    code: "FR",
    name: "France",
    flag: "🇫🇷",
    deliveryDays: "3 à 5 jours ouvrés",
    freeShippingNote: "Livraison offerte dès 60 €",
    served: true,
  },
  {
    code: "BE",
    name: "Belgique",
    flag: "🇧🇪",
    deliveryDays: "4 à 6 jours ouvrés",
    freeShippingNote: "Livraison offerte dès 90 €",
    served: true,
  },
  {
    code: "CH",
    name: "Suisse",
    flag: "🇨🇭",
    deliveryDays: "5 à 8 jours ouvrés",
    served: true,
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    deliveryDays: "7 à 12 jours ouvrés",
    freeShippingNote: "Livraison offerte dès 150 €",
    served: true,
  },
  {
    code: "AE",
    name: "Émirats arabes unis",
    flag: "🇦🇪",
    deliveryDays: "5 à 9 jours ouvrés",
    served: true,
  },
  {
    code: "KP",
    name: "Corée du Nord",
    flag: "🇰🇵",
    deliveryDays: "—",
    served: false,
  },
];
