// Favoris — localStorage + event global, sur le modèle de `cart.ts`. SSR-safe.
// Source de vérité : localStorage["dp_wishlist"], un tableau de slugs produit.
// Notif : window event "dp-wishlist-change" (même onglet) — l'événement natif
// `storage` ne se déclenche que dans les AUTRES onglets, le compteur de
// l'en-tête ne bougeait donc jamais sous le clic qui venait de l'alimenter.

const KEY = "dp_wishlist";
export const WISHLIST_EVENT = "dp-wishlist-change";

export function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function write(slugs: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(slugs));
  } catch {
    // stockage indisponible (navigation privée, quota) : on garde l'état en mémoire de page
  }
  window.dispatchEvent(new Event(WISHLIST_EVENT));
}

export function isWished(slug: string): boolean {
  return getWishlist().includes(slug);
}

/** Bascule et renvoie le nouvel état. */
export function toggleWish(slug: string): boolean {
  const list = getWishlist();
  if (list.includes(slug)) {
    write(list.filter((s) => s !== slug));
    return false;
  }
  write([...list, slug]);
  return true;
}
