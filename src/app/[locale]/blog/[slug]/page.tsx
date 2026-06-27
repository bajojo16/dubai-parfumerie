import type { Metadata } from "next";
import Image from "next/image";

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
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
  const article = ARTICLES[slug] ?? ARTICLES["l-oud-l-or-noir-de-la-parfumerie-orientale"];

  return (
    <main style={{ background: "var(--surface-page)", paddingTop: 40 }}>
      {/* Breadcrumb + meta */}
      <article style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px 0" }}>
        <a href="/blog" style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "var(--ink-400)", textDecoration: "none" }}>‹ Retour au Journal</a>
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
            <a key={tag} href="/blog" style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--ink-700)", background: "var(--surface-white)", border: "1px solid var(--line-200)", borderRadius: "999px", padding: "7px 14px", textDecoration: "none" }}>{tag}</a>
          ))}
        </div>
      </article>

      {/* Related products */}
      <section style={{ background: "var(--surface-cream)", borderTop: "1px solid var(--line-100)", marginTop: 32 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "1.8rem", color: "var(--ink-900)", margin: "0 0 28px", textAlign: "center" }}>Les oud à découvrir</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
            {relatedProducts.map(p => (
              <a key={p.name} href={`/produit/${p.name.toLowerCase().replace(/ /g, "-")}`} style={{ textDecoration: "none", background: "var(--surface-white)", border: "1px solid #e8dfd0", borderRadius: "var(--r-lg)", overflow: "hidden", display: "block" }}>
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
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
