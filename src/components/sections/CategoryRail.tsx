"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { DEMO_CATEGORIES } from "./category-rail-data";

/* ──────────────────────────────────────────────────────────────────────────
   CategoryRail — rangée horizontale de catégories CIRCULAIRES (façon Notino).
   Convention projet : styles inline + variables CSS, <style> scoped (classes
   « dp-catrail- ») pour hover / focus / scroll-snap / responsive / RTL.
   i18n via props `labels` (défauts FR). Aucune classe Tailwind utilitaire.
   ────────────────────────────────────────────────────────────────────────── */

/* ── Tokens (hex exacts spec) ── */
const T = {
  cream1: "#FAF6EE",
  cream2: "#F6F0E4",
  cream3: "#EFE6D2",
  gold: "#C9A24A",
  goldDeep: "#A8801F",
  goldLight: "#E4CE94",
  ink: "#2C2620",
  inkDeep: "#15110D",
  inkMid: "#3A332A",
};

export type Variant = "default" | "bestseller" | "promo";

export type Category = {
  slug: string;
  href: string;
  variant: Variant;
  name: string;
  meta: string;
  /** Illustration SVG (affichée si pas d'image). */
  icon?: ReactNode;
  /** Photo produit détourée (mode photo, variant `default` uniquement). */
  image?: string;
  /** Zoom photo dans le disque (défaut 1.28). */
  imageScale?: number;
  /** Cadrage photo dans le disque (défaut "center"). */
  imagePosition?: string;
};

export type CategoryRailHeading = {
  eyebrow?: string;
  /** Titre h2 — peut contenir un <em> doré. */
  title: ReactNode;
};

export type CategoryRailLabels = {
  /** aria-label de la liste. */
  region: string;
};

const DEFAULT_LABELS: CategoryRailLabels = {
  region: "Catégories",
};

/* Disque : fonds + ombres par variante. */
function discBackground(variant: Variant): string {
  switch (variant) {
    case "bestseller":
      return `radial-gradient(120% 120% at 30% 25%, ${T.inkMid}, ${T.ink} 55%, ${T.inkDeep})`;
    case "promo":
      return `radial-gradient(120% 120% at 30% 25%, ${T.goldLight}, ${T.gold} 55%, ${T.goldDeep})`;
    default:
      return `radial-gradient(120% 120% at 30% 25%, #fff, ${T.cream2} 55%, ${T.cream3})`;
  }
}

function discShadow(variant: Variant): string {
  switch (variant) {
    case "bestseller":
      return `inset 0 0 0 1px rgba(228,206,148,.5), 0 12px 26px rgba(20,17,13,.28)`;
    case "promo":
      return `inset 0 0 0 1px rgba(255,255,255,.55), 0 12px 26px rgba(168,128,31,.30)`;
    default:
      return `inset 0 0 0 1px rgba(201,162,74,.18), 0 10px 24px rgba(120,90,40,.12)`;
  }
}

function CategoryDisc({ category }: { category: Category }) {
  // Photo si fournie (toutes variantes, y compris promo « 3 pour 2 »)
  const useImage = !!category.image;

  return (
    <span
      className="dp-catrail-disc"
      style={{
        position: "relative",
        width: "var(--dp-disc)",
        height: "var(--dp-disc)",
        borderRadius: "50%",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        background: useImage ? T.cream2 : discBackground(category.variant),
        boxShadow: discShadow(category.variant),
        isolation: "isolate",
      }}
    >
      {useImage ? (
        <span
          className="dp-catrail-img"
          style={{
            position: "absolute",
            inset: 0,
            display: "block",
          }}
        >
          <Image
            src={category.image as string}
            alt={category.name}
            fill
            sizes="(max-width: 760px) 170px, 210px"
            style={{ objectFit: "cover", objectPosition: category.imagePosition ?? "center", transform: `scale(${category.imageScale ?? 1.28})` }}
          />
        </span>
      ) : (
        <span style={{ position: "relative", zIndex: 1, display: "grid", placeItems: "center" }}>
          {category.icon}
        </span>
      )}

      {/* Anneau or — visible au hover (photo) ou au focus-visible (toutes variantes). */}
      <span
        aria-hidden
        className={`dp-catrail-ring${useImage ? " is-photo" : ""}`}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
    </span>
  );
}

export function CategoryRail({
  categories = DEMO_CATEGORIES,
  heading,
  locale = "fr",
  labels,
  onCategoryClick,
}: {
  categories?: Category[];
  heading?: CategoryRailHeading;
  locale?: string;
  labels?: Partial<CategoryRailLabels>;
  /** Retourne true si le clic est intercepté (empêche la navigation). */
  onCategoryClick?: (cat: Category) => boolean;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const isRTL = locale === "ar";

  return (
    <section className="dp-catrail-section" style={{ paddingBlock: 28 }}>
      <style>{CSS}</style>

      {heading && (
        <header
          style={{
            maxWidth: 1180,
            marginInline: "auto",
            paddingInline: 24,
            marginBottom: 22,
            textAlign: "start",
          }}
        >
          {heading.eyebrow && (
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: isRTL ? "0" : "0.2em",
                color: T.goldDeep,
              }}
            >
              {heading.eyebrow}
            </div>
          )}
          <h2
            className="dp-catrail-title"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: 30,
              lineHeight: 1.15,
              color: T.ink,
              margin: "4px 0 0",
            }}
          >
            {heading.title}
          </h2>
        </header>
      )}

      <ul
        className="dp-catrail-scroller"
        aria-label={L.region}
        style={{
          listStyle: "none",
          margin: 0,
          display: "flex",
          alignItems: "flex-start",
          gap: "var(--dp-gap)",
          overflowX: "auto",
          scrollSnapType: "x proximity",
          paddingBlock: 12,
          paddingInline: "var(--dp-pad-x)",
        }}
      >
        {categories.map((cat) => (
          <li
            key={cat.slug}
            style={{ scrollSnapAlign: "center", flex: "0 0 auto" }}
          >
            <Link
              href={cat.href}
              aria-label={cat.name}
              className="dp-catrail-item"
              onClick={(e) => {
                if (onCategoryClick?.(cat)) e.preventDefault();
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                textDecoration: "none",
                outline: "none",
              }}
            >
              <CategoryDisc category={cat} />

              <span
                className="dp-catrail-label"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  textAlign: "center",
                }}
              >
                <span className="dp-catrail-name">{cat.name}</span>
                <span
                  className="dp-catrail-meta"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 300,
                    fontSize: "var(--dp-meta-fs)",
                    textTransform: "uppercase",
                    letterSpacing: isRTL ? "0" : "0.16em",
                    color: T.goldDeep,
                    opacity: 0.85,
                  }}
                >
                  {cat.meta}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── Styles scoped (hover / focus / scroll / responsive / reduced-motion) ── */
const CSS = `
.dp-catrail-title em {
  font-style: normal;
  color: ${T.goldDeep};
}

.dp-catrail-scroller {
  /* Les rails sont limites a trois vignettes : a 116px les disques flottaient au
     milieu d'une ligne pleine largeur. On les laisse respirer proportionnellement
     a la fenetre, borne haute pour ne pas devenir des affiches. */
  --dp-disc: clamp(150px, 14vw, 200px);
  --dp-gap: 36px;
  --dp-pad-x: 24px;
  --dp-meta-fs: 12px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-padding-inline: 24px;
  /* Centré quand tout tient ; repli flex-start au débordement (1er item non coupé). */
  justify-content: safe center;
}
.dp-catrail-scroller::-webkit-scrollbar { display: none; }

.dp-catrail-disc {
  transition: transform .4s cubic-bezier(.2,.8,.2,1);
}
.dp-catrail-img {
  transition: transform .6s cubic-bezier(.2,.8,.2,1);
  transform-origin: center;
}

.dp-catrail-name {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 20px;
  line-height: 1.1;
  color: ${T.ink};
}

/* Hover : disque qui s'élève */
.dp-catrail-item:hover .dp-catrail-disc {
  transform: translateY(-8px);
}
/* Hover : zoom doux de la photo */
.dp-catrail-item:hover .dp-catrail-img {
  transform: scale(1.06);
}
/* Hover : anneau or sur les disques photo */
.dp-catrail-item:hover .dp-catrail-ring.is-photo {
  box-shadow: inset 0 0 0 2px ${T.gold};
}

/* Focus clavier : anneau or foncé sur le disque, pas d'outline navigateur */
.dp-catrail-item:focus-visible { outline: none; }
.dp-catrail-item:focus-visible .dp-catrail-ring {
  box-shadow: 0 0 0 3px ${T.goldDeep};
}

/* Seuil mobile du repo (760px), aligne sur globals.css. */
@media (max-width: 760px) {
  /* globals.css force padding-left/right:16px sur TOUT <section> sous 760px.
     Ce composant est un <section> imbrique dans le <section> de la page : les
     deux marges s'additionnaient et volaient 32px de large au rail avant meme
     son propre padding. On rend cette largeur au rail. */
  .dp-catrail-section { padding-inline: 0 !important; }
  /* Trois vignettes au plus sur mobile : au-dela la quatrieme etait coupee par
     le bord au lieu d'inviter au defilement. Coupe en CSS et non en JS, pour
     que desktop et tablette gardent la liste entiere -- un slice() dans le
     rendu l'aurait amputee partout. Les items caches restent dans le DOM,
     donc lisibles par un moteur d'indexation. */
  .dp-catrail-scroller > li:nth-of-type(n + 4) { display: none; }
  .dp-catrail-scroller {
    /* Trois disques + deux gouttieres + le padding du scroller + les 32px de
       marge de la section parente : le disque prend tout ce qui reste, sans
       jamais depasser 160px. A 390px cela donne ~100px au lieu de 72px. */
    --dp-disc: min(160px, calc((100vw - 88px) / 3));
    --dp-gap: 14px;
    --dp-pad-x: 16px;
    --dp-meta-fs: 9.5px;
  }
  .dp-catrail-name { font-size: 14px; }
  /* Borne le libellé à la largeur du disque : sans cela un texte non coupable
     (« 3 pour 2 acheté ») élargit l'item et annule le calcul ci-dessus. */
  .dp-catrail-label { max-width: var(--dp-disc); }
  /* gap est declare en inline sur le lien : il faut !important pour l'atteindre. */
  .dp-catrail-item { gap: 10px !important; }
}

@media (prefers-reduced-motion: reduce) {
  .dp-catrail-disc,
  .dp-catrail-img { transition: none !important; }
  .dp-catrail-item:hover .dp-catrail-disc,
  .dp-catrail-item:hover .dp-catrail-img { transform: none; }
}
`;
