"use client";

import { useState } from "react";

interface AddToCartProps {
  productName: string;
  price: number;
}

export default function AddToCart({ productName, price }: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const [sampleAdded, setSampleAdded] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);

  const handleAddToCart = () => {
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
  };

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => Math.min(10, q + 1));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Sample option */}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--t-sm)",
          color: "var(--ink-700)",
        }}
      >
        <span
          onClick={() => setSampleAdded((v) => !v)}
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "var(--r-xs)",
            border: sampleAdded
              ? "1.5px solid var(--gold-500)"
              : "1.5px solid var(--line-300)",
            background: sampleAdded ? "var(--gold-100)" : "var(--surface-white)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "border-color var(--dur-fast), background var(--dur-fast)",
            cursor: "pointer",
          }}
          role="checkbox"
          aria-checked={sampleAdded}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") setSampleAdded((v) => !v);
          }}
        >
          {sampleAdded && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path
                d="M1 4L3.8 7L9 1"
                stroke="var(--gold-700)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span>
          Ajouter un échantillon 2ml{" "}
          <span style={{ color: "var(--ink-500)" }}>(+1,90 €)</span>
        </span>
      </label>

      {/* Quantity + Add to cart row */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        {/* Quantity stepper */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid var(--line-200)",
            borderRadius: "var(--r-sm)",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <button
            onClick={decrement}
            disabled={quantity <= 1}
            aria-label="Diminuer la quantité"
            style={{
              width: "38px",
              height: "48px",
              border: "none",
              background: "transparent",
              cursor: quantity <= 1 ? "not-allowed" : "pointer",
              color: quantity <= 1 ? "var(--ink-400)" : "var(--ink-700)",
              fontSize: "1.25rem",
              fontFamily: "var(--font-sans)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color var(--dur-fast)",
            }}
          >
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
              lineHeight: "48px",
            }}
          >
            {quantity}
          </span>
          <button
            onClick={increment}
            disabled={quantity >= 10}
            aria-label="Augmenter la quantité"
            style={{
              width: "38px",
              height: "48px",
              border: "none",
              background: "transparent",
              cursor: quantity >= 10 ? "not-allowed" : "pointer",
              color: quantity >= 10 ? "var(--ink-400)" : "var(--ink-700)",
              fontSize: "1.25rem",
              fontFamily: "var(--font-sans)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color var(--dur-fast)",
            }}
          >
            +
          </button>
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          style={{
            flex: 1,
            height: "48px",
            background: cartAdded
              ? "var(--gold-700)"
              : "linear-gradient(100deg, #9C6A1A 0%, #C8901E 50%, #D8A63A 100%)",
            color: "var(--espresso-900)",
            border: "none",
            borderRadius: "var(--r-sm)",
            fontFamily: "var(--font-sans)",
            fontWeight: "var(--fw-semibold)",
            fontSize: "var(--t-body)",
            letterSpacing: "var(--ls-wide)",
            textTransform: "uppercase",
            cursor: "pointer",
            boxShadow: "var(--shadow-gold)",
            transition: "background var(--dur-fast) var(--ease-out), transform var(--dur-fast)",
            transform: cartAdded ? "scale(0.98)" : "scale(1)",
          }}
          aria-label={`Ajouter ${productName} au panier`}
        >
          {cartAdded ? "✓ Ajouté !" : "Ajouter au panier"}
        </button>
      </div>

      {/* 1-click buy */}
      <button
        style={{
          width: "100%",
          height: "44px",
          background: "transparent",
          color: "var(--ink-700)",
          border: "1.5px solid var(--line-200)",
          borderRadius: "var(--r-sm)",
          fontFamily: "var(--font-sans)",
          fontWeight: "var(--fw-medium)",
          fontSize: "var(--t-sm)",
          letterSpacing: "var(--ls-wide)",
          textTransform: "uppercase",
          cursor: "pointer",
          transition:
            "border-color var(--dur-fast), color var(--dur-fast), background var(--dur-fast)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--gold-400)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--gold-700)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line-200)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-700)";
        }}
      >
        Acheter en 1 clic
      </button>

      {/* Installments info */}
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--t-xs)",
          color: "var(--ink-400)",
          textAlign: "center",
          margin: 0,
        }}
      >
        Total avec échantillon :{" "}
        <strong style={{ color: "var(--ink-700)" }}>
          {sampleAdded
            ? `${((price * quantity + 1.9)).toFixed(2).replace(".", ",")} €`
            : `${(price * quantity).toFixed(2).replace(".", ",")} €`}
        </strong>
      </p>
    </div>
  );
}
