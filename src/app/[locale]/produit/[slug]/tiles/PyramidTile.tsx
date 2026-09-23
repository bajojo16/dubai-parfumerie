/**
 * Tuile « Pyramide olfactive » — 3 colonnes × 2 rangées (≈ 560 × 620 px).
 *
 * Elle remplace la constellation, qui tournait autour d'un médaillon central et
 * réclamait 800 px de haut pour respirer. Dans un bento, une tuile ne choisit
 * pas sa hauteur : elle la REMPLIT. D'où une composition en trois bandes
 * empilées — tête, cœur, fond — qui se partagent la place restante au prorata
 * de leur nombre de notes, et une frise d'évolution en pied qui absorbe le
 * reste. Aucune valeur de hauteur n'est écrite : tout est en `flex`, donc la
 * tuile est pleine qu'elle porte trois notes ou treize.
 *
 * La pastille (rond + nom à côté) plutôt que le médaillon : à 34 px on lit
 * encore la matière photographiée, et treize pastilles sur deux colonnes tiennent
 * là où treize satellites autour d'un cercle deviennent illisibles. Les fiches
 * peu fournies (≤ 9 notes) passent en variante aérée — mêmes rangées, pastilles
 * plus grandes — au lieu de laisser des cellules à moitié vides.
 */

import Image from "next/image";

import type { ProductContent } from "@/data/product-content";
import type { Product } from "@/data/product-details";

import { noteImage } from "./note-image";

interface PyramidTileProps {
  product: Product;
  content: ProductContent;
}

type Tier = "top" | "heart" | "base";

const TIER_LABEL: Record<Tier, string> = {
  top: "Tête",
  heart: "Cœur",
  base: "Fond",
};

/**
 * Dégradés de la frise : la tête est claire et volatile, le fond sombre et
 * tenace. Chaque segment finit sur la teinte où commence le suivant, pour que
 * la barre se lise comme une seule coulée et non comme trois blocs collés.
 */
const TIER_GRADIENT: Record<Tier, string> = {
  top: "linear-gradient(90deg, var(--gold-100), var(--gold-300))",
  heart: "linear-gradient(90deg, var(--gold-300), var(--gold-500))",
  base: "linear-gradient(90deg, var(--gold-500), var(--espresso-600))",
};

/**
 * Part de largeur de chaque segment dans la frise.
 *
 * Volontairement PAS les proportions réelles : sur douze heures, la tête
 * occupe un quart d'heure, soit 2 % de la barre — un trait invisible qu'aucun
 * libellé ne pourrait accompagner. Les trois parts gardent l'ordre de grandeur
 * (le fond domine) en restant toutes lisibles.
 */
const TIER_SHARE: Record<Tier, number> = { top: 18, heart: 30, base: 52 };

/** Deux colonnes de pastilles : le nombre de rangées qu'occupe un étage. */
function rowsFor(count: number): number {
  return Math.max(1, Math.ceil(count / 2));
}

export function PyramidTile({ product, content }: PyramidTileProps) {
  const groups: { tier: Tier; notes: string[] }[] = (
    [
      { tier: "top" as const, notes: product.topNotes },
      { tier: "heart" as const, notes: product.heartNotes },
      { tier: "base" as const, notes: product.baseNotes },
    ] satisfies { tier: Tier; notes: string[] }[]
  ).filter((g) => g.notes.length > 0);

  if (groups.length === 0) return null;

  const total = groups.reduce((n, g) => n + g.notes.length, 0);

  /**
   * Tenue moyenne votée par les clients : c'est elle qui borne la frise. Le
   * plancher à 4 h évite qu'un parfum donné pour 2 h affiche un dernier segment
   * « 3–2 h ». Sans donnée de tenue, 12 h — la durée d'une eau de parfum.
   */
  const hours = Math.max(content.longevityHours ?? 12, 4);

  const TIER_DURATION: Record<Tier, string> = {
    top: "0–15 min",
    heart: "15 min–3 h",
    base: `3–${hours} h`,
  };

  // Variante aérée sous dix notes : les pastilles grossissent pour occuper la
  // cellule au lieu de flotter au milieu d'une rangée trop haute.
  const airy = total <= 9;
  const dot = airy ? 46 : 34;
  const noteSize = airy ? "0.875rem" : "0.8125rem";

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        // Pas de padding ici : la carte et son padding sont dessinés par
        // `BentoGrid`. Deux paddings empilés donneraient une marge double et
        // des tuiles voisines dont les contenus ne s'alignent pas.
        overflow: "hidden",
        fontFamily: "var(--font-sans)",
      }}
    >
      <header style={{ flex: "0 0 auto", marginBottom: 18 }}>
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
          Composition
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 6,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontSize: "var(--t-title)",
              fontWeight: "var(--fw-semibold)",
              color: "var(--ink-900)",
              lineHeight: 1.1,
            }}
          >
            Pyramide olfactive
          </h3>
          <span
            style={{
              flex: "0 0 auto",
              fontSize: "var(--t-sm)",
              color: "var(--ink-500)",
            }}
          >
            {total} notes
          </span>
        </div>
      </header>

      {/* Les trois étages se partagent la hauteur au prorata de leurs rangées :
          un étage de cinq notes prend une rangée de plus qu'un étage de quatre,
          et toutes les pastilles gardent la même hauteur de cellule. */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
        {groups.map(({ tier, notes }) => (
          <section
            key={tier}
            style={{
              flex: `${rowsFor(notes.length)} 1 0`,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <div
              style={{
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: "var(--t-xs)",
                  letterSpacing: "var(--ls-wider)",
                  textTransform: "uppercase",
                  fontWeight: "var(--fw-semibold)",
                  color: "var(--ink-700)",
                }}
              >
                {TIER_LABEL[tier]}
              </span>
              {/* Filet de liaison : il rattache le libellé à sa durée sans
                  dessiner de cadre autour de l'étage. */}
              <span style={{ flex: 1, height: 1, background: "var(--line-100)" }} aria-hidden="true" />
              <span style={{ fontSize: "var(--t-xs)", color: "var(--ink-400)" }}>
                {TIER_DURATION[tier]}
              </span>
            </div>

            <ul
              style={{
                flex: 1,
                minHeight: 0,
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "grid",
                // auto-fit : deux colonnes quand la tuile est large, une seule
                // sur mobile où deux colonnes de 150 px coupaient les noms de
                // notes au milieu.
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gridAutoRows: "1fr",
                columnGap: 12,
                rowGap: 4,
              }}
            >
              {notes.map((note) => {
                const img = noteImage(note);
                return (
                  <li
                    key={note}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      minWidth: 0,
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        position: "relative",
                        flex: "0 0 auto",
                        width: dot,
                        height: dot,
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "1px solid var(--line-200)",
                        boxShadow: "var(--shadow-xs)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        // Dégradé or en repli : c'est le fond du monogramme
                        // quand la matière n'a pas de visuel dédié.
                        background:
                          "radial-gradient(circle at 30% 25%, var(--gold-100), var(--gold-300))",
                      }}
                    >
                      {img ? (
                        <Image src={img} alt="" fill sizes={`${dot}px`} style={{ objectFit: "cover" }} />
                      ) : (
                        <b
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: airy ? "1.25rem" : "1rem",
                            fontWeight: "var(--fw-medium)",
                            color: "var(--gold-900)",
                          }}
                        >
                          {note.charAt(0).toUpperCase()}
                        </b>
                      )}
                    </span>
                    <span
                      style={{
                        minWidth: 0,
                        fontSize: noteSize,
                        color: "var(--ink-700)",
                        lineHeight: 1.25,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {note}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {/* Frise d'évolution : les trois étages ne sont pas des listes séparées,
          ils se succèdent sur une même durée. La barre le dit d'un trait. */}
      <footer style={{ flex: "0 0 auto", marginTop: 14 }}>
        <div style={{ display: "flex", height: 6, borderRadius: "var(--r-pill)", overflow: "hidden" }}>
          {groups.map(({ tier }) => (
            <span
              key={tier}
              style={{ flex: TIER_SHARE[tier], background: TIER_GRADIENT[tier] }}
              aria-hidden="true"
            />
          ))}
        </div>
        <div style={{ display: "flex", marginTop: 7 }}>
          {groups.map(({ tier }, i) => (
            <span
              key={tier}
              style={{
                flex: TIER_SHARE[tier],
                fontSize: "var(--t-xs)",
                letterSpacing: "var(--ls-wide)",
                textTransform: "uppercase",
                color: "var(--ink-400)",
                textAlign: i === 0 ? "left" : i === groups.length - 1 ? "right" : "center",
              }}
            >
              {TIER_LABEL[tier]}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
