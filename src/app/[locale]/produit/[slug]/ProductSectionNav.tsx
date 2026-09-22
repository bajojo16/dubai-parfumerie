"use client";

import { useEffect, useState } from "react";

/**
 * Barre d'ancres collante sous le hero — la table des matières de la fiche.
 *
 * La page fait dix mille pixels sur mobile : sans repère, on ne sait ni où
 * l'on est ni ce qui reste. Sept mots suffisent à dire la structure (résumé,
 * notes, pour qui, comparer, avis, questions, compléter) et un clic y mène.
 * L'entrée active suit le défilement (IntersectionObserver) ; sans JS, les
 * ancres marchent quand même.
 *
 * Collée sous l'en-tête (qui est lui-même collant) : `top` reprend sa hauteur
 * approximative ; z-index sous celui de l'en-tête pour passer dessous.
 */
export type SectionAnchor = { id: string; label: string };

export default function ProductSectionNav({ items }: { items: SectionAnchor[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const targets = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        // La section la plus haute encore visible gagne : on lit de haut en bas.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="Sections de la fiche"
      className="dp-secnav"
      style={{
        position: "sticky",
        top: 64,
        zIndex: 30,
        background: "color-mix(in srgb, var(--surface-page) 92%, transparent)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderTop: "1px solid var(--line-100)",
        borderBottom: "1px solid var(--line-100)",
      }}
    >
      <style>{`
        .dp-secnav ul { display:flex; gap:0.25rem; overflow-x:auto; scrollbar-width:none; -webkit-overflow-scrolling:touch; }
        .dp-secnav ul::-webkit-scrollbar { display:none; }
        .dp-secnav a { display:inline-block; padding:0.8rem 0.9rem; white-space:nowrap; text-decoration:none; font-family:var(--font-sans); font-size:var(--t-xs); font-weight:var(--fw-semibold); letter-spacing:var(--ls-wide); text-transform:uppercase; color:var(--ink-500); border-bottom:2px solid transparent; transition:color var(--dur-fast), border-color var(--dur-fast); }
        .dp-secnav a:hover { color:var(--ink-900); }
        .dp-secnav a[aria-current="true"] { color:var(--gold-700); border-bottom-color:var(--gold-500); }
        @media (max-width: 760px) { .dp-secnav { top: 56px; } .dp-secnav a { padding:0.7rem 0.7rem; } }
      `}</style>
      <ul style={{ listStyle: "none", margin: "0 auto", padding: "0 var(--gutter)", maxWidth: "var(--container)" }}>
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} aria-current={active === i.id ? "true" : undefined}>
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
