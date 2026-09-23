import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import AddToCart from "./AddToCart";
import MobileBuyBar from "./MobileBuyBar";
import ProductGallery from "./ProductGallery";
import DeliveryEstimate from "./DeliveryEstimate";
import ProductVideoStrip from "./ProductVideoStrip";
import ProductActions from "./ProductActions";
import { StoryBubbles } from "@/components/sections/StoryBubbles";
import { DEMO_STORIES } from "@/data/product-stories";
import ProductReviews from "./ProductReviews";
import { reviewMediaForProduct } from "@/data/review-media";
import { allProductSlugs, familyLabelOf, relatedProducts, resolveProduct } from "@/data/product-resolve";
import { contentFor } from "@/data/product-content";
import { ProductSummary } from "./ProductSummary";
import { ProductSpecs } from "./ProductSpecs";
import { ProductFaq } from "./ProductFaq";
import StockSignal from "./StockSignal";
import TrioUpsell from "./TrioUpsell";
import ProductTwin from "./ProductTwin";
import ProductQA from "./ProductQA";
import { ForWhom } from "./ForWhom";
import CollectionBuilder from "./CollectionBuilder";
import ProductSectionNav from "./ProductSectionNav";
import { BentoGrid, type BentoTileContent } from "./BentoGrid";
import { bentoLayout } from "./bento-layout";
import type { TileId } from "./bento-types";
import { PyramidTile } from "./tiles/PyramidTile";
import { GaugesTile } from "./tiles/GaugesTile";
import { RatingTile } from "./tiles/RatingTile";
import { PhotosTile } from "./tiles/PhotosTile";
import { LineTile } from "./tiles/LineTile";
import { reviewsFor, reviewSummaryFor } from "@/data/product-reviews";
import { lineSiblings } from "@/data/product-resolve";
import { OLFACTIVE_TWINS } from "@/data/olfactive-twins";
import BackToTop from "./BackToTop";
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

  // Stories : celles de CE parfum uniquement. La rangée montrait avant une
  // story par produit du catalogue, avec leurs prix (49 €, 70 €, 74,50 €…)
  // dans la colonne d'achat de Khamrah — elle détournait du produit ouvert.
  // Une seule bulle sur la fiche, toutes les stories dans le lecteur ; sans
  // story, le composant ne rend rien.
  const storyBubbles = DEMO_STORIES.filter((story) => story.shopProductHandle === slug);

  // Les avis illustres de CETTE fiche uniquement : un avis porte une photo du
  // parfum dont il parle, la rangee n'a donc aucun sens ailleurs. Tableau vide
  // sur les fiches sans photo client, et le composant ne rend alors rien.
  const mediaReviews = reviewMediaForProduct(slug);

  // Liés par la famille et les notes du produit ouvert — voir `relatedProducts`.
  const related = relatedProducts(slug, 4);

  // Famille pour le fil d'Ariane (« Parfums gourmands › Lattafa › Khamrah »).
  // Le pluriel français ne se devine pas avec un « s » : floral → floraux,
  // frais → frais. Table explicite, repli sur l'adjectif tel quel.
  const crumbFamily = familyLabelOf(slug, product).split(" ")[0];
  const CRUMB_PLURAL: Record<string, string> = {
    gourmand: "gourmands", floral: "floraux", boisé: "boisés", ambré: "ambrés",
    frais: "frais", oriental: "orientaux", aromatique: "aromatiques", fruité: "fruités",
    épicé: "épicés", musqué: "musqués", chypré: "chyprés", cuir: "cuir", aquatique: "aquatiques",
  };
  const crumbFamilyLabel = crumbFamily
    ? `Parfums ${CRUMB_PLURAL[crumbFamily.toLowerCase()] ?? crumbFamily.toLowerCase()}`
    : "Parfums";

  // Amorce de la description (jusqu'à la fin de la première phrase après
  // ~220 signes) ; le reste s'ouvre à la demande. Une description courte
  // reste entière.
  const cut = product.description.length > 320 ? product.description.indexOf(". ", 220) : -1;
  const descLead = cut > 0 ? product.description.slice(0, cut + 1) : product.description;
  const descRest = cut > 0 ? product.description.slice(cut + 2) : "";

  // Couche éditoriale de la fiche (tenue, saisons, FAQ, date de relecture) —
  // objet vide si le slug n'en a pas : chaque bloc décide seul de se dessiner.
  const content = contentFor(slug);

  // ── Bento ────────────────────────────────────────────────────────────────
  // Le moteur ne lit aucune source lui-même : la page lui passe des données
  // déjà résolues, il en déduit quelles tuiles existent et comment elles
  // pavent la grille. Une tuile dont la donnée manque n'est pas dans la liste.
  const reviews = reviewsFor(slug);
  const reviewSummary = reviewSummaryFor(slug);
  const siblings = lineSiblings(slug, 4);
  const twin = OLFACTIVE_TWINS.find((t) => t.productHandle === slug);
  const tiles = bentoLayout({
    slug,
    product,
    content,
    reviews,
    summary: reviewSummary,
    mediaCount: mediaReviews.length,
    twin,
    siblings,
    related,
  });


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
        // schema.org/Product n'a pas de propriété « perfumer » (ni `creator`,
        // réservé aux CreativeWork) : `additionalProperty` est le seul porteur
        // propre du vocabulaire. Omis quand le nez n'est pas documenté, pour ne
        // pas publier une propriété vide.
        ...(product.perfumer
          ? {
              "additionalProperty": {
                "@type": "PropertyValue",
                "name": "Parfumeur",
                "value": product.perfumer,
              },
            }
          : {}),
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

      {/* BreadcrumbList — même source que le fil d'Ariane visible */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://www.dubaiparfumerie.com/" },
          ...(crumbFamily
            ? [{ "@type": "ListItem", "position": 2, "name": crumbFamilyLabel, "item": `https://www.dubaiparfumerie.com/catalogue?famille=${encodeURIComponent(crumbFamily)}` }]
            : []),
          { "@type": "ListItem", "position": crumbFamily ? 3 : 2, "name": product.brand, "item": `https://www.dubaiparfumerie.com/marques#${encodeURIComponent(product.brand)}` },
          { "@type": "ListItem", "position": crumbFamily ? 4 : 3, "name": product.name },
        ],
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

            {/* Vue 360° — uniquement quand la fiche déclare une séquence de
                rotation (`view360`). Avant, le bouton était rendu grisé et
                désactivé sur TOUTES les fiches, « bientôt disponible » compris :
                une promesse vide sous chaque galerie. */}
            {product.view360 && product.view360.length > 0 && (
            <button
              type="button"
              aria-label="Vue 360°"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                height: "40px",
                background: "transparent",
                border: "1px solid var(--line-200)",
                borderRadius: "var(--r-sm)",
                color: "var(--ink-700)",
                fontFamily: "var(--font-sans)",
                fontSize: "var(--t-sm)",
                cursor: "pointer",
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
            )}

            {/* L'offre maison « achetez 2, le 3ᵉ offert » sous la galerie : la
                colonne des visuels est plus courte, l'espace était vide, et
                l'encart ne concurrence plus le bouton d'achat à droite. */}
            <div style={{ marginTop: "0.5rem" }}>
              <TrioUpsell
                slug={slug}
                productName={product.name}
                brand={product.brand}
                price={product.price}
                image={product.image}
                locale={locale}
              />
            </div>

            {/* « En 30 secondes » comble le bas de la colonne des visuels, plus
                courte que celle de l'achat : les faits citables arrivent ainsi
                au-dessus de la ligne de flottaison, en face du bouton. */}
            <div id="resume" style={{ scrollMarginTop: 130, marginTop: "0.5rem" }}>
              <ProductSummary product={product} slug={slug} content={content} />
            </div>
          </div>

          {/* ── Right: product info ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Breadcrumb */}
            <nav style={{ fontSize: "var(--t-xs)", color: "var(--ink-400)", display: "flex", gap: "0.375rem", alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/" style={{ color: "var(--ink-400)", textDecoration: "none" }}>
                Accueil
              </Link>
              <span aria-hidden="true">›</span>
              {/* Famille réelle du produit — « Parfums Femme » était figé sur
                  toutes les fiches, Khamrah (mixte) compris. Le schéma
                  BreadcrumbList ci-dessous suit la même source. */}
              <Link href={crumbFamily ? `/catalogue?famille=${encodeURIComponent(crumbFamily)}` : "/catalogue"} style={{ color: "var(--ink-400)", textDecoration: "none" }}>
                {crumbFamilyLabel}
              </Link>
              <span aria-hidden="true">›</span>
              <Link href={`/marques#${encodeURIComponent(product.brand)}`} style={{ color: "var(--ink-400)", textDecoration: "none" }}>
                {product.brand}
              </Link>
              <span aria-hidden="true">›</span>
              <span style={{ color: "var(--ink-700)" }}>{product.name}</span>
            </nav>

            {/* Marque + Favoris / Partager sur la même ligne : les deux actions
                étaient en bas de colonne, sous six blocs, sans handler. Elles
                vivent maintenant là où l'œil arrive en premier — voir
                `ProductActions`. */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
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
              <ProductActions slug={slug} productName={product.name} brand={product.brand} />
            </div>

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

            {/* Vidéos et stories juste sous les badges, avant le prix : le
                produit en mouvement pendant qu'on se décide, pas après. */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <ProductVideoStrip productSlug={slug} productName={product.name} productImage={product.image} compact />
              <StoryBubbles stories={storyBubbles} locale={locale} single />
            </div>

            {/* Signature du nez — rendue seulement quand l'attribution est
                documentée : une maison qui ne communique pas son parfumeur ne
                doit laisser ni libellé ni ligne vide. Volontairement traitée
                comme une mention d'auteur (filet doré, nom en display) et non
                comme un badge de spécification à côté de « EDP 30 % ». */}
            {product.perfumer && (
              <p
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.5rem",
                  paddingLeft: "0.75rem",
                  borderLeft: "2px solid var(--gold-500)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--t-sm)",
                  color: "var(--ink-700)",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--t-xs)",
                    fontWeight: "var(--fw-semibold)",
                    letterSpacing: "var(--ls-widest)",
                    textTransform: "uppercase",
                    color: "var(--ink-400)",
                  }}
                >
                  Le nez
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--t-body)",
                    fontStyle: "italic",
                    color: "var(--ink-900)",
                  }}
                >
                  {product.perfumer}
                </span>
              </p>
            )}

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

            {/* Stock déclaré — affiché seulement sous un seuil, jamais de faux compte à rebours */}
            <StockSignal stock={content.stock} />

            {/* Installments */}
            <p
              style={{
                margin: 0,
                fontSize: "var(--t-sm)",
                color: "var(--ink-500)",
              }}
            >
              {/* Marque PayPal reprise telle quelle du pied de page, qui la
                  dessine déjà pour la rangée des moyens de paiement : deux
                  tracés du même logo finiraient par diverger. L'émoji carte
                  bancaire qui tenait cette place laissait croire à un
                  fractionnement par carte, alors que c'est PayPal qui le
                  porte — et le nom du prestataire est justement ce qui rend
                  l'offre crédible. */}
              Payez en{" "}
              <strong style={{ color: "var(--ink-700)" }}>4× sans frais</strong> avec{" "}
              <span style={{ display: "inline-flex", verticalAlign: "-3px" }}>
                <svg viewBox="0 0 58 18" width="44" height="14" role="img" aria-label="PayPal">
                  <text x="0" y="14.5" fontFamily="Arial, Helvetica, sans-serif" fontStyle="italic" fontWeight="800" fontSize="16" fill="#003087">Pay</text>
                  <text x="25" y="14.5" fontFamily="Arial, Helvetica, sans-serif" fontStyle="italic" fontWeight="800" fontSize="16" fill="#009CDE">Pal</text>
                </svg>
              </span>{" "}
              — soit{" "}
              <strong style={{ color: "var(--ink-700)" }}>{installment} €</strong>
              /mois
            </p>

            {/* Estimateur de livraison — AVANT la contenance : « quand ? » se règle
                avant « combien ? », et le bloc crème sépare le prix du choix de format.
                Ancien commentaire : — client, car la date dépend de l'heure
                courante (voir le composant : rien n'est calculé au rendu serveur). */}
            <DeliveryEstimate locale={locale} />

            {/* Contenance + quantité + ajout + paiement express (client).
                Le sélecteur de contenance vit désormais DANS AddToCart. */}
            <AddToCart
              slug={slug}
              productName={product.name}
              brand={product.brand}
              price={product.price}
              oldPrice={product.oldPrice}
              volume={product.volume}
              image={product.image}
              variants={product.variants}
              sample={product.sample}
            />


          </div>
        </div>
      </section>

      {/* ── Sous le hero : la grille bento ──────────────────────────────────
          Plus une pile de sections, mais des tuiles de tailles différentes qui
          pavent six colonnes. `bento-layout.ts` a déjà décidé lesquelles
          existent et comment elles se placent ; ici on ne fait que dire ce
          qu'il y a dedans. Une tuile inconnue du `switch` renvoie `null` et
          disparaît proprement. */}
      <ProductSectionNav
        items={[
          { id: "notes", label: "Notes" },
          { id: "comparer", label: "Comparer" },
          { id: "avis", label: "Avis" },
          { id: "questions", label: "Questions" },
          { id: "completer", label: "Compléter" },
        ]}
      />

      <div style={{ maxWidth: "var(--container)", margin: "0 auto", padding: "2.5rem var(--gutter) 5rem" }}>
        <BentoGrid
          tiles={tiles}
          render={(id: TileId): BentoTileContent | null => {
            switch (id) {
              case "summary":
                return {
                  tone: "cream",
                  children: <ProductSummary product={product} slug={slug} content={content} />,
                };
              case "gauges":
                return { children: <GaugesTile content={content} product={product} /> };
              case "pyramid":
                return { anchor: "notes", children: <PyramidTile product={product} content={content} /> };
              case "specs":
                return { children: <ProductSpecs product={product} slug={slug} content={content} /> };
              case "twin":
                return {
                  anchor: "comparer",
                  children: <ProductTwin slug={slug} product={product} content={content} />,
                };
              case "forwhom":
                return { children: <ForWhom slug={slug} product={product} content={content} /> };
              case "rating":
                return { children: <RatingTile product={product} summary={reviewSummary} /> };
              case "reviews":
                return {
                  anchor: "avis",
                  children: <ProductReviews slug={slug} product={product} locale={locale} mediaReviews={mediaReviews} />,
                };
              case "photos":
                return { children: <PhotosTile slug={slug} reviews={reviews} mediaReviews={mediaReviews} /> };
              case "line":
                return { children: <LineTile slug={slug} product={product} /> };
              case "description":
                return {
                  eyebrow: "Le parfum",
                  title: "Description",
                  children: (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <p
                        className="dp-product-desc"
                        style={{
                          margin: 0,
                          fontFamily: "var(--font-sans)",
                          fontSize: "var(--t-body)",
                          lineHeight: "var(--lh-comfort)",
                          color: "var(--ink-700)",
                        }}
                      >
                        {descLead}
                      </p>
                      {descRest && (
                        <details className="dp-desc-more">
                          <summary
                            style={{
                              cursor: "pointer",
                              listStyle: "none",
                              fontFamily: "var(--font-sans)",
                              fontSize: "var(--t-sm)",
                              fontWeight: "var(--fw-medium)",
                              color: "var(--gold-700)",
                            }}
                          >
                            Lire la description complète
                          </summary>
                          <p
                            className="dp-product-desc"
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "var(--t-body)",
                              lineHeight: "var(--lh-comfort)",
                              color: "var(--ink-700)",
                              margin: "0.75rem 0 0",
                            }}
                          >
                            {descRest}
                          </p>
                        </details>
                      )}
                      {product.viralNote && (
                        <div style={{ paddingInlineStart: "0.875rem", borderInlineStart: "2px solid var(--gold-500)" }}>
                          <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "var(--t-sm)", lineHeight: "var(--lh-comfort)", color: "var(--ink-700)" }}>
                            {product.viralNote}
                          </p>
                          <p style={{ margin: "0.4rem 0 0", fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", color: "var(--ink-400)" }}>
                            Parfums inspirés, jamais des copies : aucune affiliation avec les marques citées.
                          </p>
                        </div>
                      )}
                    </div>
                  ),
                };
              case "questions":
                return {
                  anchor: "questions",
                  children: (
                    <div>
                      <ProductFaq product={product} slug={slug} content={content} />
                      <ProductQA product={product} content={content} embedded />
                    </div>
                  ),
                };
              case "collection":
                return {
                  anchor: "completer",
                  tone: "cream",
                  children: (
                    <CollectionBuilder
                      slug={slug}
                      productName={product.name}
                      brand={product.brand}
                      price={product.price}
                      oldPrice={product.oldPrice}
                      image={product.image ?? "/assets/prod-1.jpg"}
                      volume={product.volume}
                    />
                  ),
                };
              case "related":
                return {
                  eyebrow: "Dans le même esprit",
                  title: "Vous pourriez aussi aimer",
                  children: (
                    <div className="dp-bento-related" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "1.25rem" }}>
                      {related.map(({ slug: relSlug, product: relProduct }) => (
                        <Link key={relSlug} href={`/produit/${relSlug}`} style={{ textDecoration: "none", color: "inherit" }}>
                          <article style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <div style={{ position: "relative", aspectRatio: "1 / 1", background: "var(--surface-image)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
                              <Image
                                src={relProduct.packshot ?? relProduct.image ?? "/assets/prod-3.jpg"}
                                alt={`${relProduct.name} — ${relProduct.brand}`}
                                fill
                                style={{ objectFit: "contain", padding: "1rem" }}
                                sizes="(max-width: 720px) 45vw, 220px"
                              />
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: "10px", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-wider)", textTransform: "uppercase", color: "var(--gold-500)" }}>
                                {relProduct.brand}
                              </p>
                              <p style={{ margin: "0.1rem 0 0.25rem", fontFamily: "var(--font-display)", fontSize: "var(--t-body)", fontStyle: "italic", color: "var(--ink-900)" }}>
                                {relProduct.name}
                              </p>
                              <span style={{ fontWeight: "var(--fw-semibold)", color: "var(--price-sale)", fontSize: "var(--t-sm)" }}>
                                {relProduct.price.toFixed(2).replace(".", ",")} €
                              </span>
                            </div>
                          </article>
                        </Link>
                      ))}
                    </div>
                  ),
                };
              default:
                return null;
            }
          }}
        />
      </div>

      <style>{`
        .dp-desc-more > summary::-webkit-details-marker { display: none; }
        .dp-desc-more[open] > summary { display: none; }
        @media (max-width: 720px) {
          .dp-bento-related { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
      `}</style>

      {/* Flèche « remonter » après un écran de défilement. */}
      <BackToTop />

      {/* Barre d'achat fixe, mobile uniquement — voir MobileBuyBar. */}
      <MobileBuyBar
        slug={slug}
        productName={product.name}
        brand={product.brand}
        price={product.price}
        oldPrice={product.oldPrice}
        volume={product.volume}
        image={product.image}
        variants={product.variants}
        sample={product.sample}
      />
    </div>
  );
}
