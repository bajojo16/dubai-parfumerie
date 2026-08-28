"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/**
 * Lecture automatique d'une vidéo décorative quand elle entre dans le champ de
 * vision — et seulement là.
 *
 * Ce que ce hook règle, et qui était traité différemment (ou pas du tout) dans
 * chaque composant :
 *
 * 1. `muted` posé côté PROPRIÉTÉ avant chaque `play()`. L'attribut HTML seul ne
 *    suffit pas toujours : Android et iOS refusent une lecture non muette sans
 *    geste utilisateur, et l'attribut peut avoir été écrasé par un rendu React.
 * 2. `playsInline` idem — sans lui iOS bascule en plein écran ou refuse.
 * 3. `preload="none"` : économise les données tant que la carte est hors champ,
 *    mais `play()` n'a alors AUCUNE donnée à lire et la promesse est rejetée.
 *    On ouvre le robinet (`preload = "auto"`) au moment où la vidéo devient
 *    visible, puis on retente à `loadeddata` / `canplay`.
 * 4. La promesse de `play()` est toujours interceptée : un rejet passe en état
 *    `blocked`, que le composant traduit par un bouton de lecture visible.
 *    Sans ça (Brave Android, économiseur de données, mode faible consommation)
 *    la vidéo reste sur son poster sans aucun moyen de la démarrer.
 * 5. Aucun déclenchement au survol : il n'y a pas de survol sur un téléphone.
 *    Le survol reste possible EN PLUS, côté composant, sur pointeur fin.
 * 6. Une seule vidéo joue à la fois dans un carrousel : celles qui sortent du
 *    champ sont mises en pause, celles qui n'y sont jamais entrées ne chargent
 *    rien.
 */

export type VideoAutoplayOptions = {
  /** false → pause forcée (utile pour suspendre une carte hors de son onglet). */
  enabled?: boolean;
  /** Part de l'élément qui doit être visible pour déclencher (défaut 0.25). */
  threshold?: number;
};

export type VideoAutoplay = {
  /** L'élément observé est suffisamment visible. */
  inView: boolean;
  /** La vidéo joue réellement (source de vérité : les événements média). */
  playing: boolean;
  /** Le navigateur a refusé la lecture automatique → proposer un bouton. */
  blocked: boolean;
  /** L'utilisateur a demandé moins d'animations → poster figé. */
  reduceMotion: boolean;
  /** À câbler sur un geste utilisateur (clic / tap). */
  play: () => void;
  /** Lecture ⇄ pause, pour un bouton de contrôle. */
  toggle: () => void;
};

export function useVideoAutoplay(
  videoRef: RefObject<HTMLVideoElement | null>,
  rootRef?: RefObject<HTMLElement | null>,
  options: VideoAutoplayOptions = {}
): VideoAutoplay {
  const { enabled = true, threshold = 0.25 } = options;

  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const blockedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (blockedTimer.current) clearTimeout(blockedTimer.current);
    },
    []
  );

  // prefers-reduced-motion → on n'anime rien, le poster suffit.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // État de lecture : on écoute l'élément plutôt que de déduire de nos appels.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlaying = () => {
      setPlaying(true);
      setBlocked(false);
    };
    const onStop = () => setPlaying(false);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onStop);
    v.addEventListener("ended", onStop);
    return () => {
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("pause", onStop);
      v.removeEventListener("ended", onStop);
    };
  }, [videoRef]);

  // Visibilité. Le seuil en pourcentage de l'ÉLÉMENT ne suffit pas : une carte
  // plus haute que l'écran ne l'atteint jamais. On accepte donc aussi le cas
  // « elle couvre un quart de l'écran ».
  useEffect(() => {
    const el = rootRef?.current ?? videoRef.current;
    if (!el) return;
    // Navigateur sans IntersectionObserver : rien à observer, l'effet de
    // lecture ci-dessous joue alors sans condition de visibilité.
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const r = entry.intersectionRect;
        const coversScreen =
          r.height >= window.innerHeight * 0.25 && r.width >= window.innerWidth * 0.25;
        setInView(
          entry.isIntersecting && (entry.intersectionRatio >= threshold || coversScreen)
        );
      },
      { threshold: [0, threshold, 0.5, 0.9] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootRef, videoRef, threshold]);

  const attempt = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    if (v.preload !== "auto") v.preload = "auto";
    // `preload="none"` a interrompu la sélection de ressource au chargement de
    // la page. Repasser l'attribut à "auto" ne la relance PAS, et `play()`
    // renvoie alors une promesse qui ne se résout jamais : ni lecture, ni
    // rejet, donc même pas de bouton de repli. Il faut redemander le
    // chargement explicitement.
    if (v.readyState === 0 /* HAVE_NOTHING */ && v.networkState !== 2 /* NETWORK_LOADING */) {
      try {
        v.load();
      } catch {
        /* rien à faire : le play() ci-dessous décidera */
      }
    }
    let p: Promise<void> | undefined;
    try {
      p = v.play();
    } catch {
      setBlocked(true);
      return;
    }
    if (p && typeof p.catch === "function") {
      p.then(() => setBlocked(false)).catch(() => setBlocked(true));
    }
    // Filet : une promesse `play()` peut rester en attente indéfiniment (source
    // injoignable, décodage refusé). Sans ce garde-fou le poster resterait seul,
    // sans bouton, exactement le symptôme qu'on corrige.
    if (blockedTimer.current) clearTimeout(blockedTimer.current);
    blockedTimer.current = setTimeout(() => {
      if (videoRef.current?.paused) setBlocked(true);
    }, 3000);
  }, [videoRef]);

  // Lecture / pause selon la visibilité.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // Sans IntersectionObserver on ne sait pas ce qui est visible : on joue,
    // plutôt que de laisser un poster figé.
    const hasIO = typeof IntersectionObserver !== "undefined";
    const active = enabled && (inView || !hasIO) && !reduceMotion;
    if (!active) {
      // Une pause volontaire (sortie de champ) ne doit pas être prise pour un
      // refus du navigateur : on désamorce le filet avant de couper.
      if (blockedTimer.current) clearTimeout(blockedTimer.current);
      if (!v.paused) v.pause();
      return;
    }
    // Après la peinture : la carte vient d'entrer à l'écran, on ne bloque pas
    // le rendu avec le démarrage du décodeur.
    const raf = requestAnimationFrame(() => attempt());
    // Premier appel possiblement trop tôt (rien de bufferisé) : on retente dès
    // que le navigateur a de quoi lire, sinon la vidéo reste sur son poster.
    const retry = () => {
      if (videoRef.current?.paused) attempt();
    };
    v.addEventListener("loadeddata", retry);
    v.addEventListener("canplay", retry);
    return () => {
      cancelAnimationFrame(raf);
      v.removeEventListener("loadeddata", retry);
      v.removeEventListener("canplay", retry);
    };
  }, [enabled, inView, reduceMotion, attempt, videoRef]);

  const play = useCallback(() => attempt(), [attempt]);

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) attempt();
    else v.pause();
  }, [attempt, videoRef]);

  return { inView, playing, blocked, reduceMotion, play, toggle };
}
