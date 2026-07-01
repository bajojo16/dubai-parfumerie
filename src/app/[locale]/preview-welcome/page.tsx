"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { WelcomeModal } from "@/components/welcome/WelcomeModal";

export default function PreviewWelcomePage() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  // Compteur de remontage : chaque clic « Réafficher » remonte le pop-up (re-ouvrable).
  const [reopenKey, setReopenKey] = useState(0);

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      style={{ background: "#FDFBF6", minHeight: "100vh", padding: "60px 24px" }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 32,
            color: "#2C2620",
            margin: "0 0 6px",
          }}
        >
          Pop-up de bienvenue
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            color: "#6A655D",
            margin: "0 0 24px",
            lineHeight: 1.7,
            maxWidth: 640,
          }}
        >
          Aperçu du pop-up de bienvenue affiché sur la page d&apos;accueil. Ici il est
          toujours visible (mode <code>forceOpen</code>, le localStorage est ignoré). Fermez-le
          puis cliquez sur « Réafficher » pour l&apos;ouvrir à nouveau et itérer facilement.
        </p>

        <button
          onClick={() => setReopenKey(k => k + 1)}
          style={{
            background: "var(--gold-500)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--r-sm)",
            padding: "12px 22px",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            fontSize: "0.86rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          Réafficher le pop-up
        </button>
      </div>

      <WelcomeModal key={reopenKey} forceOpen />
    </main>
  );
}
