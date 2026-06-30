/**
 * FlaconIcon — fiole de parfum en line-art or (SVG).
 * Utilisée dans le bouton flottant et l'en-tête du modal.
 */
import type { CSSProperties } from "react";

export function FlaconIcon({
  size = 28,
  color = "currentColor",
  style,
}: {
  size?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={style}
    >
      {/* Bouchon */}
      <path d="M10 2.5h4" />
      <path d="M10.5 2.5v2.2M13.5 2.5v2.2" />
      {/* Col */}
      <path d="M10 4.7h4v1.8a1 1 0 0 1-.4.8l-.6.5v1.1M10.4 6.5a1 1 0 0 0 .4.8l.6.5v1.1" />
      {/* Corps du flacon */}
      <path d="M11 9.7c-2.6.5-4.5 2.8-4.5 5.6V18a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3v-2.7c0-2.8-1.9-5.1-4.5-5.6" />
      {/* Liquide / reflet */}
      <path d="M7 15.5c1.6.9 3.2 1.3 5 1.3s3.4-.4 5-1.3" />
      <path d="M9.6 13.2c.5.3 1 .5 1.6.5" opacity={0.7} />
    </svg>
  );
}
