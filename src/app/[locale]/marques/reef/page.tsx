import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { REEF_PRODUCTS } from "@/data/best-sellers";
import { ReefStorySection } from "./_reef-story";

/**
 * Page de maison — Reef Perfumes.
 *
 * Première page consacrée à une seule maison. Elle sert de patron aux
 * suivantes : hero éditorial, récit de la maison, rail de son catalogue,
 * navigation par note, engagement d'authenticité.
 *
 * L'UNIVERS DE LA MARQUE, relevé sur reefperfumes.com : le site est
 * exclusivement en arabe et se réclame d'un « esprit du Golfe authentique »
 * (بروح خليجية أصيلة). Ses lignes s'appellent Reef Elixir, Reef Musk, Princess
 * Reef, Princess Beauty. Sa navigation ne se fait pas par genre mais PAR NOTE —
 * oud, musc, floral, cuir, fruité, romarin, vanille, bois — parti pris repris
 * ici, parce qu'il dit ce que la maison met en avant : la matière avant la
 * cible. Le nom ne renvoie à aucun récif : « reef » (ريف) est la campagne, la
 * terre — d'où le registre végétal et minéral plutôt que marin, malgré
 * l'homonymie anglaise dans laquelle il serait facile de tomber.
 *
 * Ce qu'on NE reprend pas : la promesse « 3 parfums pour un prix » et le seuil
 * de port offert à 299 SAR appartiennent à la boutique de la maison, pas à
 * celle-ci — nos propres conditions valent (60 €, voir `FreeShippingBar`).
 */

export const metadata = {
  title: "Reef Perfumes — la maison | Dubaï Parfumerie",
  description:
    "Née à Dubaï en 2005, Reef Perfumes signe des fragrances du Golfe fraîches et tenaces. Découvrez la maison, ses lignes et ses parfums.",
};

/** Palette de la page : les tokens du site, jamais de valeur en dur ailleurs. */
const C = {
  page: "var(--surface-page)",
  cream: "var(--surface-cream)",
  white: "var(--surface-white)",
  ink: "var(--ink-900)",
  muted: "var(--ink-500)",
  gold: "var(--gold-500)",
  goldDeep: "var(--gold-700)",
  goldLight: "var(--gold-400)",
  dark: "var(--espresso-900)",
  line: "rgba(0,0,0,.08)",
};

/**
 * Les quatre axes de la maison, dans SA langue de rangement : par note, pas par
 * genre. Les libellés arabes sont ceux du site de la maison — ils situent la
 * marque sans que le visiteur ait à les lire.
 */
const NOTES = [
  { fr: "Oud", ar: "عود", text: "Le bois qui fait la signature du Golfe — fumé, résineux, tenace." },
  { fr: "Musc", ar: "مسك", text: "La ligne Reef Musk : peau propre, poudrée, portée toute la journée." },
  { fr: "Bois", ar: "خشبي", text: "Cèdre et santal, la colonne vertébrale des créations de la maison." },
  { fr: "Vanille", ar: "فانيلا", text: "L'accord gourmand, jamais sucré jusqu'à l'écœurement." },
];

/** Les lignes de la maison, telles qu'elle les nomme sur son propre site. */
const LIGNES = [
  { nom: "Reef Elixir", note: "La ligne haute concentration — les extraits les plus tenaces du catalogue." },
  { nom: "Reef Musk", note: "Muscs blancs et poudrés, la famille qui a fait connaître la maison." },
  { nom: "Princess Reef", note: "Les best-sellers féminins, floraux et fruités." },
  { nom: "Princess Beauty", note: "Brumes et soins parfumés, dans le prolongement des jus." },
];

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

export default function ReefBrandPage() {
  return (
    <main style={{ background: C.page }}>
      {/* ── Hero ────────────────────────────────────────────────────────────
          Image pleine largeur et texte en surimpression. Le voile en dégradé
          n'est pas décoratif : sans lui le texte clair passe sur les zones
          claires du visuel et devient illisible. */}
      <section
        style={{
          position: "relative",
          minHeight: "clamp(380px, 56vh, 560px)",
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
        }}
      >
        <Image
          src="/assets/slider-2-reef-v2.jpg"
          alt="Reef Perfumes"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 40%" }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(21,16,11,.15) 0%, rgba(21,16,11,.45) 55%, rgba(21,16,11,.88) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 1180,
            margin: "0 auto",
            padding: "0 24px 52px",
          }}
        >
          <nav
            aria-label="Fil d'Ariane"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.72)",
              marginBottom: 18,
            }}
          >
            <Link href="/marques" style={{ color: "inherit", textDecoration: "none" }}>
              Les maisons
            </Link>
            <span aria-hidden style={{ margin: "0 8px" }}>
              ·
            </span>
            <span style={{ color: C.goldLight }}>Reef</span>
          </nav>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
              fontWeight: 500,
              color: "#fff",
              margin: "0 0 14px",
              lineHeight: 1.05,
              textWrap: "balance",
            }}
          >
            Reef Perfumes
          </h1>

          {/* La devise de la maison, dans sa langue puis en français : elle dit
              son positionnement mieux qu'une paraphrase. */}
          {/* `dir` sur un <bdi> INTERNE, pas sur le paragraphe : posé sur le
              bloc, il en alignait aussi le contenu à droite et la devise
              partait à l'autre bout du hero, loin du titre qu'elle suit.
              L'isolat porte la direction du texte arabe sans toucher à
              l'alignement, qui reste celui de la page. */}
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.15rem, 2.4vw, 1.6rem)",
              color: C.goldLight,
              margin: "0 0 8px",
            }}
          >
            <bdi lang="ar" dir="rtl">
              بروح خليجية أصيلة
            </bdi>
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(.95rem, 1.6vw, 1.05rem)",
              color: "rgba(255,255,255,.82)",
              margin: 0,
              maxWidth: 560,
              lineHeight: 1.6,
            }}
          >
            « D&apos;un esprit du Golfe authentique » — la devise que la maison porte
            sur toutes ses créations depuis Dubaï.
          </p>

          <ul
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              listStyle: "none",
              margin: "26px 0 0",
              padding: 0,
            }}
          >
            {[
              { k: "Fondée en", v: "2005" },
              { k: "Maison de", v: "Dubaï 🇦🇪" },
              { k: "Catalogue", v: "50+ références" },
            ].map(({ k, v }) => (
              <li
                key={k}
                style={{
                  display: "inline-flex",
                  alignItems: "baseline",
                  gap: 7,
                  background: "rgba(255,255,255,.10)",
                  border: "1px solid rgba(255,255,255,.18)",
                  borderRadius: "var(--r-pill, 999px)",
                  padding: "8px 15px",
                  fontFamily: "var(--font-sans)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.6)",
                  }}
                >
                  {k}
                </span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#fff" }}>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Récit de la maison + film ───────────────────────────────────── */}
      <ReefStorySection />

      {/* ── Les lignes ──────────────────────────────────────────────────── */}
      <section style={{ background: C.cream, padding: "clamp(56px, 8vw, 88px) 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: C.goldDeep,
              margin: "0 0 10px",
            }}
          >
            Les lignes de la maison
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3.6vw, 2.6rem)",
              fontWeight: 500,
              color: C.ink,
              margin: "0 0 34px",
              maxWidth: 620,
              lineHeight: 1.15,
              textWrap: "balance",
            }}
          >
            Quatre collections, une même main
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {LIGNES.map(({ nom, note }) => (
              <article
                key={nom}
                style={{
                  background: C.white,
                  border: `1px solid ${C.line}`,
                  borderRadius: "var(--r-lg, 18px)",
                  padding: "24px 22px",
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: C.ink,
                    margin: "0 0 8px",
                  }}
                >
                  {nom}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 13.5,
                    color: C.muted,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {note}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Le catalogue ────────────────────────────────────────────────── */}
      <section style={{ padding: "clamp(56px, 8vw, 88px) 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: C.goldDeep,
              margin: "0 0 10px",
            }}
          >
            Disponibles chez nous
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3.6vw, 2.6rem)",
              fontWeight: 500,
              color: C.ink,
              margin: "0 0 34px",
              lineHeight: 1.15,
            }}
          >
            Les parfums Reef en stock
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 20,
            }}
          >
            {REEF_PRODUCTS.map((p) => (
              <Link
                key={p.id}
                href={`/produit/${p.slug}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <article
                  style={{
                    background: C.white,
                    border: `1px solid ${C.line}`,
                    borderRadius: "var(--r-lg, 18px)",
                    overflow: "hidden",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "1 / 1.1",
                      background: C.cream,
                    }}
                  >
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 760px) 50vw, 260px"
                      style={{ objectFit: "cover", objectPosition: "center 42%" }}
                    />
                  </div>
                  <div style={{ padding: "16px 18px 20px", flexGrow: 1 }}>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: ".14em",
                        textTransform: "uppercase",
                        color: C.goldDeep,
                        margin: "0 0 6px",
                      }}
                    >
                      {p.brand}
                    </p>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.2rem",
                        fontWeight: 600,
                        color: C.ink,
                        margin: "0 0 6px",
                        lineHeight: 1.2,
                      }}
                    >
                      {p.name}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 12.5,
                        color: C.muted,
                        margin: "0 0 12px",
                      }}
                    >
                      {p.notes}
                    </p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 15,
                          fontWeight: 700,
                          color: C.gold,
                        }}
                      >
                        {fmt(p.price.amount)}
                      </span>
                      {p.compareAtPrice && (
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: 12.5,
                            color: C.muted,
                            textDecoration: "line-through",
                          }}
                        >
                          {fmt(p.compareAtPrice.amount)}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Navigation par note ─────────────────────────────────────────────
          Le rangement de la maison elle-même : par matière, pas par genre. */}
      <section style={{ background: C.dark, padding: "clamp(56px, 8vw, 88px) 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: C.goldLight,
              margin: "0 0 10px",
            }}
          >
            Entrer par la matière
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3.6vw, 2.6rem)",
              fontWeight: 500,
              color: "#fff",
              margin: "0 0 12px",
              lineHeight: 1.15,
            }}
          >
            La maison range ses parfums par note
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14.5,
              color: "rgba(255,255,255,.66)",
              margin: "0 0 34px",
              maxWidth: 560,
              lineHeight: 1.65,
            }}
          >
            Pas par genre, ni par saison : chez Reef on cherche un oud, un musc,
            un bois. C&apos;est la matière qui décide.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: 14,
            }}
          >
            {NOTES.map(({ fr, ar, text }) => (
              <div
                key={fr}
                style={{
                  background: "rgba(255,255,255,.05)",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: "var(--r-lg, 18px)",
                  padding: "22px 20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.3rem",
                      fontWeight: 600,
                      color: "#fff",
                    }}
                  >
                    {fr}
                  </span>
                  <span
                    lang="ar"
                    dir="rtl"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.15rem",
                      color: C.goldLight,
                    }}
                  >
                    {ar}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 13,
                    color: "rgba(255,255,255,.6)",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Retour ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "clamp(44px, 6vw, 64px) 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", textAlign: "center" }}>
          <Link
            href="/marques"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: C.goldDeep,
              textDecoration: "none",
              border: `1px solid ${C.line}`,
              borderRadius: "var(--r-pill, 999px)",
              padding: "13px 26px",
              background: C.white,
            }}
          >
            ← Toutes les maisons
          </Link>
        </div>
      </section>
    </main>
  );
}
