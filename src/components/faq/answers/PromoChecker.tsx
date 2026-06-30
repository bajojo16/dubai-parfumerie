"use client";

import { useId, useState } from "react";
import { T } from "../faq.data";

export type PromoResult = { ok: boolean; message: string };

export type PromoLabels = {
  placeholder: string;
  check: string;
  checking: string;
  empty: string;
};

const DEFAULT_LABELS: PromoLabels = {
  placeholder: "Votre code promo",
  check: "Vérifier",
  checking: "Vérification…",
  empty: "Saisissez un code pour le vérifier.",
};

/**
 * Vérificateur de code promo. Aucun <form> qui recharge — handler JS.
 * `onCheck` injectable (branchez votre API). Stub par défaut :
 * accepte tout code commençant par « DUBAI » ou « BIENVENUE ».
 */
async function defaultStub(code: string): Promise<PromoResult> {
  const c = code.trim().toUpperCase();
  await new Promise((r) => setTimeout(r, 550));
  if (/^(DUBAI|BIENVENUE)/.test(c)) {
    return { ok: true, message: `Code « ${c} » valide : la remise sera appliquée au panier.` };
  }
  return {
    ok: false,
    message: `Le code « ${c} » n'est pas reconnu ou a expiré. Vérifiez la saisie ou contactez-nous.`,
  };
}

export function PromoChecker({
  onCheck = defaultStub,
  labels,
}: {
  onCheck?: (code: string) => Promise<PromoResult> | PromoResult;
  labels?: Partial<PromoLabels>;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PromoResult | null>(null);
  const fieldId = useId();

  const run = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setResult({ ok: false, message: L.empty });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const r = await onCheck(trimmed);
      setResult(r);
    } catch {
      setResult({ ok: false, message: "Une erreur est survenue. Réessayez dans un instant." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }}>
        <label htmlFor={fieldId} style={srOnly}>
          {L.placeholder}
        </label>
        <input
          id={fieldId}
          value={code}
          placeholder={L.placeholder}
          autoComplete="off"
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              run();
            }
          }}
          style={{
            flex: "1 1 200px",
            minWidth: 0,
            height: 46,
            border: `1px solid ${T.line2}`,
            borderRadius: 999,
            paddingInline: 18,
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            letterSpacing: "0.04em",
            color: T.ink,
            background: T.card,
            outline: "none",
            textAlign: "start",
          }}
        />
        <button
          type="button"
          onClick={run}
          disabled={loading}
          style={{
            flexShrink: 0,
            border: "none",
            borderRadius: 999,
            paddingInline: 22,
            height: 46,
            background: T.goldDeep,
            color: "#fff",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.7 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {loading ? L.checking : L.check}
        </button>
      </div>

      <div aria-live="polite" style={{ minHeight: 0 }}>
        {result && (
          <div
            style={{
              marginTop: 12,
              display: "inline-flex",
              alignItems: "flex-start",
              gap: 8,
              padding: "9px 13px",
              borderRadius: 12,
              background: result.ok ? "#EAF4EC" : "#F7ECE0",
              color: result.ok ? "#2F7D54" : "#9A5B1F",
              fontFamily: "var(--font-sans)",
              fontSize: 12.5,
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            <span aria-hidden style={{ flexShrink: 0 }}>
              {result.ok ? "✓" : "ⓘ"}
            </span>
            <span>{result.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}

const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};
