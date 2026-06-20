"use client";
import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface QuizAnswers {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
}

interface RecommendedProduct {
  id?: number;
  slug?: string;
  name?: string;
  brand?: string;
  price?: number;
  image?: string;
  families?: string[];
  gender?: string;
  intensity?: string;
  why: string;
}

interface QuizResult {
  profile: string;
  description: string;
  products: RecommendedProduct[];
}

// ── Questions data ─────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    key: 'q1' as const,
    label: 'Pour qui ?',
    options: [
      { value: 'femme', emoji: '👩', label: 'Moi (femme)' },
      { value: 'homme', emoji: '👨', label: 'Moi (homme)' },
      { value: 'couple', emoji: '💑', label: 'En couple' },
      { value: 'cadeau', emoji: '🎁', label: 'Cadeau' },
    ],
  },
  {
    key: 'q2' as const,
    label: 'Quelle saison ?',
    options: [
      { value: 'printemps', emoji: '🌸', label: 'Printemps' },
      { value: 'été', emoji: '☀️', label: 'Été' },
      { value: 'automne', emoji: '🍂', label: 'Automne' },
      { value: 'hiver', emoji: '❄️', label: 'Hiver' },
    ],
  },
  {
    key: 'q3' as const,
    label: 'Quelle humeur ?',
    options: [
      { value: 'séducteur', emoji: '🔥', label: 'Séducteur' },
      { value: 'détendu', emoji: '🌊', label: 'Détendu' },
      { value: 'mystérieux', emoji: '🌙', label: 'Mystérieux' },
      { value: 'pétillant', emoji: '⚡', label: 'Pétillant' },
    ],
  },
  {
    key: 'q4' as const,
    label: 'Quelle note ?',
    options: [
      { value: 'oud', emoji: '🌳', label: 'Oud' },
      { value: 'musc', emoji: '🕊', label: 'Musc' },
      { value: 'ambre', emoji: '🌟', label: 'Ambre' },
      { value: 'rose', emoji: '🌹', label: 'Rose' },
    ],
  },
  {
    key: 'q5' as const,
    label: 'Quelle intensité ?',
    options: [
      { value: 'légère', emoji: '💨', label: 'Légère brise' },
      { value: 'discrète', emoji: '🌿', label: 'Présence discrète' },
      { value: 'affirmée', emoji: '💎', label: 'Signature affirmée' },
      { value: 'puissante', emoji: '🌪', label: 'Sillage puissant' },
    ],
  },
];

// ── Component ──────────────────────────────────────────────────────────────────

export function QuizSignature() {
  const [step, setStep] = useState(0); // 0-4 = questions, 5 = loading, 6 = results
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentQ = QUESTIONS[step];
  const progress = step < QUESTIONS.length ? ((step) / QUESTIONS.length) * 100 : 100;

  function selectOption(value: string) {
    setSelected(value);
  }

  async function next() {
    if (!selected) return;
    const key = currentQ.key;
    const newAnswers = { ...answers, [key]: selected };
    setAnswers(newAnswers);
    setSelected(null);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // Last question — submit
      setStep(5); // loading
      setError(null);
      try {
        const res = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: newAnswers }),
        });
        if (!res.ok) throw new Error('Erreur serveur');
        const data: QuizResult = await res.json();
        setResult(data);
        setStep(6); // results
      } catch {
        setError('Une erreur est survenue. Veuillez réessayer.');
        setStep(4); // back to last question
        setAnswers(prev => ({ ...prev }));
      }
    }
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setSelected(null);
    setResult(null);
    setError(null);
  }

  // ── Loading ──
  if (step === 5) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingWrap}>
          <div style={styles.loadingSpinner} />
          <p style={styles.loadingText}>Votre signature olfactive est en cours de création…</p>
          <p style={{ ...styles.loadingText, fontSize: '0.8rem', color: 'var(--ink-400)' }}>
            Notre parfumeur analyse vos préférences
          </p>
        </div>
      </div>
    );
  }

  // ── Results ──
  if (step === 6 && result) {
    return (
      <div style={styles.container}>
        {/* Profile header */}
        <div style={styles.profileHeader}>
          <div style={styles.profileBadge}>✨</div>
          <h2 style={styles.profileName}>{result.profile}</h2>
          <p style={styles.profileDesc}>{result.description}</p>
        </div>

        {/* Product cards */}
        <div style={styles.productsGrid}>
          {result.products.map((product, i) => (
            <div key={product.slug ?? i} style={styles.productCard}>
              {/* Image placeholder */}
              <div style={styles.productImageWrap}>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name ?? ''}
                    style={styles.productImage}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div style={styles.productImagePlaceholder}>🌹</div>
                )}
              </div>

              <div style={styles.productInfo}>
                <div style={styles.productBrand}>{product.brand}</div>
                <div style={styles.productName}>{product.name}</div>
                <div style={styles.productPrice}>{product.price?.toFixed(2)}€</div>

                {/* Why this product */}
                <div style={styles.productWhy}>
                  <span style={styles.productWhyLabel}>Pourquoi ce parfum</span>
                  <span style={styles.productWhyText}>{product.why}</span>
                </div>

                <button
                  style={styles.addToCartBtn}
                  onClick={() => {
                    // Cart integration hook — dispatch custom event for cart system to pick up
                    window.dispatchEvent(new CustomEvent('dp:add-to-cart', { detail: { slug: product.slug, name: product.name, price: product.price } }));
                  }}
                >
                  Ajouter au panier
                </button>
              </div>
            </div>
          ))}
        </div>

        <button style={styles.restartBtn} onClick={restart}>
          ↩ Recommencer le quiz
        </button>
      </div>
    );
  }

  // ── Question step ──
  return (
    <div style={styles.container}>
      {/* Progress bar */}
      <div style={styles.progressWrap}>
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
        <span style={styles.progressLabel}>{step + 1} / {QUESTIONS.length}</span>
      </div>

      {/* Question */}
      <h2 style={styles.questionLabel}>{currentQ.label}</h2>

      {error && <p style={styles.errorMsg}>{error}</p>}

      {/* Options grid */}
      <div style={styles.optionsGrid}>
        {currentQ.options.map(opt => (
          <button
            key={opt.value}
            onClick={() => selectOption(opt.value)}
            style={{
              ...styles.optionCard,
              ...(selected === opt.value ? styles.optionCardSelected : {}),
            }}
          >
            <span style={styles.optionEmoji}>{opt.emoji}</span>
            <span style={styles.optionLabel}>{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={next}
        disabled={!selected}
        style={{
          ...styles.nextBtn,
          ...(!selected ? styles.nextBtnDisabled : {}),
        }}
      >
        {step < QUESTIONS.length - 1 ? 'Suivant →' : 'Découvrir ma signature ✨'}
      </button>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 640,
    margin: '0 auto',
    padding: '32px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 28,
  },

  // Progress
  progressWrap: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    background: 'var(--line-200)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'var(--gold-500)',
    borderRadius: 999,
    transition: 'width 0.4s ease',
  },
  progressLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.75rem',
    color: 'var(--ink-400)',
    whiteSpace: 'nowrap',
  },

  // Question
  questionLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.75rem',
    color: 'var(--ink-900)',
    textAlign: 'center',
    margin: 0,
  },

  // Options
  optionsGrid: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
  },
  optionCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    padding: '22px 16px',
    background: 'var(--surface-cream)',
    border: '2px solid var(--line-200)',
    borderRadius: 'var(--r-lg)',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s, transform 0.15s',
    fontFamily: 'var(--font-sans)',
  },
  optionCardSelected: {
    borderColor: 'var(--gold-500)',
    background: 'var(--surface-white)',
    transform: 'scale(1.02)',
    boxShadow: '0 4px 16px rgba(200,144,30,0.18)',
  },
  optionEmoji: {
    fontSize: '2rem',
    lineHeight: 1,
  },
  optionLabel: {
    fontSize: '0.875rem',
    color: 'var(--ink-700)',
    fontWeight: 500,
    textAlign: 'center',
  },

  // Next button
  nextBtn: {
    background: 'var(--gold-500)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--r-md)',
    padding: '14px 32px',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    letterSpacing: '0.02em',
  },
  nextBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },

  // Loading
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 18,
    padding: '60px 0',
  },
  loadingSpinner: {
    width: 48,
    height: 48,
    border: '3px solid var(--line-200)',
    borderTop: '3px solid var(--gold-500)',
    borderRadius: '50%',
    animation: 'dp-spin 0.9s linear infinite',
  },
  loadingText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    color: 'var(--ink-600)',
    textAlign: 'center',
    margin: 0,
  },

  // Results — profile
  profileHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    textAlign: 'center',
  },
  profileBadge: {
    fontSize: '2.5rem',
    lineHeight: 1,
  },
  profileName: {
    fontFamily: 'var(--font-display)',
    fontSize: '2rem',
    color: 'var(--espresso-900)',
    margin: 0,
  },
  profileDesc: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    color: 'var(--ink-600)',
    lineHeight: 1.6,
    maxWidth: 480,
    margin: 0,
  },

  // Results — products
  productsGrid: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  productCard: {
    display: 'flex',
    gap: 16,
    background: 'var(--surface-cream)',
    borderRadius: 'var(--r-lg)',
    border: '1px solid var(--line-200)',
    overflow: 'hidden',
    padding: 16,
    alignItems: 'flex-start',
  },
  productImageWrap: {
    flexShrink: 0,
    width: 80,
    height: 100,
    background: 'var(--line-100)',
    borderRadius: 'var(--r-sm)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  productImagePlaceholder: {
    fontSize: '2rem',
  },
  productInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  productBrand: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.7rem',
    color: 'var(--gold-600, var(--gold-500))',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  productName: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.05rem',
    color: 'var(--ink-900)',
  },
  productPrice: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    fontWeight: 700,
    color: 'var(--espresso-900)',
  },
  productWhy: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    marginTop: 4,
    padding: '8px 10px',
    background: 'var(--surface-white)',
    borderRadius: 'var(--r-sm)',
    borderLeft: '3px solid var(--gold-500)',
  },
  productWhyLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.65rem',
    color: 'var(--ink-400)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  productWhyText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.82rem',
    color: 'var(--ink-700)',
    lineHeight: 1.4,
  },
  addToCartBtn: {
    marginTop: 8,
    background: 'var(--espresso-900)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--r-sm)',
    padding: '9px 14px',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    alignSelf: 'flex-start',
    letterSpacing: '0.02em',
  },

  // Restart
  restartBtn: {
    background: 'transparent',
    color: 'var(--ink-500)',
    border: '1px solid var(--line-200)',
    borderRadius: 'var(--r-sm)',
    padding: '10px 20px',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },

  // Error
  errorMsg: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#c0392b',
    background: '#fdf0ef',
    border: '1px solid #f5c6c2',
    borderRadius: 'var(--r-sm)',
    padding: '10px 14px',
    width: '100%',
    textAlign: 'center',
    margin: 0,
  },
};
