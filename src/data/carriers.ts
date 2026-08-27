/**
 * Transporteurs proposés à la commande — source unique.
 *
 * La liste vivait en dur dans `src/app/[locale]/livraison/page.tsx` sous la
 * forme d'un simple tableau de chaînes. L'estimateur de livraison de la fiche
 * produit a besoin, en plus du nom, du mode de remise et du délai : plutôt que
 * de recopier une seconde liste qui aurait dérivé à la première modification,
 * on la sort ici et les deux pages la lisent.
 *
 * `businessDays` = délai d'acheminement en **jours ouvrés**, compté à partir du
 * jour où le colis est remis au transporteur (pas du jour de la commande : la
 * préparation en amont est modélisée par l'estimateur lui-même).
 */
export type Carrier = {
  id: string;
  /** Nom seul — c'est ce que la page Livraison affiche dans ses pastilles. */
  name: string;
  /** Libellé complet pour un menu déroulant : le nom + le mode de remise. */
  label: string;
  businessDays: number;
};

export const CARRIERS: Carrier[] = [
  { id: "colissimo", name: "Colissimo", label: "Colissimo (à domicile)", businessDays: 2 },
  { id: "mondial-relay", name: "Mondial Relay", label: "Mondial Relay (point relais)", businessDays: 3 },
  { id: "chronopost", name: "Chronopost", label: "Chronopost (express)", businessDays: 1 },
  { id: "dhl-express", name: "DHL Express", label: "DHL Express (international)", businessDays: 3 },
];

/**
 * Seuil de livraison offerte, en euros. C'est le chiffre annoncé au client
 * partout ailleurs sur le site (`messages/*.json` → `free_shipping_from`,
 * page d'accueil, FAQ, page Livraison) : il ne doit exister qu'à un endroit
 * dans le code qui le calcule.
 */
export const FREE_SHIPPING_THRESHOLD_EUR = 60;
