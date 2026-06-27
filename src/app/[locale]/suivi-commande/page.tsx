"use client";
import { useState } from "react";

const steps = [
  { label: "Commande confirmée", desc: "Paiement validé · email de confirmation envoyé", date: "20 juin, 09:14", done: true, icon: "m5 12 5 5 9-11" },
  { label: "En préparation", desc: "Votre colis est emballé avec soin dans notre atelier", date: "20 juin, 14:32", done: true, icon: "m5 12 5 5 9-11" },
  { label: "Expédié", desc: "Remis au transporteur Colissimo · suivi 6A1029384756", date: "Prévu demain", done: false, icon: "M3 7h11v8H3zM14 10h4l3 3v2h-7z" },
  { label: "Livré", desc: "Remise en main propre ou en point relais", date: "Estimé sous 48h", done: false, icon: "M3 12h18M3 12l4-4M3 12l4 4" },
];

export default function SuiviCommandePage() {
  const [order, setOrder] = useState("DP-100482");
  const [email, setEmail] = useState("");
  const [tracked, setTracked] = useState(false);
  const [toast, setToast] = useState("");

  const track = (e: React.FormEvent) => {
    e.preventDefault();
    setTracked(true);
    setToast(`Commande ${order} localisée`);
    setTimeout(() => setToast(""), 2400);
  };

  return (
    <main style={{ background: "var(--surface-page)", minHeight: "100vh", paddingTop: 40 }}>
      {/* Header */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px 0", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "11px", letterSpacing: ".24em", textTransform: "uppercase", color: "var(--gold-700)", marginBottom: 14 }}>Mon espace</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(2.4rem,4vw,3.4rem)", color: "var(--ink-900)", margin: 0 }}>Suivi de commande</h1>
        <p style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: "1.0625rem", color: "var(--ink-500)", margin: "14px auto 0", maxWidth: "46ch" }}>
          Renseignez votre numéro de commande pour suivre votre colis en temps réel.
        </p>
      </section>

      {/* Form */}
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "36px 24px 8px" }}>
        <form onSubmit={track} style={{ background: "var(--surface-white)", border: "1px solid var(--line-200)", borderRadius: "var(--r-md)", padding: "28px", display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            value={order}
            onChange={e => setOrder(e.target.value)}
            placeholder="Numéro de commande (ex. DP-100482)"
            style={{ fontFamily: "var(--font-sans)", fontSize: "14px", color: "var(--ink-900)", background: "var(--surface-page)", border: "1px solid var(--line-200)", borderRadius: "var(--r-xs)", padding: "14px 16px", outline: "none" }}
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email de la commande"
            style={{ fontFamily: "var(--font-sans)", fontSize: "14px", color: "var(--ink-900)", background: "var(--surface-page)", border: "1px solid var(--line-200)", borderRadius: "var(--r-xs)", padding: "14px 16px", outline: "none" }}
          />
          <button type="submit" style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: ".875rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-900)", background: "var(--gold-500)", border: "none", borderRadius: "var(--r-xs)", padding: "15px", cursor: "pointer", boxShadow: "0 4px 16px rgba(200,144,30,.3)" }}>
            Suivre ma commande
          </button>
        </form>
      </section>

      {/* Tracking result */}
      {tracked && (
        <section style={{ maxWidth: 760, margin: "0 auto", padding: "24px 24px 72px" }}>
          <div style={{ background: "var(--surface-cream)", border: "1px solid var(--line-100)", borderRadius: "var(--r-lg)", padding: "36px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
              <div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "11px", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-500)" }}>Commande {order}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--ink-900)" }}>En cours d&apos;expédition</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "11px", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-500)" }}>Livraison estimée</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--gold-700)" }}>Demain, avant 18h</div>
              </div>
            </div>

            {/* Steps */}
            <div style={{ position: "relative" }}>
              {steps.map((s, i) => (
                <div key={s.label} style={{ display: "flex", gap: 18, paddingBottom: i < steps.length - 1 ? 28 : 0, position: "relative" }}>
                  {/* Vertical line */}
                  {i < steps.length - 1 && (
                    <div style={{ position: "absolute", left: 19, top: 40, bottom: 0, width: 2, background: s.done ? "var(--gold-500)" : "var(--line-200)" }} />
                  )}
                  {/* Dot */}
                  <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: "50%", background: s.done ? "var(--gold-500)" : "var(--surface-white)", border: `2px solid ${s.done ? "var(--gold-500)" : "var(--line-300)"}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={s.done ? "var(--ink-900)" : "var(--ink-400)"} strokeWidth="1.6">
                      <path d={s.icon} />
                    </svg>
                  </div>
                  <div style={{ paddingTop: 6 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--ink-900)" }}>{s.label}</div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--ink-500)" }}>{s.desc}</div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "var(--gold-700)", marginTop: 2 }}>{s.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 24, fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--ink-500)" }}>
            Un problème avec votre colis ?{" "}
            <a href="/faq" style={{ color: "var(--gold-700)" }}>Contactez-nous</a>
          </div>
        </section>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 400, background: "var(--espresso-900)", color: "var(--on-dark-strong)", border: "1px solid rgba(200,144,30,.4)", borderRadius: "999px", padding: "13px 24px", fontFamily: "var(--font-sans)", fontSize: "13px", boxShadow: "0 8px 32px rgba(0,0,0,.3)" }}>
          {toast}
        </div>
      )}
    </main>
  );
}
