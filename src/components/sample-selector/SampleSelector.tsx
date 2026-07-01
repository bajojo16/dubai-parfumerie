"use client";

/**
 * SampleSelector — « Composez votre sélection d'échantillons ».
 *
 * Reproduction fidèle (design + logique) de
 *   reference/selecteur-echantillons-mockup.html
 * en React/TS, branchée sur le catalogue réel (SAMPLE_PRODUCTS), RTL-safe
 * (propriétés logiques) et accessible (vignettes focusables clavier, aria).
 *
 * Adaptations vs maquette (stack réel, pas de Shopify) :
 *  - flacons SVG génériques remplacés par les VRAIES images produit
 *    (repli flacon SVG teinté par famille si l'image manque) ;
 *  - N (nombre d'échantillons) dynamique via la prop `sampleCount` ;
 *  - « Ajouter au panier » branché sur lib/cart.addItem (une ligne « coffret »)
 *    + payload « Échantillon n°k » loggé et affiché comme dans la maquette.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addItem } from "@/lib/cart";
import {
  SAMPLE_PRODUCTS,
  SAMPLE_BRANDS,
  SAMPLE_COLLECTIONS,
  COLLECTION_META,
  SAMPLE_FAMILIES,
  type SampleProduct,
  type SampleCollectionId,
} from "@/data/sample-selector-products";

// ─── Palette maquette (hex exacts pour la fidélité) ──────────────────────────
const C = {
  charcoal: "#1c1a17",
  charcoalSoft: "#2a2622",
  ivory: "#f6f1e7",
  ivory2: "#efe8d9",
  gold: "#c2a15b",
  goldDeep: "#a9873f",
  line: "rgba(28,26,23,.12)",
  lineStrong: "rgba(28,26,23,.22)",
  shadow: "0 18px 50px -24px rgba(28,26,23,.45)",
};

type Crit = "bestsellers" | "affinity" | "discovery";
type QtyMap = Record<string, number>;

export interface SampleSelectorProps {
  /** N — nombre d'emplacements du coffret (défaut 10, comme la maquette). */
  sampleCount?: number;
  /** Catalogue (défaut : dérivé du catalogue existant). */
  products?: SampleProduct[];
  /** Locale (structure prête i18n ; textes FR ici). */
  locale?: string;
  /** Libellés éditoriaux (surchargeable). */
  brandmark?: string;
  /** Prix nominal de la ligne « coffret » ajoutée au panier. */
  coffretPrice?: number;
  /** Image de la ligne panier « coffret ». */
  coffretImage?: string;
}

// ─── Flacon SVG de repli (teinté par famille) ────────────────────────────────
function Vial({ tint, size = "52%" }: { tint: string; size?: string }) {
  return (
    <svg
      viewBox="0 0 60 120"
      aria-hidden="true"
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id={`vg-${tint.replace("#", "")}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e9d59a" />
          <stop offset=".5" stopColor="#c2a15b" />
          <stop offset="1" stopColor="#a9873f" />
        </linearGradient>
      </defs>
      <rect x="24" y="2" width="12" height="16" rx="2" fill="#f3ede0" stroke="#d9cfba" />
      <rect x="18" y="16" width="24" height="14" rx="3" fill={`url(#vg-${tint.replace("#", "")})`} />
      <rect x="20" y="28" width="20" height="72" rx="6" fill={tint} opacity=".9" stroke="#d9cfba" />
      <rect x="20" y="28" width="7" height="72" rx="6" fill="#ffffff" opacity=".28" />
      <rect x="26" y="60" width="8" height="42" rx="3" fill="#ffffff" opacity=".55" />
    </svg>
  );
}

// ─── Vignette produit ────────────────────────────────────────────────────────
function Thumb({ p }: { p: SampleProduct }) {
  const [err, setErr] = useState(false);
  const tint = SAMPLE_FAMILIES[p.family].tint;
  if (err || !p.image) {
    return <Vial tint={tint} />;
  }
  // Image réelle en couverture (repli flacon SVG si chargement échoue).
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={p.image}
      alt=""
      onError={() => setErr(true)}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}

const sum = (o: QtyMap) => Object.values(o).reduce((a, b) => a + b, 0);

export default function SampleSelector({
  sampleCount = 10,
  products = SAMPLE_PRODUCTS,
  locale = "fr",
  brandmark = "Dubai Parfumerie",
  coffretPrice = 24.9,
  coffretImage = "/assets/coffrets.jpg",
}: SampleSelectorProps) {
  const MAX = sampleCount;
  const PRODUCTS = products;
  const BRANDS = useMemo(
    () =>
      products === SAMPLE_PRODUCTS
        ? SAMPLE_BRANDS
        : ["Toutes", ...Array.from(new Set(products.map((p) => p.brand)))],
    [products],
  );

  const [man, setMan] = useState<QtyMap>({});
  const [auto, setAuto] = useState<QtyMap>({});
  const [filterBrand, setFilterBrand] = useState("Toutes");
  const [filterCol, setFilterCol] = useState<SampleCollectionId | "all">("all");
  const [q, setQ] = useState("");
  const [crit, setCrit] = useState<Crit>("bestsellers");
  const [stuck, setStuck] = useState(false);

  const toolbarRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [tbH, setTbH] = useState(150);

  const P = useCallback(
    (id: string) => PRODUCTS.find((x) => x.id === id),
    [PRODUCTS],
  );
  const totalMan = sum(man);
  const totalAuto = sum(auto);
  const total = totalMan + totalAuto;

  // ─── Sticky : offset de la barre d'outils + état « épinglé » du bandeau ────
  useEffect(() => {
    const tb = toolbarRef.current;
    const sent = sentinelRef.current;
    if (!tb || !sent) return;
    const setH = () => setTbH(tb.offsetHeight);
    setH();
    const ro = new ResizeObserver(setH);
    ro.observe(tb);
    window.addEventListener("resize", setH);
    const io = new IntersectionObserver(
      ([e]) => setStuck(!e.isIntersecting),
      { rootMargin: `-${tb.offsetHeight + 1}px 0px 0px 0px`, threshold: 0 },
    );
    io.observe(sent);
    return () => {
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("resize", setH);
    };
  }, []);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const removeOneAuto = (next: QtyMap) => {
    const ks = Object.keys(next);
    const k = ks[ks.length - 1];
    if (!k) return;
    if (next[k] > 1) next[k]--;
    else delete next[k];
  };

  const addMan = (id: string, d: number) => {
    setMan((prevMan) => {
      const cur = prevMan[id] || 0;
      const nextMan = { ...prevMan };
      if (d > 0 && sum(prevMan) + totalAuto >= MAX) {
        if (totalAuto > 0) {
          setAuto((prevAuto) => {
            const na = { ...prevAuto };
            removeOneAuto(na);
            return na;
          });
        } else {
          return prevMan; // plafond atteint, aucun auto à libérer
        }
      }
      const nv = cur + d;
      if (nv <= 0) delete nextMan[id];
      else nextMan[id] = nv;
      return nextMan;
    });
  };

  const pin = (id: string) => {
    setAuto((prevAuto) => {
      const aq = prevAuto[id] || 0;
      if (!aq) return prevAuto;
      const na = { ...prevAuto };
      delete na[id];
      setMan((prevMan) => ({ ...prevMan, [id]: (prevMan[id] || 0) + aq }));
      return na;
    });
  };

  const removeAuto = (id: string) =>
    setAuto((prev) => {
      const na = { ...prev };
      delete na[id];
      return na;
    });

  const removeSlot = (map: "man" | "auto", id: string) => {
    if (map === "man") setMan((prev) => { const n = { ...prev }; delete n[id]; return n; });
    else removeAuto(id);
  };

  const clearAuto = () => setAuto({});

  // ─── Complétion « maison » : 3 algorithmes (best / affinité / découverte) ──
  const pickAuto = useCallback(() => {
    const gap = MAX - totalMan;
    if (gap <= 0) {
      setAuto({});
      return;
    }
    const taken = new Set(Object.keys(man));
    const pool = PRODUCTS.filter((p) => !taken.has(p.id));
    const next: QtyMap = {};

    if (crit === "bestsellers") {
      [...pool]
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, gap)
        .forEach((p) => (next[p.id] = 1));
    } else if (crit === "affinity") {
      const fc: Record<string, number> = {};
      Object.keys(man).forEach((id) => {
        const f = P(id)?.family;
        if (f) fc[f] = (fc[f] || 0) + man[id];
      });
      const has = Object.keys(fc).length > 0;
      const sorted = [...pool].sort((a, b) =>
        has
          ? (fc[b.family] || 0) - (fc[a.family] || 0) || b.popularity - a.popularity
          : b.popularity - a.popularity,
      );
      sorted.slice(0, gap).forEach((p) => (next[p.id] = 1));
    } else {
      // découverte : maximise la diversité de familles
      const owned = new Set(Object.keys(man).map((id) => P(id)?.family));
      const byNovel = [...pool].sort(
        (a, b) =>
          (Number(owned.has(a.family)) - Number(owned.has(b.family))) ||
          b.popularity - a.popularity,
      );
      const picked: SampleProduct[] = [];
      const usedFam = new Set<string>();
      while (picked.length < gap && byNovel.length) {
        let i = byNovel.findIndex((p) => !usedFam.has(p.family));
        if (i === -1) {
          i = 0;
          usedFam.clear();
        }
        const p = byNovel.splice(i, 1)[0];
        usedFam.add(p.family);
        picked.push(p);
      }
      picked.forEach((p) => (next[p.id] = 1));
    }
    setAuto(next);
  }, [MAX, totalMan, man, PRODUCTS, crit, P]);

  const onCrit = (c: Crit) => {
    setCrit(c);
    if (totalAuto > 0) {
      // régénère avec le nouveau critère (effet via pickAuto au prochain rendu)
      setTimeout(() => pickAutoRef.current(), 0);
    }
  };
  const pickAutoRef = useRef(pickAuto);
  useEffect(() => {
    pickAutoRef.current = pickAuto;
  }, [pickAuto]);

  // ─── Filtrage ───────────────────────────────────────────────────────────
  const matchFilter = (p: SampleProduct) => {
    const okBrand = filterBrand === "Toutes" || p.brand === filterBrand;
    const okCol = filterCol === "all" || p.tags.includes(filterCol as SampleCollectionId);
    const okQ =
      p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    return okBrand && okCol && okQ;
  };
  const list = PRODUCTS.filter(matchFilter);
  const full = total >= MAX;

  // ─── Payload « aperçu des données envoyées » ──────────────────────────────
  const payloadPairs = useMemo(() => {
    const pairs: { label: string; value: string }[] = [];
    let idx = 1;
    const push = (map: QtyMap) =>
      Object.entries(map).forEach(([id, qy]) => {
        const p = P(id);
        if (!p) return;
        for (let k = 0; k < qy; k++) {
          pairs.push({ label: `Échantillon n°${idx}`, value: `${p.name} - ${p.brand}` });
          idx++;
        }
      });
    push(man);
    push(auto);
    return pairs;
  }, [man, auto, P]);

  const payloadText = payloadPairs.length
    ? "{\n" +
      payloadPairs.map((p) => `  "${p.label}": "${p.value}"`).join(",\n") +
      "\n}"
    : "Aucun échantillon sélectionné.";

  // ─── Ajout au panier ──────────────────────────────────────────────────────
  const onSubmit = () => {
    if (total !== MAX) return;
    // Payload compatible « Échantillon n°k » (comme la maquette).
    // eslint-disable-next-line no-console
    console.log("[SampleSelector] payload panier :", JSON.parse(payloadText));
    addItem(
      {
        id: `sample-coffret-${MAX}-${Date.now()}`,
        name: `Coffret découverte · ${MAX} échantillons`,
        brand: brandmark,
        price: coffretPrice,
        image: coffretImage,
      },
      1,
    );
    setMan({});
    setAuto({});
  };

  // ─── Rendu ────────────────────────────────────────────────────────────────
  const assistHidden = MAX - totalMan <= 0 && totalAuto === 0;
  const hasAuto = totalAuto > 0;
  const remaining = MAX - totalMan;

  return (
    <div className="ss-root" dir={locale === "ar" ? "rtl" : "ltr"} style={{ background: C.ivory, color: C.charcoal, paddingBottom: 118 }}>
      <StyleBlock />

      {/* ── Topbar ── */}
      <div className="ss-topbar" style={{ textAlign: "center", padding: "32px 0 6px", borderBottom: `1px solid ${C.line}` }}>
        <p style={{ fontFamily: "'Jost',var(--font-sans)", fontWeight: 500, letterSpacing: ".42em", fontSize: 12, textTransform: "uppercase", color: C.goldDeep, margin: "0 0 16px" }}>{brandmark}</p>
        <p style={{ fontWeight: 400, letterSpacing: ".34em", textTransform: "uppercase", fontSize: 11, opacity: 0.55, margin: "0 0 10px" }}>Coffret découverte · {MAX} échantillons</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond',var(--font-display)", fontWeight: 500, fontSize: "clamp(28px,5vw,44px)", lineHeight: 1.02, margin: "0 auto 12px", maxWidth: "16ch" }}>Composez votre sélection d&apos;échantillons</h1>
        <p style={{ fontWeight: 300, fontSize: 15, lineHeight: 1.6, opacity: 0.72, maxWidth: "52ch", margin: "0 auto 24px" }}>Choisissez vos coups de cœur… ou laissez la maison compléter les emplacements restants selon vos goûts et nos best-sellers.</p>
        <div className="ss-progress" style={{ display: "inline-flex", alignItems: "center", gap: 14, margin: "0 auto 26px", padding: "11px 22px", borderRadius: 100, background: C.charcoal, color: C.ivory }}>
          <span style={{ fontFamily: "'Cormorant Garamond',var(--font-display)", fontSize: 22, fontWeight: 600, lineHeight: 1 }}>
            <b style={{ color: C.gold }}>{total}</b> / <span>{MAX}</span>
          </span>
          <div style={{ display: "flex", gap: 5 }}>
            {Array.from({ length: MAX }).map((_, i) => (
              <span key={i} style={{ width: 22, height: 3, borderRadius: 2, transition: ".35s", background: i < totalMan ? C.gold : "rgba(246,241,231,.22)", boxShadow: i >= totalMan && i < total ? `inset 0 0 0 1px ${C.gold}` : "none" }} />
            ))}
          </div>
          <span style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.7 }}>échantillons</span>
        </div>
      </div>

      {/* ── Toolbar sticky ── */}
      <div ref={toolbarRef} className="ss-toolbar" style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(246,241,231,.92)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.line}`, padding: "14px 0 12px", marginBottom: 20 }}>
        <div className="ss-wrap">
          <div className="ss-search" style={{ position: "relative", maxWidth: 420, margin: "0 auto 12px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: "absolute", insetInlineStart: 16, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value.toLowerCase().trim())}
              placeholder="Rechercher un parfum…"
              autoComplete="off"
              aria-label="Rechercher un parfum"
              style={{ width: "100%", padding: "11px 16px 11px 42px", border: `1px solid ${C.lineStrong}`, borderRadius: 100, background: "#fff", fontFamily: "'Jost',var(--font-sans)", fontSize: 14, fontWeight: 300, color: C.charcoal, outline: "none" }}
            />
          </div>
          <div className="ss-filterrow">
            <span className="ss-flabel">Sélections</span>
            {SAMPLE_COLLECTIONS.map((c) => {
              const active = c.id === filterCol;
              return (
                <button
                  key={c.id}
                  className={"ss-chip ss-col" + (active ? " ss-active" : "")}
                  aria-pressed={active}
                  onClick={() => setFilterCol(c.id)}
                >
                  {c.icon && <span style={{ fontSize: 11 }}>{c.icon}</span>}
                  {c.label}
                </button>
              );
            })}
          </div>
          <div className="ss-filterrow">
            <span className="ss-flabel">Marques</span>
            {BRANDS.map((b) => {
              const active = b === filterBrand;
              return (
                <button
                  key={b}
                  className={"ss-chip" + (active ? " ss-active" : "")}
                  aria-pressed={active}
                  onClick={() => setFilterBrand(b)}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="ss-wrap">
        <div ref={sentinelRef} style={{ height: 0, margin: 0, padding: 0 }} />

        {/* ── Bandeau « maison » sticky ── */}
        {!assistHidden && (
          <div
            className={"ss-assist" + (stuck ? " ss-stuck" : "")}
            style={{ top: tbH }}
          >
            <div className="ss-assist-txt">
              <p className="ss-h">
                <span style={{ color: C.goldDeep }}>✦</span>{" "}
                {hasAuto ? "Sélection maison ajoutée" : "Laissez la maison compléter"}
              </p>
              <p>
                {hasAuto
                  ? `${totalAuto} échantillon${totalAuto > 1 ? "s" : ""} choisi${totalAuto > 1 ? "s" : ""} pour vous. Épinglez ceux que vous gardez, ou régénérez.`
                  : `Il reste ${remaining} emplacement${remaining > 1 ? "s" : ""}. On les remplit selon le critère choisi.`}
              </p>
            </div>
            <div className="ss-assist-controls">
              <div className="ss-crit" role="group" aria-label="Critère de complétion">
                {([
                  ["bestsellers", "Best-sellers"],
                  ["affinity", "Dans mes goûts"],
                  ["discovery", "Découverte"],
                ] as [Crit, string][]).map(([id, label]) => (
                  <button
                    key={id}
                    className={crit === id ? "ss-on" : ""}
                    aria-pressed={crit === id}
                    onClick={() => onCrit(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="ss-assist-actions">
                {!hasAuto ? (
                  <button className="ss-btn-gold" onClick={pickAuto}>
                    Compléter ({remaining})
                  </button>
                ) : (
                  <>
                    <button className="ss-btn-gold" onClick={pickAuto}>↻ Régénérer</button>
                    <button className="ss-btn-ghost" onClick={clearAuto}>Effacer</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <p className="ss-countline">
          {list.length ? `${list.length} parfum${list.length > 1 ? "s" : ""}` : ""}
        </p>

        {/* ── Grille ── */}
        <div className="ss-grid">
          {!list.length && <div className="ss-empty">Aucun parfum ne correspond.</div>}
          {list.map((p) => {
            const mq = man[p.id] || 0;
            const aq = auto[p.id] || 0;
            const state: "man" | "auto" | "" = mq ? "man" : aq ? "auto" : "";
            const primaryTag = p.tags[0];
            const meta = primaryTag ? COLLECTION_META[primaryTag] : null;
            const label = `${p.name} — ${p.brand}`;
            const ariaLabel =
              state === "auto"
                ? `${label}, proposé par la maison`
                : state === "man"
                  ? `${label}, sélectionné, quantité ${mq}`
                  : `Ajouter ${label}`;
            return (
              <div
                key={p.id}
                className={"ss-tile" + (state ? " ss-" + state : "")}
                title={label}
                role="button"
                tabIndex={0}
                aria-pressed={state !== ""}
                aria-label={ariaLabel}
                onClick={() => { if (!state) addMan(p.id, 1); }}
                onKeyDown={(e) => {
                  if (!state && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    addMan(p.id, 1);
                  }
                }}
              >
                <div className="ss-thumb">
                  {meta && (
                    <span className="ss-tag">
                      <span>{meta.icon}</span>
                      {meta.short}
                    </span>
                  )}
                  <Thumb p={p} />
                  {state === "man" && <div className="ss-qbadge">{mq}</div>}
                  {state === "auto" && <div className="ss-abadge">✦</div>}
                  {!state && (
                    <button
                      className="ss-addbtn"
                      title="Ajouter"
                      aria-label={`Ajouter ${label}`}
                      onClick={(e) => { e.stopPropagation(); addMan(p.id, 1); }}
                    >
                      +
                    </button>
                  )}
                  {state === "man" && (
                    <div className="ss-ctrl">
                      <button aria-label="Retirer un" onClick={(e) => { e.stopPropagation(); addMan(p.id, -1); }}>−</button>
                      <span className="ss-q">{mq}</span>
                      <button
                        aria-label="Ajouter un"
                        disabled={full}
                        style={full ? { opacity: 0.35 } : undefined}
                        onClick={(e) => { e.stopPropagation(); addMan(p.id, 1); }}
                      >
                        +
                      </button>
                    </div>
                  )}
                  {state === "auto" && (
                    <div className="ss-ctrl">
                      <button className="ss-keep" onClick={(e) => { e.stopPropagation(); pin(p.id); }}>✓ Garder</button>
                      <button aria-label="Retirer" onClick={(e) => { e.stopPropagation(); removeAuto(p.id); }}>×</button>
                    </div>
                  )}
                </div>
                <div className="ss-meta">
                  <p className="ss-fname">{p.name}</p>
                  <p className="ss-brand">{p.brand}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Aperçu payload ── */}
      <div className="ss-devnote">
        <details>
          <summary>Aperçu des données envoyées au panier (compatibilité Shopify)</summary>
          <pre>{payloadText}</pre>
        </details>
      </div>

      {/* ── Tray fixe ── */}
      <div className="ss-tray">
        <div className="ss-tray-in">
          <div className="ss-tray-selection">
            {Object.entries(man).map(([id, qy]) => {
              const p = P(id);
              if (!p) return null;
              return (
                <div key={id} className="ss-tslot ss-man" title={`${p.name} — ${p.brand}`}>
                  <Vial tint={SAMPLE_FAMILIES[p.family].tint} size="24px" />
                  {qy > 1 && <span className="ss-tq">{qy}</span>}
                  <button className="ss-rm" aria-label="Retirer" onClick={() => removeSlot("man", id)}>×</button>
                </div>
              );
            })}
            {Object.entries(auto).map(([id, qy]) => {
              const p = P(id);
              if (!p) return null;
              return (
                <div key={id} className="ss-tslot ss-auto" title={`${p.name} — ${p.brand}`}>
                  <Vial tint={SAMPLE_FAMILIES[p.family].tint} size="24px" />
                  <span className="ss-ts">✦</span>
                  {qy > 1 && <span className="ss-tq">{qy}</span>}
                  <button className="ss-rm" aria-label="Retirer" onClick={() => removeSlot("auto", id)}>×</button>
                </div>
              );
            })}
            {Array.from({ length: Math.max(0, MAX - total) }).map((_, i) => (
              <div key={`empty-${i}`} className="ss-tslot" />
            ))}
          </div>
          <div className="ss-tray-status">
            <div className="ss-n"><b>{total}</b>/<span>{MAX}</span></div>
            <small>sélectionnés</small>
          </div>
          <button className="ss-cta" disabled={total !== MAX} onClick={onSubmit}>
            {total === MAX ? "Ajouter au panier" : `Encore ${MAX - total} à choisir`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Bloc <style> scoped (hover, sticky, media, focus, reduced-motion) ───────
function StyleBlock() {
  return (
    <style>{`
    .ss-root *{box-sizing:border-box}
    .ss-root{font-family:'Jost',var(--font-sans),system-ui,sans-serif;font-weight:300;-webkit-font-smoothing:antialiased}
    .ss-wrap{max-width:1180px;margin:0 auto;padding-inline:22px}

    .ss-progress b{color:#c2a15b}

    .ss-search input:focus{border-color:#c2a15b !important;box-shadow:0 0 0 3px rgba(194,161,91,.16)}

    .ss-filterrow{display:flex;align-items:center;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:8px}
    .ss-filterrow:last-child{margin-bottom:0}
    .ss-flabel{display:block;width:100%;text-align:center;font-size:9px;letter-spacing:.18em;text-transform:uppercase;opacity:.42;margin:0 0 6px}
    .ss-chip{font-family:'Jost',var(--font-sans);font-size:12px;font-weight:400;letter-spacing:.03em;padding:6px 13px;border-radius:100px;border:1px solid rgba(28,26,23,.22);background:transparent;color:#1c1a17;cursor:pointer;transition:.18s;white-space:nowrap;display:inline-flex;align-items:center;gap:5px}
    .ss-chip:hover{border-color:#c2a15b}
    .ss-chip.ss-active{background:#1c1a17;color:#f6f1e7;border-color:#1c1a17}
    .ss-chip.ss-col.ss-active{background:#a9873f;border-color:#a9873f;color:#fff}
    .ss-chip:focus-visible{outline:2px solid #a9873f;outline-offset:2px}

    .ss-assist{display:flex;align-items:center;gap:16px;flex-wrap:wrap;justify-content:space-between;background:linear-gradient(120deg,#fffdf8,#f3ecdb);border:1px solid rgba(194,161,91,.4);border-radius:14px;padding:15px 20px;margin-bottom:22px;position:sticky;z-index:15;transition:padding .2s,box-shadow .2s}
    .ss-assist.ss-stuck{padding:9px 18px;box-shadow:0 14px 30px -20px rgba(28,26,23,.55)}
    .ss-assist.ss-stuck .ss-assist-txt p:not(.ss-h){display:none}
    .ss-assist.ss-stuck .ss-assist-txt .ss-h{font-size:17px}
    .ss-assist-txt{flex:1;min-width:210px}
    .ss-assist-txt .ss-h{font-family:'Cormorant Garamond',var(--font-display);font-size:22px;font-weight:600;line-height:1.1;margin:0 0 3px;display:flex;align-items:center;gap:8px}
    .ss-assist-txt p{margin:0;font-size:13px;opacity:.7;line-height:1.5}
    .ss-assist-controls{display:flex;flex-direction:column;gap:9px;align-items:flex-end}
    .ss-crit{display:flex;gap:5px;background:#fff;border:1px solid rgba(28,26,23,.22);border-radius:100px;padding:4px}
    .ss-crit button{border:none;background:transparent;font-family:'Jost',var(--font-sans);font-size:12px;font-weight:400;padding:6px 12px;border-radius:100px;cursor:pointer;color:#1c1a17;transition:.18s;white-space:nowrap}
    .ss-crit button.ss-on{background:#1c1a17;color:#f6f1e7}
    .ss-crit button:focus-visible{outline:2px solid #a9873f;outline-offset:1px}
    .ss-assist-actions{display:flex;gap:8px}
    .ss-btn-gold{font-family:'Jost',var(--font-sans);font-weight:500;letter-spacing:.06em;font-size:12px;text-transform:uppercase;padding:10px 18px;border-radius:100px;border:none;cursor:pointer;background:#c2a15b;color:#1c1a17;transition:.2s}
    .ss-btn-gold:hover{background:#d8b96f}
    .ss-btn-ghost{font-family:'Jost',var(--font-sans);font-weight:400;font-size:12px;padding:10px 15px;border-radius:100px;border:1px solid rgba(28,26,23,.22);background:transparent;cursor:pointer;color:#1c1a17;transition:.2s}
    .ss-btn-ghost:hover{border-color:#c2a15b;color:#a9873f}

    .ss-countline{text-align:center;font-size:11px;letter-spacing:.06em;opacity:.45;margin:0 0 14px}

    .ss-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:10px;padding-inline:22px;max-width:1180px;margin:0 auto}
    .ss-tile{position:relative;border:1px solid rgba(28,26,23,.12);border-radius:11px;background:#fff;overflow:hidden;cursor:pointer;transition:.2s;display:flex;flex-direction:column}
    .ss-tile:hover{border-color:#c2a15b;transform:translateY(-2px);box-shadow:0 18px 50px -24px rgba(28,26,23,.45)}
    .ss-tile:focus-visible{outline:2px solid #a9873f;outline-offset:2px}
    .ss-tile.ss-man{border-color:#a9873f;box-shadow:0 0 0 2px #c2a15b inset}
    .ss-tile.ss-auto{border-color:#a9873f;box-shadow:0 0 0 1.5px #c2a15b inset;border-style:dashed;background:linear-gradient(180deg,#fffdf8,#fff)}
    .ss-thumb{aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,#faf7f0,#efe8d9);position:relative;overflow:hidden}
    .ss-tag{position:absolute;top:5px;inset-inline-start:5px;font-size:8px;letter-spacing:.06em;text-transform:uppercase;font-weight:500;padding:2px 6px;border-radius:100px;background:rgba(28,26,23,.82);color:#c2a15b;display:inline-flex;align-items:center;gap:3px;z-index:2}
    .ss-qbadge{position:absolute;top:5px;inset-inline-end:5px;width:20px;height:20px;border-radius:50%;background:#a9873f;color:#fff;font-family:'Cormorant Garamond',var(--font-display);font-weight:600;font-size:13px;display:flex;align-items:center;justify-content:center;box-shadow:0 18px 50px -24px rgba(28,26,23,.45);z-index:2}
    .ss-abadge{position:absolute;top:5px;inset-inline-end:5px;color:#c2a15b;font-size:13px;display:flex;z-index:2}
    .ss-addbtn{position:absolute;bottom:5px;inset-inline-end:5px;width:24px;height:24px;border-radius:50%;background:#fff;border:1px solid rgba(28,26,23,.22);color:#1c1a17;font-size:16px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.15s;box-shadow:0 4px 10px -6px rgba(0,0,0,.4);z-index:2}
    .ss-addbtn:hover{background:#c2a15b;border-color:#c2a15b;color:#fff}
    .ss-ctrl{position:absolute;bottom:5px;inset-inline:5px;display:flex;align-items:center;justify-content:center;gap:4px;background:rgba(28,26,23,.86);border-radius:100px;padding:3px;z-index:2}
    .ss-ctrl button{border:none;background:transparent;color:#f6f1e7;cursor:pointer;width:22px;height:22px;border-radius:50%;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;transition:.15s}
    .ss-ctrl button:hover{background:rgba(246,241,231,.16);color:#fff}
    .ss-ctrl .ss-q{font-family:'Cormorant Garamond',var(--font-display);font-weight:600;font-size:15px;color:#c2a15b;min-width:14px;text-align:center}
    .ss-ctrl .ss-keep{color:#c2a15b;font-size:12px;font-weight:500;padding:0 6px;width:auto;letter-spacing:.04em}
    .ss-meta{padding:6px 8px 8px;text-align:center}
    .ss-fname{font-family:'Cormorant Garamond',var(--font-display);font-size:14px;font-weight:600;line-height:1.05;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .ss-brand{font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;opacity:.45;margin:2px 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .ss-empty{grid-column:1/-1;text-align:center;padding:40px 0;opacity:.5;font-style:italic;font-family:'Cormorant Garamond',var(--font-display);font-size:20px}

    .ss-devnote{max-width:1180px;margin:26px auto 0;padding-inline:22px}
    .ss-devnote details{background:#fff;border:1px dashed rgba(28,26,23,.22);border-radius:12px;padding:14px 18px}
    .ss-devnote summary{cursor:pointer;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#a9873f;font-weight:500}
    .ss-devnote pre{margin:12px 0 0;font-size:12.5px;line-height:1.6;color:#2a2622;background:#efe8d9;padding:12px 14px;border-radius:8px;overflow-x:auto;white-space:pre-wrap}

    .ss-tray{position:fixed;left:0;right:0;bottom:0;z-index:40;background:#1c1a17;color:#f6f1e7;border-top:2px solid #c2a15b;box-shadow:0 -18px 44px -26px rgba(0,0,0,.6)}
    .ss-tray-in{max-width:1180px;margin:0 auto;padding:13px 22px;display:flex;align-items:center;gap:16px}
    .ss-tray-selection{display:flex;gap:7px;flex:1;overflow-x:auto;padding:2px 0}
    .ss-tslot{flex:0 0 auto;width:44px;height:44px;border-radius:9px;position:relative;background:rgba(246,241,231,.08);border:1px solid rgba(246,241,231,.14);display:flex;align-items:center;justify-content:center}
    .ss-tslot.ss-man{background:rgba(194,161,91,.16);border-color:rgba(194,161,91,.5)}
    .ss-tslot.ss-auto{background:transparent;border:1px dashed rgba(194,161,91,.65)}
    .ss-tslot .ss-tq{position:absolute;bottom:-4px;inset-inline-end:-4px;background:#c2a15b;color:#1c1a17;font-family:'Cormorant Garamond',var(--font-display);font-weight:700;font-size:11px;width:17px;height:17px;border-radius:50%;display:flex;align-items:center;justify-content:center}
    .ss-tslot .ss-ts{position:absolute;top:-5px;inset-inline-start:-5px;color:#c2a15b;font-size:10px}
    .ss-tslot .ss-rm{position:absolute;top:-6px;inset-inline-end:-6px;width:17px;height:17px;border-radius:50%;background:#f6f1e7;color:#1c1a17;border:none;cursor:pointer;font-size:11px;line-height:1;display:none;align-items:center;justify-content:center}
    .ss-tslot.ss-man:hover .ss-rm,.ss-tslot.ss-auto:hover .ss-rm{display:flex}
    .ss-tray-status{text-align:end;flex:0 0 auto;min-width:100px}
    .ss-tray-status .ss-n{font-family:'Cormorant Garamond',var(--font-display);font-size:25px;font-weight:600;line-height:1}
    .ss-tray-status .ss-n b{color:#c2a15b}
    .ss-tray-status small{display:block;font-size:10px;letter-spacing:.14em;text-transform:uppercase;opacity:.6;margin-top:2px}
    .ss-cta{flex:0 0 auto;font-family:'Jost',var(--font-sans);font-weight:500;letter-spacing:.14em;text-transform:uppercase;font-size:12px;padding:15px 26px;border-radius:100px;border:none;cursor:pointer;background:#c2a15b;color:#1c1a17;transition:.25s}
    .ss-cta:hover:not(:disabled){background:#d8b96f}
    .ss-cta:disabled{background:rgba(246,241,231,.16);color:rgba(246,241,231,.4);cursor:not-allowed}

    @media(max-width:640px){
      .ss-grid{grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px}
      .ss-assist-controls{align-items:stretch;width:100%}
      .ss-crit{overflow-x:auto}
      .ss-tray-status{min-width:auto}
      .ss-tray-status .ss-n{font-size:20px}
      .ss-cta{padding:13px 15px;font-size:11px}
      .ss-tray-in{gap:10px}
    }
    @media(prefers-reduced-motion:reduce){
      .ss-root *,.ss-tile,.ss-assist{transition:none !important}
      .ss-tile:hover{transform:none}
    }
    `}</style>
  );
}
