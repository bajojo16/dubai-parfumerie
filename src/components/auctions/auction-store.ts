"use client";

/**
 * Magasin des enchères — toute la mécanique, sans une ligne de JSX.
 *
 * Pourquoi un module à part : la page, les cartes et le panneau ne font
 * qu'AFFICHER ; les règles (pas, prolongation, enchère max, enchérisseurs
 * simulés, persistance) vivent ici et se lisent d'un bloc. C'est aussi ce
 * qu'il faudra remplacer par des appels serveur le jour où l'enchère devient
 * réelle — l'interface ne bougera pas.
 *
 * Persistance : localStorage `dp_encheres_v1`, avec repli mémoire si le
 * stockage est indisponible (navigation privée stricte, quota…).
 *
 * ⚠️ DÉMONSTRATION ⚠️ Les concurrents sont simulés (`DEMO_BIDDERS`). Ils
 * relancent sur les lots où le visiteur mène, jamais dans les 30 dernières
 * secondes (on le laisse gagner), jamais au-delà de 1,6 × le prix boutique.
 */

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  AUCTION_LOTS,
  DEFAULT_VISITOR_NAME,
  DEMO_BIDDERS,
  MAX_DEMO_RATIO,
  SNIPE_EXTEND_MS,
  SNIPE_WINDOW_MS,
  stepFor,
  type AuctionLot,
} from "@/data/auctions";

export const STORAGE_KEY = "dp_encheres_v1";

/* ── Types ──────────────────────────────────────────────────────────────── */

export interface Bid {
  amount: number;
  /** Pseudonyme affiché. Les enchères du visiteur portent `mine: true`. */
  bidder: string;
  at: number;
  mine: boolean;
  /** Posée par le système au nom du visiteur (enchère max). */
  auto?: boolean;
}

export interface LotState {
  slug: string;
  endsAt: number;
  bids: Bid[];
  /** Plafond du visiteur (proxy bidding), null si aucun. */
  myMax: number | null;
  reminder: boolean;
  /** La notification 5 min a été émise — on ne la répète pas. */
  reminded: boolean;
  /** Les confettis ont été tirés — une seule fois par lot remporté. */
  celebrated: boolean;
}

export interface Store {
  v: 1;
  seededAt: number;
  visitorName: string;
  lots: Record<string, LotState>;
}

export type LotStatus = "open" | "leading" | "outbid" | "won" | "ended";

export interface LotView {
  lot: AuctionLot;
  state: LotState;
  /** Prix courant : dernière enchère, sinon mise à prix. */
  price: number;
  /** Prochain montant minimal. */
  nextBid: number;
  step: number;
  remainingMs: number;
  status: LotStatus;
  hasBids: boolean;
}

/* ── Utilitaires ────────────────────────────────────────────────────────── */

const round2 = (n: number) => Math.round(n * 100) / 100;

function pickBidder(exclude?: string): string {
  const pool = DEMO_BIDDERS.filter((b) => b !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Historique de départ (DÉMONSTRATION) : 0 à 3 enchères déjà posées, pour que
 * la salle ne paraisse pas vide à l'arrivée. Le nombre dépend du lot (les
 * clôtures proches ont plus d'activité), les horodatages sont dans le passé.
 */
function seedBids(lot: AuctionLot, now: number, index: number): Bid[] {
  const count = Math.max(0, 3 - Math.floor(index / 2)); // 3,3,2,2,1,1
  const bids: Bid[] = [];
  let price = lot.startingBid;
  let last: string | undefined;
  for (let i = 0; i < count; i++) {
    if (i > 0) price = round2(price + stepFor(price));
    const bidder = pickBidder(last);
    last = bidder;
    bids.push({ amount: price, bidder, at: now - (count - i) * (17 + index * 9) * 60 * 1000, mine: false });
  }
  return bids;
}

function freshLot(lot: AuctionLot, now: number, index: number): LotState {
  return {
    slug: lot.slug,
    endsAt: now + lot.endsInMs,
    bids: seedBids(lot, now, index),
    myMax: null,
    reminder: false,
    reminded: false,
    celebrated: false,
  };
}

function freshStore(now: number): Store {
  const lots: Record<string, LotState> = {};
  AUCTION_LOTS.forEach((lot, i) => {
    lots[lot.slug] = freshLot(lot, now, i);
  });
  return { v: 1, seededAt: now, visitorName: DEFAULT_VISITOR_NAME, lots };
}

/**
 * Charge le magasin, ou le crée. Un lot clos depuis plus de 24 h est ressemé
 * (nouvelle clôture, nouvel historique) : la maquette tourne en boucle plutôt
 * que d'afficher six « Terminée » à un visiteur qui revient la semaine
 * suivante. Un lot ajouté au catalogue depuis la dernière visite est semé.
 */
function loadStore(now: number): Store {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    /* stockage indisponible : on repart d'un magasin en mémoire */
  }
  if (!raw) return freshStore(now);
  try {
    const parsed = JSON.parse(raw) as Store;
    if (!parsed || parsed.v !== 1 || typeof parsed.lots !== "object") return freshStore(now);
    const lots: Record<string, LotState> = {};
    AUCTION_LOTS.forEach((lot, i) => {
      const prev = parsed.lots[lot.slug];
      const stale = prev && now - prev.endsAt > 24 * 60 * 60 * 1000;
      lots[lot.slug] = prev && !stale ? { ...freshLot(lot, now, i), ...prev, bids: prev.bids ?? [] } : freshLot(lot, now, i);
    });
    return { v: 1, seededAt: parsed.seededAt ?? now, visitorName: parsed.visitorName || DEFAULT_VISITOR_NAME, lots };
  } catch {
    return freshStore(now);
  }
}

function saveStore(store: Store) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* repli silencieux : l'état vit en mémoire le temps de la visite */
  }
}

export const priceOf = (lot: AuctionLot, state: LotState) =>
  state.bids.length ? state.bids[state.bids.length - 1].amount : lot.startingBid;

/** Montant minimal de la prochaine enchère (sans enchère : la mise à prix elle-même). */
export const nextBidOf = (lot: AuctionLot, state: LotState) => {
  const price = priceOf(lot, state);
  return state.bids.length ? round2(price + stepFor(price)) : price;
};

export function statusOf(lot: AuctionLot, state: LotState, now: number): LotStatus {
  const last = state.bids[state.bids.length - 1];
  const ended = now >= state.endsAt;
  if (ended) return last?.mine ? "won" : "ended";
  if (!last) return "open";
  if (last.mine) return "leading";
  return state.bids.some((b) => b.mine) ? "outbid" : "open";
}

export function toView(lot: AuctionLot, state: LotState, now: number): LotView {
  const price = priceOf(lot, state);
  return {
    lot,
    state,
    price,
    nextBid: nextBidOf(lot, state),
    step: stepFor(price),
    remainingMs: Math.max(0, state.endsAt - now),
    status: statusOf(lot, state, now),
    hasBids: state.bids.length > 0,
  };
}

/* ── Réducteur ──────────────────────────────────────────────────────────── */

/* État du réducteur : le magasin + un drapeau « hydraté » (jamais persisté).
   Le drapeau vit ICI et non dans un useState : le régler depuis l'effet
   d'hydratation serait un setState dans un effet, et il change de toute façon
   au même instant que le magasin. */
interface Slice {
  store: Store;
  hydrated: boolean;
}

type Action =
  | { type: "hydrate"; store: Store }
  | { type: "bid"; slug: string; amount: number; now: number; auto?: boolean }
  | { type: "rivalBid"; slug: string; now: number }
  | { type: "setMax"; slug: string; max: number | null; now: number }
  | { type: "setReminder"; slug: string; on: boolean }
  | { type: "markReminded"; slug: string }
  | { type: "markCelebrated"; slug: string }
  | { type: "setVisitorName"; name: string };

/** Prolongation anti-sniping : commune aux enchères du visiteur et des concurrents. */
function extendIfSniped(endsAt: number, now: number): number {
  return endsAt - now <= SNIPE_WINDOW_MS ? endsAt + SNIPE_EXTEND_MS : endsAt;
}

function withBid(store: Store, slug: string, bid: Bid, now: number): Store {
  const state = store.lots[slug];
  return {
    ...store,
    lots: {
      ...store.lots,
      [slug]: { ...state, bids: [...state.bids, bid], endsAt: extendIfSniped(state.endsAt, now) },
    },
  };
}

/**
 * Après une enchère concurrente : si le visiteur a fixé un plafond qui le
 * permet, le système surenchérit d'un pas en son nom. C'est tout ce qu'est
 * l'« enchère max » — pas de secret, la règle est écrite sur la page.
 */
function applyProxy(store: Store, slug: string, lot: AuctionLot, now: number): Store {
  const state = store.lots[slug];
  const last = state.bids[state.bids.length - 1];
  if (!last || last.mine || state.myMax === null) return store;
  const next = nextBidOf(lot, state);
  if (next > state.myMax) return store;
  return withBid(store, slug, { amount: next, bidder: store.visitorName, at: now, mine: true, auto: true }, now);
}

function reducer(slice: Slice, action: Action): Slice {
  if (action.type === "hydrate") return { store: action.store, hydrated: true };
  const next = reduceStore(slice.store, action);
  return next === slice.store ? slice : { ...slice, store: next };
}

function reduceStore(store: Store, action: Action): Store {
  switch (action.type) {

    case "bid": {
      const lot = AUCTION_LOTS.find((l) => l.slug === action.slug);
      const state = store.lots[action.slug];
      if (!lot || !state || action.now >= state.endsAt) return store;
      const min = nextBidOf(lot, state);
      const amount = round2(action.amount);
      if (amount < min) return store;
      return withBid(store, action.slug, { amount, bidder: store.visitorName, at: action.now, mine: true, auto: action.auto }, action.now);
    }

    case "rivalBid": {
      const lot = AUCTION_LOTS.find((l) => l.slug === action.slug);
      const state = store.lots[action.slug];
      if (!lot || !state || action.now >= state.endsAt) return store;
      const last = state.bids[state.bids.length - 1];
      // Un concurrent ne relance que si le visiteur mène — c'est la tension
      // qu'on veut créer, pas un bruit de fond sur les lots qu'il ignore.
      if (!last?.mine) return store;
      const price = priceOf(lot, state);
      // Parfois deux pas d'un coup : les vrais enchérisseurs ne montent pas tous d'un cran.
      const steps = Math.random() < 0.25 ? 2 : 1;
      const amount = round2(price + stepFor(price) * steps);
      if (amount > lot.shopPrice * MAX_DEMO_RATIO) return store;
      const rival = { amount, bidder: pickBidder(), at: action.now, mine: false };
      return applyProxy(withBid(store, action.slug, rival, action.now), action.slug, lot, action.now);
    }

    case "setMax": {
      const lot = AUCTION_LOTS.find((l) => l.slug === action.slug);
      const state = store.lots[action.slug];
      if (!lot || !state) return store;
      const max = action.max === null ? null : round2(action.max);
      let next: Store = { ...store, lots: { ...store.lots, [action.slug]: { ...state, myMax: max } } };
      // Fixer un plafond alors qu'on ne mène pas revient à enchérir tout de
      // suite du minimum : sinon le plafond ne servirait qu'après la prochaine
      // relance d'un tiers, ce qui n'est pas ce qu'attend un visiteur.
      if (max !== null && action.now < state.endsAt) {
        const last = state.bids[state.bids.length - 1];
        const min = nextBidOf(lot, state);
        if (!last?.mine && min <= max) {
          next = withBid(next, action.slug, { amount: min, bidder: store.visitorName, at: action.now, mine: true, auto: true }, action.now);
        }
      }
      return next;
    }

    case "setReminder": {
      const state = store.lots[action.slug];
      if (!state) return store;
      return { ...store, lots: { ...store.lots, [action.slug]: { ...state, reminder: action.on, reminded: false } } };
    }

    case "markReminded": {
      const state = store.lots[action.slug];
      if (!state) return store;
      return { ...store, lots: { ...store.lots, [action.slug]: { ...state, reminded: true } } };
    }

    case "markCelebrated": {
      const state = store.lots[action.slug];
      if (!state) return store;
      return { ...store, lots: { ...store.lots, [action.slug]: { ...state, celebrated: true } } };
    }

    case "setVisitorName":
      return { ...store, visitorName: action.name.trim() || DEFAULT_VISITOR_NAME };

    default:
      return store;
  }
}

/* ── Hook ───────────────────────────────────────────────────────────────── */

/** Délai avant une relance simulée : 20 à 90 s. */
const RIVAL_MIN_MS = 20_000;
const RIVAL_MAX_MS = 90_000;
/** Aucune relance simulée dans les 30 dernières secondes : on laisse gagner. */
const RIVAL_QUIET_MS = 30_000;

export function useAuctions() {
  // `now` bat à la seconde : c'est lui qui fait vivre les comptes à rebours
  // et recalculer les statuts. Un seul intervalle pour toute la page.
  const [now, setNow] = useState(() => Date.now());
  const [{ store, hydrated }, dispatch] = useReducer(reducer, null, () => ({ store: freshStore(Date.now()), hydrated: false }));

  useEffect(() => {
    dispatch({ type: "hydrate", store: loadStore(Date.now()) });
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Sauvegarde à chaque changement, une fois hydraté (avant, on écraserait
  // le vrai magasin avec la graine par défaut).
  useEffect(() => {
    if (hydrated) saveStore(store);
  }, [store, hydrated]);

  const views = useMemo(
    () => AUCTION_LOTS.map((lot) => toView(lot, store.lots[lot.slug], now)),
    [store, now]
  );

  /* Enchérisseurs simulés (DÉMONSTRATION). Un minuteur par lot où le visiteur
     mène ; réarmé après chaque relance ; annulé dès qu'il ne mène plus. */
  const timers = useRef<Record<string, number>>({});
  // Le minuteur lit l'état AU MOMENT où il tire, pas celui capturé à l'armement.
  const storeRef = useRef(store);
  useEffect(() => {
    storeRef.current = store;
  }, [store]);
  const leadingKey = views
    .filter((v) => v.status === "leading")
    .map((v) => `${v.lot.slug}:${v.state.bids.length}`)
    .join("|");

  useEffect(() => {
    if (!hydrated) return;
    const leading = new Set(views.filter((v) => v.status === "leading").map((v) => v.lot.slug));
    // Annule les minuteurs des lots où le visiteur ne mène plus.
    Object.keys(timers.current).forEach((slug) => {
      if (!leading.has(slug)) {
        window.clearTimeout(timers.current[slug]);
        delete timers.current[slug];
      }
    });
    leading.forEach((slug) => {
      if (timers.current[slug]) return;
      const delay = RIVAL_MIN_MS + Math.random() * (RIVAL_MAX_MS - RIVAL_MIN_MS);
      timers.current[slug] = window.setTimeout(() => {
        delete timers.current[slug];
        const t = Date.now();
        const state = storeRef.current.lots[slug];
        if (!state || state.endsAt - t <= RIVAL_QUIET_MS) return;
        dispatch({ type: "rivalBid", slug, now: t });
      }, delay);
    });
    // Le minuteur d'un lot est réarmé quand le nombre d'enchères change (clé).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadingKey, hydrated]);

  useEffect(() => () => Object.values(timers.current).forEach((id) => window.clearTimeout(id)), []);

  const bid = useCallback((slug: string, amount: number) => dispatch({ type: "bid", slug, amount, now: Date.now() }), []);
  const setMax = useCallback((slug: string, max: number | null) => dispatch({ type: "setMax", slug, max, now: Date.now() }), []);
  const setReminder = useCallback((slug: string, on: boolean) => dispatch({ type: "setReminder", slug, on }), []);
  const markReminded = useCallback((slug: string) => dispatch({ type: "markReminded", slug }), []);
  const markCelebrated = useCallback((slug: string) => dispatch({ type: "markCelebrated", slug }), []);
  const setVisitorName = useCallback((name: string) => dispatch({ type: "setVisitorName", name }), []);

  return { now, hydrated, store, views, bid, setMax, setReminder, markReminded, markCelebrated, setVisitorName };
}

/**
 * « Enchères du jour » (DÉMONSTRATION) : enchères horodatées depuis minuit,
 * tous lots confondus, simulées incluses — dérivé de l'historique plutôt que
 * compté à part, pour que le chiffre du héros et les listes disent la même chose.
 */
export function bidsToday(store: Store, now: number): number {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const from = start.getTime();
  return Object.values(store.lots).reduce((n, l) => n + l.bids.filter((b) => b.at >= from).length, 0);
}

/* ── Formatage ──────────────────────────────────────────────────────────── */

export const fmtPrice = (n: number) =>
  `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

/** « 1 j 04 h » au-delà d'un jour, « 04:12:09 » en dessous. */
export function fmtRemaining(ms: number): string {
  if (ms <= 0) return "Terminée";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (d > 0) return `${d} j ${pad(h)} h ${pad(m)} min`;
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

/** « il y a 3 min » — l'historique n'a pas besoin de la seconde. */
export function fmtAgo(at: number, now: number): string {
  const s = Math.max(0, Math.floor((now - at) / 1000));
  if (s < 60) return "à l'instant";
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.floor(h / 24)} j`;
}
