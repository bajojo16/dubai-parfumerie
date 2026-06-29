"use client";

import { useLocale } from "next-intl";
import { BrandCard, type BrandCardData } from "@/components/ui/BrandCard";
import { FreeShippingBar } from "@/components/ui/FreeShippingBar";

const BRANDS: BrandCardData[] = [
  { name: "Lattafa", founded: 1980, origin: "Sharjah", count: "80+", href: "#" },
  { name: "Reef", founded: 1995, origin: "UAE", count: "40+", href: "#", logo: "/brands/reef.jpg", logoHover: "/brands/reef-hover.jpg", cover: true },
  { name: "Al Haramain", founded: 1970, origin: "Dubaï", count: "60+", href: "#" },
  { name: "Ahmed Al Maghribi", founded: 2005, origin: "Dubaï", count: "30+", href: "#", logo: "/brands/ahmed.jpg", logoHover: "/brands/ahmed-hover.jpg", cover: true, coverBg: "#FCFBF9", coverBgHover: "#0A0A0A" },
  { name: "Armaf", founded: 2013, origin: "UAE", count: "50+", href: "#" },
  { name: "Swiss Arabian", founded: 1974, origin: "Dubaï", count: "70+", href: "#" },
  { name: "Paris Corner", founded: 2010, origin: "France/UAE", count: "35+", href: "#" },
  { name: "Gulf Orchid", founded: 1992, origin: "Bahreïn", count: "45+", href: "#" },
];

export default function PreviewBrandPage() {
  const locale = useLocale();
  return (
    <main style={{ background: "#FDFBF6", minHeight: "100vh", padding: "60px 24px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, color: "#2C2620", margin: "0 0 6px" }}>
          BrandCard — Soft Luxe Arrondi
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "#6A655D", margin: "0 0 28px" }}>
          Survol = swap 2-états (wordmark repos → doré + méta marque). Logos PNG branchables via <code>logo</code>/<code>logoHover</code>.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 18,
            marginBottom: 56,
          }}
        >
          {BRANDS.map((b) => (
            <BrandCard key={b.name} brand={b} locale={locale} />
          ))}
        </div>

        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "#2C2620", margin: "0 0 6px" }}>
          FreeShippingBar — crème & or, shimmer
        </h2>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "#6A655D", margin: "0 0 22px" }}>
          Seuil 60 €. Trois états : départ, en cours, atteint.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
          <FreeShippingBar cartTotal={12.9} locale={locale} />
          <FreeShippingBar cartTotal={47.5} locale={locale} />
          <FreeShippingBar cartTotal={72} locale={locale} />
        </div>
      </div>
    </main>
  );
}
