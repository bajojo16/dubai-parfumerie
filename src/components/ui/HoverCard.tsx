"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export function HoverCard({
  children,
  style,
  className,
  onClick,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(200,144,30,0.18)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{ cursor: onClick ? "pointer" : "default", ...style }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
