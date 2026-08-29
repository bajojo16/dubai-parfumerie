import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import GridDensity from "@/components/ui/GridDensity";

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
      {/* Bannière : photo attars en fond + voile espresso pour la lisibilité */}
      <section style={{ position: "relative", background: "var(--espresso-900)", minHeight: "clamp(340px, 36vw, 480px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(48px, 6vw, 76px) 24px", textAlign: "center", overflow: "hidden", isolation: "isolate" }}>
        <Image
          src="/assets/banner-huile-de-parfum.jpg"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 42%", zIndex: -2 }}
        />
        {/* Voile 1 — assombrit seulement les bords haut/bas, le centre de la photo reste net */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: -1,
            background: "linear-gradient(180deg, rgba(21,16,11,0.58) 0%, rgba(21,16,11,0.14) 34%, rgba(21,16,11,0.16) 64%, rgba(21,16,11,0.62) 100%)",
          }}
        />
        {/* Voile 2 — halo doux derrière le texte seul, pour le contraste sans ternir l'image */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: -1,
            background: "radial-gradient(ellipse 60% 62% at 50% 50%, rgba(21,16,11,0.52) 0%, rgba(21,16,11,0.30) 46%, rgba(21,16,11,0) 74%)",
          }}
        />
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--gold-300)", marginBottom: 14, textShadow: "0 1px 12px rgba(21,16,11,0.7)" }}>Tradition orientale</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 4vw, 3.4rem)", color: "#FFFFFF", margin: "0 0 16px", fontWeight: 500, textShadow: "0 2px 22px rgba(21,16,11,0.72)" }}>
          Huile de Parfum <em style={{ color: "var(--gold-300)" }}>· Attar</em>
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", color: "rgba(255,255,255,0.92)", maxWidth: 560, margin: "0 auto", lineHeight: 1.75, textShadow: "0 1px 14px rgba(21,16,11,0.75)" }}>
          Sans alcool, concentration maximale. Les attars sont appliqués directement sur les points de chaleur — tenue 12 à 24 heures sur la peau.
        </p>
      </section>

      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "48px 24px 60px" }}>
        {/* Cartes compactes : ~5 colonnes à 1240px au lieu de 4 très larges */}
        <GridDensity storageKey="dp-density-huiles" gap={18}>
          {products.map(p => (
            <Link key={p.id} href={`/produit/${p.name.toLowerCase().replace(/ /g, "-")}`} style={{ textDecoration: "none", background: "var(--surface-white)", border: "1px solid #e8dfd0", borderRadius: "var(--r-lg)", overflow: "hidden", display: "block" }}>
              <div style={{ position: "relative", paddingBottom: "100%" }}>
                <Image src={p.image} alt={p.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px" style={{ objectFit: "cover" }} />
                <div style={{ position: "absolute", top: 9, right: 9, background: "var(--espresso-800)", color: "var(--gold-300)", fontSize: "0.6rem", padding: "3px 8px", borderRadius: "var(--r-sm)", fontFamily: "var(--font-sans)", letterSpacing: "0.08em" }}>{p.volume}</div>
              </div>
              <div style={{ padding: "13px 14px 16px" }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold-500)", marginBottom: 5 }}>{p.brand}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--ink-900)", margin: "0 0 4px" }}>{p.name}</h3>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", color: "var(--ink-400)", marginBottom: 10 }}>{p.notes}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 600, color: "var(--ink-900)" }}>{p.price.toFixed(2)} €</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.74rem", color: "var(--ink-400)", textDecoration: "line-through" }}>{p.oldPrice.toFixed(2)} €</span>
                </div>
              </div>
            </Link>
          ))}
        </GridDensity>
      </section>
    </main>
  );
}
