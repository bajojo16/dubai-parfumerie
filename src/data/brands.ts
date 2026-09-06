/**
 * Maisons du catalogue — source unique.
 *
 * Extrait de `app/[locale]/marques/page.tsx` pour être partagé avec la recherche
 * (`search-catalog.ts`), qui propose les maisons à côté des parfums et des notes.
 * En production : résolu depuis le back-office (vendors / collections).
 *
 * `logo` est OPTIONNEL et le restera : `public/brands/` ne tient que les logos
 * que la boutique a pu obtenir en qualité suffisante — les onze maisons de cette
 * liste en ont un aujourd'hui, mais la règle reste la même pour la prochaine
 * venue. Une maison sans logo n'est pas une maison en défaut — la page
 * « Marques » lui affiche son monogramme, exactement comme les cartes de la
 * commande à la demande. Inventer un logo serait pire que ne pas en afficher :
 * c'est une marque déposée, pas un visuel d'illustration.
 *
 * Les cinq logos ajoutés en dernier (Armaf, Gulf Orchid, Surrati, Khadlaj,
 * Arabiyat Prestige) viennent des sites officiels des maisons, recadrés au même
 * gabarit que les autres (1000 × 747, fond #faf9f7, marge 15 %). Celui de Surrati
 * n'existait qu'en blanc sur fond transparent : même tracé, encre passée au noir.
 *
 * `image` est la photo de la carte. Les six maisons dont `public/brands/` tient
 * le rendu or sur noir (`-hover.jpg`) le portent en carte : une carte de maison
 * qui montre un flacon pris au hasard dans le catalogue ne dit rien de la
 * maison. Les cinq autres portent leur logo tel quel, faute de rendu or —
 * mieux qu'une photo de catégorie partagée avec d'autres écrans.
 *
 * `country` remplace l'ancienne `city` : la carte annonçait « Dubai » pour sept
 * maisons sur onze, ce qui ne distinguait plus rien. Le pays d'origine situe la
 * maison sans faire croire à une adresse.
 */

export const BRANDS = [
  {
    name: "Lattafa",
    logo: "/brands/lattafa.jpg",
    country: "Émirats arabes unis",
    countryFlag: "🇦🇪",
    founded: 1980,
    refs: "80+ références",
    description:
      "Maison pionnière des parfums arabes, Lattafa est reconnue pour ses créations riches en oud et en musc, alliant tradition et modernité.",
    image: "/brands/lattafa-hover.jpg",
  },
  {
    name: "Reef",
    logo: "/brands/reef.jpg",
    country: "Émirats arabes unis",
    countryFlag: "🇦🇪",
    founded: 2005,
    refs: "50+ références",
    description:
      "Née à Dubaï, Reef Perfumes capture l'essence de la vie contemporaine du Golfe avec des fragrances fraîches et sophistiquées.",
    image: "/brands/reef-hover.jpg",
  },
  {
    name: "Al Haramain",
    logo: "/brands/alharamain.jpg",
    country: "Arabie saoudite",
    countryFlag: "🇸🇦",
    founded: 1970,
    refs: "100+ références",
    description:
      "Fondée près des lieux saints, Al Haramain est l'une des plus anciennes et prestigieuses maisons de parfumerie du monde arabe.",
    image: "/brands/alharamain-hover.jpg",
  },
  {
    name: "Ahmed Al Maghribi",
    logo: "/brands/ahmed.jpg",
    country: "Maroc",
    countryFlag: "🇲🇦",
    founded: 1998,
    refs: "40+ références",
    description:
      "Fusion unique entre les traditions parfumées du Maroc et du Golfe, cette maison propose des créations envoûtantes et sensuelles.",
    image: "/brands/ahmed-hover.jpg",
  },
  {
    name: "Armaf",
    logo: "/brands/armaf.jpg",
    country: "Émirats arabes unis",
    countryFlag: "🇦🇪",
    founded: 2014,
    refs: "60+ références",
    description:
      "Jeune maison ambitieuse de Dubaï, Armaf s'est imposée avec des parfums de haute qualité à des prix accessibles.",
    image: "/brands/armaf.jpg",
  },
  {
    name: "Swiss Arabian",
    logo: "/brands/swissarabian.jpg",
    country: "Émirats arabes unis",
    countryFlag: "🇦🇪",
    founded: 1974,
    refs: "70+ références",
    description:
      "Pionnière de la parfumerie de luxe à Dubaï, Swiss Arabian marie l'expertise européenne aux ingrédients précieux de l'Orient.",
    image: "/brands/swissarabian-hover.jpg",
  },
  {
    name: "Paris Corner",
    logo: "/brands/pariscorner.jpg",
    country: "Émirats arabes unis",
    countryFlag: "🇦🇪",
    founded: 2010,
    refs: "45+ références",
    description:
      "Maison moderne inspirée du glamour parisien et de l'opulence dubaïote, pour une parfumerie résolument contemporaine.",
    // Rendu or plutôt que /assets/cat-femme.jpg : ce visuel-là est la vignette
    // de la catégorie « Femme », partagée avec d'autres écrans — deux maisons
    // voisines pouvaient donc s'afficher sous la même photo, qui en plus ne
    // montrait aucun de leurs flacons. Arabiyat Prestige, un temps passée au
    // packshot Marwa pour la même raison, porte aujourd'hui son logo.
    image: "/brands/pariscorner-hover.jpg",
  },
  {
    name: "Gulf Orchid",
    logo: "/brands/gulforchid.jpg",
    country: "Émirats arabes unis",
    countryFlag: "🇦🇪",
    founded: 1987,
    refs: "35+ références",
    description:
      "Spécialiste des huiles de parfum et des attars, Gulf Orchid perpétue les traditions olfactives du Golfe Persique.",
    image: "/brands/gulforchid.jpg",
  },
  {
    name: "Surrati",
    logo: "/brands/surrati.jpg",
    country: "Arabie saoudite",
    countryFlag: "🇸🇦",
    founded: 1929,
    refs: "55+ références",
    description:
      "Grande maison saoudienne aux racines profondes, Surrati est synonyme de parfums généreux, enveloppants et durables.",
    image: "/brands/surrati.jpg",
  },
  {
    name: "Khadlaj",
    logo: "/brands/khadlaj.jpg",
    country: "Émirats arabes unis",
    countryFlag: "🇦🇪",
    founded: 1997,
    refs: "30+ références",
    description:
      "Maison artisanale de Dubaï privilégiant les matières premières nobles : oud de qualité supérieure, roses de Taïf et musc pur.",
    image: "/brands/khadlaj.jpg",
  },
  {
    name: "Arabiyat Prestige",
    logo: "/brands/arabiyatprestige.jpg",
    country: "Émirats arabes unis",
    countryFlag: "🇦🇪",
    // Année du groupe My Perfumes (Dubaï), la maison mère derrière Arabiyat —
    // pas celle de la ligne « Prestige », qui est plus récente et que nous
    // n'avons pas pu dater. À confirmer avant une mise en production.
    founded: 2007,
    // Compte réel des références Arabiyat présentes dans `reference-perfumes.ts`,
    // pas une promesse marketing arrondie comme les entrées voisines.
    refs: "39 références",
    description:
      "Ligne haute couture d'Arabiyat, Prestige habille des compositions gourmandes et florales dans des flacons sculptés — verre teinté, arabesques dorées, bouchons taillés.",
    image: "/brands/arabiyatprestige.jpg",
  },
] as const;

export type Brand = (typeof BRANDS)[number];
