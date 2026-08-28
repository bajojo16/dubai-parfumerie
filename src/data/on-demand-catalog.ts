/**
 * Sélection « Commande à la demande » — le périmètre des maisons du Golfe que la
 * boutique ne tient pas en stock mais fait venir sur demande.
 *
 * ⚠️ AUCUNE DONNÉE N'EST RECOPIÉE ICI.
 * `reference-perfumes.ts` reste l'unique source de vérité : ce fichier ne
 * contient que des *clés* (des noms de maisons et des identifiants) et la
 * fonction qui applique le filtre. Un nom de parfum corrigé, un accord ajusté
 * ou une entrée retirée de la base se répercute donc automatiquement, sans
 * qu'aucune ligne d'ici n'ait à être touchée. C'est aussi pour ça que l'import
 * du type est un `import type` : à la compilation il disparaît, et le fichier
 * de 792 Ko n'entre pas dans le bundle qui contient ce module.
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
 * Amouage est omanaise, Hind Al Oud saoudienne, les dix-neuf autres sont
 * émiraties. Les maisons européennes ou américaines de la base (Xerjoff, Creed,
 * Dior…) sont volontairement hors périmètre : la commande à la demande porte
 * sur le sourcing au Golfe, c'est là que la boutique a ses relais.
 */
export const ON_DEMAND_HOUSES: readonly string[] = [
  "Afnan",
  "Ajmal",
  "Al Haramain",
  "Amouage",
  "Amouroud",
  "Arabian Oud",
  "Arabiyat",
  "Ard Al Zaafaran",
  "Armaf",
  "Asdaaf",
  "Attar Collection",
  "Blend Oud",
  "Fragrance du Bois",
  "Hind Al Oud",
  "Kajal",
  "Lattafa",
  "Maison Alhambra",
  "Nabeel",
  "Rasasi",
  "Risala",
  "Swiss Arabian",
  "The Spirit of Dubai",
  "Zimaya",
];

/**
 * Maisons dont le catalogue est trop vaste pour être proposé en entier
 * (Lattafa pèse à elle seule 213 entrées) : on ne garde que les références
 * réellement réclamées au comptoir. Ailleurs — Al Haramain, Swiss Arabian,
 * Kajal, Blend Oud… — le catalogue de la base est déjà resserré sur les
 * références connues, on le prend tel quel.
 *
 * Ce sont des IDENTIFIANTS, pas des données : le nom, la maison, l'année, la
 * famille et les accords restent lus dans `reference-perfumes.ts`.
 */
export const HOUSE_HIGHLIGHTS: Readonly<Record<string, readonly string[]>> = {
  // Les best-sellers absolus du segment : Khamrah, Yara, Asad, Fakhar, Maahir.
  Lattafa: [
    "lattafa-khamrah",
    "lattafa-khamrah-qahwa",
    "lattafa-khamrah-dukhan",
    "lattafa-yara",
    "lattafa-yara-moi",
    "lattafa-yara-tous",
    "lattafa-yara-candy",
    "lattafa-asad",
    "lattafa-asad-zanzibar",
    "lattafa-asad-bourbon",
    "lattafa-fakhar-black",
    "lattafa-fakhar-gold",
    "lattafa-fakhar-rose",
    "lattafa-maahir",
    "lattafa-maahir-legacy",
    "lattafa-maahir-black-edition",
    "lattafa-badee-al-oud-amethyst",
    "lattafa-bade-e-al-oud-sublime",
    "lattafa-bade-e-al-oud-honor-and-glory",
    "lattafa-raghba",
    "lattafa-ramz-gold",
    "lattafa-ramz-silver",
    "lattafa-qaed-al-fursan-unlimited",
    "lattafa-qimmah",
    "lattafa-sheikh-al-shuyukh-luxe-edition",
    "lattafa-sheikh-al-shuyukh-final-edition",
    "lattafa-ana-abiyedh-coral",
    "lattafa-eclaire",
    "lattafa-teriaq",
    "lattafa-mayar",
    "lattafa-mayar-cherry-intense",
    "lattafa-najdia",
    "lattafa-haya",
    "lattafa-hayaati",
    "lattafa-opulent-musk",
    "lattafa-oud-mood",
    "lattafa-oud-mood-elixir",
    "lattafa-velvet-rose",
    "lattafa-his-confession",
    "lattafa-her-confession",
    "lattafa-emeer",
    "lattafa-liam",
    "lattafa-pride-ansaam-gold",
    "lattafa-pride-ishq-al-shuyukh-gold",
    "lattafa-24-carat-pure-gold",
    "lattafa-pure-musk",
    "lattafa-mohra",
    "lattafa-ajwad",
    "lattafa-nebras",
    "lattafa-confidential-private-gold",
  ],
  // Armaf tient sur la ligne Club de Nuit ; le reste de la maison est demandé
  // à la marge, on garde ses classiques.
  Armaf: [
    "armaf-club-de-nuit-intense-man",
    "armaf-club-de-nuit-intense-man-pure-parfum",
    "armaf-club-de-nuit-intense-woman",
    "armaf-club-de-nuit-untold",
    "armaf-club-de-nuit-sillage",
    "armaf-club-de-nuit-milestone",
    "armaf-club-de-nuit-blue-iconic",
    "armaf-club-de-nuit-iconic",
    "armaf-club-de-nuit-imperial",
    "armaf-club-de-nuit-oud-parfum",
    "armaf-club-de-nuit-urban-man",
    "armaf-club-de-nuit-urban-elixir",
    "armaf-club-de-nuit-maleka",
    "armaf-club-de-nuit-private-key-to-my-life",
    "armaf-club-de-nuit-private-key-to-my-love",
    "armaf-tres-nuit",
    "armaf-tres-jour",
    "armaf-ventana",
    "armaf-ventana-marine",
    "armaf-craze",
    "armaf-craze-noir",
    "armaf-hunter",
    "armaf-hunter-intense",
    "armaf-odyssey-homme",
    "armaf-odyssey-aoud-edition",
    "armaf-odyssey-mandarin-sky-limited-edition",
    "armaf-odyssey-dubai-chocolat-edition",
    "armaf-le-parfait",
    "armaf-le-parfait-pour-homme",
    "armaf-the-pride-of-armaf-pour-homme",
    "armaf-niche-bucephalus-no-x",
    "armaf-derby-club-house",
    "armaf-black-saffron",
    "armaf-voyage-bleu",
  ],
  Ajmal: [
    "ajmal-amber-wood",
    "ajmal-aurum",
    "ajmal-aristocrat",
    "ajmal-aristocrat-platinum",
    "ajmal-silver-shade",
    "ajmal-blu-femme",
    "ajmal-carbon",
    "ajmal-wisal",
    "ajmal-wisal-dhahab",
    "ajmal-evoke-her",
    "ajmal-evoke-gold-edition",
    "ajmal-sacrifice-her",
    "ajmal-1001-night",
    "ajmal-amber-musc",
    "ajmal-shadow-blue",
    "ajmal-entice-allura",
  ],
  "Maison Alhambra": [
    "alhambra-jean-lowe-immortel",
    "alhambra-jean-lowe-noir",
    "alhambra-jean-lowe-matiere",
    "alhambra-jean-lowe-azure",
    "alhambra-jean-lowe-nouveau",
    "alhambra-baroque-satin-oud",
    "alhambra-versencia-rouge",
    "alhambra-como-moiselle",
    "alhambra-philos-opus-noir",
    "alhambra-philos-centro",
    "alhambra-victorioso-legacy",
    "alhambra-victorioso-nero",
    "alhambra-delilah-pour-femme",
    "alhambra-lava",
    "alhambra-karat",
    "alhambra-salvo",
    "alhambra-salvo-elixir",
  ],
  Amouage: [
    "amouage-interlude-man",
    "amouage-interlude-woman",
    "amouage-reflection-man",
    "amouage-reflection-woman",
    "amouage-jubilation-xxv",
    "amouage-jubilation-25-woman",
    "amouage-gold-man",
    "amouage-gold-woman",
    "amouage-epic-man",
    "amouage-honour-man",
    "amouage-memoir-man",
    "amouage-lyric-man",
    "amouage-lyric-woman",
    "amouage-fate-man",
    "amouage-guidance",
    "amouage-search",
  ],
  Rasasi: [
    "rasasi-hawas",
    "rasasi-hawas-ice",
    "rasasi-hawas-black",
    "rasasi-hawas-fire",
    "rasasi-hawas-elixir",
    "rasasi-hawas-tropical",
    "rasasi-la-yuqawam-pour-homme",
    "rasasi-la-yuqawam-pour-femme",
    "rasasi-shuhrah-pour-homme",
    "rasasi-shuhrah-pour-femme",
    "rasasi-blue-lady",
    "rasasi-daarej-extrait-pour-homme",
    "rasasi-royale-blue-pour-homme",
    "rasasi-ambar-silk",
    "rasasi-junoon-leather",
    "rasasi-rumz-al-rasasi-9325-pour-lui",
  ],
};

/** Index O(1) — évite un `includes()` sur un tableau pour chaque entrée. */
const HOUSE_SET = new Set(ON_DEMAND_HOUSES);
const HIGHLIGHT_SETS = new Map<string, Set<string>>(
  Object.entries(HOUSE_HIGHLIGHTS).map(([house, ids]) => [house, new Set(ids)]),
);

/**
 * Applique la sélection à la base complète, passée en argument.
 *
 * L'appelant fournit lui-même le tableau (obtenu par `import()` dynamique) :
 * ce module n'importe donc jamais les 792 Ko de données, il ne fait que les
 * trier. Une maison sans liste de mise en avant est reprise en entier.
 */
export function selectOnDemand(all: readonly ReferencePerfume[]): ReferencePerfume[] {
  return all.filter((p) => {
    if (!HOUSE_SET.has(p.house)) return false;
    const highlights = HIGHLIGHT_SETS.get(p.house);
    return highlights ? highlights.has(p.id) : true;
  });
}
