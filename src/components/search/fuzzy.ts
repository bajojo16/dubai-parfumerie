/**
 * Tolérance aux fautes de frappe de la recherche.
 *
 * Deux problèmes distincts, deux outils :
 *
 * 1. **La translittération.** « Oud » s'écrit aussi Oudh ou Ud, « Khamrah »
 *    devient Kamra, « Ameerat » s'écrit Amirat, « Lattafa » perd un t. Ce n'est
 *    pas une faute du client : l'arabe n'a pas d'orthographe latine unique, et
 *    le catalogue n'en retient qu'une. `fold()` ramène toutes ces graphies à une
 *    même forme, pour que la comparaison porte sur le son et non sur les lettres.
 *
 * 2. **La vraie faute de frappe.** Lettre oubliée, doublée, inversée, touche
 *    voisine. `editDistance()` la mesure (Damerau-Levenshtein borné, donc les
 *    transpositions « ahcat » → « achat » coûtent 1 et non 2).
 *
 * Les deux se cumulent : on replie d'abord, on tolère ensuite. « kachmire »
 * trouve « Kashmir » parce que le repli rapproche les deux, et que la distance
 * restante tient dans le budget.
 *
 * Ce fichier n'invente aucune donnée : il ne fait que transformer des chaînes.
 */

import { norm } from "@/data/search-catalog";

/**
 * Replie une graphie sur sa forme « sonore » approchée.
 *
 * L'ordre des remplacements compte : les digrammes passent avant les lettres
 * seules, sinon `c → k` mangerait le `ch` avant qu'on l'ait vu.
 *
 * `norm()` est appliqué ici, pas laissé à l'appelant : les règles ne portent que
 * sur `[a-z0-9]`, donc une majuscule oubliée ne serait pas repliée mais effacée,
 * et « Ameerat » deviendrait « merat ». Le faire soi-même vaut mieux que de
 * l'exiger de chaque appel.
 */
export function fold(input: string): string {
  return (
    norm(input)
      .replace(/[^a-z0-9\s]+/g, " ")
      // Article arabe : « Badee Al Oud » et « Badee Oud » désignent le même flacon.
      .replace(/\bal\s+/g, "")
      // Digrammes — d'abord, ils contiennent les lettres traitées ensuite.
      .replace(/ph/g, "f")
      .replace(/kh/g, "k")
      .replace(/gh/g, "g")
      .replace(/dh/g, "d")
      .replace(/th/g, "t")
      .replace(/sh/g, "s")
      .replace(/ch/g, "s")
      .replace(/ck/g, "k")
      .replace(/qu/g, "k")
      // Lettres seules ramenées à un son commun.
      .replace(/[cq]/g, "k")
      .replace(/z/g, "s")
      .replace(/(ou|oo|w)/g, "u")
      .replace(/(ee|y)/g, "i")
      // Doublons : « Lattafa » = « Latafa », « Summer » = « Sumer ». Lettres
      // seulement : sur les chiffres, « Reef 33 » deviendrait « Reef 3 », et
      // toutes les références numérotées se confondraient.
      .replace(/([a-z])\1+/g, "$1")
      // h muet ou d'aspiration : « Khamrah » = « Khamra ».
      .replace(/h/g, "")
      // e muet final : « Cachemire » = « Cachemir ».
      .replace(/e(\s|$)/g, "$1")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/** Découpe en mots repliés, en jetant ce qui est trop court pour être discriminant. */
export function foldWords(input: string): string[] {
  return fold(input)
    .split(" ")
    .filter((w) => w.length > 1);
}

/**
 * Budget de fautes accepté pour un mot de cette longueur.
 *
 * Il monte avec la longueur, sinon un mot court se confondrait avec n'importe
 * quel autre : à 3 lettres, une faute tolérée fait de « oud » un voisin de
 * « oui », « our » et « aud ». Sur trois lettres, on n'accepte rien.
 */
export function maxTypos(len: number): number {
  if (len <= 3) return 0;
  if (len <= 7) return 1;
  return 2;
}

/**
 * Distance de Damerau-Levenshtein (variante OSA), abandonnée dès qu'elle
 * dépasse `max` — on ne veut pas le nombre exact, seulement savoir s'il tient
 * dans le budget, et l'abandon précoce évite de remplir la matrice pour des
 * mots qui n'ont rien à voir.
 *
 * Renvoie `max + 1` quand le budget est dépassé.
 */
export function editDistance(a: string, b: string, max: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let prev2: number[] = [];
  let prev: number[] = Array.from({ length: b.length + 1 }, (_, j) => j);
  let cur: number[] = new Array(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    let best = cur[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      // transposition : « ahcat » → « achat » coûte 1
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, prev2[j - 2] + 1);
      }
      cur[j] = v;
      if (v < best) best = v;
    }
    // toute la ligne dépasse le budget : aucune suite ne redescendra
    if (best > max) return max + 1;
    prev2 = prev;
    prev = cur;
    cur = new Array(b.length + 1);
  }

  const d = prev[b.length];
  return d > max ? max + 1 : d;
}

/** Deux mots repliés se répondent-ils, fautes comprises ? */
export function wordMatches(keyWord: string, queryWord: string): boolean {
  if (keyWord.includes(queryWord)) return true;
  const budget = maxTypos(queryWord.length);
  if (!budget) return false;
  if (editDistance(keyWord, queryWord, budget) <= budget) return true;
  // Saisie en cours : « kachm » ne peut pas égaler « kasmir », on ne compare
  // donc que le début du mot candidat, à longueur comparable.
  //
  // Première lettre exigée identique : sans cette condition, le début de
  // « caramel » (replié « karamel ») tenait à une faute près de « yarra »
  // (replié « iara »), et un caramel remontait avant Yara. On se trompe au
  // milieu d'un mot, rarement sur sa première lettre — c'est elle qu'on a
  // cherchée au clavier avant de taper.
  if (keyWord.length > queryWord.length && keyWord[0] === queryWord[0]) {
    const head = keyWord.slice(0, queryWord.length);
    if (editDistance(head, queryWord, budget) <= budget) return true;
  }
  return false;
}

/**
 * Tous les mots de la requête trouvent-ils un mot de la clé ?
 *
 * « tous », pas « au moins un » : sinon « rose oud » ramènerait chaque rose du
 * catalogue au prétexte qu'un des deux mots colle.
 */
export function fuzzyMatch(keyWords: string[], queryWords: string[]): boolean {
  if (!keyWords.length || !queryWords.length) return false;
  return queryWords.every((qw) => keyWords.some((kw) => wordMatches(kw, qw)));
}
