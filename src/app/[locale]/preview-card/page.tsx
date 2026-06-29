"use client";

import { ProductCardLuxe, type LuxeProduct } from "@/components/ui/ProductCardLuxe";

const SAMPLES: LuxeProduct[] = [
  { image: "/assets/prod-1.jpg", brand: "Lattafa", title: "Oud Pour Elle", price: 18.9, oldPrice: 84.9, limitedStock: true, href: "#", rating: 4.5, reviewCount: 421 },
  { image: "/assets/prod-2.jpg", brand: "Al Haramain", title: "Amber Oud", price: 29.9, oldPrice: 85.9, href: "#", rating: 5, reviewCount: 188 },
  { image: "/assets/prod-3.jpg", brand: "Dubaï Parfumerie", title: "Eau de Parfum Signature", price: 24.9, href: "#", rating: 4, reviewCount: 53 },
  { image: "/assets/coffret-reef.jpg", brand: "Dubaï Parfumerie", title: "Coffret Découverte Oud", price: 39.9, oldPrice: 79.9, limitedStock: true, href: "#", rating: 4.5, reviewCount: 97 },
];

export default function PreviewCardPage() {
  return (
    <main style={{ background: "#FDFBF6", minHeight: "100vh", padding: "60px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, color: "#2C2620", marginBottom: 28 }}>
          ProductCard « Soft Luxe Arrondi » — prévisu
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {SAMPLES.map((p, i) => (
            <ProductCardLuxe key={i} product={p} locale="fr" />
          ))}
        </div>

        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "#2C2620", margin: "48px 0 20px" }}>
          RTL (arabe) — badges inversés
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {SAMPLES.map((p, i) => (
            <ProductCardLuxe key={i} product={p} locale="ar" />
          ))}
        </div>
      </div>
    </main>
  );
}
