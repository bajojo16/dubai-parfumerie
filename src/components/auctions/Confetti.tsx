"use client";

/**
 * Explosion de confettis « maison » sur un canvas plein écran — pas de
 * dépendance, ~120 particules, 2,2 s, puis le canvas se démonte tout seul.
 * Respecte `prefers-reduced-motion` : dans ce cas rien n'est dessiné (la carte
 * « Remporté » suffit à annoncer la victoire).
 *
 * Or, crème et espresso : la fête reste dans la palette de la maison.
 */

import { useEffect, useRef } from "react";

const COLORS = ["#C8901E", "#E5C06A", "#F6EAC8", "#9C6A1A", "#FBF6EC", "#4F7A52"];
const COUNT = 120;
const DURATION_MS = 2200;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
}

export function Confetti({ onDone }: { onDone?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  // Le rappel de fin est lu par la boucle d'animation (montée une seule fois) :
  // on le garde dans une ref, mise à jour dans un effet, jamais pendant le rendu.
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      done.current?.();
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    // Deux canons, bas gauche et bas droit, qui tirent vers le centre.
    const parts: Particle[] = Array.from({ length: COUNT }, (_, i) => {
      const left = i % 2 === 0;
      const angle = (left ? -60 : -120) * (Math.PI / 180) + (Math.random() - 0.5) * 0.9;
      const speed = 9 + Math.random() * 9;
      return {
        x: left ? W * 0.12 : W * 0.88,
        y: H * 0.92,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: COLORS[i % COLORS.length],
      };
    });

    const start = performance.now();
    let raf = 0;
    const frame = (t: number) => {
      const elapsed = t - start;
      ctx.clearRect(0, 0, W, H);
      const fade = elapsed > DURATION_MS - 500 ? Math.max(0, (DURATION_MS - elapsed) / 500) : 1;
      parts.forEach((p) => {
        p.vy += 0.32; // gravité
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (elapsed < DURATION_MS) raf = requestAnimationFrame(frame);
      else done.current?.();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 1300 }}
    />
  );
}
