import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BRANDS } from "@/data/brands";

const brands = BRANDS;

/**
 * Initiales de la maison, pour les cinq dont `public/brands/` n'a pas le logo.
 * Reprend mot pour mot la règle de `_on-demand-client.tsx` : deux maisons ne
 * peuvent pas porter deux monogrammes différents selon la page qui les affiche.
 */
function monogram(house: string): string {
  const words = house.split(/\s+/).filter((w) => w.length > 2 || /^[A-Z]/.test(w));
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return house.slice(0, 2).toUpperCase();
}

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

/**
 * Maisons dotées d'une page à elles. Table plutôt que test sur le nom : la
 * liste grandira, et l'entrée manquante retombe seule sur le catalogue filtré.
 */
const BRAND_PAGES: Record<string, string> = {
  Reef: "/marques/reef",
};

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
          {brands.map((brand) => {
            const logo = "logo" in brand ? brand.logo : undefined;
            return (
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

                {/*
                  Pastille du logo, posée sur la photo plutôt qu'à côté du nom :
                  le logo est ce qui identifie la maison d'un coup d'œil, il doit
                  être lisible avant qu'on ait lu le titre. Fond blanc plein et
                  non transparent — les logos de `public/brands/` sont des JPEG
                  au fond crème, un fond translucide laisserait voir la photo au
                  travers et brouillerait le tracé.

                  Les cinq maisons dont le dépôt n'a pas le logo reçoivent leur
                  monogramme, comme les cartes de la commande à la demande. La
                  pastille garde la même place et la même taille dans les deux
                  cas : c'est ce qui empêche la grille de boiter d'une carte à
                  l'autre.
                */}
                <span
                  style={{
                    position: "absolute",
                    insetInlineStart: "1rem",
                    bottom: "1rem",
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "var(--surface-white)",
                    border: "1px solid var(--line-100)",
                    boxShadow: "var(--shadow-sm)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {logo ? (
                    <Image
                      src={logo}
                      alt=""
                      width={56}
                      height={56}
                      style={{
                        objectFit: "contain",
                        width: "78%",
                        height: "78%",
                        display: "block",
                      }}
                    />
                  ) : (
                    <span
                      aria-hidden
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.05rem",
                        letterSpacing: "var(--ls-tight)",
                        color: "var(--gold-700)",
                      }}
                    >
                      {monogram(brand.name)}
                    </span>
                  )}
                </span>
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

                {/* CTA link — les maisons qui ont leur page dédiée y mènent ;
                    les autres retombent sur le catalogue filtré, en attendant
                    d'avoir la leur. Reef est la première. */}
                <Link
                  href={
                    BRAND_PAGES[brand.name] ??
                    `/catalogue?marque=${encodeURIComponent(brand.name)}`
                  }
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
                </Link>
              </div>
            </article>
            );
          })}
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
