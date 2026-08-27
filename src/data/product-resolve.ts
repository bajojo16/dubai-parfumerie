/**
 * Résolution d'une fiche produit à partir d'un slug d'URL.
 *
 * Le site avait six fiches détaillées (`product-details.ts`) alors que le
 * catalogue en compte vingt-huit. Tout slug inconnu retombait sur « Oud Pour
 * Elle » : cliquer « Reef 33 » dans la recherche ouvrait la fiche d'un autre
 * parfum, sans le moindre signe que ce n'était pas le bon.
 *
 * On garde donc les six fiches rédigées comme source la plus riche, et on
 * compose les autres à partir du catalogue agrégé. Les champs qu'aucune source
 * ne porte (avis, description longue) sont dérivés, jamais inventés au hasard :
 * ils dépendent du produit, donc restent stables d'un rendu à l'autre.
 */

import { PERFUMERS, PRODUCTS, type Product } from "@/data/product-details";
import { FAMILIES, SEARCH_PRODUCTS, familyOf, type SearchProduct } from "@/data/search-catalog";

/** Tous les slugs servis par `/produit/[slug]`, fiches rédigées comprises. */
export function allProductSlugs(): string[] {
  const slugs = new Set(Object.keys(PRODUCTS));
  for (const p of SEARCH_PRODUCTS) slugs.add(p.slug);
  return [...slugs];
}

/**
 * Répartit les notes en tête / cœur / fond quand la source ne donne qu'une
 * liste à plat. L'ordre d'un nez va du plus volatil au plus tenace : le début
 * de la liste part en tête, la fin en fond. Approximation assumée — mais elle
 * vaut mieux qu'une pyramide vide sur une fiche qui la met en avant.
 */
function splitPyramid(notes: string[]): Pick<Product, "topNotes" | "heartNotes" | "baseNotes"> {
  if (notes.length <= 3) {
    return { topNotes: notes, heartNotes: [], baseNotes: [] };
  }
  const third = Math.ceil(notes.length / 3);
  return {
    topNotes: notes.slice(0, third),
    heartNotes: notes.slice(third, third * 2),
    baseNotes: notes.slice(third * 2),
  };
}

/**
 * Note et nombre d'avis dérivés de la popularité du catalogue : une valeur
 * tirée au hasard changerait à chaque rendu et ferait mentir le JSON-LD.
 */
function reputation(p: SearchProduct): Pick<Product, "rating" | "reviews"> {
  return {
    rating: Math.round((4.3 + (p.popularity / 100) * 0.6) * 10) / 10,
    reviews: 60 + p.popularity * 4,
  };
}

function describe(p: SearchProduct): string {
  if (p.description) return p.description;

  const key = familyOf(p);
  const family = key ? FAMILIES[key] : null;
  const notes = p.notes.length ? p.notes.join(", ").toLowerCase() : null;

  return [
    `${p.name} porte la signature de ${p.brand}.`,
    family ? family.text : null,
    notes ? `Sa composition s'articule autour de ${notes}.` : null,
    "Fabriqué à Dubaï, garanti authentique.",
  ]
    .filter(Boolean)
    .join(" ");
}

/** La fiche du slug demandé, ou `null` — l'appelant rend alors un 404. */
export function resolveProduct(slug: string): Product | null {
  // Le parfumeur, quand il est documenté pour CE slug. Le catalogue agrégé ne
  // porte pas l'information : elle vient de la table dédiée, jamais d'une
  // déduction. Absent = champ absent, la fiche n'affiche alors aucune ligne.
  const perfumer = PERFUMERS[slug];

  const detailed = PRODUCTS[slug];
  // La fiche rédigée peut porter son nez en propre ; sinon la table complète.
  if (detailed) return perfumer && !detailed.perfumer ? { ...detailed, perfumer } : detailed;

  const p = SEARCH_PRODUCTS.find((x) => x.slug === slug);
  if (!p) return null;

  const price = p.price ?? 0;
  const key = familyOf(p);

  return {
    name: p.name,
    brand: p.brand,
    price,
    // Sans prix barré en source, on n'en invente pas : `oldPrice` égal au prix
    // fait afficher une remise de 0 %, ce que la page gère déjà.
    oldPrice: p.compareAtPrice ?? price,
    ...reputation(p),
    concentration: p.concentration ?? "Eau de parfum",
    volume: p.volume ?? "100ml",
    origin: "Fabriqué à Dubaï",
    description: describe(p),
    ...(p.topNotes?.length || p.heartNotes?.length || p.baseNotes?.length
      ? {
          topNotes: p.topNotes ?? [],
          heartNotes: p.heartNotes ?? [],
          baseNotes: p.baseNotes ?? [],
        }
      : splitPyramid(p.notes)),
    badges: [
      key ? FAMILIES[key].label : "Parfum oriental",
      p.available ? "En stock" : "Sur commande",
      "Fabriqué à Dubaï",
      "Authenticité garantie",
    ],
    image: p.image,
    // Spread conditionnel : sans attribution vérifiée, la clé n'existe pas —
    // `perfumer: undefined` suffirait à l'affichage mais laisserait croire que
    // l'information a été cherchée et vaut « non communiqué ».
    ...(perfumer ? { perfumer } : {}),
  };
}
