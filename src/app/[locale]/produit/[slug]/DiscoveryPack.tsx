import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { DEMO as PACKS } from "@/data/packs";
import { relatedProducts } from "@/data/product-resolve";
import { FREE_SHIPPING_THRESHOLD_EUR } from "@/data/carriers";
import { formatPrice } from "@/lib/product-variants";

/**
 * Pack découverte — « essayer avant d'acheter », étendu à cinq fioles.
 *
 * Server Component : aucun état, tout se lit dans les données (pack, produits
 * voisins, seuil de livraison) ; le survol des emplacements vides est en CSS.
 * Le produit ouvert occupe déjà le premier emplacement : le visiteur ne part
 * pas d'un pack vide, il complète le sien.
 */

/** Slug du pack de référence dans `packs.ts` : son prix « dès X € » est lu là-bas, jamais recopié. */
const PACK_SLUG = "pack-echantillons-signature";
const PACK_IMAGE = "/assets/products/dp_parfumerie-dubai-parfumerie-pack-echantillons-5-fioles.webp";
const SLOTS = 5;
const SAMPLE_ML = 1;
/** Prix d'une fiole seule, si la fiche n'a pas de `sample` : celui du site. */
const DEFAULT_SAMPLE_PRICE = 1.9;

interface DiscoveryPackProps {
  slug: string;
  productName: string;
  image?: string;
  price: number;
  /** `product.sample.refundable` : la phrase « remboursée » n'apparaît que si c'est vrai. */
  refundable?: boolean;
  /** `product.sample.price` — « X € la fiole ». */
  samplePrice?: number;
}

export default function DiscoveryPack({
  slug,
  productName,
  image,
  refundable,
  samplePrice = DEFAULT_SAMPLE_PRICE,
}: DiscoveryPackProps) {
  const pack = PACKS.find((p) => p.slug === PACK_SLUG);
  const packPrice = pack?.price ?? 0;
  const href = `/preview/selecteur-echantillons?avec=${slug}`;
  const suggestions = relatedProducts(slug, 2).map((r) => r.product.name);

  return (
    <section
      aria-labelledby="dp-discovery-title"
      className="dp-dpack"
      style={{
        position: "relative",
        background: "var(--surface-white)",
        boxShadow: "var(--shadow-sm)",
        borderRadius: "var(--r-lg)",
        padding: "1.5rem",
        fontFamily: "var(--font-sans)",
        color: "var(--ink-900)",
      }}
    >
      <style>{`
        /* Grille et emplacements en classes, pas en style inline : globals.css
           réécrit toute grille inline « repeat(5, » en deux colonnes sous 760 px. */
        .dp-dpack-grid { display: grid; grid-template-columns: 240px 1fr; gap: 1.5rem; align-items: start; }
        .dp-dpack-slots { display: grid; grid-template-columns: repeat(${SLOTS}, minmax(0, 1fr)); gap: 0.5rem; }
        .dp-dpack-slot-empty {
          display: flex; align-items: center; justify-content: center;
          min-height: 96px; border: 1.5px dashed var(--line-300); border-radius: var(--r-md);
          color: var(--ink-500); font-size: var(--t-xs); font-weight: var(--fw-medium);
          text-decoration: none; background: transparent;
          transition: border-color var(--dur-fast), color var(--dur-fast), background var(--dur-fast);
        }
        .dp-dpack-slot-empty:hover { border-color: var(--gold-400); color: var(--gold-700); background: var(--gold-100); }
        .dp-dpack-foot { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
        @media (max-width: 760px) { .dp-dpack-grid { grid-template-columns: 1fr; } }
        @media (max-width: 560px) { .dp-dpack-slots { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
      `}</style>

      {/* Pill livraison — seuil lu dans carriers.ts, comme partout ailleurs. */}
      <span
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          padding: "0.25rem 0.65rem",
          borderRadius: "var(--r-pill)",
          background: "var(--success)",
          color: "#fff",
          fontSize: "var(--t-xs)",
          fontWeight: "var(--fw-semibold)",
          letterSpacing: "var(--ls-wide)",
          whiteSpace: "nowrap",
        }}
      >
        Livraison offerte dès {FREE_SHIPPING_THRESHOLD_EUR} €
      </span>

      <div className="dp-dpack-grid">
        <div style={{ position: "relative", aspectRatio: "4 / 3", borderRadius: "var(--r-md)", overflow: "hidden" }}>
          <Image src={PACK_IMAGE} alt="Pack découverte de cinq fioles" fill sizes="(max-width: 760px) 100vw, 240px" style={{ objectFit: "cover" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "var(--t-xs)",
              fontWeight: "var(--fw-medium)",
              letterSpacing: "var(--ls-wider)",
              textTransform: "uppercase",
              color: "var(--gold-700)",
              // Laisse la place à la pill en haut à droite.
              paddingRight: "11rem",
            }}
          >
            Pack découverte · {SLOTS} × {SAMPLE_ML} ml
          </p>
          <h2
            id="dp-discovery-title"
            style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--t-title)", fontWeight: 600, lineHeight: 1.15 }}
          >
            Composez votre pack découverte
          </h2>
          <p style={{ margin: 0, fontSize: "var(--t-sm)", color: "var(--ink-700)", lineHeight: 1.5 }}>
            {productName} est déjà dans votre pack. Ajoutez jusqu&apos;à {SLOTS - 1} autres fioles
            {refundable ? ", chaque fiole est remboursée sur l'achat de son flacon 100 ml." : "."}
          </p>

          {/* Cinq emplacements : le premier est le produit ouvert, les autres se remplissent. */}
          <div className="dp-dpack-slots" role="list" aria-label="Emplacements du pack">
            <div
              role="listitem"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.5rem 0.35rem",
                minHeight: 96,
                border: "1.5px solid var(--gold-500)",
                borderRadius: "var(--r-md)",
                background: "var(--gold-100)",
              }}
            >
              <span style={{ position: "relative", width: 64, height: 64, borderRadius: "var(--r-sm)", overflow: "hidden", background: "var(--surface-white)" }}>
                <Image src={image ?? "/assets/prod-1.jpg"} alt="" fill sizes="64px" style={{ objectFit: "cover" }} />
              </span>
              <span
                style={{
                  fontSize: "var(--t-xs)",
                  fontWeight: "var(--fw-semibold)",
                  color: "var(--gold-900)",
                  textAlign: "center",
                  lineHeight: 1.2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
              >
                {productName}
              </span>
            </div>
            {Array.from({ length: SLOTS - 1 }, (_, i) => (
              <Link key={i} href={href} role="listitem" className="dp-dpack-slot-empty" aria-label={`Ajouter la fiole ${i + 2}`}>
                + Ajouter
              </Link>
            ))}
          </div>

          <div className="dp-dpack-foot">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 600, color: "var(--gold-700)", lineHeight: 1.1 }}>
                dès {formatPrice(packPrice).replace(",00", "")} €
              </span>
              <span style={{ fontSize: "var(--t-xs)", color: "var(--ink-500)" }}>
                1 fiole / {SLOTS} · {formatPrice(samplePrice)} € la fiole
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              {suggestions.length > 0 && (
                <Link
                  href={href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: 40,
                    padding: "0 0.9rem",
                    border: "1.5px solid var(--line-200)",
                    borderRadius: "var(--r-sm)",
                    color: "var(--ink-700)",
                    fontSize: "var(--t-xs)",
                    fontWeight: "var(--fw-medium)",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Suggestions : {suggestions.join(", ")}
                </Link>
              )}
              <Link
                href={href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 40,
                  padding: "0 1.25rem",
                  background: "var(--espresso-900)",
                  color: "var(--gold-100)",
                  borderRadius: "var(--r-sm)",
                  fontSize: "var(--t-sm)",
                  fontWeight: "var(--fw-semibold)",
                  letterSpacing: "var(--ls-wide)",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Compléter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
