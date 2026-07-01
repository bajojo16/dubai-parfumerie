"use client";

/**
 * QuestionScreen — écran de question à vignettes.
 * Clic sur une tuile = sélection immédiate (le parent gère l'auto-avance ~260ms).
 * Les options `fullWidth` (ex. « Je ne sais pas », value:"none") sont rendues
 * en pleine largeur, séparées, sous la grille — elles auto-avancent aussi mais
 * leur value:"none" est ignorée par le scoring (aucun filtre appliqué).
 * Bouton « Retour » : géré dans ProgressHeader (désactivé sur Q1).
 */
import type { Question, FinderLabels } from "./types";
import { Tile } from "./Tile";
import { FF } from "./tokens";

export function QuestionScreen({
  question,
  selected,
  reduced,
  onSelect,
}: {
  question: Question;
  selected: string | null;
  reduced: boolean;
  labels: FinderLabels;
  onSelect: (value: string) => void;
}) {
  const options = question.options ?? [];
  const gridOptions = options.filter((o) => !o.fullWidth);
  const fullWidthOptions = options.filter((o) => o.fullWidth);
  // 3 colonnes pour 3 ou 6 tuiles (grille compacte sans scroll), 2 colonnes sinon.
  const cols = gridOptions.length === 3 || gridOptions.length === 6 ? 3 : 2;

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
        {gridOptions.map((opt) => (
          <Tile
            key={opt.value}
            option={opt}
            selected={selected === opt.value}
            reduced={reduced}
            onSelect={onSelect}
          />
        ))}
      </div>

      {fullWidthOptions.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={selected === opt.value}
          onClick={() => onSelect(opt.value)}
          style={{
            width: "100%",
            padding: "13px 18px",
            background: selected === opt.value ? FF.cream2 : "transparent",
            border: `1px dashed ${selected === opt.value ? FF.gold : FF.border}`,
            borderRadius: 14,
            color: selected === opt.value ? FF.ink2 : FF.muted,
            fontFamily: FF.sans,
            fontSize: "0.88rem",
            cursor: "pointer",
            transition: reduced ? "none" : "background .2s, color .2s, border-color .2s",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
