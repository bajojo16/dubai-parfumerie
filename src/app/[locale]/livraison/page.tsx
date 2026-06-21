import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Livraison & Retours",
  description: "Livraison offerte dès 60 €, 48h en France. 14 jours pour changer d'avis. Colissimo, Mondial Relay, DHL Express.",
};

const cards = [
  { t: "Livraison 48h", d: "En France métropolitaine, expédition sous 24h et réception en 48h.", icon: "M3 7h11v8H3zM14 10h4l3 3v2h-7z" },
  { t: "Offerte dès 60 €", d: "Les frais de port sont offerts pour toute commande de 60 € et plus.", icon: "M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6z" },
  { t: "Colis suivi", d: "Un numéro de suivi pour chaque commande, du départ à votre porte.", icon: "M21 12a9 9 0 1 1-9-9M21 4v5h-5" },
];

const rows = [
  { zone: "France métropolitaine", delay: "48h", price: "Offerte dès 60 € · sinon 4,90 €" },
  { zone: "Belgique · Luxembourg · Suisse", delay: "3-4 jours", price: "6,90 €" },
  { zone: "Union Européenne", delay: "4-6 jours", price: "9,90 €" },
  { zone: "International", delay: "5-7 jours", price: "dès 14,90 €" },
];

const carriers = ["Colissimo", "Mondial Relay", "Chronopost", "DHL Express"];

export default function LivraisonPage() {
  return (
    <main style={{ background: "var(--surface-page)", paddingTop: 40 }}>
      {/* Hero */}
      <section style={{ maxWidth: 920, margin: "0 auto", padding: "64px 24px 0", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "11px", letterSpacing: ".24em", textTransform: "uppercase", color: "var(--gold-700)", marginBottom: 14 }}>Infos pratiques</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(2.6rem,4.2vw,3.6rem)", color: "var(--ink-900)", margin: 0 }}>Livraison &amp; Retours</h1>
        <p style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: "1.0625rem", color: "var(--ink-500)", margin: "14px auto 0", maxWidth: "48ch" }}>Rapide, suivie, offerte dès 60 €. Et 14 jours pour changer d&apos;avis.</p>
      </section>

      {/* Cards */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
          {cards.map(c => (
            <div key={c.t} style={{ background: "var(--surface-white)", border: "1px solid var(--line-200)", borderRadius: "var(--r-lg)", padding: "28px 24px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold-500)" strokeWidth="1.6" style={{ marginBottom: 16 }}>
                <path d={c.icon} />
              </svg>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--ink-900)", margin: "0 0 10px" }}>{c.t}</h3>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--ink-500)", lineHeight: 1.65, margin: 0 }}>{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tariffs table */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 24px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "1.6rem", color: "var(--ink-900)", margin: "0 0 18px" }}>Tarifs &amp; délais par zone</h2>
        <div style={{ border: "1px solid var(--line-200)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", background: "var(--surface-cream)", fontFamily: "var(--font-sans)", fontSize: "11px", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-500)" }}>
            <div style={{ padding: "14px 20px" }}>Zone</div>
            <div style={{ padding: "14px 20px" }}>Délai</div>
            <div style={{ padding: "14px 20px" }}>Frais</div>
          </div>
          {rows.map((r, i) => (
            <div key={r.zone} style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", borderTop: "1px solid var(--line-100)", background: i % 2 === 0 ? "var(--surface-white)" : "var(--surface-page)" }}>
              <div style={{ padding: "16px 20px", fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--ink-900)" }}>{r.zone}</div>
              <div style={{ padding: "16px 20px", fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--ink-500)" }}>{r.delay}</div>
              <div style={{ padding: "16px 20px", fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--ink-500)" }}>{r.price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Carriers */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "var(--ink-400)", letterSpacing: ".08em", textTransform: "uppercase" }}>Transporteurs</span>
          {carriers.map(c => (
            <span key={c} style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--ink-700)", background: "var(--surface-cream)", border: "1px solid var(--line-200)", borderRadius: "var(--r-sm)", padding: "6px 14px" }}>{c}</span>
          ))}
        </div>
      </section>

      {/* Return policy */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 72px" }}>
        <div style={{ background: "var(--espresso-900)", borderRadius: "var(--r-lg)", padding: "40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--on-dark-strong)", marginBottom: 10 }}>Politique de retour</div>
            <p style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: ".9375rem", lineHeight: 1.7, color: "var(--on-dark-muted)", margin: 0 }}>
              Vous disposez de 14 jours après réception pour retourner tout article non ouvert et scellé. Le remboursement est effectué sous 5 jours ouvrés après réception du colis retourné, sur votre moyen de paiement initial.
            </p>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--on-dark-strong)", marginBottom: 10 }}>Comment procéder</div>
            <ol style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: ".9375rem", lineHeight: 1.9, color: "var(--on-dark-muted)", margin: 0, paddingLeft: 18 }}>
              <li>Contactez-nous à retour@dubaiparfumerie.com</li>
              <li>Recevez votre étiquette de retour prépayée</li>
              <li>Déposez le colis en point relais</li>
              <li>Remboursement sous 5 jours ouvrés</li>
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}
