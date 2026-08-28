"use client";

/**
 * Bouton de lecture de repli, affiché par-dessus le poster quand le navigateur
 * a refusé la lecture automatique (Brave Android, économiseur de données,
 * mode faible consommation) ou quand l'utilisateur a demandé moins d'animations.
 *
 * Sans lui, un refus d'autoplay laisse une vidéo morte : le poster reste, et
 * rien sur un téléphone ne permet de la démarrer — il n'y a pas de survol.
 *
 * `decorative` : rendu en `<span>` au lieu de `<button>` quand le composant hôte
 * EST déjà un bouton (une bulle de story, par exemple) — un bouton dans un
 * bouton n'est pas du HTML valide, et le tap est déjà pris par le parent.
 */
export function VideoPlayFallback({
  label,
  onPlay,
  decorative = false,
  size = 56,
}: {
  /** Libellé accessible — fourni par les `labels` du composant hôte (i18n). */
  label?: string;
  onPlay?: () => void;
  decorative?: boolean;
  size?: number;
}) {
  const glyph = (
    <svg
      width={Math.round(size * 0.36)}
      height={Math.round(size * 0.36)}
      viewBox="0 0 24 24"
      fill="var(--espresso-900, #15100B)"
      aria-hidden="true"
      style={{ marginInlineStart: Math.round(size * 0.05) }}
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );

  const shell: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    insetInlineStart: "50%",
    transform: "translate(-50%, -50%)",
    width: size,
    height: size,
    borderRadius: "50%",
    border: "none",
    background: "rgba(253, 251, 246, 0.92)",
    boxShadow: "0 6px 18px rgba(21, 16, 11, 0.28)",
    display: "grid",
    placeItems: "center",
    zIndex: 2,
  };

  if (decorative) {
    return (
      <span data-dp-play-fallback aria-hidden="true" style={{ ...shell, pointerEvents: "none" }}>
        {glyph}
      </span>
    );
  }

  return (
    <button
      type="button"
      data-dp-play-fallback
      aria-label={label}
      onClick={(e) => {
        // La vignette est souvent enveloppée dans un lien produit : le tap doit
        // lancer la vidéo, pas naviguer.
        e.preventDefault();
        e.stopPropagation();
        onPlay?.();
      }}
      style={{ ...shell, cursor: "pointer" }}
    >
      {glyph}
    </button>
  );
}
