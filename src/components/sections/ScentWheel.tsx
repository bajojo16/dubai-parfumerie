"use client";

import { useState } from "react";
import Image from "next/image";

// Données inlinées depuis _home-client.tsx (non exportées là-bas) ───────────────
const scentProducts: Record<string, { brand: string; name: string; price: number; oldPrice: number; img: string }[]> = {
  Oud: [
    { brand: "Lattafa", name: "Oud Mood", price: 32.9, oldPrice: 54.9, img: "/assets/prod-1.jpg" },
    { brand: "Swiss Arabian", name: "Shaghaf Oud", price: 39.9, oldPrice: 74.9, img: "/assets/prod-2.jpg" },
    { brand: "Al Haramain", name: "Oudh 36", price: 44.9, oldPrice: 79.9, img: "/assets/prod-3.jpg" },
  ],
  Ambre: [
    { brand: "Al Haramain", name: "Amber Oud", price: 34.9, oldPrice: 59.9, img: "/assets/prod-2.jpg" },
    { brand: "Lattafa", name: " Amber Elixir", price: 29.9, oldPrice: 49.9, img: "/assets/prod-4.jpg" },
    { brand: "Rasasi", name: "Ambar Gold", price: 37.9, oldPrice: 64.9, img: "/assets/prod-5.jpg" },
  ],
  Musc: [
    { brand: "Lattafa", name: "Musk Mood", price: 24.9, oldPrice: 42.9, img: "/assets/prod-3.jpg" },
    { brand: "Swiss Arabian", name: "White Musk", price: 28.9, oldPrice: 49.9, img: "/assets/prod-6.jpg" },
    { brand: "Ard Al Zaafaran", name: "Musk Pour Elle", price: 22.9, oldPrice: 39.9, img: "/assets/prod-1.jpg" },
  ],
  Rose: [
    { brand: "Lattafa", name: "Rose pour Elle", price: 28.9, oldPrice: 49.9, img: "/assets/prod-4.jpg" },
    { brand: "Swiss Arabian", name: "Rose de Taïf", price: 42.9, oldPrice: 72.9, img: "/assets/prod-5.jpg" },
    { brand: "Rasasi", name: "Bloom Rose", price: 31.9, oldPrice: 54.9, img: "/assets/prod-2.jpg" },
  ],
  Santal: [
    { brand: "Al Haramain", name: "Sandal Wood", price: 36.9, oldPrice: 62.9, img: "/assets/prod-6.jpg" },
    { brand: "Lattafa", name: "Santal Royal", price: 33.9, oldPrice: 57.9, img: "/assets/prod-3.jpg" },
    { brand: "Swiss Arabian", name: "Sandalia", price: 38.9, oldPrice: 66.9, img: "/assets/prod-1.jpg" },
  ],
  Safran: [
    { brand: "Lattafa", name: "Saffron Mood", price: 30.9, oldPrice: 52.9, img: "/assets/prod-5.jpg" },
    { brand: "Rasasi", name: "Saffron Oud", price: 41.9, oldPrice: 71.9, img: "/assets/prod-2.jpg" },
    { brand: "Al Haramain", name: "Safran Élixir", price: 35.9, oldPrice: 61.9, img: "/assets/prod-4.jpg" },
  ],
  Vanille: [
    { brand: "Lattafa", name: "Vanilla Mood", price: 26.9, oldPrice: 44.9, img: "/assets/prod-6.jpg" },
    { brand: "Swiss Arabian", name: "Vanilla Oud", price: 39.9, oldPrice: 68.9, img: "/assets/prod-3.jpg" },
    { brand: "Rasasi", name: "Vanille Noire", price: 32.9, oldPrice: 56.9, img: "/assets/prod-1.jpg" },
  ],
  Encens: [
    { brand: "Al Haramain", name: "Encens Mystique", price: 37.9, oldPrice: 64.9, img: "/assets/prod-4.jpg" },
    { brand: "Lattafa", name: "Bakhour Mood", price: 29.9, oldPrice: 49.9, img: "/assets/prod-5.jpg" },
    { brand: "Swiss Arabian", name: "Incense Oud", price: 43.9, oldPrice: 76.9, img: "/assets/prod-2.jpg" },
  ],
};

export function ScentWheel({ locale = "fr" }: { locale?: string }) {
  const isRTL = locale === "ar";
  const [selectedScent, setSelectedScent] = useState<string | null>(null);
  const [hoveredScent, setHoveredScent] = useState<string | null>(null);

  return (
    <section id="roue" dir={isRTL ? "rtl" : "ltr"} style={{ background: "#1a1208", padding: "80px 20px" }}>
      <div className="dp-roue-grid" style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
        {/* Left: title + result */}
        <div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold-500)", marginBottom: 20 }}>Recherche par notes</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(2.8rem,4vw,4rem)", color: "var(--on-dark-strong)", lineHeight: 1.05, margin: "0 0 32px" }}>La Roue des <em>Senteurs</em></h2>
          {selectedScent ? (
            <div style={{ animation: "fadeSlideIn .3s ease" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--gold-400)", marginBottom: 10 }}>{selectedScent}</div>
              <div style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: ".9375rem", color: "var(--on-dark-muted)", lineHeight: 1.7, marginBottom: 20 }}>
                Découvrez tous les parfums à dominante <strong style={{ color: "var(--on-dark)" }}>{selectedScent}</strong> de notre catalogue — des créations orientales rares sourcées directement au Golfe.
              </div>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gold-400)", textDecoration: "none" }}>
                Voir les parfums {selectedScent} →
              </a>
            </div>
          ) : (
            <p style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: "1rem", color: "var(--on-dark-muted)", lineHeight: 1.8, margin: 0 }}>
              Cliquez sur une note olfactive pour explorer les parfums qui la composent. De l&apos;oud mystérieux au musc délicat, chaque cercle ouvre un univers.
            </p>
          )}
        </div>

        {/* Right: SVG wheel */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          {(() => {
            const CX = 250, CY = 250, R = 170, RC = 68, RN = 54;
            const nodes = [
              { label: "Oud",     a: 0   },
              { label: "Ambre",   a: 45  },
              { label: "Musc",    a: 90  },
              { label: "Rose",    a: 135 },
              { label: "Santal",  a: 180 },
              { label: "Safran",  a: 225 },
              { label: "Vanille", a: 270 },
              { label: "Encens",  a: 315 },
            ];
            const toRad = (deg: number) => (deg * Math.PI) / 180;
            const pos = (a: number) => ({
              x: CX + R * Math.sin(toRad(a)),
              y: CY - R * Math.cos(toRad(a)),
            });
            return (
              <svg viewBox="0 0 500 500" width="100%" style={{ maxWidth: 480, overflow: "visible" }}>
                {/* Dashed lines center → nodes */}
                {nodes.map(n => {
                  const p = pos(n.a);
                  const dx = p.x - CX, dy = p.y - CY;
                  const dist = Math.sqrt(dx*dx + dy*dy);
                  const ux = dx/dist, uy = dy/dist;
                  return (
                    <line
                      key={n.label}
                      x1={CX + ux * RC} y1={CY + uy * RC}
                      x2={p.x - ux * RN} y2={p.y - uy * RN}
                      stroke="rgba(200,144,30,0.3)"
                      strokeWidth="1.2"
                      strokeDasharray="5 4"
                    />
                  );
                })}
                {/* Center circle */}
                <circle cx={CX} cy={CY} r={RC} fill="#15100b" stroke="#C8901E" strokeWidth="1.5" strokeDasharray="6 4" />
                <text x={CX} y={CY - 8} textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="17" fill={selectedScent ? "#D8A63A" : "#e8dfc8"} fontStyle="italic">
                  {selectedScent || "La Roue"}
                </text>
                <text x={CX} y={CY + 12} textAnchor="middle" fontFamily="Jost, sans-serif" fontSize="8.5" fill="rgba(220,200,160,.55)" letterSpacing="2">
                  {selectedScent ? "SÉLECTIONNÉ" : "CLIQUEZ UNE NOTE"}
                </text>
                {/* Outer nodes */}
                {nodes.map(n => {
                  const p = pos(n.a);
                  const active = selectedScent === n.label;
                  const hovered = hoveredScent === n.label;
                  return (
                    <g
                      key={n.label}
                      onClick={() => setSelectedScent(selectedScent === n.label ? null : n.label)}
                      onMouseEnter={() => setHoveredScent(n.label)}
                      onMouseLeave={() => setHoveredScent(null)}
                      style={{ cursor: "pointer" }}
                    >
                      <circle
                        cx={p.x} cy={p.y} r={RN}
                        fill={active ? "rgba(200,144,30,0.22)" : hovered ? "rgba(200,144,30,0.12)" : "rgba(90,72,48,0.55)"}
                        stroke={active ? "#C8901E" : hovered ? "rgba(200,144,30,0.5)" : "rgba(120,96,60,0.35)"}
                        strokeWidth="1.2"
                        style={{ transition: "fill .2s, stroke .2s" }}
                      />
                      <text x={p.x} y={p.y + 6} textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="15" fill={active ? "#D8A63A" : "#e8dfc8"} style={{ pointerEvents: "none", transition: "fill .2s" }}>
                        {n.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            );
          })()}
        </div>
      </div>

      {/* Suggestions: 3 parfums de la senteur sélectionnée (miniatures) */}
      {selectedScent && scentProducts[selectedScent] && (
        <div style={{ maxWidth: 1240, margin: "32px auto 0", animation: "fadeSlideIn .35s ease" }}>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-500)", marginBottom: 12, textAlign: "center" }}>
            3 parfums {selectedScent} à découvrir
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {scentProducts[selectedScent].map(p => (
              <a key={p.name} href={`/produit/${p.name.trim().toLowerCase().replace(/\s+/g, "-")}`} style={{
                textDecoration: "none", display: "flex", alignItems: "center", gap: 12,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(200,144,30,0.18)",
                borderRadius: "var(--r-md)", padding: 8, transition: "border-color .25s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gold-400)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,144,30,0.18)"; }}
              >
                <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0, borderRadius: "var(--r-sm)", overflow: "hidden" }}>
                  <Image src={p.img} alt={p.name} fill sizes="52px" style={{ objectFit: "cover" }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.6rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gold-500)", marginBottom: 2 }}>{p.brand}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: "var(--on-dark-strong)", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name.trim()}</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 600, color: "var(--gold-400)" }}>{p.price.toFixed(2).replace(".", ",")} €</span>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--on-dark-muted)", textDecoration: "line-through" }}>{p.oldPrice.toFixed(2).replace(".", ",")} €</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
