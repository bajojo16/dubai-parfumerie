"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Galerie de la fiche produit — image principale + vignettes cliquables.
 *
 * Isolée en composant client parce qu'elle est le seul morceau de la fiche qui
 * a besoin d'état (la vignette sélectionnée) : la page reste un Server Component,
 * comme `AddToCart` et `VolumeSelector` le font déjà pour leurs propres états.
 *
 * Dégradation : la bande de vignettes n'existe que si le produit a réellement
 * plusieurs visuels. Avec une seule image — le cas de l'immense majorité du
 * catalogue — on rend juste le cadre principal, sans strip vide ni vignette
 * unique qui laisserait croire qu'il y a autre chose à voir.
 */
export default function ProductGallery({
  images,
  productName,
  brand,
}: {
  images: string[];
  productName: string;
  brand: string;
}) {
  const [active, setActive] = useState(0);

  // Garde-fou : un index hors bornes (images qui changent) retomberait sur `undefined`
  // et casserait `next/image`, dont `src` est obligatoire.
  const src = images[active] ?? images[0];
  const hasThumbs = images.length > 1;

  if (!src) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Image principale */}
      <div
        style={{
          position: "relative",
          borderRadius: "var(--r-lg)",
          overflow: "hidden",
          background: "var(--surface-cream)",
          boxShadow: "var(--shadow-md)",
          aspectRatio: "4/5",
        }}
      >
        <Image
          key={src}
          src={src}
          alt={`${productName} — ${brand}`}
          fill
          style={{ objectFit: "cover" }}
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {hasThumbs && (
        <div
          role="group"
          aria-label={`Visuels de ${productName}`}
          style={{
            display: "grid",
            // `auto-fill` plutôt qu'un nombre fixe de colonnes : la bande encaisse
            // 4 comme 6 visuels sans qu'on ait à câbler le compte en dur.
            gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
            gap: "0.625rem",
          }}
        >
          {images.map((thumb, i) => {
            const isActive = i === active;
            return (
              <button
                key={thumb}
                type="button"
                className="dp-gallery-thumb"
                onClick={() => setActive(i)}
                aria-label={`Voir le visuel ${i + 1} sur ${images.length} de ${productName}`}
                aria-current={isActive ? "true" : undefined}
                style={{
                  position: "relative",
                  padding: 0,
                  borderRadius: "var(--r-md)",
                  overflow: "hidden",
                  background: "var(--surface-cream)",
                  border: isActive ? "2px solid var(--gold-500)" : "2px solid var(--line-100)",
                  cursor: "pointer",
                  aspectRatio: "1/1",
                  transition: "border-color var(--dur-fast) var(--ease-out), opacity var(--dur-fast) var(--ease-out)",
                  // La vignette active est « déjà vue » en grand : on l'atténue
                  // légèrement pour que l'œil aille vers les vues restantes.
                  opacity: isActive ? 1 : 0.85,
                }}
              >
                <Image
                  src={thumb}
                  alt=""
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="120px"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Hover / focus : impossibles en style inline, d'où ce <style> local. */}
      <style>{`
        .dp-gallery-thumb:hover { opacity: 1 !important; border-color: var(--gold-300) !important; }
        .dp-gallery-thumb:focus-visible { outline: 2px solid var(--gold-500); outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          .dp-gallery-thumb { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
