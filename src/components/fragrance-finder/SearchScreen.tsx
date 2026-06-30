"use client";

/**
 * SearchScreen — Q6 : recherche d'un parfum aimé.
 * Autocomplete sur le CATALOGUE LOCAL (debounce 250ms), saisie libre acceptée.
 * « Passer » discret. Sélectionner un résultat ou valider une saisie libre
 * fait avancer le quiz (le parent gère la transition).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { CatalogProduct, FinderLabels, Question } from "./types";
import { FF } from "./tokens";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function SearchScreen({
  question,
  products,
  reduced,
  labels,
  onSelectSlug,
  onFreeText,
  onSkip,
}: {
  question: Question;
  products: CatalogProduct[];
  reduced: boolean;
  labels: FinderLabels;
  onSelectSlug: (slug: string) => void;
  onFreeText: (text: string) => void;
  onSkip: () => void;
}) {
  const [raw, setRaw] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(raw), 250);
    return () => window.clearTimeout(id);
  }, [raw]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const matches = useMemo(() => {
    const q = normalize(debounced);
    if (q.length < 2) return [];
    return products
      .filter(
        (p) =>
          normalize(p.name).includes(q) || normalize(p.brand).includes(q)
      )
      .slice(0, 5);
  }, [debounced, products]);

  const trimmed = raw.trim();
  const showFreeText =
    trimmed.length >= 2 &&
    !matches.some((m) => normalize(m.name) === normalize(trimmed));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <header style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
        <h2
          style={{
            fontFamily: FF.display,
            fontWeight: 500,
            fontSize: "clamp(1.7rem, 4.5vw, 2.1rem)",
            color: FF.ink,
            margin: 0,
            lineHeight: 1.12,
          }}
        >
          {question.title}
        </h2>
        {question.subtitle && (
          <p
            style={{
              fontFamily: FF.sans,
              fontWeight: 300,
              fontSize: "0.92rem",
              color: FF.muted,
              margin: 0,
            }}
          >
            {question.subtitle}
          </p>
        )}
      </header>

      {/* Champ de recherche */}
      <div style={{ position: "relative" }}>
        <span
          aria-hidden
          style={{
            position: "absolute",
            insetInlineStart: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: FF.muted,
            display: "flex",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (matches.length > 0) onSelectSlug(matches[0].slug);
              else if (trimmed.length >= 2) onFreeText(trimmed);
            }
          }}
          placeholder={labels.searchPlaceholder}
          aria-label={labels.searchPlaceholder}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "15px 16px 15px 42px",
            paddingInlineStart: 42,
            paddingInlineEnd: 16,
            background: FF.white,
            border: `1.5px solid ${FF.border}`,
            borderRadius: 14,
            fontFamily: FF.sans,
            fontSize: "1rem",
            color: FF.ink,
            outline: "none",
          }}
        />
      </div>

      {/* Résultats */}
      {matches.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {matches.map((p) => (
            <li key={p.slug}>
              <button
                type="button"
                onClick={() => onSelectSlug(p.slug)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 10,
                  background: FF.white,
                  border: `1px solid ${FF.border}`,
                  borderRadius: 12,
                  cursor: "pointer",
                  textAlign: "start",
                  transition: reduced ? "none" : "border-color .2s, transform .15s",
                }}
              >
                <span
                  style={{
                    position: "relative",
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    overflow: "hidden",
                    background: FF.cream2,
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="44px"
                    style={{ objectFit: "cover" }}
                  />
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span
                    style={{
                      fontFamily: FF.sans,
                      fontSize: "0.66rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: FF.goldDeep,
                    }}
                  >
                    {p.brand}
                  </span>
                  <span style={{ fontFamily: FF.display, fontSize: "1.05rem", color: FF.ink }}>
                    {p.name}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Saisie libre */}
      {showFreeText && (
        <button
          type="button"
          onClick={() => onFreeText(trimmed)}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: FF.cream2,
            border: `1px solid ${FF.border}`,
            borderRadius: 12,
            color: FF.ink2,
            fontFamily: FF.sans,
            fontSize: "0.9rem",
            cursor: "pointer",
            textAlign: "start",
          }}
        >
          {labels.freeTextPrefix} «&nbsp;<strong>{trimmed}</strong>&nbsp;»
        </button>
      )}

      {/* Aucun résultat */}
      {debounced.trim().length >= 2 && matches.length === 0 && !showFreeText && (
        <p style={{ fontFamily: FF.sans, fontSize: "0.85rem", color: FF.muted, textAlign: "center", margin: 0 }}>
          {labels.searchEmpty}
        </p>
      )}

      {/* Passer */}
      {question.allowSkip && (
        <button
          type="button"
          onClick={onSkip}
          style={{
            alignSelf: "center",
            background: "transparent",
            border: "none",
            color: FF.muted,
            fontFamily: FF.sans,
            fontSize: "0.88rem",
            textDecoration: "underline",
            textUnderlineOffset: 3,
            cursor: "pointer",
            padding: "4px 8px",
          }}
        >
          {labels.skip}
        </button>
      )}
    </div>
  );
}
