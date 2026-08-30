/**
 * Grille tarifaire des coffrets d'échantillons.
 *
 * ⚠️ CE FICHIER N'EST PAS ENCORE BRANCHÉ. Le travail a été interrompu en cours ;
 * `SampleSelector.tsx` fonctionne toujours avec sa prop `coffretPrice` unique.
 * Rien ne l'importe, donc rien ne casse — mais rien n'en profite non plus.
 *
 * Le sélecteur sait composer un coffret de plusieurs flacons mais ne connaît
 * qu'UN prix : le même montant part au panier qu'on ait pris trois échantillons
 * ou trente. Tant que rien n'affiche de prix, personne ne le voit ; dès qu'on
 * propose au visiteur de monter de gamme, il faut pouvoir lui dire ce que ça
 * coûte — d'où cette grille.
 *
 * ─── Ce sont les TARIFS RÉELS de la boutique, pas des valeurs de démonstration.
 * Donnés par l'utilisateur le 30/08/26. Ne pas les « arrondir » ni les
 * recalculer : ils engagent la marge.
 *
 *    3  →  10,50 €   soit 3,50 € le flacon
 *    8  →  26,50 €   soit 3,31 € le flacon
 *   30  →  75,00 €   soit 2,50 € le flacon
 *
 * ─── Faiblesse commerciale connue, signalée et ASSUMÉE
 * Le palier de 8 ne fait économiser que 5 % par flacon face à celui de 3, quand
 * celui de 30 en fait économiser 29 %. Le milieu de gamme n'a donc presque rien
 * à offrir, et la marche vers 30 est un gouffre. C'est un choix de l'utilisateur,
 * pas un oubli : ne pas le « corriger » sans son accord.
 */

/**
 * Prix TTC du coffret, par nombre d'échantillons.
 *
 * Les clés font aussi office de paliers : `N_OPTIONS` dans `SampleSelector.tsx`
 * doit devenir `[3, 8, 30]` pour s'y aligner. Trois choix et pas cinq — au-delà,
 * le visiteur arbitre au lieu d'acheter.
 */
export const SAMPLE_TIER_PRICES: Readonly<Record<number, number>> = {
  3: 10.5,
  8: 26.5,
  30: 75,
};

/** Les paliers, du plus petit au plus grand. Source unique de `N_OPTIONS`. */
export const SAMPLE_TIERS: readonly number[] = Object.keys(SAMPLE_TIER_PRICES)
  .map(Number)
  .sort((a, b) => a - b);

/**
 * Remise de montée de gamme. Consentie UNE fois par visiteur, au moment précis
 * où son coffret déborde : c'est le seul instant où l'argument est vrai plutôt
 * que promotionnel.
 */
export const UPSELL_DISCOUNT_RATE = 0.05;

/** Le palier au-dessus, ou `null` quand on est déjà au plus haut. */
export function nextTier(current: number): number | null {
  return SAMPLE_TIERS.find((t) => t > current) ?? null;
}
