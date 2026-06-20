"use client";
import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "promo" | "new" | "dark" | "success";
  position?: "tl" | "tr" | "bl" | "br";
  className?: string;
}

export function Badge({ children, variant = "promo", position = "tl", className = "" }: BadgeProps) {
  const posStyles: Record<string, React.CSSProperties> = {
    tl: { top: 10, left: 10 },
    tr: { top: 10, right: 10 },
    bl: { bottom: 10, left: 10 },
    br: { bottom: 10, right: 10 },
  };
  const variantStyles: Record<string, React.CSSProperties> = {
    promo: { background: "var(--badge-promo-bg, #C8901E)", color: "var(--badge-promo-fg, #fff)" },
    new: { background: "var(--badge-new-bg, #1E3A5F)", color: "var(--badge-new-fg, #fff)" },
    dark: { background: "var(--badge-dark-bg, #15100B)", color: "var(--badge-dark-fg, #FBF6EC)" },
    success: { background: "#4F7A52", color: "#fff" },
  };
  return (
    <span
      style={{
        position: "absolute",
        ...posStyles[position],
        ...variantStyles[variant],
        fontFamily: "var(--font-sans)",
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: ".12em",
        textTransform: "uppercase",
        padding: "4px 9px",
        borderRadius: "var(--r-xs)",
        zIndex: 2,
      }}
      className={className}
    >
      {children}
    </span>
  );
}
