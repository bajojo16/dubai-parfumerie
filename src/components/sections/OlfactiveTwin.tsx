"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { OlfactiveMatch } from "@/data/olfactive-twins";

const C = {
  stage: "#FAF6EE",
  border: "#E6DCC8",
  pillBorder: "#E6DCC8",
  pillText: "#5A4A2E",
  pillHoverBorder: "#C9A24A",
  pillSelBg: "#3A2C14",
  pillSelText: "#F3E6CF",
  gold: "#C9A24A",
  goldDark: "#8A6A1E",
  goldCta: "#C4A24F",
  ink: "#2C2620",
  muted: "#6A655D",
  mutedPrice: "#B0AEA6",
  goldLabel: "#A8801F",
  legal: "#9A8A6A",
  searchBorder: "#E0CFA8",
  searchIcon: "#A8915F",
  tagBg: "rgba(201,162,74,.16)",
  tagBorder: "#E0CFA8",
};

export function OlfactiveTwin({
  matches,
  locale = "fr",
  variant = "full",
}: {
  matches: OlfactiveMatch[];
  locale?: string;
  variant?: "full" | "compact";
}) {
  const t = useTranslations("olfactiveTwin");
  const isRTL = locale === "ar";
  const compact = variant === "compact";
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string>(matches[0]?.key ?? "");

  const filtered = useMemo(
    () => matches.filter((m) => m.targetName.toLowerCase().includes(query.trim().toLowerCase())),
    [matches, query]
  );

  const selected = matches.find((m) => m.key === selectedKey) ?? null;

  const fmt = (n: number) => {
    try {
      return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
    } catch {
      return `${Math.round(n)} €`;
    }
  };

  // --- Blocs réutilisables (agencés différemment selon le variant) ---

  // Intro simple (variant full uniquement)
  const introEl = (
    <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: C.muted, margin: "0 0 16px" }}>
      {t("intro")}
    </p>
  );

  // Accroche « ? » dorée + question incitative (variant compact uniquement)
  const hookEl = (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <span
        className="otwin-q"
        aria-hidden
        style={{
          flexShrink: 0,
          width: 42,
          height: 42,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          background: C.tagBg,
          border: `1.5px solid ${C.gold}`,
          color: C.goldLabel,
          fontFamily: "var(--font-display)",
          fontSize: 26,
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        ?
      </span>
      <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 13.5, color: C.ink, lineHeight: 1.4 }}>
        {t("intro")}
      </p>
    </div>
  );

  // Recherche
  const searchEl = (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: compact ? 8 : 10,
          background: "#fff",
          border: `1px solid ${C.searchBorder}`,
          borderRadius: 999,
          padding: compact ? "8px 14px" : "12px 18px",
          marginBottom: compact ? 10 : 16,
        }}
      >
        <svg width={compact ? 15 : 18} height={compact ? 15 : 18} viewBox="0 0 24 24" fill="none" stroke={C.searchIcon} strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search_placeholder")}
          aria-label={t("search_placeholder")}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "var(--font-sans)",
            fontSize: compact ? 13 : 14,
            color: C.ink,
          }}
        />
      </div>
  );

  // Pills marques cibles
  const pillsEl = (
      <div
        style={
          compact
            ? { display: "flex", flexWrap: "nowrap", gap: 8, marginBottom: 12, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "thin", WebkitOverflowScrolling: "touch" }
            : { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }
        }
      >
        {filtered.length === 0 && (
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: C.muted }}>{t("no_result")}</span>
        )}
        {filtered.map((m) => {
          const active = m.key === selectedKey;
          return (
            <button
              key={m.key}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedKey(m.key)}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: compact ? 12.5 : 14,
                cursor: "pointer",
                padding: compact ? "6px 12px" : "10px 16px",
                whiteSpace: compact ? "nowrap" : undefined,
                flexShrink: compact ? 0 : undefined,
                borderRadius: 999,
                border: `1px solid ${active ? C.pillSelBg : C.pillBorder}`,
                background: active ? C.pillSelBg : "#fff",
                color: active ? C.pillSelText : C.pillText,
                transition: "border-color .2s, background .2s",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = C.pillHoverBorder;
                  el.style.background = "#FBF7EE";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = C.pillBorder;
                  el.style.background = "#fff";
                }
              }}
            >
              {m.targetName}
            </button>
          );
        })}
      </div>
  );

  // Résultat
  const resultEl = (
      <div aria-live="polite">
        {selected && (
          <div style={{ background: "#fff", border: `0.5px solid ${C.border}`, borderRadius: compact ? 12 : 14, padding: compact ? 12 : 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: compact ? "flex-start" : "center", gap: compact ? 10 : 18, flexWrap: "wrap" }}>
              {/* Vous aimez */}
              <div style={{ minWidth: compact ? 0 : 140 }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: compact ? 10 : 11, letterSpacing: "1px", textTransform: "uppercase", color: C.muted, marginBottom: compact ? 1 : 4 }}>
                  {t("you_like")}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: compact ? 16 : 20, color: C.muted, lineHeight: 1.1 }}>{selected.targetName}</div>
              </div>

              {/* Flèche (sens de lecture) */}
              <svg width={compact ? 26 : 34} height={compact ? 18 : 22} viewBox="0 0 34 22" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: isRTL ? "scaleX(-1)" : "none", flexShrink: 0 }}>
                <path d="M2 7h22" /><path d="M18 2l7 5-7 5" />
                <path d="M2 15h26" /><path d="M22 10l7 5-7 5" />
              </svg>

              {/* Le jumeau oriental */}
              <div style={{ display: "flex", alignItems: "center", gap: compact ? 10 : 14, flex: "1 1 auto", minWidth: compact ? 0 : 200 }}>
                <div style={{ position: "relative", width: compact ? 44 : 64, height: compact ? 44 : 64, borderRadius: 10, overflow: "hidden", background: "#F7F3EE", flexShrink: 0 }}>
                  <Image src={selected.product.image} alt={selected.product.name} fill sizes={compact ? "44px" : "64px"} style={{ objectFit: "cover" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: compact ? 10 : 11, letterSpacing: "1px", textTransform: "uppercase", color: C.goldLabel, marginBottom: compact ? 1 : 3 }}>
                    {t("the_twin")}
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: compact ? 16 : 19, color: C.ink, lineHeight: 1.1 }}>
                    {selected.product.brand} · {selected.product.name}
                  </div>
                  {compact ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 3 }}>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: C.goldLabel }}>
                        {t("from_price", { price: fmt(selected.product.price) })}
                      </span>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: 10.5, color: C.goldDark, background: C.tagBg, border: `1px solid ${C.tagBorder}`, borderRadius: 20, padding: "2px 8px" }}>
                        {selected.family}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: C.goldLabel, marginTop: 2 }}>
                        {t("from_price", { price: fmt(selected.product.price) })}
                      </div>
                      <span style={{ display: "inline-block", marginTop: 6, fontFamily: "var(--font-sans)", fontSize: 11, color: C.goldDark, background: C.tagBg, border: `1px solid ${C.tagBorder}`, borderRadius: 20, padding: "3px 10px" }}>
                        {selected.family}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ borderTop: `1px solid ${C.border}`, marginTop: compact ? 10 : 14, paddingTop: compact ? 10 : 12, display: compact ? "flex" : "block", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: compact ? 11.5 : 12, color: C.muted, margin: compact ? 0 : "0 0 14px", lineHeight: compact ? 1.45 : 1.6, flex: compact ? "1 1 200px" : undefined }}>
                {selected.description}
              </p>
              <Link
                href={selected.product.href}
                style={{
                  display: compact ? "inline-block" : "block",
                  textAlign: "center",
                  textDecoration: "none",
                  background: C.goldCta,
                  color: "#fff",
                  fontFamily: "var(--font-sans)",
                  fontSize: compact ? 11 : 12,
                  fontWeight: 500,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  borderRadius: 999,
                  padding: compact ? "9px 18px" : "13px 16px",
                  whiteSpace: compact ? "nowrap" : undefined,
                  flexShrink: compact ? 0 : undefined,
                }}
              >
                {t("see_product")} →
              </Link>
            </div>
          </div>
        )}
      </div>
  );

  // Mention légale — toujours visible
  const legalEl = (
      <div style={{ display: "flex", alignItems: "flex-start", gap: compact ? 6 : 8, marginTop: compact ? 10 : 16 }}>
        <svg width={compact ? 12 : 15} height={compact ? 12 : 15} viewBox="0 0 24 24" fill="none" stroke={C.legal} strokeWidth="2" strokeLinecap="round" aria-hidden style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
        </svg>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: compact ? 10 : 11.5, color: C.legal, margin: 0, lineHeight: 1.4 }}>
          {t("legal")}
        </p>
      </div>
  );

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        background: C.stage,
        border: `0.5px solid ${C.border}`,
        borderRadius: compact ? 14 : 16,
        padding: compact ? 14 : 22,
        textAlign: isRTL ? "right" : "left",
      }}
    >
      {compact ? (
        <>
          {/* Styles scoped : accroche pulsée (respecte prefers-reduced-motion) + grille responsive */}
          <style>{`
            @keyframes otwin-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(201,162,74,.45); } 50% { box-shadow: 0 0 0 7px rgba(201,162,74,0); } }
            .otwin-q { animation: otwin-pulse 2.4s ease-in-out infinite; }
            .otwin-grid { display: grid; grid-template-columns: minmax(0, 45fr) minmax(0, 55fr); gap: 18px; align-items: start; }
            @media (max-width: 640px) { .otwin-grid { grid-template-columns: 1fr; } }
            @media (prefers-reduced-motion: reduce) { .otwin-q { animation: none; } }
          `}</style>
          {hookEl}
          <div className="otwin-grid">
            {/* Colonne gauche : recherche + chips */}
            <div>
              {searchEl}
              {pillsEl}
            </div>
            {/* Colonne droite : carte résultat + mention légale */}
            <div>
              {resultEl}
              {legalEl}
            </div>
          </div>
        </>
      ) : (
        <>
          {introEl}
          {searchEl}
          {pillsEl}
          {resultEl}
          {legalEl}
        </>
      )}
    </div>
  );
}
