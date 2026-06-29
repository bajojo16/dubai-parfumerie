"use client";

import { useId, useState } from "react";
import Image from "next/image";

export type NewsletterLabels = {
  eyebrow: string;
  title: string;
  // {strong} marque la portion mise en gras dans la phrase
  sentence: string;
  sentenceStrong: string; // sous-chaîne de `sentence` à mettre en gras
  emailLabel: string;
  emailPlaceholder: string;
  submit: string;
  sending: string;
  micro: string;
  rules: string; // libellé du lien "Règlement du jeu"
  rgpd: string; // mention RGPD
  privacy: string; // libellé du lien politique de confidentialité
  invalidEmail: string;
  errorRetry: string;
  success: string;
};

const DEFAULT_LABELS: NewsletterLabels = {
  eyebrow: "Newsletter",
  title: "−10% sur votre première commande",
  sentence:
    "Inscrivez-vous et tentez de gagner un coffret chaque mois. Ventes privées et nouveautés en avant-première.",
  sentenceStrong: "gagner un coffret chaque mois",
  emailLabel: "Votre adresse email",
  emailPlaceholder: "vous@email.com",
  submit: "Je m'inscris",
  sending: "Envoi…",
  micro: "Gratuit · Désabonnement en un clic.",
  rules: "Règlement du jeu",
  rgpd: "En vous inscrivant, vous acceptez de recevoir nos emails. Voir notre",
  privacy: "politique de confidentialité",
  invalidEmail: "Merci de saisir une adresse email valide.",
  errorRetry: "Un souci est survenu. Merci de réessayer.",
  success: "Bienvenue ! Votre code -10% arrive par email.",
};

// Validation simple de format email
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "sending" | "success" | "error";

export function NewsletterSection({
  locale = "fr",
  labels,
  bgImage = "/assets/popup-oud-roses.jpg",
}: {
  locale?: string;
  labels?: Partial<NewsletterLabels>;
  bgImage?: string;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const isRTL = locale === "ar";
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const sending = status === "sending";

  // Découpe la phrase autour de la portion à mettre en gras
  const idx = L.sentence.indexOf(L.sentenceStrong);
  const before = idx >= 0 ? L.sentence.slice(0, idx) : L.sentence;
  const strong = idx >= 0 ? L.sentenceStrong : "";
  const after = idx >= 0 ? L.sentence.slice(idx + L.sentenceStrong.length) : "";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;

    if (!EMAIL_RE.test(email.trim())) {
      setStatus("error");
      setMessage(L.invalidEmail);
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      // STUB — aucune API réelle. Simule un appel réseau ~800ms.
      // À remplacer par l'intégration emailing réelle (Brevo/Mailchimp/Klaviyo…).
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus("success");
      setMessage(L.success);
      setEmail("");
    } catch {
      setStatus("error");
      setMessage(L.errorRetry);
    }
  }

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      aria-labelledby={`${inputId}-title`}
      style={{
        position: "relative",
        minHeight: 420,
        borderRadius: 20,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        isolation: "isolate",
      }}
    >
      {/* Image de fond */}
      <Image
        src={bgImage}
        alt=""
        aria-hidden
        fill
        sizes="(max-width: 768px) 100vw, 960px"
        style={{ objectFit: "cover", zIndex: -2 }}
      />

      {/* Voile de lisibilité — clair, plus dense au centre (le visuel reste visible) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
          background:
            "radial-gradient(ellipse at center, rgba(246,240,228,0.55) 0%, rgba(246,240,228,0.42) 45%, rgba(246,240,228,0) 100%)",
        }}
      />

      {/* Contenu superposé centré */}
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          padding: "48px 24px",
          textAlign: "center",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#A8801F",
            margin: "0 0 14px",
          }}
        >
          {L.eyebrow}
        </p>

        <h2
          id={`${inputId}-title`}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 36,
            lineHeight: 1.15,
            color: "#2C2620",
            margin: "0 0 14px",
            fontWeight: 600,
          }}
        >
          {L.title}
        </h2>

        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            lineHeight: 1.6,
            color: "#6A6051",
            margin: "0 0 26px",
          }}
        >
          {before}
          {strong && <strong style={{ color: "#2C2620", fontWeight: 600 }}>{strong}</strong>}
          {after}
        </p>

        <form
          onSubmit={onSubmit}
          noValidate
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          <label
            htmlFor={inputId}
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: "hidden",
              clip: "rect(0,0,0,0)",
              whiteSpace: "nowrap",
              border: 0,
            }}
          >
            {L.emailLabel}
          </label>

          {/* Champ email — pilule blanche + icône mail */}
          <div
            style={{
              position: "relative",
              flex: "1 1 240px",
              minWidth: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                insetInlineStart: 16,
                display: "flex",
                pointerEvents: "none",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A8915F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </span>
            <input
              id={inputId}
              className="np-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") {
                  setStatus("idle");
                  setMessage("");
                }
              }}
              placeholder={L.emailPlaceholder}
              aria-invalid={status === "error"}
              disabled={sending}
              style={{
                width: "100%",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                color: "#2C2620",
                background: "#fff",
                border: "1px solid #E0CFA8",
                borderRadius: 999,
                padding: "13px 18px 13px 44px",
                paddingInlineStart: 44,
                paddingInlineEnd: 18,
                outline: "none",
              }}
            />
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={sending}
            className="np-submit"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: ".02em",
              color: "#fff",
              background: "#C4A24F",
              border: "none",
              borderRadius: 999,
              padding: "13px 24px",
              cursor: sending ? "default" : "pointer",
              whiteSpace: "nowrap",
              opacity: sending ? 0.8 : 1,
              flex: "0 0 auto",
            }}
          >
            {sending ? L.sending : (
              <>
                {L.submit} <span aria-hidden style={{ display: "inline-block", transform: isRTL ? "scaleX(-1)" : "none" }}>→</span>
              </>
            )}
          </button>
        </form>

        {/* Zone de message (succès / erreur) */}
        <div
          aria-live="polite"
          role="status"
          style={{
            minHeight: 20,
            marginTop: 14,
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            color: status === "error" ? "#9A4A33" : "#3E7A4E",
          }}
        >
          {message}
        </div>

        {/* Micro-mention */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            color: "#9A8E78",
            margin: "8px 0 0",
            lineHeight: 1.6,
          }}
        >
          {L.micro}{" "}
          <a
            href="/jeu-concours"
            style={{ color: "#9A8E78", textDecoration: "underline", textUnderlineOffset: 2 }}
          >
            {L.rules}
          </a>
        </p>

        {/* Mention RGPD discrète */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 10,
            color: "#A89C86",
            margin: "6px 0 0",
            lineHeight: 1.5,
          }}
        >
          {L.rgpd}{" "}
          <a
            href="/confidentialite"
            style={{ color: "#A89C86", textDecoration: "underline", textUnderlineOffset: 2 }}
          >
            {L.privacy}
          </a>
          .
        </p>
      </div>

      <style>{`
        .np-submit { transition: background .2s ease, transform .15s ease; }
        .np-submit:not(:disabled):hover {
          background: linear-gradient(135deg, #D4B264, #B98F3A);
        }
        .np-submit:focus-visible,
        .np-email:focus-visible {
          outline: 2px solid #A8801F;
          outline-offset: 2px;
        }
        .np-email:focus { border-color: #C4A24F; }
        @media (prefers-reduced-motion: reduce) {
          .np-submit { transition: none; }
        }
      `}</style>
    </section>
  );
}
