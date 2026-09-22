"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
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

interface AddToCartProps {
  slug: string;
  productName: string;
  brand: string;
  /** Prix du format de référence (`product.price`). */
  price: number;
  /** Prix barré du format de référence (`product.oldPrice`). */
  oldPrice?: number;
  /** Contenance de référence (`product.volume`, ex. « 100ml »). */
  volume: string;
  image?: string;
  /** `product.variants` brut ; absent = un seul flacon. */
  variants?: { label: string; volumeMl: number; price: number }[];
  /** `product.sample` brut ; absent = pas de fiole d'essai. */
  sample?: { volumeMl: number; price: number; refundable?: boolean };
}

// La présence d'ApplePaySession ne change jamais pendant la vie de la page :
// aucun abonnement nécessaire, la fonction de désabonnement est un no-op.
const subscribeNoop = () => () => {};
const getWalletSnapshot = (): "apple" | "google" =>
  typeof window !== "undefined" && "ApplePaySession" in window ? "apple" : "google";

/** Dégradé du bouton d'ajout — repris à l'identique par `MobileBuyBar`. */
export const GOLD_GRADIENT = "linear-gradient(100deg, #9C6A1A 0%, #C8901E 50%, #D8A63A 100%)";

/** Repli quand la fiche n'a pas d'image — même valeur que `page.tsx`. */
export const FALLBACK_IMAGE = "/assets/prod-1.jpg";

/** Logo PayPal — même tracé que le pied de page et le bloc « 4× sans frais ». */
export function PayPalMark() {
  return (
    <svg viewBox="0 0 58 18" width="44" height="14" role="img" aria-label="PayPal">
      <text x="0" y="14.5" fontFamily="Arial, Helvetica, sans-serif" fontStyle="italic" fontWeight="800" fontSize="16" fill="#003087">Pay</text>
      <text x="25" y="14.5" fontFamily="Arial, Helvetica, sans-serif" fontStyle="italic" fontWeight="800" fontSize="16" fill="#009CDE">Pal</text>
    </svg>
  );
}

/** Bouton portefeuille (Apple Pay dans Safari, Google Pay ailleurs) — maquette. */
export function WalletButton({ wallet, onClick, height = 42 }: { wallet: "apple" | "google"; onClick: () => void; height?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={wallet === "apple" ? "Payer avec Apple Pay" : "Payer avec Google Pay"}
      style={{
        flex: "1 1 0",
        minWidth: 0,
        height,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.4rem",
        background: "#000",
        color: "#fff",
        border: "none",
        borderRadius: "var(--r-sm)",
        fontFamily: "var(--font-sans)",
        fontWeight: "var(--fw-semibold)",
        fontSize: "var(--t-sm)",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {wallet === "apple" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
          <path d="M16.365 1.43c0 1.14-.42 2.2-1.24 3.06-.98 1.05-2.16 1.65-3.44 1.55-.05-1.12.43-2.28 1.24-3.1.9-.96 2.24-1.6 3.44-1.51zM20.5 17.05c-.5 1.16-.75 1.68-1.4 2.7-.9 1.43-2.18 3.2-3.76 3.22-1.4.02-1.77-.92-3.67-.9-1.9 0-2.3.9-3.72.92-1.58.02-2.79-1.6-3.7-3.03C-.35 15.9-.62 11.2 1.1 8.7c1.22-1.78 3.15-2.82 4.96-2.82 1.85 0 3.01 1.02 4.53 1.02 1.48 0 2.38-1.02 4.52-1.02 1.61 0 3.32.88 4.54 2.4-3.99 2.19-3.34 7.9.85 8.77z" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.56-5.17 3.56-8.87z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3a7.2 7.2 0 0 1-10.76-3.78H1.32v3.09A12 12 0 0 0 12 24z" />
          <path fill="#FBBC04" d="M5.31 14.31a7.2 7.2 0 0 1 0-4.62V6.6H1.32a12 12 0 0 0 0 10.8l3.99-3.09z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.6 11.6 0 0 0 12 0 12 12 0 0 0 1.32 6.6l3.99 3.09A7.2 7.2 0 0 1 12 4.75z" />
        </svg>
      )}
      {wallet === "apple" ? "Apple Pay" : "Google Pay"}
    </button>
  );
}

/** Bouton PayPal 4× — maquette. */
export function PayPalButton({ onClick, height = 42 }: { onClick: () => void; height?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Payer en 4 fois avec PayPal"
      style={{
        flex: "1 1 0",
        minWidth: 0,
        height,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.35rem",
        background: "var(--surface-white)",
        color: "var(--ink-900)",
        border: "1.5px solid var(--line-200)",
        borderRadius: "var(--r-sm)",
        fontFamily: "var(--font-sans)",
        fontWeight: "var(--fw-semibold)",
        fontSize: "var(--t-sm)",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      <PayPalMark /> 4×
    </button>
  );
}

/** Toast noir/or, ancré sous (ou sur) la rangée qui l'a déclenché. */
export function MiniToast({ text, above = false }: { text: string; above?: boolean }) {
  return (
    <span
      role="status"
      style={{
        position: "absolute",
        ...(above ? { bottom: "calc(100% + 6px)" } : { top: "calc(100% + 6px)" }),
        left: 0,
        padding: "0.3rem 0.6rem",
        borderRadius: "var(--r-sm)",
        background: "var(--espresso-900)",
        color: "var(--gold-100)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--t-xs)",
        whiteSpace: "nowrap",
        boxShadow: "var(--shadow-sm)",
        zIndex: 2,
      }}
    >
      {text}
    </span>
  );
}

export const EXPRESS_TOAST = "Paiement express — bientôt disponible";

export default function AddToCart({
  slug,
  productName,
  brand,
  price,
  oldPrice,
  volume,
  image,
  variants: rawVariants,
  sample,
}: AddToCartProps) {
  // La liste et le format initial ne dépendent que des props : pas besoin de
  // les mémoriser, `resolveVariants` copie/trie deux ou trois entrées.
  const variants = resolveVariants({ volume, price, variants: rawVariants, sample });
  const [variant, setVariant] = useState<ProductVariant>(() => defaultVariant(variants));
  // L'échantillon se coche EN PLUS du flacon : les deux partent au panier d'un
  // seul clic. En format exclusif, on ne pouvait pas prendre les deux.
  const sampleVariant = sampleVariantOf(sample);
  const [withSample, setWithSample] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cartAdded, setCartAdded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Apple Pay n'existe que dans Safari (macOS/iOS) : ailleurs on propose
  // Google Pay. `useSyncExternalStore` lit `window` côté client et renvoie
  // « google » au rendu serveur : pas d'effet + setState, pas d'écart
  // d'hydratation (React re-rend seul si les deux instantanés diffèrent).
  const wallet = useSyncExternalStore(subscribeNoop, getWalletSnapshot, () => "google" as const);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const handleAddToCart = () => {
    // Le panier est la source de vérité (`localStorage["dp_cart"]`) : l'en-tête
    // écoute son événement et met le compteur à jour. Avant, ce bouton ne
    // faisait qu'un setState cosmétique : « ✓ Ajouté ! » sans rien ajouter.
    addItem(
      {
        id: variantCartId(slug, variant),
        name: `${productName} ${variant.label}`,
        brand,
        price: variant.price,
        image: image ?? FALLBACK_IMAGE,
      },
      quantity,
    );
    if (withSample && sampleVariant) {
      addItem(
        { id: variantCartId(slug, sampleVariant), name: `${productName} ${sampleVariant.label}`, brand, price: sampleVariant.price, image: image ?? FALLBACK_IMAGE },
        1,
      );
    }
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
  };

  // Les portefeuilles sont des maquettes : un toast, jamais d'alert() bloquant.
  const onExpress = () => setToast(EXPRESS_TOAST);

  const total = variant.price * quantity + (withSample && sampleVariant ? sampleVariant.price : 0);

  // Un seul flacon au catalogue (le cas de la plupart des références) : pas de
  // sélecteur — des cartes pour un choix qui n'existe pas. Le format est
  // rappelé en une ligne.
  const bottles = bottlesOf(variants);
  const singleFormat = bottles.length < 2;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Contenance — au-dessus de la quantité : on choisit le format avant
          d'en compter plusieurs. L'échantillon est la première carte ; l'ancienne
          case « + échantillon » a disparu, c'est désormais un format à part. */}
      {singleFormat ? (
        <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "var(--t-sm)", color: "var(--ink-500)" }}>
          <span style={{ fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", fontSize: "var(--t-xs)", color: "var(--ink-700)" }}>
            Contenance
          </span>{" "}
          {bottles[0].label} · {formatPrice(bottles[0].price / Math.max(1, bottles[0].volumeMl))} € / ml
        </p>
      ) : (
        <VolumeSelector
          variants={variants}
          value={variant}
          onChange={setVariant}
          oldPrice={oldPrice}
          idPrefix="dp-vol-col"
        />
      )}

      {/* Quantity + Add to cart row.
          La rangée est bornée, pas seulement le bouton : c'est elle qui donne
          le gabarit du bloc d'achat, et la rangée « paiement express » s'aligne
          dessus. Sans cette borne, la rangée traversait la colonne et les
          boutons flottaient en son milieu, sans bord commun avec rien. */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", width: "100%", maxWidth: 392 }}>
        <QuantityStepper value={quantity} onChange={setQuantity} />

        {/* Add to cart button — le libellé suit le format : l'échantillon se
            « commande », le flacon s'« ajoute ». */}
        <button
          type="button"
          onClick={handleAddToCart}
          style={{
            // Occupe ce que la rangée bornée laisse après le sélecteur de
            // quantité. C'est la rangée qui fixe la largeur, plus le bouton :
            // en pleine colonne, la bande dorée pesait plus lourd que le prix
            // qu'elle sert.
            flex: "1 1 auto",
            minWidth: 0,
            height: "42px",
            background: cartAdded ? "var(--gold-700)" : GOLD_GRADIENT,
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
            transition: "background var(--dur-fast) var(--ease-out), transform var(--dur-fast)",
            transform: cartAdded ? "scale(0.98)" : "scale(1)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          aria-label={`Ajouter ${productName} ${variant.label} au panier`}
        >
          {cartAdded ? "✓ Ajouté !" : ctaLabel(variant, total)}
        </button>
      </div>

      {/* Sentinelle observée par `MobileBuyBar` : tant qu'elle est visible, le
          bouton d'ajout ci-dessus l'est aussi et la barre fixe reste cachée.
          Zéro hauteur : elle ne décale rien. */}
      <div data-dp-atc-sentinel aria-hidden="true" style={{ height: 0, margin: "-1rem 0 0" }} />

      {/* Paiement express — remplace l'ancien « Acheter en 1 clic », qui ne
          menait nulle part. Portefeuille du téléphone (noir, comme les vrais
          boutons Apple/Google Pay) et PayPal 4×, côte à côte. Pas de WhatsApp
          ici : il reste réservé au SAV, hors tunnel d'achat. */}
      <div style={{ position: "relative", display: "flex", gap: "0.75rem", width: "100%", maxWidth: 392 }}>
        <WalletButton wallet={wallet} onClick={onExpress} />
        <PayPalButton onClick={onExpress} />
        {toast && <MiniToast text={toast} />}
      </div>

      {/* Échantillon en complément — case à cocher, pas format exclusif : le
          client prend le flacon ET la fiole d'un seul clic. Affichée quel que
          soit le nombre de formats. */}
      {sampleVariant && (
        <label
          style={{
            width: "100%",
            maxWidth: 392,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            padding: "0.6rem 0.875rem",
            background: withSample ? "var(--gold-100)" : "transparent",
            border: withSample ? "1px solid var(--gold-300)" : "1px dashed var(--line-300)",
            borderRadius: "var(--r-sm)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--t-sm)",
            color: "var(--ink-700)",
            cursor: "pointer",
            transition: "background var(--dur-fast), border-color var(--dur-fast)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <input
              type="checkbox"
              checked={withSample}
              onChange={(e) => setWithSample(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "var(--gold-500)", margin: 0, flexShrink: 0 }}
            />
            <span>
              <span style={{ fontWeight: "var(--fw-medium)" }}>Ajouter aussi l&apos;{sampleVariant.label.toLowerCase()}</span>
              <span style={{ display: "block", fontSize: "var(--t-xs)", color: "var(--ink-400)" }}>
                {sampleVariant.refundable ? "Remboursé sur l'achat du flacon · " : ""}≈ {sampleVariant.volumeMl * 10} pulvérisations
              </span>
            </span>
          </span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 600, color: "var(--gold-700)", whiteSpace: "nowrap" }}>
            + {formatPrice(sampleVariant.price)} €
          </span>
        </label>
      )}

      {/* Total — suit le format choisi et la quantité. */}
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--t-xs)",
          color: "var(--ink-400)",
          textAlign: "center",
          margin: 0,
          width: "100%",
          maxWidth: 392,
        }}
      >
        Total · {variant.label}
        {quantity > 1 ? ` × ${quantity}` : ""} :{" "}
        <strong style={{ color: "var(--ink-700)" }}>{formatPrice(total)} €</strong>
      </p>
    </div>
  );
}
