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

/**
 * Les raccourcis de la rangée. `star` distingue l'offre phare des rayons
 * voisins : sans elle, cinq pastilles dorées identiques se valent toutes et
 * l'offre du jour se perd au milieu des liens de navigation.
 */
const SHORTCUTS: { label: string; href: string; star?: boolean }[] = [
  { label: OFFER_2_3, href: "/offres/lot-3-pour-2", star: true },
  // « Lots » mène au rayon des coffrets. C'est désormais le seul chemin vers
  // eux : l'entrée « Coffrets & Lots » de la barre de navigation a été retirée,
  // et elle pointait de toute façon sur cette page-ci, qui ne montre que des
  // flacons seuls en promotion, jamais un ensemble.
  { label: "Lots & Coffret", href: "/lots?from=/promo-flash" },
];
/**
 * La page ne filtre plus rien : elle montre toutes les promotions.
 *
 * Les six filtres par catégorie faisaient doublon avec la navigation du site,
 * qui mène déjà à ces rayons ; l'onglet « Achat en volume » ouvrait une grille
 * tarifaire qui relevait d'une demande de devis, pas d'une page de promotion.
 * Ne reste que le raccourci vers l'offre 3 pour 2, qui est un lien, pas un tri.
 */

export default function PromoFlashPage() {
  /**
   * Quantité par produit. Une seule table plutôt qu'un état par carte : la
   * grille est rendue en boucle, et un `useState` dans la boucle serait un
   * appel de hook conditionnel. L'entrée absente vaut 1.
   */
  const [qty, setQty] = useState<Record<number, number>>({});


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
          {/* Rangée de raccourcis, pas de filtres : chaque pastille MÈNE
              quelque part, aucune ne trie la grille du dessous. C'est ce qui
              manquait à l'ancienne version, où « Achète 2 = 3 » naviguait
              pendant que « Achat en volume » filtrait, sans qu'aucun signe
              visuel ne distingue les deux comportements. La flèche finale est
              donc portée par toutes, et l'étoile réservée à l'offre phare. */}
          {SHORTCUTS.map(({ label, href, star }) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: "8px 20px",
                borderRadius: 999,
                border: "1.5px solid var(--gold-500)",
                background: star ? "var(--gold-100)" : "var(--surface-white)",
                color: "var(--gold-700)",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {star ? `★ ${label}` : label} →
            </Link>
          ))}
        </div>

        {/* PRODUCT GRID */}
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px" }}>
          <div className="promo-grid">
            {PROMO_PRODUCTS.map((product) => (
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
