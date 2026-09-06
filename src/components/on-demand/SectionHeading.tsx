import type { ReactNode } from "react";

/**
 * Sur-titre doré + titre serif + sous-titre, dans le gabarit du
 * `SectionHeader` de l'accueil. Réécrit ici plutôt qu'importé : celui de
 * `_home-client.tsx` n'est pas exporté et vit dans un module client de
 * plusieurs centaines de Ko — l'importer entraînerait tout l'accueil dans le
 * chunk de cette page. Ce composant est un composant serveur.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  dark = false,
  as: Tag = "h2",
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "start";
  dark?: boolean;
  as?: "h1" | "h2";
}) {
  return (
    <div className="dp-odh" style={{ textAlign: align, marginBottom: 36 }}>
      <p
        style={{
          margin: "0 0 12px",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--t-xs)",
          fontWeight: "var(--fw-medium)",
          letterSpacing: "var(--ls-widest)",
          textTransform: "uppercase",
          color: dark ? "var(--gold-400)" : "var(--gold-700)",
        }}
      >
        {eyebrow}
      </p>
      <Tag
        style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontWeight: "var(--fw-medium)",
          // Même clamp que l'accueil : sur 390 px un titre de trois mots tient
          // en deux lignes, sur grand écran il n'écrase pas la section.
          fontSize: "clamp(1.55rem, 3.2vw, 2.6rem)",
          lineHeight: 1.12,
          color: dark ? "var(--on-dark-strong)" : "var(--ink-900)",
        }}
      >
        {title}
      </Tag>
      {subtitle ? (
        <p
          style={{
            margin: "14px 0 0",
            marginInline: align === "center" ? "auto" : 0,
            maxWidth: 640,
            fontFamily: "var(--font-sans)",
            fontWeight: "var(--fw-light)",
            fontSize: "clamp(0.9rem, 1.4vw, 1.05rem)",
            lineHeight: "var(--lh-relaxed)",
            color: dark ? "var(--on-dark-muted)" : "var(--ink-500)",
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
