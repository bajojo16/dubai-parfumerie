"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { addItem } from "@/lib/cart";
import { QtyStepper } from "@/components/ui/QtyStepper";
import type { ShoppableVideo } from "@/data/shoppable-videos";

export type ShoppableCardLabels = {
  addToCart: string; // CTA repos
  added: string; // feedback après ajout
  soldOut: string; // épuisé
  viewProduct: string; // aria-label lien produit (inclut {name})
  playVideo: string; // aria-label région vidéo (inclut {name})
};

const DEFAULT_LABELS: ShoppableCardLabels = {
  addToCart: "Ajouter au panier",
  added: "Ajouté ✓",
  soldOut: "Épuisé",
  viewProduct: "Voir le produit",
  playVideo: "Vidéo produit",
};

export function ShoppableVideoCard({
  video,
  locale = "fr",
  labels,
}: {
  video: ShoppableVideo;
  locale?: string;
  labels?: Partial<ShoppableCardLabels>;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const { product } = video;
  const available = product.available;

  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [hover, setHover] = useState(false);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fmtPrice = useCallback(
    (n: number) => {
      try {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        }).format(n);
      } catch {
        return `${n} €`;
      }
    },
    [locale]
  );

  // prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // IntersectionObserver — ne lit la vidéo que lorsqu'elle est visible
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio > 0.5),
      { threshold: [0, 0.5, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Play / pause selon visibilité (sauf prefers-reduced-motion → poster fixe)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduceMotion) {
      v.pause();
      return;
    }
    if (!visible) {
      v.pause();
      return;
    }
    // Autoplay mobile (iOS/Android) exige `muted` réellement appliqué côté
    // propriété JS, pas seulement l'attribut HTML — on le force par sécurité.
    v.muted = true;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    // Sur mobile, si les données ne sont pas encore bufferisées au moment du
    // 1er appel, play() échoue silencieusement (promesse rejetée) et la vidéo
    // reste bloquée sur le poster. On retente dès que le navigateur est prêt.
    v.addEventListener("canplay", tryPlay, { once: true });
    return () => v.removeEventListener("canplay", tryPlay);
  }, [visible, reduceMotion]);

  useEffect(() => {
    return () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    };
  }, []);

  const onAdd = useCallback(() => {
    if (!available) return;
    addItem(
      {
        id: product.variantId,
        name: product.name,
        brand: "Dubaï Parfumerie",
        price: product.price,
        image: product.thumbnailUrl,
      },
      qty
    );
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1800);
  }, [available, product, qty]);

  const buttonBg = !available
    ? "#D8D2C6"
    : hover
      ? "linear-gradient(135deg,#D4B264,#B98F3A)"
      : "#C4A24F";

  return (
    <article
      ref={cardRef}
      dir={locale === "ar" ? "rtl" : "ltr"}
      style={{
        flex: "0 0 auto",
        width: "100%",
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 10px 30px rgba(80,60,30,.10)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Vidéo verticale 9:16 */}
      <Link
        href={product.href}
        aria-label={`${L.viewProduct} — ${product.name}`}
        style={{
          position: "relative",
          display: "block",
          // Ratio pilotable par variable : en mobile la carte 9/16 mangeait
          // presque tout l'écran, on la ramène à un portrait court (voir la
          // media query du carrousel). Desktop inchangé via le fallback.
          aspectRatio: "var(--dpsv-ratio, 9 / 16)",
          // Item flex en colonne : `min-height: auto` prendrait la taille
          // intrinsèque de la vidéo (9:16) et annulerait l'aspect-ratio.
          minHeight: 0,
          overflow: "hidden",
          background: "#000",
          textDecoration: "none",
        }}
      >
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.posterUrl}
          muted
          loop
          playsInline
          preload="auto"
          aria-label={`${L.playVideo} — ${product.name}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            display: "block",
          }}
        />
        {!available && (
          <span
            style={{
              position: "absolute",
              top: 12,
              insetInlineStart: 12,
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: "#2C2620",
              background: "rgba(255,255,255,.92)",
              borderRadius: 999,
              padding: "4px 10px",
            }}
          >
            {L.soldOut}
          </span>
        )}
      </Link>

      {/* Vignette produit chevauchante */}
      <div style={{ position: "relative", height: 0 }}>
        <Link
          href={product.href}
          aria-label={`${L.viewProduct} — ${product.name}`}
          style={{
            position: "absolute",
            insetInlineStart: "50%",
            transform:
              "translateX(-50%) translateY(calc(var(--dpsv-thumb, 68px) / -2))",
            width: "var(--dpsv-thumb, 68px)",
            height: "var(--dpsv-thumb, 68px)",
            borderRadius: 12,
            border: "3px solid #fff",
            boxShadow: "0 6px 16px rgba(80,60,30,.18)",
            overflow: "hidden",
            display: "block",
            background: "#FAF6EE",
          }}
        >
          <Image
            src={product.thumbnailUrl}
            alt={product.name}
            width={68}
            height={68}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Link>
      </div>

      {/* Infos produit */}
      <div
        style={{
          paddingTop: "var(--dpsv-info-pt, 40px)",
          paddingInline: "var(--dpsv-info-pi, 12px)",
          paddingBottom: "var(--dpsv-info-pb, 12px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "var(--dpsv-info-gap, 4px)",
        }}
      >
        <Link
          href={product.href}
          aria-label={`${L.viewProduct} — ${product.name}`}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--dpsv-name-fs, 16px)",
            color: "#2C2620",
            textDecoration: "none",
            lineHeight: 1.2,
          }}
        >
          {product.name}
        </Link>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--dpsv-price-fs, 15px)",
            fontWeight: 700,
            lineHeight: "var(--dpsv-tight-lh, normal)",
            color: "#A8801F",
          }}
        >
          {fmtPrice(product.price)}
        </div>

        {available ? (
          <div style={{ marginTop: "var(--dpsv-qty-mt, 12px)" }}>
            <QtyStepper value={qty} onChange={setQty} size="sm" locale={locale} />
          </div>
        ) : (
          /* Réserve exactement la hauteur du stepper pour aligner le bouton
             Épuisé avec les boutons « Ajouter au panier » des cartes voisines */
          <div
            aria-hidden
            style={{
              marginTop: "var(--dpsv-qty-mt, 12px)",
              height: "var(--dpsv-qty-h, 38px)",
            }}
          />
        )}

        <button
          type="button"
          onClick={onAdd}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          disabled={!available}
          aria-label={
            !available
              ? `${L.soldOut} — ${product.name}`
              : `${L.addToCart} — ${product.name}`
          }
          aria-live="polite"
          style={{
            width: "100%",
            marginTop: "var(--dpsv-cta-mt, 12px)",
            minHeight: "var(--dpsv-cta-minh, 0px)",
            border: "none",
            borderRadius: 24,
            padding: "var(--dpsv-cta-py, 9px) 14px",
            background: buttonBg,
            color: "#fff",
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            lineHeight: "var(--dpsv-tight-lh, normal)",
            fontWeight: 700,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            cursor: available ? "pointer" : "not-allowed",
            opacity: available ? 1 : 0.85,
            transition: "background .25s ease",
          }}
        >
          {!available ? L.soldOut : added ? L.added : L.addToCart}
        </button>
      </div>
    </article>
  );
}
