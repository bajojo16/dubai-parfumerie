"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PackGrid } from "@/components/sections/PackGrid";
import { DEMO as PACKS } from "@/data/packs";

/**
 * « Lots & Coffrets » — le rayon des ensembles, par opposition au flacon seul.
 *
 * La page existe parce que le site vendait déjà des coffrets sans jamais leur
 * donner d'adresse : « Coffrets & Lots » du méga-menu, « Coffrets découverte »
 * et « Coffrets prestige » de ses colonnes pointaient tous les trois vers
 * `/promo-flash`, qui montre des flacons individuels en promotion — pas un
 * seul coffret. Les sept ensembles de `packs.ts` n'étaient visibles que dans
 * un rail de l'accueil et sous `/preview-packs`.
 *
 * On réutilise `PackGrid` plutôt que d'écrire une seconde présentation : c'est
 * déjà lui qui rend ces cartes sur l'accueil, avec le podium, le prix barré
 * calculé et l'ajout au panier. Deux rendus pour une même donnée finissent
 * toujours par diverger.
 */
/**
 * D'où vient le visiteur, quand il vient d'une page du site.
 *
 * Le bouton du navigateur sait déjà revenir, mais rien dans la page ne le dit :
 * arrivé ici depuis la pastille « Lots & Coffret » des bons plans, on est dans
 * un rayon qui n'a ni fil d'ariane ni onglet parent, et le chemin du retour
 * n'existe que dans la barre du navigateur — invisible sur mobile en plein
 * écran. On lit donc le référent pour proposer un retour NOMMÉ : « revenir aux
 * bons plans » se comprend mieux qu'une flèche générique.
 *
 * Libellés bornés à une table : on n'affiche jamais un chemin d'URL brut, et
 * une provenance inconnue ne produit aucun lien plutôt qu'un lien vague.
 */
// Les libellés portent leur préposition : « Retour à » + un nom mis en
// minuscules donnait « Retour à bons plans ». Le français décide de l'article
// au cas par cas, une règle générique se trompe forcément quelque part.
const ORIGINS: Record<string, string> = {
  "/promo-flash": "aux bons plans",
  "/catalogue": "au catalogue",
  "/offres/lot-3-pour-2": "à l'offre 3 pour 2",
  "/parfums-femme": "aux parfums femme",
  "/parfums-homme": "aux parfums homme",
  "/huile-de-parfum": "aux huiles de parfum",
  "/marques": "aux maisons",
  "/": "à l'accueil",
};

const LOCALES = ["fr", "en", "es", "de", "it", "ru", "ar"];

/** Retire le préfixe de langue : `localePrefix` vaut 'as-needed', donc /en/x mais /x en FR. */
function stripLocale(pathname: string): string {
  const seg = pathname.split("/")[1];
  return LOCALES.includes(seg) ? pathname.slice(seg.length + 1) || "/" : pathname;
}

function useOrigin() {
  // Calculé après le montage : ni la query string ni `document.referrer`
  // n'existent au rendu serveur, et les lire directement ferait diverger
  // l'hydratation.
  const [origin, setOrigin] = useState<{ href: string; label: string } | null>(null);
  useEffect(() => {
    const resolve = (path: string) => {
      const clean = stripLocale(path.replace(/\/+$/, "") || "/");
      const label = ORIGINS[clean];
      return label && clean !== "/lots" ? { href: clean, label } : null;
    };
    try {
      // 1) `?from=` — la source qui compte. Une navigation `next/link` ne
      //    touche PAS `document.referrer` : celui-ci garde le référent du
      //    chargement initial du document, donc il reste vide quand on entre
      //    ici en cliquant depuis une autre page du site. Les liens qui mènent
      //    au rayon annoncent donc leur provenance dans l'URL.
      const from = new URLSearchParams(window.location.search).get("from");
      if (from) {
        const hit = resolve(from.startsWith("/") ? from : `/${from}`);
        if (hit) return setOrigin(hit);
      }
      // 2) Repli sur le référent, qui ne vaut que pour une vraie arrivée
      //    externe ou un rechargement complet.
      const ref = document.referrer;
      if (!ref) return;
      const url = new URL(ref);
      if (url.origin !== window.location.origin) return;
      const hit = resolve(url.pathname);
      if (hit) setOrigin(hit);
    } catch {
      // Provenance illisible : pas de lien plutôt qu'un lien faux.
    }
  }, []);
  return origin;
}

export default function LotsPage() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const origin = useOrigin();

  // Chiffres du bandeau : déduits des données, jamais écrits en dur — un
  // coffret ajouté à `packs.ts` doit se voir ici sans qu'on y retouche.
  const count = PACKS.length;
  const prices = PACKS.map((p) => p.price);
  const minPrice = Math.min(...prices);
  // L'économie affichée est la plus forte du rayon, celle qui justifie le
  // détour par un lot plutôt que par le flacon seul.
  const bestSaving = PACKS.reduce((best, p) => {
    if (!p.compareAtPrice || p.compareAtPrice <= p.price) return best;
    return Math.max(best, Math.round((1 - p.price / p.compareAtPrice) * 100));
  }, 0);

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      style={{ background: "var(--surface-page)", minHeight: "100vh" }}
    >
      {/* Bandeau de tête, dans le style des autres rayons (`parfums-femme`) */}
      <section
        style={{
          background: "var(--surface-cream)",
          padding: "64px 24px 48px",
          textAlign: "center",
        }}
      >
        {origin && (
          <Link
            href={origin.href}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 18,
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              color: "var(--ink-500)",
              textDecoration: "none",
            }}
          >
            <span aria-hidden="true">←</span> Retour {origin.label}
          </Link>
        )}

        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.62rem",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "var(--gold-500)",
            marginBottom: 14,
          }}
        >
          {count} ensembles
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.4rem, 4vw, 3.4rem)",
            color: "var(--ink-900)",
            margin: "0 0 16px",
            fontWeight: 500,
          }}
        >
          Lots &amp; <em style={{ color: "var(--gold-500)" }}>coffrets</em>
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.95rem",
            color: "var(--ink-500)",
            maxWidth: 560,
            margin: "0 auto",
            lineHeight: 1.75,
          }}
        >
          Trios, duos et coffrets découverte — plusieurs flacons réunis, à un
          prix que le flacon seul ne permet pas. À partir de {minPrice} €
          {bestSaving > 0 ? `, jusqu'à −${bestSaving} %` : ""}.
        </p>
      </section>

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 64px" }}>
        <PackGrid packs={PACKS} locale={locale} />

        {/* Sortie de rayon : un lot ne convient pas à tout le monde, et la page
            ne doit pas être un cul-de-sac pour qui cherchait un flacon seul. */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
            marginTop: 40,
          }}
        >
          {[
            { label: "Achète 2 = 3 offert", href: "/offres/lot-3-pour-2" },
            { label: "Tous les parfums", href: "/catalogue" },
            { label: "Coffret d'échantillons", href: "/preview/selecteur-echantillons" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                padding: "9px 18px",
                borderRadius: 999,
                border: "1px solid var(--line-200)",
                background: "var(--surface-white)",
                color: "var(--ink-700)",
                fontFamily: "var(--font-sans)",
                fontSize: 13.5,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              {l.label} →
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
