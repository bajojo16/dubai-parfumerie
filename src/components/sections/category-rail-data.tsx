import type { Category } from "./CategoryRail";
import {
  AttarBottleIcon,
  Bottle50mlIcon,
  DiffuserIcon,
  LaurelStarIcon,
  PromoContent,
  SprayBottleIcon,
  TravelBottleIcon,
} from "./category-icons";

/* ──────────────────────────────────────────────────────────────────────────
   Données démo CategoryRail — 7 entrées, libellés FR par défaut.
   href : routes RÉELLES existantes sous src/app/[locale]/ (voir mapping dans
   le rapport de fix — anciennement /categorie/<slug>, qui n'existait pas).
   Bestsellers + offre-duo portent leur SVG dédié (jamais d'image).
   "bestsellers", "Mixte" et "Eau de parfum" n'ont pas de route dédiée dans le
   projet : redirigées vers /promo-flash (listing générique le plus proche).
   "offre-duo" : href de secours réel ; le clic est intercepté par
   onCategoryClick (_home-client.tsx) pour ouvrir la modale BundleBuilder.
   ────────────────────────────────────────────────────────────────────────── */

export const DEMO_CATEGORIES: Category[] = [
  {
    slug: "bestsellers",
    href: "/promo-flash",
    variant: "bestseller",
    name: "Best-sellers",
    meta: "Les plus aimés",
    image: "/assets/categories/bestsellers.png",
    imagePosition: "center 40%",
    icon: <LaurelStarIcon />,
  },
  {
    slug: "offre-duo",
    href: "/offres/lot-3-pour-2",
    variant: "promo",
    name: "3 pour 2 acheté",
    meta: "Le 3ᵉ offert",
    image: "/assets/categories/lot-3-2.png",
    icon: <PromoContent big="3=2" small="3ᵉ OFFERT" />,
  },
  {
    slug: "parfum-interieur",
    href: "/parfums-homme",
    variant: "default",
    name: "Homme",
    meta: "Pour lui",
    image: "/assets/categories/homme.png",
    icon: <DiffuserIcon />,
  },
  {
    slug: "parfum-voyage",
    href: "/parfums-femme",
    variant: "default",
    name: "Femme",
    meta: "Pour elle",
    image: "/assets/categories/femme.png",
    icon: <TravelBottleIcon />,
  },
  {
    slug: "format-50ml",
    href: "/promo-flash",
    variant: "default",
    name: "Mixte",
    meta: "Unisexe",
    image: "/assets/categories/mixte.jpg",
    icon: <Bottle50mlIcon />,
  },
  {
    slug: "huile-parfum",
    href: "/huile-de-parfum",
    variant: "default",
    name: "Huile de parfum",
    meta: "Attar concentré",
    image: "/assets/categories/huile.png",
    imageScale: 2.0,
    icon: <AttarBottleIcon />,
  },
  {
    slug: "eau-parfum",
    href: "/promo-flash",
    variant: "default",
    name: "Eau de parfum",
    meta: "Vaporisateur",
    image: "/assets/categories/eau.png",
    icon: <SprayBottleIcon />,
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   2e rail (après la bannière Yara) — jeu de données INDÉPENDANT du premier.
   Anciens libellés (formats), images/liens propres : éditer ce tableau
   n'affecte PAS DEMO_CATEGORIES et inversement.
   href : routes RÉELLES existantes (voir rapport de fix). Ce rail n'a PAS
   d'onCategoryClick sur la homepage : "offre-duo" navigue directement vers
   /offres/lot-3-pour-2 (pas d'interception BundleBuilder ici).
   Aucune route dédiée n'existe pour "Nouveauté", "Parfum d'intérieur",
   "Format voyage", "Format 50 ml" ni "Eau de parfum" → repointées vers
   /promo-flash (listing générique le plus proche).
   ────────────────────────────────────────────────────────────────────────── */
export const DEMO_CATEGORIES_FORMATS: Category[] = [
  {
    slug: "bestsellers",
    href: "/promo-flash",
    variant: "bestseller",
    name: "Nouveauté",
    meta: "Vient d'arriver",
    image: "/assets/categories/bestsellers.png",
    imagePosition: "center 40%",
    icon: <LaurelStarIcon />,
  },
  {
    slug: "offre-duo",
    href: "/offres/lot-3-pour-2",
    variant: "promo",
    name: "2ᵉ à −50%",
    meta: "Offre duo",
    image: "/assets/categories/lot-3-2.png",
    icon: <PromoContent />,
  },
  {
    slug: "parfum-interieur",
    href: "/promo-flash",
    variant: "default",
    name: "Parfum d’intérieur",
    meta: "Diffuseurs",
    image: "/assets/categories/homme.png",
    icon: <DiffuserIcon />,
  },
  {
    slug: "parfum-voyage",
    href: "/promo-flash",
    variant: "default",
    name: "Format voyage",
    meta: "Nomade",
    image: "/assets/categories/femme.png",
    icon: <TravelBottleIcon />,
  },
  {
    slug: "format-50ml",
    href: "/promo-flash",
    variant: "default",
    name: "Format 50 ml",
    meta: "Eau de parfum",
    image: "/assets/categories/format-50ml.png",
    imageScale: 0.82,
    icon: <Bottle50mlIcon />,
  },
  {
    slug: "huile-parfum",
    href: "/huile-de-parfum",
    variant: "default",
    name: "Huile de parfum",
    meta: "Attar concentré",
    image: "/assets/categories/huile.png",
    imageScale: 2.0,
    icon: <AttarBottleIcon />,
  },
  {
    slug: "eau-parfum",
    href: "/promo-flash",
    variant: "default",
    name: "Eau de parfum",
    meta: "Vaporisateur",
    image: "/assets/categories/eau.png",
    icon: <SprayBottleIcon />,
  },
];
