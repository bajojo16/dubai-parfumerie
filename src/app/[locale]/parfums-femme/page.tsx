import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Parfums Femme",
  description: "Sélection de parfums orientaux féminins — Rose, Musc, Oud délicat. Lattafa, Al Haramain, Swiss Arabian.",
};

const products = [
  { id: 1, image: "/assets/prod-1.jpg", brand: "Lattafa", name: "Oud Pour Elle", price: 28.90, oldPrice: 49.90, notes: "Oud · Rose · Musc blanc" },
  { id: 2, image: "/assets/prod-2.jpg", brand: "Al Haramain", name: "Amber Oud", price: 34.90, oldPrice: 59.90, notes: "Ambre · Vanille · Bois de oud" },
  { id: 4, image: "/assets/prod-4.jpg", brand: "Swiss Arabian", name: "Shaghaf Oud", price: 42.90, oldPrice: 74.90, notes: "Oud · Santal · Rose de Taïf" },
  { id: 3, image: "/assets/prod-3.jpg", brand: "Reef", name: "Opulent Blue", price: 22.90, oldPrice: 39.90, notes: "Musc · Cèdre · Bergamote" },
  { id: 5, image: "/assets/prod-5.jpg", brand: "Armaf", name: "Club de Nuit Femme", price: 19.90, oldPrice: 34.90, notes: "Agrumes · Floral · Musc" },
  { id: 6, image: "/assets/prod-6.jpg", brand: "Ahmed Al Maghribi", name: "L'Or Intense", price: 36.90, oldPrice: 64.90, notes: "Épices · Ambre · Encens" },
];

export default function ParfumsFemmePage() {
  return (
    <main style={{ background: "var(--surface-page)", minHeight: "100vh", paddingTop: 40 }}>
      {/* Hero */}
      <section style={{ background: "var(--surface-cream)", padding: "64px 24px 48px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--gold-500)", marginBottom: 14 }}>Collection</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 4vw, 3.4rem)", color: "var(--ink-900)", margin: "0 0 16px", fontWeight: 500 }}>
          Parfums <em style={{ color: "var(--gold-500)" }}>Femme</em>
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", color: "var(--ink-500)", maxWidth: 520, margin: "0 auto", lineHeight: 1.75 }}>
          Rose de Taïf, musc blanc, oud délicat — les grandes signatures féminines de la parfumerie orientale.
        </p>
      </section>

      {/* Grid */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 28 }}>
          {products.map(p => (
            <a key={p.id} href={`/produit/${p.name.toLowerCase().replace(/ /g, "-")}`} style={{ textDecoration: "none", background: "var(--surface-white)", border: "1px solid #e8dfd0", borderRadius: "var(--r-lg)", overflow: "hidden", display: "block" }}>
              <div style={{ position: "relative", paddingBottom: "100%" }}>
                <Image src={p.image} alt={p.name} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: "cover" }} />
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
