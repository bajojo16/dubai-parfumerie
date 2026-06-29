/**
 * Thème centralisé "Tendances du moment".
 * Pour changer l'apparence : modifier `ACTIVE_PRESET` ci-dessous (un seul token).
 * Les composants lisent les couleurs via la prop `theme` (défaut = preset actif).
 * AUCUNE couleur en dur dans le JSX des composants.
 */

export type TrendTheme = {
  bg: string;       // fond de la section
  card: string;     // fond de la carte
  border: string;   // bordure de la carte
  rankBg: string;   // fond du badge rang
  rankText: string; // texte du badge rang
  brand: string;    // texte marque
  name: string;     // titre produit
  price: string;    // prix
  cta: string;      // fond bouton panier
  ctaText: string;  // texte bouton panier
  kicker: string;   // sur-titre section (@dubaiparfumerie)
  title: string;    // titre h2
  sub: string;      // sous-titre
};

export type TrendPresetKey = "cream" | "emerald" | "wine" | "midnight";

export const TREND_THEME: Record<TrendPresetKey, TrendTheme> = {
  cream: {
    bg: "#FAF5EA",
    card: "#FFFFFF",
    border: "#ECE4D4",
    rankBg: "#15110D",
    rankText: "#E8C873",
    brand: "#A8915F",
    name: "#2C2620",
    price: "#A8801F",
    cta: "#C4A24F",
    ctaText: "#FFFFFF",
    kicker: "#A8801F",
    title: "#2C2620",
    sub: "#6A6051",
  },
  emerald: {
    bg: "#0F211C",
    card: "#143029",
    border: "#1E463A",
    rankBg: "#5FCFA0",
    rankText: "#0F211C",
    brand: "#6F9B86",
    name: "#E6F2EC",
    price: "#7FD9B3",
    cta: "#3A9B75",
    ctaText: "#0F211C",
    kicker: "#5FCFA0",
    title: "#E6F2EC",
    sub: "#A59B8A",
  },
  wine: {
    bg: "#241019",
    card: "#341622",
    border: "#4A2030",
    rankBg: "#D98CA8",
    rankText: "#241019",
    brand: "#A8728A",
    name: "#F3E3EA",
    price: "#E8C873",
    cta: "#C4A24F",
    ctaText: "#241019",
    kicker: "#D98CA8",
    title: "#F3E3EA",
    sub: "#A59B8A",
  },
  midnight: {
    bg: "#0E1822",
    card: "#142433",
    border: "#1E3647",
    rankBg: "#E8C873",
    rankText: "#0E1822",
    brand: "#6F8BA8",
    name: "#E3EDF5",
    price: "#E8C873",
    cta: "#C4A24F",
    ctaText: "#0E1822",
    kicker: "#6BB6E0",
    title: "#E3EDF5",
    sub: "#A59B8A",
  },
};

/** Preset actif par défaut — changer cette seule valeur pour basculer le thème. */
export const ACTIVE_PRESET: TrendPresetKey = "cream";

/** Helper : renvoie le thème pour une clé (défaut = preset actif). */
export function getTrendTheme(key: TrendPresetKey = ACTIVE_PRESET): TrendTheme {
  return TREND_THEME[key];
}
