import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { BRAND_PROFILES, profileForSlug } from "@/data/brand-profiles";

/**
 * Page de personnalité d'une maison.
 *
 * Elle se peint aux couleurs de la maison, pas à celles du site : `palette`
 * vient de `brand-profiles.ts`, où chaque teinte porte sa provenance. Une page
 * de maison rendue dans le crème et l'or de Dubaï Parfumerie dirait la même
 * chose des onze marques — c'est précisément ce qu'on cherche à éviter. Les
 * couleurs sont donc posées en variables CSS locales sur le conteneur racine,
 * jamais en dur dans les blocs.
 *
 * Les fonds clairs et le fond sombre de Reef passent par les mêmes variables :
 * `encre` et `encreDouce` sont déjà accordées à `fond` dans chaque profil, il
 * n'y a donc pas de branche « thème sombre » ici.
 *
 * `/marques/reef` est servie par la page dédiée voisine, plus ancienne : dans
 * l'App Router, un segment statique l'emporte sur `[slug]`. Le profil Reef
 * décrit ici reste donc à brancher le jour où l'une des deux pages sera retirée.
 */

export function generateStaticParams() {
  return BRAND_PROFILES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = profileForSlug(slug);
  if (!p) return {};
  return {
    title: `${p.nom} — la maison`,
    description: `${p.accroche} ${p.anciennete}. ${p.prix}.`,
  };
}

export default async function BrandProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = profileForSlug(slug);
  if (!p) notFound();

  const c = p.palette;

  return (
    <div
      style={
        {
          "--bp-fond": c.fond,
          "--bp-bloc": c.bloc,
          "--bp-encre": c.encre,
          "--bp-encre-douce": c.encreDouce,
          "--bp-accent": c.accent,
          "--bp-accent-doux": c.accentDoux,
          "--bp-filet": c.filet,
          background: "var(--bp-fond)",
          color: "var(--bp-encre)",
          minHeight: "100vh",
        } as React.CSSProperties
      }
    >
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "64px 20px 96px" }}>
        {/* ── Fil d'Ariane ─────────────────────────────────────────── */}
        <Link
          href="/marques"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.72rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--bp-accent)",
            textDecoration: "none",
          }}
        >
          ← Toutes les maisons
        </Link>

        {/* ── Ouverture ────────────────────────────────────────────── */}
        <header style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.68rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--bp-encre-douce)",
            }}
          >
            {p.drapeau} {p.pays} · {p.anciennete}
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem, 6vw, 3.6rem)",
              fontWeight: 600,
              lineHeight: 1.04,
              margin: 0,
              textWrap: "balance",
            }}
          >
            {p.nom}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.2rem, 2.6vw, 1.6rem)",
              fontStyle: "italic",
              color: "var(--bp-accent)",
              margin: 0,
              maxWidth: "24ch",
            }}
          >
            {p.accroche}
          </p>
        </header>

        {/* ── Le récit ─────────────────────────────────────────────── */}
        <section style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 16 }}>
          {p.recit.map((par) => (
            <p
              key={par.slice(0, 24)}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1rem",
                fontWeight: 300,
                lineHeight: 1.78,
                color: "var(--bp-encre-douce)",
                margin: 0,
                maxWidth: "66ch",
              }}
            >
              {par}
            </p>
          ))}

          {p.citation && (
            <blockquote
              style={{
                margin: "10px 0 0",
                paddingInlineStart: 20,
                borderInlineStart: `2px solid var(--bp-accent)`,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.35rem",
                  fontStyle: "italic",
                  lineHeight: 1.35,
                }}
              >
                « {p.citation.texte} »
              </span>
              <cite
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.74rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontStyle: "normal",
                  color: "var(--bp-encre-douce)",
                }}
              >
                {p.citation.source}
              </cite>
            </blockquote>
          )}
        </section>

        {/* ── Territoire olfactif ──────────────────────────────────── */}
        <Bloc titre="Son territoire olfactif">
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: 20,
              margin: 0,
            }}
          >
            {p.territoire.map((t) => (
              <div key={t.titre}>
                <dt
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--bp-accent)",
                    marginBottom: 5,
                  }}
                >
                  {t.titre}
                </dt>
                <dd
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.9rem",
                    fontWeight: 300,
                    lineHeight: 1.6,
                    color: "var(--bp-encre-douce)",
                  }}
                >
                  {t.detail}
                </dd>
              </div>
            ))}
          </dl>
        </Bloc>

        {/* ── Les références qui font la maison ────────────────────── */}
        <Bloc titre="Ce qui fait la maison">
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" }}>
            {p.phares.map((f, i) => (
              <li
                key={f.nom}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 15rem) minmax(0, 1fr)",
                  gap: 18,
                  padding: "14px 0",
                  borderTop: i === 0 ? "none" : `1px solid var(--bp-filet)`,
                  alignItems: "baseline",
                }}
              >
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.16rem", fontWeight: 600 }}>
                  {f.nom}
                  {f.annee && (
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.7rem",
                        fontWeight: 400,
                        color: "var(--bp-encre-douce)",
                        marginInlineStart: 8,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {f.annee}
                    </span>
                  )}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.9rem",
                    fontWeight: 300,
                    lineHeight: 1.62,
                    color: "var(--bp-encre-douce)",
                  }}
                >
                  {f.note}
                </span>
              </li>
            ))}
          </ul>
        </Bloc>

        {/* ── Le fait qu'on ne devine pas ──────────────────────────── */}
        <Bloc titre="Ce qu'on ne devine pas">
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              fontWeight: 300,
              lineHeight: 1.76,
              color: "var(--bp-encre-douce)",
              maxWidth: "64ch",
            }}
          >
            {p.fait}
          </p>
        </Bloc>

        {/* ── Registre visuel + repères ────────────────────────────── */}
        <Bloc titre="Son registre">
          <p
            style={{
              margin: "0 0 22px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.95rem",
              fontWeight: 300,
              lineHeight: 1.72,
              color: "var(--bp-encre-douce)",
              maxWidth: "64ch",
            }}
          >
            {p.registre}
          </p>

          {/* Les teintes de la maison, montrées plutôt que décrites. */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
            {[
              { nom: "Accent", val: c.accent },
              { nom: "Fond", val: c.fond },
              { nom: "Bloc", val: c.bloc },
              { nom: "Encre", val: c.encre },
            ].map((t) => (
              <div key={t.nom} style={{ display: "flex", flexDirection: "column", gap: 5, width: 92 }}>
                <span
                  style={{
                    height: 44,
                    borderRadius: 3,
                    background: t.val,
                    border: `1px solid var(--bp-filet)`,
                    display: "block",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.62rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--bp-encre-douce)",
                  }}
                >
                  {t.nom}
                </span>
                <code
                  style={{
                    fontFamily: "ui-monospace, Menlo, monospace",
                    fontSize: "0.66rem",
                    color: "var(--bp-encre-douce)",
                  }}
                >
                  {t.val}
                </code>
              </div>
            ))}
          </div>

          <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            <Repere libelle="Typographie" valeur={p.typographie} />
            <Repere libelle="Prix constatés" valeur={p.prix} />
            <Repere libelle="Provenance des teintes" valeur={p.sourceCouleurs} />
          </dl>
        </Bloc>

        {/* ── Passerelle vers le catalogue ─────────────────────────── */}
        <div style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            href={`/catalogue?marque=${encodeURIComponent(p.nom)}`}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textDecoration: "none",
              padding: "13px 26px",
              borderRadius: 999,
              background: "var(--bp-accent)",
              color: c.fond,
            }}
          >
            Voir les parfums {p.nom}
          </Link>
          <Link
            href="/marques"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              letterSpacing: "0.06em",
              textDecoration: "none",
              padding: "13px 26px",
              borderRadius: 999,
              border: `1px solid var(--bp-filet)`,
              color: "var(--bp-encre)",
            }}
          >
            Les autres maisons
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Section titrée, sur le fond surélevé de la maison. */
function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        marginTop: 34,
        background: "var(--bp-bloc)",
        border: `1px solid var(--bp-filet)`,
        borderRadius: 6,
        padding: "26px 26px 28px",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.7rem",
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--bp-encre-douce)",
          margin: "0 0 18px",
          paddingBottom: 10,
          borderBottom: `1px solid var(--bp-filet)`,
        }}
      >
        {titre}
      </h2>
      {children}
    </section>
  );
}

/** Une ligne libellé / valeur, pour les repères de fin de page. */
function Repere({ libelle, valeur }: { libelle: string; valeur: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 12rem) minmax(0, 1fr)", gap: 14 }}>
      <dt
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.68rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--bp-accent)",
        }}
      >
        {libelle}
      </dt>
      <dd
        style={{
          margin: 0,
          fontFamily: "var(--font-sans)",
          fontSize: "0.86rem",
          fontWeight: 300,
          lineHeight: 1.6,
          color: "var(--bp-encre-douce)",
        }}
      >
        {valeur}
      </dd>
    </div>
  );
}
