"use client";
import React, { useState } from "react";

const LANGUAGES = ["FR", "EN", "ES", "DE", "IT", "RU", "AR"];
const CURRENCIES = ["EUR", "AED", "SAR", "QAR", "USD", "GBP", "MAD"];

const COLUMNS = [
  {
    title: "Boutique",
    links: [
      { label: "Parfums Femme", href: "/parfums-femme" },
      { label: "Parfums Homme", href: "/parfums-homme" },
      { label: "Huile de Parfum", href: "/huile-de-parfum" },
      { label: "Marques", href: "/marques" },
      { label: "Promo Flash", href: "/promo-flash" },
      { label: "Nouveautés", href: "/nouveautes" },
    ],
  },
  {
    title: "Découvrir",
    links: [
      { label: "Notre histoire", href: "/notre-histoire" },
      { label: "Blog / Journal", href: "/blog" },
      { label: "Familles olfactives", href: "/familles-olfactives" },
      { label: "Roue des senteurs", href: "/roue-des-senteurs" },
      { label: "Quiz signature", href: "/quiz" },
    ],
  },
  {
    title: "Aide & Infos",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Livraison & Retours", href: "/livraison-retours" },
      { label: "Suivi de commande", href: "/suivi" },
      { label: "Contact WhatsApp", href: "https://wa.me/33600000000" },
      { label: "B2B / Grossiste", href: "/b2b" },
    ],
  },
  {
    title: "Mon Espace",
    links: [
      { label: "Mon compte", href: "/compte" },
      { label: "Mes commandes", href: "/commandes" },
      { label: "Mes favoris", href: "/favoris" },
      { label: 'Programme fidélité "Le Cercle"', href: "/fidelite" },
      { label: "Parrainage", href: "/parrainage" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "CGV", href: "/cgv" },
      { label: "Politique de confidentialité", href: "/confidentialite" },
      { label: "Cookies", href: "/cookies" },
      { label: "Plan du site", href: "/sitemap" },
    ],
  },
];

const PAYMENT_METHODS = ["Visa", "Mastercard", "Amex", "Apple Pay", "PayPal", "4× sans frais"];

function IconX() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.84a8.16 8.16 0 004.77 1.53V6.91a4.85 4.85 0 01-1-.22z" />
    </svg>
  );
}

function IconYouTube() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function Footer() {
  const [activeLang, setActiveLang] = useState("FR");
  const [currency, setCurrency] = useState("EUR");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontSize: "16px",
    fontWeight: 700,
    color: "var(--on-dark-strong)",
    marginBottom: 16,
    letterSpacing: ".02em",
  };

  const linkStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: "13px",
    color: "var(--on-dark-muted)",
    textDecoration: "none",
    lineHeight: 1,
    display: "block",
    transition: "color .15s",
  };

  return (
    <footer
      style={{
        background: "var(--espresso-900)",
        color: "var(--on-dark)",
      }}
    >
      {/* Top row: logo + newsletter */}
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "52px 24px 40px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 40,
          flexWrap: "wrap",
          borderBottom: "1px solid rgba(255,255,255,.07)",
        }}
      >
        <div style={{ maxWidth: 280 }}>
          <img src="/assets/logo.png" height={32} alt="Dubaï Parfumerie" style={{ marginBottom: 14, filter: "brightness(0) invert(1)" }} />
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              color: "var(--on-dark-muted)",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Parfumerie orientale authentique depuis 2015
          </p>
        </div>

        <div style={{ maxWidth: 380, flex: "1 1 280px" }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--on-dark-strong)",
              margin: "0 0 6px",
            }}
          >
            Rejoignez notre cercle
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "12.5px",
              color: "var(--on-dark-muted)",
              margin: "0 0 14px",
            }}
          >
            Offres exclusives, nouveautés et conseils olfactifs en avant-première.
          </p>
          {subscribed ? (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                color: "var(--gold-400)",
                fontWeight: 600,
              }}
            >
              Merci ! Vous êtes abonné(e).
            </p>
          ) : (
            <form
              onSubmit={handleSubscribe}
              style={{ display: "flex", gap: 8 }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,.07)",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: "var(--r-md)",
                  padding: "11px 14px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  color: "var(--on-dark-strong)",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  background: "var(--gold-500)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--r-md)",
                  padding: "11px 20px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background .15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--gold-700)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--gold-500)")}
              >
                S'inscrire
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 5 columns */}
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "44px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "32px 24px",
        }}
      >
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 style={sectionTitleStyle}>{col.title}</h3>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {col.links.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    style={linkStyle}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--gold-400)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--on-dark-muted)")}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,.07)",
          padding: "22px 24px",
          maxWidth: 1400,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        {/* Copyright */}
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "12px",
            color: "var(--on-dark-muted)",
          }}
        >
          © 2026 Dubaï Parfumerie · Tous droits réservés
        </span>

        {/* Payment logos */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {PAYMENT_METHODS.map((method, i) => (
            <React.Fragment key={method}>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--on-dark-muted)",
                  background: "rgba(255,255,255,.06)",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: "var(--r-xs)",
                  padding: "3px 8px",
                  letterSpacing: ".03em",
                }}
              >
                {method}
              </span>
              {i < PAYMENT_METHODS.length - 1 && (
                <span style={{ color: "rgba(255,255,255,.15)", fontSize: 11 }}>·</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Lang + currency + socials */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <select
            value={activeLang}
            onChange={(e) => setActiveLang(e.target.value)}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: "var(--r-sm)",
              color: "var(--on-dark-muted)",
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: ".08em",
              cursor: "pointer",
              outline: "none",
              padding: "4px 8px",
            }}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l} style={{ background: "var(--espresso-900)", color: "#fff" }}>
                {l}
              </option>
            ))}
          </select>

          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: "var(--r-sm)",
              color: "var(--on-dark-muted)",
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: ".08em",
              cursor: "pointer",
              outline: "none",
              padding: "4px 8px",
            }}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c} style={{ background: "var(--espresso-900)", color: "#fff" }}>
                {c}
              </option>
            ))}
          </select>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 4 }}>
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
        </div>
      </div>
    </footer>
  );
}
