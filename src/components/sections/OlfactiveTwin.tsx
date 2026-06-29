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
}: {
  matches: OlfactiveMatch[];
  locale?: string;
}) {
  const t = useTranslations("olfactiveTwin");
  const isRTL = locale === "ar";
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

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        background: C.stage,
        border: `0.5px solid ${C.border}`,
        borderRadius: 16,
        padding: 22,
        textAlign: isRTL ? "right" : "left",
      }}
    >
      {/* Intro */}
      <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: C.muted, margin: "0 0 16px" }}>
        {t("intro")}
      </p>

      {/* Recherche */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#fff",
          border: `1px solid ${C.searchBorder}`,
          borderRadius: 999,
          padding: "12px 18px",
          marginBottom: 16,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.searchIcon} strokeWidth="2" strokeLinecap="round" aria-hidden>
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
            fontSize: 14,
            color: C.ink,
          }}
        />
      </div>

      {/* Pills marques cibles */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
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
                fontSize: 14,
                cursor: "pointer",
                padding: "10px 16px",
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

      {/* Résultat */}
      <div aria-live="polite">
        {selected && (
          <div style={{ background: "#fff", border: `0.5px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
              {/* Vous aimez */}
              <div style={{ minWidth: 140 }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", color: C.muted, marginBottom: 4 }}>
                  {t("you_like")}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: C.muted }}>{selected.targetName}</div>
              </div>

              {/* Flèche (sens de lecture) */}
              <svg width="34" height="22" viewBox="0 0 34 22" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: isRTL ? "scaleX(-1)" : "none" }}>
                <path d="M2 7h22" /><path d="M18 2l7 5-7 5" />
                <path d="M2 15h26" /><path d="M22 10l7 5-7 5" />
              </svg>

              {/* Le jumeau oriental */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 200 }}>
                <div style={{ position: "relative", width: 64, height: 64, borderRadius: 10, overflow: "hidden", background: "#F7F3EE", flexShrink: 0 }}>
                  <Image src={selected.product.image} alt={selected.product.name} fill sizes="64px" style={{ objectFit: "cover" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", color: C.goldLabel, marginBottom: 3 }}>
                    {t("the_twin")}
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 19, color: C.ink, lineHeight: 1.1 }}>
                    {selected.product.brand} · {selected.product.name}
                  </div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: C.goldLabel, marginTop: 2 }}>
                    {t("from_price", { price: fmt(selected.product.price) })}
                  </div>
                  <span style={{ display: "inline-block", marginTop: 6, fontFamily: "var(--font-sans)", fontSize: 11, color: C.goldDark, background: C.tagBg, border: `1px solid ${C.tagBorder}`, borderRadius: 20, padding: "3px 10px" }}>
                    {selected.family}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 14, paddingTop: 12 }}>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: C.muted, margin: "0 0 14px", lineHeight: 1.6 }}>
                {selected.description}
              </p>
              <Link
                href={selected.product.href}
                style={{
                  display: "block",
                  textAlign: "center",
                  textDecoration: "none",
                  background: C.goldCta,
                  color: "#fff",
                  fontFamily: "var(--font-sans)",
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  borderRadius: 999,
                  padding: "13px 16px",
                }}
              >
                {t("see_product")} →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Mention légale — toujours visible */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 16 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.legal} strokeWidth="2" strokeLinecap="round" aria-hidden style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
        </svg>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, color: C.legal, margin: 0, lineHeight: 1.5 }}>
          {t("legal")}
        </p>
      </div>
    </div>
  );
}
