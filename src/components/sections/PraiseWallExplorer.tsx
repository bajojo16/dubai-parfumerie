"use client";

/**
 * Mur des éloges filtrable : une recherche libre + une puce par parfum.
 *
 * L'état vit dans l'URL (`?produit=<slug>&q=<texte>`) : la fiche produit
 * pointe sur `/mur-des-eloges?produit=<slug>` pour n'afficher que SES éloges,
 * et un lien filtré se partage tel quel. Même mécanique que la salle des
 * enchères : `history.replaceState` + `useSearchParams`, pas de navigation.
 */

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { PraiseWall, type PraiseTile } from "./PraiseWall";

export type WallProduct = {
  slug: string;
  name: string;
  brand: string;
  image?: string;
  /** Nombre de tuiles (photos + vidéos) pour ce parfum. */
  count: number;
};

const PRODUCT_PARAM = "produit";
const QUERY_PARAM = "q";

function writeParams(patch: Record<string, string | null>) {
  const url = new URL(window.location.href);
  Object.entries(patch).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  });
  window.history.replaceState(null, "", url.toString());
}

/** Minuscules sans accents : « eloge » trouve « Éloges », « kham » Khamrah. */
const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function PraiseWallExplorer({ tiles, products }: { tiles: PraiseTile[]; products: WallProduct[] }) {
  const searchParams = useSearchParams();
  const rawSlug = searchParams.get(PRODUCT_PARAM);
  const selected = rawSlug && products.some((p) => p.slug === rawSlug) ? rawSlug : null;
  const [query, setQuery] = useState(() => searchParams.get(QUERY_PARAM) ?? "");

  const select = useCallback((slug: string | null) => writeParams({ [PRODUCT_PARAM]: slug }), []);
  const changeQuery = useCallback((q: string) => {
    setQuery(q);
    writeParams({ [QUERY_PARAM]: q.trim() || null });
  }, []);
  const clear = useCallback(() => {
    setQuery("");
    writeParams({ [PRODUCT_PARAM]: null, [QUERY_PARAM]: null });
  }, []);

  const needle = fold(query.trim());
  const filtered = useMemo(
    () =>
      tiles.filter((t) => {
        if (selected && t.product.slug !== selected) return false;
        if (!needle) return true;
        const hay = fold(`${t.product.name} ${t.product.brand} ${t.author}`);
        return hay.includes(needle);
      }),
    [tiles, selected, needle],
  );

  // Les puces suivent la recherche : taper « latt » ne laisse que les parfums Lattafa.
  const chips = needle
    ? products.filter((p) => fold(`${p.name} ${p.brand}`).includes(needle) || p.slug === selected)
    : products;
  const current = selected ? products.find((p) => p.slug === selected) : null;
  const active = Boolean(selected || needle);

  return (
    <>
      <div className="pwx" role="search">
        <label className="pwx-field">
          <span className="pwx-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.6-3.6" />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => changeQuery(e.target.value)}
            placeholder="Un parfum, une maison, un prénom…"
            aria-label="Rechercher dans le mur des éloges"
            autoComplete="off"
          />
        </label>

        <div className="pwx-chips" aria-label="Filtrer par parfum">
          <button type="button" className="pwx-chip" aria-pressed={!selected} onClick={() => select(null)}>
            Tous <span className="pwx-n">{tiles.length}</span>
          </button>
          {chips.map((p) => (
            <button
              key={p.slug}
              type="button"
              className="pwx-chip"
              aria-pressed={selected === p.slug}
              onClick={() => select(selected === p.slug ? null : p.slug)}
              title={`${p.name} — ${p.brand}`}
            >
              {p.image && (
                <span className="pwx-thumb" aria-hidden="true">
                  <Image src={p.image} alt="" fill sizes="28px" style={{ objectFit: "cover" }} />
                </span>
              )}
              {p.name} <span className="pwx-n">{p.count}</span>
            </button>
          ))}
        </div>

        <p className="pwx-status" aria-live="polite">
          {current ? (
            <>
              Les éloges de <strong>{current.name}</strong> · {current.brand} — {filtered.length} {filtered.length > 1 ? "médias" : "média"}
            </>
          ) : needle ? (
            <>
              {filtered.length} {filtered.length > 1 ? "médias" : "média"} pour « {query.trim()} »
            </>
          ) : (
            <>
              {tiles.length} photos et vidéos, {products.length} parfums
            </>
          )}
          {active && (
            <button type="button" className="pwx-clear" onClick={clear}>
              Tout afficher
            </button>
          )}
        </p>
      </div>

      {filtered.length ? (
        <PraiseWall tiles={filtered} />
      ) : (
        <div className="pwx-empty">
          <p>Aucun éloge ne correspond à « {query.trim()} ».</p>
          <button type="button" className="pwx-clear" onClick={clear}>
            Tout afficher
          </button>
        </div>
      )}

      <style>{`
        .pwx{max-width:960px;margin:0 auto 22px;padding:0 24px;font-family:var(--font-sans)}
        .pwx-field{display:flex;align-items:center;gap:10px;max-width:520px;margin:0 auto;padding:0 16px;height:48px;border:1px solid var(--line-200,#E6DCC8);border-radius:999px;background:#fff;color:var(--ink-400)}
        .pwx-field:focus-within{border-color:var(--gold-500);box-shadow:0 0 0 3px rgba(200,144,30,.15)}
        .pwx-field input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:inherit;font-size:.95rem;color:var(--ink-900)}
        .pwx-field input::placeholder{color:var(--ink-400);font-weight:300}
        .pwx-field input::-webkit-search-cancel-button{-webkit-appearance:none}
        .pwx-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:16px}
        .pwx-chip{display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 12px 0 6px;border:1px solid var(--line-200,#E6DCC8);border-radius:999px;background:#fff;font:inherit;font-size:.82rem;color:var(--ink-700);cursor:pointer;transition:border-color .15s,background .15s}
        .pwx-chip:hover{border-color:var(--gold-500)}
        .pwx-chip[aria-pressed="true"]{background:var(--ink-900);border-color:var(--ink-900);color:#fff}
        .pwx-chip[aria-pressed="true"] .pwx-n{color:rgba(255,255,255,.7)}
        .pwx-chip:first-child{padding-left:12px}
        .pwx-thumb{position:relative;width:24px;height:24px;border-radius:50%;overflow:hidden;background:var(--surface-page);flex:none}
        .pwx-n{font-size:.72rem;color:var(--ink-400);font-variant-numeric:tabular-nums}
        .pwx-status{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:6px 14px;margin:14px 0 0;font-size:.85rem;font-weight:300;color:var(--ink-500);text-align:center}
        .pwx-status strong{font-weight:500;color:var(--ink-900)}
        .pwx-clear{border:0;background:none;padding:0;font:inherit;font-size:.82rem;color:var(--gold-700);text-decoration:underline;text-underline-offset:3px;cursor:pointer}
        .pwx-empty{max-width:520px;margin:32px auto 64px;padding:32px 24px;text-align:center;border:1px dashed var(--line-200,#E6DCC8);border-radius:16px;font-family:var(--font-sans);color:var(--ink-500)}
        .pwx-empty p{margin:0 0 10px}
        @media (max-width:760px){.pwx{padding:0 16px}.pwx-field{height:44px}}
      `}</style>
    </>
  );
}
