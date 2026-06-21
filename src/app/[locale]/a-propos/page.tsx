import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "À propos",
  description: "Depuis 2015, Dubaï Parfumerie source directement au Golfe 300+ parfums orientaux authentiques. Notre histoire, nos valeurs.",
};

const stats = [
  { k: "10 ans", v: "d'expérience" },
  { k: "12 000+", v: "commandes" },
  { k: "300+", v: "références" },
  { k: "4,8/5", v: "Trustpilot" },
];

const values = [
  { t: "Authenticité", icon: "✦", d: "Sourcing direct au Golfe, contrôle de chaque lot, certificat manuscrit dans chaque colis." },
  { t: "Accessibilité", icon: "◈", d: "Le luxe oriental ne devrait pas être réservé à une élite. Des prix justes, toujours." },
  { t: "Proximité", icon: "◎", d: "Un service client humain, qui répond en moins de 4h et conseille comme un ami parfumeur." },
];

const team = [
  { name: "Sarah Al Mansouri", role: "Fondatrice & directrice artistique", img: "/assets/prod-1.jpg" },
  { name: "Karim Benali", role: "Expert sourcing — Dubaï & Abu Dhabi", img: "/assets/prod-2.jpg" },
  { name: "Lucie Fontaine", role: "Responsable clientèle France", img: "/assets/prod-3.jpg" },
];

export default function AProposPage() {
  return (
    <main style={{ background: "var(--surface-page)" }}>
      {/* Hero */}
      <section style={{ position: "relative", overflow: "hidden", background: "var(--espresso-900)", paddingTop: 40 }}>
        <Image src="/assets/coffrets.jpg" alt="À propos" fill sizes="100vw" style={{ objectFit: "cover", opacity: 0.5 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--espresso-900), rgba(20,16,11,.3))" }} />
        <div style={{ position: "relative", maxWidth: 880, margin: "0 auto", padding: "96px 24px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "11px", letterSpacing: ".24em", textTransform: "uppercase", color: "var(--gold-400)", marginBottom: 16 }}>Notre histoire</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(2.6rem,4.6vw,4.2rem)", lineHeight: 1.05, color: "var(--on-dark-strong)", margin: 0 }}>Rapporter l&apos;Orient, flacon après flacon</h1>
          <p style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: "1.125rem", lineHeight: 1.7, color: "var(--on-dark)", margin: "20px auto 0", maxWidth: "54ch" }}>
            Depuis 2015, nous parcourons les souks du Golfe pour vous offrir la vraie parfumerie orientale, sans intermédiaire ni compromis sur l&apos;authenticité.
          </p>
        </div>
      </section>

      {/* Story */}
      <section style={{ maxWidth: 880, margin: "0 auto", padding: "72px 24px" }}>
        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: "1.0625rem", lineHeight: 1.85, color: "var(--ink-700)" }}>
          <p style={{ margin: "0 0 22px" }}>Tout a commencé par une frustration : impossible de retrouver, en France, les parfums envoûtants rapportés de Dubaï. Trop de contrefaçons, trop d&apos;intermédiaires, trop de promesses non tenues. Nous avons décidé de créer le pont qui manquait entre les maisons du Golfe et les amateurs européens.</p>
          <p style={{ margin: 0 }}>Dix ans plus tard, Dubaï Parfumerie c&apos;est 300+ références authentiques, 15 maisons partenaires, 12 000 commandes livrées et une note de 4,8/5 sur Trustpilot. Mais surtout, une promesse intacte : chaque parfum est vrai, sourcé directement, et accompagné de son certificat manuscrit.</p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: "var(--surface-cream)", borderTop: "1px solid var(--line-100)", borderBottom: "1px solid var(--line-100)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, textAlign: "center" }}>
          {stats.map(s => (
            <div key={s.k}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", fontWeight: 600, color: "var(--gold-600)" }}>{s.k}</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--ink-500)", marginTop: 6 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 24px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(1.8rem,3vw,2.4rem)", color: "var(--ink-900)", margin: "0 0 40px", textAlign: "center" }}>Nos valeurs</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
          {values.map(v => (
            <div key={v.t} style={{ background: "var(--surface-white)", border: "1px solid var(--line-200)", borderRadius: "var(--r-lg)", padding: "32px 28px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "var(--gold-500)", marginBottom: 16 }}>{v.icon}</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--ink-900)", margin: "0 0 12px" }}>{v.t}</h3>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--ink-500)", lineHeight: 1.7, margin: 0 }}>{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ background: "var(--espresso-900)", padding: "72px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(1.8rem,3vw,2.4rem)", color: "var(--on-dark-strong)", margin: "0 0 40px", textAlign: "center" }}>L&apos;équipe</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }}>
            {team.map(p => (
              <div key={p.name} style={{ textAlign: "center" }}>
                <div style={{ position: "relative", width: 120, height: 120, borderRadius: "50%", overflow: "hidden", margin: "0 auto 18px", border: "2px solid rgba(200,144,30,.3)" }}>
                  <Image src={p.img} alt={p.name} fill sizes="120px" style={{ objectFit: "cover" }} />
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--on-dark-strong)", marginBottom: 6 }}>{p.name}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--gold-400)" }}>{p.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
