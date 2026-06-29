"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/data/journal-articles";

export type JournalCardLabels = {
  readingTime: string; // "Lecture · {min} min"
  readArticle: string; // "Lire l'article"
};

const DEFAULT_LABELS: JournalCardLabels = {
  readingTime: "Lecture · {min} min",
  readArticle: "Lire l'article",
};

const BRAND_FALLBACK = "#1A140D";

export function JournalCard({
  article,
  featured = false,
  priority = false,
  locale = "fr",
  labels,
}: {
  article: Article;
  featured?: boolean;
  priority?: boolean;
  locale?: string;
  labels?: Partial<JournalCardLabels>;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const isRTL = locale === "ar";
  const arrow = isRTL ? "←" : "→";
  const [hover, setHover] = useState(false);
  const [imgError, setImgError] = useState(false);

  const readingLabel = L.readingTime.replace("{min}", String(article.readingMinutes));
  const titleSize = featured ? "clamp(26px, 4vw, 32px)" : "20px";
  const showExcerpt = featured || hover; // featured: always ; standard: reveal on hover
  const showLink = hover; // desktop reveal ; mobile forced via CSS media query below

  return (
    <Link
      href={article.href}
      aria-label={article.title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        position: "relative",
        display: "block",
        height: "100%",
        width: "100%",
        minHeight: featured ? 420 : 0,
        borderRadius: 16,
        overflow: "hidden",
        textDecoration: "none",
        background: BRAND_FALLBACK,
        color: "#fff",
        isolation: "isolate",
      }}
    >
      {/* Image plein cadre + zoom au survol */}
      {!imgError ? (
        <Image
          className="journal-card__img"
          src={article.coverImage}
          alt=""
          fill
          priority={priority}
          sizes={featured ? "(max-width: 860px) 100vw, 50vw" : "(max-width: 860px) 100vw, 25vw"}
          onError={() => setImgError(true)}
          style={{
            objectFit: "cover",
            transform: hover ? "scale(1.06)" : "scale(1)",
            transition: "transform .6s ease",
          }}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: BRAND_FALLBACK }} aria-hidden />
      )}

      {/* Dégradé sombre bas pour lisibilité */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(transparent, rgba(0,0,0,${hover ? 0.82 : 0.75}))`,
          transition: "background .4s ease",
        }}
      />

      {/* Badge catégorie (haut-début) */}
      <span
        style={{
          position: "absolute",
          top: 16,
          insetInlineStart: 16,
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: "#E8C873",
          background: "#1A140D",
          borderRadius: 6,
          padding: "5px 10px",
        }}
      >
        {article.category}
      </span>

      {/* Contenu superposé, aligné en bas */}
      <div
        style={{
          position: "absolute",
          insetInline: 0,
          bottom: 0,
          padding: featured ? "22px 24px" : "18px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            color: "rgba(255,255,255,.82)",
            letterSpacing: ".02em",
          }}
        >
          {readingLabel}
        </span>

        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: titleSize,
            lineHeight: 1.12,
            color: "#fff",
          }}
        >
          {article.title}
        </h3>

        <p
          className="journal-card__excerpt"
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontSize: featured ? 15 : 13.5,
            lineHeight: 1.5,
            color: "rgba(255,255,255,.88)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            maxHeight: showExcerpt ? 60 : 0,
            opacity: showExcerpt ? 1 : 0,
            transition: "opacity .4s ease, max-height .4s ease",
          }}
        >
          {article.excerpt}
        </p>

        <span
          className="journal-card__link"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: ".04em",
            color: "#E8C873",
            opacity: showLink ? 1 : 0,
            transform: showLink ? "translateY(0)" : "translateY(6px)",
            transition: "opacity .4s ease, transform .4s ease",
          }}
        >
          {L.readArticle} {arrow}
        </span>
      </div>

      {/* Réglages d'accessibilité + mobile : pas de zoom, révélation immédiate */}
      <style>{`
        @media (max-width: 860px) {
          .journal-card__excerpt { max-height: 60px !important; opacity: 1 !important; }
          .journal-card__link { opacity: 1 !important; transform: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .journal-card__excerpt,
          .journal-card__link { transition: none !important; }
          .journal-card__img { transform: none !important; transition: none !important; }
        }
      `}</style>
    </Link>
  );
}
