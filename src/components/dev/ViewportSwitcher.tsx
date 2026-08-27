"use client";

import { useSyncExternalStore } from "react";

// ─── ViewportSwitcher ─────────────────────────────────────────────────────────
// Outil de maquette : barre flottante permettant de prévisualiser le site en
// mobile / tablette / ordinateur sans redimensionner la fenêtre du navigateur.
//
// Pourquoi seulement en dev : c'est un outil de travail destiné à la relecture
// de la maquette, pas une fonctionnalité produit. On le coupe donc au build
// (`process.env.NODE_ENV`), ce qui permet aussi au bundler de l'éliminer.
//
// LIMITE ASSUMÉE — les media queries : la contrainte est appliquée à un
// conteneur (`.dp-viewport-frame`), pas à la fenêtre. Les `@media` du site
// continuent donc de réagir à la largeur RÉELLE du navigateur, pas à celle du
// cadre. Reproduire fidèlement les breakpoints imposerait une <iframe>, qui
// remonterait tout l'arbre React et casserait la navigation : hors sujet pour
// une maquette. Pour valider un breakpoint, réduire la vraie fenêtre.
// Même raison pour les éléments `position: fixed` du site (bulle WhatsApp,
// modales…) : ils restent ancrés au viewport réel et non au cadre, car ajouter
// un `transform` au cadre pour créer un bloc conteneur les positionnerait par
// rapport à toute la hauteur du document.

/** Clés de persistance : le choix survit aux rechargements pendant la relecture. */
const STORAGE_MODE = "dp_viewport";
const STORAGE_HIDDEN = "dp_viewport_hidden";

const IS_DEV = process.env.NODE_ENV === "development";

type ViewportMode = "mobile" | "tablet" | "desktop";

/** `null` = aucune contrainte : le site occupe toute la largeur disponible. */
const MODES: ReadonlyArray<{ id: ViewportMode; label: string; width: number | null }> = [
  { id: "mobile", label: "Mobile", width: 390 },
  { id: "tablet", label: "Tablette", width: 834 },
  { id: "desktop", label: "Ordinateur", width: null },
];

function isViewportMode(value: string | null): value is ViewportMode {
  return value === "mobile" || value === "tablet" || value === "desktop";
}

// ── Mini-store localStorage ───────────────────────────────────────────────────
// Passer par `useSyncExternalStore` plutôt que par un `useEffect` de lecture :
// React sert d'abord l'instantané serveur (rien de stocké) puis bascule sur
// l'instantané client, donc pas de divergence d'hydratation ET pas de setState
// en cascade dans un effet. Le cache rend `getSnapshot` stable (React compare
// les retours par identité et bouclerait sinon).
const cache = new Map<string, string | null>();
let listeners: Array<() => void> = [];

function subscribe(onChange: () => void) {
  listeners.push(onChange);
  return () => {
    listeners = listeners.filter((l) => l !== onChange);
  };
}

function readStored(key: string): string | null {
  if (!cache.has(key)) {
    try {
      cache.set(key, window.localStorage.getItem(key));
    } catch {
      // Navigation privée / stockage bloqué : l'outil reste utilisable, le
      // choix vaut simplement pour la session en cours.
      cache.set(key, null);
    }
  }
  return cache.get(key) ?? null;
}

function writeStored(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* stockage indisponible : on garde quand même la valeur en mémoire. */
  }
  cache.set(key, value);
  listeners.forEach((l) => l());
}

/** Instantané serveur / hydratation : aucune préférence connue. */
const serverSnapshot = () => null;

// Icônes outline dessinées à la main plutôt qu'importées : trois traits
// suffisent, et ça évite d'ajouter une dépendance d'icônes pour un outil interne.
function ModeIcon({ mode }: { mode: ViewportMode }) {
  const common = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (mode === "mobile") {
    return (
      <svg {...common}>
        <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
        <path d="M10.75 18.5h2.5" />
      </svg>
    );
  }
  if (mode === "tablet") {
    return (
      <svg {...common}>
        <rect x="4.5" y="2.5" width="15" height="19" rx="2.5" />
        <path d="M10.75 18.5h2.5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="2.5" y="4" width="19" height="13" rx="2" />
      <path d="M9 20.5h6M12 17.5v3" />
    </svg>
  );
}

export function ViewportSwitcher() {
  const storedMode = useSyncExternalStore(
    subscribe,
    () => readStored(STORAGE_MODE),
    serverSnapshot,
  );
  const storedHidden = useSyncExternalStore(
    subscribe,
    () => readStored(STORAGE_HIDDEN),
    serverSnapshot,
  );

  const mode: ViewportMode = isViewportMode(storedMode) ? storedMode : "desktop";
  const hidden = storedHidden === "1";

  function close() {
    writeStored(STORAGE_HIDDEN, "1");
    // Fermer, c'est arrêter la simulation : on rend la pleine largeur, sinon
    // le site resterait figé en 390px sans aucun moyen visible de le défaire.
    writeStored(STORAGE_MODE, "desktop");
  }

  if (!IS_DEV) return null;

  const activeWidth = MODES.find((m) => m.id === mode)?.width ?? null;

  return (
    <>
      {/* Contrainte du cadre : injectée en <style> global plutôt qu'en style
          inline, car la cible est le wrapper du layout — un nœud que ce
          composant ne rend pas lui-même. */}
      {!hidden && activeWidth !== null && (
        <style>{`
          body { background: #0B0806; }
          .dp-viewport-frame {
            max-width: ${activeWidth}px;
            margin-inline: auto;
            min-height: 100vh;
            background: var(--surface-page, #FDFBF6);
            border-inline: 1px solid rgba(255,255,255,.14);
            box-shadow: var(--shadow-lg);
            /* Le contenu conçu pour le desktop peut déborder du cadre étroit :
               on coupe horizontalement plutôt que d'ajouter une scrollbar
               parasite à la page entière. */
            overflow-x: hidden;
            /* Dégage la barre flottante du bas de page. */
            padding-block-end: 72px;
            transition: max-width var(--dur, 240ms) var(--ease-out, ease);
          }
        `}</style>
      )}

      {!hidden && (
        <div
          role="group"
          aria-label="Aperçu du site par type d'appareil"
          className="dp-vps"
          style={{
            position: "fixed",
            // Centré en bas : les autres boutons flottants occupent les coins
            // (WhatsApp bas-gauche @88px, FragranceFinder bas-droite @85px,
            // BackToTop bas-droite @24px). Le centre est donc libre.
            insetBlockEnd: 20,
            insetInlineStart: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 2,
            padding: "6px 8px 6px 10px",
            background: "var(--espresso-800, #1E1610)",
            borderRadius: "var(--r-pill, 999px)",
            boxShadow: "var(--shadow-lg)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {MODES.map((m) => {
            const active = m.id === mode;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => writeStored(STORAGE_MODE, m.id)}
                aria-pressed={active}
                className="dp-vps-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "7px 14px",
                  border: "none",
                  borderRadius: "var(--r-pill, 999px)",
                  // La pilule interne claire suffit à marquer l'actif :
                  // pas de bordure verticale entre les entrées.
                  background: active ? "rgba(255,255,255,.10)" : "transparent",
                  color: active
                    ? "var(--on-dark-strong, #FBF6EC)"
                    : "var(--on-dark-muted, #B3A693)",
                  fontFamily: "inherit",
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "var(--ls-wider, 0.18em)",
                  textTransform: "uppercase",
                  lineHeight: 1,
                  cursor: "pointer",
                  transition:
                    "color var(--dur, 240ms) var(--ease-out, ease), background var(--dur, 240ms) var(--ease-out, ease)",
                }}
              >
                <ModeIcon mode={m.id} />
                <span className="dp-vps-label">{m.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={close}
            aria-label="Masquer le sélecteur d'aperçu"
            className="dp-vps-close"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 26,
              height: 26,
              marginInlineStart: 4,
              border: "none",
              borderRadius: "var(--r-pill, 999px)",
              background: "transparent",
              color: "var(--on-dark-muted, #B3A693)",
              cursor: "pointer",
              transition:
                "color var(--dur, 240ms) var(--ease-out, ease), background var(--dur, 240ms) var(--ease-out, ease)",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </div>
      )}

      <style>{`
        /* Bouton flottant persistant : var(--z-float) (220) le place au-dessus
           du contenu mais sous toutes les modales/drawers (voir « Z — hiérarchie
           globale » dans globals.css). Un outil de relecture ne doit jamais
           passer devant le panier ou la modale de bienvenue qu'on inspecte. */
        .dp-vps { z-index: var(--z-float, 220); }
        .dp-vps-btn:hover { color: var(--on-dark-strong, #FBF6EC); }
        .dp-vps-close:hover {
          color: var(--on-dark-strong, #FBF6EC);
          background: rgba(255,255,255,.08);
        }
        .dp-vps-btn:focus-visible,
        .dp-vps-close:focus-visible {
          outline: none;
          box-shadow: var(--focus-ring);
        }
        /* Fenêtre réelle étroite : on passe en icônes seules pour que la barre
           centrée ne vienne pas mordre sur WhatsApp (gauche) ni BackToTop
           (droite), tous deux à 16-24px des bords. */
        @media (max-width: 720px) {
          .dp-vps-label { display: none; }
          .dp-vps-btn { padding: 7px 11px !important; }
        }
      `}</style>
    </>
  );
}
