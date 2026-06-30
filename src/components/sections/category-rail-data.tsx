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
    name: "2ᵉ à −50%",
    meta: "Offre duo",
    icon: <PromoContent />,
  },
  {
    slug: "parfum-interieur",
    href: "/categorie/parfum-interieur",
    variant: "default",
    name: "Parfum d’intérieur",
    meta: "Diffuseurs",
    icon: <DiffuserIcon />,
  },
  {
    slug: "parfum-voyage",
    href: "/categorie/parfum-voyage",
    variant: "default",
    name: "Format voyage",
    meta: "Nomade",
    icon: <TravelBottleIcon />,
  },
  {
    slug: "format-50ml",
    href: "/categorie/format-50ml",
    variant: "default",
    name: "Format 50 ml",
    meta: "Eau de parfum",
    icon: <Bottle50mlIcon />,
  },
  {
    slug: "huile-parfum",
    href: "/categorie/huile-parfum",
    variant: "default",
    name: "Huile de parfum",
    meta: "Attar concentré",
    icon: <AttarBottleIcon />,
  },
  {
    slug: "eau-parfum",
    href: "/categorie/eau-parfum",
    variant: "default",
    name: "Eau de parfum",
    meta: "Vaporisateur",
    icon: <SprayBottleIcon />,
  },
];
