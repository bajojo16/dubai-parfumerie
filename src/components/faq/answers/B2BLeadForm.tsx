"use client";

import { useId, useState } from "react";
import { T } from "../faq.data";

export type B2BLabels = {
  placeholder: string;
  submit: string;
  sending: string;
  invalid: string;
  thanks: string;
};

const DEFAULT_LABELS: B2BLabels = {
  placeholder: "votre@email-pro.com",
  submit: "Être recontacté",
  sending: "Envoi…",
  invalid: "Merci de saisir une adresse email valide.",
  thanks: "Merci ! Notre équipe commerciale vous recontacte sous 48h.",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Formulaire de mise en relation B2B. Pas de <form> qui recharge — handler JS.
 * `onSubmit` injectable (branchez votre endpoint). Stub par défaut : confirme.
 */
async function defaultStub(email: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 600));
  // Stub : en production, POST vers votre endpoint de leads B2B.
  void email;
}

export function B2BLeadForm({
  onSubmit = defaultStub,
  labels,
}: {
  onSubmit?: (email: string) => Promise<void> | void;
  labels?: Partial<B2BLabels>;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const fieldId = useId();
  const errId = useId();

  const run = async () => {
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError(L.invalid);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(value);
      setSent(true);
    } catch {
      setError("Une erreur est survenue. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div
        aria-live="polite"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 13px",
          borderRadius: 12,
          background: "#EAF4EC",
          color: "#2F7D54",
          fontFamily: "var(--font-sans)",
          fontSize: 12.5,
          fontWeight: 600,
        }}
      >
        <span aria-hidden>✓</span>
        {L.thanks}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }}>
        <label htmlFor={fieldId} style={srOnly}>
          {L.placeholder}
        </label>
        <input
          id={fieldId}
          type="email"
          inputMode="email"
          value={email}
          placeholder={L.placeholder}
          autoComplete="email"
          aria-invalid={!!error}
          aria-describedby={error ? errId : undefined}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              run();
            }
          }}
          style={{
            flex: "1 1 220px",
            minWidth: 0,
            height: 46,
            border: `1px solid ${error ? "#C58A4A" : T.line2}`,
            borderRadius: 999,
            paddingInline: 18,
            fontFamily: "var(--font-sans)",
            fontSize: 14,
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
            background: T.inkWarm,
            color: T.cream3,
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.7 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {loading ? L.sending : L.submit}
        </button>
      </div>
      {error && (
        <div
          id={errId}
          aria-live="polite"
          style={{
            marginTop: 8,
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            color: "#9A5B1F",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}
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
