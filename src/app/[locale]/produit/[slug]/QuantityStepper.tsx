"use client";

/**
 * Sélecteur de quantité − / n / +, borné 1..10.
 *
 * Extrait d'`AddToCart` parce que le tiroir mobile (`MobileBuyBar`) en a besoin
 * aussi : deux copies du même stepper auraient fini par diverger d'un pixel.
 * Hauteur paramétrable : 48 px dans la colonne, 44 px dans le tiroir.
 */
export default function QuantityStepper({
  value,
  onChange,
  height = 48,
}: {
  value: number;
  onChange: (n: number) => void;
  height?: number;
}) {
  const decrement = () => onChange(Math.max(1, value - 1));
  const increment = () => onChange(Math.min(10, value + 1));

  const btn = (disabled: boolean): React.CSSProperties => ({
    width: "38px",
    height,
    border: "none",
    background: "transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    color: disabled ? "var(--ink-400)" : "var(--ink-700)",
    fontSize: "1.25rem",
    fontFamily: "var(--font-sans)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color var(--dur-fast)",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid var(--line-200)",
        borderRadius: "var(--r-sm)",
        overflow: "hidden",
        flexShrink: 0,
        background: "var(--surface-white)",
      }}
    >
      <button type="button" onClick={decrement} disabled={value <= 1} aria-label="Diminuer la quantité" style={btn(value <= 1)}>
        −
      </button>
      <span
        style={{
          width: "36px",
          textAlign: "center",
          fontFamily: "var(--font-sans)",
          fontWeight: "var(--fw-medium)",
          fontSize: "var(--t-body)",
          color: "var(--ink-900)",
          borderLeft: "1px solid var(--line-100)",
          borderRight: "1px solid var(--line-100)",
          lineHeight: `${height}px`,
        }}
        aria-live="polite"
      >
        {value}
      </span>
      <button type="button" onClick={increment} disabled={value >= 10} aria-label="Augmenter la quantité" style={btn(value >= 10)}>
        +
      </button>
    </div>
  );
}
