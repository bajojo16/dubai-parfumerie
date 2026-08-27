"use client";

/**
 * BundleBuilder — « Lot 3 pour le prix de 2 ».
 *
 * Reproduction fidèle de la maquette de référence `lot-3-pour-2.html` :
 * design charcoal/ivoire/or, toggle page ↔ modale, cartes produit
 * (badge, compteur de quantité, notes, prix barré), barre de lot collante
 * (progression, emplacements « OFFERT », récap total), toasts, règle
 * « le moins cher est offert ». Doublons autorisés dans le lot, comme la
 * maquette (retrait via le ✕ d'un emplacement).
 *
 * ⚠️ HONNÊTETÉ SUR LA REMISE ⚠️
 * Ce repo n'utilise PAS Shopify. Le panier est un localStorage (`@/lib/cart`)
 * sans moteur de remise. La remise « le moins cher offert » affichée dans le
 * récap est une ESTIMATION. À l'ajout au panier, les produits du lot sont
 * écrits à leur PRIX PLEIN — aucune fausse remise silencieuse n'est stockée.
 * L'enforcement réel de la gratuité se ferait au checkout serveur (recalcul
 * du panier) ou, en cas de migration Shopify, via une remise automatique
 * « Buy 2 get 1 free » sur la collection `lot-3-pour-2`.
 *
 * RTL-safe : propriétés logiques uniquement (marginInline, insetInlineStart…).
 * Un seul bloc <style> scoped (préfixe `.b3`) pour keyframes / hover / media.
 */

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { addItem } from "@/lib/cart";
import { BUNDLE_PRODUCTS, type BundleProduct } from "@/data/bundle-products";
import { SAMPLE_PRODUCTS } from "@/data/sample-selector-products";

/* ── CONFIG (constantes ajustables) ── */
const BUNDLE_SIZE = 3; // nombre de parfums dans le lot
const PAY_FOR = 2; // nombre payé ⇒ (BUNDLE_SIZE - PAY_FOR) offert(s) = le/les moins cher(s)
const FREE_COUNT = BUNDLE_SIZE - PAY_FOR;
const CURRENCY = "€";
/** Handle de la collection éligible — référence documentaire (pas de fetch ici). */
const ELIGIBLE_COLLECTION_HANDLE = "lot-3-pour-2";

const FALLBACK_IMAGE = "/assets/prod-1.jpg";

const fmt = (n: number) =>
  `${CURRENCY} ${n.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/** Longueur minimale de recherche avant d'afficher le bandeau « hors offre ». */
const MIN_QUERY = 2;
/** Nombre max de parfums hors offre listés dans le bandeau. */
const MAX_INELIGIBLE_SHOWN = 4;
const ALL_BRANDS = "Toutes";

/** Normalisation recherche : minuscules, sans accents. */
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/** Clé d'identité produit inter-catalogues (marque + nom). */
const idKey = (brand: string, name: string) => `${norm(brand)}|${norm(name)}`;

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
  const externalModal = variant === "modal";
  const router = useRouter();

  /* Recherche + filtres de la grille. */
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>(ALL_BRANDS);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  /* Lot : liste d'ids, doublons autorisés (comme la maquette). */
  const [bundle, setBundle] = useState<string[]>([]);
  /* Nombre de lots à ajouter au panier (stepper CTA). */
  const [lotQty, setLotQty] = useState(1);
  /* Toggle interne page ↔ modale (uniquement en variant "page"). */
  const [modalOpen, setModalOpen] = useState(false);
  /* Toast. */
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2600);
  }, []);

  const priceOf = useCallback(
    (id: string) => products.find((p) => p.id === id)?.price ?? 0,
    [products]
  );
  const productOf = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const count = bundle.length;
  const isComplete = count === BUNDLE_SIZE;

  /* Aperçu remise : le/les moins cher(s) offert(s) — ici 1 offert sur 3. */
  const totals = useMemo(() => {
    const prices = bundle.map(priceOf).sort((a, b) => a - b);
    const sub = prices.reduce((a, b) => a + b, 0);
    const freeCount = Math.floor(count / BUNDLE_SIZE) * FREE_COUNT;
    const save = prices.slice(0, freeCount).reduce((a, b) => a + b, 0);
    return { sub, save, grand: sub - save };
  }, [bundle, count, priceOf]);

  /* ── Actions ── */
  const addToBundle = useCallback(
    (p: BundleProduct) => {
      if (!p.available) return;
      if (bundle.length >= BUNDLE_SIZE) {
        showToast("Lot complet — retirez un parfum pour en changer");
        return;
      }
      setBundle((prev) => [...prev, p.id]);
    },
    [bundle.length, showToast]
  );

  const removeOne = useCallback((id: string) => {
    setBundle((prev) => {
      const i = prev.indexOf(id);
      if (i < 0) return prev;
      const next = [...prev];
      next.splice(i, 1);
      return next;
    });
  }, []);

  /* Vider entièrement la liste des parfums sélectionnés. */
  const clearBundle = useCallback(() => {
    setBundle([]);
    setLotQty(1);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!isComplete) return;
    // On ajoute les 3 parfums au PRIX PLEIN (pas de remise dans le localStorage).
    // La remise « le moins cher offert » est appliquée au checkout / serveur.
    bundle.forEach((id) => {
      const p = productOf(id);
      if (!p) return;
      addItem(
        { id: p.id, name: p.name, brand: p.brand, price: p.price, image: p.image },
        lotQty
      );
    });
    const label = lotQty > 1 ? `${lotQty} lots ajoutés` : "Lot ajouté";
    showToast(`✓ ${label} — ${fmt(totals.grand * lotQty)} (économie ${fmt(totals.save * lotQty)})`);
  }, [isComplete, bundle, productOf, lotQty, totals.grand, totals.save, showToast]);

  const closeModal = useCallback(() => {
    if (externalModal) {
      onClose?.();
    } else {
      setModalOpen(false);
    }
  }, [externalModal, onClose]);

  const handleContinue = useCallback(() => {
    if (externalModal || modalOpen) closeModal();
    else showToast("Retour à la boutique");
  }, [externalModal, modalOpen, closeModal, showToast]);

  /* ── Verrou scroll + Échap quand une modale est ouverte ── */
  const anyModal = externalModal || modalOpen;
  useEffect(() => {
    if (!anyModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [anyModal, closeModal]);

  /* ── Message de progression ── */
  const progressMsg = (() => {
    if (count === 0) return "Ajoutez 3 parfums";
    if (count < BUNDLE_SIZE) {
      const r = BUNDLE_SIZE - count;
      return `Encore ${r} parfum${r > 1 ? "s" : ""} — ${
        FREE_COUNT === 1 ? "le moins cher est offert" : `les ${FREE_COUNT} moins chers sont offerts`
      }`;
    }
    return "🎉 Votre trio est complet !";
  })();

  /* ── Emplacements du lot (triés par prix croissant : le moins cher = offert) ── */
  const sortedBundle = useMemo(
    () => [...bundle].sort((a, b) => priceOf(a) - priceOf(b)),
    [bundle, priceOf]
  );

  /* ── Retour : historique si possible, sinon accueil ── */
  const goBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  }, [router]);

  /* ── Marques éligibles (chips de filtre) ── */
  const brands = useMemo(
    () => [ALL_BRANDS, ...Array.from(new Set(products.map((p) => p.brand))).sort()],
    [products]
  );

  const q = norm(query.trim());

  /* ── Grille filtrée : recherche (nom / marque / notes) + marque + stock ── */
  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        if (brandFilter !== ALL_BRANDS && p.brand !== brandFilter) return false;
        if (onlyAvailable && !p.available) return false;
        if (!q) return true;
        return norm(`${p.name} ${p.brand} ${p.notes}`).includes(q);
      }),
    [products, brandFilter, onlyAvailable, q]
  );

  /*
   * Catalogue du site MOINS les parfums de l'offre : sert à détecter qu'un
   * parfum cherché existe bien sur le site mais n'est pas éligible au lot.
   * (`SAMPLE_PRODUCTS` agrège déjà tendances / best-sellers / niche / familles.)
   */
  const ineligibleCatalog = useMemo(() => {
    const eligible = new Set(products.map((p) => idKey(p.brand, p.name)));
    return SAMPLE_PRODUCTS.filter((p) => !eligible.has(idKey(p.brand, p.name)));
  }, [products]);

  /* Parfums du site correspondant à la recherche mais HORS offre. */
  const ineligibleMatches = useMemo(() => {
    if (q.length < MIN_QUERY) return [];
    return ineligibleCatalog.filter((p) => norm(`${p.name} ${p.brand}`).includes(q));
  }, [ineligibleCatalog, q]);

  const resetFilters = useCallback(() => {
    setQuery("");
    setBrandFilter(ALL_BRANDS);
    setOnlyAvailable(false);
  }, []);

  /* ── Rendu d'un panneau (page ou modale) ── */
  const renderPanel = (modalMode: boolean) => {
    const titleId = `b3-title-${modalMode ? "modal" : "page"}`;

    /*
     * Barre de lot : collante en HAUT (juste sous le header du site,
     * position:sticky top) en variante "page", et toujours collante en
     * BAS en variante "modale" (comportement d'origine, inchangé — la
     * modale n'a pas le header du site au-dessus d'elle).
     */
    const tray = (
      <div className={`b3-tray${modalMode ? "" : " b3-tray-top"}`}>
        <div className="b3-progress">
          <div className="b3-lbl">
            <span>{`${count} / ${BUNDLE_SIZE} sélectionnés`}</span>
            <span className="msg">{progressMsg}</span>
            {count > 0 && (
              <button type="button" className="b3-clear" onClick={clearBundle}>
                ✕ Vider la liste
              </button>
            )}
          </div>
          <div className="b3-bar" aria-hidden>
            <span style={{ width: `${Math.min(100, (count / BUNDLE_SIZE) * 100)}%` }} />
          </div>
        </div>

        <div className="b3-slots">
          {Array.from({ length: BUNDLE_SIZE }).map((_, i) => {
            const id = sortedBundle[i];
            if (!id) {
              return (
                <div key={i} className="b3-slot">
                  {i + 1}
                </div>
              );
            }
            const p = productOf(id);
            const isFree = isComplete && i < FREE_COUNT;
            return (
              <div key={i} className={`b3-slot filled${isFree ? " free-tag" : ""}`}>
                <div className="mini">
                  <Image
                    src={p?.image || FALLBACK_IMAGE}
                    alt={p?.name ?? ""}
                    fill
                    sizes="44px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <button
                  type="button"
                  className="rm"
                  onClick={() => removeOne(id)}
                  aria-label={`Retirer ${p?.name ?? ""} du lot`}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        {isComplete && (
          <div className="b3-totals">
            <div className="row">
              <span>Sous-total</span>
              <span>{fmt(totals.sub)}</span>
            </div>
            <div className="row save">
              <span>Économie</span>
              <span>– {fmt(totals.save)}</span>
            </div>
            <div className="row grand">
              <span>Total</span>
              <b>{fmt(totals.grand)}</b>
            </div>
          </div>
        )}

        <div className="b3-cta-row">
          {isComplete && (
            <div className="b3-qty" role="group" aria-label="Nombre de lots">
              <button
                type="button"
                aria-label="Retirer un lot"
                onClick={() => setLotQty((q) => Math.max(1, q - 1))}
                disabled={lotQty <= 1}
              >
                −
              </button>
              <span aria-live="polite">{lotQty}</span>
              <button
                type="button"
                aria-label="Ajouter un lot"
                onClick={() => setLotQty((q) => Math.min(99, q + 1))}
              >
                +
              </button>
            </div>
          )}
          <button
            type="button"
            className="b3-cta"
            onClick={handleAddToCart}
            disabled={!isComplete}
          >
            {isComplete
              ? "Ajouter au panier"
              : `Sélectionnez ${BUNDLE_SIZE - count} de plus`}
          </button>
        </div>
      </div>
    );

    return (
      <div className={`b3-panel${modalMode ? " modal-mode" : ""}`}>
        {modalMode && (
          <button
            type="button"
            className="b3-close-x"
            onClick={closeModal}
            aria-label="Fermer"
          >
            ✕
          </button>
        )}

        <div className="b3-panel-head">
          {!modalMode && (
            <button type="button" className="b3-back" onClick={goBack} aria-label="Revenir à la page précédente">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: isRTL ? "scaleX(-1)" : "none" }}>
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
              Retour
            </button>
          )}
          <div className="b3-eyebrow">Offre exclusive</div>
          <h1 id={titleId}>
            3 parfums pour le prix de <b>2</b>
          </h1>
          <p>Composez votre trio — le moins cher vous est offert.</p>
        </div>

        {/* Barre de lot — collante en haut en variante page (sous le header) */}
        {!modalMode && tray}

        {/* Recherche + filtres */}
        <div className="b3-filters">
          <div className="b3-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un parfum, une marque, une note…"
              aria-label="Rechercher un parfum dans l'offre"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Effacer la recherche">
                ✕
              </button>
            )}
          </div>

          <div className="b3-chips" role="group" aria-label="Filtrer par marque">
            {brands.map((b) => (
              <button
                key={b}
                type="button"
                className={`b3-chip${brandFilter === b ? " active" : ""}`}
                aria-pressed={brandFilter === b}
                onClick={() => setBrandFilter(b)}
              >
                {b}
              </button>
            ))}
            <button
              type="button"
              className={`b3-chip stock${onlyAvailable ? " active" : ""}`}
              aria-pressed={onlyAvailable}
              onClick={() => setOnlyAvailable((v) => !v)}
            >
              En stock
            </button>
          </div>

          <div className="b3-results" aria-live="polite">
            {filteredProducts.length} parfum{filteredProducts.length > 1 ? "s" : ""} éligible
            {filteredProducts.length > 1 ? "s" : ""}
          </div>
        </div>

        {/* Bandeau : le parfum cherché existe sur le site mais est hors offre */}
        {ineligibleMatches.length > 0 && (
          <div className="b3-notice" role="status">
            <div className="b3-notice-head">
              <span className="ico" aria-hidden>
                !
              </span>
              <p>
                {ineligibleMatches.length === 1 ? (
                  <>
                    <b>{ineligibleMatches[0].name}</b> ({ineligibleMatches[0].brand}) est vendu sur
                    le site mais <b>ne fait pas partie de l&apos;offre 3 pour 2</b>.
                  </>
                ) : (
                  <>
                    <b>{ineligibleMatches.length} parfums</b> correspondant à votre recherche sont
                    vendus sur le site mais <b>ne font pas partie de l&apos;offre 3 pour 2</b>.
                  </>
                )}
              </p>
            </div>
            <ul className="b3-notice-list">
              {ineligibleMatches.slice(0, MAX_INELIGIBLE_SHOWN).map((p) => (
                <li key={p.id}>
                  <span className="thumb">
                    <Image
                      src={p.image || FALLBACK_IMAGE}
                      alt=""
                      aria-hidden
                      fill
                      sizes="36px"
                      style={{ objectFit: "cover" }}
                    />
                  </span>
                  <span className="txt">
                    <b>{p.name}</b>
                    <em>{p.brand}</em>
                  </span>
                  <span className="tag">Hors offre</span>
                </li>
              ))}
            </ul>
            {ineligibleMatches.length > MAX_INELIGIBLE_SHOWN && (
              <div className="b3-notice-more">
                + {ineligibleMatches.length - MAX_INELIGIBLE_SHOWN} autre
                {ineligibleMatches.length - MAX_INELIGIBLE_SHOWN > 1 ? "s" : ""}
              </div>
            )}
          </div>
        )}

        {/* Grille produits */}
        <div className="b3-grid">
          {filteredProducts.map((p) => {
            const qty = bundle.filter((x) => x === p.id).length;
            const inBundle = qty > 0;
            const soldOut = !p.available;
            return (
              <div
                key={p.id}
                className={`b3-card${inBundle ? " in-bundle" : ""}${soldOut ? " sold-out" : ""}`}
              >
                {p.badge && <div className="b3-badge">{p.badge}</div>}
                <div className="b3-qty-flag" aria-hidden>
                  {qty}
                </div>
                <div className="b3-bottle">
                  <Image
                    src={p.image || FALLBACK_IMAGE}
                    alt={`${p.name} — ${p.brand}`}
                    fill
                    sizes="(max-width:640px) 50vw, 220px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <h3>{p.name}</h3>
                <div className="b3-notes">{p.notes}</div>
                <div className="b3-price">
                  <span className="now">{fmt(p.price)}</span>
                  <span className="was">{fmt(p.was)}</span>
                </div>
                <button
                  type="button"
                  className="b3-add-btn"
                  onClick={() => addToBundle(p)}
                  disabled={soldOut}
                  aria-pressed={inBundle}
                  aria-label={
                    soldOut
                      ? `Épuisé — ${p.name}`
                      : inBundle
                        ? `Déjà dans le lot — ${p.name}`
                        : `Ajouter au lot — ${p.name}`
                  }
                >
                  {soldOut ? "Épuisé" : "Ajouter au lot"}
                </button>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="b3-empty">
            <p>Aucun parfum de l&apos;offre ne correspond à votre recherche.</p>
            <button type="button" onClick={resetFilters}>
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* Barre de lot — collante en bas en variante modale (comportement d'origine) */}
        {modalMode && tray}

        <div className="b3-continue">
          <a role="button" tabIndex={0} onClick={handleContinue} onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleContinue(); }
          }}>
            Continuer mes achats
          </a>
        </div>

        {/* Note dev : collection éligible (non utilisée pour un fetch ici). */}
        <span style={{ display: "none" }} aria-hidden data-collection={ELIGIBLE_COLLECTION_HANDLE} />
      </div>
    );
  };

  const toast = (
    <div className={`b3-toast${toastMsg ? " show" : ""}`} role="status" aria-live="polite">
      {toastMsg}
    </div>
  );

  /* ── Variant "modal" externe : overlay seul, piloté par onClose ── */
  if (externalModal) {
    return (
      <div className="b3" dir={isRTL ? "rtl" : "ltr"}>
        <div
          className="b3-overlay open"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="b3-title-modal">
            {renderPanel(true)}
          </div>
        </div>
        {toast}
        <ScopedStyles />
      </div>
    );
  }

  /* ── Variant "page" : toggle + panneau inline, overlay au besoin ── */
  return (
    <div className="b3" dir={isRTL ? "rtl" : "ltr"}>
      <div className="b3-wrap">

        <div className="b3-page-host">{renderPanel(false)}</div>
      </div>

      {modalOpen && (
        <div
          className="b3-overlay open"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="b3-title-modal">
            {renderPanel(true)}
          </div>
        </div>
      )}

      {toast}
      <ScopedStyles />
    </div>
  );
}

/* ── Styles scoped (préfixe .b3) — port de la maquette lot-3-pour-2.html ── */
function ScopedStyles() {
  return (
    <style>{`
      .b3{
        --charcoal:#1c1a17; --charcoal-soft:#252220;
        --ivory:#f6f1e7; --ivory-dim:#e9e1d2;
        --gold:#c9a227; --gold-soft:#d8b94e;
        --line:rgba(201,162,39,.28); --muted:#9a938a; --danger:#b45454;
        --radius:14px; --shadow:0 24px 60px -28px rgba(0,0,0,.55);
        font-family:var(--font-sans,'Jost',sans-serif);
        color:var(--ivory);
        -webkit-font-smoothing:antialiased;
      }
      .b3-wrap{
        max-width:1180px; margin-inline:auto;
        min-height:100vh;
        padding:clamp(16px,4vw,48px);
        background:transparent;
      }

      /* Toggle page / modale */
      .b3-view-toggle{ display:flex; gap:8px; justify-content:center; margin-bottom:28px; }
      .b3-view-toggle button{
        font-family:inherit; font-size:.72rem; letter-spacing:.14em;
        text-transform:uppercase; color:var(--muted);
        background:transparent; border:1px solid rgba(255,255,255,.12);
        padding:9px 16px; border-radius:999px; cursor:pointer; transition:.25s;
      }
      .b3-view-toggle button.active{ color:var(--charcoal); background:var(--gold); border-color:var(--gold); }

      /* Panel */
      .b3-panel{
        background:linear-gradient(180deg,#fdfaf3,#f6f1e7);
        color:var(--charcoal);
        border-radius:var(--radius);
        box-shadow:var(--shadow);
        overflow:hidden; position:relative;
      }
      .b3-panel.modal-mode{ max-width:1000px; margin-inline:auto; }

      .b3-panel-head{ text-align:center; padding:38px 24px 8px; position:relative; }
      .b3-eyebrow{ font-size:.7rem; letter-spacing:.32em; text-transform:uppercase; color:var(--gold); margin-bottom:14px; }
      .b3-panel-head h1{
        font-family:var(--font-display,'Cormorant Garamond',serif); font-weight:600;
        font-size:clamp(1.9rem,4.5vw,2.9rem); line-height:1.05; color:var(--charcoal); margin:0;
      }
      .b3-panel-head h1 b{ color:var(--gold); font-weight:700; }
      .b3-panel-head p{ color:#6f6a62; margin-top:10px; font-weight:300; font-size:.98rem; }

      .b3-close-x{
        position:absolute; top:18px; inset-inline-end:20px; width:38px; height:38px; border-radius:50%;
        border:1px solid rgba(0,0,0,.15); background:#fff; cursor:pointer;
        font-size:1.1rem; color:#555; display:grid; place-items:center; z-index:2;
      }

      /* Bouton retour (variante page) */
      .b3-back{
        position:absolute; top:18px; inset-inline-start:20px;
        display:inline-flex; align-items:center; gap:7px;
        font-family:inherit; font-size:.78rem; letter-spacing:.06em;
        color:#6f6a62; background:#fff; border:1px solid rgba(0,0,0,.12);
        border-radius:999px; padding:9px 16px 9px 13px; cursor:pointer;
        transition:.22s; z-index:2;
      }
      .b3-back:hover{ color:var(--charcoal); border-color:var(--gold); }
      .b3-back:focus-visible{ outline:2px solid var(--gold); outline-offset:2px; }
      @media(max-width:640px){
        .b3-back{ position:static; margin:0 auto 16px; }
      }

      /* Recherche + filtres */
      .b3-filters{
        display:flex; flex-wrap:wrap; align-items:center; gap:12px;
        padding:20px clamp(16px,3vw,30px) 4px;
      }
      .b3-search{
        display:flex; align-items:center; gap:9px; flex:1 1 260px; min-width:0;
        background:#fff; border:1px solid #e2d9c6; border-radius:10px;
        padding:0 12px; height:44px; color:#9a938a;
        transition:border-color .2s;
      }
      .b3-search:focus-within{ border-color:var(--gold); }
      .b3-search input{
        flex:1; min-width:0; border:none; outline:none; background:transparent;
        font-family:inherit; font-size:.9rem; color:var(--charcoal);
      }
      .b3-search input::placeholder{ color:#b0a89b; }
      .b3-search input::-webkit-search-cancel-button{ display:none; }
      .b3-search button{
        border:none; background:transparent; cursor:pointer;
        color:#9a938a; font-size:.85rem; padding:4px;
      }
      .b3-search button:hover{ color:var(--charcoal); }

      .b3-chips{ display:flex; flex-wrap:wrap; gap:7px; }
      .b3-chip{
        font-family:inherit; font-size:.74rem; letter-spacing:.04em;
        color:#6f6a62; background:#fff; border:1px solid #e2d9c6;
        border-radius:999px; padding:8px 14px; cursor:pointer; transition:.2s;
      }
      .b3-chip:hover{ border-color:var(--gold); color:var(--charcoal); }
      .b3-chip.active{ background:var(--charcoal); border-color:var(--charcoal); color:var(--ivory); }
      .b3-chip.stock.active{ background:var(--gold); border-color:var(--gold); color:var(--charcoal); }
      .b3-chip:focus-visible{ outline:2px solid var(--gold); outline-offset:2px; }

      .b3-results{ font-size:.76rem; color:#9a938a; margin-inline-start:auto; white-space:nowrap; }

      /* Bandeau « parfum hors offre » */
      .b3-notice{
        margin:14px clamp(16px,3vw,30px) 0;
        background:#fdf6e3; border:1px solid #e8d9a8;
        border-inline-start:3px solid var(--gold);
        border-radius:10px; padding:14px 16px;
      }
      .b3-notice-head{ display:flex; align-items:flex-start; gap:10px; }
      .b3-notice-head .ico{
        flex:0 0 auto; width:20px; height:20px; border-radius:50%;
        background:var(--gold); color:var(--charcoal);
        display:grid; place-items:center; font-weight:700; font-size:.76rem;
      }
      .b3-notice-head p{ margin:0; font-size:.86rem; color:#6b5a2b; line-height:1.5; }
      .b3-notice-head b{ color:var(--charcoal); font-weight:600; }

      .b3-notice-list{ list-style:none; margin:12px 0 0; padding:0; display:grid; gap:8px; }
      .b3-notice-list li{
        display:flex; align-items:center; gap:10px;
        background:#fff; border:1px solid #efe4c9; border-radius:8px; padding:7px 10px;
      }
      .b3-notice-list .thumb{
        position:relative; width:36px; height:36px; flex:0 0 auto;
        border-radius:6px; overflow:hidden; background:#f3ece0;
      }
      .b3-notice-list .txt{ display:flex; flex-direction:column; min-width:0; }
      .b3-notice-list .txt b{ font-size:.85rem; color:var(--charcoal); font-weight:600; }
      .b3-notice-list .txt em{ font-style:normal; font-size:.72rem; color:#9a938a; }
      .b3-notice-list .tag{
        margin-inline-start:auto; font-size:.62rem; letter-spacing:.08em;
        text-transform:uppercase; font-weight:600;
        background:#f2e6c9; color:#8a6d10; padding:4px 9px; border-radius:6px; white-space:nowrap;
      }
      .b3-notice-more{ margin-top:8px; font-size:.75rem; color:#9a938a; }

      /* État vide */
      .b3-empty{ text-align:center; padding:34px 20px 10px; }
      .b3-empty p{ margin:0 0 14px; color:#6f6a62; font-size:.92rem; }
      .b3-empty button{
        font-family:inherit; font-size:.78rem; letter-spacing:.08em; text-transform:uppercase;
        background:var(--charcoal); color:var(--ivory); border:none;
        border-radius:9px; padding:12px 22px; cursor:pointer;
      }
      .b3-empty button:hover{ background:#000; }

      /* Grille produits */
      .b3-grid{
        display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr));
        gap:16px; padding:22px clamp(16px,3vw,30px) 8px;
      }
      .b3-card{
        background:#fff; border:1px solid #ece5d6; border-radius:12px;
        padding:16px 16px 18px; display:flex; flex-direction:column;
        transition:.25s; position:relative; text-align:center;
      }
      .b3-card.in-bundle{ border-color:var(--gold); box-shadow:0 0 0 1px var(--gold) inset; }
      .b3-card.sold-out{ opacity:.72; }
      .b3-badge{
        position:absolute; top:10px; inset-inline-start:10px; background:#f2e6c9; color:#8a6d10;
        font-size:.62rem; letter-spacing:.1em; text-transform:uppercase;
        padding:4px 8px; border-radius:6px; font-weight:600; z-index:1;
      }
      .b3-qty-flag{
        position:absolute; top:10px; inset-inline-end:10px; background:var(--gold); color:var(--charcoal);
        width:24px; height:24px; border-radius:50%; display:none; place-items:center;
        font-weight:600; font-size:.8rem; z-index:1;
      }
      .b3-card.in-bundle .b3-qty-flag{ display:grid; }

      .b3-bottle{
        position:relative; height:150px; margin:6px 0 14px;
        border-radius:10px; overflow:hidden; background:#f3ece0;
      }

      .b3-card h3{
        font-family:var(--font-display,'Cormorant Garamond',serif); font-weight:600; font-size:1.18rem;
        color:var(--charcoal); text-align:center; line-height:1.15; margin:0;
      }
      .b3-notes{ color:#9a938a; font-size:.76rem; text-align:center; margin:3px 0 12px; font-weight:300; }
      .b3-price{ text-align:center; margin-bottom:14px; }
      .b3-price .now{ font-family:var(--font-display,'Cormorant Garamond',serif); font-weight:600; font-size:1.32rem; color:var(--charcoal); font-variant-numeric:lining-nums; }
      .b3-price .was{ color:#b7b0a4; text-decoration:line-through; font-size:.92rem; margin-inline-start:6px; }

      .b3-add-btn{
        margin-top:auto; font-family:inherit; font-weight:500;
        letter-spacing:.08em; text-transform:uppercase; font-size:.78rem;
        padding:12px; border-radius:9px; border:1px solid var(--charcoal);
        background:var(--charcoal); color:var(--ivory); cursor:pointer; transition:.2s;
      }
      .b3-add-btn:hover{ background:#000; }
      .b3-card.in-bundle .b3-add-btn{ background:#fff; color:var(--charcoal); }
      .b3-card.in-bundle .b3-add-btn::before{ content:"✓ Ajouté — "; }
      .b3-add-btn:disabled{ background:#e7dec9; border-color:#e7dec9; color:#8a8278; cursor:not-allowed; }
      .b3-card.sold-out .b3-add-btn::before{ content:""; }

      /* Barre de lot — collante en bas par défaut (variante modale) */
      .b3-tray{
        position:sticky; bottom:0; background:rgba(28,26,23,.97);
        backdrop-filter:blur(8px); color:var(--ivory);
        border-top:1px solid var(--line);
        padding:16px clamp(16px,3vw,30px);
        display:flex; align-items:center; gap:22px; flex-wrap:wrap;
      }
      /* Variante page : collante en HAUT, juste sous le header sticky du site
         (74px de hauteur, cf. Header.tsx). Reste au-dessus de la grille produits
         qui défile dessous (z-index) et inverse la bordure de séparation. */
      .b3-tray-top{
        bottom:auto; top:74px; z-index:5;
        border-top:none; border-bottom:1px solid var(--line);
        box-shadow:0 12px 24px -18px rgba(0,0,0,.5);
      }
      .b3-progress{ flex:1; min-width:220px; }
      .b3-lbl{ display:flex; justify-content:space-between; font-size:.8rem; margin-bottom:7px; color:var(--ivory-dim); gap:12px; }
      .b3-lbl .msg{ color:var(--gold-soft); text-align:end; }
      .b3-bar{ height:7px; background:rgba(255,255,255,.12); border-radius:99px; overflow:hidden; }
      .b3-bar span{ display:block; height:100%; width:0; background:linear-gradient(90deg,var(--gold),var(--gold-soft)); transition:width .35s ease; }

      .b3-slots{ display:flex; gap:8px; }
      .b3-slot{
        width:44px; height:44px; border-radius:9px; border:1px dashed rgba(255,255,255,.25);
        display:grid; place-items:center; font-size:.7rem; color:var(--muted); position:relative;
        overflow:hidden; background:rgba(255,255,255,.03);
      }
      .b3-slot.filled{ border-style:solid; border-color:var(--gold); background:#fff; }
      .b3-slot .mini{ position:absolute; inset:0; }
      .b3-slot.free-tag::after{
        content:"OFFERT"; position:absolute; bottom:0; inset-inline:0;
        background:var(--gold); color:var(--charcoal); font-size:.5rem; font-weight:700;
        letter-spacing:.04em; text-align:center; padding:1px 0; z-index:2;
      }
      .b3-slot .rm{
        position:absolute; top:-6px; inset-inline-end:-6px; background:var(--danger); color:#fff;
        width:18px; height:18px; border-radius:50%; font-size:.7rem; display:none; place-items:center;
        cursor:pointer; border:2px solid var(--charcoal); padding:0; z-index:3;
      }
      .b3-slot.filled:hover .rm, .b3-slot.filled:focus-within .rm{ display:grid; }

      .b3-totals{ text-align:end; min-width:150px; }
      .b3-totals .row{ font-size:.82rem; color:var(--ivory-dim); display:flex; justify-content:space-between; gap:18px; }
      .b3-totals .row.save{ color:var(--gold-soft); }
      .b3-totals .row.grand{ margin-top:5px; padding-top:6px; border-top:1px solid rgba(255,255,255,.14); }
      .b3-totals .row.grand b{ font-size:1.25rem; color:#fff; font-family:var(--font-display,'Cormorant Garamond',serif); }

      .b3-cta-row{ display:flex; align-items:stretch; gap:12px; }
      .b3-cta{
        font-family:inherit; font-weight:600; letter-spacing:.1em;
        text-transform:uppercase; font-size:.82rem;
        padding:15px 26px; border-radius:10px; border:none; cursor:pointer;
        background:var(--gold); color:var(--charcoal); transition:.25s; white-space:nowrap;
      }
      .b3-cta:disabled{ background:rgba(255,255,255,.12); color:var(--muted); cursor:not-allowed; }
      .b3-cta:not(:disabled):hover{ background:var(--gold-soft); transform:translateY(-1px); }

      /* Stepper nombre de lots (façon pilule) */
      .b3-qty{
        display:inline-flex; align-items:center; gap:2px;
        background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.16);
        border-radius:999px; padding:3px;
      }
      .b3-qty button{
        width:34px; height:34px; border-radius:50%; border:none; cursor:pointer;
        background:transparent; color:var(--gold); font-size:1.15rem; line-height:1;
        display:grid; place-items:center; transition:.2s;
      }
      .b3-qty button:not(:disabled):hover{ background:rgba(201,162,74,.18); }
      .b3-qty button:disabled{ color:var(--muted); cursor:not-allowed; }
      .b3-qty span{
        min-width:26px; text-align:center; color:#fff; font-weight:600;
        font-size:.95rem; font-variant-numeric:tabular-nums;
      }

      /* Bouton vider la liste */
      .b3-clear{
        margin-inline-start:12px; background:transparent; border:none; cursor:pointer;
        color:var(--gold-soft); font-family:inherit; font-size:.72rem; font-weight:600;
        letter-spacing:.04em; text-decoration:underline; text-underline-offset:2px; padding:0;
        transition:.2s; white-space:nowrap;
      }
      .b3-clear:hover{ color:#fff; }

      .b3-continue{ text-align:center; padding:16px; background:#f6f1e7; }
      .b3-continue a{ color:#6f6a62; font-size:.85rem; text-decoration:underline; cursor:pointer; }

      /* Overlay modale */
      .b3-overlay{
        position:fixed; inset:0; background:rgba(10,9,8,.72);
        backdrop-filter:blur(3px); z-index:1000; padding:clamp(10px,3vw,40px);
        overflow:auto; display:grid; place-items:start center;
      }
      .b3-overlay > div{ width:100%; max-width:1000px; }

      .b3-toast{
        position:fixed; bottom:24px; inset-inline-start:50%; transform:translateX(-50%) translateY(20px);
        background:var(--charcoal); color:var(--ivory); border:1px solid var(--line);
        padding:12px 20px; border-radius:10px; font-size:.85rem; opacity:0;
        transition:.3s; z-index:1200; pointer-events:none; max-width:90vw; text-align:center;
      }
      .b3-toast.show{ opacity:1; transform:translateX(-50%) translateY(0); }

      @media(max-width:640px){
        .b3-tray{ flex-direction:column; align-items:stretch; gap:14px; }
        .b3-totals{ text-align:start; }
        .b3-cta-row{ width:100%; }
        .b3-cta{ flex:1; width:auto; }
        .b3-slots{ justify-content:center; }
      }
    `}</style>
  );
}

export default BundleBuilder;
