/**
 * « Fiche technique » — les caractéristiques en tableau à deux colonnes.
 *
 * La description raconte le parfum ; le tableau répond aux questions sèches
 * (quelle année, quelle concentration, quel nez) que le client et les moteurs
 * posent en cherchant un mot précis. Un vrai `<table>` plutôt qu'une grille :
 * les lecteurs d'écran annoncent « Marque : Lattafa », et un extrait
 * enrichi sait lire une ligne en-tête / valeur.
 *
 * Chaque ligne n'existe que si sa donnée existe — aucun « — » ni « non
 * renseigné » : une ligne vide est une promesse non tenue, pas une information.
 */

import type { Product } from "@/data/product-details";
import { SILLAGE_LABEL, type ProductContent } from "@/data/product-content";
import { parseVolumeMl, resolveVariants } from "@/lib/product-variants";
import {
  NBSP,
  concentrationLabel,
  genderLabel,
  occasionsList,
  primaryFamily,
  seasonsList,
  volumeLabel,
} from "./product-content-format";

interface ProductSpecsProps {
  product: Product;
  slug: string;
  content: ProductContent;
}

interface SpecRow {
  label: string;
  value: string;
}

/** « 100 ml (aussi 30 ml) » : la référence d'abord, les autres formats ensuite. */
function volumeCell(product: Product): string {
  const ref = volumeLabel(product.volume);
  if (!product.variants?.length) return ref;
  const refMl = parseVolumeMl(product.volume);
  const others = resolveVariants(product)
    .filter((v) => v.volumeMl !== refMl)
    .map((v) => v.label);
  return others.length ? `${ref} (aussi ${others.join(", ")})` : ref;
}

function buildRows(product: Product, content: ProductContent): SpecRow[] {
  const family = primaryFamily(product.family);
  const candidates: (SpecRow | undefined)[] = [
    { label: "Marque", value: product.brand },
    content.year ? { label: "Année", value: String(content.year) } : undefined,
    product.concentration ? { label: "Concentration", value: concentrationLabel(product.concentration) } : undefined,
    family ? { label: "Famille olfactive", value: family } : undefined,
    content.gender ? { label: "Genre", value: genderLabel(content.gender) } : undefined,
    product.topNotes.length ? { label: "Notes de tête", value: product.topNotes.join(", ") } : undefined,
    product.heartNotes.length ? { label: "Notes de cœur", value: product.heartNotes.join(", ") } : undefined,
    product.baseNotes.length ? { label: "Notes de fond", value: product.baseNotes.join(", ") } : undefined,
    content.longevityHours !== undefined
      ? { label: "Tenue", value: `${content.longevityHours}${NBSP}h en moyenne` }
      : undefined,
    content.sillage ? { label: "Sillage", value: SILLAGE_LABEL[content.sillage] } : undefined,
    content.seasons?.length ? { label: "Saisons", value: seasonsList(content.seasons) } : undefined,
    content.occasions?.length ? { label: "Moments", value: occasionsList(content.occasions) } : undefined,
    product.volume ? { label: "Contenance", value: volumeCell(product) } : undefined,
    product.origin ? { label: "Origine", value: product.origin } : undefined,
    product.perfumer ? { label: "Nez", value: product.perfumer } : undefined,
  ];
  return candidates.filter((r): r is SpecRow => r !== undefined && r.value.trim() !== "");
}

export function ProductSpecs({ product, content }: ProductSpecsProps) {
  const rows = buildRows(product, content);
  // La marque est toujours là ; on garde néanmoins la garde pour ne jamais
  // dessiner un titre au-dessus d'un tableau vide.
  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="specs-heading" className="dp-specs">
      {/* Sur mobile, deux colonnes de 50 % font déborder « Notes de fond »
          sur quatre lignes à côté d'un en-tête d'un mot : on empile en-tête
          puis valeur, le tableau reste un tableau pour l'accessibilité. */}
      <style>{`
        .dp-specs__table { width: 100%; max-width: 68ch; border-collapse: collapse; }
        .dp-specs__table tr { border-bottom: 1px solid var(--line-100); }
        .dp-specs__table th,
        .dp-specs__table td { padding: 0.75rem 0; vertical-align: top; text-align: left; }
        .dp-specs__table th { width: 11rem; padding-right: 1.25rem; }
        @media (max-width: 640px) {
          .dp-specs__table th,
          .dp-specs__table td { display: block; width: 100%; padding: 0; }
          .dp-specs__table tr { display: block; padding: 0.75rem 0; }
          .dp-specs__table th { padding-bottom: 0.25rem; }
        }
      `}</style>
      <h2
        id="specs-heading"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--t-title)",
          fontWeight: 600,
          color: "var(--ink-900)",
          marginBottom: "1rem",
        }}
      >
        Fiche technique
      </h2>
      <table className="dp-specs__table">
        <caption
          style={{
            // Légende utile aux lecteurs d'écran, redondante à l'œil sous le h2.
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
          }}
        >
          Caractéristiques de {product.name} ({product.brand})
        </caption>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th
                scope="row"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--t-sm)",
                  fontWeight: 500,
                  color: "var(--ink-500)",
                }}
              >
                {row.label}
              </th>
              <td
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--t-body)",
                  color: "var(--ink-900)",
                  lineHeight: 1.5,
                }}
              >
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
