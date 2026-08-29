"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * GridDensity — règle le nombre de produits par ligne sur les pages de
 * collection.
 *
 * Les grilles de catégorie étaient figées en `auto-fill / minmax(200px)` : le
 * navigateur décidait seul, et le visiteur qui voulait balayer vite un
 * catalogue de vingt références n'avait aucun moyen de resserrer, ni celui qui
 * veut regarder un flacon de l'agrandir. Le curseur rend cette décision au
 * visiteur.
 *
 * Le composant ne rend PAS les cartes : il reçoit la grille déjà rendue en
 * `children`. Les pages restent donc des Server Components — seule la barre de
 * réglage et le conteneur de grille sont clients, comme `AddToCart` et
 * `ProductGallery` le font déjà sur la fiche produit.
 *
 * Le maximum n'est pas une constante : il se déduit de la largeur réellement
 * disponible, pour qu'on ne puisse jamais demander six colonnes là où les
 * cartes deviendraient illisibles. C'est aussi ce qui rend le curseur utile
 * sur mobile, où il propose une ou deux colonnes au lieu d'être masqué.
 */

/** En dessous, une carte produit ne montre plus ni le nom ni les deux prix. */
const MIN_CARD_PX = 150;
/** Au-delà, on n'ajoute plus de colonnes : on ferait des vignettes de contact. */
const HARD_MAX_COLS = 6;

function maxColumnsFor(width: number): number {
  if (width <= 0) return HARD_MAX_COLS;
  return Math.max(1, Math.min(HARD_MAX_COLS, Math.floor(width / MIN_CARD_PX)));
}

export default function GridDensity({
  children,
  storageKey,
  gap = 20,
  label = "Par ligne",
  extra,
}: {
  children: React.ReactNode;
  /**
   * Clé de mémorisation du choix. Distincte par page : quelqu'un qui feuillette
   * les huiles en grand ne veut pas forcément la même densité sur les parfums.
   */
  storageKey: string;
  gap?: number;
  label?: string;
  /**
   * Réglage voisin, rendu dans la MÊME barre que le curseur. Deux commandes
   * qui gouvernent la même grille ne doivent pas vivre sur deux lignes : on
   * les lirait comme deux sujets différents. La page catalogue s'en sert pour
   * le nombre de produits par page.
   */
  extra?: React.ReactNode;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [maxCols, setMaxCols] = useState(HARD_MAX_COLS);
  // `null` tant qu'on n'a pas mesuré : rendre une valeur au hasard ferait
  // sauter la grille d'une largeur à l'autre au premier affichage.
  const [cols, setCols] = useState<number | null>(null);

  // Largeur réelle du conteneur plutôt que celle de la fenêtre : la grille vit
  // dans une section bornée à 1240 px avec ses marges, pas en pleine page.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const apply = () => setMaxCols(maxColumnsFor(host.clientWidth));
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  // Choix mémorisé, relu une fois le maximum connu pour ne jamais restaurer
  // une densité que l'écran courant ne peut pas tenir.
  useEffect(() => {
    let saved: number | null = null;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = Number.parseInt(raw, 10);
        if (Number.isFinite(parsed)) saved = parsed;
      }
    } catch {
      // Navigation privée, stockage bloqué : on retombe sur le défaut.
    }
    // Défaut : une colonne de moins que le maximum. La grille respire, et le
    // curseur n'est pas collé à sa butée — sinon on ne voit pas qu'il bouge.
    const fallback = Math.max(1, maxCols - 1);
    setCols(Math.min(maxCols, Math.max(1, saved ?? fallback)));
  }, [maxCols, storageKey]);

  const change = useCallback(
    (next: number) => {
      const clamped = Math.min(maxCols, Math.max(1, next));
      setCols(clamped);
      try {
        window.localStorage.setItem(storageKey, String(clamped));
      } catch {
        // Le réglage reste valable pour la visite en cours.
      }
    },
    [maxCols, storageKey]
  );

  const value = cols ?? maxCols;
  // Un curseur à une seule position ne sert à rien : sur un écran si étroit
  // qu'une seule colonne tient, on rend la grille sans sa commande.
  const usable = maxCols > 1;

  return (
    <div ref={hostRef}>
      {/* La barre survit à la disparition du curseur : sur un écran si étroit
          qu'une seule colonne tient, le curseur n'a plus de sens mais le
          réglage voisin, lui, en garde un. */}
      {(usable || extra) && (
        <div className="dp-dens">
          {extra}
          {usable && <span className="dp-dens-lbl">{label}</span>}
          {/* Icône « écarter » : elle dit le sens du curseur — vers la droite,
              les cartes se resserrent et s'élargit le nombre par ligne. */}
          {usable && (
          <svg
            className="dp-dens-ico"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 3H5a2 2 0 0 0-2 2v4" />
            <path d="M15 3h4a2 2 0 0 1 2 2v4" />
            <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
            <path d="M15 21h4a2 2 0 0 0 2-2v-4" />
          </svg>
          )}
          {usable && (
          <>
          <input
            type="range"
            min={1}
            max={maxCols}
            step={1}
            value={value}
            onChange={(e) => change(Number(e.target.value))}
            className="dp-dens-range"
            aria-label={`${label} — ${value} sur ${maxCols}`}
            // `aria-valuetext` plutôt que le nombre nu : un lecteur d'écran
            // annoncerait « 4 » sans dire de quoi.
            aria-valuetext={`${value} produits par ligne`}
          />
          <span className="dp-dens-val" aria-hidden="true">
            {value}
          </span>
          </>
          )}
        </div>
      )}

      {/* Le nombre de colonnes passe par une variable CSS, jamais par
          `gridTemplateColumns` en inline. `globals.css` porte des sélecteurs
          d'attribut du genre `[style*="repeat(3,"] { … !important }`, écrits
          pour rattraper les grilles à colonnes figées de l'accueil : ils
          captureraient cette grille-ci et la ramèneraient à deux colonnes dès
          980 px, curseur ou pas. Une grille dont le maximum se calcule sur la
          largeur mesurée n'a pas besoin de ce rattrapage — et une valeur qui
          ne s'écrit pas « repeat(N, » dans l'attribut y échappe. */}
      <div className="dp-dens-grid" style={{ "--dp-cols": value, gap } as React.CSSProperties}>
        {children}
      </div>

      {/* Le style d'un `input[type=range]` ne s'écrit pas en inline : piste et
          curseur passent par des pseudo-éléments propres à chaque moteur. */}
      <style>{`
        .dp-dens-grid{display:grid;grid-template-columns:repeat(var(--dp-cols),minmax(0,1fr))}
        .dp-dens{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin:0 0 18px}
        .dp-dens-lbl{font-family:var(--font-sans);font-size:.62rem;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-400)}
        .dp-dens-ico{color:var(--ink-400);flex:none}
        .dp-dens-val{font-family:var(--font-display);font-size:1rem;font-weight:600;color:var(--ink-900);min-width:1ch;text-align:center}
        .dp-dens-range{-webkit-appearance:none;appearance:none;width:104px;height:18px;background:transparent;cursor:pointer;flex:none;margin:0}
        .dp-dens-range::-webkit-slider-runnable-track{height:3px;border-radius:99px;background:var(--line-200,#e4dbcb)}
        .dp-dens-range::-moz-range-track{height:3px;border-radius:99px;background:var(--line-200,#e4dbcb)}
        .dp-dens-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:13px;height:13px;margin-top:-5px;border-radius:50%;background:var(--gold-500);border:none;box-shadow:0 1px 3px rgba(40,30,15,.35)}
        .dp-dens-range::-moz-range-thumb{width:13px;height:13px;border-radius:50%;background:var(--gold-500);border:none;box-shadow:0 1px 3px rgba(40,30,15,.35)}
        .dp-dens-range:focus-visible{outline:2px solid var(--gold-500);outline-offset:3px;border-radius:99px}
        /* Cible tactile : 13 px de pastille se ratent au doigt. On agrandit la
           zone sensible sans agrandir le dessin. */
        @media (hover:none),(pointer:coarse),(max-width:760px){
          .dp-dens-range{height:30px;width:120px}
          .dp-dens-range::-webkit-slider-thumb{width:17px;height:17px;margin-top:-7px}
          .dp-dens-range::-moz-range-thumb{width:17px;height:17px}
        }
      `}</style>
    </div>
  );
}
