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
import { PRODUCT_PACKSHOTS } from "@/data/product-packshots";
import { PRODUCT_LINES } from "@/data/product-lines";

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

  // Packshot fond clair : la fiche qui le déclare gagne, sinon la table
  // générée (`product-packshots.ts`), sinon rien — la page retombe sur `image`.
  const packshot = PRODUCT_PACKSHOTS[slug];

  const detailed = PRODUCTS[slug];
  // La fiche rédigée peut porter son nez en propre ; sinon la table complète.
  if (detailed) {
    return {
      ...detailed,
      ...(perfumer && !detailed.perfumer ? { perfumer } : {}),
      ...(!detailed.packshot && packshot ? { packshot } : {}),
    };
  }

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
    ...(packshot ? { packshot } : {}),
    // Spread conditionnel : sans attribution vérifiée, la clé n'existe pas —
    // `perfumer: undefined` suffirait à l'affichage mais laisserait croire que
    // l'information a été cherchée et vaut « non communiqué ».
    ...(perfumer ? { perfumer } : {}),
  };
}

/**
 * Libellé de famille olfactive d'une fiche, pour le fil d'Ariane et les
 * comparatifs : la déclaration explicite (`family`, premier descripteur),
 * sinon celle que le catalogue déduit des notes. Chaîne vide si rien.
 */
export function familyLabelOf(slug: string, p: Product): string {
  if (p.family) return p.family.split(/[\s·,/]+/)[0];
  const sp = SEARCH_PRODUCTS.find((x) => x.slug === slug);
  const key = sp ? familyOf(sp) : "";
  return key && FAMILIES[key] ? FAMILIES[key].label : "";
}

// ─── Produits liés ───────────────────────────────────────────────────────────

/** Notes d'une fiche, normalisées pour la comparaison (minuscules, sans accents). */
function noteKeys(p: Product): Set<string> {
  return new Set(
    [...p.topNotes, ...p.heartNotes, ...p.baseNotes].map((n) =>
      n
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim(),
    ),
  );
}

/**
 * Famille olfactive d'une fiche, avec la même règle que la vitrine : la
 * déclaration explicite (`family`, premier descripteur) l'emporte ; sinon on
 * repasse par le catalogue de recherche, qui la déduit des notes.
 */
function familyKeyOf(slug: string, p: Product): string {
  if (p.family) return p.family.split(/[\s·,/]+/)[0].toLowerCase();
  const sp = SEARCH_PRODUCTS.find((x) => x.slug === slug);
  return sp ? familyOf(sp) : "";
}

/**
 * Les autres déclinaisons de la MÊME ligne : Khamrah → Khamrah Qahwa,
 * Yara → Yara Moi / Asad / Asad Zanzibar. Table générée (`product-lines.ts`).
 * C'est le lien le plus fort du catalogue : il passe avant la ressemblance
 * olfactive calculée.
 */
export function lineSiblings(slug: string, limit = 4): { slug: string; product: Product }[] {
  const out: { slug: string; product: Product }[] = [];
  for (const other of PRODUCT_LINES[slug] ?? []) {
    const p = resolveProduct(other);
    if (p && p.image) out.push({ slug: other, product: p });
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * Les fiches à proposer sous « Vous pourriez aussi aimer ».
 *
 * La rangée montrait les QUATRE PREMIERS slugs du catalogue, les mêmes sur
 * toutes les fiches, sans lien olfactif avec le produit ouvert. On classe
 * désormais par proximité : même famille dominante d'abord, puis nombre de
 * notes en commun, puis même maison — un client qui aime un gourmand à la
 * datte veut voir d'autres gourmands, pas le premier oud de la liste. Les
 * fiches sans visuel sont écartées : une vignette vide ne recommande rien.
 * Le score est déterministe, la rangée ne change pas d'un rendu à l'autre.
 */
export function relatedProducts(slug: string, limit = 4): { slug: string; product: Product }[] {
  const ref = resolveProduct(slug);
  if (!ref) return [];
  const refFamily = familyKeyOf(slug, ref);
  const refNotes = noteKeys(ref);

  const scored: { slug: string; product: Product; score: number }[] = [];
  for (const other of allProductSlugs()) {
    if (other === slug) continue;
    const p = resolveProduct(other);
    if (!p || !p.image) continue;

    let score = 0;
    if (refFamily && familyKeyOf(other, p) === refFamily) score += 6;
    let shared = 0;
    for (const n of noteKeys(p)) if (refNotes.has(n)) shared += 1;
    score += Math.min(shared, 5) * 2;
    if (p.brand === ref.brand) score += 1;

    if (score > 0) scored.push({ slug: other, product: p, score });
  }

  // Les déclinaisons de la ligne passent devant : elles portent le même nom,
  // c'est ce que le client cherche en premier.
  const siblings = new Set(PRODUCT_LINES[slug] ?? []);
  for (const r of scored) if (siblings.has(r.slug)) r.score += 100;

  return scored
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.product.rating - a.product.rating ||
        b.product.reviews - a.product.reviews ||
        a.product.name.localeCompare(b.product.name, "fr"),
    )
    .slice(0, limit)
    .map(({ slug, product }) => ({ slug, product }));
}
