/**
 * Page « Commande à la demande ».
 *
 * Le service : la boutique tient environ 450 références en rayon, mais fait
 * venir du Golfe n'importe quel parfum de ses maisons partenaires sous deux à
 * trois semaines. La page est construite autour de cette promesse, dans cet
 * ordre : en-tête et conditions → comment ça marche → outil de demande
 * (maison, parfum, panier de demande, coordonnées, demandes fréquentes) →
 * réassurance → FAQ → cadre légal.
 *
 * Tout ce qui n'a pas besoin d'état est rendu par le serveur (métadonnées,
 * texte indexable, page lisible sans JavaScript). L'outil de demande vit dans
 * `_on-demand-client`, qui charge la base de références en `import()`
 * dynamique — 792 Ko qui n'ont rien à faire dans le chunk initial.
 *
 * Libellés en français en dur, comme `livraison/page.tsx` ou `produit/[slug]` :
 * les fichiers de `src/messages/` ne couvrent pas ces pages.
 */

import type { Metadata } from "next";
import { LEAD_TIME, QUOTE_DELAY, PARTNER_HOUSES } from "@/data/on-demand-catalog";
import { CONDITIONS, REASSURANCE, STEPS } from "@/components/on-demand/content";
import { SectionHeading } from "@/components/on-demand/SectionHeading";
import { OnDemandFaq } from "@/components/on-demand/OnDemandFaq";
import { OnDemandClient } from "./_on-demand-client";

const PATH = "/commande-a-la-demande";
const BASE = "https://www.dubaiparfumerie.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // `localePrefix: 'as-needed'` : le français n'a pas de préfixe d'URL.
  const url = locale === "fr" ? BASE + PATH : BASE + "/" + locale + PATH;
  const title = "Commande à la demande — le parfum que vous cherchez, même hors rayon";
  const description =
    "Un parfum d'une maison du Golfe que nous n'avons pas en boutique ? Composez votre demande parmi " +
    PARTNER_HOUSES.length +
    " maisons partenaires : prix et disponibilité confirmés sous " +
    QUOTE_DELAY +
    ", livraison sous " +
    LEAD_TIME +
    ".";

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        ["fr", "en", "es", "de", "it", "ru", "ar"].map((l) => [
          l,
          l === "fr" ? BASE + PATH : BASE + "/" + l + PATH,
        ]),
      ),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Dubaï Parfumerie",
      type: "website",
    },
  };
}

/** Pictos ligne, même trait que la barre de réassurance du header. */
const ic = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};
const REASSURANCE_ICONS = [
  <svg key="auth" {...ic}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></svg>,
  <svg key="world" {...ic}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.5 3.8 5.6 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3z" /></svg>,
  <svg key="lock" {...ic}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>,
];

export default function CommandeALaDemandePage() {
  return (
    <div style={{ background: "var(--surface-page)", minHeight: "100vh", fontFamily: "var(--font-sans)" }}>
      {/* ── 1. En-tête : la promesse, le délai, les conditions ── */}
      <section
        style={{
          background: "var(--espresso-900)",
          padding: "clamp(48px, 7vw, 88px) var(--gutter) clamp(40px, 5vw, 64px)",
        }}
      >
        <div style={{ maxWidth: "var(--container)", margin: "0 auto" }}>
          <div className="dp-od-hero">
            <div>
              <p
                style={{
                  margin: "0 0 14px",
                  fontSize: "var(--t-xs)",
                  fontWeight: "var(--fw-medium)",
                  letterSpacing: "var(--ls-widest)",
                  textTransform: "uppercase",
                  color: "var(--gold-400)",
                }}
              >
                Service sur commande · {PARTNER_HOUSES.length} maisons du Golfe
              </p>
              <h1
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontWeight: "var(--fw-light)",
                  fontSize: "var(--t-hero)",
                  lineHeight: "var(--lh-tight)",
                  letterSpacing: "var(--ls-tight)",
                  color: "var(--on-dark-strong)",
                  maxWidth: "16ch",
                }}
              >
                Le parfum que vous cherchez, même s&apos;il n&apos;est pas en rayon.
              </h1>
              <p
                style={{
                  margin: "22px 0 0",
                  maxWidth: "58ch",
                  fontWeight: "var(--fw-light)",
                  fontSize: "var(--t-lead)",
                  lineHeight: "var(--lh-relaxed)",
                  color: "var(--on-dark-muted)",
                }}
              >
                Notre boutique tient environ 450 références. Les maisons du Golfe en produisent des milliers.
                Dites-nous lequel vous manque : nous le faisons venir pour vous, flacon authentique, sous{" "}
                <strong style={{ fontWeight: "var(--fw-medium)", color: "var(--on-dark)" }}>{LEAD_TIME}</strong>.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
                <a
                  href="#demande"
                  className="dp-od-cta"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 50,
                    padding: "0 26px",
                    borderRadius: "var(--r-pill)",
                    background: "var(--gold-500)",
                    color: "var(--espresso-900)",
                    fontSize: "var(--t-sm)",
                    fontWeight: "var(--fw-semibold)",
                    letterSpacing: "var(--ls-wide)",
                    textTransform: "uppercase",
                    textDecoration: "none",
                  }}
                >
                  Composer ma demande
                </a>
                <a
                  href="#comment-ca-marche"
                  className="dp-od-cta-ghost"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 50,
                    padding: "0 26px",
                    borderRadius: "var(--r-pill)",
                    border: "1px solid var(--line-dark)",
                    color: "var(--on-dark)",
                    fontSize: "var(--t-sm)",
                    fontWeight: "var(--fw-medium)",
                    letterSpacing: "var(--ls-wide)",
                    textTransform: "uppercase",
                    textDecoration: "none",
                  }}
                >
                  Comment ça marche
                </a>
              </div>
            </div>

            {/* Conditions : quatre cartes sombres, lisibles avant de s'engager */}
            <ul className="dp-od-conditions" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {CONDITIONS.map((c) => (
                <li
                  key={c.title}
                  style={{
                    padding: "18px 20px",
                    border: "1px solid var(--line-dark)",
                    borderRadius: "var(--r-lg)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 6px",
                      fontFamily: "var(--font-display)",
                      fontWeight: "var(--fw-medium)",
                      fontSize: "1.15rem",
                      lineHeight: "var(--lh-snug)",
                      color: "var(--gold-300)",
                    }}
                  >
                    {c.title}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: "var(--fw-light)",
                      fontSize: "var(--t-sm)",
                      lineHeight: "var(--lh-relaxed)",
                      color: "var(--on-dark-muted)",
                    }}
                  >
                    {c.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 2. Comment ça marche ── */}
      {/* La demande AVANT le parcours : qui arrive ici sait ce qu'il cherche, il
          veut composer, pas lire quatre étapes d'abord. Le parcours reste juste
          dessous pour qui veut comprendre ce qui se passe après l'envoi. */}
      <section id="demande" style={{ scrollMarginTop: 80 }}>
        <OnDemandClient />
      </section>

      <section
        id="comment-ca-marche"
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding: "clamp(48px, 6vw, 80px) var(--gutter) clamp(32px, 4vw, 56px)",
          scrollMarginTop: 80,
        }}
      >
        <SectionHeading
          eyebrow="Le parcours"
          title="Comment ça marche"
          subtitle={
            "Quatre étapes, aucune surprise : vous ne payez rien avant d'avoir vu le prix confirmé, et vous connaissez le délai avant de valider."
          }
        />
        <ol className="dp-od-steps" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {STEPS.map((s, i) => (
            <li
              key={s.n}
              style={{
                position: "relative",
                minWidth: 0,
                padding: "24px 22px 22px",
                background: "var(--surface-white)",
                border: "1px solid var(--line-200)",
                borderRadius: "var(--r-lg)",
              }}
            >
              {/* Trait de liaison vers l'étape suivante — masqué sur la dernière et en colonne */}
              {i < STEPS.length - 1 ? <span className="dp-od-step-link" aria-hidden /> : null}
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", lineHeight: 1, color: "var(--gold-500)" }}>{s.n}</span>
                <span
                  style={{
                    fontSize: "var(--t-xs)",
                    fontWeight: "var(--fw-medium)",
                    letterSpacing: "var(--ls-wide)",
                    textTransform: "uppercase",
                    color: "var(--ink-400)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.meta}
                </span>
              </div>
              <h3
                style={{
                  margin: "0 0 8px",
                  fontFamily: "var(--font-display)",
                  fontWeight: "var(--fw-medium)",
                  fontSize: "1.3rem",
                  lineHeight: "var(--lh-snug)",
                  color: "var(--ink-900)",
                }}
              >
                {s.title}
              </h3>
              <p style={{ margin: 0, fontWeight: "var(--fw-light)", fontSize: "var(--t-sm)", lineHeight: "var(--lh-relaxed)", color: "var(--ink-500)" }}>
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 3 à 5 + 8. Outil de demande (client) : maison, parfum, panier de
             demande, coordonnées, demandes fréquentes ── */}

      {/* ── 7. Réassurance ── */}
      <section style={{ background: "var(--surface-cream)", borderTop: "1px solid var(--line-100)", borderBottom: "1px solid var(--line-100)" }}>
        <div style={{ maxWidth: "var(--container)", margin: "0 auto", padding: "clamp(36px, 5vw, 56px) var(--gutter)" }}>
          <ul className="dp-od-trust" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {REASSURANCE.map((r, i) => (
              <li key={r.label} style={{ display: "flex", gap: 16, alignItems: "flex-start", minWidth: 0 }}>
                <span
                  style={{
                    flex: "0 0 auto",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    border: "1px solid var(--line-300)",
                    background: "var(--surface-white)",
                    color: "var(--gold-700)",
                  }}
                >
                  {REASSURANCE_ICONS[i]}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: "0 0 4px", fontFamily: "var(--font-display)", fontWeight: "var(--fw-medium)", fontSize: "1.15rem", lineHeight: "var(--lh-snug)", color: "var(--ink-900)" }}>
                    {r.label}
                  </p>
                  <p style={{ margin: 0, fontWeight: "var(--fw-light)", fontSize: "var(--t-sm)", lineHeight: "var(--lh-relaxed)", color: "var(--ink-500)" }}>{r.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 6. FAQ ── */}
      <section style={{ maxWidth: "var(--container)", margin: "0 auto", padding: "clamp(48px, 6vw, 80px) var(--gutter) clamp(32px, 4vw, 48px)" }}>
        <SectionHeading eyebrow="Questions fréquentes" title="Tout ce qu'il faut savoir avant de commander" />
        <OnDemandFaq />
      </section>

      {/* ── Précision de cadre, discrète mais nécessaire ── */}
      <section style={{ maxWidth: "var(--container-narrow)", margin: "0 auto", padding: "0 var(--gutter) clamp(48px, 7vw, 88px)" }}>
        <p style={{ margin: 0, fontWeight: "var(--fw-light)", fontSize: "var(--t-xs)", lineHeight: "var(--lh-relaxed)", color: "var(--ink-400)", textAlign: "center" }}>
          Les maisons sont citées nominativement, à titre d&apos;information, pour désigner les flacons que vous
          souhaitez commander. Dubaï Parfumerie n&apos;est le distributeur officiel d&apos;aucune d&apos;entre elles ;
          les marques et noms de parfums restent la propriété de leurs titulaires.
        </p>
      </section>

      {/* Grilles et survols : ce qui ne se fait pas en style inline. Seuil deux
          colonnes à 1000 px (demande de la maquette), repli une colonne sous
          760 px comme le reste du site. */}
      <style>{`
        .dp-od-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
          gap: clamp(28px, 4vw, 64px);
          align-items: center;
        }
        .dp-od-conditions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .dp-od-cta:hover { background: var(--gold-400); }
        .dp-od-cta-ghost:hover { border-color: var(--gold-400); color: var(--on-dark-strong); }
        .dp-od-cta:focus-visible, .dp-od-cta-ghost:focus-visible { outline: none; box-shadow: var(--focus-ring); }

        .dp-od-steps {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }
        .dp-od-step-link {
          position: absolute;
          top: 36px;
          inset-inline-end: -17px;
          width: 18px;
          height: 1px;
          background: var(--line-300);
        }
        .dp-od-trust {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 28px;
        }
        @media (max-width: 1000px) {
          .dp-od-hero { grid-template-columns: minmax(0, 1fr); }
          .dp-od-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .dp-od-step-link { display: none; }
        }
        @media (max-width: 760px) {
          .dp-od-conditions { grid-template-columns: minmax(0, 1fr); }
          .dp-od-steps { grid-template-columns: minmax(0, 1fr); gap: 12px; }
          .dp-od-trust { grid-template-columns: minmax(0, 1fr); gap: 20px; }
          .dp-odh { margin-bottom: 24px !important; }
        }
      `}</style>
    </div>
  );
}
