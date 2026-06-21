"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const PROMO_PRODUCTS = [
  { id: 1, name: "Lattafa Oud Pour Elle", brand: "Lattafa", price: 18.90, oldPrice: 84.90, discount: 77, category: "Femme", image: "prod-1.jpg" },
  { id: 2, name: "Al Haramain Amber Oud", brand: "Al Haramain", price: 29.90, oldPrice: 85.90, discount: 65, category: "Mixte", image: "prod-2.jpg" },
  { id: 3, name: "Reef Opulent Blue", brand: "Reef", price: 24.90, oldPrice: 49.90, discount: 50, category: "Homme", image: "prod-3.jpg" },
  { id: 4, name: "Armaf Club de Nuit", brand: "Armaf", price: 19.90, oldPrice: 33.90, discount: 41, category: "Homme", image: "prod-4.jpg" },
  { id: 5, name: "Swiss Arabian Shaghaf", brand: "Swiss Arabian", price: 22.90, oldPrice: 57.90, discount: 60, category: "Femme", image: "prod-5.jpg" },
  { id: 6, name: "Khadlaj Hareem Al Sultan", brand: "Khadlaj", price: 15.90, oldPrice: 39.90, discount: 60, category: "Femme", image: "prod-6.jpg" },
  { id: 7, name: "Gulf Orchid Rose Oud", brand: "Gulf Orchid", price: 17.90, oldPrice: 44.90, discount: 60, category: "Mixte", image: "prod-1.jpg" },
  { id: 8, name: "Surrati Black Oud", brand: "Surrati", price: 21.90, oldPrice: 54.90, discount: 60, category: "Homme", image: "prod-2.jpg" },
];

const FILTERS = ["Tous", "Femme", "Homme", "Mixte", "Huile de Parfum"];

function useCountdown(totalSeconds: number) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  return {
    hh: String(hours).padStart(2, "0"),
    mm: String(minutes).padStart(2, "0"),
    ss: String(seconds).padStart(2, "0"),
  };
}

export default function PromoFlashPage() {
  const [activeFilter, setActiveFilter] = useState("Tous");
  const { hh, mm, ss } = useCountdown(86399); // 23:59:59

  const filteredProducts =
    activeFilter === "Tous" || activeFilter === "Huile de Parfum"
      ? PROMO_PRODUCTS
      : PROMO_PRODUCTS.filter((p) => p.category === activeFilter);

  return (
    <>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }
        .pulse-dot {
          animation: pulse-dot 1.2s ease-in-out infinite;
        }
        .promo-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        @media (max-width: 900px) {
          .promo-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .promo-grid {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
        }
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.14);
        }
        .add-to-cart-btn:hover {
          background: var(--gold-700);
        }
        .filter-pill:hover {
          border-color: var(--gold-500);
          color: var(--gold-500);
        }
      `}</style>

      <main style={{ fontFamily: "var(--font-sans)", background: "var(--surface-page)", minHeight: "100vh" }}>

        {/* PAGE HEADER */}
        <section
          style={{
            background: "var(--espresso-900)",
            textAlign: "center",
            padding: "60px 24px",
          }}
        >
          {/* Badge row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
            <span
              className="pulse-dot"
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#E53E3E",
              }}
            />
            <span
              style={{
                color: "#E53E3E",
                fontFamily: "var(--font-sans)",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Promo Flash
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--on-dark-strong)",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 600,
              margin: "0 0 14px",
              lineHeight: 1.15,
            }}
          >
            Offres Exceptionnelles
          </h1>

          <p
            style={{
              color: "var(--on-dark-muted)",
              fontSize: 16,
              margin: "0 0 44px",
              letterSpacing: "0.04em",
            }}
          >
            Des parfums de luxe à un prix séduisant · Stocks limités
          </p>

          {/* Countdown */}
          <div>
            <p
              style={{
                color: "var(--on-dark-muted)",
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              L&apos;offre se termine dans
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {[hh, mm, ss].map((unit, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      background: "var(--espresso-800)",
                      border: "1px solid var(--espresso-700)",
                      borderRadius: "var(--r-md)",
                      padding: "14px 20px",
                      minWidth: 72,
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontWeight: 700,
                        fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                        color: "var(--gold-400)",
                        letterSpacing: "0.06em",
                        lineHeight: 1,
                      }}
                    >
                      {unit}
                    </span>
                  </div>
                  {i < 2 && (
                    <span style={{ color: "var(--gold-400)", fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>
                      :
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FILTER PILLS */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            background: "var(--surface-white)",
            borderBottom: "1px solid #EDE8DF",
            padding: "14px 24px",
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                className={isActive ? undefined : "filter-pill"}
                onClick={() => setActiveFilter(filter)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 999,
                  border: isActive ? "1.5px solid var(--gold-500)" : "1.5px solid var(--ink-400)",
                  background: isActive ? "var(--gold-500)" : "var(--surface-white)",
                  color: isActive ? "#fff" : "var(--ink-700)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* PRODUCT GRID */}
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px" }}>
          <div className="promo-grid">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="product-card"
                style={{
                  background: "var(--surface-white)",
                  borderRadius: "var(--r-lg)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                  transition: "transform 0.22s ease, box-shadow 0.22s ease",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Image container */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <Image
                    src={`/assets/${product.image}`}
                    alt={product.name}
                    width={300}
                    height={320}
                    style={{ objectFit: "cover", width: "100%", height: 260, display: "block" }}
                  />

                  {/* Discount badge top-left */}
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      background: "#E53E3E",
                      color: "#fff",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 700,
                      fontSize: 13,
                      padding: "4px 10px",
                      borderRadius: "var(--r-sm)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    -{product.discount}%
                  </span>

                  {/* Stock limité badge top-right */}
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: "var(--espresso-900)",
                      color: "var(--gold-300)",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 500,
                      fontSize: 11,
                      padding: "4px 9px",
                      borderRadius: "var(--r-sm)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Stock limité
                  </span>
                </div>

                {/* Card body */}
                <div
                  style={{
                    padding: "16px 18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      color: "var(--gold-500)",
                      fontFamily: "var(--font-sans)",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    {product.brand}
                  </span>

                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--ink-900)",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {product.name}
                  </h2>

                  {/* Price row */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
                    <span
                      style={{
                        color: "#E53E3E",
                        fontFamily: "var(--font-sans)",
                        fontWeight: 700,
                        fontSize: "1.35rem",
                      }}
                    >
                      {product.price.toFixed(2)} €
                    </span>
                    <span
                      style={{
                        color: "var(--ink-400)",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.9rem",
                        textDecoration: "line-through",
                      }}
                    >
                      {product.oldPrice.toFixed(2)} €
                    </span>
                  </div>

                  {/* Add to cart button */}
                  <button
                    className="add-to-cart-btn"
                    style={{
                      marginTop: "auto",
                      paddingTop: 12,
                      display: "block",
                      width: "100%",
                      padding: "11px 0",
                      background: "var(--gold-500)",
                      color: "#fff",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 600,
                      fontSize: 14,
                      letterSpacing: "0.06em",
                      border: "none",
                      borderRadius: "var(--r-md)",
                      cursor: "pointer",
                      transition: "background 0.18s ease",
                    }}
                  >
                    Ajouter au panier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM BANNER */}
        <section
          style={{
            background: "var(--surface-cream)",
            borderTop: "1px solid #EDE8DF",
            textAlign: "center",
            padding: "48px 24px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "var(--gold-500)",
              color: "#fff",
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 18,
            }}
          >
            ✓
          </div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--ink-900)",
              fontSize: "1.6rem",
              fontWeight: 600,
              margin: "0 0 10px",
            }}
          >
            Garantie prix bas 30 jours
          </h3>
          <p style={{ color: "var(--ink-500)", fontFamily: "var(--font-sans)", fontSize: 15, margin: 0 }}>
            Trouvez moins cher ailleurs ? Nous remboursons la différence.
          </p>
        </section>

      </main>
    </>
  );
}
