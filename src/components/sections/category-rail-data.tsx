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
   href : placeholder vers /categorie/<slug>.
   Bestsellers + offre-duo portent leur SVG dédié (jamais d'image).
   ────────────────────────────────────────────────────────────────────────── */

export const DEMO_CATEGORIES: Category[] = [
  {
    slug: "bestsellers",
    href: "/categorie/bestsellers",
    variant: "bestseller",
    name: "Best-sellers",
    meta: "Les plus aimés",
    icon: <LaurelStarIcon />,
  },
  {
    slug: "offre-duo",
    href: "/categorie/offre-duo",
    variant: "promo",
    name: "3 pour 2 acheté",
    meta: "Le 3ᵉ offert",
    image: "/assets/categories/lot-3-2.png",
    icon: <PromoContent big="3=2" small="3ᵉ OFFERT" />,
  },
  {
    slug: "parfum-interieur",
    href: "/categorie/parfum-interieur",
    variant: "default",
    name: "Homme",
    meta: "Pour lui",
    image: "/assets/categories/homme.png",
    icon: <DiffuserIcon />,
  },
  {
    slug: "parfum-voyage",
    href: "/categorie/parfum-voyage",
    variant: "default",
    name: "Femme",
    meta: "Pour elle",
    image: "/assets/categories/femme.png",
    icon: <TravelBottleIcon />,
  },
  {
    slug: "format-50ml",
    href: "/categorie/format-50ml",
    variant: "default",
    name: "Mixte",
    meta: "Unisexe",
    icon: <Bottle50mlIcon />,
  },
  {
    slug: "huile-parfum",
    href: "/categorie/huile-parfum",
    variant: "default",
    name: "Huile de parfum",
    meta: "Attar concentré",
    image: "/assets/categories/huile.png",
    icon: <AttarBottleIcon />,
  },
  {
    slug: "eau-parfum",
    href: "/categorie/eau-parfum",
    variant: "default",
    name: "Eau de parfum",
    meta: "Vaporisateur",
    image: "/assets/categories/eau.png",
    icon: <SprayBottleIcon />,
  },
];
