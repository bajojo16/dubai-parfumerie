"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FAQ_CATEGORIES,
  FAQ_QUESTIONS,
  fold,
  T,
  type FaqCategory,
  type FaqCategoryId,
  type FaqQuestion,
} from "./faq.data";
import { FaqSearch, type FaqSearchLabels } from "./FaqSearch";
import { FaqCategoryNav } from "./FaqCategoryNav";
import { FaqHero } from "./FaqHero";
import { FaqItem } from "./FaqItem";
import { FaqHelpCard, type FaqHelpLabels } from "./FaqHelpCard";
import type { PromoResult } from "./answers/PromoChecker";

export type FaqLabels = {
  /** Titre principal du centre d'aide */
  title: string;
  /** Compteur : singulier / pluriel ({n} = nombre) */
  countOne: string;
  countMany: string;
  /** État vide */
  empty: string;
  search?: Partial<FaqSearchLabels>;
  help?: Partial<FaqHelpLabels>;
};

const DEFAULT_LABELS: FaqLabels = {
  title: "Comment pouvons-nous vous aider ?",
  countOne: "{n} question",
  countMany: "{n} questions",
  empty: "Aucune question ne correspond à votre recherche.",
};

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function Faq({
  locale = "fr",
  categories = FAQ_CATEGORIES,
  questions = FAQ_QUESTIONS,
  labels,
  onCheckPromo,
  onSubmitB2B,
  whatsappNumber,
  email,
}: {
  locale?: string;
  categories?: FaqCategory[];
  questions?: FaqQuestion[];
  labels?: Partial<FaqLabels>;
  onCheckPromo?: (code: string) => Promise<PromoResult> | PromoResult;
  onSubmitB2B?: (email: string) => Promise<void> | void;
  whatsappNumber?: string;
  email?: string;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const isRTL = locale === "ar";

  const [query, setQuery] = useState("");
  const [active, setActive] = useState<FaqCategoryId>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const didDeepLink = useRef(false);

  // Compteur par catégorie selon la recherche en cours (alimente le rail).
  const counts = useMemo(() => {
    const q = fold(query.trim());
    const match = (item: FaqQuestion) =>
      !q || fold(`${item.question} ${item.answer}`).includes(q);
    const result = {} as Record<FaqCategoryId, number>;
    for (const cat of categories) {
      result[cat.id] =
        cat.id === "all"
          ? questions.filter(match).length
          : questions.filter((it) => it.categoryId === cat.id && match(it)).length;
    }
    return result;
  }, [categories, questions, query]);

  // Liste filtrée (catégorie + recherche).
  const filtered = useMemo(() => {
    const q = fold(query.trim());
    return questions.filter((item) => {
      if (active !== "all" && item.categoryId !== active) return false;
      if (q && !fold(`${item.question} ${item.answer}`).includes(q)) return false;
      return true;
    });
  }, [questions, active, query]);

  const activeCategory =
    categories.find((c) => c.id === active) ?? categories[0];

  // Clé de ré-animation : change au filtrage → cascade (stagger) au re-montage.
  const revealKey = `${active}|${query.trim().toLowerCase()}`;

  const toggle = useCallback((id: string) => {
    setOpenId((prev) => {
      const next = prev === id ? null : id;
      if (next && typeof window !== "undefined") {
        try {
          window.history.replaceState(null, "", `#${id}`);
        } catch {
          /* no-op */
        }
      }
      return next;
    });
  }, []);

  // Lien direct par ancre au montage.
  useEffect(() => {
    if (didDeepLink.current) return;
    didDeepLink.current = true;
    if (typeof window === "undefined") return;
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!hash) return;
    const target = questions.find((q) => q.id === hash);
    if (!target) return;
    setActive(target.categoryId);
    setOpenId(target.id);
    window.setTimeout(() => {
      document.getElementById(target.id)?.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "center",
      });
    }, 120);
  }, [questions]);

  const count = filtered.length;
  const countLabel = (count <= 1 ? L.countOne : L.countMany).replace(
    "{n}",
    String(count),
  );

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        background: T.cream2,
        padding: "56px 24px",
        fontFamily: "var(--font-sans)",
        // @ts-expect-error variable CSS pour retourner le filet décoratif en RTL
        "--dp-faq-flip": isRTL ? -1 : 1,
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        {/* En-tête + recherche */}
        <div style={{ maxWidth: 620, marginBottom: 28, textAlign: "start" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4.4vw, 40px)",
              lineHeight: 1.12,
              fontWeight: 500,
              color: T.inkWarm,
              margin: "0 0 18px",
            }}
          >
            {L.title}
          </h2>
          <FaqSearch value={query} onChange={setQuery} labels={L.search} />
        </div>

        {/* Layout 2 colonnes */}
        <div className="dp-faq-grid">
          <aside className="dp-faq-aside">
            <FaqCategoryNav
              categories={categories}
              active={active}
              onSelect={setActive}
              counts={counts}
            />
          </aside>

          <div style={{ minWidth: 0 }}>
            <FaqHero category={activeCategory} />

            {/* Compteur (pluralisation + fondu) */}
            <div
              key={`${revealKey}-${count}`}
              className="dp-faq-count"
              aria-live="polite"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12.5,
                fontWeight: 600,
                letterSpacing: "0.04em",
                color: T.ink3,
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              {countLabel}
            </div>

            {count === 0 ? (
              <div
                style={{
                  background: T.card,
                  border: `1px dashed ${T.line2}`,
                  borderRadius: 16,
                  padding: "40px 24px",
                  textAlign: "center",
                  color: T.ink2,
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                }}
              >
                {L.empty}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filtered.map((item, i) => (
                  <FaqItem
                    key={`${revealKey}-${item.id}`}
                    item={item}
                    index={i}
                    open={openId === item.id}
                    onToggle={() => toggle(item.id)}
                    query={query}
                    onCheckPromo={onCheckPromo}
                    onSubmitB2B={onSubmitB2B}
                  />
                ))}
              </div>
            )}

            <FaqHelpCard
              labels={L.help}
              whatsappNumber={whatsappNumber}
              email={email}
            />
          </div>
        </div>
      </div>

      {/* Styles scoped (layout, responsive, animations) */}
      <style>{`
        .dp-faq-grid {
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr);
          gap: 32px;
          align-items: start;
        }
        .dp-faq-aside {
          position: sticky;
          top: 24px;
          align-self: start;
        }
        .dp-faq-cats {
          display: flex;
          flex-direction: column;
          gap: 2px;
          border-inline-start: 1px solid ${T.line};
        }
        @media (max-width: 900px) {
          .dp-faq-grid { grid-template-columns: 1fr; gap: 18px; }
          .dp-faq-aside { position: static; top: auto; }
          .dp-faq-cats {
            flex-direction: row;
            overflow-x: auto;
            gap: 4px;
            padding-bottom: 4px;
            border-inline-start: none;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .dp-faq-cats::-webkit-scrollbar { display: none; }
        }
        @keyframes dpFaqIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
        .dp-faq-reveal {
          animation: dpFaqIn .4s ease both;
          animation-delay: calc(var(--dp-faq-i, 0) * 45ms);
        }
        @keyframes dpFaqCount {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .dp-faq-count { animation: dpFaqCount .3s ease; }
        @media (prefers-reduced-motion: reduce) {
          .dp-faq-reveal, .dp-faq-count { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
