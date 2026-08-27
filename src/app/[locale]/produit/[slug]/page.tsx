import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import VolumeSelector from "./VolumeSelector";
import AddToCart from "./AddToCart";
import ProductGallery from "./ProductGallery";
import { StoryBubbles } from "@/components/sections/StoryBubbles";
import { DEMO_STORIES } from "@/data/product-stories";
import { allProductSlugs, resolveProduct } from "@/data/product-resolve";
import { notFound } from "next/navigation";

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const locales = ['fr', 'en', 'es', 'de', 'it', 'ru', 'ar'];
  // Tout le catalogue, pas seulement les six fiches rédigées : les liens de la
  // recherche pointent chaque référence, y compris celles composées à la volée.
  const slugs = allProductSlugs();
  return locales.flatMap(locale => slugs.map(slug => ({ locale, slug })));
}

// ─── Product data ─────────────────────────────────────────────────────────────
// Les fiches vivent dans `src/data/product-details.ts` : la recherche les lit aussi.

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{locale: string, slug: string}> }): Promise<Metadata> {
  const { slug } = await params;
  const product = resolveProduct(slug);
  if (!product) return { title: 'Produit introuvable' };
  return {
    title: `${product.name} — ${product.brand} | Dubaï Parfumerie`,
    description: `Achetez ${product.name} de ${product.brand}. ${product.description?.slice(0, 150) ?? ''}`,
    openGraph: {
      title: `${product.name} — ${product.brand}`,
      images: [{ url: product.image ?? '/assets/prod-1.jpg' }],
      type: 'website',
    },
  };
}

// ─── Hardcoded reviews ────────────────────────────────────────────────────────

const REVIEWS = [
  {
    id: 1,
    name: "Yasmine B.",
    city: "Paris",
    date: "12 juin 2025",
    rating: 5,
    text: "Un parfum absolument envoûtant. Je reçois des compliments dès que j'entre dans une pièce. La tenue est incroyable, encore présent le lendemain matin. Parfaitement authentique, rien à voir avec les contrefaçons qu'on trouve ailleurs.",
  },
  {
    id: 2,
    name: "Mohammed K.",
    city: "Lyon",
    date: "3 mai 2025",
    rating: 5,
    text: "J'ai grandi avec ce parfum au Maroc et je le retrouve enfin en France à un prix raisonnable. La qualité est exactement celle que je connaissais. Livraison rapide et emballage soigné. Je recommande vivement cette boutique.",
  },
  {
    id: 3,
    name: "Isabelle D.",
    city: "Bordeaux",
    date: "18 avril 2025",
    rating: 5,
    text: "Offert à mon mari pour notre anniversaire. Il était aux anges ! Le sillage est puissant sans être agressif, vraiment une qualité orientale comme on n'en trouve pas en grande surface. Nous avons déjà repassé commande.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderStars(rating: number, size = 16) {
  return (
    <span style={{ display: "inline-flex", gap: "2px" }} aria-label={`${rating} étoiles sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            color: i <= Math.round(rating) ? "var(--star)" : "var(--star-empty)",
            fontSize: `${size}px`,
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug, locale } = await params;
  // Un slug inconnu retombait sur « Oud Pour Elle » : la fiche s'affichait, mais
  // ce n'était pas le parfum demandé. Mieux vaut un 404 franc.
  const product = resolveProduct(slug);
  if (!product) notFound();

  const discountPct = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
  const installment = (product.price / 4).toFixed(2).replace(".", ",");

  // Related products (cycle through images 3–6)
  const relatedSlugs = allProductSlugs()
    .filter((s) => s !== slug)
    .slice(0, 4);

  const relatedImages = ["/assets/prod-3.jpg", "/assets/prod-4.jpg", "/assets/prod-5.jpg", "/assets/prod-6.jpg"];

  // La galerie montrait quatre visuels génériques /assets/prod-*.jpg identiques
  // pour toutes les fiches — et pas même le flacon du produit ouvert. On sert
  // désormais les visuels de CE parfum : sa galerie si la fiche en déclare une,
  // sinon son seul packshot (la galerie masque alors la bande de vignettes).
  const galleryImages = product.gallery?.length
    ? product.gallery
    : [product.image ?? "/assets/prod-1.jpg"];

  return (
    <div
      style={{
        background: "var(--surface-page)",
        minHeight: "100vh",
        fontFamily: "var(--font-sans)",
        color: "var(--ink-900)",
      }}
    >
      {/* JSON-LD Product schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "brand": { "@type": "Brand", "name": product.brand },
        "image": product.image ?? "/assets/prod-1.jpg",
        "description": product.description,
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock",
          "seller": { "@type": "Organization", "name": "Dubaï Parfumerie" }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": product.rating,
          "reviewCount": product.reviews
        }
      }) }} />

      {/* ── Main product section ── */}
      <section
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding: "2.5rem var(--gutter) 4rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3.5rem",
            alignItems: "start",
          }}
        >
          {/* ── Left: image gallery ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <ProductGallery images={galleryImages} productName={product.name} brand={product.brand} />

            {/* 360 button */}
            <button
              disabled
              aria-label="Vue 360° (bientôt disponible)"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                height: "40px",
                background: "transparent",
                border: "1px solid var(--line-200)",
                borderRadius: "var(--r-sm)",
                color: "var(--ink-400)",
                fontFamily: "var(--font-sans)",
                fontSize: "var(--t-sm)",
                cursor: "not-allowed",
                opacity: 0.6,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9" strokeLinecap="round"/>
                <path d="M12 3c2.5 2 4 5 4 9s-1.5 7-4 9" strokeLinecap="round"/>
                <path d="M3 12h4" strokeLinecap="round"/>
                <path d="M17 12l3-2-3-2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Vue 360°
            </button>
          </div>

          {/* ── Right: product info ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Breadcrumb */}
            <nav style={{ fontSize: "var(--t-xs)", color: "var(--ink-400)", display: "flex", gap: "0.375rem", alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/" style={{ color: "var(--ink-400)", textDecoration: "none" }}>
                Accueil
              </Link>
              <span aria-hidden="true">›</span>
              <Link href="/catalogue" style={{ color: "var(--ink-400)", textDecoration: "none" }}>
                Parfums Femme
              </Link>
              <span aria-hidden="true">›</span>
              <span style={{ color: "var(--ink-700)" }}>{product.name}</span>
            </nav>

            {/* Brand eyebrow */}
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-sans)",
                fontSize: "var(--t-xs)",
                fontWeight: "var(--fw-semibold)",
                letterSpacing: "var(--ls-widest)",
                textTransform: "uppercase",
                color: "var(--gold-500)",
              }}
            >
              {product.brand}
            </p>

            {/* Product name */}
            <h1
              style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                fontWeight: 600,
                lineHeight: "var(--lh-tight)",
                color: "var(--ink-900)",
              }}
            >
              {product.name}
            </h1>

            {/* Rating row */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              {renderStars(product.rating)}
              <span
                style={{
                  fontSize: "var(--t-sm)",
                  fontWeight: "var(--fw-medium)",
                  color: "var(--ink-700)",
                }}
              >
                {product.rating.toFixed(1)}
              </span>
              <span
                style={{
                  fontSize: "var(--t-xs)",
                  color: "var(--ink-400)",
                }}
              >
                ({product.reviews} avis)
              </span>
            </div>

            {/* Badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {product.badges.map((badge) => (
                <span
                  key={badge}
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "var(--r-pill)",
                    background: "var(--surface-cream)",
                    border: "1px solid var(--line-200)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--t-xs)",
                    fontWeight: "var(--fw-medium)",
                    color: "var(--ink-700)",
                    letterSpacing: "var(--ls-wide)",
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* Divider */}
            <hr style={{ border: "none", borderTop: "1px solid var(--line-100)", margin: 0 }} />

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.875rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  fontWeight: 600,
                  color: "var(--price-sale)",
                  lineHeight: 1,
                }}
              >
                {product.price.toFixed(2).replace(".", ",")} €
              </span>
              <span
                style={{
                  fontSize: "var(--t-body)",
                  color: "var(--price-was)",
                  textDecoration: "line-through",
                }}
              >
                {product.oldPrice.toFixed(2).replace(".", ",")} €
              </span>
              <span
                style={{
                  padding: "0.2rem 0.55rem",
                  borderRadius: "var(--r-xs)",
                  background: "var(--badge-promo-bg)",
                  color: "var(--badge-dark-fg)",
                  fontSize: "var(--t-xs)",
                  fontWeight: "var(--fw-bold)",
                  letterSpacing: "0.04em",
                }}
              >
                -{discountPct}%
              </span>
            </div>

            {/* Installments */}
            <p
              style={{
                margin: 0,
                fontSize: "var(--t-sm)",
                color: "var(--ink-500)",
              }}
            >
              💳 Payez en{" "}
              <strong style={{ color: "var(--ink-700)" }}>4× sans frais</strong>{" "}
              — soit{" "}
              <strong style={{ color: "var(--ink-700)" }}>{installment} €</strong>
              /mois
            </p>

            {/* Volume selector */}
            <VolumeSelector defaultVolume="100ml" />

            {/* Add to cart (client) */}
            <AddToCart productName={product.name} price={product.price} />

            {/* Stories produit (bulles → lecteur plein écran) */}
            <StoryBubbles stories={DEMO_STORIES} locale={locale} />


            {/* Delivery estimate */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "var(--t-sm)",
                color: "var(--ink-500)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.5" aria-hidden="true">
                <path d="M5 12.5L8.5 16L19 8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>
                Livraison offerte dès 60 € · Expédié sous{" "}
                <strong>24 h ouvrées</strong>
              </span>
            </div>

            {/* Wishlist + Share */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                aria-label="Ajouter aux favoris"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.5rem 1rem",
                  background: "transparent",
                  border: "1px solid var(--line-200)",
                  borderRadius: "var(--r-sm)",
                  color: "var(--ink-500)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--t-sm)",
                  cursor: "pointer",
                  transition: "border-color var(--dur-fast), color var(--dur-fast)",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                Favoris
              </button>
              <button
                aria-label="Partager ce produit"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.5rem 1rem",
                  background: "transparent",
                  border: "1px solid var(--line-200)",
                  borderRadius: "var(--r-sm)",
                  color: "var(--ink-500)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--t-sm)",
                  cursor: "pointer",
                  transition: "border-color var(--dur-fast), color var(--dur-fast)",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Partager
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Below the fold ── */}
      <div
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding: "0 var(--gutter) 6rem",
          display: "flex",
          flexDirection: "column",
          gap: "4rem",
        }}
      >
        {/* Olfactory pyramid */}
        <section aria-labelledby="pyramid-heading">
          <h2
            id="pyramid-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--t-title)",
              fontWeight: 600,
              color: "var(--ink-900)",
              marginBottom: "1.75rem",
            }}
          >
            Pyramide olfactive
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.5rem",
            }}
          >
            {[
              { label: "Tête", emoji: "🌟", notes: product.topNotes, bg: "var(--gold-100)" },
              { label: "Cœur", emoji: "🌹", notes: product.heartNotes, bg: "var(--surface-cream)" },
              { label: "Fond", emoji: "🌲", notes: product.baseNotes, bg: "var(--espresso-800)" },
            ].map(({ label, emoji, notes, bg }) => {
              const isDark = label === "Fond";
              return (
                <div
                  key={label}
                  style={{
                    background: bg,
                    borderRadius: "var(--r-lg)",
                    padding: "1.75rem",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }} aria-hidden="true">
                      {emoji}
                    </span>
                    <h3
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-sans)",
                        fontSize: "var(--t-xs)",
                        fontWeight: "var(--fw-bold)",
                        letterSpacing: "var(--ls-widest)",
                        textTransform: "uppercase",
                        color: isDark ? "var(--on-dark-muted)" : "var(--gold-700)",
                      }}
                    >
                      {label}
                    </h3>
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      padding: 0,
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {notes.map((note) => (
                      <li
                        key={note}
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "var(--t-serif-md)",
                          fontStyle: "italic",
                          color: isDark ? "var(--on-dark)" : "var(--ink-700)",
                          lineHeight: "var(--lh-snug)",
                        }}
                      >
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Description */}
        <section aria-labelledby="desc-heading">
          <h2
            id="desc-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--t-title)",
              fontWeight: 600,
              color: "var(--ink-900)",
              marginBottom: "1rem",
            }}
          >
            Description
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--t-lead)",
              lineHeight: "var(--lh-relaxed)",
              color: "var(--ink-700)",
              maxWidth: "720px",
              margin: 0,
            }}
          >
            {product.description}
          </p>
        </section>

        {/* Related products */}
        <section aria-labelledby="related-heading">
          <h2
            id="related-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--t-title)",
              fontWeight: 600,
              color: "var(--ink-900)",
              marginBottom: "1.75rem",
            }}
          >
            Tu pourrais aussi aimer
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1.25rem",
            }}
          >
            {relatedSlugs.map((relSlug, idx) => {
              const relProduct = resolveProduct(relSlug)!;
              const relDiscount = Math.round(
                ((relProduct.oldPrice - relProduct.price) / relProduct.oldPrice) * 100
              );
              return (
                <Link
                  key={relSlug}
                  href={`/produit/${relSlug}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <article
                    style={{
                      background: "var(--surface-white)",
                      borderRadius: "var(--r-lg)",
                      overflow: "hidden",
                      boxShadow: "var(--shadow-sm)",
                      transition: "box-shadow var(--dur) var(--ease-out), transform var(--dur) var(--ease-out)",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        aspectRatio: "3/4",
                        background: "var(--surface-cream)",
                      }}
                    >
                      <Image
                        src={relatedImages[idx]}
                        alt={`${relProduct.name} — ${relProduct.brand}`}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <span
                        style={{
                          position: "absolute",
                          top: "0.75rem",
                          left: "0.75rem",
                          padding: "0.2rem 0.5rem",
                          background: "var(--badge-promo-bg)",
                          color: "var(--badge-dark-fg)",
                          fontSize: "var(--t-xs)",
                          fontWeight: "var(--fw-bold)",
                          borderRadius: "var(--r-xs)",
                        }}
                      >
                        -{relDiscount}%
                      </span>
                    </div>
                    <div style={{ padding: "0.875rem" }}>
                      <p
                        style={{
                          margin: "0 0 0.2rem",
                          fontSize: "var(--t-xs)",
                          fontWeight: "var(--fw-semibold)",
                          letterSpacing: "var(--ls-wider)",
                          textTransform: "uppercase",
                          color: "var(--gold-500)",
                        }}
                      >
                        {relProduct.brand}
                      </p>
                      <p
                        style={{
                          margin: "0 0 0.625rem",
                          fontFamily: "var(--font-display)",
                          fontSize: "var(--t-serif-md)",
                          fontStyle: "italic",
                          color: "var(--ink-900)",
                          lineHeight: "var(--lh-snug)",
                        }}
                      >
                        {relProduct.name}
                      </p>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "baseline" }}>
                        <span
                          style={{
                            fontWeight: "var(--fw-semibold)",
                            color: "var(--price-sale)",
                            fontSize: "var(--t-body)",
                          }}
                        >
                          {relProduct.price.toFixed(2).replace(".", ",")} €
                        </span>
                        <span
                          style={{
                            fontSize: "var(--t-xs)",
                            color: "var(--price-was)",
                            textDecoration: "line-through",
                          }}
                        >
                          {relProduct.oldPrice.toFixed(2).replace(".", ",")} €
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Customer reviews */}
        <section aria-labelledby="reviews-heading">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: "1.75rem",
            }}
          >
            <h2
              id="reviews-heading"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--t-title)",
                fontWeight: 600,
                color: "var(--ink-900)",
                margin: 0,
              }}
            >
              Avis clients
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {renderStars(product.rating, 14)}
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--t-sm)",
                  color: "var(--ink-500)",
                }}
              >
                {product.rating.toFixed(1)} / 5 · {product.reviews} avis
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.25rem",
            }}
          >
            {REVIEWS.map((review) => (
              <article
                key={review.id}
                style={{
                  background: "var(--surface-white)",
                  borderRadius: "var(--r-lg)",
                  padding: "1.5rem",
                  boxShadow: "var(--shadow-sm)",
                  border: "1px solid var(--line-100)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-sans)",
                        fontWeight: "var(--fw-semibold)",
                        fontSize: "var(--t-body)",
                        color: "var(--ink-900)",
                      }}
                    >
                      {review.name}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "var(--t-xs)",
                        color: "var(--ink-400)",
                      }}
                    >
                      {review.city} · {review.date}
                    </p>
                  </div>
                  {renderStars(review.rating, 13)}
                </header>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--t-sm)",
                    lineHeight: "var(--lh-relaxed)",
                    color: "var(--ink-700)",
                  }}
                >
                  {review.text}
                </p>
                <p
                  style={{
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    fontSize: "var(--t-xs)",
                    color: "var(--success)",
                    fontWeight: "var(--fw-medium)",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Achat vérifié
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
