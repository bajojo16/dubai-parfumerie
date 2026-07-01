import type { ReactNode } from "react";

/* ──────────────────────────────────────────────────────────────────────────
   PAGE DE TRAVAIL — Propositions de réécriture de la section « Authenticité ».
   Chaque variante est rendue EXACTEMENT comme elle apparaîtrait dans la vraie
   section Authenticité de la home (mêmes tokens, même SectionHeader, même
   grille de 3 cartes). Les variantes sont empilées pour comparaison réelle,
   précédées d'un bandeau d'étiquette discret. Usage interne.
   ────────────────────────────────────────────────────────────────────────── */

type Card = { n: string; title: string; desc: string };

type Variant = {
  id: string;
  label: string;
  ton: string;
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  cards: Card[];
  recommended?: boolean;
};

const VARIANTS: Variant[] = [
  {
    id: "A",
    label: "Variante A",
    ton: "Premium · maison de luxe",
    eyebrow: "Notre promesse",
    recommended: true,
    title: (
      <>
        L&apos;authenticité, <em>sans compromis</em>
      </>
    ),
    subtitle:
      "Chaque flacon que nous vous adressons provient des maisons et distributeurs officiels des Émirats — jamais d'un intermédiaire, jamais d'une copie.",
    cards: [
      {
        n: "01",
        title: "Sourcing direct des Émirats",
        desc: "Nous sélectionnons nos parfums à la source, auprès des distilleries et distributeurs agréés de Dubaï et du Golfe. Une chaîne d'approvisionnement courte, maîtrisée et entièrement traçable.",
      },
      {
        n: "02",
        title: "Certificat numéroté",
        desc: "Chaque commande est accompagnée de son certificat d'authenticité numéroté et de son QR code, vérifiables auprès de la maison d'origine. La preuve de l'original, signée.",
      },
      {
        n: "03",
        title: "Sérénité garantie",
        desc: "Si votre parfum ne vous séduit pas, vous disposez de 30 jours pour nous le retourner et être remboursé. Votre confiance prime sur tout le reste.",
      },
    ],
  },
  {
    id: "B",
    label: "Variante B",
    ton: "Rassurant · direct",
    eyebrow: "Notre engagement",
    title: (
      <>
        100% authentique, <em>ou remboursé</em>
      </>
    ),
    subtitle:
      "Pas de contrefaçon, pas de mauvaise surprise. Vous recevez exactement le parfum officiel que vous avez commandé — ou nous vous remboursons.",
    cards: [
      {
        n: "01",
        title: "Achetés à la source à Dubaï",
        desc: "Nos parfums viennent directement des distributeurs officiels aux Émirats, sans revendeur opaque entre eux et vous. C'est ce qui nous permet de garantir l'origine de chaque flacon.",
      },
      {
        n: "02",
        title: "Un certificat dans chaque colis",
        desc: "Vous recevez un certificat d'authenticité numéroté avec un QR code. Un scan suffit pour confirmer que votre flacon est bien un original. Simple et vérifiable.",
      },
      {
        n: "03",
        title: "30 jours pour changer d'avis",
        desc: "Pas convaincu ? Renvoyez-nous votre commande sous 30 jours et vous êtes remboursé, sans justification. Et la livraison reste offerte dès 60 € d'achat.",
      },
    ],
  },
  {
    id: "C",
    label: "Variante C",
    ton: "Preuve · concret",
    eyebrow: "Authenticité vérifiable",
    title: (
      <>
        La preuve, <em>pas la promesse</em>
      </>
    ),
    subtitle:
      "Tout le monde dit vendre de l'authentique. Nous, on vous donne les moyens de le vérifier — certificat numéroté, QR code et traçabilité jusqu'aux Émirats.",
    cards: [
      {
        n: "01",
        title: "Traçabilité jusqu'à Dubaï",
        desc: "Chaque flacon est rattaché à un distributeur officiel agréé aux Émirats. Une chaîne d'approvisionnement courte et documentée, des distilleries du Golfe jusqu'à votre porte.",
      },
      {
        n: "02",
        title: "Certificat + QR à scanner",
        desc: "Votre certificat porte un numéro unique et un QR code. Scannez-le pour vérifier l'origine de votre parfum auprès de la maison. La vérification se fait en quelques secondes.",
      },
      {
        n: "03",
        title: "Remboursé sous 30 jours",
        desc: "Un doute persiste ? Vous avez 30 jours pour nous retourner votre commande et être intégralement remboursé. Une garantie claire, sans clause cachée.",
      },
    ],
  },
  {
    id: "D",
    label: "Variante D",
    ton: "Sensoriel · narratif oriental",
    eyebrow: "L'art du flacon véritable",
    title: (
      <>
        Du Golfe à vous, <em>rien entre les deux</em>
      </>
    ),
    subtitle:
      "Oud, ambre, rose de Taïf : ces matières trop précieuses pour être contrefaites méritent un parcours irréprochable. Nous le garantissons, des Émirats jusqu'à votre flacon.",
    cards: [
      {
        n: "01",
        title: "Sélectionnés au berceau de l'oud",
        desc: "Nous sourçons nos parfums directement auprès des maisons et distributeurs officiels de Dubaï et du Golfe, là où naissent les plus belles compositions orientales. Une provenance sans détour.",
      },
      {
        n: "02",
        title: "L'original, certifié et numéroté",
        desc: "Chaque création est accompagnée de son certificat d'authenticité numéroté et de son QR code, vérifiables auprès de la maison d'origine. La signature d'un flacon véritable.",
      },
      {
        n: "03",
        title: "Satisfait ou remboursé, 30 jours",
        desc: "Si l'accord ne se fait pas avec votre peau, vous avez 30 jours pour nous le retourner et être remboursé. Expédition en 48 h, livraison offerte dès 60 €.",
      },
    ],
  },
];

/* SectionHeader — réplique exacte de celui de la home */
function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
}) {
  return (
    <div style={{ textAlign: "center", marginBottom: 48 }}>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.78rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--gold-700)",
          marginBottom: 12,
          fontWeight: 500,
        }}
      >
        {eyebrow}
      </div>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.2rem, 3.8vw, 3.2rem)",
          color: "var(--ink-900)",
          margin: 0,
          lineHeight: 1.12,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1.1rem",
            color: "var(--ink-500)",
            marginTop: 16,
            lineHeight: 1.7,
            maxWidth: 640,
            marginInline: "auto",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* Rendu RÉEL de la section Authenticité pour une variante donnée */
function AuthenticiteSection({ variant }: { variant: Variant }) {
  return (
    <section
      style={{ background: "var(--surface-cream)", padding: "80px 20px" }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <SectionHeader
          eyebrow={variant.eyebrow}
          title={variant.title}
          subtitle={variant.subtitle}
        />
        <div
          className="auth-cards"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 28,
          }}
        >
          {variant.cards.map((card) => (
            <div
              key={card.n}
              style={{
                background: "var(--surface-white)",
                borderRadius: "var(--r-lg)",
                padding: "36px 28px",
                border: "1px solid var(--line-200)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "4rem",
                  color: "var(--gold-100)",
                  position: "absolute",
                  top: 10,
                  insetInlineEnd: 18,
                  lineHeight: 1,
                  userSelect: "none",
                }}
              >
                {card.n}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.35rem",
                  color: "var(--ink-900)",
                  marginBottom: 14,
                  position: "relative",
                }}
              >
                {card.title}
              </div>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.88rem",
                  color: "var(--ink-500)",
                  lineHeight: 1.72,
                  margin: 0,
                }}
              >
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PreviewAuthenticiteTextesPage() {
  return (
    <main style={{ background: "var(--surface-page)" }}>
      {VARIANTS.map((variant) => (
        <div key={variant.id}>
          {/* Bandeau étiquette de la variante */}
          <div className="vlabel">
            <span className="vlabel-id">{variant.label}</span>
            <span className="vlabel-ton">{variant.ton}</span>
            {variant.recommended && (
              <span className="vlabel-reco">Recommandée</span>
            )}
          </div>
          {/* Rendu réel de la section */}
          <AuthenticiteSection variant={variant} />
        </div>
      ))}

      <style>{`
        .vlabel {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          max-width: 1240px;
          margin-inline: auto;
          padding: 22px 20px 0;
        }
        .vlabel-id {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--ink-900);
        }
        .vlabel-ton {
          font-family: var(--font-sans);
          font-size: 0.7rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--ink-500, #6B5D4E);
          padding-inline: 12px;
          padding-block: 6px;
          border: 1px solid var(--line-200);
          border-radius: 999px;
          background: #fff;
        }
        .vlabel-reco {
          font-family: var(--font-sans);
          font-size: 0.64rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--gold-700);
          padding-inline: 13px;
          padding-block: 6px;
          border-radius: 999px;
          background: linear-gradient(180deg, #FBF1D6, #F4E4BA);
          border: 1px solid var(--gold-400, #D8A63A);
        }
        @media (max-width: 760px) {
          .auth-cards { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
