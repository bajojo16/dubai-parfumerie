"use client";

/**
 * BundleBuilder — « 3 parfums pour le prix de 2, au choix ».
 *
 * ⚠️ RÈGLE MÉTIER / HONNÊTETÉ SUR LA REMISE ⚠️
 * Ce repo n'utilise PAS Shopify. Le panier est un localStorage (`@/lib/cart`)
 * sans moteur de remise. La remise « le moins cher offert » n'est donc PAS
 * réellement appliquée au panier ici : on ajoute les 3 parfums à leur PRIX PLEIN.
 *
 * Le composant affiche une ESTIMATION (prix plein − produit(s) offert(s)) mais
 * étiquetée clairement « Estimation — remise appliquée au checkout ». Aucune
 * fausse remise silencieuse n'est écrite dans le panier.
 *
 * L'enforcement réel de la remise doit être fait :
 *   - soit côté serveur (recalcul du panier au checkout),
 *   - soit, en cas de migration Shopify, via une remise automatique
 *     « Buy X Get Y » : Buy 2 get 1 at 100% off, sur la collection
 *     `lot-3-pour-2` (voir ELIGIBLE_COLLECTION_HANDLE ci-dessous).
 *
 * RTL-safe : uniquement des propriétés logiques (marginInline, paddingInline,
 * insetInlineStart/End) — jamais left/right.
 */

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addItem } from "@/lib/cart";
import { BUNDLE_PRODUCTS, type BundleProduct } from "@/data/bundle-products";

/* ── CONFIG (constantes ajustables) ── */
const BUNDLE_SIZE = 3; // nombre de parfums dans le lot
const PAY_FOR = 2; // nombre payé ⇒ (BUNDLE_SIZE - PAY_FOR) offert(s) = le/les moins cher(s)
const FREE_COUNT = BUNDLE_SIZE - PAY_FOR;
/**
 * Handle de la collection éligible. Constante documentaire : PAS de fetch ici
 * (pas de Shopify). Sert de référence pour la remise automatique côté admin
 * si migration Shopify.
 */
const ELIGIBLE_COLLECTION_HANDLE = "lot-3-pour-2";

/* ── Tokens design (repris de ProductCardLuxe / OilProductCard) ── */
const T = {
  gold: "#C9A24A",
  goldDark: "#A8801F",
  goldSoft: "#D4B264",
  goldDeep: "#B98F3A",
  ink: "#2C2620",
  inkPrice: "#4A4038",
  brand: "#A8915F",
  muted: "#9A8E74",
  strike: "#B0AEA6",
  cardBg: "#FFFFFF",
  cardBorder: "#ECE9E3",
  imageBg: "#F7F3EE",
  cream: "#FAF6EE",
  creamPanel: "#FCF9F1",
  border: "#E6DCC8",
  soldOutBg: "#E7DEC9",
  soldOutText: "#8A8278",
};

const CURRENCY = "€";
const fmt = (n: number) => `${n.toFixed(2)} ${CURRENCY}`;

export type BundleBuilderProps = {
  variant?: "page" | "modal";
  onClose?: () => void;
  products?: BundleProduct[];
  locale?: string;
};

export function BundleBuilder({
  variant = "page",
  onClose,
  products = BUNDLE_PRODUCTS,
  locale = "fr",
}: BundleBuilderProps) {
  const isRTL = locale === "ar";
  const isModal = variant === "modal";

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [added, setAdded] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleId = "bundle-builder-title";

  const selected = useMemo(
    () => selectedIds.map((id) => products.find((p) => p.id === id)!).filter(Boolean),
    [selectedIds, products]
  );
  const count = selected.length;
  const isComplete = count === BUNDLE_SIZE;

  /* Estimation prix : somme des sélectionnés − les FREE_COUNT moins chers. */
  const { fullTotal, estTotal, savings } = useMemo(() => {
    const full = selected.reduce((s, p) => s + p.price, 0);
    const prices = selected.map((p) => p.price).sort((a, b) => a - b);
    const free = prices.slice(0, FREE_COUNT).reduce((s, n) => s + n, 0);
    return { fullTotal: full, estTotal: full - free, savings: free };
  }, [selected]);

  const toggle = useCallback(
    (p: BundleProduct) => {
      if (!p.available) return;
      setSelectedIds((prev) => {
        if (prev.includes(p.id)) return prev.filter((id) => id !== p.id);
        if (prev.length >= BUNDLE_SIZE) {
          // Blocage : lot déjà complet — on affiche un hint clair.
          setHint(`Ton lot est complet (${BUNDLE_SIZE} max). Retire un produit pour en changer.`);
          window.setTimeout(() => setHint(null), 2600);
          return prev;
        }
        return [...prev, p.id];
      });
    },
    []
  );

  const handleAddBundle = useCallback(() => {
    if (!isComplete) return;
    // On ajoute les 3 parfums au PRIX PLEIN (pas de remise dans le localStorage).
    // La remise « le moins cher offert » sera appliquée au checkout / serveur.
    selected.forEach((p) => {
      addItem(
        { id: p.id, name: p.name, brand: p.brand, price: p.price, image: p.image },
        1
      );
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2600);
  }, [isComplete, selected]);

  /* ── Modal : Échap + focus initial ── */
  useEffect(() => {
    if (!isModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    // Focus initial sur la carte pour l'accessibilité clavier.
    cardRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isModal, onClose]);

  /* Focus trap basique : maintien du focus dans la carte modale. */
  const onCardKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const root = cardRef.current;
    if (!root) return;
    const focusables = root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  /* ── Message de progression dynamique ── */
  const progressMessage = isComplete
    ? `Lot complet — récapitulatif ci-dessous. ${
        FREE_COUNT === 1 ? "Le moins cher est offert." : `Les ${FREE_COUNT} moins chers sont offerts.`
      }`
    : (() => {
        const remaining = BUNDLE_SIZE - count;
        return `Ajoute encore ${remaining} produit${remaining > 1 ? "s" : ""} — ${
          FREE_COUNT === 1 ? "le moins cher est offert." : `les ${FREE_COUNT} moins chers sont offerts.`
        }`;
      })();

  /* ── Contenu principal (partagé page / modal) ── */
  const content = (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* En-tête */}
      <header style={{ textAlign: "center", position: "relative" }}>
        {isModal && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            style={{
              position: "absolute",
              insetInlineEnd: 0,
              top: 0,
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: `1px solid ${T.border}`,
              background: "#fff",
              cursor: "pointer",
              fontSize: 18,
              color: T.ink,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: T.goldDark,
            margin: 0,
          }}
        >
          Offre spéciale
        </p>
        <h1
          id={titleId}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px, 5vw, 44px)",
            fontWeight: 600,
            color: T.ink,
            margin: "6px 0 8px",
          }}
        >
          3 parfums pour le prix de 2
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 15,
            color: T.muted,
            margin: 0,
            maxWidth: 560,
            marginInline: "auto",
          }}
        >
          Composez votre trio parmi notre sélection — le moins cher vous est offert.
        </p>
      </header>

      {/* Zone progression */}
      <div
        role="status"
        aria-live="polite"
        style={{
          background: T.creamPanel,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <strong
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              color: T.goldDark,
            }}
          >
            {count} / {BUNDLE_SIZE}
          </strong>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: T.ink }}>
            sélectionné{count > 1 ? "s" : ""}
          </span>
        </div>
        {/* Barre de progression */}
        <div
          aria-hidden
          style={{
            height: 6,
            borderRadius: 999,
            background: "#EFE7D5",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(count / BUNDLE_SIZE) * 100}%`,
              background: `linear-gradient(90deg, ${T.goldSoft}, ${T.goldDeep})`,
              transition: "width 240ms ease",
            }}
          />
        </div>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: T.muted, margin: 0 }}>
          {progressMessage}
        </p>
        {hint && (
          <p
            role="alert"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              color: T.goldDark,
              margin: 0,
              fontWeight: 500,
            }}
          >
            {hint}
          </p>
        )}
      </div>

      {/* Grille de sélection */}
      <div className="bundle-grid">
        {products.map((p) => {
          const isSel = selectedIds.includes(p.id);
          const blocked = !isSel && isComplete;
          return (
            <article
              key={p.id}
              style={{
                background: T.cardBg,
                border: `1.5px solid ${isSel ? T.gold : T.cardBorder}`,
                borderRadius: 20,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                textAlign: isRTL ? "right" : "left",
                boxShadow: isSel
                  ? "0 10px 28px rgba(201,162,74,0.22)"
                  : "0 6px 18px rgba(80,60,30,0.06)",
                opacity: p.available ? 1 : 0.72,
                transition: "border-color 200ms ease, box-shadow 200ms ease",
              }}
            >
              <div style={{ position: "relative", background: T.imageBg, padding: 12 }}>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1 / 1",
                    borderRadius: 14,
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src={p.image}
                    alt={`${p.name} — ${p.brand}`}
                    fill
                    sizes="(max-width:600px) 100vw, 300px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                {isSel && (
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: 18,
                      insetInlineStart: 18,
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${T.goldSoft}, ${T.goldDeep})`,
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 15,
                      boxShadow: "0 3px 10px rgba(120,90,40,0.3)",
                    }}
                  >
                    ✓
                  </span>
                )}
                {!p.available && (
                  <span
                    style={{
                      position: "absolute",
                      top: 18,
                      insetInlineEnd: 18,
                      background: "rgba(255,255,255,0.9)",
                      color: T.soldOutText,
                      fontFamily: "var(--font-sans)",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "5px 11px",
                      borderRadius: 20,
                    }}
                  >
                    Épuisé
                  </span>
                )}
              </div>

              <div
                style={{
                  padding: "16px 18px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  flex: 1,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 11,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: T.brand,
                    fontWeight: 600,
                  }}
                >
                  {p.brand}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                    fontWeight: 600,
                    lineHeight: 1.1,
                    color: T.ink,
                  }}
                >
                  {p.name}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 20,
                    fontWeight: 600,
                    color: T.inkPrice,
                    marginTop: 2,
                  }}
                >
                  {fmt(p.price)}
                </span>

                <button
                  type="button"
                  onClick={() => toggle(p)}
                  disabled={!p.available || blocked}
                  aria-pressed={isSel}
                  aria-label={
                    !p.available
                      ? `Épuisé — ${p.name}`
                      : isSel
                        ? `Retirer du lot — ${p.name}`
                        : `Ajouter au lot — ${p.name}`
                  }
                  style={{
                    marginTop: "auto",
                    marginBlockStart: 12,
                    border: isSel ? `1.5px solid ${T.gold}` : "none",
                    borderRadius: 999,
                    padding: "12px 16px",
                    fontFamily: "var(--font-sans)",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    cursor: !p.available || blocked ? "not-allowed" : "pointer",
                    color: !p.available
                      ? T.soldOutText
                      : isSel
                        ? T.goldDark
                        : blocked
                          ? T.soldOutText
                          : "#fff",
                    background: !p.available
                      ? T.soldOutBg
                      : isSel
                        ? "#fff"
                        : blocked
                          ? T.soldOutBg
                          : `linear-gradient(135deg, ${T.goldSoft}, ${T.goldDeep})`,
                    transition: "background 200ms ease, color 200ms ease",
                  }}
                >
                  {!p.available ? "Épuisé" : isSel ? "Retirer" : "Ajouter au lot"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Récapitulatif prix + CTA */}
      <div
        style={{
          background: T.creamPanel,
          border: `1px solid ${T.border}`,
          borderRadius: 18,
          padding: "20px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: T.muted }}>
            Prix estimé du lot
          </span>
          <span style={{ display: "inline-flex", alignItems: "baseline", gap: 10 }}>
            {savings > 0 && (
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 15,
                  color: T.strike,
                  textDecoration: "line-through",
                }}
              >
                {fmt(fullTotal)}
              </span>
            )}
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                fontWeight: 700,
                color: T.goldDark,
              }}
            >
              {fmt(estTotal)}
            </span>
          </span>
        </div>

        {savings > 0 && (
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: T.goldDark, margin: 0, fontWeight: 500 }}>
            Vous économisez {fmt(savings)} ({FREE_COUNT === 1 ? "le moins cher offert" : `les ${FREE_COUNT} moins chers offerts`})
          </p>
        )}

        {/* Encadré d'honnêteté sur la remise (non appliquée au panier localStorage) */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            lineHeight: 1.5,
            color: T.muted,
            margin: 0,
            paddingInline: 12,
            paddingBlock: 10,
            background: T.cream,
            border: `1px dashed ${T.border}`,
            borderRadius: 10,
          }}
        >
          <strong style={{ color: T.ink }}>Estimation — remise appliquée au checkout.</strong>{" "}
          Les 3 parfums sont ajoutés au panier à leur prix plein ; la gratuité du
          moins cher est appliquée à la validation de commande (côté serveur).
        </p>

        <button
          type="button"
          onClick={handleAddBundle}
          disabled={!isComplete}
          style={{
            border: "none",
            borderRadius: 999,
            padding: "16px 20px",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: isComplete ? "#fff" : T.soldOutText,
            cursor: isComplete ? "pointer" : "not-allowed",
            background: isComplete
              ? `linear-gradient(135deg, ${T.goldSoft}, ${T.goldDeep})`
              : T.soldOutBg,
            transition: "background 200ms ease",
          }}
        >
          {added
            ? "Lot ajouté au panier ✓"
            : isComplete
              ? "Ajouter le lot au panier"
              : `Sélectionnez ${BUNDLE_SIZE} parfums`}
        </button>
      </div>

      {/* Note dev : collection éligible (non utilisée pour un fetch ici). */}
      <p style={{ display: "none" }} aria-hidden data-collection={ELIGIBLE_COLLECTION_HANDLE} />

      <style>{`
        .bundle-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }
        @media (min-width: 640px) {
          .bundle-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 960px) {
          .bundle-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </div>
  );

  /* ── Rendu MODAL ── */
  if (isModal) {
    return (
      <div
        ref={overlayRef}
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose?.();
        }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          background: "rgba(28,22,17,0.55)",
          backdropFilter: "blur(3px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        <div
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          dir={isRTL ? "rtl" : "ltr"}
          onKeyDown={onCardKeyDown}
          className="bundle-modal-card"
          style={{
            background: T.cream,
            width: "100%",
            maxWidth: 1040,
            maxHeight: "100vh",
            overflowY: "auto",
            padding: "32px 24px",
            outline: "none",
          }}
        >
          {content}
        </div>
        <style>{`
          @media (min-width: 720px) {
            .bundle-modal-card {
              border-radius: 24px;
              max-height: 92vh;
              padding: 40px 40px;
            }
          }
        `}</style>
      </div>
    );
  }

  /* ── Rendu PAGE ── */
  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      style={{ background: T.cream, minHeight: "100vh", paddingBlock: 60, paddingInline: 24 }}
    >
      <div style={{ maxWidth: 1100, marginInline: "auto" }}>{content}</div>
    </main>
  );
}

export default BundleBuilder;
