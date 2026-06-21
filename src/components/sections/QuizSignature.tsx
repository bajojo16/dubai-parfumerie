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

// ── Icônes line-art luxe (remplacent les emoji) ─────────────────────────────────

const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function QuizIcon({ name }: { name: string }) {
  const s = 30;
  const svg = (children: React.ReactNode) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...P}>{children}</svg>
  );
  switch (name) {
    // q1 — pour qui
    case "femme": return svg(<><circle cx="12" cy="8" r="4" /><path d="M12 12v8M8 17h8" /></>);
    case "homme": return svg(<><circle cx="10" cy="14" r="5" /><path d="M14 10l6-6M15 4h5v5" /></>);
    case "couple": return svg(<><circle cx="8" cy="9" r="3" /><circle cx="16" cy="9" r="3" /><path d="M4 20c0-2.5 2-4 4-4M20 20c0-2.5-2-4-4-4" /></>);
    case "cadeau": return svg(<><rect x="4" y="9" width="16" height="11" rx="1" /><path d="M4 13h16M12 9v11M12 9c-1.5-3-5-3-5-1s3.5 1 5 1zM12 9c1.5-3 5-3 5-1s-3.5 1-5 1z" /></>);
    // q2 — saison
    case "printemps": return svg(<><circle cx="12" cy="12" r="3" /><path d="M12 9c0-3 2-4 2-4M12 15c0 3-2 4-2 4M9 12c-3 0-4-2-4-2M15 12c3 0 4 2 4 2" /></>);
    case "été": return svg(<><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>);
    case "automne": return svg(<><path d="M12 3c4 2 5 6 3 10-2 3-5 4-5 4M12 3c-1 4 0 8 2 11" /><path d="M10 21c-3-1-5-4-5-7" /></>);
    case "hiver": return svg(<><path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19M12 6l-2 2 2 2 2-2zM6 12l2-2-2-2M18 12l-2 2 2 2" /></>);
    // q3 — humeur
    case "séducteur": return svg(<path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5.5 6 5.5c2 0 3 1.5 3 1.5h6s1-1.5 3-1.5c3.5 0 5 3.5 3.5 6.5C19 16.5 12 21 12 21z" />);
    case "détendu": return svg(<><path d="M3 13c2 2 4 2 6 0s4-2 6 0 4 2 6 0" /><path d="M3 18c2 2 4 2 6 0s4-2 6 0 4 2 6 0" /></>);
    case "mystérieux": return svg(<path d="M20 13a8 8 0 1 1-9-9 6 6 0 0 0 9 9z" />);
    case "pétillant": return svg(<path d="M13 2L4 14h6l-1 8 9-12h-6z" />);
    // q4 — note
    case "oud": return svg(<><path d="M12 3c-1 4-4 5-4 9a4 4 0 0 0 8 0c0-4-3-5-4-9z" /><path d="M12 21v-9" /></>);
    case "musc": return svg(<><path d="M12 4c3 1 5 4 5 7a5 5 0 0 1-10 0c0-1 .3-2 .8-3" /><circle cx="12" cy="12" r="1.4" /></>);
    case "ambre": return svg(<><path d="M12 2l2.4 5.4L20 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.6-.6z" /></>);
    case "rose": return svg(<><path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /><path d="M9 8c-3 0-4 2-4 4 3 0 4-1 4-1M15 8c3 0 4 2 4 4-3 0-4-1-4-1M12 11v10" /></>);
    // q5 — intensité
    case "légère": return svg(<path d="M3 8h12a2.5 2.5 0 1 0-2.5-2.5M3 12h16a2.5 2.5 0 1 1-2.5 2.5M3 16h9" />);
    case "discrète": return svg(<><path d="M4 12h4l3-5 2 10 3-5h4" /></>);
    case "affirmée": return svg(<path d="M12 2l2.4 5.4L20 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.6-.6z" />);
    case "puissante": return svg(<><path d="M3 12h3M18 12h3M12 3v3M12 18v3" /><path d="M7 7l2 2M17 7l-2 2M7 17l2-2M17 17l-2-2" /><circle cx="12" cy="12" r="3" /></>);
    default: return svg(<circle cx="12" cy="12" r="6" />);
  }
}

// ── Questions data ─────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    key: 'q1' as const,
    label: 'Pour qui cherchez-vous ?',
    hint: 'Le point de départ de votre signature.',
    options: [
      { value: 'femme', label: 'Pour elle' },
      { value: 'homme', label: 'Pour lui' },
      { value: 'couple', label: 'En couple' },
      { value: 'cadeau', label: 'Un cadeau' },
    ],
  },
  {
    key: 'q2' as const,
    label: 'Pour quelle saison ?',
    hint: 'Chaque saison appelle des accords différents.',
    options: [
      { value: 'printemps', label: 'Printemps' },
      { value: 'été', label: 'Été' },
      { value: 'automne', label: 'Automne' },
      { value: 'hiver', label: 'Hiver' },
    ],
  },
  {
    key: 'q3' as const,
    label: 'Quelle humeur incarner ?',
    hint: 'Le caractère que doit révéler votre parfum.',
    options: [
      { value: 'séducteur', label: 'Séducteur' },
      { value: 'détendu', label: 'Détendu' },
      { value: 'mystérieux', label: 'Mystérieux' },
      { value: 'pétillant', label: 'Pétillant' },
    ],
  },
  {
    key: 'q4' as const,
    label: 'Quelle note vous attire ?',
    hint: 'Le cœur de la composition.',
    options: [
      { value: 'oud', label: 'Oud' },
      { value: 'musc', label: 'Musc' },
      { value: 'ambre', label: 'Ambre' },
      { value: 'rose', label: 'Rose' },
    ],
  },
  {
    key: 'q5' as const,
    label: 'Quelle intensité de sillage ?',
    hint: 'La présence que vous souhaitez laisser.',
    options: [
      { value: 'légère', label: 'Légère brise' },
      { value: 'discrète', label: 'Présence discrète' },
      { value: 'affirmée', label: 'Signature affirmée' },
      { value: 'puissante', label: 'Sillage puissant' },
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
  const progress = step < QUESTIONS.length ? (step / QUESTIONS.length) * 100 : 100;

  function selectOption(value: string) {
    setSelected(value);
  }

  function back() {
    if (step === 0) return;
    const prevStep = step - 1;
    setStep(prevStep);
    setSelected(answers[QUESTIONS[prevStep].key] ?? null);
  }

  async function next() {
    if (!selected) return;
    const key = currentQ.key;
    const newAnswers = { ...answers, [key]: selected };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      setSelected(newAnswers[QUESTIONS[nextStep].key] ?? null);
    } else {
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
        setStep(6);
      } catch {
        setError('Une erreur est survenue. Veuillez réessayer.');
        setStep(4);
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
      <div style={styles.card}>
        <div style={styles.loadingWrap}>
          <div style={styles.loadingSpinner} />
          <p style={styles.loadingText}>Création de votre signature olfactive…</p>
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
      <div style={styles.card}>
        <div style={styles.profileHeader}>
          <div style={styles.profileBadge}>
            <svg width="26" height="26" viewBox="0 0 24 24" {...P} stroke="var(--gold-500)"><path d="M12 2l2.4 5.4L20 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.6-.6z" /></svg>
          </div>
          <div style={styles.eyebrow}>Votre profil olfactif</div>
          <h2 style={styles.profileName}>{result.profile}</h2>
          <p style={styles.profileDesc}>{result.description}</p>
        </div>

        <div style={styles.productsGrid}>
          {result.products.map((product, i) => (
            <div key={product.slug ?? i} style={styles.productCard}>
              <div style={styles.productImageWrap}>
                {product.image ? (
                  <img src={product.image} alt={product.name ?? ''} style={styles.productImage}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <span style={{ color: 'var(--gold-500)' }}><QuizIcon name="rose" /></span>
                )}
              </div>
              <div style={styles.productInfo}>
                <div style={styles.productBrand}>{product.brand}</div>
                <div style={styles.productName}>{product.name}</div>
                <div style={styles.productPrice}>{product.price?.toFixed(2)}€</div>
                <div style={styles.productWhy}>
                  <span style={styles.productWhyLabel}>Pourquoi ce parfum</span>
                  <span style={styles.productWhyText}>{product.why}</span>
                </div>
                <button style={styles.addToCartBtn}
                  onClick={() => window.dispatchEvent(new CustomEvent('dp:add-to-cart', { detail: { slug: product.slug, name: product.name, price: product.price } }))}>
                  Ajouter au panier
                </button>
              </div>
            </div>
          ))}
        </div>

        <button style={styles.restartBtn} onClick={restart}>↩ Recommencer le quiz</button>
      </div>
    );
  }

  // ── Question step ──
  return (
    <div style={styles.card}>
      {/* Step indicator + progress */}
      <div style={styles.topRow}>
        <span style={styles.stepLabel}>Question {step + 1} <span style={{ color: 'var(--ink-300)' }}>/ {QUESTIONS.length}</span></span>
        <div style={styles.dots}>
          {QUESTIONS.map((_, i) => (
            <span key={i} style={{ ...styles.dot, ...(i <= step ? styles.dotActive : {}) }} />
          ))}
        </div>
      </div>
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div style={styles.qHead}>
        <h2 style={styles.questionLabel}>{currentQ.label}</h2>
        <p style={styles.questionHint}>{currentQ.hint}</p>
      </div>

      {error && <p style={styles.errorMsg}>{error}</p>}

      {/* Options */}
      <div style={styles.optionsGrid}>
        {currentQ.options.map(opt => {
          const isSel = selected === opt.value;
          return (
            <button key={opt.value} onClick={() => selectOption(opt.value)}
              style={{ ...styles.optionCard, ...(isSel ? styles.optionCardSelected : {}) }}>
              {isSel && (
                <span style={styles.checkBadge}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11" /></svg>
                </span>
              )}
              <span style={{ ...styles.optionIcon, color: isSel ? 'var(--gold-600)' : 'var(--ink-500)' }}>
                <QuizIcon name={opt.value} />
              </span>
              <span style={{ ...styles.optionLabel, color: isSel ? 'var(--ink-900)' : 'var(--ink-700)' }}>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer buttons */}
      <div style={styles.footer}>
        <button onClick={back} disabled={step === 0}
          style={{ ...styles.backBtn, ...(step === 0 ? styles.backBtnDisabled : {}) }}>
          ← Retour
        </button>
        <button onClick={next} disabled={!selected}
          style={{ ...styles.nextBtn, ...(!selected ? styles.nextBtnDisabled : {}) }}>
          {step < QUESTIONS.length - 1 ? 'Continuer' : 'Révéler ma signature'}
        </button>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  card: {
    maxWidth: 600,
    margin: '0 auto',
    padding: '36px 36px 32px',
    background: 'var(--surface-white)',
    border: '1px solid var(--line-200)',
    borderRadius: 'var(--r-xl, 24px)',
    boxShadow: '0 24px 60px rgba(21,16,11,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 22,
  },

  // Top
  topRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  stepLabel: {
    fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 600,
    letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-600)',
  },
  dots: { display: 'flex', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--line-200)', transition: 'background .3s, transform .3s' },
  dotActive: { background: 'var(--gold-500)', transform: 'scale(1.15)' },

  progressTrack: { height: 4, borderRadius: 999, background: 'var(--line-100)', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #9C6A1A, #D8A63A)', borderRadius: 999, transition: 'width 0.45s cubic-bezier(.4,0,.2,1)' },

  // Question head
  qHead: { textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 },
  questionLabel: { fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.9rem', color: 'var(--ink-900)', margin: 0, lineHeight: 1.15 },
  questionHint: { fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: '0.9rem', color: 'var(--ink-500)', margin: 0 },

  // Options
  optionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 },
  optionCard: {
    position: 'relative',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    padding: '24px 16px',
    background: 'var(--surface-page)',
    border: '1.5px solid var(--line-200)',
    borderRadius: 'var(--r-lg)',
    cursor: 'pointer',
    transition: 'border-color .2s, background .2s, transform .15s, box-shadow .2s',
    fontFamily: 'var(--font-sans)',
  },
  optionCardSelected: {
    borderColor: 'var(--gold-500)',
    background: 'var(--surface-white)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(200,144,30,0.16)',
  },
  checkBadge: {
    position: 'absolute', top: 10, right: 10,
    width: 18, height: 18, borderRadius: '50%', background: 'var(--gold-500)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  optionIcon: { display: 'flex', transition: 'color .2s' },
  optionLabel: { fontSize: '0.9rem', fontWeight: 500, textAlign: 'center', transition: 'color .2s' },

  // Footer
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 4 },
  backBtn: {
    background: 'transparent', color: 'var(--ink-500)', border: 'none',
    fontFamily: 'var(--font-sans)', fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer',
    padding: '10px 6px',
  },
  backBtnDisabled: { opacity: 0, pointerEvents: 'none' },
  nextBtn: {
    background: 'var(--gold-500)', color: 'var(--espresso-900)', border: 'none',
    borderRadius: 'var(--r-md)', padding: '14px 30px',
    fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 700,
    letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(200,144,30,0.28)', transition: 'opacity .2s, transform .15s',
  },
  nextBtnDisabled: { opacity: 0.35, cursor: 'not-allowed', boxShadow: 'none' },

  // Loading
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: '50px 0' },
  loadingSpinner: { width: 48, height: 48, border: '3px solid var(--line-200)', borderTop: '3px solid var(--gold-500)', borderRadius: '50%', animation: 'dp-spin 0.9s linear infinite' },
  loadingText: { fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: 'var(--ink-600)', textAlign: 'center', margin: 0 },

  // Results
  eyebrow: { fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-600)' },
  profileHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' },
  profileBadge: { width: 56, height: 56, borderRadius: '50%', background: 'var(--surface-cream)', border: '1px solid var(--line-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  profileName: { fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '2rem', color: 'var(--espresso-900)', margin: 0 },
  profileDesc: { fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: '0.95rem', color: 'var(--ink-600)', lineHeight: 1.6, maxWidth: 460, margin: 0 },

  productsGrid: { display: 'flex', flexDirection: 'column', gap: 14 },
  productCard: { display: 'flex', gap: 16, background: 'var(--surface-page)', borderRadius: 'var(--r-lg)', border: '1px solid var(--line-200)', overflow: 'hidden', padding: 14, alignItems: 'flex-start' },
  productImageWrap: { flexShrink: 0, width: 80, height: 100, background: 'var(--surface-cream)', borderRadius: 'var(--r-sm)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  productImage: { width: '100%', height: '100%', objectFit: 'cover' },
  productInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  productBrand: { fontFamily: 'var(--font-sans)', fontSize: '0.66rem', color: 'var(--gold-600)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' },
  productName: { fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--ink-900)' },
  productPrice: { fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--gold-700)' },
  productWhy: { display: 'flex', flexDirection: 'column', gap: 2, marginTop: 6, padding: '8px 10px', background: 'var(--surface-white)', borderRadius: 'var(--r-sm)', borderLeft: '3px solid var(--gold-500)' },
  productWhyLabel: { fontFamily: 'var(--font-sans)', fontSize: '0.62rem', color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.1em' },
  productWhyText: { fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--ink-700)', lineHeight: 1.4 },
  addToCartBtn: { marginTop: 8, background: 'var(--espresso-900)', color: '#fff', border: 'none', borderRadius: 'var(--r-sm)', padding: '9px 14px', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start', letterSpacing: '0.04em' },

  restartBtn: { background: 'transparent', color: 'var(--ink-500)', border: '1px solid var(--line-200)', borderRadius: 'var(--r-md)', padding: '11px 20px', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', cursor: 'pointer', alignSelf: 'center' },

  errorMsg: { fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: '#c0392b', background: '#fdf0ef', border: '1px solid #f5c6c2', borderRadius: 'var(--r-sm)', padding: '10px 14px', textAlign: 'center', margin: 0 },
};
