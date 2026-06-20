import Image from "next/image";

// ─── Data ────────────────────────────────────────────────────────────────────

const ARTICLES = [
  {
    id: 1,
    title: "L'Oud : l'or liquide de l'Orient",
    category: "Guides",
    excerpt:
      "Découvrez l'histoire millénaire du bois d'oud, sa récolte délicate et pourquoi il est considéré comme l'ingrédient le plus précieux de la parfumerie orientale.",
    readTime: "8 min",
    date: "12 juin 2025",
    image: "cat-femme.jpg",
    slug: "oud-or-liquide-orient",
    featured: true,
  },
  {
    id: 2,
    title: "Comment choisir son premier parfum oriental",
    category: "Conseils",
    excerpt:
      "Musc, oud, ambre, rose... le monde des parfums orientaux peut sembler complexe. Notre guide vous aide à trouver votre signature olfactive.",
    readTime: "5 min",
    date: "8 juin 2025",
    image: "cat-homme.jpg",
    slug: "choisir-premier-parfum-oriental",
    featured: false,
  },
  {
    id: 3,
    title: "Musc blanc vs musc noir : quelles différences ?",
    category: "Éducation",
    excerpt:
      "Deux facettes d'un même ingrédient emblématique : le musc blanc, doux et poudreux, face au musc noir, sombre et animal. Exploration comparée.",
    readTime: "6 min",
    date: "3 juin 2025",
    image: "cat-mixte.jpg",
    slug: "musc-blanc-vs-musc-noir",
    featured: false,
  },
  {
    id: 4,
    title: "Les 5 erreurs à éviter avec les parfums orientaux",
    category: "Conseils",
    excerpt:
      "Trop de sillage, mauvaise conservation, application sur vêtements... évitez ces pièges classiques pour profiter pleinement de vos parfums.",
    readTime: "4 min",
    date: "28 mai 2025",
    image: "prod-1.jpg",
    slug: "erreurs-parfums-orientaux",
    featured: false,
  },
  {
    id: 5,
    title: "Le Bakhour : l'encens de la tradition",
    category: "Culture",
    excerpt:
      "Rituel incontournable des foyers du Golfe, le bakhour transcende la simple fragrance pour devenir un art de vivre. Histoire et usages.",
    readTime: "7 min",
    date: "20 mai 2025",
    image: "coffrets.jpg",
    slug: "bakhour-encens-tradition",
    featured: false,
  },
  {
    id: 6,
    title: "Top 10 des parfums orientaux pour l'été",
    category: "Sélection",
    excerpt:
      "L'été appelle des fragrances fraîches mais généreuses. Notre sélection des 10 parfums orientaux parfaits pour la saison chaude.",
    readTime: "3 min",
    date: "15 mai 2025",
    image: "prod-3.jpg",
    slug: "top-10-parfums-ete",
    featured: false,
  },
  {
    id: 7,
    title: "Interview : Maître parfumeur de Lattafa",
    category: "Portrait",
    excerpt:
      "Rencontre avec Ahmed Al Rashid, nez en chef de la maison Lattafa depuis 20 ans. Il nous dévoile les secrets de création de ses parfums iconiques.",
    readTime: "10 min",
    date: "10 mai 2025",
    image: "prod-2.jpg",
    slug: "interview-maitre-parfumeur-lattafa",
    featured: false,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCategoryStyle(category: string): React.CSSProperties {
  const map: Record<string, { background: string; color: string }> = {
    Guides:    { background: "#FBF0DC", color: "#9C6A1A" },
    Conseils:  { background: "#E6F2EC", color: "#3A6B4E" },
    Éducation: { background: "#E6EEF7", color: "#2B5482" },
    Culture:   { background: "#F0EBF7", color: "#5B3A82" },
    Sélection: { background: "#FDE8E6", color: "#8B3125" },
    Portrait:  { background: "#E8F0F0", color: "#2A5757" },
  };
  const style = map[category] ?? { background: "#F0EDEA", color: "#6B5D4E" };
  return {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: 999,
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    ...style,
  } as React.CSSProperties;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BlogPage() {
  const featuredArticle = ARTICLES.find((a) => a.featured)!;
  const gridArticles = ARTICLES.filter((a) => !a.featured);

  return (
    <>
      <style>{`
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 900px) {
          .blog-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 560px) {
          .blog-grid {
            grid-template-columns: 1fr;
          }
        }
        .featured-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 768px) {
          .featured-card {
            grid-template-columns: 1fr;
          }
        }
        .article-card-link:hover .article-card-title {
          color: var(--gold-700);
        }
        .read-link {
          color: var(--gold-500);
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.18s ease;
        }
        .read-link:hover {
          color: var(--gold-700);
        }
        .newsletter-input {
          flex: 1;
          padding: 14px 18px;
          border: 1.5px solid rgba(255,255,255,0.18);
          border-radius: var(--r-md);
          background: rgba(255,255,255,0.07);
          color: var(--on-dark-strong);
          font-family: var(--font-sans);
          font-size: 15px;
          outline: none;
          transition: border-color 0.18s ease;
          min-width: 0;
        }
        .newsletter-input::placeholder {
          color: var(--on-dark-muted);
        }
        .newsletter-input:focus {
          border-color: var(--gold-400);
        }
        .newsletter-btn {
          padding: 14px 28px;
          border-radius: var(--r-md);
          border: none;
          background: var(--gold-500);
          color: #fff;
          font-family: var(--font-sans);
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.06em;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.18s ease;
          flex-shrink: 0;
        }
        .newsletter-btn:hover {
          background: var(--gold-700);
        }
        .article-card-inner:hover {
          box-shadow: 0 10px 36px rgba(0,0,0,0.13);
          transform: translateY(-3px);
        }
        .article-card-inner {
          transition: box-shadow 0.22s ease, transform 0.22s ease;
        }
      `}</style>

      <div style={{ background: "var(--surface-page)", minHeight: "100vh" }}>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section
          style={{
            background: "var(--surface-cream)",
            borderBottom: "1px solid var(--line-100)",
            textAlign: "center",
            padding: "80px 24px 60px",
          }}
        >
          {/* Gold ornament line */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <span
              style={{
                display: "block",
                width: 40,
                height: 1,
                background: "var(--gold-500)",
                opacity: 0.7,
              }}
            />
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M8 0L9.8 6.2L16 8L9.8 9.8L8 16L6.2 9.8L0 8L6.2 6.2L8 0Z"
                fill="#C8901E"
                opacity="0.8"
              />
            </svg>
            <span
              style={{
                display: "block",
                width: 40,
                height: 1,
                background: "var(--gold-500)",
                opacity: 0.7,
              }}
            />
          </div>

          {/* Label */}
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--gold-500)",
              margin: "0 0 18px",
            }}
          >
            Le Journal
          </p>

          {/* H1 */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem, 4.5vw, 3.6rem)",
              fontWeight: 600,
              color: "var(--ink-900)",
              margin: "0 0 18px",
              lineHeight: 1.15,
            }}
          >
            L&apos;Art de la Parfumerie Orientale
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 17,
              color: "var(--ink-500)",
              margin: 0,
              letterSpacing: "0.02em",
            }}
          >
            Guides, conseils et culture du parfum arabe
          </p>
        </section>

        {/* ── Featured Article ──────────────────────────────────────────── */}
        <section
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "56px 24px 0",
          }}
        >
          <a
            href={`/blog/${featuredArticle.slug}`}
            style={{ textDecoration: "none", display: "block" }}
          >
            <div
              className="featured-card article-card-inner"
              style={{
                background: "var(--surface-white)",
                border: "1px solid var(--line-100)",
                borderRadius: "var(--r-lg)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                overflow: "hidden",
              }}
            >
              {/* Left: Image */}
              <div style={{ position: "relative", minHeight: 340 }}>
                <Image
                  src={`/assets/${featuredArticle.image}`}
                  alt={featuredArticle.title}
                  width={720}
                  height={480}
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                    display: "block",
                    position: "absolute",
                    inset: 0,
                  }}
                  priority
                />
                {/* Overlay tint */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to right, rgba(21,16,11,0.18) 0%, transparent 60%)",
                    pointerEvents: "none",
                  }}
                />
              </div>

              {/* Right: Content */}
              <div
                style={{
                  padding: "44px 44px 44px 40px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 20,
                }}
              >
                {/* Category badge */}
                <span style={getCategoryStyle(featuredArticle.category)}>
                  {featuredArticle.category}
                </span>

                {/* H2 */}
                <h2
                  className="article-card-title"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.6rem, 2.4vw, 2.2rem)",
                    fontWeight: 600,
                    color: "var(--ink-900)",
                    margin: 0,
                    lineHeight: 1.2,
                    transition: "color 0.18s ease",
                  }}
                >
                  {featuredArticle.title}
                </h2>

                {/* Excerpt */}
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 15,
                    color: "var(--ink-500)",
                    lineHeight: 1.75,
                    margin: 0,
                  }}
                >
                  {featuredArticle.excerpt}
                </p>

                {/* CTA link */}
                <span className="read-link">
                  Lire l&apos;article
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 7H12M8 3L12 7L8 11"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                {/* Meta row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    paddingTop: 4,
                    borderTop: "1px solid var(--line-100)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      color: "var(--ink-400)",
                    }}
                  >
                    {featuredArticle.date}
                  </span>
                  <span
                    style={{
                      width: 3,
                      height: 3,
                      borderRadius: "50%",
                      background: "var(--ink-400)",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      color: "var(--ink-400)",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 13 13"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="6.5"
                        cy="6.5"
                        r="5.5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M6.5 3.5V6.5L8.5 8"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                    {featuredArticle.readTime}
                  </span>
                </div>
              </div>
            </div>
          </a>
        </section>

        {/* ── Article Grid ──────────────────────────────────────────────── */}
        <section
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "40px 24px 72px",
          }}
        >
          <div className="blog-grid">
            {gridArticles.map((article) => (
              <a
                key={article.id}
                href={`/blog/${article.slug}`}
                className="article-card-link"
                style={{ textDecoration: "none", display: "flex" }}
              >
                <div
                  className="article-card-inner"
                  style={{
                    background: "var(--surface-white)",
                    borderRadius: "var(--r-lg)",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }}
                >
                  {/* Image */}
                  <div style={{ position: "relative", flexShrink: 0, height: 220 }}>
                    <Image
                      src={`/assets/${article.image}`}
                      alt={article.title}
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

                  {/* Body */}
                  <div
                    style={{
                      padding: "22px 22px 24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      flex: 1,
                    }}
                  >
                    {/* Category pill */}
                    <span style={getCategoryStyle(article.category)}>
                      {article.category}
                    </span>

                    {/* Title */}
                    <h3
                      className="article-card-title"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.3rem",
                        fontWeight: 600,
                        color: "var(--ink-900)",
                        margin: 0,
                        lineHeight: 1.25,
                        transition: "color 0.18s ease",
                      }}
                    >
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 14,
                        color: "var(--ink-500)",
                        lineHeight: 1.7,
                        margin: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      } as React.CSSProperties}
                    >
                      {article.excerpt}
                    </p>

                    {/* Meta row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginTop: "auto",
                        paddingTop: 12,
                        borderTop: "1px solid var(--line-100)",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 12,
                          color: "var(--ink-400)",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          aria-hidden="true"
                        >
                          <circle
                            cx="6"
                            cy="6"
                            r="5"
                            stroke="currentColor"
                            strokeWidth="1.2"
                          />
                          <path
                            d="M6 3V6L7.5 7.5"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                        </svg>
                        {article.readTime}
                      </span>
                      <span
                        style={{
                          width: 3,
                          height: 3,
                          borderRadius: "50%",
                          background: "var(--ink-400)",
                          display: "inline-block",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 12,
                          color: "var(--ink-400)",
                        }}
                      >
                        {article.date}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── Newsletter ────────────────────────────────────────────────── */}
        <section
          style={{
            background: "var(--espresso-900)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "72px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 580, margin: "0 auto" }}>
            {/* Gold ornament */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  display: "block",
                  width: 32,
                  height: 1,
                  background: "var(--gold-500)",
                  opacity: 0.6,
                }}
              />
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 0L7.2 4.8L12 6L7.2 7.2L6 12L4.8 7.2L0 6L4.8 4.8L6 0Z"
                  fill="#C8901E"
                  opacity="0.8"
                />
              </svg>
              <span
                style={{
                  display: "block",
                  width: 32,
                  height: 1,
                  background: "var(--gold-500)",
                  opacity: 0.6,
                }}
              />
            </div>

            {/* H2 */}
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3.2vw, 2.5rem)",
                fontWeight: 600,
                color: "var(--on-dark-strong)",
                margin: "0 0 14px",
                lineHeight: 1.2,
              }}
            >
              Restez informé des tendances
            </h2>

            {/* Description */}
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 16,
                color: "var(--on-dark-muted)",
                lineHeight: 1.75,
                margin: "0 0 36px",
              }}
            >
              Recevez nos guides et sélections exclusives directement dans votre
              boîte mail
            </p>

            {/* Email form */}
            <form
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                type="email"
                name="email"
                placeholder="Votre adresse e-mail"
                className="newsletter-input"
                autoComplete="email"
              />
              <button type="submit" className="newsletter-btn">
                S&apos;abonner
              </button>
            </form>

            {/* Reassurance */}
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                color: "var(--on-dark-muted)",
                marginTop: 16,
                opacity: 0.7,
                letterSpacing: "0.02em",
              }}
            >
              Pas de spam · Désabonnement en un clic
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
