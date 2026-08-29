"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { iconBtn } from "./StoryPlayer";
import type { ReviewWithMedia } from "@/data/review-media";

/**
 * ReviewMediaViewer — visionneuse d'un avis client illustré : média à gauche,
 * commentaire à droite.
 *
 * POURQUOI un composant distinct de `StoryPlayer` plutôt qu'une prop
 * « panneau latéral » ajoutée à celui-ci — la question a été tranchée après
 * lecture des 481 lignes de StoryPlayer :
 *
 * 1. Les deux n'indexent pas la même chose. StoryPlayer fait défiler une LISTE
 *    de stories : son `index` change à la fois la vidéo, la barre de
 *    progression active, la vignette surlignée et le CTA. Ici l'index parcourt
 *    les médias d'UN SEUL avis, et le texte de droite doit précisément ne pas
 *    bouger quand il change. Greffer ça, c'est faire cohabiter deux niveaux
 *    d'index dans un composant qui n'en connaît qu'un.
 * 2. StoryPlayer ne rend que des `<video>`. La majorité des avis illustrés sont
 *    des photos ; il faudrait brancher un `<img>` conditionnel sur le média
 *    net, sur le fond flouté et sur les vignettes — trois endroits.
 * 3. Les cadrages divergent : StoryPlayer est une immersion noire plein écran
 *    en 9/16, celle-ci est une carte claire à deux volets qui s'empile sous
 *    760 px. Une prop de mise en page qui bascule entre les deux revient à
 *    écrire deux composants dans un seul fichier.
 *
 * Ce qui EST réutilisé, à l'identique : le piège à focus et sa restauration,
 * la fermeture Échap / croix / clic hors carte, le verrou de défilement du
 * corps, la mécanique des barres de progression, les zones de tap, et le style
 * `iconBtn` importé de StoryPlayer plutôt que recopié.
 */

export type ReviewViewerLabels = {
  close: string;
  prev: string;
  next: string;
  verified: string;
  seeProduct: string;
  gallery: string;
};

/* Le fond est retire de `iconBtn` : un style inline prime sur une classe, et
   le garder empechait a la fois de renforcer le contraste de la croix posee sur
   le volet clair et de faire reagir les fleches au survol. Le reste (taille,
   forme ronde, centrage) vient bien de StoryPlayer. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { background: _iconBtnBg, ...ICON_BTN } = iconBtn;

const DEFAULT_LABELS: ReviewViewerLabels = {
  close: "Fermer",
  prev: "Média précédent",
  next: "Média suivant",
  verified: "Achat vérifié",
  seeProduct: "Voir le produit",
  gallery: "Photos de l'avis",
};

export function ReviewMediaViewer({
  review,
  productSlug,
  productName,
  locale = "fr",
  labels,
  onClose,
}: {
  review: ReviewWithMedia;
  productSlug: string;
  productName: string;
  locale?: string;
  labels?: Partial<ReviewViewerLabels>;
  onClose: () => void;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const isRTL = locale === "ar";
  const [index, setIndex] = useState(0);
  // Progression de la vidéo courante. Une image n'a pas de durée : sa barre est
  // pleine dès qu'elle est affichée, sinon on suggérerait un chargement en
  // cours qui n'arrivera jamais.
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const media = review.media;
  const active = media[index];
  const count = media.length;

  const go = useCallback(
    (next: number) => {
      setProgress(0);
      // Bouclage plutôt que butée : avec deux ou trois médias, une flèche qui
      // ne fait rien au bout de la série passe pour un bug.
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  // Lecture d'une vidéo à chaque changement de média. Reprise telle quelle de
  // StoryPlayer, y compris le repli en muet : le lecteur s'ouvre sur un clic,
  // donc la lecture est normalement autorisée, mais Brave et les économiseurs
  // de données refusent quand même et laissaient sinon la vidéo figée.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || active?.type !== "video") return;
    v.currentTime = 0;
    v.muted = true;
    v.playsInline = true;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    const onReady = () => {
      if (v.paused) tryPlay();
    };
    v.addEventListener("canplay", onReady);
    v.addEventListener("loadeddata", onReady);
    return () => {
      v.removeEventListener("canplay", onReady);
      v.removeEventListener("loadeddata", onReady);
    };
  }, [index, active?.type]);

  // Piège à focus + Échap + flèches + restauration du focus sur le déclencheur.
  // Les flèches sont horizontales ici, là où StoryPlayer écoute haut/bas : on
  // parcourt une galerie posée à plat, pas une pile de stories.
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (count > 1 && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        e.preventDefault();
        // En arabe la flèche droite recule : le sens de lecture commande, pas
        // la géométrie du clavier.
        const forward = isRTL ? e.key === "ArrowLeft" : e.key === "ArrowRight";
        setProgress(0);
        setIndex((i) => (((i + (forward ? 1 : -1)) % count) + count) % count);
        return;
      }
      if (e.key === "Tab") {
        const f = overlayRef.current?.querySelectorAll<HTMLElement>(
          'button, a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (!f || f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [count, isRTL, onClose]);

  // Balayage horizontal = média précédent / suivant. Sur un écran empilé, le
  // volet du commentaire défile verticalement : capter le geste vertical
  // rendrait le texte illisible.
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
    touchStart.current = null;
  };

  const initial = review.author.trim().charAt(0).toUpperCase();

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Avis de ${review.author} — ${review.title}`}
      dir={isRTL ? "rtl" : "ltr"}
      className="rmv-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="rmv-card">
        {/* La croix vit au-dessus des DEUX volets et porte son propre fond
            sombre : posée sur le volet clair du commentaire, une croix blanche
            sans pastille disparaîtrait. */}
        <button ref={closeRef} type="button" onClick={onClose} aria-label={L.close} className="rmv-close" style={ICON_BTN}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="rmv-panes">
          {/* ── Volet média ─────────────────────────────────────────── */}
          <div className="rmv-media" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {/* Barres segmentées, une par média — mécanique identique à
                StoryPlayer : pleine avant l'index courant, animée dessus. */}
            {count > 1 && (
              <div className="rmv-bars" aria-hidden>
                {media.map((m, i) => (
                  <div key={m.src} className="rmv-bar">
                    <div
                      className="rmv-bar-fill"
                      style={{
                        width: i < index ? "100%" : i === index ? `${(active?.type === "video" ? progress : 1) * 100}%` : "0%",
                        transition: i === index && active?.type === "video" ? "width .15s linear" : "none",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {active?.type === "video" ? (
              <video
                ref={videoRef}
                key={active.src}
                src={active.src}
                poster={active.posterUrl}
                autoPlay
                loop
                muted
                playsInline
                aria-label={active.alt}
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  if (v.duration) setProgress(v.currentTime / v.duration);
                }}
                className="rmv-asset"
              />
            ) : active ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={active.src} src={active.src} alt={active.alt} className="rmv-asset" />
            ) : null}

            {count > 1 && (
              <>
                <button type="button" onClick={() => go(index - 1)} aria-label={L.prev} className="rmv-nav rmv-nav-prev" style={ICON_BTN}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M15 5l-7 7 7 7" />
                  </svg>
                </button>
                <button type="button" onClick={() => go(index + 1)} aria-label={L.next} className="rmv-nav rmv-nav-next" style={ICON_BTN}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <span className="rmv-count">
                  {index + 1} / {count}
                </span>
              </>
            )}
          </div>

          {/* ── Volet commentaire ───────────────────────────────────── */}
          <div className="rmv-comment">
            <div className="rmv-stars" aria-label={`${review.rating} étoiles sur 5`}>
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} style={{ color: i <= review.rating ? "var(--star)" : "var(--star-empty)" }} aria-hidden>
                  ★
                </span>
              ))}
            </div>

            <div className="rmv-who">
              <span className="rmv-avatar" aria-hidden>
                {initial}
              </span>
              <span className="rmv-who-txt">
                <span className="rmv-name">{review.author}</span>
                <span className="rmv-meta">
                  {review.city} · {review.date}
                </span>
              </span>
            </div>

            <h3 className="rmv-title">{review.title}</h3>
            <p className="rmv-text">{review.text}</p>

            {review.verified && (
              <p className="rmv-verified">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {L.verified}
              </p>
            )}

            {/* Le lien sort du dialogue : il ferme donc la visionneuse avant de
                naviguer, sinon le verrou de défilement du corps survivrait à un
                changement de route côté client. */}
            <Link href={`/produit/${productSlug}`} onClick={onClose} className="rmv-cta">
              <span className="rmv-cta-lbl">{L.seeProduct}</span>
              <span className="rmv-cta-name">{productName}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Survols, requêtes de média et pseudo-éléments : rien de tout ça ne
          s'écrit en style inline. Aucune grille n'est déclarée en inline non
          plus — `globals.css` capture les attributs contenant « repeat(N, » et
          les ramène de force à deux colonnes sous 980 px. */}
      <style>{`
        .rmv-overlay{position:fixed;inset:0;z-index:9999;background:rgba(21,16,11,.86);display:flex;align-items:center;justify-content:center;padding:24px;overscroll-behavior:contain}
        .rmv-card{position:relative;width:100%;max-width:1040px;height:min(88vh,720px);background:var(--surface-page);border-radius:var(--r-lg);overflow:hidden;box-shadow:0 30px 90px -30px rgba(0,0,0,.75)}
        .rmv-close{position:absolute;top:14px;inset-inline-end:14px;z-index:8;background:rgba(21,16,11,.55)}
        .rmv-close:hover{background:rgba(21,16,11,.85)}
        .rmv-panes{display:grid;grid-template-columns:var(--rmv-cols,1.02fr .98fr);height:100%;min-height:0}
        .rmv-media{position:relative;background:var(--espresso-900);display:flex;align-items:center;justify-content:center;min-height:0;overflow:hidden}
        .rmv-asset{width:100%;height:100%;object-fit:cover;display:block}
        .rmv-bars{position:absolute;top:10px;inset-inline:12px;z-index:5;display:flex;gap:5px}
        .rmv-bar{flex:1;height:3px;border-radius:99px;background:rgba(255,255,255,.3);overflow:hidden}
        .rmv-bar-fill{height:100%;background:#fff}
        .rmv-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:6;background:rgba(0,0,0,.42)}
        .rmv-nav-prev{inset-inline-start:12px}
        .rmv-nav-next{inset-inline-end:12px}
        .rmv-nav:hover{background:rgba(0,0,0,.7)}
        .rmv-count{position:absolute;bottom:12px;inset-inline-end:14px;z-index:6;font-family:var(--font-sans);font-size:.7rem;letter-spacing:.08em;color:#fff;background:rgba(0,0,0,.45);border-radius:999px;padding:3px 10px}
        .rmv-comment{display:flex;flex-direction:column;gap:14px;padding:34px 32px;overflow-y:auto;min-height:0}
        .rmv-stars{display:inline-flex;gap:2px;font-size:16px;line-height:1}
        .rmv-who{display:flex;align-items:center;gap:11px}
        .rmv-avatar{width:40px;height:40px;flex:none;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,var(--gold-300),var(--gold-500));color:#fff;font-family:var(--font-display);font-size:19px;font-weight:600;line-height:1}
        .rmv-who-txt{display:flex;flex-direction:column;gap:1px;min-width:0}
        .rmv-name{font-family:var(--font-sans);font-size:.9rem;font-weight:600;color:var(--ink-900)}
        .rmv-meta{font-family:var(--font-sans);font-size:var(--t-xs);color:var(--ink-400)}
        .rmv-title{margin:4px 0 0;font-family:var(--font-display);font-size:1.5rem;font-weight:600;line-height:1.2;color:var(--ink-900)}
        .rmv-text{margin:0;font-family:var(--font-sans);font-size:.9rem;line-height:1.7;color:var(--ink-700)}
        .rmv-verified{margin:0;display:flex;align-items:center;gap:6px;font-family:var(--font-sans);font-size:var(--t-xs);font-weight:500;color:var(--success)}
        .rmv-cta{margin-top:auto;padding-top:16px;border-top:1px solid var(--line-200,#E4DBCB);display:flex;flex-direction:column;gap:2px;text-decoration:none}
        .rmv-cta-lbl{font-family:var(--font-sans);font-size:.62rem;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-400)}
        .rmv-cta-name{font-family:var(--font-display);font-size:1.15rem;color:var(--gold-500);transition:color .2s ease}
        .rmv-cta:hover .rmv-cta-name{color:var(--espresso-900)}
        .rmv-cta:focus-visible{outline:2px solid var(--gold-500);outline-offset:4px;border-radius:6px}

        /* Empilement sous 760 px : le média passe au-dessus, le commentaire
           dessous, et c'est la CARTE qui défile — pas la page derrière, dont le
           corps est verrouillé pendant l'ouverture. */
        @media (max-width:760px){
          .rmv-overlay{padding:0}
          .rmv-card{max-width:none;height:100dvh;border-radius:0}
          .rmv-panes{grid-template-columns:1fr;grid-auto-rows:min-content;height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch}
          .rmv-media{aspect-ratio:1/1}
          .rmv-comment{padding:22px 20px 40px;overflow:visible}
          .rmv-title{font-size:1.3rem}
          .rmv-cta{margin-top:18px}
        }
      `}</style>
    </div>
  );
}
