"use client";

/**
 * FragranceFinderButton — bouton flottant fiole (animation respiration)
 * qui ouvre le FragranceFinderModal (quiz olfactif).
 *
 * Périmètre preview : on ne le monte PAS dans le layout global pour l'instant.
 * S'utilise via la page /preview-fragrance-finder.
 *
 * - Catalogue : LOCAL par défaut (LOCAL_CATALOG), surchargeable via prop `products`.
 * - i18n : labels en props (défauts FR).
 * - prefers-reduced-motion : désactive la respiration.
 */
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import type { CatalogProduct, FinderLabels } from "./types";
import { LOCAL_CATALOG } from "./data/productAttributes";
import { DEFAULT_LABELS } from "./labels";
import { FragranceFinderModal } from "./FragranceFinderModal";
import { FlaconIcon } from "./FlaconIcon";
import { FF } from "./tokens";

export function FragranceFinderButton({
  products,
  labels: labelsProp,
  locale: localeProp,
}: {
  products?: CatalogProduct[];
  labels?: Partial<FinderLabels>;
  locale?: string;
}) {
  const intlLocale = useLocale();
  const locale = localeProp ?? intlLocale;
  const catalog = products ?? LOCAL_CATALOG;
  const labels: FinderLabels = { ...DEFAULT_LABELS, ...labelsProp };

  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(
      typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label={labels.openAria}
        aria-haspopup="dialog"
        style={{
          position: "fixed",
          insetBlockEnd: 24,
          insetInlineEnd: 24,
          zIndex: 900,
          width: 62,
          height: 62,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(140deg, ${FF.goldDeep}, ${FF.gold} 55%, ${FF.goldLight})`,
          color: FF.ink,
          boxShadow: hover
            ? "0 14px 34px rgba(168,128,31,0.42)"
            : "0 10px 26px rgba(168,128,31,0.32)",
          transform: hover && !reduced ? "translateY(-2px) scale(1.04)" : "none",
          transition: "transform .2s, box-shadow .25s",
          animation: reduced ? undefined : "ff-breathe 3.4s ease-in-out infinite",
        }}
      >
        <FlaconIcon size={28} color={FF.ink} />
        {/* halo de respiration */}
        {!reduced && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: "50%",
              border: `1.5px solid ${FF.gold}`,
              opacity: 0.5,
              animation: "ff-halo 3.4s ease-in-out infinite",
            }}
          />
        )}
      </button>

      <FragranceFinderModal
        open={open}
        products={catalog}
        locale={locale}
        labels={labelsProp}
        onClose={() => setOpen(false)}
      />

      <style>{`
        @keyframes ff-breathe {
          0%, 100% { box-shadow: 0 10px 26px rgba(168,128,31,0.30); }
          50% { box-shadow: 0 12px 32px rgba(168,128,31,0.46); }
        }
        @keyframes ff-halo {
          0%, 100% { transform: scale(1); opacity: .5; }
          50% { transform: scale(1.12); opacity: 0; }
        }
      `}</style>
    </>
  );
}
