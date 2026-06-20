"use client";
import React, { useState } from "react";
import { Badge } from "./Badge";
import { Button } from "./Button";

interface ProductCardProps {
  image: string;
  name: string;
  brand?: string;
  price: number | string;
  oldPrice?: number | string;
  rating?: number;
  reviewCount?: number;
  badgeText?: string;
  badgeVariant?: "promo" | "new" | "dark" | "success";
  soldCount?: number;
  fourxLabel?: string;
  href?: string;
  onAddToCart?: () => void;
}

function StarRating({ rating, count }: { rating: number; count?: number }) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < Math.floor(rating);
    const partial = !filled && i < rating;
    return (
      <span
        key={i}
        style={{
          color: filled || partial ? "var(--gold-500)" : "var(--ink-500)",
          fontSize: "13px",
          opacity: filled ? 1 : partial ? 0.6 : 0.25,
        }}
      >
        ★
      </span>
    );
  });
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {stars}
      {count != null && (
        <span
          style={{
            marginLeft: 5,
            fontSize: "11px",
            color: "var(--ink-500)",
            fontFamily: "var(--font-sans)",
          }}
        >
          ({count})
        </span>
      )}
    </span>
  );
}

export function ProductCard({
  image,
  name,
  brand,
  price,
  oldPrice,
  rating,
  reviewCount,
  badgeText,
  badgeVariant = "promo",
  soldCount,
  fourxLabel,
  href,
  onAddToCart,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);

  const cardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    background: "var(--surface-white)",
    borderRadius: "var(--r-lg)",
    overflow: "hidden",
    boxShadow: hovered ? "var(--shadow-gold, 0 6px 28px rgba(200,144,30,.18))" : "var(--shadow-md, 0 2px 12px rgba(0,0,0,.07))",
    transform: hovered ? "translateY(-3px)" : "translateY(0)",
    transition: "transform .22s ease, box-shadow .22s ease",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    position: "relative",
  };

  const imagePlateStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    paddingBottom: "100%",
    background: "var(--surface-cream)",
    overflow: "hidden",
  };

  const imgStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform .3s ease",
    transform: hovered ? "scale(1.04)" : "scale(1)",
  };

  const bodyStyle: React.CSSProperties = {
    padding: "14px 16px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flexGrow: 1,
  };

  const Wrapper = href ? "a" : "div";
  const wrapperProps = href ? { href, style: { textDecoration: "none", color: "inherit" } } : {};

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {React.createElement(
        Wrapper,
        wrapperProps as React.HTMLAttributes<HTMLElement>,
        <div style={imagePlateStyle}>
          <img src={image} alt={name} style={imgStyle} loading="lazy" />
          {badgeText && (
            <Badge variant={badgeVariant} position="tl">
              {badgeText}
            </Badge>
          )}
        </div>,
        <div style={bodyStyle}>
          {brand && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--gold-700)",
              }}
            >
              {brand}
            </span>
          )}
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "17px",
              fontWeight: 600,
              color: "var(--ink-900)",
              lineHeight: 1.25,
            }}
          >
            {name}
          </span>
          {rating != null && <StarRating rating={rating} count={reviewCount} />}
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 2 }}>
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--gold-500)",
              }}
            >
              {typeof price === "number" ? `${price.toFixed(2)} €` : price}
            </span>
            {oldPrice != null && (
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--ink-500)",
                  textDecoration: "line-through",
                }}
              >
                {typeof oldPrice === "number" ? `${oldPrice.toFixed(2)} €` : oldPrice}
              </span>
            )}
          </div>
          {soldCount != null && (
            <span style={{ fontSize: "11px", color: "var(--ink-500)" }}>
              Acheté {soldCount} fois
            </span>
          )}
          {fourxLabel && (
            <span
              style={{
                fontSize: "11px",
                color: "var(--gold-700)",
                fontWeight: 600,
              }}
            >
              {fourxLabel}
            </span>
          )}
        </div>
      )}
      <div
        style={{
          padding: "0 16px 16px",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(6px)",
          transition: "opacity .2s, transform .2s",
          pointerEvents: hovered ? "auto" : "none",
        }}
      >
        <Button
          variant="primary"
          size="sm"
          block
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.();
          }}
        >
          Ajouter au panier
        </Button>
      </div>
    </div>
  );
}
