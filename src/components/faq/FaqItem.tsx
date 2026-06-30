"use client";

import { useEffect, useId, useRef } from "react";
import { T, toActions, type FaqAction, type FaqQuestion } from "./faq.data";
import { highlightMatch } from "./FaqSearch";
import { CtaLink } from "./answers/CtaLink";
import { PaymentBadges } from "./answers/PaymentBadges";
import { PromoChecker, type PromoResult } from "./answers/PromoChecker";
import { B2BLeadForm } from "./answers/B2BLeadForm";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function ActionView({
  action,
  onCheckPromo,
  onSubmitB2B,
}: {
  action: FaqAction;
  onCheckPromo?: (code: string) => Promise<PromoResult> | PromoResult;
  onSubmitB2B?: (email: string) => Promise<void> | void;
}) {
  switch (action.type) {
    case "cta":
      return <CtaLink href={action.href} label={action.label} variant="dark" />;
    case "payments":
      return <PaymentBadges />;
    case "promo":
      return <PromoChecker onCheck={onCheckPromo} />;
    case "b2b":
      return <B2BLeadForm onSubmit={onSubmitB2B} />;
  }
}

/**
 * Accordéon exclusif. <button> avec aria-expanded/aria-controls ; panneau
 * role="region" aria-labelledby. Animation de hauteur réelle (scrollHeight),
 * puis passage à `none` une fois ouvert pour que le contenu interactif
 * (promo / B2B) puisse grandir sans être tronqué. Icône +/- qui pivote.
 * `id={item.id}` pour l'ancrage profond.
 */
export function FaqItem({
  item,
  open,
  onToggle,
  query,
  index,
  onCheckPromo,
  onSubmitB2B,
}: {
  item: FaqQuestion;
  open: boolean;
  onToggle: () => void;
  query: string;
  index: number;
  onCheckPromo?: (code: string) => Promise<PromoResult> | PromoResult;
  onSubmitB2B?: (email: string) => Promise<void> | void;
}) {
  const headerId = useId();
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  // Animation de hauteur réelle pilotée impérativement.
  useEffect(() => {
    const panel = panelRef.current;
    const inner = innerRef.current;
    if (!panel || !inner) return;
    const reduce = prefersReducedMotion();

    if (open) {
      if (reduce) {
        panel.style.maxHeight = "none";
        return;
      }
      panel.style.maxHeight = `${inner.scrollHeight}px`;
      const onEnd = (e: TransitionEvent) => {
        if (e.propertyName === "max-height") panel.style.maxHeight = "none";
      };
      panel.addEventListener("transitionend", onEnd);
      return () => panel.removeEventListener("transitionend", onEnd);
    }

    // Fermeture : repart de la hauteur courante puis anime vers 0.
    if (reduce) {
      panel.style.maxHeight = "0px";
      return;
    }
    panel.style.maxHeight = `${inner.scrollHeight}px`;
    void panel.offsetHeight; // force reflow
    requestAnimationFrame(() => {
      panel.style.maxHeight = "0px";
    });
  }, [open]);

  const actions = toActions(item.action);

  return (
    <div
      id={item.id}
      className="dp-faq-reveal"
      style={
        {
          scrollMarginTop: 90,
          background: T.card,
          border: `1px solid ${open ? T.line2 : T.line}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: open
            ? "0 10px 30px rgba(120,90,40,.08)"
            : "0 1px 2px rgba(26,23,18,.03)",
          transition: "border-color 200ms ease, box-shadow 200ms ease",
          "--dp-faq-i": index,
        } as React.CSSProperties
      }
    >
      <h3 style={{ margin: 0 }}>
        <button
          type="button"
          id={headerId}
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "18px 20px",
            textAlign: "start",
          }}
        >
          <span
            style={{
              flex: 1,
              fontFamily: "var(--font-sans)",
              fontSize: 15.5,
              fontWeight: open ? 600 : 500,
              lineHeight: 1.45,
              color: open ? T.goldDeep : T.ink,
              transition: "color 200ms ease",
            }}
          >
            {highlightMatch(item.question, query)}
          </span>
          <span
            aria-hidden
            style={{
              flexShrink: 0,
              position: "relative",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: open ? T.goldDeep : "rgba(168,132,62,.10)",
              display: "grid",
              placeItems: "center",
              transition: "background 200ms ease",
            }}
          >
            {/* barre horizontale (toujours visible) */}
            <span
              style={{
                position: "absolute",
                width: 12,
                height: 2,
                borderRadius: 2,
                background: open ? "#fff" : T.goldDeep,
              }}
            />
            {/* barre verticale (se replie à l'ouverture → « − ») */}
            <span
              style={{
                position: "absolute",
                width: 12,
                height: 2,
                borderRadius: 2,
                background: open ? "#fff" : T.goldDeep,
                transform: open ? "rotate(90deg) scaleX(0)" : "rotate(90deg) scaleX(1)",
                transition: "transform 240ms ease",
              }}
            />
          </span>
        </button>
      </h3>

      <div
        ref={panelRef}
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        inert={!open}
        style={{
          maxHeight: 0,
          overflow: "hidden",
          transition: "max-height 320ms cubic-bezier(.4,0,.2,1)",
        }}
      >
        <div ref={innerRef} style={{ padding: "0 20px 20px" }}>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              lineHeight: 1.7,
              color: T.ink2,
            }}
          >
            {item.answer}
          </p>
          {actions.length > 0 && (
            <div
              style={{
                marginTop: 16,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 12,
              }}
            >
              {actions.map((action, i) => (
                <ActionView
                  key={`${action.type}-${i}`}
                  action={action}
                  onCheckPromo={onCheckPromo}
                  onSubmitB2B={onSubmitB2B}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
