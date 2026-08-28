"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { ScentFamily } from "@/data/scent-families";

export type ScentWheelLabels = {
  eyebrow: string; // sur-titre
  title: string; // titre principal
  restName: string; // label centre au repos
  restSub: string; // sous-label centre au repos
  familySub: string; // sous-label centre quand famille active ("Famille")
  intro: string; // texte d'intro panneau droit au repos
  cta: string; // libellé du bouton
  wheelAria: string; // aria-label de la roue
  priceFrom: string; // préfixe prix ("dès")
  clickHint: string; // incitation au repos ("Cliquez sur une note")
};

const DEFAULT_LABELS: ScentWheelLabels = {
  eyebrow: "Recherche par notes",
  title: "La Roue des Senteurs",
  restName: "Choisissez une famille",
  restSub: "La Roue",
  familySub: "Famille",
  intro:
    "Cliquez sur une famille olfactive pour explorer ses notes et découvrir nos best-sellers.",
  cta: "Découvrir la sélection",
  wheelAria: "Roue des familles olfactives",
  priceFrom: "",
  clickHint: "Cliquez sur une note",
};

// Tracés SVG des 6 segments (ordre : Oud, Rose, Ambré, Boisé, Musc, Épicé)
const SEGMENT_PATHS = [
  "M150,20 A130,130 0 0 1 262.58,85 L200.23,121 A58,58 0 0 0 150,92 Z",
  "M262.58,85 A130,130 0 0 1 262.58,215 L200.23,179 A58,58 0 0 0 200.23,121 Z",
  "M262.58,215 A130,130 0 0 1 150,280 L150,208 A58,58 0 0 0 200.23,179 Z",
  "M150,280 A130,130 0 0 1 37.42,215 L99.77,179 A58,58 0 0 0 150,208 Z",
  "M37.42,215 A130,130 0 0 1 37.42,85 L99.77,121 A58,58 0 0 0 99.77,179 Z",
  "M37.42,85 A130,130 0 0 1 150,20 L150,92 A58,58 0 0 0 99.77,121 Z",
];

const LABEL_POS = [
  { x: 197, y: 73 },
  { x: 244, y: 153 },
  { x: 197, y: 235 },
  { x: 103, y: 235 },
  { x: 56, y: 153 },
  { x: 103, y: 73 },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function ScentWheelInteractive({
  families,
  locale = "fr",
  labels,
}: {
  families: ScentFamily[];
  locale?: string;
  labels?: Partial<ScentWheelLabels>;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const isRTL = locale === "ar";
  const reduced = usePrefersReducedMotion();
  // Famille active par défaut : « épice » (si présente, sinon aucune)
  const [activeKey, setActiveKey] = useState<string | null>(
    families.some((f) => f.key === "epice") ? "epice" : null
  );

  const active = useMemo(
    () => families.find((f) => f.key === activeKey) ?? null,
    [families, activeKey]
  );

  const fmtPrice = (n: number) => {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `${n} €`;
    }
  };

  const toggle = (key: string) =>
    setActiveKey((k) => (k === key ? null : key));

  const trans = reduced ? "none" : undefined;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#FAF6EE",
        // Pleine largeur, sans bordure ni coins arrondis (touche les bords)
        padding: 22,
      }}
    >
      {/* Fond d'ambiance — image (ou vidéo) de l'ingrédient de la famille active */}
      {active?.ingredientImage && (
        <div
          key={active.key}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            animation: reduced ? "none" : "dpWheelBgFade .6s ease",
          }}
        >
          {active.video ? (
            <video
              src={active.video}
              poster={active.ingredientImage}
              muted
              loop
              autoPlay
              playsInline
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <Image
              src={active.ingredientImage}
              alt=""
              fill
              sizes="100vw"
              style={{ objectFit: "cover" }}
            />
          )}
          {/* Très léger voile pour homogénéiser sans masquer (fond quasi pleine opacité) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(250,246,238,.05)",
            }}
          />
        </div>
      )}

      {/* En-tête pleine largeur — le titre coiffe la section entière (roue + panneau)
          au lieu d'être enfermé dans la colonne de droite : il annonce le module
          complet et reste au bon endroit quand les deux colonnes se superposent
          sous 760px (sinon il se retrouverait sous la roue). */}
      <div
        className="dp-wheel-head"
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 760,
          marginInline: "auto",
          marginBottom: 26,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: "#A8915F",
            marginBottom: 10,
          }}
        >
          {L.eyebrow}
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "clamp(2rem,3.6vw,2.9rem)",
            color: "#2C2620",
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          {L.title}
          {active ? ` : ${active.label}` : ""}
        </h2>
      </div>

      {/* Contenu */}
      <div
        className="dp-wheel-grid"
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexWrap: "wrap",
          flexDirection: isRTL ? "row-reverse" : "row",
          gap: 28,
          alignItems: "center",
        }}
      >
        {/* Colonne roue */}
        <div
          style={{
            flex: "0 1 320px",
            display: "flex",
            justifyContent: "center",
            minWidth: 240,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              // Roue réduite de 360 à 280 (-22%) : le viewBox carré 300x300 garde
              // le cercle parfait, seule l'échelle de rendu change.
              maxWidth: 280,
            }}
          >
          <svg
            viewBox="0 0 300 300"
            width="100%"
            role="group"
            aria-label={L.wheelAria}
            style={{ display: "block", overflow: "visible" }}
          >
            {/* clipPaths : un par segment ayant un media (image/vidéo) + cercle central */}
            <defs>
              {families.map((f, i) =>
                f.ingredientImage ? (
                  <clipPath key={f.key} id={`seg-${f.key}`}>
                    <path d={SEGMENT_PATHS[i]} />
                  </clipPath>
                ) : null
              )}
              <clipPath id="wheel-center-clip">
                <circle cx={150} cy={150} r={56} />
              </clipPath>
            </defs>

            {families.map((f, i) => {
              const isActive = f.key === activeKey;
              const hasMedia = Boolean(f.ingredientImage);
              return (
                <g
                  key={f.key}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  aria-label={f.label}
                  onClick={() => toggle(f.key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(f.key);
                    }
                  }}
                  style={{
                    cursor: "pointer",
                    transformOrigin: "150px 150px",
                    transform: isActive ? "scale(1.04)" : "scale(1)",
                    transition: trans ?? "transform .35s ease",
                    outline: "none",
                  }}
                  className="dp-wheel-seg"
                >
                  {hasMedia ? (
                    <>
                      {/* Image ingrédient clippée à la forme du segment */}
                      <image
                        href={f.ingredientImage}
                        x={0}
                        y={0}
                        width={300}
                        height={300}
                        preserveAspectRatio="xMidYMid slice"
                        clipPath={`url(#seg-${f.key})`}
                        style={{ opacity: activeKey && !isActive ? 0.55 : 1 }}
                      />
                      {/* Vidéo en boucle quand la famille est active */}
                      {isActive && f.video && (
                        <foreignObject
                          x={0}
                          y={0}
                          width={300}
                          height={300}
                          clipPath={`url(#seg-${f.key})`}
                        >
                          <video
                            src={f.video}
                            poster={f.ingredientImage}
                            muted
                            loop
                            autoPlay
                            playsInline
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </foreignObject>
                      )}
                      {/* Teinte couleur pour la lisibilité du label + bordure */}
                      <path
                        d={SEGMENT_PATHS[i]}
                        fill={f.color}
                        fillOpacity={isActive ? 0.22 : activeKey ? 0.5 : 0.38}
                        stroke="#FAF6EE"
                        strokeWidth={1.5}
                        style={{ transition: trans ?? "fill-opacity .3s ease" }}
                      />
                    </>
                  ) : (
                    <path
                      d={SEGMENT_PATHS[i]}
                      fill={f.color}
                      fillOpacity={isActive ? 1 : activeKey ? 0.55 : 0.85}
                      stroke="#FAF6EE"
                      strokeWidth={1.5}
                      style={{ transition: trans ?? "fill-opacity .3s ease" }}
                    />
                  )}
                  <text
                    x={LABEL_POS[i].x}
                    y={LABEL_POS[i].y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="var(--font-sans)"
                    // Remonté de 12 à 14 unités SVG : la roue ayant rétréci de 22 %,
                    // ça restitue au libellé sa taille rendue d'origine (~13px).
                    fontSize={14}
                    fontWeight={600}
                    letterSpacing=".06em"
                    fill="#FFFFFF"
                    style={{
                      pointerEvents: "none",
                      textTransform: "uppercase",
                      textShadow: hasMedia
                        ? "0 1px 3px rgba(0,0,0,.55)"
                        : "none",
                    }}
                  >
                    {f.label}
                  </text>
                </g>
              );
            })}

            {/* Cercle central — fond crème uni (pas d'image) */}
            <circle
              cx={150}
              cy={150}
              r={56}
              fill="#FAF6EE"
              stroke="#E6DCC8"
              strokeWidth={1}
            />
            {active ? (
              <text
                x={150}
                y={142}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="var(--font-display)"
                fontSize={25}
                fill="#2C2620"
                style={{ pointerEvents: "none" }}
              >
                {active.label}
              </text>
            ) : (
              <text
                x={150}
                y={150}
                textAnchor="middle"
                fontFamily="var(--font-display)"
                fontSize={17}
                fill="#2C2620"
                style={{ pointerEvents: "none" }}
              >
                {(() => {
                  const w = L.restName.split(" ");
                  const mid = Math.ceil(w.length / 2);
                  const lines = w.length > 2 ? [w.slice(0, mid).join(" "), w.slice(mid).join(" ")] : w;
                  const startY = lines.length > 1 ? 142 : 150;
                  return lines.map((ln, idx) => (
                    <tspan key={idx} x={150} y={startY + idx * 19}>
                      {ln}
                    </tspan>
                  ));
                })()}
              </text>
            )}
            <text
              x={150}
              y={163}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="var(--font-sans)"
              fontSize={9.5}
              letterSpacing="2"
              fill="#8A6E2E"
              style={{
                pointerEvents: "none",
                textTransform: "uppercase",
                opacity: active ? 1 : 0,
                paintOrder: "stroke",
                stroke: active ? "rgba(250,246,238,.9)" : "none",
                strokeWidth: active ? 3 : 0,
              }}
            >
              {L.familySub}
            </text>
          </svg>

          {/* Incitation à cliquer — annotation courbe pointant vers un segment, repos uniquement */}
          {!active && (
            <svg
              aria-hidden
              viewBox="0 0 300 300"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                overflow: "visible",
                pointerEvents: "none",
                animation: reduced
                  ? "none"
                  : "dpWheelHint 1.4s ease-in-out infinite",
              }}
            >
              {/* Courbe + tête de flèche (miroir en RTL) */}
              <g
                transform={isRTL ? "translate(300,0) scale(-1,1)" : undefined}
              >
                <path
                  d="M26,44 C30,26 50,28 64,36"
                  fill="none"
                  stroke="#A8801F"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeDasharray="4 4"
                />
                <path
                  d="M52.2,34.4 L64,36 L56.7,26.6"
                  fill="none"
                  stroke="#A8801F"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              {/* Texte au-dessus du départ de la flèche, séparé de la courbe et de la roue */}
              <text
                x={isRTL ? 298 : 2}
                y={11}
                textAnchor={isRTL ? "end" : "start"}
                fontFamily="var(--font-sans)"
                fontSize={14}
                letterSpacing=".02em"
                fill="#A8801F"
              >
                {L.clickHint}
              </text>
            </svg>
          )}
          </div>
        </div>

        {/* Colonne panneau — flex-column avec gap explicite : garantit que le
            bloc titre/description, le CTA et les cartes produit occupent
            chacun leur propre zone, sans jamais se chevaucher, quelle que
            soit la largeur du texte (locale) ou la largeur du viewport. */}
        <div
          style={{
            flex: "1 1 380px",
            minWidth: 260,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            textAlign: isRTL ? "right" : "left",
          }}
        >
          <div
            style={
              active
                ? {
                    background: "rgba(250,246,238,.85)",
                    border: ".5px solid rgba(230,220,200,.7)",
                    borderRadius: 14,
                    padding: "20px 22px",
                    boxShadow: "0 6px 22px rgba(44,38,32,.10)",
                    backdropFilter: "blur(2px)",
                  }
                : undefined
            }
          >
          {/* La description reste dans la colonne de droite : son contenu change à
              chaque famille cliquée. Remontée en en-tête, elle ferait sauter la
              hauteur de tout le bloc à chaque clic et éloignerait le texte de la
              carte produit qu'il justifie. */}
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              color: "#6A655D",
              lineHeight: 1.7,
              margin: 0,
              transition: reduced ? "none" : "opacity .4s ease",
            }}
          >
            {active ? active.description : L.intro}
          </p>
          </div>

          {/* CTA — alignSelf empêche le flex-column parent de l'étirer en
              pleine largeur (comportement stretch par défaut) : il garde sa
              largeur "au contenu" (pilule), sur sa propre ligne. */}
          {active && (
            <Link
              href={`/collections/${active.collectionSlug}`}
              style={{
                display: "inline-flex",
                alignSelf: isRTL ? "flex-end" : "flex-start",
                alignItems: "center",
                gap: 8,
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".04em",
                textTransform: "uppercase",
                color: "#fff",
                background: "#C4A24F",
                borderRadius: 999,
                padding: "10px 20px",
                textDecoration: "none",
              }}
            >
              {L.cta} {isRTL ? "←" : "→"}
            </Link>
          )}

          {/* Cartes produits */}
          {active && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              {active.products.slice(0, 2).map((p) => (
                <Link
                  key={p.name}
                  href={p.href}
                  className="dp-wheel-card"
                  style={{
                    // minWidth:0 obligatoire : sans lui, le contenu (nom long)
                    // impose sa largeur minimale et fait déborder la carte sous 760px.
                    flex: "1 1 260px",
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    textDecoration: "none",
                    background: "#fff",
                    border: ".5px solid #E6DCC8",
                    borderRadius: 18,
                    padding: 16,
                    transition: reduced
                      ? "none"
                      : "transform .2s ease, box-shadow .2s ease",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: 84,
                      height: 124,
                      flexShrink: 0,
                      borderRadius: 12,
                      overflow: "hidden",
                      background: "#F7F1E6",
                    }}
                  >
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="84px"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 11,
                        letterSpacing: ".14em",
                        textTransform: "uppercase",
                        color: "#A8915F",
                        marginBottom: 6,
                      }}
                    >
                      {p.brand}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 25,
                        lineHeight: 1.15,
                        color: "#2C2620",
                        marginBottom: 7,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 17,
                        fontWeight: 700,
                        color: "#A8801F",
                      }}
                    >
                      {L.priceFrom ? `${L.priceFrom} ` : ""}{fmtPrice(p.price)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes dpWheelBgFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes dpWheelHint {
          0%, 100% { opacity: .45; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(2px); }
        }
        .dp-wheel-seg:focus-visible path {
          stroke: #2C2620;
          stroke-width: 2.5;
        }
        .dp-wheel-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(44,38,32,.12);
        }
        /* Sous 760px : pile en colonne unique. !important est requis car
           flex-direction est posé en style inline (row-reverse en RTL) et une
           regle de feuille ne peut pas le battre autrement. flex:none evite que
           les bases 320px/380px imposent une hauteur en mode colonne. */
        @media (max-width: 760px) {
          .dp-wheel-grid {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 22px;
          }
          .dp-wheel-grid > * {
            flex: none !important;
            width: 100%;
            min-width: 0 !important;
          }
          .dp-wheel-head {
            margin-bottom: 20px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .dp-wheel-seg, .dp-wheel-card { transition: none !important; }
          .dp-wheel-card:hover { transform: none; }
        }
      `}</style>
    </div>
  );
}
