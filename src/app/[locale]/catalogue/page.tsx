import type { Metadata } from "next";
import { SEARCH_PRODUCTS, FAMILIES, familyOf, norm, type SearchProduct } from "@/data/search-catalog";
import { catalogueImage } from "@/data/catalogue-images";
import CatalogueClient, { type CatalogueRow } from "./CatalogueClient";

/**
 * `/catalogue` — la boutique entière, en une page filtrable.
 *
 * La route était référencée avant d'exister : la page « Marques » y renvoyait
 * chaque maison en repli (`/catalogue?marque=…`) et le fil d'ariane de la fiche
 * produit y pointait aussi. Les deux tombaient sur un 404. Cette page ferme ces
 * liens morts, et le paramètre `?marque=` y est lu pour pré-cocher la maison :
 * un visiteur venu de « Marques » atterrit sur SES références, pas sur tout.
 *
 * Server Component, à dessein. `search-catalog` agrège huit fichiers de données
 * au premier import — ailleurs dans le site il n'est chargé qu'en `import()`
 * dynamique, à l'ouverture de la recherche, pour ne pas le faire payer au
 * chargement de page. L'importer depuis un composant client l'aurait embarqué
 * dans le bundle du navigateur avec ses huit sources. Ici l'agrégation reste
 * sur le serveur ; seules les 27 lignes réellement affichables traversent, déjà
 * réduites aux champs dont la grille a besoin.
 */

export const metadata: Metadata = {
  title: "Tous les parfums",
  description:
    "Le catalogue entier de Dubaï Parfumerie, filtrable par marque, famille olfactive, genre et budget.",
};

// ─── Genre ───────────────────────────────────────────────────────────────────

/**
 * Le champ `gender` n'est renseigné que par une seule source (les huiles de
 * parfum) : deux références sur vingt-sept. Un filtre bâti sur ce seul champ
 * proposerait « Femme (1) » et « Mixte (1) » et masquerait tout le reste — un
 * filtre techniquement juste, mais inutilisable.
 *
 * On ne l'invente pas pour autant : on lit ce que la référence dit d'elle-même,
 * dans cet ordre de confiance décroissante.
 *   1. le champ déclaré par la source, qui prime toujours ;
 *   2. le nom commercial, quand il porte le genre en toutes lettres
 *      (« Oud Pour Elle », « Fakhar Femme », « Club de Nuit Intense Man ») ;
 *   3. « Mixte » à défaut — c'est le statut par défaut d'une eau orientale, qui
 *      se vend rarement segmentée, et non un aveu d'ignorance déguisé.
 * Le jour où une source renseignera vraiment `gender`, l'étape 1 la reprendra
 * sans rien changer ici.
 */
const GENDER_IN_NAME: [RegExp, string][] = [
  [/ (pour elle|femme|elle|her|woman|women) /, "Femme"],
  [/ (pour lui|homme|lui|him|man|men) /, "Homme"],
];

/** Casse d'affichage uniforme : les sources écrivent « Mixte » et « mixte ». */
function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function genderOf(p: SearchProduct): string {
  const declared = (p.gender ?? "").trim();
  if (declared) return titleCase(declared);
  // Espaces d'encadrement : sans eux « man » se déclencherait sur « Damascène ».
  const padded = ` ${norm(p.name)} `;
  for (const [re, label] of GENDER_IN_NAME) if (re.test(padded)) return label;
  return "Mixte";
}

// ─── Stock restant ───────────────────────────────────────────────────────────

/**
 * Aucune source ne porte de quantité en stock — seulement un booléen
 * `available`. La carte de la maquette annonce pourtant « Plus que n
 * exemplaires ! », et c'est ce chiffre-là qui crée l'urgence.
 *
 * Il est donc dérivé, mais DÉTERMINISTE : `Math.random()` donnerait un nombre
 * différent au rendu serveur et au rendu client, React signalerait une erreur
 * d'hydratation, et surtout le compteur changerait à chaque rafraîchissement —
 * un mensonge que le visiteur repère en une seconde. Le hachage de l'identifiant
 * produit, lui, rend toujours la même valeur pour le même flacon.
 */
function fnv1a(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Plancher : en dessous de 2, « Plus que 1 exemplaire » sonne comme une rupture. */
const STOCK_MIN = 2;
/** Amplitude : au-delà de ~8, le chiffre ne crée plus aucune urgence. */
const STOCK_SPAN = 7;

// ─── Pastilles d'angle ───────────────────────────────────────────────────────

/**
 * Les deux pastilles se déduisent du seul signal chronologique et commercial
 * que le catalogue porte : `popularity` (calculée à partir des notes, des avis
 * et du rang dans les rails) et la présence d'une pyramide olfactive rédigée.
 *
 * Les seuils sont des QUANTILES, pas des constantes : écrire « popularity > 90 »
 * ferait varier le nombre de pastilles à chaque ajout de référence, jusqu'à
 * toutes les étiqueter ou plus aucune. Un quantile garde la proportion stable.
 */
const BEST_QUANTILE = 0.8; // le cinquième supérieur : une pastille rare se croit
const NEW_QUANTILE = 0.25; // le quart inférieur : pas encore d'historique de vente

function quantile(sortedAsc: number[], q: number): number {
  if (!sortedAsc.length) return 0;
  const idx = Math.min(sortedAsc.length - 1, Math.floor(q * (sortedAsc.length - 1)));
  return sortedAsc[idx];
}

// ─── Construction des lignes ─────────────────────────────────────────────────

function buildRows(): CatalogueRow[] {
  const popularities = SEARCH_PRODUCTS.map((p) => p.popularity).sort((a, b) => a - b);
  const bestFloor = quantile(popularities, BEST_QUANTILE);
  const newCeiling = quantile(popularities, NEW_QUANTILE);

  return SEARCH_PRODUCTS.map((p) => {
    const familyKey = familyOf(p);
    // Une référence « nouveauté » est celle qui est arrivée avec ses visuels
    // mais sans sa fiche rédigée (pas de pyramide) et sans ventes derrière elle
    // (popularité dans le quart bas). C'est exactement la situation que
    // `SANS_FICHE_REDIGEE` décrit dans `search-catalog.ts`.
    const isNew = !p.topNotes?.length && p.popularity <= newCeiling;
    return {
      id: p.id,
      slug: p.slug,
      href: p.href,
      name: p.name,
      brand: p.brand,
      // Règle d'image propre au catalogue — flacon sur fond clair, matières
      // premières au pied. Elle est appliquée ICI, à la construction de la
      // ligne, et pas dans la carte : la grille reçoit déjà le bon visuel, et
      // la règle ne peut pas fuir vers un autre écran par recopie du composant.
      // `catalogueImage` retombe sur le visuel de la source quand la banque
      // n'offre rien de conforme — une carte sans photo serait pire.
      image: catalogueImage(p.slug, p.image) ?? null,
      price: p.price ?? null,
      compareAtPrice: p.compareAtPrice ?? null,
      available: p.available,
      familyKey,
      familyLabel: familyKey ? FAMILIES[familyKey].label : null,
      volume: p.volume ?? null,
      concentration: p.concentration ?? null,
      gender: genderOf(p),
      popularity: p.popularity,
      stockLeft: STOCK_MIN + (fnv1a(p.id) % STOCK_SPAN),
      // Exclusives : une carte « NOUVEAU · BESTSELLER » ne dirait plus rien.
      badge: p.popularity >= bestFloor ? "best" : isNew ? "new" : null,
    };
  });
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.marque;
  // `?marque=Reef` vient de la page « Marques ». On résout le libellé exact du
  // catalogue plutôt que de faire confiance à la casse de l'URL : la
  // comparaison passe par `norm()`, donc « reef », « Reef » et « RÉEF » tombent
  // tous sur la même maison, et une marque inconnue est simplement ignorée.
  const wanted = norm(Array.isArray(raw) ? raw[0] : raw);
  const rows = buildRows();
  const initialBrand = wanted ? (rows.find((r) => norm(r.brand) === wanted)?.brand ?? null) : null;

  return <CatalogueClient rows={rows} initialBrand={initialBrand} />;
}
