"use client";

/**
 * `prefers-reduced-motion` lu comme une source externe.
 *
 * `useSyncExternalStore` plutôt qu'un `useState` + `useEffect` : la règle
 * `react-hooks/set-state-in-effect` du repo interdit le setState synchrone dans
 * un effet, et un initialiseur paresseux qui lirait `matchMedia` divergerait du
 * rendu serveur (qui, lui, ne sait rien de la préférence). L'instantané serveur
 * vaut donc `false` — l'animation part, puis s'arrête à l'hydratation si la
 * machine demande le calme.
 */
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => false;

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
