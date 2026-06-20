"use client";
import React, { useState, useEffect, useRef } from "react";

const TOP_MESSAGES = [
  "Livraison offerte dès 60 €",
  "Paiement 4× sans frais",
  "10 ans d'expérience · 12 000+ commandes",
  "Cadeau surprise dans chaque commande",
  "Retours sous 14 jours",
];

const LANGUAGES = ["FR", "EN", "ES", "DE", "IT", "RU", "AR"];
const CURRENCIES = ["EUR", "AED", "SAR", "QAR", "USD", "GBP", "MAD"];

const NAV_LINKS = [
  { label: "Parfums Femme", href: "/parfums-femme" },
  { label: "Parfums Homme", href: "/parfums-homme" },
  { label: "Huile de Parfum", href: "/huile-de-parfum" },
  { label: "Marques", href: "/marques" },
  { label: "Promo Flash", href: "/promo-flash", highlight: true },
  { label: "Blog", href: "/blog" },
];

function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.84a8.16 8.16 0 004.77 1.53V6.91a4.85 4.85 0 01-1-.22z" />
    </svg>
  );
}

function IconYouTube() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconMic() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function IconApple() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
  cartCount: number;
}

function CartSidebar({ open, onClose, cartCount }: CartSidebarProps) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(21,16,11,.45)",
          zIndex: 1000,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .25s",
        }}
      />
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(400px, 92vw)",
          background: "var(--surface-page)",
          zIndex: 1001,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform .3s cubic-bezier(.4,0,.2,1)",
          boxShadow: "-4px 0 32px rgba(0,0,0,.15)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid rgba(0,0,0,.08)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "22px",
              fontWeight: 600,
              color: "var(--ink-900)",
            }}
          >
            Mon Panier ({cartCount})
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--ink-500)",
              padding: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            <IconClose />
          </button>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--ink-500)",
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
          }}
        >
          Votre panier est vide pour l'instant.
        </div>
        <div
          style={{
            padding: "20px 24px",
            borderTop: "1px solid rgba(0,0,0,.08)",
          }}
        >
          <button
            style={{
              width: "100%",
              background: "var(--gold-500)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--r-md)",
              padding: "14px",
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Passer commande
          </button>
        </div>
      </aside>
    </>
  );
}

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

function AuthModal({ open, onClose }: AuthModalProps) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(21,16,11,.55)",
          zIndex: 1100,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .25s",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: open ? "translate(-50%,-50%) scale(1)" : "translate(-50%,-50%) scale(.96)",
          zIndex: 1101,
          width: "min(440px,92vw)",
          background: "var(--surface-white)",
          borderRadius: "var(--r-lg)",
          boxShadow: "0 24px 64px rgba(0,0,0,.2)",
          padding: "36px 32px",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .25s, transform .25s",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "28px",
                fontWeight: 700,
                color: "var(--ink-900)",
                margin: 0,
              }}
            >
              Bienvenue
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                color: "var(--ink-500)",
                margin: "6px 0 0",
              }}
            >
              Connectez-vous ou créez un compte
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-500)", padding: 4 }}
          >
            <IconClose />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { icon: <IconGoogle />, label: "Continuer avec Google", bg: "#fff", border: "#dadce0", color: "#3c4043" },
            { icon: <IconFacebook />, label: "Continuer avec Facebook", bg: "#1877F2", border: "#1877F2", color: "#fff" },
            { icon: <IconApple />, label: "Continuer avec Apple", bg: "#000", border: "#000", color: "#fff" },
          ].map(({ icon, label, bg, border, color }) => (
            <button
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                background: bg,
                border: `1.5px solid ${border}`,
                borderRadius: "var(--r-md)",
                padding: "13px 16px",
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                fontWeight: 600,
                color,
                cursor: "pointer",
                transition: "opacity .15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            color: "var(--ink-500)",
            textAlign: "center",
            marginTop: 20,
            lineHeight: 1.6,
          }}
        >
          En continuant, vous acceptez nos{" "}
          <a href="/cgv" style={{ color: "var(--gold-500)" }}>CGV</a> et{" "}
          <a href="/confidentialite" style={{ color: "var(--gold-500)" }}>Politique de confidentialité</a>.
        </p>
      </div>
    </>
  );
}

export function Header() {
  const [activeLang, setActiveLang] = useState("FR");
  const [currency, setCurrency] = useState("EUR");
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [cartCount] = useState(2);
  const [wishCount] = useState(1);
  const [topMsgIndex, setTopMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTopMsgIndex((i) => (i + 1) % TOP_MESSAGES.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* Top bar */}
      <div
        style={{
          background: "var(--espresso-900)",
          height: 38,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 0,
          position: "relative",
          zIndex: 100,
        }}
      >
        {/* Social icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--on-dark-muted)", flex: "0 0 auto" }}>
          {[
            { Icon: IconX, href: "https://x.com" },
            { Icon: IconInstagram, href: "https://instagram.com" },
            { Icon: IconTikTok, href: "https://tiktok.com" },
            { Icon: IconYouTube, href: "https://youtube.com" },
          ].map(({ Icon, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--on-dark-muted)",
                display: "flex",
                alignItems: "center",
                transition: "color .15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--gold-400)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--on-dark-muted)")}
            >
              <Icon />
            </a>
          ))}
        </div>

        {/* Rotating message */}
        <div
          style={{
            flex: 1,
            textAlign: "center",
            fontFamily: "var(--font-sans)",
            fontSize: "11.5px",
            fontWeight: 500,
            letterSpacing: ".05em",
            color: "var(--on-dark)",
            overflow: "hidden",
            height: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            key={topMsgIndex}
            style={{
              animation: "fadeSlideIn .35s ease",
            }}
          >
            {TOP_MESSAGES[topMsgIndex]}
          </span>
        </div>

        {/* Language & currency */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}>
          <select
            value={activeLang}
            onChange={(e) => setActiveLang(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--on-dark-muted)",
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: ".08em",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l} style={{ background: "var(--espresso-900)", color: "#fff" }}>
                {l}
              </option>
            ))}
          </select>
          <span style={{ color: "var(--on-dark-muted)", fontSize: 11 }}>|</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--on-dark-muted)",
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: ".08em",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c} style={{ background: "var(--espresso-900)", color: "#fff" }}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 99,
          background: "rgba(253,251,246,.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(200,144,30,.12)",
        }}
      >
        <div
          style={{
            height: 74,
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            gap: 20,
            maxWidth: 1400,
            margin: "0 auto",
            width: "100%",
          }}
        >
          {/* Logo */}
          <a href="/" style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
            <img src="/assets/logo.png" height={28} alt="Dubaï Parfumerie" />
          </a>

          {/* Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: "0 0 auto" }}>
            {NAV_LINKS.map(({ label, href, highlight }) => (
              <a
                key={href}
                href={href}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  fontWeight: highlight ? 700 : 500,
                  color: highlight ? "var(--gold-500)" : "var(--ink-900)",
                  textDecoration: "none",
                  padding: "6px 10px",
                  borderRadius: "var(--r-sm)",
                  whiteSpace: "nowrap",
                  transition: "color .15s, background .15s",
                  letterSpacing: ".02em",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(200,144,30,.08)";
                  if (!highlight) (e.currentTarget as HTMLElement).style.color = "var(--gold-500)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  if (!highlight) (e.currentTarget as HTMLElement).style.color = "var(--ink-900)";
                }}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Search */}
          <div
            style={{
              flex: 1,
              maxWidth: 380,
              display: "flex",
              alignItems: "center",
              background: "var(--surface-cream)",
              border: "1px solid rgba(200,144,30,.2)",
              borderRadius: "var(--r-md)",
              padding: "0 12px",
              gap: 8,
              height: 40,
            }}
          >
            <span style={{ color: "var(--ink-500)", display: "flex", alignItems: "center" }}>
              <IconSearch />
            </span>
            <input
              type="text"
              placeholder="Rechercher…"
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                color: "var(--ink-900)",
              }}
            />
            <button
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-500)", display: "flex", alignItems: "center", padding: 2 }}
              title="Recherche vocale"
            >
              <IconMic />
            </button>
            <button
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-500)", display: "flex", alignItems: "center", padding: 2 }}
              title="Recherche visuelle"
            >
              <IconCamera />
            </button>
          </div>

          {/* Right icons */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
            <button
              onClick={() => setAuthOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--ink-900)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "6px 8px",
                borderRadius: "var(--r-sm)",
                transition: "background .15s",
              }}
              title="Mon compte"
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(200,144,30,.08)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              <IconUser />
              <span style={{ fontSize: 9, fontFamily: "var(--font-sans)", fontWeight: 600, letterSpacing: ".06em", color: "var(--ink-500)" }}>COMPTE</span>
            </button>

            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--ink-900)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "6px 8px",
                borderRadius: "var(--r-sm)",
                position: "relative",
                transition: "background .15s",
              }}
              title="Mes favoris"
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(200,144,30,.08)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              <span style={{ position: "relative" }}>
                <IconHeart />
                {wishCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -6,
                      background: "var(--gold-500)",
                      color: "#fff",
                      fontSize: 9,
                      fontWeight: 700,
                      borderRadius: "50%",
                      width: 15,
                      height: 15,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {wishCount}
                  </span>
                )}
              </span>
              <span style={{ fontSize: 9, fontFamily: "var(--font-sans)", fontWeight: 600, letterSpacing: ".06em", color: "var(--ink-500)" }}>FAVORIS</span>
            </button>

            <button
              onClick={() => setCartOpen(true)}
              style={{
                background: "var(--gold-500)",
                border: "none",
                cursor: "pointer",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "7px 12px",
                borderRadius: "var(--r-md)",
                position: "relative",
                transition: "background .15s",
              }}
              title="Mon panier"
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--gold-700)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--gold-500)")}
            >
              <span style={{ position: "relative" }}>
                <IconBag />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -8,
                      background: "var(--espresso-900)",
                      color: "#fff",
                      fontSize: 9,
                      fontWeight: 700,
                      borderRadius: "50%",
                      width: 15,
                      height: 15,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </span>
              <span style={{ fontSize: 9, fontFamily: "var(--font-sans)", fontWeight: 700, letterSpacing: ".06em" }}>PANIER</span>
            </button>
          </div>
        </div>

        {/* Free shipping bar */}
        <div
          style={{
            background: "var(--espresso-800)",
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: "0 24px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11.5px",
              fontWeight: 500,
              color: "var(--on-dark)",
              letterSpacing: ".04em",
            }}
          >
            Livraison offerte dès 60 €
          </span>
          <div
            style={{
              width: 180,
              height: 4,
              background: "rgba(255,255,255,.12)",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "30%",
                height: "100%",
                background: "linear-gradient(90deg, var(--gold-500), var(--gold-400))",
                borderRadius: 99,
                transition: "width 1s ease",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              color: "var(--on-dark-muted)",
            }}
          >
            Il vous manque <strong style={{ color: "var(--gold-400)" }}>42 €</strong> pour en bénéficier
          </span>
        </div>
      </header>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} cartCount={cartCount} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
