"use client";
import { motion } from "framer-motion";

export function GoldDivider({ centered = false }: { centered?: boolean }) {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: centered ? 60 : 40,
        height: 2,
        background: "var(--gold-500)",
        margin: centered ? "20px auto" : "20px 0",
        transformOrigin: "left center",
      }}
    />
  );
}
