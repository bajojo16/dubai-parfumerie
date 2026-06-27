import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Huile de Parfum — Attar",
  description: "Huiles de parfum orientales (attar) sans alcool. Concentration maximale, tenue 24h. Oud, Rose, Musc.",
};

const products = [
  { id: 1, image: "/assets/prod-1.jpg", brand: "Lattafa", name: "Attar Oud Safi", price: 18.90, oldPrice: 32.90, notes: "Oud pur · Santal · Musc", volume: "6ml" },
  { id: 2, image: "/assets/prod-2.jpg", brand: "Al Haramain", name: "Attar Rose Taïf", price: 24.90, oldPrice: 44.90, notes: "Rose de Taïf · Musc blanc", volume: "12ml" },
  { id: 3, image: "/assets/prod-3.jpg", brand: "Swiss Arabian", name: "Attar Misk", price: 14.90, oldPrice: 26.90, notes: "Musc · Ambre · Vanille", volume: "6ml" },
  { id: 4, image: "/assets/prod-4.jpg", brand: "Gulf Orchid", name: "Attar Bakhour", price: 19.90, oldPrice: 36.90, notes: "Encens · Oud · Épices", volume: "12ml" },
  { id: 5, image: "/assets/prod-5.jpg", brand: "Khadlaj", name: "Attar Wardan", price: 16.90, oldPrice: 29.90, notes: "Rose · Jasmin · Santal", volume: "6ml" },
  { id: 6, image: "/assets/prod-6.jpg", brand: "Ahmed Al Maghribi", name: "Attar Gold", price: 28.90, oldPrice: 54.90, notes: "Oud Assam · Ambre noir", volume: "15ml" },
];

export default function HuileDeParfumPage() {
  return (
    <main style={{ background: "var(--surface-page)", minHeight: "100vh", paddingTop: 40 }}>
      <section style={{ background: "var(--surface-cream)", padding: "64px 24px 48px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--gold-500)", marginBottom: 14 }}>Tradition orientale</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 4vw, 3.4rem)", color: "var(--ink-900)", margin: "0 0 16px", fontWeight: 500 }}>
          Huile de Parfum <em style={{ color: "var(--gold-500)" }}>· Attar</em>
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", color: "var(--ink-500)", maxWidth: 560, margin: "0 auto", lineHeight: 1.75 }}>
          Sans alcool, concentration maximale. Les attars sont appliqués directement sur les points de chaleur — tenue 12 à 24 heures sur la peau.
        </p>
      </section>

      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 28 }}>
          {products.map(p => (
            <a key={p.id} href={`/produit/${p.name.toLowerCase().replace(/ /g, "-")}`} style={{ textDecoration: "none", background: "var(--surface-white)", border: "1px solid #e8dfd0", borderRadius: "var(--r-lg)", overflow: "hidden", display: "block" }}>
              <div style={{ position: "relative", paddingBottom: "100%" }}>
                <Image src={p.image} alt={p.name} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: "cover" }} />
                <div style={{ position: "absolute", top: 12, right: 12, background: "var(--espresso-800)", color: "var(--gold-300)", fontSize: "0.66rem", padding: "3px 10px", borderRadius: "var(--r-sm)", fontFamily: "var(--font-sans)", letterSpacing: "0.08em" }}>{p.volume}</div>
              </div>
              <div style={{ padding: "18px 20px 22px" }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold-500)", marginBottom: 6 }}>{p.brand}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", color: "var(--ink-900)", margin: "0 0 6px" }}>{p.name}</h3>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--ink-400)", marginBottom: 14 }}>{p.notes}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 600, color: "var(--ink-900)" }}>{p.price.toFixed(2)} €</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--ink-400)", textDecoration: "line-through" }}>{p.oldPrice.toFixed(2)} €</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
