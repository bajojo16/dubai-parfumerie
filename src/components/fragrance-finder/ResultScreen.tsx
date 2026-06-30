"use client";

/**
 * ResultScreen — 3 cartes recommandées (badges) + opt-in WhatsApp/email + refaire.
 * Panier via addItem(). WhatsApp = lien externe (env), email = STUB local ~800ms.
 */
import { useState } from "react";
import Image from "next/image";
import { addItem } from "@/lib/cart";
import type { Recommendation, FinderLabels, ResultBadge } from "./types";
import { FF } from "./tokens";

const WHATSAPP_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_INVITE_URL || "https://wa.me/";

function badgeStyle(badge: ResultBadge): { bg: string; fg: string; border: string } {
  switch (badge) {
    case "match":
      return { bg: FF.goldDeep, fg: "#FFF", border: FF.goldDeep };
    case "coup_de_coeur":
      return { bg: FF.cream2, fg: FF.ink2, border: FF.border };
    case "a_decouvrir":
      return { bg: FF.ink, fg: FF.cream, border: FF.ink };
  }
}

function badgeLabel(badge: ResultBadge, labels: FinderLabels): string {
  switch (badge) {
    case "match":
      return labels.badgeMatch;
    case "coup_de_coeur":
      return labels.badgeCoupDeCoeur;
    case "a_decouvrir":
      return labels.badgeADecouvrir;
  }
}

function RecoCard({
  reco,
  reduced,
  labels,
  locale,
}: {
  reco: Recommendation;
  reduced: boolean;
  labels: FinderLabels;
  locale: string;
}) {
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { product } = reco;
  const b = badgeStyle(reco.badge);
  const productHref = locale === "fr" ? `/produit/${product.slug}` : `/${locale}/produit/${product.slug}`;

  return (
    <article
      style={{
        display: "flex",
        gap: 14,
        padding: 14,
        background: FF.white,
        border: `1px solid ${reco.badge === "match" ? FF.gold : FF.border}`,
        borderRadius: 16,
        boxShadow:
          reco.badge === "match"
            ? "0 10px 26px rgba(168,128,31,0.16)"
            : "0 2px 10px rgba(21,17,13,0.05)",
        alignItems: "stretch",
      }}
    >
      {/* Visuel */}
      <div
        style={{
          position: "relative",
          width: 92,
          flexShrink: 0,
          borderRadius: 12,
          overflow: "hidden",
          background: FF.cream2,
        }}
      >
        {!imgError ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="92px"
            style={{ objectFit: "cover" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at 35% 30%, ${FF.goldLight}, ${FF.goldDeep})`,
            }}
          />
        )}
      </div>

      {/* Infos */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
        <span
          style={{
            alignSelf: "flex-start",
            fontFamily: FF.sans,
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "4px 9px",
            borderRadius: 999,
            background: b.bg,
            color: b.fg,
            border: `1px solid ${b.border}`,
          }}
        >
          {badgeLabel(reco.badge, labels)}
        </span>

        <span
          style={{
            fontFamily: FF.sans,
            fontSize: "0.64rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: FF.goldDeep,
            marginTop: 4,
          }}
        >
          {product.brand}
        </span>
        <span style={{ fontFamily: FF.display, fontSize: "1.2rem", color: FF.ink, lineHeight: 1.1 }}>
          {product.name}
        </span>

        <p
          style={{
            fontFamily: FF.sans,
            fontSize: "0.78rem",
            color: FF.muted,
            lineHeight: 1.4,
            margin: "2px 0 0",
          }}
        >
          {reco.reason}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginTop: "auto",
            paddingTop: 8,
          }}
        >
          <span style={{ fontFamily: FF.display, fontSize: "1.15rem", fontWeight: 600, color: FF.ink }}>
            {product.price.toFixed(2)} €
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <a
              href={productHref}
              style={{
                fontFamily: FF.sans,
                fontSize: "0.74rem",
                color: FF.ink2,
                textDecoration: "underline",
                textUnderlineOffset: 3,
                alignSelf: "center",
              }}
            >
              {labels.viewProduct}
            </a>
            <button
              type="button"
              onClick={() => {
                addItem(
                  {
                    id: product.id,
                    name: product.name,
                    brand: product.brand,
                    price: product.price,
                    image: product.image,
                  },
                  1
                );
                setAdded(true);
                window.setTimeout(() => setAdded(false), 1800);
              }}
              style={{
                background: added ? FF.cream2 : FF.ink,
                color: added ? FF.ink2 : "#FFF",
                border: "none",
                borderRadius: 10,
                padding: "9px 13px",
                fontFamily: FF.sans,
                fontSize: "0.74rem",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: reduced ? "none" : "background .2s",
              }}
            >
              {added ? labels.added : labels.addToCart}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function OptIn({ labels, reduced }: { labels: FinderLabels; reduced: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <div
      style={{
        background: FF.cream,
        border: `1px solid ${FF.border}`,
        borderRadius: 16,
        padding: "18px 18px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "center" }}>
        <h3 style={{ fontFamily: FF.display, fontSize: "1.3rem", color: FF.ink, margin: 0 }}>
          {labels.optInTitle}
        </h3>
        <p style={{ fontFamily: FF.sans, fontSize: "0.84rem", color: FF.muted, margin: 0 }}>
          {labels.optInText}
        </p>
      </div>

      {status === "done" ? (
        <p
          style={{
            fontFamily: FF.sans,
            fontSize: "0.88rem",
            color: FF.goldDeep,
            textAlign: "center",
            margin: 0,
            fontWeight: 600,
          }}
        >
          {labels.emailSuccess}
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid || status === "loading") return;
            setStatus("loading");
            // STUB local — pas d'ESP réel.
            window.setTimeout(() => setStatus("done"), 800);
          }}
          style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={labels.emailPlaceholder}
            aria-label={labels.emailPlaceholder}
            style={{
              flex: "1 1 180px",
              minWidth: 0,
              boxSizing: "border-box",
              padding: "12px 14px",
              background: FF.white,
              border: `1.5px solid ${FF.border}`,
              borderRadius: 12,
              fontFamily: FF.sans,
              fontSize: "0.92rem",
              color: FF.ink,
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!valid || status === "loading"}
            style={{
              background: FF.ink,
              color: "#FFF",
              border: "none",
              borderRadius: 12,
              padding: "12px 18px",
              fontFamily: FF.sans,
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: valid ? "pointer" : "not-allowed",
              opacity: valid ? 1 : 0.45,
              transition: reduced ? "none" : "opacity .2s",
            }}
          >
            {status === "loading" ? "…" : labels.emailCta}
          </button>
        </form>
      )}

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 9,
          background: "#25D366",
          color: "#0B2E13",
          borderRadius: 12,
          padding: "12px 18px",
          fontFamily: FF.sans,
          fontSize: "0.88rem",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.7.7-2.8-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 2.2.9 2.6.7 3.1.7.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1z" />
        </svg>
        {labels.whatsappCta}
      </a>

      <p
        style={{
          fontFamily: FF.sans,
          fontSize: "0.68rem",
          color: FF.muted,
          textAlign: "center",
          lineHeight: 1.4,
          margin: 0,
        }}
      >
        {labels.rgpd}
      </p>
    </div>
  );
}

export function ResultScreen({
  recommendations,
  reduced,
  labels,
  locale,
  onRestart,
}: {
  recommendations: Recommendation[];
  reduced: boolean;
  labels: FinderLabels;
  locale: string;
  onRestart: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <header style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
        <span
          style={{
            fontFamily: FF.sans,
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: FF.goldDeep,
          }}
        >
          {labels.resultEyebrow}
        </span>
        <h2
          style={{
            fontFamily: FF.display,
            fontWeight: 500,
            fontSize: "clamp(1.8rem, 4.5vw, 2.2rem)",
            color: FF.ink,
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {labels.resultTitle}
        </h2>
        <p style={{ fontFamily: FF.sans, fontWeight: 300, fontSize: "0.9rem", color: FF.muted, margin: 0 }}>
          {labels.resultSubtitle}
        </p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {recommendations.map((reco) => (
          <RecoCard
            key={reco.product.slug}
            reco={reco}
            reduced={reduced}
            labels={labels}
            locale={locale}
          />
        ))}
      </div>

      <OptIn labels={labels} reduced={reduced} />

      <button
        type="button"
        onClick={onRestart}
        style={{
          alignSelf: "center",
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          background: "transparent",
          border: `1px solid ${FF.border}`,
          borderRadius: 12,
          padding: "11px 20px",
          color: FF.ink2,
          fontFamily: FF.sans,
          fontSize: "0.85rem",
          cursor: "pointer",
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        {labels.restart}
      </button>
    </div>
  );
}
