"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { addItem } from "@/lib/cart";
import {
  ctaLabel,
  defaultVariant,
  formatPrice,
  resolveVariants,
  bottlesOf,
  sampleVariantOf,
  variantCartId,
  type ProductVariant,
} from "@/lib/product-variants";
import VolumeSelector from "./VolumeSelector";
import QuantityStepper from "./QuantityStepper";
import {
  EXPRESS_TOAST,
  FALLBACK_IMAGE,
  GOLD_GRADIENT,
  MiniToast,
  PayPalButton,
  WalletButton,
} from "./AddToCart";

interface MobileBuyBarProps {
  slug: string;
  productName: string;
  brand: string;
  price: number;
  oldPrice?: number;
  volume: string;
  image?: string;
  variants?: { label: string; volumeMl: number; price: number }[];
  sample?: { volumeMl: number; price: number; refundable?: boolean };
}

/** Hauteur maximale de la barre (hors safe-area) : elle ne doit pas manger l'écran. */
const BAR_HEIGHT = 64;

const subscribeNoop = () => () => {};
const getWalletSnapshot = (): "apple" | "google" =>
  typeof window !== "undefined" && "ApplePaySession" in window ? "apple" : "google";

/**
 * Barre d'achat fixe, mobile uniquement (≤ 760 px), visible seulement quand le
 * bouton « Ajouter au panier » de la colonne est sorti de l'écran — tant qu'il
 * est visible, deux boutons d'ajout à l'écran se feraient concurrence.
 *
 * ÉTAT DE VARIANTE : la barre reçoit les mêmes props qu'`AddToCart` et garde
 * SON PROPRE état de format/quantité. Choisir l'échantillon dans la colonne
 * puis ouvrir le tiroir montre donc le format par défaut (plus grand flacon),
 * pas l'échantillon. Acceptable pour une maquette : un store partagé
 * (contexte ou event) est le chantier suivant si la fiche passe en
 * production. Le tiroir ré-affiche le sélecteur justement pour que le client
 * confirme toujours le format avant d'ajouter.
 */
export default function MobileBuyBar({
  slug,
  productName,
  brand,
  price,
  oldPrice,
  volume,
  image,
  variants: rawVariants,
  sample,
}: MobileBuyBarProps) {
  const variants = resolveVariants({ volume, price, variants: rawVariants, sample });
  const [variant, setVariant] = useState<ProductVariant>(() => defaultVariant(variants));
  const sampleVariant = sampleVariantOf(sample);
  const [withSample, setWithSample] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const wallet = useSyncExternalStore(subscribeNoop, getWalletSnapshot, () => "google" as const);

  // La sentinelle est posée par `AddToCart` juste sous sa rangée d'ajout. La
  // barre apparaît quand elle est sortie par le HAUT (on a défilé plus bas) ;
  // si elle est sous le bord bas (page à peine chargée), rien n'est montré.
  useEffect(() => {
    const target = document.querySelector("[data-dp-atc-sentinel]");
    if (!target) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const above = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setVisible(above);
      },
      { threshold: 0 },
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  const close = useCallback(() => setOpen(false), []);

  // Tiroir ouvert : le body ne défile plus (sinon la page bouge sous le
  // voile) et Échap ferme. Les deux se défont à la fermeture.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const add = (qty: number) => {
    addItem(
      {
        id: variantCartId(slug, variant),
        name: `${productName} ${variant.label}`,
        brand,
        price: variant.price,
        image: image ?? FALLBACK_IMAGE,
      },
      qty,
    );
    if (withSample && sampleVariant) {
      addItem(
        { id: variantCartId(slug, sampleVariant), name: `${productName} ${sampleVariant.label}`, brand, price: sampleVariant.price, image: image ?? FALLBACK_IMAGE },
        1,
      );
    }
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  const onExpress = () => setToast(EXPRESS_TOAST);
  const total = variant.price * quantity + (withSample && sampleVariant ? sampleVariant.price : 0);

  return (
    <>
      <style>{`
        /* Mobile seulement : au-dessus de 760 px la colonne d'achat est
           toujours à portée et la barre ferait doublon. */
        .dp-mbb, .dp-mbb-sheet { display: none; }
        @media (max-width: 760px) {
          .dp-mbb {
            display: flex;
            position: fixed;
            left: 0; right: 0; bottom: 0;
            /* Au-dessus du bouton flottant « Choisir mon parfum » (--z-float),
               sous toute modale/tiroir (--z-modal). */
            z-index: calc(var(--z-float) + 10);
            align-items: center;
            gap: 0.75rem;
            height: ${BAR_HEIGHT}px;
            box-sizing: content-box;
            padding: 0 0.85rem env(safe-area-inset-bottom) 0.85rem;
            background: var(--surface-white);
            border-top: 1px solid var(--line-200);
            box-shadow: 0 -8px 24px rgba(21, 16, 11, 0.08);
            font-family: var(--font-sans);
            transform: translateY(110%);
            transition: transform 220ms var(--ease-out);
          }
          .dp-mbb[data-visible="true"] { transform: translateY(0); }
          .dp-mbb-sheet { display: block; }
        }
      `}</style>

      {/* ── Barre fixe ── */}
      <div className="dp-mbb" data-visible={visible} aria-hidden={!visible}>
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: "0 1 auto" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "var(--price-sale)",
              lineHeight: 1.1,
              whiteSpace: "nowrap",
            }}
          >
            {formatPrice(variant.price)} €
          </span>
          <span style={{ fontSize: "var(--t-xs)", color: "var(--ink-500)", whiteSpace: "nowrap" }}>
            {variant.label}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          tabIndex={visible ? 0 : -1}
          aria-haspopup="dialog"
          aria-expanded={open}
          style={{
            flex: "1 1 auto",
            minWidth: 0,
            height: 44,
            background: added ? "var(--gold-700)" : GOLD_GRADIENT,
            color: "var(--espresso-900)",
            border: "none",
            borderRadius: "var(--r-sm)",
            fontFamily: "var(--font-sans)",
            fontWeight: "var(--fw-semibold)",
            fontSize: "var(--t-sm)",
            letterSpacing: "var(--ls-wide)",
            textTransform: "uppercase",
            cursor: "pointer",
            boxShadow: "var(--shadow-gold)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {added ? "✓ Ajouté !" : `Ajouter · ${formatPrice(variant.price)} €`}
        </button>
      </div>

      {/* ── Tiroir (bottom sheet) ── */}
      {open && (
        <div className="dp-mbb-sheet" role="presentation">
          {/* Voile : un tap dessus ferme. */}
          <div
            onClick={close}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(21, 16, 11, 0.55)",
              // Sous le panneau, au-dessus de la barre et du bouton flottant.
              zIndex: "var(--z-modal)",
              animation: "dp-fade .2s var(--ease-out)",
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dp-mbb-title"
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: "calc(var(--z-modal) + 1)",
              background: "var(--surface-white)",
              borderRadius: "var(--r-lg) var(--r-lg) 0 0",
              padding: "0.5rem 1rem calc(1rem + env(safe-area-inset-bottom))",
              maxHeight: "88vh",
              overflowY: "auto",
              fontFamily: "var(--font-sans)",
              boxShadow: "0 -12px 40px rgba(21, 16, 11, 0.25)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {/* Poignée */}
            <div
              aria-hidden="true"
              style={{ width: 40, height: 4, borderRadius: 999, background: "var(--line-300)", margin: "0.25rem auto 0" }}
            />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2
                id="dp-mbb-title"
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontSize: "1.375rem",
                  fontWeight: 600,
                  color: "var(--ink-900)",
                }}
              >
                Choisir la contenance
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Fermer"
                style={{
                  width: 36,
                  height: 36,
                  border: "1px solid var(--line-200)",
                  borderRadius: "var(--r-pill)",
                  background: "var(--surface-white)",
                  color: "var(--ink-700)",
                  fontSize: "1.25rem",
                  lineHeight: 1,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>

            <p style={{ margin: 0, fontSize: "var(--t-sm)", color: "var(--ink-500)" }}>
              {productName} — {brand}
            </p>

            {/* Un seul flacon : pas de sélecteur, le format est rappelé en une ligne. */}
            {bottlesOf(variants).length < 2 ? (
              <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "var(--t-sm)", color: "var(--ink-500)" }}>
                Format unique : <b style={{ color: "var(--ink-700)" }}>{variant.label}</b>
              </p>
            ) : (
              <VolumeSelector
                variants={variants}
                value={variant}
                onChange={setVariant}
                oldPrice={oldPrice}
                idPrefix="dp-vol-sheet"
              />
            )}

            {sampleVariant && (
              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", padding: "0.6rem 0.875rem", border: withSample ? "1px solid var(--gold-300)" : "1px dashed var(--line-300)", background: withSample ? "var(--gold-100)" : "transparent", borderRadius: "var(--r-sm)", fontSize: "var(--t-sm)", color: "var(--ink-700)", cursor: "pointer" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <input type="checkbox" checked={withSample} onChange={(e) => setWithSample(e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--gold-500)", margin: 0 }} />
                  <span>Ajouter aussi l&apos;{sampleVariant.label.toLowerCase()}</span>
                </span>
                <b style={{ color: "var(--gold-700)", whiteSpace: "nowrap" }}>+ {formatPrice(sampleVariant.price)} €</b>
              </label>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
              <span style={{ fontSize: "var(--t-sm)", color: "var(--ink-700)", fontWeight: "var(--fw-medium)" }}>
                Quantité
              </span>
              <QuantityStepper value={quantity} onChange={setQuantity} height={44} />
            </div>

            <button
              type="button"
              onClick={() => {
                add(quantity);
                close();
              }}
              style={{
                width: "100%",
                height: 48,
                background: GOLD_GRADIENT,
                color: "var(--espresso-900)",
                border: "none",
                borderRadius: "var(--r-sm)",
                fontFamily: "var(--font-sans)",
                fontWeight: "var(--fw-semibold)",
                fontSize: "var(--t-sm)",
                letterSpacing: "var(--ls-wide)",
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: "var(--shadow-gold)",
              }}
            >
              {ctaLabel(variant, total)}
            </button>

            {/* Maquette : portefeuille + PayPal 4×, un toast au tap. */}
            <div style={{ position: "relative", display: "flex", gap: "0.75rem" }}>
              <WalletButton wallet={wallet} onClick={onExpress} />
              <PayPalButton onClick={onExpress} />
              {toast && <MiniToast text={toast} above />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
