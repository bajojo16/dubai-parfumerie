"use client";

/**
 * « Complétez la collection {produit} » — le flacon de la fiche, une huile de
 * parfum assortie, l'écrin cadeau et une fiole d'un parfum voisin, cochables
 * en une seule fois, avec un récapitulatif qui se recalcule à chaque case.
 *
 * Pourquoi un bloc à part plutôt que quatre « + » dispersés : le client qui
 * vient d'ajouter un flacon a déjà décidé ; ce qu'on lui propose ici, c'est
 * de compléter d'un geste, avec le total sous les yeux. Le mot « rituel » est
 * banni à la demande du client : on dit « collection » partout.
 *
 * Données : rien n'est inventé. L'huile vient de `oil-products.ts` (la seule
 * source d'huiles du site), le parfum voisin de `relatedProducts` (même règle
 * que la rangée « Vous pourriez aussi aimer »), la concentration / famille /
 * galerie de la fiche de `resolveProduct`. Les deux seuls prix écrits en dur
 * (écrin, fiole de repli) sont isolés en constantes commentées ci-dessous.
 */

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { addItem } from "@/lib/cart";
import { formatPrice, parseVolumeMl, variantCartId } from "@/lib/product-variants";
import { lineSiblings, relatedProducts, resolveProduct } from "@/data/product-resolve";
import { DEMO as OILS, type OilProduct } from "@/data/oil-products";
import { FREE_SHIPPING_THRESHOLD_EUR } from "@/data/carriers";
import { FALLBACK_IMAGE, GOLD_GRADIENT, MiniToast } from "./AddToCart";

/** Écrin rigide — prix de la maquette (10-collection), pas encore dans les données. */
const GIFT_BOX_PRICE_EUR = 4.9;

/**
 * Fiole 1 ml d'un autre parfum — prix de repli (maquette) quand la fiche
 * voisine ne déclare pas son propre `sample`. Sinon c'est SON prix qui prime.
 */
const SAMPLE_PRICE_EUR = 1.9;
const SAMPLE_VOLUME_ML = 1;

/**
 * Remise collection : 10 % sur les articles cochés AUTRES que le flacon de la
 * fiche. Règle simple, lisible dans le récapitulatif ; le flacon reste au prix
 * affiché en haut de page — deux prix pour le même flacon sur la même fiche,
 * c'est le genre d'incohérence qui coûte la confiance.
 */
const COLLECTION_DISCOUNT = 0.1;

/** Durée d'affichage du toast de confirmation. */
const TOAST_MS = 2000;

/** Vignette carrée de chaque ligne. */
const THUMB = 56;


type ItemKey = "bottle" | "oil" | "giftbox" | "sample";

interface CollectionItem {
  key: ItemKey;
  /** Identifiant panier — un même article coché deux fois = une ligne, qty 2. */
  cartId: string;
  title: string;
  subtitle: string;
  /** Libellé court du récapitulatif (colonne sombre). */
  short: string;
  price: number;
  /** Prix affiché à droite de la ligne (« + 4,90 € » pour l'écrin). */
  priceLabel: string;
  image: string;
  brand: string;
  /** Le flacon de la fiche : coché, non décochable. */
  locked?: boolean;
}

interface Props {
  slug: string;
  productName: string;
  brand: string;
  /** Prix du format de référence (`product.price`). */
  price: number;
  /**
   * Prix barré du format de référence (`product.oldPrice`). Accepté pour rester
   * aligné sur `AddToCart`, mais volontairement inutilisé : la remise
   * collection s'applique sur le prix VENDU, jamais sur le prix barré.
   */
  oldPrice: number;
  image: string;
  /** Contenance de référence (`product.volume`, ex. « 100ml »). */
  volume: string;
}

/**
 * Huile « assortie » : UNIQUEMENT celle de la même maison.
 *
 * Les replis (famille proche, puis première huile disponible) ont été retirés
 * le 22/09/2026 : sur la fiche Khamrah, ils proposaient une huile Al Haramain
 * sous le libellé « assortie », ce qui est faux — aucune huile Lattafa n'existe
 * au catalogue. `null` = pas d'huile de la maison, la ligne n'apparaît pas.
 */
function pickOil(brand: string): OilProduct | null {
  return OILS.find((o) => o.available && o.brand === brand) ?? null;
}

/** Arrondi monétaire : les remises en pourcentage produisent des tiers de centime. */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export default function CollectionBuilder({ slug, productName, brand, price, image, volume }: Props) {
  // Déterministe (mêmes données côté serveur et client) : pas de divergence
  // à l'hydratation, même règle que `TrioUpsell`.
  const items = useMemo<CollectionItem[]>(() => {
    const product = resolveProduct(slug);
    const volumeMl = parseVolumeMl(volume);
    const concentration = product?.concentration ?? "";
    // L'écrin est illustré par la vue « coffret » de la galerie quand elle
    // existe ; sinon le packshot — jamais une image générique.
    const boxImage = product?.gallery?.find((g) => /coffret/i.test(g)) ?? image;

    const list: CollectionItem[] = [
      {
        key: "bottle",
        cartId: variantCartId(slug, { label: volume, volumeMl, price, kind: "bottle" }),
        title: `${productName} · ${volume.replace(/(\d)(ml)/i, "$1 $2")}`,
        subtitle: concentration ? `${concentration} · le flacon de cette fiche` : "Le flacon de cette fiche",
        short: `${productName} ${volume.replace(/(\d)(ml)/i, "$1 $2")}`,
        price,
        priceLabel: `${formatPrice(price)} €`,
        image,
        brand,
        locked: true,
      },
    ];

    const oil = pickOil(brand);
    if (oil) {
      list.push({
        key: "oil",
        cartId: `${slug}-oil`,
        title: "Huile de parfum assortie",
        subtitle: `${oil.name} · fixe le sillage sur les poignets`,
        short: "Huile de parfum assortie",
        price: oil.price,
        priceLabel: `${formatPrice(oil.price)} €`,
        image: oil.bottleImage,
        brand: oil.brand,
      });
    }

    list.push({
      key: "giftbox",
      cartId: `${slug}-giftbox`,
      title: `Coffret cadeau ${productName}`,
      subtitle: "Écrin rigide",
      short: "Coffret cadeau",
      price: GIFT_BOX_PRICE_EUR,
      priceLabel: `+ ${formatPrice(GIFT_BOX_PRICE_EUR)} €`,
      image: boxImage,
      brand,
    });

    // La déclinaison de la ligne d'abord (Khamrah → Khamrah Qahwa) : c'est le
    // parfum que le client compare déjà ; un « autre gourmand » au hasard
    // n'avait pas ce lien. Repli sur la proximité olfactive.
    const related = lineSiblings(slug, 1)[0] ?? relatedProducts(slug, 1)[0];
    if (related) {
      const samplePrice = related.product.sample?.price ?? SAMPLE_PRICE_EUR;
      const sampleMl = related.product.sample?.volumeMl ?? SAMPLE_VOLUME_ML;
      list.push({
        key: "sample",
        cartId: `${slug}-sample-${related.slug}`,
        title: `Échantillon ${related.product.name} · ${sampleMl} ml`,
        subtitle: `${related.product.name} (${related.product.brand}) · remboursé sur l'achat du flacon`,
        short: `Échantillon ${related.product.name}`,
        price: samplePrice,
        priceLabel: `${formatPrice(samplePrice)} €`,
        // `relatedProducts` écarte déjà les fiches sans visuel ; le repli ne
        // sert qu'à satisfaire le type (`image?`), jamais à l'écran.
        image: related.product.image ?? FALLBACK_IMAGE,
        brand: related.product.brand,
      });
    }

    return list;
  }, [slug, productName, brand, price, image, volume]);

  // Cochés au départ : le flacon (verrouillé) et l'huile — le duo qui fait la
  // collection ; l'écrin et la fiole restent un choix.
  const [checked, setChecked] = useState<Record<ItemKey, boolean>>({
    bottle: true,
    oil: true,
    giftbox: false,
    sample: false,
  });
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(false), TOAST_MS);
    return () => window.clearTimeout(t);
  }, [toast]);

  const selected = items.filter((i) => checked[i.key]);
  const gross = round2(selected.reduce((s, i) => s + i.price, 0));
  const discount = round2(selected.filter((i) => i.key !== "bottle").reduce((s, i) => s + i.price, 0) * COLLECTION_DISCOUNT);
  const total = round2(gross - discount);
  const remaining = round2(FREE_SHIPPING_THRESHOLD_EUR - total);
  const freeShipping = remaining <= 0;

  const toggle = (key: ItemKey) => setChecked((c) => ({ ...c, [key]: !c[key] }));

  const addCollection = () => {
    for (const item of selected) {
      // Les compléments entrent au prix remisé : le total du tiroir panier
      // doit être celui annoncé dans la colonne sombre, pas 10 % au-dessus.
      const unit = item.key === "bottle" ? item.price : round2(item.price * (1 - COLLECTION_DISCOUNT));
      addItem({ id: item.cartId, name: item.short, brand: item.brand, price: unit, image: item.image });
    }
    setToast(true);
  };

  return (
    <section aria-labelledby="dp-collection-title" style={{ marginTop: "3rem" }}>
      <style>{`
        .dp-collection { display: grid; grid-template-columns: 1fr 300px; gap: 1.25rem; align-items: start; }
        .dp-collection-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
        @media (max-width: 900px) {
          .dp-collection { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dp-collection-head">
        <div>
          <p
            style={{
              margin: "0 0 0.35rem",
              fontFamily: "var(--font-sans)",
              fontSize: "var(--t-xs)",
              fontWeight: "var(--fw-semibold)",
              letterSpacing: "var(--ls-widest)",
              textTransform: "uppercase",
              color: "var(--gold-700)",
            }}
          >
            Collection {productName}
          </p>
          <h2
            id="dp-collection-title"
            style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--t-title)", fontWeight: 600, color: "var(--ink-900)" }}
          >
            Complétez la collection {productName}
          </h2>
        </div>
        <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", color: "var(--ink-400)" }}>
          Cochez ce que vous souhaitez ajouter — le total se met à jour
        </p>
      </div>

      <div className="dp-collection">
        {/* Colonne gauche : les lignes cochables */}
        <div style={{ display: "grid", gap: "0.625rem" }}>
          {items.map((item) => {
            const on = checked[item.key];
            return (
              <label
                key={item.key}
                style={{
                  display: "grid",
                  gridTemplateColumns: `18px ${THUMB}px 1fr auto`,
                  alignItems: "center",
                  gap: "0.875rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--r-md)",
                  border: `1px solid ${on ? "var(--gold-500)" : "var(--line-200)"}`,
                  background: on ? "var(--gold-100)" : "var(--surface-white)",
                  cursor: item.locked ? "default" : "pointer",
                  transition: "border-color .15s, background .15s",
                }}
              >
                {/* Vraie case (accessible, clavier) masquée visuellement ; la pastille dessous est le rendu. */}
                <input
                  type="checkbox"
                  checked={on}
                  disabled={item.locked}
                  onChange={() => !item.locked && toggle(item.key)}
                  aria-label={item.title}
                  style={{ position: "absolute", opacity: 0, width: 1, height: 1, pointerEvents: "none" }}
                />
                <span
                  aria-hidden="true"
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "var(--r-sm)",
                    border: `1.5px solid ${on ? "var(--gold-700)" : "var(--line-300)"}`,
                    background: on ? "var(--gold-700)" : "var(--surface-white)",
                    display: "grid",
                    placeItems: "center",
                    opacity: item.locked ? 0.7 : 1,
                  }}
                >
                  {on && (
                    <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="var(--gold-100)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6.5 L4.8 9 L10 3.5" />
                    </svg>
                  )}
                </span>
                <span
                  style={{
                    position: "relative",
                    width: THUMB,
                    height: THUMB,
                    borderRadius: "var(--r-sm)",
                    background: "var(--surface-image)",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <Image src={item.image} alt="" fill sizes={`${THUMB}px`} style={{ objectFit: "contain", padding: 4 }} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "var(--t-sm)", fontWeight: 700, color: "var(--ink-900)" }}>
                    {item.title}
                  </span>
                  <span style={{ display: "block", marginTop: 2, fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", color: "var(--ink-500)" }}>
                    {item.subtitle}
                  </span>
                </span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 600, color: "var(--gold-700)", whiteSpace: "nowrap" }}>
                  {item.priceLabel}
                </span>
              </label>
            );
          })}
        </div>

        {/* Colonne droite : récapitulatif sombre */}
        <aside
          aria-label="Récapitulatif de la collection"
          style={{
            background: "var(--espresso-900)",
            color: "var(--gold-100)",
            borderRadius: "var(--r-lg)",
            padding: "1.25rem",
            fontFamily: "var(--font-sans)",
          }}
        >
          <p
            style={{
              margin: "0 0 0.75rem",
              fontSize: "var(--t-xs)",
              fontWeight: "var(--fw-semibold)",
              letterSpacing: "var(--ls-widest)",
              textTransform: "uppercase",
              color: "var(--gold-300)",
            }}
          >
            La collection
          </p>
          <p style={{ margin: "0 0 0.875rem", display: "flex", alignItems: "baseline", gap: "0.6rem", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 600, color: "var(--gold-300)", lineHeight: 1 }}>
              {formatPrice(total)} €
            </span>
            {discount > 0 && (
              <span style={{ fontSize: "var(--t-sm)", color: "var(--ink-400)", textDecoration: "line-through" }}>{formatPrice(gross)} €</span>
            )}
          </p>

          <dl style={{ margin: 0, display: "grid", gap: "0.4rem", fontSize: "var(--t-xs)" }}>
            {selected.map((item) => (
              <div key={item.key} style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
                <dt style={{ margin: 0, opacity: 0.85 }}>{item.short}</dt>
                <dd style={{ margin: 0, whiteSpace: "nowrap" }}>{formatPrice(item.price)} €</dd>
              </div>
            ))}
            {discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", color: "#9BC79E" /* --success éclairci pour le fond espresso */ }}>
                <dt style={{ margin: 0 }}>Remise collection</dt>
                <dd style={{ margin: 0, whiteSpace: "nowrap" }}>− {formatPrice(discount)} €</dd>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", paddingTop: "0.4rem", borderTop: "1px solid var(--line-dark)" }}>
              <dt style={{ margin: 0, opacity: 0.85 }}>Livraison</dt>
              <dd style={{ margin: 0, whiteSpace: "nowrap" }}>{freeShipping ? "offerte" : `${formatPrice(remaining)} € avant le port offert`}</dd>
            </div>
          </dl>

          <div style={{ position: "relative", marginTop: "1rem" }}>
            {toast && <MiniToast text="Collection ajoutée au panier" above />}
            <button
              type="button"
              onClick={addCollection}
              style={{
                width: "100%",
                padding: "0.85rem 1rem",
                border: 0,
                borderRadius: "var(--r-md)",
                background: GOLD_GRADIENT,
                color: "var(--espresso-900)",
                fontFamily: "var(--font-sans)",
                fontSize: "var(--t-sm)",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Ajouter la collection
            </button>
          </div>
          <p style={{ margin: "0.6rem 0 0", textAlign: "center", fontSize: "var(--t-xs)", opacity: 0.7 }}>
            Modifiable dans le panier · 4× sans frais PayPal
          </p>
        </aside>
      </div>
    </section>
  );
}
