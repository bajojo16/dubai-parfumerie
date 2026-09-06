/**
 * OilProduct — huiles de parfum concentrées, cartes « Ajmal-style »
 * (flacon qui déborde au-dessus du haut de la carte).
 *
 * En production : bottleImage / decorAccents pointeront vers des assets dédiés,
 * et le prix/stock/variante sont résolus côté serveur via `slug`.
 * `bottleImage` doit être un PNG détouré (fond transparent) : la carte fait
 * déborder le flacon hors du cadre avec un `drop-shadow`, un fond opaque
 * découperait un rectangle visible. Chaque huile pointe donc vers SON propre
 * détourage dans /assets/oils/ — jamais un flacon générique, sinon le nom
 * affiché ne correspond pas au visuel.
 * Les icônes de familles pointent vers /assets/scents/*.jpg
 * (fallback pastille or si manquant).
 * decorAccents est optionnel : aucun asset "accent" décoratif n'existe
 * encore dans public/, donc on ne le renseigne pas (évite les 404).
 */
export type OilFamily = {
  label: string;
  icon: string;
};

export type OilProduct = {
  slug: string;
  name: string;
  brand: string;
  href: string;
  variantId: string;
  bottleImage: string;
  decorAccents?: string[];
  volume: string;
  gender: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  families: OilFamily[];
  available: boolean;
};

export const DEMO: OilProduct[] = [
  {
    slug: "tanasuk",
    name: "Tanasuk",
    brand: "Al Haramain",
    href: "/produit/tanasuk",
    variantId: "tanasuk",
    // Le détourage d'origine, replacé au centre d'un carré transparent. Il
    // faisait 521 x 1200, soit un rapport de 0,43 : dans une carte quasi carrée
    // en `object-fit: cover`, le bouchon couronne et le socle ciselé sortaient
    // du cadre et il ne restait que la spirale émaillée, méconnaissable. Le
    // packshot de la boutique règle bien le cadrage mais arrive sur un fond
    // blanc filigrané, qui pose un rectangle blanc au milieu de la carte crème.
    bottleImage: "/assets/oils/dp_parfumerie-al-haramain-tanasuk-huile-01.webp",
    volume: "12 ml",
    gender: "Mixte",
    price: 34.9,
    compareAtPrice: 49.9,
    rating: 4.9,
    reviewCount: 214,
    families: [
      { label: "Ambré", icon: "/assets/scents/ambre.jpg" },
      { label: "Oud", icon: "/assets/scents/oud.jpg" },
      { label: "Épicé", icon: "/assets/scents/epice.jpg" },
    ],
    available: true,
  },
  {
    slug: "noora",
    name: "Noora",
    brand: "Al Haramain",
    href: "/produit/noora",
    variantId: "noora",
    // Rendu Higgsfield du 01/07/26. Le packshot d'origine faisait 268 x 600,
    // soit un rapport de 0,45 : dans une carte quasi carrée en
    // `object-fit: cover`, il ne restait que la bande du milieu — le bouchon
    // serti et le socle sortaient du cadre, et la carte montrait un tube doré
    // anonyme. Ce cadrage-ci est fait pour le format : le flacon entier tient
    // au centre, posé sur la pierre, avec de la marge des deux côtés.
    bottleImage: "/assets/oils/dp_parfumerie-al-haramain-noora-huile-01.webp",
    volume: "12 ml",
    gender: "Femme",
    price: 27.9,
    compareAtPrice: 39.9,
    rating: 5.0,
    reviewCount: 98,
    families: [
      { label: "Rosé", icon: "/assets/scents/rose.jpg" },
      { label: "Ambré", icon: "/assets/scents/ambre.jpg" },
      { label: "Boisé", icon: "/assets/scents/boise.jpg" },
    ],
    available: false,
  },
];
