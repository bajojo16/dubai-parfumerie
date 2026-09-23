import type { CSSProperties, ReactNode } from "react";
import type { PlacedTile, TileId } from "./bento-types";

/**
 * La grille bento : six colonnes, des tuiles de tailles différentes.
 *
 * Elle ne décide de rien — le moteur (`bento-layout.ts`) a déjà choisi quelles
 * tuiles existent et quelle taille chacune prend. Ici on ne fait que dessiner
 * les cadres et y poser le contenu que la page fournit.
 *
 * C'est la grille qui porte la carte (fond, bord, radius, ombre, padding) et
 * jamais les composants de tuile : sinon deux tuiles voisines auraient des
 * bordures qui ne tombent pas au même endroit, et une tuile deviendrait
 * impossible à réutiliser ailleurs.
 */

export interface BentoTileContent {
  /** Libellé en petites capitales or, au-dessus du titre. */
  eyebrow?: string;
  /** Titre de la tuile, en display. Absent pour les tuiles qui portent le leur. */
  title?: string;
  /** Mention discrète alignée à droite du titre. */
  aside?: ReactNode;
  children: ReactNode;
  /** Fond crème plutôt que blanc — pour les tuiles de synthèse. */
  tone?: "white" | "cream" | "dark";
  /** Ancre pour la barre de navigation de la fiche. */
  anchor?: string;
}

const TONE: Record<NonNullable<BentoTileContent["tone"]>, CSSProperties> = {
  white: { background: "var(--surface-white)", borderColor: "var(--line-100)", color: "var(--ink-900)" },
  cream: { background: "var(--surface-cream)", borderColor: "var(--line-200)", color: "var(--ink-900)" },
  dark: { background: "var(--espresso-900)", borderColor: "var(--espresso-900)", color: "var(--gold-100)" },
};

export function BentoGrid({
  tiles,
  render,
}: {
  tiles: PlacedTile[];
  /** Le contenu d'une tuile, ou `null` si la page ne sait pas la rendre. */
  render: (id: TileId) => BentoTileContent | null;
}) {
  return (
    <div
      className="dp-bento"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
        // Rangées à hauteur libre mais minimum commun : deux tuiles côte à côte
        // font la même hauteur, et une tuile sur deux rangées vaut exactement
        // deux rangées plus l'espace entre elles.
        gridAutoRows: "minmax(240px, auto)",
        gap: "1.25rem",
      }}
    >
      <style>{`
        /* Tablette : la grille passe à quatre colonnes, les tuiles larges
           s'adaptent en se limitant à la largeur disponible. */
        @media (max-width: 1080px) {
          .dp-bento { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
          .dp-bento > [data-cols="6"] { grid-column: span 4 !important; }
          .dp-bento > [data-cols="4"] { grid-column: span 4 !important; }
          .dp-bento > [data-cols="3"] { grid-column: span 2 !important; }
          .dp-bento > [data-cols="2"] { grid-column: span 2 !important; }
        }
        /* Mobile : une seule colonne, et plus aucune tuile sur deux rangées —
           la hauteur double n'a de sens que dans une grille à plusieurs
           colonnes, où elle sert à remplir le voisin. */
        @media (max-width: 720px) {
          .dp-bento { grid-template-columns: 1fr !important; gap: 1rem !important; grid-auto-rows: auto !important; }
          .dp-bento > * { grid-column: 1 / -1 !important; grid-row: auto !important; }
        }
      `}</style>

      {tiles.map((tile) => {
        const content = render(tile.id);
        if (!content) return null;
        const tone = TONE[content.tone ?? "white"];
        return (
          <section
            key={tile.id}
            id={content.anchor}
            data-cols={tile.size.cols}
            style={{
              gridColumn: `span ${tile.size.cols}`,
              gridRow: `span ${tile.size.rows}`,
              scrollMarginTop: 130,
              display: "flex",
              flexDirection: "column",
              gap: "0.875rem",
              minWidth: 0,
              overflow: "hidden",
              padding: "1.25rem 1.375rem",
              border: "1px solid",
              borderRadius: "var(--r-lg)",
              boxShadow: "var(--shadow-sm)",
              ...tone,
            }}
          >
            {(content.eyebrow || content.title) && (
              <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1rem" }}>
                <div style={{ minWidth: 0 }}>
                  {content.eyebrow && (
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-sans)",
                        fontSize: "var(--t-xs)",
                        fontWeight: "var(--fw-semibold)",
                        letterSpacing: "var(--ls-widest)",
                        textTransform: "uppercase",
                        color: content.tone === "dark" ? "var(--gold-300)" : "var(--gold-700)",
                      }}
                    >
                      {content.eyebrow}
                    </p>
                  )}
                  {content.title && (
                    <h2
                      style={{
                        margin: content.eyebrow ? "0.15rem 0 0" : 0,
                        fontFamily: "var(--font-display)",
                        fontSize: "var(--t-serif-lg)",
                        fontWeight: 600,
                        lineHeight: "var(--lh-snug)",
                        color: content.tone === "dark" ? "var(--gold-100)" : "var(--ink-900)",
                      }}
                    >
                      {content.title}
                    </h2>
                  )}
                </div>
                {content.aside && (
                  <span
                    style={{
                      flexShrink: 0,
                      fontFamily: "var(--font-sans)",
                      fontSize: "var(--t-xs)",
                      color: content.tone === "dark" ? "var(--gold-300)" : "var(--ink-400)",
                    }}
                  >
                    {content.aside}
                  </span>
                )}
              </header>
            )}

            {/* Le contenu prend toute la hauteur restante : c'est ce qui évite
                qu'une tuile haute se remplisse par le haut et laisse un blanc
                en bas — le défaut qui rend un bento pire qu'une pile. */}
            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>{content.children}</div>
          </section>
        );
      })}
    </div>
  );
}
