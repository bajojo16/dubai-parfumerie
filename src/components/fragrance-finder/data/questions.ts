/**
 * Les 9 questions du FragranceFinder.
 *
 * Chaque option porte un `value` slug STABLE consommé par le scoring
 * (full slug = `<id>:<value>` côté logique métier ; ici on stocke juste `<value>`).
 * Exemples : gender:women, level:beginner, intensity:3, family:amber,
 * season:summer, note:saffron, budget:low, format:travel.
 *
 * Les vignettes-matières (`image`) sont optionnelles (/quiz/materials/*.jpg) ;
 * en leur absence on utilise le `gradient` (dégradé radial façon mockup styleD).
 *
 * Les options `fullWidth: true` (« Je ne sais pas », value:"none") sont rendues
 * en pleine largeur sous la grille et n'appliquent AUCUN filtre (ignorées par le scoring).
 */
import type { Question } from "../types";

/** Dégradés radiaux de repli (matières olfactives) — palette or/crème du mockup. */
const G = {
  // Q1 — genre
  women: "radial-gradient(circle at 32% 28%, #F3D9E0, #C56B7A 78%)",
  men: "radial-gradient(circle at 32% 28%, #C9B79A, #6B5D4E 80%)",
  unisex: "radial-gradient(circle at 32% 28%, #E8D6A6, #A8801F 82%)",
  gift: "radial-gradient(circle at 32% 28%, #F6EAC8, #C8901E 82%)",

  // Q2 — niveau
  beginner: "radial-gradient(circle at 30% 26%, #FBF1D6, #D8B560 82%)",
  expert: "radial-gradient(circle at 30% 26%, #D9B872, #8A661B 84%)",

  // Q3 — intensité
  light: "radial-gradient(circle at 30% 26%, #FCF4DD, #E4CE92 82%)",
  medium: "radial-gradient(circle at 30% 26%, #EFD79B, #C8901E 82%)",
  intense: "radial-gradient(circle at 30% 26%, #C99A3C, #6E4A12 84%)",

  // Q4 — famille
  amber: "radial-gradient(circle at 30% 26%, #F0C97A, #A8801F 80%)",
  woody: "radial-gradient(circle at 30% 26%, #B79A6A, #6B4A2B 82%)",
  floral: "radial-gradient(circle at 30% 26%, #F4CBD6, #C56B7A 80%)",
  fresh: "radial-gradient(circle at 30% 26%, #CDE7E2, #4F8A8B 82%)",

  // Q5 — saison
  summer: "radial-gradient(circle at 30% 26%, #FCE9B8, #E0A93A 82%)",
  winter: "radial-gradient(circle at 30% 26%, #D6E2EC, #5E7A92 82%)",
  allseasons: "radial-gradient(circle at 30% 26%, #EFD79B, #C8901E 82%)",
  noseason: "radial-gradient(circle at 30% 26%, #F2ECDD, #C9B98C 82%)",

  // Q7 — note
  oud: "radial-gradient(circle at 30% 26%, #8A6A45, #3A2415 84%)",
  rose: "radial-gradient(circle at 30% 26%, #F0BFCB, #B5495E 80%)",
  vanilla: "radial-gradient(circle at 30% 26%, #F7EACB, #C9A24A 80%)",
  musk: "radial-gradient(circle at 30% 26%, #ECE3D2, #B9A88C 82%)",
  saffron: "radial-gradient(circle at 30% 26%, #F4C66A, #C2641A 84%)",
  sandalwood: "radial-gradient(circle at 30% 26%, #D8BE93, #8A6A3E 84%)",

  // Q8 — budget
  low: "radial-gradient(circle at 30% 26%, #F6EAC8, #C8B27A 82%)",
  mid: "radial-gradient(circle at 30% 26%, #EFD79B, #C8901E 82%)",
  high: "radial-gradient(circle at 30% 26%, #E5C06A, #9C6A1A 84%)",

  // Q9 — format
  sample: "radial-gradient(circle at 30% 26%, #F6EAC8, #D8A63A 82%)",
  bottle: "radial-gradient(circle at 30% 26%, #EFD79B, #C8901E 82%)",
  giftbox: "radial-gradient(circle at 30% 26%, #F6EAC8, #C8901E 82%)",
  travel: "radial-gradient(circle at 30% 26%, #E8D6A6, #A8801F 82%)",
};

export const QUESTIONS: Question[] = [
  // Q1
  {
    id: "gender",
    title: "Ce parfum, c'est pour…",
    subtitle: "On adapte toute la sélection.",
    kind: "tiles",
    options: [
      { value: "women", label: "Pour elle", gradient: G.women },
      { value: "men", label: "Pour lui", gradient: G.men },
      { value: "unisex", label: "Mixte", gradient: G.unisex },
      { value: "gift", label: "Un cadeau", gradient: G.gift },
    ],
  },
  // Q2
  {
    id: "level",
    title: "C'est votre premier parfum oriental ?",
    subtitle: "Pour calibrer nos recommandations.",
    kind: "tiles",
    options: [
      { value: "beginner", label: "Oui, je découvre", gradient: G.beginner },
      { value: "expert", label: "Non, j'en porte déjà", gradient: G.expert },
    ],
  },
  // Q3
  {
    id: "intensity",
    title: "Vous aimez les parfums plutôt…",
    subtitle: "Leur intensité, leur sillage.",
    kind: "tiles",
    options: [
      { value: "1", label: "Légers", gradient: G.light },
      { value: "2", label: "Moyens", gradient: G.medium },
      { value: "3", label: "Intenses", gradient: G.intense },
    ],
  },
  // Q4
  {
    id: "family",
    title: "Quelle ambiance vous attire ?",
    subtitle: "Touchez la matière qui vous parle.",
    kind: "tiles",
    options: [
      { value: "amber", label: "Ambré", hint: "Ambre, vanille, tonka", gradient: G.amber },
      { value: "woody", label: "Boisé / Oud", hint: "Oud, santal, cuir", gradient: G.woody },
      { value: "floral", label: "Floral", hint: "Rose, jasmin", gradient: G.floral },
      { value: "fresh", label: "Frais", hint: "Agrumes, marin", gradient: G.fresh },
      { value: "none", label: "Je ne sais pas", fullWidth: true },
    ],
  },
  // Q5
  {
    id: "season",
    title: "Un parfum de saison ?",
    subtitle: "Pour ajuster fraîcheur et chaleur.",
    kind: "tiles",
    options: [
      { value: "summer", label: "Plutôt estival", hint: "Frais, léger", gradient: G.summer },
      { value: "winter", label: "Plutôt hivernal", hint: "Chaud, intense", gradient: G.winter },
      { value: "all", label: "Polyvalent", hint: "Toute l'année", gradient: G.allseasons },
      { value: "none", label: "Peu importe", hint: "Sans préférence", gradient: G.noseason },
    ],
  },
  // Q6
  {
    id: "loved",
    title: "Un parfum que vous adorez déjà ?",
    subtitle: "Tapez son nom, on s'en inspire pour viser juste.",
    kind: "search",
    allowSkip: true,
  },
  // Q7
  {
    id: "note",
    title: "Une note qui vous fait craquer ?",
    subtitle: "La matière que vous adorez sentir.",
    kind: "tiles",
    options: [
      { value: "rose", label: "Rose", gradient: G.rose },
      { value: "oud", label: "Oud", gradient: G.oud },
      { value: "vanilla", label: "Vanille", gradient: G.vanilla },
      { value: "musk", label: "Musc", gradient: G.musk },
      { value: "saffron", label: "Safran", gradient: G.saffron },
      { value: "sandalwood", label: "Bois de santal", gradient: G.sandalwood },
      { value: "none", label: "Je ne sais pas", fullWidth: true },
    ],
  },
  // Q8
  {
    id: "budget",
    title: "Quel budget ?",
    subtitle: "Pour vous proposer le bon format.",
    kind: "tiles",
    options: [
      { value: "low", label: "Accessible", hint: "< 30 €", gradient: G.low },
      { value: "mid", label: "Cœur de gamme", hint: "30 – 60 €", gradient: G.mid },
      { value: "high", label: "Premium", hint: "> 60 €", gradient: G.high },
    ],
  },
  // Q9
  {
    id: "format",
    title: "Quel format préférez-vous ?",
    subtitle: "On finit sur le bon produit.",
    kind: "tiles",
    options: [
      { value: "sample", label: "Échantillon", hint: "Découverte", gradient: G.sample },
      { value: "bottle", label: "Flacon", hint: "Format complet", gradient: G.bottle },
      { value: "gift", label: "Coffret", hint: "À offrir", gradient: G.giftbox },
      { value: "travel", label: "Voyage", hint: "Vaporisateur poche", gradient: G.travel },
    ],
  },
];

export const QUESTION_COUNT = QUESTIONS.length;
