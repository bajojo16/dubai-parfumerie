/**
 * Page « Commande à la demande ».
 *
 * Promesse : ces références ne sont PAS en stock. Le client compose sa liste
 * parmi les maisons du Golfe que la boutique sait faire venir, puis l'envoie —
 * WhatsApp de préférence, e-mail sinon. Rien n'est vendu depuis cette page :
 * c'est une demande de disponibilité et de prix, pas un panier.
 *
 * Cette moitié-là est rendue par le serveur (métadonnées, texte indexable, page
 * lisible sans JavaScript) ; l'outil de sélection vit dans `_on-demand-client`,
 * qui charge la base de références en `import()` dynamique.
 *
 * Libellés en français en dur, comme `livraison/page.tsx` ou `produit/[slug]` :
 * les fichiers de `src/messages/` ne couvrent pas ces pages.
 */

import type { Metadata } from "next";
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
  const title = "Commande à la demande — parfums des maisons du Golfe";
  const description =
    "Un parfum émirati que nous n'avons pas en boutique ? Composez votre liste parmi 455 références de 22 maisons du Golfe et envoyez-la par WhatsApp : nous vous confirmons disponibilité, prix et délai.";

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

/** Les trois temps du service — ce que le client attend de savoir tout de suite. */
const STEPS = [
  {
    n: "01",
    t: "Vous composez la liste",
    d: "Cherchez par nom de parfum ou par maison, touchez les cartes qui vous intéressent. La liste se garde même si vous fermez la page.",
  },
  {
    n: "02",
    t: "Nous consultons nos relais",
    d: "Nos acheteurs à Dubaï, Charjah et Mascate vérifient le lot, la contenance et le prix départ. Réponse dans la journée sur WhatsApp.",
  },
  {
    n: "03",
    t: "Vous décidez ensuite",
    d: "Rien n'est engagé tant que vous n'avez pas validé le devis. Comptez dix à vingt jours entre la commande et la réception.",
  },
];

export default function CommandeALaDemandePage() {
  return (
    <div style={{ background: "var(--surface-page)", minHeight: "100vh" }}>
      {/* ── En-tête éditorial ── */}
      <section
        style={{
          maxWidth: "var(--container-narrow)",
          margin: "0 auto",
          padding: "clamp(48px, 7vw, 88px) var(--gutter) clamp(28px, 4vw, 44px)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: "0 0 16px",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--t-xs)",
            fontWeight: "var(--fw-semibold)",
            letterSpacing: "var(--ls-widest)",
            textTransform: "uppercase",
            color: "var(--gold-700)",
          }}
        >
          Service sur commande
        </p>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontWeight: "var(--fw-medium)",
            fontSize: "var(--t-hero)",
            lineHeight: "var(--lh-tight)",
            color: "var(--ink-900)",
          }}
        >
          Commande à la demande
        </h1>
        <p
          style={{
            margin: "20px auto 0",
            maxWidth: "62ch",
            fontFamily: "var(--font-sans)",
            fontWeight: "var(--fw-light)",
            fontSize: "var(--t-lead)",
            lineHeight: "var(--lh-relaxed)",
            color: "var(--ink-500)",
          }}
        >
          Notre boutique ne tient qu&apos;une part de ce que produisent les maisons émiraties. Les références
          rassemblées ici ne sont donc <strong style={{ fontWeight: "var(--fw-medium)", color: "var(--ink-700)" }}>pas
          en stock</strong> : nous les faisons venir pour vous, flacon par flacon, auprès de nos relais dans le Golfe.
        </p>
        <p
          style={{
            margin: "14px auto 0",
            maxWidth: "62ch",
            fontFamily: "var(--font-sans)",
            fontWeight: "var(--fw-light)",
            fontSize: "var(--t-body)",
            lineHeight: "var(--lh-relaxed)",
            color: "var(--ink-500)",
          }}
        >
          Ce sont des flacons authentiques des maisons citées, achetés à la source. Dites-nous ce que vous cherchez ;
          nous vous répondons avec la disponibilité réelle, le prix et le délai.
        </p>
      </section>

      {/* ── Les trois temps du service ── */}
      <section
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding: "0 var(--gutter) clamp(32px, 5vw, 52px)",
        }}
      >
        <div className="dp-od-steps">
          {STEPS.map((s) => (
            <div
              key={s.n}
              style={{
                minWidth: 0,
                padding: "22px 24px",
                background: "var(--surface-white)",
                border: "1px solid var(--line-200)",
                borderRadius: "var(--r-lg)",
              }}
            >
              <span
                style={{
                  display: "block",
                  marginBottom: 10,
                  fontFamily: "var(--font-display)",
                  fontSize: "1.5rem",
                  color: "var(--gold-500)",
                }}
              >
                {s.n}
              </span>
              <h2
                style={{
                  margin: "0 0 8px",
                  fontFamily: "var(--font-display)",
                  fontWeight: "var(--fw-medium)",
                  fontSize: "1.25rem",
                  color: "var(--ink-900)",
                }}
              >
                {s.t}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-sans)",
                  fontWeight: "var(--fw-light)",
                  fontSize: "var(--t-sm)",
                  lineHeight: "var(--lh-relaxed)",
                  color: "var(--ink-500)",
                }}
              >
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Outil de sélection (client) ── */}
      <OnDemandClient />

      {/* ── Précision de cadre, discrète mais nécessaire ── */}
      <section
        style={{
          maxWidth: "var(--container-narrow)",
          margin: "0 auto",
          padding: "0 var(--gutter) clamp(48px, 7vw, 88px)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontWeight: "var(--fw-light)",
            fontSize: "var(--t-xs)",
            lineHeight: "var(--lh-relaxed)",
            color: "var(--ink-400)",
            textAlign: "center",
          }}
        >
          Les maisons sont citées nominativement, à titre d&apos;information, pour désigner les flacons que vous
          souhaitez commander. Dubaï Parfumerie n&apos;est le distributeur officiel d&apos;aucune d&apos;entre elles ;
          les marques et noms de parfums restent la propriété de leurs titulaires.
        </p>
      </section>

      {/* Une seule règle de mise en page ici : trois colonnes qui se replient au
          seuil mobile du repo (760 px). Le reste tient en style inline. */}
      <style>{`
        .dp-od-steps {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        @media (max-width: 760px) {
          .dp-od-steps { grid-template-columns: minmax(0, 1fr); gap: 12px; }
        }
      `}</style>
    </div>
  );
}
