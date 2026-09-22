"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { isWished, toggleWish, WISHLIST_EVENT } from "@/lib/wishlist";

/**
 * Abonnement au stockage des favoris. `useSyncExternalStore` plutôt qu'un
 * `setState` dans un effet : l'ESLint du projet refuse ce dernier, et le
 * store externe est exactement ce qu'est le localStorage. Snapshot serveur :
 * `false` — au rendu SSR, le cœur est vide.
 */
function subscribeWishlist(onChange: () => void) {
  window.addEventListener(WISHLIST_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(WISHLIST_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Favoris + Partager, en tête de la colonne d'achat.
 *
 * Avant : deux boutons sans aucun handler, posés SOUS six blocs (prix, panier,
 * livraison, vidéos, stories) — à 1 400 px du haut, personne ne les voyait, et
 * cliquer ne faisait rien. Ils remontent à côté du nom, là où l'œil arrive en
 * premier, et ils agissent : le cœur écrit dans la liste de favoris que
 * l'en-tête compte déjà, le partage ouvre la feuille native du téléphone (ou
 * copie le lien sur ordinateur).
 *
 * Icônes seules, sans libellé : à cette hauteur, deux mots de plus feraient
 * concurrence au titre. L'`aria-label` porte le sens.
 */
export default function ProductActions({
  slug,
  productName,
  brand,
}: {
  slug: string;
  productName: string;
  brand: string;
}) {
  const wished = useSyncExternalStore(
    subscribeWishlist,
    () => isWished(slug),
    () => false,
  );
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const onWish = () => {
    const now = toggleWish(slug); // émet l'événement → le store se resynchronise
    setToast(now ? "Ajouté aux favoris" : "Retiré des favoris");
  };

  const onShare = async () => {
    const url = window.location.href;
    const title = `${productName} — ${brand}`;
    // Feuille de partage native quand elle existe (mobile, Safari) ; sinon le
    // lien va dans le presse-papiers. Une annulation de la feuille n'est pas
    // une erreur : on n'affiche rien.
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast("Lien copié");
    } catch {
      setToast("Copie impossible");
    }
  };

  const btn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    padding: 0,
    background: "var(--surface-white)",
    border: "1px solid var(--line-200)",
    borderRadius: "var(--r-pill)",
    color: "var(--ink-500)",
    cursor: "pointer",
    transition: "border-color var(--dur-fast), color var(--dur-fast), background var(--dur-fast)",
  };

  return (
    <div style={{ position: "relative", display: "flex", gap: "0.5rem", flexShrink: 0 }}>
      <button
        type="button"
        onClick={onWish}
        aria-pressed={wished}
        aria-label={wished ? "Retirer des favoris" : "Ajouter aux favoris"}
        title={wished ? "Retirer des favoris" : "Ajouter aux favoris"}
        style={{
          ...btn,
          ...(wished
            ? { color: "var(--gold-700)", borderColor: "var(--gold-300)", background: "var(--gold-100)" }
            : {}),
        }}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill={wished ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      <button type="button" onClick={onShare} aria-label="Partager ce parfum" title="Partager" style={btn}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>

      {toast && (
        <span
          role="status"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            padding: "0.3rem 0.6rem",
            borderRadius: "var(--r-sm)",
            background: "var(--espresso-900)",
            color: "var(--gold-100)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--t-xs)",
            whiteSpace: "nowrap",
            boxShadow: "var(--shadow-sm)",
            zIndex: 2,
          }}
        >
          {toast}
        </span>
      )}
    </div>
  );
}
