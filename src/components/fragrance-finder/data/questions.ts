/**
 * Les huit questions du quiz olfactif.
 *
 * Intitulés, sous-titres et options repris **tels quels** du gabarit
 * `index.html` de l'archive AD Parfumerie, moins la question « un parfum que
 * vous aimez déjà » (champ libre + autocomplétion) : elle demandait au visiteur
 * de nommer une référence extérieure au catalogue, ce que la maquette Dubaï ne
 * sait pas exploiter. Sa suppression fait passer le parcours de 9 à 8 étapes.
 *
 * Trois questions votent pour une famille olfactive — univers (4), note (6) et
 * saison (8) — exactement comme l'archive faisait voter ses questions 4, 7 et 9.
 * Les autres calibrent la sélection sans peser sur la famille.
 */
import type { QuizQuestion } from "../types";

/* ────────────────────────────────────────────────────────────────────────────
   TRANCHES DE BUDGET — recalibrées sur le catalogue Dubaï

   L'archive proposait ≤300 € / 300-600 € / 600 €+ : des totaux de trio tirés
   d'un catalogue de niche à 209 références. Le catalogue Dubaï est bien moins
   cher, ces bornes n'auraient jamais mis qu'une seule tranche en jeu.

   Relevé sur les 28 références de SEARCH_PRODUCTS (toutes ont un prix) :
     min 16,90 €  ·  1er tercile 39,90 €  ·  médiane 49,90 €
     2e tercile 59,00 €  ·  max 88,00 €  ·  moyenne 48,38 €

   Le budget porte sur le TRIO, pas sur le flacon (règle héritée de l'archive) :
     trio le moins cher possible  = 16,90 + 16,90 + 17,90 =  51,70 €
     trio médian                  = 3 × 49,90             = 149,70 €
     trio le plus cher possible   = 78,00 + 79,90 + 88,00 = 245,90 €

   On coupe aux terciles du prix unitaire, multipliés par trois — chaque tranche
   couvre alors un tiers des flacons du catalogue :
     3 × 39,90 = 119,70 → arrondi à 120 €
     3 × 59,00 = 177,00 → arrondi à 180 €

   D'où : ≤ 120 €  ·  120 – 180 €  ·  180 € et plus. Les trois bornes sont
   atteignables (51,70 ≤ 120 et 245,90 ≥ 180), aucune tranche n'est vide.
   Les libellés restent ceux de l'archive.
   ──────────────────────────────────────────────────────────────────────────── */
export const BUDGET_TIERS = [
  { label: "Petit plaisir", hint: "Jusqu'à 120 €", min: 0, max: 120 },
  { label: "Cœur de gamme", hint: "120 – 180 €", min: 120, max: 180 },
  { label: "Premium", hint: "180 € et plus", min: 180, max: 99999 },
] as const;

/* ────────────────────────────────────────────────────────────────────────────
   VISUELS

   L'archive pointait /assets/img/quiz/… : ces fichiers n'existent pas ici. Le
   repo Dubaï offre huit photos de matières dans public/assets/scents/, et rien
   d'autre qui conviendrait. On les branche sur les deux questions « matière »
   (univers et note) ; trois d'entre elles servent aux deux questions, faute de
   huitième image dédiée — les deux écrans ne sont jamais visibles ensemble.

   « Frais » n'a pas de photo dédiée : musc.jpg (musc blanc & coton) est la seule
   image claire et « propre » du jeu, c'est elle qui s'en approche le plus.

   La question « occasion » (quotidien / événement / voyage / cadeau) n'a aucune
   image plausible dans le repo : plutôt que d'inventer un visuel ou d'en
   détourner un, elle reste en pastilles typographiques. Même parti pris pour le
   budget et la saison, déjà typographiques dans l'archive.
   ──────────────────────────────────────────────────────────────────────────── */
const SCENT = "/assets/scents";

export const QUESTIONS: QuizQuestion[] = [
  {
    id: "destinataire",
    criterion: "Destinataire",
    title: "Ce parfum, c'est pour…",
    subtitle: "On adapte toute la sélection.",
    layout: "fill",
    options: [
      // Les trois aplats de l'archive (rose / marine / doré) n'existent pas
      // dans la palette Dubaï : on les rejoue en doré, brun-noir et taupe —
      // trois valeurs bien distinctes, toutes assez sombres pour du texte clair.
      { label: "Pour elle", gender: "Femme", fill: "var(--gold-700)" },
      { label: "Pour lui", gender: "Homme", fill: "var(--espresso-900)" },
      { label: "Mixte", gender: "Mixte", fill: "var(--ink-500)" },
    ],
  },
  {
    id: "experience",
    criterion: "Expérience",
    title: "C'est votre premier parfum de niche ?",
    subtitle: "Pour calibrer nos recommandations.",
    layout: "fill",
    options: [
      // L'archive teintait ces deux options en vert « succès » et rouge
      // « danger » : un rouge d'erreur pour « non » se lit comme un reproche.
      // On reste sur deux valeurs de la palette.
      { label: "Oui, je découvre", fill: "var(--gold-700)" },
      { label: "Non, j'en porte déjà", fill: "var(--espresso-800)" },
    ],
    note: {
      title: "Un parfum de niche, c'est quoi ?",
      paragraphs: [
        "Petites séries, hors grande distribution. Concentrations plus hautes, matières rares — oud, safran, ambre gris, rose de Taïf — et aucun test consommateur : le parti pris reste entier.",
        "C'est la tradition des parfumeurs du Golfe : un sillage qu'on ne croise pas sur tout le monde.",
      ],
    },
  },
  {
    id: "intensite",
    criterion: "Intensité",
    title: "Vous aimez les parfums plutôt…",
    subtitle: "Leur intensité, leur sillage.",
    layout: "gauge",
    options: [
      { label: "Légers", gauge: 1, hint: "Discret, au creux du poignet" },
      { label: "Moyens", gauge: 2, hint: "Présent sans s'imposer" },
      { label: "Intenses", gauge: 3, hint: "Sillage qui tient la journée" },
    ],
  },
  {
    id: "univers",
    criterion: "Univers",
    title: "Quel univers vous attire ?",
    subtitle: "La matière qui vous parle.",
    layout: "art",
    skip: "Je ne sais pas",
    options: [
      { label: "Ambré", hint: "Ambre, vanille, tonka", family: "ambre", image: `${SCENT}/ambre.jpg` },
      { label: "Boisé / Oud", hint: "Oud, santal, cuir", family: "boise", image: `${SCENT}/boise.jpg` },
      { label: "Floral", hint: "Rose, jasmin", family: "floral", image: `${SCENT}/floral.jpg` },
      { label: "Frais", hint: "Agrumes, marin", family: "frais", image: `${SCENT}/musc.jpg` },
    ],
  },
  {
    id: "occasion",
    criterion: "Occasion",
    title: "Pour quelle occasion ?",
    subtitle: "Pour cibler le sillage adapté au moment.",
    layout: "pill",
    options: [
      { label: "Au quotidien" },
      { label: "Événement spécial" },
      { label: "Escapade / voyage" },
      { label: "Cadeau" },
    ],
  },
  {
    id: "note",
    criterion: "Note",
    title: "Une note qui vous fait craquer ?",
    subtitle: "La matière que vous adorez sentir.",
    layout: "art",
    skip: "Je ne sais pas",
    options: [
      { label: "Rose", family: "floral", noteWords: ["rose"], image: `${SCENT}/rose.jpg` },
      { label: "Oud", family: "boise", noteWords: ["oud"], image: `${SCENT}/oud.jpg` },
      { label: "Vanille", family: "ambre", noteWords: ["vanille"], image: `${SCENT}/ambre.jpg` },
      { label: "Musc", family: "frais", noteWords: ["musc"], image: `${SCENT}/musc.jpg` },
      { label: "Safran", family: "ambre", noteWords: ["safran"], image: `${SCENT}/epice.jpg` },
      // « Bois de santal » ne figure nulle part tel quel : le catalogue écrit
      // « Santal blanc » et « Santal ». Le mot-clé est donc « santal ».
      { label: "Bois de santal", family: "boise", noteWords: ["santal"], image: `${SCENT}/boise.jpg` },
    ],
  },
  {
    id: "budget",
    criterion: "Budget",
    title: "Quel budget ?",
    subtitle: "Le montant porte sur l'ensemble des trois flacons.",
    layout: "pill",
    options: BUDGET_TIERS.map((t) => ({ label: t.label, hint: t.hint, min: t.min, max: t.max })),
  },
  {
    id: "saison",
    criterion: "Saison",
    title: "Enfin, pour quelle saison le voulez-vous ?",
    subtitle: "Le climat change tout à la tenue d'un parfum.",
    layout: "pill",
    options: [
      { label: "Printemps", family: "floral" },
      { label: "Été", family: "frais" },
      { label: "Automne", family: "boise" },
      { label: "Hiver", family: "ambre" },
      { label: "Toute saison" },
    ],
  },
];

export const QUESTION_COUNT = QUESTIONS.length;

/**
 * Repères d'étape — évite de semer des index magiques dans les composants
 * (« la question du budget », pas « answers[6] »). Calculés depuis QUESTIONS :
 * réordonner le parcours ne casse rien.
 */
export const STEP = {
  destinataire: QUESTIONS.findIndex((q) => q.id === "destinataire"),
  experience: QUESTIONS.findIndex((q) => q.id === "experience"),
  intensite: QUESTIONS.findIndex((q) => q.id === "intensite"),
  univers: QUESTIONS.findIndex((q) => q.id === "univers"),
  occasion: QUESTIONS.findIndex((q) => q.id === "occasion"),
  note: QUESTIONS.findIndex((q) => q.id === "note"),
  budget: QUESTIONS.findIndex((q) => q.id === "budget"),
  saison: QUESTIONS.findIndex((q) => q.id === "saison"),
} as const;
