"use client";

/**
 * Enveloppe cliente de `OlfactiveTwin` pour la page d'un jumeau partagé.
 *
 * Elle n'existe que parce que `page.tsx` est un composant serveur (il lui faut
 * le moteur pour `generateMetadata`) et que `OlfactiveTwin` est client : ce
 * fichier est la frontière, rien de plus.
 */

import { OlfactiveTwin } from "@/components/sections/OlfactiveTwin";
import type { OlfactiveMatch } from "@/data/olfactive-twins";

export function JumeauSection({
  matches,
  locale,
  referenceId,
}: {
  matches: OlfactiveMatch[];
  locale: string;
  referenceId: string;
}) {
  return <OlfactiveTwin matches={matches} locale={locale} initialReferenceId={referenceId} />;
}
