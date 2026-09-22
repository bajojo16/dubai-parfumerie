/**
 * Formatage partagé des quatre blocs « fiche répondante » (résumé, fiche
 * technique, FAQ, bandeau auteur).
 *
 * Ces blocs disent tous la même chose à partir des mêmes champs — contenance,
 * genre, saisons, date de relecture. Sans module commun, chacun aurait sa
 * propre virgule décimale et son propre « pour femme », et le jour où l'un
 * change, les trois autres dérivent. Rien ici n'invente une donnée : ce sont
 * des gabarits de phrase alimentés par `Product` et `ProductContent`.
 */

import {
  GENDER_LABEL,
  OCCASION_LABEL,
  SEASON_LABEL,
  type Gender,
  type Occasion,
  type Season,
} from "@/data/product-content";
import { formatPrice, parseVolumeMl } from "@/lib/product-variants";

/** Espace insécable : typographie française avant « € », « % » et « h ». */
export const NBSP = " ";

/** 29 → « 29,00 € » (virgule française, insécable avant le symbole). */
export function euros(n: number): string {
  return `${formatPrice(n)}${NBSP}€`;
}

/** 29 / 100 ml → « 0,29 € / ml ». Chaîne vide si la contenance est illisible. */
export function eurosPerMl(price: number, volumeMl: number): string {
  if (volumeMl <= 0) return "";
  return `${formatPrice(price / volumeMl)}${NBSP}€${NBSP}/${NBSP}ml`;
}

/** « 100ml » → « 100 ml » ; une contenance sans nombre lisible reste telle quelle. */
export function volumeLabel(volume: string): string {
  const ml = parseVolumeMl(volume);
  return ml > 0 ? `${ml}${NBSP}ml` : volume;
}

/** « EDP 30% » → « EDP 30 % » : l'espace insécable avant le pour cent. */
export function concentrationLabel(concentration: string): string {
  return concentration.replace(/\s*%/g, `${NBSP}%`);
}

/**
 * Premier descripteur de `product.family` (« Floral · Gourmand · Vanillé » →
 * « Floral ») : c'est lui qui porte la dominante, voir `product-details.ts`.
 */
export function primaryFamily(family: string | undefined): string | undefined {
  const first = family?.split("·")[0]?.trim();
  return first ? first : undefined;
}

/** ISO 8601 → « 22 septembre 2026 ». Une date illisible n'affiche rien. */
export function longDateFr(iso: string): string | undefined {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

/**
 * « a, b et c » — une liste lue dans une phrase, pas une énumération de
 * tableau. La première lettre de chaque terme passe en minuscule parce que les
 * notes sont capitalisées dans le catalogue (« Rose damascène ») et qu'un
 * milieu de phrase ne les veut pas ainsi.
 */
export function joinSentence(items: string[], lowercase = false): string {
  const list = lowercase ? items.map((s) => s.charAt(0).toLowerCase() + s.slice(1)) : items;
  if (list.length === 0) return "";
  if (list.length === 1) return list[0];
  return `${list.slice(0, -1).join(", ")} et ${list[list.length - 1]}`;
}

/** Genre en complément de phrase : « mixte », « pour femme », « pour homme ». */
export function genderPhrase(gender: Gender): string {
  return gender === "mixte" ? "mixte" : `pour ${gender}`;
}

/** Genre en libellé de tableau (« Mixte »). */
export function genderLabel(gender: Gender): string {
  return GENDER_LABEL[gender];
}

/**
 * « d'automne et d'hiver » / « de printemps » : l'élision dépend de la saison
 * — voyelle ou h muet (« hiver ») devant, jamais « de hiver ».
 */
export function seasonsPhrase(seasons: Season[]): string {
  return joinSentence(seasons.map((s) => (/^[aeiouyéèh]/i.test(s) ? `d'${s}` : `de ${s}`)));
}

/** « en soirée et en fête », « au bureau » : la préposition dépend du moment. */
export function occasionsPhrase(occasions: Occasion[]): string {
  return joinSentence(
    occasions.map((o) => (o === "bureau" ? "au bureau" : `en ${OCCASION_LABEL[o].toLowerCase()}`)),
  );
}

/** Libellés de tableau : « Automne, Hiver ». */
export function seasonsList(seasons: Season[]): string {
  return seasons.map((s) => SEASON_LABEL[s]).join(", ");
}

/** Libellés de tableau : « Soirée, Fête ». */
export function occasionsList(occasions: Occasion[]): string {
  return occasions.map((o) => OCCASION_LABEL[o]).join(", ");
}
