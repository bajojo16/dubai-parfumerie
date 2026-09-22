"use client";

import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import Image from "next/image";
import type { ReviewWithMedia } from "@/data/review-media";
import type { Product } from "@/data/product-details";
import { SEASON_LABEL } from "@/data/product-content";
import {
  REVIEW_CRITERIA_LABEL,
  REVIEW_CRITERIA_ORDER,
  reviewSummaryFor,
  reviewsFor,
  type ProductReview,
  type ProductReviewSummary,
  type ReviewCriteria,
  type ReviewScore,
} from "@/data/product-reviews";
import { GOLD_GRADIENT } from "./AddToCart";

/**
 * ProductReviews — la section « Avis clients » de la fiche, portée par la
 * preuve sociale : résumé chiffré (histogramme, critères votés), mots-clés qui
 * filtrent, avis en photo, cartes filtrables et triables, formulaire de dépôt.
 *
 * Client Component parce que tout le bloc est un état de filtre : une note
 * cliquée dans l'histogramme, un mot-clé, « Avec photo »… Le rendu serveur
 * reste complet (tous les filtres à « Tous »), l'interactivité s'hydrate ensuite.
 *
 * Dégradation volontaire : une fiche sans avis rédigés (`reviewsFor` vide) ne
 * montre que l'en-tête chiffré, les bulles média et le bouton « Rédiger un
 * avis ». Pas d'histogramme fabriqué : une distribution inventée à partir de
 * zéro avis serait un mensonge visuel, pire qu'une absence.
 */

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Nombre de cartes avant le bouton « Voir plus d'avis ». */
const PAGE_SIZE = 6;

/** Durée d'affichage du toast de confirmation. */
const TOAST_MS = 3000;

const SCORES: ReviewScore[] = [5, 4, 3, 2, 1];

const SKIN_LABEL: Record<NonNullable<ProductReview["skin"]>, string> = {
  sèche: "Sèche",
  mixte: "Mixte",
  grasse: "Grasse",
};

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const scoreFmt = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Copie locale du helper de `page.tsx` : la page ne l'exporte pas. */
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

/**
 * « 2025-06-12 » → « 12 juin 2025 ». On reconstruit la date en local plutôt
 * que `new Date(iso)` : une chaîne AAAA-MM-JJ est lue en UTC et glisserait au
 * jour précédent dans les fuseaux négatifs.
 */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return dateFmt.format(new Date(y, m - 1, d));
}

/** Minuscules sans accents, pour une recherche de mot-clé indulgente. */
function fold(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/**
 * Résumé recalculé depuis les avis, quand la fiche n'en déclare pas : pas de
 * mots-clés (on n'en devine pas), le reste se déduit honnêtement des cartes.
 */
function summaryFromReviews(reviews: ProductReview[]): ProductReviewSummary {
  const distribution: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  for (const r of reviews) distribution[5 - r.rating] += 1;

  const recommend = reviews.filter((r) => r.rating >= 4).length;
  const withCriteria = reviews.filter((r): r is ProductReview & { criteria: ReviewCriteria } => !!r.criteria);
  const avg = (key: keyof ReviewCriteria) =>
    withCriteria.length ? withCriteria.reduce((s, r) => s + r.criteria[key], 0) / withCriteria.length : 0;

  return {
    distribution,
    recommendPct: reviews.length ? Math.round((recommend / reviews.length) * 100) : 0,
    keywords: [],
    criteria: { longevity: avg("longevity"), sillage: avg("sillage"), value: avg("value"), accuracy: avg("accuracy") },
  };
}

// ─── Styles partagés ──────────────────────────────────────────────────────────

const h2Style: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "var(--t-title)",
  fontWeight: 600,
  color: "var(--ink-900)",
  margin: 0,
};

const cardStyle: CSSProperties = {
  background: "var(--surface-white)",
  borderRadius: "var(--r-lg)",
  padding: "1.5rem",
  boxShadow: "var(--shadow-sm)",
  border: "1px solid var(--line-100)",
};

const pillBase: CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "var(--t-xs)",
  fontWeight: "var(--fw-medium)",
  letterSpacing: "var(--ls-wide)",
  padding: "0.4rem 0.8rem",
  borderRadius: "var(--r-pill)",
  border: "1px solid var(--line-200)",
  background: "var(--surface-white)",
  color: "var(--ink-700)",
  cursor: "pointer",
  transition: "border-color 0.15s, background 0.15s",
};

const pillActive: CSSProperties = {
  ...pillBase,
  background: "var(--gold-100)",
  borderColor: "var(--gold-500)",
  color: "var(--espresso-900)",
};

const goldButton: CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "var(--t-sm)",
  fontWeight: "var(--fw-semibold)",
  letterSpacing: "var(--ls-wide)",
  padding: "0.75rem 1.5rem",
  borderRadius: "var(--r-sm)",
  border: "none",
  background: GOLD_GRADIENT,
  color: "var(--espresso-900)",
  cursor: "pointer",
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "var(--font-sans)",
  fontSize: "var(--t-sm)",
  color: "var(--ink-900)",
  padding: "0.6rem 0.75rem",
  border: "1px solid var(--line-200)",
  borderRadius: "var(--r-sm)",
  background: "var(--surface-white)",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontFamily: "var(--font-sans)",
  fontSize: "var(--t-xs)",
  fontWeight: "var(--fw-medium)",
  letterSpacing: "var(--ls-wide)",
  textTransform: "uppercase",
  color: "var(--ink-500)",
  marginBottom: "0.35rem",
};

// ─── Composant ────────────────────────────────────────────────────────────────

type SortKey = "recent" | "helpful";

export default function ProductReviews({
  slug,
  product,
  locale,
  mediaReviews,
}: {
  slug: string;
  product: Product;
  locale: string;
  /** Déjà calculé par la page via `reviewMediaForProduct(slug)`. */
  mediaReviews: ReviewWithMedia[];
}) {
  // Sources : constantes pour un slug donné, donc pas d'état.
  const reviews = useMemo(() => reviewsFor(slug), [slug]);
  const summary = useMemo(
    () => reviewSummaryFor(slug) ?? (reviews.length ? summaryFromReviews(reviews) : undefined),
    [slug, reviews],
  );

  // Filtres / tri / pagination.
  const [ratingFilter, setRatingFilter] = useState<ReviewScore | null>(null);
  const [onlyPhoto, setOnlyPhoto] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [keyword, setKeyword] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("recent");
  const [visible, setVisible] = useState(PAGE_SIZE);

  // « Utile » : un clic par avis, compté localement (maquette, rien n'est envoyé).
  const [voted, setVoted] = useState<Record<string, true>>({});

  // Formulaire de dépôt.
  const [formOpen, setFormOpen] = useState(false);
  const [formRating, setFormRating] = useState<ReviewScore | 0>(0);
  const [formTitle, setFormTitle] = useState("");
  const [formText, setFormText] = useState("");
  const [formBought, setFormBought] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), TOAST_MS);
    return () => window.clearTimeout(t);
  }, [toast]);

  const isAll = ratingFilter === null && !onlyPhoto && !onlyVerified && keyword === null;

  const resetFilters = () => {
    setRatingFilter(null);
    setOnlyPhoto(false);
    setOnlyVerified(false);
    setKeyword(null);
    setVisible(PAGE_SIZE);
  };

  // Tout changement de filtre repart de la première page : sinon un « Voir
  // plus » déplié sur « Tous » resterait déplié sur un filtre à deux cartes.
  const toggleRating = (score: ReviewScore) => {
    setRatingFilter((cur) => (cur === score ? null : score));
    setVisible(PAGE_SIZE);
  };
  const toggleKeyword = (word: string) => {
    setKeyword((cur) => (cur === word ? null : word));
    setVisible(PAGE_SIZE);
  };

  const filtered = useMemo(() => {
    const kw = keyword ? fold(keyword) : null;
    const list = reviews.filter(
      (r) =>
        (ratingFilter === null || r.rating === ratingFilter) &&
        (!onlyPhoto || !!r.photo) &&
        (!onlyVerified || r.verified) &&
        (kw === null || fold(r.text).includes(kw)),
    );
    // Tri sur le compteur d'origine, pas sur le compteur voté : une carte qui
    // changerait de place sous le doigt au clic « Utile » serait déroutante.
    return [...list].sort((a, b) =>
      sort === "recent" ? b.date.localeCompare(a.date) : b.helpful - a.helpful,
    );
  }, [reviews, ratingFilter, onlyPhoto, onlyVerified, keyword, sort]);

  const shown = filtered.slice(0, visible);
  const withPhoto = reviews.filter((r): r is ProductReview & { photo: string } => !!r.photo);
  const totalVotes = summary ? summary.distribution.reduce((s, n) => s + n, 0) : 0;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // MAQUETTE : aucun envoi réseau. En production, POST vers le back-office
    // de modération ; ici on confirme et on referme.
    setToast("Merci ! Votre avis sera publié après relecture.");
    setFormOpen(false);
    setFormRating(0);
    setFormTitle("");
    setFormText("");
    setFormBought(false);
  };

  // JSON-LD : les avis rédigés, en `Review` ; l'`aggregateRating` vit déjà sur
  // le `Product` de la page, on ne le répète pas ici.
  const jsonLd = reviews.length
    ? JSON.stringify(
        reviews.map((r) => ({
          "@context": "https://schema.org",
          "@type": "Review",
          author: { "@type": "Person", name: r.author },
          datePublished: r.date,
          ...(r.title ? { name: r.title } : {}),
          reviewBody: r.text,
          reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
        })),
      )
    : null;

  // ── Blocs réutilisés dans les deux branches (avec / sans avis) ──

  const header = (
    <div className="dp-rev-head">
      <h2 id="reviews-heading" style={h2Style}>
        Avis clients
      </h2>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {renderStars(product.rating, 14)}
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--t-sm)", color: "var(--ink-500)" }}>
          {scoreFmt.format(product.rating)} / 5 · {product.reviews} avis
        </span>
      </div>
    </div>
  );

  const writeBlock = (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <button
          type="button"
          className="dp-rev-gold"
          style={goldButton}
          onClick={() => setFormOpen((o) => !o)}
          aria-expanded={formOpen}
          aria-controls="dp-rev-form"
        >
          Rédiger un avis
        </button>
        {toast && (
          <span
            role="status"
            style={{
              padding: "0.4rem 0.75rem",
              borderRadius: "var(--r-sm)",
              background: "var(--espresso-900)",
              color: "var(--gold-100)",
              fontFamily: "var(--font-sans)",
              fontSize: "var(--t-xs)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {toast}
          </span>
        )}
      </div>

      {formOpen && (
        <form
          id="dp-rev-form"
          onSubmit={handleSubmit}
          style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "640px" }}
        >
          <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
            <legend style={labelStyle}>Votre note</legend>
            <div style={{ display: "inline-flex", gap: "2px" }} role="group" aria-label="Note sur 5">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  className="dp-rev-star"
                  onClick={() => setFormRating(i as ReviewScore)}
                  aria-label={`${i} étoile${i > 1 ? "s" : ""}`}
                  aria-pressed={formRating === i}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0 2px",
                    cursor: "pointer",
                    fontSize: "26px",
                    lineHeight: 1,
                    color: i <= formRating ? "var(--star)" : "var(--star-empty)",
                  }}
                >
                  <span aria-hidden="true">★</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="dp-rev-title" style={labelStyle}>
              Titre
            </label>
            <input
              id="dp-rev-title"
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="En quelques mots"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="dp-rev-text" style={labelStyle}>
              Votre avis
            </label>
            <textarea
              id="dp-rev-text"
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              required
              rows={4}
              placeholder="Tenue, sillage, occasions, ce que vous en pensez…"
              style={{ ...inputStyle, resize: "vertical", lineHeight: "var(--lh-normal)" }}
            />
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "var(--font-sans)",
              fontSize: "var(--t-sm)",
              color: "var(--ink-700)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={formBought}
              onChange={(e) => setFormBought(e.target.checked)}
              style={{ accentColor: "var(--gold-500)" }}
            />
            J&apos;ai acheté ce parfum sur Dubaï Parfumerie
          </label>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button
              type="submit"
              className="dp-rev-gold"
              style={goldButton}
              disabled={formRating === 0}
            >
              Envoyer
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              style={{
                ...pillBase,
                fontSize: "var(--t-sm)",
                letterSpacing: "var(--ls-normal)",
                padding: "0.7rem 1.1rem",
                borderRadius: "var(--r-sm)",
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );

  // « Les avis en images » (bulles + lien vers le mur des éloges) a été retiré
  // le 22/09/2026 : la rangée « Avis avec photos » ci-dessus montre déjà les
  // photos clients de CETTE fiche, deux rangées de vignettes disaient la même
  // chose. `mediaReviews` reste accepté pour ne pas casser l'appelant.
  void mediaReviews;
  void locale;
  const bubbles = null;

  // ── Branche dégradée : aucun avis rédigé pour cette fiche ──
  if (reviews.length === 0 || !summary) {
    return (
      <section aria-labelledby="reviews-heading" className="dp-rev">
        {header}
        {writeBlock}
        {bubbles}
        <style>{CSS}</style>
      </section>
    );
  }

  return (
    <section aria-labelledby="reviews-heading" className="dp-rev">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}

      {header}

      {/* ── Résumé des avis ── */}
      <div style={cardStyle}>
        <div className="dp-rev-summary">
          {/* (i) Note globale */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", justifyContent: "center" }}>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontSize: "3rem",
                lineHeight: "var(--lh-tight)",
                fontWeight: 600,
                color: "var(--ink-900)",
              }}
            >
              {scoreFmt.format(product.rating)}
              <span style={{ fontSize: "var(--t-body)", color: "var(--ink-400)", fontFamily: "var(--font-sans)", marginLeft: "0.35rem" }}>
                / 5
              </span>
            </p>
            {renderStars(product.rating, 18)}
            <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "var(--t-sm)", color: "var(--ink-500)" }}>
              {product.reviews} avis vérifiés · {summary.recommendPct} % recommandent
            </p>
          </div>

          {/* (ii) Histogramme — chaque ligne filtre sur sa note */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }} aria-label="Répartition des notes">
            {SCORES.map((score, idx) => {
              const n = summary.distribution[idx];
              const pct = totalVotes ? Math.round((n / totalVotes) * 100) : 0;
              const active = ratingFilter === score;
              return (
                <button
                  key={score}
                  type="button"
                  className="dp-rev-bar"
                  onClick={() => toggleRating(score)}
                  aria-pressed={active}
                  aria-label={`${score} étoiles : ${pct} % des avis. Filtrer sur cette note`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2.2rem 1fr 2.6rem",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.3rem 0.5rem",
                    background: active ? "var(--gold-100)" : "transparent",
                    border: `1px solid ${active ? "var(--gold-500)" : "transparent"}`,
                    borderRadius: "var(--r-sm)",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--t-xs)",
                    color: "var(--ink-700)",
                    textAlign: "left",
                  }}
                >
                  <span style={{ whiteSpace: "nowrap" }}>
                    {score} <span style={{ color: "var(--star)" }} aria-hidden="true">★</span>
                  </span>
                  <span style={{ height: "6px", background: "var(--line-100)", borderRadius: "var(--r-pill)", overflow: "hidden" }}>
                    <span
                      style={{
                        display: "block",
                        height: "100%",
                        width: `${pct}%`,
                        background: "var(--gold-500)",
                        borderRadius: "var(--r-pill)",
                      }}
                    />
                  </span>
                  <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{pct} %</span>
                </button>
              );
            })}
          </div>

          {/* (iii) Critères votés */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            {REVIEW_CRITERIA_ORDER.map((key) => {
              const v = summary.criteria[key];
              return (
                <div
                  key={key}
                  style={{ display: "grid", gridTemplateColumns: "1fr 3.2rem", alignItems: "center", gap: "0.6rem" }}
                  aria-label={`${REVIEW_CRITERIA_LABEL[key]} : ${scoreFmt.format(v)} sur 5`}
                >
                  <div>
                    <p style={{ margin: "0 0 0.3rem", fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", color: "var(--ink-700)" }}>
                      {REVIEW_CRITERIA_LABEL[key]}
                    </p>
                    <div style={{ height: "6px", background: "var(--line-100)", borderRadius: "var(--r-pill)", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${(v / 5) * 100}%`,
                          background: "var(--gold-500)",
                          borderRadius: "var(--r-pill)",
                        }}
                      />
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "var(--t-sm)",
                      fontWeight: "var(--fw-semibold)",
                      color: "var(--ink-900)",
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {scoreFmt.format(v)}
                    <span style={{ fontWeight: "var(--fw-regular)", color: "var(--ink-400)" }}>/5</span>
                  </span>
                </div>
              );
            })}
            <p style={{ margin: "0.2rem 0 0", fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", color: "var(--ink-400)" }}>
              votées par les clients
            </p>
          </div>
        </div>
      </div>

      {/* Nuage de mots-clés */}
      {summary.keywords.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", color: "var(--ink-400)", marginRight: "0.25rem" }}>
            Ce qui revient :
          </span>
          {summary.keywords.map((word) => {
            const active = keyword === word;
            return (
              <button
                key={word}
                type="button"
                className="dp-rev-pill"
                onClick={() => toggleKeyword(word)}
                aria-pressed={active}
                style={active ? pillActive : pillBase}
              >
                {word}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Avis avec photos ── */}
      {withPhoto.length > 0 && (
        <div>
          <p style={{ margin: "0 0 0.75rem", fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", fontWeight: "var(--fw-medium)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--ink-500)" }}>
            Avis avec photos
          </p>
          <div className="dp-rev-photos">
            {withPhoto.map((r) => (
              <figure key={r.id} style={{ margin: 0, width: "96px", flex: "0 0 auto", scrollSnapAlign: "start" }}>
                <div
                  style={{
                    position: "relative",
                    width: "96px",
                    height: "128px",
                    borderRadius: "var(--r-md)",
                    overflow: "hidden",
                    background: "var(--surface-image)",
                    border: "1px solid var(--line-100)",
                  }}
                >
                  <Image
                    src={r.photo}
                    alt={`Photo de ${product.name} envoyée par ${r.author}`}
                    fill
                    sizes="96px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <figcaption style={{ marginTop: "0.4rem", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", color: "var(--ink-700)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {r.author}
                  </span>
                  {renderStars(r.rating, 10)}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      {/* ── Barre de filtres ── */}
      <div className="dp-rev-filters">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }} role="group" aria-label="Filtrer les avis">
          <button type="button" className="dp-rev-pill" onClick={resetFilters} aria-pressed={isAll} style={isAll ? pillActive : pillBase}>
            Tous
          </button>
          {([5, 4] as ReviewScore[]).map((score) => (
            <button
              key={score}
              type="button"
              className="dp-rev-pill"
              onClick={() => toggleRating(score)}
              aria-pressed={ratingFilter === score}
              aria-label={`${score} étoiles`}
              style={ratingFilter === score ? pillActive : pillBase}
            >
              {score} <span aria-hidden="true">★</span>
            </button>
          ))}
          <button
            type="button"
            className="dp-rev-pill"
            onClick={() => { setOnlyPhoto((v) => !v); setVisible(PAGE_SIZE); }}
            aria-pressed={onlyPhoto}
            style={onlyPhoto ? pillActive : pillBase}
          >
            Avec photo
          </button>
          <button
            type="button"
            className="dp-rev-pill"
            onClick={() => { setOnlyVerified((v) => !v); setVisible(PAGE_SIZE); }}
            aria-pressed={onlyVerified}
            style={onlyVerified ? pillActive : pillBase}
          >
            Achat vérifié
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", color: "var(--ink-400)" }}>
            {filtered.length} avis affiché{filtered.length > 1 ? "s" : ""}
          </span>
          <div style={{ display: "inline-flex", gap: "0.25rem" }} role="group" aria-label="Trier les avis">
            {(
              [
                ["recent", "Plus récents"],
                ["helpful", "Plus utiles"],
              ] as [SortKey, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className="dp-rev-sort"
                onClick={() => setSort(key)}
                aria-pressed={sort === key}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--t-xs)",
                  fontWeight: sort === key ? "var(--fw-semibold)" : "var(--fw-regular)",
                  color: sort === key ? "var(--espresso-900)" : "var(--ink-500)",
                  background: "none",
                  border: "none",
                  borderBottom: `1px solid ${sort === key ? "var(--gold-500)" : "transparent"}`,
                  padding: "0.25rem 0.1rem",
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Cartes ── */}
      {shown.length > 0 ? (
        <div className="dp-rev-grid">
          {shown.map((r) => {
            const hasVoted = !!voted[r.id];
            return (
              <article key={r.id} style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div>
                    <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontWeight: "var(--fw-semibold)", fontSize: "var(--t-body)", color: "var(--ink-900)" }}>
                      {r.author}
                    </p>
                    <p style={{ margin: 0, fontSize: "var(--t-xs)", color: "var(--ink-400)" }}>
                      {r.city} · <time dateTime={r.date}>{formatDate(r.date)}</time>
                    </p>
                  </div>
                  {renderStars(r.rating, 13)}
                </header>

                {r.title && (
                  <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontWeight: "var(--fw-semibold)", fontSize: "var(--t-sm)", color: "var(--ink-900)" }}>
                    {r.title}
                  </p>
                )}

                <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "var(--t-sm)", lineHeight: "var(--lh-relaxed)", color: "var(--ink-700)" }}>
                  {r.text}
                </p>

                {(r.skin || r.season) && (
                  <p style={{ margin: 0, fontSize: "var(--t-xs)", color: "var(--ink-500)" }}>
                    {[r.skin && `Peau : ${SKIN_LABEL[r.skin]}`, r.season && `Saison : ${SEASON_LABEL[r.season]}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}

                {r.criteria && (
                  <p style={{ margin: 0, fontSize: "var(--t-xs)", color: "var(--ink-500)", display: "flex", flexWrap: "wrap", gap: "0.25rem 0.5rem" }}>
                    {REVIEW_CRITERIA_ORDER.map((key, i) => (
                      <span key={key}>
                        {i > 0 && <span aria-hidden="true" style={{ marginRight: "0.5rem" }}>·</span>}
                        {REVIEW_CRITERIA_LABEL[key]}{" "}
                        <strong style={{ fontWeight: "var(--fw-semibold)", color: "var(--ink-700)" }}>{r.criteria?.[key]}/5</strong>
                      </span>
                    ))}
                  </p>
                )}

                <footer style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  {r.verified ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "var(--t-xs)", color: "var(--success)", fontWeight: "var(--fw-medium)" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Achat vérifié
                    </span>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    className="dp-rev-helpful"
                    onClick={() => setVoted((v) => ({ ...v, [r.id]: true }))}
                    disabled={hasVoted}
                    aria-pressed={hasVoted}
                    style={{
                      ...pillBase,
                      letterSpacing: "var(--ls-normal)",
                      padding: "0.3rem 0.7rem",
                      cursor: hasVoted ? "default" : "pointer",
                      color: hasVoted ? "var(--gold-700)" : "var(--ink-700)",
                      borderColor: hasVoted ? "var(--gold-300)" : "var(--line-200)",
                    }}
                  >
                    {hasVoted ? "Merci" : "Utile"} ({r.helpful + (hasVoted ? 1 : 0)})
                  </button>
                </footer>
              </article>
            );
          })}
        </div>
      ) : (
        <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "var(--t-sm)", color: "var(--ink-500)" }}>
          Aucun avis ne correspond à ces filtres.{" "}
          <button
            type="button"
            onClick={resetFilters}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--gold-700)", fontFamily: "inherit", fontSize: "inherit", textDecoration: "underline" }}
          >
            Tout afficher
          </button>
        </p>
      )}

      {filtered.length > visible && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            className="dp-rev-pill"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            style={{ ...pillBase, fontSize: "var(--t-sm)", letterSpacing: "var(--ls-normal)", padding: "0.7rem 1.4rem" }}
          >
            Voir plus d&apos;avis ({filtered.length - visible})
          </button>
        </div>
      )}

      {writeBlock}

      {/* Les avis en images restent au PIED de la section, comme avant : les
          bulles sont propres au produit ouvert et ferment la preuve sociale. */}
      {bubbles}

      <style>{CSS}</style>
    </section>
  );
}

// ─── CSS local ────────────────────────────────────────────────────────────────
// Grilles responsives et états hover/focus : impossibles en style inline.

const CSS = `
.dp-rev { display: flex; flex-direction: column; gap: 1.75rem; }
.dp-rev-head { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.dp-rev-summary { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.1fr) minmax(0, 1.1fr); gap: 2rem; align-items: start; }
.dp-rev-photos { display: flex; gap: 0.75rem; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 0.25rem; -webkit-overflow-scrolling: touch; }
.dp-rev-filters { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
.dp-rev-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.25rem; }
.dp-rev-pill:hover, .dp-rev-bar:hover, .dp-rev-helpful:not(:disabled):hover { border-color: var(--gold-300) !important; }
.dp-rev-gold:hover:not(:disabled) { filter: brightness(1.05); }
.dp-rev-gold:disabled { opacity: 0.55; cursor: not-allowed; }
.dp-rev-star:hover { transform: scale(1.1); }
.dp-rev-pill:focus-visible, .dp-rev-bar:focus-visible, .dp-rev-sort:focus-visible, .dp-rev-helpful:focus-visible, .dp-rev-gold:focus-visible, .dp-rev-star:focus-visible { outline: 2px solid var(--gold-500); outline-offset: 2px; }
@media (max-width: 980px) {
  .dp-rev-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 900px) {
  .dp-rev-summary { grid-template-columns: 1fr; gap: 1.5rem; }
}
@media (max-width: 640px) {
  .dp-rev-grid { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .dp-rev-pill, .dp-rev-star { transition: none !important; transform: none !important; }
}
`;
