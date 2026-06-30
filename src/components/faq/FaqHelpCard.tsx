"use client";

import { useState } from "react";
import { T } from "./faq.data";
import { CtaLink } from "./answers/CtaLink";

export type FaqHelpLabels = {
  eyebrow: string;
  title: string;
  subtitle: string;
  whatsapp: string;
  email: string;
  seeAll: string;
};

const DEFAULT_LABELS: FaqHelpLabels = {
  eyebrow: "Besoin d'aide ?",
  title: "Une autre question ?",
  subtitle: "Notre équipe vous répond en moins de 2h, du lundi au samedi.",
  whatsapp: "Discuter sur WhatsApp",
  email: "Nous écrire",
  seeAll: "Voir toute la FAQ",
};

/** Numéro WhatsApp par défaut (format international sans « + »). À remplacer. */
const DEFAULT_WHATSAPP = "966583728407";
const DEFAULT_EMAIL = "contact@dubaiparfumerie.com";

export function FaqHelpCard({
  labels,
  whatsappNumber = DEFAULT_WHATSAPP,
  email = DEFAULT_EMAIL,
  seeAllHref,
}: {
  labels?: Partial<FaqHelpLabels>;
  whatsappNumber?: string;
  email?: string;
  /** Si fourni, affiche le bouton « Voir toute la FAQ » en première position. */
  seeAllHref?: string;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const [hover, setHover] = useState<"wa" | "mail" | null>(null);

  return (
    <div
      style={{
        marginTop: 28,
        background: `linear-gradient(140deg, ${T.cream3}, ${T.cream})`,
        border: `1px solid ${T.line2}`,
        borderRadius: 18,
        padding: "26px 24px",
        textAlign: "start",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: T.gold,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {L.eyebrow}
      </div>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 24,
          fontWeight: 500,
          color: T.inkWarm,
          margin: "0 0 6px",
        }}
      >
        {L.title}
      </h3>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 13.5,
          color: T.ink2,
          lineHeight: 1.6,
          margin: "0 0 18px",
          maxWidth: 420,
        }}
      >
        {L.subtitle}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
        {seeAllHref && <CtaLink href={seeAllHref} label={L.seeAll} variant="line" />}
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHover("wa")}
          onMouseLeave={() => setHover(null)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            borderRadius: 999,
            padding: "11px 20px",
            background: hover === "wa" ? T.ink : T.inkWarm,
            color: T.cream3,
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            transition: "background 200ms ease",
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.7.8-2.7-.2-.3A8 8 0 1 1 12 20zm4.6-5.9c-.3-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8.9-.3.2-.6.1a6.6 6.6 0 0 1-1.9-1.2 7.3 7.3 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.5l.4-.5.3-.4v-.4c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.6 1.1 2.8s1.9 2.9 4.6 4a5 5 0 0 0 2 .6 2.4 2.4 0 0 0 1.6-.6 2 2 0 0 0 .4-1.4c-.1-.1-.2-.2-.5-.3z" />
          </svg>
          {L.whatsapp}
        </a>
        <a
          href={`mailto:${email}`}
          onMouseEnter={() => setHover("mail")}
          onMouseLeave={() => setHover(null)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            borderRadius: 999,
            padding: "11px 20px",
            background: hover === "mail" ? "rgba(168,132,62,.10)" : "transparent",
            color: T.goldDeep,
            border: `1px solid ${T.goldSoft}`,
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            transition: "background 200ms ease",
          }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
          {L.email}
        </a>
      </div>
    </div>
  );
}
