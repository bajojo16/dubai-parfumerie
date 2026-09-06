/**
 * Sélection « Commande à la demande » — le périmètre des maisons du Golfe que la
 * boutique ne tient pas en stock mais fait venir sur demande.
 *
 * ⚠️ AUCUNE DONNÉE N'EST RECOPIÉE ICI.
 * `reference-perfumes.ts` reste l'unique source de vérité : ce fichier ne
 * contient que des *clés* — rien que des noms de maisons — et la fonction qui
 * applique le filtre. Un nom de parfum corrigé, un accord ajusté ou une entrée
 * retirée de la base se répercute donc automatiquement, sans qu'aucune ligne
 * d'ici n'ait à être touchée. C'est aussi pour ça que l'import du type est un
 * `import type` : à la compilation il disparaît, et le fichier de 792 Ko
 * n'entre pas dans le bundle qui contient ce module.
 *
 * Cadre légal : maisons citées NOMINATIVEMENT, texte seul. Il s'agit de
 * commander des flacons authentiques de ces maisons, pas de proposer autre
 * chose à leur place — le vocabulaire « clone / copie / dupe / équivalent »
 * n'a pas sa place sur cette page.
 */

import type { ReferencePerfume } from "@/data/reference-perfumes";

/**
 * Les maisons émiraties et du Golfe présentes dans la base de référence.
 * Écrites EXACTEMENT comme dans `reference-perfumes.ts` : la comparaison se
 * fait sur la chaîne, une coquille ferait disparaître toute une maison.
 *
 * Amouage est omanaise, Arabian Oud et Hind Al Oud saoudiennes, Ahmed Al
 * Maghribi marocaine d'origine mais installée à Dubaï, les autres émiraties.
 * Pas de décompte en toutes lettres ici : la liste bouge à chaque maison
 * ajoutée et le chiffre écrit à la main finissait par mentir.
 * Les maisons européennes ou américaines de la base (Xerjoff, Creed,
 * Dior…) sont volontairement hors périmètre : la commande à la demande porte
 * sur le sourcing au Golfe, c'est là que la boutique a ses relais.
 */
export const ON_DEMAND_HOUSES: readonly string[] = [
  "Afnan",
  // Ahmed Al Maghribi, Arabiyat Prestige, Khadlaj et Reef (marquées plus bas)
  // se vendaient déjà en boutique — `brands.ts`, pages produit, page de maison
  // pour Reef — sans avoir une seule entrée dans la base. Leur section de
  // `reference-perfumes.ts` a donc été créée en même temps qu'elles étaient
  // ajoutées ici : une maison sans entrée donne un filtre vide.
  "Ahmed Al Maghribi",
  "Ajmal",
  "Al Haramain",
  "Amouage",
  "Amouroud",
  "Arabian Oud",
  "Arabiyat",
  // ↑ et distincte d'« Arabiyat » : les entrées « Prestige … » de la base
  // portent la maison mère, la boutique vend aussi sous le nom de la ligne.
  "Arabiyat Prestige",
  "Ard Al Zaafaran",
  "Armaf",
  "Asdaaf",
  "Attar Collection",
  "Blend Oud",
  "Fragrance du Bois",
  "Hind Al Oud",
  "Kajal",
  "Khadlaj", // ↑
  "Lattafa",
  "Maison Alhambra",
  "Nabeel",
  // Ajoutée avec l'arrivée de Rifaaqat, sa première référence dans la base :
  // la maison figurait déjà dans `brands.ts` et sur la page « Marques », mais
  // pas ici, donc pas une seule de ses références n'était commandable.
  "Paris Corner",
  "Rasasi",
  "Reef", // ↑
  "Risala",
  "Swiss Arabian",
  "The Spirit of Dubai",
  "Zimaya",
];

/** Index O(1) — évite un `includes()` sur un tableau pour chaque entrée. */
const HOUSE_SET = new Set(ON_DEMAND_HOUSES);

/**
 * Applique la sélection à la base complète, passée en argument.
 *
 * L'appelant fournit lui-même le tableau (obtenu par `import()` dynamique) :
 * ce module n'importe donc jamais les 792 Ko de données, il ne fait que les
 * trier. Le seul critère est la maison — une maison retenue est reprise EN
 * ENTIER. Une liste de références « mises en avant » a existé ici pour brider
 * les gros catalogues (Lattafa pèse à elle seule 213 entrées) ; elle a été
 * retirée parce qu'elle privait le visiteur de références réellement
 * commandables, et qu'un client venu pour un flacon précis ne le trouvait pas.
 * Le tri et la recherche de la page font ce travail bien mieux qu'une liste
 * figée entretenue à la main.
 */
export function selectOnDemand(all: readonly ReferencePerfume[]): ReferencePerfume[] {
  return all.filter((p) => HOUSE_SET.has(p.house));
}
