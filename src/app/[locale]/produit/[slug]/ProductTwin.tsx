/**
 * Comparatif « jumeau olfactif » de la fiche produit.
 *
 * La fiche ASSUME la comparaison : le parfum ouvert face à l'original dont il
 * s'inspire, prix contre prix, au ml quand c'est calculable. Mais elle ne
 * compare QUE ce qui est documenté : la paire vient de `olfactive-twins.ts`
 * (relue à la main, `productHandle` = slug de la fiche), le prix de l'original
 * de `reference-prices.ts` (source numérique unique, « prix constaté »), les
 * usages de `product-content.ts`. Un bloc dont la donnée manque ne se dessine
 * pas — il n'y a pas de « différences » inventées ni de score de ressemblance
 * sorti d'un chapeau.
 *
 * POURQUOI ne pas réutiliser `OlfactiveTwin` : c'est un moteur de recherche
 * client (champ, pastilles, base de 3 990 références chargée à l'entrée dans
 * le champ de vision, alertes e-mail). Ici on connaît déjà la paire, on n'a
 * besoin ni d'état ni de moteur — un composant serveur suffit, et il ne pèse
 * rien dans le bundle.
 *
 * Cadre légal : usage nominatif des marques citées, TEXTE SEUL — aucun logo,
 * aucune photo de l'original (un cartouche crème avec son nom en Cormorant
 * tient sa place). Vocabulaire : « inspiré de », « rappelle », « dans le
 * sillage de » — jamais « copie », « dupe », « identique ».
 */

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/data/product-details";
import type { ProductContent, Sillage } from "@/data/product-content";
import { OLFACTIVE_TWINS, type OlfactiveMatch } from "@/data/olfactive-twins";
import { retailPriceOf } from "@/data/reference-prices";
import { parseVolumeMl } from "@/lib/product-variants";
import { euros, eurosPerMl, NBSP, volumeLabel } from "./product-content-format";

/** Base de la jauge « tenue » : 24 h = barre pleine. */
const LONGEVITY_MAX_HOURS = 24;
/** Jauge « sillage » : un palier par libellé, le plus fort remplit la barre. */
const SILLAGE_PERCENT: Record<Sillage, number> = { discret: 25, modéré: 50, fort: 75, énorme: 100 };
/**
 * Prix de l'échantillon 1 ml affiché sur le bouton d'essai. ⚠️ VALEUR FOURNIE
 * PAR LE CAHIER DES CHARGES, pas par les données : `sample-pricing.ts` ne
 * connaît que des coffrets (3 → 10,50 €). À remplacer par la source réelle dès
 * qu'elle existe ; `null` retire le prix du libellé sans toucher au bouton.
 */
const SAMPLE_PRICE_EUR: number | null = 1.9;
const SAMPLE_HREF = "/preview/selecteur-echantillons";

/**
 * Contenance du flacon de référence de l'original, en ml. Le fichier des paires
 * n'a PAS ce champ aujourd'hui (`targetPriceHint` est un texte, et
 * `reference-prices.ts` ne stocke que le prix « du format courant » sans le
 * chiffrer). Sans elle, pas de prix au ml de l'original ni de colonne
 * d'économie : on ne compare pas 100 ml à une contenance devinée.
 */
function referenceVolumeMlOf(twin: OlfactiveMatch): number | null {
  return twin.targetVolumeMl && twin.targetVolumeMl > 0 ? twin.targetVolumeMl : null;
}

/** « Kilian · Angels' Share » → { house: "Kilian", name: "Angels' Share" }. */
function splitTarget(targetName: string): { house: string; name: string } {
  const [house, ...rest] = targetName.split("·").map((s) => s.trim());
  return rest.length ? { house, name: rest.join(" · ") } : { house: "", name: house };
}

const h2Style = {
  fontFamily: "var(--font-display)",
  fontSize: "var(--t-title)",
  fontWeight: 600,
  color: "var(--ink-900)",
  margin: 0,
} as const;

const pillStyle = {
  display: "inline-block",
  padding: "0.2rem 0.6rem",
  borderRadius: "var(--r-pill)",
  fontFamily: "var(--font-sans)",
  fontSize: "var(--t-xs)",
  fontWeight: "var(--fw-semibold)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
} as const;


export default function ProductTwin({
  slug,
  product,
  content,
}: {
  slug: string;
  product: Product;
  content: ProductContent;
}) {
  const twin = OLFACTIVE_TWINS.find((t) => t.productHandle === slug);
  if (!twin) return null;

  const original = splitTarget(twin.targetName);

  // ── Prix ──────────────────────────────────────────────────────────────────
  const ourMl = parseVolumeMl(product.volume);
  const retail = retailPriceOf(twin.referenceId);
  const refMl = referenceVolumeMlOf(twin);
  // Économie au ml : seulement quand les DEUX côtés sont chiffrés.
  const savingPct =
    retail !== null && refMl !== null && refMl > 0 && ourMl > 0
      ? Math.round((1 - product.price / ourMl / (retail / refMl)) * 100)
      : null;
  const hasCenter = savingPct !== null && savingPct > 0;

  // ── Jauges ────────────────────────────────────────────────────────────────
  // Pas de score de ressemblance dans l'entrée relue : la jauge est absente.
  const gauges: { label: string; percent: number }[] = [];
  if (content.longevityHours) {
    gauges.push({ label: "Tenue", percent: (content.longevityHours / LONGEVITY_MAX_HOURS) * 100 });
  }
  if (content.sillage) gauges.push({ label: "Sillage", percent: SILLAGE_PERCENT[content.sillage] });

  const sampleLabel =
    SAMPLE_PRICE_EUR !== null
      ? `Essayer ${product.name} en échantillon · ${euros(SAMPLE_PRICE_EUR)}`
      : `Essayer ${product.name} en échantillon`;

  return (
    {/* Bornée à 760 px : deux cartes de 560 px pour un flacon de 110 px,
        c'était du vide. Tout le bloc (cartes, bandeau, mention) suit la même
        largeur pour rester aligné. */}
    <section aria-labelledby="twin-heading" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: 760 }}>
      <h2 id="twin-heading" style={h2Style}>
        {`${product.name} face à l'original qui l'inspire`}
      </h2>

      {/* ── Face-à-face ── */}
      <div
        className="dp-twin-grid"
        style={{
          display: "grid",
          gridTemplateColumns: hasCenter ? "1fr auto 1fr" : "1fr 1fr",
          gap: "1rem",
          alignItems: "stretch",
        }}
      >
        {/* Nous : carte blanche, packshot réel */}
        <article
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
            padding: "1rem 1rem 1.1rem",
            background: "var(--surface-white)",
            border: "1px solid var(--line-200)",
            borderRadius: "var(--r-lg)",
            boxShadow: "var(--shadow-sm)",
            textAlign: "center",
          }}
        >
          <div style={{ position: "relative", width: 110, height: 110, borderRadius: "var(--r-md)", overflow: "hidden", background: "var(--surface-image)" }}>
            {(product.packshot ?? product.image) && (
              // Packshot fond clair dans un cadre neutre — même règle que le
              // médaillon de la pyramide.
              <Image src={product.packshot ?? product.image ?? ""} alt={`${product.name} — ${product.brand}`} fill sizes="110px" style={{ objectFit: "contain", background: "#fff" }} />
            )}
          </div>
          <span style={{ ...pillStyle, background: "var(--gold-100)", color: "var(--gold-700)" }}>Inspiré de</span>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--t-serif-lg)", fontWeight: 600, color: "var(--ink-900)" }}>
            {product.name} <span style={{ color: "var(--ink-400)", fontWeight: 400 }}>· {product.brand}</span>
          </p>
          <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "var(--t-body)", color: "var(--ink-900)" }}>
            <strong>{euros(product.price)}</strong>
            <span style={{ color: "var(--ink-500)" }}> / {volumeLabel(product.volume)}</span>
          </p>
          {ourMl > 0 && (
            <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", color: "var(--ink-400)" }}>
              soit {eurosPerMl(product.price, ourMl)}
            </p>
          )}
        </article>

        {/* Centre : l'écart au ml, uniquement quand il est calculable */}
        {hasCenter && (
          <div
            className="dp-twin-center"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.25rem", padding: "0 0.5rem", minWidth: 96 }}
          >
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 600, lineHeight: 1, color: "var(--gold-700)" }}>
              −{savingPct}{NBSP}%
            </span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--ink-400)" }}>
              au ml
            </span>
          </div>
        )}

        {/* L'original : carte crème, nom seul — aucun visuel de marque */}
        <article
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
            padding: "1rem 1rem 1.1rem",
            background: "var(--surface-cream)",
            border: "1px solid var(--line-200)",
            borderRadius: "var(--r-lg)",
            textAlign: "center",
          }}
        >
          <div
            aria-hidden
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 110,
              height: 110,
              borderRadius: "var(--r-md)",
              background: "var(--surface-cream-2)",
              border: "1px solid var(--line-200)",
              padding: "0 1rem",
            }}
          >
            <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "var(--t-serif-lg)", color: "var(--ink-500)", lineHeight: 1.2 }}>
              {original.name}
            </span>
          </div>
          <span style={{ ...pillStyle, background: "var(--espresso-900)", color: "var(--gold-200)" }}>Original de luxe</span>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--t-serif-lg)", fontWeight: 600, color: "var(--ink-900)" }}>
            {original.name}
            {original.house && <span style={{ color: "var(--ink-400)", fontWeight: 400 }}> · {original.house}</span>}
          </p>
          {retail !== null ? (
            <>
              <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "var(--t-body)", color: "var(--ink-900)" }}>
                <strong>≈{NBSP}{euros(retail)}</strong>
                {refMl !== null && refMl > 0 && <span style={{ color: "var(--ink-500)" }}> / {refMl}{NBSP}ml</span>}
              </p>
              <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", color: "var(--ink-400)" }}>
                {refMl !== null && refMl > 0 ? `soit ${eurosPerMl(retail, refMl)} · ` : ""}prix constaté en parfumerie
              </p>
            </>
          ) : (
            <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "var(--t-sm)", color: "var(--ink-500)" }}>
              {twin.targetPriceHint ? `${twin.targetPriceHint} · ` : ""}prix constaté en parfumerie
            </p>
          )}
        </article>
      </div>

      {/* Les cartes « Ce qui est partagé / Pour qui » et le rail « Autres
          jumeaux » ont été retirés de ce bloc : « Pour qui » existe déjà en
          section dédiée (ForWhom), et Lattafa n'a qu'un autre jumeau
          documenté — un rail d'une vignette faisait pauvre. Le bloc garde ce
          qu'il est seul à dire : le face-à-face, les jauges, la mention légale. */}

      {/* ── Essayer avant d'acheter ── */}
      <div
        className="dp-twin-cta"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          padding: "1rem 1.25rem",
          background: "var(--surface-cream)",
          borderRadius: "var(--r-md)",
        }}
      >
        {/* « Essayer les deux » supposerait l'original en échantillon sur le
            site — ce n'est pas le cas : seul le jumeau est proposé. */}
        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--t-serif-md)", fontWeight: 600, color: "var(--ink-900)" }}>
          Essayez-le avant le grand flacon
        </p>
        <Link
          href={SAMPLE_HREF}
          style={{
            display: "inline-flex",
            alignItems: "center",
            flex: "none",
            height: 40,
            padding: "0 1.125rem",
            border: "1px solid var(--line-300)",
            borderRadius: "var(--r-sm)",
            background: "var(--surface-white)",
            color: "var(--ink-900)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--t-xs)",
            fontWeight: "var(--fw-semibold)",
            letterSpacing: "var(--ls-wide)",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          {sampleLabel}
        </Link>
      </div>

      <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "var(--t-xs)", lineHeight: "var(--lh-normal)", color: "var(--ink-400)" }}>
        Parfums inspirés, jamais des copies : aucune affiliation avec les marques citées.
      </p>

      <style>{`
        @media (max-width: 760px) {
          .dp-twin-grid { grid-template-columns: 1fr !important; }
          .dp-twin-center { padding: 0.25rem 0 !important; }
          .dp-twin-cards { grid-template-columns: 1fr !important; }
          .dp-twin-rail { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .dp-twin-cta { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </section>
  );
}
