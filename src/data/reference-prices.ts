/**
 * Prix boutique INDICATIFS des parfums de référence, en euros, marché français.
 *
 * POURQUOI CE FICHIER EXISTE.
 * Le module « jumeau olfactif » vend une économie — « à une fraction du prix » —
 * qu'il ne chiffrait jamais. La donnée existait pourtant à moitié :
 * `olfactive-twins.ts` porte un `targetPriceHint` (« ≈ 320 € ») sur ses sept
 * paires relues, et rien pour les centaines de références servies par le moteur.
 * Un texte libre d'un côté, rien de l'autre : impossible de calculer un
 * pourcentage d'économie.
 *
 * Cette table est donc la SOURCE NUMÉRIQUE UNIQUE du prix de l'original. Les
 * sept valeurs déjà écrites dans `targetPriceHint` y sont reprises à
 * l'identique, pour qu'aucun écran n'affiche deux chiffres différents pour le
 * même parfum.
 *
 * RÈGLES, non négociables :
 *
 *  1. INDICATIF, JAMAIS OFFICIEL. Le prix est présenté « ≈ », sous la mention
 *     « prix boutique constaté ». Ce n'est pas le prix de la marque, elle n'en
 *     répond pas, et il change au fil des saisons et des enseignes. Le cadre
 *     légal du repo (usage nominatif, texte seul, aucune affiliation) est
 *     inchangé : citer un ordre de grandeur public ne l'entame pas.
 *
 *  2. PAS DE PRIX INVENTÉ. Une référence dont le prix de vente courant n'est pas
 *     connu n'entre PAS dans la table : l'interface n'affiche alors ni prix
 *     barré, ni pourcentage, ni économie — elle se tait. C'est la même règle que
 *     pour les jumeaux : mieux vaut ne rien dire qu'affirmer un chiffre faux.
 *     Les maisons du Golfe (Gissah, Khaleej…) sont volontairement absentes :
 *     elles n'ont pas de prix boutique français constatable, et ce sont de toute
 *     façon des concurrents directs, pas des originaux de luxe.
 *
 *  3. UN PRIX PAR RÉFÉRENCE, POUR LE FORMAT COURANT. Le flacon retenu est celui
 *     que la maison met en avant (souvent 100 ml, 50 ml pour les Kayali, 70 ml
 *     pour les Baccarat Rouge). Le module ne compare pas des contenances : il
 *     compare deux tickets de caisse.
 *
 * Périmètre : les références réellement servies par le module — celles de
 * `SUGGESTED_REFERENCE_IDS` (paires relues + dupes documentés) et de
 * `TWIN_SUGGESTIONS` (les pastilles), plus les grands classiques les plus
 * cherchés dans le champ. Ordre alphabétique par maison, comme
 * `reference-perfumes.ts`.
 *
 * Ce fichier ne contient QUE des données et n'importe rien : il pèse quelques
 * centaines d'octets et peut donc rester dans le bundle initial, contrairement
 * à `reference-perfumes.ts`.
 */

/**
 * `referenceId` (de `reference-perfumes.ts`) → prix boutique constaté, en euros.
 * Une référence absente n'a pas de prix connu — voir la règle 2.
 */
export const REFERENCE_RETAIL_PRICES: Readonly<Record<string, number>> = {
  // ── Amouage ────────────────────────────────────────────────────────────────
  "amouage-honour-man": 330,
  "amouage-interlude-man": 345,
  "amouage-outlands": 375,

  // ── Azzaro ─────────────────────────────────────────────────────────────────
  "azzaro-the-most-wanted": 95,

  // ── Carolina Herrera ───────────────────────────────────────────────────────
  "carolina-herrera-212-sexy": 95,
  "carolina-herrera-good-girl": 120, // = targetPriceHint « ≈ 120 € »

  // ── Chanel ─────────────────────────────────────────────────────────────────
  "chanel-bleu-de-chanel": 130,
  "chanel-chance": 145,
  "chanel-coco-mademoiselle": 155,
  "chanel-n5": 160,

  // ── Creed ──────────────────────────────────────────────────────────────────
  "creed-aventus": 320, // = targetPriceHint « ≈ 320 € »
  "creed-green-irish-tweed": 320,
  "creed-silver-mountain-water": 305,
  "creed-virgin-island-water": 305,

  // ── Dior ───────────────────────────────────────────────────────────────────
  "dior-homme-intense": 135,
  "dior-jadore": 155,
  "dior-miss-dior-eau-de-parfum-2021": 145,
  "dior-sauvage": 115,
  "dior-sauvage-elixir": 110, // = targetPriceHint « ≈ 110 € »

  // ── Dolce & Gabbana ────────────────────────────────────────────────────────
  "dolce-gabbana-light-blue": 105,

  // ── Giardini di Toscana ────────────────────────────────────────────────────
  "giardini-di-toscana-bianco-latte": 195,

  // ── Giorgio Armani ─────────────────────────────────────────────────────────
  "armani-acqua-di-gio": 110,
  "armani-si": 140,
  "armani-stronger-with-you": 95,
  "giorgio-armani-my-way": 130,

  // ── Guerlain ───────────────────────────────────────────────────────────────
  "guerlain-shalimar": 140,

  // ── Hermès ─────────────────────────────────────────────────────────────────
  "hermes-terre-dhermes": 110,

  // ── Initio ─────────────────────────────────────────────────────────────────
  "initio-narcotic-delight": 285,
  "initio-oud-for-greatness": 300,

  // ── Jean Paul Gaultier ─────────────────────────────────────────────────────
  "jpg-classique": 105,
  "jpg-la-belle": 125,
  "jpg-le-male": 95,
  "jpg-le-male-elixir": 110,
  "jpg-ultra-male": 115,

  // ── Kayali ─────────────────────────────────────────────────────────────────
  // Format 50 ml, le seul distribué en France.
  "kayali-vanilla-28": 105,
  "kayali-vanilla-candy-rock-sugar-42": 105,
  "kayali-vanilla-royale-sugared-patchouli-64": 105,
  "kayali-yum-boujee-marshmallow-81": 105,
  "kayali-yum-pistachio-gelato-33": 105,

  // ── Kilian ─────────────────────────────────────────────────────────────────
  "kilian-angels-share": 290, // = targetPriceHint « ≈ 290 € »
  "kilian-good-girl-gone-bad": 225,
  "kilian-straight-to-heaven": 215,

  // ── Lacoste ────────────────────────────────────────────────────────────────
  "lacoste-pour-femme": 85,

  // ── Lancôme ────────────────────────────────────────────────────────────────
  "lancome-idole": 120,
  "lancome-la-vie-est-belle": 150,

  // ── Louis Vuitton ──────────────────────────────────────────────────────────
  "louis-vuitton-imagination": 305,
  "louis-vuitton-ombre-nomade": 350,
  "louis-vuitton-pacific-chill": 305,

  // ── Maison Francis Kurkdjian ───────────────────────────────────────────────
  // Baccarat Rouge 540 : 70 ml, le format de référence de la maison.
  "mfk-baccarat-rouge-540": 320,
  "mfk-baccarat-rouge-540-extrait": 465,
  "mfk-grand-soir": 245,

  // ── Mancera ────────────────────────────────────────────────────────────────
  "mancera-red-tobacco": 165,

  // ── Montale ────────────────────────────────────────────────────────────────
  "montale-mukhallat": 145,

  // ── Mugler ─────────────────────────────────────────────────────────────────
  "mugler-alien": 135,
  "mugler-angel": 135,

  // ── Narciso Rodriguez ──────────────────────────────────────────────────────
  "narciso-fleur-musc": 130,
  "narciso-poudree": 130,

  // ── Nishane ────────────────────────────────────────────────────────────────
  "nishane-hacivat": 245,

  // ── Paco Rabanne ───────────────────────────────────────────────────────────
  "paco-rabanne-1-million": 105,
  "paco-rabanne-invictus": 105,
  "paco-rabanne-olympea": 110,

  // ── Parfums de Marly ───────────────────────────────────────────────────────
  "marly-althair": 255,
  "marly-delina-exclusif": 350,
  "marly-herod": 260,
  "marly-layton": 300,
  "marly-pegasus": 250,

  // ── Prada ──────────────────────────────────────────────────────────────────
  "prada-paradoxe": 130,

  // ── Terenzi ────────────────────────────────────────────────────────────────
  "terenzi-andromeda": 165,
  "terenzi-kirke": 165,

  // ── Tom Ford ───────────────────────────────────────────────────────────────
  "tom-ford-lost-cherry": 340,
  "tom-ford-neroli-portofino": 265,
  "tom-ford-noir-extreme": 190,
  "tom-ford-oud-wood": 280, // = targetPriceHint « ≈ 280 € »
  "tom-ford-tobacco-vanille": 320,
  "tom-ford-tuscan-leather": 320,

  // ── Valentino ──────────────────────────────────────────────────────────────
  "valentino-uomo-born-in-roma": 105,

  // ── Versace ────────────────────────────────────────────────────────────────
  "versace-eros": 100,
  "versace-eros-flame": 105,

  // ── Xerjoff ────────────────────────────────────────────────────────────────
  "xerjoff-erba-pura": 265,
  "xerjoff-muse": 320,
  "xerjoff-opera": 345,

  // ── Yves Saint Laurent ─────────────────────────────────────────────────────
  "ysl-babycat": 245,
  "ysl-black-opium": 110, // = targetPriceHint « ≈ 110 € »
  "ysl-la-nuit-de-lhomme": 105,
  "ysl-libre-intense": 145,
  "ysl-opium": 140,
  "ysl-tuxedo-epices-patchouli": 95, // = targetPriceHint « ≈ 95 € »
  "ysl-y-edp": 115,
};

/** Prix boutique indicatif d'une référence, ou `null` s'il n'est pas connu. */
export function retailPriceOf(referenceId: string): number | null {
  const price = REFERENCE_RETAIL_PRICES[referenceId];
  return typeof price === "number" && price > 0 ? price : null;
}

/**
 * L'économie réalisée, ou `null` quand il n'y a rien d'honnête à annoncer :
 * prix de l'original inconnu, prix du jumeau absent, ou jumeau qui ne coûte pas
 * moins cher (cela arrive : certaines maisons du Golfe sont au prix du marché).
 *
 * `percent` est ARRONDI À L'ENTIER et calculé sur les prix réels — on ne
 * « rehausse » jamais un −67 % en −70 %.
 */
export type Savings = { retail: number; price: number; saved: number; percent: number };

export function savingsOf(referenceId: string, price: number | undefined | null): Savings | null {
  const retail = retailPriceOf(referenceId);
  if (retail === null || typeof price !== "number" || price <= 0 || price >= retail) return null;
  return {
    retail,
    price,
    saved: retail - price,
    percent: Math.round(((retail - price) / retail) * 100),
  };
}

// ─── Nom lisible d'une source ────────────────────────────────────────────────
/**
 * Le badge « jumeau documenté » nomme sa source au lieu de dire « voir la
 * source » : lire « Source : Fragrantica » vaut mieux que suivre un lien
 * anonyme — le visiteur juge la source avant de cliquer, ou sans cliquer.
 *
 * Le nom est DÉRIVÉ de l'URL déjà stockée (`Dupe.source` dans
 * `dp-dupes.json`) : rien de nouveau n'est saisi, donc rien ne peut diverger.
 * La table ci-dessous ne fait que rendre présentables les domaines réellement
 * présents dans le fichier ; un domaine non répertorié s'affiche tel quel, en
 * minuscules, sans être embelli. On n'invente JAMAIS un nom de source — c'est
 * la même règle que pour les prix et pour les jumeaux.
 *
 * Ce module vit ici plutôt que dans `dp-dupes.ts` pour la même raison que les
 * prix : c'est de l'affichage, il doit rester léger et sans dépendance.
 */
const SOURCE_NAMES: Readonly<Record<string, string>> = {
  "fragrantica.com": "Fragrantica",
  "thesnifftest.co.uk": "The Sniff Test",
  "parfumo.com": "Parfumo",
  "scentclones.com": "ScentClones",
  "pickmyclone.com": "PickMyClone",
  "khaleejscents.co.uk": "Khaleej Scents",
  "ifragranceofficial.com": "iFragrance",
  "jeansmellgood.com": "Jean Smell Good",
  "esencjazapachu.com": "Esencja Zapachu",
  "parfumhill.com": "ParfumHill",
  "fragbar.com": "FragBar",
  "perfumenez.com": "PerfumeNez",
  "marabika.lt": "Marabika",
  "aromaauthority.com": "Aroma Authority",
  "scentsquarebyghadi.com": "Scent Square",
  "bloomperfume.com": "Bloom Perfume",
  "hamidi.us": "Hamidi",
  "basenotes.com": "Basenotes",
  "youtube.com": "YouTube",
  "anabis.com": "Anabis",
  "amazon.com": "Amazon",
  "reddit.com": "Reddit",
  "dupe.pro": "Dupe.pro",
  "scentgrail.com": "ScentGrail",
};

/**
 * Nom lisible d'une URL de source — ou `null` quand il n'y a pas d'URL
 * exploitable. `null` veut dire « n'affiche ni le nom ni le lien », jamais
 * « invente quelque chose ».
 */
export function sourceNameOf(url: string | undefined | null): string | null {
  if (!url) return null;
  const match = /^[a-z]+:\/\/([^/?#]+)/i.exec(url.trim());
  if (!match) return null;
  const host = match[1].toLowerCase().replace(/^www\./, "").replace(/:\d+$/, "");
  if (!host.includes(".")) return null;
  return SOURCE_NAMES[host] ?? host;
}
