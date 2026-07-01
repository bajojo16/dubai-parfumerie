"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { customsFor, type ShippingCountry } from "@/data/shipping-countries";

export type ShippingLabels = {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** label du champ pays (a11y) */
  fieldLabel: string;
  placeholder: string;
  /** texte du bouton, sans la flèche */
  check: string;
  /** confirmation : "Oui, nous livrons en " (préfixe, suivi de {flag} {name} !) */
  servedPrefix: string;
  /** détail préparation (préfixe avant deliveryDays) */
  prepNote: string;
  /** douane : aucun frais (UE) — ton positif */
  customsNone: string;
  /** douane : frais éventuels (hors UE, DOM-TOM inclus) — ton neutre */
  customsPossible: string;
  /** preuve sociale : compteur de commandes ({n} = nombre formaté) */
  ordersNote: string;
  /** non desservi : "Nous ne livrons pas encore en " (suivi de {name}) */
  notServedPrefix: string;
  notServedHint: string;
  emailPlaceholder: string;
  emailCta: string;
  emailThanks: string;
  /** stats */
  /** preuve sociale : pays desservis AUTRES que le pays courant ({n} = nombre formaté) */
  ordersOtherCountries: string;
  statPrep: string;
  statTracking: string;
  noResults: string;
};

const DEFAULT_LABELS: ShippingLabels = {
  eyebrow: "Livraison internationale",
  title: "Nous livrons presque partout dans le monde",
  subtitle:
    "Où que vous soyez, l'Orient vous parvient. Vérifiez la livraison dans votre pays.",
  fieldLabel: "Votre pays de livraison",
  placeholder: "Choisissez votre pays…",
  check: "Vérifier",
  servedPrefix: "Oui, nous livrons en ",
  prepNote: "Préparation 24h à 4 jours · ",
  customsNone: "Aucun frais de douane",
  customsPossible: "Frais de douane éventuels à la charge du destinataire",
  ordersNote: "Déjà {n} commandes réalisées dans ce pays",
  notServedPrefix: "Nous ne livrons pas encore en ",
  notServedHint:
    "Laissez-nous votre email, on vous prévient dès que c'est disponible.",
  emailPlaceholder: "votre@email.com",
  emailCta: "Prévenez-moi",
  emailThanks: "Merci ! Nous vous écrirons dès l'ouverture de cette destination.",
  ordersOtherCountries: "Nous avons déjà livré dans {n} autres pays",
  statPrep: "Préparation 24h–4 j",
  statTracking: "Numéro de suivi international et national",
  noResults: "Aucun pays trouvé",
};

const BG = "#F6F0E4";
const CTA = "#C4A24F";
const ACCENT = "#A8801F";
const TITLE = "#2C2620";
const FIELD_BORDER = "#E0CFA8";
const GLOBE = "#A8915F";
const DETAIL = "#8A7E68";
// Douane — tons discrets accordés à la palette luxe
const CUSTOMS_OK = "#2F7D54"; // vert discret (UE : aucun frais)
const CUSTOMS_OK_BG = "#EAF4EC";
const CUSTOMS_WARN = "#8A6B1F"; // brun/or discret (frais éventuels)
const CUSTOMS_WARN_BG = "#F4ECD8";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function ShippingChecker({
  countries,
  detectedCode,
  locale = "fr",
  labels,
}: {
  countries: ShippingCountry[];
  detectedCode?: string;
  locale?: string;
  labels?: Partial<ShippingLabels>;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const isRTL = locale === "ar";
  const reduce = useRef(false);

  // Pays sélectionné (code) + texte de recherche
  const [selectedCode, setSelectedCode] = useState<string | undefined>(detectedCode);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [result, setResult] = useState<ShippingCountry | null>(null);
  const [show, setShow] = useState(false); // pour l'animation d'apparition
  const [emailSent, setEmailSent] = useState(false);

  const listboxId = useId();
  const optionId = (i: number) => `${listboxId}-opt-${i}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const byCode = useMemo(() => {
    const m = new Map<string, ShippingCountry>();
    countries.forEach((c) => m.set(c.code.toUpperCase(), c));
    return m;
  }, [countries]);

  const servedCount = useMemo(
    () => countries.filter((c) => c.served).length,
    [countries]
  );

  // Détection : prop detectedCode, sinon navigator.language (région), sinon rien.
  useEffect(() => {
    reduce.current = prefersReducedMotion();
    let code = detectedCode?.toUpperCase();
    if (!code && typeof navigator !== "undefined") {
      const langs = (navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language]) as string[];
      for (const l of langs) {
        const region = l.split("-")[1]?.toUpperCase();
        if (region && byCode.has(region)) {
          code = region;
          break;
        }
      }
    }
    if (code && byCode.has(code)) {
      setSelectedCode(code);
      runCheck(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ordre liste : pays prioritaires en tête (ordre fixe), puis reste alphabétique
  const ordered = useMemo(() => {
    const PRIORITY = ["FR", "BE", "DE", "GB", "CH", "US", "NL", "ES", "IT", "RE", "MQ"];
    const byCode = new Map(countries.map((c) => [c.code.toUpperCase(), c]));
    const top = PRIORITY.map((code) => byCode.get(code)).filter(
      (c): c is ShippingCountry => Boolean(c)
    );
    const topSet = new Set(top.map((c) => c.code.toUpperCase()));
    const rest = countries
      .filter((c) => !topSet.has(c.code.toUpperCase()))
      .sort((a, b) => a.name.localeCompare(b.name, locale));
    return [...top, ...rest];
  }, [countries, locale]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ordered;
    return ordered.filter((c) => c.name.toLowerCase().includes(q));
  }, [ordered, query]);

  const runCheck = useCallback(
    (code?: string) => {
      const c = code ? byCode.get(code.toUpperCase()) : undefined;
      if (!c) return;
      setEmailSent(false);
      setResult(c);
      // re-trigger animation
      setShow(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)));
    },
    [byCode]
  );

  const selectCountry = useCallback(
    (c: ShippingCountry) => {
      setSelectedCode(c.code);
      setQuery("");
      setOpen(false);
      // Résultat affiché en direct dès la sélection (plus de bouton « Vérifier »).
      runCheck(c.code);
      inputRef.current?.focus();
    },
    [runCheck]
  );

  // Fermer le listbox au clic extérieur
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && filtered[activeIndex]) selectCountry(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const selected = selectedCode ? byCode.get(selectedCode.toUpperCase()) : undefined;
  const displayValue = open ? query : selected ? `${selected.flag} ${selected.name}` : query;

  // Pays desservis AUTRES que le pays courant (dynamique, jamais hardcodé).
  const otherServedCount = servedCount - (selected?.served ? 1 : 0);
  const otherServedText = L.ordersOtherCountries.replace(
    "{n}",
    new Intl.NumberFormat(locale).format(otherServedCount)
  );

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        background: BG,
        padding: "40px 24px",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: isRTL ? "right" : "left" }}>
        {/* Eyebrow */}
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: ACCENT,
            fontWeight: 600,
          }}
        >
          {L.eyebrow}
        </div>

        {/* Titre */}
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 34,
            lineHeight: 1.15,
            color: TITLE,
            margin: "10px 0 8px",
            fontWeight: 500,
          }}
        >
          {L.title}
        </h2>

        {/* Sous-titre */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            color: "#6A6051",
            margin: "0 0 28px",
            maxWidth: 460,
            marginInline: isRTL ? "0 0" : undefined,
          }}
        >
          {L.subtitle}
        </p>

        {/* 2 colonnes desktop : sélecteur | résultat — repli en colonne sur mobile (flexWrap) */}
        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          {/* Colonne sélecteur (le résultat s'affiche à côté en direct) */}
          <div
            ref={rootRef}
            style={{
              flex: "1 1 320px",
              minWidth: 280,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "stretch",
            }}
          >
          <div style={{ position: "relative", flex: "1 1 240px", minWidth: 220 }}>
            <label htmlFor={`${listboxId}-input`} style={srOnly}>
              {L.fieldLabel}
            </label>
            {/* Champ pill — bordure neutre discrète (pas de cadre coloré) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#fff",
                border: "1px solid #EAE6DD",
                borderRadius: 999,
                padding: "0 16px",
                height: 52,
              }}
            >
              {/* Globe */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={GLOBE}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                style={{ flexShrink: 0 }}
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
                <path d="M12 3c2.5 2.5 3.8 5.7 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3z" />
              </svg>
              <input
                id={`${listboxId}-input`}
                ref={inputRef}
                role="combobox"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={open && filtered[activeIndex] ? optionId(activeIndex) : undefined}
                autoComplete="off"
                value={displayValue}
                placeholder={L.placeholder}
                onFocus={() => setOpen(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                  setActiveIndex(0);
                }}
                onKeyDown={onKeyDown}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontFamily: "var(--font-sans)",
                  fontSize: 15,
                  color: TITLE,
                  textAlign: isRTL ? "right" : "left",
                  minWidth: 0,
                }}
              />
              {/* Chevron */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={GLOBE}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                style={{
                  flexShrink: 0,
                  transform: open ? "rotate(180deg)" : "none",
                  transition: "transform .2s",
                }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>

            {/* Listbox */}
            {open && (
              <ul
                id={listboxId}
                role="listbox"
                aria-label={L.fieldLabel}
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  insetInline: 0,
                  zIndex: 20,
                  margin: 0,
                  padding: 6,
                  listStyle: "none",
                  background: "#fff",
                  border: `1px solid ${FIELD_BORDER}`,
                  borderRadius: 16,
                  boxShadow: "0 14px 40px rgba(44,38,32,.12)",
                  maxHeight: 260,
                  overflowY: "auto",
                }}
              >
                {filtered.length === 0 && (
                  <li
                    style={{
                      padding: "10px 12px",
                      fontSize: 13,
                      color: DETAIL,
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {L.noResults}
                  </li>
                )}
                {filtered.map((c, i) => {
                  const isActive = i === activeIndex;
                  const isSel = c.code === selectedCode;
                  return (
                    <li
                      id={optionId(i)}
                      key={c.code}
                      role="option"
                      aria-selected={isSel}
                      onMouseEnter={() => setActiveIndex(i)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectCountry(c);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 10,
                        cursor: "pointer",
                        background: isActive ? "#F6F0E4" : "transparent",
                        fontFamily: "var(--font-sans)",
                        fontSize: 15,
                        color: TITLE,
                      }}
                    >
                      <span aria-hidden style={{ fontSize: 18 }}>
                        {c.flag}
                      </span>
                      <span style={{ flex: 1 }}>{c.name}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Preuve sociale + stats — boutons compacts (largeur du contenu),
              en rangée qui se replie ; sous le sélecteur (= à gauche du résultat) */}
          <div
            style={{
              width: "100%",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-start",
              gap: 10,
              marginTop: 4,
            }}
          >
            {[otherServedText, L.statPrep, L.statTracking].map((text, i) => (
              <div
                key={i}
                style={{
                  // Largeur = contenu (compact), pas pleine largeur
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  maxWidth: "100%",
                  background: "#fff",
                  border: `1px solid ${FIELD_BORDER}`,
                  borderRadius: 14,
                  padding: "11px 16px",
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  lineHeight: 1.35,
                  color: TITLE,
                  fontWeight: 500,
                }}
              >
                <span
                  aria-hidden
                  style={{ width: 8, height: 8, borderRadius: "50%", background: CTA, flexShrink: 0 }}
                />
                {text}
              </div>
            ))}
          </div>
        </div>

          {/* Colonne résultat (aria-live) — à côté du sélecteur sur desktop */}
          <div aria-live="polite" style={{ flex: "1 1 360px", minWidth: 280 }}>
          {result && result.served && (
            <div
              style={{
                background: "#fff",
                border: `1px solid ${FIELD_BORDER}`,
                borderRadius: 16,
                padding: "20px 22px",
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                opacity: show ? 1 : 0,
                transform: show ? "translateY(0) scale(1)" : "translateY(10px) scale(.98)",
                transition: reduce.current
                  ? "none"
                  : "opacity .5s ease, transform .5s cubic-bezier(.2,.8,.2,1)",
              }}
            >
              {/* Badge check + halo */}
              <span
                style={{
                  position: "relative",
                  flexShrink: 0,
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: CTA,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {!reduce.current && (
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      background: CTA,
                      animation: "shipPulse 2s ease-out infinite",
                    }}
                  />
                )}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  style={{ position: "relative", zIndex: 1 }}
                >
                  <path d="M5 12l5 5 9-11" />
                </svg>
              </span>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                    lineHeight: 1.25,
                    color: TITLE,
                    fontWeight: 500,
                  }}
                >
                  ✓ {L.servedPrefix}
                  {result.flag} {result.name} !
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 12,
                    color: DETAIL,
                    marginTop: 6,
                    lineHeight: 1.5,
                  }}
                >
                  {L.prepNote}
                  {result.deliveryDays}
                  {result.freeShippingNote ? ` · ${result.freeShippingNote}` : ""}
                </div>
                {(() => {
                  const customs = customsFor(result);
                  const ok = customs === "none";
                  return (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 10,
                        padding: "5px 11px",
                        borderRadius: 999,
                        background: ok ? CUSTOMS_OK_BG : CUSTOMS_WARN_BG,
                        color: ok ? CUSTOMS_OK : CUSTOMS_WARN,
                        fontFamily: "var(--font-sans)",
                        fontSize: 12,
                        fontWeight: 600,
                        lineHeight: 1.35,
                      }}
                    >
                      <span aria-hidden style={{ fontSize: 13 }}>
                        {ok ? "✓" : "ⓘ"}
                      </span>
                      <span>{ok ? L.customsNone : L.customsPossible}</span>
                    </div>
                  );
                })()}
                {typeof result.orders === "number" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      marginTop: 10,
                      fontFamily: "var(--font-sans)",
                      fontSize: 12,
                      color: ACCENT,
                      fontWeight: 600,
                      lineHeight: 1.4,
                    }}
                  >
                    <span aria-hidden style={{ fontSize: 13 }}>
                      ✦
                    </span>
                    <span>
                      {L.ordersNote.replace(
                        "{n}",
                        new Intl.NumberFormat(locale).format(result.orders)
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {result && !result.served && (
            <div
              style={{
                background: "#fff",
                border: `1px solid ${FIELD_BORDER}`,
                borderRadius: 16,
                padding: "20px 22px",
                opacity: show ? 1 : 0,
                transform: show ? "translateY(0)" : "translateY(10px)",
                transition: reduce.current ? "none" : "opacity .5s ease, transform .5s ease",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  color: TITLE,
                  fontWeight: 500,
                  lineHeight: 1.3,
                }}
              >
                {L.notServedPrefix}
                {result.flag} {result.name}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  color: DETAIL,
                  marginTop: 6,
                }}
              >
                {L.notServedHint}
              </div>

              {emailSent ? (
                <div
                  style={{
                    marginTop: 14,
                    fontFamily: "var(--font-sans)",
                    fontSize: 13,
                    color: ACCENT,
                    fontWeight: 600,
                  }}
                >
                  ✓ {L.emailThanks}
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setEmailSent(true);
                  }}
                  style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}
                >
                  <label htmlFor={`${listboxId}-email`} style={srOnly}>
                    {L.emailPlaceholder}
                  </label>
                  <input
                    id={`${listboxId}-email`}
                    type="email"
                    required
                    placeholder={L.emailPlaceholder}
                    style={{
                      flex: "1 1 200px",
                      minWidth: 0,
                      height: 46,
                      border: `1px solid ${FIELD_BORDER}`,
                      borderRadius: 999,
                      padding: "0 16px",
                      fontFamily: "var(--font-sans)",
                      fontSize: 14,
                      color: TITLE,
                      outline: "none",
                      textAlign: isRTL ? "right" : "left",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      flexShrink: 0,
                      border: "none",
                      borderRadius: 999,
                      padding: "0 22px",
                      height: 46,
                      background: CTA,
                      color: "#fff",
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {L.emailCta}
                  </button>
                </form>
              )}
            </div>
          )}
          </div>
        </div>

      </div>

      {/* Keyframes (injectées inline, désactivées via prefers-reduced-motion côté JS) */}
      <style>{`
        @keyframes shipPulse {
          0% { transform: scale(1); opacity: .5; }
          70% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes shipPulse { 0%,100% { transform: none; opacity: 0; } }
        }
      `}</style>
    </section>
  );
}

const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};
