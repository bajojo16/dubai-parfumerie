import { FAQ } from "./content";

/**
 * FAQ de la commande à la demande, en `<details>` natifs.
 *
 * Pas le centre d'aide `components/faq/Faq` : celui-là est un composant
 * client avec recherche, catégories et données globales ; huit questions
 * propres à un service n'ont pas besoin de JavaScript pour s'ouvrir, et un
 * `<details>` reste lisible avant l'hydratation et dans les moteurs.
 */
export function OnDemandFaq() {
  return (
    <div
      style={{
        maxWidth: "var(--container-narrow)",
        margin: "0 auto",
        border: "1px solid var(--line-200)",
        borderRadius: "var(--r-lg)",
        background: "var(--surface-white)",
        overflow: "hidden",
      }}
    >
      {FAQ.map((item, i) => (
        <details
          key={item.q}
          className="dp-od-faq"
          style={{ borderTop: i === 0 ? "none" : "1px solid var(--line-100)" }}
        >
          <summary
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              padding: "18px 22px",
              cursor: "pointer",
              listStyle: "none",
              fontFamily: "var(--font-display)",
              fontWeight: "var(--fw-medium)",
              fontSize: "1.15rem",
              lineHeight: "var(--lh-snug)",
              color: "var(--ink-900)",
            }}
          >
            <span>{item.q}</span>
            <span
              className="dp-od-faq-mark"
              aria-hidden
              style={{
                flex: "0 0 auto",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "1px solid var(--line-300)",
                color: "var(--gold-700)",
                fontFamily: "var(--font-sans)",
                fontSize: 18,
                lineHeight: 1,
                transition: "transform .2s var(--ease-out)",
              }}
            >
              +
            </span>
          </summary>
          <p
            style={{
              margin: 0,
              padding: "0 22px 20px",
              maxWidth: "68ch",
              fontFamily: "var(--font-sans)",
              fontWeight: "var(--fw-light)",
              fontSize: "var(--t-body)",
              lineHeight: "var(--lh-relaxed)",
              color: "var(--ink-500)",
            }}
          >
            {item.a}
          </p>
        </details>
      ))}
      <style>{`
        .dp-od-faq > summary::-webkit-details-marker { display: none; }
        .dp-od-faq > summary:hover { background: var(--surface-cream); }
        .dp-od-faq > summary:focus-visible { outline: none; box-shadow: inset var(--focus-ring); }
        .dp-od-faq[open] > summary .dp-od-faq-mark { transform: rotate(45deg); border-color: var(--gold-500); }
      `}</style>
    </div>
  );
}
