"use client";

import { useId } from "react";
import { fold, T } from "./faq.data";

export type FaqSearchLabels = {
  label: string;
  placeholder: string;
  clear: string;
};

const DEFAULT_LABELS: FaqSearchLabels = {
  label: "Rechercher une question",
  placeholder: "Rechercher une question…",
  clear: "Effacer la recherche",
};

/**
 * Surligne le terme recherché via <mark> doré, insensible à la casse et aux
 * accents (normalisation NFD + suppression des diacritiques). Mappe les
 * positions « pliées » vers le texte d'origine pour préserver l'affichage.
 */
export function highlightMatch(text: string, query: string): React.ReactNode {
  const q = fold(query.trim());
  if (!q) return text;

  // Construit la chaîne pliée + table de correspondance index plié → index original.
  let folded = "";
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const f = fold(text[i]);
    for (let j = 0; j < f.length; j++) {
      folded += f[j];
      map.push(i);
    }
  }

  const parts: React.ReactNode[] = [];
  let last = 0; // position originale
  let from = 0; // position de départ dans la chaîne pliée
  let idx: number;
  let key = 0;
  while ((idx = folded.indexOf(q, from)) !== -1) {
    const startOrig = map[idx];
    const endOrig = map[idx + q.length - 1] + 1;
    if (startOrig > last) parts.push(text.slice(last, startOrig));
    parts.push(
      <mark
        key={key++}
        style={{
          background: "rgba(201,162,74,.28)",
          color: T.goldDeep,
          borderRadius: 3,
          padding: "0 1px",
        }}
      >
        {text.slice(startOrig, endOrig)}
      </mark>,
    );
    last = endOrig;
    from = idx + q.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function FaqSearch({
  value,
  onChange,
  labels,
}: {
  value: string;
  onChange: (v: string) => void;
  labels?: Partial<FaqSearchLabels>;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const fieldId = useId();

  return (
    <div style={{ position: "relative" }}>
      <label htmlFor={fieldId} style={srOnly}>
        {L.label}
      </label>
      {/* Loupe */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke={T.gold}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        style={{
          position: "absolute",
          insetInlineStart: 16,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
      <input
        id={fieldId}
        type="search"
        role="searchbox"
        value={value}
        placeholder={L.placeholder}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          height: 52,
          border: `1px solid ${T.line2}`,
          borderRadius: 999,
          paddingInlineStart: 46,
          paddingInlineEnd: value ? 46 : 18,
          fontFamily: "var(--font-sans)",
          fontSize: 15,
          color: T.ink,
          background: T.card,
          outline: "none",
          textAlign: "start",
          boxShadow: "0 1px 2px rgba(26,23,18,.04)",
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={L.clear}
          style={{
            position: "absolute",
            insetInlineEnd: 14,
            top: "50%",
            transform: "translateY(-50%)",
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: "none",
            background: "rgba(168,132,62,.12)",
            color: T.goldDeep,
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            fontSize: 14,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};
