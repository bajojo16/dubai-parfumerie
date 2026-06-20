"use client";
import React from "react";

type ButtonVariant = "primary" | "dark" | "outline" | "outline-gold" | "ghost";
type ButtonSize = "sm" | "md" | "lg";
type ButtonAs = "button" | "a";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement & HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  onDark?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  as?: ButtonAs;
  href?: string;
  children?: React.ReactNode;
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { fontSize: "12px", padding: "7px 16px", gap: "6px", borderRadius: "var(--r-sm)" },
  md: { fontSize: "14px", padding: "11px 24px", gap: "8px", borderRadius: "var(--r-md)" },
  lg: { fontSize: "16px", padding: "14px 32px", gap: "10px", borderRadius: "var(--r-md)" },
};

function getVariantStyles(variant: ButtonVariant, onDark: boolean): React.CSSProperties {
  switch (variant) {
    case "primary":
      return {
        background: "var(--gold-500)",
        color: "#fff",
        border: "1.5px solid var(--gold-500)",
      };
    case "dark":
      return {
        background: "var(--espresso-900)",
        color: "var(--on-dark-strong)",
        border: "1.5px solid var(--espresso-900)",
      };
    case "outline":
      return {
        background: "transparent",
        color: onDark ? "var(--on-dark-strong)" : "var(--ink-900)",
        border: onDark ? "1.5px solid var(--on-dark)" : "1.5px solid var(--ink-900)",
      };
    case "outline-gold":
      return {
        background: "transparent",
        color: "var(--gold-500)",
        border: "1.5px solid var(--gold-500)",
      };
    case "ghost":
      return {
        background: "transparent",
        color: onDark ? "var(--on-dark)" : "var(--ink-500)",
        border: "1.5px solid transparent",
      };
  }
}

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  onDark = false,
  icon,
  iconRight,
  as: Tag = "button",
  href,
  children,
  style,
  ...rest
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: block ? "flex" : "inline-flex",
    width: block ? "100%" : undefined,
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-sans)",
    fontWeight: 600,
    letterSpacing: ".06em",
    textTransform: "uppercase",
    cursor: "pointer",
    textDecoration: "none",
    transition: "opacity .18s, box-shadow .18s, transform .15s",
    userSelect: "none",
    outline: "none",
    ...sizeStyles[size],
    ...getVariantStyles(variant, onDark),
    ...style,
  };

  const props = {
    style: baseStyle,
    href: Tag === "a" ? href : undefined,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      (e.currentTarget as HTMLElement).style.opacity = "0.85";
      (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      (e.currentTarget as HTMLElement).style.opacity = "1";
      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
    },
    ...rest,
  };

  return React.createElement(
    Tag,
    props as React.HTMLAttributes<HTMLElement>,
    icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>,
    children,
    iconRight && <span style={{ display: "flex", alignItems: "center" }}>{iconRight}</span>
  );
}
