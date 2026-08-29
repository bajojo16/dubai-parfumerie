/**
 * Maisons du catalogue — source unique.
 *
 * Extrait de `app/[locale]/marques/page.tsx` pour être partagé avec la recherche
 * (`search-catalog.ts`), qui propose les maisons à côté des parfums et des notes.
 * En production : résolu depuis le back-office (vendors / collections).
 */

export const BRANDS = [
  {
    name: "Lattafa",
    city: "Sharjah",
    cityFlag: "🇦🇪",
    founded: 1980,
    refs: "80+ références",
    description:
      "Maison pionnière des parfums arabes, Lattafa est reconnue pour ses créations riches en oud et en musc, alliant tradition et modernité.",
    image: "/assets/prod-1.jpg",
  },
  {
    name: "Reef",
    city: "Dubai",
    cityFlag: "🇦🇪",
    founded: 2005,
    refs: "50+ références",
    description:
      "Née à Dubaï, Reef Perfumes capture l'essence de la vie contemporaine du Golfe avec des fragrances fraîches et sophistiquées.",
    image: "/assets/prod-2.jpg",
  },
  {
    name: "Al Haramain",
    city: "La Mecque",
    cityFlag: "🇸🇦",
    founded: 1970,
    refs: "100+ références",
    description:
      "Fondée près des lieux saints, Al Haramain est l'une des plus anciennes et prestigieuses maisons de parfumerie du monde arabe.",
    image: "/assets/prod-3.jpg",
  },
  {
    name: "Ahmed Al Maghribi",
    city: "Maroc",
    cityFlag: "🇲🇦",
    founded: 1998,
    refs: "40+ références",
    description:
      "Fusion unique entre les traditions parfumées du Maroc et du Golfe, cette maison propose des créations envoûtantes et sensuelles.",
    image: "/assets/prod-4.jpg",
  },
  {
    name: "Armaf",
    city: "Dubai",
    cityFlag: "🇦🇪",
    founded: 2014,
    refs: "60+ références",
    description:
      "Jeune maison ambitieuse de Dubaï, Armaf s'est imposée avec des parfums de haute qualité à des prix accessibles.",
    image: "/assets/prod-5.jpg",
  },
  {
    name: "Swiss Arabian",
    city: "Dubai",
    cityFlag: "🇦🇪",
    founded: 1974,
    refs: "70+ références",
    description:
      "Pionnière de la parfumerie de luxe à Dubaï, Swiss Arabian marie l'expertise européenne aux ingrédients précieux de l'Orient.",
    image: "/assets/prod-6.jpg",
  },
  {
    name: "Paris Corner",
    city: "Dubai",
    cityFlag: "🇦🇪",
    founded: 2010,
    refs: "45+ références",
    description:
      "Maison moderne inspirée du glamour parisien et de l'opulence dubaïote, pour une parfumerie résolument contemporaine.",
    // Packshot Rifaaqat plutôt que /assets/cat-femme.jpg : ce visuel-là est la
    // vignette de la catégorie « Femme », partagée avec d'autres écrans — deux
    // maisons voisines pouvaient donc s'afficher sous la même photo, qui en
    // plus ne montrait aucun de leurs flacons. Même correction que pour
    // Arabiyat Prestige, passée au packshot Marwa.
    image: "/assets/products/rifaaqat/rifaaqat-hf-01.jpg",
  },
  {
    name: "Gulf Orchid",
    city: "Koweït",
    cityFlag: "🇰🇼",
    founded: 1997,
    refs: "35+ références",
    description:
      "Spécialiste des huiles de parfum et des attars, Gulf Orchid perpétue les traditions olfactives du Golfe Persique.",
    image: "/assets/cat-homme.jpg",
  },
  {
    name: "Surrati",
    city: "Médine",
    cityFlag: "🇸🇦",
    founded: 1978,
    refs: "55+ références",
    description:
      "Grande maison saoudienne aux racines profondes, Surrati est synonyme de parfums généreux, enveloppants et durables.",
    image: "/assets/cat-mixte.jpg",
  },
  {
    name: "Khadlaj",
    city: "Dubai",
    cityFlag: "🇦🇪",
    founded: 2008,
    refs: "30+ références",
    description:
      "Maison artisanale de Dubaï privilégiant les matières premières nobles : oud de qualité supérieure, roses de Taïf et musc pur.",
    image: "/assets/coffrets.jpg",
  },
  {
    name: "Arabiyat Prestige",
    city: "Dubai",
    cityFlag: "🇦🇪",
    // Année du groupe My Perfumes (Dubaï), la maison mère derrière Arabiyat —
    // pas celle de la ligne « Prestige », qui est plus récente et que nous
    // n'avons pas pu dater. À confirmer avant une mise en production.
    founded: 2007,
    // Compte réel des références Arabiyat présentes dans `reference-perfumes.ts`,
    // pas une promesse marketing arrondie comme les entrées voisines.
    refs: "39 références",
    description:
      "Ligne haute couture d'Arabiyat, Prestige habille des compositions gourmandes et florales dans des flacons sculptés — verre teinté, arabesques dorées, bouchons taillés.",
    image: "/assets/products/marwa/marwa-packshot.jpg",
  },
] as const;

export type Brand = (typeof BRANDS)[number];
