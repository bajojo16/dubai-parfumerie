"use client";

import { useState } from "react";

const VOLUMES = ["30ml", "50ml", "100ml"] as const;
type Volume = (typeof VOLUMES)[number];

interface VolumeSelectorProps {
  defaultVolume?: Volume;
}

export default function VolumeSelector({ defaultVolume = "100ml" }: VolumeSelectorProps) {
  const [selected, setSelected] = useState<Volume>(defaultVolume);

  return (
    <div>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--t-sm)",
          fontWeight: "var(--fw-medium)",
          color: "var(--ink-700)",
          letterSpacing: "var(--ls-wide)",
          textTransform: "uppercase",
          marginBottom: "0.625rem",
        }}
      >
        Contenance
      </p>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {VOLUMES.map((vol) => {
          const isActive = selected === vol;
          return (
            <button
              key={vol}
              onClick={() => setSelected(vol)}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "var(--r-sm)",
                border: isActive
                  ? "1.5px solid var(--gold-500)"
                  : "1.5px solid var(--line-200)",
                background: isActive ? "var(--gold-100)" : "var(--surface-white)",
                color: isActive ? "var(--gold-700)" : "var(--ink-500)",
                fontFamily: "var(--font-sans)",
                fontSize: "var(--t-sm)",
                fontWeight: isActive ? "var(--fw-semibold)" : "var(--fw-regular)",
                cursor: "pointer",
                transition:
                  "border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)",
                boxShadow: isActive ? "var(--shadow-gold)" : "none",
              }}
              aria-pressed={isActive}
            >
              {vol}
            </button>
          );
        })}
      </div>
    </div>
  );
}
