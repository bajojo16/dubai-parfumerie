"use client";

/**
 * Une question du quiz et ses options — portage des `.q-step` de l'archive.
 *
 * Le même composant sert deux fois :
 *  - en plein écran pendant le parcours (`compact` faux) ;
 *  - replié dans le récapitulatif de l'écran de fin, quand un critère se rejoue
 *    sur place (`compact` vrai). Les visuels, les jauges et les sous-textes
 *    tombent alors, comme dans `.q-inline-opts` : à cette taille ils ne
 *    montreraient plus rien.
 *
 * Styles : bloc `CSS` de `FragranceFinderModal.tsx`.
 */
import Image from "next/image";
import type { QuizQuestion } from "./types";

export function QuestionScreen({
  question,
  selected,
  compact = false,
  onSelect,
  onSkip,
}: {
  question: QuizQuestion;
  /** index de l'option retenue, `null` si la question a été passée */
  selected: number | null | undefined;
  compact?: boolean;
  onSelect: (optionIndex: number) => void;
  onSkip: () => void;
}) {
  const withArt = question.layout === "art" && !compact;

  return (
    <div className={compact ? "dp-ff-step is-compact" : "dp-ff-step"}>
      {!compact && (
        <>
          <p className="dp-ff-q">{question.title}</p>
          {question.subtitle && <p className="dp-ff-sub">{question.subtitle}</p>}
        </>
      )}

      <div
        className={`dp-ff-opts is-${compact ? "pill" : question.layout}`}
        role="group"
        aria-label={question.title}
      >
        {question.options.map((option, i) => {
          const on = selected === i;
          return (
            <button
              key={option.label}
              type="button"
              className={`dp-ff-opt${on ? " on" : ""}${withArt ? " has-art" : ""}`}
              aria-pressed={on}
              onClick={() => onSelect(i)}
              // L'aplat vient d'une variable du design system (voir questions.ts) :
              // aucune couleur n'est écrite en dur ici.
              style={!compact && option.fill ? { ["--dp-ff-fill" as string]: option.fill } : undefined}
              data-fill={!compact && option.fill ? "" : undefined}
            >
              {withArt && option.image && (
                <>
                  <Image
                    className="dp-ff-art"
                    src={option.image}
                    alt=""
                    fill
                    sizes="(max-width: 560px) 45vw, 160px"
                    style={{ objectFit: "cover" }}
                  />
                  {/* Voile : le libellé doit rester lisible sur n'importe quelle
                      photo. Seul rgba toléré hors tokens (c'est un voile). */}
                  <span className="dp-ff-scrim" aria-hidden="true" />
                </>
              )}
              <span className="dp-ff-opt-label">{option.label}</span>
              {!compact && option.gauge && (
                <span className="dp-ff-gauge" aria-hidden="true">
                  <i className={option.gauge >= 1 ? "on" : undefined} />
                  <i className={option.gauge >= 2 ? "on" : undefined} />
                  <i className={option.gauge >= 3 ? "on" : undefined} />
                </span>
              )}
              {!compact && option.hint && <small>{option.hint}</small>}
            </button>
          );
        })}

        {compact && (
          // Rejouée depuis le récapitulatif, toute question peut être remise à
          // « Peu importe » — y compris celles qui n'ont pas de lien d'évitement
          // pendant le parcours : on ne repasse plus par là pour se corriger.
          <button type="button" className="dp-ff-inline-skip" onClick={onSkip}>
            Peu importe
          </button>
        )}
      </div>

      {!compact && question.skip && (
        <button type="button" className="dp-ff-skip" onClick={onSkip}>
          {question.skip}
        </button>
      )}

      {!compact && question.note && (
        <aside className="dp-ff-note">
          <span className="dp-ff-note-title">{question.note.title}</span>
          {question.note.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </aside>
      )}
    </div>
  );
}
