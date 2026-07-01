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
import { addItem } from "@/lib/cart";
import { BUNDLE_PRODUCTS, type BundleProduct } from "@/data/bundle-products";

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

  /* Lot : liste d'ids, doublons autorisés (comme la maquette). */
  const [bundle, setBundle] = useState<string[]>([]);
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

  const handleAddToCart = useCallback(() => {
    if (!isComplete) return;
    // On ajoute les 3 parfums au PRIX PLEIN (pas de remise dans le localStorage).
    // La remise « le moins cher offert » est appliquée au checkout / serveur.
    bundle.forEach((id) => {
      const p = productOf(id);
      if (!p) return;
      addItem(
        { id: p.id, name: p.name, brand: p.brand, price: p.price, image: p.image },
        1
      );
    });
    showToast(`✓ Lot ajouté — ${fmt(totals.grand)} (économie ${fmt(totals.save)})`);
  }, [isComplete, bundle, productOf, totals.grand, totals.save, showToast]);

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

  /* ── Rendu d'un panneau (page ou modale) ── */
  const renderPanel = (modalMode: boolean) => {
    const titleId = `b3-title-${modalMode ? "modal" : "page"}`;
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
          <div className="b3-eyebrow">Offre exclusive</div>
          <h1 id={titleId}>
            3 parfums pour le prix de <b>2</b>
          </h1>
          <p>Composez votre trio — le moins cher vous est offert.</p>
        </div>

        {/* Grille produits */}
        <div className="b3-grid">
          {products.map((p) => {
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

        {/* Barre de lot (sticky bas) */}
        <div className="b3-tray">
          <div className="b3-progress">
            <div className="b3-lbl">
              <span>{`${count} / ${BUNDLE_SIZE} sélectionnés`}</span>
              <span className="msg">{progressMsg}</span>
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

          <button
            type="button"
            className="b3-cta"
            onClick={handleAddToCart}
            disabled={!isComplete}
          >
            {isComplete
              ? "Ajouter le lot au panier"
              : `Sélectionnez ${BUNDLE_SIZE - count} de plus`}
          </button>
        </div>

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
        <div className="b3-view-toggle" role="tablist" aria-label="Mode d'affichage">
          <button
            type="button"
            role="tab"
            aria-selected={!modalOpen}
            className={!modalOpen ? "active" : ""}
            onClick={() => setModalOpen(false)}
          >
            Vue pleine page
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={modalOpen}
            className={modalOpen ? "active" : ""}
            onClick={() => setModalOpen(true)}
          >
            Vue modale
          </button>
        </div>

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
        background:radial-gradient(120% 90% at 50% -10%, #2a2723 0%, var(--charcoal) 55%);
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
      .b3-price .now{ font-weight:600; font-size:1.15rem; color:var(--charcoal); }
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

      /* Barre de lot */
      .b3-tray{
        position:sticky; bottom:0; background:rgba(28,26,23,.97);
        backdrop-filter:blur(8px); color:var(--ivory);
        border-top:1px solid var(--line);
        padding:16px clamp(16px,3vw,30px);
        display:flex; align-items:center; gap:22px; flex-wrap:wrap;
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

      .b3-cta{
        font-family:inherit; font-weight:600; letter-spacing:.1em;
        text-transform:uppercase; font-size:.82rem;
        padding:15px 26px; border-radius:10px; border:none; cursor:pointer;
        background:var(--gold); color:var(--charcoal); transition:.25s; white-space:nowrap;
      }
      .b3-cta:disabled{ background:rgba(255,255,255,.12); color:var(--muted); cursor:not-allowed; }
      .b3-cta:not(:disabled):hover{ background:var(--gold-soft); transform:translateY(-1px); }

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
        .b3-cta{ width:100%; }
        .b3-slots{ justify-content:center; }
      }
    `}</style>
  );
}

export default BundleBuilder;
