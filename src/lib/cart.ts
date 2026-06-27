// Panier léger — localStorage + event global. SSR-safe.
// Source de vérité : localStorage["dp_cart"]. Notif : window event "dp-cart-change".

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  qty: number;
}

const KEY = "dp_cart";
const EVENT = "dp-cart-change";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export function cartCount(): number {
  return getCart().reduce((n, i) => n + i.qty, 0);
}

export function cartTotal(): number {
  return getCart().reduce((s, i) => s + i.price * i.qty, 0);
}

export function addItem(item: Omit<CartItem, "qty">, qty = 1) {
  const items = getCart();
  const found = items.find((i) => i.id === item.id);
  if (found) found.qty += qty;
  else items.push({ ...item, qty });
  write(items);
}

export function removeItem(id: string) {
  write(getCart().filter((i) => i.id !== id));
}

export function setQty(id: string, qty: number) {
  const items = getCart();
  const found = items.find((i) => i.id === id);
  if (!found) return;
  if (qty <= 0) write(items.filter((i) => i.id !== id));
  else {
    found.qty = qty;
    write(items);
  }
}

// S'abonne aux changements (event local + storage cross-onglet). Renvoie unsubscribe.
export function subscribe(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onChange = () => cb();
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
