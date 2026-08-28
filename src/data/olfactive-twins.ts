/**
 * Table de correspondances « jumeaux olfactifs » — ÉDITABLE par l'équipe.
 * Cadre légal : usage nominatif des marques cibles (texte seul, aucun logo).
 * Vocabulaire UI : « inspiré de » / « jumeau olfactif » — jamais « clone/copie/dupe ».
 *
 * En production, `product` serait résolu depuis le catalogue via `productHandle`
 * (nom / prix / image / lien réels). Ici les champs sont fournis pour la preview.
 *
 * `product.href` pointe la FICHE du jumeau (`/produit/<productHandle>`) et non
 * plus une page de liste : le visiteur qui clique « Voir ce parfum » attend le
 * flacon qu'on vient de lui montrer.
 *
 * Visuels : seuls les parfums dont la photo existe en banque pointent vers leur
 * propre packshot (/assets/products/*.webp). Les autres gardent volontairement un
 * visuel générique /assets/prod-*.jpg — mieux vaut un flacon neutre qu'un flacon
 * d'un AUTRE parfum sous le mauvais nom. À remplacer dès que la photo existe.
 */
export type OlfactiveMatch = {
  key: string;
  /**
   * Identifiant de l'original dans `reference-perfumes.ts`. C'est le LIEN entre
   * la table relue à la main et la base des références : `olfactive-match.ts`
   * en dérive sa table de correspondances au lieu de la recopier, si bien
   * qu'une entrée dont l'`referenceId` n'existe plus cesse d'être servie au
   * lieu de diverger en silence.
   */
  referenceId: string;
  targetName: string; // nom texte de la marque cible (usage nominatif)
  targetPriceHint?: string; // indicatif, optionnel — ex. « ≈ 320 € »
  productHandle: string; // handle/SKU du produit oriental dans le catalogue
  family: string; // famille olfactive (traduisible à terme)
  description: string; // 1 phrase profil olfactif (traduisible à terme)
  product: {
    name: string;
    brand: string;
    price: number; // « dès X € »
    image: string;
    href: string;
  };
};

export const OLFACTIVE_TWINS: OlfactiveMatch[] = [
  {
    key: "aventus",
    referenceId: "creed-aventus",
    targetName: "Creed · Aventus",
    targetPriceHint: "≈ 320 €",
    productHandle: "armaf-club-de-nuit-intense-man",
    family: "Fruité · Boisé · Fumé",
    description: "Ananas, bouleau, mousse de chêne. Un sillage masculin charismatique et tenace.",
    product: { name: "Club de Nuit Intense Man", brand: "Armaf", price: 19.9, image: "/assets/prod-4.jpg", href: "/produit/armaf-club-de-nuit-intense-man" },
  },
  {
    key: "br540",
    referenceId: "mfk-baccarat-rouge-540",
    // « maison · nom », comme la base : la pastille et la carte doivent nommer
    // le parfum de la même façon, sinon on croit à deux références.
    targetName: "Maison Francis Kurkdjian · Baccarat Rouge 540",
    targetPriceHint: "≈ 300 €",
    productHandle: "lattafa-yara",
    family: "Ambré · Sucré · Floral",
    description: "Safran lumineux, ambre cristallin et fleurs poudrées — une signature addictive.",
    product: { name: "Yara", brand: "Lattafa", price: 18.9, image: "/assets/products/yara.webp", href: "/produit/lattafa-yara" },
  },
  {
    key: "angels-share",
    referenceId: "kilian-angels-share",
    targetName: "Kilian · Angels' Share",
    targetPriceHint: "≈ 290 €",
    productHandle: "lattafa-khamrah",
    family: "Gourmand · Boisé · Épicé",
    description: "Cognac chaleureux, cannelle et tonka — un gourmand boisé enveloppant.",
    // Packshot réel du flacon Khamrah : plus de visuel générique sous ce nom.
    product: { name: "Khamrah", brand: "Lattafa", price: 21.9, image: "/assets/products/khamrah/khamrah-packshot.webp", href: "/produit/lattafa-khamrah" },
  },
  {
    key: "oud-wood",
    referenceId: "tom-ford-oud-wood",
    targetName: "Tom Ford · Oud Wood",
    targetPriceHint: "≈ 280 €",
    productHandle: "al-haramain-amber-oud",
    family: "Oud · Boisé · Épicé",
    description: "Oud fumé, santal et poivre — une profondeur orientale racée.",
    product: { name: "Amber Oud", brand: "Al Haramain", price: 29.9, image: "/assets/prod-2.jpg", href: "/produit/al-haramain-amber-oud" },
  },
  {
    key: "black-opium",
    referenceId: "ysl-black-opium",
    targetName: "YSL · Black Opium",
    targetPriceHint: "≈ 110 €",
    productHandle: "maison-alhambra-coffee",
    family: "Gourmand · Café · Vanille",
    description: "Café noir, vanille et fleur d'oranger — un sillage nocturne et magnétique.",
    product: { name: "Coffee", brand: "Maison Alhambra", price: 16.9, image: "/assets/prod-5.jpg", href: "/produit/maison-alhambra-coffee" },
  },
  {
    key: "sauvage",
    referenceId: "dior-sauvage",
    targetName: "Dior · Sauvage",
    targetPriceHint: "≈ 110 €",
    // Le jumeau du Sauvage CLASSIQUE (l'eau de toilette de 2015), pas d'une de
    // ses déclinaisons : c'est la paire la plus demandée en boutique, elle doit
    // donc être servie par le flacon que la maison a construit pour elle.
    // Salvo reprend l'axe bergamote / poivre de Sichuan / ambroxan de la
    // référence ; l'entrée précédente pointait Armaf Tres Nuit, dont la
    // composition en base (agrumes, lavande, iris, violette) part ailleurs.
    productHandle: "maison-alhambra-salvo",
    family: "Aromatique · Frais · Ambré",
    description: "Bergamote de Calabre, poivre de Sichuan et ambroxan sur fond vanillé — la fraîcheur épicée, en plus chaude.",
    // Aucun packshot de Salvo en banque (voir /public/assets/products/). Plutôt
    // qu'un visuel de remplissage /assets/prod-N.jpg — qui montre un TOUT AUTRE
    // flacon, pastille « Promo » incrustée — on sert la marque de la maison :
    // elle est exacte, elle ne fait passer aucun autre parfum pour celui-ci, et
    // elle se lit dans le cadre crème du module. À remplacer dès que la photo
    // du flacon existe.
    product: { name: "Salvo", brand: "Maison Alhambra", price: 16.9, image: "/brands/alhambra.jpg", href: "/produit/maison-alhambra-salvo" },
  },
  {
    key: "good-girl",
    referenceId: "carolina-herrera-good-girl",
    targetName: "Carolina Herrera · Good Girl",
    targetPriceHint: "≈ 120 €",
    productHandle: "lattafa-fakhar-femme",
    family: "Floral · Gourmand · Tonka",
    description: "Jasmin, fève tonka et cacao — un floral gourmand affirmé.",
    product: { name: "Fakhar Femme", brand: "Lattafa", price: 18.9, image: "/assets/prod-6.jpg", href: "/produit/lattafa-fakhar-femme" },
  },
  {
    key: "1-million",
    referenceId: "paco-rabanne-1-million",
    targetName: "Paco Rabanne · 1 Million",
    targetPriceHint: "≈ 95 €",
    productHandle: "maison-alhambra-the-tux",
    family: "Épicé · Cuir · Ambré",
    description: "Cuir, cannelle et ambre — une signature chaude et opulente.",
    product: { name: "The Tux", brand: "Maison Alhambra", price: 16.9, image: "/assets/prod-4.jpg", href: "/produit/maison-alhambra-the-tux" },
  },
];

// ─── Suggestions par défaut (les pastilles du module) ────────────────────────
/**
 * POURQUOI cette liste n'est pas `OLFACTIVE_TWINS`.
 *
 * `OLFACTIVE_TWINS` a deux métiers : alimenter le catalogue de recherche (c'est
 * la seule source de cinq produits en vente) ET porter huit paires relues. Le
 * second métier n'implique pas le premier : plusieurs de ces originaux ne sont
 * servis que par un visuel générique, et le module y renvoyait des pastilles
 * qui n'apportaient rien au visiteur.
 *
 * INVARIANT, vérifié à l'exécution en développement par `olfactive-match.ts`
 * (`resolveSuggestions`) : une pastille par défaut n'est affichée que si
 *   1. son `referenceId` existe dans `reference-perfumes.ts` ;
 *   2. `findTwin` lui rend un jumeau — relu à la main OU certifié par le moteur ;
 *   3. le produit jumeau porte un visuel qui LUI appartient — le packshot du
 *      flacon, ou à défaut la marque de sa maison — et non un visuel de
 *      remplissage `/assets/prod-N.jpg`, qui montre un tout autre parfum.
 * La liste ci-dessous est donc une PRIORITÉ, pas un résultat : `resolveSuggestions`
 * la filtre puis en garde les `TWIN_SUGGESTION_COUNT` premières. Une entrée qui
 * cesse de satisfaire l'invariant disparaît d'elle-même et la suivante prend sa
 * place — d'où la réserve au-delà de la huitième.
 *
 * `label` n'est là que pour peindre la pastille avant le chargement différé de
 * la base (3 952 références, hors bundle initial). Il doit rester égal à
 * « maison · nom » de la référence ; `resolveSuggestions` le recalcule depuis la
 * base dès qu'elle est là, donc une faute de frappe se corrige toute seule.
 */
export type TwinSuggestion = {
  /** id dans `reference-perfumes.ts` */
  referenceId: string;
  /** « maison · nom », copie d'amorçage du libellé de la base */
  label: string;
};

/** Nombre de pastilles affichées — cale la mise en page sur deux rangées. */
export const TWIN_SUGGESTION_COUNT = 8;

export const TWIN_SUGGESTIONS: readonly TwinSuggestion[] = [
  // — Les huit servies aujourd'hui, des plus vendues aux plus désirées —
  // Sauvage passe en tête : c'est la demande n°1 en boutique, et la pastille de
  // tête est aussi le résultat peint à l'ouverture du module (voir
  // `OlfactiveTwin`, qui amorce sa vue sur `TWIN_SUGGESTIONS[0]`). Sauvage et
  // Sauvage Elixir cohabitent volontairement : ce sont deux parfums distincts,
  // deux jumeaux distincts, et le visiteur qui cherche « Sauvage » veut voir
  // les deux.
  { referenceId: "dior-sauvage", label: "Dior · Sauvage" },
  { referenceId: "mfk-baccarat-rouge-540", label: "Maison Francis Kurkdjian · Baccarat Rouge 540" },
  { referenceId: "dior-sauvage-elixir", label: "Dior · Sauvage Elixir" },
  { referenceId: "prada-paradoxe", label: "Prada · Paradoxe" },
  { referenceId: "armani-stronger-with-you", label: "Giorgio Armani · Stronger With You" },
  { referenceId: "mancera-red-tobacco", label: "Mancera · Red Tobacco" },
  { referenceId: "jpg-le-male-elixir", label: "Jean Paul Gaultier · Le Mâle Elixir" },
  { referenceId: "narciso-fleur-musc", label: "Narciso Rodriguez · Fleur Musc for Her" },
  { referenceId: "paco-rabanne-olympea", label: "Paco Rabanne · Olympéa" },
  // — Réserve : sert dès qu'une des huit ci-dessus perd son jumeau —
  { referenceId: "marly-pegasus", label: "Parfums de Marly · Pegasus" },
  { referenceId: "tom-ford-noir-extreme", label: "Tom Ford · Noir Extreme" },
  { referenceId: "versace-eros-flame", label: "Versace · Eros Flame" },
  { referenceId: "guerlain-shalimar", label: "Guerlain · Shalimar" },
  { referenceId: "jpg-classique", label: "Jean Paul Gaultier · Classique" },
  { referenceId: "ysl-opium", label: "Yves Saint Laurent · Opium" },
  { referenceId: "montale-mukhallat", label: "Montale · Mukhallat" },
  { referenceId: "carolina-herrera-212-sexy", label: "Carolina Herrera · 212 Sexy" },
];
