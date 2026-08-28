"use client";

/**
 * En-tête de progression du quiz : retour, compteur « QUESTION n/N » et barre
 * fine. Reprise du bloc `.q-head` / `.q-bar` de l'archive.
 *
 * Les styles vivent dans le bloc `CSS` de `FragranceFinderModal.tsx` : la
 * modale est le seul point de montage de ce composant, un seul `<style>` sert
 * tout le sous-arbre.
 */

export function ProgressHeader({
  index,
  total,
  onBack,
}: {
  /** numéro de l'étape courante, 0-based */
  index: number;
  total: number;
  onBack: () => void;
}) {
  const current = index + 1;
  const percent = Math.round((current / total) * 100);

  return (
    <>
      <div className="dp-ff-head">
        {/* Le retour garde sa place au premier écran (visibility, pas display) :
            sans ça le compteur sautait latéralement d'une question à l'autre. */}
        <button
          type="button"
          className="dp-ff-back"
          onClick={onBack}
          disabled={index === 0}
          aria-label="Question précédente"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 5 8 12 15 19" />
          </svg>
          Retour
        </button>
        <span className="dp-ff-count">
          Question {current}/{total}
        </span>
        <span aria-hidden="true" />
      </div>
      <div
        className="dp-ff-bar"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={`Question ${current} sur ${total}`}
      >
        <i style={{ width: `${percent}%` }} />
      </div>
    </>
  );
}
