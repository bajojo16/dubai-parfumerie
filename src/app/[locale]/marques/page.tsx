import Image from "next/image";

const brands = [
  {
    name: "Lattafa",
    city: "Sharjah",
    cityFlag: "🇦🇪",
    founded: 1980,
    refs: "80+ références",
    description:
      "Maison pionnière des parfums arabes, Lattafa est reconnue pour ses créations riches en oud et en musc, alliant tradition et modernité.",
    image: "/assets/prod-1.jpg",
  },
  {
    name: "Reef",
    city: "Dubai",
    cityFlag: "🇦🇪",
    founded: 2005,
    refs: "50+ références",
    description:
      "Née à Dubaï, Reef Perfumes capture l'essence de la vie contemporaine du Golfe avec des fragrances fraîches et sophistiquées.",
    image: "/assets/prod-2.jpg",
  },
  {
    name: "Al Haramain",
    city: "La Mecque",
    cityFlag: "🇸🇦",
    founded: 1970,
    refs: "100+ références",
    description:
      "Fondée près des lieux saints, Al Haramain est l'une des plus anciennes et prestigieuses maisons de parfumerie du monde arabe.",
    image: "/assets/prod-3.jpg",
  },
  {
    name: "Ahmed Al Maghribi",
    city: "Maroc",
    cityFlag: "🇲🇦",
    founded: 1998,
    refs: "40+ références",
    description:
      "Fusion unique entre les traditions parfumées du Maroc et du Golfe, cette maison propose des créations envoûtantes et sensuelles.",
    image: "/assets/prod-4.jpg",
  },
  {
    name: "Armaf",
    city: "Dubai",
    cityFlag: "🇦🇪",
    founded: 2014,
    refs: "60+ références",
    description:
      "Jeune maison ambitieuse de Dubaï, Armaf s'est imposée avec des parfums de haute qualité à des prix accessibles.",
    image: "/assets/prod-5.jpg",
  },
  {
    name: "Swiss Arabian",
    city: "Dubai",
    cityFlag: "🇦🇪",
    founded: 1974,
    refs: "70+ références",
    description:
      "Pionnière de la parfumerie de luxe à Dubaï, Swiss Arabian marie l'expertise européenne aux ingrédients précieux de l'Orient.",
    image: "/assets/prod-6.jpg",
  },
  {
    name: "Paris Corner",
    city: "Dubai",
    cityFlag: "🇦🇪",
    founded: 2010,
    refs: "45+ références",
    description:
      "Maison moderne inspirée du glamour parisien et de l'opulence dubaïote, pour une parfumerie résolument contemporaine.",
    image: "/assets/cat-femme.jpg",
  },
  {
    name: "Gulf Orchid",
    city: "Koweït",
    cityFlag: "🇰🇼",
    founded: 1997,
    refs: "35+ références",
    description:
      "Spécialiste des huiles de parfum et des attars, Gulf Orchid perpétue les traditions olfactives du Golfe Persique.",
    image: "/assets/cat-homme.jpg",
  },
  {
    name: "Surrati",
    city: "Médine",
    cityFlag: "🇸🇦",
    founded: 1978,
    refs: "55+ références",
    description:
      "Grande maison saoudienne aux racines profondes, Surrati est synonyme de parfums généreux, enveloppants et durables.",
    image: "/assets/cat-mixte.jpg",
  },
  {
    name: "Khadlaj",
    city: "Dubai",
    cityFlag: "🇦🇪",
    founded: 2008,
    refs: "30+ références",
    description:
      "Maison artisanale de Dubaï privilégiant les matières premières nobles : oud de qualité supérieure, roses de Taïf et musc pur.",
    image: "/assets/coffrets.jpg",
  },
] as const;

const features = [
  {
    icon: "✦",
    title: "Authenticité certifiée",
    body: "Chaque produit vient directement des maisons partenaires, sans intermédiaire. Traçabilité garantie de la source à votre flacon.",
  },
  {
    icon: "◈",
    title: "Contrôle qualité",
    body: "Chaque lot est inspecté à réception dans notre entrepôt parisien. Seuls les flacons conformes aux standards de la maison sont mis en vente.",
  },
  {
    icon: "◇",
    title: "Relation directe",
    body: "Partenariats exclusifs conclus directement avec les maisons, sans nécessiter de distributeurs tiers, pour des prix et des allocations privilégiés.",
  },
] as const;

export default function MarquesPage() {
  return (
    <div
      style={{
        backgroundColor: "var(--surface-page)",
        minHeight: "100vh",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* ── Hero ── */}
      <section
        style={{
          backgroundColor: "var(--espresso-900)",
          padding: "6rem var(--gutter) 5rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--t-xs)",
            fontWeight: "var(--fw-semibold)",
            letterSpacing: "var(--ls-widest)",
            textTransform: "uppercase",
            color: "var(--gold-400)",
            marginBottom: "1.5rem",
          }}
        >
          Nos Maisons Partenaires
        </p>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--t-hero)",
            fontWeight: "var(--fw-light)",
            lineHeight: "var(--lh-tight)",
            color: "var(--on-dark-strong)",
            letterSpacing: "var(--ls-tight)",
            marginBottom: "1.5rem",
            maxWidth: "640px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          10 Maisons du Golfe
        </h1>

        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--t-lead)",
            fontWeight: "var(--fw-light)",
            color: "var(--on-dark-muted)",
            lineHeight: "var(--lh-relaxed)",
            maxWidth: "560px",
            marginLeft: "auto",
            marginRight: "auto",
            marginBottom: "3rem",
          }}
        >
          Sélectionnées pour leur authenticité, leur savoir-faire et l&apos;excellence
          de leurs créations
        </p>

        {/* Gold divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            maxWidth: "360px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "var(--gradient-gold)",
              opacity: 0.5,
            }}
          />
          <span
            style={{
              color: "var(--gold-500)",
              fontSize: "0.875rem",
            }}
          >
            ✦
          </span>
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "var(--gradient-gold)",
              opacity: 0.5,
            }}
          />
        </div>
      </section>

      {/* ── Brand grid ── */}
      <section
        style={{
          maxWidth: "var(--container)",
          marginLeft: "auto",
          marginRight: "auto",
          padding: "5rem var(--gutter)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2rem",
          }}
        >
          {brands.map((brand) => (
            <article
              key={brand.name}
              style={{
                backgroundColor: "var(--surface-white)",
                borderRadius: "var(--r-lg)",
                border: "1px solid var(--line-100)",
                boxShadow: "var(--shadow-sm)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Card image */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "240px",
                  overflow: "hidden",
                  backgroundColor: "var(--surface-image)",
                }}
              >
                <Image
                  src={brand.image}
                  alt={`${brand.name} — parfumerie`}
                  width={400}
                  height={240}
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                    display: "block",
                  }}
                />
              </div>

              {/* Card body */}
              <div
                style={{
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  flex: 1,
                }}
              >
                {/* Brand name */}
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--t-title)",
                    fontWeight: "var(--fw-regular)",
                    lineHeight: "var(--lh-snug)",
                    color: "var(--ink-900)",
                    letterSpacing: "var(--ls-tight)",
                    margin: 0,
                  }}
                >
                  {brand.name}
                </h2>

                {/* City + founding year */}
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--t-sm)",
                    color: "var(--ink-400)",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                  }}
                >
                  <span>{brand.cityFlag}</span>
                  <span>{brand.city}</span>
                  <span style={{ color: "var(--line-300)" }}>·</span>
                  <span>Fondée en {brand.founded}</span>
                </p>

                {/* Refs badge */}
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      fontFamily: "var(--font-sans)",
                      fontSize: "var(--t-xs)",
                      fontWeight: "var(--fw-semibold)",
                      letterSpacing: "var(--ls-wide)",
                      color: "var(--gold-700)",
                      border: "1px solid var(--gold-300)",
                      borderRadius: "var(--r-pill)",
                      padding: "0.2rem 0.75rem",
                      backgroundColor: "var(--gold-100)",
                    }}
                  >
                    {brand.refs}
                  </span>
                </div>

                {/* Description */}
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--t-sm)",
                    color: "var(--ink-500)",
                    lineHeight: "var(--lh-relaxed)",
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {brand.description}
                </p>

                {/* CTA link */}
                <a
                  href={`/catalogue?marque=${encodeURIComponent(brand.name)}`}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--t-sm)",
                    fontWeight: "var(--fw-semibold)",
                    color: "var(--gold-700)",
                    textDecoration: "none",
                    borderBottom: "1px solid var(--gold-400)",
                    paddingBottom: "1px",
                    alignSelf: "flex-start",
                    letterSpacing: "var(--ls-normal)",
                    transition:
                      "color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)",
                  }}
                >
                  Voir la collection →
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Editorial bottom section ── */}
      <section
        style={{
          backgroundColor: "var(--surface-cream)",
          borderTop: "1px solid var(--line-200)",
          padding: "5rem var(--gutter)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: "var(--container-narrow)",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--t-display)",
              fontWeight: "var(--fw-light)",
              color: "var(--ink-900)",
              lineHeight: "var(--lh-snug)",
              letterSpacing: "var(--ls-tight)",
              marginBottom: "3.5rem",
            }}
          >
            Comment nous sélectionnons nos partenaires
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "2.5rem",
            }}
          >
            {features.map((feature) => (
              <div
                key={feature.title}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1rem",
                  textAlign: "center",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    backgroundColor: "var(--gold-100)",
                    border: "1px solid var(--gold-300)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.25rem",
                    color: "var(--gold-700)",
                    flexShrink: 0,
                  }}
                >
                  {feature.icon}
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--t-serif-lg)",
                    fontWeight: "var(--fw-regular)",
                    color: "var(--ink-900)",
                    lineHeight: "var(--lh-snug)",
                    margin: 0,
                  }}
                >
                  {feature.title}
                </h3>

                {/* Body */}
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--t-sm)",
                    color: "var(--ink-500)",
                    lineHeight: "var(--lh-relaxed)",
                    margin: 0,
                  }}
                >
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
