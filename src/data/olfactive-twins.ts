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
    /**
     * Film court du flacon, optionnel. Quand il est là, la vignette le joue à
     * l'entrée dans le champ (muet, en boucle) et `image` sert de poster : un
     * flacon qui tourne se lit mieux qu'un packshot dans un cadre de 116 px.
     * Sans lui, la vignette reste une image fixe — le cas de la plupart.
     */
    video?: string;
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
  // ─── Baccarat Rouge 540 : paire RETIRÉE, faute de jumeau défendable ──────────
  // Elle affirmait Lattafa Yara « profil très proche ». Deux choses clochaient.
  //
  // La description — « safran lumineux, ambre cristallin et fleurs poudrées » —
  // décrivait le Baccarat, pas Yara : le safran et l'ambre gris sont les accords
  // de la RÉFÉRENCE. Yara est un floral gourmand vanillé (orchidée, héliotrope,
  // vanille, santal) ; elle n'a ni safran ni ambre gris. La carte prêtait donc
  // au jumeau les notes du parfum qu'il était censé remplacer.
  //
  // Et le moteur ne la soutenait pas : `rankTwins` la classe SIXIÈME (0,765,
  // « proche »), derrière Tanasuk, Amber Oud, Khamrah, L'Or de Saba et The Tux.
  // Comme les paires relues à la main priment sur le calcul, l'entrée écrasait
  // ce classement ET remontait le badge à « très proche ». Personne ne la
  // relisait plus : c'est le propre d'une valeur écrite en dur.
  //
  // Aucun des candidats du catalogue n'est `verified` pour cette référence —
  // les alternatives reconnues au Baccarat dans ces maisons (Maison Alhambra
  // Jean Lowe Ombre, Lattafa Ansaam Gold) n'y figurent pas. Plutôt qu'un jumeau
  // affirmé sans preuve, on applique la règle du module : pas de jumeau
  // certifié, pas de jumeau montré. `resolveSuggestions` retire la pastille
  // d'elle-même et la réserve prend sa place. Rétablir cette entrée dès qu'un
  // vrai jumeau entre au catalogue.
  {
    key: "angels-share",
    referenceId: "kilian-angels-share",
    targetName: "Kilian · Angels' Share",
    targetPriceHint: "≈ 290 €",
    productHandle: "lattafa-khamrah",
    family: "Gourmand · Boisé · Épicé",
    description: "Cognac chaleureux, cannelle et tonka — un gourmand boisé enveloppant.",
    // Packshot réel du flacon Khamrah : plus de visuel générique sous ce nom.
    // Cadre serré et carré plutôt que le portrait large de `khamrah-packshot.webp` :
    // la vignette du jumeau fait 96–116 px en `objectFit: contain`, donc tout ce
    // que le cadrage laisse de vide autour du flacon est perdu à l'affichage.
    product: { name: "Khamrah", brand: "Lattafa", price: 21.9, image: "/assets/products/khamrah/khamrah-hf-05.jpg", href: "/produit/lattafa-khamrah" },
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
    // La marque de la maison tenait lieu de visuel faute de packshot ; le film
    // du flacon la remplace, avec sa première image pour poster.
    //
    // RÉSERVE, à trancher : le flacon filmé porte « SALVO ELIXIR ». C'est le
    // seul visuel de Salvo en banque — tout le dossier de la maison est de
    // l'Elixir. Or la carte annonce « Salvo » à 16,90 €, et la base distingue
    // bien les deux (`alhambra-salvo` / `alhambra-salvo-elixir`). Le libellé
    // sur le verre contredit donc le nom affiché. Deux issues : renommer la
    // carte en « Salvo Elixir » (et reprendre son prix), ou obtenir un visuel
    // du Salvo simple.
    product: { name: "Salvo", brand: "Maison Alhambra", price: 16.9, image: "/assets/products/salvo/salvo-poster.jpg", video: "/assets/videos/salvo-hf-01.mp4", href: "/produit/maison-alhambra-salvo" },
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
  // Baccarat Rouge 540 retiré : sa paire ne tenait pas (voir le bloc supprimé
  // dans OLFACTIVE_TWINS). Il fallait l'ôter D'ICI aussi, pas seulement de la
  // table des paires — les pastilles sont peintes depuis cette liste tant que
  // le moteur n'est pas chargé, si bien qu'elle serait apparue puis aurait
  // disparu sous les yeux du visiteur. À remettre avec sa paire.
  { referenceId: "dior-sauvage-elixir", label: "Dior · Sauvage Elixir" },
  { referenceId: "prada-paradoxe", label: "Prada · Paradoxe" },
  { referenceId: "armani-stronger-with-you", label: "Giorgio Armani · Stronger With You" },
  { referenceId: "mancera-red-tobacco", label: "Mancera · Red Tobacco" },
  { referenceId: "jpg-le-male-elixir", label: "Jean Paul Gaultier · Le Mâle Elixir" },
  { referenceId: "paco-rabanne-olympea", label: "Paco Rabanne · Olympéa" },
  { referenceId: "marly-pegasus", label: "Parfums de Marly · Pegasus" },
  // — Réserve : sert dès qu'une des huit ci-dessus perd son jumeau —
  // Fleur Musc for Her descend ici, et pas parce qu'il lui manque un jumeau :
  // elle en a un, et il est enfin juste. Elle tombait sur Swiss Arabian Shaghaf
  // Oud — un oud cambodi que `familyOf` classait « Floral » — badgé « profil
  // très proche » face à un musc rosé léger. Le moteur lui rend désormais
  // Lattafa Oud Pour Elle (rose damascène, safran, musc blanc, ambre), du même
  // registre floral-musqué.
  //
  // Ce qui la retire de la vitrine, c'est la TROISIÈME condition de
  // `resolveSuggestions` : Oud Pour Elle n'a pas de photo en banque et porte
  // encore `/assets/prod-1.jpg`, un visuel de remplissage qui montre un autre
  // flacon. La pastille mènerait donc à une carte au mauvais flacon. La
  // recherche du module, elle, sert la paire normalement — seule la mise en
  // vitrine est suspendue. À remonter dès que le packshot d'Oud Pour Elle
  // entre en banque : c'est la seule chose qui manque.
  { referenceId: "narciso-fleur-musc", label: "Narciso Rodriguez · Fleur Musc for Her" },
  { referenceId: "tom-ford-noir-extreme", label: "Tom Ford · Noir Extreme" },
  { referenceId: "versace-eros-flame", label: "Versace · Eros Flame" },
  { referenceId: "guerlain-shalimar", label: "Guerlain · Shalimar" },
  { referenceId: "jpg-classique", label: "Jean Paul Gaultier · Classique" },
  { referenceId: "ysl-opium", label: "Yves Saint Laurent · Opium" },
  { referenceId: "montale-mukhallat", label: "Montale · Mukhallat" },
  { referenceId: "carolina-herrera-212-sexy", label: "Carolina Herrera · 212 Sexy" },
];
