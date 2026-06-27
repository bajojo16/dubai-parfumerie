"use client";
import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right";
  className?: string;
}

export function RevealOnScroll({ children, delay = 0, direction = "up", className }: RevealProps) {
  // Fallback : si framer/IntersectionObserver ne déclenche pas (Brave, JS bloqué),
  // forcer l'état visible après montage pour ne jamais laisser le contenu invisible.
  const [forced, setForced] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setForced(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 30 : 0,
      x: direction === "left" ? -30 : direction === "right" ? 30 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      animate={forced ? "visible" : undefined}
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
