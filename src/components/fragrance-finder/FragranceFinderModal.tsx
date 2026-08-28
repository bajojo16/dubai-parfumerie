"use client";

/**
 * FragranceFinderModal — le quiz olfactif, servi dans DEUX contextes.
 *
 * Réplique du quiz d'AD Parfumerie (archive `quiz-ad-parfumerie` : index.html,
 * js/quiz.js, css/quiz.css), habillée du design system Dubaï Parfumerie. Huit
 * questions au lieu de neuf : celle du parfum de référence en champ libre n'est
 * pas portée, faute de pouvoir en tirer quoi que ce soit sur ce catalogue.
 *
 * ── Les deux variantes ──
 *   `variant="modal"` (défaut) — ce que le bouton flottant « Choisir mon
 *      parfum » ouvre : voile, `role="dialog"`, Échap, piège à focus, scroll de
 *      page bloqué, parcours remis à zéro à chaque ouverture.
 *   `variant="inline"` — la section « Trouvez votre parfum » de l'accueil. Le
 *      panneau s'inscrit dans le flux de la page : aucune de ces mécaniques de
 *      modale n'a alors de sens (rien à fermer, rien à piéger, rien à bloquer),
 *      et `open` est ignoré — le quiz est toujours là.
 *
 * Un seul composant porte les deux : le parcours (progression, question,
 * résultat, devise, toast, moteur) est rigoureusement le même, seule la coquille
 * change. L'extraire dans un sous-composant n'aurait déplacé que ~25 lignes de
 * JSX tout en obligeant à faire redescendre une douzaine d'états en props —
 * plus de surface, pas moins de logique.
 *
 * Le moteur de recommandation (`./lib/recommend`) est chargé en `import()`
 * dynamique — il tire tout le catalogue agrégé avec lui, qui n'a rien à faire
 * dans le bundle du layout ni dans celui de l'accueil. Même montage que
 * `SearchOverlay` avec `./rank`. Le déclencheur diffère selon la variante :
 * l'ouverture en modale ; l'entrée dans le viewport (IntersectionObserver) ou le
 * premier clic sur une réponse en inline, parce que la section vit en bas de
 * l'accueil et ne doit rien coûter tant qu'on ne l'a pas atteinte.
 *
 * Le bloc `CSS` en fin de fichier habille TOUT le sous-arbre du quiz
 * (ProgressHeader, QuestionScreen, ResultScreen) : un seul `<style>`, comme
 * dans SearchOverlay. Les deux variantes servent le MÊME bloc — si les deux
 * instances coexistent (section visible + modale ouverte), les deux `<style>`
 * sont identiques, donc sans contradiction possible.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QUESTIONS, QUESTION_COUNT, STEP } from "./data/questions";
import { ProgressHeader } from "./ProgressHeader";
import { QuestionScreen } from "./QuestionScreen";
import { ResultScreen } from "./ResultScreen";
import { useReducedMotion } from "./useReducedMotion";
import type { QuizAnswers } from "./types";

/** Moteur chargé à la première ouverture — jamais au chargement de la page. */
type RecommendModule = typeof import("./lib/recommend");

/** Le temps de voir la pastille se cocher avant de passer à la suite. */
const ADVANCE_MS = 220;
const TOAST_MS = 2600;

// Devise — même contrat que Header.tsx / Footer.tsx / SearchOverlay.tsx.
const CURRENCY_KEY = "dp_currency";
const CURRENCY_EVENT = "dp-currency-change";

function readCurrency(): string {
  if (typeof window === "undefined") return "EUR";
  try {
    return window.localStorage.getItem(CURRENCY_KEY) || "EUR";
  } catch {
    return "EUR";
  }
}

export function FragranceFinderModal({
  open = false,
  locale = "fr",
  onClose,
  variant = "modal",
}: {
  /** Ignoré en `variant="inline"` : la section est toujours « ouverte ». */
  open?: boolean;
  locale?: string;
  /** Absent en inline — il n'y a rien à fermer. */
  onClose?: () => void;
  variant?: "modal" | "inline";
}) {
  const isRTL = locale === "ar";
  // `variant` ne change jamais pour une instance donnée : les branches qui en
  // dépendent sont donc stables, y compris celle posée pendant le rendu plus bas.
  const isModal = variant === "modal";

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [done, setDone] = useState(false);
  const [engine, setEngine] = useState<RecommendModule | null>(null);
  const [currency, setCurrency] = useState(readCurrency);
  const [toast, setToast] = useState<string | null>(null);
  const reduced = useReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const advanceTimer = useRef<number | null>(null);

  const question = QUESTIONS[index];

  /** Ferme — sans effet en inline, où aucun `onClose` n'est fourni. */
  const close = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // ── Moteur + catalogue, jamais avant d'en avoir besoin ────────────────────
  // En modale : à la première ouverture. En inline : quand la section approche
  // du viewport, ou dès le premier clic sur une réponse si l'observateur n'a
  // pas eu lieu d'être (navigateur sans IntersectionObserver, ancre directe…).
  const [inlineArmed, setInlineArmed] = useState(false);
  const needsEngine = isModal ? open : inlineArmed;

  useEffect(() => {
    if (!needsEngine || engine) return;
    let alive = true;
    import("./lib/recommend").then((m) => {
      if (alive) setEngine(m);
    });
    return () => {
      alive = false;
    };
  }, [needsEngine, engine]);

  // Amorce inline : la marge de 200px laisse au chunk le temps d'arriver avant
  // que la section soit vraiment sous les yeux.
  useEffect(() => {
    if (isModal || inlineArmed) return;
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInlineArmed(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [isModal, inlineArmed]);

  // ── Devise — synchronisée avec le header ──────────────────────────────────
  useEffect(() => {
    const onChange = () => setCurrency(readCurrency());
    window.addEventListener(CURRENCY_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CURRENCY_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const money = useMemo(
    () => new Intl.NumberFormat(locale || "fr", { style: "currency", currency, maximumFractionDigits: 2 }),
    [locale, currency],
  );

  const clearAdvance = () => {
    if (advanceTimer.current != null) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  };

  const restart = useCallback(() => {
    clearAdvance();
    setIndex(0);
    setAnswers({});
    setDone(false);
  }, []);

  // ── Ouverture / fermeture ─────────────────────────────────────────────────
  // Le parcours repart de zéro à chaque ouverture : revenir sur un écran de fin
  // vieux d'une heure ne dit plus rien de ce qu'on cherche maintenant. La remise
  // à plat se fait PENDANT le rendu, à la bascule de `open` — la règle
  // `react-hooks/set-state-in-effect` du repo interdit de la poser dans l'effet.
  // En inline il n'y a pas de bascule à observer : le quiz ne se ferme jamais,
  // et repartir de zéro dans son dos serait une perte de réponses.
  const [wasOpen, setWasOpen] = useState(open);
  if (isModal && wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setIndex(0);
      setAnswers({});
      setDone(false);
    }
  }

  useEffect(() => {
    if (!isModal || !open) return;
    clearAdvance();
    previousFocus.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => dialogRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = "";
      previousFocus.current?.focus?.();
    };
  }, [isModal, open]);

  // ── Échap + piège à focus — mécaniques de modale, inline s'en passe ───────
  useEffect(() => {
    if (!isModal || !open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isModal, open, close]);

  // ── Toast ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), TOAST_MS);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => clearAdvance, []);

  // ── Parcours ──────────────────────────────────────────────────────────────
  /** Enregistre la réponse, laisse voir la pastille cochée, puis avance. */
  const answer = useCallback(
    (optionIndex: number | null) => {
      setAnswers((a) => ({ ...a, [index]: optionIndex }));
      // Filet inline : répondre prouve que la section est sous les yeux, même si
      // l'IntersectionObserver n'a pas pu jouer. Inutile mais inoffensif en
      // modale (`needsEngine` y suit `open`), et React ne re-rend pas si la
      // valeur ne change pas — d'où l'appel sans garde.
      setInlineArmed(true);
      clearAdvance();
      advanceTimer.current = window.setTimeout(
        () => {
          if (index >= QUESTION_COUNT - 1) setDone(true);
          else setIndex((i) => i + 1);
        },
        reduced ? 0 : ADVANCE_MS,
      );
    },
    [index, reduced],
  );

  const goBack = useCallback(() => {
    clearAdvance();
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  /** Rejoue une question depuis le récapitulatif, sans quitter l'écran de fin. */
  const replay = useCallback((step: number, optionIndex: number | null) => {
    setAnswers((a) => ({ ...a, [step]: optionIndex }));
  }, []);

  // ── Critères → famille + trio ─────────────────────────────────────────────
  const optionAt = useCallback(
    (step: number) => {
      const chosen = answers[step];
      return chosen == null ? undefined : QUESTIONS[step].options[chosen];
    },
    [answers],
  );

  const family = useMemo(() => {
    if (!engine) return null;
    // Seules les questions « univers », « note » et « saison » votent.
    return engine.winningFamily([
      optionAt(STEP.univers)?.family,
      optionAt(STEP.note)?.family,
      optionAt(STEP.saison)?.family,
    ]);
  }, [engine, optionAt]);

  const trio = useMemo(() => {
    if (!engine || !family || !done) return [];
    const budget = optionAt(STEP.budget);
    return engine.recommend({
      family,
      noteWords: optionAt(STEP.note)?.noteWords ?? [],
      gender: optionAt(STEP.destinataire)?.gender ?? "",
      budgetMin: budget?.min ?? 0,
      budgetMax: budget?.max ?? 99999,
    });
  }, [engine, family, done, optionAt]);

  if (isModal && !open) return null;

  return (
    <div ref={rootRef} className={`dp-ff${isModal ? "" : " is-inline"}`} dir={isRTL ? "rtl" : "ltr"}>
      <style>{CSS}</style>

      {isModal && <div className="dp-ff-veil" onMouseDown={close} />}

      <div
        ref={dialogRef}
        className={`dp-ff-panel${done ? " is-result" : ""}`}
        role={isModal ? "dialog" : undefined}
        aria-modal={isModal ? true : undefined}
        aria-label={isModal ? "Quiz olfactif — trouvez votre parfum" : undefined}
        tabIndex={isModal ? -1 : undefined}
      >
        {isModal && (
          <button type="button" className="dp-ff-close" onClick={close} aria-label="Fermer le quiz">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* En inline, le SectionHeader de la page porte déjà surtitre et titre :
            ce chapeau ferait doublon, et deux <h2> pour une même section. */}
        {isModal && (
          <div className="dp-ff-intro">
            <span className="dp-ff-eyebrow">En 2 minutes</span>
            <h2 className="dp-ff-title">
              Quel parfum vous <em>correspond&nbsp;?</em>
            </h2>
          </div>
        )}

        {!done ? (
          <>
            <ProgressHeader index={index} total={QUESTION_COUNT} onBack={goBack} />
            <QuestionScreen
              key={question.id}
              question={question}
              selected={answers[index]}
              onSelect={(optionIndex) => answer(optionIndex)}
              onSkip={() => answer(null)}
            />
          </>
        ) : !engine || !family ? (
          <p className="dp-ff-loading">Nous composons votre sélection…</p>
        ) : (
          <ResultScreen
            trio={trio}
            family={family}
            answers={answers}
            money={money}
            onReplay={replay}
            onRestart={restart}
            onToast={setToast}
            onClose={close}
          />
        )}
      </div>

      {/* Le toast double le vol du flacon : la modale recouvre le header, on ne
          voit pas le compteur du panier bouger. */}
      {toast && (
        <p className="dp-ff-toast" role="status">
          {toast}
        </p>
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
// Tout est bâti sur les tokens de globals.css — aucune couleur en dur hors des
// rgba de voile. z-index : la modale s'ouvre par-dessus le contenu (voir la
// hiérarchie « Z — hiérarchie globale » de globals.css) ; le tiroir panier du
// header vit au même étage et passe devant quand l'ajout le déclenche, ce qui
// est le bon ordre — on veut voir le panier se remplir.

const CSS = `
.dp-ff {
  position: fixed; inset: 0; z-index: 1000;
  font-family: var(--font-sans);
  display: flex; align-items: center; justify-content: center;
  padding: 24px; box-sizing: border-box;
}
.dp-ff-veil {
  position: absolute; inset: 0;
  background: rgba(21,17,13,.55);
  backdrop-filter: blur(3px);
  animation: dp-ff-fade var(--dur) var(--ease-out);
}
.dp-ff-panel {
  position: relative;
  width: 100%; max-width: 680px;
  max-height: calc(100dvh - 48px); overflow-y: auto; overscroll-behavior: contain;
  background: linear-gradient(160deg, var(--surface-cream), var(--surface-cream-2));
  border: 1px solid var(--line-200); border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);
  padding: clamp(22px, 4vw, 38px);
  text-align: center; outline: none;
  animation: dp-ff-rise var(--dur-slow) var(--ease-out);
}
.dp-ff-panel.is-result { max-width: 1120px; text-align: start; }

.dp-ff-close {
  position: absolute; inset-block-start: 12px; inset-inline-end: 12px;
  width: 32px; height: 32px; display: grid; place-items: center;
  border: 1px solid var(--line-200); border-radius: var(--r-pill);
  background: var(--surface-white); color: var(--ink-500); cursor: pointer;
  transition: color var(--dur-fast), border-color var(--dur-fast);
}
.dp-ff-close:hover { color: var(--ink-900); border-color: var(--gold-300); }

/* ── En-tête ── */
.dp-ff-intro { margin-bottom: 22px; }
.dp-ff-eyebrow {
  display: block;
  font-size: var(--t-xs); font-weight: var(--fw-medium);
  letter-spacing: var(--ls-wider); text-transform: uppercase;
  color: var(--ink-400);
}
.dp-ff-title {
  margin: 8px 0 0;
  font-family: var(--font-display); font-weight: var(--fw-medium);
  font-size: clamp(1.6rem, 1.1rem + 1.6vw, 2.2rem);
  line-height: var(--lh-snug); color: var(--ink-900);
}
.dp-ff-title em { font-style: italic; color: var(--gold-700); }

.dp-ff-head {
  display: grid; grid-template-columns: 1fr auto 1fr;
  align-items: center; gap: 12px;
}
.dp-ff-back {
  justify-self: start; display: inline-flex; align-items: center; gap: 4px;
  background: none; border: none; padding: 0; cursor: pointer;
  font-family: inherit; font-size: var(--t-xs); color: var(--ink-500);
  transition: color var(--dur-fast);
}
.dp-ff-back:hover:not(:disabled) { color: var(--ink-900); }
.dp-ff-back:disabled { visibility: hidden; cursor: default; }
.dp-ff-count {
  font-size: 10px; font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-wider); text-transform: uppercase;
  color: var(--gold-700); white-space: nowrap;
}
.dp-ff-bar {
  height: 2px; margin-top: 10px; overflow: hidden;
  border-radius: var(--r-pill); background: var(--line-200);
}
.dp-ff-bar i {
  display: block; height: 100%; border-radius: var(--r-pill);
  background: var(--gradient-gold);
  transition: width var(--dur-slow) var(--ease-out);
}

/* ── Une question ── */
.dp-ff-step { margin-top: 26px; animation: dp-ff-fade var(--dur) var(--ease-out); }
.dp-ff-step.is-compact { margin-top: 0; }
.dp-ff-q {
  margin: 0; font-family: var(--font-display); font-weight: var(--fw-semibold);
  font-size: var(--t-serif-lg); line-height: var(--lh-snug); color: var(--ink-900);
}
.dp-ff-sub { margin: 6px 0 0; font-size: var(--t-sm); color: var(--ink-400); }

.dp-ff-opts {
  display: flex; gap: 10px; justify-content: center;
  align-items: stretch; flex-wrap: nowrap; margin-top: 22px;
}
.dp-ff-opts.is-art { flex-wrap: wrap; }
.dp-ff-opt {
  position: relative; isolation: isolate; overflow: hidden;
  flex: 1 1 0; min-width: 0;
  display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  padding: 13px 16px; cursor: pointer;
  border: 1px solid var(--ink-900); border-radius: var(--r-pill);
  background: var(--surface-white); color: var(--ink-900);
  font-family: inherit; font-size: var(--t-xs); font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-wide); text-transform: uppercase;
  transition: background var(--dur) var(--ease-out), color var(--dur) var(--ease-out),
              border-color var(--dur) var(--ease-out), transform var(--dur) var(--ease-out),
              box-shadow var(--dur) var(--ease-out);
}
/* Le contenu passe au-dessus de la photo et de son voile (voir .is-art) sans
   recourir à un z-index négatif, qui serait masqué par le fond du bouton. */
.dp-ff-opt-label, .dp-ff-opt small, .dp-ff-gauge { position: relative; z-index: 2; }
.dp-ff-opt small {
  font-size: 10px; font-weight: var(--fw-regular);
  letter-spacing: var(--ls-normal); text-transform: none;
  color: var(--ink-400); line-height: var(--lh-snug);
}
.dp-ff-opt:hover { background: var(--espresso-900); color: var(--on-dark-strong); border-color: var(--espresso-900); }
.dp-ff-opt:hover small { color: var(--on-dark-muted); }
.dp-ff-opt.on {
  background: var(--espresso-900); color: var(--on-dark-strong); border-color: var(--espresso-900);
  box-shadow: var(--shadow-gold);
}
.dp-ff-opt.on small { color: var(--on-dark-muted); }

/* aplat de couleur — la valeur vient de questions.ts, toujours un token */
.dp-ff-opt[data-fill] {
  background: var(--dp-ff-fill); border-color: transparent; color: var(--on-dark-strong);
}
.dp-ff-opt[data-fill] small { color: rgba(255,255,255,.82); }
.dp-ff-opt[data-fill]:hover, .dp-ff-opt[data-fill].on {
  background: var(--dp-ff-fill); border-color: transparent;
  transform: translateY(-2px); box-shadow: var(--shadow-md);
}
.dp-ff-opt[data-fill].on { box-shadow: var(--shadow-gold); }

/* vignette photo */
.dp-ff-opts.is-art .dp-ff-opt {
  flex: 1 1 130px; min-height: 96px;
  background: none; border-radius: var(--r-md); border-color: transparent;
  color: var(--on-dark-strong); text-shadow: 0 1px 6px rgba(0,0,0,.55);
}
.dp-ff-opt .dp-ff-art { z-index: 0; transition: transform var(--dur-slow) var(--ease-out); }
.dp-ff-scrim { position: absolute; inset: 0; z-index: 1; background: rgba(12,9,6,.46); transition: background var(--dur) var(--ease-out); }
.dp-ff-opt.has-art:hover, .dp-ff-opt.has-art.on { background: none; border-color: transparent; color: var(--on-dark-strong); }
.dp-ff-opt.has-art:hover .dp-ff-art { transform: scale(1.07); }
.dp-ff-opt.has-art:hover .dp-ff-scrim { background: rgba(12,9,6,.24); }
.dp-ff-opt.has-art.on { box-shadow: var(--shadow-gold); outline: 2px solid var(--gold-400); outline-offset: -2px; }
.dp-ff-opt.has-art small { color: var(--on-dark); text-shadow: 0 1px 6px rgba(0,0,0,.6); }

/* jauge à trois barres */
.dp-ff-opts.is-gauge .dp-ff-opt { border-radius: var(--r-lg); gap: 7px; }
.dp-ff-gauge { display: flex; align-items: flex-end; justify-content: center; gap: 3px; height: 14px; }
.dp-ff-gauge i { width: 5px; border-radius: 2px; background: var(--line-300); transition: background var(--dur) var(--ease-out); }
.dp-ff-gauge i:nth-child(1) { height: 6px; }
.dp-ff-gauge i:nth-child(2) { height: 10px; }
.dp-ff-gauge i:nth-child(3) { height: 14px; }
.dp-ff-gauge i.on { background: var(--gold-700); }
.dp-ff-opt:hover .dp-ff-gauge i, .dp-ff-opt.on .dp-ff-gauge i { background: rgba(255,255,255,.28); }
.dp-ff-opt:hover .dp-ff-gauge i.on, .dp-ff-opt.on .dp-ff-gauge i.on { background: var(--gold-300); }

.dp-ff-skip {
  display: block; margin: 18px auto 0; padding: 0;
  background: none; border: none; cursor: pointer; font-family: inherit;
  font-size: var(--t-xs); color: var(--ink-500);
  text-decoration: underline; text-underline-offset: 3px;
}
.dp-ff-skip:hover { color: var(--ink-900); }

/* encart explicatif */
.dp-ff-note {
  max-width: 36rem; margin: 26px auto 0; padding: 15px 17px;
  text-align: start; border-radius: var(--r-md);
  background: var(--surface-white); border: 1px solid var(--line-100);
  border-inline-start: 2px solid var(--gold-500);
}
.dp-ff-note-title {
  display: block; margin-bottom: 7px;
  font-size: var(--t-xs); font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--gold-700);
}
.dp-ff-note p { margin: 0; font-size: var(--t-sm); line-height: var(--lh-relaxed); color: var(--ink-500); }
.dp-ff-note p + p { margin-top: 8px; }

/* ── Écran de fin ── */
.dp-ff-loading { margin: 60px 0; font-size: var(--t-sm); color: var(--ink-400); text-align: center; }
.dp-ff-result { display: grid; grid-template-columns: 1fr; gap: 28px; margin-top: 24px; }
.dp-ff-result-side { min-width: 0; }
.dp-ff-fam {
  margin: 6px 0 0; font-family: var(--font-display); font-style: italic;
  font-weight: var(--fw-medium); font-size: clamp(1.8rem, 1.3rem + 1.6vw, 2.4rem);
  line-height: var(--lh-snug); color: var(--gold-700);
}
.dp-ff-desc { margin: 12px 0 0; max-width: 44ch; font-size: var(--t-sm); line-height: var(--lh-relaxed); color: var(--ink-500); }

.dp-ff-crit { margin-top: 22px; }
.dp-ff-crit-title {
  margin: 0 0 8px; font-size: var(--t-xs); font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--ink-400);
}
.dp-ff-crit ul {
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: 1px;
  border: 1px solid var(--line-100); border-radius: var(--r-md);
  overflow: hidden; background: var(--line-100);
}
.dp-ff-crit li { background: var(--surface-white); }
.dp-ff-crit li > button {
  /* Le libellé au-dessus de la valeur, et non à côté : la colonne latérale est
     étroite et « modifier » occupe sa largeur même invisible (opacity, pas
     display). À trois colonnes sur une ligne, la valeur tombait sous sa
     largeur minimale et l'ellipsis la rabotait à une lettre — « P… » pour
     « Pour elle ». */
  position: relative;
  display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
  width: 100%; padding: 8px 62px 8px 13px; text-align: start; cursor: pointer;
  background: none; border: none; font-family: inherit;
  transition: background var(--dur-fast);
}
.dp-ff-crit li > button:hover { background: var(--surface-cream); }
.dp-ff-crit li > button span {
  font-size: 9px; font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--ink-400);
}
.dp-ff-crit li > button b {
  font-size: var(--t-sm); font-weight: var(--fw-medium); color: var(--ink-900);
  line-height: var(--lh-snug);
}
.dp-ff-crit li > button i {
  /* Hors flux : sinon il réserve sa place et vole celle de la valeur. */
  position: absolute; inset-inline-end: 13px; top: 50%; transform: translateY(-50%);
  font-style: normal; font-size: 9px; letter-spacing: var(--ls-wide);
  text-transform: uppercase; color: var(--gold-700);
  opacity: 0; transition: opacity var(--dur-fast);
}
.dp-ff-crit li > button:hover i, .dp-ff-crit li > button:focus-visible i { opacity: 1; }

.dp-ff-inline { padding: 10px 13px 13px; border-top: 1px solid var(--line-100); background: var(--surface-cream); }
.dp-ff-inline-q { margin: 0 0 9px; font-family: var(--font-display); font-size: var(--t-serif-md); color: var(--ink-900); }
.dp-ff-step.is-compact .dp-ff-opts { flex-wrap: wrap; justify-content: flex-start; gap: 6px; margin-top: 0; }
.dp-ff-step.is-compact .dp-ff-opt {
  flex: 0 0 auto; width: fit-content; max-width: 100%;
  padding: 6px 12px; min-height: 0; font-size: 9px; border-radius: var(--r-pill);
  white-space: nowrap;
}
.dp-ff-inline-skip {
  padding: 6px 12px; background: none; border: none; cursor: pointer; font-family: inherit;
  font-size: 9px; letter-spacing: var(--ls-wide); text-transform: uppercase;
  color: var(--ink-400); text-decoration: underline; text-underline-offset: 3px;
}
.dp-ff-inline-skip:hover { color: var(--ink-900); }

.dp-ff-restart {
  margin-top: 20px; padding: 0; background: none; border: none; cursor: pointer;
  font-family: inherit; font-size: var(--t-xs);
  letter-spacing: var(--ls-wide); text-transform: uppercase;
  color: var(--ink-400); text-decoration: underline; text-underline-offset: 3px;
}
.dp-ff-restart:hover { color: var(--ink-900); }

/* ── Les trois flacons ── */
.dp-ff-reco { min-width: 0; }
.dp-ff-reco-title {
  margin: 0 0 12px; font-size: var(--t-xs); font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--ink-400);
}
.dp-ff-budget {
  display: inline-block; margin-inline-start: 8px; padding: 3px 9px;
  border-radius: var(--r-pill); background: var(--gold-100); color: var(--gold-900);
  font-size: 9px; font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-normal); text-transform: none;
}
.dp-ff-budget.out { background: var(--surface-cream-2); color: var(--ink-400); }

.dp-ff-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.dp-ff-card {
  display: flex; flex-direction: column;
  background: var(--surface-white); border: 1px solid var(--line-100);
  border-radius: var(--r-md); overflow: hidden; position: relative;
  transition: box-shadow var(--dur) var(--ease-out), opacity var(--dur) var(--ease-out);
}
.dp-ff-card:hover { box-shadow: var(--shadow-sm); }
.dp-ff-card.off { opacity: .48; }
.dp-ff-num {
  position: absolute; inset-block-start: 9px; inset-inline-start: 9px; z-index: 2;
  width: 22px; height: 22px; border-radius: var(--r-pill);
  display: grid; place-items: center;
  background: var(--espresso-900); color: var(--gold-300);
  font-size: 11px; font-weight: var(--fw-bold);
}
.dp-ff-case {
  position: absolute; inset-block-start: 9px; inset-inline-end: 9px; z-index: 2;
  width: 22px; height: 22px; border-radius: var(--r-pill);
  display: grid; place-items: center;
  background: var(--surface-white); border: 1px solid var(--line-200); color: var(--surface-white);
  transition: background var(--dur-fast), border-color var(--dur-fast);
}
.dp-ff-case svg { width: 13px; height: 13px; opacity: 0; transition: opacity var(--dur-fast); }
.dp-ff-card:not(.off) .dp-ff-case { background: var(--success); border-color: var(--success); }
.dp-ff-card:not(.off) .dp-ff-case svg { opacity: 1; }

.dp-ff-vis {
  position: relative; aspect-ratio: 1; display: grid; place-items: center;
  background: var(--surface-image); overflow: hidden;
  font-family: var(--font-display); font-size: 1.6rem; color: var(--gold-700);
}
.dp-ff-vis img, .dp-ff-vis video { width: 100%; height: 100%; object-fit: cover; }
.dp-ff-card.off .dp-ff-vis img, .dp-ff-card.off .dp-ff-vis video { filter: grayscale(.6); }
.dp-ff-stock {
  position: absolute; inset-block-start: 38px; inset-inline-start: 9px; z-index: 2;
  padding: 3px 8px; border-radius: var(--r-pill);
  background: var(--badge-dark-bg); color: var(--badge-dark-fg);
  font-size: 8.5px; font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-wide); text-transform: uppercase;
}

.dp-ff-txt { display: flex; flex-direction: column; gap: 2px; padding: 11px 12px 0; }
.dp-ff-brand {
  display: flex; align-items: center; gap: 6px;
  font-size: 9px; font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--ink-400);
}
.dp-ff-flag {
  font-style: normal; padding: 2px 6px; border-radius: var(--r-pill);
  background: var(--surface-cream-2); color: var(--ink-500);
  font-size: 8px; letter-spacing: var(--ls-wide);
}
.dp-ff-name {
  font-family: var(--font-display); font-size: var(--t-serif-md);
  font-weight: var(--fw-semibold); line-height: var(--lh-snug); color: var(--ink-900);
}
.dp-ff-notes {
  margin-top: 3px; font-size: 10.5px; line-height: var(--lh-snug); color: var(--ink-500);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.dp-ff-pick {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  margin: 11px 12px 0; padding: 6px 10px; cursor: pointer;
  border: 1px solid var(--line-200); border-radius: var(--r-pill);
  background: var(--surface-white); color: var(--ink-400); font-family: inherit;
  font-size: 9px; font-weight: var(--fw-bold);
  letter-spacing: var(--ls-wide); text-transform: uppercase;
  transition: background var(--dur-fast), color var(--dur-fast), border-color var(--dur-fast);
}
.dp-ff-tick {
  width: 14px; height: 14px; flex: 0 0 14px; padding: 1px; border-radius: var(--r-pill);
  border: 1px solid currentColor; fill: none; stroke: currentColor; stroke-width: 2.4;
  stroke-linecap: round; stroke-linejoin: round; opacity: 0; transition: opacity var(--dur-fast);
}
.dp-ff-pick.on { background: var(--espresso-900); border-color: var(--espresso-900); color: var(--on-dark-strong); }
.dp-ff-pick.on .dp-ff-tick { opacity: 1; }

.dp-ff-actions { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 11px 12px 0; }
.dp-ff-price { font-size: var(--t-lead); font-weight: var(--fw-semibold); color: var(--price); transition: color var(--dur-fast); }
.dp-ff-price.multiple { color: var(--gold-700); }
.dp-ff-qty {
  display: inline-flex; align-items: center; gap: 1px;
  border: 1px solid var(--line-200); border-radius: var(--r-pill); padding: 2px;
}
.dp-ff-qty button {
  width: 22px; height: 22px; display: grid; place-items: center;
  border: none; background: none; cursor: pointer; border-radius: var(--r-pill);
  color: var(--ink-700); font-size: 14px; font-family: inherit;
  transition: background var(--dur-fast);
}
.dp-ff-qty button:hover { background: var(--surface-cream); color: var(--gold-700); }
.dp-ff-qty b { min-width: 2ch; text-align: center; font-size: var(--t-xs); font-weight: var(--fw-semibold); }

.dp-ff-buttons { display: flex; gap: 6px; padding: 11px 12px 12px; margin-top: auto; }
.dp-ff-add {
  flex: 1 1 auto; height: 34px; cursor: pointer;
  border: 1px solid var(--ink-900); border-radius: var(--r-pill);
  background: none; color: var(--ink-900); font-family: inherit;
  font-size: 10px; font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-wider); text-transform: uppercase;
  transition: background var(--dur-fast), color var(--dur-fast), border-color var(--dur-fast);
}
.dp-ff-add:hover { background: var(--ink-900); color: var(--on-dark-strong); }
.dp-ff-add.on { background: var(--success); border-color: var(--success); color: var(--on-dark-strong); }
.dp-ff-sheet {
  display: inline-flex; align-items: center; height: 34px; padding: 0 12px;
  border: 1px solid var(--line-200); border-radius: var(--r-pill);
  color: var(--ink-500); text-decoration: none;
  font-size: 10px; font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-wider); text-transform: uppercase;
  transition: border-color var(--dur-fast), color var(--dur-fast);
}
.dp-ff-sheet:hover { border-color: var(--gold-500); color: var(--gold-700); }

/* ── Offres, jauge, combinaisons ── */
.dp-ff-offres { margin-top: 18px; }
.dp-ff-jauge-bar {
  height: 8px; border-radius: var(--r-pill); overflow: hidden;
  background: var(--surface-white); border: 1px solid var(--line-100);
}
.dp-ff-jauge-bar i {
  display: block; height: 100%; background: var(--gradient-gold);
  transition: width var(--dur-slow) var(--ease-out);
}
.dp-ff-jauge.full .dp-ff-jauge-bar i { background: var(--success); }
.dp-ff-jauge-lib {
  display: flex; justify-content: space-between; margin-top: 5px;
  font-size: 9px; font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-wide); text-transform: uppercase; color: var(--ink-400);
}
.dp-ff-jauge-msg { margin: 9px 0 0; font-size: var(--t-sm); color: var(--ink-500); text-align: center; }
.dp-ff-jauge-msg b { color: var(--ink-900); font-weight: var(--fw-semibold); }

.dp-ff-combis { display: grid; gap: 7px; margin-top: 14px; }
.dp-ff-combi {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 10px 13px; cursor: pointer;
  border: 1px solid var(--line-200); border-radius: var(--r-md);
  background: var(--surface-white); color: var(--ink-900); font-family: inherit;
  font-size: var(--t-xs);
  transition: border-color var(--dur-fast), transform var(--dur-fast), box-shadow var(--dur-fast);
}
.dp-ff-combi:hover { border-color: var(--ink-900); transform: translateY(-1px); }
.dp-ff-combi.on { border-color: var(--gold-500); background: var(--surface-cream); box-shadow: 0 0 0 1px var(--gold-500); }
.dp-ff-combi-nums { display: flex; gap: 3px; flex: none; }
.dp-ff-combi-nums i {
  width: 19px; height: 19px; border-radius: var(--r-pill);
  display: grid; place-items: center; font-style: normal;
  background: var(--gold-700); color: var(--surface-white);
  font-size: 10px; font-weight: var(--fw-bold);
}
.dp-ff-combi-lib { font-weight: var(--fw-semibold); letter-spacing: var(--ls-wide); text-transform: uppercase; white-space: nowrap; }
.dp-ff-combi-prix { margin-inline-start: auto; display: flex; align-items: baseline; gap: 7px; white-space: nowrap; }
.dp-ff-combi-prix s { color: var(--price-was); }
.dp-ff-combi-prix b { font-size: var(--t-body); font-weight: var(--fw-bold); }
.dp-ff-combi-prix em {
  font-style: normal; font-size: 10px; font-weight: var(--fw-semibold);
  padding: 2px 7px; border-radius: var(--r-pill);
  background: var(--gold-100); color: var(--gold-900);
}
.dp-ff-combi.max { background: var(--espresso-900); border-color: var(--espresso-900); color: var(--on-dark-strong); }
.dp-ff-combi.max .dp-ff-combi-nums i { background: var(--gold-300); color: var(--espresso-900); }
.dp-ff-combi.max .dp-ff-combi-prix s { color: var(--on-dark-muted); }
.dp-ff-combi.max .dp-ff-combi-prix em { background: var(--gold-300); color: var(--espresso-900); }
.dp-ff-combi.max:hover { border-color: var(--gold-500); }
.dp-ff-combi.max.on { box-shadow: 0 0 0 2px var(--gold-500); }

.dp-ff-ajout {
  display: block; width: 100%; margin-top: 12px; padding: 14px 18px; cursor: pointer;
  border: none; border-radius: var(--r-pill);
  background: var(--gradient-gold); color: var(--espresso-900); font-family: inherit;
  font-size: var(--t-xs); font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-wide); text-transform: uppercase;
  box-shadow: var(--shadow-gold); transition: filter var(--dur-fast);
}
.dp-ff-ajout b { font-weight: var(--fw-bold); font-size: var(--t-body); }
.dp-ff-ajout:hover:not(:disabled) { filter: brightness(1.06); }
.dp-ff-ajout:disabled {
  background: var(--surface-cream-2); color: var(--ink-400);
  box-shadow: none; cursor: not-allowed;
}

/* ── Vol du flacon + toast ── */
.dp-ff-fly {
  position: fixed; z-index: 1210; pointer-events: none;
  border-radius: var(--r-md); box-shadow: var(--shadow-md);
}
.dp-ff-toast {
  position: fixed; inset-block-end: 26px; inset-inline-start: 50%;
  transform: translateX(-50%); z-index: 1200; margin: 0;
  padding: 12px 24px; border-radius: var(--r-pill);
  background: var(--espresso-900); color: var(--gold-300);
  font-size: var(--t-xs); font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-wide); text-transform: uppercase;
  box-shadow: var(--shadow-md);
  animation: dp-ff-fade var(--dur) var(--ease-out);
}

@keyframes dp-ff-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes dp-ff-rise { from { transform: translateY(22px); opacity: .4 } to { transform: none; opacity: 1 } }

/* ── Variante « section de page » ── */
/* Le quiz inline sert exactement le même habillage : on ne neutralise ici que
   ce qui relève de la modale — couche plein écran, centrage, largeur bridée,
   hauteur de viewport, animation d'entrée. La double classe (0,2,0) l'emporte
   sur les regles de base ET sur celles du media portable, quel que soit l'ordre.
   L'ombre passe de shadow-lg (une modale posee sur un voile) a shadow-sm, celle
   des autres cartes de l'accueil ; le rayon reste r-lg, comme les sections
   voisines. */
.dp-ff.is-inline {
  position: static; inset: auto; z-index: auto;
  display: block; padding: 0;
}
.dp-ff.is-inline .dp-ff-panel {
  max-width: none; max-height: none; overflow: visible;
  box-shadow: var(--shadow-sm);
  animation: none;
}
.dp-ff.is-inline .dp-ff-panel.is-result { max-width: none; }

/* ── Écran de fin en deux colonnes ── */
@media (min-width: 900px) {
  .dp-ff-result { grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); gap: clamp(24px, 3vw, 44px); }
  .dp-ff-panel.is-result .dp-ff-intro { text-align: start; }
}
@media (min-width: 1180px) {
  /* La troisième colonne sort les offres de sous les cartes : les deux se
     lisent alors d'un seul regard, comme sur l'écran d'origine.
     display:contents fait remonter les enfants de .dp-ff-reco dans cette
     grille : chaque bloc doit donc être ancré explicitement, ligne ET colonne.
     Sans ancrage, l'auto-placement laissait la colonne de gauche vide et
     renvoyait les cartes sous les offres. */
  .dp-ff-result { grid-template-columns: minmax(0, .7fr) minmax(0, 1.2fr) minmax(0, .9fr); }
  .dp-ff-reco { display: contents; }
  .dp-ff-result-side { grid-column: 1; grid-row: 1 / 3; }
  .dp-ff-reco-title { grid-column: 2; grid-row: 1; align-self: end; }
  .dp-ff-grid { grid-column: 2; grid-row: 2; align-self: start; }
  .dp-ff-offres { grid-column: 3; grid-row: 1 / 3; align-self: start; margin-top: 0; }
}

/* ── Portable ── */
@media (max-width: 760px) {
  .dp-ff { padding: 12px; }
  .dp-ff-panel { max-height: calc(100dvh - 24px); padding: 20px 16px 24px; }
  .dp-ff-opts { flex-wrap: wrap; }
  .dp-ff-opts .dp-ff-opt { flex: 1 1 calc(50% - 10px); }
  .dp-ff-opts.is-gauge { flex-wrap: nowrap; gap: 6px; }
  .dp-ff-opts.is-gauge .dp-ff-opt { flex: 1 1 0; padding: 10px 6px; font-size: 10px; }
  .dp-ff-opts.is-gauge .dp-ff-opt small { display: none; }
  .dp-ff-opts.is-art .dp-ff-opt { min-height: 76px; }
  .dp-ff-grid { gap: 7px; }
  .dp-ff-txt { padding: 8px 8px 0; }
  .dp-ff-name { font-size: var(--t-body); }
  .dp-ff-notes { display: none; }
  .dp-ff-actions { flex-direction: column; align-items: stretch; gap: 5px; padding: 8px 8px 0; }
  .dp-ff-price { text-align: center; font-size: var(--t-body); }
  .dp-ff-qty { justify-content: center; }
  .dp-ff-pick { margin: 8px 8px 0; }
  .dp-ff-pick span { display: none; }
  .dp-ff-buttons { flex-direction: column; padding: 8px; }
  .dp-ff-sheet { justify-content: center; }
  .dp-ff-crit li > button { grid-template-columns: 5.5rem 1fr auto; padding: 8px 10px; }
  .dp-ff-crit li > button i { opacity: 1; }
}
`;
