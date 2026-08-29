"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { addItem } from "@/lib/cart";

const PROMO_PRODUCTS = [
  { id: 1, name: "Lattafa Oud Pour Elle", brand: "Lattafa", price: 18.90, oldPrice: 84.90, discount: 77, category: "Femme", image: "prod-1.jpg" },
  { id: 2, name: "Al Haramain Amber Oud", brand: "Al Haramain", price: 29.90, oldPrice: 85.90, discount: 65, category: "Mixte", image: "prod-2.jpg" },
  { id: 3, name: "Reef Opulent Blue", brand: "Reef", price: 24.90, oldPrice: 49.90, discount: 50, category: "Homme", image: "prod-3.jpg" },
  { id: 4, name: "Armaf Club de Nuit", brand: "Armaf", price: 19.90, oldPrice: 33.90, discount: 41, category: "Homme", image: "prod-4.jpg" },
  { id: 5, name: "Swiss Arabian Shaghaf", brand: "Swiss Arabian", price: 22.90, oldPrice: 57.90, discount: 60, category: "Femme", image: "prod-5.jpg" },
  { id: 6, name: "Khadlaj Hareem Al Sultan", brand: "Khadlaj", price: 15.90, oldPrice: 39.90, discount: 60, category: "Femme", image: "prod-6.jpg" },
  { id: 7, name: "Gulf Orchid Rose Oud", brand: "Gulf Orchid", price: 17.90, oldPrice: 44.90, discount: 60, category: "Mixte", image: "prod-1.jpg" },
  { id: 8, name: "Surrati Black Oud", brand: "Surrati", price: 21.90, oldPrice: 54.90, discount: 60, category: "Homme", image: "prod-2.jpg" },
  { id: 9, name: "Coffret Découverte Oud", brand: "Dubaï Parfumerie", price: 39.90, oldPrice: 79.90, discount: 50, category: "Coffrets & Lots", image: "coffret-reef.jpg" },
  { id: 10, name: "Lot 3 Parfums Best-Of", brand: "Dubaï Parfumerie", price: 49.90, oldPrice: 109.90, discount: 55, category: "Coffrets & Lots", image: "coffret-reef.jpg" },
  { id: 11, name: "Coffret Miniatures Floral", brand: "Dubaï Parfumerie", price: 29.90, oldPrice: 64.90, discount: 54, category: "Coffrets & Lots", image: "coffret-reef.jpg" },
  { id: 12, name: "Lot Découverte Huiles 6×3ml", brand: "Dubaï Parfumerie", price: 24.90, oldPrice: 54.90, discount: 55, category: "Coffrets & Lots", image: "coffret-reef.jpg" },
];

const OFFER_2_3 = "Achète 2 = 3 offert";
const OFFER_VOLUME = "Achat en volume";
/**
 * La rangée ne garde que les deux OFFRES.
 *
 * Les six filtres par catégorie — Tous, Femme, Homme, Mixte, Huile de Parfum,
 * Coffrets & Lots — faisaient doublon avec la navigation du site, qui mène
 * déjà à ces rayons. Sur une page dont le sujet est la promotion, ils
 * détournaient du seul choix qui lui appartient : profiter de l'offre, ou
 * commander en gros. `activeFilter` reste à « Tous » par défaut, donc la
 * grille montre toujours l'ensemble des promotions.
 */
const FILTERS = [OFFER_2_3, OFFER_VOLUME];

/**
 * Paliers de remise pour l'achat en gros. Ils ne s'appliquent pas au panier :
 * c'est une grille tarifaire indicative, suivie d'une demande de devis — le
 * volume se négocie, il ne se met pas au panier comme un flacon.
 */
const VOLUME_TIERS = [
  { qty: 12, discount: 15 },
  { qty: 25, discount: 20 },
  { qty: 50, discount: 25 },
  { qty: 100, discount: 35 },
];

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
  /**
   * Quantité par produit. Une seule table plutôt qu'un état par carte : la
   * grille est rendue en boucle, et un `useState` dans la boucle serait un
   * appel de hook conditionnel. L'entrée absente vaut 1.
   */
  const [qty, setQty] = useState<Record<number, number>>({});
  const { hh, mm, ss } = useCountdown(86399); // 23:59:59

  /** L'onglet volume remplace la grille produits par la grille tarifaire. */
  const showVolume = activeFilter === OFFER_VOLUME;

  const filteredProducts =
    activeFilter === "Tous" || activeFilter === "Huile de Parfum"
      ? PROMO_PRODUCTS
      : activeFilter === OFFER_2_3
        ? // Offre « Achète 2 = 3 offert » : parfums individuels éligibles
          PROMO_PRODUCTS.filter((p) =>
            ["Femme", "Homme", "Mixte"].includes(p.category)
          )
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
              Bons Plans
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
            const isOffer = filter === OFFER_2_3;
            // Le chip « Achète 2 = 3 » est un LIEN vers la page complète du lot
            if (isOffer) {
              return (
                <Link
                  key={filter}
                  href="/offres/lot-3-pour-2"
                  style={{
                    padding: "8px 20px",
                    borderRadius: 999,
                    border: "1.5px solid var(--gold-500)",
                    background: "var(--gold-100)",
                    color: "var(--gold-700)",
                    fontFamily: "var(--font-sans)",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  ★ {filter} →
                </Link>
              );
            }
            return (
              <button
                key={filter}
                className={isActive ? undefined : "filter-pill"}
                onClick={() => setActiveFilter(filter)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 999,
                  border: isActive
                    ? "1.5px solid var(--gold-500)"
                    : isOffer
                      ? "1.5px solid var(--gold-500)"
                      : "1.5px solid var(--ink-400)",
                  background: isActive
                    ? "var(--gold-500)"
                    : isOffer
                      ? "var(--gold-100)"
                      : "var(--surface-white)",
                  color: isActive ? "#fff" : isOffer ? "var(--gold-700)" : "var(--ink-700)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  fontWeight: isActive || isOffer ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {isOffer ? `★ ${filter}` : filter}
              </button>
            );
          })}
        </div>

        {/* ACHAT EN VOLUME — grille tarifaire, pas de produits.
            Le gros ne s'ajoute pas au panier : la remise dépend de la
            quantité ET des références, elle se négocie. On affiche donc les
            paliers puis on renvoie vers une demande de devis. */}
        {showVolume && (
          <section style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.7rem, 3.4vw, 2.3rem)",
                fontWeight: 500,
                color: "var(--ink-900)",
                margin: "0 0 10px",
                textAlign: "center",
              }}
            >
              Achat en volume
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 14.5,
                color: "var(--ink-500)",
                margin: "0 0 32px",
                textAlign: "center",
                lineHeight: 1.65,
              }}
            >
              Revendeurs, comités d&apos;entreprise, événements : la remise suit la
              quantité commandée, toutes références confondues.
            </p>

            <ul style={{ listStyle: "none", margin: "0 0 28px", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {VOLUME_TIERS.map(({ qty, discount }) => (
                <li
                  key={qty}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    background: "var(--surface-white)",
                    border: "1px solid var(--line-100, rgba(0,0,0,.08))",
                    borderRadius: "var(--r-md)",
                    padding: "16px 22px",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--ink-900)", fontWeight: 500 }}>
                    À partir de <strong style={{ fontWeight: 700 }}>{qty} flacons</strong>
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--gold-700)",
                      background: "var(--gold-100, #FBF3E2)",
                      borderRadius: "var(--r-pill, 999px)",
                      padding: "6px 16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    −{discount} %
                  </span>
                </li>
              ))}
            </ul>

            <div style={{ textAlign: "center" }}>
              <Link
                href="/commande-a-la-demande"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--gold-500)",
                  color: "#fff",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  borderRadius: "var(--r-pill, 999px)",
                  padding: "14px 30px",
                }}
              >
                Demander un devis
              </Link>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--ink-400, #8A7E68)", margin: "14px 0 0" }}>
                Réponse sous 24 h ouvrées · à partir de 12 flacons
              </p>
            </div>
          </section>
        )}

        {/* PRODUCT GRID */}
        {!showVolume && (
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

                  {/* Sélecteur de quantité + ajout au panier.
                      Le bouton n'était câblé à rien : il changeait de couleur
                      au survol et c'est tout. Il ajoute maintenant vraiment,
                      dans la quantité choisie. */}
                  <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <QtyStepper
                    value={qty[product.id] ?? 1}
                    onChange={(n) => setQty((q) => ({ ...q, [product.id]: n }))}
                    size="xs"
                  />
                  <button
                    className="add-to-cart-btn"
                    type="button"
                    aria-label={`Ajouter ${product.name} au panier`}
                    onClick={() =>
                      addItem(
                        {
                          id: String(product.id),
                          name: product.name,
                          brand: product.brand,
                          price: product.price,
                          image: `/assets/${product.image}`,
                        },
                        qty[product.id] ?? 1
                      )
                    }
                    style={{
                      // Largeur du libellé, pas de la carte : les autres rails
                      // du site ont déjà cette pilule compacte, celle-ci
                      // restait un bandeau pleine largeur.
                      flex: "0 1 auto",
                      padding: "9px 20px",
                      background: "var(--gold-500)",
                      color: "#fff",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 600,
                      fontSize: 12,
                      letterSpacing: "0.06em",
                      whiteSpace: "nowrap",
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
              </div>
            ))}
          </div>
        </section>
        )}

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
