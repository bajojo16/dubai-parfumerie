import type { Metadata } from "next";
import { Suspense } from "react";
import { AuctionsPage } from "@/components/auctions/AuctionsPage";

/**
 * `/encheres` — la salle des enchères (maquette côté client).
 *
 * Composant serveur réduit aux métadonnées : tout l'état vit dans le
 * navigateur (localStorage `dp_encheres_v1`), il n'y a rien à rendre côté
 * serveur au-delà de la coquille. Voir `src/components/auctions/`.
 *
 * `Suspense` : la salle lit `useSearchParams` (le lot ouvert vit dans l'URL) ;
 * sans limite de suspension, le prérendu statique refuserait de construire.
 */
export const metadata: Metadata = {
  title: "Les enchères",
  description:
    "Chaque semaine, des flacons authentiques à emporter au prix que vous décidez. Mise à prix à 40 % du prix boutique, enchère max, prolongation anti-sniping.",
};

export default function EncheresPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh", background: "var(--surface-page)" }} />}>
      <AuctionsPage />
    </Suspense>
  );
}
