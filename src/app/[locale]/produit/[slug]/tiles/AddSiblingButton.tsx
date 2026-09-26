"use client";

import { useEffect, useState } from "react";

import { addItem } from "@/lib/cart";
import { formatPrice, parseVolumeMl } from "@/lib/product-variants";
import type { Product } from "@/data/product-details";

import { FALLBACK_IMAGE, GOLD_GRADIENT, MiniToast } from "../AddToCart";

/**
 * Ajout au panier de la déclinaison, depuis la tuile « La ligne ».
 *
 * Seul morceau client de `LineTile` : le reste de la tuile est rendu par le
 * serveur. Sans ce bouton, découvrir Khamrah Qahwa demandait d'ouvrir sa fiche,
 * de la lire et de revenir — trois écrans pour un flacon qu'on avait déjà
 * choisi.
 *
 * L'identifiant du panier suit la même règle que le flacon principal
 * (`slug-volumeMl`) : la même déclinaison ajoutée depuis sa propre fiche
 * retombe sur la même ligne de panier au lieu d'en créer une seconde.
 */
export function AddSiblingButton({
  slug,
  product,
  compact = false,
}: {
  slug: string;
  product: Product;
  /** Variante réduite : un rond « + » à droite d'une ligne de liste. */
  compact?: boolean;
}) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 2000);
    return () => window.clearTimeout(t);
  }, [added]);

  const add = () => {
    addItem(
      {
        id: `${slug}-${parseVolumeMl(product.volume)}`,
        name: `${product.name} ${product.volume}`,
        brand: product.brand,
        price: product.price,
        image: product.packshot ?? product.image ?? FALLBACK_IMAGE,
      },
      1,
    );
    setAdded(true);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={add}
        aria-label={`Ajouter ${product.name} au panier`}
        title={`Ajouter ${product.name} au panier`}
        style={{
          flex: "0 0 auto",
          width: 34,
          height: 34,
          borderRadius: "var(--r-pill)",
          border: "1px solid var(--gold-300)",
          background: added ? "var(--gold-500)" : "var(--gold-100)",
          color: added ? "var(--surface-white)" : "var(--gold-700)",
          fontSize: "1.1rem",
          lineHeight: 1,
          cursor: "pointer",
          transition: "background var(--dur-fast), color var(--dur-fast)",
        }}
      >
        {added ? "✓" : "+"}
      </button>
    );
  }

  return (
    <span style={{ position: "relative", flex: 1, display: "flex" }}>
      <button
        type="button"
        onClick={add}
        aria-label={`Ajouter ${product.name} au panier`}
        style={{
          flex: 1,
          height: 44,
          borderRadius: "var(--r-sm)",
          border: "none",
          background: added ? "var(--gold-700)" : GOLD_GRADIENT,
          color: "var(--espresso-900)",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--t-xs)",
          fontWeight: "var(--fw-semibold)",
          letterSpacing: "var(--ls-wide)",
          textTransform: "uppercase",
          cursor: "pointer",
          boxShadow: "var(--shadow-gold)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          padding: "0 0.75rem",
        }}
      >
        {added ? "✓ Ajouté !" : `Ajouter · ${formatPrice(product.price)} €`}
      </button>
      {added && <MiniToast text="Ajouté au panier" above />}
    </span>
  );
}
