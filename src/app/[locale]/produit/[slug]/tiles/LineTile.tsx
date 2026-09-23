/**
 * Tuile « La ligne » — 2 colonnes × 1 rangée (≈ 360 × 300 px).
 *
 * Le lien le plus fort du catalogue : Khamrah → Khamrah Qahwa. Un client qui
 * ouvre une fiche cherche d'abord à savoir s'il existe une autre version du
 * MÊME parfum, avant de regarder des produits seulement ressemblants. La tuile
 * répond à ça et à rien d'autre.
 *
 * La phrase de différenciation est générée, jamais inventée : elle reprend le
 * qualificatif qui suit le nom de base (« Khamrah Qahwa » → « Qahwa ») et la
 * famille olfactive déclarée. Aucune de ces deux sources ne manquant, on écrit
 * ce que les données disent ; si le nom n'a pas de qualificatif, la phrase se
 * contente de la famille.
 */

import Image from "next/image";

import type { Product } from "@/data/product-details";
import { lineSiblings } from "@/data/product-resolve";
import { Link } from "@/i18n/navigation";
import { euros, primaryFamily } from "../product-content-format";

interface LineTileProps {
  slug: string;
  product: Product;
}

/**
 * « Khamrah » + « Khamrah Qahwa » → « Qahwa ». Chaîne vide si la déclinaison ne
 * partage pas le nom de base : deux noms sans racine commune ne se comparent
 * pas par soustraction (« Yara » et « Asad » sont de la même ligne commerciale,
 * pas du même parfum décliné).
 */
function qualifierOf(baseName: string, siblingName: string): string {
  const base = baseName.trim();
  if (!siblingName.toLowerCase().startsWith(base.toLowerCase())) return "";
  return siblingName.slice(base.length).trim();
}

/** « La même signature, en version Qahwa — Gourmand » */
function differenceSentence(product: Product, sibling: Product): string {
  const qualifier = qualifierOf(product.name, sibling.name);
  const family = primaryFamily(sibling.family) ?? primaryFamily(product.family);
  // Accord avec « signature », féminin : « déclinée », quel que soit le parfum.
  const head = qualifier ? `La même signature, en version ${qualifier}` : "La même signature, déclinée";
  return family ? `${head} — ${family.toLowerCase()}.` : `${head}.`;
}

export function LineTile({ slug, product }: LineTileProps) {
  const siblings = lineSiblings(slug, 2);
  if (siblings.length === 0) return null;

  const eyebrow = `La ligne ${product.brand}`;
  const eyebrowStyle = {
    margin: 0,
    fontSize: "var(--t-xs)",
    letterSpacing: "var(--ls-widest)",
    textTransform: "uppercase" as const,
    color: "var(--gold-700)",
    fontWeight: "var(--fw-medium)",
  };
  const titleStyle = {
    margin: "6px 0 0",
    fontFamily: "var(--font-display)",
    fontSize: "var(--t-serif-lg)",
    fontWeight: "var(--fw-semibold)",
    color: "var(--ink-900)",
    lineHeight: 1.15,
  };
  const shellStyle = {
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    // Pas de padding ici : la carte et son padding sont dessines par `BentoGrid`.
    overflow: "hidden",
    fontFamily: "var(--font-sans)",
  };

  // ── Deux déclinaisons ou plus : deux lignes compactes, chacune cliquable.
  // Un bouton unique ne saurait pas laquelle ouvrir ; la ligne EST le bouton.
  if (siblings.length >= 2) {
    return (
      <div style={shellStyle}>
        <header style={{ flex: "0 0 auto" }}>
          <p style={eyebrowStyle}>{eyebrow}</p>
          <h3 style={titleStyle}>{siblings.length} autres de la ligne</h3>
        </header>

        <ul
          style={{
            flex: 1,
            minHeight: 0,
            margin: "12px 0 0",
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {siblings.map(({ slug: otherSlug, product: sibling }) => (
            <li key={otherSlug} style={{ flex: 1, minHeight: 0, display: "flex" }}>
              <Link
                href={`/produit/${otherSlug}`}
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  textDecoration: "none",
                  borderTop: "1px solid var(--line-100)",
                  paddingTop: 10,
                }}
              >
                <span
                  style={{
                    position: "relative",
                    flex: "0 0 auto",
                    width: 56,
                    height: 56,
                    borderRadius: "var(--r-sm)",
                    overflow: "hidden",
                    background: "var(--surface-image)",
                  }}
                >
                  <Image
                    src={sibling.packshot ?? sibling.image ?? ""}
                    alt=""
                    fill
                    sizes="56px"
                    style={{ objectFit: "cover" }}
                  />
                </span>
                <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                  <span
                    style={{
                      fontSize: "var(--t-body)",
                      color: "var(--ink-900)",
                      fontWeight: "var(--fw-medium)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {sibling.name}
                  </span>
                  <span style={{ fontSize: "var(--t-xs)", color: "var(--ink-400)" }}>
                    {primaryFamily(sibling.family) ?? sibling.brand}
                  </span>
                </span>
                <span
                  style={{
                    flex: "0 0 auto",
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--t-serif-md)",
                    color: "var(--gold-700)",
                  }}
                >
                  {euros(sibling.price)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // ── Une seule déclinaison : elle occupe toute la tuile, avec la phrase qui
  // dit en quoi elle diffère et un bouton pleine largeur.
  const { slug: otherSlug, product: sibling } = siblings[0];

  return (
    <div style={shellStyle}>
      <header style={{ flex: "0 0 auto" }}>
        <p style={eyebrowStyle}>{eyebrow}</p>
        <h3 style={titleStyle}>{sibling.name}</h3>
      </header>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          gap: 14,
          margin: "14px 0",
        }}
      >
        {/* La vignette prend toute la hauteur de la bande : un carré de 72 px
            au milieu d'une tuile de 300 laissait deux bandeaux vides. */}
        <span
          style={{
            position: "relative",
            flex: "0 0 auto",
            alignSelf: "stretch",
            width: 96,
            borderRadius: "var(--r-md)",
            overflow: "hidden",
            background: "var(--surface-image)",
          }}
        >
          <Image
            src={sibling.packshot ?? sibling.image ?? ""}
            alt=""
            fill
            sizes="96px"
            style={{ objectFit: "cover" }}
          />
        </span>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <p style={{ margin: 0, fontSize: "var(--t-body)", color: "var(--ink-700)", lineHeight: 1.45 }}>
            {differenceSentence(product, sibling)}
          </p>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontSize: "1.75rem",
              fontWeight: "var(--fw-semibold)",
              color: "var(--gold-500)",
              lineHeight: 1,
            }}
          >
            {euros(sibling.price)}
          </p>
        </div>
      </div>

      <Link
        href={`/produit/${otherSlug}`}
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 44,
          borderRadius: "var(--r-sm)",
          border: "1px solid var(--gold-500)",
          color: "var(--gold-700)",
          fontSize: "var(--t-sm)",
          fontWeight: "var(--fw-medium)",
          letterSpacing: "var(--ls-wide)",
          textTransform: "uppercase",
          textDecoration: "none",
        }}
      >
        Découvrir {sibling.name}
      </Link>
    </div>
  );
}
