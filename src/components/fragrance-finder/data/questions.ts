/**
 * Les 9 questions du FragranceFinder.
 *
 * Chaque option porte un `value` slug STABLE consommé par le scoring
 * (gender:women, family:amber, note:oud, season:summer, budget:low, format:travel...).
 *
 * Les vignettes-matières (`image`) sont optionnelles (/quiz/materials/*.jpg) ;
 * en leur absence on utilise le `gradient` (dégradé radial façon mockup styleD).
 */
import type { Question } from "../types";

/** Dégradés radiaux de repli (matières olfactives) — palette or/crème du mockup. */
const G = {
  women: "radial-gradient(circle at 32% 28%, #F3D9E0, #C56B7A 78%)",
  men: "radial-gradient(circle at 32% 28%, #C9B79A, #6B5D4E 80%)",
  unisex: "radial-gradient(circle at 32% 28%, #E8D6A6, #A8801F 82%)",
  gift: "radial-gradient(circle at 32% 28%, #F6EAC8, #C8901E 82%)",

  amber: "radial-gradient(circle at 30% 26%, #F0C97A, #A8801F 80%)",
  woody: "radial-gradient(circle at 30% 26%, #B79A6A, #6B4A2B 82%)",
  floral: "radial-gradient(circle at 30% 26%, #F4CBD6, #C56B7A 80%)",
  fresh: "radial-gradient(circle at 30% 26%, #CDE7E2, #4F8A8B 82%)",

  oud: "radial-gradient(circle at 30% 26%, #8A6A45, #3A2415 84%)",
  rose: "radial-gradient(circle at 30% 26%, #F0BFCB, #B5495E 80%)",
  vanilla: "radial-gradient(circle at 30% 26%, #F7EACB, #C9A24A 80%)",
  musk: "radial-gradient(circle at 30% 26%, #ECE3D2, #B9A88C 82%)",

  seductive: "radial-gradient(circle at 30% 26%, #C97A8E, #6B2235 84%)",
  cleanfresh: "radial-gradient(circle at 30% 26%, #D7EAE6, #5E9A95 82%)",
  mysterious: "radial-gradient(circle at 30% 26%, #5A4A6B, #211628 84%)",
  cozy: "radial-gradient(circle at 30% 26%, #E7C79A, #9C6A1A 82%)",

  spring: "radial-gradient(circle at 30% 26%, #E8F0C9, #8FB05A 82%)",
  summer: "radial-gradient(circle at 30% 26%, #FCE9B8, #E0A93A 82%)",
  autumn: "radial-gradient(circle at 30% 26%, #E0A86A, #8A4A1F 84%)",
  winter: "radial-gradient(circle at 30% 26%, #D6E2EC, #5E7A92 82%)",

  citrus: "radial-gradient(circle at 30% 26%, #FBE9A6, #D9A12C 82%)",
  spicy: "radial-gradient(circle at 30% 26%, #E0935A, #9A3B1F 84%)",
  powdery: "radial-gradient(circle at 30% 26%, #F2E6DC, #C9A9A0 82%)",
  woodynote: "radial-gradient(circle at 30% 26%, #B79A6A, #6B4A2B 82%)",

  low: "radial-gradient(circle at 30% 26%, #F6EAC8, #C8B27A 82%)",
  mid: "radial-gradient(circle at 30% 26%, #EFD79B, #C8901E 82%)",
  high: "radial-gradient(circle at 30% 26%, #E5C06A, #9C6A1A 84%)",

  travel: "radial-gradient(circle at 30% 26%, #E8D6A6, #A8801F 82%)",
  signature: "radial-gradient(circle at 30% 26%, #EFD79B, #C8901E 82%)",
  discovery: "radial-gradient(circle at 30% 26%, #F6EAC8, #D8A63A 82%)",
};

export const QUESTIONS: Question[] = [
  {
    id: "gender",
    title: "Pour qui cherchez-vous ?",
    subtitle: "Le point de départ de votre signature olfactive.",
    kind: "tiles",
    options: [
      { value: "women", label: "Pour elle", gradient: G.women },
      { value: "men", label: "Pour lui", gradient: G.men },
      { value: "unisex", label: "Mixte", gradient: G.unisex },
      { value: "gift", label: "Un cadeau", gradient: G.gift },
    ],
  },
  {
    id: "family",
    title: "Quelle famille olfactive vous attire ?",
    subtitle: "La grande direction du parfum.",
    kind: "tiles",
    options: [
      { value: "amber", label: "Ambré", hint: "Chaud & enveloppant", gradient: G.amber },
      { value: "woody", label: "Boisé", hint: "Noble & racé", gradient: G.woody },
      { value: "floral", label: "Floral", hint: "Élégant & lumineux", gradient: G.floral },
      { value: "fresh", label: "Frais", hint: "Vif & aérien", gradient: G.fresh },
    ],
  },
  {
    id: "note",
    title: "Quelle note signature ?",
    subtitle: "Le cœur de la composition.",
    kind: "tiles",
    options: [
      { value: "oud", label: "Oud", gradient: G.oud },
      { value: "rose", label: "Rose", gradient: G.rose },
      { value: "vanilla", label: "Vanille", gradient: G.vanilla },
      { value: "musk", label: "Musc", gradient: G.musk },
    ],
  },
  {
    id: "ambiance",
    title: "Quelle ambiance incarner ?",
    subtitle: "Le caractère que doit révéler votre sillage.",
    kind: "tiles",
    allowSkipUnsure: true,
    options: [
      { value: "seductive", label: "Séducteur", gradient: G.seductive },
      { value: "cleanfresh", label: "Frais & net", gradient: G.cleanfresh },
      { value: "mysterious", label: "Mystérieux", gradient: G.mysterious },
      { value: "cozy", label: "Cocon chaleureux", gradient: G.cozy },
    ],
  },
  {
    id: "season",
    title: "Pour quelle saison ?",
    subtitle: "Chaque saison appelle ses accords.",
    kind: "tiles",
    options: [
      { value: "spring", label: "Printemps", gradient: G.spring },
      { value: "summer", label: "Été", gradient: G.summer },
      { value: "autumn", label: "Automne", gradient: G.autumn },
      { value: "winter", label: "Hiver", gradient: G.winter },
    ],
  },
  {
    id: "loved",
    title: "Un parfum que vous adorez déjà ?",
    subtitle: "Pour affiner — saisissez un nom, ou passez cette étape.",
    kind: "search",
    allowSkip: true,
  },
  {
    id: "note2",
    title: "Une seconde note qui vous parle ?",
    subtitle: "Pour nuancer le sillage.",
    kind: "tiles",
    allowSkipUnsure: true,
    options: [
      { value: "citrus", label: "Agrumes", gradient: G.citrus },
      { value: "spicy", label: "Épices", gradient: G.spicy },
      { value: "powdery", label: "Poudré", gradient: G.powdery },
      { value: "woody", label: "Boisé", gradient: G.woodynote },
    ],
  },
  {
    id: "budget",
    title: "Quel budget visez-vous ?",
    subtitle: "Nous filtrons pour rester dans votre fourchette.",
    kind: "tiles",
    options: [
      { value: "low", label: "Accessible", hint: "Jusqu'à 40 €", gradient: G.low },
      { value: "mid", label: "Intermédiaire", hint: "40 – 65 €", gradient: G.mid },
      { value: "high", label: "Signature", hint: "65 € et +", gradient: G.high },
    ],
  },
  {
    id: "format",
    title: "Quel format préférez-vous ?",
    subtitle: "Pour terminer votre profil.",
    kind: "tiles",
    options: [
      { value: "travel", label: "Format voyage", hint: "Léger & nomade", gradient: G.travel },
      { value: "signature", label: "Flacon signature", hint: "Le grand format", gradient: G.signature },
      { value: "discovery", label: "Coffret découverte", hint: "Plusieurs sillages", gradient: G.discovery },
    ],
  },
];

export const QUESTION_COUNT = QUESTIONS.length;
