/**
 * Signal de stock — HONNÊTE.
 *
 * Une seule information, déclarée : le stock du format de référence
 * (`ProductContent.stock`). Rien d'autre : pas de « 12 personnes regardent »,
 * pas de « 3 vendus aujourd'hui », pas de compte à rebours. Ces artifices font
 * vendre une fois et coûtent la confiance ensuite ; un vrai chiffre de stock,
 * lui, est vérifiable — et il est en général plus persuasif.
 *
 * Seuil : au-delà de `SHOW_BELOW`, on ne dit rien. « Plus que 7 » informe le
 * client qui hésite ; « 340 en stock » ne lui apprend rien. Sous `URGENT_AT`,
 * la couleur passe en danger et on annonce le réassort : le client sait qu'il
 * peut attendre s'il préfère, c'est une information, pas une pression.
 */

import { NBSP } from "./product-content-format";

/** Au-dessus de ce stock, le signal ne s'affiche pas. */
const SHOW_BELOW = 10;
/** À ce stock ou en dessous, ton « danger » + délai de réassort. */
const URGENT_AT = 3;
/** Délai de réassort annoncé — promesse boutique, pas donnée produit. */
const RESTOCK_DAYS = 10;

export default function StockSignal({ stock }: { stock?: number }) {
  if (stock === undefined || stock > SHOW_BELOW || stock < 0) return null;

  const urgent = stock <= URGENT_AT;
  const color = urgent ? "var(--danger)" : "var(--gold-700)";
  // Halo à 18 % d'opacité de la même teinte : même pastille, deux tons.
  const halo = urgent ? "rgba(179, 64, 47, 0.18)" : "rgba(156, 106, 26, 0.18)";

  // Accord : « 1 flacon », « 3 flacons ». À zéro on l'écrit aussi (« plus que
  // 0 flacon » serait absurde) : on annonce la rupture et le réassort.
  const flacons = `flacon${stock > 1 ? "s" : ""}`;
  const text =
    stock === 0
      ? `Rupture temporaire — réassort sous ${RESTOCK_DAYS}${NBSP}jours`
      : urgent
        ? `Plus que ${stock}${NBSP}${flacons} — réassort sous ${RESTOCK_DAYS}${NBSP}jours`
        : `Plus que ${stock} en stock`;

  return (
    <p
      role="status"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        margin: 0,
        fontFamily: "var(--font-sans)",
        fontSize: "var(--t-xs)",
        fontWeight: 500,
        letterSpacing: "0.02em",
        color,
      }}
    >
      <span
        aria-hidden
        style={{
          flex: "none",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 0 4px ${halo}`,
        }}
      />
      {text}
    </p>
  );
}
