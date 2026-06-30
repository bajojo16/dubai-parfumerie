"use client";

import Image from "next/image";
import Link from "next/link";
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
  const useImage = !!category.image && category.variant === "default";

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
            sizes="(max-width: 600px) 120px, 148px"
            style={{ objectFit: "cover" }}
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
}: {
  categories?: Category[];
  heading?: CategoryRailHeading;
  locale?: string;
  labels?: Partial<CategoryRailLabels>;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const isRTL = locale === "ar";

  return (
    <section style={{ paddingBlock: 28 }}>
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
          gap: 28,
          overflowX: "auto",
          scrollSnapType: "x proximity",
          paddingBlock: 12,
          paddingInline: 24,
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
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                textDecoration: "none",
                outline: "none",
              }}
            >
              <CategoryDisc category={cat} />

              <span
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
                    fontSize: 11,
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
  --dp-disc: 148px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-padding-inline: 24px;
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
  font-size: 21px;
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

@media (max-width: 600px) {
  .dp-catrail-scroller { --dp-disc: 120px; }
  .dp-catrail-name { font-size: 18px; }
}

@media (prefers-reduced-motion: reduce) {
  .dp-catrail-disc,
  .dp-catrail-img { transition: none !important; }
  .dp-catrail-item:hover .dp-catrail-disc,
  .dp-catrail-item:hover .dp-catrail-img { transform: none; }
}
`;
