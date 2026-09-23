/**
 * Tuile « Tenue & sillage » — 2 colonnes × 1 rangée (≈ 360 × 300 px).
 *
 * Trois jauges pour les trois chiffres que le client cherche avant d'acheter :
 * combien de temps ça tient, à quelle distance ça se sent, à quelle
 * concentration c'est dosé. Une jauge dit en un coup d'œil ce qu'une ligne de
 * tableau (« Tenue : 12 h en moyenne ») oblige à comparer de tête.
 *
 * Deux règles tiennent la tuile :
 *  - une jauge dont la donnée manque n'est pas dessinée à zéro, elle n'existe
 *    pas — une barre vide se lit « mauvais », pas « inconnu » ;
 *  - les jauges restantes se partagent la hauteur (`flex: 1`), donc deux
 *    jauges remplissent la tuile aussi bien que trois.
 */

import { SILLAGE_LABEL, type ProductContent, type Sillage } from "@/data/product-content";
import type { Product } from "@/data/product-details";
import { NBSP } from "../product-content-format";

interface GaugesTileProps {
  content: ProductContent;
  /**
   * Optionnel : seule la CONCENTRATION en est tirée, et elle-même est absente
   * de la plupart des fiches. Le moteur de grille peut donc rendre la tuile
   * avec le seul `content` — elle affiche alors deux jauges au lieu de trois.
   */
  product?: Product;
}

/**
 * Échelle du sillage. Les quatre paliers du catalogue sont des mots, pas des
 * mesures : on leur donne des quarts réguliers plutôt qu'une pseudo-précision.
 */
const SILLAGE_PCT: Record<Sillage, number> = {
  discret: 25,
  modéré: 50,
  fort: 75,
  énorme: 100,
};

/** Échelle de la tenue : 24 h, soit une journée pleine — le maximum crédible. */
const LONGEVITY_MAX_HOURS = 24;

/** « EDP 30% » → 30. `undefined` si la concentration n'est pas chiffrée. */
function concentrationPct(concentration: string | undefined): number | undefined {
  const m = concentration?.match(/(\d+(?:[.,]\d+)?)\s*%/);
  if (!m) return undefined;
  const n = Number(m[1].replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

interface Gauge {
  label: string;
  value: string;
  pct: number;
}

export function GaugesTile({ content, product }: GaugesTileProps) {
  const gauges: Gauge[] = [];

  if (content.longevityHours !== undefined) {
    gauges.push({
      label: "Tenue",
      value: `${content.longevityHours}${NBSP}h`,
      pct: Math.min(100, (content.longevityHours / LONGEVITY_MAX_HOURS) * 100),
    });
  }
  if (content.sillage) {
    gauges.push({
      label: "Sillage",
      value: SILLAGE_LABEL[content.sillage],
      pct: SILLAGE_PCT[content.sillage],
    });
  }

  // Tenue et sillage viennent des votes ; la concentration vient du flacon.
  // Sans l'une des deux premières, la tuile n'a rien à dire : on la retire.
  if (gauges.length === 0) return null;

  const pct = concentrationPct(product?.concentration);
  if (pct !== undefined) {
    gauges.push({
      label: "Concentration",
      value: `${pct}${NBSP}%`,
      pct: Math.min(100, pct),
    });
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "20px 22px",
        overflow: "hidden",
        fontFamily: "var(--font-sans)",
      }}
    >
      <header style={{ flex: "0 0 auto" }}>
        <p
          style={{
            margin: 0,
            fontSize: "var(--t-xs)",
            letterSpacing: "var(--ls-widest)",
            textTransform: "uppercase",
            color: "var(--gold-700)",
            fontWeight: "var(--fw-medium)",
          }}
        >
          Performance
        </p>
        <h3
          style={{
            margin: "6px 0 0",
            fontFamily: "var(--font-display)",
            fontSize: "var(--t-serif-lg)",
            fontWeight: "var(--fw-semibold)",
            color: "var(--ink-900)",
            lineHeight: 1.15,
          }}
        >
          Tenue &amp; sillage
        </h3>
      </header>

      <ul
        style={{
          flex: 1,
          minHeight: 0,
          margin: "14px 0 0",
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {gauges.map((g) => (
          <li
            key={g.label}
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 7,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: "var(--t-sm)", color: "var(--ink-500)" }}>{g.label}</span>
              <span
                style={{
                  fontSize: "var(--t-body)",
                  fontWeight: "var(--fw-semibold)",
                  color: "var(--ink-900)",
                }}
              >
                {g.value}
              </span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: "var(--r-pill)",
                background: "var(--line-100)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${g.pct}%`,
                  height: "100%",
                  borderRadius: "var(--r-pill)",
                  background: "linear-gradient(90deg, var(--gold-300), var(--gold-500))",
                }}
                aria-hidden="true"
              />
            </div>
          </li>
        ))}
      </ul>

      <p
        style={{
          flex: "0 0 auto",
          margin: "12px 0 0",
          fontSize: "var(--t-xs)",
          letterSpacing: "var(--ls-wide)",
          color: "var(--ink-400)",
        }}
      >
        D&apos;après les votes des clients
      </p>
    </div>
  );
}
