/**
 * Table « nom de note → visuel de matière », partagée par les pastilles du
 * bento.
 *
 * Pourquoi un module et non un import depuis `ScentConstellation.tsx` : la
 * constellation garde sa table en interne et ne l'exporte pas, et elle est
 * destinée à disparaître au profit de `PyramidTile`. Recopier la table ici
 * permet de ne pas toucher au composant sortant ; le jour où il est retiré,
 * c'est SA copie qui part, pas celle-ci.
 *
 * La règle de résolution n'a pas changé : premier mot-clé contenu dans le nom
 * de la note (accents retirés, minuscules), donc l'ORDRE de `NOTE_KEYWORDS`
 * fait foi — le plus précis avant le plus large.
 */


/**
 * Visuels de matière, un par MATIÈRE et non plus un par famille.
 *
 * Il n'y en avait que sept — ambre, boisé, épice, floral, musc, oud, rose — et
 * chaque note y était rattachée par mot-clé. Praline, vanille, benjoin et ambre
 * gris montraient donc la même photo d'ambre ; santal, myrrhe et encens le même
 * bois. Datte et bergamote, faute de mot-clé, retombaient sur un monogramme.
 * Vingt-six visuels dédiés les remplacent ; les sept d'origine restent en
 * dernier recours pour les notes qui n'ont pas encore le leur.
 *
 * Trente visuels de plus ont ensuite couvert les 37 notes du catalogue qui
 * retombaient encore sur le monogramme (la lettre initiale dans un cercle).
 * Certains servent PLUSIEURS notes, parce que la matière photographiée est la
 * même et que deux images séparées seraient indiscernables dans un médaillon
 * de 68 px :
 *   coco             ← Noix de coco, Lait de coco
 *   creme            ← Crème fouettée, Lait concentré
 *   lavande          ← Lavande, Lavande sauvage
 *   orange           ← Orange, Orange sanguine
 *   caramel          ← Caramel, Accord gourmand (accord sans matière propre)
 *   feuilleDeTabac   ← Feuille de tabac, et toute note « tabac »
 *   moleculeSynthese ← Ambroxan, Cashmeran (molécules, aucune matière naturelle)
 *   benjoin          ← Élémi, résine molle comme lui : pas de visuel dédié
 */
const NOTE_IMAGES: Record<string, string> = {
  // — Matières propres —
  amande: "/assets/scents/amande.jpg",
  ambre: "/assets/scents/ambre.jpg",
  ambreGris: "/assets/scents/ambre-gris.jpg",
  ananas: "/assets/scents/ananas.jpg",
  anisEtoile: "/assets/scents/anis-etoile.jpg",
  armoise: "/assets/scents/armoise.jpg",
  benjoin: "/assets/scents/benjoin.jpg",
  bergamote: "/assets/scents/bergamote.jpg",
  canneASucre: "/assets/scents/canne-a-sucre.jpg",
  cannelle: "/assets/scents/cannelle.jpg",
  caramel: "/assets/scents/caramel.jpg",
  cardamome: "/assets/scents/cardamome.jpg",
  cassis: "/assets/scents/cassis.jpg",
  cedre: "/assets/scents/cedre.jpg",
  citron: "/assets/scents/citron.jpg",
  coco: "/assets/scents/coco.jpg",
  cognac: "/assets/scents/cognac.jpg",
  coriandre: "/assets/scents/coriandre.jpg",
  creme: "/assets/scents/creme.jpg",
  cuir: "/assets/scents/cuir.jpg",
  cumin: "/assets/scents/cumin.jpg",
  datte: "/assets/scents/datte.jpg",
  encens: "/assets/scents/encens.jpg",
  feuilleDeTabac: "/assets/scents/feuille-de-tabac.jpg",
  feveTonka: "/assets/scents/feve-tonka.jpg",
  fleursBlanches: "/assets/scents/fleurs-blanches.jpg",
  framboise: "/assets/scents/framboise.jpg",
  fruits: "/assets/scents/fruits.jpg",
  fruitsTropicaux: "/assets/scents/fruits-tropicaux.jpg",
  gardenia: "/assets/scents/gardenia.jpg",
  geranium: "/assets/scents/geranium.jpg",
  guimauve: "/assets/scents/guimauve.jpg",
  heliotrope: "/assets/scents/heliotrope.jpg",
  hibiscus: "/assets/scents/hibiscus.jpg",
  jasmin: "/assets/scents/jasmin.jpg",
  lavande: "/assets/scents/lavande.jpg",
  marine: "/assets/scents/marine.jpg",
  menthe: "/assets/scents/menthe.jpg",
  miel: "/assets/scents/miel.jpg",
  mineral: "/assets/scents/mineral.jpg",
  moleculeSynthese: "/assets/scents/molecule-synthese.jpg",
  muguet: "/assets/scents/muguet.jpg",
  musc: "/assets/scents/musc.jpg",
  muscade: "/assets/scents/muscade.jpg",
  myrtille: "/assets/scents/myrtille.jpg",
  noisette: "/assets/scents/noisette.jpg",
  orange: "/assets/scents/orange.jpg",
  orchidee: "/assets/scents/orchidee.jpg",
  oud: "/assets/scents/oud.jpg",
  patchouli: "/assets/scents/patchouli.jpg",
  pistache: "/assets/scents/pistache.jpg",
  pivoine: "/assets/scents/pivoine.jpg",
  poivre: "/assets/scents/poivre.jpg",
  pomme: "/assets/scents/pomme.jpg",
  praline: "/assets/scents/praline.jpg",
  reglisse: "/assets/scents/reglisse.jpg",
  rhum: "/assets/scents/rhum.jpg",
  rose: "/assets/scents/rose.jpg",
  safran: "/assets/scents/safran.jpg",
  santal: "/assets/scents/santal.jpg",
  sucreGlace: "/assets/scents/sucre-glace.jpg",
  vanille: "/assets/scents/vanille.jpg",
  vetiver: "/assets/scents/vetiver.jpg",
  // — Familles, dernier recours —
  boise: "/assets/scents/boise.jpg",
  epice: "/assets/scents/epice.jpg",
  floral: "/assets/scents/floral.jpg",
};

/**
 * Mots-clés rattachant une note à un visuel. L'ORDRE COMPTE : la première
 * entrée dont le mot est contenu dans la note gagne. Les mots les plus précis
 * passent donc avant les plus larges — « ambre gris » avant « ambre », « fève
 * tonka » avant « fève », « bois de santal » avant « bois ».
 */
const NOTE_KEYWORDS: [string, string][] = [
  // ── Pièges de sous-chaîne, à traiter EN PREMIER ─────────────────────────
  // La comparaison est un `includes` : « framBOISe » contient « bois »,
  // « menthe POIVRÉe » contient « poivre », « musc BOISé » contient « bois ».
  // Sans ces trois lignes en tête, la framboise s'affichait en rondins de
  // cèdre et la menthe en grains de poivre.
  ["framboise", "framboise"],
  ["menthe", "menthe"],
  ["musc boisé", "musc"],
  ["musc boise", "musc"],
  // « fleur d'orangER » contient « orange » : depuis que l'agrume a son visuel,
  // la fleur d'oranger et le néroli doivent être reconnus AVANT lui, sinon ils
  // s'affichent en quartier d'orange. Ces trois lignes vivaient dans la section
  // Fleurs, plus bas — trop tard dans la liste pour gagner.
  ["oranger", "floral"],
  ["néroli", "floral"],
  ["neroli", "floral"],
  // Résines et ambres — le plus précis d'abord
  ["ambre gris", "ambreGris"],
  ["ambre", "ambre"],
  ["ambré", "ambre"],
  ["labdanum", "benjoin"],
  ["benjoin", "benjoin"],
  ["résine", "benjoin"],
  ["resine", "benjoin"],
  // L'élémi est une résine molle, très proche du benjoin à l'œil : elle
  // emprunte son visuel plutôt que d'en réclamer un indiscernable.
  ["élémi", "benjoin"],
  ["myrrhe", "encens"],
  ["encens", "encens"],
  // Bois
  ["bois de santal", "santal"],
  ["santal", "santal"],
  ["cèdre", "cedre"],
  ["cedre", "cedre"],
  ["bouleau", "cedre"],
  ["bois", "boise"],
  ["vétiver", "vetiver"],
  ["vetiver", "vetiver"],
  ["patchouli", "patchouli"],
  ["oud", "oud"],
  // Cuir et tabac — matières animales et végétales séchées, ni bois ni épice
  ["cuir", "cuir"],
  ["tabac", "feuilleDeTabac"],
  // Aromatiques — plantes à feuillage, séparées des fleurs à pétales
  // « Lavande sauvage » contient « lavande » : un seul mot-clé suffit aux deux.
  ["lavande", "lavande"],
  ["armoise", "armoise"],
  // Épices
  ["anis étoilé", "anisEtoile"],
  ["anis", "anisEtoile"],
  ["cannelle", "cannelle"],
  ["cardamome", "cardamome"],
  ["coriandre", "coriandre"],
  ["cumin", "cumin"],
  ["muscade", "muscade"],
  ["poivre", "poivre"],
  ["safran", "safran"],
  ["épice", "epice"],
  ["epice", "epice"],
  // Gourmand
  ["fève tonka", "feveTonka"],
  ["feve tonka", "feveTonka"],
  ["tonka", "feveTonka"],
  ["praline", "praline"],
  ["vanille", "vanille"],
  ["datte", "datte"],
  // « Canne à SUCRE » et « SUCRE glace » n'ont rien du même visuel — des tiges
  // fibreuses d'un côté, une poudre blanche de l'autre. D'où deux mots-clés
  // complets et surtout AUCUN mot-clé « sucre » seul, qui les confondrait.
  ["canne à sucre", "canneASucre"],
  ["sucre glace", "sucreGlace"],
  // Même piège pour le lait : « LAIT de coco » va à la noix de coco, « LAIT
  // concentré » à la crème. Pas de mot-clé « lait » seul.
  ["lait de coco", "coco"],
  ["lait concentré", "creme"],
  ["noix de coco", "coco"],
  ["coco", "coco"],
  ["crème fouettée", "creme"],
  ["accord gourmand", "caramel"],
  ["caramel", "caramel"],
  ["miel", "miel"],
  ["guimauve", "guimauve"],
  ["réglisse", "reglisse"],
  ["amande", "amande"],
  ["noisette", "noisette"],
  ["pistache", "pistache"],
  // Liqueurs — notes de fond alcoolisées, vieillies en fût
  ["cognac", "cognac"],
  ["rhum", "rhum"],
  // Agrumes
  ["citron bergamote", "bergamote"],
  ["bergamote", "bergamote"],
  ["citron", "citron"],
  ["mandarine", "citron"],
  ["pamplemousse", "citron"],
  // « Orange » et « Orange sanguine » partagent ce visuel : inutile de
  // distinguer les deux, « orange » attrape la seconde par sous-chaîne.
  ["orange", "orange"],
  // Fruits
  ["myrtille", "myrtille"],
  ["cassis", "cassis"],
  ["fruits tropicaux", "fruitsTropicaux"],
  ["fruits rouges", "fruits"],
  ["fruité", "fruits"],
  ["ananas", "ananas"],
  ["pomme", "pomme"],
  ["poire", "pomme"],
  ["pêche", "fruits"],
  // Aquatique et minéral
  ["minéral", "mineral"],
  ["marine", "marine"],
  ["aquatique", "marine"],
  ["concombre", "marine"],
  ["frais", "marine"],
  // Fleurs
  ["jasmin", "jasmin"],
  ["rose", "rose"],
  ["fleurs blanches", "fleursBlanches"],
  ["fleurs", "fleursBlanches"],
  ["fleur", "floral"],
  ["gardénia", "gardenia"],
  ["géranium", "geranium"],
  ["héliotrope", "heliotrope"],
  ["hibiscus", "hibiscus"],
  ["orchidée", "orchidee"],
  ["pivoine", "pivoine"],
  ["muguet", "muguet"],
  ["iris", "floral"],
  ["lilas", "floral"],
  ["violette", "floral"],
  ["floral", "floral"],
  // Molécules de synthèse — l'ambroxan et le cashmeran n'existent pas comme
  // matière première dans la nature : un même cristal translucide les figure,
  // faute de plante ou de bois à photographier.
  ["ambroxan", "moleculeSynthese"],
  ["cashmeran", "moleculeSynthese"],
  // Musc
  ["musc", "musc"],
];

export function noteImage(note: string): string | null {
  const key = note
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
  for (const [word, image] of NOTE_KEYWORDS) {
    const plain = word.normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (key.includes(plain)) return NOTE_IMAGES[image];
  }
  return null;
}
