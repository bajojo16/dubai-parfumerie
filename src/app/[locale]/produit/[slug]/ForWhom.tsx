/**
 * « Est-ce pour moi ? Pour qui, quand, comment » — le guide d'achat en trois
 * cartes, rédigé pour CE parfum.
 *
 * C'est la première question du client qui ne connaît pas encore le flacon,
 * et la fiche technique n'y répond pas : un tableau dit « automne, hiver »,
 * il ne dit pas « dès la tombée du jour ». Les trois listes viennent de
 * `product-content.ts` (`forWhom`, `when`, `howToWear`) ; la rangée des
 * saisons relit `seasons`, la même donnée que le résumé et la fiche technique.
 *
 * Une carte dont la liste manque ne se dessine pas ; les trois absentes, le
 * bloc entier disparaît — rien n'est rempli par une formule générique.
 */

import type { ReactNode } from "react";
import type { Product } from "@/data/product-details";
import { SEASON_LABEL, type ProductContent, type Season } from "@/data/product-content";
import { NBSP } from "./product-content-format";

interface ForWhomProps {
  slug: string;
  product: Product;
  content: ProductContent;
}

/** Les quatre saisons dans l'ordre de l'année, pour la rangée de cases. */
const SEASONS: Season[] = ["printemps", "été", "automne", "hiver"];

/**
 * Pictogrammes 18 px, tracés au trait : une pousse, un soleil, une feuille,
 * un flocon. Des SVG plutôt que des emojis, dont le dessin change d'un
 * système à l'autre et casse l'alignement de la rangée.
 */
const SEASON_ICON: Record<Season, ReactNode> = {
  printemps: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21V11" />
      <path d="M12 11c0-4 3-6 7-6 0 4-3 6-7 6z" />
      <path d="M12 15c0-3-2.5-5-6-5 0 3 2.5 5 6 5z" />
    </svg>
  ),
  été: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
    </svg>
  ),
  automne: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z" />
      <path d="M5 19l8-8" />
    </svg>
  ),
  hiver: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" />
      <path d="M12 3l-2 2M12 3l2 2M12 21l-2-2M12 21l2-2" />
    </svg>
  ),
};

/** « septembre 2026 » depuis l'ISO 8601 ; une date illisible n'affiche rien. */
function monthYearFr(iso: string): string | undefined {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(d);
}

/**
 * « 2 pulvérisations : cou + poignets » → le segment avant le premier « : »
 * passe en gras. Une puce sans deux-points s'affiche telle quelle.
 */
function emphasizeLead(text: string): ReactNode {
  const idx = text.indexOf(":");
  if (idx <= 0) return text;
  const lead = text.slice(0, idx).trim();
  const rest = text.slice(idx + 1).trim();
  if (!lead || !rest) return text;
  return (
    <>
      <strong style={{ fontWeight: "var(--fw-semibold)", color: "var(--ink-900)" }}>{lead}</strong>
      {NBSP}: {rest}
    </>
  );
}

function CheckList({ items, emphasize = false }: { items: string[]; emphasize?: boolean }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.55rem" }}>
      {items.map((item) => (
        <li
          key={item}
          style={{
            display: "flex",
            gap: "0.55rem",
            alignItems: "flex-start",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--t-sm)",
            lineHeight: 1.5,
            color: "var(--ink-700)",
          }}
        >
          <span aria-hidden="true" style={{ color: "var(--gold-500)", fontWeight: "var(--fw-bold)", flexShrink: 0 }}>
            ✓
          </span>
          <span>{emphasize ? emphasizeLead(item) : item}</span>
        </li>
      ))}
    </ul>
  );
}

function Card({ glyph, title, children }: { glyph: string; title: string; children: ReactNode }) {
  return (
    <article
      style={{
        background: "var(--surface-white)",
        borderRadius: "var(--r-lg)",
        boxShadow: "var(--shadow-sm)",
        padding: "1.25rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.9rem" }}>
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: "var(--r-pill)",
            background: "var(--gold-100)",
            color: "var(--gold-700)",
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {glyph}
        </span>
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "var(--ink-900)",
          }}
        >
          {title}
        </h3>
      </div>
      {children}
    </article>
  );
}

/** Les quatre saisons en cases, celles du parfum allumées en or. */
function SeasonRow({ active }: { active: Season[] }) {
  return (
    <ul
      aria-label="Saisons conseillées"
      style={{
        listStyle: "none",
        margin: "0 0 0.9rem",
        padding: 0,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "0.4rem",
      }}
    >
      {SEASONS.map((season) => {
        const on = active.includes(season);
        return (
          <li
            key={season}
            aria-current={on ? "true" : undefined}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.55rem 0.25rem",
              borderRadius: "var(--r-md)",
              border: `1px solid ${on ? "var(--gold-300)" : "var(--line-100)"}`,
              background: on ? "var(--gold-100)" : "var(--surface-white)",
              color: on ? "var(--gold-700)" : "var(--ink-400)",
              opacity: on ? 1 : 0.65,
            }}
          >
            {SEASON_ICON[season]}
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", color: on ? "var(--ink-900)" : "var(--ink-400)" }}>
              {SEASON_LABEL[season]}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function ForWhom({ content }: ForWhomProps) {
  const forWhom = content.forWhom ?? [];
  const when = content.when ?? [];
  const howToWear = content.howToWear ?? [];
  if (forWhom.length === 0 && when.length === 0 && howToWear.length === 0) return null;

  const updated = content.updatedAt ? monthYearFr(content.updatedAt) : undefined;

  return (
    <section aria-labelledby="forwhom-heading" className="dp-forwhom">
      {/* Trois colonnes jusqu'à 760 px ; en dessous les cartes s'empilent,
          la rangée des saisons garde ses quatre cases. */}
      <style>{`
        .dp-forwhom__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; align-items: start; }
        @media (max-width: 760px) {
          .dp-forwhom__grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1.25rem",
        }}
      >
        <h2
          id="forwhom-heading"
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: "var(--t-title)",
            fontWeight: 600,
            color: "var(--ink-900)",
          }}
        >
          Est-ce pour moi ? Pour qui, quand, comment
        </h2>
        {updated && (
          <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", color: "var(--ink-400)" }}>
            Rédigé par l&apos;équipe · mis à jour {updated}
          </p>
        )}
      </div>

      <div className="dp-forwhom__grid">
        {forWhom.length > 0 && (
          <Card glyph="?" title="Pour qui">
            <CheckList items={forWhom} />
          </Card>
        )}
        {(when.length > 0 || (content.seasons?.length ?? 0) > 0) && (
          <Card glyph="☼" title="Quand">
            {content.seasons && content.seasons.length > 0 && <SeasonRow active={content.seasons} />}
            {when.length > 0 && <CheckList items={when} />}
          </Card>
        )}
        {howToWear.length > 0 && (
          <Card glyph="✦" title="Comment">
            <CheckList items={howToWear} emphasize />
          </Card>
        )}
      </div>
    </section>
  );
}
