"use client";

import { useState, type ReactNode } from "react";

/* ──────────────────────────────────────────────────────────────────────────
   PAGE DE TRAVAIL — Propositions de réécriture de la section « Authenticité »
   Reproduit fidèlement la mise en page de la section #authenticite de la home
   (eyebrow doré + titre serif Cormorant avec partie en italique + sous-titre
   + 3 cartes numérotées 01/02/03), avec plusieurs variantes de texte.
   Sélecteur d'onglets : une seule variante affichée à la fois (page compacte).
   Non liée à la home, sert uniquement à comparer les tons de copywriting.
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
};

const VARIANTS: Variant[] = [
  {
    id: "A",
    label: "Variante A",
    ton: "Ton premium / maison de luxe",
    eyebrow: "Notre promesse",
    title: (
      <>
        L&apos;authenticité,
        <br />
        <em>sans compromis</em>
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
    ton: "Ton rassurant / direct",
    eyebrow: "Notre engagement",
    title: (
      <>
        100% authentique,
        <br />
        <em>ou remboursé</em>
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
    ton: "Ton orienté preuve / concret",
    eyebrow: "Authenticité vérifiable",
    title: (
      <>
        La preuve,
        <br />
        <em>pas la promesse</em>
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
    ton: "Ton sensoriel / narratif oriental",
    eyebrow: "L'art du flacon véritable",
    title: (
      <>
        Du Golfe à vous,
        <br />
        <em>rien entre les deux</em>
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

function SectionHeaderPreview({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
}) {
  return (
    <div style={{ textAlign: "center", marginBottom: 48 }}>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.78rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--gold-700, #A8801F)",
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
    </div>
  );
}

function AuthenticiteVariant({ variant }: { variant: Variant }) {
  return (
    <section style={{ background: "var(--surface-cream, #F8F2E6)", padding: "80px 20px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <SectionHeaderPreview
          eyebrow={variant.eyebrow}
          title={variant.title}
          subtitle={variant.subtitle}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
          {variant.cards.map((card) => (
            <div
              key={card.n}
              style={{
                background: "var(--surface-white, #FFFFFF)",
                borderRadius: "var(--r-lg, 14px)",
                padding: "36px 28px",
                border: "1px solid var(--line-200, #E5DAC6)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "4rem",
                  color: "var(--gold-100, #F6EAC8)",
                  position: "absolute",
                  top: 10,
                  right: 18,
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

function VariantTabs({
  variants,
  activeId,
  onSelect,
}: {
  variants: Variant[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: "center",
        maxWidth: 1240,
        margin: "26px auto 0",
        padding: "0 20px",
      }}
    >
      {variants.map((variant) => {
        const active = variant.id === activeId;
        return (
          <button
            key={variant.id}
            type="button"
            onClick={() => onSelect(variant.id)}
            aria-pressed={active}
            style={{
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              padding: "11px 20px",
              borderRadius: 999,
              border: active
                ? "1px solid var(--gold-400, #D8A63A)"
                : "1px solid rgba(255,255,255,0.18)",
              background: active ? "var(--gold-400, #D8A63A)" : "transparent",
              color: active ? "var(--ink-900, #1C1611)" : "rgba(255,255,255,0.78)",
              transition: "all 0.18s ease",
              lineHeight: 1.15,
              textAlign: "center",
            }}
          >
            <span style={{ display: "block" }}>{variant.label}</span>
            <span
              style={{
                display: "block",
                fontSize: "0.66rem",
                fontWeight: 400,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                opacity: active ? 0.78 : 0.55,
                marginTop: 3,
              }}
            >
              {variant.ton}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function PreviewAuthenticiteTextesPage() {
  const [activeId, setActiveId] = useState<string>(VARIANTS[0].id);
  const active = VARIANTS.find((v) => v.id === activeId) ?? VARIANTS[0];

  return (
    <main style={{ background: "var(--surface-cream, #F8F2E6)", minHeight: "100vh" }}>
      <header
        style={{
          background: "var(--ink-900, #1C1611)",
          padding: "40px 20px 30px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "var(--gold-400, #D8A63A)",
              marginBottom: 14,
            }}
          >
            Page de travail · interne
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3.6vw, 2.6rem)",
              color: "#FFFFFF",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Section « Authenticité » — <em>propositions de texte</em>
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.92rem",
              color: "rgba(255,255,255,0.66)",
              maxWidth: 620,
              margin: "14px auto 0",
              lineHeight: 1.6,
            }}
          >
            {VARIANTS.length} variantes de copywriting, même mise en page.
            Cliquez sur un onglet pour comparer les tons.
          </p>
        </div>

        <VariantTabs variants={VARIANTS} activeId={activeId} onSelect={setActiveId} />
      </header>

      <AuthenticiteVariant key={active.id} variant={active} />
    </main>
  );
}
