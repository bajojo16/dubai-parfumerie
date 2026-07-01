"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// ─── WelcomeModal ─────────────────────────────────────────────────────────────
// Pop-up de bienvenue extrait de la home. Comportement prod inchangé :
// s'affiche une seule fois via localStorage (clé `dp_welcome_shown_v3` par défaut),
// après un court délai. Props FR par défaut, pilotables pour la preview client.
// `forceOpen` : ignore le localStorage et affiche toujours le pop-up (mode preview).

export interface WelcomeModalProps {
  /** Force l'affichage (preview) : ignore le localStorage, toujours visible. */
  forceOpen?: boolean;
  /** Clé localStorage utilisée pour ne l'afficher qu'une fois. */
  storageKey?: string;
  /** Délai avant l'apparition automatique (ms), en mode non forcé. */
  delayMs?: number;

  // ── Panneau gauche (visuel) ──
  imageSrc?: string;
  imageAlt?: string;
  leftTitle?: string;
  leftText?: string;
  leftPrice?: string;
  leftCtaLabel?: string;
  /** Ancre/URL du CTA gauche (ferme le pop-up au clic). */
  leftCtaHref?: string;
  leftQuote?: React.ReactNode;

  // ── Panneau droit (formulaire) ──
  eyebrow?: string;
  title?: React.ReactNode;
  description?: string;
  emailPlaceholder?: string;
  whatsappPlaceholder?: string;
  languageOptions?: string[];
  currencyOptions?: string[];
  submitLabel?: string;
  alreadyMemberLabel?: string;
  loginLabel?: string;
  declineLabel?: string;
}

const DEFAULT_LANGUAGES = [
  "🇫🇷 Français",
  "🇬🇧 English",
  "🇪🇸 Español",
  "🇩🇪 Deutsch",
  "🇮🇹 Italiano",
  "🇷🇺 Русский",
  "🇸🇦 العربية",
];
const DEFAULT_CURRENCIES = ["EUR", "AED", "SAR", "USD", "GBP", "MAD"];

export function WelcomeModal({
  forceOpen = false,
  storageKey = "dp_welcome_shown_v3",
  delayMs = 1800,

  imageSrc = "/assets/popup-oud-roses.jpg",
  imageAlt = "Oud & Roses — parfums orientaux",
  leftTitle = "Nos Coffrets Découverte",
  leftText = "Explorez la richesse de la parfumerie orientale avec nos coffrets échantillons. Le meilleur moyen de trouver votre signature olfactive.",
  leftPrice = "À partir de 9€",
  leftCtaLabel = "Découvrir les coffrets",
  leftCtaHref = "#coffrets",
  leftQuote = (
    <>«&nbsp;L&apos;Orient se respire,<br />il ne se raconte pas.&nbsp;»</>
  ),

  eyebrow = "Offre de bienvenue",
  title = <>-10% &amp; un échantillon offert</>,
  description = "Rejoignez Le Cercle et recevez votre code de bienvenue, plus un échantillon surprise glissé dans votre première commande.",
  emailPlaceholder = "Votre adresse email",
  whatsappPlaceholder = "Votre numéro WhatsApp",
  languageOptions = DEFAULT_LANGUAGES,
  currencyOptions = DEFAULT_CURRENCIES,
  submitLabel = "J'EN PROFITE",
  alreadyMemberLabel = "Déjà membre ?",
  loginLabel = "Se connecter",
  declineLabel = "Non merci",
}: WelcomeModalProps) {
  const [shown, setShown] = useState(forceOpen);
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [lang, setLang] = useState(languageOptions[0] ?? "");
  const [cur, setCur] = useState(currencyOptions[0] ?? "");

  useEffect(() => {
    if (forceOpen) return; // preview : déjà affiché, on ignore le localStorage
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      const t = setTimeout(() => setShown(true), delayMs);
      return () => clearTimeout(t);
    }
  }, [forceOpen, storageKey, delayMs]);

  const close = () => {
    if (!forceOpen) localStorage.setItem(storageKey, "1");
    setShown(false);
  };

  if (!shown) return null;

  return (
    <div
      suppressHydrationWarning
      onClick={close}
      style={{
        position: "fixed", inset: 0, zIndex: 400,
        background: "rgba(15,10,6,0.72)", backdropFilter: "blur(5px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        className="dp-welcome-inner"
        onClick={e => e.stopPropagation()}
        style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          maxWidth: 820, width: "100%", maxHeight: "90vh",
          borderRadius: "var(--r-lg)", overflow: "hidden auto",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
        }}
      >
        {/* Left panel — image + coffrets */}
        <div className="dp-welcome-left" style={{
          position: "relative", background: "var(--espresso-900)",
          padding: "44px 36px 40px",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
          minHeight: 460,
        }}>
          <Image src={imageSrc} alt={imageAlt} fill sizes="400px" style={{ objectFit: "cover", opacity: 0.85 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(21,16,11,.15) 0%, rgba(21,16,11,.45) 55%, rgba(21,16,11,.88) 100%)" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 2.5vw, 2rem)", color: "#fff", margin: "0 0 12px", lineHeight: 1.2 }}>
              {leftTitle}
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.84rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.65, marginBottom: 22 }}>
              {leftText}
            </p>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--gold-400)", marginBottom: 20 }}>
              {leftPrice}
            </div>
            <a href={leftCtaHref} onClick={close} style={{
              display: "inline-block", background: "var(--gold-500)", color: "#fff",
              textDecoration: "none", padding: "11px 22px", borderRadius: "var(--r-sm)",
              fontFamily: "var(--font-sans)", fontSize: "0.76rem", fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
            }}>{leftCtaLabel}</a>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: "rgba(255,255,255,0.5)", marginTop: 24, fontStyle: "italic" }}>
              {leftQuote}
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div style={{ background: "var(--surface-white)", padding: "44px 36px 40px", position: "relative" }}>
          {/* Close */}
          <button onClick={close} style={{
            position: "absolute", top: 16, right: 16,
            background: "none", border: "none", cursor: "pointer",
            color: "var(--ink-400)", fontSize: "1.1rem", lineHeight: 1, padding: 4,
          }}>×</button>

          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold-500)", marginBottom: 14 }}>{eyebrow}</div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 2.5vw, 2rem)", color: "var(--ink-900)", margin: "0 0 14px", lineHeight: 1.15 }}>
            {title}
          </h3>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "var(--ink-500)", lineHeight: 1.65, marginBottom: 24 }}>
            {description}
          </p>

          <input
            type="email"
            placeholder={emailPlaceholder}
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: "100%", padding: "13px 14px", marginBottom: 10,
              border: "1px solid #ddd", borderRadius: "var(--r-sm)",
              fontFamily: "var(--font-sans)", fontSize: "0.88rem",
              color: "var(--ink-900)", background: "#fff", outline: "none",
              boxSizing: "border-box",
            }}
          />

          <div style={{ position: "relative", marginBottom: 10 }}>
            <span aria-hidden style={{
              position: "absolute", insetInlineStart: 12, top: "50%", transform: "translateY(-50%)",
              display: "inline-flex", alignItems: "center", gap: 6,
              color: "#25D366", pointerEvents: "none",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12.04 2a9.9 9.9 0 0 0-8.46 15.02L2 22l5.1-1.34A9.9 9.9 0 1 0 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.94 1.35-.5.05-1.13.07-1.83-.11a10.6 10.6 0 0 1-1.66-.62 8.3 8.3 0 0 1-3.18-2.8c-.66-.86-1.08-1.87-1.2-2.2-.13-.32-.01-.63.15-.86.14-.2.32-.33.48-.5.16-.16.21-.27.32-.46.1-.18.05-.35-.03-.5-.08-.14-.72-1.74-.99-2.38-.26-.62-.52-.54-.72-.55h-.6c-.2 0-.52.07-.8.36-.27.29-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.07-.12-.27-.2-.56-.34Z" />
              </svg>
            </span>
            <input
              type="tel"
              placeholder={whatsappPlaceholder}
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              style={{
                width: "100%", padding: "13px 14px 13px 40px",
                border: "1px solid #ddd", borderRadius: "var(--r-sm)",
                fontFamily: "var(--font-sans)", fontSize: "0.88rem",
                color: "var(--ink-900)", background: "#fff", outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <select value={lang} onChange={e => setLang(e.target.value)} style={{
              padding: "11px 12px", border: "1px solid #ddd", borderRadius: "var(--r-sm)",
              fontFamily: "var(--font-sans)", fontSize: "0.84rem", color: "var(--ink-900)",
              background: "#fff", outline: "none", cursor: "pointer",
            }}>
              {languageOptions.map(l => <option key={l}>{l}</option>)}
            </select>
            <select value={cur} onChange={e => setCur(e.target.value)} style={{
              padding: "11px 12px", border: "1px solid #ddd", borderRadius: "var(--r-sm)",
              fontFamily: "var(--font-sans)", fontSize: "0.84rem", color: "var(--ink-900)",
              background: "#fff", outline: "none", cursor: "pointer",
            }}>
              {currencyOptions.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <button onClick={close} style={{
            width: "100%", background: "var(--gold-500)", color: "#fff", border: "none",
            borderRadius: "var(--r-sm)", padding: "14px", cursor: "pointer",
            fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 700,
            letterSpacing: "0.04em", marginBottom: 16,
          }}>{submitLabel}</button>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--ink-400)" }}>
              {alreadyMemberLabel}&nbsp;
              <button onClick={close} style={{ background: "none", border: "none", color: "var(--gold-600)", textDecoration: "underline", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}>
                {loginLabel}
              </button>
            </span>
            <button onClick={close} style={{ background: "none", border: "none", color: "var(--ink-300)", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "0.78rem" }}>
              {declineLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeModal;
