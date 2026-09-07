"use client";

/**
 * Section « jumeau olfactif ».
 *
 * Le CHAMP DE RECHERCHE est le point d'entrée : on tape le parfum qu'on aime
 * (nom ou maison, accents et casse indifférents) et la section propose le
 * produit oriental au profil le plus proche, avec son niveau de proximité.
 * Les pastilles restent, mais comme suggestions — une poignée de références très
 * connues DONT LE JUMEAU EXISTE. Elles ne sont plus écrites dans le composant :
 * elles viennent de `resolveSuggestions()`, qui filtre l'ordre de priorité de
 * `TWIN_SUGGESTIONS` par ce que le moteur certifie réellement (voir l'invariant
 * dans `olfactive-twins.ts`).
 *
 * Chargement différé : la base des références (3 990 parfums) et le moteur
 * d'appariement arrivent en `import()` dynamique — jamais dans le bundle
 * initial. Le déclencheur n'est plus le seul focus du champ mais l'ENTRÉE DE LA
 * SECTION DANS LE CHAMP DE VISION (IntersectionObserver, marge de 200 px) :
 * les pastilles portent désormais la vignette et le prix du jumeau, la vitrine
 * doit être cohérente avec la première pastille, et attendre un clic pour
 * savoir tout cela ferait changer l'écran sous les yeux du visiteur. Tant que
 * le module n'est pas là, on peint l'amorçage : `TWIN_SUGGESTIONS` pour les
 * pastilles, `TWIN_SHOWCASE` pour la carte.
 *
 * Cadre légal inchangé : usage nominatif des marques, TEXTE SEUL. Le flacon de
 * gauche du face-à-face est une SILHOUETTE NEUTRE dessinée en CSS — aucun logo,
 * aucune forme de flacon de marque, aucune couleur de maison. Vocabulaire
 * « inspiré de » / « jumeau olfactif » — jamais « clone », « copie », « dupe ».
 *
 * RÈGLE D'AFFICHAGE, non négociable : on ne montre un jumeau QUE lorsque le
 * moteur en certifie un (`findTwin` rend `null` sinon). Aucun repli sur « le
 * moins pire des 25 produits ». Quand il n'y a pas de jumeau, on l'annonce et
 * on propose l'alerte e-mail.
 *
 * DEUX NATURES DE RÉSULTAT, DEUX BADGES (`TwinResult.origin`) : une paire relue
 * ou une correspondance sourcée se disent « jumeau documenté » ; un
 * rapprochement calculé se dit « rapprochement olfactif » et sa jauge ne peut
 * pas atteindre le palier haut. C'est ce qui distingue enfin Dior Sauvage
 * (documenté) de Baccarat Rouge 540 → Alyssa (calculé), servis hier sous le
 * même « Profil très proche ».
 */

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import {
  TWIN_SUGGESTIONS,
  TWIN_SUGGESTION_COUNT,
  TWIN_SHOWCASE,
  type OlfactiveMatch,
} from "@/data/olfactive-twins";
import type { MatchStrength, TwinOrigin, TwinResult } from "@/data/olfactive-match";
import type { ReferencePerfume } from "@/data/reference-perfumes";
import { savingsOf, sourceNameOf, type Savings } from "@/data/reference-prices";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { addItem } from "@/lib/cart";
import { useVideoAutoplay } from "@/hooks/useVideoAutoplay";

/**
 * Vignette animée du jumeau : le film du flacon quand la fiche en porte un.
 *
 * `useVideoAutoplay` fait tout le travail délicat — muet et `playsInline` posés
 * côté propriété avant chaque `play()`, `preload` ouvert seulement à l'entrée
 * dans le champ, promesse de lecture interceptée, pause à la sortie. Ici la
 * vidéo est purement décorative : pas de bouton de repli si le navigateur
 * refuse, le poster tient alors le rôle du packshot qu'il était.
 */
function TwinThumbVideo({
  src,
  poster,
  name,
}: {
  src: string;
  poster: string;
  name: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  useVideoAutoplay(videoRef, wrapRef);

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0 }}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={name}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </div>
  );
}

/** Module chargé à la première entrée de la section dans le champ de vision. */
type MatchModule = typeof import("@/data/olfactive-match");

const C = {
  stage: "#FAF6EE",
  border: "#E6DCC8",
  pillBorder: "#E6DCC8",
  pillText: "#5A4A2E",
  pillSelBg: "#3A2C14",
  pillSelText: "#F3E6CF",
  gold: "#C9A24A",
  goldDark: "#8A6A1E",
  goldCta: "#C4A24F",
  ink: "#2C2620",
  muted: "#6A655D",
  goldLabel: "#A8801F",
  legal: "#9A8A6A",
  searchBorder: "#E0CFA8",
  searchIcon: "#A8915F",
  tagBg: "rgba(201,162,74,.16)",
  tagBorder: "#E0CFA8",
  optionHover: "#FBF7EE",
  strike: "#9A9286",
  whatsapp: "#25D366",
};

/** Nombre de propositions d'autocomplétion — au-delà, la liste ne se lit plus. */
const MAX_SUGGESTIONS = 8;

/** Validation de format côté client — même expression que la newsletter. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Demandes d'alerte « prévenez-moi », conservées dans le navigateur.
 * Convention de nommage du repo : préfixe `dp_` (cf. `dp_wishlist`,
 * `dp_recherches`, `dp_ondemand`).
 */
const ALERTS_KEY = "dp_alertes_jumeau";

/** Au-delà, une maquette n'a aucune raison de faire grossir le stockage local. */
const MAX_ALERTS = 50;

type TwinAlert = { email: string; reference: string; at: string };

/**
 * Mémorise la demande côté navigateur. Ce n'est PAS un envoi : rien ne part, et
 * c'est volontaire — la trace locale permet de montrer la demande en démo sans
 * faire croire qu'un e-mail a été expédié.
 */
function rememberAlert(email: string, reference: string) {
  try {
    const raw = window.localStorage.getItem(ALERTS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const list: TwinAlert[] = Array.isArray(parsed) ? (parsed as TwinAlert[]) : [];
    list.push({ email, reference, at: new Date().toISOString() });
    window.localStorage.setItem(ALERTS_KEY, JSON.stringify(list.slice(-MAX_ALERTS)));
  } catch {
    // Navigation privée, quota plein, stockage refusé : la confirmation reste
    // affichée. Perdre la trace locale ne doit pas casser l'écran.
  }
}

// ─── Description ─────────────────────────────────────────────────────────────
/**
 * Les descriptions du catalogue ne sont pas toutes des phrases d'accroche :
 * certaines fiches ont été importées telles quelles et commencent par leur bloc
 * technique — « Notes de tête : … Contenance : 105 ml Sillage : puissa… ». La
 * carte affichait ce bloc, tronqué à trois lignes, ce qui donnait au module
 * l'allure d'un extrait de base de données (défaut relevé sur Sauvage → Urban
 * Man Elixir).
 *
 * On garde donc ce qui précède le premier marqueur technique. Si ce qui reste
 * est trop court pour dire quoi que ce soit (souvent : rien du tout, le bloc
 * commence à la première lettre), on retombe sur la phrase de profil rédigée
 * pour la famille — c'est exactement le rôle de `catalogFamilyText`.
 *
 * La donnée n'est PAS modifiée : la fiche produit, le JSON-LD et la recherche
 * continuent de servir la description entière.
 */
const SHEET_MARKERS = [
  "Notes de tête",
  "Notes de tete",
  "Notes de cœur",
  "Notes de coeur",
  "Notes de fond",
  "Contenance",
  "Sillage",
  "Famille olfactive",
  "Concentration",
  "Lancé en",
  "Parfait pour",
  "Saison :",
  "Genre :",
  "Tenue :",
];

/** Longueur minimale d'une accroche : en dessous, ce n'est plus une phrase. */
const MIN_TEASER = 40;

function cleanDescription(raw: string | undefined, fallback: string): string {
  const text = (raw ?? "").trim();
  if (!text) return fallback;
  let cut = text.length;
  for (const marker of SHEET_MARKERS) {
    const i = text.indexOf(marker);
    if (i >= 0 && i < cut) cut = i;
  }
  const head = text.slice(0, cut).trim().replace(/[·|,;:–—-]+$/, "").trim();
  return head.length >= MIN_TEASER ? head : fallback;
}

/**
 * Vue unifiée du résultat : une correspondance relue par l'équipe et un
 * appariement calculé n'ont pas la même forme, l'affichage n'a pas à le savoir.
 */
type ResultView = {
  /** clé stable — clé React et identifiant de la pastille active */
  key: string;
  /** id de la référence dans la base — dit quelle pastille est active */
  referenceId: string;
  /** parfum de référence, en toutes lettres (usage nominatif) */
  targetName: string;
  /** famille commune aux deux profils */
  familyLabel: string;
  description: string;
  /** d'où sort la correspondance — décide du badge de confiance */
  origin: TwinOrigin;
  /** jauge de proximité, 0..1 */
  proximity: number;
  /** palier lu sur la jauge */
  proximityStrength: MatchStrength;
  /** groupes d'accords exactement retrouvés / lisibles dans la référence */
  accordsFound: number;
  accordsTotal: number;
  /** vrai quand le catalogue sert la référence dans SA famille (affinité = 1) */
  sameFamily: boolean;
  referenceFamilyLabel: string;
  /** source publique de la correspondance documentée, s'il y en a une */
  documentedSource?: string;
  /** notes de la référence réellement retrouvées dans le produit */
  sharedAccords: string[];
  /** prix boutique constaté et économie — `null` quand le prix est inconnu */
  savings: Savings | null;
  /**
   * `id` est le handle du PRODUIT, pas celui de la référence : deux originaux
   * différents peuvent mener au même flacon, et le panier doit alors compter
   * une seule ligne — pas deux fois le même parfum sous deux noms.
   */
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    image: string;
    /** Film du flacon, quand la fiche relue en porte un (voir `TwinThumbVideo`). */
    video?: string;
    href: string;
  };
};

/**
 * La vitrine d'ouverture, peinte avant l'arrivée du moteur.
 *
 * `curated` est la paire relue correspondante lorsqu'il y en a une : sa
 * description rédigée et sa famille priment alors sur la copie d'amorçage, de
 * la même façon que `findTwin` les fera primer une fois le moteur chargé.
 */
function viewFromShowcase(curated?: OlfactiveMatch): ResultView {
  const s = TWIN_SHOWCASE;
  return {
    key: s.referenceId,
    referenceId: s.referenceId,
    targetName: curated?.targetName ?? s.targetName,
    familyLabel: curated?.family ?? s.familyLabel,
    description: curated?.description ?? s.description,
    origin: curated ? "curated" : s.origin,
    proximity: s.proximity,
    proximityStrength: s.proximity >= 0.8 ? "tres-proche" : s.proximity >= 0.6 ? "proche" : "apparente",
    accordsFound: s.sharedAccords.length,
    accordsTotal: s.sharedAccords.length,
    sameFamily: false,
    referenceFamilyLabel: s.referenceFamilyLabel,
    sharedAccords: s.sharedAccords,
    savings: savingsOf(s.referenceId, s.product.price),
    product: { ...s.product },
  };
}

function viewFromTwin(t: TwinResult): ResultView {
  return {
    key: t.reference.id,
    referenceId: t.reference.id,
    targetName: `${t.reference.house} · ${t.reference.name}`,
    familyLabel: t.catalogFamilyLabel,
    // Priorité : le texte relu par l'équipe, sinon l'accroche de la fiche
    // débarrassée de son bloc technique, sinon la phrase de profil de famille.
    description: t.curated?.description || cleanDescription(t.product.description, t.catalogFamilyText),
    origin: t.origin,
    proximity: t.proximity,
    proximityStrength: t.proximityStrength,
    accordsFound: t.exactAccordCount,
    accordsTotal: t.referenceGroupCount,
    sameFamily: t.familyAffinity >= 1,
    referenceFamilyLabel: t.referenceFamilyLabel,
    documentedSource: t.documentedSource,
    sharedAccords: t.sharedAccords,
    savings: savingsOf(t.reference.id, t.product.price ?? 0),
    product: {
      id: t.product.slug,
      name: t.product.name,
      brand: t.product.brand,
      price: t.product.price ?? 0,
      // Le film — et le poster qui va avec — ne vit que sur la fiche relue :
      // `t.product` vient du catalogue de recherche, qui ne porte pas ce champ.
      image: t.curated?.product.video
        ? t.curated.product.image
        : t.product.image || "/assets/prod-1.jpg",
      video: t.curated?.product.video,
      href: t.product.href,
    },
  };
}

/**
 * Instantanés d'`useSyncExternalStore` pour l'origine du site — définis hors du
 * composant pour rester stables d'un rendu à l'autre.
 */
const SUBSCRIBE_NEVER = () => () => {};
const getOriginSnapshot = () => window.location.origin;
const getOriginServerSnapshot = () => "";

/**
 * Une pastille : identifiant, libellé « Maison · Parfum », et — dès que le
 * moteur est là — la vignette du jumeau et son prix (proposition 05).
 */
type Pill = { referenceId: string; label: string; image?: string; price?: number };

/** Une ligne d'autocomplétion, avec l'état du jumeau (proposition 05). */
type Hit = { reference: ReferencePerfume; familyLabel: string; twinPrice: number | null };

export function OlfactiveTwin({
  matches,
  locale = "fr",
  variant = "full",
  initialReferenceId,
}: {
  matches: OlfactiveMatch[];
  locale?: string;
  variant?: "full" | "compact";
  /**
   * Ouvre le module DÉJÀ RÉSOLU sur cette référence — c'est ce qui donne une
   * adresse à un résultat (`/jumeau/<referenceId>`, proposition 09). Quand il
   * est fourni, la vitrine d'ouverture n'est pas peinte : le moteur est chargé
   * tout de suite et rend le résultat demandé, ou l'écran « pas encore de
   * jumeau » si la référence n'en a pas.
   */
  initialReferenceId?: string;
}) {
  const t = useTranslations("olfactiveTwin");
  const isRTL = locale === "ar";
  const compact = variant === "compact";
  const listId = useId();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [mod, setMod] = useState<MatchModule | null>(null);
  const [loading, setLoading] = useState(false);
  const [addedKey, setAddedKey] = useState("");
  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);
  /** Barre d'achat collante en mobile : visible tant que la carte est à l'écran. */
  const [cardVisible, setCardVisible] = useState(false);
  /**
   * Origine absolue du site, connue seulement dans le navigateur.
   *
   * Le lien WhatsApp est rendu côté serveur : lire `window.location.origin`
   * pendant le rendu donnait deux `href` différents entre le serveur et
   * l'hydratation, et React le signalait en console à chaque chargement.
   * `useSyncExternalStore` est fait pour ce cas — il sert l'instantané SERVEUR
   * (chaîne vide) jusqu'à l'hydratation comprise, puis l'instantané client.
   * Rien ne change ensuite : l'abonnement est vide.
   */
  const origin = useSyncExternalStore(SUBSCRIBE_NEVER, getOriginSnapshot, getOriginServerSnapshot);

  /**
   * Pastilles = suggestions par défaut. La liste vient de la base (voir
   * l'invariant dans `olfactive-twins.ts`) : tant que le module lourd n'est pas
   * là, on peint l'amorçage `TWIN_SUGGESTIONS` — déjà dans le bundle — puis on
   * repasse sur la liste que le moteur certifie réellement, vignette et prix
   * compris (proposition 05).
   */
  const pills: Pill[] = useMemo(
    () =>
      mod
        ? mod.resolveSuggestions(TWIN_SUGGESTION_COUNT).map((s) => ({
            referenceId: s.referenceId,
            label: s.label,
            image: s.twin.product.image,
            price: s.twin.product.price,
          }))
        : TWIN_SUGGESTIONS.slice(0, TWIN_SUGGESTION_COUNT).map((s) => ({
            referenceId: s.referenceId,
            label: s.label,
          })),
    [mod]
  );

  /**
   * Premier résultat affiché : la VITRINE déclarée (`TWIN_SHOWCASE`), qui est
   * par construction la paire de la première pastille — celle-ci apparaît donc
   * active dès l'ouverture. Le repli `matches[0]` d'avant servait Creed ·
   * Aventus, absent des pastilles : aucune n'était active et la vitrine
   * annonçait un prix que la recherche contredisait.
   *
   * `matches` reste la source des paires relues (et le contrat du composant),
   * mais il n'amorce plus la vue : une paire relue n'est pas forcément une
   * suggestion, et l'inverse est vrai aussi.
   */
  const [view, setView] = useState<ResultView | null>(() =>
    initialReferenceId
      ? null
      : viewFromShowcase(matches.find((m) => m.referenceId === TWIN_SHOWCASE.referenceId))
  );

  // Référence choisie pour laquelle nous n'avons PAS de jumeau. Un état à part
  // de `view` : les deux ne coexistent jamais, mais confondre les deux ferait
  // réapparaître un vieux résultat derrière l'écran « pas encore de jumeau ».
  const [missing, setMissing] = useState("");
  const [alertEmail, setAlertEmail] = useState("");
  const [alertError, setAlertError] = useState("");
  const [alertSent, setAlertSent] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  /** Vrai dès que le visiteur a choisi lui-même : la vitrine ne doit plus reprendre la main. */
  const chosenRef = useRef(false);

  /**
   * Compteur de sélections. On ne peut pas faire défiler dans le gestionnaire
   * de clic : le résultat n'est peint qu'au rendu suivant, et la carte n'a donc
   * pas encore sa hauteur définitive. Zéro = premier rendu, on ne défile pas.
   */
  const [selectionTick, setSelectionTick] = useState(0);

  useEffect(() => {
    if (selectionTick === 0) return;
    const el = resultRef.current;
    if (!el) return;
    // `nearest` : on ne bouge que si la carte n'est pas déjà à l'écran — en
    // vue large (colonne de droite) l'appel ne fait donc rien.
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
  }, [selectionTick]);

  // ── Chargement différé ─────────────────────────────────────────────────────
  const ensureModule = useCallback(async (): Promise<MatchModule> => {
    if (mod) return mod;
    setLoading(true);
    try {
      // `import()` est mémorisé par le bundler : deux appels concurrents ne
      // téléchargent qu'une fois, la garde n'a donc pas à sérialiser.
      const m = await import("@/data/olfactive-match");
      setMod(m);
      return m;
    } finally {
      setLoading(false);
    }
  }, [mod]);

  const loadModule = useCallback(() => {
    if (mod || loading) return;
    void ensureModule();
  }, [mod, loading, ensureModule]);

  /** Applique un résultat (ou l'absence de résultat) pour une référence donnée. */
  const applyReference = useCallback((m: MatchModule, ref: ReferencePerfume) => {
    const twin = m.findTwin(ref);
    if (twin) {
      setView(viewFromTwin(twin));
      setMissing("");
    } else {
      setView(null);
      setMissing(`${ref.house} · ${ref.name}`);
    }
    setAlertSent(false);
    setAlertError("");
    setQty(1);
    setCopied(false);
  }, []);

  /**
   * Le moteur arrive quand la section entre dans le champ de vision — pas au
   * chargement de la page (la base des références pèse 3 990 entrées et reste
   * hors du bundle initial), et plus seulement au premier clic : les pastilles
   * doivent porter leur vignette et leur prix avant qu'on les touche, et la
   * vitrine doit être relue sur la base plutôt que sur sa copie d'amorçage.
   */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || mod) return;
    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      void ensureModule().then((m) => {
        // La référence demandée par l'URL prime ; sinon on relit la vitrine sur
        // la base, sauf si le visiteur a déjà choisi entre-temps.
        const wanted = initialReferenceId ?? TWIN_SHOWCASE.referenceId;
        if (chosenRef.current) return;
        const ref = m.getReference(wanted);
        if (ref) applyReference(m, ref);
      });
    };
    if (typeof IntersectionObserver === "undefined") {
      start();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          start();
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mod, ensureModule, applyReference, initialReferenceId]);

  /** Barre d'achat collante (mobile) : elle suit la visibilité de la carte. */
  useEffect(() => {
    const el = resultRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => setCardVisible(entries.some((e) => e.isIntersecting)), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ── Propositions ───────────────────────────────────────────────────────────
  /**
   * L'autocomplétion dit désormais, ligne par ligne, si nous avons un jumeau et
   * à quel prix : on ne découvre plus l'absence APRÈS le clic (proposition 05).
   */
  const hits: Hit[] = useMemo(() => {
    if (!mod || query.trim().length < 2) return [];
    return mod.searchReferencesWithTwins(query, MAX_SUGGESTIONS).map((h) => ({
      reference: h.reference,
      // `FAMILY_LABELS` vit dans `reference-perfumes.ts` : on le lit sur le
      // module chargé, jamais en import statique — ce fichier pèse la base
      // entière et doit rester hors du bundle initial.
      familyLabel: mod.FAMILY_LABELS[h.reference.family] ?? h.reference.family,
      twinPrice: h.twin ? h.twin.product.price ?? null : null,
    }));
  }, [mod, query]);

  // Index effectivement mis en avant : la liste peut rétrécir entre deux
  // frappes, l'index stocké ne doit jamais pointer hors de la liste rendue.
  const hi = hits.length ? Math.min(highlight, hits.length - 1) : 0;

  // Clic à l'extérieur : on referme la liste sans toucher au résultat affiché.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const choose = useCallback(
    (ref: ReferencePerfume) => {
      chosenRef.current = true;
      if (mod) applyReference(mod, ref);
      // On ne remet que le nom : réouvrir le champ propose de nouveau les
      // déclinaisons de la même référence (Sauvage, Sauvage Elixir…).
      setQuery(ref.name);
      setOpen(false);
      setSelectionTick((n) => n + 1);
      inputRef.current?.blur();
    },
    [mod, applyReference]
  );

  /**
   * Clic sur une pastille. La pastille ne porte QUE l'identifiant de la
   * référence : le jumeau est relu dans la base, jamais recopié dans le
   * composant — c'est ce qui garantit qu'une pastille et une recherche au
   * clavier donnent exactement le même résultat.
   */
  const choosePill = useCallback(
    async (referenceId: string) => {
      chosenRef.current = true;
      const m = await ensureModule();
      const ref = m.getReference(referenceId);
      // L'invariant des suggestions garantit que la référence existe ; si la
      // base bougeait, `resolveSuggestions` retirerait la pastille au prochain
      // rendu — on ne casse rien en attendant.
      if (!ref) return;
      applyReference(m, ref);
      setOpen(false);
      setSelectionTick((n) => n + 1);
    },
    [ensureModule, applyReference]
  );

  const submitAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const value = alertEmail.trim();
    if (!EMAIL_RE.test(value)) {
      setAlertError(t("alert_invalid"));
      return;
    }
    setAlertError("");
    // STUB — aucune API réelle, rien n'est envoyé. L'endpoint d'alerte reste à
    // brancher (même convention que la newsletter : Brevo/Mailchimp/Klaviyo…).
    rememberAlert(value, missing);
    setAlertSent(true);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || hits.length === 0) {
      // Flèche bas sur un champ fermé : on rouvre la liste si elle a du contenu.
      if (e.key === "ArrowDown" && hits.length > 0) setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % hits.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + hits.length) % hits.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = hits[hi];
      if (hit) choose(hit.reference);
    }
  };

  const fmt = (n: number) => {
    try {
      return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
    } catch {
      return `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
    }
  };
  /** Prix indicatif de l'original : « ≈ 115 € », arrondi, jamais présenté comme officiel. */
  const fmtApprox = (n: number) => `≈ ${Math.round(n).toLocaleString("fr-FR")} €`;

  const strengthLabel: Record<MatchStrength, string> = {
    "tres-proche": t("strength_very_close"),
    proche: t("strength_close"),
    apparente: t("strength_related"),
  };

  const listOpen = open && (hits.length > 0 || (loading && query.trim().length >= 2));

  // ── Partage (proposition 09) ───────────────────────────────────────────────
  /**
   * Chaque résultat a une adresse : `/jumeau/<referenceId>`. Le préfixe de
   * locale suit la règle `as-needed` du routage (fr sans préfixe, les autres
   * avec) — on ne peut pas passer par `Link`, il faut une URL absolue à copier
   * et à envoyer.
   */
  const shareUrl = useCallback(
    (referenceId: string) => {
      const prefix = locale === "fr" ? "" : `/${locale}`;
      return `${origin}${prefix}/jumeau/${referenceId}`;
    },
    [locale, origin]
  );

  const shareText = (v: ResultView) => t("share_text", { name: v.targetName, price: fmt(v.product.price) });

  const onShare = useCallback(
    async (v: ResultView) => {
      const url = shareUrl(v.referenceId);
      const text = shareText(v);
      // Web Share quand le navigateur le propose (mobile surtout) ; sinon on
      // copie, ce qui reste utile partout ailleurs.
      try {
        if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
          await navigator.share({ title: v.targetName, text, url });
          return;
        }
      } catch {
        // Partage refusé ou annulé : on retombe sur la copie, sans message d'erreur.
      }
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2400);
      } catch {
        // Presse-papiers refusé (http, permission) : rien à faire de mieux ici.
      }
    },
    // `shareText` dépend de `t` et `fmt`, tous deux stables sur la durée du rendu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shareUrl, t, locale]
  );

  // ── Blocs ──────────────────────────────────────────────────────────────────

  const introEl = (
    <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: C.muted, margin: "0 0 16px" }}>{t("intro")}</p>
  );

  const hookEl = (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <span
        className="otwin-q"
        aria-hidden
        style={{
          flexShrink: 0,
          width: 42,
          height: 42,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          background: C.tagBg,
          border: `1.5px solid ${C.gold}`,
          color: C.goldLabel,
          fontFamily: "var(--font-display)",
          fontSize: 26,
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        ?
      </span>
      <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 13.5, color: C.ink, lineHeight: 1.4 }}>
        {t("intro")}
      </p>
    </div>
  );

  // Champ de recherche + liste d'autocomplétion (combobox accessible)
  const searchEl = (
    <div ref={boxRef} className="otw-combo" style={{ marginBottom: compact ? 10 : 16 }}>
      <div
        className="otw-field"
        style={{
          display: "flex",
          alignItems: "center",
          gap: compact ? 8 : 10,
          background: "#fff",
          border: `1px solid ${C.searchBorder}`,
          borderRadius: 999,
          padding: compact ? "8px 14px" : "12px 18px",
        }}
      >
        <svg
          width={compact ? 15 : 18}
          height={compact ? 15 : 18}
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.searchIcon}
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
          style={{ flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={listOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={listOpen && hits[hi] ? `${listId}-${hi}` : undefined}
          aria-label={t("search_label")}
          autoComplete="off"
          value={query}
          onFocus={() => {
            loadModule();
            setOpen(true);
          }}
          onChange={(e) => {
            loadModule();
            setQuery(e.target.value);
            setHighlight(0);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder={t("search_placeholder")}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "var(--font-sans)",
            fontSize: compact ? 13 : 14,
            color: C.ink,
          }}
        />
      </div>

      {listOpen && (
        <ul id={listId} role="listbox" aria-label={t("search_label")} className="otw-list">
          {hits.length === 0 && loading && (
            <li className="otw-empty" role="presentation">
              {t("loading")}
            </li>
          )}
          {hits.map((hit, i) => {
            const ref = hit.reference;
            // En-tête de maison : la liste est déjà triée par pertinence puis
            // par maison, il suffit donc de rompre quand la maison change.
            const newHouse = i === 0 || hits[i - 1].reference.house !== ref.house;
            return (
              <li key={ref.id} role="presentation" className="otw-group">
                {newHouse && <div className="otw-house">{ref.house}</div>}
                <div
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === hi}
                  className={i === hi ? "otw-option otw-option-on" : "otw-option"}
                  onMouseEnter={() => setHighlight(i)}
                  onMouseDown={(e) => {
                    // mousedown plutôt que click : le blur du champ fermerait la
                    // liste avant que le clic n'arrive.
                    e.preventDefault();
                    choose(ref);
                  }}
                >
                  {/* Monogramme NEUTRE : la lettre de la maison dans un rond
                      crème. Aucun logo, aucune couleur de marque — cadre légal. */}
                  <span className="otw-mono" aria-hidden>
                    {ref.house.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="otw-option-text">
                    <span className="otw-option-name">{ref.name}</span>
                    <span className="otw-option-meta">
                      {ref.year ? `${ref.year} · ` : ""}
                      {hit.familyLabel}
                    </span>
                  </span>
                  {hit.twinPrice !== null ? (
                    <span className="otw-hit-ok">{t("twin_available", { price: fmt(hit.twinPrice) })}</span>
                  ) : (
                    <span className="otw-hit-ko">{t("twin_missing")}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Aucune réponse : on le dit, sans vider le résultat déjà affiché. */}
      {open && !loading && mod && query.trim().length >= 2 && hits.length === 0 && (
        <p className="otw-noresult">{t("no_result")}</p>
      )}
    </div>
  );

  /**
   * Pastilles = suggestions par défaut, dérivées de la base : chacune a un
   * jumeau certifié. Depuis la proposition 05 elles portent la VIGNETTE du
   * jumeau et son prix — on voit le flacon avant de choisir. En mobile, elles
   * défilent sur UNE ligne (proposition 06) au lieu d'occuper trois rangées.
   */
  const pillsEl = (
    <div className="otw-pills-wrap">
      <div className="otw-pills" role="group" aria-label={t("suggestions")}>
        {pills.map((p) => {
          const active = view?.referenceId === p.referenceId;
          return (
            <button
              key={p.referenceId}
              type="button"
              aria-pressed={active}
              onClick={() => void choosePill(p.referenceId)}
              className={active ? "otw-pill otw-pill-on" : "otw-pill"}
            >
              <span className="otw-pill-thumb" aria-hidden>
                {p.image ? (
                  <Image src={p.image} alt="" width={30} height={30} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                ) : (
                  <span className="otw-pill-mono">{p.label.slice(0, 1).toUpperCase()}</span>
                )}
              </span>
              <span className="otw-pill-label">{p.label}</span>
              {typeof p.price === "number" && <b className="otw-pill-price">{fmt(p.price)}</b>}
            </button>
          );
        })}
      </div>
    </div>
  );

  /**
   * Écran « pas encore de jumeau ».
   *
   * C'est l'état MAJORITAIRE (le catalogue compte 25 produits pour 3 990
   * références) : il ne doit pas se lire comme une erreur mais comme une
   * promesse — d'où la même carte crème que le résultat, un titre en Cormorant
   * et un filet doré plutôt qu'un ton d'avertissement.
   */
  const missingEl = (
    <div className="otw-none">
      <span className="otw-none-mark" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.goldLabel} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l2.1 5.4L20 9.3l-4 4 1 5.7-5-2.8-5 2.8 1-5.7-4-4 5.9-.9z" />
        </svg>
      </span>
      <div className="otw-none-eyebrow">{t("no_twin_eyebrow")}</div>
      <h3 className="otw-none-title">{t("no_twin_title", { name: missing })}</h3>
      <p className="otw-none-text">{t("no_twin_text")}</p>

      {alertSent ? (
        <p className="otw-none-done" role="status">
          <span className="otw-none-check" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12.5l5 5L20 6.5" />
            </svg>
          </span>
          {t("alert_success", { name: missing })}
        </p>
      ) : (
        <form className="otw-none-form" onSubmit={submitAlert} noValidate>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-label={t("alert_label")}
            aria-invalid={Boolean(alertError)}
            placeholder={t("alert_placeholder")}
            value={alertEmail}
            onChange={(e) => {
              setAlertEmail(e.target.value);
              // L'erreur disparaît dès la correction : la laisser sous un champ
              // déjà corrigé donne l'impression que la saisie est refusée.
              if (alertError) setAlertError("");
            }}
            className="otw-none-input"
          />
          <button type="submit" className="otw-none-submit">
            {t("alert_submit")}
          </button>
        </form>
      )}

      {alertError && (
        <p className="otw-none-error" role="alert">
          {alertError}
        </p>
      )}
      {!alertSent && <p className="otw-none-micro">{t("alert_micro")}</p>}
    </div>
  );

  /** Silhouette de flacon NEUTRE — dessin CSS, aucun logo, aucune forme de marque. */
  const bottleSilhouette = (name: string) => (
    <div className="otw-silhouette" aria-hidden>
      <span className="otw-sil-cap" />
      <span className="otw-sil-neck" />
      <span className="otw-sil-body" />
      <span className="otw-sil-label">{name}</span>
    </div>
  );

  const addToCart = (v: ResultView) => {
    addItem(
      { id: v.product.id, name: v.product.name, brand: v.product.brand, price: v.product.price, image: v.product.image },
      qty
    );
    setAddedKey(v.key);
  };

  const resultEl = (
    <div ref={resultRef} aria-live="polite" className="otw-result">
      {missing ? (
        missingEl
      ) : (
        view && (
          <div className="otw-card" style={{ borderRadius: compact ? 14 : 16 }}>
            {/* ── 02. LE FACE-À-FACE ────────────────────────────────────────
                Scène crème, deux flacons sur socle. À gauche une silhouette
                neutre qui porte le nom en TEXTE (cadre légal : aucun logo,
                aucune forme de flacon de marque) ; au centre le sceau doré avec
                le niveau de proximité ; à droite le vrai packshot du jumeau. */}
            <div className="otw-stage">
              <div className="otw-stage-side">
                {bottleSilhouette(view.targetName)}
                <span className="otw-shadow" aria-hidden />
              </div>

              <div className="otw-seal-col">
                <span className="otw-seal" aria-hidden>
                  ≈
                </span>
                <span className="otw-seal-text">{strengthLabel[view.proximityStrength]}</span>
              </div>

              <div className="otw-stage-side">
                <div className="otw-packshot">
                  {view.product.video ? (
                    <TwinThumbVideo src={view.product.video} poster={view.product.image} name={view.product.name} />
                  ) : (
                    <Image
                      src={view.product.image}
                      alt={view.product.name}
                      fill
                      sizes="(max-width: 760px) 190px, 160px"
                      style={{ objectFit: "contain" }}
                    />
                  )}
                </div>
                <span className="otw-shadow otw-shadow-strong" aria-hidden />
              </div>
            </div>

            {/* Noms, prix et économie, alignés sous la scène */}
            <div className="otw-names">
              <div className="otw-name-col">
                <div className="otw-eyebrow">{t("you_like")}</div>
                <div className="otw-target-name">{view.targetName}</div>
                {/* ── 01. LE PRIX ÉCONOMISÉ ────────────────────────────────
                    Le prix de l'original n'est affiché que lorsqu'il est
                    CONNU (`reference-prices.ts`). Sans prix, rien : ni barré,
                    ni pourcentage. On n'invente pas un chiffre pour tenir une
                    maquette. */}
                {view.savings && (
                  <div className="otw-retail">
                    <span className="otw-retail-label">{t("retail_price_label")}</span>
                    <span className="otw-retail-price">{fmtApprox(view.savings.retail)}</span>
                  </div>
                )}
              </div>

              <div className="otw-name-col otw-name-col-twin">
                <div className="otw-eyebrow otw-eyebrow-gold">{t("the_twin")}</div>
                <div className="otw-twin-name">
                  {view.product.brand} · {view.product.name}
                </div>
                <div className="otw-price-row">
                  <span className="otw-price-big">{fmt(view.product.price)}</span>
                </div>
                {view.savings && (
                  <div className="otw-save">
                    <b>−{view.savings.percent} %</b>
                    {t("save_amount", { amount: fmtApprox(view.savings.saved) })}
                  </div>
                )}
                <div className="otw-meta">
                  <span className="otw-chip">{view.familyLabel}</span>
                </div>
              </div>
            </div>

            {/* ── 04. LE BADGE DE CONFIANCE ─────────────────────────────────
                Plein et doré quand la correspondance est relue ou sourcée ; en
                contour quand elle est calculée. Deux natures de résultat, deux
                promesses différentes. */}
            <div className={view.origin === "scored" ? "otw-trust otw-trust-soft" : "otw-trust otw-trust-solid"}>
              <span className="otw-trust-icon" aria-hidden>
                {view.origin === "scored" ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.goldDark} strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                    <path d="M8 11h6M11 8v6" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l2.4 2.1 3.2-.3.9 3.1 2.8 1.6-1.3 2.9 1.3 2.9-2.8 1.6-.9 3.1-3.2-.3L12 22l-2.4-2.1-3.2.3-.9-3.1-2.8-1.6 1.3-2.9-1.3-2.9 2.8-1.6.9-3.1 3.2.3z" />
                    <path d="M8.5 12.5l2.3 2.3 4.7-4.8" />
                  </svg>
                )}
              </span>
              <div className="otw-trust-text">
                <div className="otw-trust-title">
                  {view.origin === "scored" ? t("badge_scored") : t("badge_documented")}
                </div>
                <div className="otw-trust-sub">
                  {view.origin === "curated"
                    ? t("badge_curated_text")
                    : view.origin === "documented"
                      ? t("badge_documented_text")
                      : t("badge_scored_text", { count: view.accordsFound })}
                  {/* On NOMME la source plutôt que d'écrire « voir la source » :
                      « Source : Fragrantica » se juge sans cliquer. Le nom est
                      dérivé du domaine de l'URL déjà stockée ; sans URL
                      exploitable, ni mention ni lien — on n'invente pas de
                      source (voir `sourceNameOf`). */}
                  {view.origin !== "scored" && view.documentedSource && sourceNameOf(view.documentedSource) && (
                    <>
                      {" · "}
                      {t("badge_source")}
                      {" "}
                      <a
                        className="otw-trust-link"
                        href={view.documentedSource}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                      >
                        {sourceNameOf(view.documentedSource)}
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── 03. LA JAUGE DE PROXIMITÉ ─────────────────────────────────
                Le pourcentage et les trois paliers viennent du moteur
                (`proximity` / `proximityStrength`). Le badge unique « Profil
                très proche » posé sur tous les résultats a disparu : un
                rapprochement calculé ne peut plus atteindre le palier haut. */}
            <div className="otw-gauge">
              <div className="otw-gauge-head">
                <span className="otw-eyebrow otw-eyebrow-gold">{t("proximity_label")}</span>
                <span className="otw-gauge-pct">
                  {Math.round(view.proximity * 100)}
                  <i>%</i>
                </span>
                <span className={view.proximityStrength === "tres-proche" ? "otw-chip otw-chip-solid" : "otw-chip"}>
                  {strengthLabel[view.proximityStrength]}
                </span>
              </div>
              <div
                className="otw-bar"
                role="meter"
                aria-valuenow={Math.round(view.proximity * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t("proximity_label")}
              >
                <i style={{ width: `${Math.round(view.proximity * 100)}%` }} />
                <b style={{ left: `${Math.round(view.proximity * 100)}%` }} />
              </div>
              <div className="otw-ticks" aria-hidden>
                <span>{t("strength_related")}</span>
                <span>{t("strength_close")}</span>
                <span>{t("strength_very_close")}</span>
              </div>
              <p className="otw-gauge-why">
                {view.sameFamily
                  ? t("same_family", { family: view.referenceFamilyLabel })
                  : t("near_family", { from: view.referenceFamilyLabel, to: view.familyLabel })}
                {view.accordsTotal > 0 && (
                  <>
                    {" · "}
                    <b>{t("accords_found", { count: view.accordsFound, total: view.accordsTotal })}</b>
                  </>
                )}
              </p>
            </div>

            {/* Description + accords partagés, puis l'achat */}
            <div className="otw-foot">
              <div className="otw-foot-text">
                <p className="otw-desc">{view.description}</p>
                {view.sharedAccords.length > 0 && (
                  <p className="otw-accords">
                    {t("shared_accords")} · {view.sharedAccords.join(" · ")}
                  </p>
                )}
              </div>
              {/* Une seule action pleine — l'ajout au panier, prix rappelé
                  dessus (proposition 01). La fiche produit passe en contour. */}
              <div className="otw-buy">
                <QtyStepper value={qty} onChange={setQty} size="sm" locale={locale} />
                <button type="button" className="otw-btn otw-btn-primary" onClick={() => addToCart(view)}>
                  {addedKey === view.key ? t("added") : t("add_to_cart_price", { price: fmt(view.product.price) })}
                </button>
                <Link href={view.product.href} className="otw-btn otw-btn-ghost">
                  {t("see_product")}
                </Link>
              </div>
            </div>

            {/* ── 09. PARTAGER ──────────────────────────────────────────────
                Le résultat a une adresse : `/jumeau/<referenceId>`. Web Share
                quand le navigateur le propose, copie du lien sinon ; WhatsApp
                en lien direct, avec le nom et le prix dans le message. */}
            <div className="otw-share">
              <span className="otw-share-label">{t("share_label")}</span>
              <a
                className="otw-share-wa"
                href={`https://wa.me/?text=${encodeURIComponent(`${shareText(view)} ${shareUrl(view.referenceId)}`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1.1 2.7 11.4 11.4 0 0 0 4.4 3.9c1.6.7 2.2.7 3 .6a2.6 2.6 0 0 0 1.7-1.2 2 2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3z" />
                </svg>
                {t("share_whatsapp")}
              </a>
              <button type="button" className="otw-share-copy" onClick={() => void onShare(view)}>
                {copied ? t("share_copied") : t("share_copy")}
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );

  /**
   * ── 06. BARRE D'ACHAT COLLANTE (mobile) ────────────────────────────────────
   * Elle n'existe qu'en dessous de 760 px (règle CSS) et ne s'affiche que tant
   * que la carte de résultat est à l'écran : ailleurs sur la page elle
   * couvrirait le contenu sans rien vouloir dire.
   */
  const stickyEl = view && !missing && cardVisible && (
    <div className="otw-sticky" role="group" aria-label={t("add_to_cart")}>
      <div className="otw-sticky-text">
        <span className="otw-sticky-name">{view.product.name}</span>
        <span className="otw-sticky-price">{fmt(view.product.price)}</span>
      </div>
      <QtyStepper value={qty} onChange={setQty} size="sm" locale={locale} />
      <button type="button" className="otw-btn otw-btn-primary otw-sticky-btn" onClick={() => addToCart(view)}>
        {addedKey === view.key ? t("added") : t("add_to_cart")}
      </button>
    </div>
  );

  const legalEl = (
    <div style={{ display: "flex", alignItems: "flex-start", gap: compact ? 6 : 8, marginTop: compact ? 10 : 16 }}>
      <svg
        width={compact ? 12 : 15}
        height={compact ? 12 : 15}
        viewBox="0 0 24 24"
        fill="none"
        stroke={C.legal}
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
        style={{ flexShrink: 0, marginTop: 1 }}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: compact ? 10 : 11.5, color: C.legal, margin: 0, lineHeight: 1.4 }}>
        {t("legal")}
      </p>
    </div>
  );

  /**
   * Styles scoped.
   *
   * ATTENTION : aucun backtick dans ce bloc, il vit dans un template literal.
   */
  const pad = compact ? 14 : 22;
  const css = `
    @keyframes otwin-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(201,162,74,.45); } 50% { box-shadow: 0 0 0 7px rgba(201,162,74,0); } }
    .otwin-root { box-sizing: border-box; max-width: 100%; }
    .otwin-root *, .otwin-root *::before, .otwin-root *::after { box-sizing: border-box; }
    .otwin-q { animation: otwin-pulse 2.4s ease-in-out infinite; }

    .otw-combo { position: relative; }
    .otw-list { position: absolute; z-index: 30; top: calc(100% + 6px); left: 0; right: 0; margin: 0; padding: 6px; list-style: none;
      background: #fff; border: 1px solid ${C.searchBorder}; border-radius: 14px; box-shadow: 0 12px 30px rgba(58,44,20,.14);
      max-height: 340px; overflow-y: auto; }
    .otw-group { list-style: none; }
    /* En-tete de maison : l'autocompletion est REGROUPEE (proposition 05).
       Cinq « Aventus » d'affilee ne se lisaient pas ; la maison en surtitre les
       range, et l'etat du jumeau en bout de ligne dit lesquels menent quelque
       part. */
    .otw-house { font-family: var(--font-sans); font-size: 9.5px; letter-spacing: 1.3px; text-transform: uppercase;
      color: ${C.muted}; padding: 8px 12px 4px; }
    .otw-option { display: flex; align-items: center; gap: 10px; padding: 7px 10px; border-radius: 10px; cursor: pointer;
      font-family: var(--font-sans); font-size: 13.5px; color: ${C.ink}; }
    .otw-option-on { background: ${C.optionHover}; }
    /* Monogramme NEUTRE — la lettre de la maison, jamais son logo. */
    .otw-mono { flex: 0 0 auto; width: 28px; height: 28px; border-radius: 50%; background: ${C.stage};
      border: 1px solid ${C.border}; display: grid; place-items: center; font-family: var(--font-display);
      font-size: 14px; font-weight: 600; color: ${C.goldDark}; }
    .otw-option-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
    .otw-option-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .otw-option-meta { font-size: 11px; color: ${C.legal}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .otw-hit-ok { flex: 0 0 auto; font-size: 11px; font-weight: 600; color: ${C.goldDark}; white-space: nowrap; }
    .otw-hit-ok::before { content: "\\2713\\00a0"; }
    .otw-hit-ko { flex: 0 0 auto; font-size: 11px; color: ${C.legal}; white-space: nowrap; }
    .otw-empty { padding: 10px; font-family: var(--font-sans); font-size: 13px; color: ${C.muted}; }
    .otw-noresult { margin: 8px 2px 0; font-family: var(--font-sans); font-size: 12.5px; color: ${C.muted}; }

    /* ── Pastilles : vignette + prix (proposition 05) ─────────────────────
       DISPOSITION HORIZONTALE. Les pastilles se suivent sur une meme ligne et
       passent a la suivante quand elles debordent — elles ne s'empilent jamais
       une par ligne. Trois regles y suffisent et elles vont ensemble :
         - le conteneur enroule (flex-wrap: wrap) ;
         - chaque pastille garde sa largeur naturelle (flex: none) : sans cela
           un flex-basis la faisait s'etirer sur toute la ligne, d'ou le bord
           droit en dents de scie et la colonne de huit lignes ;
         - son contenu tient sur une seule ligne (white-space: nowrap), sinon le
           libelle se casse en deux et la pastille double de hauteur.
       Gabarit resserre (vignette 26 px, corps 11,5 px) pour qu'il en tienne
       plusieurs par rangee, y compris dans la colonne etroite de la vue
       compacte de l'accueil. */
    .otw-pills-wrap { max-width: 100%; margin-bottom: 12px; }
    .otw-pills { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 8px; max-width: 100%; }
    .otw-pill { flex: none; display: inline-flex; align-items: center; gap: 7px; white-space: nowrap;
      font-family: var(--font-sans); font-size: 11.5px; line-height: 1.2; cursor: pointer;
      padding: 3px 11px 3px 3px; border-radius: 999px; border: 1px solid ${C.pillBorder}; background: #fff;
      color: ${C.pillText}; transition: border-color .2s, background .2s; max-width: 100%; }
    .otw-pill:hover { border-color: ${C.gold}; background: ${C.optionHover}; }
    /* Pastille active : fond encre, liseré or. */
    .otw-pill-on { border-color: ${C.gold}; background: ${C.pillSelBg}; color: ${C.pillSelText}; }
    .otw-pill-on:hover { background: ${C.pillSelBg}; border-color: ${C.gold}; }
    .otw-pill-thumb { flex: 0 0 auto; width: 26px; height: 26px; border-radius: 50%; overflow: hidden; background: ${C.stage};
      border: 1px solid ${C.border}; display: grid; place-items: center; }
    .otw-pill-mono { font-family: var(--font-display); font-size: 13px; font-weight: 600; color: ${C.goldDark}; }
    .otw-pill-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .otw-pill-price { flex: 0 0 auto; font-weight: 600; color: ${C.goldDark}; white-space: nowrap; }
    .otw-pill-on .otw-pill-price { color: ${C.pillSelText}; }

    .otw-card { max-width: 100%; display: flex; flex-direction: column; background: #fff;
      border: 0.5px solid ${C.border}; box-shadow: 0 8px 24px rgba(58,44,20,.05); overflow: hidden; }

    /* ── 02. La scene du face-a-face ──────────────────────────────────────
       Fond creme en degrade radial, deux socles, un sceau au centre. Le flacon
       de gauche est une SILHOUETTE NEUTRE : aucun logo, aucune forme de flacon
       de marque — le nom en texte, comme partout ailleurs dans le module. */
    .otw-stage { display: grid; grid-template-columns: 1fr auto 1fr; align-items: end; gap: 10px;
      background: radial-gradient(ellipse at 50% 120%, #F3EADB 0%, #FDFBF6 62%);
      border-bottom: 1px solid ${C.border}; padding: ${compact ? 20 : 28}px ${compact ? 14 : 26}px 0; }
    .otw-stage-side { min-width: 0; text-align: center; }
    .otw-shadow { display: block; height: 12px; margin: 6px 22px 0; border-radius: 50%;
      background: radial-gradient(ellipse, rgba(58,44,20,.16), transparent 70%); }
    .otw-shadow-strong { background: radial-gradient(ellipse, rgba(58,44,20,.22), transparent 70%); }

    .otw-silhouette { position: relative; width: ${compact ? 86 : 104}px; height: ${compact ? 118 : 142}px; margin: 0 auto; }
    .otw-sil-body { position: absolute; left: 12px; right: 12px; top: 32px; bottom: 0; border-radius: 10px 10px 12px 12px;
      background: linear-gradient(160deg, #F3EADB, #E5DAC6); border: 1px solid #D8C9AE; }
    .otw-sil-neck { position: absolute; left: 38%; right: 38%; top: 21px; height: 13px; background: #D8C9AE; border-radius: 3px; }
    .otw-sil-cap { position: absolute; left: 33%; right: 33%; top: 0; height: 23px;
      background: linear-gradient(#4A3826, #241A12); border-radius: 5px; }
    .otw-sil-label { position: absolute; left: 20px; right: 20px; top: 62px; bottom: 22px; background: #fff;
      border: 1px solid #E5DAC6; border-radius: 3px; display: grid; place-items: center; text-align: center;
      font-family: var(--font-display); font-size: ${compact ? 9 : 10}px; letter-spacing: .6px; text-transform: uppercase;
      color: ${C.muted}; line-height: 1.15; padding: 2px; overflow: hidden; }

    .otw-seal-col { text-align: center; padding-bottom: ${compact ? 26 : 34}px; }
    .otw-seal { display: grid; place-items: center; width: ${compact ? 52 : 66}px; height: ${compact ? 52 : 66}px;
      margin: 0 auto; border-radius: 50%; background: linear-gradient(140deg, #E5C06A, #C8901E 55%, #9C6A1A);
      color: #fff; font-family: var(--font-display); font-size: ${compact ? 26 : 32}px; font-weight: 600;
      box-shadow: 0 10px 24px rgba(156,106,26,.35); }
    .otw-seal-text { display: block; margin-top: 8px; font-family: var(--font-sans); font-size: 9px; letter-spacing: 1.2px;
      text-transform: uppercase; color: ${C.goldLabel}; line-height: 1.3; }

    .otw-packshot { position: relative; width: 100%; max-width: ${compact ? 128 : 160}px; height: ${compact ? 118 : 148}px;
      margin: 0 auto; filter: drop-shadow(0 12px 16px rgba(0,0,0,.16)); }

    /* Noms et prix, alignes sous la scene */
    .otw-names { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: ${compact ? 14 : 18}px ${compact ? 14 : 26}px 0; }
    .otw-name-col { min-width: 0; }
    .otw-eyebrow { font-family: var(--font-sans); font-size: 9.5px; letter-spacing: 1.3px; text-transform: uppercase;
      color: ${C.muted}; margin-bottom: 5px; }
    .otw-eyebrow-gold { color: ${C.goldLabel}; }
    .otw-target-name, .otw-twin-name { font-family: var(--font-display); font-size: ${compact ? 18 : 20}px; font-weight: 500;
      color: ${C.ink}; line-height: 1.2; text-wrap: balance; overflow-wrap: break-word; }
    /* ── 01. Le prix economise ─────────────────────────────────────────────
       « Prix boutique constate », indicatif et barre. N'apparait QUE si le prix
       de l'original est connu : pas de chiffre invente. */
    .otw-retail { margin-top: 6px; font-family: var(--font-sans); font-size: 11.5px; color: ${C.muted}; line-height: 1.5; }
    .otw-retail-label { display: block; font-size: 9.5px; letter-spacing: .8px; text-transform: uppercase; color: ${C.legal}; }
    .otw-retail-price { text-decoration: line-through; color: ${C.strike}; font-size: 13px; }
    .otw-price-row { display: flex; align-items: baseline; gap: 8px; margin-top: 4px; flex-wrap: wrap; }
    .otw-price-big { font-family: var(--font-display); font-size: ${compact ? 26 : 32}px; font-weight: 600; color: ${C.ink}; line-height: 1; }
    .otw-save { margin-top: 8px; display: inline-flex; align-items: center; gap: 7px; border-radius: 999px; padding: 5px 13px;
      background: linear-gradient(100deg, #9C6A1A, #C8901E 60%, #E5C06A); color: #fff;
      font-family: var(--font-sans); font-size: 11px; font-weight: 500; letter-spacing: .3px; }
    .otw-save b { font-family: var(--font-display); font-size: 16px; font-weight: 600; }
    .otw-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
    .otw-chip { font-family: var(--font-sans); font-size: 10px; letter-spacing: .3px; line-height: 1.6;
      border-radius: 999px; padding: 3px 10px; border: 1px solid ${C.tagBorder}; background: ${C.tagBg}; color: ${C.goldDark};
      white-space: nowrap; }
    .otw-chip-solid { background: ${C.pillSelBg}; border-color: ${C.pillSelBg}; color: ${C.pillSelText}; }

    /* ── 04. Le badge de confiance ────────────────────────────────────────── */
    .otw-trust { display: flex; align-items: center; gap: 10px; border-radius: 12px; padding: 9px 13px;
      margin: ${compact ? 12 : 16}px ${compact ? 14 : 26}px 0; }
    .otw-trust-solid { background: linear-gradient(100deg, #9C6A1A, #C8901E 60%, #E5C06A); color: #fff; }
    .otw-trust-soft { border: 1.5px solid ${C.tagBorder}; background: #fff; color: ${C.goldDark}; }
    .otw-trust-icon { flex: 0 0 auto; display: grid; place-items: center; }
    .otw-trust-text { min-width: 0; }
    .otw-trust-title { font-family: var(--font-sans); font-size: 11px; font-weight: 600; letter-spacing: .7px; text-transform: uppercase; }
    .otw-trust-sub { font-family: var(--font-sans); font-size: 11.5px; line-height: 1.4; margin-top: 2px; }
    .otw-trust-solid .otw-trust-sub { opacity: .93; }
    .otw-trust-soft .otw-trust-sub { color: ${C.muted}; }
    .otw-trust-link { color: inherit; text-decoration: underline; }

    /* ── 03. La jauge de proximite ────────────────────────────────────────── */
    .otw-gauge { margin: ${compact ? 12 : 16}px ${compact ? 14 : 26}px 0; }
    .otw-gauge-head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
    .otw-gauge-head .otw-eyebrow { margin-bottom: 0; }
    .otw-gauge-pct { font-family: var(--font-display); font-size: ${compact ? 30 : 38}px; font-weight: 600; line-height: 1; color: ${C.ink}; }
    .otw-gauge-pct i { font-size: ${compact ? 16 : 20}px; font-style: normal; }
    .otw-bar { position: relative; height: 10px; border-radius: 999px; margin: 12px 0 6px;
      background: linear-gradient(90deg, #EFE7D8 0 33%, #F6EAC8 33% 66%, #EFD79B 66%); }
    .otw-bar i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 999px;
      background: linear-gradient(90deg, #9C6A1A, #C8901E, #E5C06A); }
    .otw-bar b { position: absolute; top: 50%; width: 17px; height: 17px; border-radius: 50%; background: #fff;
      border: 3px solid #8A6A1E; transform: translate(-50%, -50%); box-shadow: 0 2px 6px rgba(0,0,0,.2); }
    .otw-ticks { display: flex; justify-content: space-between; font-family: var(--font-sans); font-size: 9px;
      letter-spacing: .9px; text-transform: uppercase; color: ${C.legal}; }
    .otw-gauge-why { font-family: var(--font-sans); font-size: 12px; color: ${C.muted}; margin: 9px 0 0; line-height: 1.45; }
    .otw-gauge-why b { color: ${C.goldDark}; }

    .otw-foot { margin: ${compact ? 12 : 16}px ${compact ? 14 : 26}px 0; padding-top: 14px; border-top: 1px solid ${C.border};
      display: flex; align-items: flex-end; gap: 14px; flex-wrap: wrap; }
    .otw-foot-text { flex: 1 1 220px; min-width: 0; }
    /* Trois lignes, pas cinq : le paragraphe vient de la fiche produit, ou il a
       toute la place ; ici il partage la carte avec le prix, la jauge et deux
       boutons. On coupe a l'affichage, jamais dans la donnee. */
    .otw-desc { font-family: var(--font-sans); font-size: 12.5px; color: ${C.muted}; margin: 0; line-height: 1.55;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .otw-accords { font-family: var(--font-sans); font-size: 11px; color: ${C.goldLabel}; margin: 5px 0 0; line-height: 1.4; overflow-wrap: anywhere; }
    .otw-buy { flex: 0 1 auto; min-width: 0; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .otw-btn { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; height: 40px;
      padding: 0 18px; border-radius: 999px; cursor: pointer; text-decoration: none; white-space: nowrap;
      font-family: var(--font-sans); font-size: 10.5px; font-weight: 600; letter-spacing: .9px; text-transform: uppercase;
      transition: background .2s, border-color .2s, color .2s; border: 1px solid transparent; }
    .otw-btn-primary { border-color: ${C.goldCta}; background: ${C.goldCta}; color: #fff; }
    .otw-btn-primary:hover { background: ${C.goldDark}; border-color: ${C.goldDark}; }
    .otw-btn-ghost { border-color: ${C.tagBorder}; background: transparent; color: ${C.goldDark}; }
    .otw-btn-ghost:hover { border-color: ${C.gold}; background: ${C.tagBg}; }

    /* ── 09. Partager ─────────────────────────────────────────────────────── */
    .otw-share { display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      margin: 12px ${compact ? 14 : 26}px ${compact ? 14 : 20}px; }
    .otw-share-label { font-family: var(--font-sans); font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: ${C.legal}; }
    .otw-share-wa { display: inline-flex; align-items: center; gap: 6px; background: ${C.whatsapp}; color: #fff;
      border-radius: 999px; padding: 6px 13px; font-family: var(--font-sans); font-size: 11.5px; font-weight: 600;
      text-decoration: none; }
    .otw-share-wa:hover { filter: brightness(.94); }
    .otw-share-copy { display: inline-flex; align-items: center; gap: 6px; border: 1px solid ${C.tagBorder}; background: #fff;
      color: ${C.ink}; border-radius: 999px; padding: 6px 13px; font-family: var(--font-sans); font-size: 11.5px; cursor: pointer; }
    .otw-share-copy:hover { border-color: ${C.gold}; background: ${C.tagBg}; }

    /* ── Ecran « pas encore de jumeau » ───────────────────────────────────── */
    .otw-none { background: #fff; border: 1px solid ${C.searchBorder}; border-radius: 14px; padding: 20px 18px;
      box-shadow: 0 10px 26px rgba(58,44,20,.07); text-align: center; max-width: 100%; overflow: hidden; }
    .otw-none-mark { display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 50%;
      background: ${C.tagBg}; border: 1px solid ${C.tagBorder}; margin-bottom: 10px; }
    .otw-none-eyebrow { font-family: var(--font-sans); font-size: 10px; letter-spacing: 1.4px; text-transform: uppercase;
      color: ${C.goldLabel}; margin-bottom: 6px; }
    .otw-none-title { font-family: var(--font-display); font-size: 22px; font-weight: 500; line-height: 1.2;
      color: ${C.ink}; margin: 0 0 8px; overflow-wrap: anywhere; }
    .otw-none-text { font-family: var(--font-sans); font-size: 12.5px; line-height: 1.55; color: ${C.muted};
      margin: 0 auto 14px; max-width: 44ch; }
    .otw-none-form { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin: 0 auto; max-width: 420px; }
    .otw-none-input { flex: 1 1 200px; min-width: 0; border: 1px solid ${C.searchBorder}; border-radius: 999px;
      padding: 11px 16px; font-family: var(--font-sans); font-size: 13px; color: ${C.ink}; background: ${C.stage};
      outline: none; transition: border-color .2s, background .2s; }
    .otw-none-input::placeholder { color: ${C.legal}; }
    .otw-none-input:focus { border-color: ${C.gold}; background: #fff; }
    .otw-none-submit { flex: 0 0 auto; border: none; cursor: pointer; border-radius: 999px; padding: 11px 20px;
      font-family: var(--font-sans); font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
      color: #fff; background: ${C.goldCta}; transition: background .2s; }
    .otw-none-submit:hover { background: ${C.goldDark}; }
    .otw-none-error { font-family: var(--font-sans); font-size: 11.5px; color: ${C.goldDark}; margin: 8px 0 0; }
    .otw-none-micro { font-family: var(--font-sans); font-size: 10.5px; color: ${C.legal}; margin: 10px 0 0; }
    .otw-none-done { display: inline-flex; align-items: center; gap: 8px; text-align: start; margin: 0 auto;
      font-family: var(--font-sans); font-size: 12.5px; line-height: 1.5; color: ${C.ink};
      background: ${C.tagBg}; border: 1px solid ${C.tagBorder}; border-radius: 14px; padding: 10px 14px; max-width: 44ch; }
    .otw-none-check { flex: 0 0 auto; display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%;
      background: ${C.goldCta}; }

    /* La barre collante n'existe qu'en mobile. */
    .otw-sticky { display: none; }

    @media (max-width: 760px) {
      /* La barre d'achat collante fait ~63 px : sans ce coussin elle masque la
         rangee de partage et la mention legale en fin de section. !important
         parce que le rembourrage de la section est pose en style en ligne (il
         depend du variant) et primerait sinon. */
      .otwin-root { padding-bottom: 104px !important; }

      /* ── 06. LES PASTILLES EN CARROUSEL ─────────────────────────────────
         A 390 px, huit pastilles a deux colonnes prenaient trois rangees et
         repoussaient la carte — le coeur du module — hors de l'ecran. Elles
         defilent desormais sur UNE ligne, alignees sur le bord de la carte
         bord a bord, et l'on voit le flacon avant de choisir. Le debordement
         est contenu par le conteneur (overflow-x auto), la page ne defile pas
         horizontalement. */
      /* PLEINE LARGEUR : calc(50% - 50vw) ramène le bloc au bord de la fenêtre
         quel que soit le rembourrage des pages qui hébergent la section — celui
         du module (22 px), celui de la page (24 px sur les previews), celui de
         la section d'accueil. La marge s'annule d'elle-même : elle vaut
         exactement la distance jusqu'au bord, jamais plus, donc la page ne
         défile pas horizontalement. max-width: none est indispensable, sinon la
         largeur reste plafonnée à celle du conteneur et le bloc se contente de
         glisser vers la gauche. */
      .otw-pills-wrap { margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); max-width: none; }
      .otw-pills { flex-wrap: nowrap; overflow-x: auto; scroll-snap-type: x proximity; max-width: none;
        padding: 2px 16px 6px; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
      .otw-pills::-webkit-scrollbar { display: none; }
      .otw-pill { scroll-snap-align: start; max-width: 74vw; }

      /* ── 06. LA CARTE BORD A BORD ───────────────────────────────────────
         On annule le rembourrage de la section pour que la scene touche les
         deux bords ; le flacon peut alors etre montre en grand. */
      .otw-card { margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); max-width: none;
        border-radius: 0 !important; border-left: none; border-right: none; }
      /* La silhouette et le sceau passent a la trappe : a 390 px, ils volent la
         place du seul visuel qui compte — le vrai flacon. L'original reste
         nomme, avec son prix barre, juste en dessous. */
      .otw-stage { grid-template-columns: 1fr; padding: 16px 16px 0; }
      .otw-stage-side:first-child, .otw-seal-col { display: none; }
      .otw-packshot { max-width: 200px; height: 176px; }
      .otw-names { grid-template-columns: 1fr; gap: 10px; padding: 12px 16px 0; }
      .otw-trust, .otw-gauge, .otw-foot { margin-left: 16px; margin-right: 16px; }
      .otw-share { margin: 12px 16px 16px; }
      .otw-target-name, .otw-twin-name { font-size: 19px; }

      .otw-none { padding: 16px 14px; }
      .otw-none-title { font-size: 19px; }
      .otw-none-form { max-width: none; }
      .otw-none-input, .otw-none-submit { flex: 1 1 100%; width: 100%; }

      .otw-foot { flex-direction: column; flex-wrap: nowrap; align-items: stretch; gap: 12px; }
      .otw-foot-text, .otw-buy { flex: 0 0 auto; }
      .otw-buy { width: 100%; }
      .otw-btn-primary { flex: 1 1 auto; }
      .otw-btn-ghost { flex: 1 1 100%; }

      /* ── 06. LE BOUTON D'ACHAT QUI SUIT ─────────────────────────────────
         Prix, quantite et « Ajouter » restent a portee de pouce tant que la
         carte est a l'ecran. Il disparait des qu'on l'a depassee : ailleurs
         sur la page il masquerait le contenu sans rien vouloir dire. */
      .otw-sticky { display: flex; position: fixed; left: 0; right: 0; bottom: 0; z-index: 60;
        align-items: center; gap: 10px; padding: 10px 14px calc(10px + env(safe-area-inset-bottom, 0px));
        background: rgba(255,255,255,.96); backdrop-filter: blur(8px); border-top: 1px solid ${C.border};
        box-shadow: 0 -8px 24px rgba(58,44,20,.10); }
      .otw-sticky-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
      .otw-sticky-name { font-family: var(--font-sans); font-size: 10.5px; color: ${C.muted};
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .otw-sticky-price { font-family: var(--font-display); font-size: 19px; font-weight: 600; line-height: 1.1; color: ${C.ink}; }
      .otw-sticky-btn { flex: 0 0 auto; height: 42px; padding: 0 18px; }
    }
    @media (prefers-reduced-motion: reduce) { .otwin-q { animation: none; } }
  `;

  return (
    <div
      ref={rootRef}
      className="otwin-root"
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        background: C.stage,
        border: `0.5px solid ${C.border}`,
        borderRadius: compact ? 14 : 16,
        padding: pad,
        // RÉSERVE EN BAS pour le mobilier flottant de la page. Le bouton
        // « Choisir mon parfum » et la bulle WhatsApp sont en `position: fixed`
        // à 85–88 px du bas de la fenêtre : quand la section s'arrête pile là,
        // ils recouvrent sa dernière ligne — sur la capture, la fin de la jauge
        // et le palier « Profil très proche ». Ce coussin garantit qu'en fin de
        // défilement le contenu passe au-dessus d'eux. En mobile il tient aussi
        // compte de notre propre barre d'achat collante (voir la media query).
        paddingBottom: pad + 60,
        textAlign: isRTL ? "right" : "left",
      }}
    >
      <style>{css}</style>
      {/* ORDRE DE LECTURE, identique dans les deux variants et sur les quatre
          pages où la section est montée : la QUESTION d'abord (le champ, puis
          les pastilles), la RÉPONSE ensuite. La vue compacte posait la carte
          dans une colonne de droite, à la même hauteur que le champ : on voyait
          la réponse avant d'avoir vu la question, et la colonne de gauche ne
          servait qu'à porter huit pastilles. Sur `/jumeau/<id>` le résultat est
          déjà résolu à l'ouverture, mais le champ reste en tête — il sert à
          relancer une autre comparaison. */}
      {compact ? hookEl : introEl}
      {searchEl}
      {pillsEl}
      {resultEl}
      {legalEl}
      {stickyEl}
    </div>
  );
}
