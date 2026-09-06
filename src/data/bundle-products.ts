/**
 * BundleProduct — sélection curée démo pour l'offre « 3 parfums pour le prix de 2 ».
 *
 * Démo embarquée : chaque référence pointe vers le packshot de SON flacon
 * (/assets/products/*.webp, ou le PNG détouré de /assets/oils/ pour les huiles),
 * pour que le nom affiché sur la carte corresponde bien au flacon montré.
 * Les rares références sans photo en banque restent sur un visuel générique
 * /assets/prod-*.jpg — à remplacer dès que la photo produit existe.
 * En production, id/nom/marque/prix/stock seraient résolus côté serveur depuis
 * le catalogue (et l'éligibilité au lot via la collection `lot-3-pour-2`).
 *
 * Champs alignés sur la maquette de référence (lot-3-pour-2.html) :
 *   - `notes`     → notes olfactives affichées sous le nom (comme la maquette)
 *   - `was`       → prix barré (référence) affiché à côté du prix actuel
 *   - `badge`     → pastille optionnelle (ex. « Best-seller »)
 *   - `available` → `false` simule une rupture de stock (bouton « Épuisé »)
 * `brand` est conservé pour l'ajout au panier réel (`addItem`).
 */
export type BundleProduct = {
  id: string;
  name: string;
  brand: string;
  notes: string;
  /**
   * Famille olfactive dominante, quand le lot est la SEULE source du flacon
   * (Oud Royal, Silk Rose) : ailleurs la fiche rédigée ou le rail la déclare
   * déjà et gagne la déduplication.
   */
  family?: string;
  price: number;
  was: number;
  image: string;
  available: boolean;
  badge?: string;
};

export const BUNDLE_PRODUCTS: BundleProduct[] = [
  {
    id: "bundle-aurum",
    name: "Aurum",
    brand: "Reef",
    notes: "Ambre, Bois de santal",
    price: 75,
    was: 129.9,
    image: "/assets/products/aurum.webp",
    available: true,
    badge: "Best-seller",
  },
  {
    id: "bundle-tanasuk",
    name: "Tanasuk",
    brand: "Al Haramain",
    notes: "Oud, Rose, Safran",
    price: 54.9,
    was: 109.9,
    // Packshot de l'extrait de parfum, flacon rouge et noir, repris de la fiche
    // de la boutique. L'entrée porte un prix d'eau de parfum : c'est ce
    // flacon-là qu'elle vend, pas le flacon d'huile ciselé émaillé de
    // `oils/tanasuk.png` — qui est bien un Tanasuk lui aussi, mais la version
    // huile 12 ml, vendue moitié prix.
    image: "/assets/products/dp/al-haramain-tanasuk/dp_parfumerie-al-haramain-tanasuk-01.webp",
    available: true,
  },
  {
    id: "bundle-noora",
    name: "Noora",
    brand: "Al Haramain",
    notes: "Vanille, Musc blanc",
    price: 44.9,
    was: 89.9,
    // `oils/noora.png` était un gros plan du bouchon : recadré en carte, il ne
    // laissait voir qu'une bande dorée et la moitié du mot « NOORA ». Packshot
    // entier repris de la fiche de la boutique.
    image: "/assets/products/dp/al-haramain-noora/dp_parfumerie-al-haramain-noora-01.webp",
    available: true,
  },
  {
    id: "bundle-summer",
    name: "Summer",
    brand: "Reef",
    notes: "Poire, Ambre, Santal",
    price: 49.9,
    was: 99.9,
    image: "/assets/products/summer.webp",
    available: true,
  },
  {
    id: "bundle-volcano",
    name: "Volcano",
    brand: "Reef",
    notes: "Encens, Cuir, Épices",
    price: 59.9,
    was: 119.9,
    image: "/assets/products/volcano.webp",
    // Rupture de stock démo : non sélectionnable, bouton « Épuisé ».
    available: false,
  },
  {
    id: "bundle-oud-royal",
    name: "Oud Royal",
    brand: "Ard Al Zaafaran",
    notes: "Oud, Ambre gris, Encens",
    family: "Boisé",
    price: 69.9,
    was: 139.9,
    // Pas de photo de ce flacon en banque : visuel générique conservé (à remplacer).
    image: "/assets/prod-6.jpg",
    available: true,
  },
  {
    id: "bundle-silk-rose",
    name: "Silk Rose",
    brand: "Lattafa",
    notes: "Rose de Taïf, Pivoine",
    family: "Floral",
    price: 39.9,
    was: 79.9,
    // « Silk Rose » de Lattafa n'existe ni en banque ni au catalogue de la
    // boutique : c'est une référence de démonstration. `prod-1.jpg` montrait un
    // Reef Al Hub, étiquette lisible — un autre parfum, nommément identifiable.
    // Le flacon d'huile détouré ne prétend au moins être personne.
    image: "/assets/oils/silk.png",
    available: true,
  },
];
