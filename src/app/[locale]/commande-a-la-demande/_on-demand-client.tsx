"use client";

/**
 * Commande à la demande — partie interactive.
 *
 * Quatre blocs dans un même composant, parce qu'ils partagent le même état
 * (la demande en cours) : le choix de la maison, la recherche du parfum avec
 * sa fiche, le panier de demande avec les coordonnées, et la rangée des
 * demandes fréquentes qui alimente le panier d'un clic.
 *
 * Chargement différé obligatoire : `reference-perfumes.ts` pèse 792 Ko et
 * `search-catalog.ts` agrège tout le catalogue produit. Ni l'un ni l'autre
 * n'est importé statiquement — un `import()` dynamique les récupère après le
 * montage, dans un chunk séparé (même motif que `OlfactiveTwin`). Tant qu'ils
 * ne sont pas là, la page reste utilisable : les maisons viennent de
 * `on-demand-catalog.ts` (quelques kilo-octets) et un parfum peut être ajouté
 * en saisie libre. L'autocomplétion, la fiche et le prix indicatif arrivent
 * avec les données.
 *
 * Maquette : l'envoi du formulaire ne quitte pas le navigateur (console.log
 * + écran de confirmation). Le bouton WhatsApp, lui, ouvre une vraie
 * conversation avec le numéro du service client (`lib/contact`).
 *
 * Cadre légal : maisons citées nominativement, texte seul. On commande des
 * flacons authentiques — jamais « clone », « copie », « dupe », « équivalent ».
 */

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import type { ReferenceFamily, ReferencePerfume } from "@/data/reference-perfumes";
import {
  FREQUENT_REQUEST_IDS,
  LEAD_TIME,
  PARTNER_HOUSES,
  QUOTE_DELAY,
  SIZE_OPTIONS,
  selectOnDemand,
  sizeLabel,
  type PartnerHouse,
  type SizeValue,
} from "@/data/on-demand-catalog";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { SectionHeading } from "@/components/on-demand/SectionHeading";
import { WHATSAPP_URL } from "@/lib/contact";

// ─── Constantes ──────────────────────────────────────────────────────────────

/** Clé de persistance de la demande en cours. `v2` : la forme a changé (les
 *  lignes portent désormais nom, maison et contenance, plus seulement un id). */
const STORAGE_KEY = "dp_ondemand_v2";

/** Suggestions affichées sous le champ de recherche. */
const MAX_SUGGESTIONS = 8;

/**
 * Un lien wa.me au-delà de ~2000 caractères est refusé par plusieurs
 * navigateurs et tronqué par WhatsApp : on plafonne le texte ENCODÉ à 1800,
 * ce qui laisse la place au préfixe de l'URL.
 */
const WHATSAPP_ENCODED_BUDGET = 1800;

/** Libellé affiché quand le visiteur n'a pas choisi de maison en saisie libre. */
const UNKNOWN_HOUSE = "Maison à préciser";

const GENDER_LABEL: Record<ReferencePerfume["gender"], string> = {
  femme: "Femme",
  homme: "Homme",
  mixte: "Mixte",
};

// ─── Types ───────────────────────────────────────────────────────────────────

/** Une entrée de la base, enrichie de sa clé de recherche calculée une fois. */
type Entry = ReferencePerfume & { searchKey: string };

/** Ce que la boutique tient déjà en rayon pour un nom + une maison donnés. */
type StockMatch = { price?: number; image?: string; href: string };

/** Base et outils arrivent ensemble, ou pas du tout. */
type Catalog = {
  entries: Entry[];
  byId: Map<string, Entry>;
  norm: (text: string | undefined | null) => string;
  familyLabel: Record<ReferenceFamily, string>;
  stock: (name: string, house: string) => StockMatch | undefined;
};

/**
 * Une ligne de la demande. `refId` est présent quand le parfum vient de la
 * base ; absent en saisie libre. Nom et maison sont recopiés dans la ligne
 * pour que le panier s'affiche AVANT l'arrivée du chunk de données.
 */
type RequestLine = {
  key: string;
  refId?: string;
  name: string;
  house: string;
  qty: number;
  size: SizeValue;
};

type Channel = "email" | "whatsapp";

type FormState = {
  firstName: string;
  email: string;
  phone: string;
  channel: Channel;
  message: string;
  consent: boolean;
};

type FormErrors = Partial<Record<keyof FormState | "lines", string>>;

const EMPTY_FORM: FormState = {
  firstName: "",
  email: "",
  phone: "",
  channel: "whatsapp",
  message: "",
  consent: false,
};

// ─── Persistance ─────────────────────────────────────────────────────────────
// La demande survit à un rechargement : c'est une commande en cours de
// rédaction, la perdre parce qu'on est allé vérifier un nom ailleurs serait
// pénible. Les coordonnées, elles, ne sont PAS stockées (données personnelles).

const SIZE_VALUES = new Set<string>(SIZE_OPTIONS.map((s) => s.value));

function readStoredLines(): RequestLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (l): l is RequestLine =>
          !!l && typeof l.key === "string" && typeof l.name === "string" && typeof l.house === "string" && typeof l.qty === "number",
      )
      .map((l) => ({
        ...l,
        qty: Math.min(99, Math.max(1, Math.round(l.qty))),
        size: SIZE_VALUES.has(l.size) ? l.size : "any",
      }));
  } catch {
    return [];
  }
}

function writeStoredLines(lines: RequestLine[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* quota plein ou stockage refusé : la demande reste utilisable en mémoire */
  }
}

// ─── Utilitaires ─────────────────────────────────────────────────────────────

/** Initiales de la maison — même règle que la page « Marques ». */
function monogram(house: string): string {
  const words = house.split(/\s+/).filter((w) => w.length > 2 || /^[A-Z]/.test(w));
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return house.slice(0, 2).toUpperCase();
}

const fmtPrice = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

/**
 * Assemble le message WhatsApp en respectant un budget de caractères ENCODÉS.
 * Une liste longue produit une URL que le navigateur coupe en silence : on
 * retire les dernières lignes nous-mêmes, on le dit dans le message ET à
 * l'écran. Un lien mort serait pire qu'une liste partielle.
 */
function fitMessage(header: string, rows: string[], footer: string, maxEncoded: number) {
  const compose = (kept: number) => {
    const omitted = rows.length - kept;
    const tail =
      omitted > 0
        ? "\n(+ " + omitted + " autre" + (omitted > 1 ? "s" : "") + " référence" + (omitted > 1 ? "s" : "") + " que ce lien ne peut pas transporter — je vous les envoie juste après.)"
        : "";
    return header + "\n\n" + rows.slice(0, kept).join("\n") + tail + "\n\n" + footer;
  };
  const fits = (kept: number) => encodeURIComponent(compose(kept)).length <= maxEncoded;
  if (fits(rows.length)) return { text: compose(rows.length), omitted: 0 };
  // Dichotomie : le message grandit de façon monotone avec le nombre de lignes.
  let low = 0;
  let high = rows.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (fits(mid)) low = mid;
    else high = mid - 1;
  }
  return { text: compose(low), omitted: rows.length - low };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9 ().-]{6,20}$/;

function validate(form: FormState, lineCount: number): FormErrors {
  const errors: FormErrors = {};
  if (lineCount === 0) errors.lines = "Ajoutez au moins un parfum à votre demande.";
  if (form.firstName.trim().length < 2) errors.firstName = "Indiquez votre prénom.";
  if (!EMAIL_RE.test(form.email.trim())) errors.email = "Indiquez une adresse e-mail valide.";
  const phone = form.phone.trim();
  if (form.channel === "whatsapp" && !phone) errors.phone = "Votre numéro est nécessaire pour une réponse par WhatsApp.";
  else if (phone && !PHONE_RE.test(phone)) errors.phone = "Ce numéro ne semble pas valide.";
  if (!form.consent) errors.consent = "Merci de confirmer que vous avez compris les conditions.";
  return errors;
}

// ─── Sous-composants de présentation ─────────────────────────────────────────

/** Logo rond de la maison, ou monogramme quand le repo n'a pas le logo. */
function HouseMark({ house, size = 36 }: { house: PartnerHouse | undefined | string; size?: number }) {
  const h = typeof house === "string" ? PARTNER_HOUSES.find((p) => p.name === house) : house;
  const name = typeof house === "string" ? house : house?.name ?? "";
  if (h?.logo) {
    return (
      <Image
        // Version détourée et resserrée du logo (`/brands/marks/`) : le fichier
        // de carte garde 15 % de marge, et à 30 px un logo fin y disparaissait —
        // quatre puces sur dix-sept sortaient blanches.
        src={h.logo.replace("/brands/", "/brands/marks/")}
        // Servi tel quel, sans l'optimiseur : 240 px pour une puce de 30, le gain
        // serait nul — et les premières puces ont été servies pendant que ces
        // fichiers n'existaient pas encore, le navigateur a gardé ces 404 de
        // `/_next/image` en cache. L'URL directe les contourne.
        unoptimized
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flex: "0 0 auto", border: "1px solid var(--line-200)" }}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        flex: "0 0 auto",
        borderRadius: "50%",
        border: "1px solid var(--line-300)",
        background: "var(--surface-white)",
        fontFamily: "var(--font-display)",
        fontSize: size * 0.36,
        letterSpacing: ".04em",
        color: "var(--gold-700)",
      }}
    >
      {monogram(name)}
    </span>
  );
}

/** Sur-titre de bloc : « Étape A · La maison ». */
function BlockLabel({ step, children }: { step: string; children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: "0 0 12px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "var(--font-sans)",
        fontSize: "var(--t-xs)",
        fontWeight: "var(--fw-medium)",
        letterSpacing: "var(--ls-wider)",
        textTransform: "uppercase",
        color: "var(--ink-500)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "var(--gold-500)",
          color: "var(--espresso-900)",
          fontFamily: "var(--font-display)",
          fontSize: "0.85rem",
          letterSpacing: 0,
        }}
      >
        {step}
      </span>
      {children}
    </p>
  );
}

function SizeSelect({
  id,
  value,
  onChange,
  compact = false,
}: {
  id?: string;
  value: SizeValue;
  onChange: (v: SizeValue) => void;
  compact?: boolean;
}) {
  return (
    <select
      id={id}
      aria-label={id ? undefined : "Contenance souhaitée"}
      value={value}
      onChange={(e) => onChange(e.target.value as SizeValue)}
      className="dp-odc-select"
      style={{ height: compact ? 36 : 46, fontSize: compact ? 13 : 15, paddingInline: compact ? "10px 28px" : "14px 34px" }}
    >
      {SIZE_OPTIONS.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

// ─── Composant ───────────────────────────────────────────────────────────────

export function OnDemandClient() {
  const uid = useId();
  const locale = useLocale();
  const listboxId = uid + "-listbox";

  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [failed, setFailed] = useState(false);

  // Sélection
  const [house, setHouse] = useState("");
  const [allHouses, setAllHouses] = useState(false);
  // Recherche dans les maisons : à 60 puces, on ne balaie plus des yeux, on tape.
  const [houseLetter, setHouseLetter] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [picked, setPicked] = useState<Entry | null>(null);
  const [pickSize, setPickSize] = useState<SizeValue>("any");
  const [pickQty, setPickQty] = useState(1);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  // Demande
  const [lines, setLines] = useState<RequestLine[]>([]);
  const hydrated = useRef(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState<{ lines: RequestLine[]; form: FormState } | null>(null);

  const boxRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // ── Relecture de la demande enregistrée.
  // Après le montage, jamais en état initial : le serveur rend une demande
  // vide et un état initial lu dans localStorage créerait un décalage
  // d'hydratation. Différée d'un tick pour que la relecture soit une vraie
  // synchronisation avec un système externe (règle react-hooks/set-state-in-effect)
  // et non un second rendu enchaîné au premier.
  useEffect(() => {
    let alive = true;
    const t = window.setTimeout(() => {
      if (!alive) return;
      setLines(readStoredLines());
      hydrated.current = true;
    }, 0);
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, []);

  // Enregistrement : jamais avant la relecture, sinon on écraserait la liste
  // stockée par le tableau vide du premier rendu.
  useEffect(() => {
    if (hydrated.current) writeStoredLines(lines);
  }, [lines]);

  // ── Chargement différé de la base et du catalogue boutique
  useEffect(() => {
    let alive = true;
    Promise.all([import("@/data/reference-perfumes"), import("@/data/search-catalog")])
      .then(([base, search]) => {
        if (!alive) return;
        const entries: Entry[] = selectOnDemand(base.REFERENCE_PERFUMES).map((p) => ({
          ...p,
          searchKey: search.norm(p.name + " " + p.house),
        }));
        entries.sort((a, b) => a.name.localeCompare(b.name, "fr") || a.house.localeCompare(b.house, "fr"));
        const byId = new Map<string, Entry>();
        for (const e of entries) byId.set(e.id, e);

        // Index du catalogue boutique par nom normalisé. La maison est
        // comparée de façon souple (« Reef » / « Reef Perfumes ») : les
        // sources écrivent la marque de plusieurs façons.
        const stockByName = new Map<string, typeof search.SEARCH_PRODUCTS>();
        for (const p of search.SEARCH_PRODUCTS) {
          const list = stockByName.get(p.keyName) ?? [];
          list.push(p);
          stockByName.set(p.keyName, list);
        }
        const stock = (name: string, houseName: string): StockMatch | undefined => {
          const hk = search.norm(houseName);
          const hit = stockByName.get(search.norm(name))?.find((p) => p.keyBrand.includes(hk) || hk.includes(p.keyBrand));
          return hit ? { price: hit.price, image: hit.image, href: hit.href } : undefined;
        };

        setCatalog({ entries, byId, norm: search.norm, familyLabel: base.FAMILY_LABELS, stock });
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Clic à l'extérieur : referme la liste de suggestions sans rien changer.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Le message « Ajouté » s'efface seul.
  useEffect(() => {
    if (!justAdded) return;
    const t = window.setTimeout(() => setJustAdded(null), 2600);
    return () => window.clearTimeout(t);
  }, [justAdded]);

  // ── Dérivations ────────────────────────────────────────────────────────────

  const visibleHouses = useMemo(() => {
    const q = query
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    // Le champ du parfum est aussi celui des maisons : une seule recherche pour
    // les deux. Elle cherche dans TOUTES les maisons, repliées ou pas — taper
    // « rehab » pour tomber sur « aucune maison » parce que la liste était
    // réduite serait un piège.
    if (q) {
      return PARTNER_HOUSES.filter((h) =>
        h.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q),
      );
    }
    // Une lettre choisie filtre la liste complète, comme la recherche.
    if (houseLetter) return PARTNER_HOUSES.filter((h) => h.name[0].toUpperCase() === houseLetter);
    return allHouses ? PARTNER_HOUSES : PARTNER_HOUSES.filter((h) => !!h.logo);
  }, [allHouses, query, houseLetter]);

  /** Les lettres qui ont au moins une maison : les autres sont grisées, pas cachées, pour garder l'alphabet lisible. */
  const houseLetters = useMemo(() => new Set(PARTNER_HOUSES.map((h) => h.name[0].toUpperCase())), []);

  const suggestions = useMemo(() => {
    if (!catalog || query.trim().length < 2) return [];
    const key = catalog.norm(query);
    // Deux passes : les noms qui COMMENCENT par la saisie d'abord, les autres
    // correspondances ensuite. Sans ça, « yara » proposait « Aiyara Pour
    // Homme » avant « Yara », par simple ordre alphabétique.
    const starts: Entry[] = [];
    const contains: Entry[] = [];
    for (const e of catalog.entries) {
      if (!e.searchKey.includes(key)) continue;
      if (catalog.norm(e.name).startsWith(key)) starts.push(e);
      else contains.push(e);
    }
    // La maison cochée est une préférence, pas un mur : « kham » avec Afnan
    // cochée doit trouver Khamrah (Lattafa). Ses résultats passent devant, les
    // autres suivent — et la recherche reste commune aux deux blocs.
    const rank = (e: Entry) => (house && e.house === house ? 0 : 1);
    const byHouse = (a: Entry, b: Entry) => rank(a) - rank(b);
    return [...starts.sort(byHouse), ...contains.sort(byHouse)].slice(0, MAX_SUGGESTIONS);
  }, [catalog, query, house]);

  const hi = suggestions.length ? Math.min(highlight, suggestions.length - 1) : 0;

  /** Nombre de références connues pour la maison choisie — affiché sous le champ. */
  const houseCount = useMemo(() => {
    if (!catalog || !house) return null;
    let n = 0;
    for (const e of catalog.entries) if (e.house === house) n++;
    return n;
  }, [catalog, house]);

  const lineKeys = useMemo(() => new Set(lines.map((l) => l.key)), [lines]);
  const totalUnits = lines.reduce((n, l) => n + l.qty, 0);

  const pickedStock = useMemo(() => (picked && catalog ? catalog.stock(picked.name, picked.house) : undefined), [picked, catalog]);

  const frequent = useMemo(() => {
    if (!catalog) return [];
    return FREQUENT_REQUEST_IDS.map((id) => catalog.byId.get(id))
      .filter((e): e is Entry => !!e)
      .map((e) => ({ entry: e, stock: catalog.stock(e.name, e.house) }));
  }, [catalog]);

  /**
   * Les cinq parfums les plus connus de la maison cochée. « Connu » se lit sur ce
   * que la boutique tient : un flacon en rayon, avec sa photo, passe devant une
   * référence de la base sans stock. À égalité, l'ordre de la base.
   */
  const houseTop = useMemo(() => {
    if (!catalog || !house) return [];
    return catalog.entries
      .filter((e) => e.house === house)
      .map((e) => ({ entry: e, stock: catalog.stock(e.name, e.house) }))
      .sort((a, b) => Number(!!b.stock?.image) - Number(!!a.stock?.image) || Number(!!b.stock) - Number(!!a.stock))
      .slice(0, 5);
  }, [catalog, house]);

  /** Saisie libre proposée quand le texte tapé n'est pas exactement une entrée connue. */
  const freeText = query.trim();
  const freeTextIsKnown = !!catalog && suggestions.some((s) => catalog.norm(s.name) === catalog.norm(freeText));
  const showFreeText = freeText.length >= 2 && !picked && !freeTextIsKnown;

  // ── Actions ────────────────────────────────────────────────────────────────

  const addLine = useCallback((line: Omit<RequestLine, "qty" | "size"> & Partial<Pick<RequestLine, "qty" | "size">>) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.key === line.key);
      // Même parfum déjà dans la demande : on cumule la quantité plutôt que de
      // créer une seconde ligne que la boutique devrait fusionner à la main.
      if (existing) {
        return prev.map((l) => (l.key === line.key ? { ...l, qty: Math.min(99, l.qty + (line.qty ?? 1)) } : l));
      }
      return [...prev, { ...line, qty: line.qty ?? 1, size: line.size ?? "any" }];
    });
    setErrors((e) => ({ ...e, lines: undefined }));
    setJustAdded(line.name);
  }, []);

  const addPicked = useCallback(() => {
    if (!picked) return;
    addLine({ key: picked.id, refId: picked.id, name: picked.name, house: picked.house, qty: pickQty, size: pickSize });
    setPicked(null);
    setQuery("");
    setPickQty(1);
    setPickSize("any");
  }, [picked, pickQty, pickSize, addLine]);

  const addFreeText = useCallback(() => {
    if (freeText.length < 2) return;
    const h = house || UNKNOWN_HOUSE;
    const key = "free:" + (catalog ? catalog.norm(freeText) : freeText.toLowerCase()) + "@" + h.toLowerCase();
    addLine({ key, name: freeText, house: h, qty: pickQty, size: pickSize });
    setQuery("");
    setOpen(false);
    setPickQty(1);
    setPickSize("any");
  }, [freeText, house, catalog, pickQty, pickSize, addLine]);

  const addEntry = useCallback(
    (e: Entry) => addLine({ key: e.id, refId: e.id, name: e.name, house: e.house }),
    [addLine],
  );

  const removeLine = useCallback((key: string) => setLines((prev) => prev.filter((l) => l.key !== key)), []);
  const setLineQty = useCallback((key: string, qty: number) => setLines((prev) => prev.map((l) => (l.key === key ? { ...l, qty } : l))), []);
  const setLineSize = useCallback((key: string, size: SizeValue) => setLines((prev) => prev.map((l) => (l.key === key ? { ...l, size } : l))), []);

  const pick = useCallback((e: Entry) => {
    setPicked(e);
    setQuery(e.name);
    setOpen(false);
    // La maison suit le parfum choisi : le champ reste cohérent avec la fiche.
    setHouse(e.house);
  }, []);

  const onQuery = useCallback((value: string) => {
    setQuery(value);
    setPicked(null);
    setHighlight(0);
    setOpen(value.trim().length >= 2);
  }, []);

  const onHouse = useCallback((value: string) => {
    setHouse(value);
    setPicked(null);
    setOpen(false);
  }, []);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (open && suggestions.length) pick(suggestions[hi]);
      else if (showFreeText) addFreeText();
      return;
    }
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    }
  };

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate(form, lines.length);
    const hasError = Object.values(errs).some(Boolean);
    setErrors(errs);
    if (hasError) {
      // Focus sur le premier champ en erreur : sur mobile, l'erreur est souvent
      // hors écran. Différé d'un tick : `aria-invalid` n'est posé qu'au rendu
      // suivant, un querySelector immédiat ne trouverait rien.
      window.setTimeout(() => {
        const first = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
        first?.focus();
      }, 0);
      return;
    }
    const payload = { lines, form: { ...form, phone: form.phone.trim(), email: form.email.trim(), firstName: form.firstName.trim() } };
    // Maquette : aucun backend. La demande est tracée en console et l'écran de
    // confirmation prend le relais.
    console.log("[commande-a-la-demande] demande enregistrée (maquette, aucun envoi réseau)", payload);
    setSubmitted(payload);
    setLines([]);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const resetAll = () => {
    setSubmitted(null);
    setPicked(null);
    setQuery("");
    setHouse("");
  };

  // ── Lien WhatsApp ──────────────────────────────────────────────────────────

  const whatsapp = useMemo(() => {
    if (!lines.length) return null;
    const rows = lines.map(
      (l, i) => i + 1 + ". " + l.name + " — " + l.house + " · " + sizeLabel(l.size) + (l.qty > 1 ? " · x" + l.qty : ""),
    );
    const who = form.firstName.trim() ? " Je suis " + form.firstName.trim() + "." : "";
    const { text, omitted } = fitMessage(
      "Bonjour," + who + " Je souhaite passer une commande à la demande pour :",
      rows,
      (form.message.trim() ? form.message.trim() + "\n\n" : "") + "Merci de me confirmer le prix et le délai (" + LEAD_TIME + " annoncés).",
      WHATSAPP_ENCODED_BUDGET,
    );
    return { href: WHATSAPP_URL + "?text=" + encodeURIComponent(text), omitted };
  }, [lines, form.firstName, form.message]);

  // ── Rendu ──────────────────────────────────────────────────────────────────

  const statusText = failed
    ? "Le répertoire n'a pas pu être chargé : tapez le nom du parfum tel quel, nous le retrouverons."
    : !catalog
      ? "Chargement du répertoire des maisons du Golfe… vous pouvez déjà saisir un nom."
      : house
        ? houseCount
          ? houseCount + " référence" + (houseCount > 1 ? "s" : "") + " " + house + " dans notre répertoire — tapez un nom, ou saisissez-le librement."
          : "Nous n'avons pas encore répertorié " + house + " : saisissez le nom du parfum, nous le faisons venir quand même."
        : "Tapez un nom : la fiche s'affiche s'il est dans notre répertoire.";

  return (
    <div className="dp-odc" style={{ maxWidth: "var(--container)", margin: "0 auto", padding: "clamp(24px, 3vw, 40px) var(--gutter) clamp(48px, 6vw, 80px)" }}>
      <SectionHeading
        eyebrow="Votre demande"
        title="Composez votre demande"
        subtitle={"Choisissez la maison, nommez le parfum, indiquez la contenance souhaitée. Nous revenons vers vous sous " + QUOTE_DELAY + " avec le prix confirmé et le délai."}
      />

      {submitted ? (
        /* ── Confirmation ── */
        <div className="dp-odc-done" role="status" aria-live="polite">
          <span className="dp-odc-done-mark" aria-hidden>
            ✓
          </span>
          <h3 className="dp-odc-done-title">Demande enregistrée, merci {submitted.form.firstName.trim()}.</h3>
          <p className="dp-odc-done-text">
            Nous vérifions la disponibilité et le prix auprès de la maison et vous répondons sous {QUOTE_DELAY}{" "}
            {submitted.form.channel === "whatsapp" ? "par WhatsApp au " + submitted.form.phone.trim() : "par e-mail à " + submitted.form.email.trim()}.
            Rien n&apos;est engagé avant votre validation ; comptez ensuite {LEAD_TIME} de livraison.
          </p>
          <ul className="dp-odc-done-list">
            {submitted.lines.map((l) => (
              <li key={l.key}>
                <span className="dp-odc-line-name">{l.name}</span>
                <span className="dp-odc-line-meta">
                  {l.house} · {sizeLabel(l.size)} · x{l.qty}
                </span>
              </li>
            ))}
          </ul>
          <button type="button" className="dp-odc-btn-ghost" onClick={resetAll}>
            Composer une nouvelle demande
          </button>
        </div>
      ) : (
        <div className="dp-odc-grid">
          {/* ══ Colonne 1 : la maison, le parfum, les demandes fréquentes ══ */}
          <div className="dp-odc-col" style={{ minWidth: 0 }}>
            {/* ── A. Le parfum — d'abord : qui arrive ici a un nom en tête, la maison se déduit ── */}
            <div className="dp-odc-block">
              <BlockLabel step="A">Le parfum ou la marque</BlockLabel>
              <div ref={boxRef} className="dp-odc-searchbox">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--gold-700)" strokeWidth="1.7" aria-hidden className="dp-odc-searchicon">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.6-3.6" />
                </svg>
                <input
                  id={uid + "-input"}
                  type="search"
                  role="combobox"
                  aria-expanded={open && suggestions.length > 0}
                  aria-controls={listboxId}
                  aria-autocomplete="list"
                  aria-activedescendant={open && suggestions.length ? uid + "-opt-" + hi : undefined}
                  aria-label="Nom du parfum"
                  placeholder={house ? "Nom du parfum " + house + ", ou une autre marque…" : "Un parfum ou une marque — Khamrah, Lattafa, Sauvage…"}
                  value={query}
                  onChange={(e) => onQuery(e.target.value)}
                  onFocus={() => setOpen(query.trim().length >= 2 && !picked)}
                  onKeyDown={onKeyDown}
                  className="dp-odc-input"
                  autoComplete="off"
                />
                {query ? (
                  <button type="button" onClick={() => onQuery("")} aria-label="Effacer" className="dp-odc-clear">
                    ×
                  </button>
                ) : null}

                <ul id={listboxId} role="listbox" aria-label="Suggestions" className="dp-odc-listbox" hidden={!open || suggestions.length === 0}>
                  {suggestions.map((s, i) => (
                    <li
                      key={s.id}
                      id={uid + "-opt-" + i}
                      role="option"
                      aria-selected={i === hi}
                      className={"dp-odc-opt" + (i === hi ? " is-active" : "")}
                      onMouseEnter={() => setHighlight(i)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(s)}
                    >
                      <HouseMark house={s.house} size={28} />
                      <span className="dp-odc-opt-text">
                        <span className="dp-odc-opt-name">{s.name}</span>
                        <span className="dp-odc-opt-meta">
                          {s.house} · {catalog?.familyLabel[s.family]}
                        </span>
                      </span>
                      {lineKeys.has(s.id) ? <span className="dp-odc-opt-mark">Déjà ajouté</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="dp-odc-status" aria-live="polite">
                {statusText}
              </p>

              {/* Fiche du parfum reconnu */}
              {picked ? (
                <div className="dp-odc-sheet">
                  <div className="dp-odc-sheet-head">
                    <HouseMark house={picked.house} size={44} />
                    <div style={{ minWidth: 0, flex: "1 1 auto" }}>
                      <p className="dp-odc-sheet-house">{picked.house}</p>
                      <h3 className="dp-odc-sheet-name">{picked.name}</h3>
                    </div>
                  </div>
                  <ul className="dp-odc-tags">
                    <li>{GENDER_LABEL[picked.gender]}</li>
                    <li>{catalog?.familyLabel[picked.family]}</li>
                    {picked.year ? <li>{picked.year}</li> : null}
                  </ul>
                  <p className="dp-odc-accords">
                    <span className="dp-odc-accords-label">Accords</span> {picked.accords.join(" · ")}
                  </p>
                  <p className="dp-odc-estimate">
                    {pickedStock?.price ? (
                      <>
                        Prix boutique indicatif : <strong>{fmtPrice(pickedStock.price)}</strong> —{" "}
                        <Link href={pickedStock.href} className="dp-odc-inlink">
                          déjà en rayon, voir la fiche
                        </Link>
                      </>
                    ) : (
                      <>Prix confirmé sous {QUOTE_DELAY}, avant toute validation.</>
                    )}
                  </p>
                  <div className="dp-odc-addrow">
                    <label className="dp-odc-field-inline">
                      <span>Contenance</span>
                      <SizeSelect value={pickSize} onChange={setPickSize} />
                    </label>
                    <label className="dp-odc-field-inline">
                      <span>Quantité</span>
                      <QtyStepper value={pickQty} onChange={setPickQty} size="sm" locale={locale} />
                    </label>
                    <button type="button" className="dp-odc-btn" onClick={addPicked}>
                      Ajouter à ma demande
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Saisie libre : le parfum n'est pas (ou pas encore) dans le répertoire */}
              {showFreeText ? (
                <div className="dp-odc-free">
                  <p className="dp-odc-free-text">
                    {suggestions.length ? "Aucune de ces suggestions ? " : catalog ? "Ce parfum n'est pas dans notre répertoire. " : ""}
                    Ajoutez <strong>« {freeText} »</strong>
                    {house ? (
                      <>
                        {" "}
                        de <strong>{house}</strong>
                      </>
                    ) : (
                      " (maison à préciser dans votre message)"
                    )}{" "}
                    tel quel : nous le retrouverons auprès de la maison.
                  </p>
                  <div className="dp-odc-addrow">
                    <label className="dp-odc-field-inline">
                      <span>Contenance</span>
                      <SizeSelect value={pickSize} onChange={setPickSize} />
                    </label>
                    <label className="dp-odc-field-inline">
                      <span>Quantité</span>
                      <QtyStepper value={pickQty} onChange={setPickQty} size="sm" locale={locale} />
                    </label>
                    <button type="button" className="dp-odc-btn-outline" onClick={addFreeText}>
                      Ajouter en saisie libre
                    </button>
                  </div>
                </div>
              ) : null}

              {justAdded ? (
                <p className="dp-odc-toast" role="status">
                  « {justAdded} » ajouté à votre demande.
                </p>
              ) : null}
            </div>

            {/* ── B. La maison — filtre optionnel, partagé avec la recherche du parfum ── */}
            <div className="dp-odc-block">
              <BlockLabel step="B">La maison</BlockLabel>
              <div className="dp-odc-alpha" role="group" aria-label="Filtrer par initiale">
                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => (
                  <button
                    key={l}
                    type="button"
                    className={"dp-odc-alpha-btn" + (houseLetter === l ? " is-on" : "")}
                    disabled={!houseLetters.has(l)}
                    aria-pressed={houseLetter === l}
                    onClick={() => setHouseLetter(houseLetter === l ? "" : l)}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div className="dp-odc-houses" role="group" aria-label="Maisons partenaires">
                <button
                  type="button"
                  className={"dp-odc-chip" + (house === "" ? " is-on" : "")}
                  aria-pressed={house === ""}
                  onClick={() => onHouse("")}
                >
                  <span className="dp-odc-chip-all" aria-hidden>
                    ✦
                  </span>
                  <span className="dp-odc-chip-name">Toutes les maisons</span>
                </button>
                {visibleHouses.map((h) => (
                  <button
                    key={h.name}
                    type="button"
                    className={"dp-odc-chip" + (house === h.name ? " is-on" : "")}
                    aria-pressed={house === h.name}
                    onClick={() => onHouse(house === h.name ? "" : h.name)}
                    title={h.country ? h.name + " — " + h.country : h.name}
                  >
                    <HouseMark house={h} size={30} />
                    <span className="dp-odc-chip-name">{h.name}</span>
                  </button>
                ))}
              </div>
              {house && houseTop.length > 0 && (
                <div className="dp-odc-housetop">
                  <p className="dp-odc-status" style={{ marginTop: 0 }}>Les plus connus chez {house} — un clic les ajoute.</p>
                  <ul className="dp-odc-freq">
                    {houseTop.map(({ entry, stock }) => {
                      const on = lineKeys.has(entry.id);
                      return (
                        <li key={entry.id} className="dp-odc-freq-card">
                          <div className="dp-odc-freq-media">
                            {stock?.image ? (
                              <Image src={stock.image} alt={entry.name + " — " + entry.house} fill sizes="(max-width: 760px) 45vw, 180px" style={{ objectFit: "cover" }} />
                            ) : (
                              <span className="dp-odc-freq-mark"><HouseMark house={entry.house} size={52} /></span>
                            )}
                          </div>
                          <p className="dp-odc-freq-house">{entry.house}</p>
                          <p className="dp-odc-freq-name">{entry.name}</p>
                          <p className="dp-odc-freq-meta">
                            {catalog?.familyLabel[entry.family]}
                            {stock?.price ? " · " + fmtPrice(stock.price) : ""}
                          </p>
                          <button type="button" className={"dp-odc-freq-btn" + (on ? " is-on" : "")} onClick={() => (on ? removeLine(entry.id) : addEntry(entry))} aria-pressed={on}>
                            {on ? "✓ Dans ma demande" : "+ Ajouter"}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {visibleHouses.length === 0 && (
                <p className="dp-odc-hint">Aucune maison ne correspond — choisissez « Toutes les maisons » et saisissez le parfum librement.</p>
              )}
              {!query.trim() && !houseLetter && (
              <button type="button" className="dp-odc-linkbtn" onClick={() => setAllHouses((v) => !v)} aria-expanded={allHouses}>
                {allHouses ? "Réduire la liste" : "Afficher les " + PARTNER_HOUSES.length + " maisons partenaires"}
              </button>
              )}
            </div>

            {/* ── Demandes fréquentes ── */}
            <div className="dp-odc-block">
              <BlockLabel step="✦">Souvent demandés</BlockLabel>
              <p className="dp-odc-status" style={{ marginTop: -4 }}>
                Les parfums qu&apos;on nous réclame le plus au comptoir. Un clic les ajoute à votre demande.
              </p>
              {catalog ? (
                <ul className="dp-odc-freq">
                  {frequent.map(({ entry, stock }) => {
                    const on = lineKeys.has(entry.id);
                    return (
                      <li key={entry.id} className="dp-odc-freq-card">
                        <div className="dp-odc-freq-media">
                          {stock?.image ? (
                            <Image src={stock.image} alt={entry.name + " — " + entry.house} fill sizes="(max-width: 760px) 45vw, 180px" style={{ objectFit: "cover" }} />
                          ) : (
                            <span className="dp-odc-freq-mark">
                              <HouseMark house={entry.house} size={52} />
                            </span>
                          )}
                        </div>
                        <p className="dp-odc-freq-house">{entry.house}</p>
                        <p className="dp-odc-freq-name">{entry.name}</p>
                        <p className="dp-odc-freq-meta">
                          {catalog.familyLabel[entry.family]}
                          {stock?.price ? " · " + fmtPrice(stock.price) : ""}
                        </p>
                        <button type="button" className={"dp-odc-freq-btn" + (on ? " is-on" : "")} onClick={() => (on ? removeLine(entry.id) : addEntry(entry))} aria-pressed={on}>
                          {on ? "✓ Dans ma demande" : "+ Ajouter"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ul className="dp-odc-freq" aria-hidden>
                  {FREQUENT_REQUEST_IDS.map((id) => (
                    <li key={id} className="dp-odc-freq-card dp-odc-skeleton" />
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ══ Colonne 2 : la demande et les coordonnées ══ */}
          <aside className="dp-odc-col dp-odc-panel" aria-label="Votre demande">
            <form ref={formRef} onSubmit={onSubmit} noValidate>
              {/* ── C. Le panier de demande ── */}
              <div className="dp-odc-block">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <BlockLabel step="C">Votre demande</BlockLabel>
                  <span className="dp-odc-badge">
                    {lines.length} parfum{lines.length > 1 ? "s" : ""} · {totalUnits} flacon{totalUnits > 1 ? "s" : ""}
                  </span>
                </div>

                {lines.length === 0 ? (
                  <p className={"dp-odc-empty" + (errors.lines ? " is-error" : "")} id={uid + "-lines-error"}>
                    {errors.lines ?? "Votre demande est vide. Choisissez une maison, nommez un parfum, ou cliquez sur l'une des demandes fréquentes."}
                  </p>
                ) : (
                  <ul className="dp-odc-lines">
                    {lines.map((l) => {
                      const st = catalog && l.refId ? catalog.stock(l.name, l.house) : undefined;
                      return (
                        <li key={l.key} className="dp-odc-line">
                          <HouseMark house={l.house} size={34} />
                          <div className="dp-odc-line-text">
                            <span className="dp-odc-line-name">{l.name}</span>
                            <span className="dp-odc-line-meta">
                              {l.house}
                              {!l.refId ? " · saisie libre" : ""}
                            </span>
                            <span className="dp-odc-line-price">
                              {st?.price ? "≈ " + fmtPrice(st.price) + " l'unité, indicatif" : "Prix confirmé sous " + QUOTE_DELAY}
                            </span>
                          </div>
                          <div className="dp-odc-line-actions">
                            <SizeSelect value={l.size} onChange={(v) => setLineSize(l.key, v)} compact />
                            <QtyStepper value={l.qty} onChange={(n) => setLineQty(l.key, n)} size="xs" locale={locale} />
                            <button type="button" className="dp-odc-remove" onClick={() => removeLine(l.key)} aria-label={"Retirer " + l.name}>
                              ×
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <p className="dp-odc-note">
                  Les prix indiqués « ≈ » sont ceux de nos flacons en rayon, donnés à titre indicatif. Le prix d&apos;une commande spéciale peut différer
                  (contenance, transport) : il vous est confirmé sous {QUOTE_DELAY}, avant toute validation.
                </p>
              </div>

              {/* ── D. Vos coordonnées ── */}
              <div className="dp-odc-block">
                <BlockLabel step="D">Vos coordonnées</BlockLabel>

                <div className="dp-odc-fields">
                  <label className="dp-odc-field">
                    <span>
                      Prénom <em aria-hidden>*</em>
                    </span>
                    <input
                      type="text"
                      name="firstName"
                      autoComplete="given-name"
                      value={form.firstName}
                      onChange={(e) => setField("firstName", e.target.value)}
                      aria-invalid={!!errors.firstName}
                      aria-describedby={errors.firstName ? uid + "-err-firstName" : undefined}
                      className="dp-odc-text"
                      required
                    />
                    {errors.firstName ? (
                      <span id={uid + "-err-firstName"} className="dp-odc-error">
                        {errors.firstName}
                      </span>
                    ) : null}
                  </label>

                  <label className="dp-odc-field">
                    <span>
                      E-mail <em aria-hidden>*</em>
                    </span>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      inputMode="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? uid + "-err-email" : undefined}
                      className="dp-odc-text"
                      required
                    />
                    {errors.email ? (
                      <span id={uid + "-err-email"} className="dp-odc-error">
                        {errors.email}
                      </span>
                    ) : null}
                  </label>

                  <label className="dp-odc-field">
                    <span>Téléphone {form.channel === "whatsapp" ? <em aria-hidden>*</em> : <small>(facultatif)</small>}</span>
                    <input
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="+33 6 …"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? uid + "-err-phone" : undefined}
                      className="dp-odc-text"
                    />
                    {errors.phone ? (
                      <span id={uid + "-err-phone"} className="dp-odc-error">
                        {errors.phone}
                      </span>
                    ) : null}
                  </label>

                  <fieldset className="dp-odc-fieldset">
                    <legend>Je préfère une réponse par</legend>
                    {/* WhatsApp d'abord et recommandé : c'est le canal du comptoir, la
                        réponse y vient en heures là où l'e-mail attend le lendemain. */}
                    <div className="dp-odc-radios">
                      {(
                        [
                          ["whatsapp", "WhatsApp"],
                          ["email", "E-mail"],
                        ] as [Channel, string][]
                      ).map(([value, label]) => (
                        <label key={value} className={"dp-odc-radio" + (form.channel === value ? " is-on" : "")}>
                          <input type="radio" name="channel" value={value} checked={form.channel === value} onChange={() => setField("channel", value)} />
                          <span>
                            {label}
                            {value === "whatsapp" && <em className="dp-odc-reco">Recommandé</em>}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <label className="dp-odc-field">
                    <span>
                      Message <small>(facultatif)</small>
                    </span>
                    <textarea
                      name="message"
                      rows={3}
                      value={form.message}
                      onChange={(e) => setField("message", e.target.value)}
                      placeholder="Une précision sur la contenance, la maison, une date souhaitée…"
                      className="dp-odc-text dp-odc-textarea"
                    />
                  </label>

                  <label className={"dp-odc-check" + (errors.consent ? " is-error" : "")}>
                    <input
                      type="checkbox"
                      name="consent"
                      checked={form.consent}
                      onChange={(e) => setField("consent", e.target.checked)}
                      aria-invalid={!!errors.consent}
                      aria-describedby={errors.consent ? uid + "-err-consent" : undefined}
                    />
                    <span>
                      Je comprends qu&apos;il s&apos;agit d&apos;une commande spéciale : prix confirmé sous {QUOTE_DELAY} avant validation, livraison sous {LEAD_TIME}, pas de
                      retour sauf défaut.
                    </span>
                  </label>
                  {errors.consent ? (
                    <span id={uid + "-err-consent"} className="dp-odc-error" style={{ marginTop: -6 }}>
                      {errors.consent}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* ── Envoi ── */}
              <div className="dp-odc-block dp-odc-send">
                <button type="submit" className="dp-odc-btn dp-odc-btn-wide">
                  Envoyer ma demande
                </button>
                <a
                  href={whatsapp?.href}
                  className={"dp-odc-wa" + (whatsapp ? "" : " is-disabled")}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-disabled={!whatsapp}
                  onClick={(e) => {
                    if (!whatsapp) e.preventDefault();
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.2-.8-2.7-1.1-4.4-3.9-4.5-4.1-.1-.2-1.1-1.4-1.1-2.7 0-1.2.7-1.8 1-2 .2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.2.1.4.1.6-.1l.8-1c.2-.2.3-.2.6-.1l2 1c.2.1.4.2.5.3.1.2.1.5 0 .8Z" />
                  </svg>
                  Envoyer par WhatsApp
                  <em className="dp-odc-reco dp-odc-reco-dark">Recommandé</em>
                </a>
                <p className="dp-odc-note" style={{ textAlign: "center" }}>
                  Réponse sous {QUOTE_DELAY} · rien n&apos;est engagé avant votre validation.
                  {whatsapp && whatsapp.omitted > 0
                    ? " Votre liste dépasse ce qu'un lien WhatsApp peut transporter : il en emporte les " +
                      (lines.length - whatsapp.omitted) +
                      " premières références, envoyez les autres en second message ou préférez le formulaire."
                    : ""}
                </p>
              </div>
            </form>
          </aside>
        </div>
      )}

      {/* Styles : pseudo-classes, grilles et media queries ne se font pas en
          style inline. Tokens de globals.css uniquement. Deux colonnes à
          partir de 1000 px, une colonne en dessous. */}
      <style>{`
        .dp-odc-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
          gap: clamp(20px, 3vw, 40px);
          align-items: start;
        }
        .dp-odc-col { display: flex; flex-direction: column; gap: 22px; }
        .dp-odc-block {
          padding: 22px;
          background: var(--surface-white);
          border: 1px solid var(--line-200);
          border-radius: var(--r-lg);
        }
        .dp-odc-panel form { display: flex; flex-direction: column; gap: 22px; }
        .dp-odc-panel .dp-odc-block { background: var(--surface-cream); }

        /* ── Maisons ── */
        .dp-odc-houses { display: flex; flex-wrap: wrap; gap: 8px; }
        .dp-odc-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 42px;
          padding: 5px 14px 5px 6px;
          border: 1px solid var(--line-200);
          border-radius: var(--r-pill);
          background: var(--surface-page);
          color: var(--ink-700);
          font-family: var(--font-sans);
          font-size: var(--t-sm);
          cursor: pointer;
          transition: border-color .18s var(--ease-out), background .18s var(--ease-out);
        }
        .dp-odc-chip:hover { border-color: var(--gold-300); }
        .dp-odc-chip:focus-visible { outline: none; box-shadow: var(--focus-ring); }
        .dp-odc-chip.is-on { border-color: var(--gold-500); background: var(--surface-cream-2); color: var(--ink-900); box-shadow: inset 0 0 0 1px var(--gold-500); }
        .dp-odc-chip-all {
          display: inline-flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border-radius: 50%;
          background: var(--gold-500); color: var(--espresso-900); font-size: 13px;
        }
        .dp-odc-chip-name { white-space: nowrap; }
        .dp-odc-housesearch{width:100%;max-width:420px;margin:0 0 12px;padding:10px 14px;font:inherit;font-size:.92rem;color:var(--ink-900);background:var(--surface-white);border:1px solid var(--line-100);border-radius:999px;outline:none}

        .dp-odc-housesearch:focus-visible{border-color:var(--gold-500);box-shadow:0 0 0 3px rgba(200,144,30,.18)}

        .dp-odc-alpha{display:flex;flex-wrap:wrap;gap:4px;margin:0 0 12px}


        .dp-odc-alpha-btn{width:30px;height:30px;padding:0;font:inherit;font-size:.78rem;font-weight:600;letter-spacing:.04em;color:var(--ink-700);background:var(--surface-white);border:1px solid var(--line-100);border-radius:8px;cursor:pointer}


        .dp-odc-alpha-btn:hover:not(:disabled){border-color:var(--gold-500);color:var(--gold-700)}


        .dp-odc-alpha-btn.is-on{background:var(--gold-500);border-color:var(--gold-500);color:#fff}


        .dp-odc-alpha-btn:disabled{opacity:.28;cursor:default}

        .dp-odc-housetop{margin:14px 0 4px}

        .dp-odc-reco{display:inline-block;margin-left:8px;padding:2px 8px;font-style:normal;font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--gold-700);background:rgba(200,144,30,.14);border-radius:999px;vertical-align:middle}


        .dp-odc-reco-dark{color:#fff;background:rgba(255,255,255,.22)}

        .dp-odc-hint{margin:6px 0 0;font-size:.85rem;color:var(--ink-500)}
        .dp-odc-linkbtn {
          margin-top: 12px;
          padding: 0;
          border: 0;
          background: none;
          color: var(--gold-700);
          font-family: var(--font-sans);
          font-size: var(--t-sm);
          letter-spacing: var(--ls-wide);
          text-decoration: underline;
          text-underline-offset: 3px;
          cursor: pointer;
        }
        .dp-odc-linkbtn:hover { color: var(--ink-900); }

        /* ── Recherche ── */
        .dp-odc-searchbox { position: relative; }
        .dp-odc-searchicon { position: absolute; inset-inline-start: 16px; top: 26px; transform: translateY(-50%); pointer-events: none; }
        .dp-odc-input {
          width: 100%;
          height: 52px;
          padding-block: 0;
          padding-inline: 42px 44px;
          border: 1px solid var(--line-300);
          border-radius: var(--r-pill);
          background: var(--surface-page);
          color: var(--ink-900);
          font-family: var(--font-sans);
          font-size: 16px;
          font-weight: var(--fw-light);
          outline: none;
          appearance: none;
          transition: border-color .18s var(--ease-out), box-shadow .18s var(--ease-out);
        }
        .dp-odc-input::placeholder { color: var(--ink-400); }
        .dp-odc-input:focus { border-color: var(--gold-500); box-shadow: var(--focus-ring); }
        .dp-odc-input::-webkit-search-cancel-button { display: none; }
        .dp-odc-clear {
          position: absolute; inset-inline-end: 8px; top: 6px;
          width: 40px; height: 40px; border: 0; border-radius: 50%;
          background: transparent; color: var(--ink-500); font-size: 22px; line-height: 1; cursor: pointer;
        }
        .dp-odc-clear:hover { background: var(--surface-cream); color: var(--ink-900); }
        .dp-odc-listbox {
          position: absolute; z-index: 40; top: calc(100% + 6px); left: 0; right: 0;
          margin: 0; padding: 6px; list-style: none; max-height: 360px; overflow-y: auto;
          background: var(--surface-white); border: 1px solid var(--line-200);
          border-radius: var(--r-lg); box-shadow: var(--shadow-md);
        }
        .dp-odc-listbox[hidden] { display: none; }
        .dp-odc-opt {
          display: flex; align-items: center; gap: 12px;
          min-height: 48px; padding: 8px 10px; border-radius: var(--r-md); cursor: pointer;
        }
        .dp-odc-opt.is-active { background: var(--surface-cream); }
        .dp-odc-opt-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1 1 auto; }
        .dp-odc-opt-name { font-family: var(--font-display); font-size: 1.1rem; color: var(--ink-900); overflow-wrap: anywhere; }
        .dp-odc-opt-meta { font-family: var(--font-sans); font-size: var(--t-xs); letter-spacing: var(--ls-wide); text-transform: uppercase; color: var(--ink-400); }
        .dp-odc-opt-mark { flex: 0 0 auto; font-family: var(--font-sans); font-size: var(--t-xs); letter-spacing: var(--ls-wide); text-transform: uppercase; color: var(--gold-700); }
        .dp-odc-status { margin: 10px 0 0; font-family: var(--font-sans); font-size: var(--t-sm); font-weight: var(--fw-light); line-height: var(--lh-normal); color: var(--ink-500); }

        /* ── Fiche ── */
        .dp-odc-sheet, .dp-odc-free {
          margin-top: 16px;
          padding: 18px;
          border: 1px solid var(--gold-300);
          border-radius: var(--r-lg);
          background: var(--surface-cream);
        }
        .dp-odc-free { border-style: dashed; border-color: var(--line-300); }
        .dp-odc-sheet-head { display: flex; align-items: center; gap: 14px; }
        .dp-odc-sheet-house { margin: 0 0 2px; font-family: var(--font-sans); font-size: var(--t-xs); font-weight: var(--fw-semibold); letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--gold-700); }
        .dp-odc-sheet-name { margin: 0; font-family: var(--font-display); font-weight: var(--fw-medium); font-size: 1.55rem; line-height: 1.15; color: var(--ink-900); overflow-wrap: anywhere; }
        .dp-odc-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 14px 0 0; padding: 0; list-style: none; }
        .dp-odc-tags li {
          padding: 4px 10px; border: 1px solid var(--line-300); border-radius: var(--r-pill);
          background: var(--surface-white); font-family: var(--font-sans); font-size: var(--t-xs);
          letter-spacing: var(--ls-wide); text-transform: uppercase; color: var(--ink-700);
        }
        .dp-odc-accords { margin: 12px 0 0; font-family: var(--font-sans); font-size: var(--t-sm); font-weight: var(--fw-light); line-height: var(--lh-relaxed); color: var(--ink-700); }
        .dp-odc-accords-label { font-weight: var(--fw-medium); letter-spacing: var(--ls-wide); text-transform: uppercase; font-size: var(--t-xs); color: var(--ink-400); margin-inline-end: 6px; }
        .dp-odc-estimate { margin: 10px 0 0; font-family: var(--font-sans); font-size: var(--t-sm); color: var(--ink-500); }
        .dp-odc-estimate strong { color: var(--ink-900); font-weight: var(--fw-medium); }
        .dp-odc-inlink { color: var(--gold-700); text-underline-offset: 3px; }
        .dp-odc-free-text { margin: 0; font-family: var(--font-sans); font-size: var(--t-sm); font-weight: var(--fw-light); line-height: var(--lh-relaxed); color: var(--ink-700); }
        .dp-odc-free-text strong { font-weight: var(--fw-medium); color: var(--ink-900); }
        .dp-odc-addrow { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 12px; margin-top: 16px; }
        .dp-odc-field-inline { display: flex; flex-direction: column; gap: 6px; font-family: var(--font-sans); font-size: var(--t-xs); letter-spacing: var(--ls-wide); text-transform: uppercase; color: var(--ink-500); }
        .dp-odc-toast {
          margin: 12px 0 0; padding: 10px 14px;
          border-left: 3px solid var(--success); border-radius: var(--r-sm);
          background: var(--surface-cream); font-family: var(--font-sans); font-size: var(--t-sm); color: var(--ink-700);
        }

        /* ── Boutons ── */
        .dp-odc-btn, .dp-odc-btn-outline, .dp-odc-btn-ghost {
          display: inline-flex; align-items: center; justify-content: center;
          min-height: 46px; padding: 0 22px; border-radius: var(--r-pill);
          font-family: var(--font-sans); font-size: var(--t-sm); font-weight: var(--fw-medium);
          letter-spacing: var(--ls-wide); text-transform: uppercase; cursor: pointer;
          transition: background .18s var(--ease-out), border-color .18s var(--ease-out), color .18s var(--ease-out);
        }
        .dp-odc-btn { border: 1px solid var(--gold-700); background: var(--gold-700); color: var(--surface-white); }
        .dp-odc-btn:hover { background: var(--ink-900); border-color: var(--ink-900); }
        .dp-odc-btn-outline { border: 1px solid var(--line-300); background: transparent; color: var(--ink-700); }
        .dp-odc-btn-outline:hover { border-color: var(--gold-500); color: var(--ink-900); }
        .dp-odc-btn-ghost { border: 1px solid var(--line-300); background: var(--surface-white); color: var(--ink-700); }
        .dp-odc-btn-ghost:hover { border-color: var(--gold-500); }
        .dp-odc-btn:focus-visible, .dp-odc-btn-outline:focus-visible, .dp-odc-btn-ghost:focus-visible { outline: none; box-shadow: var(--focus-ring); }
        .dp-odc-btn-wide { width: 100%; min-height: 52px; }

        /* ── Demandes fréquentes ── */
        .dp-odc-freq { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 14px 0 0; padding: 0; list-style: none; }
        .dp-odc-freq-card {
          display: flex; flex-direction: column; min-width: 0;
          padding: 8px 8px 12px; border: 1px solid var(--line-200); border-radius: var(--r-lg);
          background: var(--surface-page);
        }
        .dp-odc-freq-media { position: relative; aspect-ratio: 1 / 1; border-radius: var(--r-md); overflow: hidden; background: var(--surface-image); }
        .dp-odc-freq-mark { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
        .dp-odc-freq-house { margin: 10px 0 0; font-family: var(--font-sans); font-size: 10px; font-weight: var(--fw-semibold); letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--gold-700); overflow-wrap: anywhere; }
        .dp-odc-freq-name { margin: 2px 0 0; font-family: var(--font-display); font-weight: var(--fw-medium); font-size: 1.05rem; line-height: 1.2; color: var(--ink-900); overflow-wrap: anywhere; }
        .dp-odc-freq-meta { margin: 4px 0 10px; font-family: var(--font-sans); font-size: var(--t-xs); color: var(--ink-500); }
        .dp-odc-freq-btn {
          margin-top: auto; min-height: 36px; padding: 0 10px;
          border: 1px solid var(--line-300); border-radius: var(--r-pill); background: var(--surface-white);
          color: var(--ink-700); font-family: var(--font-sans); font-size: var(--t-xs); font-weight: var(--fw-medium);
          letter-spacing: var(--ls-wide); text-transform: uppercase; cursor: pointer;
          transition: background .18s var(--ease-out), border-color .18s var(--ease-out);
        }
        .dp-odc-freq-btn:hover { border-color: var(--gold-500); }
        .dp-odc-freq-btn.is-on { background: var(--gold-500); border-color: var(--gold-500); color: var(--espresso-900); }
        .dp-odc-skeleton { min-height: 230px; background: var(--surface-cream); border-color: transparent; animation: dp-odc-pulse 1.5s var(--ease-in-out) infinite; }
        @keyframes dp-odc-pulse { 0%,100% { opacity: .45 } 50% { opacity: .85 } }

        /* ── Panier de demande ── */
        .dp-odc-badge {
          flex: 0 0 auto; margin-bottom: 12px; padding: 4px 10px;
          border-radius: var(--r-pill); background: var(--surface-white); border: 1px solid var(--line-200);
          font-family: var(--font-sans); font-size: var(--t-xs); letter-spacing: var(--ls-wide); text-transform: uppercase; color: var(--ink-500);
          white-space: nowrap;
        }
        .dp-odc-empty {
          margin: 0; padding: 22px 16px; border: 1px dashed var(--line-300); border-radius: var(--r-md);
          font-family: var(--font-sans); font-size: var(--t-sm); font-weight: var(--fw-light); line-height: var(--lh-relaxed);
          color: var(--ink-500); text-align: center;
        }
        .dp-odc-empty.is-error { border-color: var(--danger); color: var(--danger); font-weight: var(--fw-regular); }
        .dp-odc-lines { list-style: none; margin: 0; padding: 0; }
        .dp-odc-line {
          display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 6px 12px; align-items: center;
          padding: 12px 0; border-bottom: 1px solid var(--line-200);
        }
        .dp-odc-line:last-child { border-bottom: 0; }
        .dp-odc-line-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .dp-odc-line-name { font-family: var(--font-display); font-weight: var(--fw-medium); font-size: 1.1rem; line-height: 1.2; color: var(--ink-900); overflow-wrap: anywhere; }
        .dp-odc-line-meta { font-family: var(--font-sans); font-size: var(--t-xs); letter-spacing: var(--ls-wide); text-transform: uppercase; color: var(--ink-400); overflow-wrap: anywhere; }
        .dp-odc-line-price { font-family: var(--font-sans); font-size: var(--t-xs); color: var(--ink-500); }
        .dp-odc-line-actions { grid-column: 2; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
        .dp-odc-remove {
          width: 36px; height: 36px; margin-inline-start: auto; border: 0; border-radius: 50%; background: transparent;
          color: var(--ink-400); font-size: 20px; line-height: 1; cursor: pointer;
        }
        .dp-odc-remove:hover { background: var(--surface-white); color: var(--danger); }
        .dp-odc-note { margin: 14px 0 0; font-family: var(--font-sans); font-size: var(--t-xs); font-weight: var(--fw-light); line-height: var(--lh-relaxed); color: var(--ink-400); }

        /* ── Champs ── */
        .dp-odc-select {
          appearance: none;
          border: 1px solid var(--line-300); border-radius: var(--r-pill);
          background: var(--surface-white) url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%239C6A1A' stroke-width='1.5'/%3E%3C/svg%3E") no-repeat right 12px center;
          color: var(--ink-700); font-family: var(--font-sans); cursor: pointer; outline: none;
        }
        .dp-odc-select:focus { border-color: var(--gold-500); box-shadow: var(--focus-ring); }
        .dp-odc-fields { display: flex; flex-direction: column; gap: 14px; }
        .dp-odc-field { display: flex; flex-direction: column; gap: 6px; }
        .dp-odc-field > span:not(.dp-odc-error), .dp-odc-fieldset > legend {
          font-family: var(--font-sans); font-size: var(--t-xs); font-weight: var(--fw-medium);
          letter-spacing: var(--ls-wide); text-transform: uppercase; color: var(--ink-500);
        }
        .dp-odc-field em { color: var(--gold-700); font-style: normal; }
        .dp-odc-field small { text-transform: none; letter-spacing: 0; font-weight: var(--fw-light); color: var(--ink-400); }
        .dp-odc-text {
          width: 100%; min-height: 46px; padding: 10px 14px;
          border: 1px solid var(--line-300); border-radius: var(--r-md);
          background: var(--surface-white); color: var(--ink-900);
          font-family: var(--font-sans); font-size: 16px; font-weight: var(--fw-light); outline: none;
          transition: border-color .18s var(--ease-out), box-shadow .18s var(--ease-out);
        }
        .dp-odc-text:focus { border-color: var(--gold-500); box-shadow: var(--focus-ring); }
        .dp-odc-text[aria-invalid="true"] { border-color: var(--danger); }
        .dp-odc-textarea { resize: vertical; min-height: 84px; line-height: var(--lh-normal); }
        .dp-odc-error { font-family: var(--font-sans); font-size: var(--t-xs); color: var(--danger); }
        .dp-odc-fieldset { margin: 0; padding: 0; border: 0; min-width: 0; }
        .dp-odc-fieldset > legend { padding: 0; margin-bottom: 6px; }
        .dp-odc-radios { display: flex; gap: 8px; }
        .dp-odc-radio {
          flex: 1 1 0; display: flex; align-items: center; justify-content: center; gap: 8px;
          min-height: 44px; padding: 0 14px; border: 1px solid var(--line-300); border-radius: var(--r-pill);
          background: var(--surface-white); font-family: var(--font-sans); font-size: var(--t-sm); color: var(--ink-700); cursor: pointer;
          transition: border-color .18s var(--ease-out), background .18s var(--ease-out);
        }
        .dp-odc-radio.is-on { border-color: var(--gold-500); background: var(--surface-cream-2); color: var(--ink-900); box-shadow: inset 0 0 0 1px var(--gold-500); }
        .dp-odc-radio input { accent-color: var(--gold-700); margin: 0; }
        .dp-odc-check {
          display: flex; align-items: flex-start; gap: 10px;
          font-family: var(--font-sans); font-size: var(--t-sm); font-weight: var(--fw-light); line-height: var(--lh-normal); color: var(--ink-700); cursor: pointer;
        }
        .dp-odc-check input { flex: 0 0 auto; width: 18px; height: 18px; margin: 2px 0 0; accent-color: var(--gold-700); }
        .dp-odc-check.is-error { color: var(--danger); }

        /* ── Envoi ── */
        .dp-odc-send { display: flex; flex-direction: column; gap: 10px; }
        .dp-odc-wa {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          min-height: 48px; padding: 0 18px; border-radius: var(--r-pill);
          background: var(--success); color: var(--on-dark-strong);
          font-family: var(--font-sans); font-size: var(--t-sm); font-weight: var(--fw-medium); letter-spacing: var(--ls-wide); text-transform: uppercase;
          text-decoration: none; transition: filter .18s var(--ease-out);
        }
        .dp-odc-wa:hover { filter: brightness(1.08); }
        .dp-odc-wa.is-disabled { opacity: .45; cursor: not-allowed; }

        /* ── Confirmation ── */
        .dp-odc-done {
          max-width: 640px; margin: 0 auto; padding: clamp(28px, 4vw, 44px);
          border: 1px solid var(--gold-300); border-radius: var(--r-lg); background: var(--surface-white); text-align: center;
        }
        .dp-odc-done-mark {
          display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px;
          border-radius: 50%; background: var(--gold-500); color: var(--espresso-900); font-size: 26px;
        }
        .dp-odc-done-title { margin: 18px 0 0; font-family: var(--font-display); font-weight: var(--fw-medium); font-size: 1.7rem; line-height: 1.15; color: var(--ink-900); }
        .dp-odc-done-text { margin: 12px auto 0; max-width: 52ch; font-family: var(--font-sans); font-weight: var(--fw-light); font-size: var(--t-body); line-height: var(--lh-relaxed); color: var(--ink-500); }
        .dp-odc-done-list { margin: 22px 0; padding: 0; list-style: none; text-align: start; border-top: 1px solid var(--line-100); }
        .dp-odc-done-list li { display: flex; flex-direction: column; gap: 2px; padding: 10px 0; border-bottom: 1px solid var(--line-100); }

        /* ── Repli ── */
        @media (max-width: 1000px) {
          .dp-odc-grid { grid-template-columns: minmax(0, 1fr); }
        }
        @media (max-width: 760px) {
          .dp-odc-block { padding: 16px; }
          .dp-odc-freq { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
          .dp-odc-chip-name { max-width: 150px; overflow: hidden; text-overflow: ellipsis; }
          .dp-odc-line { grid-template-columns: auto minmax(0, 1fr); }
          .dp-odc-line-actions { grid-column: 1 / -1; }
          .dp-odc-radios { flex-direction: column; }
          .dp-odc-sheet-name { font-size: 1.35rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dp-odc-skeleton { animation: none; }
        }
      `}</style>
    </div>
  );
}
