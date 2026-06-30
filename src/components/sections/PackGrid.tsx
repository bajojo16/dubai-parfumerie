"use client";

import { useMemo, useRef, useState } from "react";
import { PackCard, type PackCardLabels, type PackSize } from "./PackCard";
import type { Pack } from "@/data/packs";

const FEATURED: ReadonlyArray<NonNullable<Pack["badge"]>> = [
  "bestseller",
  "most_gifted",
];

// Légère variation de hauteur entre cartes (côté ludique du rail),
// sans casser l'alignement sur une seule rangée horizontale.
const PATTERN: PackSize[] = ["hero", "tall", "soft", "wide", "soft", "tall"];

/**
 * Carrousel horizontal (rail) : toutes les cartes sur une rangée qui défile
 * en x (scroll-snap), scrollbar masquée, flèches préc/suiv discrètes en
 * desktop, swipe natif en mobile. Pas de scroll vertical.
 *
 * Le défilement utilise scrollBy avec un signe inversé en RTL pour que la
 * flèche « suivant » avance toujours dans le sens de lecture.
 */
const RAIL_CSS = `
.dpk-wrap{position:relative;}
.dpk-rail{
  display:flex;
  gap:14px;
  overflow-x:auto;
  overflow-y:hidden;
  scroll-snap-type:x mandatory;
  scroll-behavior:smooth;
  -webkit-overflow-scrolling:touch;
  padding:14px 2px 18px;
  scrollbar-width:none;
  -ms-overflow-style:none;
  align-items:flex-end;
}
.dpk-rail::-webkit-scrollbar{display:none;}
.dpk-slide{
  flex:0 0 auto;
  width:222px;
  scroll-snap-align:start;
  display:flex;
  align-items:flex-end;
}
.dpk-slide>*{width:100%;}
.dpk-hero,.dpk-tall{height:360px;}
.dpk-wide,.dpk-soft{height:326px;}
.dpk-arrow{
  position:absolute;
  top:calc(50% - 4px);
  transform:translateY(-50%);
  z-index:5;
  width:42px;height:42px;
  border-radius:50%;
  border:0.5px solid #E4D6B4;
  background:rgba(253,251,246,.92);
  color:#A8801F;
  font-family:var(--font-display);
  font-size:24px;line-height:1;
  display:grid;place-items:center;
  cursor:pointer;
  box-shadow:0 8px 22px rgba(80,60,30,.16);
  transition:background .2s,transform .2s,opacity .2s;
  backdrop-filter:saturate(1.2) blur(2px);
}
.dpk-arrow:hover{background:#fff;color:#15110D;}
.dpk-prev{inset-inline-start:-6px;}
.dpk-next{inset-inline-end:-6px;}
@media(max-width:720px){
  .dpk-slide{width:200px;}
  .dpk-hero,.dpk-tall{height:344px;}
  .dpk-wide,.dpk-soft{height:316px;}
  .dpk-arrow{display:none;}
}
@media(prefers-reduced-motion: reduce){
  .dpk-rail{scroll-behavior:auto;}
}
`;

export function PackGrid({
  packs,
  locale = "fr",
  labels,
}: {
  packs: Pack[];
  locale?: string;
  labels?: Partial<PackCardLabels>;
}) {
  const isRTL = locale === "ar";
  const railRef = useRef<HTMLDivElement | null>(null);
  const [prefersReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );

  // Met les coffrets phares (best-seller / le plus offert) en tête,
  // en conservant l'ordre relatif d'origine.
  const sorted = useMemo(() => {
    const isFeatured = (p: Pack) =>
      p.badge != null && FEATURED.includes(p.badge);
    return [...packs].sort((a, b) => {
      const fa = isFeatured(a) ? 0 : 1;
      const fb = isFeatured(b) ? 0 : 1;
      return fa - fb;
    });
  }, [packs]);

  // dir = +1 → avance (sens de lecture), -1 → recule.
  const scrollBy = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    const amount = Math.max(240, Math.round(el.clientWidth * 0.82));
    const sign = isRTL ? -1 : 1;
    el.scrollBy({
      left: sign * dir * amount,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  };

  return (
    <div className="dpk-wrap" dir={isRTL ? "rtl" : "ltr"}>
      <style>{RAIL_CSS}</style>

      <button
        type="button"
        className="dpk-arrow dpk-prev"
        aria-label={isRTL ? "Suivant" : "Précédent"}
        onClick={() => scrollBy(-1)}
      >
        {isRTL ? "›" : "‹"}
      </button>

      <div ref={railRef} className="dpk-rail">
        {sorted.map((pack, i) => {
          const size = PATTERN[i % PATTERN.length];
          return (
            <div key={pack.slug} className={`dpk-slide dpk-${size}`}>
              <PackCard
                pack={pack}
                locale={locale}
                labels={labels}
                index={i}
                size={size}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="dpk-arrow dpk-next"
        aria-label={isRTL ? "Précédent" : "Suivant"}
        onClick={() => scrollBy(1)}
      >
        {isRTL ? "‹" : "›"}
      </button>
    </div>
  );
}
