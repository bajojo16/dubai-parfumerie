"use client";

/**
 * QuestionScreen — écran de question à vignettes.
 * Clic sur une tuile = sélection immédiate (le parent gère l'auto-avance ~260ms).
 * « Je ne sais pas » pleine largeur en bas si allowSkipUnsure (Q4 + Q7).
 */
import type { Question, FinderLabels } from "./types";
import { Tile } from "./Tile";
import { FF } from "./tokens";

export function QuestionScreen({
  question,
  selected,
  reduced,
  labels,
  onSelect,
  onUnsure,
}: {
  question: Question;
  selected: string | null;
  reduced: boolean;
  labels: FinderLabels;
  onSelect: (value: string) => void;
  onUnsure: () => void;
}) {
  const options = question.options ?? [];
  const cols = options.length === 3 ? 3 : 2;

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

      <div
        role="radiogroup"
        aria-label={question.title}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 12,
        }}
      >
        {options.map((opt) => (
          <Tile
            key={opt.value}
            option={opt}
            selected={selected === opt.value}
            reduced={reduced}
            onSelect={onSelect}
          />
        ))}
      </div>

      {question.allowSkipUnsure && (
        <button
          type="button"
          onClick={onUnsure}
          style={{
            width: "100%",
            padding: "13px 18px",
            background: selected === null ? FF.cream2 : "transparent",
            border: `1px dashed ${FF.border}`,
            borderRadius: 14,
            color: FF.muted,
            fontFamily: FF.sans,
            fontSize: "0.88rem",
            cursor: "pointer",
            transition: "background .2s, color .2s",
          }}
        >
          {labels.unsure}
        </button>
      )}
    </div>
  );
}
