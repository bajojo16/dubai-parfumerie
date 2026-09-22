"use client";

/**
 * Encart « Complétez le trio » — l'offre « achetez 2, le 3ᵉ offert » ramenée
 * dans la colonne d'achat, là où le client a déjà un flacon en tête.
 *
 * Les deux compagnons proposés sont les deux fiches les plus proches du
 * produit ouvert (`relatedProducts`, même règle que la rangée « Vous pourriez
 * aussi aimer ») : un client qui hésite sur un gourmand veut deux autres
 * gourmands, pas les deux premiers slugs du catalogue. L'économie annoncée est
 * CALCULÉE depuis les prix réels : dans « le 3ᵉ offert », c'est le moins cher
 * des trois qui n'est pas facturé — jamais un chiffre écrit à la main.
 *
 * Client Component : le bouton ouvre `BundleBuilder` en modale, chargé en
 * `dynamic(..., { ssr: false })` comme sur la page d'accueil — il n'a aucune
 * raison d'être dans le HTML tant que personne n'a cliqué.
 *
 * LIMITE CONNUE : l'API de `BundleBuilder` (`variant`, `onClose`, `products`,
 * `locale`) ne permet pas de PRÉ-SÉLECTIONNER un produit dans le lot, et son
 * catalogue (`BUNDLE_PRODUCTS`, ids `bundle-*`) ne contient pas les fiches du
 * site. La modale s'ouvre donc vide ; le client recompose son trio.
 */

import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo, useState } from "react";
import { relatedProducts } from "@/data/product-resolve";
import { euros } from "./product-content-format";

const BundleBuilder = dynamic(
  () => import("@/components/bundle/BundleBuilder").then((m) => m.BundleBuilder),
  { ssr: false },
);

/** Taille du lot et nombre de compagnons proposés — l'offre est « 3 pour 2 ». */
const COMPANIONS = 2;

/** Vignette ronde du trio ; bord blanc pour détacher les flacons empilés. */
const THUMB = 44;

type Props = {
  slug: string;
  productName: string;
  brand: string;
  price: number;
  image?: string;
  locale?: string;
};

export default function TrioUpsell({ slug, productName, brand, price, image, locale = "fr" }: Props) {
  const [open, setOpen] = useState(false);

  // Déterministe (score sur famille / notes / maison) : le serveur et le client
  // trouvent les mêmes deux fiches, donc pas de divergence à l'hydratation.
  const companions = useMemo(() => relatedProducts(slug, COMPANIONS), [slug]);

  // Sans deux compagnons réels, pas de trio à annoncer : on n'invente pas de
  // flacon pour remplir la vignette.
  if (companions.length < COMPANIONS) return null;

  // « Le 3ᵉ offert » = le moins cher des trois n'est pas facturé.
  const saving = Math.min(price, ...companions.map((c) => c.product.price));

  const thumbs: { key: string; src?: string; alt: string }[] = [
    { key: slug, src: image, alt: `${productName} — ${brand}` },
    ...companions.map((c) => ({
      key: c.slug,
      src: c.product.image,
      alt: `${c.product.name} — ${c.product.brand}`,
    })),
  ];

  return (
    <>
      <div
        className="dp-trio"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.875rem",
          padding: "0.875rem 1rem",
          border: "1px dashed var(--gold-400)",
          borderRadius: "var(--r-md)",
          background: "linear-gradient(180deg, #FFFDF8, #F8F2E6)",
        }}
      >
        {/* Trois flacons empilés : le produit ouvert devant, les compagnons
            derrière — l'ordre du z-index suit l'ordre de lecture. */}
        <div style={{ display: "flex", flex: "none", paddingInlineEnd: 8 }} aria-hidden>
          {thumbs.map((t, i) => (
            <span
              key={t.key}
              style={{
                position: "relative",
                display: "block",
                width: THUMB,
                height: THUMB,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid var(--surface-white)",
                background: "var(--surface-image)",
                boxShadow: "var(--shadow-sm)",
                marginInlineStart: i === 0 ? 0 : -8,
                zIndex: thumbs.length - i,
              }}
            >
              {t.src && <Image src={t.src} alt="" fill sizes={`${THUMB}px`} style={{ objectFit: "cover" }} />}
            </span>
          ))}
        </div>

        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-sans)",
              fontSize: "var(--t-sm)",
              fontWeight: "var(--fw-semibold)",
              color: "var(--ink-900)",
            }}
          >
            Complétez le trio : le 3ᵉ offert
          </p>
          <p
            style={{
              margin: "0.2rem 0 0",
              fontFamily: "var(--font-sans)",
              fontSize: "var(--t-xs)",
              lineHeight: "var(--lh-normal)",
              color: "var(--ink-500)",
            }}
          >
            {productName} + {companions[0].product.name} + {companions[1].product.name} ·{" "}
            <span style={{ color: "var(--success)", fontWeight: "var(--fw-semibold)" }}>
              vous économisez {euros(saving)}
            </span>
          </p>
        </div>

        <button
          type="button"
          className="dp-trio-cta"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          style={{
            flex: "none",
            height: 36,
            padding: "0 0.9rem",
            border: "1px solid var(--line-300)",
            borderRadius: "var(--r-sm)",
            background: "var(--surface-white)",
            color: "var(--ink-900)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--t-xs)",
            fontWeight: "var(--fw-semibold)",
            letterSpacing: "var(--ls-wide)",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Composer
        </button>

        {/* Sur les écrans étroits, le bouton passe sous le texte ; sinon il
            comprimerait la ligne d'économie jusqu'à la couper. */}
        <style>{`
          @media (max-width: 420px) {
            .dp-trio { flex-wrap: wrap; }
            .dp-trio .dp-trio-cta { flex-basis: 100%; }
          }
        `}</style>
      </div>

      {open && <BundleBuilder variant="modal" locale={locale} onClose={() => setOpen(false)} />}
    </>
  );
}
