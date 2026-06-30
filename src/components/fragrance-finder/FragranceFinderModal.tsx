"use client";

/**
 * FragranceFinderModal — overlay + moteur d'écrans du quiz.
 *
 * - 9 questions → écran de chargement → résultats (3 parfums).
 * - Clic option = validation immédiate + auto-avance ~260ms (halo or via Tile).
 * - Retour discret (désactivé Q1), Échap ferme, clic sur le fond ferme,
 *   focus trap + restitution du focus à la fermeture.
 * - Numérotation et barre TOUJOURS calculées (jamais en dur).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CatalogProduct, FinderLabels, QuizAnswers } from "./types";
import { QUESTIONS } from "./data/questions";
import { recommend } from "./lib/recommend";
import { DEFAULT_LABELS } from "./labels";
import { ProgressHeader } from "./ProgressHeader";
import { QuestionScreen } from "./QuestionScreen";
import { SearchScreen } from "./SearchScreen";
import { ResultScreen } from "./ResultScreen";
import { FF } from "./tokens";

const AUTO_ADVANCE_MS = 260;

const EMPTY_ANSWERS: QuizAnswers = {
  gender: null,
  family: null,
  note: null,
  ambiance: null,
  season: null,
  loved: null,
  note2: null,
  budget: null,
  format: null,
};

type Stage = "questions" | "loading" | "results";

export function FragranceFinderModal({
  open,
  products,
  locale = "fr",
  labels: labelsProp,
  onClose,
}: {
  open: boolean;
  products: CatalogProduct[];
  locale?: string;
  labels?: Partial<FinderLabels>;
  onClose: () => void;
}) {
  const labels = useMemo<FinderLabels>(
    () => ({ ...DEFAULT_LABELS, ...labelsProp }),
    [labelsProp]
  );
  const isRTL = locale === "ar";

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(EMPTY_ANSWERS);
  const [stage, setStage] = useState<Stage>("questions");

  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const advanceTimer = useRef<number | null>(null);
  const total = QUESTIONS.length;
  const question = QUESTIONS[index];

  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(
      typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  const recommendations = useMemo(
    () => (stage === "results" ? recommend(answers, products) : []),
    [stage, answers, products]
  );

  const reset = useCallback(() => {
    setIndex(0);
    setAnswers(EMPTY_ANSWERS);
    setStage("questions");
  }, []);

  const clearTimer = () => {
    if (advanceTimer.current != null) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  };

  const goNext = useCallback(() => {
    setIndex((i) => {
      if (i < total - 1) return i + 1;
      setStage("loading");
      return i;
    });
  }, [total]);

  const goBack = useCallback(() => {
    clearTimer();
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  // Enregistre une réponse + auto-avance (sauf Retour).
  const answer = useCallback(
    (value: string | null) => {
      if (!question) return;
      setAnswers((a) => ({ ...a, [question.id]: value }));
      clearTimer();
      advanceTimer.current = window.setTimeout(
        goNext,
        reduced ? 0 : AUTO_ADVANCE_MS
      );
    },
    [question, goNext, reduced]
  );

  // Loading → results (petite pause « composition »).
  useEffect(() => {
    if (stage !== "loading") return;
    const id = window.setTimeout(() => setStage("results"), reduced ? 150 : 900);
    return () => window.clearTimeout(id);
  }, [stage, reduced]);

  // Reset à l'ouverture + gestion focus.
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      reset();
      document.body.style.overflow = "hidden";
      // focus le dialog après montage
      window.setTimeout(() => dialogRef.current?.focus(), 0);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, reset]);

  // Échap + focus trap.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Restitution du focus à la fermeture.
  useEffect(() => {
    if (!open && previouslyFocused.current) {
      previouslyFocused.current.focus?.();
    }
  }, [open]);

  useEffect(() => () => clearTimer(), []);

  if (!open) return null;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      onMouseDown={(e) => {
        // clic sur le fond (et pas sur le panneau) ferme
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        // Carte centrée verticalement, jamais coupée par le viewport.
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        padding: 24,
        boxSizing: "border-box",
        background: "rgba(21,17,13,0.55)",
        backdropFilter: "blur(3px)",
        // direction de l'icône retour selon RTL
        ["--ff-dir" as string]: isRTL ? -1 : 1,
        animation: reduced ? undefined : "ff-fade .25s ease",
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={labels.modalTitle}
        tabIndex={-1}
        style={{
          width: "100%",
          maxWidth: 560,
          // Tient dans la hauteur d'écran ; le contenu interne scrolle.
          maxHeight: "calc(100dvh - 48px)",
          overflowY: "auto",
          background: FF.cream,
          borderRadius: 28,
          border: `1px solid ${FF.border}`,
          boxShadow: "0 24px 60px rgba(21,17,13,0.32)",
          padding: "20px 22px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          outline: "none",
          animation: reduced ? undefined : "ff-slide-up .3s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {stage === "questions" && question && (
          <>
            <ProgressHeader
              index={index}
              total={total}
              reduced={reduced}
              labels={labels}
              onBack={goBack}
              onClose={onClose}
            />
            {question.kind === "search" ? (
              <SearchScreen
                question={question}
                products={products}
                reduced={reduced}
                labels={labels}
                onSelectSlug={(slug) => answer(slug)}
                onFreeText={(text) => answer(text)}
                onSkip={() => answer(null)}
              />
            ) : (
              <QuestionScreen
                question={question}
                selected={answers[question.id]}
                reduced={reduced}
                labels={labels}
                onSelect={(value) => answer(value)}
                onUnsure={() => answer(null)}
              />
            )}
          </>
        )}

        {stage === "loading" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
              padding: "70px 0",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                border: `3px solid ${FF.border}`,
                borderTopColor: FF.goldDeep,
                animation: reduced ? undefined : "ff-spin .9s linear infinite",
              }}
            />
            <p style={{ fontFamily: FF.sans, fontSize: "0.95rem", color: FF.ink2, margin: 0, textAlign: "center" }}>
              {labels.loading}
            </p>
          </div>
        )}

        {stage === "results" && (
          <>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: FF.cream2,
                  border: `1px solid ${FF.border}`,
                  color: FF.ink2,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ResultScreen
              recommendations={recommendations}
              reduced={reduced}
              labels={labels}
              locale={locale}
              onRestart={reset}
            />
          </>
        )}
      </div>

      <style>{`
        @keyframes ff-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ff-slide-up { from { transform: translateY(24px); opacity: .6 } to { transform: translateY(0); opacity: 1 } }
        @keyframes ff-spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}
