import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { DEMO, type Article } from "@/data/journal-articles";
import { resolveProduct } from "@/data/product-resolve";

const ARTICLES: Record<string, { title: string; category: string; date: string; readTime: string; body: React.ReactNode; tags: string[] }> = {
  "l-oud-l-or-noir-de-la-parfumerie-orientale": {
    title: "L'Oud, l'or noir de la parfumerie orientale",
    category: "Oud · Matières",
    date: "18 juin 2026",
    readTime: "6 min",
    tags: ["Oud", "Rose", "Safran", "Ambre"],
    body: (
      <>
        <p style={{ margin: "0 0 22px" }}>L&apos;oud — ou bois d&apos;agar — est sans doute la matière la plus précieuse et la plus mythique de la parfumerie. Issu du cœur d&apos;un arbre, l&apos;<em>Aquilaria</em>, lorsqu&apos;il est infecté par une moisissure, il développe une résine sombre au parfum profond, animal, boisé et balsamique.</p>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "1.8rem", color: "var(--ink-900)", margin: "36px 0 14px" }}>Une matière rare et convoitée</h2>
        <p style={{ margin: "0 0 22px" }}>On le surnomme « l&apos;or noir » car son prix au kilo peut dépasser celui de l&apos;or. Dans le Golfe, l&apos;oud n&apos;est pas qu&apos;un parfum : c&apos;est un marqueur social, un geste d&apos;hospitalité, un rituel. On le brûle en copeaux (bakhour) pour parfumer maisons et vêtements.</p>
        <blockquote style={{ margin: "32px 0", padding: "24px 28px", borderLeft: "3px solid var(--gold-500)", background: "var(--surface-cream)", borderRadius: "0 var(--r-sm) var(--r-sm) 0" }}>
          <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "1.4rem", lineHeight: 1.4, color: "var(--ink-900)", margin: 0 }}>« L&apos;oud ne se sent pas, il se ressent. Il raconte une histoire à chaque heure qui passe sur la peau. »</p>
        </blockquote>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "1.8rem", color: "var(--ink-900)", margin: "36px 0 14px" }}>Comment le porter</h2>
        <p style={{ margin: "0 0 22px" }}>L&apos;oud est puissant : une touche suffit. Il s&apos;accorde merveilleusement avec la rose, le safran et l&apos;ambre. Pour débuter, optez pour un oud « occidentalisé », plus doux, avant d&apos;explorer les ouds bruts du Cambodge ou de l&apos;Assam.</p>
      </>
    ),
  },
  "comment-choisir-son-premier-parfum-oriental": {
    title: "Comment choisir son premier parfum oriental",
    category: "Guide",
    date: "15 juin 2026",
    readTime: "7 min",
    tags: ["Guide", "Débutant", "Oud", "Musc"],
    body: (
      <>
        <p style={{ margin: "0 0 22px" }}>Entre oud, musc et ambre, naviguer dans la parfumerie orientale peut sembler intimidant. Voici notre guide pour bien commencer.</p>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "1.8rem", color: "var(--ink-900)", margin: "36px 0 14px" }}>Commencer par le musc</h2>
        <p style={{ margin: "0 0 22px" }}>Le musc blanc est la porte d&apos;entrée idéale : doux, poudreux, universel. Il pardonne tout et s&apos;adapte à toutes les peaux.</p>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "1.8rem", color: "var(--ink-900)", margin: "36px 0 14px" }}>Explorer les familles olfactives</h2>
        <p style={{ margin: "0 0 22px" }}>Boisé, floral, gourmand, épicé — la parfumerie orientale couvre un spectre immense. Notre coffret découverte 5 échantillons permet d&apos;identifier votre signature olfactive avant d&apos;investir dans un flacon.</p>
      </>
    ),
  },
};

type Props = { params: Promise<{ slug: string; locale: string }> };

const SITE_URL = "https://www.dubaiparfumerie.com";
const LOCALES = ["fr", "en", "es", "de", "it", "ru", "ar"];

/** Article « produit » du Journal (données `DEMO`) pour ce slug, sinon `null`. */
function findProductArticle(slug: string): Article | null {
  const a = DEMO.find((x) => x.slug === slug);
  return a && a.kind === "produit" ? a : null;
}

/** « 22 septembre 2026 » depuis une date ISO — le contenu du Journal est en français. */
function formatDateFr(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}

export async function generateStaticParams() {
  // Tous les billets du Journal (`DEMO`) plus les deux articles rédigés en
  // dur ci-dessus, pour les sept langues — même logique que la fiche produit.
  const slugs = new Set<string>([...DEMO.map((a) => a.slug), ...Object.keys(ARTICLES)]);
  return LOCALES.flatMap((locale) => [...slugs].map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const editorial = findProductArticle(slug);
  if (editorial) {
    const title = `${editorial.title} — Journal | Dubaï Parfumerie`;
    const description = editorial.subtitle ?? editorial.excerpt;
    return {
      title,
      description,
      openGraph: {
        type: "article",
        title,
        description,
        publishedTime: editorial.publishedAt,
        images: [{ url: `${SITE_URL}${editorial.coverImage}`, alt: editorial.title }],
      },
    };
  }
  const article = ARTICLES[slug];
  return {
    title: article?.title ?? "Article",
    description: article?.category,
  };
}

const relatedProducts = [
  { image: "/assets/prod-3.jpg", brand: "Swiss Arabian", name: "Shaghaf Oud", price: 39.90, oldPrice: 74.90 },
  { image: "/assets/prod-2.jpg", brand: "Al Haramain", name: "Amber Oud", price: 34.90, oldPrice: 59.90 },
  { image: "/assets/prod-1.jpg", brand: "Lattafa", name: "Oud Pour Elle", price: 28.90, oldPrice: 49.90 },
];

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  // Portrait de flacon : mise en page magazine, colonne d'achat qui suit.
  const editorial = findProductArticle(slug);
  if (editorial) return <EditorialArticle article={editorial} />;

  const article = ARTICLES[slug] ?? ARTICLES["l-oud-l-or-noir-de-la-parfumerie-orientale"];

  return (
    <main style={{ background: "var(--surface-page)", paddingTop: 40 }}>
      {/* Breadcrumb + meta */}
      <article style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px 0" }}>
        <Link href="/blog" style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "var(--ink-400)", textDecoration: "none" }}>‹ Retour au Journal</Link>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold-700)", margin: "24px 0 14px" }}>{article.category}</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(2.4rem,4vw,3.4rem)", lineHeight: 1.08, color: "var(--ink-900)", margin: 0 }}>{article.title}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22, fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--ink-500)" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--gold-500)", color: "var(--ink-900)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.8rem" }}>DP</div>
          Par la rédaction · {article.date} · {article.readTime} de lecture
        </div>
      </article>

      {/* Hero image */}
      <div style={{ maxWidth: 980, margin: "32px auto 0", padding: "0 24px" }}>
        <div style={{ position: "relative", aspectRatio: "21/9", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
          <Image src="/assets/prod-3.jpg" alt={article.title} fill sizes="980px" style={{ objectFit: "cover" }} />
        </div>
      </div>

      {/* Body */}
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 24px", fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: "1.0625rem", lineHeight: 1.8, color: "var(--ink-700)" }}>
        {article.body}

        {/* Tags */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "32px 0" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "11px", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-500)", alignSelf: "center" }}>Notes liées</span>
          {article.tags.map(tag => (
            <Link key={tag} href="/blog" style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--ink-700)", background: "var(--surface-white)", border: "1px solid var(--line-200)", borderRadius: "999px", padding: "7px 14px", textDecoration: "none" }}>{tag}</Link>
          ))}
        </div>
      </article>

      {/* Related products */}
      <section style={{ background: "var(--surface-cream)", borderTop: "1px solid var(--line-100)", marginTop: 32 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "1.8rem", color: "var(--ink-900)", margin: "0 0 28px", textAlign: "center" }}>Les oud à découvrir</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
            {relatedProducts.map(p => (
              <Link key={p.name} href={`/produit/${p.name.toLowerCase().replace(/ /g, "-")}`} style={{ textDecoration: "none", background: "var(--surface-white)", border: "1px solid #e8dfd0", borderRadius: "var(--r-lg)", overflow: "hidden", display: "block" }}>
                <div style={{ position: "relative", paddingBottom: "100%" }}>
                  <Image src={p.image} alt={p.name} fill sizes="33vw" style={{ objectFit: "cover" }} />
                </div>
                <div style={{ padding: "16px 18px 20px" }}>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold-500)", marginBottom: 4 }}>{p.brand}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--ink-900)", marginBottom: 10 }}>{p.name}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 600, color: "var(--ink-900)" }}>{p.price.toFixed(2)} €</span>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--ink-400)", textDecoration: "line-through" }}>{p.oldPrice.toFixed(2)} €</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

// ─── Article « produit » : l'éditorial magazine ──────────────────────────────
// Trois chapitres, trois images, une colonne d'achat qui suit la lecture.
// La colonne est `sticky` en desktop ; sous 900 px elle passe SOUS le texte
// (l'article se lit d'abord, on achète ensuite) et perd le sticky : un bloc
// collé de 320 px sur un écran de 390 px masquerait la lecture.

const GOLD_GRADIENT = "linear-gradient(100deg, #9C6A1A 0%, #C8901E 50%, #D8A63A 100%)";
const SAMPLE_LABEL = "Échantillon 1 ml · 1,90 €";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span aria-label={`${rating.toFixed(1)} sur 5`} style={{ color: "var(--gold-500)", letterSpacing: 1, fontSize: 14 }}>
      {"★".repeat(full)}{"☆".repeat(5 - full)}
    </span>
  );
}

function EditorialArticle({ article }: { article: Article }) {
  const product = article.productSlug ? resolveProduct(article.productSlug) : null;
  const chapters = article.chapters ?? [];
  const dateFr = article.publishedAt ? formatDateFr(article.publishedAt) : null;
  const productHref = article.productSlug ? `/produit/${article.productSlug}` : "/catalogue";

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.subtitle ?? article.excerpt,
      image: `${SITE_URL}${article.coverImage}`,
      datePublished: article.publishedAt,
      author: { "@type": "Organization", name: "Dubaï Parfumerie" },
      publisher: { "@type": "Organization", name: "Dubaï Parfumerie" },
      ...(product ? { about: { "@type": "Product", name: `${product.brand} ${product.name}` } } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Journal", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: article.title, item: `${SITE_URL}${article.href}` },
      ],
    },
  ];

  const pill: React.CSSProperties = {
    fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", fontWeight: 600, letterSpacing: ".08em",
    textTransform: "uppercase", color: "#fff", padding: "6px 12px", borderRadius: 999,
    background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.3)", whiteSpace: "nowrap",
  };
  const h3: React.CSSProperties = {
    fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "var(--t-serif-lg)", color: "var(--ink-900)", margin: "0 0 10px",
  };
  const bodyText: React.CSSProperties = {
    fontFamily: "var(--font-sans)", fontSize: "var(--t-body)", lineHeight: 1.65, color: "var(--ink-700)",
  };
  const outlineBtn: React.CSSProperties = {
    display: "block", textAlign: "center", padding: "12px 16px", borderRadius: "var(--r-md)",
    border: "1px solid var(--line-200)", color: "var(--ink-900)", textDecoration: "none",
    fontFamily: "var(--font-sans)", fontSize: "var(--t-sm)", fontWeight: 600, letterSpacing: ".04em",
  };

  return (
    <main style={{ background: "var(--surface-page)", paddingTop: 24, paddingBottom: 64 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{`
        .jp-wrap { max-width: var(--container); margin: 0 auto; padding: 0 24px; }
        .jp-hero { position: relative; height: 420px; border-radius: var(--r-lg); overflow: hidden; background: var(--surface-cream-2); }
        .jp-hero-text { position: absolute; left: 0; right: 0; bottom: 0; padding: 40px; max-width: 720px; }
        .jp-hero h1 { font-family: var(--font-display); font-weight: 500; font-size: clamp(2rem, 5vw, 3.25rem); line-height: 1.05; color: #fff; margin: 0; }
        .jp-layout { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 3rem; align-items: start; margin-top: 32px; }
        .jp-buy { position: sticky; top: 96px; }
        .jp-chapter-img { position: relative; aspect-ratio: 16 / 10; border-radius: var(--r-lg); overflow: hidden; background: var(--surface-cream-2); }
        .jp-boxes { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 40px; }
        .jp-toc a { color: var(--gold-700); text-decoration: none; border-bottom: 1px solid rgba(156,106,26,.35); }
        .jp-toc a:hover { color: var(--gold-500); }
        @media (max-width: 900px) {
          .jp-layout { grid-template-columns: minmax(0, 1fr); gap: 2.5rem; }
          .jp-buy { position: static; }
        }
        @media (max-width: 640px) {
          .jp-wrap { padding: 0 16px; }
          .jp-hero { height: 440px; }
          .jp-hero-text { padding: 20px; }
          .jp-boxes { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="jp-wrap">
        {/* Fil d'Ariane */}
        <nav aria-label="Fil d'Ariane" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", color: "var(--ink-400)", marginBottom: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Accueil</Link><span>›</span>
          <Link href="/blog" style={{ color: "inherit", textDecoration: "none" }}>Journal</Link><span>›</span>
          <span style={{ color: "var(--ink-700)" }}>{article.title}</span>
        </nav>

        {/* Hero pleine largeur */}
        <header className="jp-hero">
          <Image src={article.coverImage} alt={article.title} fill priority sizes="(max-width: 1240px) 100vw, 1240px" style={{ objectFit: "cover" }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(21,16,11,0) 18%, rgba(21,16,11,.6) 55%, rgba(21,16,11,.9) 100%)" }} />
          <div className="jp-hero-text">
            {product && (
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-300)", marginBottom: 10 }}>
                {product.brand}{product.family ? ` · ${product.family} oriental` : ""} · Le portrait
              </div>
            )}
            <h1>{article.title}</h1>
            {article.subtitle && (
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--t-lead)", lineHeight: 1.45, color: "#EFD79B", margin: "12px 0 0" }}>{article.subtitle}</p>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              <span style={pill}>{article.readingMinutes} min de lecture</span>
              <span style={pill}>{article.category}</span>
              {dateFr && <span style={pill}>{dateFr}</span>}
            </div>
          </div>
        </header>

        <div className="jp-layout">
          {/* ── Colonne éditoriale ── */}
          <div style={{ minWidth: 0 }}>
            <nav className="jp-toc" aria-label="Sommaire" style={{ background: "var(--surface-white)", border: "1px solid var(--line-100)", borderRadius: "var(--r-lg)", padding: "14px 20px" }}>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 8 }}>Sommaire</div>
              <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: "6px 18px", fontFamily: "var(--font-sans)", fontSize: "var(--t-sm)" }}>
                {chapters.map((c, i) => (
                  <li key={c.id}><a href={`#${c.id}`}>{i + 1}. {c.title}</a></li>
                ))}
                {article.howToWear && <li><a href="#porter">Comment le porter</a></li>}
                {article.didYouKnow && <li><a href="#saviez">Le saviez-vous</a></li>}
              </ol>
            </nav>

            {chapters.map((c) => (
              <section key={c.id} id={c.id} style={{ marginTop: 44, scrollMarginTop: 96 }}>
                {c.kicker && (
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-700)", marginBottom: 8 }}>{c.kicker}</div>
                )}
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--t-title)", lineHeight: 1.15, color: "var(--ink-900)", margin: "0 0 18px" }}>{c.title}</h2>
                <figure style={{ margin: "0 0 20px" }}>
                  <div className="jp-chapter-img">
                    <Image src={c.image} alt={c.imageAlt} fill sizes="(max-width: 900px) 100vw, 820px" style={{ objectFit: "cover" }} />
                  </div>
                  {c.caption && (
                    <figcaption style={{ fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", fontStyle: "italic", color: "var(--ink-400)", marginTop: 8 }}>{c.caption}</figcaption>
                  )}
                </figure>
                {c.paragraphs.map((text, i) => (
                  <p key={i} style={{ ...bodyText, maxWidth: "68ch", margin: "0 0 14px" }}>{text}</p>
                ))}
              </section>
            ))}

            {(article.howToWear || article.didYouKnow) && (
              <div className="jp-boxes">
                {article.howToWear && (
                  <section id="porter" style={{ background: "var(--surface-white)", border: "1px solid var(--line-100)", borderRadius: "var(--r-lg)", padding: "20px 22px", scrollMarginTop: 96 }}>
                    <h3 style={h3}>Comment le porter</h3>
                    <ol style={{ ...bodyText, fontSize: "var(--t-sm)", margin: 0, paddingLeft: 18, listStyle: "decimal" }}>
                      {article.howToWear.map((tip, i) => <li key={i} style={{ marginBottom: 6 }}>{tip}</li>)}
                    </ol>
                  </section>
                )}
                {article.didYouKnow && (
                  <section id="saviez" style={{ background: "var(--surface-cream)", borderLeft: "3px solid var(--gold-500)", borderRadius: "var(--r-lg)", padding: "20px 22px", scrollMarginTop: 96 }}>
                    <h3 style={h3}>Le saviez-vous ?</h3>
                    <p style={{ ...bodyText, fontSize: "var(--t-sm)", margin: 0 }}>{article.didYouKnow}</p>
                  </section>
                )}
              </div>
            )}
          </div>

          {/* ── Colonne achat ── */}
          {product && (
            <aside className="jp-buy" aria-label="Acheter ce parfum">
              <div style={{ background: "var(--surface-white)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--line-100)", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: "var(--r-md)", overflow: "hidden", background: "var(--surface-cream)" }}>
                  <Image src={product.image ?? article.coverImage} alt={`${product.brand} ${product.name}`} fill sizes="(max-width: 900px) 100vw, 320px" style={{ objectFit: "cover" }} />
                </div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-700)" }}>{product.brand} · {product.concentration.startsWith("EDP") ? "Eau de parfum" : product.concentration}</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--t-title)", lineHeight: 1.1, color: "var(--ink-900)" }}>{product.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-sans)", fontSize: "var(--t-sm)", color: "var(--ink-500)" }}>
                  <Stars rating={product.rating} />
                  <b style={{ color: "var(--ink-900)" }}>{product.rating.toFixed(1).replace(".", ",")}</b>
                  <span>({product.reviews} avis)</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.75rem", color: "var(--gold-700)" }}>{product.price.toFixed(2).replace(".", ",")} €</span>
                  {product.oldPrice > product.price && (
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--t-sm)", color: "var(--ink-400)", textDecoration: "line-through" }}>{product.oldPrice.toFixed(2).replace(".", ",")} €</span>
                  )}
                </div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "var(--t-sm)", color: "var(--ink-500)" }}>{product.volume.replace(/(\d)(ml)/, "$1 $2")} · {product.origin}</div>
                <Link href={productHref} style={{ display: "block", textAlign: "center", padding: "13px 16px", borderRadius: "var(--r-md)", background: GOLD_GRADIENT, color: "var(--espresso-900)", textDecoration: "none", fontFamily: "var(--font-sans)", fontSize: "var(--t-sm)", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>
                  Voir la fiche
                </Link>
                <Link href="/preview/selecteur-echantillons" style={outlineBtn}>{SAMPLE_LABEL}</Link>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", color: "var(--ink-500)", textAlign: "center" }}>Livraison offerte dès 60 € · Retour 14 jours</div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
